const connection = require('../connection');
const bcrypt = require('bcryptjs');
const {
  senhaDaDataNascimento,
  aceitarDataDeNascimento,
} = require('../servicos/senhaTemporaria');

// --------------------------------------------------
// Cadastro do paciente e criação do acesso
// --------------------------------------------------

async function inserirPaciente(p) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    // Nenhum telefone é gravado, e nenhum dado de saúde: o cadastro deixou
    // de pedir os dois (telefone não era usado em lugar nenhum, e guardar
    // dado de saúde sem necessidade é exposição de graça pela LGPD).
    //
    // As colunas continuam na tabela porque apagar coluna de banco de
    // produção é outra conversa; elas simplesmente ficam nulas daqui para
    // frente. Está anotado em Api/database/schema.sql.
    const [resultado] = await conn.query(
      `INSERT INTO paciente (
        id_profissional,
        nm_paciente,
        dt_nascimento,
        sg_sexo,
        nm_responsavel,
        ds_email,
        ds_cep,
        ds_numero,
        ds_logradouro,
        nm_cidade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.idProfissional,
        p.nome,
        p.dataNascimento,
        String(p.sexo || '').charAt(0).toUpperCase() || null,
        p.nomeResponsavel || null,
        p.email || null,
        p.cep || null,
        p.numero || null,
        p.logradouro || null,
        p.cidade || null,
      ]
    );

    const idPaciente = resultado.insertId;
    let conviteCriado = false;
    let senhaTemporaria = null;
    let nomeProfissional = null;

    if (p.enviarConvite) {
      // A senha provisória é a DATA DE NASCIMENTO do paciente (DDMMAAAA).
      // Assim o nutricionista pode liberar o acesso na própria consulta,
      // sem depender de o e-mail chegar. Ver servicos/senhaTemporaria.js.
      senhaTemporaria = senhaDaDataNascimento(p.dataNascimento);

      if (!senhaTemporaria) {
        const erro = new Error(
          'A data de nascimento é inválida, e é ela que forma a senha provisória.'
        );
        erro.codigo = 'NASCIMENTO_INVALIDO';
        throw erro;
      }

      const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

      await conn.query(
        `INSERT INTO usuario_paciente
          (id_paciente, ds_email, ds_senha, ds_status)
         VALUES (?, ?, ?, 'pendente')`,
        [idPaciente, p.emailAcesso, senhaHash]
      );

      // Nome do nutricionista, para aparecer no e-mail de convite.
      const [prof] = await conn.query(
        'SELECT nm_profissional FROM profissional WHERE id_profissional = ?',
        [p.idProfissional]
      );
      nomeProfissional = prof[0]?.nm_profissional || null;

      conviteCriado = true;
    }

    await conn.commit();
    return { idPaciente, conviteCriado, senhaTemporaria, nomeProfissional };
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
       p.ds_email,
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
    email: p.ds_email,
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
       p.ds_email,
       p.ds_cep,
       p.ds_numero,
       p.ds_logradouro,
       p.nm_cidade,
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
    email: p.ds_email,
    cep: p.ds_cep,
    numero: p.ds_numero,
    logradouro: p.ds_logradouro,
    cidade: p.nm_cidade,
    statusAcesso: p.ds_status || 'sem_acesso',
  };
}

// --------------------------------------------------
// Login do paciente
// --------------------------------------------------

// Entra com o e-mail e a senha. A senha pode ser a que o paciente escolheu
// ou, enquanto ele não escolheu nenhuma, a data de nascimento dele.
//
// Não existe mais tela de primeiro acesso: a conta que ainda estava
// 'pendente' vira 'ativo' aqui, no primeiro login que dá certo, e os
// consentimentos da LGPD são registrados no mesmo momento. A troca de
// senha passou a ser opcional, em Perfil > Alterar senha.
async function autenticarPaciente(email, senha) {
  const [linhas] = await connection.query(
    `SELECT
       u.id_paciente,
       u.ds_email,
       u.ds_senha,
       u.ds_status,
       p.nm_paciente,
       p.dt_nascimento,
       p.sg_sexo,
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

  // Uma comparação só, com o texto exatamente como foi digitado.
  //
  // A senha provisória são oito dígitos, então ela já entra por aqui sem
  // tratamento nenhum. Havia antes uma segunda tentativa que limpava
  // barras e traços; ela saiu junto com a regra que aceitava "12/03/2001".
  const senhaCorreta = await bcrypt.compare(senha, usuario.ds_senha);

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
      bloqueado: true,
    };
  }

  if (usuario.ds_status !== 'pendente' && usuario.ds_status !== 'ativo') {
    return {
      sucesso: false,
      mensagem: 'Não foi possível acessar esta conta.',
    };
  }

  // Ainda usando a senha provisória? A tela avisa e oferece a troca.
  const senhaProvisoria =
    aceitarDataDeNascimento(senha) !== null &&
    senha === senhaDaDataNascimento(usuario.dt_nascimento);

  // Primeiro login de uma conta pendente: ativa e registra o consentimento.
  // Uma falha aqui não derruba o login — a pessoa acertou a senha, e deixá-la
  // fora do aplicativo por causa do INSERT do consentimento seria pior.
  if (usuario.ds_status === 'pendente') {
    try {
      await ativarNoPrimeiroLogin(usuario.id_paciente);
    } catch (erro) {
      console.error(
        'Erro ao ativar a conta do paciente no primeiro login:',
        erro.message
      );
    }
  }

  return {
    sucesso: true,
    // Continua na resposta por compatibilidade com quem a lê: hoje é
    // sempre false, porque a conta já sai ativada daqui.
    primeiroAcesso: false,
    senhaProvisoria,
    paciente: {
      id: String(usuario.id_paciente),
      nome: usuario.nm_paciente,
      email: usuario.ds_email,
      nascimento: usuario.dt_nascimento,
      sexo: usuario.sg_sexo,
    },
  };
}

