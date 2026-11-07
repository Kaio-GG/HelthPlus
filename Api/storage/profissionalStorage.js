// Api/storage/profissionalStorage.js
// No server.js: app.use('/api/profissional', profissionalStorage)
//
//   POST /api/profissional/cadastro           cria a conta
//   POST /api/profissional/login              entra
//   POST /api/profissional/encerrar-sessoes   "sair de todos os aparelhos"
//   PUT  /api/profissional/:id                atualiza nome, CRN e telefone
const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

const {
  buscarProfissionalPorEmail,
  buscarProfissionalPorCRN,
  buscarProfissionalPorCRNDeOutro,
  inserirProfissional,
  atualizarProfissional,
  buscarProfissionalPorEmailLogin,
} = require('../repository/profissionalRepository');

const { crnValido, normalizarCrn } = require('../utilitarios/crn');
const {
  problemasDaSenha,
  mensagemDaSenha,
  emailValido,
  normalizarEmail,
  textoOpcional,
} = require('../utilitarios/validacao');

const autenticar = require('../middleware/autenticar');
const { limites } = require('../middleware/limiteTaxa');
const { emitirToken, encerrarSessoesDoProfissional } = require('../servicos/sessao');
const { registrarAuditoria, pseudonimo } = require('../servicos/auditoria');
const {
  contaBloqueada,
  registrarFalha,
  registrarSucesso,
  MENSAGEM_BLOQUEIO,
} = require('../servicos/bloqueioConta');

const { enviarEmailBoasVindasProfissional } = require('../servicos/mensagensEmail');

const AVISO_DE_CRN =
  'Registro profissional inválido. Informe a regional e o número, como em CRN-3 12345.';

// Hash de mentira, usado quando o e-mail não existe. Assim o login demora
// o mesmo tanto com e sem conta, e o tempo de resposta não entrega quem
// tem cadastro aqui.
const HASH_FALSO = bcrypt.hashSync('senha-que-nao-existe', 12);

router.post('/cadastro', limites.cadastro, async (req, res) => {
  try {
    const { nome, registro, email, senha } = req.body || {};

    if (!nome || !registro || !email || !senha) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    const nomeLimpo = String(nome).trim();

    if (nomeLimpo.length < 3 || nomeLimpo.length > 100) {
      return res.status(400).json({ mensagem: 'Informe o nome completo (até 100 caracteres).' });
    }

    if (!emailValido(email)) {
      return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
    }

    // Antes só o tamanho era conferido aqui, e "12345678" passava pela API
    // mesmo com a tela pedindo senha forte. Agora vale a mesma regra das
    // outras senhas do sistema.
    const problemas = problemasDaSenha(senha);
    if (problemas.length > 0) {
      return res.status(400).json({ mensagem: mensagemDaSenha(problemas) });
    }

    if (!crnValido(registro)) {
      return res.status(400).json({ mensagem: AVISO_DE_CRN });
    }

    // Guardado sempre na mesma forma, para a checagem de duplicado abaixo
    // não deixar passar o mesmo registro escrito de outro jeito.
    const registroNormalizado = normalizarCrn(registro);
    const emailNormalizado = normalizarEmail(email);

    if (await buscarProfissionalPorEmail(emailNormalizado)) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }

    if (await buscarProfissionalPorCRN(registroNormalizado)) {
      return res.status(409).json({ mensagem: 'Este registro profissional já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const profissional = await inserirProfissional(
      nomeLimpo,
      registroNormalizado,
      emailNormalizado,
      senhaHash
    );

    registrarAuditoria(req, {
      acao: 'conta.profissional.criar',
      recurso: 'profissional',
      idRecurso: profissional.id_profissional,
      ator: { tipo: 'profissional', id: profissional.id_profissional },
    });

    // Sem await e com catch próprio: o cadastro já deu certo, e um SMTP
    // fora do ar não pode transformá-lo num erro.
    enviarEmailBoasVindasProfissional(profissional.ds_email, profissional.nm_profissional).catch(
      (problema) => console.error('Erro ao enviar as boas-vindas:', problema.message)
    );

    return res.status(201).json({
      mensagem: 'Nutricionista cadastrado com sucesso!',
      profissional,
    });
  } catch (error) {
    // Duas requisições ao mesmo tempo com o mesmo e-mail: a checagem acima
    // deixa as duas passarem e quem segura é o índice único do banco.
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }

    console.error('Erro ao cadastrar nutricionista:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao cadastrar nutricionista.' });
  }
});

