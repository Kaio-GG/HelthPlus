// Api/servicos/senhaTemporaria.js
// A senha provisória com que o paciente entra no aplicativo pela primeira vez.
//
// É a DATA DE NASCIMENTO dele, em OITO DÍGITOS e nada mais: DDMMAAAA.
// "12/03/2001" vira "12032001". Sem barras, sem traços, sem espaços.
//
// A regra é só-dígitos de propósito. Uma senha que aceita várias formas de
// escrever obriga o nutricionista a explicar qual delas vale, e é a pergunta
// que mais aparecia na consulta. Oito números é uma instrução só, que cabe
// numa frase e não tem versão alternativa.
//
// Foi uma decisão de produto: assim o nutricionista cadastra o paciente e já
// libera o acesso ali na consulta, sem depender de o e-mail chegar e sem
// tela de primeiro acesso.
//
// Em troca, a senha é previsível para quem souber a data de nascimento do
// paciente. É por isso que:
//   - ela continua guardada em HASH (bcrypt), nunca em texto;
//   - a conta vira 'ativo' no primeiro login, e o aplicativo oferece a
//     troca de senha em Perfil > Alterar senha;
//   - a senha trocada pelo paciente é uma senha forte de verdade
//     (as regras de senhaStorage.js valem para ela).
const crypto = require('crypto');

// Qualquer coisa que o MySQL devolva em dt_nascimento (Date ou texto ISO)
// vira 'DDMMAAAA'. Devolve null quando a data não serve.
function senhaDaDataNascimento(dataNascimento) {
  if (!dataNascimento) return null;

  // O driver do MySQL entrega DATE como objeto Date; o cadastro manda
  // texto ISO ('2015-03-12').
  //
  // O Date é lido pelas partes LOCAIS, e não por toISOString(): a coluna
  // é DATE (sem hora), e o driver a devolve como meia-noite no fuso da
  // máquina. Num fuso a leste de Greenwich, essa meia-noite em UTC cai no
  // DIA ANTERIOR — e a senha de quem nasceu dia 12 passaria a ser a do
  // dia 11. No Brasil (UTC-3) o erro não aparece, o que é pior: ele só
  // surgiria num servidor em outro fuso.
  let texto;

  if (dataNascimento instanceof Date) {
    if (Number.isNaN(dataNascimento.getTime())) return null;

    const ano = dataNascimento.getFullYear();
    const mes = String(dataNascimento.getMonth() + 1).padStart(2, '0');
    const dia = String(dataNascimento.getDate()).padStart(2, '0');

    texto = `${ano}-${mes}-${dia}`;
  } else {
    texto = String(dataNascimento).slice(0, 10);
  }

  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!partes) return null;

  const [, ano, mes, dia] = partes;
  return `${dia}${mes}${ano}`;
}

// O texto digitado é uma data de nascimento no formato aceito?
//
// Oito dígitos e NADA além disso. Antes esta função limpava as barras e
// os traços antes de comparar, o que fazia "12/03/2001" valer a mesma
// senha — exatamente a ambiguidade que a regra de só-dígitos removeu.
//
// Devolve o próprio texto quando ele serve, ou null. O null é o que diz ao
// autenticarPaciente() que aquilo não é uma data, e sim uma senha que o
// paciente escolheu.
function aceitarDataDeNascimento(senhaDigitada) {
  const texto = String(senhaDigitada ?? '');
  return /^\d{8}$/.test(texto) ? texto : null;
}

// Senha aleatória. Não é mais usada no convite do paciente, mas fica para
// quem precisar de uma senha de uso único (um script de manutenção, por
// exemplo). Evita 0/O e 1/l/I, que se confundem na leitura.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function gerarSenhaTemporaria(tamanho = 10) {
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += ALFABETO[crypto.randomInt(ALFABETO.length)];
  }
  return senha;
}

module.exports = {
  senhaDaDataNascimento,
  aceitarDataDeNascimento,
  gerarSenhaTemporaria,
};
