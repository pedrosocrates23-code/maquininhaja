// Imagens geradas pelo Codex (design/imagens-fonte). São ilustrações de aparelhos genéricos,
// sem marca: o alt e a legenda dizem isso, para não passar ilustração por foto do produto.
import hero from '../assets/img/hero.jpg';
import t1 from '../assets/img/modelo-t1.jpg';
import t2 from '../assets/img/modelo-t2.jpg';
import t3 from '../assets/img/modelo-t3.jpg';
import t3smart from '../assets/img/modelo-t3-smart.jpg';
import tapton from '../assets/img/modelo-tapton.jpg';
import ajuda from '../assets/img/secao-ajuda.jpg';
import aprenda from '../assets/img/secao-aprenda.jpg';
import calculadora from '../assets/img/secao-calculadora.jpg';
import renda from '../assets/img/secao-renda.jpg';

export const IMG = { hero, ajuda, aprenda, calculadora, renda };

export const IMG_MODELO = {
  t1: { src: t1, alt: 'Ilustração de um leitor de cartão compacto ao lado de um celular (aparelho genérico, não é foto da Ton T1)' },
  t2: { src: t2, alt: 'Ilustração de uma maquininha compacta com teclado e sem impressora (aparelho genérico, não é foto da Ton T2)' },
  t3: { src: t3, alt: 'Ilustração de uma maquininha com impressora de comprovante (aparelho genérico, não é foto da Ton T3)' },
  't3-smart': {
    src: t3smart,
    alt: 'Ilustração de uma maquininha smart com tela de toque e impressora (aparelho genérico, não é foto da Ton T3 Smart)',
  },
  tapton: { src: tapton, alt: 'Ilustração de um cartão encostando no verso de um celular para pagar por aproximação' },
} as const;