// Marca a conta como ativa e grava os consentimentos da LGPD.
//
// Roda uma única vez por conta: só chega aqui quem está 'pendente', e o
// status está no WHERE do UPDATE — por isso o INSERT não duplica.
async function ativarNoPrimeiroLogin(idPaciente, versaoTermos = 'v1') {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    const [atualizadas] = await conn.query(
      `UPDATE usuario_paciente
          SET ds_status = 'ativo'
        WHERE id_paciente = ?
          AND ds_status = 'pendente'`,
      [idPaciente]
    );

    if (atualizadas.affectedRows === 1) {
      await conn.query(
        `INSERT INTO consentimento_paciente
            (id_paciente, tp_consentimento, st_aceito, ds_versao_termos)
          VALUES
            (?, 'termos_privacidade', 1, ?),
            (?, 'tratamento_dados_saude', 1, ?)`,
        [idPaciente, versaoTermos, idPaciente, versaoTermos]
      );
    }

    await conn.commit();
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

// Troca de senha de dentro do aplicativo: confere a senha atual e grava a
// nova. Ativa a conta de quem ainda estava com a senha provisória.
//
// Devolve { sucesso: true } ou { sucesso: false, codigo } — quem chama
// transforma o código em resposta HTTP.
async function trocarSenhaDoPaciente(idPaciente, senhaAtual, novaSenha) {
  const [linhas] = await connection.query(
    `SELECT u.ds_senha, u.ds_status
       FROM usuario_paciente u
      WHERE u.id_paciente = ?
      LIMIT 1`,
    [idPaciente]
  );

  if (linhas.length === 0 || !linhas[0].ds_senha) {
    return { sucesso: false, codigo: 'CONTA_NAO_ENCONTRADA' };
  }

  const conta = linhas[0];

  // Como no login: uma comparação só, com o texto digitado. A senha
  // provisória são oito dígitos e entra aqui sem tratamento.
  const confere = await bcrypt.compare(senhaAtual, conta.ds_senha);

  if (!confere) {
    return { sucesso: false, codigo: 'SENHA_ATUAL_INCORRETA' };
  }

  await connection.query(
    `UPDATE usuario_paciente
        SET ds_senha = ?,
            ds_status = CASE WHEN ds_status = 'pendente' THEN 'ativo' ELSE ds_status END
      WHERE id_paciente = ?`,
    [await bcrypt.hash(novaSenha, 12), idPaciente]
  );

  return { sucesso: true };
}

// --------------------------------------------------
// Evolução do paciente: avaliações e medidas reais
// --------------------------------------------------

// A evolução é o histórico de avaliações do paciente, no formato que as
// telas usam. Serve aos dois lados: a aba "Evolução" da ficha (lida pelo
// nutricionista) e "Minha evolução" (lida pelo próprio paciente).
//
// A data de nascimento e o sexo vão junto porque a tela de detalhe refaz o
// cálculo da OMS a partir do peso e da altura guardados — é assim que ela
// mostra escore-z e classificação por extenso, como na calculadora, sem
// precisar de uma tabela nova no banco.
async function obterEvolucaoPaciente(idPaciente) {
  const [pacienteBanco] = await connection.query(
    `SELECT nm_paciente, dt_nascimento, sg_sexo
       FROM paciente
      WHERE id_paciente = ?
      LIMIT 1`,
    [idPaciente]
  );

  const paciente = pacienteBanco[0]
    ? {
        nome: pacienteBanco[0].nm_paciente,
        nascimento: pacienteBanco[0].dt_nascimento,
        sexo: pacienteBanco[0].sg_sexo,
      }
    : null;

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
      paciente,
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

  // Uma linha por indicador calculado, com a leitura daquele dia. É o que
  // a tela de detalhe mostra por extenso, e é de onde sai a contagem
  // "3 de 4 indicadores adequados".
  //
  // A contagem é por ds_tom = 'adequado'. Antes ela usava
  // st_valor_extremo = 0, o que contava como "na faixa" todo resultado que
  // não fosse absurdo — um sobrepeso entrava na conta como adequado.
  const [resultadosBanco] = await connection.query(
    `SELECT
       r.id_avaliacao,
       i.sg_indicador,
       i.nm_indicador,
       r.vl_observado,
       r.vl_escore_z,
       r.vl_percentil,
       r.ds_classificacao,
       r.ds_tom,
       r.st_valor_extremo
     FROM resultado_avaliacao r
     INNER JOIN indicador i
       ON i.id_indicador = r.id_indicador
     WHERE r.id_avaliacao IN (${placeholders})
     ORDER BY r.id_resultado ASC`,
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
    const id = String(resultado.id_avaliacao);

    if (!resultadosPorAvaliacao.has(id)) {
      resultadosPorAvaliacao.set(id, []);
    }

    resultadosPorAvaliacao.get(id).push(resultado);
  }

  const avaliacoes = avaliacoesBanco.map((a) => {
    const id = String(a.id_avaliacao);
    const medidas = medidasPorAvaliacao.get(id) || [];
    const resultados = resultadosPorAvaliacao.get(id) || [];

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
      naFaixa: resultados.length
        ? resultados.filter((item) => item.ds_tom === 'adequado').length
        : null,
      total: resultados.length || null,
      resultados: resultados.map((item) => ({
        indicador: item.sg_indicador,
        rotulo: item.nm_indicador,
        medida:
          item.vl_observado === null ? null : Number(item.vl_observado),
        zScore: item.vl_escore_z === null ? null : Number(item.vl_escore_z),
        percentil:
          item.vl_percentil === null ? null : Number(item.vl_percentil),
        classificacao: item.ds_classificacao,
        tom: item.ds_tom,
        extremo: Boolean(item.st_valor_extremo),
      })),
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
    paciente,
    historicoPeso,
    // Da mais recente para a mais antiga: é a ordem em que a lista aparece
    // na tela. O historicoPeso fica na ordem contrária, de propósito — um
    // gráfico de linha lido da direita para a esquerda não se entende.
    avaliacoes: avaliacoes.reverse(),
  };
}

// --------------------------------------------------
// Exclusão do paciente
//
// Apaga de verdade, e leva junto tudo o que pendurado nele: o acesso ao
// aplicativo, as avaliações (com as medidas e os resultados), as consultas
// marcadas, os planos alimentares, os consentimentos e a participação em
// inquéritos.
//
// É em transação porque são nove DELETEs: se o quinto falhasse, o
// paciente ficaria pela metade — sem avaliações e ainda na lista.
//
// A ordem importa: o banco recusa apagar uma linha que outra ainda
// aponta. Só token_senha_paciente sai sozinho, por ON DELETE CASCADE.
//
// O id_profissional entra na checagem para um nutricionista não apagar o
// paciente de outro.
// --------------------------------------------------

async function excluirPaciente(idPaciente, idProfissional) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    const [dono] = await conn.query(
      'SELECT nm_paciente FROM paciente WHERE id_paciente = ? AND id_profissional = ?',
      [idPaciente, idProfissional]
    );

    if (dono.length === 0) {
      const erro = new Error(
        'Paciente não encontrado na sua lista.'
      );
      erro.codigo = 'PACIENTE_NAO_ENCONTRADO';
      throw erro;
    }

    // Resultados e medidas penduram nas avaliações, não no paciente.
    await conn.query(
      `DELETE r FROM resultado_avaliacao r
         JOIN avaliacao a ON a.id_avaliacao = r.id_avaliacao
        WHERE a.id_paciente = ?`,
      [idPaciente]
    );

    await conn.query(
      `DELETE m FROM medida_antropometrica m
         JOIN avaliacao a ON a.id_avaliacao = m.id_avaliacao
        WHERE a.id_paciente = ?`,
      [idPaciente]
    );

    await conn.query('DELETE FROM avaliacao WHERE id_paciente = ?', [idPaciente]);

    // As refeições e os alimentos do plano saem por CASCADE.
    await conn.query('DELETE FROM plano_alimentar WHERE id_paciente = ?', [idPaciente]);

    // As consultas apontam para o paciente. Sem este DELETE a exclusão
    // morre no banco ("ER_ROW_IS_REFERENCED_2") para todo paciente que já
    // teve consulta marcada — e é a maioria deles.
    await conn.query('DELETE FROM consulta WHERE id_paciente = ?', [idPaciente]);

    await conn.query('DELETE FROM consentimento_paciente WHERE id_paciente = ?', [
      idPaciente,
    ]);

    await conn.query('DELETE FROM inquerito_paciente WHERE id_paciente = ?', [
      idPaciente,
    ]);

    // O acesso ao aplicativo. Os pedidos de redefinição de senha dele
    // (token_senha_paciente) saem com o paciente, por CASCADE.
    await conn.query('DELETE FROM usuario_paciente WHERE id_paciente = ?', [
      idPaciente,
    ]);

    await conn.query(
      'DELETE FROM paciente WHERE id_paciente = ? AND id_profissional = ?',
      [idPaciente, idProfissional]
    );

    await conn.commit();

    return { nome: dono[0].nm_paciente };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

module.exports = {
  inserirPaciente,
  listarPacientesPorProfissional,
  obterPacientePorIdEProfissional,
  autenticarPaciente,
  trocarSenhaDoPaciente,
  obterEvolucaoPaciente,
  excluirPaciente,
};