// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Fonte única dos links de indicação (também reexportada em src/data/site.ts).
import links from './src/data/links.json' with { type: 'json' };

const SITE = 'https://maquininhaja.com.br';

/**
 * As citações <Fonte /> ficam no MDX (o validador amarra cada afirmação ao documento), mas não
 * aparecem no meio do texto: a lista completa sai no rodapé da página, em "Referências".
 * Tira também o espaço que ficaria antes da pontuação ("aceita <Fonte />." vira "aceita.").
 */
const semFonteInline = {
  name: 'sem-fonte-inline',
  mdxJsxTextElement(node, ctx) {
    if (node.name !== 'Fonte') return;
    const irmaos = ctx.parent(node).children;
    const i = ctx.indexOf(node);
    const antes = irmaos[i - 1];
    const depois = irmaos[i + 1];
    if (antes?.type === 'text' && (!depois || (depois.type === 'text' && /^[\s.,;:!?)]/.test(depois.value)))) {
      ctx.setProperty(antes, 'value', antes.value.replace(/[ \t]+$/, ''));
    }
    ctx.removeNode(node);
  },
  mdxJsxFlowElement(node, ctx) {
    if (node.name === 'Fonte') ctx.removeNode(node);
  },
};

/**
 * lastmod de cada URL do sitemap, sem data inventada: guia (collection "paginas") usa o
 * `atualizado` do frontmatter ou o último commit do .mdx, o que for mais novo; as outras
 * páginas usam o último commit dos arquivos que as geram. Clone raso (CI) ou git fora do ar:
 * só o frontmatter vale e, sem ele, o lastmod é omitido.
 */
const gitUtilizavel = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'false';
  } catch {
    return false;
  }
})();

/** @param {string} arquivo @returns {string|null} */
function dataGit(arquivo) {
  if (!gitUtilizavel || !existsSync(arquivo)) return null;
  try {
    const r = execFileSync('git', ['log', '-1', '--format=%cs', '--', arquivo], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(r) ? r : null;
  } catch {
    return null;
  }
}

/** @param {string} dir @returns {string[]} */
const mdxEm = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? mdxEm(`${dir}/${e.name}`) : e.name.endsWith('.mdx') ? [`${dir}/${e.name}`] : [],
  );

/** @param {string} rota rota sem barras nas pontas ('' = home) @returns {string[]} */
function arquivosDaRota(rota) {
  if (rota === '') return ['src/pages/index.astro'];
  const modelo = rota.match(/^modelos\/(t1|t2|t3|t3-smart)$/);
  if (modelo) return ['src/pages/modelos/[modelo].astro', `src/content/modelos/${modelo[1]}.mdx`, 'src/data/modelos.ts', 'src/data/taxas.json'];
  return [`src/pages/${rota}/index.astro`, `src/pages/${rota}.astro`];
}

const LASTMOD = (() => {
  /** @type {Map<string, string>} */
  const mapa = new Map();
  for (const arq of mdxEm('src/content/paginas')) {
    const fm = readFileSync(arq, 'utf8').match(/^atualizado:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1];
    const rota = arq.replace(/^src\/content\/paginas\//, '').replace(/\.mdx$/, '');
    const datas = [fm, dataGit(arq)].filter(Boolean).sort();
    if (datas.length) mapa.set(`${SITE}/${rota}/`, /** @type {string} */ (datas.at(-1)));
  }
  return mapa;
})();

/** @param {string} url @returns {string|undefined} */
function lastmodDe(url) {
  if (LASTMOD.has(url)) return LASTMOD.get(url);
  const rota = url.replace(SITE, '').replace(/^\/|\/$/g, '');
  const datas = arquivosDaRota(rota).map(dataGit).filter(Boolean).sort();
  return /** @type {string|undefined} */ (datas.at(-1));
}

/**
 * /sitemap.xml (o que o robots.txt anuncia) traz todas as URLs direto, num <urlset>, e não um
 * índice. Junta os sitemap-N.xml da integração; sitemap-index.xml e sitemap-0.xml continuam no ar.
 * scripts/check-sitemap.mjs reprova o build se página indexável ficar de fora.
 */
function sitemapUnico() {
  return {
    name: 'sitemap-unico',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const partes = readdirSync(dir)
          .filter((f) => /^sitemap-\d+\.xml$/.test(f))
          .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
        if (!partes.length) throw new Error('[sitemap] nenhum sitemap-N.xml gerado; /sitemap.xml ficaria vazio');
        let abertura = '';
        const urls = [];
        for (const f of partes) {
          const xml = readFileSync(new URL(f, dir), 'utf8');
          abertura ||= xml.match(/<urlset[^>]*>/)?.[0] ?? '';
          urls.push(...(xml.match(/<url>[\s\S]*?<\/url>/g) ?? []));
        }
        if (!abertura) throw new Error('[sitemap] sitemap-0.xml sem <urlset>');
        writeFileSync(new URL('sitemap.xml', dir), `<?xml version="1.0" encoding="UTF-8"?>${abertura}${urls.join('')}</urlset>`);
        console.log(`[sitemap] sitemap.xml com ${urls.length} URLs`);
      },
    },
  };
}

