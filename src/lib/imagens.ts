// Aparelhos: mockup de estúdio (scripts/gerar_mockups.py) montado sobre a foto oficial da Ton, sem redesenhar
// o aparelho (originais e URLs em design/imagens-fonte/ton-oficial/FONTES.md). src = card (1 : 0,82); hero = quadrado.
// Cenas (hero e seções): ilustração gerada pelo Codex com a maquininha Ton real (T3 ou T3 Smart) a partir das fotos
// oficiais; originais em design/imagens-fonte/cenas-ton/ (as versões com aparelho genérico seguem em design/imagens-fonte/).
import hero from '../assets/img/hero.jpg';
// Banner do topo da home (1875 x 839), enviado pelo usuário em 14/10/2026; original em design/imagens-fonte/hero-banner.png.
import heroBanner from '../assets/img/hero-banner.png';
import t1 from '../assets/img/mockup-t1-card.png';
import t2 from '../assets/img/mockup-t2-card.png';
import t3 from '../assets/img/mockup-t3-card.png';
import t3smart from '../assets/img/mockup-t3-smart-card.png';
import t1h from '../assets/img/mockup-t1.png';
import t2h from '../assets/img/mockup-t2.png';
import t3h from '../assets/img/mockup-t3.png';
import t3smarth from '../assets/img/mockup-t3-smart.png';
import ajuda from '../assets/img/secao-ajuda.jpg';
import aprenda from '../assets/img/secao-aprenda.jpg';
import calculadora from '../assets/img/secao-calculadora.jpg';
import renda from '../assets/img/secao-renda.jpg';

// Banner do meio dos guias (BannerMeio.astro): cena do Codex ampliada no Magnific + foto oficial do aparelho,
// montadas por scripts/gerar_banner_meio.py; cenas em design/imagens-fonte/banner-meio/.
import bannerQuiz from '../assets/img/banner-meio-quiz.jpg';
import bannerCalculadora from '../assets/img/banner-meio-calculadora.jpg';
import bannerModelos from '../assets/img/banner-meio-modelos.jpg';

export const IMG = { hero, heroBanner, ajuda, aprenda, calculadora, renda };

export const IMG_BANNER = {
  quiz: { src: bannerQuiz, alt: 'Maquininha Ton T3 verde sobre o balcão de uma pequena loja' },
  calculadora: { src: bannerCalculadora, alt: 'Maquininha Ton T3 Smart verde sobre a mesa de trabalho de um pequeno negócio' },
  modelos: { src: bannerModelos, alt: 'Os quatro modelos da maquininha Ton lado a lado: T1, T2, T3 e T3 Smart' },
};

export const IMG_MODELO = {
  t1: { src: t1, hero: t1h, alt: 'Maquininha Ton T1 verde, de frente, com visor monocromático e teclado numérico' },
  t2: { src: t2, hero: t2h, alt: 'Maquininha Ton T2 verde, de frente, com tela colorida mostrando um QR Code Pix e teclado numérico' },
  t3: { src: t3, hero: t3h, alt: 'Maquininha Ton T3 verde, de frente, com impressora no topo e tela mostrando um QR Code Pix' },
  't3-smart': {
    src: t3smart,
    hero: t3smarth,
    alt: 'Maquininha Ton T3 Smart verde, de frente, com tela grande de toque mostrando um QR Code e teclado físico',
  },
} as const;
