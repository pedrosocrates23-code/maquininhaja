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

Pedido do usuário: "no primeiro mês, um dia sim, um dia não; depois do primeiro mês, todos os
dias da semana, mas não final de semana; conteúdos todos às 6:30 da manhã".

| Regra | Valor (constantes no topo do script) |
|---|---|
| Horário | `09:30:00.000Z` exato (06:30 em Brasília) |
| Fase 1 | 2026-11-18 a 2026-12-17: só segunda, quarta e sexta |
| Fase 2 | a partir de 2026-12-18: segunda a sexta |
| Fim de semana | nunca |
| Por dia | no máximo 1 página |
| Acervo | `publicado` antes de 2026-11-18 fica fora da fila (data simples continua valendo) |

`npm run fila:verificar` reprova (exit 1) data fora da regra, horário diferente de 09:30 UTC, dois
itens no mesmo dia e `api/_fila.js` desatualizado. O workflow roda essa checagem antes de tudo.

Comandos:

```bash
npm run fila:status       # tabela da fila (primeira linha: "Publicadas: N | Na fila: N | ...")
npm run fila:verificar    # regras da cadência + api/_fila.js em dia
npm run fila:gerar        # reescreve api/_fila.js
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

## SETUP PENDENTE (fazer uma vez, nesta ordem)

Nada disto foi feito ainda. Sem o passo 1 e 2/3 os gatilhos rodam mas não conseguem disparar build.

A Vercel CLI não está instalada nesta máquina: `npm i -g vercel` e `vercel login`.

1. **Criar o Deploy Hook da `main`** (a URL é segredo: vai para arquivo, nunca para o chat nem
   para o repositório):
   ```bash
   vercel deploy-hooks create fila-publicacao --ref main --project maquininhaja \
     --scope pedrosocrates23-5308s-projects --non-interactive > hook.url
   ```
   Confira que `hook.url` tem só a URL (`https://api.vercel.com/v1/integrations/deploy/...`); se a
   CLI imprimir texto em volta, deixe só a URL. Alternativa pelo painel: Project > Settings > Git >
   Deploy Hooks, nome `fila-publicacao`, branch `main`.
2. **Variáveis de ambiente na Vercel (Production)**:
   ```bash
   # CRON_SECRET: string aleatória de 16+ caracteres, só letras e números
   # sem quebra de linha no fim: a Vercel manda o valor num header e espaço/linha a mais dá 401
   node -e "process.stdout.write(require('crypto').randomBytes(24).toString('hex'))" > cron.secret
   tr -d '\r\n ' < hook.url > hook.tmp && mv hook.tmp hook.url
   vercel env add CRON_SECRET production --scope pedrosocrates23-5308s-projects < cron.secret
   vercel env add VERCEL_DEPLOY_HOOK production --scope pedrosocrates23-5308s-projects < hook.url
   ```
   Env nova só vale a partir do próximo deploy. Se a CLI recusar ler do stdin, use o painel
   (Settings > Environment Variables, ambiente Production) e cole o conteúdo dos arquivos.
3. **Segredo do GitHub Actions**:
   ```bash
   gh secret set VERCEL_DEPLOY_HOOK -R pedrosocrates23-code/maquininhaja < hook.url
   ```
4. **Push do workflow**. Arquivo em `.github/workflows/` exige token com escopo `workflow`, e este
   repo exige a conta dona:
   ```bash
   gh auth switch -u pedrosocrates23-code
   gh auth refresh -h github.com -s workflow
   git push
   ```
   O deploy desse push publica o `vercel.json` com o `crons` e a função `api/publicar-fila.js`.
   Confira em Vercel > Project > Settings > Cron Jobs que o job `/api/publicar-fila/` apareceu.
5. **Testes** (depois do deploy):
   ```bash
   # função sem token: 401
   curl -i https://maquininhaja.com.br/api/publicar-fila/
   # função com token: 200 e {"acao":"nada-vencido"} enquanto nada venceu
   curl -s -H "Authorization: Bearer $(cat cron.secret)" https://maquininhaja.com.br/api/publicar-fila/
   # hook: deve responder com um job (dispara um build de produção)
   curl -s -X POST "$(cat hook.url)"
   # workflow manual: deve passar no "Conferir regras da fila"
   gh workflow run fila-publicacao.yml -R pedrosocrates23-code/maquininhaja
   gh run list -R pedrosocrates23-code/maquininhaja --workflow fila-publicacao.yml -L 1
   ```
   Apague `hook.url` e `cron.secret` quando terminar (ou guarde fora do repositório).

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/publicacao.ts` | regra única de página publicada (`visivel`, `estaPublicada`) |
| `astro.config.mjs` | integração `links-agendados`; `CRONS` no gerador do `vercel.json` |
| `scripts/fila-publicacao.mjs` | cadência, status, verificação e geração de `api/_fila.js` |
| `api/_fila.js` | gerado: fila inteira desde 2026-11-18 (URL + data) |
| `api/publicar-fila.js` | Vercel Function chamada pelo Cron (reserva) |
| `.github/workflows/fila-publicacao.yml` | gatilho principal (GitHub Actions) |
