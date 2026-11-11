#!/usr/bin/env node
/**
 * Fila de publicação do Maquininha Já (ver docs/fila-publicacao.md).
 *
 * Uma página entra na fila quando o .mdx está em src/content/paginas com `publicado` a partir de
 * INICIO_FILA. Ela só vira página no primeiro build depois da data (src/lib/publicacao.ts). Os
 * builds dos dias de publicação são disparados por dois gatilhos independentes, os dois
 * idempotentes:
 *   1. GitHub Actions  .github/workflows/fila-publicacao.yml   seg a sex 09:30 UTC (06:30 BRT)
 *   2. Vercel Cron     api/publicar-fila.js (vercel.json)      seg a sex 10:00 UTC, janela de 1 h
 * Cada um só chama o Deploy Hook se alguma página vencida nos últimos 14 dias ainda não devolve
 * 200. Quando a fila esvazia, os dois continuam agendados mas não disparam nada.
 *
 * Cadência pedida pelo usuário: "no primeiro mês, um dia sim, um dia não; depois do primeiro mês,
 * todos os dias da semana, mas não final de semana; conteúdos todos às 6:30 da manhã".
 * Regras (verificadas por --verificar):
 *   - horário: 09:30:00 UTC exato (06:30 em Brasília, UTC-3, sem horário de verão desde 2019);
 *   - fase 1 (FASE1_INICIO a FASE1_FIM): só segunda, quarta e sexta;
 *   - fase 2 (a partir de FASE2_INICIO): segunda a sexta;
 *   - nunca sábado nem domingo; no máximo uma página por dia;
 *   - api/_fila.js corresponde exatamente à fila (gere com --gerar-api).
 * Página com `publicado` antes de INICIO_FILA é acervo e fica fora da fila. Rascunho
 * (draft: true) também fica fora.
 *
 * Uso:
 *   node scripts/fila-publicacao.mjs --status       tabela da fila
 *   node scripts/fila-publicacao.mjs --hoje         URLs que vencem hoje (BRT), uma por linha
 *   node scripts/fila-publicacao.mjs --vencidos     URLs vencidas nos últimos 14 dias, uma por linha
 *   node scripts/fila-publicacao.mjs --gerar-api    reescreve api/_fila.js
 *   node scripts/fila-publicacao.mjs --verificar    exit 1 se alguma regra falhar
 * Opcional em qualquer comando: --agora=2026-11-18T09:31:00Z (simula o relógio, para teste).
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- Cadência (constantes) --------------------------------------------------------------
const HORA_UTC = 9;
const MINUTO_UTC = 30; // 09:30 UTC = 06:30 em Brasília
const INICIO_FILA = '2026-11-18'; // antes disto: acervo
const FASE1_INICIO = '2026-11-18';
const FASE1_FIM = '2026-12-17';
const FASE1_DIAS = new Set([1, 3, 5]); // seg, qua, sex (getUTCDay)
const FASE2_INICIO = '2026-12-18';
const FASE2_DIAS = new Set([1, 2, 3, 4, 5]); // seg a sex
const JANELA_DIAS = 14; // mesma janela de api/publicar-fila.js
// -------------------------------------------------------------------------------------------

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGINAS = join(ROOT, 'src', 'content', 'paginas');
const API_FILA = join(ROOT, 'api', '_fila.js');
const NOMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const argAgora = process.argv.find((a) => a.startsWith('--agora='));
const AGORA = argAgora ? new Date(argAgora.slice(8)).getTime() : Date.now();
if (Number.isNaN(AGORA)) {
  console.error('--agora inválido');
  process.exit(2);
}

const campo = (fm, nome) => {
  const m = fm.match(new RegExp(`^${nome}:\\s*(.+?)\\s*$`, 'm'));
  return m ? m[1].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '') : null;
};

function mdxEm(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? mdxEm(join(dir, e.name)) : e.name.endsWith('.mdx') ? [join(dir, e.name)] : [],
  );
}

export function lerPaginas() {
  return mdxEm(PAGINAS).map((arq) => {
    const txt = readFileSync(arq, 'utf-8');
    const fm = (txt.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [, ''])[1];
    const rel = relative(PAGINAS, arq).split(sep).join('/').replace(/\.mdx$/, '');
    const bruto = campo(fm, 'publicado');
    return {
      url: `/${rel}/`,
      arquivo: `src/content/paginas/${rel}.mdx`,
      publicadoBruto: bruto,
      publicado: new Date(bruto ?? 'x'),
      draft: campo(fm, 'draft') === 'true',
    };
  });
}

// Dia no calendário de Brasília (UTC-3).
const diaBRT = (d) =>
  Number.isNaN(d.getTime()) ? 'data-invalida' : new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
const inicioBRT = (dia) => new Date(`${dia}T03:00:00.000Z`).getTime(); // 00:00 BRT

/** Fila = toda página não-rascunho com `publicado` a partir de INICIO_FILA (passada ou futura). */
export function fila(paginas) {
  return paginas
    .filter((p) => !p.draft && (Number.isNaN(p.publicado.getTime()) || p.publicado.getTime() >= inicioBRT(INICIO_FILA)))
    .sort((a, b) => a.publicado - b.publicado);
}
const agendadas = (paginas) => fila(paginas).filter((p) => p.publicado.getTime() > AGORA);

