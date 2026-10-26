
 // Funções de data em português, sem bibliotecas externas.

export const nomesMeses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const mesesAbreviados = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const nomesDiasSemana = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

export const letrasDiasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const doisDigitos = (numero) => String(numero).padStart(2, '0');

// Converte Date, DD/MM/AAAA ou AAAA-MM-DD para Date válido.
export const normalizarData = (valor) => {
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor;
  }

  if (typeof valor !== 'string' || !valor.trim()) return null;

  const texto = valor.trim();
  let ano;
  let mes;
  let dia;

  const dataBR = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const dataISO = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dataBR) {
    [, dia, mes, ano] = dataBR;
  } else if (dataISO) {
    [, ano, mes, dia] = dataISO;
  } else {
    const data = new Date(texto);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  const resultado = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  if (
    resultado.getFullYear() !== Number(ano) ||
    resultado.getMonth() !== Number(mes) - 1 ||
    resultado.getDate() !== Number(dia)
  ) {
    return null;
  }

  return resultado;
};

// Date -> "09/10/2026"
export const formatarDataBR = (valor) => {
  const data = normalizarData(valor);
  if (!data) return '';
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
};

// Date -> "09/10"
export const formatarDiaMes = (valor) => {
  const data = normalizarData(valor);
  if (!data) return '';
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
};

// Date -> "09:00"
export const formatarHora = (valor) => {
  const data = normalizarData(valor);
  if (!data) return '';
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
};

// Date -> "Sexta-feira, 9 de outubro"
export const formatarDataExtensa = (valor) => {
  const data = normalizarData(valor);
  if (!data) return '';
  return `${nomesDiasSemana[data.getDay()]}, ${data.getDate()} de ${nomesMeses[data.getMonth()].toLowerCase()}`;
};

// "12/06/2023" -> Date ou null
export const converterDataBR = (texto = '') => {
  const data = normalizarData(texto);
  if (!data) return null;

  // Aceita aqui somente o formato brasileiro solicitado.
  if (typeof texto !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(texto.trim())) {
    return null;
  }

  return data;
};

// Date -> "2026-10-09"
export const chaveDoDia = (valor) => {
  const data = normalizarData(valor);
  if (!data) return '';
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
};

export const mesmoDia = (a, b) => {
  const dataA = normalizarData(a);
  const dataB = normalizarData(b);
  return !!dataA && !!dataB && chaveDoDia(dataA) === chaveDoDia(dataB);
};

// Cria uma data no dia/hora informados. O mês começa em zero.
export const criarData = (ano, mes, dia, hora = 0, minuto = 0) =>
  new Date(ano, mes, dia, hora, minuto, 0, 0);

export const DIAS_POR_MES = 365.25 / 12;
const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

// Idade em dias.
export const calcularIdadeEmDias = (nascimento, referencia = new Date()) => {
  const inicioData = normalizarData(nascimento);
  const fimData = normalizarData(referencia);

  if (!inicioData || !fimData) return 0;

  const inicio = new Date(
    inicioData.getFullYear(),
    inicioData.getMonth(),
    inicioData.getDate()
  );
  const fim = new Date(
    fimData.getFullYear(),
    fimData.getMonth(),
    fimData.getDate()
  );

  return Math.max(0, Math.floor((fim - inicio) / MILISSEGUNDOS_POR_DIA));
};

// Diferença em meses completos entre nascimento e referência.
export const calcularIdadeEmMeses = (nascimento, referencia = new Date()) => {
  const nascimentoData = normalizarData(nascimento);
  const referenciaData = normalizarData(referencia);

  if (!nascimentoData || !referenciaData) return 0;

  let meses =
    (referenciaData.getFullYear() - nascimentoData.getFullYear()) * 12 +
    (referenciaData.getMonth() - nascimentoData.getMonth());

  if (referenciaData.getDate() < nascimentoData.getDate()) {
    meses -= 1;
  }

  return Math.max(0, meses);
};

// 40 -> "3 anos e 4 meses"; 8 -> "8 meses"; 72 -> "6 anos"
export const formatarIdade = (totalMeses) => {
  const mesesValidos = Math.max(0, Number(totalMeses) || 0);
  const anos = Math.floor(mesesValidos / 12);
  const meses = mesesValidos % 12;

  const textoAnos = anos === 1 ? '1 ano' : `${anos} anos`;
  const textoMeses = meses === 1 ? '1 mês' : `${meses} meses`;

  if (anos === 0) return textoMeses;
  if (meses === 0) return textoAnos;
  return `${textoAnos} e ${textoMeses}`;
};

// 40 -> "3 anos"
export const formatarIdadeCurta = (totalMeses) => {
  const mesesValidos = Math.max(0, Number(totalMeses) || 0);
  const anos = Math.floor(mesesValidos / 12);

  if (anos === 0) {
    return mesesValidos === 1 ? '1 mês' : `${mesesValidos} meses`;
  }

  return anos === 1 ? '1 ano' : `${anos} anos`;
};

export const somarDias = (valor, dias) => {
  const data = normalizarData(valor);
  if (!data) return null;

  const nova = new Date(data);
  nova.setDate(nova.getDate() + Number(dias || 0));
  return nova;
};

// Data -> "há 3 horas"
export const formatarTempoRelativo = (quando) => {
  const data = normalizarData(quando);
  if (!data) return '';

  const segundos = Math.floor((Date.now() - data.getTime()) / 1000);

  if (segundos < 60) return 'agora mesmo';

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) {
    return minutos === 1 ? 'há 1 minuto' : `há ${minutos} minutos`;
  }

  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return horas === 1 ? 'há 1 hora' : `há ${horas} horas`;
  }

  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;

  return formatarDataBR(data);
};
