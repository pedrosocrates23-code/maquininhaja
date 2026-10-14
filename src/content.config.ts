import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Página editorial (ajuda, guias, taxas explicadas). O caminho do arquivo é a URL:
// src/content/paginas/ajuda/primeiros-passos.mdx -> /ajuda/primeiros-passos/
const paginas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/paginas' }),
  schema: z.object({
    title: z.string().min(20).max(62, '<title> com no máximo 62 caracteres'),
    description: z.string().min(110).max(160, 'meta description entre 110 e 160 caracteres'),
    h1: z.string().min(10).max(90),
    rotulo: z.string().max(40), // chip acima do H1 (ex.: "Ajuda", "Taxas")
    secao: z.enum(['ajuda', 'aprenda', 'quanto-custa', 'modelos', 'renda-extra']),
    kw: z.string(), // keyword principal da página (plano de sitemap)
    resumo: z.string().min(60).max(420), // resposta direta logo abaixo do H1 (HTML simples permitido)
    fontes: z.array(z.string().regex(/^(TN|MK)-F\d{2,3}$|^X-[a-z0-9-]+$/)).min(1),
    publicado: z.coerce.date(),
    atualizado: z.coerce.date(),
    og: z.string().default('padrao'),
    relacionadas: z
      .array(z.object({ href: z.string().startsWith('/'), label: z.string() }))
      .max(3)
      .default([]),
    cta: z.object({ chave: z.string(), texto: z.string() }).optional(),
    faq: z.array(z.object({ p: z.string(), r: z.string() })).default([]),
    noindex: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Análise editorial de cada modelo (o template /modelos/<slug>/ junta com a ficha de dados).
const modelos = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/modelos' }),
  schema: z.object({
    slug: z.enum(['t1', 't2', 't3', 't3-smart']),
    fontes: z.array(z.string()).default([]),
    pros: z.array(z.string()).min(2).max(6),
    contras: z.array(z.string()).min(2).max(6),
    faq: z.array(z.object({ p: z.string(), r: z.string() })).default([]),
  }),
});

export const collections = { paginas, modelos };
