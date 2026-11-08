// Api/testes/seguranca.test.js
// Testes que NÃO precisam do MySQL: validações, limite de tentativas,
// cabeçalhos de segurança e a corrente de hashes da auditoria.
//
//   cd Api
//   npm test
//
// As rotas que leem o banco não são exercitadas aqui; para elas, siga o
// roteiro "Como testar a segurança" do README.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'teste-'.padEnd(48, 'x');
process.env.CORS_ORIGENS = 'http://localhost:8081';

const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const express = require('express');

const {
  problemasDaSenha,
  nascimentoValido,
  dataISOValida,
  calcularIdade,
  emailValido,
  textoOpcional,
} = require('../utilitarios/validacao');
const { crnValido, normalizarCrn } = require('../utilitarios/crn');
const { senhaDaDataNascimento } = require('../servicos/senhaTemporaria');
const { calcularHash, camposParaHash, HASH_INICIAL } = require('../servicos/auditoria');
const { limitar } = require('../middleware/limiteTaxa');
const { emitirToken } = require('../servicos/sessao');

// Sobe o app numa porta livre e devolve uma função de requisição.
function servir(app) {
  return new Promise((resolve) => {
    const servidor = http.createServer(app).listen(0, '127.0.0.1', () => {
      const { port } = servidor.address();

      const pedir = (caminho, { metodo = 'GET', corpo, cabecalhos = {} } = {}) =>
        new Promise((ok, falha) => {
          const req = http.request(
            { host: '127.0.0.1', port, path: caminho, method: metodo, headers: cabecalhos },
            (res) => {
              let dados = '';
              res.on('data', (parte) => (dados += parte));
              res.on('end', () => {
                let json = null;
                try {
                  json = JSON.parse(dados);
                } catch {
                  json = null;
                }
                ok({ status: res.statusCode, cabecalhos: res.headers, json });
              });
            }
          );
          req.on('error', falha);
          if (corpo !== undefined) req.write(corpo);
          req.end();
        });

      resolve({ pedir, fechar: () => servidor.close() });
    });
  });
}

// ---------------------------------------------------------------------
// Validações
// ---------------------------------------------------------------------

test('senha fraca é recusada e forte é aceita', () => {
  assert.ok(problemasDaSenha('12345678').length > 0);
  assert.ok(problemasDaSenha('abcdefgh').length > 0);
  assert.ok(problemasDaSenha(undefined).length > 0);
  assert.deepStrictEqual(problemasDaSenha('Senha@2026'), []);
});

test('data de nascimento: recusa futuro, data inexistente e formato errado', () => {
  assert.strictEqual(dataISOValida('2026-02-30'), false);
  assert.strictEqual(dataISOValida('12/03/2001'), false);
  assert.strictEqual(nascimentoValido('2999-01-01'), false);
  assert.strictEqual(nascimentoValido('1850-01-01'), false);
  assert.strictEqual(nascimentoValido('2015-03-12'), true);
});

test('idade é calculada pelo aniversário', () => {
  const hoje = new Date();
  const ano = hoje.getFullYear() - 10;
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  assert.strictEqual(calcularIdade(`${ano}-${mes}-${dia}`), 10);
});

test('e-mail e texto opcional', () => {
  assert.ok(emailValido('maria@exemplo.com.br'));
  assert.ok(!emailValido('maria@'));
  assert.strictEqual(textoOpcional('   ', 10), null);
  assert.strictEqual(textoOpcional('abcdefghijk', 5), 'abcde');
});

test('CRN é normalizado e validado', () => {
  assert.ok(crnValido('crn3/12345'));
  assert.ok(!crnValido('12345'));
  assert.strictEqual(normalizarCrn('crn 3 12345'), 'CRN-3 12345');
});

test('senha provisória continua sendo DDMMAAAA', () => {
  assert.strictEqual(senhaDaDataNascimento('2001-03-12'), '12032001');
});

// ---------------------------------------------------------------------
// Auditoria
// ---------------------------------------------------------------------

test('corrente de hashes: mudar qualquer campo muda o hash', () => {
  const linha = {
    dt_evento: '2026-11-07 12:00:00.000',
    tp_ator: 'profissional',
    id_ator: 4,
    ds_acao: 'paciente.ficha.ler',
    ds_recurso: 'paciente',
    id_recurso: 17,
    id_paciente_alvo: 17,
    st_sucesso: 1,
    ds_ip: '192.168.0.10',
    ds_dispositivo: 'okhttp',
    ds_id_requisicao: null,
    ds_detalhe: null,
  };

  const original = calcularHash(HASH_INICIAL, camposParaHash(linha));
  const adulterada = calcularHash(HASH_INICIAL, camposParaHash({ ...linha, id_paciente_alvo: 18 }));
  const outraCorrente = calcularHash('a'.repeat(64), camposParaHash(linha));

  assert.match(original, /^[0-9a-f]{64}$/);
  assert.notStrictEqual(original, adulterada);
  assert.notStrictEqual(original, outraCorrente);
  assert.strictEqual(original, calcularHash(HASH_INICIAL, camposParaHash({ ...linha })));
});

// ---------------------------------------------------------------------
// Limite de tentativas
// ---------------------------------------------------------------------

