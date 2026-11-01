// Api/repository/planoRepository.js
// Comandos SQL do plano alimentar.
const connection = require('../connection');

// Erro "esperado" (o storage transforma em resposta 400/404, e não 500).
function erroNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// Grava as refeições e os alimentos de um plano (usa a transação já aberta).
async function inserirRefeicoes(conn, idPlano, refeicoes) {
  for (const [indice, refeicao] of refeicoes.entries()) {
    const [resRefeicao] = await conn.query(
      'INSERT INTO plano_refeicao (id_plano, nm_refeicao, nr_ordem) VALUES (?, ?, ?)',
      [idPlano, refeicao.nome, refeicao.ordem ?? indice]
    );

    const alimentos = refeicao.alimentos || [];
    if (alimentos.length === 0) continue;

    const linhas = alimentos.map((a) => [
      resRefeicao.insertId,
      a.idAlimento != null ? String(a.idAlimento) : null,
      a.nome,
      a.porcao || null,
      a.kcal || 0,
      a.proteina || 0,
      a.carboidrato || 0,
      a.gordura || 0,
    ]);

    await conn.query(
      `INSERT INTO plano_alimento
        (id_refeicao, ds_codigo_taco, nm_alimento, ds_porcao, vl_kcal, vl_proteina, vl_carboidrato, vl_gordura)
       VALUES ?`,
      [linhas]
    );
  }
}

// Confere se o plano existe e pertence ao profissional.
async function garantirPlanoDoProfissional(conn, idPlano, idProfissional) {
  const [linhas] = await conn.query(
    'SELECT id_plano FROM plano_alimentar WHERE id_plano = ? AND id_profissional = ?',
    [idPlano, idProfissional]
  );
  if (linhas.length === 0) {
    throw erroNegocio('PLANO_NAO_ENCONTRADO', 'Plano alimentar não encontrado.');
  }
}

