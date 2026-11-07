// Api/middleware/autenticarPaciente.js
// Aceita somente sessão normal de PACIENTE (token tipo "paciente").
//
// O token de primeiro acesso ("paciente_primeiro_acesso") NÃO passa aqui:
// quem ainda não aceitou os termos nem trocou a senha provisória não lê
// dado de saúde nenhum. Para ele existe o autenticarPrimeiroAcesso, abaixo.
//
// Depois de validar, deixa o id em req.paciente.id.
const { lerToken, estadoDoPaciente } = require('../servicos/sessao');
const { registrarAuditoria } = require('../servicos/auditoria');

const STATUS_QUE_ENTRAM = ['ativo', 'pendente'];

function fabricar(tipoAceito) {
  return async function autenticarPaciente(req, res, next) {
    const carga = lerToken(req);

    if (!carga) {
      return res.status(401).json({
        mensagem: 'Sessão inválida ou expirada. Entre novamente.',
      });
    }

    const idPaciente = Number(carga.id_paciente);

    if (carga.tipo !== tipoAceito || !Number.isInteger(idPaciente) || idPaciente <= 0) {
      registrarAuditoria(req, {
        acao: 'acesso.negado',
        sucesso: false,
        ator: { tipo: carga.id_paciente ? 'paciente' : 'anonimo', id: carga.id_paciente },
        detalhe: { motivo: 'tipo_de_token', esperado: tipoAceito, recebido: carga.tipo },
      });
      return res.status(403).json({ mensagem: 'Acesso não autorizado.' });
    }

    try {
      const estado = await estadoDoPaciente(idPaciente);

      if (
        !estado ||
        !STATUS_QUE_ENTRAM.includes(estado.ds_status) ||
        Number(estado.versao) !== Number(carga.sv || 0)
      ) {
        return res.status(401).json({
          mensagem: 'Sessão encerrada. Entre novamente.',
        });
      }
    } catch (erro) {
      return next(erro);
    }

    req.paciente = { id: idPaciente };
    return next();
  };
}

const autenticarPaciente = fabricar('paciente');

module.exports = autenticarPaciente;
module.exports.autenticarPrimeiroAcesso = fabricar('paciente_primeiro_acesso');
