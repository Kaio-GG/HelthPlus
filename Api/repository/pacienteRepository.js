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
        [idPaciente, String(p.emailAcesso).trim().toLowerCase(), senhaHash]
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

// Hash de mentira para quando o e-mail não existe: o login demora o mesmo
// tanto com e sem conta, e o tempo de resposta não entrega quem é paciente.
const HASH_FALSO = bcrypt.hashSync('senha-que-nao-existe', 10);

// Confere e-mail e senha. NÃO registra consentimento nenhum.
//
// Antes, o primeiro login que dava certo gravava "aceito" nos termos e no
// tratamento de dados de saúde, sem o paciente ver tela nenhuma. Entrar
// no aplicativo é conduta, não manifestação de vontade, e a LGPD exige
// consentimento específico e destacado para dado de saúde (Art. 11, I).
// Agora quem decide se falta aceite é a rota, com consentimentoVigente(),
// e o aceite só é gravado pela tela de primeiro acesso.
//
// Devolve:
//   { sucesso: false, motivo }                 e-mail ou senha errados
//   { sucesso: false, bloqueado: true }        conta bloqueada pelo nutricionista
//   { sucesso: false, bloqueioTemporario }     muitas tentativas
//   { sucesso: true, conta }                   senha certa
async function autenticarPaciente(email, senha) {
  const [linhas] = await connection.query(
    `SELECT
       u.id_paciente,
       u.ds_email,
       u.ds_senha,
       u.ds_status,
       COALESCE(u.nr_versao_sessao, 0) AS nr_versao_sessao,
       u.dt_bloqueio_ate > UTC_TIMESTAMP() AS bloqueio_temporario,
       p.nm_paciente,
       p.nm_responsavel,
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

  if (linhas.length === 0 || !linhas[0].ds_senha) {
    await bcrypt.compare(String(senha), HASH_FALSO);
    return { sucesso: false, motivo: 'conta_inexistente' };
  }

  const usuario = linhas[0];

  if (usuario.bloqueio_temporario) {
    return { sucesso: false, bloqueioTemporario: true, idPaciente: usuario.id_paciente };
  }

  // Uma comparação só, com o texto exatamente como foi digitado. A senha
  // provisória são oito dígitos e entra por aqui sem tratamento.
  const senhaCorreta = await bcrypt.compare(String(senha), usuario.ds_senha);

  if (!senhaCorreta) {
    return { sucesso: false, motivo: 'senha_incorreta', idPaciente: usuario.id_paciente };
  }

  if (usuario.ds_status === 'bloqueado') {
    return { sucesso: false, bloqueado: true, idPaciente: usuario.id_paciente };
  }

  if (usuario.ds_status !== 'pendente' && usuario.ds_status !== 'ativo') {
    return { sucesso: false, motivo: 'status_invalido', idPaciente: usuario.id_paciente };
  }

  // Ainda usando a data de nascimento como senha?
  const senhaProvisoria =
    aceitarDataDeNascimento(senha) !== null &&
    senha === senhaDaDataNascimento(usuario.dt_nascimento);

  return {
    sucesso: true,
    senhaProvisoria,
    conta: {
      idPaciente: usuario.id_paciente,
      status: usuario.ds_status,
      versaoSessao: usuario.nr_versao_sessao,
      nascimento: usuario.dt_nascimento,
      responsavel: usuario.nm_responsavel,
    },
    paciente: {
      id: String(usuario.id_paciente),
      nome: usuario.nm_paciente,
      email: usuario.ds_email,
      nascimento: usuario.dt_nascimento,
      sexo: usuario.sg_sexo,
    },
  };
}

// Os dois aceites que o aplicativo pede. Os nomes são os que já estavam
// gravados em consentimento_paciente.
const TIPOS_DE_CONSENTIMENTO = ['termos_privacidade', 'tratamento_dados_saude'];

// O paciente tem aceite válido, não revogado, dos DOIS tipos, na versão
// atual dos termos? Os aceites gravados automaticamente pela versão antiga
// (origem nula ou 'legado') não contam: não houve manifestação de vontade.
async function consentimentoVigente(idPaciente, versao) {
  const [linhas] = await connection.query(
    `SELECT DISTINCT tp_consentimento
       FROM consentimento_paciente
      WHERE id_paciente = ?
        AND st_aceito = 1
        AND dt_revogacao IS NULL
        AND ds_versao_termos = ?
        AND ds_origem = 'app_primeiro_acesso'`,
    [idPaciente, versao]
  );

  const aceitos = new Set(linhas.map((l) => l.tp_consentimento));
  return TIPOS_DE_CONSENTIMENTO.every((tipo) => aceitos.has(tipo));
}

// A senha gravada ainda é a data de nascimento? Confere pelo hash, e não
// pelo que foi digitado agora.
async function senhaAindaEhProvisoria(idPaciente) {
  const [linhas] = await connection.query(
    `SELECT u.ds_senha, p.dt_nascimento
       FROM usuario_paciente u
       JOIN paciente p ON p.id_paciente = u.id_paciente
      WHERE u.id_paciente = ?`,
    [idPaciente]
  );

  if (!linhas[0]?.ds_senha) return false;

  const provisoria = senhaDaDataNascimento(linhas[0].dt_nascimento);
  if (!provisoria) return false;

  return bcrypt.compare(provisoria, linhas[0].ds_senha);
}

async function dadosDoPrimeiroAcesso(idPaciente) {
  const [linhas] = await connection.query(
    `SELECT p.nm_paciente, p.nm_responsavel, p.dt_nascimento, p.sg_sexo, u.ds_email
       FROM paciente p
       JOIN usuario_paciente u ON u.id_paciente = p.id_paciente
      WHERE p.id_paciente = ?`,
    [idPaciente]
  );

  return linhas[0] || null;
}

// Grava o aceite que o próprio paciente (ou o responsável) deu na tela de
// primeiro acesso, troca a senha provisória se veio uma nova, ativa a
// conta e encerra sessões antigas. Tudo ou nada.
//
//   versao             a versão dos termos aceita
//   consentimento      { consentidor: 'titular' | 'responsavel', nomeConsentidor }
//                      ou null se o aceite da versão atual já existia
//   novaSenhaHash      hash da senha nova, ou null se não precisava trocar
//
// Devolve a versão de sessão nova, para a rota emitir o token.
async function concluirPrimeiroAcesso(idPaciente, dados) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    if (dados.consentimento) {
      // Aceites anteriores ainda abertos (de versões velhas dos termos)
      // ficam no histórico, marcados como substituídos.
      await conn.query(
        `UPDATE consentimento_paciente
            SET dt_revogacao = CURRENT_TIMESTAMP,
                ds_motivo_revogacao = 'substituido'
          WHERE id_paciente = ?
            AND dt_revogacao IS NULL`,
        [idPaciente]
      );

      const valores = TIPOS_DE_CONSENTIMENTO.flatMap((tipo) => [
        idPaciente,
        tipo,
        dados.versao,
        dados.consentimento.consentidor,
        dados.consentimento.nomeConsentidor,
      ]);

      await conn.query(
        `INSERT INTO consentimento_paciente
            (id_paciente, tp_consentimento, st_aceito, ds_versao_termos,
             tp_consentidor, nm_consentidor, ds_origem)
          VALUES ${TIPOS_DE_CONSENTIMENTO.map(() => "(?, ?, 1, ?, ?, ?, 'app_primeiro_acesso')").join(', ')}`,
        valores
      );
    }

    if (dados.novaSenhaHash) {
      await conn.query(
        'UPDATE usuario_paciente SET ds_senha = ? WHERE id_paciente = ?',
        [dados.novaSenhaHash, idPaciente]
      );
    }

    await conn.query(
      `UPDATE usuario_paciente
          SET ds_status = CASE WHEN ds_status = 'pendente' THEN 'ativo' ELSE ds_status END,
              nr_versao_sessao = COALESCE(nr_versao_sessao, 0) + 1,
              nr_tentativas_falhas = 0,
              dt_bloqueio_ate = NULL
        WHERE id_paciente = ?`,
      [idPaciente]
    );

    const [versao] = await conn.query(
      'SELECT nr_versao_sessao FROM usuario_paciente WHERE id_paciente = ?',
      [idPaciente]
    );

    await conn.commit();

    return { versaoSessao: versao[0]?.nr_versao_sessao || 0 };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

// Troca de senha de dentro do aplicativo: confere a senha atual e grava a
// nova. Encerra as outras sessões e devolve a versão nova da sessão, para
// este aparelho continuar logado com um token novo.
//
// Devolve { sucesso: true, versaoSessao } ou { sucesso: false, codigo }.
async function trocarSenhaDoPaciente(idPaciente, senhaAtual, novaSenha) {
  const [linhas] = await connection.query(
    `SELECT u.ds_senha
       FROM usuario_paciente u
      WHERE u.id_paciente = ?
      LIMIT 1`,
    [idPaciente]
  );

  if (linhas.length === 0 || !linhas[0].ds_senha) {
    return { sucesso: false, codigo: 'CONTA_NAO_ENCONTRADA' };
  }

  const confere = await bcrypt.compare(String(senhaAtual), linhas[0].ds_senha);

  if (!confere) {
    return { sucesso: false, codigo: 'SENHA_ATUAL_INCORRETA' };
  }

  await connection.query(
    `UPDATE usuario_paciente
        SET ds_senha = ?,
            nr_versao_sessao = COALESCE(nr_versao_sessao, 0) + 1
      WHERE id_paciente = ?`,
    [await bcrypt.hash(novaSenha, 12), idPaciente]
  );

  const [versao] = await connection.query(
    'SELECT nr_versao_sessao FROM usuario_paciente WHERE id_paciente = ?',
    [idPaciente]
  );

  return { sucesso: true, versaoSessao: versao[0]?.nr_versao_sessao || 0 };
}

// Resumo dos aceites, SEM dado pessoal. Vai para o log de auditoria antes
// de o paciente ser apagado: a ficha some (direito de eliminação), mas
// fica a prova de que o tratamento teve base legal enquanto durou
// (Art. 37 — registro das operações).
async function resumoDosConsentimentos(idPaciente, conn = connection) {
  const [linhas] = await conn.query(
    `SELECT tp_consentimento AS tipo,
            ds_versao_termos AS versao,
            tp_consentidor AS consentidor,
            ds_origem AS origem,
            DATE_FORMAT(dt_registro, '%Y-%m-%d %H:%i:%s') AS registrado,
            DATE_FORMAT(dt_revogacao, '%Y-%m-%d %H:%i:%s') AS revogado
       FROM consentimento_paciente
      WHERE id_paciente = ?
      ORDER BY id_consentimento`,
    [idPaciente]
  );

  return linhas;
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
    // A tabela some com a migração 001 (função removida); sem ela, segue.
    try {
      await conn.query('DELETE FROM plano_alimentar WHERE id_paciente = ?', [idPaciente]);
    } catch (erro) {
      if (erro.code !== 'ER_NO_SUCH_TABLE') throw erro;
    }

    // As consultas apontam para o paciente. Sem este DELETE a exclusão
    // morre no banco ("ER_ROW_IS_REFERENCED_2") para todo paciente que já
    // teve consulta marcada — e é a maioria deles.
    await conn.query('DELETE FROM consulta WHERE id_paciente = ?', [idPaciente]);

    // O resumo dos aceites sai ANTES do DELETE: quem chama grava no log
    // de auditoria, que não guarda dado pessoal e não some com a ficha.
    const consentimentos = await resumoDosConsentimentos(idPaciente, conn);

    await conn.query('DELETE FROM consentimento_paciente WHERE id_paciente = ?', [
      idPaciente,
    ]);

    // Pedidos que o paciente fez pelo aplicativo (cópia, correção,
    // exclusão). O próprio pedido de exclusão é atendido aqui.
    await conn.query('DELETE FROM solicitacao_titular WHERE id_paciente = ?', [
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

    return { nome: dono[0].nm_paciente, consentimentos };
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
  consentimentoVigente,
  senhaAindaEhProvisoria,
  dadosDoPrimeiroAcesso,
  concluirPrimeiroAcesso,
  resumoDosConsentimentos,
  TIPOS_DE_CONSENTIMENTO,
  trocarSenhaDoPaciente,
  obterEvolucaoPaciente,
  excluirPaciente,
};