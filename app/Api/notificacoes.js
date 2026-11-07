// app/Api/notificacoes.js
// Central de notificações do nutricionista.
//
// Todas as chamadas levam o token da sessão: as rotas de notificação da API
// passaram a exigi-lo, e o profissional de quem são os avisos sai do token,
// não mais do id na URL. Sem o token a resposta é 401; com o token de outra
// conta, 403.
//
// O :idProfissional continua no caminho porque a API ainda o aceita (e
// confere contra o token), o que mantém a URL igual à das versões do
// aplicativo já instaladas.
import api from './connection';

const cabecalho = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const mensagemDoErro = (erro, reserva) =>
  erro.response?.data?.mensagem || erro.response?.data?.message || reserva;

// LISTA AS NOTIFICAÇÕES E QUANTAS NÃO FORAM LIDAS
export const listarNotificacoes = async (idProfissional, token) => {
  try {
    const resposta = await api.get(
      `/api/notificacao/${idProfissional}`,
      cabecalho(token)
    );

    return resposta.data; // { notificacoes: [...], naoLidas }
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível carregar as notificações.'));
  }
};

export const marcarNotificacaoLida = async (idProfissional, idNotificacao, token) => {
  try {
    const resposta = await api.put(
      `/api/notificacao/${idProfissional}/${idNotificacao}/lida`,
      null,
      cabecalho(token)
    );

    return resposta.data; // { naoLidas }
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível marcar a notificação.'));
  }
};

export const marcarTodasLidas = async (idProfissional, token) => {
  try {
    const resposta = await api.put(
      `/api/notificacao/${idProfissional}/todas-lidas`,
      null,
      cabecalho(token)
    );

    return resposta.data; // { mensagem, marcadas }
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível marcar as notificações.'));
  }
};

export const buscarPreferencias = async (idProfissional, token) => {
  try {
    const resposta = await api.get(
      `/api/notificacao/${idProfissional}/preferencias`,
      cabecalho(token)
    );

    return resposta.data.preferencias;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível carregar as preferências.'));
  }
};

// Só os campos enviados mudam; os outros ficam como estão no banco.
export const salvarPreferencias = async (idProfissional, preferencias, token) => {
  try {
    const resposta = await api.put(
      `/api/notificacao/${idProfissional}/preferencias`,
      preferencias,
      cabecalho(token)
    );

    return resposta.data.preferencias;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível salvar as preferências.'));
  }
};

// CRIA UMA NOTIFICAÇÃO
//
// Usada pelas telas que ainda não gravam no banco (agenda, planos). Quando
// essas rotas existirem na API, a notificação passa a nascer lá dentro e
// esta função sai daqui.
//
// "idProfissional" não precisa mais ir no corpo: a API grava o aviso para
// quem está logado e ignora o que vier. Quem ainda manda não quebra.
export const criarNotificacao = async (dados, token) => {
  try {
    const resposta = await api.post('/api/notificacao', dados, cabecalho(token));

    return resposta.data;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível criar a notificação.'));
  }
};
