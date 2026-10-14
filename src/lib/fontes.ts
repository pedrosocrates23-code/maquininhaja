import fontes from '../data/fontes.json';

type F = { url: string; data: string; trecho: string };

// Ledger oficial (TN-/MK-, gerado de clients/maquininhas por scripts/sync_dados.py) + fontes
// novas coletadas na redação (ids X-<pagina>-NN, um JSON por página em data/fontes-extra/).
const extras = import.meta.glob<Record<string, F>>('../data/fontes-extra/*.json', { eager: true, import: 'default' });
const LEDGER: Record<string, F> = Object.assign({}, fontes as Record<string, F>, ...Object.values(extras));

export function fonte(id: string): F {
  const f = LEDGER[id];
  if (!f) throw new Error(`Fonte inexistente no ledger: ${id}`);
  return f;
}
