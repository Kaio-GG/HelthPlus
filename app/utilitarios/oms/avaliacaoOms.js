// Avaliação antropométrica: recebe as medidas e devolve o z-score de cada
// indicador, com a classificação usada na tela de resultados.

import { calcularZScore, interpolarLms, zScoreParaPercentil } from './calculoLms';
import { obterTabelaLms } from './tabelasLms';
import { calcularIdadeEmMeses } from '../datas';

// Faixa considerada normal: z-score entre -2 e +2.
export const LIMITE_INFERIOR_Z = -2;
export const LIMITE_SUPERIOR_Z = 2;

// As referências de crescimento da OMS vão até 19 anos (228 meses).
export const IDADE_MAXIMA_CRESCIMENTO_MESES = 19 * 12;

// Acima de 19 anos não existe escore-z da OMS: a referência passa a ser a
// classificação do IMC para adultos, que é outra coisa — faixas fixas, sem
// comparação com curva de crescimento.
// Fonte: WHO, Obesity: preventing and managing the global epidemic (2000).
const FAIXAS_IMC_ADULTO = [
  { ate: 16, nome: 'Magreza grave' },
  { ate: 17, nome: 'Magreza moderada' },
  { ate: 18.5, nome: 'Magreza leve' },
  { ate: 25, nome: 'Eutrofia' },
  { ate: 30, nome: 'Sobrepeso' },
  { ate: 35, nome: 'Obesidade grau I' },
  { ate: 40, nome: 'Obesidade grau II' },
  { ate: Infinity, nome: 'Obesidade grau III' },
];

// IMC -> nome da faixa da OMS para adultos.
export const classificarImcAdulto = (imc) => {
  if (!imc) return null;
  return FAIXAS_IMC_ADULTO.find((faixa) => imc < faixa.ate).nome;
};

// Diferença entre comprimento (deitado) e estatura (em pé), em cm.
const DIFERENCA_DEITADO_EM_PE_CM = 0.7;

// Calcula o IMC (kg/m²) ou retorna null se faltar algum dado.
export const calcularImc = (pesoKg, alturaCm) => {
  if (!pesoKg || !alturaCm) return null;
  const alturaM = alturaCm / 100;
  return pesoKg / (alturaM * alturaM);
};

// A OMS recomenda corrigir a altura quando a posição da medida não combina
// com a idade: menores de 2 anos devem ser medidos DEITADOS (comprimento) e
// maiores de 2 anos EM PÉ (estatura). Se for diferente, ajusta 0,7 cm.
export const ajustarAlturaPelaPosicao = (alturaCm, idadeEmMeses, posicao) => {
  if (!alturaCm) return alturaCm;
  if (idadeEmMeses < 24 && posicao === 'de_pe') return alturaCm + DIFERENCA_DEITADO_EM_PE_CM;
  if (idadeEmMeses >= 24 && posicao === 'deitado') return alturaCm - DIFERENCA_DEITADO_EM_PE_CM;
  return alturaCm;
};

// Calcula um indicador. Retorna { zScore, percentil } ou null quando a idade
// (ou estatura) está fora da cobertura da tabela de referência.
const calcularIndicador = (indicador, sexo, eixo, medida) => {
  const tabela = obterTabelaLms(indicador, sexo);
  const lms = interpolarLms(tabela, eixo);
  if (!lms || !medida) return null;
  const zScore = calcularZScore(medida, lms);
  return { zScore, percentil: zScoreParaPercentil(zScore) };
};

const classificar = (zScore) =>
  zScore >= LIMITE_INFERIOR_Z && zScore <= LIMITE_SUPERIOR_Z ? 'normal' : 'fora';

