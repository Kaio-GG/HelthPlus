// Tabelas de referência LMS usadas pela calculadora.
//
// ⚠️ ATENÇÃO: os arquivos da pasta "dados" são TABELAS DE DEMONSTRAÇÃO, com
// poucos pontos por curva. Servem para o app funcionar, mas NÃO têm precisão
// clínica. Antes de usar com pacientes reais, substitua pelos arquivos
// oficiais da OMS (https://www.who.int/tools/child-growth-standards/standards
// e https://www.who.int/tools/growth-reference-data-for-5to19-years),
// mantendo o mesmo formato { points: [{ age, L, M, S }] }.

import pesoIdadeMeninos from './dados/DEMO_weight_for_age_boys.json';
import pesoIdadeMeninas from './dados/DEMO_weight_for_age_girls.json';
import estaturaIdadeMeninos05 from './dados/DEMO_height_for_age_boys.json';
import estaturaIdadeMeninas05 from './dados/DEMO_height_for_age_girls.json';
import estaturaIdadeMeninos519 from './dados/DEMO_height_for_age_boys_5_19.json';
import estaturaIdadeMeninas519 from './dados/DEMO_height_for_age_girls_5_19.json';
import imcIdadeMeninos05 from './dados/DEMO_bmi_for_age_boys_0_5.json';
import imcIdadeMeninas05 from './dados/DEMO_bmi_for_age_girls_0_5.json';
import imcIdadeMeninos519 from './dados/DEMO_bmi_for_age_boys_5_19.json';
import imcIdadeMeninas519 from './dados/DEMO_bmi_for_age_girls_5_19.json';
import perimetroCefalico from './dados/DEMO_head_circumference.json';
import pesoEstatura from './dados/DEMO_weight_for_height.json';

// Converte o formato do arquivo ({ age, L, M, S }) para o formato do app
// ({ idade, L, M, S }) e garante a ordem crescente.
const converter = (pontos) =>
  pontos
    .map((ponto) => ({ idade: ponto.age, L: ponto.L, M: ponto.M, S: ponto.S }))
    .sort((a, b) => a.idade - b.idade);

// Junta a tabela de 0-5 anos (Anthro) com a de 5-19 anos (AnthroPlus),
// sem repetir o ponto de 60 meses.
const juntar = (de0a5, de5a19) =>
  converter([...de0a5.points, ...de5a19.points.filter((ponto) => ponto.age > 60)]);

// Indicador + sexo ('M' ou 'F') -> tabela LMS (lista de pontos) ou [] se não existir.
export const obterTabelaLms = (indicador, sexo) => {
  const menino = sexo === 'M';
  switch (indicador) {
    case 'peso_idade':
      return converter((menino ? pesoIdadeMeninos : pesoIdadeMeninas).points);
    case 'estatura_idade':
      return menino
        ? juntar(estaturaIdadeMeninos05, estaturaIdadeMeninos519)
        : juntar(estaturaIdadeMeninas05, estaturaIdadeMeninas519);
    case 'imc_idade':
      return menino
        ? juntar(imcIdadeMeninos05, imcIdadeMeninos519)
        : juntar(imcIdadeMeninas05, imcIdadeMeninas519);
    case 'pc_idade':
      return converter(menino ? perimetroCefalico.boys : perimetroCefalico.girls);
    case 'peso_estatura': // o eixo "idade" aqui é a estatura em cm
      return converter(menino ? pesoEstatura.boys : pesoEstatura.girls);
    default:
      return [];
  }
};
