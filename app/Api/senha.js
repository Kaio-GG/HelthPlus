// app/Api/senha.js
// Chamadas da redefinição e da troca de senha.
import api from './connection';
import { mensagemDeErro } from './erros';

// Ver app/Api/erros.js. O helper daqui também não distinguia "a API recusou"
// de "a API não respondeu" — e este é o fluxo de quem já está sem acesso à
// conta, justamente quem menos pode receber uma mensagem vaga.
const mensagemDoErro = mensagemDeErro;

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
