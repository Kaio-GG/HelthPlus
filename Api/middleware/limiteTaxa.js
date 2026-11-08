// Api/middleware/limiteTaxa.js
// Limite de tentativas por IP (e, quando faz sentido, por e-mail).
//
// Sem isto, a senha provisória do paciente (8 dígitos de uma data) caía por
// força bruta em minutos, e "Esqueci minha senha" virava ferramenta para
// lotar a caixa de alguém. É o equivalente do express-rate-limit, sem
// dependência nova.
//
// Os contadores ficam na memória do processo: reiniciar a API zera tudo, e
// com mais de uma instância cada uma conta sozinha. Para um servidor só,
// que é o caso do projeto, resolve. Com várias instâncias, troque o Map
// por um Redis.
const { registrarAuditoria } = require('../servicos/auditoria');

const baldes = new Map();

// Limpa as janelas vencidas de tempos em tempos, para o Map não crescer.
setInterval(() => {
  const agora = Date.now();
  for (const [chave, balde] of baldes) {
    if (balde.fim <= agora) baldes.delete(chave);
  }
}, 60 * 1000).unref();

// Conta uma tentativa na chave. Devolve { bloqueado, restanteSegundos }.
function contar(chave, maximo, janelaMs) {
  const agora = Date.now();
  let balde = baldes.get(chave);

  if (!balde || balde.fim <= agora) {
    balde = { total: 0, fim: agora + janelaMs };
    baldes.set(chave, balde);
  }

  balde.total += 1;

  return {
    bloqueado: balde.total > maximo,
    restanteSegundos: Math.ceil((balde.fim - agora) / 1000),
  };
}

// Cria um middleware.
//   nome       identifica o limite no log ("login", "esqueci"...)
//   maximo     quantas requisições na janela
//   minutos    tamanho da janela
//   porCorpo   nome de um campo do corpo (ex.: 'email') para limitar também
//              por ele, além do IP — senão um ataque distribuído em muitos
//              IPs contra a mesma conta passaria
function limitar({ nome, maximo, minutos, porCorpo }) {
  const janelaMs = minutos * 60 * 1000;

  return (req, res, next) => {
    const chaves = [`${nome}:ip:${req.ip}`];

    if (porCorpo && req.body && req.body[porCorpo]) {
      chaves.push(`${nome}:${porCorpo}:${String(req.body[porCorpo]).trim().toLowerCase()}`);
    }

    let pior = { bloqueado: false, restanteSegundos: 0 };

    for (const chave of chaves) {
      const resultado = contar(chave, maximo, janelaMs);
      if (resultado.bloqueado) pior = resultado;
    }

    if (!pior.bloqueado) return next();

    res.setHeader('Retry-After', String(pior.restanteSegundos));

    registrarAuditoria(req, {
      acao: 'seguranca.limite_excedido',
      sucesso: false,
      detalhe: { limite: nome },
    });

    return res.status(429).json({
      mensagem: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
    });
  };
}

// Limites usados nas rotas. Num lugar só para ficar fácil de ajustar.
const limites = {
  geral: limitar({ nome: 'geral', maximo: 300, minutos: 1 }),
  login: limitar({ nome: 'login', maximo: 10, minutos: 15, porCorpo: 'email' }),
  cadastro: limitar({ nome: 'cadastro', maximo: 5, minutos: 60 }),
  esqueciSenha: limitar({ nome: 'esqueci', maximo: 5, minutos: 15, porCorpo: 'email' }),
  redefinirSenha: limitar({ nome: 'redefinir', maximo: 10, minutos: 15 }),
  trocaSenha: limitar({ nome: 'troca_senha', maximo: 10, minutos: 15 }),
  primeiroAcesso: limitar({ nome: 'primeiro_acesso', maximo: 10, minutos: 15 }),
  envioEmail: limitar({ nome: 'envio_email', maximo: 10, minutos: 60 }),
  exportacao: limitar({ nome: 'exportacao', maximo: 20, minutos: 60 }),
};

module.exports = { limitar, limites };
