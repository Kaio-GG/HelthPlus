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

// A conta do profissional para a troca de senha pelo perfil: o hash, para
// conferir a senha atual, e o contato, para avisar por e-mail que a senha
// mudou. Vem na mesma consulta porque as duas coisas são usadas na mesma
// requisição.
async function buscarContaDoProfissional(idProfissional) {
    const sql = `
        SELECT ds_senha_hash, ds_email, nm_profissional
        FROM profissional
        WHERE id_profissional = ?
    `;

    const [resultado] = await pool.execute(sql, [idProfissional]);

    return resultado[0];
}

// ---------------------------------------------------------------
// As mesmas operações, para a conta do PACIENTE
//
// O paciente tem conta em usuario_paciente e token em
// token_senha_paciente — tabelas próprias, porque a conta dele é outra.
// A tela "Esqueci minha senha" é a mesma para os dois perfis, então estas
// funções existem para o fluxo do paciente não acabar em silêncio.
// ---------------------------------------------------------------

// A conta do paciente pelo e-mail de acesso.
//
// 'bloqueado' fica de fora: redefinir a senha não pode ser a forma de
// voltar a entrar numa conta que o nutricionista fechou. 'pendente'
// entra, sim — é quem recebeu o convite e ainda não ativou a conta.
async function buscarContaDoPacientePorEmail(email) {
    const sql = `
        SELECT
            u.id_paciente,
            u.ds_email,
            u.ds_status,
            p.nm_paciente
        FROM usuario_paciente u
        JOIN paciente p ON p.id_paciente = u.id_paciente
        WHERE u.ds_email = ?
          AND u.ds_status IN ('pendente', 'ativo')
    `;

    const [resultado] = await pool.execute(sql, [email]);

    return resultado[0];
}

async function inserirTokenSenhaDoPaciente(idPaciente, tokenHash, minutosDeValidade) {
    const sql = `
        INSERT INTO token_senha_paciente (
            id_paciente,
            ds_token_hash,
            dt_expiracao
        )
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
    `;

    await pool.execute(sql, [idPaciente, tokenHash, minutosDeValidade]);
}

async function marcarTokensAnterioresDoPacienteComoUsados(idPaciente) {
    const sql = `
        UPDATE token_senha_paciente
        SET dt_uso = NOW()
        WHERE id_paciente = ?
          AND dt_uso IS NULL
    `;

    await pool.execute(sql, [idPaciente]);
}

async function buscarTokenValidoDoPaciente(tokenHash) {
    const sql = `
        SELECT
            t.id_token,
            t.id_paciente,
            u.ds_email,
            p.nm_paciente
        FROM token_senha_paciente t
        JOIN usuario_paciente u ON u.id_paciente = t.id_paciente
        JOIN paciente p ON p.id_paciente = t.id_paciente
        WHERE t.ds_token_hash = ?
          AND t.dt_uso IS NULL
          AND t.dt_expiracao > NOW()
    `;

    const [resultado] = await pool.execute(sql, [tokenHash]);

    return resultado[0];
}

async function marcarTokenDoPacienteComoUsado(idToken) {
    const sql = `
        UPDATE token_senha_paciente
        SET dt_uso = NOW()
        WHERE id_token = ?
    `;

    const [resultado] = await pool.execute(sql, [idToken]);

    return resultado.affectedRows > 0;
}

// ds_status fica como está de propósito: quem ainda não ativou a conta
// continua 'pendente' e passa pela tela de primeiro acesso, onde registra
// os consentimentos da LGPD. Redefinir a senha não substitui esse passo.
async function atualizarSenhaDoPaciente(idPaciente, senhaHash) {
    const sql = `
        UPDATE usuario_paciente
        SET ds_senha = ?
        WHERE id_paciente = ?
    `;

    const [resultado] = await pool.execute(sql, [senhaHash, idPaciente]);

    return resultado.affectedRows > 0;
}

module.exports = {
    inserirTokenSenha,
    marcarTokensAnterioresComoUsados,
    buscarTokenValido,
    marcarTokenComoUsado,
    atualizarSenha,
    buscarContaDoProfissional,
    buscarContaDoPacientePorEmail,
    inserirTokenSenhaDoPaciente,
    marcarTokensAnterioresDoPacienteComoUsados,
    buscarTokenValidoDoPaciente,
    marcarTokenDoPacienteComoUsado,
    atualizarSenhaDoPaciente
};
