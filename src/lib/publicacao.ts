// Regra única de "página publicada", usada por TODA rota, listagem e schema que lê a collection
// "paginas" ([...slug].astro, ListaPaginas.astro, hubs /ajuda/ e /aprenda/).
//
// O site é estático: uma página com `publicado` no futuro já está no repositório, mas só vira
// página (e só aparece em listas, links, JSON-LD e sitemap) no primeiro build depois que a data
// chega. Os builds dos dias de publicação são disparados pela fila
// (scripts/fila-publicacao.mjs, .github/workflows/fila-publicacao.yml e api/publicar-fila.js;
// ver docs/fila-publicacao.md). Toda listagem nova de páginas deve usar estas funções.
//
// `publicado` aceita data simples (2026-10-18, meia-noite UTC: acervo) ou data-hora ISO
// ('2026-11-18T09:30:00.000Z', fila). PUBLICAR_TUDO=1 publica tudo (pré-visualização local).

type DadosPagina = { draft?: boolean; publicado: Date };

export function publicarTudo(): boolean {
  return process.env.PUBLICAR_TUDO === '1';
}

/** Página visível = não é rascunho e `publicado` já passou no momento do build. */
export function estaPublicada(data: DadosPagina, agora: number = Date.now()): boolean {
  if (data.draft) return false;
  if (publicarTudo()) return true;
  return data.publicado.getTime() <= agora;
}

/** Filtro pronto para getCollection('paginas', visivel). */
export const visivel = (p: { data: DadosPagina }): boolean => estaPublicada(p.data);
