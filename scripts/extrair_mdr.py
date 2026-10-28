# -*- coding: utf-8 -*-
"""Gera src/data/taxas-bandeiras.json: taxa do Ton Mega+ por faixa, prazo, BANDEIRA e parcela.

O taxas.json (sync_dados.py) guarda Visa/Mastercard completo e só três números de Elo/Amex.
O simulador por venda (/quanto-custa/simulador-de-taxas/) precisa das quatro bandeiras de 1x a
21x, que a Ton publica no JSON embutido do HTML de https://www.ton.com.br/planos-e-taxas.

    python scripts/extrair_mdr.py                 # baixa a página agora (curl) e grava o JSON
    python scripts/extrair_mdr.py <arquivo.html>  # usa um HTML já baixado

O HTML bruto fica em clients/maquininhas/ton/raw/planos-e-taxas_<data>.html (prova da coleta).
Reprova (exit 1) se Visa/Mastercard divergirem do taxas.json: as duas fontes têm de concordar.
"""
import datetime
import json
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.normpath(os.path.join(SITE, '..', 'clients', 'maquininhas', 'ton', 'raw'))
URL = 'https://www.ton.com.br/planos-e-taxas'

FAIXAS = {
    'Ton Mega+ | Período Promocional': 'promo',
    'Ton Mega+ | até R$ 3 mil': 'ate3k',
    'Ton Mega+ | de R$ 3 mil a R$ 6 mil': '3a6k',
    'Ton Mega+ | de R$ 6 mil a R$ 10 mil': '6a10k',
    'Ton Mega+ | de R$ 10 mil a R$ 30 mil': '10a30k',
    'Ton Mega+ | acima de R$ 30 mil': '30k',
}
PRAZO = {0: 'na_hora', 1: 'd1'}
BANDEIRAS = ('visa', 'mastercard', 'elo', 'amex')


def baixar():
    hoje = datetime.date.today().isoformat()
    destino = os.path.join(RAW, f'planos-e-taxas_{hoje}.html')
    subprocess.run(['curl', '-sL', '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0', '-o', destino, URL], check=True)
    return destino, hoje


def objeto_em(s, i):
    """Devolve o objeto JSON que começa na chave '{' de índice i (contando chaves fora de strings)."""
    prof, em_str, esc = 0, False, False
    for j in range(i, len(s)):
        c = s[j]
        if em_str:
            esc = (c == '\\') and not esc
            if c == '"' and not esc:
                em_str = False
            continue
        if c == '"':
            em_str = True
        elif c == '{':
            prof += 1
        elif c == '}':
            prof -= 1
            if prof == 0:
                return json.loads(s[i:j + 1])
    raise ValueError('objeto JSON sem fechamento')


def planos(html):
    s = html.replace('\\"', '"').replace('\\\\', '\\')
    # O objeto do plano inteiro não é JSON válido depois de desescapar (a descrição traz HTML com
    # aspas). Só o array "conditions" (números e nomes curtos) é lido como JSON.
    # A ordem das chaves muda de um plano para outro (nos primeiros o nome vem antes das taxas, nos
    # últimos depois), mas os planos aparecem na mesma ordem nas duas listas: o k-ésimo nome é dono
    # do k-ésimo bloco de taxas ("conditions" com anticipation_delay; o modal de texto também tem
    # uma chave "conditions", sem taxa). A conferência com o taxas.json no main() pega qualquer
    # desalinhamento.
    vistos = {}
    nomes = [m.group(1) for m in re.finditer(r'"commercial_name":"([^"]+)"', s)]
    conds = [m.start() for m in re.finditer(r'"conditions":\[\{"anticipation_delay"', s)]
    if len(nomes) != len(conds):
        print(f'FALHOU: {len(nomes)} planos e {len(conds)} blocos de taxa; o formato da página mudou')
        sys.exit(1)
    for nome, c in zip(nomes, conds):
        if nome not in FAIXAS or nome in vistos:
            continue
        trecho = s[c: c + 40000]
        a = len('"conditions":')
        prof = 0
        for j in range(a, len(trecho)):
            if trecho[j] == '[':
                prof += 1
            elif trecho[j] == ']':
                prof -= 1
                if prof == 0:
                    break
        try:
            conds = json.loads(trecho[a:j + 1])
        except json.JSONDecodeError:
            continue
        upd = re.search(r'"updated_at":"([^"]+)"', trecho)
        vistos[nome] = {'conditions': conds, 'updated_at': upd.group(1) if upd else None}
    return vistos


