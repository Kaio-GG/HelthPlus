// app/Api/consultas.js
// Chamadas da API de consultas (mesmo padrão do Pacientes.js).
import api from './connection';
import { erroDaApi } from './erros';

const cabecalho = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// Ver app/Api/erros.js. O apelido mantém os `throw criarErro(...)` abaixo.
const criarErro = erroDaApi;

// A API devolve a data como texto "2026-11-04T09:30:00" (horário local).
// As telas usam Date, então convertemos aqui.
const normalizar = (consulta) => ({ ...consulta, inicio: new Date(consulta.inicio) });

// ---------------------------------------------------------------------
// NUTRICIONISTA
// ---------------------------------------------------------------------

// AGENDAR  ->  { mensagem, idConsulta }
// dados: { idPaciente?, nomeAvulso?, telefoneAvulso?, data: 'AAAA-MM-DD',
//          horario: 'HH:MM', duracao: 45, tipo, observacoes, notificar }
export const criarConsulta = async (dados, token) => {
  try {
    const resposta = await api.post('/api/consulta', dados, cabecalho(token));
    return resposta.data;
  } catch (erro) {
    console.log('ERRO AO AGENDAR CONSULTA:', erro.response?.status, erro.response?.data || erro.message);
    throw criarErro(erro, 'Não foi possível agendar a consulta');
  }
};

// LISTAR as consultas do nutricionista logado (de/ate opcionais: 'AAAA-MM-DD')
export const listarConsultas = async (token, { de, ate } = {}) => {
  try {
    const resposta = await api.get('/api/consulta', {
      ...cabecalho(token),
      params: { de, ate },
    });
    return resposta.data.consultas.map(normalizar);
  } catch (erro) {
    console.log('ERRO AO LISTAR CONSULTAS:', erro.response?.status, erro.response?.data || erro.message);
    throw criarErro(erro, 'Não foi possível buscar as consultas');
  }
};

// ALTERAR STATUS: 'pendente' | 'confirmada' | 'cancelada' | 'realizada'
export const alterarStatusConsulta = async (idConsulta, status, token) => {
  try {
    const resposta = await api.patch(`/api/consulta/${idConsulta}/status`, { status }, cabecalho(token));
    return resposta.data;
  } catch (erro) {
    console.log('ERRO AO ALTERAR STATUS:', erro.response?.status, erro.response?.data || erro.message);
    throw criarErro(erro, 'Não foi possível alterar a consulta');
  }
};

// ---------------------------------------------------------------------
// PACIENTE (usa o token do login do paciente)
// ---------------------------------------------------------------------

// Próximas consultas do paciente logado
export const listarMinhasConsultas = async (token) => {
  try {
    const resposta = await api.get('/api/consulta/minhas', cabecalho(token));
    return resposta.data.consultas.map(normalizar);
  } catch (erro) {
    console.log('ERRO AO LISTAR MINHAS CONSULTAS:', erro.response?.status, erro.response?.data || erro.message);
    throw criarErro(erro, 'Não foi possível buscar suas consultas');
  }
};

// Paciente confirma a consulta
export const confirmarConsulta = async (idConsulta, token) => {
  try {
    const resposta = await api.patch(`/api/consulta/${idConsulta}/confirmar`, {}, cabecalho(token));
    return resposta.data;
  } catch (erro) {
    console.log('ERRO AO CONFIRMAR CONSULTA:', erro.response?.status, erro.response?.data || erro.message);
    throw criarErro(erro, 'Não foi possível confirmar a consulta');
  }
};