// Api/storage/conviteStorage.js
// No server.js: app.use('/api/convite', conviteStorage)
//
//   POST /api/convite/reenviar/:idPaciente   -> reenvia o acesso do paciente
//   POST /api/convite/testador               -> convida alguém para testar o app
//
// As duas exigem nutricionista logado.
const express = require('express');
const autenticar = require('../middleware/autenticar');
const { renovarConvite } = require('../repository/conviteRepository');
const { enviarConvitePaciente } = require('../servicos/conviteEmail');
const { enviarEmailConviteTeste } = require('../servicos/mensagensEmail');
const { buscarContatoDoProfissional } = require('../repository/notificacaoRepository');
const { limites } = require('../middleware/limiteTaxa');
const { registrarAuditoria } = require('../servicos/auditoria');
const { emailValido } = require('../utilitarios/validacao');

const router = express.Router();

router.post('/reenviar/:idPaciente', autenticar, limites.envioEmail, async (req, res) => {
  const idPaciente = Number(req.params.idPaciente);
  const idProfissional = Number(req.usuario.id_profissional);

  if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
    return res.status(400).json({ mensagem: 'Identificador de paciente inválido.' });
  }

  try {
    const convite = await renovarConvite(idPaciente, idProfissional);

    registrarAuditoria(req, {
      acao: 'convite.reenviar',
      recurso: 'paciente',
      idRecurso: idPaciente,
      idPacienteAlvo: idPaciente,
      detalhe: { acessoCriado: convite.acessoCriado },
    });

    // A senha provisória não vai para o e-mail: ela é a data de nascimento
    // do paciente, e o e-mail apenas diz isso em palavras.
    const envio = await enviarConvitePaciente({
      para: convite.email,
      nomePaciente: convite.nomePaciente,
      nomeProfissional: convite.nomeProfissional,
    });

    // Saiu de verdade.
    if (envio.enviado) {
      return res.status(200).json({
        mensagem: convite.acessoCriado
          ? `Acesso criado e convite enviado para ${convite.email}.`
          : `Convite reenviado para ${convite.email}.`,
        conviteEnviado: true,
      });
    }

    // O servidor de e-mail recusou (o serviço devolve o motivo em "erro").
    if (envio.erro) {
      return res.status(502).json({
        mensagem: 'A senha foi renovada, mas não foi possível enviar o e-mail. Tente reenviar em instantes.',
        conviteEnviado: false,
      });
    }

    // SMTP não configurado: o e-mail apareceu no terminal do backend.
    return res.status(200).json({
      mensagem: 'E-mail não configurado no servidor (modo de teste). Veja o terminal do backend.',
      conviteEnviado: false,
    });
  } catch (erro) {
    if (erro.codigo === 'PACIENTE_NAO_ENCONTRADO') {
      return res.status(404).json({ mensagem: erro.message });
    }
    if (erro.codigo === 'CONTA_NAO_PENDENTE') {
      return res.status(409).json({ mensagem: erro.message });
    }
    if (erro.codigo === 'SEM_EMAIL' || erro.codigo === 'SEM_NASCIMENTO') {
      return res.status(422).json({ mensagem: erro.message });
    }
    // O e-mail de acesso é único no banco: outro paciente já usa este.
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensagem: 'Já existe um acesso com esse e-mail. Use outro e-mail na ficha do paciente.',
      });
    }
    console.error('Erro ao reenviar convite:', erro);
    return res.status(500).json({ mensagem: 'Erro ao reenviar o convite.' });
  }
});


// ---------------------------------------------------------------
// POST /api/convite/testador   body: { email, recado? }
//
// Convida alguém para testar o aplicativo. Enquanto o Health Plus não
// estiver na Play Store, o testador precisa do endereço de instalação —
// que fica no .env (LINK_TESTE_APP), porque muda a cada rodada de teste.
//
// Só nutricionista logado convida: é um e-mail saindo do nosso domínio
// para um endereço escolhido por quem chamou a rota.
// ---------------------------------------------------------------
router.post('/testador', autenticar, limites.envioEmail, async (req, res) => {
  const idProfissional = Number(req.usuario.id_profissional);
  const email = String(req.body?.email || '').trim();
  const recado = String(req.body?.recado || '').trim().slice(0, 300);
  const link = String(process.env.LINK_TESTE_APP || '').trim();

  // Validação simples, igual à do aplicativo: algo@algo.algo.
  if (!emailValido(email)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }

  if (!link) {
    return res.status(503).json({
      mensagem:
        'O link de instalação do teste não está configurado no servidor ' +
        '(LINK_TESTE_APP no Api/.env).',
    });
  }

  try {
    // O token guarda só o id; o nome de quem convida sai do banco, para
    // o convidado saber quem o chamou.
    const contato = await buscarContatoDoProfissional(idProfissional);

    registrarAuditoria(req, { acao: 'convite.testador', recurso: 'convite' });

    const envio = await enviarEmailConviteTeste(email, {
      nomeQuemConvida: contato?.nm_profissional || null,
      link,
      recado,
    });

    if (envio.enviado) {
      return res.status(200).json({ mensagem: `Convite enviado para ${email}.`, enviado: true });
    }

    if (envio.erro) {
      return res.status(502).json({
        mensagem: 'Não foi possível enviar o e-mail agora. Tente de novo em instantes.',
        enviado: false,
      });
    }

    return res.status(200).json({
      mensagem:
        'E-mail não configurado no servidor (modo de teste). O convite ' +
        'apareceu no terminal da API.',
      enviado: false,
    });
  } catch (erro) {
    console.error('Erro ao convidar testador:', erro);
    return res.status(500).json({ mensagem: 'Erro ao enviar o convite.' });
  }
});

module.exports = router;