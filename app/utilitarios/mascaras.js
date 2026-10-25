// Máscaras de digitação (aplicadas enquanto o usuário escreve).

// Mantém apenas os dígitos de um texto.
export const apenasDigitos = (texto = '') => texto.replace(/\D/g, '');

// 12062023 -> 12/06/2023
//
// Atenção ao usar: o campo guarda no máximo 8 dígitos. Quando ele já está
// cheio, o que o usuário digitar a mais é descartado aqui e a tela não
// muda — parece que o aplicativo travou. Por isso os campos de data usam
// "selecionarAoFocar", que marca o conteúdo ao tocar: digitar substitui a
// data inteira em vez de tentar acrescentar no fim.
export const aplicarMascaraData = (texto) => {
  const digitos = apenasDigitos(texto).slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
};

// 11987654321 -> (11) 98765-4321
export const aplicarMascaraTelefone = (texto) => {
  const digitos = apenasDigitos(texto).slice(0, 11);
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : '';
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
};

// 01310100 -> 01310-100
export const aplicarMascaraCep = (texto) => {
  const digitos = apenasDigitos(texto).slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
};

// Aceita números decimais com vírgula ou ponto (ex.: "14,2").
export const aplicarMascaraDecimal = (texto) => {
  const limpo = texto.replace(/[^0-9.,]/g, '').replace('.', ',');
  const partes = limpo.split(',');
  if (partes.length <= 1) return partes[0];
  return `${partes[0]},${partes.slice(1).join('')}`;
};

// "14,2" -> 14.2 (retorna null se não for um número válido)
export const decimalParaNumero = (texto) => {
  if (texto === undefined || texto === null || texto === '') return null;
  const numero = parseFloat(String(texto).replace(',', '.'));
  return Number.isNaN(numero) ? null : numero;
};
