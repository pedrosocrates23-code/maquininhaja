// Ficha de cada modelo, montada a partir da pesquisa de 13/10/2026.
// Cada campo tem fonte no ledger (ids TN-Fxxx, ver src/data/fontes.json).
// Preço é promocional e muda sem aviso: a página sempre mostra a data da verificação.

export type Modelo = {
  slug: 't1' | 't2' | 't3' | 't3-smart';
  nome: string;
  apelido: string; // como a Ton descreve o modelo, entre aspas na página
  tipo: string;
  preco: number;
  precoDe: number;
  parcela: string;
  conexao: string;
  impressora: string;
  pix: string;
  nfc: string;
  precisaCelular: boolean;
  parcelasMax: number;
  parcelasNota?: string; // quando as fontes oficiais divergem
  vouchers: string;
  hardware: string;
  serve: string;
  naoServe: string;
  conflito?: { texto: string; fontes: string[] };
  urlOficial: string;
  fontePagina: string; // página oficial do modelo (apelido, preço, parcela)
  comissaoMin: number; // R$ pagos ao parceiro por cliente novo (nível Cliente/Iniciante)
  fontes: string[];
};

export const MODELOS: Modelo[] = [
  {
    slug: 't1',
    nome: 'Ton T1',
    apelido: 'a compacta que conecta com seu celular',
    tipo: 'Leitor Bluetooth (depende do celular)',
    preco: 16.8,
    precoDe: 56.57,
    parcela: '12x de R$ 1,40',
    conexao: 'Bluetooth com o celular, que precisa ter internet',
    impressora: 'Não. Comprovante por SMS',
    pix: 'Não aceita Pix na maquininha',
    nfc: 'Sim',
    precisaCelular: true,
    parcelasMax: 12,
    vouchers: 'A tabela de comparação da Ton marca "Sim" para vale-alimentação e refeição; o aviso de vouchers cita só T2, T3 e T3 Smart',
    hardware: 'D175BT, D177, D180 ou MP15',
    serve: 'Quem vende pouco, já anda com o celular carregado e quer o menor custo de entrada.',
    naoServe: 'Quem precisa de Pix na maquininha, comprovante impresso ou vender sem depender do celular.',
    conflito: {
      texto: 'Vale-alimentação na T1: a tabela de comparação diz que aceita; o aviso de bandeiras lista só T2, T3 e T3 Smart.',
      fontes: ['TN-F069', 'TN-F074'],
    },
    urlOficial: 'https://www.ton.com.br/maquininha/t1',
    fontePagina: 'TN-F061',
    comissaoMin: 40,
    fontes: ['TN-F059', 'TN-F061', 'TN-F065', 'TN-F069', 'TN-F070', 'TN-F075', 'TN-F091'],
  },
  {
    slug: 't2',
    nome: 'Ton T2',
    apelido: 'a compacta que tá sempre com você',
    tipo: 'Maquininha com chip, sem impressora',
    preco: 49.88,
    precoDe: 176,
    parcela: '12x de R$ 4,16',
    conexao: 'Chip grátis e Wi-Fi',
    impressora: 'Não. Comprovante por SMS',
    pix: 'Pix QR Code ou Pix por aproximação',
    nfc: 'Sim',
    precisaCelular: false,
    parcelasMax: 12,
    parcelasNota: '12x na página de maquininhas; dois posts do blog da Ton falam em 18x e 21x, menos a D188',
    vouchers: 'Alelo, Pluxee, Ticket, Up Brasil e VR, só em cadastro com CNPJ',
    hardware: 'D195, MP35, D188 ou D199 Touch',
    serve: 'Quem vende na rua ou em domicílio e quer independência do celular, com Pix na própria máquina.',
    naoServe: 'Quem precisa entregar comprovante impresso no balcão.',
    conflito: {
      texto: 'Conexão: a página da T2 diz "Chip 3G grátis"; a tabela de comparação diz "Chip 4G e Wi-Fi"; a ajuda diz "3G ou 4G".',
      fontes: ['TN-F066', 'TN-F069', 'TN-F092'],
    },
    urlOficial: 'https://www.ton.com.br/maquininha/t2',
    fontePagina: 'TN-F062',
    comissaoMin: 50,
    fontes: ['TN-F062', 'TN-F066', 'TN-F069', 'TN-F070', 'TN-F074', 'TN-F092'],
  },
  {
    slug: 't3',
    nome: 'Ton T3',
    apelido: 'a parceira do empreendedor brasileiro',
    tipo: 'Maquininha com chip e impressora',
    preco: 108,
    precoDe: 391.92,
    parcela: '12x de R$ 9,00',
    conexao: 'Chip grátis e Wi-Fi',
    impressora: 'Sim, com bobina grátis. Também envia por SMS',
    pix: 'Pix QR Code ou Pix por aproximação',
    nfc: 'Sim',
    precisaCelular: false,
    parcelasMax: 21,
    vouchers: 'Alelo, Pluxee, Ticket, Up Brasil e VR, só em cadastro com CNPJ',
    hardware: 'S920, Q60, Q92, D230 ou MP35P',
    serve: 'Balcão: comércio que entrega comprovante impresso e vende parcelado acima de 12x.',
    naoServe: 'Quem só faz poucas vendas por mês e não precisa de papel.',
    conflito: {
      texto: 'Conexão: a página da T3 e a ajuda oficial dizem "chip 3G"; a tabela de comparação diz "Chip 4G e Wi-Fi".',
      fontes: ['TN-F067', 'X-modelo-t3-01', 'TN-F069'],
    },
    urlOficial: 'https://www.ton.com.br/maquininha/t3',
    fontePagina: 'TN-F063',
    comissaoMin: 150,
    fontes: ['TN-F063', 'TN-F067', 'TN-F069', 'TN-F070', 'TN-F074', 'X-modelo-t3-01'],
  },
  {
    slug: 't3-smart',
    nome: 'Ton T3 Smart',
    apelido: 'a completa que nunca te deixa na mão',
    tipo: 'Smart POS Android com impressora',
    preco: 191.88,
    precoDe: 671.43,
    parcela: '12x de R$ 15,99',
    conexao: 'Chip 4G grátis e Wi-Fi',
    impressora: 'Sim, com bobina grátis. Também envia por SMS',
    pix: 'Pix QR Code ou Pix por aproximação',
    nfc: 'Sim',
    precisaCelular: false,
    parcelasMax: 21,
    vouchers: 'Alelo, Pluxee, Ticket, Up Brasil e VR, só em cadastro com CNPJ',
    hardware: 'L3, P2, GPOS700X, GPOS760 ou T19',
    serve: 'Quem vende o dia todo, quer tela touch, Android e bateria que aguente o expediente.',
    naoServe: 'Quem vende pouco: o aparelho custa R$ 83,88 a mais que a T3 e as taxas são as mesmas.',
    urlOficial: 'https://www.ton.com.br/maquininha/t3-smart',
    fontePagina: 'TN-F064',
    comissaoMin: 170,
    fontes: ['TN-F064', 'TN-F068', 'TN-F069', 'TN-F070', 'TN-F074', 'X-modelo-t3-smart-01'],
  },
];

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

export const pctBR = (v: number) => `${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

export const modelo = (slug: string) => {
  const m = MODELOS.find((x) => x.slug === slug);
  if (!m) throw new Error(`modelo desconhecido: ${slug}`);
  return m;
};
