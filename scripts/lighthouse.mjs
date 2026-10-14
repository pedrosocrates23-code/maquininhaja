// Roda o Lighthouse (mobile e desktop) em todas as páginas do sitemap gerado e imprime a
// tabela de notas. Pré-requisito: `npm run build` e `npx astro preview --port 4329` rodando.
//   node scripts/lighthouse.mjs [http://localhost:4329] [--so-mobile] [--filtro=/modelos/]
import { execSync } from 'node:child_process';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const base = args.find((a) => a.startsWith('http')) ?? 'http://localhost:4329';
const soMobile = args.includes('--so-mobile');
const filtro = (args.find((a) => a.startsWith('--filtro=')) ?? '').split('=')[1] ?? '';
const raiz = fileURLToPath(new URL('..', import.meta.url));
const saida = join(raiz, 'qa', 'lighthouse');
mkdirSync(saida, { recursive: true });

const mapas = readdirSync(join(raiz, 'dist')).filter((f) => /^sitemap-\d+\.xml$/.test(f));
const caminhos = mapas
  .flatMap((f) => [...readFileSync(join(raiz, 'dist', f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))
  .filter((p) => p.includes(filtro));

const perfis = soMobile ? ['mobile'] : ['mobile', 'desktop'];
const linhas = [];
let falhas = 0;
for (const p of caminhos) {
  for (const perfil of perfis) {
    const nome = (p.replace(/\//g, '_') || '_') + `.${perfil}.json`;
    const out = join(saida, nome);
    const flags = perfil === 'desktop' ? '--preset=desktop' : '--form-factor=mobile';
    try {
      execSync(
        `npx -y lighthouse@13.5.0 "${base}${p}" --quiet ${flags} --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="${out}"`,
        { stdio: 'ignore', shell: true, timeout: 180000 },
      );
      const r = JSON.parse(readFileSync(out, 'utf8'));
      const c = r.categories;
      const n = (k) => Math.round((c[k]?.score ?? 0) * 100);
      const nota = { perf: n('performance'), a11y: n('accessibility'), bp: n('best-practices'), seo: n('seo') };
      const lcp = r.audits['largest-contentful-paint'].numericValue;
      const cls = r.audits['cumulative-layout-shift'].numericValue;
      const ok = Object.values(nota).every((v) => v === 100);
      if (!ok) falhas++;
      linhas.push(`| ${p} | ${perfil} | ${nota.perf} | ${nota.a11y} | ${nota.bp} | ${nota.seo} | ${(lcp / 1000).toFixed(2)} s | ${cls.toFixed(3)} | ${ok ? 'OK' : 'REVER'} |`);
    } catch (e) {
      falhas++;
      linhas.push(`| ${p} | ${perfil} | erro | | | | | | ${String(e.message).slice(0, 60)} |`);
    }
  }
}
console.log('| Página | Perfil | Perf | Acess. | Boas práticas | SEO | LCP | CLS | Status |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const l of linhas) console.log(l);
console.log(`\n${linhas.length} medições, ${falhas} abaixo de 100 em alguma categoria.`);
process.exit(falhas ? 1 : 0);
