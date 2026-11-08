// Api/storage/lgpdStorage.js
// No server.js: app.use('/api/lgpd', lgpdStorage)
//
// Direitos do titular (LGPD, Art. 18) e transparência sobre o tratamento.
//
// PACIENTE (token de paciente):
//   GET   /api/lgpd/paciente/meus-dados            cópia completa (JSON)
//   GET   /api/lgpd/paciente/consentimentos        aceites dados e revogados
//   POST  /api/lgpd/paciente/consentimentos/revogar
//   GET   /api/lgpd/paciente/acessos               quem acessou os dados dele
//   GET   /api/lgpd/paciente/solicitacoes          pedidos já feitos
//   POST  /api/lgpd/paciente/solicitacoes          novo pedido (correção, exclusão...)
//
// NUTRICIONISTA (token de profissional):
//   GET   /api/lgpd/profissional/meus-dados
//   GET   /api/lgpd/profissional/atividade                  o log das ações dele
//   GET   /api/lgpd/profissional/solicitacoes               pedidos dos pacientes
//   PATCH /api/lgpd/profissional/solicitacoes/:id           responder um pedido
//   GET   /api/lgpd/profissional/pacientes/:id/exportar     cópia dos dados do paciente
//   GET   /api/lgpd/profissional/pacientes/:id/acessos      quem acessou a ficha
//   GET   /api/lgpd/profissional/pacientes/:id/consentimentos
const express = require('express');

const pool = require('../connection');
const autenticar = require('../middleware/autenticar');
const autenticarPaciente = require('../middleware/autenticarPaciente');
const { limites } = require('../middleware/limiteTaxa');
const {
  registrarAuditoria,
  listarAcessosAoPaciente,
  listarAtividadeDoProfissional,
} = require('../servicos/auditoria');
const { obterPacientePorIdEProfissional } = require('../repository/pacienteRepository');
const { inserirNotificacao } = require('../repository/notificacaoRepository');
const {
  TIPOS_DE_SOLICITACAO,
  STATUS_DE_SOLICITACAO,
  listarConsentimentos,
  revogarConsentimentos,
  criarSolicitacao,
  listarSolicitacoesDoPaciente,
  listarSolicitacoesDoProfissional,
  responderSolicitacao,
  exportarDadosDoPaciente,
  exportarDadosDoProfissional,
} = require('../repository/lgpdRepository');
const { idValido, textoOpcional } = require('../utilitarios/validacao');
const config = require('../config');

const router = express.Router();

function erroInterno(res, erro, mensagem) {
  console.error(mensagem, erro);
  return res.status(500).json({ mensagem });
}

// Avisa o nutricionista no sino. O texto não leva nome nem dado de saúde:
// se ele tiver "avisos por e-mail" ligado, o aviso sai do servidor.
function avisarNutricionista(idProfissional, titulo, mensagem) {
  inserirNotificacao({
    idProfissional,
    tipo: 'paciente',
    titulo,
    mensagem,
    rota: 'PrivacidadeNutricionista',
    obrigatoria: true,
  }).catch((erro) => console.error('Erro ao avisar o nutricionista:', erro.message));
}

// =====================================================================
// PACIENTE
// =====================================================================

router.get('/paciente/meus-dados', autenticarPaciente, limites.exportacao, async (req, res) => {
  try {
    const dados = await exportarDadosDoPaciente(req.paciente.id);

    registrarAuditoria(req, {
      acao: 'paciente.dados.exportar',
      recurso: 'paciente',
      idRecurso: req.paciente.id,
      idPacienteAlvo: req.paciente.id,
    });

    return res.status(200).json(dados);
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao gerar a cópia dos seus dados.');
  }
});

router.get('/paciente/consentimentos', autenticarPaciente, async (req, res) => {
  try {
    return res.status(200).json({
      versaoTermos: config.versaoTermos,
      consentimentos: await listarConsentimentos(req.paciente.id),
    });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao buscar os seus consentimentos.');
  }
});

