// Api/storage/pacienteStorage.js
// No server.js: app.use('/api/paciente', pacienteStorage)
//
// Nutricionista (token de profissional):
//   GET    /api/paciente                lista os pacientes dele
//   POST   /api/paciente/cadastro       cadastra um paciente
//   GET    /api/paciente/:id            a ficha
//   GET    /api/paciente/:id/evolucao   as avaliações
//   DELETE /api/paciente/:id            apaga o paciente e tudo dele
//
// Paciente:
//   POST   /api/paciente/login               entra (pode cair no primeiro acesso)
//   POST   /api/paciente/primeiro-acesso     aceita os termos e troca a senha provisória
//   GET    /api/paciente/minha-evolucao      as próprias avaliações
//   PUT    /api/paciente/senha               troca a própria senha
//   POST   /api/paciente/encerrar-sessoes    "sair de todos os aparelhos"
//
// Os direitos do titular (cópia dos dados, revogação, pedidos ao
// nutricionista, histórico de acessos) ficam em /api/lgpd.
const express = require('express');
const bcrypt = require('bcryptjs');

const {
  inserirPaciente,
  listarPacientesPorProfissional,
  obterPacientePorIdEProfissional,
  autenticarPaciente: conferirCredenciaisDoPaciente,
  consentimentoVigente,
  senhaAindaEhProvisoria,
  dadosDoPrimeiroAcesso,
  concluirPrimeiroAcesso,
  trocarSenhaDoPaciente,
  obterEvolucaoPaciente,
  excluirPaciente,
} = require('../repository/pacienteRepository');

const { enviarConvitePaciente } = require('../servicos/conviteEmail');
const { senhaDaDataNascimento } = require('../servicos/senhaTemporaria');

const autenticar = require('../middleware/autenticar');
const autenticarPaciente = require('../middleware/autenticarPaciente');
const { autenticarPrimeiroAcesso } = require('../middleware/autenticarPaciente');
const { limites } = require('../middleware/limiteTaxa');
const { emitirToken, encerrarSessoesDoPaciente } = require('../servicos/sessao');
const { registrarAuditoria, pseudonimo } = require('../servicos/auditoria');
const {
  registrarFalha,
  registrarSucesso,
  MENSAGEM_BLOQUEIO,
} = require('../servicos/bloqueioConta');
const config = require('../config');
const {
  problemasDaSenha,
  mensagemDaSenha,
  emailValido,
  normalizarEmail,
  nascimentoValido,
  calcularIdade,
  textoOpcional,
  idValido,
} = require('../utilitarios/validacao');

const router = express.Router();

// Idade abaixo da qual quem aceita os termos é o responsável legal.
//
// A LGPD exige o consentimento de um dos pais para CRIANÇA (até 12 anos,
// Art. 14, §1º), e o ECA Digital (Lei 15.211/2025) pede vínculo com o
// responsável até os 16. O projeto foi mais conservador e pede o aceite
// do responsável para todo menor de 18 — é o mesmo corte que o cadastro
// já usava para exigir o nome do responsável. Ajuste com o jurídico.
const IDADE_SEM_RESPONSAVEL = 18;

// =====================================================================
// NUTRICIONISTA
// =====================================================================

router.get('/', autenticar, async (req, res) => {
  try {
    const pacientes = await listarPacientesPorProfissional(Number(req.usuario.id_profissional));

    registrarAuditoria(req, {
      acao: 'paciente.listar',
      recurso: 'paciente',
      detalhe: { quantidade: pacientes.length },
    });

    return res.status(200).json({ pacientes });
  } catch (erro) {
    console.error('Erro ao listar pacientes:', erro);
    return res.status(500).json({ mensagem: 'Erro ao buscar os pacientes.' });
  }
});

// =====================================================================
// PACIENTE — estas rotas ficam antes de GET /:id
// =====================================================================

router.get('/minha-evolucao', autenticarPaciente, async (req, res) => {
  try {
    const evolucao = await obterEvolucaoPaciente(req.paciente.id);

    registrarAuditoria(req, {
      acao: 'paciente.minha_evolucao.ler',
      recurso: 'paciente',
      idRecurso: req.paciente.id,
      idPacienteAlvo: req.paciente.id,
    });

    return res.status(200).json({
      paciente: evolucao.paciente || null,
      historicoPeso: evolucao.historicoPeso || [],
      avaliacoes: evolucao.avaliacoes || [],
    });
  } catch (erro) {
    console.error('Erro ao buscar evolução do paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao buscar sua evolução. Tente novamente.' });
  }
});

