// Api/storage/conviteStorage.js
// No server.js: app.use('/api/convite', conviteStorage)
//
//   POST /api/convite/reenviar/:idPaciente   (nutricionista logado)
const express = require('express');
const autenticar = require('../middleware/autenticar');
const { renovarConvite } = require('../repository/conviteRepository');
const { enviarConvitePaciente } = require('../servicos/conviteEmail');

const router = express.Router();

router.post('/reenviar/:idPaciente', autenticar, async (req, res) => {
  const idPaciente = Number(req.params.idPaciente);
  const idProfissional = Number(req.usuario.id_profissional);

  if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
    return res.status(400).json({ mensagem: 'Identificador de paciente inválido.' });
  }

  try {
    const convite = await renovarConvite(idPaciente, idProfissional);

    const envio = await enviarConvitePaciente({
      para: convite.email,
      nomePaciente: convite.nomePaciente,
      nomeProfissional: convite.nomeProfissional,
      senhaTemporaria: convite.senhaTemporaria,
    });

    // Saiu de verdade.
    if (envio.enviado) {
      return res.status(200).json({ mensagem: 'Convite reenviado.', conviteEnviado: true });
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
    console.error('Erro ao reenviar convite:', erro);
    return res.status(500).json({ mensagem: 'Erro ao reenviar o convite.' });
  }
});

module.exports = router;