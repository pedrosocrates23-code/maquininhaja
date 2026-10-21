"""Gera src/assets/img/mockup-sobra.png: três celulares com as telas do SIMULADOR do site (não é o app da Ton).

Moldura: design/imagens-fonte/mockup-celulares-vazios.png (gerada no Codex: celulares de frente, telas em magenta
#FF00FF chapadas, fundo branco, sem marca). As telas são desenhadas aqui com os números de src/data/taxas.json,
então o mockup se regenera quando a taxa mudar:  python scripts/gerar_mockup_sobra.py
A diretriz de marca da Ton proíbe reproduzir a interface/identidade dela, por isso nada aqui imita o app da Ton.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOLDURA = os.path.join(RAIZ, 'design', 'imagens-fonte', 'mockup-celulares-vazios.png')
FONTE = os.path.join(RAIZ, 'design', 'fontes', 'Nunito[wght].ttf')
SAIDA = os.path.join(RAIZ, 'src', 'assets', 'img', 'mockup-sobra.png')
VERDE, VERMELHO, FUNDO, TXT, MUDO = (0, 215, 0), (255, 90, 79), (10, 10, 10), (255, 255, 255), (170, 176, 170)
S = 3  # supersampling das telas

T = json.load(open(os.path.join(RAIZ, 'src', 'data', 'taxas.json'), encoding='utf-8'))
F = {f['id']: f for f in T['faixas']}
promo_d1 = F['promo']['prazos']['d1']['debito']
base_d1 = F['ate3k']['prazos']['d1']['debito']
base_nh = F['ate3k']['prazos']['na_hora']['debito']


def brl(v):
    return 'R$ ' + f'{v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')


def pct(v):
    return f'{v:.2f}'.replace('.', ',') + '%'


def fonte(px, peso=600):
    f = ImageFont.truetype(FONTE, px * S)
    try:
        f.set_variation_by_axes([peso])
    except Exception:
        pass
    return f


def barra(d, x, y, w, h, taxa):
    r = h // 2
    d.rounded_rectangle((x, y, x + w, y + h), radius=r, fill=(38, 40, 38))
    fw = int(w * (100 - taxa) / 100)
    d.rounded_rectangle((x, y, x + fw, y + h), radius=r, fill=VERDE)
    d.rectangle((x + fw, y, x + fw + max(int(w * taxa / 100), 5 * S), y + h), fill=VERMELHO)


def cabecalho(d, W, titulo):
    d.rounded_rectangle((18 * S, 46 * S, W - 18 * S, 64 * S), radius=9 * S, fill=(30, 33, 30))
    d.text((W // 2, 55 * S), 'SIMULAÇÃO DO SITE', font=fonte(8, 800), fill=VERDE, anchor='mm')
    d.text((18 * S, 84 * S), titulo, font=fonte(15, 800), fill=TXT)


def tela_centro(W, H):
    im = Image.new('RGB', (W, H), FUNDO); d = ImageDraw.Draw(im)
    cabecalho(d, W, 'Venda de R$ 100')
    d.text((18 * S, 106 * S), 'Débito, recebendo em 1 dia útil', font=fonte(10, 500), fill=MUDO)
    y = 170 * S
    for rot, sub, taxa in (('Mês 1', 'promocional', promo_d1), ('Mês 2', 'faixa até R$ 3 mil', base_d1)):
        d.text((18 * S, y), rot, font=fonte(15, 800), fill=TXT)
        d.text((W - 18 * S, y + 3 * S), sub, font=fonte(10, 500), fill=MUDO, anchor='ra')
        d.text((18 * S, y + 36 * S), 'Sobra', font=fonte(12, 600), fill=MUDO)
        d.text((W - 18 * S, y + 24 * S), brl(100 - taxa), font=fonte(34, 900), fill=VERDE, anchor='ra')
        barra(d, 18 * S, y + 82 * S, W - 36 * S, 18 * S, taxa)
        d.text((18 * S, y + 110 * S), f'Taxa de {pct(taxa)}', font=fonte(11, 700), fill=VERMELHO)
        y += 218 * S
    d.text((W // 2, H - 52 * S), 'Ton Mega+, cliente novo', font=fonte(8, 500), fill=MUDO, anchor='mm')
    d.text((W // 2, H - 40 * S), 'Conferido em 13/10/2026', font=fonte(8, 500), fill=MUDO, anchor='mm')
    return im


def tela_esq(W, H):
    im = Image.new('RGB', (W, H), FUNDO); d = ImageDraw.Draw(im)
    cabecalho(d, W, 'R$ 3.000 no débito')
    d.text((18 * S, 106 * S), 'Quanto vai de taxa no mês', font=fonte(10, 500), fill=MUDO)
    t1, t2 = 3000 * promo_d1 / 100, 3000 * base_d1 / 100
    y = 170 * S
    for rot, v, cor in (('Mês 1', t1, VERDE), ('Mês 2', t2, VERMELHO)):
        d.text((18 * S, y), rot, font=fonte(14, 800), fill=TXT)
        d.text((18 * S, y + 26 * S), brl(v), font=fonte(30, 900), fill=cor)
        y += 120 * S
    d.line((18 * S, y, W - 18 * S, y), fill=(50, 54, 50), width=S)
    d.text((18 * S, y + 26 * S), 'Diferença', font=fonte(12, 600), fill=MUDO)
    d.text((18 * S, y + 52 * S), brl(t2 - t1), font=fonte(28, 900), fill=TXT)
    d.text((18 * S, H - 62 * S), 'Faixa até R$ 3 mil,', font=fonte(8, 500), fill=MUDO)
    d.text((18 * S, H - 50 * S), '1 dia útil.', font=fonte(8, 500), fill=MUDO)
    return im


def tela_dir(W, H):
    im = Image.new('RGB', (W, H), FUNDO); d = ImageDraw.Draw(im)
    cabecalho(d, W, 'Na hora ou 1 dia?')
    d.text((18 * S, 106 * S), 'Débito, faixa até R$ 3 mil', font=fonte(10, 500), fill=MUDO)
    y = 170 * S
    for rot, taxa in (('Na hora', base_nh), ('1 dia útil', base_d1)):
        d.text((18 * S, y), rot, font=fonte(14, 800), fill=TXT)
        d.text((W - 18 * S, y + 2 * S), pct(taxa), font=fonte(13, 800), fill=VERMELHO, anchor='ra')
        d.text((18 * S, y + 28 * S), 'Sobra ' + brl(100 - taxa), font=fonte(20, 900), fill=VERDE)
        barra(d, 18 * S, y + 70 * S, W - 36 * S, 14 * S, taxa)
        y += 130 * S
    d.text((18 * S, y + 10 * S), 'Receber mais rápido', font=fonte(11, 500), fill=MUDO)
    d.text((18 * S, y + 28 * S), 'custa mais por venda.', font=fonte(11, 500), fill=MUDO)
    return im


def main():
    moldura = Image.open(MOLDURA).convert('RGB')
    a = np.array(moldura).astype(int)
    mag = (a[:, :, 0] > 200) & (a[:, :, 1] < 90) & (a[:, :, 2] > 200)
    lab, n = ndi.label(mag)
    caixas = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(ys) > 5000:
            caixas.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, i))
    caixas.sort(key=lambda c: c[0])
    if len(caixas) != 3:
        sys.exit(f'esperava 3 telas magenta, achei {len(caixas)}')
    telas = [tela_esq, tela_centro, tela_dir]
    out = moldura.copy()
    for (x0, y0, x1, y1, i), fn in zip(caixas, telas):
        w, h = x1 - x0, y1 - y0
        ui = fn(w * S, h * S)
        ui = ui.resize((w, h), Image.LANCZOS)
        m = Image.fromarray(((lab[y0:y1, x0:x1] == i) * 255).astype('uint8'))
        # tira o halo magenta da borda da máscara
        m = Image.fromarray(ndi.binary_erosion(np.array(m) > 0, iterations=4).astype('uint8') * 255)
        out.paste(ui, (x0, y0), m)
    # sobra de franja magenta nas bordas da tela e da ilha da câmera: pinta com o fundo da tela
    o = np.array(out).astype(int)
    franja = (o[:, :, 0] - o[:, :, 1] > 60) & (o[:, :, 2] - o[:, :, 1] > 60)
    franja = ndi.binary_dilation(franja, iterations=1)
    o[franja & ((o[:, :, 0] - o[:, :, 1] > 25) & (o[:, :, 2] - o[:, :, 1] > 25))] = FUNDO
    out = Image.fromarray(o.astype('uint8'))
    # fundo branco -> transparente (só o que se liga às bordas)
    arr = np.array(out)
    quase_branco = (arr > 244).all(axis=2)
    lab2, _ = ndi.label(quase_branco)
    ext = set(np.unique(np.concatenate([lab2[0], lab2[-1], lab2[:, 0], lab2[:, -1]]))) - {0}
    fundo = np.isin(lab2, list(ext))
    alfa = np.where(fundo, 0, 255).astype('uint8')
    alfa = ndi.gaussian_filter(alfa.astype(float), 0.8).astype('uint8')
    rgba = Image.fromarray(np.dstack([arr, alfa]), 'RGBA')
    bbox = rgba.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    pad = 24
    bbox = (max(bbox[0] - pad, 0), max(bbox[1] - pad, 0), min(bbox[2] + pad, rgba.width), min(bbox[3] + pad, rgba.height))
    rgba.crop(bbox).save(SAIDA, optimize=True)
    print('ok', SAIDA, rgba.crop(bbox).size)


main()
