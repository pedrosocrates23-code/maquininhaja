// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { writeFileSync, readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Fonte única dos links de indicação (também reexportada em src/data/site.ts).
import links from './src/data/links.json' with { type: 'json' };

const SITE = 'https://maquininhaja.com.br';

// Páginas de suporte pós-venda da Ton que saíram do site (o atendimento é da Ton): 301 para o contato oficial.
const SUPORTE_REMOVIDO = ['nao-liga-ou-sem-sinal', 'erros-e-resetar', 'conta-bloqueada'].map((s) => `/ajuda/${s}/`);

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
 * Banner de chamada no meio dos guias (src/components/BannerMeio.astro), sem editar cada MDX:
 * entra antes do H2 do meio do artigo. Se o CtaIndicacao (pedido) estiver na seção logo antes
 * ou logo depois desse ponto, o banner anda um H2 para não colar dois CTAs. Artigo com menos de
 * 4 H2 fica sem banner. Vale para aprenda/, quanto-custa/ e modelos/ (ajuda e renda-extra não).
 */
const SECOES_BANNER = /[\/]content[\/]paginas[\/](aprenda|quanto-custa|modelos)[\/][^\/]+\.mdx$/;
const bannerMeio = {
  name: 'banner-meio',
  before(root, ctx) {
    const arquivo = ctx.fileURL ? decodeURIComponent(ctx.fileURL.pathname) : '';
    if (!SECOES_BANNER.test(arquivo)) return;
    const filhos = root.children;
    const h2 = filhos.filter((n) => n.type === 'heading' && n.depth === 2);
    if (h2.length < 4) return;
    // seção (0 = antes do 1º H2) em que está cada CtaIndicacao do corpo
    const secaoDe = (i) => h2.filter((h) => filhos.indexOf(h) < i).length;
    const ctas = filhos.flatMap((n, i) => (n.type === 'mdxJsxFlowElement' && n.name === 'CtaIndicacao' ? [secaoDe(i)] : []));
    const meio = Math.floor(h2.length / 2);
    // antes do H2 de índice k: fica entre a seção k e a k+1 (contando a introdução como 0)
    const k = [meio, meio + 1, meio - 1, meio + 2].find(
      (c) => c >= 2 && c < h2.length && !ctas.some((s) => s === c || s === c + 1),
    );
    if (k === undefined) return;
    ctx.insertBefore(h2[k], { type: 'mdxJsxFlowElement', name: 'BannerMeio', attributes: [], children: [] });
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
        const linhas = [
          ...Object.entries(links).map(([k, v]) => `/link/${k}/ ${v} 302`),
          ...SUPORTE_REMOVIDO.map((d) => `${d} /ajuda/contato/ 301`),
        ];
        writeFileSync(new URL('_redirects', dir), linhas.join('\n') + '\n');
      },
    },
  };
}

/**
 * Links para página ainda não publicada viram texto no HTML final.
 *
 * Uma página agendada (`publicado` no futuro, ver src/lib/publicacao.ts) já existe em
 * src/content/paginas, então outra página pode linkar para ela antes da data (corpo do MDX,
 * `relacionadas`, componentes). Como a rota só é gerada quando a data chega, o link seria 404
 * até lá. Depois do build, este passo procura todo <a href="/..."> interno (relativo ou
 * https://maquininhaja.com.br/...) cuja rota não existe em dist e troca o link pelo conteúdo
 * da âncora. No build do dia da publicação a página existe e o link volta sozinho.
 * Não mexe em: /link/* (redirect de indicação), /api/*, âncora pura (#...), arquivo com
 * extensão (.jpg, .xml...). Destino ausente que NÃO é página da collection (link quebrado de
 * verdade) também vira texto, mas sai em AVISO no log para ser corrigido na fonte.
 */
