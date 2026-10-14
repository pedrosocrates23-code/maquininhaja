// Grafo JSON-LD com @id estável. Entidades conferidas em 14/10/2026 (output/maquininhaja/schema-blueprint.md):
// - "Maquininha Já" (Organization #publisher): sem item no Wikidata; sem dados legais no grafo (Fase 0 pendente).
// - Ton é Brand (o próprio site: "Ton é marca, não empresa"). Sem item no Wikidata (TN-F114).
//   O Facebook da Ton fica fora do sameAs: linkado em ton.com.br, mas o perfil não foi conferido (blueprint, seção 9).
// - Stone = Q61002117 (P856 stone.com.br; rodapé com o CNPJ da Stone IP). StoneCo = Q105966359. Pagar.me sem item.
// - Conceitos citados entram em `mentions` com sameAs verificado (estratégia A, sem @id próprio).
//   MEI, Pluxee, Alelo/Ticket/VR/Up e MDR não têm sameAs: QID ambíguo ou inexistente.
// - FAQPage: o Google deixou de exibir o rich result em 07/05/2026. Desligado (decisão anterior do projeto,
//   ver src/components/Faq.astro); ligar EMITIR_FAQPAGE só com o OK do dono do site (blueprint, P3).
// - Sem HowTo, SearchAction, Review/AggregateRating (sem teste real) e sem manufacturer/seller (a Ton não fabrica nem vende).
import { SITE, PROGRAMA_ATIVO } from '../data/site';
import { fonte } from './fontes';

const U = SITE.url;
export const EMITIR_FAQPAGE = false;

export const ID = {
  publisher: `${U}/#publisher`,
  website: `${U}/#website`,
  ton: `${U}/#ton`,
  stone: `${U}/#stone`,
  stoneco: `${U}/#stoneco`,
  pagarme: `${U}/#pagarme`,
  tonMega: `${U}/#ton-mega`,
  rendaExtra: `${U}/#renda-extra`,
};
export type ChaveEntidade = keyof typeof ID;

export type Crumb = { name: string; href: string };
export type Imagem = { url: string; width: number; height: number };
export type ItemFaq = { p: string; r: string };
type No = Record<string, unknown>;

const ref = (id: string) => ({ '@id': id });
const wd = (q: string) => `https://www.wikidata.org/wiki/${q}`;
const ptw = (titulo: string) => `https://pt.wikipedia.org/wiki/${encodeURIComponent(titulo.replaceAll(' ', '_'))}`;
export const pageId = (path: string) => `${U}${path}#webpage`;
export const imagemOg = (nome: string): Imagem => ({ url: `${U}/og/${nome}.jpg`, width: 1200, height: 630 });
const imageObject = (i: Imagem) => ({ '@type': 'ImageObject', ...i });

// Entidades de terceiros com @id próprio. Só entram no grafo quando alguma página as referencia (completarGrafo).
const ENTIDADES: Record<string, No> = {
  [ID.ton]: {
    '@type': 'Brand',
    '@id': ID.ton,
    name: 'Ton',
    url: 'https://www.ton.com.br/',
    description: 'Marca da Stone criada para autônomos e microempreendedores, segundo a Central de Ajuda da Ton.',
    sameAs: [
      'https://www.instagram.com/seliganoton/',
      'https://www.youtube.com/channel/UCo2OofOde1YZrDGRTqNdBVA',
      'https://www.linkedin.com/company/seliganoton/',
      'https://x.com/seliganoton',
    ],
    subjectOf: ref(pageId('/aprenda/ton-e-stone/')),
  },
  [ID.stone]: {
    '@type': 'Organization',
    '@id': ID.stone,
    name: 'Stone',
    legalName: 'Stone Instituição de Pagamento S.A.',
    taxID: '16.501.555/0001-57',
    url: 'https://www.stone.com.br/',
    sameAs: [wd('Q61002117'), ptw('Stone (fintech)'), 'https://www.instagram.com/stone/', 'https://x.com/sejastone'],
    brand: ref(ID.ton),
    parentOrganization: ref(ID.stoneco),
  },
  [ID.stoneco]: {
    '@type': 'Corporation',
    '@id': ID.stoneco,
    name: 'StoneCo Ltd.',
    tickerSymbol: 'STNE',
    url: 'https://www.stoneco.com.br/',
    sameAs: [wd('Q105966359'), 'https://investors.stone.co/'],
  },
  [ID.pagarme]: {
    '@type': 'Organization',
    '@id': ID.pagarme,
    name: 'Pagar.me',
    legalName: 'Pagar.me S.A.',
    taxID: '18.727.053/0001-74',
    description: 'Desenvolvedora da Plataforma Ton.',
  },
  [ID.tonMega]: {
    '@type': 'Service',
    '@id': ID.tonMega,
    name: 'Ton Mega+',
    serviceType: 'Plano de taxas para vendas com maquininha',
    description:
      'Plano de taxas da Ton: taxa promocional nos primeiros 30 dias ou até R$ 5 mil em vendas e, depois, taxa pela faixa de faturamento do mês anterior.',
    brand: ref(ID.ton),
    url: 'https://www.ton.com.br/planos-e-taxas',
    termsOfService: 'https://documentos.ton.com.br/regulamento-tonmega-tier-mar26.pdf',
    subjectOf: ref(pageId('/quanto-custa/')),
  },
  [ID.rendaExtra]: {
    '@type': 'Service',
    '@id': ID.rendaExtra,
    name: 'Renda Extra Ton',
    serviceType: 'Programa de indicação com comissão por cliente novo',
    provider: ref(ID.pagarme),
    brand: ref(ID.ton),
    url: 'https://rendaextra.ton.com.br/renda-ton/',
    termsOfService: 'https://documentos.ton.com.br/regulamento-renda-ton.pdf',
    subjectOf: ref(pageId('/renda-extra/')),
  },
};

