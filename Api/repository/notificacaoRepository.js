const pool = require('../connection');

// Tipos aceitos. O tipo liga a notificação à preferência que a controla.
const TIPOS = ['consulta', 'paciente', 'plano', 'sistema'];

const COLUNA_DA_PREFERENCIA = {
    consulta: 'st_consultas',
    paciente: 'st_pacientes',
    plano: 'st_planos',
    sistema: 'st_sistema'
};

async function listarNotificacoes(idProfissional, limite) {
    // LIMIT não aceita parâmetro em prepared statement no MySQL; por isso o
    // número entra no texto da query, já convertido para inteiro.
    const quantidade = Math.min(Math.max(Number(limite) || 50, 1), 200);

    const sql = `
        SELECT
            id_notificacao,
            tp_notificacao,
            ds_titulo,
            ds_mensagem,
            ds_rota,
            id_referencia,
            dt_criacao,
            dt_leitura
        FROM notificacao
        WHERE id_profissional = ?
        -- O id desempata: duas notificações criadas no mesmo segundo têm a
        -- mesma dt_criacao, e sem isso a ordem sai embaralhada.
        ORDER BY dt_criacao DESC, id_notificacao DESC
        LIMIT ${quantidade}
    `;

    const [resultado] = await pool.execute(sql, [idProfissional]);

    return resultado;
}

async function contarNaoLidas(idProfissional) {
    const sql = `
        SELECT COUNT(*) AS total
        FROM notificacao
        WHERE id_profissional = ?
          AND dt_leitura IS NULL
    `;

    const [resultado] = await pool.execute(sql, [idProfissional]);

    return Number(resultado[0].total);
}

// O id do profissional entra no WHERE de propósito: sem ele, qualquer um
// marcaria como lida a notificação de outra pessoa só pelo id.
async function marcarComoLida(idNotificacao, idProfissional) {
    const sql = `
        UPDATE notificacao
        SET dt_leitura = NOW()
        WHERE id_notificacao = ?
          AND id_profissional = ?
          AND dt_leitura IS NULL
    `;

    const [resultado] = await pool.execute(sql, [idNotificacao, idProfissional]);

    return resultado.affectedRows > 0;
}

async function marcarTodasComoLidas(idProfissional) {
    const sql = `
        UPDATE notificacao
        SET dt_leitura = NOW()
        WHERE id_profissional = ?
          AND dt_leitura IS NULL
    `;

    const [resultado] = await pool.execute(sql, [idProfissional]);

    return resultado.affectedRows;
}

// Preferências do profissional. Quem nunca mexeu não tem linha na tabela:
// nesse caso vale o padrão, que é receber tudo menos o resumo por e-mail.
const PREFERENCIAS_PADRAO = {
    st_consultas: 1,
    st_pacientes: 1,
    st_planos: 1,
    st_sistema: 1,
    st_email: 0
};

async function buscarPreferencias(idProfissional) {
    const sql = `
        SELECT st_consultas, st_pacientes, st_planos, st_sistema, st_email
        FROM preferencia_notificacao
        WHERE id_profissional = ?
    `;

    const [resultado] = await pool.execute(sql, [idProfissional]);

    return resultado[0] || { ...PREFERENCIAS_PADRAO };
}

// Cria ou atualiza numa tacada só: a chave primária é o id do profissional.
async function salvarPreferencias(idProfissional, preferencias) {
    const sql = `
        INSERT INTO preferencia_notificacao (
            id_profissional,
            st_consultas,
            st_pacientes,
            st_planos,
            st_sistema,
            st_email
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            st_consultas = VALUES(st_consultas),
            st_pacientes = VALUES(st_pacientes),
            st_planos    = VALUES(st_planos),
            st_sistema   = VALUES(st_sistema),
            st_email     = VALUES(st_email)
    `;

    await pool.execute(sql, [
        idProfissional,
        preferencias.st_consultas,
        preferencias.st_pacientes,
        preferencias.st_planos,
        preferencias.st_sistema,
        preferencias.st_email
    ]);

    return buscarPreferencias(idProfissional);
}

// Cria uma notificação, respeitando as preferências: se o profissional
// desligou aquele tipo, nada é gravado (devolve null).
async function inserirNotificacao({
    idProfissional,
    tipo,
    titulo,
    mensagem = null,
    rota = null,
    idReferencia = null
}) {
    if (!TIPOS.includes(tipo)) {
        throw new Error(`Tipo de notificação desconhecido: ${tipo}`);
    }

    const preferencias = await buscarPreferencias(idProfissional);

    if (!preferencias[COLUNA_DA_PREFERENCIA[tipo]]) return null;

    const sql = `
        INSERT INTO notificacao (
            id_profissional,
            tp_notificacao,
            ds_titulo,
            ds_mensagem,
            ds_rota,
            id_referencia
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute(sql, [
        idProfissional,
        tipo,
        titulo,
        mensagem,
        rota,
        idReferencia
    ]);

    return { id_notificacao: resultado.insertId };
}

module.exports = {
    TIPOS,
    listarNotificacoes,
    contarNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    buscarPreferencias,
    salvarPreferencias,
    inserirNotificacao
};
