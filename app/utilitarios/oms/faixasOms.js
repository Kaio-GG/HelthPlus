// As três faixas de referência da OMS e as classificações de cada indicador.
//
// A OMS não tem uma referência só: ela tem padrões diferentes, com
// indicadores e pontos de corte diferentes, e é por isso que as ferramentas
// dela são dois programas separados (Anthro, de 0 a 5 anos, e AnthroPlus, de
// 5 a 19). O aplicativo segue a mesma divisão.

// ---------------------------------------------------------------
// Faixas
// ---------------------------------------------------------------

// O padrão de 2006 vai até 60 meses (5 anos completos); o de 2007 começa no
// mês seguinte e vai até 228 meses (19 anos). Acima disso não existe curva de
// crescimento da OMS: entra a classificação do IMC para adultos.
export const FAIXAS = {
  primeira_infancia: {
    chave: 'primeira_infancia',
    rotulo: '0 a 5 anos',
    titulo: 'Crianças de 0 a 5 anos',
    resumo: 'Peso, estatura, IMC, perímetros e dobras cutâneas.',
    fonte: 'WHO Child Growth Standards 2006',
    icone: 'usuario',
    mesInicial: 0,
    mesFinal: 60,
    // Nessa faixa a criança pode ser medida deitada (comprimento) ou de pé
    // (estatura), e isso muda a tabela de referência usada.
    pedePosicao: true,
    campos: [
      'peso',
      'altura',
      'perimetroCefalico',
      'perimetroBraco',
      'pregaTricipital',
      'pregaSubescapular',
    ],
  },
  escolar_adolescente: {
    chave: 'escolar_adolescente',
    rotulo: '5 a 19 anos',
    titulo: 'Crianças e adolescentes de 5 a 19 anos',
    resumo: 'Estatura e IMC por idade. Peso por idade até 10 anos.',
    fonte: 'WHO Growth Reference 2007',
    icone: 'usuarios',
    mesInicial: 61,
    mesFinal: 228,
    pedePosicao: false,
    campos: ['peso', 'altura'],
  },
  adulto: {
    chave: 'adulto',
    rotulo: '20 anos ou mais',
    titulo: 'Adultos',
    resumo: 'IMC pelas faixas da OMS para adultos, sem escore-z.',
    fonte: 'WHO, Obesity: preventing and managing the global epidemic (2000)',
    icone: 'prancheta',
    mesInicial: 229,
    mesFinal: Infinity,
    pedePosicao: false,
    campos: ['peso', 'altura'],
  },
};

export const LISTA_DE_FAIXAS = [
  FAIXAS.primeira_infancia,
  FAIXAS.escolar_adolescente,
  FAIXAS.adulto,
];

// Idade em meses -> a faixa a que ela pertence.
export const faixaDaIdade = (idadeEmMeses) => {
  if (idadeEmMeses === null || idadeEmMeses === undefined) return null;
  return (
    LISTA_DE_FAIXAS.find(
      (faixa) => idadeEmMeses >= faixa.mesInicial && idadeEmMeses <= faixa.mesFinal
    ) ?? null
  );
};

export const obterFaixa = (chave) => FAIXAS[chave] ?? null;

// ---------------------------------------------------------------
// Classificações por escore-z
// ---------------------------------------------------------------
//
// Cada lista vai do pior para o melhor caso e é lida de cima para baixo: o
// primeiro item cujo "ate" é maior que o escore-z vence. O campo "tom" é o
// que a tela usa para colorir.
//
// Fonte dos pontos de corte: WHO Child Growth Standards 2006 e WHO Growth
// Reference 2007 — os mesmos adotados pelo SISVAN/Ministério da Saúde.

const ate = (limite, nome, tom) => ({ ate: limite, nome, tom });

// Peso por idade — vale de 0 a 10 anos (acima disso a OMS não publica).
const PESO_IDADE = [
  ate(-3, 'Peso muito baixo para a idade', 'risco'),
  ate(-2, 'Peso baixo para a idade', 'atencao'),
  ate(2, 'Peso adequado para a idade', 'adequado'),
  ate(Infinity, 'Peso elevado para a idade', 'atencao'),
];

// Estatura (ou comprimento) por idade — 0 a 19 anos.
const ESTATURA_IDADE = [
  ate(-3, 'Muito baixa estatura para a idade', 'risco'),
  ate(-2, 'Baixa estatura para a idade', 'atencao'),
  ate(Infinity, 'Estatura adequada para a idade', 'adequado'),
];

// IMC por idade e peso por comprimento/estatura, de 0 a 5 anos. Nessa faixa a
// OMS separa "risco de sobrepeso" (entre +1 e +2), que não existe depois.
const MAGREZA_A_OBESIDADE_0_5 = [
  ate(-3, 'Magreza acentuada', 'risco'),
  ate(-2, 'Magreza', 'atencao'),
  ate(1, 'Eutrofia', 'adequado'),
  ate(2, 'Risco de sobrepeso', 'atencao'),
  ate(3, 'Sobrepeso', 'atencao'),
  ate(Infinity, 'Obesidade', 'risco'),
];

// IMC por idade de 5 a 19 anos: o sobrepeso começa em +1 e a obesidade em +2.
const MAGREZA_A_OBESIDADE_5_19 = [
  ate(-3, 'Magreza acentuada', 'risco'),
  ate(-2, 'Magreza', 'atencao'),
  ate(1, 'Eutrofia', 'adequado'),
  ate(2, 'Sobrepeso', 'atencao'),
  ate(3, 'Obesidade', 'risco'),
  ate(Infinity, 'Obesidade grave', 'risco'),
];

