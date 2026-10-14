# -*- coding: utf-8 -*-
"""Monta o mockup de estúdio de cada maquininha a partir da foto oficial da Ton.

    python scripts/gerar_mockups.py

Os pixels do aparelho são os da foto oficial (design/imagens-fonte/ton-oficial), só redimensionados:
nada é redesenhado. Em volta entram fundo, pedestal e sombras. Saem dois formatos por modelo,
em PNG sem perda, para o Astro gerar AVIF/WebP:
  src/assets/img/mockup-<slug>-card.png  (1200 x 984, proporção do card 1 : 0,82)
  src/assets/img/mockup-<slug>.png       (1200 x 1200, topo da página do modelo e OG)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTE = os.path.join(SITE, 'design', 'imagens-fonte', 'ton-oficial')
SAIDA = os.path.join(SITE, 'src', 'assets', 'img')

MODELOS = {
    't1': 'maquininha-t1-front.webp',
    't2': 'maquininha-t2-front.png',
    't3': 'maquininha-t3-front.webp',
    't3-smart': 'maquininha-t3-smart-front.webp',
}

# Fundo claro do site (#f6f6f1) e o verde da Ton (#00D700), só como luz ambiente.
FUNDO_TOPO = (250, 250, 246)
FUNDO_BASE = (234, 234, 226)
PEDESTAL_TAMPO = (243, 243, 237)
PEDESTAL_LADO_CLARO = (226, 226, 218)
PEDESTAL_LADO_ESCURO = (206, 206, 197)
VERDE = (0, 215, 0)


def gradiente_vertical(w, h, c1, c2):
    g = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / max(h - 1, 1)
        g.putpixel((0, y), tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)))
    return g.resize((w, h))


def gradiente_horizontal(w, h, c1, c2, c3):
    """claro nas bordas -> c2 no centro -> c3; dá volume ao cilindro do pedestal."""
    g = Image.new('RGB', (w, 1))
    for x in range(w):
        t = x / max(w - 1, 1)
        if t < 0.35:
            u = t / 0.35
            c = tuple(round(c1[i] + (c2[i] - c1[i]) * u) for i in range(3))
        else:
            u = (t - 0.35) / 0.65
            c = tuple(round(c2[i] + (c3[i] - c2[i]) * u) for i in range(3))
        g.putpixel((x, 0), c)
    return g.resize((w, h))


def brilho(w, h, cx, cy, raio, cor, alfa):
    camada = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    d.ellipse([cx - raio, cy - raio, cx + raio, cy + raio], fill=cor + (alfa,))
    return camada.filter(ImageFilter.GaussianBlur(raio * 0.45))


def mockup(foto, W, H, altura_aparelho):
    ap = Image.open(os.path.join(FONTE, foto)).convert('RGBA')
    ap = ap.crop(ap.getchannel('A').getbbox())
    r = altura_aparelho / ap.height
    ap = ap.resize((round(ap.width * r), round(ap.height * r)), Image.LANCZOS)

    cena = gradiente_vertical(W, H, FUNDO_TOPO, FUNDO_BASE).convert('RGBA')
    cx = W // 2

    # pedestal: tampo elíptico + lateral cilíndrica
    ped_w = round(max(ap.width * 1.9, W * 0.62))
    ped_rx = ped_w // 2
    ped_ry = round(ped_rx * 0.16)
    ped_alt = round(H * 0.07)
    base_y = H - round(H * 0.1)               # onde termina a lateral
    topo_y = base_y - ped_alt                   # centro da elipse do tampo

    # luz verde suave atrás do aparelho
    cena.alpha_composite(brilho(W, H, cx, topo_y - altura_aparelho // 2, round(altura_aparelho * 0.42), VERDE, 38))

    # sombra do pedestal no chão
    sombra_ped = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sombra_ped).ellipse(
        [cx - ped_rx * 1.05, base_y - ped_ry * 0.7, cx + ped_rx * 1.05, base_y + ped_ry * 1.3], fill=(40, 40, 30, 70)
    )
    cena.alpha_composite(sombra_ped.filter(ImageFilter.GaussianBlur(ped_ry * 0.9)))

    lado = gradiente_horizontal(ped_w, ped_alt + ped_ry, PEDESTAL_LADO_CLARO, PEDESTAL_TAMPO, PEDESTAL_LADO_ESCURO).convert('RGBA')
    mascara = Image.new('L', (ped_w, ped_alt + ped_ry), 0)
    dm = ImageDraw.Draw(mascara)
    dm.rectangle([0, 0, ped_w, ped_alt], fill=255)
    dm.ellipse([0, ped_alt - ped_ry, ped_w - 1, ped_alt + ped_ry - 1], fill=255)
    cena.paste(lado, (cx - ped_rx, topo_y), mascara)

    tampo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(tampo).ellipse([cx - ped_rx, topo_y - ped_ry, cx + ped_rx, topo_y + ped_ry], fill=PEDESTAL_TAMPO + (255,))
    cena.alpha_composite(tampo)
    # filete de luz na borda do tampo
    filete = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(filete).ellipse([cx - ped_rx, topo_y - ped_ry, cx + ped_rx, topo_y + ped_ry], outline=(255, 255, 255, 200), width=2)
    cena.alpha_composite(filete)

    # aparelho em pé no centro do tampo
    ax = cx - ap.width // 2
    ay = topo_y + round(ped_ry * 0.15) - ap.height

    # sombra projetada (silhueta do próprio aparelho, desfocada, deslocada para trás)
    silh = Image.new('RGBA', ap.size, (25, 30, 20, 0))
    silh.putalpha(ap.getchannel('A').point(lambda v: round(v * 0.32)))
    sombra = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sombra.alpha_composite(silh, (ax + round(ap.width * 0.06), ay + round(ap.height * 0.02)))
    cena.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(round(ap.width * 0.06))))

    # sombra de contato no tampo
    contato = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    base_ap = topo_y + round(ped_ry * 0.15)
    ImageDraw.Draw(contato).ellipse(
        [ax + ap.width * 0.04, base_ap - ped_ry * 0.22, ax + ap.width * 0.96, base_ap + ped_ry * 0.32], fill=(20, 25, 15, 150)
    )
    cena.alpha_composite(contato.filter(ImageFilter.GaussianBlur(max(4, round(ped_ry * 0.18)))))

    cena.alpha_composite(ap, (ax, ay))
    return cena.convert('RGB')


def main():
    for slug, foto in MODELOS.items():
        mockup(foto, 1200, 984, 640).save(os.path.join(SAIDA, f'mockup-{slug}-card.png'), optimize=True)
        mockup(foto, 1200, 1200, 800).save(os.path.join(SAIDA, f'mockup-{slug}.png'), optimize=True)
    print(f'{len(MODELOS) * 2} mockups em src/assets/img/')


if __name__ == '__main__':
    main()
