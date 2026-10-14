# -*- coding: utf-8 -*-
"""Gate determinístico de uma página MDX do site (antes do build e do QA adversarial).

    python scripts/validar_pagina.py src/content/paginas/ajuda/contato.mdx [outro.mdx ...]
    python scripts/validar_pagina.py --todas

Reprova (exit 1) se qualquer regra dura falhar. Regras:
  frontmatter (tamanhos, seção, fontes existentes), componentes permitidos e com props
  válidas, Fonte citada também no frontmatter, resumo-summarization no topo (40-60 palavras
  com <strong>), no máximo 3 links internos no corpo, piso/teto de palavras por seção,
  proibições da casa (travessão, emoji, fecho "Conclusão", experiência inventada,
  promessa de renda, falar como se fosse a Ton) e o gate de densidade do Redator 5.0.
"""
import glob
import json
import os
import re
import subprocess
import sys
import tempfile

import yaml

sys.stdout.reconfigure(encoding='utf-8')
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DENSIDADE = os.path.normpath(os.path.join(SITE, '..', 'squads', 'redator-5.0', 'pipeline', 'validate_density.py'))

FONTES = json.load(open(os.path.join(SITE, 'src', 'data', 'fontes.json'), encoding='utf-8'))
for f in glob.glob(os.path.join(SITE, 'src', 'data', 'fontes-extra', '*.json')):
    FONTES.update(json.load(open(f, encoding='utf-8')))
TAXAS = json.load(open(os.path.join(SITE, 'src', 'data', 'taxas.json'), encoding='utf-8'))
FAIXAS = {f['id']: f for f in TAXAS['faixas']}

PERMITIDOS = {'Parceria', 'Fragment', 'Fonte', 'Callout', 'CtaIndicacao', 'Taxa', 'Preco', 'TabelaParcelas', 'TabelaFaixas'}
SECOES = {'ajuda', 'aprenda', 'quanto-custa', 'modelos', 'renda-extra'}
PISO = {'ajuda': 650, 'aprenda': 1000, 'quanto-custa': 700, 'modelos': 700, 'renda-extra': 1000, 'analise': 600}
TETO = 2800
LINKS_INTERNOS_MAX = 3
CHAVES_LINK = set(json.load(open(os.path.join(SITE, 'src', 'data', 'links.json'), encoding='utf-8')))

PROIBIDO = [
    (r'—', 'travessão (D09)'),
    (r' – ', 'meia-risca entre espaços'),
    (r'[\U0001F300-\U0001FAFF☀-➿]', 'emoji'),
    (r'(?im)^#{2,3}\s*(conclus[aã]o|considera[cç][oõ]es finais|recapitulando|em resumo|resumo final|para fechar|para finalizar)', 'seção de fecho (R5-NOCLOSE)'),
    (r'(?i)\b(testamos|nosso teste|nossos testes|em nossos testes|no nosso teste|testei|usei por|comprei a|comprei uma)\b', 'afirma teste/uso próprio que não aconteceu'),
    (r'(?i)\b(já vi|eu já|a gente já|na minha experi[eê]ncia|aconteceu comigo)\b', 'experiência pessoal inventada'),
    (r'(?i)\bimagine (uma|um|que)\b', 'exemplo genérico inventado (N08)'),
    (r'(?i)(renda garantida|ganho garantido|ganhe at[eé] R\$ ?\d|fature at[eé]|dinheiro f[aá]cil|fique rico)', 'promessa de ganho'),
    (r'(?i)\b(n[oó]s da ton|aqui na ton|somos a ton\b|nosso atendimento|nossa central|nossas maquininhas)', 'fala como se fosse a Ton'),
    (r'(?i)\b(bora|sacou|saca s[oó]|dicazinha|rapidinha)\b', 'falsa coloquialidade (PT01/PT03)'),
    (r'(?i)\b(potencializar|viabilizar|alavancar)\b', 'verbo inflado (N01)'),
]


def palavras(t):
    return re.findall(r"[A-Za-zÀ-ÿ0-9][\wÀ-ÿ'%,.-]*", t)


