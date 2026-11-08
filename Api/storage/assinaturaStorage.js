// Api/storage/assinaturaStorage.js
// Rotas da assinatura paga. No server.js: app.use('/api/assinatura', ...)
//
//   GET    /api/assinatura   -> plano atual, nº de pacientes e cobranças
//   PUT    /api/assinatura   -> assina ou troca de plano   body: { planoId }
//   DELETE /api/assinatura   -> cancela a assinatura
//
// Todas exigem o token do nutricionista: o id vem do token, nunca da URL
// ou do corpo, senão qualquer um assinaria plano na conta de outro.
const express = require('express');
const autenticar = require('../middleware/autenticar');
const { buscarPlano } = require('../dados/planosAssinatura');
const {
  buscarAssinaturaAtiva,
  contarPacientes,
  salvarAssinatura,
  cancelarAssinatura,
  registrarCobranca,
  listarCobrancas,
} = require('../repository/assinaturaRepository');

const { registrarAuditoria } = require('../servicos/auditoria');

const router = express.Router();

// GET /api/assinatura
router.get('/', autenticar, async (req, res) => {
  const idProfissional = Number(req.usuario.id_profissional);

  try {
    const [assinatura, cobrancas, totalPacientes] = await Promise.all([
      buscarAssinaturaAtiva(idProfissional),
      listarCobrancas(idProfissional),
      contarPacientes(idProfissional),
    ]);

    return res.status(200).json({ assinatura, cobrancas, totalPacientes });
  } catch (erro) {
    console.error('Erro ao buscar a assinatura:', erro);
    return res.status(500).json({ mensagem: 'Erro ao buscar a sua assinatura.' });
  }
});

// PUT /api/assinatura   body: { planoId }
router.put('/', autenticar, async (req, res) => {
  const idProfissional = Number(req.usuario.id_profissional);
  const plano = buscarPlano(req.body?.planoId);

  if (!plano) {
    return res.status(400).json({ mensagem: 'Plano desconhecido.' });
  }

  // "Sob consulta" não se contrata pelo aplicativo: não há preço para
  // cobrar, e quem escolhe esse plano fala com a equipe.
  if (plano.preco === null) {
    return res.status(400).json({
      mensagem: 'Este plano é contratado pela nossa equipe. Fale com a gente.',
    });
  }

  try {
    // O limite é conferido aqui, e não só na tela: a tela pode estar com
    // uma contagem velha, e o banco é quem sabe quantos pacientes existem.
    if (plano.limitePacientes !== null) {
      const totalPacientes = await contarPacientes(idProfissional);

      if (totalPacientes > plano.limitePacientes) {
        return res.status(409).json({
          mensagem:
            `Você tem ${totalPacientes} pacientes e o plano ${plano.nome} permite ` +
            `até ${plano.limitePacientes}. Arquive alguns pacientes antes.`,
        });
      }
    }

    const assinatura = await salvarAssinatura(idProfissional, plano.id);

    // Sem gateway de pagamento ainda: a cobrança é o registro de que o
    // plano foi contratado neste dia, que o Perfil lista.
    await registrarCobranca(idProfissional, `Plano ${plano.nome}`, plano.preco);

    registrarAuditoria(req, { acao: 'assinatura.alterar', recurso: 'assinatura', detalhe: { plano: plano.id } });

    const [cobrancas, totalPacientes] = await Promise.all([
      listarCobrancas(idProfissional),
      contarPacientes(idProfissional),
    ]);

    return res.status(200).json({
      mensagem: `Agora você está no plano ${plano.nome}.`,
      assinatura,
      cobrancas,
      totalPacientes,
    });
  } catch (erro) {
    console.error('Erro ao salvar a assinatura:', erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar a sua assinatura.' });
  }
});

// DELETE /api/assinatura
router.delete('/', autenticar, async (req, res) => {
  const idProfissional = Number(req.usuario.id_profissional);

  try {
    await cancelarAssinatura(idProfissional);

    registrarAuditoria(req, { acao: 'assinatura.cancelar', recurso: 'assinatura' });

    return res.status(200).json({
      mensagem: 'Assinatura cancelada.',
      assinatura: null,
    });
  } catch (erro) {
    if (erro.codigo === 'SEM_ASSINATURA') {
      return res.status(409).json({ mensagem: erro.message });
    }

    console.error('Erro ao cancelar a assinatura:', erro);
    return res.status(500).json({ mensagem: 'Erro ao cancelar a sua assinatura.' });
  }
});

module.exports = router;
