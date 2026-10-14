# -*- coding: utf-8 -*-
"""Gera src/data/taxas.json e src/data/fontes.json a partir da pesquisa da Ton.

Fonte da verdade: clients/maquininhas/ton/pesquisa.json e os ledgers evidencias.md
(ton e mercado). Rodar de novo sempre que a pesquisa for atualizada:

    python scripts/sync_dados.py
"""
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

AQUI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(AQUI)
PESQ = os.path.normpath(os.path.join(SITE, '..', 'clients', 'maquininhas'))
SAIDA = os.path.join(SITE, 'src', 'data')


def pct(s):
    """'3,97%' -> 3.97 ; aceita '0,57% (Visa/Mastercard)'."""
    m = re.search(r'(\d+),(\d+)\s*%', str(s))
    if not m:
        raise ValueError(f'percentual ilegível: {s!r}')
    return float(f'{m.group(1)}.{m.group(2)}')


def ledger(origem, prefixo):
    out = {}
    for l in open(os.path.join(PESQ, origem, 'evidencias.md'), encoding='utf-8'):
        if not l.startswith('| F'):
            continue
        cols = [c.strip() for c in l.strip().strip('|').split(' | ')]
        if len(cols) < 5 or not re.match(r'^F[-\w]*\d', cols[0]):
            continue
        fid, url, data, trecho = cols[0], cols[1], cols[2], cols[-1]
        # Travessão literal da fonte não vai para a página (regra da casa): o trecho é cortado
        # antes dele, com reticências entre colchetes. O texto completo segue no ledger.
        if ' — ' in trecho:
            trecho = trecho.split(' — ')[0] + ' […]'
        out[f'{prefixo}-{fid}'] = {'url': url, 'data': data, 'trecho': trecho[:800]}
    return out


FAIXAS = {
    'Ton Mega+ | Período Promocional': ('promo', 'Período promocional (30 dias ou R$ 5 mil)', 0, 5000),
    'Ton Mega+ | até R$ 3 mil': ('ate3k', 'Até R$ 3 mil por mês', 0, 3000),
    'Ton Mega+ | de R$ 3 mil a R$ 6 mil': ('3a6k', 'De R$ 3 mil a R$ 6 mil', 3000, 6000),
    'Ton Mega+ | de R$ 6 mil a R$ 10 mil': ('6a10k', 'De R$ 6 mil a R$ 10 mil', 6000, 10000),
    'Ton Mega+ | de R$ 10 mil a R$ 30 mil': ('10a30k', 'De R$ 10 mil a R$ 30 mil', 10000, 30000),
    'Ton Mega+ | acima de R$ 30 mil': ('30k', 'Acima de R$ 30 mil', 30000, None),
    'Ton Mega+ | TapTon': ('tapton', 'TapTon (celular como maquininha)', 0, None),
    'Ton Mega+ | Link de Pagamento': ('link', 'Link de Pagamento', 0, None),
}
PRAZO = {'Na hora': 'na_hora', '1 dia útil': 'd1', '14 dias': 'd14', '30 dias': 'd30'}


def main():
    p = json.load(open(os.path.join(PESQ, 'ton', 'pesquisa.json'), encoding='utf-8'))
    faixas = {}
    for pl in p['planos_taxas']:
        if pl['plano'] not in FAIXAS:
            continue
        chave, rotulo, minimo, maximo = FAIXAS[pl['plano']]
        f = faixas.setdefault(chave, {'id': chave, 'rotulo': rotulo, 'min': minimo, 'max': maximo,
                                      'fontes': sorted(set(f'TN-{x}' for x in pl['fontes'])),
                                      'atualizado_json': pl.get('atualizado_em_json', ''),
                                      'prazos': {}})
        o = pl['outras']
        f['prazos'][PRAZO[pl['prazo_recebimento']]] = {
            'debito': pct(pl['debito']),
            'credito1x': pct(pl['credito_vista']),
            'parcelas': {k: pct(v) for k, v in pl['parcelado'].items()},
            'elo_amex': {'debito': pct(o['elo_debito']), 'credito1x': pct(o['elo_credito_1x']),
                         'p12': pct(o['elo_12x'])},
        }
    ordem = ['promo', 'ate3k', '3a6k', '6a10k', '10a30k', '30k', 'tapton', 'link']
    taxas = {
        'coletado_em': p['data_coleta'],
        'url_oficial': 'https://www.ton.com.br/planos-e-taxas',
        'regulamento': 'https://documentos.ton.com.br/regulamento-tonmega-tier-mar26.pdf',
        'pix_regra': 'Pix QR Code no equipamento: 0% nos primeiros 30 dias; depois 0% se houver chave Pix '
                     'cadastrada (CPF, CNPJ ou telefone), senão 0,49% por venda.',
        'pix_fontes': ['TN-F010', 'TN-F072'],
        'faixas': [faixas[k] for k in ordem if k in faixas],
    }
    os.makedirs(SAIDA, exist_ok=True)
    json.dump(taxas, open(os.path.join(SAIDA, 'taxas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    fontes = {}
    fontes.update(ledger('ton', 'TN'))
    fontes.update(ledger('mercado', 'MK'))
    json.dump(fontes, open(os.path.join(SAIDA, 'fontes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'taxas.json: {len(taxas["faixas"])} faixas | fontes.json: {len(fontes)} fontes')


if __name__ == '__main__':
    main()
