// Api/repository/lgpdRepository.js
// Direitos do titular (LGPD, Art. 18): cópia dos dados, consentimentos,
// revogação e pedidos ao nutricionista.
const pool = require('../connection');
const { obterEvolucaoPaciente } = require('./pacienteRepository');

function erroNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// O que o paciente pode pedir pelo aplicativo. As chaves vão para o banco.
const TIPOS_DE_SOLICITACAO = {
  copia: 'Cópia completa dos dados',
  correcao: 'Correção de dados',
  eliminacao: 'Exclusão dos dados',
  informacao: 'Informação sobre o uso dos dados',
  oposicao: 'Oposição a um tratamento',
};

const STATUS_DE_SOLICITACAO = ['aberta', 'em_andamento', 'atendida', 'recusada'];

// Prazo da resposta completa: 15 dias (Art. 19, II).
const DIAS_DE_PRAZO = 15;

// Quantos pedidos abertos um paciente pode ter ao mesmo tempo. Evita que
// a central do nutricionista vire spam.
const MAXIMO_DE_ABERTAS = 5;

function dataTexto(valor) {
  if (!valor) return null;
  const data = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(data.getTime()) ? String(valor) : data.toISOString();
}

// ---------------------------------------------------------------------
// Consentimentos
// ---------------------------------------------------------------------

async function listarConsentimentos(idPaciente) {
  const [linhas] = await pool.query(
    `SELECT id_consentimento,
            tp_consentimento,
            st_aceito,
            ds_versao_termos,
            tp_consentidor,
            nm_consentidor,
            ds_origem,
            dt_registro,
            dt_revogacao,
            ds_motivo_revogacao
       FROM consentimento_paciente
      WHERE id_paciente = ?
      ORDER BY id_consentimento DESC`,
    [idPaciente]
  );

  return linhas.map((c) => ({
    id: String(c.id_consentimento),
    tipo: c.tp_consentimento,
    aceito: Boolean(c.st_aceito),
    versaoTermos: c.ds_versao_termos,
    consentidor: c.tp_consentidor || 'nao_informado',
    nomeConsentidor: c.nm_consentidor || null,
    // Os aceites gravados pela versão antiga do sistema, sem tela, ficam
    // marcados: o paciente vê que eles existiram e que não valem.
    origem: c.ds_origem || 'registro_automatico_antigo',
    registradoEm: dataTexto(c.dt_registro),
    revogadoEm: dataTexto(c.dt_revogacao),
    motivoRevogacao: c.ds_motivo_revogacao || null,
    vigente: Boolean(c.st_aceito) && !c.dt_revogacao && c.ds_origem === 'app_primeiro_acesso',
  }));
}

// Revoga todos os aceites vigentes e encerra as sessões do paciente.
//
// Sem aceite não há base para o aplicativo mostrar dado de saúde, então
// revogar tira o paciente do app. No próximo login ele cai na tela de
// aceite de novo e decide se volta. O acompanhamento com o nutricionista
// não acaba por isso — só deixa de acontecer pelo aplicativo.
async function revogarConsentimentos(idPaciente) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [resultado] = await conn.query(
      `UPDATE consentimento_paciente
          SET dt_revogacao = CURRENT_TIMESTAMP,
              ds_motivo_revogacao = 'revogado_pelo_titular'
        WHERE id_paciente = ?
          AND dt_revogacao IS NULL`,
      [idPaciente]
    );

    await conn.query(
      `UPDATE usuario_paciente
          SET nr_versao_sessao = COALESCE(nr_versao_sessao, 0) + 1
        WHERE id_paciente = ?`,
      [idPaciente]
    );

    await conn.commit();
    return resultado.affectedRows;
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

// ---------------------------------------------------------------------
// Solicitações do titular
// ---------------------------------------------------------------------

function formatarSolicitacao(s) {
  return {
    id: String(s.id_solicitacao),
    pacienteId: String(s.id_paciente),
    nomePaciente: s.nm_paciente || undefined,
    tipo: s.tp_solicitacao,
    rotuloTipo: TIPOS_DE_SOLICITACAO[s.tp_solicitacao] || s.tp_solicitacao,
    mensagem: s.ds_mensagem || '',
    status: s.ds_status,
    resposta: s.ds_resposta || null,
    abertaEm: dataTexto(s.dt_abertura),
    prazo: dataTexto(s.dt_prazo),
    concluidaEm: dataTexto(s.dt_conclusao),
    atrasada:
      ['aberta', 'em_andamento'].includes(s.ds_status) && s.dt_prazo && new Date(s.dt_prazo) < new Date(),
  };
}

