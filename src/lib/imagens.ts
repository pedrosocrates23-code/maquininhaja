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
// Mockup do simulador do site (scripts/gerar_mockup_sobra.py): molde de celulares do Codex + telas com os números de taxas.json.
import sobra from '../assets/img/mockup-sobra.png';

export const IMG = { hero, heroBanner, ajuda, aprenda, calculadora, renda, sobra };

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
