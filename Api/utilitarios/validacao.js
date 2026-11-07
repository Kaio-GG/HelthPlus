// Api/utilitarios/validacao.js
// Regras de validação que antes estavam copiadas em três storages.
//
// As mesmas regras de app/utilitarios/validacoes.js. Se mudar lá, mude
// aqui: a tela ajuda quem digita, mas quem garante é o servidor — o app
// pode ser contornado batendo direto na API.

// Lista o que falta na senha. Vazia = senha forte.
function problemasDaSenha(senha) {
  const texto = typeof senha === 'string' ? senha : '';
  const problemas = [];

  if (texto.length < 8) problemas.push('pelo menos 8 caracteres');
  if (texto.length > 128) problemas.push('no máximo 128 caracteres');
  if (!/[A-ZÀ-Ý]/.test(texto)) problemas.push('uma letra maiúscula');
  if (!/\d/.test(texto)) problemas.push('um número');
  if (!/[^A-Za-z0-9\s]/.test(texto)) problemas.push('um caractere especial');

  return problemas;
}

function mensagemDaSenha(problemas, prefixo = 'A senha precisa ter') {
  return `${prefixo} ${problemas.join(', ')}.`;
}

function emailValido(email) {
  const texto = typeof email === 'string' ? email.trim() : '';
  return texto.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);
}

function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

// 'AAAA-MM-DD' que existe no calendário (2026-02-30 não passa).
function dataISOValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto || '')) return false;

  const [ano, mes, dia] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

// Data de nascimento plausível: existe, não está no futuro e não tem mais
// de 130 anos.
function nascimentoValido(texto) {
  if (!dataISOValida(texto)) return false;

  const hoje = new Date();
  const hojeISO = hoje.toISOString().slice(0, 10);
  const ano = Number(texto.slice(0, 4));

  return texto <= hojeISO && ano >= hoje.getFullYear() - 130;
}

function calcularIdade(dataNascimento) {
  const texto =
    dataNascimento instanceof Date
      ? `${dataNascimento.getFullYear()}-${String(dataNascimento.getMonth() + 1).padStart(2, '0')}-${String(dataNascimento.getDate()).padStart(2, '0')}`
      : String(dataNascimento || '').slice(0, 10);

  if (!dataISOValida(texto)) return null;

  const [ano, mes, dia] = texto.split('-').map(Number);
  const hoje = new Date();

  let idade = hoje.getFullYear() - ano;
  const jaFez =
    hoje.getMonth() + 1 > mes || (hoje.getMonth() + 1 === mes && hoje.getDate() >= dia);

  if (!jaFez) idade -= 1;

  return idade;
}

// Texto opcional: corta espaços e o tamanho máximo da coluna. Vazio vira
// null. Sem isso um texto maior que a coluna estourava como erro 500
// ("Data too long") em vez de ser recusado ou cortado.
function textoOpcional(valor, maximo) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto ? texto.slice(0, maximo) : null;
}

function idValido(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

module.exports = {
  problemasDaSenha,
  mensagemDaSenha,
  emailValido,
  normalizarEmail,
  dataISOValida,
  nascimentoValido,
  calcularIdade,
  textoOpcional,
  idValido,
};
