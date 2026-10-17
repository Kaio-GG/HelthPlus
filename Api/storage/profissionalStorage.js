const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();


const {
    buscarProfissionalPorEmail,
    buscarProfissionalPorCRN,
    inserirProfissional,
    buscarProfissionalPorEmailLogin
} = require('../repository/profissionalRepository');

router.post('/cadastro', async (req, res) => {
    try {
        const { nome, registro, email, senha } = req.body;


        if (!nome || !registro || !email || !senha) {
            return res.status(400).json({
                mensagem: 'Todos os campos são obrigatórios.'
            });
        }

        // Validar senha
        if (senha.length < 8) {
            return res.status(400).json({
                mensagem: 'A senha deve ter pelo menos 8 caracteres.'
            });
        }

        // Verificar e-mail existente
        const profissionalEmail = await buscarProfissionalPorEmail(email);

        if (profissionalEmail) {
            return res.status(409).json({
                mensagem: 'Este e-mail já está cadastrado.'
            });
        }

        // Verificar registro profissional existente
        const profissionalCRN = await buscarProfissionalPorCRN(registro);

        if (profissionalCRN) {
            return res.status(409).json({
                mensagem: 'Este registro profissional já está cadastrado.'
            });
        }

        // Gerar hash da senha
        const senhaHash = await bcrypt.hash(senha, 12);

        // Inserir profissional
        const profissional = await inserirProfissional(
            nome.trim(),
            registro.trim(),
            email.trim().toLowerCase(),
            senhaHash
        );

        return res.status(201).json({
            mensagem: 'Nutricionista cadastrado com sucesso!',
            profissional
        });

    } catch (error) {
        console.error('Erro ao cadastrar nutricionista:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar nutricionista.'
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Validar campos obrigatórios
        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'E-mail e senha são obrigatórios.'
            });
        }

        // Buscar profissional pelo e-mail
        const profissional = await buscarProfissionalPorEmailLogin(
            email.trim().toLowerCase()
        );

        // Verificar se o profissional existe
        if (!profissional) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        // Verificar se a conta está ativa
        if (!profissional.st_ativo) {
            return res.status(403).json({
                mensagem: 'Esta conta está desativada.'
            });
        }

        // Comparar senha informada com o hash armazenado
        const senhaValida = await bcrypt.compare(
            senha,
            profissional.ds_senha_hash
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        // Retornar dados do profissional sem a senha
        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            profissional: {
                id_profissional: profissional.id_profissional,
                nm_profissional: profissional.nm_profissional,
                ds_email: profissional.ds_email,
                ds_profissao: profissional.ds_profissao,
                nr_registro_conselho: profissional.nr_registro_conselho
            }
        });

    } catch (error) {
        console.error('Erro ao realizar login:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao realizar login.'
        });
    }
});



module.exports = router;