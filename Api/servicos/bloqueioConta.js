// Api/servicos/bloqueioConta.js
// Bloqueio temporário da conta depois de várias senhas erradas seguidas.
//
// O limite por IP (middleware/limiteTaxa.js) não basta sozinho: quem tenta
// a mesma conta a partir de muitos IPs escapa dele. Este contador fica na
// própria conta, no banco, e sobrevive a reiniciar a API.
//
// Depois de N erros (BLOQUEIO_TENTATIVAS, padrão 5) a conta fica fechada
// por M minutos (BLOQUEIO_MINUTOS, padrão 15), MESMO com a senha certa. A
// resposta do bloqueio é a mesma do limite por IP, para não confirmar a um
// atacante que o e-mail existe.
const pool = require('../connection');
const config = require('../config');

const TABELAS = {
  profissional: { tabela: 'profissional', chave: 'id_profissional' },
  paciente: { tabela: 'usuario_paciente', chave: 'id_paciente' },
};

function alvo(tipo) {
  const item = TABELAS[tipo];
  if (!item) throw new Error(`Tipo de conta desconhecido: ${tipo}`);
  return item;
}

// A conta está bloqueada agora?
async function contaBloqueada(tipo, id) {
  const { tabela, chave } = alvo(tipo);

  const [linhas] = await pool.query(
    `SELECT dt_bloqueio_ate > UTC_TIMESTAMP() AS bloqueada
       FROM ${tabela}
      WHERE ${chave} = ?`,
    [id]
  );

  return Boolean(linhas[0]?.bloqueada);
}

// Conta um erro de senha. Devolve true se este erro fechou a conta.
async function registrarFalha(tipo, id) {
  const { tabela, chave } = alvo(tipo);

  await pool.query(
    `UPDATE ${tabela}
        SET nr_tentativas_falhas = COALESCE(nr_tentativas_falhas, 0) + 1
      WHERE ${chave} = ?`,
    [id]
  );

  const [resultado] = await pool.query(
    `UPDATE ${tabela}
        SET dt_bloqueio_ate = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE),
            nr_tentativas_falhas = 0
      WHERE ${chave} = ?
        AND nr_tentativas_falhas >= ?`,
    [config.bloqueio.minutos, id, config.bloqueio.tentativas]
  );

  return resultado.affectedRows > 0;
}

// Login certo: zera o contador.
async function registrarSucesso(tipo, id) {
  const { tabela, chave } = alvo(tipo);

  await pool.query(
    `UPDATE ${tabela}
        SET nr_tentativas_falhas = 0,
            dt_bloqueio_ate = NULL
      WHERE ${chave} = ?`,
    [id]
  );
}

const MENSAGEM_BLOQUEIO =
  'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';

module.exports = {
  contaBloqueada,
  registrarFalha,
  registrarSucesso,
  MENSAGEM_BLOQUEIO,
};
