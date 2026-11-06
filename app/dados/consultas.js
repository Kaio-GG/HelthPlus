// Opções fixas do formulário "Nova consulta".
//
// As consultas de verdade NÃO moram aqui: elas vêm do banco (tabela
// "consulta"), pelo DadosContexto. Este arquivo tinha uma lista
// "consultasIniciais" de demonstração que já estava vazia e não era
// importada em lugar nenhum — ela saiu, junto com o cálculo de datas que
// só existia para alimentá-la.

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
