// Cálculo do escore-z pelo método LMS (Cole & Green), o mesmo usado nas
// tabelas de crescimento da OMS.
//
//   Z = ((X / M)^L - 1) / (L * S)    quando L != 0
//   Z = ln(X / M) / S                quando L == 0
//
// X = medida observada; L, M e S vêm da tabela de referência (por sexo e idade).
//
// Fonte: WHO Child Growth Standards, capítulo 7 (Computation of centiles and
// z-scores), e a implementação de referência da OMS em
// WorldHealthOrganization/anthro, R/z-score-helper.R.

// Procura na tabela os dois pontos vizinhos de "x" e interpola entre eles.
// Se "x" estiver fora do intervalo da tabela, retorna null (não extrapolamos,
// para nunca mostrar um valor inventado).
export const interpolarLms = (tabela, x) => {
  if (!tabela || tabela.length === 0) return null;
  if (x < tabela[0].idade || x > tabela[tabela.length - 1].idade) return null;

  for (let i = 0; i < tabela.length - 1; i += 1) {
    const inicio = tabela[i];
    const fim = tabela[i + 1];
    if (x >= inicio.idade && x <= fim.idade) {
      const fracao = (x - inicio.idade) / (fim.idade - inicio.idade);
      return {
        L: inicio.L + fracao * (fim.L - inicio.L),
        M: inicio.M + fracao * (fim.M - inicio.M),
        S: inicio.S + fracao * (fim.S - inicio.S),
      };
    }
  }
  return null;
};

export const calcularZScore = (medida, { L, M, S }) => {
  if (Math.abs(L) < 1e-9) return Math.log(medida / M) / S;
  return (Math.pow(medida / M, L) - 1) / (L * S);
};

// A medida que corresponde a um escore-z inteiro (ex.: o peso do +3 DP).
const medidaNoDesvio = (desvio, { L, M, S }) => {
  if (Math.abs(L) < 1e-9) return M * Math.exp(S * desvio);
  return M * Math.pow(1 + L * S * desvio, 1 / L);
};

// Escore-z AJUSTADO.
//
// Fora de -3 e +3 a distribuição LMS deixa de descrever bem a cauda, e um
// peso pouco acima do +3 DP viraria um escore-z absurdo. A OMS resolve isso
// medindo, dali para fora, em "larguras do último desvio":
//
//   Z > 3   ->   3 + (X - SD3pos) / (SD3pos - SD2pos)
//   Z < -3  ->  -3 + (X - SD3neg) / (SD2neg - SD3neg)
//
// A OMS aplica esse ajuste em peso por idade, peso por comprimento/estatura,
// IMC por idade, perímetro braquial e dobras cutâneas — e NÃO aplica em
// estatura por idade nem em perímetro cefálico.
export const calcularZScoreAjustado = (medida, lms) => {
  const zScore = calcularZScore(medida, lms);

  if (zScore > 3) {
    const sd3 = medidaNoDesvio(3, lms);
    const largura = sd3 - medidaNoDesvio(2, lms);
    return 3 + (medida - sd3) / largura;
  }
  if (zScore < -3) {
    const sd3 = medidaNoDesvio(-3, lms);
    const largura = medidaNoDesvio(-2, lms) - sd3;
    return -3 + (medida - sd3) / largura;
  }
  return zScore;
};

// A OMS publica o escore-z com duas casas; arredondar aqui evita que a tela
// mostre um número e a classificação use outro.
export const arredondarZScore = (zScore) => Math.round(zScore * 100) / 100;

// Função de distribuição normal (aproximação de Abramowitz & Stegun).
const distribuicaoNormal = (z) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const probabilidade =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - probabilidade : probabilidade;
};

// escore-z -> percentil (0 a 100, uma casa decimal)
export const zScoreParaPercentil = (z) => Math.round(distribuicaoNormal(z) * 1000) / 10;
