const express = require('express');

const router = express.Router();

const {
    TIPOS,
    listarNotificacoes,
    contarNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    buscarPreferencias,
    salvarPreferencias,
    inserirNotificacao
} = require('../repository/notificacaoRepository');

// ATENÇÃO: a API ainda não usa token de sessão. Enquanto não usar, estas
// rotas confiam no id que vem da URL — quem souber um id vê as notificações
// daquele profissional. Ao implementar o JWT, tirar o id da URL e usar o do
// token.

function idValido(valor) {
    const numero = Number(valor);

    return Number.isInteger(numero) && numero > 0 ? numero : null;
}

// Converte o que veio do corpo em 0 ou 1, mantendo o valor atual quando o
// campo não foi enviado.
function comoBit(valor, atual) {
    if (valor === undefined || valor === null) return atual;

    return valor === true || valor === 1 || valor === '1' ? 1 : 0;
}

// ---------------------------------------------------------------
// GET /api/notificacao/:idProfissional
// Lista as notificações e quantas ainda não foram lidas.
// ---------------------------------------------------------------
router.get('/:idProfissional', async (req, res) => {
    try {
        const idProfissional = idValido(req.params.idProfissional);

        if (!idProfissional) {
            return res.status(400).json({ mensagem: 'Profissional não identificado.' });
        }

        const [notificacoes, naoLidas] = await Promise.all([
            listarNotificacoes(idProfissional, req.query.limite),
            contarNaoLidas(idProfissional)
        ]);

        return res.status(200).json({ notificacoes, naoLidas });

    } catch (error) {
        console.error('Erro ao listar notificações:', error);

        return res.status(500).json({ mensagem: 'Erro interno ao listar as notificações.' });
    }
});

// ---------------------------------------------------------------
// GET /api/notificacao/:idProfissional/preferencias
// ---------------------------------------------------------------
router.get('/:idProfissional/preferencias', async (req, res) => {
    try {
        const idProfissional = idValido(req.params.idProfissional);

        if (!idProfissional) {
            return res.status(400).json({ mensagem: 'Profissional não identificado.' });
        }

        return res.status(200).json({
            preferencias: await buscarPreferencias(idProfissional)
        });

    } catch (error) {
        console.error('Erro ao buscar preferências:', error);

        return res.status(500).json({ mensagem: 'Erro interno ao buscar as preferências.' });
    }
});

// ---------------------------------------------------------------
// PUT /api/notificacao/:idProfissional/preferencias
// ---------------------------------------------------------------
router.put('/:idProfissional/preferencias', async (req, res) => {
    try {
        const idProfissional = idValido(req.params.idProfissional);

        if (!idProfissional) {
            return res.status(400).json({ mensagem: 'Profissional não identificado.' });
        }

        // Só o que veio no corpo muda; o resto fica como estava.
        const atuais = await buscarPreferencias(idProfissional);
        const corpo = req.body || {};

        const preferencias = await salvarPreferencias(idProfissional, {
            st_consultas: comoBit(corpo.consultas, atuais.st_consultas),
            st_pacientes: comoBit(corpo.pacientes, atuais.st_pacientes),
            st_planos: comoBit(corpo.planos, atuais.st_planos),
            st_sistema: comoBit(corpo.sistema, atuais.st_sistema),
            st_email: comoBit(corpo.email, atuais.st_email)
        });

        return res.status(200).json({
            mensagem: 'Preferências salvas!',
            preferencias
        });

    } catch (error) {
        console.error('Erro ao salvar preferências:', error);

        return res.status(500).json({ mensagem: 'Erro interno ao salvar as preferências.' });
    }
});

// ---------------------------------------------------------------
// PUT /api/notificacao/:idProfissional/todas-lidas
// ---------------------------------------------------------------
router.put('/:idProfissional/todas-lidas', async (req, res) => {
    try {
        const idProfissional = idValido(req.params.idProfissional);

        if (!idProfissional) {
            return res.status(400).json({ mensagem: 'Profissional não identificado.' });
        }

        const marcadas = await marcarTodasComoLidas(idProfissional);

        return res.status(200).json({
            mensagem: marcadas > 0 ? 'Tudo marcado como lido.' : 'Nada para marcar.',
            marcadas
        });

    } catch (error) {
        console.error('Erro ao marcar notificações como lidas:', error);

        return res.status(500).json({ mensagem: 'Erro interno ao marcar as notificações.' });
    }
});

// ---------------------------------------------------------------
// PUT /api/notificacao/:idProfissional/:idNotificacao/lida
// ---------------------------------------------------------------
router.put('/:idProfissional/:idNotificacao/lida', async (req, res) => {
    try {
        const idProfissional = idValido(req.params.idProfissional);
        const idNotificacao = idValido(req.params.idNotificacao);

        if (!idProfissional || !idNotificacao) {
            return res.status(400).json({ mensagem: 'Notificação não identificada.' });
        }

        await marcarComoLida(idNotificacao, idProfissional);

        // Já estar lida não é erro: a tela pode ter marcado duas vezes.
        return res.status(200).json({
            naoLidas: await contarNaoLidas(idProfissional)
        });

    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);

        return res.status(500).json({ mensagem: 'Erro interno ao marcar a notificação.' });
    }
});

// ---------------------------------------------------------------
// POST /api/notificacao
// Cria uma notificação.
//
// Hoje quem chama é o aplicativo, quando algo acontece (consulta marcada,
// paciente cadastrado). Quando a agenda e os planos estiverem gravando no
// banco, o natural é a própria API chamar inserirNotificacao() de dentro
// daquelas rotas, e esta aqui deixar de ser necessária.
// ---------------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { idProfissional, tipo, titulo, mensagem, rota, idReferencia } = req.body;

        const id = idValido(idProfissional);

        if (!id) {
            return res.status(400).json({ mensagem: 'Profissional não identificado.' });
        }

        if (!TIPOS.includes(tipo)) {
            return res.status(400).json({
                mensagem: `Tipo inválido. Use um destes: ${TIPOS.join(', ')}.`
            });
        }

        if (!titulo || !titulo.trim()) {
            return res.status(400).json({ mensagem: 'A notificação precisa de um título.' });
        }

        const criada = await inserirNotificacao({
            idProfissional: id,
            tipo,
            titulo: titulo.trim(),
            mensagem: mensagem ? mensagem.trim() : null,
            rota: rota || null,
            idReferencia: idValido(idReferencia)
        });

        // Preferência desligada: não é erro, só não gera aviso.
        if (!criada) {
            return res.status(200).json({
                mensagem: 'O profissional desativou esse tipo de notificação.',
                criada: false
            });
        }

        return res.status(201).json({
            mensagem: 'Notificação criada.',
            criada: true,
            idNotificacao: criada.id_notificacao
        });

    } catch (error) {
        console.error('Erro ao criar notificação:', error);

        return res.status(500).json({ mensagem: 'Erro interno ao criar a notificação.' });
    }
});

module.exports = router;
