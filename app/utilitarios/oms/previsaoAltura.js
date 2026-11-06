// Previsão da altura adulta de uma criança.
//
// São duas leituras diferentes, e a tela mostra as duas porque elas
// respondem a perguntas distintas:
//
//   1. ALTURA-ALVO (alvo genético, método de Tanner)
//      Sai da altura do pai e da mãe. Diz onde a criança DEVERIA chegar
//      pela herança familiar, sem olhar a criança.
//
//   2. PROJEÇÃO PELA CURVA
//      Sai da estatura atual da própria criança. Mantém o escore-z de
//      estatura por idade que ela tem HOJE até os 19 anos, e lê na curva
//      da OMS que altura aquele escore-z representa lá. Diz para onde ela
//      está indo, no ritmo em que está.
//
// A graça está em comparar as duas: criança bem abaixo do alvo genético é
// o achado que leva a investigar (baixa estatura, atraso de crescimento),
// e é por isso que o nutricionista pergunta a altura dos pais.
//
// O QUE ESTE CÁLCULO NÃO É: nem um nem outro é diagnóstico nem promessa.
// Os dois têm margem de erro grande — a altura-alvo carrega ±8,5 cm (dois
// desvios), e a projeção pressupõe que a criança siga o mesmo canal de
// crescimento, o que puberdade adiantada ou atrasada muda. Métodos mais
// precisos (Bayley-Pinneau, Khamis-Roche, Tanner-Whitehouse) pedem
// radiografia de idade óssea ou tabelas que não estão neste aplicativo.
//
// Fontes:
//   Tanner JM, Goldstein H, Whitehouse RH. Standards for children's
//   height at ages 2-9 years allowing for height of parents.
//   Arch Dis Child, 1970.
//   Luo ZC, Albertsson-Wikland K, Karlberg J. Target height as predicted
//   by parental heights in a population-based study.
//   Pediatr Res, 1998.
//   WHO Growth Reference 2007 (estatura por idade, 5-19 anos) para a
//   projeção pela curva.
import { obterTabelaLms } from './tabelasLms';
import {
  interpolarLms,
  calcularZScore,
  medidaNoZScore,
  arredondarZScore,
  zScoreParaPercentil,
} from './calculoLms';
import { DIAS_POR_MES } from '../datas';

// A diferença média de estatura adulta entre homens e mulheres: 13 cm.
// É o número do método de Tanner, e é o que faz o menino somar 6,5 cm à
// média dos pais e a menina subtrair os mesmos 6,5 cm.
export const DIFERENCA_ENTRE_SEXOS_CM = 13;

// A faixa em volta da altura-alvo. São dois desvios padrão da previsão
// (cerca de 4,25 cm cada), e é por isso que ela é tão larga: a altura dos
// pais explica boa parte da altura do filho, não toda ela.
export const MARGEM_DO_ALVO_CM = 8.5;

// Idade em que a OMS fecha a curva de estatura: 228 meses (19 anos). É o
// ponto que a projeção lê — é o mais próximo de "altura adulta" que a
// referência oferece.
export const IDADE_FINAL_MESES = 228;

// Limites de sanidade para a altura dos pais. Não é para recusar gente
// alta ou baixa: é para pegar quem digitou 17 (metros) ou 1700 (milímetros)
// no campo de centímetros.
export const ALTURA_MINIMA_CM = 120;
export const ALTURA_MAXIMA_CM = 230;

const numero = (valor) => {
  const convertido = Number(valor);
  return Number.isFinite(convertido) && convertido > 0 ? convertido : null;
};

export const alturaDePaiMaeValida = (alturaCm) => {
  const altura = numero(alturaCm);
  return altura !== null && altura >= ALTURA_MINIMA_CM && altura <= ALTURA_MAXIMA_CM;
};

// ---------------------------------------------------------------
// 1. Altura-alvo pela altura dos pais (Tanner)
//
//   menino: (pai + mãe + 13) / 2
//   menina: (pai + mãe - 13) / 2
//
// Entra: alturaPaiCm, alturaMaeCm, sexo ('M' | 'F').
// Sai:   { alvo, minimo, maximo, mediaDosPais } em cm, ou null.
// ---------------------------------------------------------------
export const alturaAlvoDosPais = ({ alturaPaiCm, alturaMaeCm, sexo }) => {
  const pai = numero(alturaPaiCm);
  const mae = numero(alturaMaeCm);
  const sexoNormalizado = String(sexo || '').toUpperCase().charAt(0);

  if (!pai || !mae) return null;
  if (sexoNormalizado !== 'M' && sexoNormalizado !== 'F') return null;

  const mediaDosPais = (pai + mae) / 2;
  const ajuste = DIFERENCA_ENTRE_SEXOS_CM / 2;

  const alvo = sexoNormalizado === 'M' ? mediaDosPais + ajuste : mediaDosPais - ajuste;

  return {
    alvo,
    minimo: alvo - MARGEM_DO_ALVO_CM,
    maximo: alvo + MARGEM_DO_ALVO_CM,
    mediaDosPais,
  };
};