// Conceitos e marcas citadas. QID conferido na API do Wikidata; ptwiki conferida (sem redirect/desambiguação).
type Conceito = { tipo: string; nome: string; qid?: string; wiki?: string };
const CONCEITOS: Record<string, Conceito> = {
  maquininha: { tipo: 'Thing', nome: 'Máquina de cartão', qid: 'Q605108', wiki: 'Máquina de cartão' },
  pix: { tipo: 'Thing', nome: 'Pix', qid: 'Q86741580', wiki: 'Pix' },
  aproximacao: { tipo: 'Thing', nome: 'Pagamento por aproximação', qid: 'Q625903', wiki: 'Pagamento por aproximação' },
  credito: { tipo: 'Thing', nome: 'Cartão de crédito', qid: 'Q161380', wiki: 'Cartão de crédito' },
  debito: { tipo: 'Thing', nome: 'Cartão de débito', qid: 'Q13499', wiki: 'Cartão de débito' },
  vale: { tipo: 'Thing', nome: 'Vale-refeição', qid: 'Q1449340', wiki: 'Vale-refeição' },
  comodato: { tipo: 'Thing', nome: 'Comodato', qid: 'Q1580844', wiki: 'Comodato' },
  estorno: { tipo: 'Thing', nome: 'Estorno (chargeback)', qid: 'Q3307525', wiki: 'Estorno' },
  cnpj: { tipo: 'Thing', nome: 'CNPJ', qid: 'Q15816867', wiki: 'Cadastro Nacional da Pessoa Jurídica' },
  cpf: { tipo: 'Thing', nome: 'CPF', qid: 'Q5016244', wiki: 'Cadastro de Pessoas Físicas' },
  android: { tipo: 'Thing', nome: 'Android', qid: 'Q94', wiki: 'Android' },
  mei: { tipo: 'Thing', nome: 'Microempreendedor Individual (MEI)' }, // 2 QIDs candidatos: revisão humana antes de sameAs
  bcb: { tipo: 'GovernmentOrganization', nome: 'Banco Central do Brasil', qid: 'Q806186', wiki: 'Banco Central do Brasil' },
  reclameaqui: { tipo: 'WebSite', nome: 'Reclame Aqui', qid: 'Q10358025', wiki: 'Reclame Aqui' },
  visa: { tipo: 'Organization', nome: 'Visa', qid: 'Q328840', wiki: 'Visa' },
  mastercard: { tipo: 'Organization', nome: 'Mastercard', qid: 'Q489921', wiki: 'Mastercard' },
  elo: { tipo: 'Organization', nome: 'Elo', qid: 'Q10272036', wiki: 'Cartão Elo' },
  amex: { tipo: 'Organization', nome: 'American Express', qid: 'Q194360', wiki: 'American Express' },
  hipercard: { tipo: 'Organization', nome: 'Hipercard', qid: 'Q10295758', wiki: 'Hipercard' },
  globo: { tipo: 'Organization', nome: 'Grupo Globo', qid: 'Q614283', wiki: 'Grupo Globo' },
  nasdaq: { tipo: 'Organization', nome: 'Nasdaq', qid: 'Q82059', wiki: 'NASDAQ' },
};

