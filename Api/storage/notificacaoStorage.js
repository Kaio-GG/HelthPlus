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
    inserirNotificacao,
    buscarContatoDoProfissional
} = require('../repository/notificacaoRepository');

const { enviarEmailNotificacao } = require('../servicos/mensagensEmail');

const autenticar = require('../middleware/autenticar');

function idValido(valor) {
    const numero = Number(valor);

    return Number.isInteger(numero) && numero > 0 ? numero : null;
}

// Quem é o profissional destas rotas vem SEMPRE do token, nunca da URL.
//
// Antes vinha da URL, e era disso que o aviso aqui falava: quem soubesse um
// id lia as notificações daquele profissional — e elas citam nome de
// paciente e horário de consulta. Como :idProfissional continua no caminho
// (é a URL que o aplicativo chama), ele agora precisa BATER com o do token;
// divergente, a resposta é 403.
//
// Por que não apagar o parâmetro: a URL é a mesma em versão do aplicativo já
// instalada. Mantido e conferido, a rota continua funcionando para o dono
// dos dados e deixa de funcionar para todo mundo mais.
//
// Devolve o id, ou null depois de já ter respondido o erro.
function profissionalDaSessao(req, res) {
    const doToken = Number(req.usuario.id_profissional);
    const daUrl = idValido(req.params.idProfissional);

    if (!daUrl) {
        res.status(400).json({ mensagem: 'Profissional não identificado.' });
        return null;
    }

    if (daUrl !== doToken) {
        res.status(403).json({ mensagem: 'Acesso não autorizado.' });
        return null;
    }

    return doToken;
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
router.get('/:idProfissional', autenticar, async (req, res) => {
    try {
        const idProfissional = profissionalDaSessao(req, res);

        if (!idProfissional) return;

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
router.get('/:idProfissional/preferencias', autenticar, async (req, res) => {
    try {
        const idProfissional = profissionalDaSessao(req, res);

        if (!idProfissional) return;

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
router.put('/:idProfissional/preferencias', autenticar, async (req, res) => {
    try {
        const idProfissional = profissionalDaSessao(req, res);

        if (!idProfissional) return;

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
router.put('/:idProfissional/todas-lidas', autenticar, async (req, res) => {
    try {
        const idProfissional = profissionalDaSessao(req, res);

        if (!idProfissional) return;

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
router.put('/:idProfissional/:idNotificacao/lida', autenticar, async (req, res) => {
    try {
        const idProfissional = profissionalDaSessao(req, res);

        if (!idProfissional) return;

        const idNotificacao = idValido(req.params.idNotificacao);

        if (!idNotificacao) {
            return res.status(400).json({ mensagem: 'Notificação não identificada.' });
        }

        // O id do profissional entra no UPDATE: marcar como lida a
        // notificação de outra conta não encontra linha.
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
//
// O dono do aviso é quem está logado. O "idProfissional" que vinha no corpo
// é IGNORADO de propósito: aceito, ele deixava qualquer um injetar aviso na
// central de outra pessoa — e o aviso dispara e-mail para quem tem "Resumo
// por e-mail" ligado.
// ---------------------------------------------------------------
router.post('/', autenticar, async (req, res) => {
    try {
        const { tipo, titulo, mensagem, rota, idReferencia } = req.body;

        const id = Number(req.usuario.id_profissional);

        if (!TIPOS.includes(tipo)) {
            return res.status(400).json({
                mensagem: `Tipo inválido. Use um destes: ${TIPOS.join(', ')}.`
            });
        }

        if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
            return res.status(400).json({ mensagem: 'A notificação precisa de um título.' });
        }

        // Os tamanhos das colunas. Passar disso era erro 500 ("Data too long").
        if (titulo.trim().length > 120 || (mensagem && String(mensagem).trim().length > 255)) {
            return res.status(400).json({ mensagem: 'Título até 120 e mensagem até 255 caracteres.' });
        }

        // A rota é o nome de uma tela do aplicativo, e nada mais.
        if (rota && !/^[A-Za-z]{1,60}$/.test(rota)) {
            return res.status(400).json({ mensagem: 'Rota inválida.' });
        }

        const criada = await inserirNotificacao({
            idProfissional: id,
            tipo,
            titulo: titulo.trim(),
            mensagem: mensagem ? String(mensagem).trim() : null,
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

        // "Avisos por e-mail" ligado nas preferências: o mesmo aviso do
        // sino vai também para o e-mail. Sem este trecho o botão da tela
        // de preferências gravava a escolha e nada acontecia.
        //
        // Um aviso por e-mail, na hora. Virar resumo de verdade (um
        // e-mail por dia juntando o que aconteceu) pede alguma coisa
        // rodando sozinha num horário, que a API ainda não tem.
        //
        // Sem await: a notificação já está gravada e aparece no sino de
        // qualquer forma; esperar o SMTP só atrasaria a resposta.
        if (criada.avisarPorEmail) {
            buscarContatoDoProfissional(id)
                .then((contato) => {
                    if (!contato || !contato.ds_email) return;

                    return enviarEmailNotificacao(
                        contato.ds_email,
                        contato.nm_profissional,
                        {
                            titulo: titulo.trim(),
                            mensagem: mensagem ? String(mensagem).trim() : null
                        }
                    );
                })
                .catch((problema) =>
                    console.error('Erro ao enviar o aviso por e-mail:', problema.message)
                );
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
