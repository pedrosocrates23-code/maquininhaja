# Neuromarketing aplicado ao texto: o que usar, o que evitar

Pesquisa feita em 18/10/2026. Objetivo: aumentar a conversão do site (clique em "Pedir a Ton no site da Ton") **só pelo texto**, sem prometer o que a Ton não promete.

## 1. O que a pesquisa mostrou (com o grau de evidência)

| Princípio | O que a ciência sustenta | Evidência | Fonte |
|---|---|---|---|
| Fluência de processamento | Texto fácil de ler é julgado mais verdadeiro, mais confiável e o autor parece mais inteligente. Vale para frase curta, palavra simples e layout limpo. | Forte, bem replicada | Reber e Schwarz (1999); Alter e Oppenheimer (2009); Shah e Oppenheimer (2007) |
| Ancoragem | Um número visto antes influencia a estimativa seguinte. O efeito é robusto em preço e disposição a pagar. | Forte no efeito; o mecanismo ainda se discute | Tversky e Kahneman (1974); Judgment and Decision Making, 2019 |
| Aversão à perda | Perda pesa mais do que ganho equivalente. Exemplo de campo: taxa de 5 centavos na sacola cortou o uso; bônus de 5 centavos não fez nada. | Média. A razão "2 para 1" é contestada e o efeito não é universal | Kahneman e Tversky (1979); Gal (2006) |
| Excesso de opções | Opções demais podem travar a decisão, mas a meta-análise de 63 condições (N = 5.036) deu efeito médio perto de zero, com muita variação. Funciona quando a pessoa não tem preferência prévia. | Condicional. Não é lei | Scheibehenne, Greifeneder e Todd (2010) |
| Intenção de implementação (se X, então Y) | Plano concreto "quando A acontecer, eu faço B" aumenta a chance de a ação sair do papel. | Boa em pesquisa de comportamento | Gollwitzer; Trötschel e Gollwitzer (2007) |
| Pé na porta | Pedido pequeno antes do grande aumenta a adesão ao grande. | Fraca a média; sem tamanho de efeito confiável | Literatura de compliance |
| Padrão (default) | A opção pré-selecionada é escolhida com mais frequência. | Boa, mas é nudge de interface, pouco de texto | Johnson e Goldstein |

**O que não entra:** números do tipo "aumenta conversão em 1.892%" ou "95% da decisão é inconsciente" circulam em blogs sem estudo por trás. Nenhuma página do site cita esses números.

**Limite honesto:** é pesquisa de comportamento em geral. Nenhum desses estudos foi feito em maquininha. A aplicação abaixo é hipótese a testar no GA4 (eventos `cta_corpo`, `pedido_ton_click`), não garantia de resultado.

## 2. Como cada princípio vira regra de texto neste site

| Princípio | Regra de redação | Exemplo permitido | Exemplo proibido |
|---|---|---|---|
| Fluência | Frase de 9 a 13 palavras, verbo simples, uma ideia por frase, resposta antes da explicação. | "Se você vende só no celular, a T1 basta." | "A solução viabiliza a otimização do seu fluxo." |
| Decisão sem paralisia | Em toda página comercial, **uma recomendação padrão por perfil**, antes da tabela. As quatro opções ficam abaixo, para quem quer comparar. | "Para balcão com comprovante impresso, comece pela T3." | Listar os 4 modelos sem dizer qual combina com quem. |
| Ancoragem honesta | Mostre primeiro o número real de referência (preço de lista, taxa de depois dos 30 dias) e só então o promocional. Sempre com fonte e data. | "Era R$ 56,57, hoje R$ 16,80 (verificado em 13/10/2026)." | "Preço imbatível." Preço sem data. |
| Aversão à perda real | Enuncie a perda **que existe e tem fonte**: a promoção acaba em 30 dias ou R$ 5 mil; a faixa de taxa muda todo mês; a máquina é comodato. | "A taxa de 0,57% tem prazo: 30 dias ou R$ 5 mil em vendas." | "Últimas unidades", contagem regressiva, "só hoje". Escassez inventada é publicidade enganosa. |
| Intenção de implementação | Termine a decisão com um gatilho "se... então...". | "Se você vende acima de R$ 3 mil por mês, simule a faixa antes de pedir." | "Peça agora!" sem critério. |
| Pé na porta (escada de compromisso) | Ofereça o passo menor antes do pedido: quiz, calculadora, tabela. O CTA de pedido vem depois de a pessoa ter chegado a uma resposta. | "Responda 3 perguntas e veja o modelo." | Pedir o pedido no primeiro parágrafo de uma página de dúvida. |
| Prova social | Só número com fonte (nota no Reclame Aqui, base de clientes publicada pela Stone). Nunca depoimento. | "Nota 9,0 no Reclame Aqui em 13/10/2026." | "Milhares de clientes satisfeitos." Depoimento criado. |
| Efeito da falha confessa | Dizer o limite do produto aumenta a credibilidade do resto. É a marca do site. | "A T1 não imprime e não aceita Pix na máquina." | Esconder a limitação. |
| Autoridade e transparência | Declarar vínculo (Parceiro Ton, comissão) logo no CTA. Reduz desconfiança de quem teme ser enganado. | Nota atual do `CtaIndicacao`. | Fingir ser a Ton. |
| Objeção antes do clique | Responder, ao lado do CTA, a dúvida que trava o pedido: custo fixo, comodato, taxa depois da promoção. | "Sem mensalidade. Há taxa de adesão por máquina." | Omitir a taxa de adesão. |

