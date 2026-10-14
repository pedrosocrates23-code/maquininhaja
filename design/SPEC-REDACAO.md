# Spec de redação: maquininhaja.com.br (site parceiro Ton)

Leia tudo antes de escrever. Toda página que sair fora desta spec volta para reescrita.

## 1. O que é o site

- Site **independente** de Parceiro Ton (programa Renda Extra Ton). **Não somos a Ton.** A venda fecha no site oficial da Ton, pelo link de indicação (`/link/<chave>/`).
- Público: autônomo e microempreendedor brasileiro que busca maquininha Ton, taxa, "cai na hora", suporte.
- Data da verificação de todos os fatos: **13 de outubro de 2026**.

## 2. Regra número 1: nada inventado

- **Todo fato verificável** (taxa, preço, prazo, regra, telefone, passo do app, requisito) precisa de fonte com `<Fonte id="..." />` logo depois da frase.
- Fontes já coletadas (use primeiro):
  - Ledger: `C:\Users\User\Saquad de seo\clients\maquininhas\ton\evidencias.md` (ids `F001`..`F183`; no site use `TN-F001`). Mercado: `clients\maquininhas\mercado\evidencias.md` (`MK-F01`.. no site `MK-F01`; confira o formato do id no arquivo `src/data/fontes.json`).
  - Dados estruturados: `clients\maquininhas\ton\pesquisa.json`.
  - HTML/PDF brutos já baixados: `clients\maquininhas\ton\raw\` (ex.: `ajuda_mquina_t1.txt`, regulamentos `.pdf.txt`).
- **Fonte nova**: se precisar de algo que não está no ledger (ex.: passo a passo da ajuda oficial), baixe a página oficial com `curl -sL -A "Mozilla/5.0" <url>` e extraia o texto. Salve o trecho **literal** num JSON seu: `src/data/fontes-extra/<slug-da-pagina>.json`, formato:
  ```json
  { "X-primeiros-passos-01": { "url": "https://ajuda.ton.com.br/...", "data": "2026-10-13", "trecho": "texto literal copiado da página, sem editar" } }
  ```
  Ids sempre `X-<slug>-NN` (minúsculas, hífen). Use no texto `<Fonte id="X-primeiros-passos-01" />` e liste no frontmatter `fontes`.
  - Domínios aceitos: ton.com.br, ajuda.ton.com.br, documentos.ton.com.br, rendaextra.ton.com.br, blog.ton.com.br, stone.com.br, docs.stone.com.br, bcb.gov.br, gov.br, reclameaqui.com.br (só para reputação), investors.stone.co / sec.gov (só para dados da StoneCo). Outro domínio: não use.
  - **Se a página não abrir (403, vazia, JS), não invente o conteúdo.** Escreva só o que tem fonte e diga no relatório o que ficou faltando. Para páginas que dependem de JavaScript, procure o texto no HTML bruto (JSON embutido) antes de desistir.
- **Proibido**: afirmar teste próprio ("testamos", "no nosso teste"), experiência pessoal ("já vi", "eu já"), caso genérico ("imagine um..."), promessa de renda, número sem fonte, falar como a Ton ("nossas maquininhas", "nosso atendimento"), depreciar concorrente.
- Conflito entre duas fontes oficiais: mostre as duas com `<Callout tipo="conflito">`. Não escolha uma em silêncio.

## 3. Voz: operador direto (adaptada)

Base: `C:\Users\User\Saquad de seo\squads\redator-5.0\personas\persona-operador-direto.md`. **Adaptação obrigatória**: o site não testou aparelhos e não tem autor com experiência própria registrada, então **sem relato em primeira pessoa** (a assinatura "já vi isso quebrar" está proibida). O resto vale:

- Frase curta (média 9 a 13 palavras), muita frase de até 6 palavras, parágrafo de uma frase permitido.
- Imperativo na instrução ("Abre o app.", "Confere a etiqueta."). Segunda pessoa ("você").
- Primeira pessoa do plural só para o que o site fez de verdade ("conferimos em 13/10/2026", "este site recebe comissão").
- Verbo simples. Nada de "potencializar", "viabilizar", "otimizar", "alavancar". Sem "Bora", "Sacou". Sem diminutivo ("dicazinha").
- Sem travessão (—) em lugar nenhum. Sem emoji. Sem reticências. Exclamação só em aviso real.
- Acentuação pt-BR completa.

## 4. Formato do arquivo (MDX)

Modelo pronto, já aprovado no gate: `src/content/paginas/quanto-custa/quando-cai.mdx`. Copie a estrutura.

Caminho = URL: `src/content/paginas/ajuda/contato.mdx` vira `/ajuda/contato/`. `src/content/paginas/renda-extra.mdx` vira `/renda-extra/`.

Frontmatter (validado por Zod em `src/content.config.ts`):

| Campo | Regra |
|---|---|
| title | 20 a 62 caracteres. Contém a keyword. Sem nome do site (o template não adiciona sufixo). |
| description | 110 a 160 caracteres. Responde a intenção. |
| h1 | 10 a 90 caracteres. Contém a keyword. Diferente do title. |
| rotulo | Chip acima do H1 ("Ajuda", "Guia", "Taxas", "Modelos", "Programa de parceiros"). |
| secao | `ajuda`, `aprenda`, `quanto-custa`, `modelos` ou `renda-extra`. |
| kw | Keyword principal do brief. |
| resumo | 60 a 420 caracteres, resposta direta em 1 ou 2 frases, `<strong>` permitido. |
| fontes | Lista de todos os ids citados no corpo (TN-, MK-, X-). |
| publicado / atualizado | `2026-10-13` |
| og | Uma de: padrao, modelos, t1, t2, t3, t3-smart, tapton, quanto-custa, calculadora, ajuda, aprenda, renda-extra, institucional |
| relacionadas | Até 3 `{ href, label }` para páginas do site. |
| cta | Opcional: `{ chave, texto }`. Chaves: t1, t2, t3, t3-smart, tapton, link-de-pagamento, renda-extra. Use só em página com intenção de compra ou de virar parceiro. Página de suporte não leva CTA de compra. |
| faq | 2 a 5 `{ p, r }`; `r` em HTML simples (`<p>`), sem componentes. Perguntas reais do brief. |

Corpo:

1. **Primeira linha**: `<p class="summarization">...</p>` com 40 a 60 palavras e ao menos um `<strong>` (entidade ou número). É o mini-resumo para buscadores e LLMs.
2. Seções em `## H2` (mínimo 3), `### H3` quando precisar. A primeira H2 já entrega a resposta prática.
3. **Sem seção de fechamento** ("Conclusão", "Resumo", "Para finalizar"). A última seção é conteúdo útil (ex.: "Qual escolher", "Se nada disso resolveu").
4. **No máximo 3 links internos no corpo** (markdown `[texto](/caminho/)`), para páginas que existem (lista na seção 6). Links externos só via `<Fonte>`.
5. Tabela: use HTML como no modelo (`<div class="table-wrap" tabindex="0" role="region" aria-label="..."><table>...`) com `<caption>` e `scope`.
6. Não use `import` no MDX. Os componentes já chegam pelo template.

