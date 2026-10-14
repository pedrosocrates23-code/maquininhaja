// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { writeFileSync } from 'node:fs';

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
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-sans',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'optional',
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Instrument Serif',
      cssVariable: '--font-display',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      display: 'optional',
      fallbacks: ['serif'],
    },
  ],
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/link/') && !page.endsWith('/404/'),
      changefreq: 'weekly',
      lastmod: new Date('2026-10-13'),
    }),
    redirecionamentos(),
  ],
});