/** Chave de CONCEITOS (nó inline com sameAs) ou chave de ID (referência a entidade). Chave desconhecida quebra o build. */
export function mencao(chave: string): No {
  if (chave in ID) return ref(ID[chave as ChaveEntidade]);
  const c = CONCEITOS[chave];
  if (!c) throw new Error(`Entidade ou conceito desconhecido no schema: ${chave}`);
  return { '@type': c.tipo, name: c.nome, ...(c.qid && c.wiki ? { sameAs: [wd(c.qid), ptw(c.wiki)] } : {}) };
}

/** Nós que saem em toda página: quem publica e o site. */
export function nucleo(): No[] {
  const publisher: No = {
    '@type': 'Organization',
    '@id': ID.publisher,
    name: SITE.nome,
    url: `${U}/`,
    logo: { '@type': 'ImageObject', url: `${U}/icon-512.png`, width: 512, height: 512 },
    description: SITE.descricao,
    publishingPrinciples: `${U}/como-testamos/`,
    ownershipFundingInfo: `${U}/transparencia/`,
    knowsAbout: [ref(ID.ton), wd('Q605108'), wd('Q86741580')],
  };
  if (PROGRAMA_ATIVO) {
    publisher.memberOf = { '@type': 'ProgramMembership', programName: 'Renda Extra Ton', hostingOrganization: ref(ID.pagarme) };
  }
  // Só com caixa de e-mail funcionando: em 14/10/2026 o domínio publica MX nulo ("0 .") e SPF "-all".
  if (SITE.emailAtivo) {
    publisher.email = SITE.email;
    publisher.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      email: SITE.email,
      url: `${U}/fale-com-a-gente/`,
      availableLanguage: 'pt-BR',
    };
  }
  // Razão social e CNPJ do responsável ficam fora do grafo até a Fase 0 fechar (src/data/site.ts).
  // CPF nunca vai para o JSON-LD (dado pessoal).
  const website: No = {
    '@type': 'WebSite',
    '@id': ID.website,
    url: `${U}/`,
    name: SITE.nome,
    alternateName: [SITE.dominio],
    description: SITE.descricao,
    inLanguage: SITE.idioma,
    publisher: ref(ID.publisher),
    about: ref(ID.ton),
  };
  return [publisher, website];
}

function coletarRefs(o: unknown, acc: Set<string>): void {
  if (Array.isArray(o)) {
    o.forEach((v) => coletarRefs(v, acc));
    return;
  }
  if (o && typeof o === 'object') {
    const r = o as No;
    const chaves = Object.keys(r);
    if (chaves.length === 1 && typeof r['@id'] === 'string') acc.add(r['@id']);
    Object.values(r).forEach((v) => coletarRefs(v, acc));
  }
}

/** Acrescenta ao grafo as ENTIDADES referenciadas e ainda não definidas (recursivo: Stone puxa StoneCo). */
export function completarGrafo(nos: No[]): No[] {
  const out = [...nos];
  for (;;) {
    const definidos = new Set(out.map((n) => n['@id']));
    const refs = new Set<string>();
    coletarRefs(out, refs);
    const faltam = [...refs].filter((id) => !definidos.has(id) && ENTIDADES[id]).sort();
    if (!faltam.length) return out;
    out.push(...faltam.map((id) => ENTIDADES[id]));
  }
}

export function breadcrumb(path: string, crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${U}${path}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${U}${c.href}` })),
  };
}

function faqPage(url: string, itens: ItemFaq[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    isPartOf: ref(`${url}#webpage`),
    inLanguage: SITE.idioma,
    mainEntity: itens.map((i) => ({ '@type': 'Question', name: i.p, acceptedAnswer: { '@type': 'Answer', text: i.r } })),
  };
}

