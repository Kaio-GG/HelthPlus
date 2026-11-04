// Api/servicos/senhaTemporaria.js
// Gera a senha provisória que vai por e-mail para o paciente.
// Usa crypto (aleatório de verdade) e evita caracteres que se confundem
// na leitura: 0/O, 1/l/I.
const crypto = require('crypto');

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function gerarSenhaTemporaria(tamanho = 10) {
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += ALFABETO[crypto.randomInt(ALFABETO.length)];
  }
  return senha;
}

module.exports = { gerarSenhaTemporaria };