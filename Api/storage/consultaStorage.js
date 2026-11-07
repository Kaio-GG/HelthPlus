// Api/storage/consultaStorage.js
// No server.js: app.use('/api/consulta', consultaStorage)
//
// Nutricionista (token de profissional):
//   POST   /api/consulta                 -> agenda uma consulta
//   GET    /api/consulta?de=&ate=        -> lista as consultas dele
//   PATCH  /api/consulta/:id/status      -> pendente | confirmada | cancelada | realizada
//
// Paciente (token de paciente):
//   GET    /api/consulta/minhas          -> próximas consultas do paciente
//   PATCH  /api/consulta/:id/confirmar   -> confirma a consulta
const express = require('express');
const autenticar = require('../middleware/autenticar');
const autenticarPaciente = require('../middleware/autenticarPaciente');
const {
  criarConsulta,
  listarConsultasDoProfissional,
  alterarStatusConsulta,
  listarConsultasDoPaciente,
  confirmarConsultaDoPaciente,
} = require('../repository/consultaRepository');

const { registrarAuditoria } = require('../servicos/auditoria');
const { dataISOValida, textoOpcional, idValido } = require('../utilitarios/validacao');

const router = express.Router();

const STATUS_VALIDOS = ['pendente', 'confirmada', 'cancelada', 'realizada'];

function horarioValido(texto) {
  const partes = /^(\d{2}):(\d{2})$/.exec(texto || '');
  return Boolean(partes) && Number(partes[1]) < 24 && Number(partes[2]) < 60;
}

// Devolve a mensagem de erro, ou null se estiver tudo certo.
function validarConsulta(c) {
  const ehAvulso = !c.idPaciente;

  if (!ehAvulso && !idValido(c.idPaciente)) {
    return 'Paciente inválido.';
  }
  if (ehAvulso && (typeof c.nomeAvulso !== 'string' || c.nomeAvulso.trim().length < 3)) {
    return 'Informe o nome do paciente.';
  }
  if (ehAvulso && c.nomeAvulso.trim().length > 100) {
    return 'O nome do paciente pode ter até 100 caracteres.';
  }
  if (c.telefoneAvulso && !/^[\d\s()+-]{8,20}$/.test(String(c.telefoneAvulso).trim())) {
    return 'Telefone inválido.';
  }
  if (!dataISOValida(c.data)) return 'Informe uma data válida.';
  if (!horarioValido(c.horario)) return 'Informe um horário válido (HH:MM).';

  const duracao = Number(c.duracao);
  if (!Number.isInteger(duracao) || duracao < 15 || duracao > 240) {
    return 'A duração deve ficar entre 15 e 240 minutos.';
  }

  if (!c.tipo || String(c.tipo).trim().length === 0 || String(c.tipo).length > 40) {
    return 'Informe o tipo da consulta.';
  }

  return null;
}

// Converte os erros "esperados" do repository em respostas HTTP.
function responderErro(res, erro, mensagemPadrao) {
  if (erro.codigo === 'PACIENTE_INVALIDO') {
    return res.status(400).json({ mensagem: erro.message });
  }
  if (erro.codigo === 'HORARIO_OCUPADO' || erro.codigo === 'CONSULTA_NAO_PENDENTE') {
    return res.status(409).json({ mensagem: erro.message });
  }
  if (erro.codigo === 'CONSULTA_NAO_ENCONTRADA') {
    return res.status(404).json({ mensagem: erro.message });
  }
  console.error(mensagemPadrao, erro);
  return res.status(500).json({ mensagem: mensagemPadrao });
}

// ---------------------------------------------------------------------
// PACIENTE  (estas rotas ficam antes das com /:id)
// ---------------------------------------------------------------------
router.get('/minhas', autenticarPaciente, async (req, res) => {
  try {
    const consultas = await listarConsultasDoPaciente(req.paciente.id);
    return res.status(200).json({ consultas });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao buscar suas consultas.');
  }
});

router.patch('/:id/confirmar', autenticarPaciente, async (req, res) => {
  const idConsulta = Number(req.params.id);
  if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
    return res.status(400).json({ mensagem: 'Identificador de consulta inválido.' });
  }

  try {
    const resultado = await confirmarConsultaDoPaciente(idConsulta, req.paciente.id);

    registrarAuditoria(req, {
      acao: 'consulta.confirmar',
      recurso: 'consulta',
      idRecurso: idConsulta,
      idPacienteAlvo: req.paciente.id,
    });
    return res.status(200).json({ mensagem: 'Consulta confirmada.', ...resultado });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao confirmar a consulta.');
  }
});

// ---------------------------------------------------------------------
// NUTRICIONISTA
// ---------------------------------------------------------------------
router.post('/', autenticar, async (req, res) => {
  // O id do nutricionista vem do TOKEN, nunca do corpo da requisição.
  const corpo = req.body || {};
  const c = {
    idProfissional: Number(req.usuario.id_profissional),
    idPaciente: corpo.idPaciente || null,
    nomeAvulso: corpo.nomeAvulso,
    telefoneAvulso: textoOpcional(corpo.telefoneAvulso, 20),
    data: corpo.data,
    horario: corpo.horario,
    duracao: corpo.duracao,
    tipo: corpo.tipo,
    observacoes: textoOpcional(corpo.observacoes, 2000),
    notificar: corpo.notificar === true,
  };

  const erroValidacao = validarConsulta(c);
  if (erroValidacao) return res.status(400).json({ mensagem: erroValidacao });

  try {
    const resultado = await criarConsulta({
      ...c,
      idPaciente: c.idPaciente ? idValido(c.idPaciente) : null,
      tipo: String(c.tipo).trim(),
      duracao: Number(c.duracao),
    });

    registrarAuditoria(req, {
      acao: 'consulta.criar',
      recurso: 'consulta',
      idRecurso: resultado.idConsulta,
      idPacienteAlvo: c.idPaciente ? idValido(c.idPaciente) : null,
      detalhe: { avulso: !c.idPaciente },
    });

    return res.status(201).json({ mensagem: 'Consulta agendada com sucesso.', ...resultado });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao agendar a consulta.');
  }
});

router.get('/', autenticar, async (req, res) => {
  const { de, ate } = req.query;

  if ((de && !dataISOValida(de)) || (ate && !dataISOValida(ate))) {
    return res.status(400).json({ mensagem: "Use datas no formato AAAA-MM-DD em 'de' e 'ate'." });
  }

  try {
    const consultas = await listarConsultasDoProfissional(
      Number(req.usuario.id_profissional),
      de,
      ate
    );
    return res.status(200).json({ consultas });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao buscar as consultas.');
  }
});

router.patch('/:id/status', autenticar, async (req, res) => {
  const idConsulta = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
    return res.status(400).json({ mensagem: 'Identificador de consulta inválido.' });
  }
  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ mensagem: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.` });
  }

  try {
    const resultado = await alterarStatusConsulta(
      idConsulta,
      Number(req.usuario.id_profissional),
      status
    );

    registrarAuditoria(req, {
      acao: 'consulta.status',
      recurso: 'consulta',
      idRecurso: idConsulta,
      idPacienteAlvo: resultado.idPaciente,
      detalhe: { status },
    });
    return res.status(200).json({ mensagem: 'Status atualizado.', ...resultado });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao alterar o status da consulta.');
  }
});

module.exports = router;