/** URLs oficiais do ledger da página (as mesmas da lista "Referências"). Ignora entradas que não são URL. */
function citacoes(ids: string[]) {
  const urls = [...new Set(ids.map((id) => fonte(id).url).filter((u) => /^https?:\/\//.test(u)))];
  return urls.map((url) => ({ '@type': 'CreativeWork', url }));
}

type Pagina = {
  path: string;
  title: string;
  description: string;
  tipo: 'WebPage' | 'Article' | 'CollectionPage' | 'AboutPage' | 'ContactPage' | 'WebApplication';
  h1?: string; // headline do Article e nome do WebApplication: o H1 visível
  publicado?: string;
  atualizado?: string; // dateModified: quando o conteúdo da página mudou
  revisado?: string; // lastReviewed: quando preços/taxas foram conferidos (SITE.verificadoEm)
  crumbs?: Crumb[];
  imagem?: Imagem;
  sobre?: string[]; // @ids do assunto principal
  principal?: string; // @id do mainEntity
  hub?: string; // path do hub do cluster (spoke -> hub)
  partes?: string[]; // paths dos spokes (hub -> spokes)
  mencoes?: string[]; // chaves de CONCEITOS ou de ID
  faq?: ItemFaq[];
  fontes?: string[]; // ids do ledger -> Article.citation
  secao?: string; // articleSection
  recursos?: string[]; // featureList do WebApplication (texto visível)
};

export function pagina(p: Pagina) {
  const url = `${U}${p.path}`;
  const principal = p.principal ?? (p.tipo === 'WebApplication' ? `${url}#app` : undefined);
  const no: No = {
    '@type': p.tipo === 'Article' || p.tipo === 'WebApplication' ? 'WebPage' : p.tipo,
    '@id': `${url}#webpage`,
    url,
    name: p.title,
    description: p.description,
    inLanguage: SITE.idioma,
    isPartOf: [ref(ID.website), ...(p.hub ? [ref(pageId(p.hub))] : [])],
    publisher: ref(ID.publisher),
  };
  if (p.crumbs?.length) no.breadcrumb = ref(`${url}#breadcrumb`);
  if (p.sobre?.length) no.about = p.sobre.map((id) => ref(id));
  if (principal) no.mainEntity = ref(principal);
  if (p.partes?.length) no.hasPart = p.partes.map((x) => ref(pageId(x)));
  if (p.imagem) no.primaryImageOfPage = imageObject(p.imagem);
  if (p.mencoes?.length) no.mentions = p.mencoes.map(mencao);
  if (p.atualizado) no.dateModified = p.atualizado;
  if (p.revisado) no.lastReviewed = p.revisado;
  const nos: No[] = [no];
  if (p.tipo === 'Article') {
    nos.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: p.h1 ?? p.title,
      description: p.description,
      mainEntityOfPage: ref(`${url}#webpage`),
      author: ref(ID.publisher),
      publisher: ref(ID.publisher),
      datePublished: p.publicado ?? p.atualizado,
      dateModified: p.atualizado,
      inLanguage: SITE.idioma,
      ...(p.imagem ? { image: imageObject(p.imagem) } : {}),
      ...(p.secao ? { articleSection: p.secao } : {}),
      ...(p.sobre?.length ? { about: p.sobre.map((id) => ref(id)) } : {}),
      ...(p.fontes?.length ? { citation: citacoes(p.fontes) } : {}),
    });
  }
  if (p.tipo === 'WebApplication') {
    nos.push({
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: p.h1 ?? p.title,
      description: p.description,
      url,
      inLanguage: SITE.idioma,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Qualquer navegador',
      browserRequirements: 'Requer JavaScript',
      ...(p.recursos?.length ? { featureList: p.recursos } : {}),
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      publisher: ref(ID.publisher),
      ...(p.sobre?.length ? { about: ref(p.sobre[0]) } : {}),
    });
  }
  if (p.crumbs?.length) nos.push(breadcrumb(p.path, p.crumbs));
  if (EMITIR_FAQPAGE && p.faq?.length) nos.push(faqPage(url, p.faq));
  return nos;
}

/** Product + Offer de um modelo. Sem Review até existir teste real com autor real. Sem manufacturer: a Ton não fabrica. */
export function produto(o: {
  path: string;
  nome: string;
  descricao: string;
  preco: number;
  parcela: string; // ex.: "12x de R$ 9,00" (texto visível)
  urlOficial: string;
  imagens: Imagem[]; // [foto do aparelho visível na ficha, card OG]
  ficha: [string, string][]; // a mesma tabela "Ficha da …" da página
}) {
  return {
    '@type': 'Product',
    '@id': `${U}${o.path}#produto`,
    name: o.nome,
    description: o.descricao,
    image: o.imagens.map(imageObject),
    brand: ref(ID.ton),
    category: 'Máquina de cartão',
    additionalType: wd('Q605108'),
    isRelatedTo: ref(ID.tonMega),
    additionalProperty: o.ficha.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    offers: {
      '@type': 'Offer',
      price: o.preco.toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: o.urlOficial, // página oficial do modelo, nunca o /link/ de indicação (o cupom não entra no schema)
      description: `Taxa única de adesão, à vista ou em ${o.parcela}. Preço promocional conferido em ${SITE.verificadoEmTexto}.`,
      offeredBy: [ref(ID.stone), ref(ID.pagarme)],
    },
  };
}
