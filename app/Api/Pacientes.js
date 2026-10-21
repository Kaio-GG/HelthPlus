// app/Api/loginCadastro.js

import api from './connection';



// CADASTRO DO PACIENTE (feito pelo nutricionista logado)
export const cadastrarPaciente = async (dados) => {
  try {
    const resposta = await api.post('/api/paciente/cadastro', dados);
    console.log(resposta.data);

    return resposta.data; // { mensagem, idPaciente, conviteCriado }
  } catch (erro) {
    throw new Error(
      erro.response?.data?.mensagem ||
        erro.response?.data?.message ||
        'Não foi possível cadastrar o paciente.'
    );
  }
};