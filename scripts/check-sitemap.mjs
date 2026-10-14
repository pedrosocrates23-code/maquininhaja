#!/usr/bin/env node
/**
 * Regra da casa: toda página nova vai para o sitemap, e /sitemap.xml
 * traz as URLs direto, sem índice no meio.
 *
 * Compara o dist com o sitemap.xml gerado no build:
 *   1. /sitemap.xml é um <urlset> (não um <sitemapindex>);
 *   2. toda página indexável do build (index.html sem meta robots noindex) está nele;
 *   3. toda URL dele existe no build e não é noindex.
 *
 * Roda no `npm run build`, então página fora do sitemap reprova o deploy.
 * Uso avulso: node scripts/check-sitemap.mjs   (depois de `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const SITE = 'https://maquininhaja.com.br';

/** @param {string} dir @param {(f: string) => void} cb */
function walk(dir, cb) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

const paraRota = (f) =>
  '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '');

const ehNoindex = (html) =>
  /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);

const xml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const erros = [];

if (!/<urlset[\s>]/.test(xml) || /<sitemapindex[\s>]/.test(xml)) {
  erros.push('sitemap.xml não é um <urlset> com as URLs (virou índice?)');
}

const noSitemap = new Set(
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '')),
);

/** @type {Map<string, boolean>} rota -> é noindex */
const paginas = new Map();
walk(DIST, (f) => {
  if (path.basename(f) !== 'index.html') return;
  paginas.set(paraRota(f), ehNoindex(fs.readFileSync(f, 'utf8')));
});

const faltando = [...paginas].filter(([r, noindex]) => !noindex && !noSitemap.has(r)).map(([r]) => r);
const sobrando = [...noSitemap].filter((r) => !paginas.has(r));
const noindexNoSitemap = [...noSitemap].filter((r) => paginas.get(r) === true);

for (const r of faltando) erros.push(`página indexável fora do sitemap: ${r}`);
for (const r of sobrando) erros.push(`URL do sitemap sem página no build: ${r}`);
for (const r of noindexNoSitemap) erros.push(`página noindex dentro do sitemap: ${r}`);

const indexaveis = [...paginas.values()].filter((n) => !n).length;
console.log(`[check-sitemap] ${noSitemap.size} URLs no sitemap.xml; ${indexaveis} páginas indexáveis; ${paginas.size - indexaveis} noindex fora`);

if (erros.length) {
  for (const e of erros.slice(0, 50)) console.error('  ' + e);
  if (erros.length > 50) console.error(`  ... e mais ${erros.length - 50}`);
  console.error(`[check-sitemap] REPROVADO: ${erros.length} problema(s)`);
  process.exit(1);
}
console.log('[check-sitemap] OK: toda página indexável está no sitemap.xml');