// A OMS publica a curva de perímetro cefálico, mas não nomes de
// classificação para ela: o que se usa é a faixa de -2 a +2, e o que cai
// fora é achado para investigar, não diagnóstico.
const PERIMETRO_CEFALICO = [
  ate(-2, 'Abaixo do esperado — investigar', 'atencao'),
  ate(2, 'Dentro do esperado', 'adequado'),
  ate(Infinity, 'Acima do esperado — investigar', 'atencao'),
];

// Perímetro braquial e dobras cutâneas: a OMS publica as curvas, mas não uma
// classificação nominal por escore-z. Fica a faixa de referência.
const FAIXA_SIMPLES = [
  ate(-2, 'Abaixo da faixa de referência', 'atencao'),
  ate(2, 'Dentro da faixa de referência', 'adequado'),
  ate(Infinity, 'Acima da faixa de referência', 'atencao'),
];

// Indicador + faixa -> tabela de classificação.
const CLASSIFICACOES = {
  peso_idade: () => PESO_IDADE,
  estatura_idade: () => ESTATURA_IDADE,
  imc_idade: (faixa) =>
    faixa === 'primeira_infancia' ? MAGREZA_A_OBESIDADE_0_5 : MAGREZA_A_OBESIDADE_5_19,
  peso_comprimento: () => MAGREZA_A_OBESIDADE_0_5,
  peso_estatura: () => MAGREZA_A_OBESIDADE_0_5,
  pc_idade: () => PERIMETRO_CEFALICO,
  pb_idade: () => FAIXA_SIMPLES,
  pct_idade: () => FAIXA_SIMPLES,
  pcs_idade: () => FAIXA_SIMPLES,
};

// Escore-z -> { nome, tom } segundo os pontos de corte do indicador.
export const classificarZScore = (indicador, faixa, zScore) => {
  const montar = CLASSIFICACOES[indicador];
  if (!montar || zScore === null || zScore === undefined) return null;
  const tabela = montar(faixa);
  return tabela.find((item) => zScore < item.ate) ?? tabela[tabela.length - 1];
};

// ---------------------------------------------------------------
// IMC de adulto (20 anos ou mais)
// ---------------------------------------------------------------
// Fonte: WHO, Obesity: preventing and managing the global epidemic (2000).
const FAIXAS_IMC_ADULTO = [
  ate(16, 'Magreza grave', 'risco'),
  ate(17, 'Magreza moderada', 'atencao'),
  ate(18.5, 'Magreza leve', 'atencao'),
  ate(25, 'Eutrofia', 'adequado'),
  ate(30, 'Sobrepeso', 'atencao'),
  ate(35, 'Obesidade grau I', 'risco'),
  ate(40, 'Obesidade grau II', 'risco'),
  ate(Infinity, 'Obesidade grau III', 'risco'),
];

// IMC -> { nome, tom } da faixa da OMS para adultos.
export const classificarImcAdulto = (imc) => {
  if (!imc) return null;
  return FAIXAS_IMC_ADULTO.find((faixa) => imc < faixa.ate);
};

// ---------------------------------------------------------------
// Perímetro braquial: desnutrição aguda (6 a 59 meses)
// ---------------------------------------------------------------
//
// Além do escore-z, a OMS usa o perímetro braquial em centímetros como
// critério direto de desnutrição aguda em crianças de 6 a 59 meses. É uma
// leitura separada da curva, e vale só nessa idade.
// Fonte: WHO/UNICEF, joint statement on the management of severe acute
// malnutrition (2009).
export const MB_IDADE_MINIMA_MESES = 6;
export const MB_IDADE_MAXIMA_MESES = 59;

export const classificarPerimetroBraquial = (perimetroCm, idadeEmMeses) => {
  if (!perimetroCm) return null;
  if (idadeEmMeses < MB_IDADE_MINIMA_MESES || idadeEmMeses > MB_IDADE_MAXIMA_MESES) return null;
  if (perimetroCm < 11.5) return { nome: 'Desnutrição aguda grave', tom: 'risco' };
  if (perimetroCm < 12.5) return { nome: 'Desnutrição aguda moderada', tom: 'atencao' };
  return { nome: 'Sem desnutrição aguda', tom: 'adequado' };
};

// ---------------------------------------------------------------
// Medidas implausíveis
// ---------------------------------------------------------------
//
// O WHO Anthro marca como implausível o escore-z muito extremo: quase sempre
// é erro de anotação (peso em gramas, altura em metros, data de nascimento
// trocada) e não uma criança real. Os limites abaixo são os do próprio
// programa da OMS.
const LIMITES_PLAUSIVEIS = {
  peso_idade: [-6, 5],
  estatura_idade: [-6, 6],
  imc_idade: [-5, 5],
  peso_comprimento: [-5, 5],
  peso_estatura: [-5, 5],
  pc_idade: [-5, 5],
  pb_idade: [-5, 5],
  pct_idade: [-5, 5],
  pcs_idade: [-5, 5],
};

export const zScoreImplausivel = (indicador, zScore) => {
  const limites = LIMITES_PLAUSIVEIS[indicador];
  if (!limites || zScore === null || zScore === undefined) return false;
  return zScore < limites[0] || zScore > limites[1];
};
