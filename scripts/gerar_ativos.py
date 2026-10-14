# -*- coding: utf-8 -*-
"""Gera ícones, manifest e imagens OG (1200x630) do site.

    python scripts/gerar_ativos.py

As imagens OG por página saem de OG_PAGINAS (título curto + foto de seção).
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(SITE, 'public')
IMG = os.path.join(SITE, 'src', 'assets', 'img')
FON = os.path.join(SITE, 'design', 'fontes')

VERDE = (0, 215, 0)
PRETO = (11, 11, 11)
CLARO = (244, 244, 238)
CINZA = (184, 184, 174)


def marca(tam):
    """Desenha a marca (maquininha estilizada) em tam x tam, mesmo desenho do Marca.astro."""
    s = tam / 40
    im = Image.new('RGBA', (tam, tam), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, tam - 1, tam - 1], radius=11 * s, fill=VERDE)
    d.rounded_rectangle([11 * s, 8 * s, 29 * s, 32 * s], radius=4 * s, fill=PRETO)
    d.rounded_rectangle([14 * s, 11 * s, 26 * s, 19 * s], radius=1.5 * s, fill=VERDE)
    for cx in (16, 20, 24):
        d.ellipse([(cx - 1.6) * s, (24 - 1.6) * s, (cx + 1.6) * s, (24 + 1.6) * s], fill=VERDE)
    d.rounded_rectangle([15 * s, 28 * s, 25 * s, 29.8 * s], radius=0.9 * s, fill=VERDE)
    return im


def icones():
    marca(512).save(os.path.join(PUB, 'icon-512.png'))
    marca(192).save(os.path.join(PUB, 'icon-192.png'))
    a = Image.new('RGB', (180, 180), PRETO)
    a.paste(marca(140), (20, 20), marca(140))
    a.save(os.path.join(PUB, 'apple-touch-icon.png'))
    marca(64).save(os.path.join(PUB, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">'
        '<rect width="40" height="40" rx="11" fill="#00D700"/>'
        '<rect x="11" y="8" width="18" height="24" rx="4" fill="#0B0B0B"/>'
        '<rect x="14" y="11" width="12" height="8" rx="1.5" fill="#00D700"/>'
        '<circle cx="16" cy="24" r="1.6" fill="#00D700"/><circle cx="20" cy="24" r="1.6" fill="#00D700"/>'
        '<circle cx="24" cy="24" r="1.6" fill="#00D700"/>'
        '<rect x="15" y="28" width="10" height="1.8" rx=".9" fill="#00D700"/></svg>'
    )
    open(os.path.join(PUB, 'favicon.svg'), 'w', encoding='utf-8').write(svg)
    manifest = {
        'name': 'Maquininha Já',
        'short_name': 'Maquininha Já',
        'description': 'Site independente sobre as maquininhas Ton.',
        'lang': 'pt-BR',
        'start_url': '/',
        'display': 'standalone',
        'background_color': '#fcfcf7',
        'theme_color': '#0b0b0b',
        'icons': [
            {'src': '/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
            {'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
        ],
    }
    json.dump(manifest, open(os.path.join(PUB, 'site.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def nunito(tamanho, peso):
    """Nunito variável (OFL), a mesma família do site, no peso pedido."""
    f = ImageFont.truetype(os.path.join(FON, 'Nunito[wght].ttf'), tamanho)
    f.set_variation_by_axes([peso])
    return f


def quebra(d, texto, fonte, largura):
    linhas, atual = [], ''
    for p in texto.split():
        t = (atual + ' ' + p).strip()
        if d.textlength(t, font=fonte) <= largura:
            atual = t
        else:
            linhas.append(atual)
            atual = p
    linhas.append(atual)
    return linhas


def og(titulo, rotulo, foto, saida):
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), PRETO)
    f = Image.open(os.path.join(IMG, foto))
    alvo_w, alvo_h = 520, H
    if f.mode in ('RGBA', 'LA', 'P'):
        # foto oficial do aparelho (fundo transparente): inteira, sobre painel claro, sem corte
        f = f.convert('RGBA')
        painel = Image.new('RGBA', (alvo_w, alvo_h), (246, 246, 241, 255))
        r = min((alvo_w - 80) / f.width, (alvo_h - 80) / f.height)
        f = f.resize((int(f.width * r), int(f.height * r)), Image.LANCZOS)
        painel.alpha_composite(f, ((alvo_w - f.width) // 2, (alvo_h - f.height) // 2))
        f = painel.convert('RGB')
    else:
        f = f.convert('RGB')
        r = max(alvo_w / f.width, alvo_h / f.height)
        f = f.resize((int(f.width * r), int(f.height * r)), Image.LANCZOS)
        x0 = (f.width - alvo_w) // 2
        f = f.crop((x0, 0, x0 + alvo_w, alvo_h))
    im.paste(f, (W - alvo_w, 0))
    d = ImageDraw.Draw(im)
    serif = nunito(60, 500)
    sans = nunito(24, 700)
    m = marca(56)
    im.paste(m, (64, 60), m)
    d.text((136, 72), 'Maquininha Já', font=nunito(38, 700), fill=CLARO)
    # rótulo em pílula verde
    lw = d.textlength(rotulo, font=sans)
    d.rounded_rectangle([64, 170, 64 + lw + 36, 214], radius=22, fill=VERDE)
    d.text((82, 178), rotulo, font=sans, fill=PRETO)
    y = 250
    for linha in quebra(d, titulo, serif, 560)[:4]:
        d.text((64, y), linha, font=serif, fill=CLARO)
        y += 70
    pe = nunito(22, 500)
    d.text((64, H - 64), 'Site independente. Não somos a Ton.', font=pe, fill=CINZA)
    os.makedirs(os.path.dirname(saida), exist_ok=True)
    im.save(saida, 'JPEG', quality=86, optimize=True, progressive=True)


# slug do arquivo -> (título, rótulo, foto)
OG_PAGINAS = {
    'padrao': ('Qual maquininha Ton é a sua?', 'Modelos, taxas e qual escolher', 'hero.jpg'),
    'modelos': ('T1, T2, T3 e T3 Smart lado a lado', 'Modelos da Ton', 'mockup-t3.png'),
    't1': ('Ton T1: a mais barata, que depende do celular', 'Ficha do modelo', 'mockup-t1.png'),
    't2': ('Ton T2: chip próprio, sem impressora', 'Ficha do modelo', 'mockup-t2.png'),
    't3': ('Ton T3: impressora, chip e parcelado em 21x', 'Ficha do modelo', 'mockup-t3.png'),
    't3-smart': ('Ton T3 Smart: a Android da Ton', 'Ficha do modelo', 'mockup-t3-smart.png'),
    'quanto-custa': ('Quanto custa vender com a Ton, faixa por faixa', 'Taxas Ton Mega+', 'secao-calculadora.jpg'),
    'calculadora': ('Quanto sobra de cada venda no mês 2', 'Calculadora de taxas', 'secao-calculadora.jpg'),
    'ajuda': ('Maquininha Ton com problema? Começa por aqui', 'Ajuda', 'secao-ajuda.jpg'),
    'aprenda': ('Guias para vender com a maquininha Ton', 'Aprenda', 'secao-aprenda.jpg'),
    'renda-extra': ('Renda Extra Ton: como funciona e quanto paga', 'Programa de parceiros', 'secao-renda.jpg'),
    'institucional': ('Site independente. Não somos a Ton.', 'Sobre o site', 'secao-renda.jpg'),
}


def main():
    os.makedirs(PUB, exist_ok=True)
    icones()
    for slug, (t, r, foto) in OG_PAGINAS.items():
        og(t, r, foto, os.path.join(PUB, 'og', f'{slug}.jpg'))
    print(f'ícones + manifest + {len(OG_PAGINAS)} imagens OG em public/')


if __name__ == '__main__':
    main()
