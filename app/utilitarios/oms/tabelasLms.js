// Tabelas de referência LMS usadas pela calculadora.
//
// Os arquivos da pasta "dados" são os OFICIAIS da OMS, convertidos das
// tabelas publicadas em:
//   0-5 anos  — WHO Child Growth Standards 2006
//               https://www.who.int/tools/child-growth-standards/standards
//   5-19 anos — WHO Growth Reference 2007
//               https://www.who.int/tools/growth-reference-data-for-5to19-years
//
// A fonte dos valores diários é a implementação de referência da própria
// OMS (repositórios WorldHealthOrganization/anthro e /anthroplus, pasta
// data-raw/growthstandards). Cada curva tem um ponto por mês — o mês M
// corresponde ao dia M × 365,25/12, com L, M e S interpolados entre os dois
// dias vizinhos, que é como a OMS monta as tabelas mensais publicadas.
//
// Ao atualizar, mantenha o formato { points: [...] } ou { boys, girls } com
// { age, L, M, S } e refaça a conferência contra a tabela publicada.

import pesoIdadeMeninos from './dados/weight_for_age_boys.json';
import pesoIdadeMeninas from './dados/weight_for_age_girls.json';
import pesoIdade510 from './dados/weight_for_age_5_10.json';
import estaturaIdadeMeninos05 from './dados/height_for_age_boys.json';
import estaturaIdadeMeninas05 from './dados/height_for_age_girls.json';
import estaturaIdadeMeninos519 from './dados/height_for_age_boys_5_19.json';
import estaturaIdadeMeninas519 from './dados/height_for_age_girls_5_19.json';
import imcIdadeMeninos05 from './dados/bmi_for_age_boys_0_5.json';
import imcIdadeMeninas05 from './dados/bmi_for_age_girls_0_5.json';
import imcIdadeMeninos519 from './dados/bmi_for_age_boys_5_19.json';
import imcIdadeMeninas519 from './dados/bmi_for_age_girls_5_19.json';
import perimetroCefalico from './dados/head_circumference.json';
import pesoComprimento from './dados/weight_for_length.json';
import pesoEstatura from './dados/weight_for_height.json';
import perimetroBraco from './dados/arm_circumference_for_age.json';
import pregaTricipital from './dados/triceps_skinfold_for_age.json';
import pregaSubescapular from './dados/subscapular_skinfold_for_age.json';

// Converte o formato do arquivo ({ age, L, M, S }) para o formato do app
// ({ idade, L, M, S }) e garante a ordem crescente.
const converter = (pontos) =>
  pontos
    .map((ponto) => ({ idade: ponto.age, L: ponto.L, M: ponto.M, S: ponto.S }))
    .sort((a, b) => a.idade - b.idade);

// Junta duas tabelas vizinhas sem repetir o ponto da fronteira.
const juntar = (primeira, segunda, ultimoMesDaPrimeira) =>
  converter([
    ...primeira,
    ...segunda.filter((ponto) => ponto.age > ultimoMesDaPrimeira),
  ]);

// Como montar a tabela de cada indicador. O eixo é a idade em meses, menos
// em peso_comprimento e peso_estatura, onde é o comprimento/estatura em cm.
const montadores = {
  peso_idade: (menino) =>
    juntar(
      (menino ? pesoIdadeMeninos : pesoIdadeMeninas).points,
      menino ? pesoIdade510.boys : pesoIdade510.girls,
      60
    ),
  estatura_idade: (menino) =>
    juntar(
      (menino ? estaturaIdadeMeninos05 : estaturaIdadeMeninas05).points,
      (menino ? estaturaIdadeMeninos519 : estaturaIdadeMeninas519).points,
      60
    ),
  imc_idade: (menino) =>
    juntar(
      (menino ? imcIdadeMeninos05 : imcIdadeMeninas05).points,
      (menino ? imcIdadeMeninos519 : imcIdadeMeninas519).points,
      60
    ),
  pc_idade: (menino) => converter(menino ? perimetroCefalico.boys : perimetroCefalico.girls),
  peso_comprimento: (menino) => converter(menino ? pesoComprimento.boys : pesoComprimento.girls),
  peso_estatura: (menino) => converter(menino ? pesoEstatura.boys : pesoEstatura.girls),
  pb_idade: (menino) => converter(menino ? perimetroBraco.boys : perimetroBraco.girls),
  pct_idade: (menino) => converter(menino ? pregaTricipital.boys : pregaTricipital.girls),
  pcs_idade: (menino) => converter(menino ? pregaSubescapular.boys : pregaSubescapular.girls),
};

// As tabelas não mudam durante a execução, e montar cada uma custa um map +
// sort em até 230 pontos. Guardamos a primeira montagem de cada combinação.
const cache = new Map();

// Indicador + sexo ('M' ou 'F') -> tabela LMS (lista de pontos) ou [] se não existir.
export const obterTabelaLms = (indicador, sexo) => {
  const montador = montadores[indicador];
  if (!montador) return [];

  const chave = `${indicador}:${sexo}`;
  if (!cache.has(chave)) cache.set(chave, montador(sexo === 'M'));
  return cache.get(chave);
};

// Primeiro e último ponto do eixo de uma tabela, para a tela explicar por que
// um indicador ficou sem resultado ("a tabela vai de 45 a 110 cm").
export const limitesDaTabela = (indicador, sexo) => {
  const tabela = obterTabelaLms(indicador, sexo);
  if (tabela.length === 0) return null;
  return { minimo: tabela[0].idade, maximo: tabela[tabela.length - 1].idade };
};
