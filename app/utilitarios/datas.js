// Funções de data em português (sem bibliotecas externas).

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

// Letras do cabeçalho do calendário (começa no domingo).
export const letrasDiasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const doisDigitos = (numero) => String(numero).padStart(2, '0');

// Date -> "09/10/2026"
export const formatarDataBR = (data) =>
  `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;

// Date -> "09/10"
export const formatarDiaMes = (data) =>
  `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;

// Date -> "09:00"
export const formatarHora = (data) =>
  `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;

// Date -> "Sexta-feira, 9 de outubro"
export const formatarDataExtensa = (data) =>
  `${nomesDiasSemana[data.getDay()]}, ${data.getDate()} de ${nomesMeses[data.getMonth()].toLowerCase()}`;

// "12/06/2023" -> Date (ou null se a data não existir)
export const converterDataBR = (texto = '') => {
  const partes = texto.split('/');
  if (partes.length !== 3 || partes[2].length !== 4) return null;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const ano = parseInt(partes[2], 10);
  const data = new Date(ano, mes - 1, dia);
  const valida =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
  return valida ? data : null;
};

// Date -> "2026-10-09" (chave para comparar dias)
export const chaveDoDia = (data) =>
  `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;

export const mesmoDia = (a, b) => chaveDoDia(a) === chaveDoDia(b);

// Cria uma data no dia/hora informados, sem sofrer com fuso horário.
export const criarData = (ano, mes, dia, hora = 0, minuto = 0) =>
  new Date(ano, mes, dia, hora, minuto, 0, 0);

// Quantos dias o mês "médio" tem para a OMS: 365,25 / 12. É esse número que
// as tabelas de crescimento usam para passar de dias para meses.
export const DIAS_POR_MES = 365.25 / 12;

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

// Diferença em dias entre o nascimento e uma data de referência. A
// calculadora da OMS trabalha em dias: para um bebê de seis semanas,
// arredondar para "1 mês" muda o escore-z de verdade.
export const calcularIdadeEmDias = (nascimento, referencia = new Date()) => {
  // Zera a hora dos dois lados: o nascimento vem sem hora e a data da visita
  // pode vir com a hora atual, o que tiraria um dia da conta.
  const inicio = new Date(nascimento.getFullYear(), nascimento.getMonth(), nascimento.getDate());
  const fim = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  return Math.max(0, Math.round((fim - inicio) / MILISSEGUNDOS_POR_DIA));
};

// Diferença em meses completos entre o nascimento e uma data de referência.
export const calcularIdadeEmMeses = (nascimento, referencia = new Date()) => {
  let meses =
    (referencia.getFullYear() - nascimento.getFullYear()) * 12 +
    (referencia.getMonth() - nascimento.getMonth());
  if (referencia.getDate() < nascimento.getDate()) meses -= 1;
  return Math.max(0, meses);
};

// 40 -> "3 anos e 4 meses"  |  8 -> "8 meses"  |  72 -> "6 anos"
export const formatarIdade = (totalMeses) => {
  const anos = Math.floor(totalMeses / 12);
  const meses = totalMeses % 12;
  const textoAnos = anos === 1 ? '1 ano' : `${anos} anos`;
  const textoMeses = meses === 1 ? '1 mês' : `${meses} meses`;
  if (anos === 0) return textoMeses;
  if (meses === 0) return textoAnos;
  return `${textoAnos} e ${textoMeses}`;
};

// 40 -> "3 anos" (versão curta usada nas listas)
export const formatarIdadeCurta = (totalMeses) => {
  const anos = Math.floor(totalMeses / 12);
  if (anos === 0) return totalMeses === 1 ? '1 mês' : `${totalMeses} meses`;
  return anos === 1 ? '1 ano' : `${anos} anos`;
};

export const somarDias = (data, dias) => {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
};

// "2026-10-22T18:40:00.000Z" (ou Date) -> "há 3 horas"
//
// Usado na lista de notificações. Acima de uma semana mostra a data mesmo:
// "há 23 dias" não ajuda ninguém a se localizar.
export const formatarTempoRelativo = (quando) => {
  const data = quando instanceof Date ? quando : new Date(quando);
  if (Number.isNaN(data.getTime())) return '';

  const segundos = Math.floor((Date.now() - data.getTime()) / 1000);

  if (segundos < 60) return 'agora mesmo';

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return minutos === 1 ? 'há 1 minuto' : `há ${minutos} minutos`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return horas === 1 ? 'há 1 hora' : `há ${horas} horas`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;

  return formatarDataBR(data);
};
