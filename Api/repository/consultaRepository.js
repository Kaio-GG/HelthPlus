// Api/repository/consultaRepository.js
// Comandos SQL do agendamento de consultas.
const connection = require('../connection');

// Erro "esperado" (o storage transforma em resposta 400/404/409, e não 500).
function erroNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// SELECT base: já devolve o nome certo (cadastrado ou avulso) e a data como
// texto "2026-11-04T09:30:00", para não sofrer com fuso horário.
const SELECT_CONSULTA = `
  SELECT c.id_consulta,
         c.id_paciente,
         COALESCE(p.nm_paciente, c.nm_paciente_avulso) AS nome,
         c.nr_telefone_avulso,
         DATE_FORMAT(c.dt_inicio, '%Y-%m-%dT%H:%i:%s') AS inicio,
         c.nr_duracao_minutos,
         c.ds_tipo,
         c.ds_observacoes,
         c.ds_status,
         pr.nm_profissional
    FROM consulta c
    LEFT JOIN paciente p      ON p.id_paciente = c.id_paciente
    JOIN profissional pr      ON pr.id_profissional = c.id_profissional
`;

// Converte a linha do banco para o formato que as telas do app usam.
function formatar(c) {
  return {
    id: String(c.id_consulta),
    idBanco: c.id_consulta,
    pacienteId: c.id_paciente ? String(c.id_paciente) : null,
    nome: c.nome,
    telefone: c.nr_telefone_avulso || null,
    inicio: c.inicio,
    duracao: c.nr_duracao_minutos,
    tipo: c.ds_tipo,
    observacoes: c.ds_observacoes || '',
    status: c.ds_status,
    avulso: !c.id_paciente,
    nomeProfissional: c.nm_profissional,
  };
}

// ---------------------------------------------------------------------
// CRIAR
// ---------------------------------------------------------------------
async function criarConsulta(c) {
  // Paciente cadastrado: precisa ser deste nutricionista.
  if (c.idPaciente) {
    const [paciente] = await connection.query(
      'SELECT id_paciente FROM paciente WHERE id_paciente = ? AND id_profissional = ?',
      [c.idPaciente, c.idProfissional]
    );
    if (paciente.length === 0) {
      throw erroNegocio('PACIENTE_INVALIDO', 'Paciente não encontrado para este profissional.');
    }
  }

  const inicio = `${c.data} ${c.horario}:00`;

  // Conflito: já existe consulta (não cancelada) que cruza com este horário?
  const [conflitos] = await connection.query(
    `SELECT id_consulta
       FROM consulta
      WHERE id_profissional = ?
        AND ds_status <> 'cancelada'
        AND dt_inicio < DATE_ADD(?, INTERVAL ? MINUTE)
        AND DATE_ADD(dt_inicio, INTERVAL nr_duracao_minutos MINUTE) > ?
      LIMIT 1`,
    [c.idProfissional, inicio, c.duracao, inicio]
  );
  if (conflitos.length > 0) {
    throw erroNegocio('HORARIO_OCUPADO', 'Você já tem uma consulta nesse horário.');
  }

  const [resultado] = await connection.query(
    `INSERT INTO consulta
      (id_profissional, id_paciente, nm_paciente_avulso, nr_telefone_avulso,
       dt_inicio, nr_duracao_minutos, ds_tipo, ds_observacoes, ds_status, fl_notificar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?)`,
    [
      c.idProfissional,
      c.idPaciente || null,
      c.idPaciente ? null : c.nomeAvulso.trim(),
      c.idPaciente ? null : c.telefoneAvulso || null,
      inicio,
      c.duracao,
      c.tipo,
      c.observacoes || null,
      c.notificar ? 1 : 0,
    ]
  );

  return { idConsulta: resultado.insertId };
}

// ---------------------------------------------------------------------
// LISTAR as consultas do nutricionista (de/ate = 'YYYY-MM-DD' ou null)
// Sem datas: de 30 dias atrás até 180 dias à frente.
// ---------------------------------------------------------------------
async function listarConsultasDoProfissional(idProfissional, de, ate) {
  const [linhas] = await connection.query(
    `${SELECT_CONSULTA}
      WHERE c.id_profissional = ?
        AND c.dt_inicio >= COALESCE(?, DATE_SUB(CURDATE(), INTERVAL 30 DAY))
        AND c.dt_inicio < DATE_ADD(COALESCE(?, DATE_ADD(CURDATE(), INTERVAL 180 DAY)), INTERVAL 1 DAY)
      ORDER BY c.dt_inicio ASC`,
    [idProfissional, de || null, ate || null]
  );

  return linhas.map(formatar);
}

// ---------------------------------------------------------------------
// ALTERAR STATUS (nutricionista): pendente, confirmada, cancelada, realizada
// ---------------------------------------------------------------------
async function alterarStatusConsulta(idConsulta, idProfissional, status) {
  const [linhas] = await connection.query(
    'SELECT id_consulta, id_paciente FROM consulta WHERE id_consulta = ? AND id_profissional = ?',
    [idConsulta, idProfissional]
  );
  if (linhas.length === 0) {
    throw erroNegocio('CONSULTA_NAO_ENCONTRADA', 'Consulta não encontrada.');
  }

  await connection.query(
    'UPDATE consulta SET ds_status = ? WHERE id_consulta = ? AND id_profissional = ?',
    [status, idConsulta, idProfissional]
  );

  // idPaciente não vai para a tela; a rota usa para o log de auditoria.
  return { idConsulta: Number(idConsulta), status, idPaciente: linhas[0].id_paciente };
}

// ---------------------------------------------------------------------
// PACIENTE: consultas de hoje em diante (menos as canceladas)
// ---------------------------------------------------------------------
async function listarConsultasDoPaciente(idPaciente) {
  const [linhas] = await connection.query(
    `${SELECT_CONSULTA}
      WHERE c.id_paciente = ?
        AND c.dt_inicio >= CURDATE()
        AND c.ds_status <> 'cancelada'
      ORDER BY c.dt_inicio ASC`,
    [idPaciente]
  );

  return linhas.map(formatar);
}

// ---------------------------------------------------------------------
// PACIENTE: confirma uma consulta que está aguardando confirmação
// ---------------------------------------------------------------------
async function confirmarConsultaDoPaciente(idConsulta, idPaciente) {
  const [linhas] = await connection.query(
    'SELECT ds_status FROM consulta WHERE id_consulta = ? AND id_paciente = ?',
    [idConsulta, idPaciente]
  );
  if (linhas.length === 0) {
    throw erroNegocio('CONSULTA_NAO_ENCONTRADA', 'Consulta não encontrada.');
  }
  if (linhas[0].ds_status !== 'pendente') {
    throw erroNegocio('CONSULTA_NAO_PENDENTE', 'Esta consulta não está aguardando confirmação.');
  }

  await connection.query(
    "UPDATE consulta SET ds_status = 'confirmada' WHERE id_consulta = ? AND id_paciente = ?",
    [idConsulta, idPaciente]
  );

  return { idConsulta: Number(idConsulta), status: 'confirmada' };
}

module.exports = {
  criarConsulta,
  listarConsultasDoProfissional,
  alterarStatusConsulta,
  listarConsultasDoPaciente,
  confirmarConsultaDoPaciente,
};