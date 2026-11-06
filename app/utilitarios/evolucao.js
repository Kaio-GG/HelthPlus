// Leitura da evolução de um paciente a partir das avaliações que a API
// devolve (GET /api/paciente/:id/evolucao e GET /api/paciente/minha-evolucao).
//
// Tudo aqui é cálculo puro, sem React e sem chamada de rede, para a aba
// "Evolução" da ficha (nutricionista) e a tela "Minha evolução" (paciente)
// mostrarem exatamente os mesmos números. Antes cada tela montava a sua
// própria leitura, e as duas divergiam.
//
// Formato de uma avaliação, como vem da API:
//   { id, data: 'DD/MM/AAAA', idade, pesoKg, alturaCm, imc, naFaixa, total }
import { avaliarMedidas } from './oms/avaliacaoOms';
import { converterDataBR, normalizarData } from './datas';
import { cores } from '../tema';

// Os três tons de classificação da OMS usados no projeto, na ordem em que
// aparecem na legenda. A cor acompanha a da tela de resultados.
//
// A "descricao" é o texto do balão que abre ao tocar na legenda do gráfico
// de rosca. Ela existe porque "Acompanhar" não quer dizer nada para quem
// não é da área — e é justamente o paciente que mais olha esse gráfico.
//
// São duas versões do mesmo texto. A do nutricionista fala em escore-z e
// conduta; a do paciente fala no que ele faz com aquilo, que é esperar a
// consulta e perguntar. Dizer "entre -2 e +2 desvios" a um paciente é
// informação que ele não tem o que fazer com ela.
export const TONS = [
  {
    chave: 'adequado',
    rotulo: 'Adequado',
    cor: cores.verdeBotao,
    descricao:
      'A medida caiu dentro da faixa esperada para a idade e o sexo (escore-z entre -2 e +2, ou a faixa de IMC adequada no adulto). É o resultado que não pede conduta.',
    descricaoPaciente:
      'Esta medida está dentro do esperado para alguém da sua idade. É o resultado que se quer ver.',
  },
  {
    chave: 'atencao',
    rotulo: 'Acompanhar',
    cor: '#E0A526',
    descricao:
      'A medida saiu da faixa esperada, mas sem gravidade: sobrepeso, magreza leve, ou um valor na borda do corte. Pede acompanhamento na próxima consulta, não conduta imediata.',
    descricaoPaciente:
      'Esta medida saiu um pouco do esperado. Não é motivo para susto — é o que o seu nutricionista vai olhar de novo na próxima consulta.',
  },
  {
    chave: 'risco',
    rotulo: 'Avaliar',
    cor: cores.erro,
    descricao:
      'A medida está bem fora da faixa esperada (obesidade, magreza acentuada, baixa estatura). Pede avaliação, e vale conferir a medida antes: erro de anotação cai aqui com frequência.',
    descricaoPaciente:
      'Esta medida está bastante fora do esperado. Converse com o seu nutricionista sobre ela na próxima consulta.',
  },
];

const corDoTom = (tom) =>
  TONS.find((item) => item.chave === tom)?.cor ?? cores.textoDesabilitado;

const numero = (valor) => {
  const convertido = Number(valor);
  return Number.isFinite(convertido) && convertido > 0 ? convertido : null;
};

// As avaliações chegam da mais recente para a mais antiga (é a ordem da
// lista na tela). Gráfico de linha e de barra precisam do contrário.
export const emOrdemCronologica = (avaliacoes = []) =>
  [...avaliacoes].reverse();

// Quantas avaliações cabem num gráfico.
//
// Num celular, cada ponto a mais estreita o anterior: com oito consultas os
// rótulos de data encavalam e a linha vira rabisco. Quatro é o que ainda dá
// para ler de relance — e é o que interessa, porque o gráfico serve para
// enxergar a tendência recente, não o histórico inteiro.
//
// O histórico completo não se perde: ele está na aba Avaliações, consulta
// por consulta. Quem sai da janela é só o DESENHO da avaliação mais antiga.
export const MAXIMO_NO_GRAFICO = 4;

// As N avaliações mais recentes, já em ordem cronológica (a mais antiga
// das que sobraram primeiro, para o gráfico ser lido da esquerda para a
// direita).
const ultimasNoGrafico = (avaliacoes = [], quantas = MAXIMO_NO_GRAFICO) =>
  emOrdemCronologica(avaliacoes).slice(-quantas);

// Transforma avaliações em pontos de gráfico.
//
// O rótulo é dia/mês, e não a data inteira: num eixo com quatro pontos,
// "12/03/2026" vira borrão.
const emPontos = (lista, campo) =>
  lista
    .map((avaliacao) => ({
      rotulo: String(avaliacao.data || '').slice(0, 5) || '—',
      valor: numero(avaliacao[campo]),
      data: avaliacao.data,
    }))
    .filter((ponto) => ponto.valor !== null);

// A série que vai para o GRÁFICO: só as mais recentes (ver MAXIMO_NO_GRAFICO).
export const serieDasAvaliacoes = (avaliacoes = [], campo) =>
  emPontos(ultimasNoGrafico(avaliacoes), campo);

