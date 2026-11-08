// Api/servicos/auditoria.js
// Registro de auditoria: quem fez o quê, quando, de onde, em qual paciente.
//
// É o que a LGPD chama de registro das operações de tratamento (Art. 37) e
// o que permite responder, num incidente, "quem acessou esta ficha?" dentro
// do prazo de comunicação à ANPD (Res. CD/ANPD nº 15/2024).
//
// Três regras deste arquivo:
//
// 1. NUNCA guarda dado de saúde nem nome. O log diz "o profissional 4 leu
//    a ficha do paciente 17", e não o que estava na ficha. Um log com dado
//    sensível seria só mais um lugar para vazar.
//
// 2. NUNCA derruba a requisição. Se a gravação falhar (banco fora, tabela
//    ainda não criada), o erro vai para o terminal e a operação segue.
//
// 3. É encadeado por hash. Cada linha guarda o SHA-256 da anterior, como
//    num livro-caixa: apagar ou editar uma linha no meio quebra a corrente,
//    e o script `npm run auditoria:verificar` aponta onde. Não impede quem
//    tem acesso ao banco de mexer, mas impede que mexa sem deixar rastro.
const crypto = require('crypto');
const pool = require('../connection');
const config = require('../config');

const HASH_INICIAL = '0'.repeat(64);

let ultimoHash = null;
let fila = Promise.resolve();
let avisouTabelaFaltando = false;

// Identifica um e-mail sem guardá-lo: o mesmo e-mail sempre dá o mesmo
// código (dá para ver "10 tentativas na mesma conta"), mas o código não
// volta a ser o e-mail. A chave é o segredo do JWT, que fica fora do banco.
function pseudonimo(texto) {
  if (!texto) return null;
  return crypto
    .createHmac('sha256', config.jwt.segredo)
    .update(String(texto).trim().toLowerCase())
    .digest('hex')
    .slice(0, 16);
}

function ipDaRequisicao(req) {
  const ip = String(req?.ip || req?.socket?.remoteAddress || '');
  return ip.replace(/^::ffff:/, '').slice(0, 45) || null;
}

// 'YYYY-MM-DD HH:MM:SS.mmm' em UTC. A data entra no hash, então precisa
// ser exatamente a mesma na gravação e na verificação.
function agoraUtc() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function calcularHash(hashAnterior, campos) {
  return crypto
    .createHash('sha256')
    .update(`${hashAnterior}|${JSON.stringify(campos)}`)
    .digest('hex');
}

// A ordem dos campos é o "formato" da corrente. Mudou aqui, mude em
// scripts/verificarAuditoria.js.
function camposParaHash(linha) {
  return [
    linha.dt_evento,
    linha.tp_ator,
    linha.id_ator,
    linha.ds_acao,
    linha.ds_recurso,
    linha.id_recurso,
    linha.id_paciente_alvo,
    linha.st_sucesso,
    linha.ds_ip,
    linha.ds_dispositivo,
    linha.ds_id_requisicao,
    linha.ds_detalhe,
  ];
}

async function obterUltimoHash() {
  if (ultimoHash) return ultimoHash;

  const [linhas] = await pool.query(
    'SELECT ds_hash FROM log_auditoria ORDER BY id_log DESC LIMIT 1'
  );

  ultimoHash = linhas[0]?.ds_hash || HASH_INICIAL;
  return ultimoHash;
}

