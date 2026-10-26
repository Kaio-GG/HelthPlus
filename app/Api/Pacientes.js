
import api from './connection';

// CADASTRO DO PACIENTE
export const cadastrarPaciente = async (dados) => {
  try {
    const resposta = await api.post(
      '/api/paciente/cadastro',
      dados
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO CADASTRAR PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      (erro.response
        ? `Erro ao cadastrar paciente (HTTP ${erro.response.status}).`
        : 'Não foi possível conectar à API. Verifique se o servidor está ligado e o endereço está correto.')
    );
  }
};

// LISTAGEM DOS PACIENTES DO NUTRICIONISTA LOGADO
export const listarPacientes = async (token) => {
  try {
    const resposta = await api.get('/api/paciente', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return resposta.data.pacientes;
  } catch (erro) {
    console.log(
      'ERRO AO LISTAR PACIENTES:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      (erro.response
        ? `Não foi possível buscar os pacientes (HTTP ${erro.response.status}).`
        : 'Não foi possível conectar à API. Verifique o servidor e o endereço configurado.')
    );
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
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return resposta.data.paciente;
  } catch (erro) {
    console.log(
      'ERRO AO BUSCAR FICHA DO PACIENTE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      erro.message ||
      'Não foi possível carregar a ficha do paciente.'
    );
  }
};

// LOGIN DO PACIENTE
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

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      erro.message ||
      'Não foi possível realizar o login.'
    );
  }
};

// ATIVAÇÃO DO PRIMEIRO ACESSO DO PACIENTE
export const ativarPrimeiroAcesso = async ({
  token,
  senha,
  confirmarSenha,
  aceitouTermos,
  autorizouDados,
}) => {
  try {
    const resposta = await api.post(
      '/api/paciente/primeiro-acesso',
      {
        senha,
        confirmarSenha,
        aceitouTermos,
        autorizouDados,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO ATIVAR PRIMEIRO ACESSO:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(
      erro.response?.data?.mensagem ||
      erro.response?.data?.message ||
      erro.message ||
      'Não foi possível ativar sua conta.'
    );
  }
};