router.post('/paciente/consentimentos/revogar', autenticarPaciente, async (req, res) => {
  if (req.body?.confirmar !== true) {
    return res.status(400).json({ mensagem: 'Confirme a revogação.' });
  }

  try {
    const revogados = await revogarConsentimentos(req.paciente.id);

    registrarAuditoria(req, {
      acao: 'lgpd.consentimento.revogar',
      recurso: 'consentimento',
      idPacienteAlvo: req.paciente.id,
      detalhe: { revogados },
    });

    const [paciente] = await pool.query(
      'SELECT id_profissional FROM paciente WHERE id_paciente = ?',
      [req.paciente.id]
    );

    if (paciente[0]) {
      avisarNutricionista(
        paciente[0].id_profissional,
        'Um paciente revogou o consentimento',
        'Ele não acessa mais o aplicativo até aceitar de novo. Veja em Perfil > Privacidade e auditoria.'
      );
    }

    return res.status(200).json({
      mensagem:
        'Consentimento revogado. Você saiu do aplicativo. Se quiser voltar, é só entrar e aceitar de novo.',
      revogados,
    });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao revogar o consentimento.');
  }
});

router.get('/paciente/acessos', autenticarPaciente, async (req, res) => {
  try {
    const acessos = await listarAcessosAoPaciente(req.paciente.id, req.query.limite);
    return res.status(200).json({ acessos });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao buscar o histórico de acessos.');
  }
});

router.get('/paciente/solicitacoes', autenticarPaciente, async (req, res) => {
  try {
    return res.status(200).json({
      tipos: TIPOS_DE_SOLICITACAO,
      solicitacoes: await listarSolicitacoesDoPaciente(req.paciente.id),
    });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao buscar os seus pedidos.');
  }
});

router.post('/paciente/solicitacoes', autenticarPaciente, limites.envioEmail, async (req, res) => {
  const tipo = String(req.body?.tipo || '');
  const mensagem = textoOpcional(req.body?.mensagem, 1000);

  if (!TIPOS_DE_SOLICITACAO[tipo]) {
    return res.status(400).json({
      mensagem: `Tipo de pedido inválido. Use: ${Object.keys(TIPOS_DE_SOLICITACAO).join(', ')}.`,
    });
  }

  if (tipo === 'correcao' && !mensagem) {
    return res.status(400).json({ mensagem: 'Diga o que precisa ser corrigido.' });
  }

  try {
    const { idSolicitacao, idProfissional } = await criarSolicitacao(req.paciente.id, tipo, mensagem);

    registrarAuditoria(req, {
      acao: 'lgpd.solicitacao.criar',
      recurso: 'solicitacao',
      idRecurso: idSolicitacao,
      idPacienteAlvo: req.paciente.id,
      detalhe: { tipo },
    });

    avisarNutricionista(
      idProfissional,
      'Novo pedido de um paciente (LGPD)',
      `${TIPOS_DE_SOLICITACAO[tipo]}. Prazo de resposta: 15 dias. Veja em Perfil > Privacidade e auditoria.`
    );

    return res.status(201).json({
      mensagem: 'Pedido enviado ao seu nutricionista. O prazo de resposta é de até 15 dias.',
      idSolicitacao: String(idSolicitacao),
    });
  } catch (erro) {
    if (erro.codigo === 'MUITAS_ABERTAS') {
      return res.status(409).json({ mensagem: erro.message });
    }
    return erroInterno(res, erro, 'Erro ao enviar o pedido.');
  }
});

// =====================================================================
// NUTRICIONISTA
// =====================================================================

router.get('/profissional/meus-dados', autenticar, limites.exportacao, async (req, res) => {
  try {
    const dados = await exportarDadosDoProfissional(Number(req.usuario.id_profissional));

    registrarAuditoria(req, { acao: 'profissional.dados.exportar', recurso: 'profissional' });

    return res.status(200).json(dados);
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao gerar a cópia dos seus dados.');
  }
});

router.get('/profissional/atividade', autenticar, async (req, res) => {
  try {
    const atividade = await listarAtividadeDoProfissional(
      Number(req.usuario.id_profissional),
      req.query.limite
    );
    return res.status(200).json({ atividade });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao buscar o registro de atividade.');
  }
});

router.get('/profissional/solicitacoes', autenticar, async (req, res) => {
  try {
    const solicitacoes = await listarSolicitacoesDoProfissional(
      Number(req.usuario.id_profissional),
      req.query.abertas === '1'
    );
    return res.status(200).json({ solicitacoes, tipos: TIPOS_DE_SOLICITACAO });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao buscar os pedidos dos pacientes.');
  }
});

