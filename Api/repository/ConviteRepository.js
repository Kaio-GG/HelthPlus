// Api/repository/conviteRepository.js
// Reenvio de convite: gera uma NOVA senha provisória para um paciente que
// ainda não ativou a conta. (A senha antiga está em hash, não dá para recuperar.)
const connection = require('../connection');
const bcrypt = require('bcryptjs');
const { gerarSenhaTemporaria } = require('../servicos/senhaTemporaria');

function erroNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

async function renovarConvite(idPaciente, idProfissional) {
  // O paciente precisa ser deste nutricionista e ter acesso criado.
  const [linhas] = await connection.query(
    `SELECT u.id_paciente,
            u.ds_email,
            u.ds_status,
            p.nm_paciente,
            pr.nm_profissional
       FROM usuario_paciente u
       JOIN paciente p      ON p.id_paciente = u.id_paciente
       JOIN profissional pr ON pr.id_profissional = p.id_profissional
      WHERE u.id_paciente = ?
        AND p.id_profissional = ?
      LIMIT 1`,
    [idPaciente, idProfissional]
  );

  if (linhas.length === 0) {
    throw erroNegocio('PACIENTE_NAO_ENCONTRADO', 'Paciente não encontrado ou sem acesso criado.');
  }

  const acesso = linhas[0];

  // Conta já ativada: o paciente tem a própria senha, não se reenvia convite.
  if (acesso.ds_status !== 'pendente') {
    throw erroNegocio('CONTA_NAO_PENDENTE', 'Este paciente já ativou a conta.');
  }

  const senhaTemporaria = gerarSenhaTemporaria();
  const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

  await connection.query(
    "UPDATE usuario_paciente SET ds_senha = ? WHERE id_paciente = ? AND ds_status = 'pendente'",
    [senhaHash, idPaciente]
  );

  return {
    email: acesso.ds_email,
    nomePaciente: acesso.nm_paciente,
    nomeProfissional: acesso.nm_profissional,
    senhaTemporaria,
  };
}

module.exports = { renovarConvite };