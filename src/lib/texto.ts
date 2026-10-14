/** Envolve sequências de algarismos em <span class="n"> para títulos em serifa. Escapa HTML. */
export function dig(t: string) {
  const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/(\d[\d.,]*%?x?)/g, '<span class="n">$1</span>');
}
