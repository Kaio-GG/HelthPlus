// Api/servicos/conviteEmail.js
// Texto do e-mail de convite do paciente.
// Quem envia de verdade é o serviço de e-mail que já existe no projeto.
//
// >>> AJUSTE ESTA LINHA para o caminho real do seu serviço de e-mail <<<
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
async function enviarConvitePaciente({ para, nomePaciente, nomeProfissional, senhaTemporaria }) {
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
    `Senha provisória: ${senhaTemporaria}`,
    '',
    'No primeiro acesso você vai criar a sua própria senha e aceitar os',
    'Termos de Uso e a Política de Privacidade.',
    '',
    'Se você não esperava este e-mail, pode ignorá-lo.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f3b2c; max-width: 480px;">
      <h2 style="color: #3f7d58;">Bem-vindo ao HealthPlus</h2>
      <p>Olá, <strong>${escaparHtml(primeiroNome)}</strong>!</p>
      <p>${escaparHtml(quemCadastrou)} cadastrou você no HealthPlus.
         Para entrar no aplicativo, use:</p>
      <p style="background: #eef6ee; padding: 12px 16px; border-radius: 8px;">
        <strong>E-mail:</strong> ${escaparHtml(para)}<br />
        <strong>Senha provisória:</strong>
        <span style="font-family: monospace; font-size: 18px;">${escaparHtml(senhaTemporaria)}</span>
      </p>
      <p>No primeiro acesso você vai criar a sua própria senha e aceitar os
         Termos de Uso e a Política de Privacidade.</p>
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