// ---------------------------------------------------------------------
// CRIAR
// ---------------------------------------------------------------------
async function criarPlano(p) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    // O paciente precisa ser deste nutricionista.
    const [paciente] = await conn.query(
      'SELECT id_paciente FROM paciente WHERE id_paciente = ? AND id_profissional = ?',
      [p.idPaciente, p.idProfissional]
    );
    if (paciente.length === 0) {
      throw erroNegocio('PACIENTE_INVALIDO', 'Paciente não encontrado para este profissional.');
    }

    const [resPlano] = await conn.query(
      `INSERT INTO plano_alimentar
        (id_paciente, id_profissional, nm_plano, dt_inicio, dt_fim,
         vl_meta_kcal, vl_meta_agua_litros, ds_observacoes, ds_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
      [
        p.idPaciente,
        p.idProfissional,
        p.nome.trim(),
        p.inicio, // YYYY-MM-DD
        p.fim, // YYYY-MM-DD
        p.metaKcal,
        p.metaAguaLitros || 0,
        p.observacoes || null,
      ]
    );

    await inserirRefeicoes(conn, resPlano.insertId, p.refeicoes);

    await conn.commit();
    return { idPlano: resPlano.insertId };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

// ---------------------------------------------------------------------
// ATUALIZAR (troca os dados e refaz as refeições)
// ---------------------------------------------------------------------
async function atualizarPlano(idPlano, p) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    await garantirPlanoDoProfissional(conn, idPlano, p.idProfissional);

    await conn.query(
      `UPDATE plano_alimentar
          SET nm_plano = ?, dt_inicio = ?, dt_fim = ?,
              vl_meta_kcal = ?, vl_meta_agua_litros = ?, ds_observacoes = ?
        WHERE id_plano = ? AND id_profissional = ?`,
      [
        p.nome.trim(),
        p.inicio,
        p.fim,
        p.metaKcal,
        p.metaAguaLitros || 0,
        p.observacoes || null,
        idPlano,
        p.idProfissional,
      ]
    );

    // Os alimentos são apagados junto (ON DELETE CASCADE) e regravados.
    await conn.query('DELETE FROM plano_refeicao WHERE id_plano = ?', [idPlano]);
    await inserirRefeicoes(conn, idPlano, p.refeicoes);

    await conn.commit();
    return { idPlano: Number(idPlano) };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

// ---------------------------------------------------------------------
// ARQUIVAR / REATIVAR
// ---------------------------------------------------------------------
async function alterarStatusPlano(idPlano, idProfissional, status) {
  const conn = await connection.getConnection();

  try {
    await garantirPlanoDoProfissional(conn, idPlano, idProfissional);
    await conn.query(
      'UPDATE plano_alimentar SET ds_status = ? WHERE id_plano = ? AND id_profissional = ?',
      [status, idPlano, idProfissional]
    );
    return { idPlano: Number(idPlano), status };
  } finally {
    conn.release();
  }
}

// ---------------------------------------------------------------------
// LISTAR os planos de um profissional (já no formato que a tela usa)
// ---------------------------------------------------------------------
async function listarPlanosPorProfissional(idProfissional) {
  const [planos] = await connection.query(
    `SELECT pl.id_plano,
            pl.id_paciente,
            pa.nm_paciente,
            pl.nm_plano,
            DATE_FORMAT(pl.dt_inicio, '%d/%m/%Y') AS inicio,
            DATE_FORMAT(pl.dt_fim, '%d/%m/%Y')    AS fim,
            pl.vl_meta_kcal,
            pl.vl_meta_agua_litros,
            pl.ds_observacoes,
            pl.ds_status
       FROM plano_alimentar pl
       JOIN paciente pa ON pa.id_paciente = pl.id_paciente
      WHERE pl.id_profissional = ?
      ORDER BY pl.id_plano DESC`,
    [idProfissional]
  );

  if (planos.length === 0) return [];

  const idsPlanos = planos.map((pl) => pl.id_plano);

  const [refeicoes] = await connection.query(
    'SELECT * FROM plano_refeicao WHERE id_plano IN (?) ORDER BY id_plano, nr_ordem',
    [idsPlanos]
  );

  const idsRefeicoes = refeicoes.map((r) => r.id_refeicao);
  const [alimentos] = idsRefeicoes.length
    ? await connection.query(
        'SELECT * FROM plano_alimento WHERE id_refeicao IN (?) ORDER BY id_plano_alimento',
        [idsRefeicoes]
      )
    : [[]];

  // Monta: plano -> refeições -> alimentos
  const alimentosPorRefeicao = new Map();
  for (const a of alimentos) {
    if (!alimentosPorRefeicao.has(a.id_refeicao)) alimentosPorRefeicao.set(a.id_refeicao, []);
    alimentosPorRefeicao.get(a.id_refeicao).push({
      id: a.ds_codigo_taco,
      idLinha: `${a.ds_codigo_taco || 'a'}-${a.id_plano_alimento}`,
      nome: a.nm_alimento,
      porcao: a.ds_porcao,
      kcal: Number(a.vl_kcal),
      proteina: Number(a.vl_proteina),
      carboidrato: Number(a.vl_carboidrato),
      gordura: Number(a.vl_gordura),
    });
  }

  const refeicoesPorPlano = new Map();
  for (const r of refeicoes) {
    if (!refeicoesPorPlano.has(r.id_plano)) refeicoesPorPlano.set(r.id_plano, []);
    refeicoesPorPlano.get(r.id_plano).push({
      nome: r.nm_refeicao,
      alimentos: alimentosPorRefeicao.get(r.id_refeicao) || [],
    });
  }

  return planos.map((pl) => ({
    idBanco: pl.id_plano,
    pacienteIdBanco: pl.id_paciente,
    pacienteNome: pl.nm_paciente,
    nome: pl.nm_plano,
    inicio: pl.inicio,
    fim: pl.fim,
    metaKcal: pl.vl_meta_kcal,
    metaAguaLitros: Number(pl.vl_meta_agua_litros),
    observacoes: pl.ds_observacoes || '',
    status: pl.ds_status,
    refeicoes: refeicoesPorPlano.get(pl.id_plano) || [],
  }));
}

module.exports = {
  criarPlano,
  atualizarPlano,
  alterarStatusPlano,
  listarPlanosPorProfissional,
};