
const express = require('express');
const jwt = require('jsonwebtoken');

const {
  inserirPaciente,
  listarPacientesPorProfissional,
  obterPacientePorIdEProfissional,
  autenticarPaciente,
  ativarContaPaciente,
  obterEvolucaoPaciente,
} = require('../repository/pacienteRepository');

const autenticar = require('../middleware/autenticar');
const router = express.Router();

// Verifica exclusivamente sessões normais de pacientes.
function verificarSessaoPaciente(req, res, next) {
  const autorizacao = req.headers.authorization || '';
  const token = autorizacao.startsWith('Bearer ')
    ? autorizacao.slice(7)
    : '';

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
      return res.status(403).json({
        mensagem: 'Acesso não autorizado.',
      });
    }

    req.paciente = {
      id: Number(dadosToken.id_paciente),
    };

    return next();
  } catch (erro) {
    return res.status(401).json({
      mensagem: 'Sessão inválida ou expirada. Entre novamente.',
    });
  }
}

function calcularIdade(dataNascimento) {
  const nasc = new Date(`${dataNascimento}T00:00:00`);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nasc.getFullYear();

  const jaFezAniversario =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() &&
      hoje.getDate() >= nasc.getDate());

  if (!jaFezAniversario) idade--;

  return idade;
}

// Lista os pacientes vinculados ao nutricionista autenticado.
router.get('/', autenticar, async (req, res) => {
  try {
    const idProfissional = Number(req.usuario.id_profissional);
    const pacientes =
      await listarPacientesPorProfissional(idProfissional);

    return res.status(200).json({ pacientes });
  } catch (erro) {
    console.error('Erro ao listar pacientes:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao buscar os pacientes.',
    });
  }
});

// Evolução do próprio paciente autenticado.
// Esta rota deve ficar antes de GET /:id.
router.get(
  '/minha-evolucao',
  verificarSessaoPaciente,
  async (req, res) => {
    try {
      const idPaciente = req.paciente.id;

      const evolucao = await obterEvolucaoPaciente(idPaciente);

      return res.status(200).json({
        historicoPeso: evolucao.historicoPeso || [],
        avaliacoes: evolucao.avaliacoes || [],
      });
    } catch (erro) {
      console.error('Erro ao buscar evolução do paciente:', erro);

      return res.status(500).json({
        mensagem: 'Erro ao buscar sua evolução. Tente novamente.',
      });
    }
  }
);

// Busca a ficha respeitando o vínculo entre paciente e nutricionista.
router.get('/:id', autenticar, async (req, res) => {
  try {
    const idPaciente = Number(req.params.id);
    const idProfissional = Number(req.usuario.id_profissional);

    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      return res.status(400).json({
        mensagem: 'Identificador de paciente inválido.',
      });
    }

    const paciente = await obterPacientePorIdEProfissional(
      idPaciente,
      idProfissional
    );

    if (!paciente) {
      return res.status(404).json({
        mensagem: 'Paciente não encontrado.',
      });
    }

    return res.status(200).json({ paciente });
  } catch (erro) {
    console.error('Erro ao buscar ficha do paciente:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao buscar a ficha do paciente.',
    });
  }
});

