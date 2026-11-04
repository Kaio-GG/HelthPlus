
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

const api = axios.create({
  baseURL,
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
