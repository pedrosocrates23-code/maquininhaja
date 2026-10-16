// Configuração única do site. Tudo que depende de decisão do dono do site (Fase 0)
// está marcado com PENDENTE: o script `npm run check:pendencias` reprova o build de
// produção enquanto alguma dessas marcas aparecer no HTML gerado.

export const SITE = {
  nome: 'Maquininha Já',
  dominio: 'maquininhaja.com.br',
  url: 'https://maquininhaja.com.br',
  descricao:
    'Site independente sobre as maquininhas Ton: modelos, taxas por faixa de faturamento, quando cai o dinheiro e como resolver problemas.',
  // Data em que preços, taxas e regras foram conferidos nas fontes oficiais.
  verificadoEm: '2026-10-13',
  verificadoEmTexto: '13 de outubro de 2026',
  idioma: 'pt-BR',
  locale: 'pt_BR',
  // Contato do site (não é o atendimento da Ton). Criar a caixa quando o domínio for registrado.
  email: 'contato@maquininhaja.com.br',
  // false enquanto o domínio publicar MX nulo ("0 ."): o e-mail some do JSON-LD. Virar true só depois de testar o recebimento.
  emailAtivo: false,
  // Quem responde pelo site e pelos dados pessoais (LGPD art. 5º, VI). Nome civil ou razão social sem "Ton".
  responsavel: 'PENDENTE: nome ou razão social do responsável pelo site',
  documentoResponsavel: 'PENDENTE: CPF ou CNPJ do responsável',
  // GA4 e Clarity só carregam depois do consentimento. Vazio = nenhum script de terceiros no site.
  ga4: import.meta.env.PUBLIC_GA4_ID ?? 'G-BEFSW89Y99',
  clarity: import.meta.env.PUBLIC_CLARITY_ID ?? 'yylkwb2llv',
} as const;

// Link de indicação do Renda Extra Ton, um por modelo (app Ton > Renda Extra), em
// src/data/links.json. Enquanto o cadastro no programa não sair, /link/<modelo>/ leva à
// página oficial do modelo, sem comissão. Trocar o JSON e rodar o build: nenhuma página muda.
export { default as LINKS_INDICACAO } from './links.json';
// true quando links.json tiver os links de indicação reais (cupom de 5% do programa, TN-F042).
export const PROGRAMA_ATIVO = true;

// Frases que mudam com o estado real no programa. Nada afirma parceria ou comissão antes do cadastro.
export const STATUS = PROGRAMA_ATIVO
  ? {
      selo: 'Parceiro Ton',
      receita: 'Recebemos comissão quando você pede pelos nossos links.',
      linkReceita: 'Como ganhamos dinheiro',
      legal: 'é um site independente de Parceiro Ton, participante do programa Renda Extra Ton.',
      quem: 'Participamos do programa Renda Extra Ton.',
    }
  : {
      selo: 'Site independente',
      receita: 'Hoje não recebemos comissão: os botões levam ao site oficial da Ton.',
      linkReceita: 'Transparência',
      legal: 'é um site independente sobre as maquininhas Ton. Ainda não participa do programa de parceiros Renda Extra Ton e não recebe comissão.',
      quem: 'Ainda não participamos do programa de parceiros da Ton e não recebemos comissão.',
    };


export const NAV = [
  { href: '/modelos/', label: 'Modelos' },
  { href: '/quanto-custa/', label: 'Quanto custa' },
  { href: '/quanto-custa/calculadora/', label: 'Calculadora' },
  { href: '/ajuda/', label: 'Ajuda' },
  { href: '/aprenda/', label: 'Aprenda' },
];
