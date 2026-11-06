// Api/repository/avaliacaoRepository.js
// Gravação de uma avaliação antropométrica na ficha do paciente.
//
// Uma avaliação é a consulta em que o nutricionista mediu o paciente, e
// ela se espalha por três tabelas:
//
//   avaliacao               a consulta: paciente, profissional, data, idade
//   medida_antropometrica   o que foi medido (peso, estatura...)
//   resultado_avaliacao     o que o cálculo da OMS leu de cada medida
//
// Quem calcula é o APLICATIVO, não a API: as curvas da OMS estão em
// app/utilitarios/oms, e é lá que a calculadora mostra o resultado na
// tela. A API recebe o resultado pronto e grava. Não é o ideal (o servidor
// confia na conta de quem chama), mas é o que mantém uma fonte só para o
// cálculo — duas implementações da mesma curva divergiriam no dia em que
// uma fosse corrigida.
//
// Tudo numa transação: uma avaliação sem as medidas não serve para nada, e
// é exatamente o que sobraria se o segundo INSERT falhasse sozinho.
const connection = require('../connection');

function erroNegocio(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// Sigla do indicador (a chave do aplicativo) -> id_indicador do catálogo.
// Fica em cache: o catálogo não muda enquanto a API está no ar.
let cacheDeIndicadores = null;

async function mapaDeIndicadores(conn) {
  if (cacheDeIndicadores) return cacheDeIndicadores;

  const [linhas] = await conn.query(
    'SELECT id_indicador, sg_indicador FROM indicador'
  );

  cacheDeIndicadores = new Map(
    linhas.map((linha) => [linha.sg_indicador, linha.id_indicador])
  );

  return cacheDeIndicadores;
}

// Os ids do catálogo de medidas (ver os INSERT em Api/database/schema.sql).
const TIPO_MEDIDA = {
  pesoKg: { id: 1, unidade: 'kg' },
  alturaCm: { id: 2, unidade: 'cm' },
  perimetroCefalicoCm: { id: 3, unidade: 'cm' },
  perimetroBracoCm: { id: 4, unidade: 'cm' },
  pregaTricipitalMm: { id: 5, unidade: 'mm' },
  pregaSubescapularMm: { id: 6, unidade: 'mm' },
};

const numeroOuNulo = (valor) => {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : null;
};

// Entrada:
//   idPaciente, idProfissional
//   data            'AAAA-MM-DD' (o dia da avaliação)
//   idadeDias, idadeMeses, idadeAnos
//   local           nome do local de atendimento (opcional)
//   observacoes     (opcional)
//   medidas         { pesoKg, alturaCm, perimetroCefalicoCm, ... } em números
//   resultados      [{ indicador, medida, zScore, percentil, classificacao,
//                      tom, extremo, interpretacao }]
//
// Saída: { idAvaliacao }
async function inserirAvaliacao(dados) {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    // O paciente precisa ser deste nutricionista. Sem esta checagem,
    // bastaria trocar o número no corpo da requisição para gravar uma
    // avaliação na ficha do paciente de outro profissional.
    const [paciente] = await conn.query(
      'SELECT id_paciente FROM paciente WHERE id_paciente = ? AND id_profissional = ?',
      [dados.idPaciente, dados.idProfissional]
    );

    if (paciente.length === 0) {
      throw erroNegocio(
        'PACIENTE_INVALIDO',
        'Paciente não encontrado para este profissional.'
      );
    }

    const [avaliacaoGravada] = await conn.query(
      `INSERT INTO avaliacao
         (id_paciente, id_profissional, dt_avaliacao, nr_idade_dias,
          nr_idade_meses, nr_idade_anos, nm_local_atendimento,
          tp_avaliacao, ds_observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.idPaciente,
        dados.idProfissional,
        dados.data,
        numeroOuNulo(dados.idadeDias),
        numeroOuNulo(dados.idadeMeses),
        numeroOuNulo(dados.idadeAnos),
        dados.local || null,
        dados.tipo || 'rotina',
        dados.observacoes || null,
      ]
    );

    const idAvaliacao = avaliacaoGravada.insertId;

    // ---------- As medidas ----------
    const medidas = dados.medidas || {};

    const linhasDeMedida = Object.entries(TIPO_MEDIDA)
      .map(([campo, tipo]) => {
        const valor = numeroOuNulo(medidas[campo]);
        if (valor === null || valor <= 0) return null;
        return [idAvaliacao, tipo.id, valor, tipo.unidade];
      })
      .filter(Boolean);

    if (linhasDeMedida.length === 0) {
      throw erroNegocio(
        'SEM_MEDIDAS',
        'Informe ao menos uma medida para gravar a avaliação.'
      );
    }

    await conn.query(
      `INSERT INTO medida_antropometrica
         (id_avaliacao, id_tipo_medida, vl_medida, ds_unidade)
       VALUES ?`,
      [linhasDeMedida]
    );

    // ---------- O que o cálculo leu de cada medida ----------
    //
    // Indicador que não está no catálogo é ignorado, e de propósito: uma
    // chave nova no aplicativo não pode derrubar a gravação da avaliação
    // inteira. Quem notar indicador faltando no histórico acrescenta a
    // linha no catálogo (schema.sql) e as avaliações seguintes já a trazem.
    const indicadores = await mapaDeIndicadores(conn);

    const linhasDeResultado = (dados.resultados || [])
      .map((resultado) => {
        const idIndicador = indicadores.get(resultado.indicador);
        if (!idIndicador) return null;

        return [
          idAvaliacao,
          idIndicador,
          numeroOuNulo(resultado.medida),
          numeroOuNulo(resultado.zScore),
          numeroOuNulo(resultado.percentil),
          resultado.classificacao || null,
          resultado.tom || null,
          resultado.extremo ? 1 : 0,
          resultado.interpretacao || null,
        ];
      })
      .filter(Boolean);

    if (linhasDeResultado.length > 0) {
      await conn.query(
        `INSERT INTO resultado_avaliacao
           (id_avaliacao, id_indicador, vl_observado, vl_escore_z,
            vl_percentil, ds_classificacao, ds_tom, st_valor_extremo,
            ds_interpretacao)
         VALUES ?`,
        [linhasDeResultado]
      );
    }

    await conn.commit();

    return { idAvaliacao };
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

module.exports = { inserirAvaliacao };
