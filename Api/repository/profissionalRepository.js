const pool = require('../connection');

async function buscarProfissionalPorEmail(email) {
    const sql = `
        SELECT id_profissional
        FROM profissional
        WHERE ds_email = ?
    `;

    const [resultado] = await pool.execute(sql, [email]);

    return resultado[0];
}

async function buscarProfissionalPorCRN(registro) {
    const sql = `
        SELECT id_profissional
        FROM profissional
        WHERE nr_registro_conselho = ?
    `;

    const [resultado] = await pool.execute(sql, [registro]);

    return resultado[0];
}

async function inserirProfissional(nome, registro, email, senhaHash) {
    const sql = `
        INSERT INTO profissional (
            nm_profissional,
            nr_registro_conselho,
            ds_email,
            ds_senha_hash,
            ds_profissao
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute(sql, [
        nome,
        registro,
        email,
        senhaHash,
        'Nutricionista'
    ]);

    return {
        id_profissional: resultado.insertId,
        nm_profissional: nome,
        nr_registro_conselho: registro,
        ds_email: email
    };
}

async function buscarProfissionalPorEmailLogin(email) {
    const sql = `
        SELECT
            id_profissional,
            nm_profissional,
            ds_email,
            ds_senha_hash,
            ds_profissao,
            nr_registro_conselho,
            nr_telefone,
            st_ativo
        FROM profissional
        WHERE ds_email = ?
    `;

    const [resultado] = await pool.execute(sql, [email]);

    return resultado[0];
}





// Mesma checagem do cadastro, mas ignorando o próprio profissional:
// na edição, manter o CRN que já é dele não pode ser tratado como repetido.
async function buscarProfissionalPorCRNDeOutro(registro, idProfissional) {
    const sql = `
        SELECT id_profissional
        FROM profissional
        WHERE nr_registro_conselho = ?
          AND id_profissional <> ?
    `;

    const [resultado] = await pool.execute(sql, [registro, idProfissional]);

    return resultado[0];
}

async function atualizarProfissional(idProfissional, nome, registro, telefone) {
    const sql = `
        UPDATE profissional
        SET nm_profissional = ?,
            nr_registro_conselho = ?,
            nr_telefone = ?
        WHERE id_profissional = ?
    `;

    const [resultado] = await pool.execute(sql, [
        nome,
        registro,
        telefone,
        idProfissional
    ]);

    return resultado.affectedRows > 0;
}

module.exports = {
    buscarProfissionalPorEmail,
    buscarProfissionalPorCRN,
    buscarProfissionalPorCRNDeOutro,
    inserirProfissional,
    atualizarProfissional,
    buscarProfissionalPorEmailLogin
};