async function criarSolicitacao(idPaciente, tipo, mensagem) {
  const [paciente] = await pool.query(
    'SELECT id_profissional FROM paciente WHERE id_paciente = ?',
    [idPaciente]
  );

  if (paciente.length === 0) {
    throw erroNegocio('PACIENTE_NAO_ENCONTRADO', 'Conta não encontrada.');
  }

  const [abertas] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM solicitacao_titular
      WHERE id_paciente = ?
        AND ds_status IN ('aberta', 'em_andamento')`,
    [idPaciente]
  );

  if (Number(abertas[0].total) >= MAXIMO_DE_ABERTAS) {
    throw erroNegocio(
      'MUITAS_ABERTAS',
      'Você já tem pedidos em aberto. Aguarde a resposta do seu nutricionista.'
    );
  }

  const [resultado] = await pool.query(
    `INSERT INTO solicitacao_titular
        (id_paciente, id_profissional, tp_solicitacao, ds_mensagem, ds_status, dt_prazo)
      VALUES (?, ?, ?, ?, 'aberta', DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [idPaciente, paciente[0].id_profissional, tipo, mensagem, DIAS_DE_PRAZO]
  );

  return {
    idSolicitacao: resultado.insertId,
    idProfissional: paciente[0].id_profissional,
  };
}

async function listarSolicitacoesDoPaciente(idPaciente) {
  const [linhas] = await pool.query(
    `SELECT *
       FROM solicitacao_titular
      WHERE id_paciente = ?
      ORDER BY id_solicitacao DESC`,
    [idPaciente]
  );

  return linhas.map(formatarSolicitacao);
}

async function listarSolicitacoesDoProfissional(idProfissional, somenteAbertas = false) {
  const [linhas] = await pool.query(
    `SELECT s.*, p.nm_paciente
       FROM solicitacao_titular s
       JOIN paciente p ON p.id_paciente = s.id_paciente
      WHERE s.id_profissional = ?
        ${somenteAbertas ? "AND s.ds_status IN ('aberta', 'em_andamento')" : ''}
      ORDER BY (s.ds_status IN ('aberta', 'em_andamento')) DESC, s.dt_prazo ASC, s.id_solicitacao DESC`,
    [idProfissional]
  );

  return linhas.map(formatarSolicitacao);
}

async function responderSolicitacao(idSolicitacao, idProfissional, status, resposta) {
  const [linhas] = await pool.query(
    'SELECT id_paciente FROM solicitacao_titular WHERE id_solicitacao = ? AND id_profissional = ?',
    [idSolicitacao, idProfissional]
  );

  if (linhas.length === 0) {
    throw erroNegocio('SOLICITACAO_NAO_ENCONTRADA', 'Pedido não encontrado.');
  }

  const concluida = ['atendida', 'recusada'].includes(status);

  await pool.query(
    `UPDATE solicitacao_titular
        SET ds_status = ?,
            ds_resposta = ?,
            dt_conclusao = ${concluida ? 'NOW()' : 'NULL'}
      WHERE id_solicitacao = ?
        AND id_profissional = ?`,
    [status, resposta, idSolicitacao, idProfissional]
  );

  return { idPaciente: linhas[0].id_paciente };
}

// ---------------------------------------------------------------------
// Exportação (Art. 18, II e V — acesso e portabilidade)
// ---------------------------------------------------------------------

