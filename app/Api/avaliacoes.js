// Chamadas da API das avaliações antropométricas.
//
// A LEITURA das avaliações não está aqui: ela vem junto da evolução do
// paciente, em Api/Pacientes.js (obterEvolucaoDoPaciente e
// obterMinhaEvolucao). Aqui só se grava.
import api from './connection';

const cabecalho = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const criarErro = (erro, padrao) =>
  new Error(
    erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      erro.message ||
      (erro.response
        ? `${padrao} (HTTP ${erro.response.status}).`
        : 'Não foi possível conectar à API. Verifique o servidor e o endereço configurado.')
  );

// Date -> "2026-11-05" (no horário local, e não em UTC: toISOString()
// jogaria a avaliação para o dia anterior em quem está a oeste de Greenwich).
const dataParaISO = (data) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
    data.getDate()
  ).padStart(2, '0')}`;

// Monta o corpo da requisição a partir do que a calculadora produziu.
//
// Quem calcula é o aplicativo (app/utilitarios/oms): a API recebe o
// resultado pronto e grava. O porquê está em
// Api/repository/avaliacaoRepository.js.
export const montarCorpoDaAvaliacao = ({
  pacienteId,
  dataDaVisita,
  medidas,
  avaliacao,
  observacoes,
}) => ({
  idPaciente: Number(pacienteId),
  data: dataParaISO(dataDaVisita),
  idadeDias: Math.round(avaliacao.idadeEmDias),
  idadeMeses: Math.floor(avaliacao.idadeEmMeses),
  // nr_idade_anos é decimal(5,2) no banco: duas casas, não o ano redondo.
  idadeAnos: Number((avaliacao.idadeEmMeses / 12).toFixed(2)),
  tipo: 'rotina',
  observacoes: observacoes || null,
  medidas: {
    pesoKg: medidas.pesoKg || null,
    alturaCm: medidas.alturaCm || null,
    perimetroCefalicoCm: medidas.perimetroCefalicoCm || null,
    perimetroBracoCm: medidas.perimetroBracoCm || null,
    pregaTricipitalMm: medidas.pregaTricipitalMm || null,
    pregaSubescapularMm: medidas.pregaSubescapularMm || null,
  },
  // Só os indicadores que a OMS conseguiu calcular. Os "sem tabela" não
  // viram linha: resultado sem escore-z nem classificação não é resultado.
  resultados: avaliacao.indicadores
    .filter((indicador) => indicador.situacao === 'calculado')
    .map((indicador) => ({
      indicador: indicador.chave,
      medida: indicador.medida,
      zScore: indicador.zScore,
      percentil: indicador.percentil,
      classificacao: indicador.classificacao?.nome || null,
      tom: indicador.classificacao?.tom || null,
      extremo: Boolean(indicador.implausivel),
      interpretacao: indicador.referencia || null,
    })),
});

// GRAVA A AVALIAÇÃO NA FICHA DO PACIENTE  ->  { mensagem, idAvaliacao }
export const salvarAvaliacao = async (corpo, token) => {
  try {
    if (!token) {
      throw new Error('Sua sessão expirou. Entre novamente como nutricionista.');
    }

    const resposta = await api.post('/api/avaliacao', corpo, cabecalho(token));

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO SALVAR AVALIAÇÃO:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível salvar a avaliação');
  }
};
