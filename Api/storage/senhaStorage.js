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
    buscarContaDoProfissional,
    buscarContaDoPacientePorEmail,
    inserirTokenSenhaDoPaciente,
    marcarTokensAnterioresDoPacienteComoUsados,
    buscarTokenValidoDoPaciente,
    marcarTokenDoPacienteComoUsado,
    atualizarSenhaDoPaciente
} = require('../repository/senhaRepository');
const {
    enviarEmailRedefinicaoSenha,
    enviarEmailSenhaAlterada,
    MINUTOS_DE_VALIDADE
} = require('../servicos/mensagensEmail');

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
// Atende os dois perfis: a tela "Esqueci minha senha" é a mesma para o
// nutricionista e para o paciente, e ela não diz qual é qual — o e-mail
// é procurado nas duas contas. Quem só olhasse "profissional" deixaria o
// pedido do paciente morrer em silêncio, escondido pela resposta padrão.
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

        const emailNormalizado = email.trim().toLowerCase();

        const respostaPadrao = {
            mensagem: 'Se o e-mail estiver cadastrado, enviamos as instruções para ele.'
        };

        const profissional = await buscarProfissionalPorEmailLogin(emailNormalizado);
        const profissionalAtivo = profissional && profissional.st_ativo;

        // O mesmo endereço nas duas tabelas é caso degenerado (o
        // nutricionista cadastrado como paciente de si mesmo). Nele vale a
        // conta de profissional, para não disparar dois e-mails com dois
        // códigos e deixar a pessoa sem saber qual digitar.
        const paciente = profissionalAtivo
            ? null
            : await buscarContaDoPacientePorEmail(emailNormalizado);

        if (!profissionalAtivo && !paciente) {
            return res.status(200).json(respostaPadrao);
        }

        const token = gerarToken();

        if (profissionalAtivo) {
            // Um pedido novo cancela os anteriores: só o último e-mail vale.
            await marcarTokensAnterioresComoUsados(profissional.id_profissional);

            await inserirTokenSenha(
                profissional.id_profissional,
                hashDoToken(token),
                MINUTOS_DE_VALIDADE
            );
        } else {
            await marcarTokensAnterioresDoPacienteComoUsados(paciente.id_paciente);

            await inserirTokenSenhaDoPaciente(
                paciente.id_paciente,
                hashDoToken(token),
                MINUTOS_DE_VALIDADE
            );
        }

        const envio = await enviarEmailRedefinicaoSenha(
            profissionalAtivo ? profissional.ds_email : paciente.ds_email,
            profissionalAtivo ? profissional.nm_profissional : paciente.nm_paciente,
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
//
// O app manda só o código, sem dizer o perfil (a tela "Nova senha" é a
// mesma para os dois, e o link do e-mail também). Por isso o código é
// procurado nas duas tabelas de token. Um código não existe nas duas: são
// 32^8 combinações, e cada tabela tem índice único no hash.
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

        const tokenHash = hashDoToken(token);

        const pedido = await buscarTokenValido(tokenHash);
        const pedidoDoPaciente = pedido
            ? null
            : await buscarTokenValidoDoPaciente(tokenHash);

        if (!pedido && !pedidoDoPaciente) {
            return res.status(400).json({
                mensagem: 'Código inválido ou expirado. Peça um novo link.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        if (pedido) {
            await atualizarSenha(pedido.id_profissional, senhaHash);

            // Queima o token: o mesmo link não serve duas vezes.
            await marcarTokenComoUsado(pedido.id_token);
        } else {
            await atualizarSenhaDoPaciente(pedidoDoPaciente.id_paciente, senhaHash);
            await marcarTokenDoPacienteComoUsado(pedidoDoPaciente.id_token);
        }

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

        const conta = await buscarContaDoProfissional(idProfissional);

        if (!conta) {
            return res.status(404).json({
                mensagem: 'Profissional não encontrado.'
            });
        }

        const confere = await bcrypt.compare(senhaAtual, conta.ds_senha_hash);

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

        // O aviso vai DEPOIS de a senha já estar trocada, e sem await: a
        // troca deu certo, e um SMTP lento ou fora do ar só pode atrasar
        // ou perder o aviso, nunca segurar a resposta nem desfazer a
        // troca. O módulo de e-mail já registra a falha no terminal.
        enviarEmailSenhaAlterada(conta.ds_email, conta.nm_profissional).catch(
            (problema) => console.error('Erro ao avisar da troca de senha:', problema.message)
        );

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
