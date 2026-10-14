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

## Logos das bandeiras (`bandeiras/`)

Baixados em 14/10/2026 da seção "Aceite mais de 50 bandeiras" de https://www.ton.com.br/maquininhas
(ledger TN-F074), SVG original sem edição, na ordem em que a Ton exibe. Base: `https://martech-web-cdn.stone.com.br/`.
Cópia usada pelo site em `src/assets/img/bandeiras/`. As marcas pertencem às respectivas bandeiras.

| Arquivo | Caminho na CDN |
|---|---|
| flag-mastercard.svg | incoming/ton/df654ffd-8034-433f-9bdc-6114011d6f29/flag-mastercard.svg |
| flag-visa.svg | incoming/ton/e6b249d6-d7e6-48aa-a84b-7723822fa8ef/flag-visa.svg |
| flag-elo.svg | incoming/ton/a25181f4-82d7-4534-a903-1aef38a21b6d/flag-elo.svg |
| flag-amex.svg | incoming/ton/bf9fb2ed-983d-4ed0-8c6e-7c1795ee18e4/flag-amex.svg |
| flag-pluxee.svg | incoming/ton/3a86c829-fb63-4d91-b181-57ba61c0d47c/flag-pluxee.svg |
| flag-ticket.svg | incoming/ton/0cdb0ba2-71fa-40c7-92e5-1d970a500179/flag-ticket.svg |
| flag-vr.svg | incoming/ton/28b5450d-9136-46f2-9ce2-bd4cb354dd78/flag-vr.svg |
| flag-alelo.svg | incoming/ton/046b85f2-beb0-403e-9f25-a0d1315ee44d/flag-alelo.svg |
| flag-goodcard.svg | incoming/ton/ffc3894d-8f67-43b6-9fe1-1f1c1be0ef75/flag-goodcard.svg |
| flag-personal.svg | incoming/ton/7d60e8e7-769a-44ee-8674-5e47a3c24357/flag-personal.svg |
| flag-banes.svg | incoming/ton/a3396956-980c-41ca-9a2c-ca8c6b8bce92/flag-banes.svg |
| flag-up.svg | incoming/ton/436f1ffb-d64c-4533-9ccc-e98bb5a6c2d4/flag-up.svg |
