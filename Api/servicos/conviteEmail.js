// Api/servicos/conviteEmail.js
// Texto do e-mail que avisa o paciente de que ele já tem acesso ao app.
// Quem envia de verdade é o serviço de e-mail que já existe no projeto.
//
// A senha provisória é a DATA DE NASCIMENTO do paciente (DDMMAAAA) — ver
// servicos/senhaTemporaria.js. O e-mail não repete a data por escrito de
// propósito: ela já é um dado pessoal, e a mensagem só precisa dizer QUAL
// é a senha, não qual é a data de nascimento de quem a recebe.
const { enviarEmail } = require('./email');

// Evita que um nome com "<" ou "&" quebre o HTML do e-mail.
function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Devolve o mesmo que o enviarEmail: { enviado: true } ou { enviado: false, erro? }
async function enviarConvitePaciente({ para, nomePaciente, nomeProfissional }) {
  const primeiroNome = String(nomePaciente || '').trim().split(' ')[0] || 'paciente';
  const quemCadastrou = nomeProfissional
    ? `Seu nutricionista, ${nomeProfissional},`
    : 'Seu nutricionista';

  const texto = [
    `Olá, ${primeiroNome}!`,
    '',
    `${quemCadastrou} cadastrou você no HealthPlus.`,
    'Para entrar no aplicativo, use:',
    '',
    `E-mail: ${para}`,
    'Senha: a sua data de nascimento, só os números (DDMMAAAA)',
    '',
    'São oito números, sem barras: quem nasceu em 12 de março de 2001',
    'digita 12032001.',
    '',
    'Já dentro do aplicativo, se quiser trocar essa senha por uma só sua,',
    'é em Perfil > Alterar senha.',
    '',
    'Se você não esperava este e-mail, pode ignorá-lo.',
    '',
    'Equipe Health Plus',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f3b2c; max-width: 480px;">
      <h2 style="color: #3f7d58;">Bem-vindo ao HealthPlus</h2>
      <p>Olá, <strong>${escaparHtml(primeiroNome)}</strong>!</p>
      <p>${escaparHtml(quemCadastrou)} cadastrou você no HealthPlus.
         Para entrar no aplicativo, use:</p>
      <p style="background: #eef6ee; padding: 12px 16px; border-radius: 8px;">
        <strong>E-mail:</strong> ${escaparHtml(para)}<br />
        <strong>Senha:</strong> a sua data de nascimento, s&oacute; os n&uacute;meros (DDMMAAAA)
      </p>
      <p>S&atilde;o oito n&uacute;meros, sem barras: quem nasceu em 12 de mar&ccedil;o
         de 2001 digita <strong>12032001</strong>.</p>
      <p>J&aacute; dentro do aplicativo, se quiser trocar essa senha por uma
         s&oacute; sua, &eacute; em <strong>Perfil &gt; Alterar senha</strong>.</p>
      <p style="color: #6b7f72; font-size: 13px;">
        Se você não esperava este e-mail, pode ignorá-lo.
      </p>
    </div>`;

  return enviarEmail({
    para,
    assunto: 'Seu acesso ao HealthPlus',
    texto,
    html,
  });
}

module.exports = { enviarConvitePaciente };
