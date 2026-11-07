const express = require('express');
const jwt = require('jsonwebtoken');

const {
  inserirPaciente,
  listarPacientesPorProfissional,
  obterPacientePorIdEProfissional,
  autenticarPaciente,
  trocarSenhaDoPaciente,
  obterEvolucaoPaciente,
  excluirPaciente,
} = require('../repository/pacienteRepository');

// Modelo do e-mail de convite (usa o serviço de e-mail do projeto).
const { enviarConvitePaciente } = require('../servicos/conviteEmail');

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
        paciente: evolucao.paciente || null,
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

// Evolução de um paciente, lida pelo NUTRICIONISTA.
//
// É a mesma consulta de /minha-evolucao, com outra porta de entrada: aqui
// quem se autentica é o profissional, e o vínculo com o paciente é
// conferido antes. As duas telas ("Evolução" na ficha e "Minha evolução"
// no aplicativo do paciente) passaram a mostrar os mesmos números porque
// leem a mesma função.
//
// Também fica antes de GET /:id — "/:id/evolucao" não colide, mas manter as
// rotas específicas em cima evita a próxima pegadinha.
router.get('/:id/evolucao', autenticar, async (req, res) => {
  const idPaciente = Number(req.params.id);
  const idProfissional = Number(req.usuario.id_profissional);

  if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
    return res.status(400).json({
      mensagem: 'Identificador de paciente inválido.',
    });
  }

  try {
    // Sem esta checagem, qualquer nutricionista leria a evolução de
    // qualquer paciente só trocando o número da URL.
    const paciente = await obterPacientePorIdEProfissional(
      idPaciente,
      idProfissional
    );

    if (!paciente) {
      return res.status(404).json({
        mensagem: 'Paciente não encontrado.',
      });
    }

    const evolucao = await obterEvolucaoPaciente(idPaciente);

    return res.status(200).json({
      paciente: evolucao.paciente || null,
      historicoPeso: evolucao.historicoPeso || [],
      avaliacoes: evolucao.avaliacoes || [],
    });
  } catch (erro) {
    console.error('Erro ao buscar a evolução do paciente:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao buscar a evolução do paciente.',
    });
  }
});

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

// Apaga o paciente e tudo o que está pendurado nele.
//
// Apaga de verdade, e não marca como inativo: quem pede para excluir um
// paciente costuma estar exercendo o direito de eliminação dos dados
// (LGPD), e nesse caso guardar uma cópia "inativa" seria justamente o
// que não se quer. Quem só quer tirar da lista do dia a dia deveria
// arquivar — isso ainda não existe, e está dito na tela.
//
// O id do nutricionista sai do token: ninguém apaga o paciente de outro.
router.delete('/:id', autenticar, async (req, res) => {
  const idPaciente = Number(req.params.id);
  const idProfissional = Number(req.usuario.id_profissional);

  if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
    return res.status(400).json({
      mensagem: 'Identificador de paciente inválido.',
    });
  }

  try {
    const apagado = await excluirPaciente(idPaciente, idProfissional);

    return res.status(200).json({
      mensagem: `${apagado.nome} foi apagado, com as avaliações e os planos.`,
    });
  } catch (erro) {
    if (erro.codigo === 'PACIENTE_NAO_ENCONTRADO') {
      return res.status(404).json({ mensagem: erro.message });
    }

    // Sobrou alguma linha apontando para o paciente numa tabela que
    // esta rota não conhece. O rollback já desfez o resto.
    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        mensagem:
          'Não foi possível apagar: ainda há registros ligados a este ' +
          'paciente. Avise a equipe.',
      });
    }

    console.error('Erro ao apagar paciente:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao apagar o paciente.',
    });
  }
});