def texto_corpo(corpo):
    t = re.sub(r'<Taxa[^>]*/>', '1,23%', corpo)
    t = re.sub(r'<Preco[^>]*/>', 'R$ 10,00', t)
    t = re.sub(r'<Fonte[^>]*/>', '', t)
    t = re.sub(r'<(TabelaParcelas|TabelaFaixas|CtaIndicacao)[^>]*/>', '', t)
    t = re.sub(r'<div class="table-wrap".*?</div>', ' ', t, flags=re.S)
    return t


def checar(caminho):
    erros, avisos = [], []
    bruto = open(caminho, encoding='utf-8').read()
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', bruto, re.S)
    if not m:
        return ['sem frontmatter'], []
    fm = yaml.safe_load(m.group(1))
    corpo = m.group(2)
    eh_modelo = os.sep + 'modelos' + os.sep in os.path.normpath(caminho) and 'paginas' not in caminho

    if eh_modelo:
        for k in ('slug', 'pros', 'contras'):
            if k not in fm:
                erros.append(f'frontmatter sem {k}')
        secao = 'analise'
    else:
        req = ['title', 'description', 'h1', 'rotulo', 'secao', 'kw', 'resumo', 'fontes', 'publicado', 'atualizado']
        for k in req:
            if k not in fm:
                erros.append(f'frontmatter sem {k}')
        if erros:
            return erros, avisos
        lim = {'title': (20, 62), 'description': (110, 160), 'h1': (10, 90), 'resumo': (60, 420)}
        for k, (a, b) in lim.items():
            n = len(str(fm[k]))
            if not a <= n <= b:
                erros.append(f'{k} com {n} caracteres (faixa {a}-{b})')
        secao = fm['secao']
        if secao not in SECOES:
            erros.append(f'secao inválida: {secao}')
        if len(fm.get('relacionadas') or []) > 3:
            erros.append('mais de 3 relacionadas')
        cta = fm.get('cta')
        if cta and cta.get('chave') not in CHAVES_LINK:
            erros.append(f'cta.chave desconhecida: {cta.get("chave")} (use {sorted(CHAVES_LINK)})')
        for q in fm.get('faq') or []:
            for k in ('p', 'r'):
                for rx, nome in PROIBIDO:
                    if re.search(rx, str(q.get(k, ''))):
                        erros.append(f'FAQ: {nome}')
        kw = str(fm['kw']).lower()
        alvo = (str(fm['title']) + ' ' + str(fm['h1'])).lower()
        faltam = [t for t in kw.split() if t not in alvo and len(t) > 2]
        if faltam:
            avisos.append(f'keyword "{kw}" não aparece inteira em title+h1 (faltam: {faltam})')

    ids_fm = set(fm.get('fontes') or [])
    for i in ids_fm:
        if i not in FONTES:
            erros.append(f'fonte do frontmatter inexistente: {i}')

    # componentes
    for nome in set(re.findall(r'<([A-Z][A-Za-z]+)', corpo)):
        if nome not in PERMITIDOS:
            erros.append(f'componente não permitido: <{nome}>')
    if re.search(r'(?m)^import ', corpo):
        erros.append('não use import no MDX (os componentes já vêm do template)')
    for bloco in re.findall(r'<Fonte\s+id=(\{\[.*?\]\}|"[^"]+")\s*/>', corpo):
        ids = re.findall(r"['\"]((?:TN|MK)-F\d{2,3}|X-[a-z0-9-]+)['\"]", bloco)
        if not ids:
            erros.append(f'<Fonte> sem id válido: {bloco}')
        for i in ids:
            if i not in FONTES:
                erros.append(f'<Fonte> com id inexistente: {i}')
            elif not eh_modelo and i not in ids_fm:
                erros.append(f'{i} citado no corpo mas ausente de "fontes" no frontmatter')
    for t in re.findall(r'<Taxa([^>]*)/>', corpo):
        a = dict(re.findall(r'(\w+)="([^"]+)"', t))
        n = re.search(r'parcelas=\{(\d+)\}', t)
        fx, pz, tp = a.get('faixa'), a.get('prazo'), a.get('tipo')
        if fx not in FAIXAS or pz not in FAIXAS.get(fx, {}).get('prazos', {}):
            erros.append(f'<Taxa> faixa/prazo inválidos: {t.strip()}')
            continue
        if tp == 'parcela':
            if not n or n.group(1) not in FAIXAS[fx]['prazos'][pz]['parcelas']:
                erros.append(f'<Taxa> parcela inexistente: {t.strip()}')
        elif tp not in ('debito', 'credito1x', 'elo_debito', 'elo_credito1x', 'elo_12x'):
            erros.append(f'<Taxa> tipo inválido: {t.strip()}')
    for t in re.findall(r'<Preco\s+modelo="([^"]+)"', corpo):
        if t not in ('t1', 't2', 't3', 't3-smart'):
            erros.append(f'<Preco> modelo inválido: {t}')
    for t in re.findall(r'<CtaIndicacao[^>]*chave="([^"]+)"', corpo):
        if t not in CHAVES_LINK:
            erros.append(f'<CtaIndicacao> chave desconhecida: {t}')

    # proibições
    for rx, nome in PROIBIDO:
        for mm in re.finditer(rx, corpo):
            trecho = corpo[max(0, mm.start() - 30): mm.end() + 30].replace('\n', ' ')
            erros.append(f'{nome}: "...{trecho}..."')
            break
    if re.search(r'(?i)\b\d+[,.]\d+ ?%', re.sub(r'<[^>]+>', '', corpo)) and not eh_modelo:
        avisos.append('percentual digitado à mão no texto: prefira <Taxa .../> (só aceite se não for taxa da Ton)')

    # summarization
    primeiro = corpo.strip().split('\n', 1)[0]
    sm = re.match(r'<p class="summarization">(.*?)</p>', primeiro)
    if not sm:
        erros.append('a primeira linha do corpo deve ser <p class="summarization">...</p>')
    else:
        n = len(palavras(re.sub(r'<[^>]+>', ' ', sm.group(1))))
        if not 40 <= n <= 60:
            erros.append(f'summarization com {n} palavras (40-60)')
        if '<strong>' not in sm.group(1):
            erros.append('summarization sem <strong>')

    # links internos no corpo
    internos = re.findall(r'\]\((/[^)]*)\)', corpo) + re.findall(r'href="(/[^"]*)"', corpo)
    internos = [u for u in internos if not u.startswith('/link/')]
    if len(internos) > LINKS_INTERNOS_MAX:
        erros.append(f'{len(internos)} links internos no corpo (máx {LINKS_INTERNOS_MAX}): {internos}')

    # tamanho e estrutura
    tc = texto_corpo(corpo)
    n = len(palavras(re.sub(r'<[^>]+>', ' ', tc)))
    if n < PISO[secao]:
        erros.append(f'{n} palavras no corpo (piso {PISO[secao]} para {secao})')
    if n > TETO:
        erros.append(f'{n} palavras no corpo (teto {TETO})')
    h2 = re.findall(r'(?m)^## ', corpo)
    if len(h2) < 3:
        erros.append(f'só {len(h2)} H2 (mínimo 3)')

    # densidade (Redator 5.0)
    with tempfile.NamedTemporaryFile('w', suffix='.md', delete=False, encoding='utf-8') as tmp:
        tmp.write(tc)
        nome_tmp = tmp.name
    r = subprocess.run([sys.executable, DENSIDADE, nome_tmp, '--article'], capture_output=True, text=True, encoding='utf-8')
    os.unlink(nome_tmp)
    linha = next((l for l in r.stdout.splitlines() if 'DENSIDADE' in l), 'DENSIDADE ?')
    if r.returncode != 0:
        detalhes = [l for l in r.stdout.splitlines() if l.strip() and not l.startswith('=') and 'Arquivo' not in l][:14]
        erros.append(f'gate de densidade reprovou ({linha.strip()}): ' + ' | '.join(detalhes))
    return erros, avisos + [f'{n} palavras; {linha.strip()}']


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(3)
    if args == ['--todas']:
        args = sorted(glob.glob(os.path.join(SITE, 'src', 'content', '**', '*.mdx'), recursive=True))
    falhou = False
    for a in args:
        erros, avisos = checar(a)
        rel = os.path.relpath(a, SITE)
        print(('PASS ' if not erros else 'FAIL ') + rel)
        for e in erros:
            print('   ERRO  ', e)
        for w in avisos:
            print('   aviso ', w)
        falhou |= bool(erros)
    sys.exit(1 if falhou else 0)


if __name__ == '__main__':
    main()
