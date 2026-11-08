// Api/servicos/retencao.js
// Expurgo automático: apaga o que já passou do prazo de guarda.
//
// LGPD, Art. 15 e 16: terminada a finalidade, o dado é eliminado. Antes
// nada no sistema apagava nada por decurso de prazo — token de senha usado
// há um ano, notificação lida, o telefone de quem marcou uma consulta
// avulsa em 2024... tudo ficava para sempre.
//
// Roda um minuto depois de a API subir e depois uma vez por dia. Os prazos
// vêm do Api/.env (RETENCAO_*), com os padrões de config.js.
//
// O que NÃO é apagado aqui, de propósito:
//   - a ficha, as avaliações e as consultas do paciente: o prazo de guarda
//     do prontuário é decisão clínica e jurídica do nutricionista, e quem
//     apaga é ele (ou o pedido de exclusão do paciente);
//   - o log de auditoria antes do prazo dele: é a prova do que aconteceu.
const pool = require('../connection');
const config = require('../config');
const { registrarAuditoria } = require('./auditoria');

const UM_DIA = 24 * 60 * 60 * 1000;

const tarefas = [
  {
    nome: 'tokens de senha vencidos (nutricionista)',
    sql: `DELETE FROM token_senha
           WHERE dt_expiracao < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    prazo: () => config.retencao.tokenSenha,
  },
  {
    nome: 'tokens de senha vencidos (paciente)',
    sql: `DELETE FROM token_senha_paciente
           WHERE dt_expiracao < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    prazo: () => config.retencao.tokenSenha,
  },
  {
    nome: 'notificações lidas antigas',
    sql: `DELETE FROM notificacao
           WHERE dt_leitura IS NOT NULL
             AND dt_leitura < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    prazo: () => config.retencao.notificacaoLida,
  },
  {
    // Quem marcou consulta sem ficha deixou o telefone só para ser avisado
    // DAQUELA consulta. Passada a data, o telefone não tem mais finalidade.
    nome: 'telefones de consultas avulsas já passadas',
    sql: `UPDATE consulta
             SET nr_telefone_avulso = NULL
           WHERE nr_telefone_avulso IS NOT NULL
             AND dt_inicio < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    prazo: () => config.retencao.telefoneAvulso,
  },
  {
    nome: 'pedidos LGPD concluídos antigos',
    sql: `DELETE FROM solicitacao_titular
           WHERE ds_status IN ('atendida', 'recusada')
             AND dt_conclusao < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    prazo: () => config.retencao.solicitacaoConcluida,
  },
  {
    nome: 'registros de auditoria além do prazo',
    sql: `DELETE FROM log_auditoria
           WHERE dt_evento < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)`,
    prazo: () => config.retencao.auditoria,
  },
];

async function executarExpurgo() {
  const resumo = {};

  for (const tarefa of tarefas) {
    try {
      const [resultado] = await pool.query(tarefa.sql, [tarefa.prazo()]);
      if (resultado.affectedRows > 0) resumo[tarefa.nome] = resultado.affectedRows;
    } catch (erro) {
      // Tabela que ainda não existe no banco de quem não rodou o schema:
      // pula, e as outras tarefas seguem.
      if (erro.code !== 'ER_NO_SUCH_TABLE' && erro.code !== 'ER_BAD_FIELD_ERROR') {
        console.error(`[retencao] Falha em "${tarefa.nome}":`, erro.message);
      }
    }
  }

  if (Object.keys(resumo).length > 0) {
    console.log('[retencao] Expurgo concluído:', resumo);
    registrarAuditoria(null, {
      acao: 'retencao.expurgo',
      ator: { tipo: 'sistema', id: null },
      detalhe: resumo,
    });
  }

  return resumo;
}

function agendarExpurgo() {
  setTimeout(executarExpurgo, 60 * 1000).unref();
  setInterval(executarExpurgo, UM_DIA).unref();
}

module.exports = { executarExpurgo, agendarExpurgo };
