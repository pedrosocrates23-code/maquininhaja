# Medição do Maquininha Já (GA4 + Clarity)

IDs em `src/data/site.ts`: GA4 `G-BEFSW89Y99`, Clarity `yylkwb2llv`. Os dois só carregam depois do "Aceitar" do banner (LGPD). Quem recusa não gera nenhum evento.

Código: `src/components/Consentimento.astro` (carrega as tags), `src/components/Medicao.astro` (dispara os eventos), `src/lib/medicao-ctx.ts` (tipo da página).

## 1. Como os cliques são divididos

Todo clique em botão/link recebe três coordenadas:

| Parâmetro | Valores | Pergunta que responde |
|---|---|---|
| `bloco` | `header`, `corpo`, `rodape` | O clique foi no topo, no conteúdo ou no rodapé? |
| `secao` | ver tabela 2 | Em qual parte da página? |
| `pagina_tipo` | `home`, `modelo`, `modelos_lista`, `taxas`, `calculadora`, `renda_extra`, `ajuda_hub`, `ajuda_guia`, `aprenda_hub`, `aprenda_guia`, `institucional`... | Em que tipo de página? (vai em TODOS os eventos, inclusive `page_view`) |

Além do evento "de verdade" (ex.: `pedido_ton_click`), todo CTA dispara um segundo evento **só com o lugar**: `cta_header`, `cta_corpo`, `cta_rodape`. Eles aparecem direto em Relatórios > Engajamento > Eventos, sem cadastrar dimensão. O parâmetro `evento_origem` diz qual CTA foi.

## 2. Seções (`secao`)

| Bloco | `secao` |
|---|---|
| header | `header_logo`, `header_menu` (links do menu), `header_botao` ("Escolher maquininha"), `menu_mobile` |
| corpo, home | `home_hero`, `home_modelos`, `home_bandeiras`, `home_quiz`, `home_verdades`, `home_calculadora`, `home_taxas`, `home_ajuda`, `home_independente`, `home_faq` |
| corpo, modelo | `modelo_topo` (botão de pedido do topo), `modelo_custo`, `modelo_cta_final` (botão de pedido do fim) + id das seções (`serve`, `ficha`, `pc`) |
| corpo, outras | `modelos_vitrine`, `modelos_tabela`, `calculadora_form`, `cta_final`; em artigos MDX: `artigo` + `secao_titulo` (h2 mais próximo acima do botão) |
| rodape | `rodape_destaque` (botão "Simular minhas taxas"), `rodape_links`, `rodape_geral` |

## 3. Eventos

| Evento | Quando dispara | Parâmetros extras | Conversão? |
|---|---|---|---|
| `pedido_ton_click` | clique num botão `/link/t1`, `t2`, `t3`, `t3-smart` (vai ao checkout da Ton) | `modelo_cta`, `cta_texto`, `cta_destino` | **SIM, principal** (é o que gera comissão) |
| `renda_extra_click` | clique em `/link/renda-extra` | idem | **SIM** |
| `link_pagamento_click` | clique em `/link/link-de-pagamento` | idem | **SIM** (hoje não há botão com essa chave) |
| `quiz_resultado` | leitor concluiu o quiz da home | `modelo_sugerido`, `onde`, `papel`, `celular` | micro (lead qualificado) |
| `quiz_resultado_click` | clicou em "Ver a Ton ..." depois do quiz | | micro |
| `calculadora_usada` | primeira alteração na calculadora (1x por visita) | `faixa_faturamento`, `prazo`, `parcelas` | micro (sem o valor exato) |
| `calculadora_cta_click` | "Abrir a calculadora" / "Simular com o meu faturamento" | | micro |
| `calculadora_resultado_click` | "Ver qual maquininha escolher", depois do resultado | | micro |
| `cta_interno_click` | qualquer outro botão do site (`.btn`) | `cta_texto`, `cta_destino` | não |
| `modelo_card_click` | clique no card de um modelo | `modelo_cta` | não |
| `cta_header` / `cta_corpo` / `cta_rodape` | todo CTA acima, só com o lugar | `evento_origem` | não (use para dividir) |
| `navegacao_click` | link do menu ou do rodapé | `bloco`, `cta_destino` | não |
| `contato_email_click` | clique em e-mail | | micro |
| `saida_click` | link para outro domínio | `cta_destino` | não |
| `secao_vista` | seção da home/modelo ficou 40% visível | `secao` | não |
| `scroll_profundidade` | 25, 50, 75 e 100% da página | `percentual` | não |
| `faq_aberto` | pergunta do FAQ aberta | `pergunta` | não |
| `referencias_aberto` | bloco "Referências" aberto | | não |
| `menu_mobile_aberto` | menu do celular aberto | | não |
| `quiz_inicio` | primeira resposta do quiz | | funil |

## 4. O que configurar no painel do GA4 (não dá para fazer por código)

**Admin > Eventos > Marcar como evento-chave:** `pedido_ton_click`, `renda_extra_click`, `link_pagamento_click`. Opcional (micro): `quiz_resultado`, `calculadora_usada`.

**Admin > Definições personalizadas > Criar dimensão personalizada** (escopo: Evento). Só isso cadastrado, o resto fica oculto no GA4:

| Nome | Parâmetro |
|---|---|
| Bloco | `bloco` |
| Seção | `secao` |
| Título da seção | `secao_titulo` |
| Tipo de página | `pagina_tipo` |
| Modelo da página | `modelo` |
| Modelo do CTA | `modelo_cta` |
| Tipo de CTA | `cta_tipo` |
| Texto do CTA | `cta_texto` |
| Destino do CTA | `cta_destino` |
| Evento de origem | `evento_origem` |
| Faixa de faturamento | `faixa_faturamento` |
| Modelo sugerido | `modelo_sugerido` |

As dimensões levam até 24 h para aparecer nos relatórios. Antes disso, a divisão por lugar já funciona pelos eventos `cta_header`, `cta_corpo` e `cta_rodape`.

**Exploração sugerida (tabela livre):** linhas = `Seção`; colunas = `Bloco`; valores = contagem do evento `pedido_ton_click`. Segundo quadro: mesma coisa por `Tipo de página`.

## 5. Clarity

Mesmos eventos (`clarity('event', nome)`) e duas tags de filtro: `bloco`, `secao` e as tags de página `pagina_tipo` e `modelo`. Dá para filtrar gravações e mapas de calor por "quem clicou em pedido_ton_click" ou "quem clicou no corpo".

## 6. Como testar

1. Abra o site, clique em "Aceitar".
2. GA4: Admin > DebugView (ou instale a extensão Tag Assistant / GA Debugger).
3. Clique em: botão do header, botão de pedido de um modelo, "Simular minhas taxas" do rodapé. Cada um deve mostrar o evento + `cta_<bloco>`.
4. Os cliques em `/link/...` saem do site (302); o gtag está configurado com `transport_type: 'beacon'`, que sobrevive à troca de página.