/** /link/<modelo>/ vira 302 no host (arquivo _redirects, Cloudflare/Netlify). */
function redirecionamentos() {
  return {
    name: 'links-de-indicacao',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const linhas = Object.entries(links).map(([k, v]) => `/link/${k}/ ${v} 302`);
        writeFileSync(new URL('_redirects', dir), linhas.join('\n') + '\n');
      },
    },
  };
}

/**
 * A Vercel não lê public/_headers nem _redirects. Este hook gera o vercel.json da raiz a partir
 * dos dois (mesma fonte): cabeçalhos de segurança/cache e /link/<chave>/ como 302 de verdade
 * (sem ele, a Vercel serve a página de meta refresh). O arquivo é versionado: rodar o build
 * antes do commit mantém os dois em sincronia.
 */
function vercelJson() {
  return {
    name: 'vercel-json',
    hooks: {
      'astro:build:done': () => {
        const blocos = [];
        let atual = null;
        for (const linha of readFileSync('public/_headers', 'utf8').split(/\r?\n/)) {
          if (!linha.trim() || linha.trim().startsWith('#')) continue;
          if (!/^\s/.test(linha)) {
            atual = { source: linha.trim().replace(/\*/g, '(.*)'), headers: [] };
            blocos.push(atual);
          } else if (atual) {
            const i = linha.indexOf(':');
            atual.headers.push({ key: linha.slice(0, i).trim(), value: linha.slice(i + 1).trim() });
          }
        }
        const config = {
          $schema: 'https://openapi.vercel.sh/vercel.json',
          trailingSlash: true,
          headers: blocos,
          redirects: Object.entries(links).map(([k, v]) => ({ source: `/link/${k}/`, destination: v, permanent: false })),
        };
        writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  markdown: { syntaxHighlight: false, processor: satteri({ mdastPlugins: [semFonteInline] }) },
  prefetch: false,
  redirects: Object.fromEntries(
    Object.entries(links).map(([k, v]) => [`/link/${k}/`, { status: 302, destination: v }]),
  ),
  image: { responsiveStyles: true },
  // CSP nativo do Astro: hashes automáticos de scripts e estilos inline, em <meta>.
  // O GA4 só entra depois do consentimento (Consentimento.astro).
  security: {
    csp: {
      scriptDirective: { resources: ["'self'", 'https://www.googletagmanager.com'] },
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
        "font-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
    },
  },
  fonts: [
    // Uma família só no site inteiro (títulos e texto): Nunito (OFL), arredondada, no estilo da Ton
    // sem usar a fonte própria dela (TN-F024). Baixada no build e servida do próprio domínio.
    {
      provider: fontProviders.fontsource(),
      name: 'Nunito',
      cssVariable: '--font-sans',
      weights: ['400 900'],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'optional',
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/link/') && !page.endsWith('/404/'),
      changefreq: 'weekly',
      serialize(item) {
        const d = lastmodDe(item.url);
        if (d) item.lastmod = d;
        else delete item.lastmod;
        return item;
      },
    }),
    sitemapUnico(),
    redirecionamentos(),
    vercelJson(),
  ],
});