async function gravar(linha) {
  const hashAnterior = await obterUltimoHash();
  const hash = calcularHash(hashAnterior, camposParaHash(linha));

  await pool.query(
    `INSERT INTO log_auditoria
       (dt_evento, tp_ator, id_ator, ds_acao, ds_recurso, id_recurso,
        id_paciente_alvo, st_sucesso, ds_ip, ds_dispositivo,
        ds_id_requisicao, ds_detalhe, ds_hash_anterior, ds_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      linha.dt_evento,
      linha.tp_ator,
      linha.id_ator,
      linha.ds_acao,
      linha.ds_recurso,
      linha.id_recurso,
      linha.id_paciente_alvo,
      linha.st_sucesso,
      linha.ds_ip,
      linha.ds_dispositivo,
      linha.ds_id_requisicao,
      linha.ds_detalhe,
      hashAnterior,
      hash,
    ]
  );

  ultimoHash = hash;
}

function inteiroOuNulo(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Registra um evento. Não precisa de await (e não lança).
//
//   req             a requisição (de onde saem quem, IP e dispositivo)
//   acao            'paciente.ficha.ler', 'login.profissional'...
//   recurso         'paciente', 'avaliacao', 'consulta'...
//   idRecurso       o id do recurso afetado
//   idPacienteAlvo  de QUAL paciente é o dado — é por este campo que o
//                   paciente vê quem acessou os dados dele
//   sucesso         false para tentativa recusada
//   detalhe         objeto pequeno, SEM dado pessoal (vai como JSON)
//   ator            { tipo, id } para sobrescrever o que vem do token
function registrarAuditoria(req, evento) {
  const ator =
    evento.ator ||
    (req?.usuario
      ? { tipo: 'profissional', id: req.usuario.id_profissional }
      : req?.paciente
        ? { tipo: 'paciente', id: req.paciente.id }
        : { tipo: 'anonimo', id: null });

  let detalhe = null;
  if (evento.detalhe) {
    try {
      detalhe = JSON.stringify(evento.detalhe).slice(0, 1000);
    } catch {
      detalhe = null;
    }
  }

  const linha = {
    dt_evento: agoraUtc(),
    tp_ator: ator.tipo,
    id_ator: inteiroOuNulo(ator.id),
    ds_acao: String(evento.acao).slice(0, 60),
    ds_recurso: evento.recurso ? String(evento.recurso).slice(0, 40) : null,
    id_recurso: inteiroOuNulo(evento.idRecurso),
    id_paciente_alvo: inteiroOuNulo(evento.idPacienteAlvo),
    st_sucesso: evento.sucesso === false ? 0 : 1,
    ds_ip: req ? ipDaRequisicao(req) : null,
    ds_dispositivo: req?.headers?.['user-agent']
      ? String(req.headers['user-agent']).slice(0, 120)
      : null,
    ds_id_requisicao: req?.idRequisicao || null,
    ds_detalhe: detalhe,
  };

  // Em fila: duas gravações ao mesmo tempo leriam o mesmo "último hash" e
  // a corrente bifurcaria.
  fila = fila
    .then(() => gravar(linha))
    .catch((erro) => {
      // A tabela ainda não existe: rodaram o código novo sem o schema.sql.
      if (erro.code === 'ER_NO_SUCH_TABLE') {
        if (!avisouTabelaFaltando) {
          avisouTabelaFaltando = true;
          console.error(
            '[auditoria] A tabela log_auditoria não existe. Rode o ' +
              'Api/database/schema.sql de novo. Os eventos NÃO estão sendo registrados.'
          );
        }
        return;
      }

      // Reler o último hash na próxima, caso o INSERT tenha falhado no meio.
      ultimoHash = null;
      console.error('[auditoria] Falha ao registrar evento:', erro.message);
    });

  return fila;
}

// Para testes e scripts: espera a fila esvaziar.
function aguardarAuditoria() {
  return fila;
}

// ---------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------

// Ações que contam como "acesso aos dados" de um paciente, na lista que o
// próprio paciente vê. Login dele mesmo e coisas do sistema ficam de fora:
// a lista responde "quem mexeu nos meus dados?".
const ACOES_DE_ACESSO = [
  'paciente.ficha.ler',
  'paciente.evolucao.ler',
  'paciente.cadastrar',
  'paciente.exportar',
  'paciente.acessos.ler',
  'avaliacao.criar',
  'consulta.criar',
  'consulta.status',
  'convite.reenviar',
  'paciente.dados.exportar',
  'lgpd.solicitacao.responder',
];

const DESCRICAO_DA_ACAO = {
  'paciente.ficha.ler': 'Abriu a sua ficha',
  'paciente.evolucao.ler': 'Viu a sua evolução',
  'paciente.cadastrar': 'Cadastrou você',
  'paciente.exportar': 'Exportou os seus dados',
  'paciente.acessos.ler': 'Viu o histórico de acessos',
  'avaliacao.criar': 'Registrou uma avaliação',
  'consulta.criar': 'Marcou uma consulta',
  'consulta.status': 'Mudou o status de uma consulta',
  'convite.reenviar': 'Reenviou o seu convite de acesso',
  'paciente.dados.exportar': 'Você exportou os seus dados',
  'lgpd.solicitacao.responder': 'Respondeu a uma solicitação sua',
};

async function listarAcessosAoPaciente(idPaciente, limite = 100) {
  const quantidade = Math.min(Math.max(Number(limite) || 100, 1), 500);
  const marcadores = ACOES_DE_ACESSO.map(() => '?').join(',');

  const [linhas] = await pool.query(
    `SELECT l.id_log,
            DATE_FORMAT(l.dt_evento, '%Y-%m-%dT%H:%i:%sZ') AS quando,
            l.tp_ator,
            l.id_ator,
            l.ds_acao,
            pr.nm_profissional
       FROM log_auditoria l
       LEFT JOIN profissional pr
         ON l.tp_ator = 'profissional' AND pr.id_profissional = l.id_ator
      WHERE l.id_paciente_alvo = ?
        AND l.st_sucesso = 1
        AND l.ds_acao IN (${marcadores})
      ORDER BY l.id_log DESC
      LIMIT ${quantidade}`,
    [idPaciente, ...ACOES_DE_ACESSO]
  );

  return linhas.map((l) => ({
    id: String(l.id_log),
    quando: l.quando,
    quem:
      l.tp_ator === 'paciente'
        ? 'Você'
        : l.tp_ator === 'profissional'
          ? l.nm_profissional || 'Nutricionista'
          : 'Sistema',
    tipoAtor: l.tp_ator,
    acao: l.ds_acao,
    descricao: DESCRICAO_DA_ACAO[l.ds_acao] || l.ds_acao,
  }));
}

// O que o próprio profissional fez (inclui tentativas recusadas na conta
// dele, para ele notar se alguém está tentando entrar).
async function listarAtividadeDoProfissional(idProfissional, limite = 100) {
  const quantidade = Math.min(Math.max(Number(limite) || 100, 1), 500);

  const [linhas] = await pool.query(
    `SELECT id_log,
            DATE_FORMAT(dt_evento, '%Y-%m-%dT%H:%i:%sZ') AS quando,
            ds_acao,
            ds_recurso,
            id_recurso,
            id_paciente_alvo,
            st_sucesso,
            ds_ip,
            ds_dispositivo
       FROM log_auditoria
      WHERE tp_ator = 'profissional'
        AND id_ator = ?
      ORDER BY id_log DESC
      LIMIT ${quantidade}`,
    [idProfissional]
  );

  return linhas.map((l) => ({
    id: String(l.id_log),
    quando: l.quando,
    acao: l.ds_acao,
    recurso: l.ds_recurso,
    idRecurso: l.id_recurso,
    idPaciente: l.id_paciente_alvo ? String(l.id_paciente_alvo) : null,
    sucesso: Boolean(l.st_sucesso),
    ip: l.ds_ip,
    dispositivo: l.ds_dispositivo,
  }));
}

module.exports = {
  registrarAuditoria,
  aguardarAuditoria,
  listarAcessosAoPaciente,
  listarAtividadeDoProfissional,
  pseudonimo,
  calcularHash,
  camposParaHash,
  HASH_INICIAL,
};
