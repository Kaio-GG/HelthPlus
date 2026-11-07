// API/LoginCadastro.js

import api from './connection';

// CADASTRO DO NUTRICIONISTA
export const cadastrarNutricionista = async (nome, crn, email, senha) => {



  try {

    const resposta = await api.post('/api/profissional/cadastro', {
      nome,
      registro: crn,
      email,
      senha
    });

    return resposta.data;

  } catch (erro) {

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      'Não foi possível cadastrar o nutricionista.'
    );

  }

};


// ATUALIZACAO DOS DADOS PROFISSIONAIS
//
// Leva o token: a rota passou a exigi-lo, e so aceita editar a propria
// conta. Sem o token, 401; com o id de outra conta no caminho, 403.
export const atualizarNutricionista = async (
  idProfissional,
  { nome, crn, telefone },
  token
) => {

  try {

    const resposta = await api.put(`/api/profissional/${idProfissional}`, {
      nome,
      registro: crn,
      telefone
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return resposta.data; // { mensagem, profissional }

  } catch (erro) {

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      'Não foi possível salvar seus dados.'
    );

  }

};


// LOGIN DO NUTRICIONISTA
export const loginNutricionista = async (email, senha) => {

  try {

    const resposta = await api.post('/api/profissional/login', {
      email,
      senha
    });

    return resposta.data;

  } catch (erro) {

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      'Não foi possível realizar o login.'
    );

  }

};