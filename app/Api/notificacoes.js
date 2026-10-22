// app/Api/notificacoes.js
// Central de notificações do nutricionista.
import api from './connection';

const mensagemDoErro = (erro, reserva) =>
  erro.response?.data?.mensagem || erro.response?.data?.message || reserva;

// LISTA AS NOTIFICAÇÕES E QUANTAS NÃO FORAM LIDAS
export const listarNotificacoes = async (idProfissional) => {
  try {
    const resposta = await api.get(`/api/notificacao/${idProfissional}`);

    return resposta.data; // { notificacoes: [...], naoLidas }
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível carregar as notificações.'));
  }
};

export const marcarNotificacaoLida = async (idProfissional, idNotificacao) => {
  try {
    const resposta = await api.put(
      `/api/notificacao/${idProfissional}/${idNotificacao}/lida`
    );

    return resposta.data; // { naoLidas }
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível marcar a notificação.'));
  }
};

export const marcarTodasLidas = async (idProfissional) => {
  try {
    const resposta = await api.put(`/api/notificacao/${idProfissional}/todas-lidas`);

    return resposta.data; // { mensagem, marcadas }
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível marcar as notificações.'));
  }
};

export const buscarPreferencias = async (idProfissional) => {
  try {
    const resposta = await api.get(`/api/notificacao/${idProfissional}/preferencias`);

    return resposta.data.preferencias;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível carregar as preferências.'));
  }
};

// Só os campos enviados mudam; os outros ficam como estão no banco.
export const salvarPreferencias = async (idProfissional, preferencias) => {
  try {
    const resposta = await api.put(
      `/api/notificacao/${idProfissional}/preferencias`,
      preferencias
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
export const criarNotificacao = async (dados) => {
  try {
    const resposta = await api.post('/api/notificacao', dados);

    return resposta.data;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível criar a notificação.'));
  }
};