function status(paginas) {
  const f = fila(paginas);
  const futuras = agendadas(paginas);
  const noAr = paginas.filter((p) => !p.draft && p.publicado.getTime() <= AGORA).length;
  console.log(
    `Publicadas: ${noAr} | Na fila: ${futuras.length} | Rascunhos: ${paginas.filter((p) => p.draft).length} | Fila total desde ${INICIO_FILA}: ${f.length}`,
  );
  for (const p of f) {
    const quando = Number.isNaN(p.publicado.getTime()) ? 'DATA INVÁLIDA' : `${diaBRT(p.publicado)} ${NOMES[p.publicado.getUTCDay()]}`;
    const estado = p.publicado.getTime() <= AGORA ? 'no ar   ' : 'agendada';
    console.log(`${quando}  ${estado}  ${p.url}`);
  }
  if (futuras.length) console.log(`Última da fila: ${diaBRT(futuras[futuras.length - 1].publicado)}`);
}

function hoje(paginas) {
  const d = diaBRT(new Date(AGORA));
  fila(paginas)
    .filter((p) => diaBRT(p.publicado) === d && p.publicado.getTime() <= AGORA)
    .forEach((p) => console.log(p.url));
}

// Vencidas nos últimos 14 dias (mesma janela de api/publicar-fila.js). Basta uma estar fora do ar
// para o build ser necessário, e o build publica todas as vencidas de uma vez.
function vencidos(paginas) {
  const inicio = AGORA - JANELA_DIAS * 86400 * 1000;
  fila(paginas)
    .filter((p) => p.publicado.getTime() <= AGORA && p.publicado.getTime() >= inicio)
    .forEach((p) => console.log(p.url));
}

function conteudoApi(paginas) {
  const itens = fila(paginas).map((p) => ({ url: p.url, publicado: p.publicado.toISOString() }));
  return (
    '// GERADO por scripts/fila-publicacao.mjs --gerar-api. Não editar à mão.\n' +
    '// Fila inteira (passada e futura) desde ' + INICIO_FILA + ', lida pela função api/publicar-fila.js.\n' +
    `export const fila = ${JSON.stringify(itens, null, 2)};\n`
  );
}

function regraDoDia(dia) {
  if (dia >= FASE1_INICIO && dia <= FASE1_FIM) return { fase: 1, dias: FASE1_DIAS, texto: 'seg/qua/sex (fase 1)' };
  if (dia >= FASE2_INICIO) return { fase: 2, dias: FASE2_DIAS, texto: 'seg a sex (fase 2)' };
  return null;
}

function verificar(paginas) {
  const erros = [];
  const f = fila(paginas);
  const porDia = new Map();
  for (const p of f) {
    const t = p.publicado.getTime();
    if (Number.isNaN(t)) {
      erros.push(`${p.arquivo}: publicado inválido (${p.publicadoBruto})`);
      continue;
    }
    const dia = diaBRT(p.publicado);
    const dow = p.publicado.getUTCDay();
    const regra = regraDoDia(dia);
    if (!regra) erros.push(`${p.arquivo}: ${dia} fora das fases da fila`);
    else if (!regra.dias.has(dow)) erros.push(`${p.arquivo}: ${dia} cai em ${NOMES[dow]}, fora de ${regra.texto}`);
    if (
      p.publicado.getUTCHours() !== HORA_UTC ||
      p.publicado.getUTCMinutes() !== MINUTO_UTC ||
      p.publicado.getUTCSeconds() !== 0 ||
      p.publicado.getUTCMilliseconds() !== 0
    )
      erros.push(`${p.arquivo}: horário ${p.publicado.toISOString()} fora do padrão 09:30:00 UTC (06:30 BRT)`);
    if (porDia.has(dia)) erros.push(`${p.arquivo}: dia ${dia} já ocupado por ${porDia.get(dia)}`);
    else porDia.set(dia, p.arquivo);
  }
  if (!existsSync(API_FILA)) erros.push('api/_fila.js ausente (rode npm run fila:gerar)');
  else if (readFileSync(API_FILA, 'utf-8').replace(/\r\n/g, '\n') !== conteudoApi(paginas))
    erros.push('api/_fila.js desatualizado em relação a src/content/paginas (rode npm run fila:gerar)');
  if (erros.length) {
    console.error('FILA INVÁLIDA:\n- ' + erros.join('\n- '));
    process.exit(1);
  }
  const futuras = agendadas(paginas).length;
  console.log(
    `Fila OK: ${f.length} página(s) na fila desde ${INICIO_FILA} (${futuras} ainda agendada(s)), todas às 09:30 UTC, uma por dia, seg/qua/sex até ${FASE1_FIM} e seg a sex a partir de ${FASE2_INICIO}.`,
  );
}

const paginas = lerPaginas();
const arg = process.argv.slice(2).find((a) => !a.startsWith('--agora='));
if (arg === '--status') status(paginas);
else if (arg === '--hoje') hoje(paginas);
else if (arg === '--vencidos') vencidos(paginas);
else if (arg === '--gerar-api') {
  writeFileSync(API_FILA, conteudoApi(paginas), 'utf-8');
  console.log(`api/_fila.js gerado com ${fila(paginas).length} página(s).`);
} else if (arg === '--verificar') verificar(paginas);
else {
  console.error('Uso: --status | --hoje | --vencidos | --gerar-api | --verificar  [--agora=ISO]');
  process.exit(2);
}
