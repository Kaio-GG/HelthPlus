
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({
      mensagem: 'Autenticação necessária.',
    });
  }

  const token = autorizacao.slice(7);

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);

    if (
      usuario.tipo !== 'profissional' ||
      !usuario.id_profissional
    ) {
      return res.status(403).json({
        mensagem: 'Acesso não autorizado.',
      });
    }

    req.usuario = usuario;
    next();
  } catch (erro) {
    return res.status(401).json({
      mensagem: 'Sessão inválida ou expirada. Entre novamente.',
    });
  }
}

module.exports = autenticar;
