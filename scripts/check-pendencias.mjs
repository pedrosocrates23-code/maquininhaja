// Gate pré-deploy. Reprova (exit 1) enquanto o site afirmar algo que ainda não é verdade:
// - "PENDENTE:" no HTML gerado (responsável, documento: src/data/site.ts);
// - programa Renda Extra não ativo (PROGRAMA_ATIVO = false): o site se apresenta como
//   Parceiro Ton e fala em comissão; só pode ir ao ar depois do cadastro aprovado;
// - links de indicação ainda apontando para páginas comuns da Ton (src/data/links.json);
// - travessão no texto visível (regra da casa).
// Uso: npm run build:producao  (build + este gate)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = join(raiz, 'dist');
const problemas = [];

const site = readFileSync(join(raiz, 'src/data/site.ts'), 'utf8');
if (/PROGRAMA_ATIVO = false/.test(site)) {
  problemas.push('PROGRAMA_ATIVO = false em src/data/site.ts: cadastro no Renda Extra Ton ainda não confirmado.');
}
const links = JSON.parse(readFileSync(join(raiz, 'src/data/links.json'), 'utf8'));
const comuns = Object.entries(links).filter(([, url]) => /^https:\/\/(www\.)?ton\.com\.br\/(maquininha\/|link-de-pagamento)/.test(url) && !/[?&]/.test(url));
if (comuns.length) {
  problemas.push(`links.json sem link de indicação em: ${comuns.map(([k]) => k).join(', ')} (gerar no app Ton > Renda Extra).`);
}

function* arquivos(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* arquivos(p);
    else if (p.endsWith('.html')) yield p;
  }
}
let paginas = 0;
for (const f of arquivos(dist)) {
  paginas++;
  const html = readFileSync(f, 'utf8');
  const texto = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  const rel = f.slice(dist.length);
  if (texto.includes('PENDENTE')) problemas.push(`${rel}: contém "PENDENTE"`);
  if (texto.includes('—')) problemas.push(`${rel}: contém travessão`);
}

console.log(`check-pendencias: ${paginas} páginas HTML verificadas`);
if (problemas.length) {
  console.log('REPROVADO para produção:');
  for (const p of [...new Set(problemas)]) console.log(' - ' + p);
  process.exit(1);
}
console.log('OK: nenhuma pendência. Liberado para deploy.');
