// Desenhos dos ícones (grade 24x24, traço simples). Cada ícone é uma lista de
// formas:
//   ['caminho', d]                 -> <Path d>
//   ['circulo', cx, cy, r]         -> <Circle>
//   ['retangulo', x, y, l, a, raio]-> <Rect>
//   ['linha', x1, y1, x2, y2]      -> <Line>
//   ['polilinha', pontos]          -> <Polyline>

export const icones = {
  'seta-esquerda': [['linha', 19, 12, 5, 12], ['polilinha', '12 19 5 12 12 5']],
  'seta-direita': [['linha', 5, 12, 19, 12], ['polilinha', '12 5 19 12 12 19']],
  'chevron-esquerda': [['polilinha', '15 18 9 12 15 6']],
  'chevron-direita': [['polilinha', '9 18 15 12 9 6']],
  'chevron-baixo': [['polilinha', '6 9 12 15 18 9']],
  olho: [['caminho', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'], ['circulo', 12, 12, 3]],
  'olho-fechado': [
    ['caminho', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'],
    ['linha', 1, 1, 23, 23],
  ],
  cadeado: [['retangulo', 3, 11, 18, 11, 2], ['caminho', 'M7 11V7a5 5 0 0 1 10 0v4']],
  check: [['polilinha', '20 6 9 17 4 12']],
  calendario: [
    ['retangulo', 3, 4, 18, 18, 2],
    ['linha', 16, 2, 16, 6], ['linha', 8, 2, 8, 6], ['linha', 3, 10, 21, 10],
  ],
  relogio: [['circulo', 12, 12, 10], ['polilinha', '12 6 12 12 16 14']],
  lupa: [['circulo', 11, 11, 8], ['linha', 21, 21, 16.65, 16.65]],
  info: [['circulo', 12, 12, 10], ['linha', 12, 16, 12, 12], ['linha', 12, 8, 12.01, 8]],
  email: [
    ['caminho', 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'],
    ['polilinha', '22 6 12 13 2 6'],
  ],
  casa: [['caminho', 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'], ['polilinha', '9 22 9 12 15 12 15 22']],
  usuario: [['caminho', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'], ['circulo', 12, 7, 4]],
  usuarios: [
    ['caminho', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'], ['circulo', 9, 7, 4],
    ['caminho', 'M23 21v-2a4 4 0 0 0-3-3.87'], ['caminho', 'M16 3.13a4 4 0 0 1 0 7.75'],
  ],
  'usuario-mais': [
    ['caminho', 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'], ['circulo', 8.5, 7, 4],
    ['linha', 20, 8, 20, 14], ['linha', 23, 11, 17, 11],
  ],
  mais: [['linha', 12, 5, 12, 19], ['linha', 5, 12, 19, 12]],
  editar: [['caminho', 'M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z']],
  copiar: [['retangulo', 9, 9, 13, 13, 2], ['caminho', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1']],
  arquivar: [['polilinha', '21 8 21 21 3 21 3 8'], ['retangulo', 1, 3, 22, 5, 1], ['linha', 10, 12, 14, 12]],
  sino: [['caminho', 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'], ['caminho', 'M13.73 21a2 2 0 0 1-3.46 0']],
  sair: [['caminho', 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'], ['polilinha', '16 17 21 12 16 7'], ['linha', 21, 12, 9, 12]],
  escudo: [['caminho', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']],
  fechar: [['linha', 18, 6, 6, 18], ['linha', 6, 6, 18, 18]],
  calculadora: [
    ['retangulo', 4, 2, 16, 20, 2], ['linha', 8, 6, 16, 6],
    ['linha', 8, 10, 8.01, 10], ['linha', 12, 10, 12.01, 10], ['linha', 16, 10, 16.01, 10],
    ['linha', 8, 14, 8.01, 14], ['linha', 12, 14, 12.01, 14], ['linha', 16, 14, 16.01, 14],
    ['linha', 8, 18, 12, 18],
  ],
  prancheta: [
    ['caminho', 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'],
    ['retangulo', 8, 2, 8, 4, 1],
  ],
  gota: [['caminho', 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z']],
  'cartao-credito': [['retangulo', 1, 4, 22, 16, 2], ['linha', 1, 10, 23, 10]],
  alerta: [['circulo', 12, 12, 10], ['linha', 12, 8, 12, 12], ['linha', 12, 16, 12.01, 16]],
  enviar: [['linha', 22, 2, 11, 13], ['caminho', 'M22 2L15 22l-4-9-9-4 20-7z']],
  grafico: [['polilinha', '3 17 9 11 13 15 21 7'], ['polilinha', '15 7 21 7 21 13']],
  prato: [['circulo', 12, 12, 10], ['circulo', 12, 12, 5]],
};