// =====================================================================
// NUTRICIONISTA — ficha, evolução, exclusão
// =====================================================================

// Busca o paciente garantindo o vínculo com o nutricionista do token.
// Devolve o paciente, ou null depois de já ter respondido o erro.
async function pacienteDoProfissional(req, res) {
  const idPaciente = idValido(req.params.id);

  if (!idPaciente) {
    res.status(400).json({ mensagem: 'Identificador de paciente inválido.' });
    return null;
  }

  const paciente = await obterPacientePorIdEProfissional(
    idPaciente,
    Number(req.usuario.id_profissional)
  );

  if (!paciente) {
    // Paciente de outro nutricionista, ou id inventado. Os dois respondem
    // 404, para não confirmar que o id existe; o log guarda a tentativa.
    registrarAuditoria(req, {
      acao: 'acesso.negado',
      recurso: 'paciente',
      idRecurso: idPaciente,
      sucesso: false,
      detalhe: { motivo: 'paciente_fora_da_lista' },
    });
    res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    return null;
  }

  return paciente;
}

router.get('/:id/evolucao', autenticar, async (req, res) => {
  try {
    const paciente = await pacienteDoProfissional(req, res);
    if (!paciente) return;

    const evolucao = await obterEvolucaoPaciente(paciente.idBanco);

    registrarAuditoria(req, {
      acao: 'paciente.evolucao.ler',
      recurso: 'paciente',
      idRecurso: paciente.idBanco,
      idPacienteAlvo: paciente.idBanco,
    });

    return res.status(200).json({
      paciente: evolucao.paciente || null,
      historicoPeso: evolucao.historicoPeso || [],
      avaliacoes: evolucao.avaliacoes || [],
    });
  } catch (erro) {
    console.error('Erro ao buscar a evolução do paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao buscar a evolução do paciente.' });
  }
});

router.get('/:id', autenticar, async (req, res) => {
  try {
    const paciente = await pacienteDoProfissional(req, res);
    if (!paciente) return;

    registrarAuditoria(req, {
      acao: 'paciente.ficha.ler',
      recurso: 'paciente',
      idRecurso: paciente.idBanco,
      idPacienteAlvo: paciente.idBanco,
    });

    return res.status(200).json({ paciente });
  } catch (erro) {
    console.error('Erro ao buscar ficha do paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao buscar a ficha do paciente.' });
  }
});

// Apaga de verdade, e não marca como inativo: quem pede para excluir um
// paciente costuma estar exercendo o direito de eliminação (LGPD, Art. 18,
// VI). O que sobra é uma linha no log de auditoria, sem nome nem dado de
// saúde, com o resumo dos aceites — a prova de que o tratamento teve base
// legal enquanto durou (Art. 37).
router.delete('/:id', autenticar, async (req, res) => {
  const idPaciente = idValido(req.params.id);
  const idProfissional = Number(req.usuario.id_profissional);

  if (!idPaciente) {
    return res.status(400).json({ mensagem: 'Identificador de paciente inválido.' });
  }

  try {
    const apagado = await excluirPaciente(idPaciente, idProfissional);

    registrarAuditoria(req, {
      acao: 'paciente.excluir',
      recurso: 'paciente',
      idRecurso: idPaciente,
      idPacienteAlvo: idPaciente,
      detalhe: { consentimentos: apagado.consentimentos },
    });

    return res.status(200).json({
      mensagem: `${apagado.nome} foi apagado, com as avaliações e as consultas.`,
    });
  } catch (erro) {
    if (erro.codigo === 'PACIENTE_NAO_ENCONTRADO') {
      return res.status(404).json({ mensagem: erro.message });
    }

    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        mensagem:
          'Não foi possível apagar: ainda há registros ligados a este paciente. Avise a equipe.',
      });
    }

    console.error('Erro ao apagar paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao apagar o paciente.' });
  }
});

