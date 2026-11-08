// Api/storage/senhaStorage.js
// No server.js: app.use('/api/senha', senhaStorage)
//
//   POST /api/senha/esqueci     pede o código de redefinição por e-mail
//   POST /api/senha/redefinir   troca a senha usando o código
//   PUT  /api/senha             troca a senha do nutricionista logado
//   PUT  /api/senha/:id         o mesmo (URL antiga, mantida para versões
//                               instaladas do app; o :id tem de ser o do token)
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

const { buscarProfissionalPorEmailLogin } = require('../repository/profissionalRepository');
const {
  inserirTokenSenha,
  marcarTokensAnterioresComoUsados,
  buscarTokenValido,
  marcarTokenComoUsado,
  atualizarSenha,
  buscarContaDoProfissional,
  buscarContaDoPacientePorEmail,
  inserirTokenSenhaDoPaciente,
  marcarTokensAnterioresDoPacienteComoUsados,
  buscarTokenValidoDoPaciente,
  marcarTokenDoPacienteComoUsado,
  atualizarSenhaDoPaciente,
} = require('../repository/senhaRepository');
const {
  enviarEmailRedefinicaoSenha,
  enviarEmailSenhaAlterada,
  MINUTOS_DE_VALIDADE,
} = require('../servicos/mensagensEmail');
const { smtpConfigurado } = require('../servicos/email');
const { problemasDaSenha, mensagemDaSenha, normalizarEmail } = require('../utilitarios/validacao');
const autenticar = require('../middleware/autenticar');
const { limites } = require('../middleware/limiteTaxa');
const {
  emitirToken,
  estadoDoProfissional,
  encerrarSessoesDoProfissional,
  encerrarSessoesDoPaciente,
} = require('../servicos/sessao');
const { registrarSucesso } = require('../servicos/bloqueioConta');
const { registrarAuditoria, pseudonimo } = require('../servicos/auditoria');

// Token com 8 caracteres de A-Z e 2-9 (sem O/0 e I/1, que se confundem na
// hora de digitar). São 32^8 combinações; com o limite de tentativas por
// IP, chutar não é caminho. 256 é múltiplo de 32, então o "% 32" não
// favorece letra nenhuma.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function gerarToken() {
  const bytes = crypto.randomBytes(8);
  let token = '';

  for (const byte of bytes) {
    token += ALFABETO[byte % ALFABETO.length];
  }

  return token;
}

// No banco fica só o hash. Quem ler a tabela não consegue usar o token.
function hashDoToken(token) {
  return crypto.createHash('sha256').update(String(token).trim().toUpperCase()).digest('hex');
}

// ---------------------------------------------------------------
// POST /api/senha/esqueci
//
// Atende os dois perfis: o e-mail é procurado nas duas contas.
//
// A resposta é sempre a mesma, exista ou não a conta — inclusive o campo
// "emailEnviado", que diz se a API TEM SMTP, e não se este envio saiu.
// ---------------------------------------------------------------
router.post('/esqueci', limites.esqueciSenha, async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ mensagem: 'Informe o e-mail.' });
    }

    const emailNormalizado = normalizarEmail(email);

    const respostaPadrao = {
      mensagem: 'Se o e-mail estiver cadastrado, enviamos as instruções para ele.',
      emailEnviado: smtpConfigurado,
    };

    const profissional = await buscarProfissionalPorEmailLogin(emailNormalizado);
    const profissionalAtivo = profissional && profissional.st_ativo;

    const paciente = profissionalAtivo
      ? null
      : await buscarContaDoPacientePorEmail(emailNormalizado);

    registrarAuditoria(req, {
      acao: 'senha.esqueci',
      ator: profissionalAtivo
        ? { tipo: 'profissional', id: profissional.id_profissional }
        : paciente
          ? { tipo: 'paciente', id: paciente.id_paciente }
          : { tipo: 'anonimo', id: null },
      sucesso: Boolean(profissionalAtivo || paciente),
      detalhe: { conta: pseudonimo(emailNormalizado) },
    });

    if (!profissionalAtivo && !paciente) {
      return res.status(200).json(respostaPadrao);
    }

    const token = gerarToken();

    if (profissionalAtivo) {
      await marcarTokensAnterioresComoUsados(profissional.id_profissional);
      await inserirTokenSenha(profissional.id_profissional, hashDoToken(token), MINUTOS_DE_VALIDADE);
    } else {
      await marcarTokensAnterioresDoPacienteComoUsados(paciente.id_paciente);
      await inserirTokenSenhaDoPaciente(paciente.id_paciente, hashDoToken(token), MINUTOS_DE_VALIDADE);
    }

    await enviarEmailRedefinicaoSenha(
      profissionalAtivo ? profissional.ds_email : paciente.ds_email,
      profissionalAtivo ? profissional.nm_profissional : paciente.nm_paciente,
      token
    );

    return res.status(200).json(respostaPadrao);
  } catch (error) {
    console.error('Erro ao pedir redefinição de senha:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao pedir a redefinição de senha.' });
  }
});

