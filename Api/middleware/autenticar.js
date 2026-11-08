// Api/middleware/autenticar.js
// Aceita somente sessão de NUTRICIONISTA (token tipo "profissional").
//
// Além de conferir a assinatura do token, olha a conta no banco: conta
// desativada ou sessão encerrada (senha trocada, "sair de todos os
// aparelhos") deixa de passar na hora, sem esperar o token vencer.
//
// Depois de validar, deixa o id em req.usuario.id_profissional.
const { lerToken, estadoDoProfissional } = require('../servicos/sessao');
const { registrarAuditoria } = require('../servicos/auditoria');

async function autenticar(req, res, next) {
  const carga = lerToken(req);

  if (!carga) {
    return res.status(401).json({
      mensagem: 'Sessão inválida ou expirada. Entre novamente.',
    });
  }

  const idProfissional = Number(carga.id_profissional);

  if (carga.tipo !== 'profissional' || !Number.isInteger(idProfissional) || idProfissional <= 0) {
    registrarAuditoria(req, {
      acao: 'acesso.negado',
      sucesso: false,
      detalhe: { motivo: 'tipo_de_token', esperado: 'profissional', recebido: carga.tipo },
    });
    return res.status(403).json({ mensagem: 'Acesso não autorizado.' });
  }

  try {
    const estado = await estadoDoProfissional(idProfissional);

    if (!estado || !estado.st_ativo || Number(estado.versao) !== Number(carga.sv || 0)) {
      return res.status(401).json({
        mensagem: 'Sessão encerrada. Entre novamente.',
      });
    }
  } catch (erro) {
    return next(erro);
  }

  req.usuario = { tipo: 'profissional', id_profissional: idProfissional };
  return next();
}

module.exports = autenticar;
