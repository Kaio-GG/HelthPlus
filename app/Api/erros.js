// app/Api/erros.js
// A mensagem de erro de TODA chamada de API, num lugar só.
//
// Por que este arquivo existe: cada cliente em app/Api/ tinha a sua própria
// cópia deste tratamento, com textos diferentes — e dois deles
// (loginCadastro.js e notificacoes.js) não distinguiam "a API recusou" de
// "a API não respondeu". Os dois casos caíam no mesmo texto genérico.
//
// Isso custou uma tarde em 7/11/2026. O roteador trocou o IP da máquina de
// .104 para .101, o celular passou a falar com um endereço que não existia,
// e a tela dizia só "Não foi possível realizar o login" — que parece senha
// errada e não é. A mensagem certa teria apontado o problema na hora.
//
// A regra: a mensagem tem de dizer QUAL dos três casos é.
//
//   1. Não houve resposta   -> rede, IP ou API desligada. Diz o endereço
//                              tentado, porque é nele que está o erro.
//   2. A API respondeu 4xx  -> a mensagem é da API e serve ao usuário
//                              ("E-mail ou senha inválidos"). Passa direto.
//   3. A API respondeu 5xx  -> defeito, não erro do usuário. Manda olhar o
//                              terminal da API, onde está o stack.
// A extensão vai explícita de propósito: o Metro dispensa, mas o Node puro
// exige, e com ela este módulo pode ser exercitado por um script de teste
// fora do bundler — que é como os quatro casos abaixo foram verificados.
import api from './connection.js';

const enderecoDaApi = () => api.defaults.baseURL || '(endereço não configurado)';

// Devolve a frase a mostrar na tela. "contexto" é o que falhou, em palavras
// do projeto: 'Não foi possível agendar a consulta'.
export function mensagemDeErro(erro, contexto = 'A operação falhou') {
  // CASO 1 — nenhuma resposta chegou.
  //
  // O axios não preenche "response" quando a requisição não completou.
  // É o caso de API desligada, IP errado no app/.env, celular em outra
  // rede, ou Firewall barrando.
  if (!erro.response) {
    const base = enderecoDaApi();

    // Estourou o timeout de 10s do connection.js: alguém escutou, mas não
    // respondeu em tempo. Costuma ser a API travada ou o banco fora do ar.
    if (erro.code === 'ECONNABORTED' || /timeout/i.test(erro.message || '')) {
      return (
        `A API em ${base} não respondeu em 10 segundos.\n\n` +
        'Ela pode estar travada, ou o MySQL estar fora do ar. ' +
        'Olhe o terminal da API.'
      );
    }

    return (
      `Sem resposta da API em ${base}.\n\n` +
      'Confira, nesta ordem: a API está rodando ("npm run dev" dentro de ' +
      'Api/)? Esse endereço é o IP atual deste computador? O celular está ' +
      'na mesma rede?'
    );
  }

  const { status, data } = erro.response;
  const daApi = data?.mensagem || data?.message;

  // CASO 3 — defeito do servidor. A mensagem da API aqui é genérica
  // ("Erro interno ao..."), então acrescenta onde está o detalhe.
  if (status >= 500) {
    return (
      (daApi || contexto) +
      `\n\n(HTTP ${status} — o erro completo está no terminal da API.)`
    );
  }

  // CASO 2 — a API recusou e explicou. O texto dela é escrito para o
  // usuário; passa sem enfeite.
  if (daApi) return daApi;

  // Respondeu 4xx sem corpo: raro, mas o status já ajuda a identificar.
  return `${contexto} (HTTP ${status}).`;
}

// Mesma coisa, já embalada num Error — é a forma que a maioria dos
// clientes usa (`throw erroDaApi(erro, '...')`).
export function erroDaApi(erro, contexto) {
  return new Error(mensagemDeErro(erro, contexto));
}