// ---------------------------------------------------------------
// 2. Projeção pela curva da OMS
//
// Lê o escore-z de estatura por idade que a criança tem hoje e devolve a
// estatura que esse mesmo escore-z representa aos 19 anos.
//
// Entra: alturaCm, idadeEmMeses, sexo.
// Sai:   { zScore, percentil, projecao, minimo, maximo } ou null quando a
//        idade está fora da curva (a OMS publica de 0 a 228 meses).
//
// O "minimo" e o "maximo" são a projeção de meio desvio para baixo e para
// cima: criança não cresce colada num canal, e uma faixa é mais honesta
// que um número único.
// ---------------------------------------------------------------
export const MARGEM_DA_PROJECAO_Z = 0.5;

export const projetarAlturaPelaCurva = ({ alturaCm, idadeEmMeses, sexo }) => {
  const altura = numero(alturaCm);
  const idade = Number(idadeEmMeses);
  const sexoNormalizado = String(sexo || '').toUpperCase().charAt(0);

  if (!altura || !Number.isFinite(idade) || idade < 0) return null;
  if (sexoNormalizado !== 'M' && sexoNormalizado !== 'F') return null;

  const tabela = obterTabelaLms('estatura_idade', sexoNormalizado);

  const lmsHoje = interpolarLms(tabela, idade);
  const lmsNoFim = interpolarLms(tabela, IDADE_FINAL_MESES);

  // Fora da curva (mais de 19 anos, por exemplo) não há o que projetar.
  if (!lmsHoje || !lmsNoFim) return null;

  const zScore = arredondarZScore(calcularZScore(altura, lmsHoje));

  // A projeção com o escore-z mantido, e a faixa de meio desvio em volta.
  const projecao = medidaNoZScore(zScore, lmsNoFim);
  const minimo = medidaNoZScore(zScore - MARGEM_DA_PROJECAO_Z, lmsNoFim);
  const maximo = medidaNoZScore(zScore + MARGEM_DA_PROJECAO_Z, lmsNoFim);

  return {
    zScore,
    percentil: zScoreParaPercentil(zScore),
    projecao,
    minimo,
    maximo,
    // A estatura média esperada aos 19 anos, para comparação.
    mediaAos19: lmsNoFim.M,
  };
};

// ---------------------------------------------------------------
// As duas leituras juntas, com o que a comparação diz
//
// Entra tudo o que as duas funções acima pedem. Sai:
//   { alvo, projecao, comparacao }
//
// "comparacao" é o que interessa na prática: a criança está indo para
// onde a família aponta, acima, ou abaixo? A diferença é dada em
// centímetros, e o "achado" só aparece quando ela passa da margem — dentro
// da margem, a diferença é ruído do método, não sinal clínico.
// ---------------------------------------------------------------
export const DIFERENCA_RELEVANTE_CM = MARGEM_DO_ALVO_CM;

export const preverAltura = ({
  alturaCm,
  idadeEmMeses,
  sexo,
  alturaPaiCm,
  alturaMaeCm,
}) => {
  const alvo = alturaAlvoDosPais({ alturaPaiCm, alturaMaeCm, sexo });
  const projecao = projetarAlturaPelaCurva({ alturaCm, idadeEmMeses, sexo });

  let comparacao = null;

  if (alvo && projecao) {
    const diferenca = projecao.projecao - alvo.alvo;
    const relevante = Math.abs(diferenca) > DIFERENCA_RELEVANTE_CM;

    comparacao = {
      diferenca,
      relevante,
      // 'acima', 'abaixo' ou 'dentro': é o que a tela usa para escolher o
      // texto e a cor.
      situacao: !relevante ? 'dentro' : diferenca > 0 ? 'acima' : 'abaixo',
    };
  }

  return { alvo, projecao, comparacao };
};

// Idade em meses a partir da idade em dias, para a tela não precisar
// importar a constante.
export const idadeEmMesesDeDias = (idadeEmDias) => idadeEmDias / DIAS_POR_MES;
