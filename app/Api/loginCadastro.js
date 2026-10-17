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