// A série INTEIRA, sem corte. É a que responde "quanto mudou desde a
// primeira consulta" — pergunta que a janela de quatro avaliações do
// gráfico não pode responder, porque a primeira consulta costuma estar
// justamente fora dela.
export const serieCompleta = (avaliacoes = [], campo) =>
  emPontos(emOrdemCronologica(avaliacoes), campo);

// Quanto o indicador mudou entre a primeira e a última avaliação.
//
// Usa a série COMPLETA de propósito: "do começo até agora" é desde a
// primeira consulta, não desde a mais antiga que coube no gráfico.
//
// Devolve null quando não há duas medições para comparar.
export const variacaoDoIndicador = (avaliacoes = [], campo) => {
  const serie = serieCompleta(avaliacoes, campo);

  if (serie.length < 2) return null;

  const primeiro = serie[0].valor;
  const ultimo = serie[serie.length - 1].valor;
  const diferenca = ultimo - primeiro;

  return {
    primeiro,
    ultimo,
    diferenca,
    // Sem percentual quando o primeiro valor é zero — não existe divisão.
    percentual: primeiro ? (diferenca / primeiro) * 100 : null,
    // 'subiu', 'desceu' ou 'igual': a tela escolhe a seta e a cor.
    sentido: diferenca > 0.05 ? 'subiu' : diferenca < -0.05 ? 'desceu' : 'igual',
    medicoes: serie.length,
  };
};

// Refaz o cálculo da OMS de uma avaliação guardada.
//
// O banco guarda a MEDIDA (peso, altura, data); o escore-z e a
// classificação são leitura dessa medida contra as curvas da OMS, que já
// estão no aplicativo (utilitarios/oms). Refazer a conta é o que permite
// mostrar a avaliação por extenso — como na tela de resultados da
// calculadora — sem uma tabela nova no banco e sem outra chamada de API.
//
// Devolve null quando falta o que a conta precisa (data de nascimento,
// sexo, data da avaliação ou as duas medidas).
export const detalharAvaliacao = (avaliacao, paciente) => {
  if (!avaliacao || !paciente) return null;

  const nascimento = normalizarData(paciente.nascimento);
  const dataVisita =
    converterDataBR(avaliacao.data) || normalizarData(avaliacao.data);

  const sexo = String(paciente.sexo || '').toUpperCase().charAt(0);

  if (!nascimento || !dataVisita || (sexo !== 'M' && sexo !== 'F')) return null;
  if (dataVisita < nascimento) return null;

  const pesoKg = numero(avaliacao.pesoKg);
  const alturaCm = numero(avaliacao.alturaCm);

  if (!pesoKg && !alturaCm) return null;

  return avaliarMedidas({
    nascimento,
    sexo,
    dataVisita,
    pesoKg,
    alturaCm,
    // O banco não guarda a posição da medida nem os perímetros e dobras:
    // a avaliação é gravada com peso, altura e IMC. Passar undefined deixa
    // o cálculo usar a posição que a idade pede, que é o padrão da OMS.
    posicao: undefined,
    perimetroCefalicoCm: null,
    perimetroBracoCm: null,
    pregaTricipitalMm: null,
    pregaSubescapularMm: null,
  });
};

// Quantos indicadores caíram em cada tom, para o gráfico de rosca.
// Entra a lista de indicadores de avaliarMedidas(); sai [{ rotulo, valor, cor }].
// "paraPaciente" escolhe qual das duas descrições vai no balão da legenda.
export const contagemPorTom = (indicadores = [], paraPaciente = false) => {
  const contagem = { adequado: 0, atencao: 0, risco: 0 };

  for (const indicador of indicadores) {
    const tom = indicador?.classificacao?.tom;
    if (tom && contagem[tom] !== undefined) contagem[tom] += 1;
  }

  return TONS.map((tom) => ({
    rotulo: tom.rotulo,
    valor: contagem[tom.chave],
    cor: tom.cor,
    descricao: paraPaciente ? tom.descricaoPaciente : tom.descricao,
  }));
};

// O mesmo, somando TODAS as avaliações do paciente: é o retrato do
// acompanhamento inteiro, não de uma consulta só.
export const contagemPorTomNoHistorico = (
  avaliacoes = [],
  paciente,
  paraPaciente = false
) => {
  const todos = [];

  for (const avaliacao of avaliacoes) {
    const detalhe = detalharAvaliacao(avaliacao, paciente);
    if (detalhe) todos.push(...detalhe.indicadores);
  }

  return contagemPorTom(todos, paraPaciente);
};

// Barras coloridas pelo tom do IMC de cada avaliação: a barra diz o valor
// e a cor diz se aquele valor estava adequado. Uma leitura só, dois dados.
export const serieDeImcColorida = (avaliacoes = [], paciente) =>
  ultimasNoGrafico(avaliacoes)
    .map((avaliacao) => {
      const valor = numero(avaliacao.imc);
      if (valor === null) return null;

      const detalhe = detalharAvaliacao(avaliacao, paciente);

      const doImc = detalhe?.indicadores.find(
        (indicador) =>
          indicador.chave === 'imc_idade' || indicador.chave === 'imc_adulto'
      );

      return {
        rotulo: String(avaliacao.data || '').slice(0, 5) || '—',
        valor,
        cor: corDoTom(doImc?.classificacao?.tom),
      };
    })
    .filter(Boolean);

export { corDoTom };
