// Api/storage/avaliacaoStorage.js
// No server.js: app.use('/api/avaliacao', avaliacaoStorage)
//
// Nutricionista (token de profissional):
//   POST /api/avaliacao   -> grava uma avaliação na ficha do paciente
//
// A LEITURA das avaliações não fica aqui: ela já existe em
//   GET /api/paciente/:id/evolucao      (nutricionista)
//   GET /api/paciente/minha-evolucao    (paciente)
// porque as duas telas que a usam são telas do paciente, não da avaliação.
const express = require('express');
const autenticar = require('../middleware/autenticar');
const { inserirAvaliacao } = require('../repository/avaliacaoRepository');

const { registrarAuditoria } = require('../servicos/auditoria');
const { dataISOValida } = require('../utilitarios/validacao');

const router = express.Router();

// Faixas fisicamente possíveis de cada medida. Não é a faixa "normal" (essa
// é a OMS que diz), e sim o que separa uma medida de um erro de digitação
// — 700 kg, ou 70 digitado no campo da altura em metros. Fora daqui o
// valor estourava a coluna (decimal 8,3) como erro 500, ou pior, entrava.
const LIMITES_DAS_MEDIDAS = {
  pesoKg: [0.3, 400],
  alturaCm: [25, 250],
  perimetroCefalicoCm: [20, 70],
  perimetroBracoCm: [5, 70],
  pregaTricipitalMm: [1, 80],
  pregaSubescapularMm: [1, 80],
};

const TONS_VALIDOS = ['adequado', 'atencao', 'risco'];

// Devolve a mensagem do primeiro problema, ou null.
function validarAvaliacao(corpo) {
  for (const [campo, [minimo, maximo]] of Object.entries(LIMITES_DAS_MEDIDAS)) {
    const valor = corpo.medidas[campo];
    if (valor === undefined || valor === null || valor === '') continue;

    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < minimo || numero > maximo) {
      return `Medida fora da faixa possível (${campo}: entre ${minimo} e ${maximo}).`;
    }
  }

  if (corpo.data > new Date().toISOString().slice(0, 10)) {
    return 'A data da avaliação não pode estar no futuro.';
  }

  if (corpo.resultados !== undefined && !Array.isArray(corpo.resultados)) {
    return 'Os resultados precisam vir numa lista.';
  }

  if ((corpo.resultados || []).length > 20) {
    return 'Resultados demais numa avaliação.';
  }

  return null;
}

// Corta os textos no tamanho das colunas e descarta tom desconhecido.
function limparResultados(resultados = []) {
  return resultados
    .filter((r) => r && typeof r === 'object' && typeof r.indicador === 'string')
    .map((r) => ({
      indicador: r.indicador.slice(0, 20),
      medida: r.medida,
      zScore: Number.isFinite(Number(r.zScore)) && Math.abs(Number(r.zScore)) < 100 ? r.zScore : null,
      percentil:
        Number.isFinite(Number(r.percentil)) && Number(r.percentil) >= 0 && Number(r.percentil) <= 100
          ? r.percentil
          : null,
      classificacao: r.classificacao ? String(r.classificacao).slice(0, 50) : null,
      tom: TONS_VALIDOS.includes(r.tom) ? r.tom : null,
      extremo: Boolean(r.extremo),
      interpretacao: r.interpretacao ? String(r.interpretacao).slice(0, 2000) : null,
    }));
}

router.post('/', autenticar, async (req, res) => {
  const corpo = req.body || {};
  const idPaciente = Number(corpo.idPaciente);

  if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
    return res.status(400).json({ mensagem: 'Identificador de paciente inválido.' });
  }

  if (!dataISOValida(corpo.data)) {
    return res.status(400).json({ mensagem: 'Informe a data da avaliação (AAAA-MM-DD).' });
  }

  if (!corpo.medidas || typeof corpo.medidas !== 'object') {
    return res.status(400).json({ mensagem: 'Informe as medidas da avaliação.' });
  }

  const problema = validarAvaliacao(corpo);
  if (problema) {
    return res.status(400).json({ mensagem: problema });
  }

  try {
    // O id do nutricionista vem do TOKEN, nunca do corpo da requisição.
    const resultado = await inserirAvaliacao({
      idPaciente,
      idProfissional: Number(req.usuario.id_profissional),
      data: corpo.data,
      idadeDias: corpo.idadeDias,
      idadeMeses: corpo.idadeMeses,
      idadeAnos: corpo.idadeAnos,
      local: corpo.local ? String(corpo.local).slice(0, 100) : null,
      tipo: corpo.tipo ? String(corpo.tipo).slice(0, 20) : null,
      observacoes: corpo.observacoes ? String(corpo.observacoes).slice(0, 5000) : null,
      medidas: corpo.medidas,
      resultados: limparResultados(corpo.resultados),
    });

    registrarAuditoria(req, {
      acao: 'avaliacao.criar',
      recurso: 'avaliacao',
      idRecurso: resultado.idAvaliacao,
      idPacienteAlvo: idPaciente,
    });

    return res.status(201).json({
      mensagem: 'Avaliação salva na ficha do paciente.',
      ...resultado,
    });
  } catch (erro) {
    if (erro.codigo === 'PACIENTE_INVALIDO') {
      registrarAuditoria(req, {
        acao: 'acesso.negado',
        recurso: 'paciente',
        idRecurso: idPaciente,
        sucesso: false,
        detalhe: { motivo: 'avaliacao_em_paciente_fora_da_lista' },
      });
      return res.status(404).json({ mensagem: erro.message });
    }

    if (erro.codigo === 'SEM_MEDIDAS') {
      return res.status(400).json({ mensagem: erro.message });
    }

    console.error('Erro ao salvar a avaliação:', erro);

    return res.status(500).json({ mensagem: 'Erro ao salvar a avaliação.' });
  }
});

module.exports = router;
