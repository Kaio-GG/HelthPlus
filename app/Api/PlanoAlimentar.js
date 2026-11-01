// app/Api/Planos.js
// Chamadas da API do plano alimentar (mesmo padrão do Pacientes.js).
import api from './connection';

const mensagemDeErro = (erro, padrao) =>
  new Error(erro.response?.data?.mensagem || erro.response?.data?.message || padrao);

// CRIAR plano  ->  { mensagem, idPlano }
export const cadastrarPlano = async (dados) => {
  try {
    const resposta = await api.post('/api/plano/cadastro', dados);
    return resposta.data;
  } catch (erro) {
    throw mensagemDeErro(erro, 'Não foi possível criar o plano alimentar.');
  }
};

// ATUALIZAR plano existente  ->  { mensagem, idPlano }
export const atualizarPlano = async (idPlano, dados) => {
  try {
    const resposta = await api.put(`/api/plano/${idPlano}`, dados);
    return resposta.data;
  } catch (erro) {
    throw mensagemDeErro(erro, 'Não foi possível atualizar o plano alimentar.');
  }
};

// ARQUIVAR / REATIVAR  (status: 'ativo' ou 'arquivado')
export const alterarStatusPlano = async (idPlano, idProfissional, status) => {
  try {
    const resposta = await api.patch(`/api/plano/${idPlano}/status`, { idProfissional, status });
    return resposta.data;
  } catch (erro) {
    throw mensagemDeErro(erro, 'Não foi possível alterar o status do plano.');
  }
};

// LISTAR os planos do nutricionista  ->  array de planos
export const listarPlanos = async (idProfissional) => {
  try {
    const resposta = await api.get(`/api/plano/profissional/${idProfissional}`);
    return resposta.data.planos;
  } catch (erro) {
    throw mensagemDeErro(erro, 'Não foi possível carregar os planos alimentares.');
  }
};