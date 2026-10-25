const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

const { buscarProfissionalPorEmailLogin } = require('../repository/profissionalRepository');
const {
    inserirTokenSenha,
    marcarTokensAnterioresComoUsados,
    buscarTokenValido,
    marcarTokenComoUsado,
    atualizarSenha,
    buscarSenhaHash
} = require('../repository/senhaRepository');
const {
    enviarEmailRedefinicaoSenha,
    MINUTOS_DE_VALIDADE
} = require('../servicos/emailRedefinicaoSenha');

// As mesmas regras do checklist da tela "Nova senha"
// (app/utilitarios/validacoes.js). Se mudar lá, mude aqui: a tela ajuda o
// usuário, mas quem garante é o servidor.
function problemasDaSenha(senha) {
    const problemas = [];

    if (!senha || senha.length < 8) problemas.push('pelo menos 8 caracteres');
    if (!/[A-ZÀ-Ý]/.test(senha || '')) problemas.push('uma letra maiúscula');
    if (!/\d/.test(senha || '')) problemas.push('um número');
    if (!/[^A-Za-z0-9\s]/.test(senha || '')) problemas.push('um caractere especial');

    return problemas;
}

// Token com 8 caracteres de A-Z e 2-9 (sem O/0 e I/1, que se confundem na
// hora de digitar). São 32^8 combinações: chutar não é caminho.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function gerarToken() {
    const bytes = crypto.randomBytes(8);
    let token = '';

    for (const byte of bytes) {
        token += ALFABETO[byte % ALFABETO.length];
    }

    return token;
}

// No banco fica só o hash. Quem ler a tabela não consegue usar o token.
function hashDoToken(token) {
    return crypto.createHash('sha256').update(token.trim().toUpperCase()).digest('hex');
}

// ---------------------------------------------------------------
// POST /api/senha/esqueci
// Pede o link de redefinição.
//
// A resposta é sempre a mesma, exista ou não a conta. Se dissesse
// "e-mail não cadastrado", qualquer um poderia descobrir quem tem conta
// aqui só testando endereços.
// ---------------------------------------------------------------
router.post('/esqueci', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                mensagem: 'Informe o e-mail.'
            });
        }

        const respostaPadrao = {
            mensagem: 'Se o e-mail estiver cadastrado, enviamos as instruções para ele.'
        };

        const profissional = await buscarProfissionalPorEmailLogin(
            email.trim().toLowerCase()
        );

        if (!profissional || !profissional.st_ativo) {
            return res.status(200).json(respostaPadrao);
        }

        // Um pedido novo cancela os anteriores: só o último e-mail vale.
        await marcarTokensAnterioresComoUsados(profissional.id_profissional);

        const token = gerarToken();

        await inserirTokenSenha(
            profissional.id_profissional,
            hashDoToken(token),
            MINUTOS_DE_VALIDADE
        );

        const envio = await enviarEmailRedefinicaoSenha(
            profissional.ds_email,
            profissional.nm_profissional,
            token
        );

        // Sem SMTP configurado o e-mail foi só para o terminal da API. O app
        // mostra esse aviso para ninguém ficar esperando uma mensagem que
        // não vai chegar.
        return res.status(200).json({
            ...respostaPadrao,
            emailEnviado: envio.enviado
        });

    } catch (error) {
        console.error('Erro ao pedir redefinição de senha:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao pedir a redefinição de senha.'
        });
    }
});

// ---------------------------------------------------------------
// POST /api/senha/redefinir
// Troca a senha usando o token do e-mail.
// ---------------------------------------------------------------
router.post('/redefinir', async (req, res) => {
    try {
        const { token, senha } = req.body;

        if (!token || !token.trim()) {
            return res.status(400).json({
                mensagem: 'Informe o código recebido por e-mail.'
            });
        }

        const problemas = problemasDaSenha(senha);

        if (problemas.length > 0) {
            return res.status(400).json({
                mensagem: `A senha precisa ter ${problemas.join(', ')}.`
            });
        }

        const pedido = await buscarTokenValido(hashDoToken(token));

        if (!pedido) {
            return res.status(400).json({
                mensagem: 'Código inválido ou expirado. Peça um novo link.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        await atualizarSenha(pedido.id_profissional, senhaHash);

        // Queima o token: o mesmo link não serve duas vezes.
        await marcarTokenComoUsado(pedido.id_token);

        return res.status(200).json({
            mensagem: 'Senha alterada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao redefinir a senha.'
        });
    }
});

// ---------------------------------------------------------------
// PUT /api/senha/:id
// Troca a senha de dentro do aplicativo, com a senha atual.
//
// ATENÇÃO: a API ainda não usa token de sessão. Enquanto não usar, esta
// rota confia no id da URL — mas exige a senha atual, que é o que impede
// alguém de trocar a senha dos outros só por saber o id. Ao implementar o
// JWT, tirar o id da URL e usar o do token.
// ---------------------------------------------------------------
router.put('/:id', async (req, res) => {
    try {
        const idProfissional = Number(req.params.id);
        const { senhaAtual, novaSenha } = req.body;

        if (!Number.isInteger(idProfissional) || idProfissional <= 0) {
            return res.status(400).json({
                mensagem: 'Profissional não identificado.'
            });
        }

        if (!senhaAtual) {
            return res.status(400).json({
                mensagem: 'Informe a senha atual.'
            });
        }

        const problemas = problemasDaSenha(novaSenha);

        if (problemas.length > 0) {
            return res.status(400).json({
                mensagem: `A nova senha precisa ter ${problemas.join(', ')}.`
            });
        }

        const registro = await buscarSenhaHash(idProfissional);

        if (!registro) {
            return res.status(404).json({
                mensagem: 'Profissional não encontrado.'
            });
        }

        const confere = await bcrypt.compare(senhaAtual, registro.ds_senha_hash);

        if (!confere) {
            return res.status(401).json({
                mensagem: 'A senha atual está incorreta.'
            });
        }

        if (senhaAtual === novaSenha) {
            return res.status(400).json({
                mensagem: 'A nova senha precisa ser diferente da atual.'
            });
        }

        await atualizarSenha(idProfissional, await bcrypt.hash(novaSenha, 12));

        // Um pedido de "esqueci a senha" em aberto deixa de valer: quem
        // acabou de trocar a senha sabendo a atual não deveria ter um link
        // antigo funcionando.
        await marcarTokensAnterioresComoUsados(idProfissional);

        return res.status(200).json({
            mensagem: 'Senha alterada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao alterar a senha.'
        });
    }
});

module.exports = router;
