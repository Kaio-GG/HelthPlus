const pool = require('../connection');

// Guarda o pedido de redefinição. Recebe o HASH do token, nunca o token.
//
// Quem calcula a hora de expiração é o MySQL, a partir do NOW() dele. Se a
// conta fosse feita no Node, bastaria o servidor da API estar num fuso
// diferente do banco para o prazo sair errado.
async function inserirTokenSenha(idProfissional, tokenHash, minutosDeValidade) {
    const sql = `
        INSERT INTO token_senha (
            id_profissional,
            ds_token_hash,
            dt_expiracao
        )
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
    `;

    await pool.execute(sql, [idProfissional, tokenHash, minutosDeValidade]);
}

// Um pedido novo invalida os anteriores: se a pessoa clicou duas vezes em
// "enviar link", só o último e-mail funciona.
async function marcarTokensAnterioresComoUsados(idProfissional) {
    const sql = `
        UPDATE token_senha
        SET dt_uso = NOW()
        WHERE id_profissional = ?
          AND dt_uso IS NULL
    `;

    await pool.execute(sql, [idProfissional]);
}

// Busca o token ainda válido: não usado e dentro do prazo.
async function buscarTokenValido(tokenHash) {
    const sql = `
        SELECT
            t.id_token,
            t.id_profissional,
            p.ds_email,
            p.nm_profissional
        FROM token_senha t
        JOIN profissional p ON p.id_profissional = t.id_profissional
        WHERE t.ds_token_hash = ?
          AND t.dt_uso IS NULL
          AND t.dt_expiracao > NOW()
    `;

    const [resultado] = await pool.execute(sql, [tokenHash]);

    return resultado[0];
}

async function marcarTokenComoUsado(idToken) {
    const sql = `
        UPDATE token_senha
        SET dt_uso = NOW()
        WHERE id_token = ?
    `;

    const [resultado] = await pool.execute(sql, [idToken]);

    return resultado.affectedRows > 0;
}

async function atualizarSenha(idProfissional, senhaHash) {
    const sql = `
        UPDATE profissional
        SET ds_senha_hash = ?
        WHERE id_profissional = ?
    `;

    const [resultado] = await pool.execute(sql, [senhaHash, idProfissional]);

    return resultado.affectedRows > 0;
}

// Só o hash da senha, para conferir a senha atual na troca pelo perfil.
async function buscarSenhaHash(idProfissional) {
    const sql = `
        SELECT ds_senha_hash
        FROM profissional
        WHERE id_profissional = ?
    `;

    const [resultado] = await pool.execute(sql, [idProfissional]);

    return resultado[0];
}

module.exports = {
    inserirTokenSenha,
    marcarTokensAnterioresComoUsados,
    buscarTokenValido,
    marcarTokenComoUsado,
    atualizarSenha,
    buscarSenhaHash
};
