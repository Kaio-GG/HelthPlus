import axios from 'axios';

// O endereço da API vem do .env (EXPO_PUBLIC_API_URL), não escrito aqui.
//
// O IP da máquina é entregue pelo roteador por DHCP e muda depois de um
// reinício. Com o endereço fixo no código, toda troca de IP derrubava o
// app inteiro — e o sintoma ("não consigo criar conta") não aponta para cá.
// Agora basta corrigir uma linha do .env e reiniciar o Expo.
//
// O valor de reserva é o localhost, que só serve no emulador: no celular
// com Expo Go o .env precisa estar preenchido.
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    'EXPO_PUBLIC_API_URL não definido. Preencha o app/.env com o IP desta ' +
      'máquina (veja com "ipconfig") e reinicie o Expo com "npx expo start --clear".'
  );
}

// Dado de saúde em texto claro só é aceitável na rede de casa, testando.
// Numa versão publicada, o endereço precisa ser https://.
if (!__DEV__ && baseURL.startsWith('http://')) {
  console.error(
    '[segurança] EXPO_PUBLIC_API_URL usa http:// numa versão de produção. ' +
      'Os dados de saúde trafegam sem criptografia. Use https://.'
  );
}

const api = axios.create({
  baseURL,
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Quando a API responde 401 com um token enviado, a sessão acabou: o token
// venceu, a senha foi trocada em outro aparelho ou alguém tocou em "Sair
// de todos os aparelhos". Quem se inscreve aqui (os contextos de sessão)
// limpa a sessão e volta para a tela inicial, em vez de cada tela mostrar
// um erro diferente.
const ouvintesDeSessaoEncerrada = new Set();

export function aoEncerrarSessao(funcao) {
  ouvintesDeSessaoEncerrada.add(funcao);
  return () => ouvintesDeSessaoEncerrada.delete(funcao);
}

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const enviouToken = Boolean(erro.config?.headers?.Authorization);

    // O login devolve 401 para senha errada — isso não é sessão encerrada.
    // (A troca de senha devolve 400 para "senha atual incorreta", mas versões
    // antigas da API devolviam 401: por isso /senha também fica de fora.)
    const ehLogin = /\/login$|\/primeiro-acesso$|\/senha(\/\d+)?$/.test(erro.config?.url || '');

    if (erro.response?.status === 401 && enviouToken && !ehLogin) {
      const token = String(erro.config.headers.Authorization).replace('Bearer ', '');
      ouvintesDeSessaoEncerrada.forEach((funcao) => {
        try {
          funcao(token);
        } catch {
          // Um ouvinte com problema não impede os outros.
        }
      });
    }

    return Promise.reject(erro);
  }
);

export default api;
