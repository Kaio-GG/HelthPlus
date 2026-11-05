// Api/repository/assinaturaRepository.js
// A assinatura paga do nutricionista e as cobranças dela.
//
// O plano assinado morava só na memória do aplicativo: ao sair da conta,
// a pessoa voltava sem plano. Agora quem guarda é o banco (tabelas
// "assinatura" e "cobranca", em Api/database/schema.sql), e o aplicativo
// só mostra o que a API devolve.
const pool = require('../connection');

function erroNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// A assinatura ATIVA do profissional, ou null. Uma cancelada devolve
// null de propósito: para o aplicativo, não ter plano e ter cancelado
// são a mesma situação.
async function buscarAssinaturaAtiva(idProfissional) {
  const [linhas] = await pool.query(
    `SELECT ds_plano, ds_status, dt_inicio
       FROM assinatura
      WHERE id_profissional = ?
        AND ds_status = 'ativa'
      LIMIT 1`,
    [idProfissional]
  );

  if (linhas.length === 0) return null;

  return {
    planoId: linhas[0].ds_plano,
    status: linhas[0].ds_status,
    inicio: linhas[0].dt_inicio,
  };
}

// Quantos pacientes o profissional já cadastrou. É o número que o limite
// do plano compara, e por isso tem que sair do banco, não da tela.
async function contarPacientes(idProfissional) {
  const [linhas] = await pool.query(
    'SELECT COUNT(*) AS total FROM paciente WHERE id_profissional = ?',
    [idProfissional]
  );

  return Number(linhas[0].total) || 0;
}

// Assina ou troca de plano. Uma linha por profissional: o ON DUPLICATE
// KEY reescreve a que existe (a chave única é id_profissional), o que
// também reativa uma assinatura cancelada.
async function salvarAssinatura(idProfissional, planoId) {
  await pool.query(
    `INSERT INTO assinatura (id_profissional, ds_plano, ds_status, dt_inicio)
          VALUES (?, ?, 'ativa', NOW())
     ON DUPLICATE KEY UPDATE
          ds_plano = VALUES(ds_plano),
          ds_status = 'ativa',
          dt_inicio = NOW(),
          dt_cancelamento = NULL`,
    [idProfissional, planoId]
  );

  return buscarAssinaturaAtiva(idProfissional);
}

// Cancela. Não apaga a linha: a conta continua sabendo que já assinou.
async function cancelarAssinatura(idProfissional) {
  const [resultado] = await pool.query(
    `UPDATE assinatura
        SET ds_status = 'cancelada',
            dt_cancelamento = NOW()
      WHERE id_profissional = ?
        AND ds_status = 'ativa'`,
    [idProfissional]
  );

  if (resultado.affectedRows === 0) {
    throw erroNegocio('SEM_ASSINATURA', 'Você não tem assinatura ativa.');
  }
}

async function registrarCobranca(idProfissional, referencia, valor) {
  const [resultado] = await pool.query(
    `INSERT INTO cobranca (id_profissional, ds_referencia, vl_cobranca)
          VALUES (?, ?, ?)`,
    [idProfissional, referencia, valor]
  );

  return { idCobranca: resultado.insertId };
}

async function listarCobrancas(idProfissional) {
  const [linhas] = await pool.query(
    `SELECT id_cobranca, ds_referencia, vl_cobranca, dt_cobranca
       FROM cobranca
      WHERE id_profissional = ?
      ORDER BY dt_cobranca DESC, id_cobranca DESC
      LIMIT 50`,
    [idProfissional]
  );

  return linhas.map((linha) => ({
    id: String(linha.id_cobranca),
    referencia: linha.ds_referencia,
    // DECIMAL volta como texto no mysql2; a tela faz conta com ele.
    valor: Number(linha.vl_cobranca),
    data: linha.dt_cobranca,
  }));
}

module.exports = {
  buscarAssinaturaAtiva,
  contarPacientes,
  salvarAssinatura,
  cancelarAssinatura,
  registrarCobranca,
  listarCobrancas,
};