def main():
    if len(sys.argv) > 1:
        arq, data = sys.argv[1], datetime.date.fromtimestamp(os.path.getmtime(sys.argv[1])).isoformat()
    else:
        arq, data = baixar()
    html = open(arq, encoding='utf-8', errors='ignore').read()
    achados = planos(html)
    faltam = [n for n in FAIXAS if n not in achados]
    if faltam:
        print('FALHOU: planos não encontrados no HTML:', faltam)
        sys.exit(1)

    out = {'coletado_em': data, 'url_oficial': URL, 'arquivo_bruto': os.path.basename(arq), 'atualizado_ton': None, 'faixas': {}}
    datas = []
    for nome, o in achados.items():
        fid = FAIXAS[nome]
        datas.append(o.get('updated_at') or '')
        por_prazo = {}
        for cond in o['conditions']:
            pz = PRAZO.get(cond.get('anticipation_delay'))
            if not pz:
                continue
            b = {}
            for mdr in cond['mdrs']:
                band = mdr['card_brand']
                if band not in BANDEIRAS:
                    continue
                d = b.setdefault(band, {'debito': None, 'credito': {}})
                if mdr['payment_method'] == 'debit_card':
                    d['debito'] = mdr['installments'][0]['mdr']
                elif mdr['payment_method'] == 'credit_card':
                    d['credito'] = {str(x['installment']): x['mdr'] for x in mdr['installments']}
            por_prazo[pz] = b
        out['faixas'][fid] = por_prazo
    out['atualizado_ton'] = max(datas) if datas else None

    # Conferência cruzada com o taxas.json (Visa e Mastercard).
    base = {f['id']: f for f in json.load(open(os.path.join(SITE, 'src', 'data', 'taxas.json'), encoding='utf-8'))['faixas']}
    erros = []
    for fid, prazos in out['faixas'].items():
        for pz, bands in prazos.items():
            ref = base[fid]['prazos'][pz]
            for band in ('visa', 'mastercard'):
                t = bands.get(band)
                if not t:
                    erros.append(f'{fid}/{pz}: sem {band}')
                    continue
                if t['debito'] != ref['debito'] or t['credito'].get('1') != ref['credito1x']:
                    erros.append(f'{fid}/{pz}/{band}: débito/crédito diferem do taxas.json')
                for n, v in ref['parcelas'].items():
                    if t['credito'].get(n) != v:
                        erros.append(f'{fid}/{pz}/{band}/{n}x: {t["credito"].get(n)} x taxas.json {v}')
            for band in ('elo', 'amex'):
                t, e = bands.get(band), ref['elo_amex']
                if not t or (t['debito'], t['credito'].get('1'), t['credito'].get('12')) != (e['debito'], e['credito1x'], e['p12']):
                    erros.append(f'{fid}/{pz}/{band}: débito, 1x ou 12x diferem do elo_amex do taxas.json')
    if erros:
        print('FALHOU: a página oficial mudou em relação ao taxas.json. Rode scripts/sync_dados.py depois de atualizar a pesquisa.')
        for e in erros[:20]:
            print('  ', e)
        sys.exit(1)

    destino = os.path.join(SITE, 'src', 'data', 'taxas-bandeiras.json')
    json.dump(out, open(destino, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'OK {destino} ({len(out["faixas"])} faixas; Ton atualizou em {out["atualizado_ton"]}; Visa/Mastercard batem com taxas.json)')


if __name__ == '__main__':
    main()
