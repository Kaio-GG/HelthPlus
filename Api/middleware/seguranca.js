// Api/middleware/seguranca.js
// Cabeçalhos de segurança, CORS restrito e tratamento de erros.
//
// Faz o papel do "helmet" e do "cors" configurado, sem dependência nova:
// a API só devolve JSON, então a lista de cabeçalhos é curta e cabe aqui.
const crypto = require('crypto');
const config = require('../config');

// Cabeçalhos que valem para toda resposta.
function cabecalhosDeSeguranca(req, res, next) {
  // Um id por requisição: aparece no log de auditoria e na resposta de
  // erro, e liga uma reclamação do usuário à linha certa do log.
  req.idRequisicao = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.idRequisicao);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Resposta com dado de paciente não pode ficar em cache de proxy nem do
  // aparelho.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

// CORS: o aplicativo nativo não manda Origin e passa direto. Navegador só
// passa se a origem estiver em CORS_ORIGENS.
function corsRestrito(req, res, next) {
  const origem = req.headers.origin;

  if (!origem) return next();

  if (!config.corsOrigens.includes(origem)) {
    if (req.method === 'OPTIONS') return res.sendStatus(403);
    // Sem Access-Control-Allow-Origin o navegador descarta a resposta.
    return next();
  }

  res.setHeader('Access-Control-Allow-Origin', origem);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '600');

  if (req.method === 'OPTIONS') return res.sendStatus(204);

  return next();
}

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
}

// Último middleware: nenhum erro sai com stack trace nem com HTML.
// eslint-disable-next-line no-unused-vars
function tratarErro(erro, req, res, next) {
  // JSON malformado no corpo da requisição.
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido.' });
  }

  if (erro.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'A requisição é grande demais.' });
  }

  console.error(`[erro ${req.idRequisicao}]`, erro);

  return res.status(500).json({
    mensagem: 'Erro interno. Tente de novo em instantes.',
    idRequisicao: req.idRequisicao,
  });
}

module.exports = {
  cabecalhosDeSeguranca,
  corsRestrito,
  rotaNaoEncontrada,
  tratarErro,
};
