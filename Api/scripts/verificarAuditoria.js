// Api/scripts/verificarAuditoria.js
// Confere a corrente de hashes do log de auditoria.
//
//   cd Api
//   npm run auditoria:verificar
//
// Cada linha de log_auditoria guarda o hash da linha anterior. Se alguém
// apagou ou editou uma linha no meio direto no banco, a corrente quebra
// naquele ponto, e este script diz onde.
//
// A primeira linha que sobrou depois de um expurgo por prazo (retencao.js)
// aponta para uma linha que não existe mais: isso é esperado, e por isso a
// conferência começa confiando no "hash anterior" da primeira linha.
const pool = require('../connection');
const { calcularHash, camposParaHash } = require('../servicos/auditoria');

async function verificar() {
  const [linhas] = await pool.query(
    `SELECT id_log,
            DATE_FORMAT(dt_evento, '%Y-%m-%d %H:%i:%s.%f') AS dt_evento,
            tp_ator, id_ator, ds_acao, ds_recurso, id_recurso,
            id_paciente_alvo, st_sucesso, ds_ip, ds_dispositivo,
            ds_id_requisicao, ds_detalhe, ds_hash_anterior, ds_hash
       FROM log_auditoria
      ORDER BY id_log`
  );

  if (linhas.length === 0) {
    console.log('O log de auditoria está vazio.');
    return true;
  }

  let esperadoAnterior = linhas[0].ds_hash_anterior;
  const problemas = [];

  for (const linha of linhas) {
    // O MySQL devolve 6 casas nos microssegundos; a gravação usa 3.
    const normalizada = {
      ...linha,
      dt_evento: linha.dt_evento.slice(0, 23),
      st_sucesso: Number(linha.st_sucesso),
      ds_detalhe:
        linha.ds_detalhe === null || typeof linha.ds_detalhe === 'string'
          ? linha.ds_detalhe
          : JSON.stringify(linha.ds_detalhe),
    };

    if (linha.ds_hash_anterior !== esperadoAnterior) {
      problemas.push(`Linha ${linha.id_log}: não aponta para a linha anterior (linha removida antes dela?).`);
    }

    const recalculado = calcularHash(linha.ds_hash_anterior, camposParaHash(normalizada));

    if (recalculado !== linha.ds_hash) {
      problemas.push(`Linha ${linha.id_log}: o conteúdo não bate com o hash (linha editada?).`);
    }

    esperadoAnterior = linha.ds_hash;
  }

  console.log(`Linhas conferidas: ${linhas.length} (de ${linhas[0].id_log} a ${linhas[linhas.length - 1].id_log}).`);

  if (problemas.length === 0) {
    console.log('Corrente íntegra: nenhuma linha foi alterada ou removida.');
    return true;
  }

  console.error(`\n${problemas.length} problema(s) encontrado(s):`);
  problemas.slice(0, 50).forEach((p) => console.error(`  - ${p}`));
  return false;
}

verificar()
  .then((ok) => process.exit(ok ? 0 : 2))
  .catch((erro) => {
    console.error('Erro ao verificar o log de auditoria:', erro.message);
    process.exit(1);
  });
