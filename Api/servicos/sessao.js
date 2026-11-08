// Api/servicos/sessao.js
// Emissão e conferência dos tokens de sessão (JWT).
//
// Três tipos de token, que não se substituem:
//   profissional              sessão do nutricionista
//   paciente                  sessão do paciente
//   paciente_primeiro_acesso  só serve para aceitar os termos e trocar a
//                             senha provisória; 15 minutos de vida
//
// Cada token leva a "versão da sessão" da conta (sv). Trocar a senha,
// redefinir pelo e-mail ou tocar em "Sair de todos os aparelhos" sobe a
// versão no banco, e todo token emitido antes deixa de valer na hora —
// sem esperar as 8 horas de validade.
const jwt = require('jsonwebtoken');
const pool = require('../connection');
const config = require('../config');

function emitirToken(tipo, id, versaoSessao = 0, validade = config.jwt.validadeSessao) {
  const carga =
    tipo === 'profissional'
      ? { tipo, id_profissional: Number(id), sv: Number(versaoSessao) || 0 }
      : { tipo, id_paciente: Number(id), sv: Number(versaoSessao) || 0 };

  return jwt.sign(carga, config.jwt.segredo, {
    algorithm: config.jwt.algoritmo,
    issuer: config.jwt.emissor,
    expiresIn: validade,
  });
}

// Devolve a carga do token, ou null se ele não vale.
function lerToken(req) {
  const autorizacao = req.headers.authorization || '';
  if (!autorizacao.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(autorizacao.slice(7), config.jwt.segredo, {
      algorithms: [config.jwt.algoritmo],
      issuer: config.jwt.emissor,
    });
  } catch {
    return null;
  }
}

async function estadoDoProfissional(idProfissional) {
  const [linhas] = await pool.query(
    `SELECT st_ativo, COALESCE(nr_versao_sessao, 0) AS versao
       FROM profissional
      WHERE id_profissional = ?`,
    [idProfissional]
  );
  return linhas[0] || null;
}

async function estadoDoPaciente(idPaciente) {
  const [linhas] = await pool.query(
    `SELECT ds_status, COALESCE(nr_versao_sessao, 0) AS versao
       FROM usuario_paciente
      WHERE id_paciente = ?`,
    [idPaciente]
  );
  return linhas[0] || null;
}

async function encerrarSessoesDoProfissional(idProfissional, conn = pool) {
  await conn.query(
    `UPDATE profissional
        SET nr_versao_sessao = COALESCE(nr_versao_sessao, 0) + 1
      WHERE id_profissional = ?`,
    [idProfissional]
  );
}

async function encerrarSessoesDoPaciente(idPaciente, conn = pool) {
  await conn.query(
    `UPDATE usuario_paciente
        SET nr_versao_sessao = COALESCE(nr_versao_sessao, 0) + 1
      WHERE id_paciente = ?`,
    [idPaciente]
  );
}

module.exports = {
  emitirToken,
  lerToken,
  estadoDoProfissional,
  estadoDoPaciente,
  encerrarSessoesDoProfissional,
  encerrarSessoesDoPaciente,
};
