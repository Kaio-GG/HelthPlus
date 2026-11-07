const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();


const {
    buscarProfissionalPorEmail,
    buscarProfissionalPorCRN,
    buscarProfissionalPorCRNDeOutro,
    inserirProfissional,
    atualizarProfissional,
    buscarProfissionalPorEmailLogin
} = require('../repository/profissionalRepository');

const { crnValido, normalizarCrn } = require('../utilitarios/crn');

const autenticar = require('../middleware/autenticar');

const { enviarEmailBoasVindasProfissional } = require('../servicos/mensagensEmail');

const AVISO_DE_CRN = 'Registro profissional inválido. Informe a regional e o número, como em CRN-3 12345.';

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

        if (!crnValido(registro)) {
            return res.status(400).json({
                mensagem: AVISO_DE_CRN
            });
        }

        // Guardado sempre na mesma forma, para a checagem de duplicado
        // abaixo não deixar passar o mesmo registro escrito de outro jeito.
        const registroNormalizado = normalizarCrn(registro);

        // O e-mail é gravado em minúsculas; a busca precisa usar a mesma
        // forma, senão "Maria@x.com" passa pela checagem e estoura na chave
        // única da tabela, virando um 500 em vez do aviso de duplicado.
        const emailNormalizado = email.trim().toLowerCase();

        // Verificar e-mail existente
        const profissionalEmail = await buscarProfissionalPorEmail(emailNormalizado);

        if (profissionalEmail) {
            return res.status(409).json({
                mensagem: 'Este e-mail já está cadastrado.'
            });
        }

        // Verificar registro profissional existente
        const profissionalCRN = await buscarProfissionalPorCRN(registroNormalizado);

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
            registroNormalizado,
            emailNormalizado,
            senhaHash
        );

        // Boas-vindas, não verificação: a conta já entra liberada para
        // entrar. Serve para a pessoa ter guardado com qual e-mail se
        // cadastrou — é por ele que ela pede a redefinição de senha
        // depois, e um endereço errado no cadastro só aparece nesse dia.
        //
        // Sem await e com catch próprio: o cadastro já deu certo, e um
        // SMTP fora do ar não pode transformá-lo num erro.
        enviarEmailBoasVindasProfissional(
            profissional.ds_email,
            profissional.nm_profissional
        ).catch((problema) =>
            console.error('Erro ao enviar as boas-vindas:', problema.message)
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

        
        // Gerar token de autenticação JWT
        const token = jwt.sign(
            {
                tipo: 'profissional',
                id_profissional: profissional.id_profissional
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Retornar token e dados do profissional, sem a senha
        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            token,
            profissional: {
                id_profissional: profissional.id_profissional,
                nm_profissional: profissional.nm_profissional,
                ds_email: profissional.ds_email,
                ds_profissao: profissional.ds_profissao,
                nr_registro_conselho: profissional.nr_registro_conselho,
                nr_telefone: profissional.nr_telefone
            }
        });


    } catch (error) {
        console.error('Erro ao realizar login:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao realizar login.'
        });
    }
});



// ATUALIZAÇÃO DOS DADOS PROFISSIONAIS
//
// ATENÇÃO: a API ainda não usa token. Enquanto não usar, esta rota confia
// no id que vem da URL, ou seja: quem souber um id consegue alterar os
// dados daquele profissional. Ao implementar o JWT, tirar o id da URL e
// usar o do token.
// Exige token, e só deixa editar a PRÓPRIA conta.
//
// Aberta, esta rota reescrevia nome, CRN e telefone de qualquer
// nutricionista, sem token e sem confirmar senha. Trocar o CRN exibido de um
// profissional de saúde é alterar dado com efeito sobre terceiros — o
// paciente confere o registro para saber com quem está falando (Art. 6º, V
// da LGPD, qualidade e exatidão dos dados).
router.put('/:id', autenticar, async (req, res) => {
    try {
        const idProfissional = Number(req.params.id);
        const { nome, registro, telefone } = req.body;

        if (!Number.isInteger(idProfissional) || idProfissional <= 0) {
            return res.status(400).json({
                mensagem: 'Profissional não identificado.'
            });
        }

        if (idProfissional !== Number(req.usuario.id_profissional)) {
            return res.status(403).json({
                mensagem: 'Acesso não autorizado.'
            });
        }

        if (!nome || !nome.trim()) {
            return res.status(400).json({
                mensagem: 'O nome é obrigatório.'
            });
        }

        if (!registro || !registro.trim()) {
            return res.status(400).json({
                mensagem: 'O registro profissional é obrigatório.'
            });
        }

        if (!crnValido(registro)) {
            return res.status(400).json({
                mensagem: AVISO_DE_CRN
            });
        }

        const registroNormalizado = normalizarCrn(registro);

        // O mesmo CRN não pode pertencer a dois profissionais.
        const outro = await buscarProfissionalPorCRNDeOutro(
            registroNormalizado,
            idProfissional
        );

        if (outro) {
            return res.status(409).json({
                mensagem: 'Este registro profissional já está cadastrado.'
            });
        }

        const atualizou = await atualizarProfissional(
            idProfissional,
            nome.trim(),
            registroNormalizado,
            telefone ? telefone.trim() : null
        );

        if (!atualizou) {
            return res.status(404).json({
                mensagem: 'Profissional não encontrado.'
            });
        }

        // Devolve os campos atualizados para o app guardar na sessão.
        return res.status(200).json({
            mensagem: 'Dados atualizados com sucesso!',
            profissional: {
                id_profissional: idProfissional,
                nm_profissional: nome.trim(),
                nr_registro_conselho: registroNormalizado,
                nr_telefone: telefone ? telefone.trim() : null
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar profissional:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar os dados.'
        });
    }
});


module.exports = router;