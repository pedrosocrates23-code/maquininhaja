// Aparelhos: mockup de estúdio (scripts/gerar_mockups.py) montado sobre a foto oficial da Ton, sem redesenhar
// o aparelho (originais e URLs em design/imagens-fonte/ton-oficial/FONTES.md). src = card (1 : 0,82); hero = quadrado.
// Cenas (hero e seções) seguem geradas pelo Codex, com aparelho genérico: a legenda diz isso.
import hero from '../assets/img/hero.jpg';
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

export const IMG = { hero, ajuda, aprenda, calculadora, renda };

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

export const CREDITO_FOTO = 'Foto: divulgação Ton.';
