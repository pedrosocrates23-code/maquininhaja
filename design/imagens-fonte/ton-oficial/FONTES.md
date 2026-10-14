# Fotos oficiais dos aparelhos Ton

Baixadas em 14/10/2026 das páginas de produto da Ton (`https://www.ton.com.br/maquininha/{t1,t2,t3,t3-smart}`),
que servem estes arquivos a partir do bucket abaixo. 720 x 1080 px, fundo transparente, é a maior resolução
publicada (a pasta `incoming/` devolve o mesmo arquivo ou 403).

Base: `https://sites-cms-deco-prd.s3.us-east-1.amazonaws.com/`

| Arquivo | Caminho no bucket |
|---|---|
| maquininha-t1-front.webp | optimized/ton/d31fd44d-6eaa-47f2-aa7e-dce6d7bf1b49/maquininha-t1-front.webp |
| maquininha-t1-left.webp | optimized/ton/cb71dfb2-86de-4a99-97da-a017e1b2761b/maquininha-t1-left.webp |
| maquininha-t1-right.webp | incoming/ton/93a3d8e2-65ea-4c6c-a3eb-00fcc603b347/maquininha-t1-right.webp |
| maquininha-t2-front.png | optimized/ton/c530d13a-9973-4f18-a0b4-a40cd3ef9809/maquininha-t2-front.png |
| maquininha-t2-left.png | optimized/ton/50ce36f1-c5bd-45c0-8add-36cb335f83f1/maquininha-t2-left.png |
| maquininha-t2-right.png | optimized/ton/7593d68c-85b3-4576-be4b-fe8824565778/maquininha-t2-right.png |
| maquininha-t3-front.webp | optimized/ton/f5b1c167-3647-4300-8fce-2d5fa4fb299b/maquininha-t3-front.webp |
| maquininha-t3-left.webp | optimized/ton/4176dfb4-bb0b-4908-91d6-b755c75b519b/maquininha-t3-left.webp |
| maquininha-t3-right.webp | optimized/ton/4dcf89f3-d51d-49d4-a82f-20fc91abf48a/maquininha-t3-right.webp |
| maquininha-t3-smart-front.webp | optimized/ton/1a46b36c-f43c-43c8-957f-d473b16ca974/maquininha-t3-smart-front.webp |
| maquininha-t3-smart-left.webp | optimized/ton/d94dd317-f0ff-4af6-8291-a27ad183f3b6/maquininha-t3-smart-left.webp |
| maquininha-t3-smart-right.webp | optimized/ton/d109918b-0c7e-4bf0-b016-e2202146e6de/maquininha-t3-smart-right.webp |

As vistas `-front` são copiadas sem reprocessar para `src/assets/img/modelo-*.{webp,png}`; o Astro gera
AVIF/WebP a partir delas. Não reencodar antes: o original já vem comprimido pela Ton.