// Cadastra um paciente. O paciente nasce na lista de QUEM ESTÁ LOGADO — o
// "idProfissional" do corpo é ignorado.
router.post('/cadastro', autenticar, async (req, res) => {
  const corpo = req.body || {};

  const p = {
    idProfissional: Number(req.usuario.id_profissional),
    nome: textoOpcional(corpo.nome, 100),
    dataNascimento: String(corpo.dataNascimento || '').slice(0, 10),
    sexo: String(corpo.sexo || '').trim().charAt(0).toUpperCase(),
    nomeResponsavel: textoOpcional(corpo.nomeResponsavel, 100),
    email: textoOpcional(corpo.email, 100),
    cep: textoOpcional(corpo.cep, 9),
    numero: textoOpcional(corpo.numero, 10),
    logradouro: textoOpcional(corpo.logradouro, 200),
    cidade: textoOpcional(corpo.cidade, 50),
    enviarConvite: corpo.enviarConvite === true,
    emailAcesso: textoOpcional(corpo.emailAcesso, 150),
  };

  if (!p.nome || p.nome.length < 3 || !p.dataNascimento || !p.sexo) {
    return res.status(400).json({ mensagem: 'Nome, data de nascimento e sexo são obrigatórios.' });
  }

  if (!['F', 'M'].includes(p.sexo)) {
    return res.status(400).json({ mensagem: 'Sexo inválido. Use F ou M.' });
  }

  // Antes valia qualquer coisa que o new Date() engolisse, inclusive data
  // no futuro — e a data de nascimento é o que forma a senha provisória.
  if (!nascimentoValido(p.dataNascimento)) {
    return res.status(400).json({ mensagem: 'Data de nascimento inválida.' });
  }

  if (calcularIdade(p.dataNascimento) < IDADE_SEM_RESPONSAVEL && !p.nomeResponsavel) {
    return res.status(400).json({ mensagem: 'Responsável legal é obrigatório para menores de 18 anos.' });
  }

  if (p.email && !emailValido(p.email)) {
    return res.status(400).json({ mensagem: 'O e-mail do paciente é inválido.' });
  }

  if (p.cep && !/^\d{5}-?\d{3}$/.test(p.cep)) {
    return res.status(400).json({ mensagem: 'CEP inválido.' });
  }

  if (p.enviarConvite && !emailValido(p.emailAcesso)) {
    return res.status(400).json({ mensagem: 'Informe o e-mail de acesso para criar a conta.' });
  }

  try {
    const resultado = await inserirPaciente(p);

    registrarAuditoria(req, {
      acao: 'paciente.cadastrar',
      recurso: 'paciente',
      idRecurso: resultado.idPaciente,
      idPacienteAlvo: resultado.idPaciente,
      detalhe: { acessoCriado: resultado.conviteCriado },
    });

    // O try é só do envio: um erro aqui, solto, cairia no catch do
    // cadastro e devolveria 500 para um paciente que já foi gravado.
    let conviteEnviado = false;

    if (resultado.conviteCriado) {
      try {
        const envio = await enviarConvitePaciente({
          para: normalizarEmail(p.emailAcesso),
          nomePaciente: p.nome,
          nomeProfissional: resultado.nomeProfissional,
        });

        conviteEnviado = envio.enviado;
      } catch (problema) {
        console.error('Erro ao enviar o convite do paciente:', problema.message);
      }
    }

    // Campo por campo, e não o "resultado" inteiro: ele traz a senha
    // provisória, que não pode voltar na resposta da API.
    return res.status(201).json({
      mensagem: 'Paciente cadastrado com sucesso.',
      idPaciente: resultado.idPaciente,
      conviteCriado: resultado.conviteCriado,
      conviteEnviado,
    });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Já existe um acesso com esse e-mail.' });
    }

    console.error('Erro ao cadastrar paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao cadastrar paciente.' });
  }
});

// =====================================================================
// PACIENTE — login e primeiro acesso
// =====================================================================

