// Convites por e-mail.
//
//   reenviarConviteDoPaciente -> gera uma senha provisória nova e manda
//     o e-mail de primeiro acesso para o paciente (a senha antiga está
//     em hash no banco, não dá para reenviar a mesma).
//   convidarTestador -> manda o link de instalação para alguém testar o
//     aplicativo enquanto ele não está na Play Store.
import api from './connection';

const comToken = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const mensagemDoErro = (erro, padrao) =>
  erro.response?.data?.mensagem ||
  erro.response?.data?.message ||
  (erro.response ? `${padrao} (HTTP ${erro.response.status}).` : 'Não foi possível conectar à API. Verifique se o servidor está ligado.');

// Devolve { mensagem, conviteEnviado }. "conviteEnviado: false" sem erro
// significa que a API está sem SMTP: o e-mail foi para o terminal dela.
export const reenviarConviteDoPaciente = async (token, idPaciente) => {
  try {
    const resposta = await api.post(
      `/api/convite/reenviar/${encodeURIComponent(idPaciente)}`,
      {},
      comToken(token)
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO REENVIAR CONVITE:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(mensagemDoErro(erro, 'Não foi possível reenviar o convite'));
  }
};

// Devolve { mensagem, enviado }.
export const convidarTestador = async (token, { email, recado }) => {
  try {
    const resposta = await api.post(
      '/api/convite/testador',
      { email, recado },
      comToken(token)
    );

    return resposta.data;
  } catch (erro) {
    console.log(
      'ERRO AO CONVIDAR TESTADOR:',
      erro.response?.status,
      erro.response?.data || erro.message
    );

    throw new Error(mensagemDoErro(erro, 'Não foi possível enviar o convite'));
  }
};