// ---------------------------------------------------------------
// POST /api/senha/redefinir
//
// O app manda só o código, sem dizer o perfil, então ele é procurado nas
// duas tabelas de token.
//
// O token é QUEIMADO antes de a senha mudar, numa UPDATE que só acerta a
// linha se ela ainda não foi usada. Antes a ordem era a inversa, e duas
// requisições simultâneas com o mesmo código trocavam a senha duas vezes.
//
// Trocar a senha encerra as sessões abertas: quem pediu a redefinição pode
// estar justamente tirando um invasor da conta.
// ---------------------------------------------------------------
router.post('/redefinir', limites.redefinirSenha, async (req, res) => {
  try {
    const { token, senha } = req.body || {};

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ mensagem: 'Informe o código recebido por e-mail.' });
    }

    const problemas = problemasDaSenha(senha);
    if (problemas.length > 0) {
      return res.status(400).json({ mensagem: mensagemDaSenha(problemas) });
    }

    const tokenHash = hashDoToken(token);
    const invalido = () => {
      registrarAuditoria(req, { acao: 'senha.redefinir', sucesso: false, detalhe: { motivo: 'codigo_invalido' } });
      return res.status(400).json({ mensagem: 'Código inválido ou expirado. Peça um novo link.' });
    };

    const pedido = await buscarTokenValido(tokenHash);
    const pedidoDoPaciente = pedido ? null : await buscarTokenValidoDoPaciente(tokenHash);

    if (!pedido && !pedidoDoPaciente) return invalido();

    const senhaHash = await bcrypt.hash(senha, 12);

    if (pedido) {
      if (!(await marcarTokenComoUsado(pedido.id_token))) return invalido();

      await atualizarSenha(pedido.id_profissional, senhaHash);
      await encerrarSessoesDoProfissional(pedido.id_profissional);
      await registrarSucesso('profissional', pedido.id_profissional);

      registrarAuditoria(req, {
        acao: 'senha.redefinir',
        ator: { tipo: 'profissional', id: pedido.id_profissional },
      });

      enviarEmailSenhaAlterada(pedido.ds_email, pedido.nm_profissional).catch((problema) =>
        console.error('Erro ao avisar da troca de senha:', problema.message)
      );
    } else {
      if (!(await marcarTokenDoPacienteComoUsado(pedidoDoPaciente.id_token))) return invalido();

      await atualizarSenhaDoPaciente(pedidoDoPaciente.id_paciente, senhaHash);
      await encerrarSessoesDoPaciente(pedidoDoPaciente.id_paciente);
      await registrarSucesso('paciente', pedidoDoPaciente.id_paciente);

      registrarAuditoria(req, {
        acao: 'senha.redefinir',
        ator: { tipo: 'paciente', id: pedidoDoPaciente.id_paciente },
        idPacienteAlvo: pedidoDoPaciente.id_paciente,
      });
    }

    return res.status(200).json({ mensagem: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao redefinir a senha.' });
  }
});

// ---------------------------------------------------------------
// Troca de senha do NUTRICIONISTA logado, com a senha atual.
//
// Antes esta rota não pedia token nenhum e confiava no :id da URL: servia
// de oráculo para testar senhas de qualquer conta, uma por uma. Agora o id
// sai do token, e a rota tem limite de tentativas.
// ---------------------------------------------------------------
async function trocarSenhaDoProfissional(req, res) {
  try {
    const idProfissional = Number(req.usuario.id_profissional);

    if (req.params.id !== undefined && Number(req.params.id) !== idProfissional) {
      registrarAuditoria(req, {
        acao: 'acesso.negado',
        recurso: 'profissional',
        idRecurso: Number(req.params.id) || null,
        sucesso: false,
        detalhe: { motivo: 'trocar_senha_de_outra_conta' },
      });
      return res.status(403).json({ mensagem: 'Acesso não autorizado.' });
    }

    const { senhaAtual, novaSenha } = req.body || {};

    if (!senhaAtual || typeof senhaAtual !== 'string') {
      return res.status(400).json({ mensagem: 'Informe a senha atual.' });
    }

    const problemas = problemasDaSenha(novaSenha);
    if (problemas.length > 0) {
      return res.status(400).json({ mensagem: mensagemDaSenha(problemas, 'A nova senha precisa ter') });
    }

    if (senhaAtual === novaSenha) {
      return res.status(400).json({ mensagem: 'A nova senha precisa ser diferente da atual.' });
    }

    const conta = await buscarContaDoProfissional(idProfissional);

    if (!conta) {
      return res.status(404).json({ mensagem: 'Profissional não encontrado.' });
    }

    if (!(await bcrypt.compare(senhaAtual, conta.ds_senha_hash))) {
      registrarAuditoria(req, { acao: 'senha.trocar', sucesso: false, detalhe: { motivo: 'senha_atual_incorreta' } });
      // 400, e não 401: no app, 401 significa "sessão encerrada" e tira a
      // pessoa da conta. Errar a senha atual não é motivo para isso.
      return res.status(400).json({ mensagem: 'A senha atual está incorreta.' });
    }

    await atualizarSenha(idProfissional, await bcrypt.hash(novaSenha, 12));

    // Um "esqueci a senha" em aberto deixa de valer, e os OUTROS aparelhos
    // saem da conta. Este aparelho recebe um token novo na resposta, para
    // não ser derrubado junto.
    await marcarTokensAnterioresComoUsados(idProfissional);
    await encerrarSessoesDoProfissional(idProfissional);

    const estado = await estadoDoProfissional(idProfissional);
    const token = emitirToken('profissional', idProfissional, estado?.versao);

    registrarAuditoria(req, { acao: 'senha.trocar', recurso: 'profissional', idRecurso: idProfissional });

    enviarEmailSenhaAlterada(conta.ds_email, conta.nm_profissional).catch((problema) =>
      console.error('Erro ao avisar da troca de senha:', problema.message)
    );

    return res.status(200).json({ mensagem: 'Senha alterada com sucesso!', token });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao alterar a senha.' });
  }
}

router.put('/', autenticar, limites.trocaSenha, trocarSenhaDoProfissional);
router.put('/:id', autenticar, limites.trocaSenha, trocarSenhaDoProfissional);

module.exports = router;