test('limite por IP devolve 429 depois do máximo', async () => {
  const app = express();
  app.use(express.json());
  app.post('/x', limitar({ nome: 'teste_ip', maximo: 3, minutos: 1 }), (req, res) => res.json({ ok: true }));

  const { pedir, fechar } = await servir(app);

  try {
    const respostas = [];
    for (let i = 0; i < 4; i++) {
      respostas.push(await pedir('/x', { metodo: 'POST' }));
    }

    assert.deepStrictEqual(respostas.map((r) => r.status), [200, 200, 200, 429]);
    assert.ok(Number(respostas[3].cabecalhos['retry-after']) > 0);
  } finally {
    fechar();
  }
});

test('limite por e-mail não é contornado mudando maiúsculas', async () => {
  const app = express();
  app.use(express.json());
  app.post('/x', limitar({ nome: 'teste_email', maximo: 2, minutos: 1, porCorpo: 'email' }), (req, res) =>
    res.json({ ok: true })
  );

  const { pedir, fechar } = await servir(app);
  const json = { 'Content-Type': 'application/json' };

  try {
    const a = await pedir('/x', { metodo: 'POST', corpo: '{"email":"ana@x.com"}', cabecalhos: json });
    const b = await pedir('/x', { metodo: 'POST', corpo: '{"email":" ANA@X.COM "}', cabecalhos: json });
    const c = await pedir('/x', { metodo: 'POST', corpo: '{"email":"Ana@x.com"}', cabecalhos: json });
    assert.deepStrictEqual([a.status, b.status, c.status], [200, 200, 429]);
  } finally {
    fechar();
  }
});

// ---------------------------------------------------------------------
// O app de verdade: cabeçalhos, CORS, erros e autenticação
// ---------------------------------------------------------------------

test('API real: cabeçalhos, 404 em JSON, JSON malformado e rotas protegidas', async () => {
  const app = require('../server');
  const { pedir, fechar } = await servir(app);

  try {
    const raiz = await pedir('/');
    assert.strictEqual(raiz.status, 200);
    assert.strictEqual(raiz.cabecalhos['x-content-type-options'], 'nosniff');
    assert.strictEqual(raiz.cabecalhos['x-frame-options'], 'DENY');
    assert.strictEqual(raiz.cabecalhos['cache-control'], 'no-store');
    assert.strictEqual(raiz.cabecalhos['x-powered-by'], undefined);

    const inexistente = await pedir('/api/nao-existe');
    assert.strictEqual(inexistente.status, 404);
    assert.ok(inexistente.json?.mensagem);

    const malformado = await pedir('/api/profissional/login', {
      metodo: 'POST',
      corpo: '{"email": ',
      cabecalhos: { 'Content-Type': 'application/json' },
    });
    assert.strictEqual(malformado.status, 400);

    // Sem token: 401 em todas as rotas de dado.
    for (const caminho of [
      '/api/paciente',
      '/api/paciente/1',
      '/api/paciente/minha-evolucao',
      '/api/lgpd/paciente/meus-dados',
      '/api/lgpd/profissional/atividade',
      '/api/consulta',
    ]) {
      const r = await pedir(caminho);
      assert.strictEqual(r.status, 401, caminho);
    }

    // A troca de senha antiga, por id na URL, não aceita mais requisição sem token.
    const senhaSemToken = await pedir('/api/senha/1', {
      metodo: 'PUT',
      corpo: '{"senhaAtual":"x","novaSenha":"Senha@2026"}',
      cabecalhos: { 'Content-Type': 'application/json' },
    });
    assert.strictEqual(senhaSemToken.status, 401);

    // Token de primeiro acesso não lê dado de saúde.
    const tokenPrimeiroAcesso = emitirToken('paciente_primeiro_acesso', 1, 0, '5m');
    const comPrimeiroAcesso = await pedir('/api/paciente/minha-evolucao', {
      cabecalhos: { Authorization: `Bearer ${tokenPrimeiroAcesso}` },
    });
    assert.strictEqual(comPrimeiroAcesso.status, 403);

    // Token de paciente não abre rota de nutricionista.
    const tokenPaciente = emitirToken('paciente', 1, 0);
    const pacienteNaRotaDoNutri = await pedir('/api/paciente', {
      cabecalhos: { Authorization: `Bearer ${tokenPaciente}` },
    });
    assert.strictEqual(pacienteNaRotaDoNutri.status, 403);

    // Token assinado com outro segredo é recusado.
    const jwt = require('jsonwebtoken');
    const forjado = jwt.sign({ tipo: 'profissional', id_profissional: 1 }, 'outro-segredo');
    const comForjado = await pedir('/api/paciente', { cabecalhos: { Authorization: `Bearer ${forjado}` } });
    assert.strictEqual(comForjado.status, 401);

    // Token "alg: none" é recusado.
    const semAssinatura =
      Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url') +
      '.' +
      Buffer.from('{"tipo":"profissional","id_profissional":1}').toString('base64url') +
      '.';
    const comNone = await pedir('/api/paciente', { cabecalhos: { Authorization: `Bearer ${semAssinatura}` } });
    assert.strictEqual(comNone.status, 401);

    // CORS: origem fora da lista não recebe Allow-Origin.
    const site = await pedir('/', { cabecalhos: { Origin: 'https://site-malicioso.com' } });
    assert.strictEqual(site.cabecalhos['access-control-allow-origin'], undefined);

    const expoWeb = await pedir('/', { cabecalhos: { Origin: 'http://localhost:8081' } });
    assert.strictEqual(expoWeb.cabecalhos['access-control-allow-origin'], 'http://localhost:8081');

    // As rotas de plano alimentar saíram do ar.
    const plano = await pedir('/api/plano/profissional/1');
    assert.strictEqual(plano.status, 404);
  } finally {
    fechar();
    require('../connection').end().catch(() => {});
  }
});