function linksAgendados() {
  return {
    name: 'links-agendados',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const raiz = fileURLToPath(dir);
        const htmls = [];
        const andar = (/** @type {string} */ d) => {
          for (const nome of readdirSync(d)) {
            const p = join(d, nome);
            if (statSync(p).isDirectory()) andar(p);
            else if (nome.endsWith('.html')) htmls.push(p);
          }
        };
        andar(raiz);
        const daCollection = new Set(
          mdxEm('src/content/paginas').map((a) => '/' + a.replace(/^src\/content\/paginas\//, '').replace(/\.mdx$/, '') + '/'),
        );
        /** @param {string} rota @returns {boolean|null} true = existe; null = não se aplica */
        const existe = (rota) => {
          if (rota === '/' || /^\/(link|api|_astro)\//.test(rota)) return null;
          const rel = rota.replace(/^\/+/, '');
          if (/\.[a-z0-9]{1,5}$/i.test(rel)) return null;
          const alvo = join(raiz, ...rel.split('/').filter(Boolean));
          return existsSync(join(alvo, 'index.html')) || (!rota.endsWith('/') && existsSync(alvo + '.html'));
        };
        const re = /<a\b[^>]*?\shref="(?:https?:\/\/(?:www\.)?maquininhaja\.com\.br)?(\/(?!\/)[^"#?]*)(?:[#?][^"]*)?"[^>]*>([\s\S]*?)<\/a>/g;
        let total = 0;
        const agendadas = new Set();
        const quebrados = new Set();
        for (const arq of htmls) {
          const html = readFileSync(arq, 'utf8');
          let trocas = 0;
          const novo = html.replace(re, (tudo, caminho, texto) => {
            let rota = caminho;
            try {
              rota = decodeURIComponent(caminho);
            } catch {}
            if (existe(rota) !== false) return tudo;
            trocas++;
            const chave = rota.endsWith('/') ? rota : rota + '/';
            if (daCollection.has(chave)) agendadas.add(chave);
            else quebrados.add(`${rota} (em ${arq.slice(raiz.length).replace(/\\/g, '/')})`);
            return texto;
          });
          if (trocas) {
            writeFileSync(arq, novo, 'utf8');
            total += trocas;
          }
        }
        console.log(`[links-agendados] ${total} link(s) para página fora do ar viraram texto; destinos agendados/rascunho: ${agendadas.size ? [...agendadas].join(', ') : 'nenhum'}`);
        for (const q of quebrados) console.warn(`[links-agendados] AVISO: link interno para rota inexistente que não é página da collection: ${q}`);
      },
    },
  };
}

/**
 * Vercel Cron de reserva da fila de publicação (docs/fila-publicacao.md): chama
 * api/publicar-fila.js de segunda a sexta às 10:00 UTC (07:00 em Brasília), meia hora depois do
 * GitHub Actions. O path tem barra final porque o vercel.json usa trailingSlash: true e o Cron
 * não segue o 308 de /api/publicar-fila para /api/publicar-fila/.
 */
const CRONS = [{ path: '/api/publicar-fila/', schedule: '0 10 * * 1-5' }];

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
          redirects: [
            ...Object.entries(links).map(([k, v]) => ({ source: `/link/${k}/`, destination: v, permanent: false })),
            ...SUPORTE_REMOVIDO.map((d) => ({ source: d, destination: '/ajuda/contato/', permanent: true })),
          ],
          crons: CRONS,
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
  markdown: { syntaxHighlight: false, processor: satteri({ mdastPlugins: [semFonteInline, bannerMeio] }) },
  prefetch: false,
  redirects: {
    ...Object.fromEntries(Object.entries(links).map(([k, v]) => [`/link/${k}/`, { status: 302, destination: v }])),
    ...Object.fromEntries(SUPORTE_REMOVIDO.map((d) => [d, { status: 301, destination: '/ajuda/contato/' }])),
  },
  image: { responsiveStyles: true },
  // CSP nativo do Astro: hashes automáticos de scripts e estilos inline, em <meta>.
  // GA4 e Clarity só entram depois do consentimento (Consentimento.astro).
  security: {
    csp: {
      scriptDirective: { resources: ["'self'", 'https://www.googletagmanager.com', 'https://www.clarity.ms', 'https://scripts.clarity.ms'] },
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com",
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
    linksAgendados(),
    redirecionamentos(),
    vercelJson(),
  ],
});

