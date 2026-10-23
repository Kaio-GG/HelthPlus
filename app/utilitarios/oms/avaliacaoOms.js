// Avaliação antropométrica: recebe as medidas e devolve, para cada
// indicador, o escore-z, o percentil e a classificação da OMS.
//
// A sequência é a mesma do WHO Anthro (0 a 5 anos) e do AnthroPlus (5 a 19):
//   1. idade em dias -> idade em meses (365,25/12 dias por mês);
//   2. a idade define a faixa de referência e, com ela, quais indicadores
//      existem;
//   3. o comprimento/estatura é padronizado pela posição da medida;
//   4. cada indicador vira um escore-z pelo método LMS, ajustado nas caudas;
//   5. o escore-z vira uma classificação com nome, pelos pontos de corte
//      daquela faixa.

import {
  arredondarZScore,
  calcularZScore,
  calcularZScoreAjustado,
  interpolarLms,
  zScoreParaPercentil,
} from './calculoLms';
import { limitesDaTabela, obterTabelaLms } from './tabelasLms';
import {
  classificarImcAdulto,
  classificarPerimetroBraquial,
  classificarZScore,
  faixaDaIdade,
  zScoreImplausivel,
  FAIXAS,
} from './faixasOms';
import { calcularIdadeEmDias, DIAS_POR_MES } from '../datas';

// Faixa considerada normal: escore-z entre -2 e +2.
export const LIMITE_INFERIOR_Z = -2;
export const LIMITE_SUPERIOR_Z = 2;

// As referências de crescimento da OMS vão até 19 anos (228 meses).
export const IDADE_MAXIMA_CRESCIMENTO_MESES = 228;

// Diferença entre comprimento (deitado) e estatura (em pé), em cm.
const DIFERENCA_DEITADO_EM_PE_CM = 0.7;

// Até 731 dias (2 anos) a criança deve ser medida deitada; daí em diante, de
// pé. A regra é em dias, não em meses, porque é assim que a OMS a escreve.
const DIAS_LIMITE_DEITADO = 731;

// Reexportado para quem já importava daqui (a tabela mora em faixasOms.js).
export { classificarImcAdulto };

// Calcula o IMC (kg/m²) ou retorna null se faltar algum dado.
//
// O IMC não tem nada de sexo nem de idade: é só peso ÷ altura². Um homem e
// uma mulher de 70 kg e 1,70 m têm o MESMO IMC. O que muda entre eles é a
// leitura desse número — o escore-z e a classificação, que saem de curvas
// separadas por sexo.
export const calcularImc = (pesoKg, alturaCm) => {
  if (!pesoKg || !alturaCm) return null;
  const alturaM = alturaCm / 100;
  return pesoKg / (alturaM * alturaM);
};

// A OMS recomenda corrigir a medida quando a posição não combina com a idade:
// até 2 anos vale o comprimento (deitado) e a partir daí a estatura (em pé).
// Se foi medido na outra posição, ajusta 0,7 cm.
export const ajustarAlturaPelaPosicao = (alturaCm, idadeEmDias, posicao) => {
  if (!alturaCm) return alturaCm;
  if (idadeEmDias < DIAS_LIMITE_DEITADO && posicao === 'de_pe') {
    return alturaCm + DIFERENCA_DEITADO_EM_PE_CM;
  }
  if (idadeEmDias >= DIAS_LIMITE_DEITADO && posicao === 'deitado') {
    return alturaCm - DIFERENCA_DEITADO_EM_PE_CM;
  }
  return alturaCm;
};

// Indicadores em que a OMS usa o escore-z ajustado nas caudas. Estatura por
// idade e perímetro cefálico ficam de fora de propósito (ver calculoLms.js).
const COM_AJUSTE_NAS_CAUDAS = new Set([
  'peso_idade',
  'peso_comprimento',
  'peso_estatura',
  'imc_idade',
  'pb_idade',
  'pct_idade',
  'pcs_idade',
]);

// Calcula um indicador. Retorna { zScore, percentil } ou null quando o eixo
// (idade ou estatura) está fora da cobertura da tabela de referência.
const calcularIndicador = (indicador, sexo, eixo, medida) => {
  if (!medida || eixo === null || eixo === undefined) return null;

  const lms = interpolarLms(obterTabelaLms(indicador, sexo), eixo);
  if (!lms) return null;

  const calcular = COM_AJUSTE_NAS_CAUDAS.has(indicador) ? calcularZScoreAjustado : calcularZScore;
  const zScore = arredondarZScore(calcular(medida, lms));

  return { zScore, percentil: zScoreParaPercentil(zScore) };
};

