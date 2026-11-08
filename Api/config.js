// Api/config.js
// Lê e confere as variáveis de ambiente UMA vez, na subida da API.
//
// Antes cada arquivo lia o process.env por conta própria, e um JWT_SECRET
// vazio só aparecia na hora do primeiro login ("Erro interno ao realizar
// login"). Agora a API recusa subir com configuração perigosa e diz o que
// falta, em português, no terminal.
require('dotenv').config();

const emProducao = process.env.NODE_ENV === 'production';

function numero(nome, padrao) {
  const valor = Number(process.env[nome]);
  return Number.isFinite(valor) && valor > 0 ? valor : padrao;
}

function lista(nome) {
  return String(process.env[nome] || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const JWT_SECRET = String(process.env.JWT_SECRET || '');

const problemas = [];

if (!JWT_SECRET) {
  problemas.push(
    'JWT_SECRET está vazio no Api/.env. Gere um com:\n' +
      "    node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
  );
} else if (JWT_SECRET.length < 32) {
  problemas.push(
    'JWT_SECRET tem menos de 32 caracteres. Um segredo curto pode ser ' +
      'descoberto por força bruta, e com ele qualquer um forja um login.'
  );
}

if (problemas.length > 0) {
  console.error('\n[config] A API não pode subir assim:\n');
  problemas.forEach((p) => console.error(`  - ${p}\n`));
  process.exit(1);
}

const config = {
  emProducao,
  porta: numero('PORT', 3000),

  jwt: {
    segredo: JWT_SECRET,
    // Algoritmo fixo: sem isso, o jsonwebtoken aceitaria o que viesse no
    // cabeçalho do token.
    algoritmo: 'HS256',
    emissor: 'healthplus-api',
    validadeSessao: process.env.JWT_VALIDADE || '8h',
    // O token do primeiro acesso só serve para aceitar os termos e trocar
    // a senha provisória. Vida curta de propósito.
    validadePrimeiroAcesso: '15m',
  },

  // Origens de NAVEGADOR que podem chamar a API (o Expo Web, por exemplo).
  // O aplicativo no celular não manda cabeçalho Origin e não é afetado.
  // Vazio = nenhum site pode chamar a API pelo navegador.
  corsOrigens: lista('CORS_ORIGENS'),

  // Atrás de um proxy reverso (Nginx, Render, Railway...), o IP real do
  // cliente vem no X-Forwarded-For. Só ligue se houver proxy: ligado sem
  // proxy, qualquer um forja o próprio IP e escapa do limite de tentativas.
  confiarNoProxy: process.env.CONFIAR_PROXY === '1',

  // HTTPS direto pelo Node (opcional). Em produção o normal é o proxy
  // cuidar do certificado; para teste local dá para apontar para um
  // certificado gerado com mkcert.
  tls: {
    certificado: process.env.TLS_CERTIFICADO || '',
    chave: process.env.TLS_CHAVE || '',
  },

  // Bloqueio de conta por senha errada.
  bloqueio: {
    tentativas: numero('BLOQUEIO_TENTATIVAS', 5),
    minutos: numero('BLOQUEIO_MINUTOS', 15),
  },

  // Prazos de guarda (LGPD, Art. 15 e 16). Em dias.
  retencao: {
    auditoria: numero('RETENCAO_AUDITORIA_DIAS', 1825), // 5 anos
    notificacaoLida: numero('RETENCAO_NOTIFICACAO_DIAS', 180),
    tokenSenha: numero('RETENCAO_TOKEN_SENHA_DIAS', 7),
    telefoneAvulso: numero('RETENCAO_TELEFONE_AVULSO_DIAS', 90),
    solicitacaoConcluida: numero('RETENCAO_SOLICITACAO_DIAS', 1825),
  },

  // Versão vigente dos Termos e da Política de Privacidade. Mudou o texto
  // em app/pages/Termos? Suba esta versão: no próximo login, todo paciente
  // é convidado a aceitar de novo, e o aceite antigo fica no histórico.
  versaoTermos: process.env.VERSAO_TERMOS || '2026-11-07',
};

if (emProducao && !config.tls.certificado && !config.confiarNoProxy) {
  console.warn(
    '\n[config] ATENÇÃO: NODE_ENV=production sem HTTPS (TLS_CERTIFICADO) e ' +
      'sem proxy (CONFIAR_PROXY=1). Dados de saúde não podem trafegar em ' +
      'texto claro (LGPD, Art. 46).\n'
  );
}

module.exports = config;
