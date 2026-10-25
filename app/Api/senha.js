// app/Api/senha.js
// Chamadas da redefinição e da troca de senha.
import api from './connection';

// Mensagem de erro da API, com um texto de reserva quando a resposta não
// trouxer nada (rede fora, servidor desligado).
const mensagemDoErro = (erro, reserva) =>
  erro.response?.data?.mensagem || erro.response?.data?.message || reserva;

// PEDIDO DO LINK DE REDEFINIÇÃO
//
// A resposta é a mesma exista ou não a conta — é de propósito, para não
// revelar quem tem cadastro. O campo "emailEnviado" vem false quando a API
// está sem SMTP e só imprimiu a mensagem no terminal.
export const pedirLinkDeSenha = async (email) => {
  try {
    const resposta = await api.post('/api/senha/esqueci', { email });

    return resposta.data; // { mensagem, emailEnviado }
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível enviar o link de redefinição.'));
  }
};

// NOVA SENHA A PARTIR DO CÓDIGO RECEBIDO POR E-MAIL
export const redefinirSenha = async (token, senha) => {
  try {
    const resposta = await api.post('/api/senha/redefinir', { token, senha });

    return resposta.data;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível redefinir a senha.'));
  }
};

// TROCA DE SENHA DE DENTRO DO APLICATIVO (pede a senha atual)
export const alterarSenha = async (idProfissional, senhaAtual, novaSenha) => {
  try {
    const resposta = await api.put(`/api/senha/${idProfissional}`, {
      senhaAtual,
      novaSenha,
    });

    return resposta.data;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível alterar a senha.'));
  }
};
