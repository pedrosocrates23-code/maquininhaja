# Fila de publicação agendada

Robô que publica páginas novas sozinho, na data e hora marcadas, sem ninguém dar push no dia.
É a mesma receita que roda na Ahara, adaptada à cadência do Maquininha Já.

## Como funciona

O site é estático (Astro, deploy na Vercel a cada push na `main`). Uma página com `publicado` no
futuro fica no repositório, mas **não é gerada** até um build acontecer depois da data:

- `src/lib/publicacao.ts` define a regra única: página visível = `!draft && publicado <= agora`
  (no momento do build). Essa regra filtra a rota (`src/pages/[...slug].astro`), as listas
  (`ListaPaginas.astro`), os hubs `/ajuda/` e `/aprenda/` (lista visível e `hasPart` do JSON-LD) e o
  "Leia também" (`relacionadas`). O sitemap só lista o que foi gerado, então a página agendada fica
  fora dele sozinha, e `scripts/check-sitemap.mjs` não reprova nada por isso.
- A integração `links-agendados` (`astro.config.mjs`) roda depois do build e transforma em texto
  qualquer `<a href="/...">` interno cuja rota não existe em `dist` (links do corpo do MDX,
  componentes, menus). No build do dia, a página existe e o link volta sozinho. Destino ausente
  que não é página da collection (link quebrado de verdade) também vira texto, mas sai em
  `AVISO` no log do build: corrija na fonte.
- O build do dia é disparado por dois gatilhos independentes, os dois idempotentes (só disparam o
  Deploy Hook se alguma página vencida nos **últimos 14 dias** ainda não devolve 200 em produção;
  qualquer build publica todas as vencidas de uma vez):
  1. **GitHub Actions** `.github/workflows/fila-publicacao.yml`: cron `30 9 * * 1-5`
     (seg a sex, 09:30 UTC = 06:30 em Brasília) + `workflow_dispatch`. O GitHub costuma atrasar o
     cron de alguns minutos; nunca adianta.
  2. **Vercel Cron** (reserva): `0 10 * * 1-5` chama `/api/publicar-fila/`
     (`api/publicar-fila.js`), que confere as páginas e chama o Deploy Hook (env
     `VERCEL_DEPLOY_HOOK`). A chamada é autenticada por `CRON_SECRET`. No plano Hobby a Vercel pode
     rodar o cron em qualquer minuto entre 10:00 e 10:59 UTC.
- O `vercel.json` é **gerado** no build pelo hook `vercelJson()` do `astro.config.mjs` (constante
  `CRONS`). Não edite o `vercel.json` à mão: rode `npm run build` antes do commit. O path do cron
  tem barra final porque `trailingSlash: true` faria `/api/publicar-fila` responder 308, e o Cron
  da Vercel não segue redirect.
- `api/` na raiz vira Vercel Function sem adapter do Astro (mesmo arranjo da Ahara).
  `api/_fila.js` (com `_`) não vira rota: é só a lista que a função lê, gerada por
  `npm run fila:gerar`.
- Repositório público: o GitHub desliga cron de workflow depois de 60 dias sem commit. O último
  passo do workflow grava um commit vazio quando há página na fila e o último commit tem 45 dias
  ou mais.

## Cadência (regra do `scripts/fila-publicacao.mjs`)

Pedido do usuário (12/11/2026): "primeira semana um dia sim, um dia não; na semana seguinte um dia
sim, um dia não, mas de vez em quando 3 dias consecutivos, até chegar em todos os dias da semana, de
forma gradativa durante 3 meses". Sempre às 6:30 da manhã, nunca no fim de semana.

| Regra | Valor (constantes no topo do script) |
|---|---|
| Horário | `09:30:00.000Z` exato (06:30 em Brasília) |
| Rampa | `RAMPA`: semana (segunda-feira) -> dias com publicação, de 16/11/2026 a 14/02/2027 |
| Depois da rampa | a partir de 15/02/2027: segunda a sexta |
| Fim de semana | nunca |
| Por dia | no máximo 1 página |
| Acervo | `publicado` antes de 2026-11-18 fica fora da fila (data simples continua valendo) |
| Teste | `/ajuda/teste-fila-*/` (noindex) entra na fila com qualquer data e hora, isento da cadência |

Rampa (dias com publicação em cada semana):

| Semana de | Dias | Por semana | Observação |
|---|---|---|---|
| 16/11/2026 | qua, sex | 2 | começa em 18/11 |
| 23/11 | seg, qua, qui, sex | 4 | 3 seguidos (qua-qui-sex) |
| 30/11 | seg, qua, sex | 3 | dia sim, dia não |
| 07/12 | seg, ter, qua, sex | 4 | 3 seguidos (seg-ter-qua) |
| 14/12 | seg, qua, sex | 3 | dia sim, dia não |
| 21/12 | seg, qua, qui, sex | 4 | 3 seguidos |
| 28/12 | seg, ter, qua, sex | 4 | 3 seguidos |
| 04/01/2027 | seg, qua, qui, sex | 4 | 3 seguidos |
| 11/01 | seg, ter, qua, qui | 4 | 4 seguidos |
| 18/01 | seg a sex | 5 | primeira semana cheia |
| 25/01 | seg, ter, qua, sex | 4 | |
| 01/02 e 08/02 | seg a sex | 5 | |
| 15/02 em diante | seg a sex | 5 | fim da rampa |

