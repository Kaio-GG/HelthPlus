// Chamadas da API ligadas ao paciente: cadastro, listagem, ficha, login,
// evolução e troca de senha.
import api from './connection';
import { erroDaApi } from './erros';

const cabecalho = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// A mensagem de erro mora em app/Api/erros.js, compartilhada por todos os
// clientes. O apelido mantém os `throw criarErro(...)` deste arquivo.
//
// O helper que vivia aqui tinha um defeito sutil: o "erro.message" vinha
// ANTES do ramo de rede, e numa falha de conexão o axios preenche essa
// propriedade com "Network Error". Resultado: a tela mostrava "Network
// Error" em vez da explicação. O compartilhado testa primeiro se houve
// resposta, que é a pergunta que de fato separa os casos.
const criarErro = erroDaApi;

// CADASTRO DO PACIENTE
//
// Leva o token: a rota passou a exigi-lo, e o paciente nasce na lista de
// quem está logado — a API ignora o "idProfissional" que vier no corpo.
export const cadastrarPaciente = async (dados, token) => {
  try {
    if (!token) {
      throw new Error('Sua sessão expirou. Entre novamente como nutricionista.');
    }

    const resposta = await api.post(
      '/api/paciente/cadastro',
      dados,
      cabecalho(token)
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO CADASTRAR PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Erro ao cadastrar paciente');
  }
};

// LISTAGEM DOS PACIENTES DO NUTRICIONISTA LOGADO
export const listarPacientes = async (token) => {
  try {
    const resposta = await api.get('/api/paciente', cabecalho(token));

    return resposta.data.pacientes;
  } catch (erro) {
    console.log(
      'ERRO AO LISTAR PACIENTES:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível buscar os pacientes');
  }
};

// BUSCA A FICHA DE UM PACIENTE PELO ID
export const obterPaciente = async (pacienteId, token) => {
  try {
    if (!pacienteId) {
      throw new Error('O identificador do paciente não foi informado.');
    }

    if (!token) {
      throw new Error('Sua sessão expirou. Entre novamente como nutricionista.');
    }

    const resposta = await api.get(
      `/api/paciente/${encodeURIComponent(pacienteId)}`,
      cabecalho(token)
    );

    return resposta.data.paciente;
  } catch (erro) {
    console.log(
      'ERRO AO BUSCAR FICHA DO PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível carregar a ficha do paciente');
  }
};

// EVOLUÇÃO DE UM PACIENTE, LIDA PELO NUTRICIONISTA
//
// Devolve { paciente, historicoPeso, avaliacoes }. As avaliações vêm da
// mais recente para a mais antiga; o historicoPeso, na ordem contrária
// (é o que o gráfico de linha espera).
export const obterEvolucaoDoPaciente = async (pacienteId, token) => {
  try {
    if (!pacienteId) {
      throw new Error('O identificador do paciente não foi informado.');
    }

    if (!token) {
      throw new Error('Sua sessão expirou. Entre novamente como nutricionista.');
    }

    const resposta = await api.get(
      `/api/paciente/${encodeURIComponent(pacienteId)}/evolucao`,
      cabecalho(token)
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO BUSCAR EVOLUÇÃO DO PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível carregar a evolução do paciente');
  }
};

// EVOLUÇÃO DO PRÓPRIO PACIENTE (token da sessão do paciente)
//
// Mesma resposta da função acima, por outra porta: aqui quem se autentica
// é o paciente, e a API já sabe de quem é a evolução pelo token.
export const obterMinhaEvolucao = async (token) => {
  try {
    if (!token) {
      throw new Error('Sua sessão de paciente não foi encontrada. Entre novamente.');
    }

    const resposta = await api.get(
      '/api/paciente/minha-evolucao',
      cabecalho(token)
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO BUSCAR MINHA EVOLUÇÃO:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível carregar sua evolução');
  }
};

// EXCLUSÃO DO PACIENTE
//
// Apaga o paciente e tudo o que está pendurado nele (acesso ao
// aplicativo, avaliações, consultas). Não tem volta.
export const excluirPaciente = async (pacienteId, token) => {
  try {
    if (!pacienteId) {
      throw new Error('O identificador do paciente não foi informado.');
    }

    if (!token) {
      throw new Error('Sua sessão expirou. Entre novamente como nutricionista.');
    }

    const resposta = await api.delete(
      `/api/paciente/${encodeURIComponent(pacienteId)}`,
      cabecalho(token)
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO APAGAR PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível apagar o paciente');
  }
};

// LOGIN DO PACIENTE
//
// A senha pode ser a que o paciente escolheu ou, enquanto ele não
// escolheu nenhuma, a data de nascimento dele. A resposta traz
// "senhaProvisoria: true" no segundo caso, e é por isso que o aplicativo
// consegue oferecer a troca de senha a quem ainda está com a provisória.
export const loginPaciente = async (email, senha) => {
  try {
    if (!email?.trim() || !senha) {
      throw new Error('Informe o e-mail e a senha.');
    }

    const resposta = await api.post('/api/paciente/login', {
      email: email.trim(),
      senha,
    });

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO NO LOGIN DO PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível realizar o login');
  }
};

// TROCA DE SENHA DO PACIENTE, DE DENTRO DO APLICATIVO
//
// Pede a senha atual — que pode ser a data de nascimento, para quem ainda
// não trocou. É o caminho de quem quer sair da senha provisória.
export const alterarSenhaDoPaciente = async (token, senhaAtual, novaSenha) => {
  try {
    if (!token) {
      throw new Error('Sua sessão de paciente não foi encontrada. Entre novamente.');
    }

    const resposta = await api.put(
      '/api/paciente/senha',
      { senhaAtual, novaSenha },
      cabecalho(token)
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO ALTERAR A SENHA DO PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw criarErro(erro, 'Não foi possível alterar a senha');
  }
};
