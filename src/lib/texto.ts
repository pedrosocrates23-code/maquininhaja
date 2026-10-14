/** Envolve sequências de algarismos em <span class="n"> para títulos em serifa. Escapa HTML. */
export function dig(t: string) {
  const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/(\d[\d.,]*%?x?)/g, '<span class="n">$1</span>');
}

/** Nome de modelo ("Ton T3 Smart") em duas partes: marca discreta, modelo em destaque. Estilo em .nome-modelo (global.css). */
export function nomeModelo(nome: string) {
  const esc = nome.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const m = esc.match(/^(Ton)\s+(.+)$/);
  if (!m) return `<span class="nm-modelo">${esc}</span>`;
  return `<span class="nm-marca">${m[1]}</span> <span class="nm-modelo">${m[2]}</span>`;
}
