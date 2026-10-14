# Auditoria de realidade, rodada 1 (13/10/2026): defeitos a confirmar como corrigidos

## Lote A (modelos, taxas, renda)
- A-D1/A-D2/A-D4: site afirmava ser parceiro do Renda Extra e receber comissão com PROGRAMA_ATIVO=false (renda-extra.mdx, index.astro). Esperado: texto condicional via <Parceria>/STATUS; com o flag falso, nenhuma afirmação de parceria ou comissão; "preço não muda" trocado por cupom de 5% só no estado ativo.
- A-D3 parcelado.mdx: "Cobrar" sem fonte. Esperado: "a ajuda não explica a diferença entre Cobrar e Receber".
- A-D5: Pix 0% "30 dias" sem expor que o regulamento liga ao período promocional (30 dias ou R$ 5 mil). Arquivos: quando-cai, quanto-custa/index, index, cartoes-e-vales, t2, calculadora.
- A-D6 t2/t3-smart: chave aleatória não garante taxa zero.
- A-D7: T2 12x x blog 18x/21x (menos D188) exposto em t2, t3, modelos/index, cartoes-e-vales, index e na ficha (modelos.ts parcelasNota).
- A-D8 renda-extra: R$ 10 mil (TN-F039) e R$ 20 mil (TN-F168) lado a lado, sem base.
- A-D9 cartoes-e-vales: TN-F141 (resumo de WebSearch) trocado por fonte primária ou frase removida.
- A-D10 renda-extra FAQ: divergência Pagar.me x Stone sobre a marca.
- A-D11 quanto-custa/index: primeiro enquadramento pelos 30 dias, depois mês fechado.
- A-D12 index: prazo escolhido na adesão e pode ser trocado depois.
- A-D13 modelos.ts: R$ 83,88.
- A-D14 t1 "oito passos", tapton "três passos".
- A-D15 fontes erradas: TapTon -> TN-F058; estorno -> cláusula 4.7.2; Pix no link -> TN-F082.
- A-D16 "taxas iguais" citando TN-F051.
- A-D17 conflito 3G x 4G com TN-F066, TN-F067, TN-F069.
- A-D18 planos-antigos: comparador com URL primária.
- A-D19 cashback = valor efetivamente pago.
- A-D20 FaturaTon 3 meses inclui Ton na Mão; UpTON na primeira vez.
- A-D21 garantia: defeito de fabricação.
- A-D22 quando-cai: tabela só de 1 dia útil; "R$ 1 a cada R$ 100" só no crédito à vista.

## Lote B (ajuda, guias, institucional)
- B-D1: mesmo problema de parceria em Header, Footer, quem-somos, transparencia, contato.mdx, ton-e-confiavel.mdx, privacidade.
- B-D2 contato.mdx: números de WhatsApp e mensagens dos botões.
- B-D3 ton-e-stone: rodapé do ton.com.br (não "de todas as páginas").
- B-D4 contato: não escolher lado sobre quem detém a marca.
- B-D5 transparencia: cupom 5% x cláusula 5.5 (desconto variável).
- B-D6 transparencia: pagamento na conta de pagamento, cláusula 5.4.
- B-D7 privacidade: base legal do e-mail art. 7º, IX.
- B-D8 privacidade: Marco Civil art. 15 só para PJ.
- B-D9/B-D10 Escolha.astro: bateria "de longa duração"; T1 sem Pix na máquina; nota "regra do site".
- B-D11 ton-e-confiavel: quatro cuidados, coerente.
- B-D12 erros-e-resetar: orientação mais comum é repetir.
- B-D13 erros-e-resetar: Android com TN-F068.
- B-D14 transparencia: palavra-chave em qualquer plataforma, inclui Pagar.me.
- B-D15 transparencia: sem vendas anteriores.
- B-D16 TN-F122: trecho completo com tempo de resposta.
- B-D17 nao-liga / primeiros-passos: botão como leitura do site.
- B-D18 primeiros-passos: senha 000000 ou 123456.
- B-D19 sem-cnpj: legalmente capaz.
- B-D20 conta-bloqueada: TN-F183 e TN-F167 separadas.
