"""Monta as imagens do banner do meio dos guias (src/components/BannerMeio.astro).

Cena: gerada pelo Codex (design/imagens-fonte/banner-meio/gerar_cenas.sh), sem aparelho e sem texto, e
ampliada no Magnific (Precision photo 2x) quando existir cena-<tipo>-magnific.png; senão usa a cena crua.
Aparelho: foto OFICIAL da Ton (design/imagens-fonte/ton-oficial/), colada por cima. IA nunca redesenha o aparelho.
O texto do banner é HTML, não vai na imagem.

    python scripts/gerar_banner_meio.py
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = Path(__file__).resolve().parent.parent
CENAS = RAIZ / 'design/imagens-fonte/banner-meio'
OFI = RAIZ / 'design/imagens-fonte/ton-oficial'
SAIDA = RAIZ / 'src/assets/img'
EXT = {'t1': 'webp', 't2': 'png', 't3': 'webp', 't3-smart': 'webp'}
W, H = 1600, 1067

# tipo -> (aparelhos da esquerda para a direita, altura do aparelho e linha da base em fração de H).
# A base é onde o aparelho encosta na superfície da cena (balcão ou mesa).
BANNERS = {
    'quiz': (['t3'], 0.50, 0.82),
    'calculadora': (['t3-smart'], 0.50, 0.84),
    'modelos': (['t1', 't2', 't3', 't3-smart'], 0.38, 0.80),
}


def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def aparelho(slug, altura):
    im = Image.open(OFI / f'maquininha-{slug}-front.{EXT[slug]}').convert('RGBA')
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    r = altura / im.height
    return im.resize((round(im.width * r), altura), Image.LANCZOS)


def colar(base, dev, x, y):
    """Sombra de contato suave + aparelho."""
    alfa = dev.split()[3]
    s = Image.new('RGBA', base.size, (0, 0, 0, 0))
    sombra = Image.new('RGBA', dev.size, (0, 0, 0, 0))
    sombra.putalpha(alfa.point(lambda v: int(v * 0.45)))
    s.alpha_composite(sombra, (x + 18, y + 26))
    base.alpha_composite(s.filter(ImageFilter.GaussianBlur(24)))
    base.alpha_composite(dev, (x, y))


def montar(tipo, modelos, altura, base):
    mag = CENAS / f'cena-{tipo}-magnific.png'
    cena = mag if mag.exists() else CENAS / f'cena-{tipo}.png'
    im = cover(Image.open(cena).convert('RGBA'), W, H)
    # aparelhos juntos no centro: o recorte do banner (object-fit: cover) corta as laterais
    devs = [aparelho(m, int(H * altura)) for m in modelos]
    gap = 16
    x = (W - sum(d.width for d in devs) - gap * (len(devs) - 1)) // 2
    for d in devs:
        colar(im, d, x, int(H * base) - d.height)
        x += d.width + gap
    destino = SAIDA / f'banner-meio-{tipo}.jpg'
    im.convert('RGB').save(destino, quality=88, optimize=True, progressive=True)
    print(f'ok {destino.name} <- {cena.name}')


for tipo, (modelos, altura, base) in BANNERS.items():
    montar(tipo, modelos, altura, base)