router.post('/login', limites.login, async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    if (!email || !senha || typeof senha !== 'string') {
      return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
    }

    const emailNormalizado = normalizarEmail(email);
    const profissional = await buscarProfissionalPorEmailLogin(emailNormalizado);

    const falhar = (motivo, idConta = null) => {
      registrarAuditoria(req, {
        acao: 'login.profissional',
        sucesso: false,
        ator: { tipo: idConta ? 'profissional' : 'anonimo', id: idConta },
        detalhe: { motivo, conta: pseudonimo(emailNormalizado) },
      });
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    };

    if (!profissional) {
      await bcrypt.compare(senha, HASH_FALSO);
      return falhar('conta_inexistente');
    }

    if (await contaBloqueada('profissional', profissional.id_profissional)) {
      registrarAuditoria(req, {
        acao: 'login.profissional',
        sucesso: false,
        ator: { tipo: 'profissional', id: profissional.id_profissional },
        detalhe: { motivo: 'conta_bloqueada_temporariamente' },
      });
      return res.status(429).json({ mensagem: MENSAGEM_BLOQUEIO });
    }

    const senhaValida = await bcrypt.compare(senha, profissional.ds_senha_hash || HASH_FALSO);

    if (!senhaValida) {
      const fechou = await registrarFalha('profissional', profissional.id_profissional);

      if (fechou) {
        registrarAuditoria(req, {
          acao: 'conta.bloqueio_temporario',
          sucesso: false,
          ator: { tipo: 'profissional', id: profissional.id_profissional },
        });
      }

      return falhar('senha_incorreta', profissional.id_profissional);
    }

    // Depois da senha, e não antes: dizer "conta desativada" para quem
    // errou a senha confirmaria que o e-mail existe.
    if (!profissional.st_ativo) {
      return res.status(403).json({ mensagem: 'Esta conta está desativada.' });
    }

    await registrarSucesso('profissional', profissional.id_profissional);

    const token = emitirToken(
      'profissional',
      profissional.id_profissional,
      profissional.nr_versao_sessao
    );

    registrarAuditoria(req, {
      acao: 'login.profissional',
      ator: { tipo: 'profissional', id: profissional.id_profissional },
    });

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      profissional: {
        id_profissional: profissional.id_profissional,
        nm_profissional: profissional.nm_profissional,
        ds_email: profissional.ds_email,
        ds_profissao: profissional.ds_profissao,
        nr_registro_conselho: profissional.nr_registro_conselho,
        nr_telefone: profissional.nr_telefone,
      },
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar login.' });
  }
});

// "Sair de todos os aparelhos": invalida todo token já emitido para a
// conta, inclusive o desta requisição. Útil quando o celular foi perdido.
router.post('/encerrar-sessoes', autenticar, async (req, res) => {
  try {
    await encerrarSessoesDoProfissional(req.usuario.id_profissional);

    registrarAuditoria(req, { acao: 'sessao.encerrar_todas', recurso: 'profissional' });

    return res.status(200).json({ mensagem: 'Todas as sessões foram encerradas.' });
  } catch (erro) {
    console.error('Erro ao encerrar as sessões:', erro);
    return res.status(500).json({ mensagem: 'Erro ao encerrar as sessões.' });
  }
});

// Atualiza nome, CRN e telefone. Exige token, e só deixa editar a PRÓPRIA
// conta: trocar o CRN exibido de um profissional de saúde é alterar dado
// com efeito sobre terceiros (Art. 6º, V da LGPD, qualidade dos dados).
router.put('/:id', autenticar, async (req, res) => {
  try {
    const idProfissional = Number(req.params.id);
    const { nome, registro, telefone } = req.body || {};

    if (!Number.isInteger(idProfissional) || idProfissional <= 0) {
      return res.status(400).json({ mensagem: 'Profissional não identificado.' });
    }

    if (idProfissional !== Number(req.usuario.id_profissional)) {
      registrarAuditoria(req, {
        acao: 'acesso.negado',
        recurso: 'profissional',
        idRecurso: idProfissional,
        sucesso: false,
        detalhe: { motivo: 'editar_outra_conta' },
      });
      return res.status(403).json({ mensagem: 'Acesso não autorizado.' });
    }

    const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';

    if (nomeLimpo.length < 3 || nomeLimpo.length > 100) {
      return res.status(400).json({ mensagem: 'O nome é obrigatório (até 100 caracteres).' });
    }

    if (!registro || !String(registro).trim()) {
      return res.status(400).json({ mensagem: 'O registro profissional é obrigatório.' });
    }

    if (!crnValido(registro)) {
      return res.status(400).json({ mensagem: AVISO_DE_CRN });
    }

    const telefoneLimpo = textoOpcional(telefone, 20);

    if (telefoneLimpo && !/^[\d\s()+-]{8,20}$/.test(telefoneLimpo)) {
      return res.status(400).json({ mensagem: 'Telefone inválido.' });
    }

    const registroNormalizado = normalizarCrn(registro);

    if (await buscarProfissionalPorCRNDeOutro(registroNormalizado, idProfissional)) {
      return res.status(409).json({ mensagem: 'Este registro profissional já está cadastrado.' });
    }

    const atualizou = await atualizarProfissional(
      idProfissional,
      nomeLimpo,
      registroNormalizado,
      telefoneLimpo
    );

    if (!atualizou) {
      return res.status(404).json({ mensagem: 'Profissional não encontrado.' });
    }

    registrarAuditoria(req, {
      acao: 'conta.profissional.atualizar',
      recurso: 'profissional',
      idRecurso: idProfissional,
      detalhe: { campos: ['nome', 'registro', 'telefone'] },
    });

    return res.status(200).json({
      mensagem: 'Dados atualizados com sucesso!',
      profissional: {
        id_profissional: idProfissional,
        nm_profissional: nomeLimpo,
        nr_registro_conselho: registroNormalizado,
        nr_telefone: telefoneLimpo,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao atualizar os dados.' });
  }
});

module.exports = router;
