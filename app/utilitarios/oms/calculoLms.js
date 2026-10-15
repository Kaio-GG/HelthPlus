// Cálculo do z-score pelo método LMS (Cole & Green), o mesmo usado nas
// tabelas de crescimento da OMS.
//
//   Z = ((X / M)^L - 1) / (L * S)    quando L != 0
//   Z = ln(X / M) / S                quando L == 0
//
// X = medida observada; L, M e S vêm da tabela de referência (por sexo e idade).

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

// Função de distribuição normal (aproximação de Abramowitz & Stegun).
const distribuicaoNormal = (z) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const probabilidade =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - probabilidade : probabilidade;
};

// z-score -> percentil (0 a 100, uma casa decimal)
export const zScoreParaPercentil = (z) => Math.round(distribuicaoNormal(z) * 1000) / 10;
