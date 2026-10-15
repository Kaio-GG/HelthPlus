// Formatação de textos e números para exibição.

// 29.9 -> "R$ 29,90"
export const formatarMoeda = (valor) =>
  `R$ ${valor.toFixed(2).replace('.', ',')}`;

// 14.2 -> "14,2"  (casas decimais opcionais)
export const formatarNumero = (valor, casas = 1) =>
  Number(valor).toFixed(casas).replace('.', ',');

// 0.5 -> "+0,5"  |  -0.3 -> "−0,3" (usa o sinal de menos tipográfico)
export const formatarZScore = (valor) => {
  const texto = Math.abs(valor).toFixed(1).replace('.', ',');
  if (valor > 0) return `+${texto}`;
  if (valor < 0) return `−${texto}`;
  return texto;
};

// "Maria Silva" -> "MS"
export const obterIniciais = (nome = '') =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');

// Remove acentos e deixa minúsculo, para buscas ("João" encontra "joao").
export const normalizarTexto = (texto = '') =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