// Login do paciente.
//
// Senha certa NÃO é o bastante para entrar no aplicativo. Antes, ele
// também precisa:
//   1. ter aceitado a versão atual dos termos e o tratamento dos dados de
//      saúde — ele mesmo, ou o responsável legal se for menor;
//   2. ter trocado a senha provisória (a data de nascimento), que qualquer
//      parente, colega de escola ou quem viu a ficha em papel adivinha.
//
// Faltando um dos dois, a resposta traz só um token de PRIMEIRO ACESSO,
// que não lê dado nenhum — serve apenas para a rota /primeiro-acesso.
router.post('/login', limites.login, async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    if (!email || !senha || typeof senha !== 'string') {
      return res.status(400).json({ mensagem: 'Informe o e-mail e a senha.' });
    }

    const emailNormalizado = normalizarEmail(email);
    const resultado = await conferirCredenciaisDoPaciente(emailNormalizado, senha);

    if (!resultado.sucesso) {
      registrarAuditoria(req, {
        acao: 'login.paciente',
        sucesso: false,
        ator: { tipo: resultado.idPaciente ? 'paciente' : 'anonimo', id: resultado.idPaciente },
        detalhe: {
          motivo: resultado.bloqueioTemporario
            ? 'conta_bloqueada_temporariamente'
            : resultado.bloqueado
              ? 'conta_bloqueada'
              : resultado.motivo,
          conta: pseudonimo(emailNormalizado),
        },
      });

      if (resultado.bloqueioTemporario) {
        return res.status(429).json({ mensagem: MENSAGEM_BLOQUEIO });
      }

      if (resultado.bloqueado) {
        return res.status(403).json({
          mensagem: 'Esta conta não está disponível. Entre em contato com seu nutricionista.',
        });
      }

      if (resultado.motivo === 'senha_incorreta') {
        const fechou = await registrarFalha('paciente', resultado.idPaciente);
        if (fechou) {
          registrarAuditoria(req, {
            acao: 'conta.bloqueio_temporario',
            sucesso: false,
            ator: { tipo: 'paciente', id: resultado.idPaciente },
          });
        }
      }

      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    const { conta, paciente } = resultado;
    await registrarSucesso('paciente', conta.idPaciente);

    const temConsentimento = await consentimentoVigente(conta.idPaciente, config.versaoTermos);
    const idade = calcularIdade(conta.nascimento);
    const menorDeIdade = idade !== null && idade < IDADE_SEM_RESPONSAVEL;

    if (!temConsentimento || resultado.senhaProvisoria) {
      registrarAuditoria(req, {
        acao: 'login.paciente.primeiro_acesso',
        ator: { tipo: 'paciente', id: conta.idPaciente },
        idPacienteAlvo: conta.idPaciente,
        detalhe: { exigeConsentimento: !temConsentimento, exigeTrocaSenha: resultado.senhaProvisoria },
      });

      return res.status(200).json({
        sucesso: true,
        precisaPrimeiroAcesso: true,
        exigeConsentimento: !temConsentimento,
        exigeTrocaSenha: resultado.senhaProvisoria,
        menorDeIdade,
        nomeResponsavel: menorDeIdade ? conta.responsavel || null : null,
        versaoTermos: config.versaoTermos,
        tokenPrimeiroAcesso: emitirToken(
          'paciente_primeiro_acesso',
          conta.idPaciente,
          conta.versaoSessao,
          config.jwt.validadePrimeiroAcesso
        ),
        paciente: { id: paciente.id, nome: paciente.nome },
      });
    }

    registrarAuditoria(req, {
      acao: 'login.paciente',
      ator: { tipo: 'paciente', id: conta.idPaciente },
      idPacienteAlvo: conta.idPaciente,
    });

    return res.status(200).json({
      sucesso: true,
      precisaPrimeiroAcesso: false,
      senhaProvisoria: false,
      paciente,
      token: emitirToken('paciente', conta.idPaciente, conta.versaoSessao),
    });
  } catch (erro) {
    console.error('Erro no login do paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao realizar o login.' });
  }
});

