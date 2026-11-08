// app/Api/lgpd.js
// Direitos do titular (LGPD) e auditoria — rotas /api/lgpd da API.
import api from './connection';
import { erroDaApi } from './erros';

const cabecalho = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

async function pedir(metodo, caminho, token, corpo, padrao) {
  if (!token) throw new Error('Sua sessão expirou. Entre novamente.');

  try {
    const resposta =
      metodo === 'get'
        ? await api.get(caminho, cabecalho(token))
        : await api[metodo](caminho, corpo ?? {}, cabecalho(token));
    return resposta.data;
  } catch (erro) {
    throw erroDaApi(erro, padrao);
  }
}

// ---------- Paciente ----------

export const exportarMeusDados = (token) =>
  pedir('get', '/api/lgpd/paciente/meus-dados', token, null, 'Não foi possível gerar a cópia dos seus dados.');

export const listarMeusConsentimentos = (token) =>
  pedir('get', '/api/lgpd/paciente/consentimentos', token, null, 'Não foi possível buscar os consentimentos.');

export const revogarMeuConsentimento = (token) =>
  pedir('post', '/api/lgpd/paciente/consentimentos/revogar', token, { confirmar: true }, 'Não foi possível revogar.');

export const listarMeusAcessos = (token) =>
  pedir('get', '/api/lgpd/paciente/acessos', token, null, 'Não foi possível buscar o histórico de acessos.');

export const listarMinhasSolicitacoes = (token) =>
  pedir('get', '/api/lgpd/paciente/solicitacoes', token, null, 'Não foi possível buscar os seus pedidos.');

export const enviarSolicitacao = (token, tipo, mensagem) =>
  pedir('post', '/api/lgpd/paciente/solicitacoes', token, { tipo, mensagem }, 'Não foi possível enviar o pedido.');

// ---------- Nutricionista ----------

export const exportarDadosDoProfissional = (token) =>
  pedir('get', '/api/lgpd/profissional/meus-dados', token, null, 'Não foi possível gerar a cópia dos seus dados.');

export const listarMinhaAtividade = (token) =>
  pedir('get', '/api/lgpd/profissional/atividade', token, null, 'Não foi possível buscar o registro de atividade.');

export const listarSolicitacoesDosPacientes = (token) =>
  pedir('get', '/api/lgpd/profissional/solicitacoes', token, null, 'Não foi possível buscar os pedidos.');

export const responderSolicitacao = (token, idSolicitacao, status, resposta) =>
  pedir(
    'patch',
    `/api/lgpd/profissional/solicitacoes/${encodeURIComponent(idSolicitacao)}`,
    token,
    { status, resposta },
    'Não foi possível responder o pedido.'
  );

export const exportarDadosDoPaciente = (token, idPaciente) =>
  pedir(
    'get',
    `/api/lgpd/profissional/pacientes/${encodeURIComponent(idPaciente)}/exportar`,
    token,
    null,
    'Não foi possível exportar os dados do paciente.'
  );

export const listarAcessosDoPaciente = (token, idPaciente) =>
  pedir(
    'get',
    `/api/lgpd/profissional/pacientes/${encodeURIComponent(idPaciente)}/acessos`,
    token,
    null,
    'Não foi possível buscar o histórico de acessos.'
  );