router.patch('/profissional/solicitacoes/:id', autenticar, async (req, res) => {
  const idSolicitacao = idValido(req.params.id);
  const status = String(req.body?.status || '');
  const resposta = textoOpcional(req.body?.resposta, 1000);

  if (!idSolicitacao) {
    return res.status(400).json({ mensagem: 'Pedido inválido.' });
  }

  if (!STATUS_DE_SOLICITACAO.includes(status) || status === 'aberta') {
    return res.status(400).json({ mensagem: 'Status inválido. Use em_andamento, atendida ou recusada.' });
  }

  // Recusar sem dizer o motivo não é resposta (Art. 18, §4º).
  if (status === 'recusada' && !resposta) {
    return res.status(400).json({ mensagem: 'Explique ao paciente o motivo da recusa.' });
  }

  try {
    const { idPaciente } = await responderSolicitacao(
      idSolicitacao,
      Number(req.usuario.id_profissional),
      status,
      resposta
    );

    registrarAuditoria(req, {
      acao: 'lgpd.solicitacao.responder',
      recurso: 'solicitacao',
      idRecurso: idSolicitacao,
      idPacienteAlvo: idPaciente,
      detalhe: { status },
    });

    return res.status(200).json({ mensagem: 'Pedido atualizado.' });
  } catch (erro) {
    if (erro.codigo === 'SOLICITACAO_NAO_ENCONTRADA') {
      return res.status(404).json({ mensagem: erro.message });
    }
    return erroInterno(res, erro, 'Erro ao responder o pedido.');
  }
});

// Confere que o paciente é deste nutricionista. Devolve o id ou null.
async function pacienteDaLista(req, res) {
  const idPaciente = idValido(req.params.id);

  if (!idPaciente) {
    res.status(400).json({ mensagem: 'Identificador de paciente inválido.' });
    return null;
  }

  const paciente = await obterPacientePorIdEProfissional(idPaciente, Number(req.usuario.id_profissional));

  if (!paciente) {
    registrarAuditoria(req, {
      acao: 'acesso.negado',
      recurso: 'paciente',
      idRecurso: idPaciente,
      sucesso: false,
      detalhe: { motivo: 'paciente_fora_da_lista' },
    });
    res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    return null;
  }

  return idPaciente;
}

router.get('/profissional/pacientes/:id/exportar', autenticar, limites.exportacao, async (req, res) => {
  try {
    const idPaciente = await pacienteDaLista(req, res);
    if (!idPaciente) return;

    const dados = await exportarDadosDoPaciente(idPaciente);

    registrarAuditoria(req, {
      acao: 'paciente.exportar',
      recurso: 'paciente',
      idRecurso: idPaciente,
      idPacienteAlvo: idPaciente,
    });

    return res.status(200).json(dados);
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao exportar os dados do paciente.');
  }
});

router.get('/profissional/pacientes/:id/acessos', autenticar, async (req, res) => {
  try {
    const idPaciente = await pacienteDaLista(req, res);
    if (!idPaciente) return;

    const acessos = await listarAcessosAoPaciente(idPaciente, req.query.limite);

    registrarAuditoria(req, {
      acao: 'paciente.acessos.ler',
      recurso: 'paciente',
      idRecurso: idPaciente,
      idPacienteAlvo: idPaciente,
    });

    // Do ponto de vista do nutricionista, "Você" é ele — e não o paciente.
    return res.status(200).json({
      acessos: acessos.map((a) => ({
        ...a,
        quem: a.tipoAtor === 'paciente' ? 'O próprio paciente' : a.quem,
        descricao: a.descricao
          .replace('Você exportou', 'Exportou')
          .replace(/\b(a sua|o seu|os seus|uma solicitação sua)\b/, (trecho) =>
            ({ 'a sua': 'a', 'o seu': 'o', 'os seus': 'os', 'uma solicitação sua': 'uma solicitação' })[trecho]
          )
          .replace('Cadastrou você', 'Cadastrou o paciente'),
      })),
    });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao buscar o histórico de acessos.');
  }
});

router.get('/profissional/pacientes/:id/consentimentos', autenticar, async (req, res) => {
  try {
    const idPaciente = await pacienteDaLista(req, res);
    if (!idPaciente) return;

    return res.status(200).json({
      versaoTermos: config.versaoTermos,
      consentimentos: await listarConsentimentos(idPaciente),
    });
  } catch (erro) {
    return erroInterno(res, erro, 'Erro ao buscar os consentimentos.');
  }
});

module.exports = router;
