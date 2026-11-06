// Api/storage/avaliacaoStorage.js
// No server.js: app.use('/api/avaliacao', avaliacaoStorage)
//
// Nutricionista (token de profissional):
//   POST /api/avaliacao   -> grava uma avaliação na ficha do paciente
//
// A LEITURA das avaliações não fica aqui: ela já existe em
//   GET /api/paciente/:id/evolucao      (nutricionista)
//   GET /api/paciente/minha-evolucao    (paciente)
// porque as duas telas que a usam são telas do paciente, não da avaliação.
const express = require('express');
const autenticar = require('../middleware/autenticar');
const { inserirAvaliacao } = require('../repository/avaliacaoRepository');

const router = express.Router();

function dataISOValida(texto) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(texto || '') &&
    !Number.isNaN(new Date(texto).getTime())
  );
}

router.post('/', autenticar, async (req, res) => {
  const corpo = req.body || {};
  const idPaciente = Number(corpo.idPaciente);

  if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
    return res.status(400).json({ mensagem: 'Identificador de paciente inválido.' });
  }

  if (!dataISOValida(corpo.data)) {
    return res.status(400).json({ mensagem: 'Informe a data da avaliação (AAAA-MM-DD).' });
  }

  if (!corpo.medidas || typeof corpo.medidas !== 'object') {
    return res.status(400).json({ mensagem: 'Informe as medidas da avaliação.' });
  }

  try {
    // O id do nutricionista vem do TOKEN, nunca do corpo da requisição.
    const resultado = await inserirAvaliacao({
      ...corpo,
      idPaciente,
      idProfissional: Number(req.usuario.id_profissional),
    });

    return res.status(201).json({
      mensagem: 'Avaliação salva na ficha do paciente.',
      ...resultado,
    });
  } catch (erro) {
    if (erro.codigo === 'PACIENTE_INVALIDO') {
      return res.status(404).json({ mensagem: erro.message });
    }

    if (erro.codigo === 'SEM_MEDIDAS') {
      return res.status(400).json({ mensagem: erro.message });
    }

    console.error('Erro ao salvar a avaliação:', erro);

    return res.status(500).json({ mensagem: 'Erro ao salvar a avaliação.' });
  }
});

module.exports = router;
