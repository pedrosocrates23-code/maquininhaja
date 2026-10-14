# maquininhaja.com.br

Site parceiro independente das maquininhas Ton. Astro 7 (estático), MDX, sitemap, zero JS
de terceiros. Planejamento de origem: `clients/maquininhas/entregaveis/` (Word + XLSX da Ton).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Gera `dist/` |
| `npm run build:producao` | Build + gate pré-deploy (reprova se houver pendência da Fase 0) |
| `npm run sync` | Regera `src/data/taxas.json` e `fontes.json` a partir da pesquisa (`clients/maquininhas/ton/`) |
| `npm run ativos` | Regera ícones, manifest e imagens OG (`public/`) |
| `npm run validar` | Gate de conteúdo de todas as páginas MDX (inclui densidade do Redator 5.0) |
| `python scripts/checar_dist.py` | Links internos, JSON-LD, H1, title e description no `dist/` |
| `node scripts/lighthouse.mjs` | Lighthouse mobile e desktop em todas as URLs do sitemap (precisa de `npx astro preview --port 4329`) |

## Como o conteúdo funciona

- **Taxas e preços nunca são digitados no texto.** Saem de `src/data/taxas.json` e `src/data/modelos.ts` pelos componentes `<Taxa/>`, `<Preco/>`, `<TabelaFaixas/>` e `<TabelaParcelas/>`. Mudou a taxa na Ton: atualize a pesquisa, rode `npm run sync` e o build.
- **Cada fato tem fonte** (`<Fonte id="..."/>`): ledger oficial (`TN-`, `MK-`) ou fontes coletadas na redação (`src/data/fontes-extra/*.json`, ids `X-`). O fim de cada página lista os documentos com o trecho literal.
- **Página nova:** crie `src/content/paginas/<secao>/<slug>.mdx` seguindo `design/SPEC-REDACAO.md` e rode `npm run validar`. Ela entra no hub, no sitemap e no JSON-LD sozinha.
- **Imagens:** fotos dos aparelhos são as oficiais da Ton (`design/imagens-fonte/ton-oficial/`, URL de cada uma em `FONTES.md`), copiadas sem reprocessar para `src/assets/img/modelo-*`. Cenas (hero e seções) são ilustrações geradas pelo Codex CLI com a maquininha Ton real (T3 ou T3 Smart) tirada das fotos oficiais, em `design/imagens-fonte/cenas-ton/`. O Astro entrega AVIF/WebP responsivo.

## Antes de publicar (Fase 0)

O gate `npm run build:producao` só passa quando tudo isto estiver resolvido:

1. **Cadastro no Renda Extra Ton aprovado** e links de indicação por modelo gerados no app (Renda Extra). Colar em `src/data/links.json` e trocar `PROGRAMA_ATIVO` para `true` em `src/data/site.ts`.
2. **Responsável legal** (nome ou razão social sem "Ton", CPF ou CNPJ) em `src/data/site.ts`. Aparece no rodapé, em Quem somos e na Política de privacidade (LGPD).
3. **Domínio** `maquininhaja.com.br` registrado e caixa `contato@maquininhaja.com.br` criada.
4. **Diretrizes logadas** do programa (anúncios online e criação de website, no app) lidas e conferidas contra o site.
5. **Host:** `public/_headers` e o `_redirects` gerado no build seguem o formato do Cloudflare Pages e do Netlify. Em outro host, replique os cabeçalhos de segurança e os 302 de `/link/*`.
6. Opcional: `PUBLIC_GA4_ID` no ambiente ativa o banner de consentimento e o GA4 (só carrega depois do "Aceitar").
