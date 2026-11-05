// Api/repository/conviteRepository.js
// Convite de primeiro acesso do paciente.
//
// Gera uma NOVA senha provisória para um paciente que ainda não ativou a
// conta — a senha antiga está em hash, não dá para reenviar a mesma.
//
// Também CRIA o acesso quando ele não existe: um paciente cadastrado com
// "enviar convite" desmarcado não tem linha em usuario_paciente, e sem
// isto o nutricionista não teria como liberar o aplicativo para ele mais
// tarde pela ficha.
const connection = require('../connection');
const bcrypt = require('bcryptjs');
const { gerarSenhaTemporaria } = require('../servicos/senhaTemporaria');

function erroNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

async function renovarConvite(idPaciente, idProfissional) {
  // O paciente precisa ser deste nutricionista. O acesso pode ainda não
  // existir: o LEFT JOIN traz o paciente de qualquer jeito.
  const [linhas] = await connection.query(
    `SELECT p.id_paciente,
            p.nm_paciente,
            p.ds_email       AS email_paciente,
            u.ds_email       AS email_acesso,
            u.ds_status,
            pr.nm_profissional
       FROM paciente p
       JOIN profissional pr      ON pr.id_profissional = p.id_profissional
       LEFT JOIN usuario_paciente u ON u.id_paciente = p.id_paciente
      WHERE p.id_paciente = ?
        AND p.id_profissional = ?
      LIMIT 1`,
    [idPaciente, idProfissional]
  );

  if (linhas.length === 0) {
    throw erroNegocio('PACIENTE_NAO_ENCONTRADO', 'Paciente não encontrado.');
  }

  const acesso = linhas[0];
  const temAcesso = Boolean(acesso.ds_status);

  // Conta já ativada: o paciente tem a própria senha, não se reenvia convite.
  if (temAcesso && acesso.ds_status !== 'pendente') {
    throw erroNegocio('CONTA_NAO_PENDENTE', 'Este paciente já ativou a conta.');
  }

  // Sem acesso criado, o e-mail do convite é o da ficha do paciente.
  const email = acesso.email_acesso || acesso.email_paciente;

  if (!email) {
    throw erroNegocio(
      'SEM_EMAIL',
      'Este paciente não tem e-mail na ficha. Edite a ficha antes de enviar o convite.'
    );
  }

  const senhaTemporaria = gerarSenhaTemporaria();
  const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

  if (temAcesso) {
    await connection.query(
      "UPDATE usuario_paciente SET ds_senha = ?, ds_email = ? WHERE id_paciente = ? AND ds_status = 'pendente'",
      [senhaHash, email, idPaciente]
    );
  } else {
    await connection.query(
      `INSERT INTO usuario_paciente
          (id_paciente, ds_email, ds_senha, ds_status)
        VALUES (?, ?, ?, 'pendente')`,
      [idPaciente, email, senhaHash]
    );
  }

  return {
    email,
    nomePaciente: acesso.nm_paciente,
    nomeProfissional: acesso.nm_profissional,
    senhaTemporaria,
    acessoCriado: !temAcesso,
  };
}

module.exports = { renovarConvite };