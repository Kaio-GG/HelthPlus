// app/Api/connection.js
// Cliente HTTP único usado por todas as chamadas à API.
//
// O endereço vem de app/.env (veja app/.env.example), porque cada pessoa
// da equipe roda a API num IP diferente. Só variáveis com o prefixo
// EXPO_PUBLIC_ chegam até aqui, e a leitura precisa ser escrita assim,
// com ponto: o Expo troca o texto pelo valor na hora de montar o pacote.
import axios from 'axios';

const URL_DA_API = process.env.EXPO_PUBLIC_API_URL;

if (!URL_DA_API) {
  // Aviso em vez de erro: o app continua abrindo e só as telas que usam a
  // API vão falhar, com uma mensagem clara no console.
  console.warn(
    'EXPO_PUBLIC_API_URL não foi definida. Copie app/.env.example para ' +
      'app/.env, coloque o IP da sua máquina e recarregue o aplicativo.'
  );
}

const api = axios.create({
  baseURL: URL_DA_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
