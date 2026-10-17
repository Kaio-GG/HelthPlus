// Api/repository/pacienteRepository.js
// Comandos SQL do paciente.
//
// ATENÇÃO: o connection.js do backend precisa exportar um pool do
// mysql2/promise (algo como: module.exports = mysql.createPool({...})).
// Confira como o profissionalRepository.js importa a conexão e use igual.
const connection = require('../connection');
// Use a mesma biblioteca de hash que o profissional usa (bcrypt ou bcryptjs).
// Os hashes das duas são compatíveis. Se não tiver nenhuma: npm install bcryptjs
const bcrypt = require('bcryptjs');

async function inserirPaciente(p) {
  const conn = await connection.getConnection();

  try {
    // Transação: ou salva paciente + acesso, ou não salva nada.
    await conn.beginTransaction();

    const [resultado] = await conn.query(
      `INSERT INTO paciente (
        id_profissional,
        nm_paciente,
        dt_nascimento,
        sg_sexo,
        nm_responsavel,
        nr_telefone_responsavel,
        ds_email,
        nr_telefone,
        ds_cep,
        ds_numero,
        ds_logradouro,
        nm_cidade,
        ds_objetivo_consulta,
        ds_restricoes_alimentares,
        ds_alergias,
        ds_condicoes_saude,
        ds_medicamentos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.idProfissional,
        p.nome,
        p.dataNascimento, // formato YYYY-MM-DD
        String(p.sexo).charAt(0).toUpperCase(), // "F" ou "M"
        p.nomeResponsavel || null,
        p.telefoneResponsavel || null,
        p.email || null,
        p.telefone || null,
        p.cep || null,
        p.numero || null,
        p.logradouro || null,
        p.cidade || null,
        p.objetivo || null,
        p.restricoes || null, // texto: "Vegano, Sem lactose"
        p.alergias || null,
        p.condicoes || null,
        p.medicamentos || null,
      ]
    );

    const idPaciente = resultado.insertId;
    let conviteCriado = false;

    // Etapa 4: cria o acesso do paciente com status "pendente".
    // PROVISÓRIO: a senha inicial é a data de nascimento (DDMMAAAA), guardada com hash.
    // Status "pendente" = ainda não trocou a senha (o login deve exigir a troca).
    if (p.enviarConvite) {
      const [ano, mes, dia] = p.dataNascimento.split('-');
      const senhaInicial = `${dia}${mes}${ano}`; // 2000-12-12 -> 12122000
      const senhaHash = await bcrypt.hash(senhaInicial, 10);

      await conn.query(
        `INSERT INTO usuario_paciente (id_paciente, ds_email, ds_senha, ds_status)
         VALUES (?, ?, ?, 'pendente')`,
        [idPaciente, p.emailAcesso, senhaHash]
      );
      conviteCriado = true;
    }

    await conn.commit();
    return { idPaciente, conviteCriado };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

module.exports = { inserirPaciente };