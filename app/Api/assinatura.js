// Assinatura paga do nutricionista: o plano fica no banco, não só na
// memória do aplicativo. Antes, quem saía da conta voltava sem plano.
import api from './connection';

// Todas as rotas exigem o token do nutricionista (o id sai do token).
const comToken = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const mensagemDoErro = (erro, padrao) =>
  erro.response?.data?.mensagem ||
  erro.response?.data?.message ||
  (erro.response ? `${padrao} (HTTP ${erro.response.status}).` : 'Não foi possível conectar à API. Verifique se o servidor está ligado.');

// Devolve { assinatura, cobrancas, totalPacientes }.
// "assinatura" vem null quando a pessoa não tem plano.
export const buscarAssinatura = async (token) => {
  try {
    const resposta = await api.get('/api/assinatura', comToken(token));

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO BUSCAR ASSINATURA:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(mensagemDoErro(erro, 'Não foi possível buscar a sua assinatura'));
  }
};

// Assina ou troca de plano. O servidor confere o limite de pacientes e
// grava a cobrança com o preço do catálogo dele.
export const assinarPlano = async (token, planoId) => {
  try {
    const resposta = await api.put('/api/assinatura', { planoId }, comToken(token));

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO ASSINAR PLANO:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(mensagemDoErro(erro, 'Não foi possível atualizar o seu plano'));
  }
};

export const cancelarAssinatura = async (token) => {
  try {
    const resposta = await api.delete('/api/assinatura', comToken(token));

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO CANCELAR ASSINATURA:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(mensagemDoErro(erro, 'Não foi possível cancelar a sua assinatura'));
  }
};
