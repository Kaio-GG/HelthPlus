// Api/storage/planoStorage.js
// Rotas do plano alimentar. No server.js: app.use('/api/plano', planoStorage)
//
//   POST   /api/plano/cadastro                       -> cria um plano
//   GET    /api/plano/profissional/:idProfissional   -> lista os planos do nutricionista
//   PUT    /api/plano/:idPlano                       -> atualiza um plano
//   PATCH  /api/plano/:idPlano/status                -> arquiva / reativa
//
// TODAS as quatro exigem token de nutricionista, e o profissional sai do
// token — nunca do corpo nem da URL. Sem isso, "GET /profissional/7"
// devolvia a prescrição nutricional dos pacientes do profissional 7 a quem
// pedisse, e PUT/PATCH alteravam plano alheio. Plano alimentar é dado de
// saúde (Art. 5º, II da LGPD).
//
// Nota: o aplicativo não chama mais nenhuma destas rotas — as telas de plano
// alimentar saíram do produto. As rotas e as tabelas continuam aqui, com
// dado dentro, e por isso continuam sendo superfície exposta. Fechá-las é o
// mínimo; apagá-las de vez é decisão de produto, registrada em
// .lgpd/gaps.md (C5).
const express = require('express');
const {
  criarPlano,
  atualizarPlano,
  alterarStatusPlano,
  listarPlanosPorProfissional,
} = require('../repository/planoRepository');

const autenticar = require('../middleware/autenticar');

const router = express.Router();

function dataISOValida(texto) {
  return /^\d{4}-\d{2}-\d{2}$/.test(texto || '') && !Number.isNaN(new Date(texto).getTime());
}

// Devolve a mensagem de erro, ou null se estiver tudo certo.
//
// idProfissional não é validado aqui: ele não vem mais do corpo, e sim do
// token, já conferido pelo middleware. Quem monta o objeto é cada rota.
function validarPlano(p) {
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
//
// criarPlano() confere que o paciente pertence ao profissional antes de
// gravar. Com o id vindo do token, essa checagem passa a valer de verdade:
// antes bastava mandar outro idProfissional no corpo.
router.post('/cadastro', autenticar, async (req, res) => {
  const p = { ...req.body, idProfissional: Number(req.usuario.id_profissional) };

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
//
// O :idProfissional da URL é mantido por compatibilidade, mas precisa bater
// com o do token: a lista devolvida é sempre a do próprio nutricionista.
router.get('/profissional/:idProfissional', autenticar, async (req, res) => {
  const doToken = Number(req.usuario.id_profissional);

  if (Number(req.params.idProfissional) !== doToken) {
    return res.status(403).json({ mensagem: 'Acesso não autorizado.' });
  }

  try {
    const planos = await listarPlanosPorProfissional(doToken);
    return res.json({ planos });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao listar planos alimentares.');
  }
});

// PUT /api/plano/:idPlano
//
// garantirPlanoDoProfissional() recusa plano de outra conta, e o
// idProfissional que ela recebe agora é o do token.
router.put('/:idPlano', autenticar, async (req, res) => {
  const p = { ...req.body, idProfissional: Number(req.usuario.id_profissional) };

  const erroValidacao = validarPlano(p);
  if (erroValidacao) return res.status(400).json({ mensagem: erroValidacao });

  try {
    const resultado = await atualizarPlano(req.params.idPlano, p);
    return res.json({ mensagem: 'Plano alimentar atualizado com sucesso.', ...resultado });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao atualizar plano alimentar.');
  }
});

// PATCH /api/plano/:idPlano/status   body: { status: 'ativo' | 'arquivado' }
//
// O idProfissional saiu do corpo: vem do token.
router.patch('/:idPlano/status', autenticar, async (req, res) => {
  const { status } = req.body;
  const idProfissional = Number(req.usuario.id_profissional);

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