// Texto do "por que esse indicador não tem resultado", montado a partir dos
// limites da própria tabela — assim a mensagem nunca desencontra dos dados.
const motivoForaDaTabela = (indicador, sexo, unidadeDoEixo) => {
  const limites = limitesDaTabela(indicador, sexo);
  if (!limites) return 'Tabela de referência não incluída';

  if (unidadeDoEixo === 'cm') {
    return `A tabela da OMS vai de ${limites.minimo} a ${limites.maximo} cm`;
  }

  const emIdade = (meses) => (meses % 12 === 0 ? `${meses / 12} anos` : `${meses} meses`);
  if (limites.minimo === 0) return `A OMS publica só até ${emIdade(limites.maximo)}`;
  return `A OMS publica de ${emIdade(limites.minimo)} a ${emIdade(limites.maximo)}`;
};

// Uma casa decimal, com vírgula (o utilitário de formatos é da camada de tela).
const umaCasa = (valor) => valor.toFixed(1).replace('.', ',');

// Entrada:
//   nascimento (Date), sexo ('M' | 'F'), dataVisita (Date),
//   pesoKg, alturaCm, perimetroCefalicoCm, perimetroBracoCm,
//   pregaTricipitalMm, pregaSubescapularMm (números ou null),
//   posicao ('deitado' | 'de_pe')
//
// Saída:
//   { idadeEmDias, idadeEmMeses, faixa, imc, alturaPadronizadaCm, indicadores }
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
  const idadeEmDias = calcularIdadeEmDias(nascimento, dataVisita);
  // Em meses com casas decimais: é esse valor que entra nas tabelas, para um
  // bebê de 45 dias não ser lido como se tivesse 1 mês exato.
  const idadeEmMeses = idadeEmDias / DIAS_POR_MES;
  const faixa = faixaDaIdade(idadeEmMeses) ?? FAIXAS.adulto;

  const alturaPadronizadaCm = ajustarAlturaPelaPosicao(alturaCm, idadeEmDias, posicao);
  // O IMC usa a altura como foi medida, não a padronizada: é a medida real do
  // paciente. A padronização serve para comparar com a curva.
  const imc = calcularImc(pesoKg, alturaCm);

  const indicadores = [];
  const resumo = { idadeEmDias, idadeEmMeses, faixa, imc, alturaPadronizadaCm, indicadores };

  // Monta uma linha de resultado a partir do cálculo do indicador.
  const adicionar = ({ chave, rotulo, medida, unidade, resultado, motivo, extra, referencia }) => {
    if (!resultado) {
      indicadores.push({
        chave,
        rotulo,
        medida,
        unidade,
        zScore: null,
        percentil: null,
        classificacao: null,
        situacao: 'indisponivel',
        motivo,
      });
      return;
    }

    indicadores.push({
      chave,
      rotulo,
      medida,
      unidade,
      zScore: resultado.zScore,
      percentil: resultado.percentil,
      classificacao: classificarZScore(chave, faixa.chave, resultado.zScore),
      situacao: 'calculado',
      // Escore-z muito extremo quase sempre é erro de anotação, não um
      // paciente real. A tela avisa em vez de fingir que o número vale.
      implausivel: zScoreImplausivel(chave, resultado.zScore),
      extra,
      referencia,
    });
  };

  // ---------- Adulto: só o IMC, sem escore-z ----------
  if (faixa.chave === 'adulto') {
    if (imc) {
      indicadores.push({
        chave: 'imc_adulto',
        rotulo: 'IMC',
        medida: imc,
        unidade: 'kg/m²',
        zScore: null,
        percentil: null,
        classificacao: classificarImcAdulto(imc),
        situacao: 'calculado',
        implausivel: false,
        referencia: 'Faixas de IMC da OMS para adultos — não é escore-z',
      });
    }
    return resumo;
  }

  // ---------- Peso por idade (0 a 10 anos) ----------
  if (pesoKg) {
    adicionar({
      chave: 'peso_idade',
      rotulo: 'Peso por idade',
      medida: pesoKg,
      unidade: 'kg',
      resultado: calcularIndicador('peso_idade', sexo, idadeEmMeses, pesoKg),
      motivo: motivoForaDaTabela('peso_idade', sexo, 'meses'),
    });
  }

  // ---------- Comprimento/estatura por idade (0 a 19 anos) ----------
  if (alturaCm) {
    const deitado = posicao === 'deitado';
    adicionar({
      chave: 'estatura_idade',
      rotulo: deitado ? 'Comprimento por idade' : 'Estatura por idade',
      medida: alturaCm,
      unidade: 'cm',
      resultado: calcularIndicador('estatura_idade', sexo, idadeEmMeses, alturaPadronizadaCm),
      motivo: motivoForaDaTabela('estatura_idade', sexo, 'meses'),
      // Quando a posição da medida não combina com a idade, a OMS manda
      // converter antes de comparar com a curva. A tela mostra o valor usado.
      // Diz, em palavras, por que o número comparado com a curva não é o
      // número medido. Sem isso a escolha "deitado / de pé" parece enfeite.
      referencia:
        alturaPadronizadaCm !== alturaCm
          ? `Medido ${deitado ? 'deitado' : 'de pé'}, mas nessa idade a OMS compara ` +
            `com ${deitado ? 'a estatura em pé' : 'o comprimento deitado'}: ` +
            `o cálculo usou ${umaCasa(alturaPadronizadaCm)} cm.`
          : undefined,
    });
  }

  // ---------- IMC por idade (0 a 19 anos) ----------
  if (imc) {
    adicionar({
      chave: 'imc_idade',
      rotulo: 'IMC por idade',
      medida: imc,
      unidade: 'kg/m²',
      resultado: calcularIndicador('imc_idade', sexo, idadeEmMeses, imc),
      motivo: motivoForaDaTabela('imc_idade', sexo, 'meses'),
    });
  }

  // ---------- Daqui para baixo, só a primeira infância ----------
  if (faixa.chave !== 'primeira_infancia') return resumo;

  // ---------- Peso por comprimento (até 2 anos) ou por estatura (daí em diante) ----------
  //
  // Quem escolhe a tabela é a IDADE, não a posição em que a criança foi
  // medida: é o que a OMS faz no Anthro. A posição serve para padronizar a
  // medida em centímetros, logo acima.
  if (pesoKg && alturaCm) {
    const porComprimento = idadeEmDias < DIAS_LIMITE_DEITADO;
    const chave = porComprimento ? 'peso_comprimento' : 'peso_estatura';
    adicionar({
      chave,
      rotulo: porComprimento ? 'Peso por comprimento' : 'Peso por estatura',
      medida: pesoKg,
      unidade: 'kg',
      resultado: calcularIndicador(chave, sexo, alturaPadronizadaCm, pesoKg),
      motivo: motivoForaDaTabela(chave, sexo, 'cm'),
    });
  }

  // ---------- Perímetro cefálico por idade (0 a 5 anos) ----------
  if (perimetroCefalicoCm) {
    adicionar({
      chave: 'pc_idade',
      rotulo: 'Perímetro cefálico por idade',
      medida: perimetroCefalicoCm,
      unidade: 'cm',
      resultado: calcularIndicador('pc_idade', sexo, idadeEmMeses, perimetroCefalicoCm),
      motivo: motivoForaDaTabela('pc_idade', sexo, 'meses'),
    });
  }

  // ---------- Perímetro braquial por idade (3 meses a 5 anos) ----------
  if (perimetroBracoCm) {
    // Além da curva, de 6 a 59 meses o perímetro braquial em centímetros é
    // critério direto de desnutrição aguda. São duas leituras do mesmo número.
    const agudo = classificarPerimetroBraquial(perimetroBracoCm, idadeEmMeses);
    adicionar({
      chave: 'pb_idade',
      rotulo: 'Perímetro braquial por idade',
      medida: perimetroBracoCm,
      unidade: 'cm',
      resultado: calcularIndicador('pb_idade', sexo, idadeEmMeses, perimetroBracoCm),
      motivo: motivoForaDaTabela('pb_idade', sexo, 'meses'),
      extra: agudo ? { rotulo: 'Desnutrição aguda (OMS/UNICEF)', ...agudo } : undefined,
    });
  }

  // ---------- Dobras cutâneas por idade (3 meses a 5 anos) ----------
  if (pregaTricipitalMm) {
    adicionar({
      chave: 'pct_idade',
      rotulo: 'Prega tricipital por idade',
      medida: pregaTricipitalMm,
      unidade: 'mm',
      resultado: calcularIndicador('pct_idade', sexo, idadeEmMeses, pregaTricipitalMm),
      motivo: motivoForaDaTabela('pct_idade', sexo, 'meses'),
    });
  }

  if (pregaSubescapularMm) {
    adicionar({
      chave: 'pcs_idade',
      rotulo: 'Prega subescapular por idade',
      medida: pregaSubescapularMm,
      unidade: 'mm',
      resultado: calcularIndicador('pcs_idade', sexo, idadeEmMeses, pregaSubescapularMm),
      motivo: motivoForaDaTabela('pcs_idade', sexo, 'meses'),
    });
  }

  return resumo;
};
