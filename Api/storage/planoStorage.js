// Api/storage/planoStorage.js
// Rotas do plano alimentar. No server.js: app.use('/api/plano', planoStorage)
//
//   POST   /api/plano/cadastro                       -> cria um plano
//   GET    /api/plano/profissional/:idProfissional   -> lista os planos do nutricionista
//   PUT    /api/plano/:idPlano                       -> atualiza um plano
//   PATCH  /api/plano/:idPlano/status                -> arquiva / reativa
const express = require('express');
const {
  criarPlano,
  atualizarPlano,
  alterarStatusPlano,
  listarPlanosPorProfissional,
} = require('../repository/planoRepository');

const router = express.Router();

function dataISOValida(texto) {
  return /^\d{4}-\d{2}-\d{2}$/.test(texto || '') && !Number.isNaN(new Date(texto).getTime());
}

// Devolve a mensagem de erro, ou null se estiver tudo certo.
function validarPlano(p) {
  if (!p.idProfissional) return 'Profissional não identificado.';
  if (!p.idPaciente) return 'Selecione o paciente.';
  if (!p.nome || p.nome.trim().length < 3) return 'Informe o nome do plano.';
  if (!dataISOValida(p.inicio) || !dataISOValida(p.fim)) return 'Datas de vigência inválidas.';
  if (p.fim < p.inicio) return 'O fim da vigência deve ser depois do início.';
  if (!p.metaKcal || Number(p.metaKcal) < 500) return 'Informe a meta de calorias (mínimo 500).';

  const temAlimento =
    Array.isArray(p.refeicoes) &&
    p.refeicoes.some((r) => Array.isArray(r.alimentos) && r.alimentos.length > 0);
  if (!temAlimento) return 'Adicione ao menos um alimento ao plano.';

  return null;
}

// Converte os erros "esperados" do repository em respostas HTTP.
function responderErro(res, erro, mensagemPadrao) {
  if (erro.codigo === 'PACIENTE_INVALIDO') {
    return res.status(400).json({ mensagem: erro.message });
  }
  if (erro.codigo === 'PLANO_NAO_ENCONTRADO') {
    return res.status(404).json({ mensagem: erro.message });
  }
  console.error(mensagemPadrao, erro);
  return res.status(500).json({ mensagem: mensagemPadrao });
}

// POST /api/plano/cadastro
router.post('/cadastro', async (req, res) => {
  const p = req.body;

  const erroValidacao = validarPlano(p);
  if (erroValidacao) return res.status(400).json({ mensagem: erroValidacao });

  try {
    const resultado = await criarPlano(p);
    return res.status(201).json({ mensagem: 'Plano alimentar criado com sucesso.', ...resultado });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao criar plano alimentar.');
  }
});

// GET /api/plano/profissional/:idProfissional
router.get('/profissional/:idProfissional', async (req, res) => {
  try {
    const planos = await listarPlanosPorProfissional(req.params.idProfissional);
    return res.json({ planos });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao listar planos alimentares.');
  }
});

// PUT /api/plano/:idPlano
router.put('/:idPlano', async (req, res) => {
  const p = req.body;

  const erroValidacao = validarPlano(p);
  if (erroValidacao) return res.status(400).json({ mensagem: erroValidacao });

  try {
    const resultado = await atualizarPlano(req.params.idPlano, p);
    return res.json({ mensagem: 'Plano alimentar atualizado com sucesso.', ...resultado });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao atualizar plano alimentar.');
  }
});

// PATCH /api/plano/:idPlano/status   body: { idProfissional, status: 'ativo' | 'arquivado' }
router.patch('/:idPlano/status', async (req, res) => {
  const { idProfissional, status } = req.body;

  if (!idProfissional) {
    return res.status(400).json({ mensagem: 'Profissional não identificado.' });
  }
  if (!['ativo', 'arquivado'].includes(status)) {
    return res.status(400).json({ mensagem: "Status inválido. Use 'ativo' ou 'arquivado'." });
  }

  try {
    const resultado = await alterarStatusPlano(req.params.idPlano, idProfissional, status);
    return res.json({ mensagem: 'Status atualizado.', ...resultado });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao alterar o status do plano.');
  }
});

module.exports = router;