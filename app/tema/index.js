// Tema do aplicativo Health Plus.
// Reúne cores, espaçamentos, raios e sombras usados em TODAS as telas e
// componentes, para manter o visual igual ao do Figma e facilitar mudanças.

export const cores = {
  // Verdes da identidade visual
  verdeCabecalho: '#5DB582', // faixa verde do topo das telas
  verdeEscuro: '#204D36', // títulos e textos de destaque
  verdeBotao: '#379765', // botões principais
  verdeLink: '#26764A', // links e textos de ação
  verdeClaro: '#D9F2C7', // círculos de ícone, chips ativos
  verdeSuave: '#E7F5EB', // caixas de aviso e fundos leves
  bordaVerde: '#B8D9C3', // bordas de campos e cartões

  // Neutras
  fundo: '#FFF8C9', // fundo creme das telas
  branco: '#FFFFFF',
  preto: '#000000',
  textoPrincipal: '#1F2A24',
  textoSecundario: '#5B6660',
  textoDesabilitado: '#9AA39E',
  linha: '#E4E7E2',
  campoSomenteLeitura: '#EDF3EE',

  // Estados
  alertaFundo: '#FFEFB3',
  alertaTexto: '#8A5A00',
  erro: '#C0392B',
  erroFundo: '#FBE3E0',
  infoFundo: '#E3F1FB',
  infoTexto: '#1F5F8B',
};

export const espacamento = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const raios = {
  pequeno: 10,
  medio: 14,
  grande: 22,
  cartao: 28,
  pilula: 999,
};

export const sombras = {
  cartao: {
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
};

// Quanto o conteúdo "sobe" por cima da curva do cabeçalho verde.
export const SOBREPOSICAO_CABECALHO = 28;
