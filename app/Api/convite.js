// Convites por e-mail.
//
//   reenviarConviteDoPaciente -> gera uma senha provisória nova e manda
//     o e-mail de primeiro acesso para o paciente (a senha antiga está
//     em hash no banco, não dá para reenviar a mesma).
//   convidarTestador -> manda o link de instalação para alguém testar o
//     aplicativo enquanto ele não está na Play Store.
import api from './connection';
import { mensagemDeErro } from './erros';

const comToken = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Ver app/Api/erros.js. O apelido mantém as chamadas deste arquivo.
const mensagemDoErro = mensagemDeErro;

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