// Aceite dos termos e troca da senha provisória.
//
// Corpo (os aceites só são pedidos se ainda não houver aceite da versão
// atual dos termos):
//   aceiteTermos       true — Termos de Uso e Política de Privacidade
//   aceiteDadosSaude   true — tratamento dos dados de saúde (Art. 11, I)
//   consentidor        'titular' (adulto) | 'responsavel' (menor de idade)
//   nomeConsentidor    nome do responsável que está aceitando (menor)
//   declaraResponsavel true — "sou pai, mãe ou responsável legal"
//   novaSenha          obrigatória se a senha ainda é a data de nascimento
router.post('/primeiro-acesso', limites.primeiroAcesso, autenticarPrimeiroAcesso, async (req, res) => {
  try {
    const idPaciente = req.paciente.id;
    const corpo = req.body || {};

    const dados = await dadosDoPrimeiroAcesso(idPaciente);
    if (!dados) {
      return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    // Quem já aceitou a versão atual (e só caiu aqui pela senha
    // provisória) não aceita de novo: gravar outro "aceito" sem a pessoa
    // ter marcado nada seria repetir o erro que esta tela veio corrigir.
    const jaAceitou = await consentimentoVigente(idPaciente, config.versaoTermos);

    let consentimento = null;

    if (!jaAceitou) {
      if (corpo.aceiteTermos !== true || corpo.aceiteDadosSaude !== true) {
        return res.status(400).json({
          mensagem:
            'Para usar o aplicativo é preciso aceitar os Termos e o tratamento dos dados de saúde. ' +
            'Sem o aceite, o acompanhamento continua normalmente com o seu nutricionista, só que fora do app.',
        });
      }

      const idade = calcularIdade(dados.dt_nascimento);
      const menorDeIdade = idade !== null && idade < IDADE_SEM_RESPONSAVEL;

      consentimento = { consentidor: 'titular', nomeConsentidor: dados.nm_paciente };

      if (menorDeIdade) {
        const nomeConsentidor = textoOpcional(corpo.nomeConsentidor, 100);

        if (corpo.declaraResponsavel !== true || !nomeConsentidor || nomeConsentidor.length < 3) {
          return res.status(400).json({
            mensagem:
              'Como o paciente é menor de idade, o aceite precisa ser feito pelo pai, pela mãe ' +
              'ou pelo responsável legal, com o nome completo.',
          });
        }

        consentimento = { consentidor: 'responsavel', nomeConsentidor };
      }
    }

    let novaSenhaHash = null;

    if (await senhaAindaEhProvisoria(idPaciente)) {
      const problemas = problemasDaSenha(corpo.novaSenha);

      if (problemas.length > 0) {
        return res.status(400).json({ mensagem: mensagemDaSenha(problemas, 'A nova senha precisa ter') });
      }

      if (corpo.novaSenha === senhaDaDataNascimento(dados.dt_nascimento)) {
        return res.status(400).json({ mensagem: 'A nova senha não pode ser a data de nascimento.' });
      }

      novaSenhaHash = await bcrypt.hash(corpo.novaSenha, 12);
    }

    const { versaoSessao } = await concluirPrimeiroAcesso(idPaciente, {
      versao: config.versaoTermos,
      consentimento,
      novaSenhaHash,
    });

    if (consentimento) {
      registrarAuditoria(req, {
        acao: 'lgpd.consentimento.aceitar',
        recurso: 'consentimento',
        idPacienteAlvo: idPaciente,
        detalhe: { versao: config.versaoTermos, consentidor: consentimento.consentidor },
      });
    }

    if (novaSenhaHash) {
      registrarAuditoria(req, {
        acao: 'senha.trocar_provisoria',
        idPacienteAlvo: idPaciente,
      });
    }

    return res.status(200).json({
      mensagem: 'Tudo certo! Seu acesso está liberado.',
      token: emitirToken('paciente', idPaciente, versaoSessao),
      paciente: {
        id: String(idPaciente),
        nome: dados.nm_paciente,
        email: dados.ds_email,
        nascimento: dados.dt_nascimento,
        sexo: dados.sg_sexo,
      },
    });
  } catch (erro) {
    console.error('Erro no primeiro acesso do paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao concluir o primeiro acesso.' });
  }
});

// Troca de senha do paciente, de dentro do aplicativo. Pede a senha atual:
// sem isso, quem pegasse o celular destravado trocaria a senha da conta.
router.put('/senha', autenticarPaciente, limites.trocaSenha, async (req, res) => {
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

  try {
    const resultado = await trocarSenhaDoPaciente(req.paciente.id, senhaAtual, novaSenha);

    if (!resultado.sucesso) {
      if (resultado.codigo === 'SENHA_ATUAL_INCORRETA') {
        registrarAuditoria(req, {
          acao: 'senha.trocar',
          sucesso: false,
          idPacienteAlvo: req.paciente.id,
          detalhe: { motivo: 'senha_atual_incorreta' },
        });
        // 400, e não 401: no app, 401 significa "sessão encerrada" e tira a
        // pessoa da conta. Errar a senha atual não é motivo para isso.
        return res.status(400).json({ mensagem: 'A senha atual está incorreta.' });
      }

      return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    registrarAuditoria(req, { acao: 'senha.trocar', idPacienteAlvo: req.paciente.id });

    // Os outros aparelhos saem da conta; este recebe um token novo.
    return res.status(200).json({
      mensagem: 'Senha alterada com sucesso!',
      token: emitirToken('paciente', req.paciente.id, resultado.versaoSessao),
    });
  } catch (erro) {
    console.error('Erro ao trocar a senha do paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao alterar a senha.' });
  }
});

router.post('/encerrar-sessoes', autenticarPaciente, async (req, res) => {
  try {
    await encerrarSessoesDoPaciente(req.paciente.id);
    registrarAuditoria(req, { acao: 'sessao.encerrar_todas', idPacienteAlvo: req.paciente.id });
    return res.status(200).json({ mensagem: 'Todas as sessões foram encerradas.' });
  } catch (erro) {
    console.error('Erro ao encerrar as sessões do paciente:', erro);
    return res.status(500).json({ mensagem: 'Erro ao encerrar as sessões.' });
  }
});

module.exports = router;