// TUDO o que o sistema guarda sobre o paciente, inclusive as colunas que o
// aplicativo não preenche mais: se ainda há dado nelas, o titular tem
// direito de saber. Os campos vazios saem do arquivo para ele ficar
// legível.
async function exportarDadosDoPaciente(idPaciente) {
  const [fichas] = await pool.query(
    // p.* e não a lista de colunas: depois da migração 001 algumas colunas
    // deixam de existir, e a exportação precisa continuar funcionando.
    `SELECT p.*,
            pr.nm_profissional, pr.nr_registro_conselho, pr.ds_email AS email_profissional
       FROM paciente p
       JOIN profissional pr ON pr.id_profissional = p.id_profissional
      WHERE p.id_paciente = ?`,
    [idPaciente]
  );

  if (fichas.length === 0) {
    throw erroNegocio('PACIENTE_NAO_ENCONTRADO', 'Paciente não encontrado.');
  }

  const f = fichas[0];

  const [contas] = await pool.query(
    'SELECT ds_email, ds_status, dt_criacao FROM usuario_paciente WHERE id_paciente = ?',
    [idPaciente]
  );

  const [consultas] = await pool.query(
    `SELECT DATE_FORMAT(dt_inicio, '%Y-%m-%dT%H:%i:%s') AS inicio,
            nr_duracao_minutos AS duracaoMinutos,
            ds_tipo AS tipo,
            ds_observacoes AS observacoes,
            ds_status AS status
       FROM consulta
      WHERE id_paciente = ?
      ORDER BY dt_inicio`,
    [idPaciente]
  );

  const evolucao = await obterEvolucaoPaciente(idPaciente);

  const semVazios = (objeto) =>
    Object.fromEntries(
      Object.entries(objeto).filter(([, valor]) => valor !== null && valor !== undefined && valor !== '')
    );

  return {
    sobreEsteArquivo: {
      geradoEm: new Date().toISOString(),
      formato: 'JSON — pode ser aberto em qualquer editor de texto ou importado por outro sistema.',
      base: 'Lei 13.709/2018 (LGPD), Art. 18, II e V.',
    },
    controlador: {
      nutricionista: f.nm_profissional,
      registro: f.nr_registro_conselho,
      contato: f.email_profissional,
    },
    ficha: semVazios({
      nome: f.nm_paciente,
      nascimento: dataTexto(f.dt_nascimento)?.slice(0, 10),
      sexo: f.sg_sexo,
      responsavel: f.nm_responsavel,
      email: f.ds_email,
      cep: f.ds_cep,
      numero: f.ds_numero,
      logradouro: f.ds_logradouro,
      endereco: f.ds_endereco,
      cidade: f.nm_cidade,
      observacoes: f.ds_observacoes,
      telefone: f.nr_telefone,
      telefoneResponsavel: f.nr_telefone_responsavel,
      objetivoConsulta: f.ds_objetivo_consulta,
      restricoesAlimentares: f.ds_restricoes_alimentares,
      alergias: f.ds_alergias,
      condicoesSaude: f.ds_condicoes_saude,
      medicamentos: f.ds_medicamentos,
    }),
    contaNoAplicativo: contas[0]
      ? {
          email: contas[0].ds_email,
          situacao: contas[0].ds_status,
          criadaEm: dataTexto(contas[0].dt_criacao),
        }
      : null,
    consentimentos: await listarConsentimentos(idPaciente),
    avaliacoes: evolucao.avaliacoes.map((a) => ({
      data: a.data,
      idade: a.idade,
      pesoKg: a.pesoKg,
      alturaCm: a.alturaCm,
      imc: a.imc,
      observacoes: a.observacoes,
      resultados: a.resultados,
    })),
    consultas,
    solicitacoes: await listarSolicitacoesDoPaciente(idPaciente),
  };
}

async function exportarDadosDoProfissional(idProfissional) {
  const [contas] = await pool.query(
    `SELECT nm_profissional, ds_email, ds_profissao, nr_registro_conselho,
            nr_telefone, st_ativo
       FROM profissional
      WHERE id_profissional = ?`,
    [idProfissional]
  );

  if (contas.length === 0) {
    throw erroNegocio('PROFISSIONAL_NAO_ENCONTRADO', 'Conta não encontrada.');
  }

  const [assinaturas] = await pool.query(
    'SELECT ds_plano, ds_status, dt_inicio, dt_cancelamento FROM assinatura WHERE id_profissional = ?',
    [idProfissional]
  );

  const [cobrancas] = await pool.query(
    'SELECT ds_referencia, vl_cobranca, dt_cobranca FROM cobranca WHERE id_profissional = ? ORDER BY dt_cobranca',
    [idProfissional]
  );

  const [preferencias] = await pool.query(
    'SELECT st_consultas, st_pacientes, st_planos, st_sistema, st_email FROM preferencia_notificacao WHERE id_profissional = ?',
    [idProfissional]
  );

  const [pacientes] = await pool.query(
    'SELECT COUNT(*) AS total FROM paciente WHERE id_profissional = ?',
    [idProfissional]
  );

  const c = contas[0];

  return {
    sobreEsteArquivo: {
      geradoEm: new Date().toISOString(),
      base: 'Lei 13.709/2018 (LGPD), Art. 18, II e V.',
      observacao:
        'Os dados dos seus pacientes não entram aqui: eles pertencem a cada paciente. ' +
        'Para exportar a ficha de um paciente, use a opção na ficha dele.',
    },
    conta: {
      nome: c.nm_profissional,
      email: c.ds_email,
      profissao: c.ds_profissao,
      registro: c.nr_registro_conselho,
      telefone: c.nr_telefone,
      ativa: Boolean(c.st_ativo),
    },
    assinatura: assinaturas[0]
      ? {
          plano: assinaturas[0].ds_plano,
          situacao: assinaturas[0].ds_status,
          inicio: dataTexto(assinaturas[0].dt_inicio),
          cancelamento: dataTexto(assinaturas[0].dt_cancelamento),
        }
      : null,
    cobrancas: cobrancas.map((x) => ({
      referencia: x.ds_referencia,
      valor: Number(x.vl_cobranca),
      data: dataTexto(x.dt_cobranca),
    })),
    preferenciasDeNotificacao: preferencias[0] || null,
    totalDePacientes: Number(pacientes[0].total),
  };
}

module.exports = {
  TIPOS_DE_SOLICITACAO,
  STATUS_DE_SOLICITACAO,
  listarConsentimentos,
  revogarConsentimentos,
  criarSolicitacao,
  listarSolicitacoesDoPaciente,
  listarSolicitacoesDoProfissional,
  responderSolicitacao,
  exportarDadosDoPaciente,
  exportarDadosDoProfissional,
};