Com os 70 guias "da CLT ao negócio próprio", a fila vai de 18/11/2026 a 11/03/2027.
Para mudar a cadência: edite `RAMPA`/`FIM_RAMPA` e rode `npm run fila:reagendar` (redistribui só as
páginas ainda agendadas, na ordem atual, e regera `api/_fila.js`).

`npm run fila:verificar` reprova (exit 1) data fora da regra, horário diferente de 09:30 UTC, dois
itens no mesmo dia e `api/_fila.js` desatualizado. O workflow roda essa checagem antes de tudo.

Comandos:

```bash
npm run fila:status       # tabela da fila (primeira linha: "Publicadas: N | Na fila: N | ...")
npm run fila:verificar    # regras da cadência + api/_fila.js em dia
npm run fila:gerar        # reescreve api/_fila.js
npm run fila:reagendar    # redistribui as agendadas pela cadência atual
node scripts/fila-publicacao.mjs --hoje        # URLs que vencem hoje (BRT)
node scripts/fila-publicacao.mjs --vencidos    # URLs vencidas nos últimos 14 dias
# qualquer comando aceita --agora=2026-11-20T09:31:00Z para simular o relógio
```

## Como pôr uma página na fila

1. Crie o MDX em `src/content/paginas/<secao>/<slug>.mdx` (o caminho do arquivo é a URL:
   `/<secao>/<slug>/`) com a data-hora do dia escolhido, **entre aspas**:
   ```yaml
   publicado: '2026-11-20T09:30:00.000Z'
   atualizado: '2026-11-20T09:30:00.000Z'
   ```
2. `python scripts/validar_pagina.py src/content/paginas/<secao>/<slug>.mdx`
3. `npm run fila:gerar && npm run fila:verificar`
4. `npm run build` (confirma que a página não aparece e regenera o `vercel.json`)
5. Commit (MDX + `api/_fila.js`) e push na `main`. O deploy desse push ainda não publica a página;
   o robô publica no dia.

Pré-visualizar o lote inteiro localmente: `PUBLICAR_TUDO=1 npm run build` (no PowerShell:
`$env:PUBLICAR_TUDO='1'; npm run build`). Nunca configure `PUBLICAR_TUDO` na Vercel.

## Como segurar uma página

- Adiar: troque a data por outro dia válido, `npm run fila:gerar`, commit e push.
- Segurar sem data: `draft: true` no frontmatter (sai da fila e de todas as listas),
  `npm run fila:gerar`, commit e push.
- Página que já foi ao ar não volta a ser agendada mudando a data para a frente: o próximo build
  a remove (vira 404). Para despublicar, use `draft: true` de propósito.

## Setup (feito em 12/11/2026)

- Deploy Hook `fila-publicacao` (branch `main`, id `mvJup2JvMH`) criado na Vercel.
- Env na Vercel (Production): `CRON_SECRET` e `VERCEL_DEPLOY_HOOK`.
- Segredo `VERCEL_DEPLOY_HOOK` no GitHub Actions do repositório.
- Cron Job `/api/publicar-fila/` registrado (`vercel crons ls`).
- Teste ponta a ponta em 12/11/2026 com duas páginas noindex agendadas para minutos à frente:
  `/ajuda/teste-fila-a/` (04:10 UTC) publicada pelo GitHub Actions às 04:11 (run 43153031388) e
  `/ajuda/teste-fila-b/` (04:13 UTC) publicada pela função da Vercel às 04:14; a função chamada de
  novo respondeu `ja-publicado`. A 1ª tentativa (03:42) disparou o build, mas ele reprovou no
  check-sitemap porque página da collection com `noindex` entrava no sitemap: corrigido no
  `astro.config.mjs` (conjunto `NOINDEX` no filtro do sitemap, commit 6a99086).

Para refazer o teste: crie `src/content/paginas/ajuda/teste-fila-<x>.mdx` com `noindex: true` e
`publicado` alguns minutos à frente, `npm run fila:gerar`, push, espere o horário e rode
`gh workflow run fila-publicacao.yml -R pedrosocrates23-code/maquininhaja`. Apague o arquivo depois.

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/publicacao.ts` | regra única de página publicada (`visivel`, `estaPublicada`) |
| `astro.config.mjs` | integração `links-agendados`; `CRONS` no gerador do `vercel.json` |
| `scripts/fila-publicacao.mjs` | cadência, status, verificação e geração de `api/_fila.js` |
| `api/_fila.js` | gerado: fila inteira desde 2026-11-18 (URL + data) |
| `api/publicar-fila.js` | Vercel Function chamada pelo Cron (reserva) |
| `.github/workflows/fila-publicacao.yml` | gatilho principal (GitHub Actions) |