// Entrada:
//   nascimento (Date), sexo ('M' | 'F'), dataVisita (Date),
//   pesoKg, alturaCm, perimetroCefalicoCm, perimetroBracoCm,
//   pregaTricipitalMm, pregaSubescapularMm (números ou null),
//   posicao ('deitado' | 'de_pe')
// Saída: { idadeEmMeses, imc, indicadores: [...] }
export const avaliarMedidas = ({
  nascimento,
  sexo,
  dataVisita,
  pesoKg,
  alturaCm,
  perimetroCefalicoCm,
  perimetroBracoCm,
  pregaTricipitalMm,
  pregaSubescapularMm,
  posicao,
}) => {
  const idadeEmMeses = calcularIdadeEmMeses(nascimento, dataVisita);
  const alturaAjustada = ajustarAlturaPelaPosicao(alturaCm, idadeEmMeses, posicao);
  const imc = calcularImc(pesoKg, alturaCm);
  const indicadores = [];

  // Monta uma linha de resultado a partir do cálculo do indicador.
  const adicionar = (chave, rotulo, medida, unidade, resultado, motivoSemResultado) => {
    if (resultado) {
      indicadores.push({
        chave, rotulo, medida, unidade,
        zScore: resultado.zScore,
        percentil: resultado.percentil,
        situacao: classificar(resultado.zScore),
      });
    } else {
      indicadores.push({
        chave, rotulo, medida, unidade,
        zScore: null, percentil: null,
        situacao: 'indisponivel',
        motivo: motivoSemResultado,
      });
    }
  };

  const foraDaFaixa = 'Idade fora da faixa da tabela de referência';

  if (pesoKg) {
    adicionar('peso_idade', 'Peso por idade', pesoKg, 'kg',
      calcularIndicador('peso_idade', sexo, idadeEmMeses, pesoKg), foraDaFaixa);
  }
  if (alturaCm) {
    const rotuloAltura = posicao === 'deitado' ? 'Comprimento por idade' : 'Estatura por idade';
    adicionar('estatura_idade', rotuloAltura, alturaCm, 'cm',
      calcularIndicador('estatura_idade', sexo, idadeEmMeses, alturaAjustada), foraDaFaixa);
  }
  if (imc) {
    // Até 19 anos, IMC por idade com escore-z. Depois disso, a OMS não tem
    // curva de crescimento: entra a classificação por faixas de IMC.
    if (idadeEmMeses > IDADE_MAXIMA_CRESCIMENTO_MESES) {
      indicadores.push({
        chave: 'imc_adulto',
        rotulo: 'IMC (adulto)',
        medida: imc,
        unidade: 'kg/m²',
        zScore: null,
        percentil: null,
        classificacao: classificarImcAdulto(imc),
        situacao: imc >= 18.5 && imc < 25 ? 'normal' : 'fora',
        referencia: 'Faixas de IMC da OMS para adultos — não é escore-z',
      });
    } else {
      adicionar('imc_idade', 'IMC por idade', imc, 'kg/m²',
        calcularIndicador('imc_idade', sexo, idadeEmMeses, imc), foraDaFaixa);
    }
  }
  if (pesoKg && alturaCm && idadeEmMeses <= 60) {
    adicionar('peso_estatura', 'Peso por comprimento', pesoKg, 'kg',
      calcularIndicador('peso_estatura', sexo, alturaAjustada, pesoKg),
      'Estatura fora da faixa da tabela de referência');
  }
  if (perimetroCefalicoCm) {
    adicionar('pc_idade', 'PC por idade', perimetroCefalicoCm, 'cm',
      calcularIndicador('pc_idade', sexo, idadeEmMeses, perimetroCefalicoCm), foraDaFaixa);
  }

  // Indicadores sem tabela de referência no projeto (ainda).
  const semTabela = 'Tabela de referência não incluída';
  if (perimetroBracoCm) adicionar('pb_idade', 'PB por idade', perimetroBracoCm, 'cm', null, semTabela);
  if (pregaTricipitalMm) adicionar('pct_idade', 'PCT por idade', pregaTricipitalMm, 'mm', null, semTabela);
  if (pregaSubescapularMm) adicionar('pcs_idade', 'PCS por idade', pregaSubescapularMm, 'mm', null, semTabela);

  return { idadeEmMeses, imc, indicadores };
};