Componentes disponíveis (exatamente estes):

| Componente | Uso |
|---|---|
| `<Fonte id="TN-F011" />` ou `<Fonte id={['TN-F010', 'TN-F072']} />` | Citação logo após a frase. |
| `<Taxa faixa="ate3k" prazo="d1" tipo="credito1x" />` | **Toda taxa do Ton Mega+ vem por aqui, nunca digitada.** faixa: promo, ate3k, 3a6k, 6a10k, 10a30k, 30k, tapton, link. prazo: na_hora, d1 (link: d14, d30). tipo: debito, credito1x, parcela (com `parcelas={12}`), elo_debito, elo_credito1x, elo_12x. Dados em `src/data/taxas.json`. |
| `<Preco modelo="t3" />`, `<Preco modelo="t3" de />`, `<Preco modelo="t3" parcela />` | Preço de adesão (`src/data/modelos.ts`). |
| `<TabelaFaixas prazo="d1" destaque="ate3k" />` | Débito, crédito e 12x por faixa. `elo` para Elo/Amex. |
| `<TabelaParcelas prazo="d1" faixas={['promo','ate3k']} ate={21} />` | Parcelado 2x a 21x. |
| `<Callout tipo="info|atencao|conflito" titulo="...">texto</Callout>` | Aviso. |
| `<CtaIndicacao chave="t3" texto="Pedir a Ton T3 no site da Ton" />` | Botão de conversão (rel sponsored). No máximo 1 no corpo. |

Dentro de componentes de bloco (`Callout`), deixe linha em branco antes e depois do texto se houver markdown.

## 5. Tamanho

| Seção | Palavras no corpo |
|---|---|
| ajuda | 650 a 1.600 |
| quanto-custa | 700 a 1.800 |
| modelos (página editorial) | 700 a 1.800 |
| aprenda, renda-extra | 1.000 a 2.400 |
| análise de modelo (`src/content/modelos/*.mdx`) | 600 a 1.400 |

Profundidade é piso. Cobrir as variações reais de busca do brief (`design/briefs/*.json`, campo `buscas_reais_autocomplete`) é o que define o conteúdo: cada grupo de dúvidas vira seção ou FAQ.

## 6. Páginas que existem (para links internos)

/, /modelos/, /modelos/t1/, /modelos/t2/, /modelos/t3/, /modelos/t3-smart/, /modelos/tapton/, /modelos/cartoes-e-vales/, /quanto-custa/, /quanto-custa/calculadora/, /quanto-custa/parcelado/, /quanto-custa/quando-cai/, /quanto-custa/planos-antigos/, /ajuda/, /ajuda/primeiros-passos/, /ajuda/nao-liga-ou-sem-sinal/, /ajuda/erros-e-resetar/, /ajuda/cancelar-e-devolver/, /ajuda/conta-bloqueada/, /ajuda/contato/, /aprenda/, /aprenda/ton-e-stone/, /aprenda/ton-e-confiavel/, /aprenda/maquininha-ton-sem-cnpj/, /renda-extra/, /transparencia/, /como-testamos/

## 7. Gate obrigatório antes de entregar

```bash
cd "C:\Users\User\Saquad de seo\passanamaquininha.com.br"
python scripts/validar_pagina.py src/content/paginas/<sua>.mdx
```

Só entregue com **PASS** em todas as suas páginas. O gate roda o validador de densidade do Redator 5.0 (verde obrigatório). **Não rode `astro build` nem `npm`**: outros redatores trabalham em paralelo no mesmo projeto; o build é feito no fim por quem orquestra.

Escreva somente nos seus arquivos (as páginas atribuídas e o seu `src/data/fontes-extra/<slug>.json`). Não edite nenhum outro arquivo.