// Cadastra um paciente.
// Exige token de nutricionista, e o paciente nasce pendurado em QUEM ESTÁ
// LOGADO — o "idProfissional" que vinha no corpo é ignorado.
//
// Aberta, esta rota deixava qualquer um na rede criar ficha de paciente
// (nome, data de nascimento, endereço, responsável) na lista de qualquer
// nutricionista, e abrir junto uma conta de acesso cuja senha é a data de
// nascimento que ele mesmo escolheu. Tratamento de dado pessoal sem base
// legal e sem controle de integridade.
router.post('/cadastro', autenticar, async (req, res) => {
  const p = { ...req.body, idProfissional: Number(req.usuario.id_profissional) };

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

    // O convite é o único jeito de o paciente descobrir que tem acesso:
    // quem cria a conta é o nutricionista, e o paciente não escolheu nem
    // o e-mail nem a senha. Sem este envio a conta nasce inalcançável.
    //
    // O try é só do envio: um erro aqui, solto, cairia no catch do
    // cadastro e devolveria 500 para um paciente que já foi gravado.
    let conviteEnviado = false;

    if (resultado.conviteCriado) {
      try {
        const envio = await enviarConvitePaciente({
          para: p.emailAcesso,
          nomePaciente: p.nome,
          nomeProfissional: resultado.nomeProfissional,
        });

        conviteEnviado = envio.enviado;
      } catch (problema) {
        console.error(
          'Erro ao enviar o convite do paciente:',
          problema.message
        );
      }
    }

    // Campo por campo, e não o "resultado" inteiro: ele traz a senha
    // provisória, que não pode voltar na resposta da API.
    //
    // "conviteEnviado" vem false também quando o SMTP não está
    // configurado — aí a mensagem só foi para o terminal da API.
    return res.status(201).json({
      mensagem: 'Paciente cadastrado com sucesso.',
      idPaciente: resultado.idPaciente,
      conviteCriado: resultado.conviteCriado,
      conviteEnviado,
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

    // Um token só, de sessão normal. O token curto de
    // "paciente_primeiro_acesso" deixou de existir junto com a tela: quem
    // acerta a senha entra no aplicativo, e a conta pendente já foi
    // ativada pelo autenticarPaciente().
    const token = jwt.sign(
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

// Troca de senha do paciente, de dentro do aplicativo.
//
// Pede a senha atual, como a do nutricionista: sem isso, quem pegasse o
// celular destravado trocaria a senha da conta.
//
// A "senha atual" pode ser a data de nascimento — é com ela que o paciente
// entra pela primeira vez. É justamente nesse caso que esta rota mais vale:
// é por aqui que ele sai de uma senha que qualquer um poderia adivinhar.
router.put('/senha', verificarSessaoPaciente, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual) {
    return res.status(400).json({ mensagem: 'Informe a senha atual.' });
  }

  // As mesmas regras da tela e da senha do nutricionista
  // (app/utilitarios/validacoes.js e Api/storage/senhaStorage.js). A tela
  // ajuda quem digita; quem garante é o servidor.
  const problemas = [];

  if (!novaSenha || novaSenha.length < 8) problemas.push('pelo menos 8 caracteres');
  if (!/[A-ZÀ-Ý]/.test(novaSenha || '')) problemas.push('uma letra maiúscula');
  if (!/\d/.test(novaSenha || '')) problemas.push('um número');
  if (!/[^A-Za-z0-9\s]/.test(novaSenha || '')) problemas.push('um caractere especial');

  if (problemas.length > 0) {
    return res.status(400).json({
      mensagem: `A nova senha precisa ter ${problemas.join(', ')}.`,
    });
  }

  if (senhaAtual === novaSenha) {
    return res.status(400).json({
      mensagem: 'A nova senha precisa ser diferente da atual.',
    });
  }

  try {
    const resultado = await trocarSenhaDoPaciente(
      req.paciente.id,
      senhaAtual,
      novaSenha
    );

    if (!resultado.sucesso) {
      if (resultado.codigo === 'SENHA_ATUAL_INCORRETA') {
        return res.status(401).json({ mensagem: 'A senha atual está incorreta.' });
      }

      return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    return res.status(200).json({ mensagem: 'Senha alterada com sucesso!' });
  } catch (erro) {
    console.error('Erro ao trocar a senha do paciente:', erro);

    return res.status(500).json({ mensagem: 'Erro ao alterar a senha.' });
  }
});

module.exports = router;
