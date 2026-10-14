// Grafo JSON-LD com @id estável. Entidades:
// - o site (Organization publisher + WebSite), que é independente;
// - a Ton (Organization) com sameAs só nos perfis oficiais: a marca não tem item no
//   Wikidata (TN-F114). A Stone entra como parentOrganization (Q61002117, TN-F115).
// Sem FAQPage (rich result encerrado em 2026) e sem HowTo (encerrado em 2023).
import { SITE } from '../data/site';

const U = SITE.url;
export const ID = {
  publisher: `${U}/#publisher`,
  website: `${U}/#website`,
  ton: `${U}/#ton`,
  stone: `${U}/#stone`,
};

export type Crumb = { name: string; href: string };

export function base() {
  return [
    {
      '@type': 'Organization',
      '@id': ID.publisher,
      name: SITE.nome,
      url: `${U}/`,
      logo: { '@type': 'ImageObject', url: `${U}/icon-512.png`, width: 512, height: 512 },
      description: SITE.descricao,
      email: SITE.email,
    },
    {
      '@type': 'WebSite',
      '@id': ID.website,
      url: `${U}/`,
      name: SITE.nome,
      inLanguage: SITE.idioma,
      publisher: { '@id': ID.publisher },
    },
    {
      '@type': 'Organization',
      '@id': ID.ton,
      name: 'Ton',
      url: 'https://www.ton.com.br/',
      sameAs: [
        'https://www.instagram.com/seliganoton/',
        'https://www.youtube.com/channel/UCo2OofOde1YZrDGRTqNdBVA',
        'https://www.linkedin.com/company/seliganoton/',
      ],
      parentOrganization: { '@id': ID.stone },
    },
    {
      '@type': 'Organization',
      '@id': ID.stone,
      name: 'Stone',
      url: 'https://www.stone.com.br/',
      sameAs: ['https://www.wikidata.org/wiki/Q61002117'],
    },
  ];
}

export function breadcrumb(path: string, crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${U}${path}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${U}${c.href}`,
    })),
  };
}

type Pagina = {
  path: string;
  title: string;
  description: string;
  tipo: 'WebPage' | 'Article' | 'CollectionPage' | 'AboutPage' | 'ContactPage' | 'WebApplication';
  publicado?: string;
  atualizado?: string;
  crumbs?: Crumb[];
  imagem?: string;
  sobre?: string[]; // @ids das entidades tratadas na página
};

export function pagina(p: Pagina) {
  const url = `${U}${p.path}`;
  const no: Record<string, unknown> = {
    '@type': p.tipo === 'Article' || p.tipo === 'WebApplication' ? 'WebPage' : p.tipo,
    '@id': `${url}#webpage`,
    url,
    name: p.title,
    description: p.description,
    inLanguage: SITE.idioma,
    isPartOf: { '@id': ID.website },
    publisher: { '@id': ID.publisher },
  };
  if (p.crumbs?.length) no.breadcrumb = { '@id': `${url}#breadcrumb` };
  if (p.sobre?.length) no.about = p.sobre.map((id) => ({ '@id': id }));
  if (p.atualizado) no.dateModified = p.atualizado;
  const nos: Record<string, unknown>[] = [no];
  if (p.tipo === 'Article') {
    nos.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: p.title,
      description: p.description,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@id': ID.publisher },
      publisher: { '@id': ID.publisher },
      datePublished: p.publicado ?? p.atualizado,
      dateModified: p.atualizado,
      inLanguage: SITE.idioma,
      ...(p.imagem ? { image: p.imagem } : {}),
      ...(p.sobre?.length ? { about: p.sobre.map((id) => ({ '@id': id })) } : {}),
    });
  }
  if (p.tipo === 'WebApplication') {
    nos.push({
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: p.title,
      url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Navegador',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      publisher: { '@id': ID.publisher },
    });
  }
  if (p.crumbs?.length) nos.push(breadcrumb(p.path, p.crumbs));
  return nos;
}

/** Product + Offer de um modelo. Sem Review até existir teste real com autor real. */
export function produto(o: {
  path: string;
  slug: string;
  nome: string;
  descricao: string;
  preco: number;
  urlOficial: string;
  imagem: string;
  validoAte?: string;
}) {
  return {
    '@type': 'Product',
    '@id': `${U}${o.path}#produto`,
    name: o.nome,
    description: o.descricao,
    image: o.imagem,
    brand: { '@id': ID.ton },
    manufacturer: { '@id': ID.ton },
    offers: {
      '@type': 'Offer',
      price: o.preco.toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: o.urlOficial,
      seller: { '@id': ID.ton },
      ...(o.validoAte ? { priceValidUntil: o.validoAte } : {}),
    },
  };
}
