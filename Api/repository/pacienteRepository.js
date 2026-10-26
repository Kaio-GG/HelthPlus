
const connection = require('../connection');
const bcrypt = require('bcryptjs');

// --------------------------------------------------
// Cadastro do paciente e criação do acesso
// --------------------------------------------------

async function inserirPaciente(p) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    const [resultado] = await conn.query(
      `INSERT INTO paciente (
        id_profissional,
        nm_paciente,
        dt_nascimento,
        sg_sexo,
        nm_responsavel,
        nr_telefone_responsavel,
        ds_email,
        nr_telefone,
        ds_cep,
        ds_numero,
        ds_logradouro,
        nm_cidade,
        ds_objetivo_consulta,
        ds_restricoes_alimentares,
        ds_alergias,
        ds_condicoes_saude,
        ds_medicamentos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.idProfissional,
        p.nome,
        p.dataNascimento,
        String(p.sexo || '').charAt(0).toUpperCase() || null,
        p.nomeResponsavel || null,
        p.telefoneResponsavel || null,
        p.email || null,
        p.telefone || null,
        p.cep || null,
        p.numero || null,
        p.logradouro || null,
        p.cidade || null,
        p.objetivo || null,
        p.restricoes || null,
        p.alergias || null,
        p.condicoes || null,
        p.medicamentos || null,
      ]
    );

    const idPaciente = resultado.insertId;
    let conviteCriado = false;

    if (p.enviarConvite) {
      const [ano, mes, dia] = p.dataNascimento.split('-');
      const senhaInicial = `${dia}${mes}${ano}`;
      const senhaHash = await bcrypt.hash(senhaInicial, 10);

      await conn.query(
        `INSERT INTO usuario_paciente
          (id_paciente, ds_email, ds_senha, ds_status)
         VALUES (?, ?, ?, 'pendente')`,
        [idPaciente, p.emailAcesso, senhaHash]
      );

      conviteCriado = true;
    }

    await conn.commit();
    return { idPaciente, conviteCriado };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

// --------------------------------------------------
// Listagem dos pacientes vinculados ao profissional
// --------------------------------------------------

async function listarPacientesPorProfissional(idProfissional) {
  const [linhas] = await connection.query(
    `SELECT
       p.id_paciente,
       p.nm_paciente,
       p.dt_nascimento,
       p.sg_sexo,
       p.nm_responsavel,
       p.nr_telefone_responsavel,
       p.ds_email,
       p.nr_telefone,
       p.ds_objetivo_consulta,
       u.ds_status
     FROM paciente p
     LEFT JOIN usuario_paciente u
       ON u.id_paciente = p.id_paciente
     WHERE p.id_profissional = ?
     ORDER BY p.nm_paciente`,
    [idProfissional]
  );

  return linhas.map((p) => ({
    id: String(p.id_paciente),
    idBanco: p.id_paciente,
    nome: p.nm_paciente,
    nascimento: p.dt_nascimento,
    sexo: p.sg_sexo,
    responsavel: p.nm_responsavel,
    telefoneResponsavel: p.nr_telefone_responsavel,
    email: p.ds_email,
    telefone: p.nr_telefone,
    objetivo: p.ds_objetivo_consulta,
    statusAcesso: p.ds_status || 'sem_acesso',
  }));
}

// --------------------------------------------------
// Busca de um paciente pertencente ao profissional
// --------------------------------------------------

async function obterPacientePorIdEProfissional(
  idPaciente,
  idProfissional
) {
  const [linhas] = await connection.query(
    `SELECT
       p.id_paciente,
       p.id_profissional,
       p.nm_paciente,
       p.dt_nascimento,
       p.sg_sexo,
       p.nm_responsavel,
       p.nr_telefone_responsavel,
       p.ds_email,
       p.nr_telefone,
       p.ds_cep,
       p.ds_numero,
       p.ds_logradouro,
       p.nm_cidade,
       p.ds_objetivo_consulta,
       p.ds_restricoes_alimentares,
       p.ds_alergias,
       p.ds_condicoes_saude,
       p.ds_medicamentos,
       u.ds_status
     FROM paciente p
     LEFT JOIN usuario_paciente u
       ON u.id_paciente = p.id_paciente
     WHERE p.id_paciente = ?
       AND p.id_profissional = ?
     LIMIT 1`,
    [idPaciente, idProfissional]
  );

  if (linhas.length === 0) {
    return null;
  }

  const p = linhas[0];

  return {
    id: String(p.id_paciente),
    idBanco: p.id_paciente,
    idProfissional: p.id_profissional,
    nome: p.nm_paciente,
    nascimento: p.dt_nascimento,
    sexo: p.sg_sexo,
    responsavel: p.nm_responsavel,
    telefoneResponsavel: p.nr_telefone_responsavel,
    email: p.ds_email,
    telefone: p.nr_telefone,
    cep: p.ds_cep,
    numero: p.ds_numero,
    logradouro: p.ds_logradouro,
    cidade: p.nm_cidade,
    objetivo: p.ds_objetivo_consulta,
    restricoes: p.ds_restricoes_alimentares,
    alergias: p.ds_alergias,
    condicoes: p.ds_condicoes_saude,
    medicamentos: p.ds_medicamentos,
    statusAcesso: p.ds_status || 'sem_acesso',
  };
}

// --------------------------------------------------
// Login do paciente
// --------------------------------------------------

async function autenticarPaciente(email, senha) {
  const [linhas] = await connection.query(
    `SELECT
       u.id_paciente,
       u.ds_email,
       u.ds_senha,
       u.ds_status,
       p.nm_paciente,
       p.id_profissional
     FROM usuario_paciente u
     INNER JOIN paciente p
       ON p.id_paciente = u.id_paciente
     WHERE u.ds_email = ?
     LIMIT 1`,
    [email]
  );

  if (linhas.length === 0) {
    return {
      sucesso: false,
      mensagem: 'E-mail ou senha inválidos.',
    };
  }

  const usuario = linhas[0];

  if (!usuario.ds_senha) {
    return {
      sucesso: false,
      mensagem: 'A conta ainda não possui uma senha configurada.',
    };
  }

  const senhaCorreta = await bcrypt.compare(
    senha,
    usuario.ds_senha
  );

  if (!senhaCorreta) {
    return {
      sucesso: false,
      mensagem: 'E-mail ou senha inválidos.',
    };
  }

  if (usuario.ds_status === 'bloqueado') {
    return {
      sucesso: false,
      mensagem: 'Esta conta está bloqueada.',
    };
  }

  const primeiroAcesso = usuario.ds_status === 'pendente';

  if (!primeiroAcesso && usuario.ds_status !== 'ativo') {
    return {
      sucesso: false,
      mensagem: 'Não foi possível acessar esta conta.',
    };
  }

  return {
    sucesso: true,
    primeiroAcesso,
    paciente: {
      id: String(usuario.id_paciente),
      nome: usuario.nm_paciente,
      email: usuario.ds_email,
    },
  };
}

// --------------------------------------------------
// Ativação da conta no primeiro acesso
// --------------------------------------------------

async function ativarContaPaciente(
  idPaciente,
  senha,
  versaoTermos = 'v1'
) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    const [linhas] = await conn.query(
      `SELECT id_paciente, ds_status
       FROM usuario_paciente
       WHERE id_paciente = ?
       FOR UPDATE`,
      [idPaciente]
    );

    if (
      linhas.length === 0 ||
      linhas[0].ds_status !== 'pendente'
    ) {
      throw new Error(
        'A conta não está disponível para primeiro acesso.'
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await conn.query(
      `UPDATE usuario_paciente
       SET ds_senha = ?, ds_status = 'ativo'
       WHERE id_paciente = ?`,
      [senhaHash, idPaciente]
    );

    await conn.query(
      `INSERT INTO consentimento_paciente
        (id_paciente, tp_consentimento, st_aceito,
         ds_versao_termos)
       VALUES
        (?, 'termos_privacidade', 1, ?),
        (?, 'tratamento_dados_saude', 1, ?)`,
      [idPaciente, versaoTermos, idPaciente, versaoTermos]
    );

    await conn.commit();
    return { sucesso: true };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

// --------------------------------------------------
// Evolução do paciente: avaliações e medidas reais
// --------------------------------------------------

async function obterEvolucaoPaciente(idPaciente) {
  const [avaliacoesBanco] = await connection.query(
    `SELECT
       a.id_avaliacao,
       a.id_paciente,
       a.dt_avaliacao,
       a.nr_idade_dias,
       a.nr_idade_meses,
       a.nr_idade_anos,
       a.tp_avaliacao,
       a.ds_observacoes
     FROM avaliacao a
     WHERE a.id_paciente = ?
     ORDER BY a.dt_avaliacao ASC, a.id_avaliacao ASC`,
    [idPaciente]
  );

  if (avaliacoesBanco.length === 0) {
    return {
      historicoPeso: [],
      avaliacoes: [],
    };
  }

  const idsAvaliacoes = avaliacoesBanco.map(
    (a) => a.id_avaliacao
  );

  const placeholders = idsAvaliacoes.map(() => '?').join(',');

  const [medidasBanco] = await connection.query(
    `SELECT
       m.id_avaliacao,
       m.vl_medida,
       m.ds_unidade,
       tm.nm_tipo_medida,
       tm.sg_tipo_medida,
       tm.ds_unidade_padrao
     FROM medida_antropometrica m
     INNER JOIN tipo_medida tm
       ON tm.id_tipo_medida = m.id_tipo_medida
     WHERE m.id_avaliacao IN (${placeholders})
     ORDER BY m.id_medida ASC`,
    idsAvaliacoes
  );

  const [resultadosBanco] = await connection.query(
    `SELECT
       id_avaliacao,
       COUNT(*) AS total,
       SUM(
         CASE
           WHEN st_valor_extremo = 0 THEN 1
           ELSE 0
         END
       ) AS na_faixa
     FROM resultado_avaliacao
     WHERE id_avaliacao IN (${placeholders})
     GROUP BY id_avaliacao`,
    idsAvaliacoes
  );

  const medidasPorAvaliacao = new Map();
  const resultadosPorAvaliacao = new Map();

  for (const medida of medidasBanco) {
    const id = String(medida.id_avaliacao);

    if (!medidasPorAvaliacao.has(id)) {
      medidasPorAvaliacao.set(id, []);
    }

    medidasPorAvaliacao.get(id).push(medida);
  }

  for (const resultado of resultadosBanco) {
    resultadosPorAvaliacao.set(
      String(resultado.id_avaliacao),
      resultado
    );
  }

  const avaliacoes = avaliacoesBanco.map((a) => {
    const id = String(a.id_avaliacao);
    const medidas = medidasPorAvaliacao.get(id) || [];
    const resultado = resultadosPorAvaliacao.get(id);

    let pesoKg = null;
    let alturaCm = null;

    for (const medida of medidas) {
      const nome = String(medida.nm_tipo_medida || '')
        .trim()
        .toLowerCase();

      const sigla = String(medida.sg_tipo_medida || '')
        .trim()
        .toLowerCase();

      const unidade = String(
        medida.ds_unidade || medida.ds_unidade_padrao || ''
      )
        .trim()
        .toLowerCase();

      const valor = Number(medida.vl_medida);

      if (!Number.isFinite(valor)) continue;

      if (
        pesoKg === null &&
        (nome.includes('peso') || sigla === 'peso' || sigla === 'kg')
      ) {
        pesoKg =
          unidade === 'g' || unidade === 'gramas'
            ? valor / 1000
            : valor;
      }

      if (
        alturaCm === null &&
        (
          nome.includes('altura') ||
          nome.includes('estatura') ||
          sigla === 'alt' ||
          sigla === 'est'
        )
      ) {
        alturaCm =
          unidade === 'm' || unidade === 'metro'
            ? valor * 100
            : valor;
      }
    }

    const imc =
      pesoKg !== null &&
      alturaCm !== null &&
      alturaCm > 0
        ? Number(
            (pesoKg / Math.pow(alturaCm / 100, 2)).toFixed(2)
          )
        : null;

    const data = a.dt_avaliacao
      ? new Date(a.dt_avaliacao).toLocaleDateString('pt-BR', {
          timeZone: 'UTC',
        })
      : null;

    let idade = null;

    if (a.nr_idade_anos !== null && a.nr_idade_anos !== undefined) {
      idade = `${Number(a.nr_idade_anos)} anos`;
    } else if (
      a.nr_idade_meses !== null &&
      a.nr_idade_meses !== undefined
    ) {
      idade = `${a.nr_idade_meses} meses`;
    } else if (
      a.nr_idade_dias !== null &&
      a.nr_idade_dias !== undefined
    ) {
      idade = `${a.nr_idade_dias} dias`;
    }

    return {
      id,
      pacienteId: String(a.id_paciente),
      data,
      idade,
      pesoKg,
      alturaCm,
      imc,
      tipo: a.tp_avaliacao,
      observacoes: a.ds_observacoes,
      naFaixa: resultado ? Number(resultado.na_faixa) : null,
      total: resultado ? Number(resultado.total) : null,
    };
  });

  const historicoPeso = avaliacoes
    .filter(
      (avaliacao) =>
        avaliacao.pesoKg !== null &&
        Number.isFinite(avaliacao.pesoKg)
    )
    .map((avaliacao) => ({
      rotulo: avaliacao.data
        ? avaliacao.data.slice(0, 5)
        : '—',
      valor: avaliacao.pesoKg,
      data: avaliacao.data,
    }));

  return {
    historicoPeso,
    avaliacoes: avaliacoes.reverse(),
  };
}

module.exports = {
  inserirPaciente,
  listarPacientesPorProfissional,
  obterPacientePorIdEProfissional,
  autenticarPaciente,
  ativarContaPaciente,
  obterEvolucaoPaciente,
};