## 3. Estrutura de página comercial (esqueleto)

1. **Resposta + recomendação** na primeira tela (summarization): para quem é, qual modelo, uma frase de custo.
2. **Critério de decisão** (3 a 5 itens com "se... então..."), cada fato com fonte.
3. **Números reais**: componente `Preco`/`Taxa`, com a perda existente (prazo da promoção, faixa).
4. **Limite do produto** (quando NÃO serve): seção curta e direta.
5. **CTA único no corpo** (`CtaIndicacao`), logo depois do bloco em que a decisão fica clara, com texto de ação específico ("Pedir a Ton T3 no site da Ton").
6. **Escada**: link para quiz ou calculadora antes do CTA, quando a pessoa ainda não tem certeza.
7. A última seção continua sendo conteúdo útil (a SPEC proíbe "Conclusão").

## 4. Lista de proibições (promessa que não pode ser cumprida)

- Escassez ou urgência que a Ton não publica. Prazo só quando a Ton publica (30 dias, R$ 5 mil).
- "Menor taxa", "grátis", "sem custo", "sem burocracia" sem fonte literal.
- Promessa de renda, de aumento de vendas ou de aprovação do cadastro.
- Depoimento, avaliação ou número de clientes que não esteja no ledger.
- Falar como a Ton ("nossa maquininha", "nosso atendimento").
- Comparar com concorrente para depreciá-lo. Cupom: só o do programa (TN-F042 e TN-F171).
- Técnica de manipulação sem benefício ao leitor: culpa, medo de exclusão, falso contador.

## 5. Como medir se funcionou

- `cta_corpo` por `pagina_tipo` e por `secao`: taxa de clique do CTA do corpo antes e depois da mudança.
- `pedido_ton_click` por modelo: o clique chegou ao modelo certo?
- Clarity: profundidade de rolagem até o CTA e cliques mortos.
- Mudança por lote, não tudo ao mesmo tempo, para saber o que causou o quê. Janela mínima: 4 semanas.

Fontes consultadas:
[Scheibehenne, Greifeneder e Todd (2010), Journal of Consumer Research](https://ideas.repec.org/a/oup/jconrs/v37y2010i3p409-425.html) ·
[Choice overload, revisão de moderadores (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11111947/) ·
[Fluência e julgamento (JDM)](https://dlab.sauder.ubc.ca/sjdm/journal/7730/jdm7730.htm) ·
[Ancoragem em disposição a pagar (JDM, 2019)](https://dlab.sauder.ubc.ca/sjdm/journal/19/190426/jdm190426.html) ·
[Trötschel e Gollwitzer, intenções de implementação](https://www.socmot.uni-konstanz.de/sites/default/files/07_Troetschel_Gollwitzer_Implementation_intentions_and_t.pdf) ·
[Conar e links de afiliado como publicidade](https://www.uai.com.br/networking-e-negocios/2026/09/23/ganha-comissao-com-link-de-afiliado-para-o-conar-isso-ja-e-publicidade/)