// Cadastra um paciente.
router.post('/cadastro', async (req, res) => {
  const p = req.body;

  if (!p.idProfissional) {
    return res.status(400).json({
      mensagem: 'Profissional não identificado.',
    });
  }

  if (!p.nome || !p.dataNascimento || !p.sexo) {
    return res.status(400).json({
      mensagem: 'Nome, data de nascimento e sexo são obrigatórios.',
    });
  }

  if (Number.isNaN(new Date(p.dataNascimento).getTime())) {
    return res.status(400).json({
      mensagem: 'Data de nascimento inválida.',
    });
  }

  if (
    calcularIdade(p.dataNascimento) < 18 &&
    !p.nomeResponsavel
  ) {
    return res.status(400).json({
      mensagem:
        'Responsável legal é obrigatório para menores de 18 anos.',
    });
  }

  if (
    p.enviarConvite &&
    (!p.emailAcesso || !String(p.emailAcesso).trim())
  ) {
    return res.status(400).json({
      mensagem: 'Informe o e-mail de acesso para criar a conta.',
    });
  }

  try {
    const resultado = await inserirPaciente(p);

    return res.status(201).json({
      mensagem: 'Paciente cadastrado com sucesso.',
      ...resultado,
    });
  } catch (erro) {
    console.error('Erro ao cadastrar paciente:', erro);

    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensagem: 'Já existe um acesso com esse e-mail.',
      });
    }

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar paciente.',
    });
  }
});

// Login do paciente.
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: 'Informe o e-mail e a senha.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está configurado.');

      return res.status(500).json({
        mensagem: 'A autenticação não está configurada no servidor.',
      });
    }

    const resultado = await autenticarPaciente(email, senha);

    if (!resultado.sucesso) {
      if (resultado.bloqueado) {
        return res.status(403).json({
          mensagem:
            'Esta conta não está disponível. Entre em contato com seu nutricionista.',
        });
      }

      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos.',
      });
    }

    const idPaciente = Number(resultado.paciente.id);

    const token = resultado.primeiroAcesso
      ? jwt.sign(
          {
            tipo: 'paciente_primeiro_acesso',
            id_paciente: idPaciente,
          },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        )
      : jwt.sign(
          {
            tipo: 'paciente',
            id_paciente: idPaciente,
          },
          process.env.JWT_SECRET,
          { expiresIn: '8h' }
        );

    return res.status(200).json({
      ...resultado,
      token,
    });
  } catch (erro) {
    console.error('Erro no login do paciente:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao realizar o login.',
    });
  }
});

// Ativação da conta após o primeiro acesso.
router.post('/primeiro-acesso', async (req, res) => {
  try {
    const autorizacao = req.headers.authorization || '';
    const token = autorizacao.startsWith('Bearer ')
      ? autorizacao.slice(7)
      : '';

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        mensagem: 'Sessão de primeiro acesso inválida ou expirada.',
      });
    }

    let dadosToken;

    try {
      dadosToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (erro) {
      return res.status(401).json({
        mensagem: 'Sessão de primeiro acesso inválida ou expirada.',
      });
    }

    if (dadosToken.tipo !== 'paciente_primeiro_acesso') {
      return res.status(403).json({
        mensagem: 'Esta sessão não permite ativar a conta.',
      });
    }

    const {
      senha,
      confirmarSenha,
      aceitouTermos,
      autorizouDados,
    } = req.body;

    if (typeof senha !== 'string' || senha.length < 8) {
      return res.status(400).json({
        mensagem: 'A senha precisa ter no mínimo 8 caracteres.',
      });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({
        mensagem: 'As senhas não conferem.',
      });
    }

    if (aceitouTermos !== true || autorizouDados !== true) {
      return res.status(400).json({
        mensagem:
          'É necessário registrar os consentimentos solicitados.',
      });
    }

    await ativarContaPaciente(
      Number(dadosToken.id_paciente),
      senha,
      'v1'
    );

    const novoToken = jwt.sign(
      {
        tipo: 'paciente',
        id_paciente: Number(dadosToken.id_paciente),
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      mensagem: 'Conta ativada com sucesso.',
      token: novoToken,
    });
  } catch (erro) {
    if (erro.code === 'CONTA_NAO_PENDENTE') {
      return res.status(409).json({
        mensagem: 'Esta conta não está pendente de ativação.',
      });
    }

    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensagem: 'Os consentimentos já foram registrados.',
      });
    }

    console.error('Erro ao ativar conta do paciente:', erro);

    return res.status(500).json({
      mensagem: 'Não foi possível ativar a conta.',
    });
  }
});

module.exports = router;
