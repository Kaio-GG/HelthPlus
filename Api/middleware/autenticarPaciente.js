// Api/middleware/autenticarPaciente.js
// Aceita somente sessões normais de PACIENTE (token tipo "paciente").
// O token de primeiro acesso (tipo "paciente_primeiro_acesso") NÃO passa aqui.
// Depois de validar, deixa o id em req.paciente.id.
const jwt = require('jsonwebtoken');

function autenticarPaciente(req, res, next) {
  const autorizacao = req.headers.authorization || '';
  const token = autorizacao.startsWith('Bearer ') ? autorizacao.slice(7) : '';

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({
      mensagem: 'Autenticação necessária. Entre novamente.',
    });
  }

  try {
    const dadosToken = jwt.verify(token, process.env.JWT_SECRET);

    if (
      dadosToken.tipo !== 'paciente' ||
      !Number.isInteger(Number(dadosToken.id_paciente)) ||
      Number(dadosToken.id_paciente) <= 0
    ) {
      return res.status(403).json({ mensagem: 'Acesso não autorizado.' });
    }

    req.paciente = { id: Number(dadosToken.id_paciente) };
    return next();
  } catch (erro) {
    return res.status(401).json({
      mensagem: 'Sessão inválida ou expirada. Entre novamente.',
    });
  }
}

module.exports = autenticarPaciente;