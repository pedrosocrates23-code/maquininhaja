# -*- coding: utf-8 -*-
"""Checagem estrutural do build (dist/): links internos quebrados, JSON-LD válido e sem @id
repetido, exatamente um H1, title <= 62 e meta description entre 70 e 160 caracteres.

    python scripts/checar_dist.py
"""
import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(SITE, 'dist')

paginas = glob.glob(os.path.join(DIST, '**', '*.html'), recursive=True)
rotas = set()
for p in paginas:
    rel = '/' + os.path.relpath(p, DIST).replace(os.sep, '/')
    rotas.add(rel[: -len('index.html')] if rel.endswith('index.html') else rel)

problemas = []
for p in paginas:
    rel = os.path.relpath(p, DIST)
    if rel.startswith('link' + os.sep):
        continue
    h = open(p, encoding='utf-8').read()
    for href in re.findall(r'href="(/[^"#?]*)', h):
        if href.startswith('/link/'):
            continue
        if '.' in href.rsplit('/', 1)[-1]:
            if not os.path.exists(os.path.join(DIST, href.lstrip('/'))):
                problemas.append(f'{rel}: arquivo inexistente {href}')
        elif href not in rotas:
            problemas.append(f'{rel}: link quebrado {href}')
    for bloco in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        try:
            grafo = json.loads(bloco)['@graph']
            ids = [n['@id'] for n in grafo if '@id' in n]
            if len(ids) != len(set(ids)):
                problemas.append(f'{rel}: @id repetido no JSON-LD')
        except Exception as e:  # noqa: BLE001
            problemas.append(f'{rel}: JSON-LD inválido ({e})')
    n_h1 = len(re.findall(r'<h1[\s>]', h))
    if n_h1 != 1 and '404' not in rel:
        problemas.append(f'{rel}: {n_h1} H1')
    t = re.search(r'<title>(.*?)</title>', h)
    d = re.search(r'name="description" content="([^"]*)"', h)
    if not t or len(t.group(1)) > 62:
        problemas.append(f'{rel}: title com {len(t.group(1)) if t else 0} caracteres')
    if not d or not 70 <= len(d.group(1)) <= 160:
        problemas.append(f'{rel}: description com {len(d.group(1)) if d else 0} caracteres')

print(f'{len(paginas)} arquivos HTML verificados')
for x in sorted(set(problemas)):
    print(' -', x)
print('OK' if not problemas else f'{len(set(problemas))} problema(s)')
sys.exit(1 if problemas else 0)
