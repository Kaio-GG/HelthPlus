// Consultas de exemplo. As datas são calculadas a partir de HOJE, para que
// a agenda sempre apareça preenchida durante a demonstração.

import { criarData } from '../utilitarios/datas';

const hoje = new Date();
const ano = hoje.getFullYear();
const mes = hoje.getMonth();
const dia = hoje.getDate();

// Dia do mês atual (se o dia não existir no mês, usa o último dia).
const diaDoMes = (numero) => {
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  return Math.min(numero, ultimoDia);
};

export const consultasIniciais = [];

// Opções usadas no formulário "Nova consulta".
export const duracoesDisponiveis = ['30 min', '45 min', '60 min', '90 min'];
export const tiposDeConsulta = ['Primeira consulta', 'Retorno', 'Avaliação', 'Outro'];

// Horários de 07:00 até 19:30, de 30 em 30 minutos.
export const horariosDisponiveis = (() => {
  const lista = [];
  for (let hora = 7; hora <= 19; hora += 1) {
    lista.push(`${String(hora).padStart(2, '0')}:00`);
    lista.push(`${String(hora).padStart(2, '0')}:30`);
  }
  return lista;
})();
