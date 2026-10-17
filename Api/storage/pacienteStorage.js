const express = require('express');
const { inserirPaciente } = require('../repository/pacienteRepository');

const router = express.Router();

function calcularIdade(dataNascimento) {
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const jaFezAniversario =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
  if (!jaFezAniversario) idade--;
  return idade;
}

// POST /api/paciente/cadastro
router.post('/cadastro', async (req, res) => {
  const p = req.body;

  // Validações mínimas (campos NOT NULL da tabela)
  if (!p.idProfissional) {
    return res.status(400).json({ mensagem: 'Profissional não identificado.' });
  }
  if (!p.nome || !p.dataNascimento || !p.sexo) {
    return res
      .status(400)
      .json({ mensagem: 'Nome, data de nascimento e sexo são obrigatórios.' });
  }
  if (Number.isNaN(new Date(p.dataNascimento).getTime())) {
    return res.status(400).json({ mensagem: 'Data de nascimento inválida.' });
  }
  if (calcularIdade(p.dataNascimento) < 18 && !p.nomeResponsavel) {
    return res
      .status(400)
      .json({ mensagem: 'Responsável legal é obrigatório para menores de 18 anos.' });
  }
  if (p.enviarConvite && !p.emailAcesso) {
    return res
      .status(400)
      .json({ mensagem: 'Informe o e-mail de acesso para enviar o convite.' });
  }

  try {
    const resultado = await inserirPaciente(p);

    // TODO: aqui entra o envio do e-mail de convite (resultado.conviteCriado).
    return res.status(201).json({
      mensagem: 'Paciente cadastrado com sucesso.',
      ...resultado,
    });
  } catch (erro) {
    console.error('Erro ao cadastrar paciente:', erro);

    if (erro.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ mensagem: 'Já existe um acesso com esse e-mail.' });
    }
    return res.status(500).json({ mensagem: 'Erro ao cadastrar paciente.' });
  }
});


module.exports = router;