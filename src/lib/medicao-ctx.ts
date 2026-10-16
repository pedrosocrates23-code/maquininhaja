// Contexto de medição da página: vai em TODOS os eventos do GA4 (pelo gtag config) e vira tag no Clarity.
// Mantido num módulo só para Consentimento.astro (carrega as tags) e Medicao.astro (dispara os eventos)
// usarem exatamente a mesma classificação.
export type Contexto = { pagina_tipo: string; modelo?: string };

const MODELOS = new Set(['t1', 't2', 't3', 't3-smart']);
const INSTITUCIONAL = new Set(['quem-somos', 'como-testamos', 'transparencia', 'fale-com-a-gente', 'privacidade', 'termos-de-uso']);

export function contexto(caminho: string): Contexto {
  const partes = caminho.split('/').filter(Boolean);
  const [a, b] = partes;
  if (!a) return { pagina_tipo: 'home' };
  if (a === 'modelos') {
    if (!b) return { pagina_tipo: 'modelos_lista' };
    if (MODELOS.has(b)) return { pagina_tipo: 'modelo', modelo: b };
    return { pagina_tipo: 'modelos_guia' };
  }
  if (a === 'quanto-custa') {
    if (!b) return { pagina_tipo: 'taxas' };
    return { pagina_tipo: b === 'calculadora' ? 'calculadora' : 'taxas_guia' };
  }
  if (a === 'ajuda') return { pagina_tipo: b ? 'ajuda_guia' : 'ajuda_hub' };
  if (a === 'aprenda') return { pagina_tipo: b ? 'aprenda_guia' : 'aprenda_hub' };
  if (a === 'renda-extra') return { pagina_tipo: 'renda_extra' };
  if (INSTITUCIONAL.has(a)) return { pagina_tipo: 'institucional' };
  return { pagina_tipo: 'outras' };
}
