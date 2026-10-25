// Monta e envia o e-mail de redefinição de senha.
//
// O link usa o esquema "healthplus://", que o aplicativo registra em
// app.json. Alguns celulares (e o Expo Go) não abrem esse tipo de link
// direto do e-mail, então o código também vai escrito: a tela "Verifique
// seu e-mail" aceita o código digitado.
const { enviarEmail } = require('./email');

const MINUTOS_DE_VALIDADE = 30;

function montarTexto(nome, token) {
    return [
        `Olá, ${nome || 'tudo bem'}?`,
        '',
        'Recebemos um pedido para redefinir a sua senha do Health Plus.',
        '',
        'Abra este link no celular:',
        `healthplus://redefinir-senha?token=${token}`,
        '',
        'Se o link não abrir, use este código no aplicativo, na tela',
        '"Verifique seu e-mail":',
        '',
        `    ${token}`,
        '',
        `O código vale por ${MINUTOS_DE_VALIDADE} minutos e só pode ser usado uma vez.`,
        '',
        'Se não foi você que pediu, pode ignorar este e-mail: a sua senha',
        'continua a mesma.',
        '',
        'Equipe Health Plus'
    ].join('\n');
}

function montarHtml(nome, token) {
    return `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #1F2A24; line-height: 1.6;">
          <h2 style="color: #204D36; margin-bottom: 4px;">Redefinir sua senha</h2>
          <p>Olá, ${nome || 'tudo bem'}?</p>
          <p>Recebemos um pedido para redefinir a sua senha do Health Plus.</p>
          <p>
            <a href="healthplus://redefinir-senha?token=${token}"
               style="display: inline-block; background: #379765; color: #FFFFFF;
                      padding: 12px 20px; border-radius: 14px; text-decoration: none;
                      font-weight: bold;">
              Criar uma nova senha
            </a>
          </p>
          <p>Se o botão não abrir o aplicativo, use este código na tela
             <strong>Verifique seu e-mail</strong>:</p>
          <p style="font-size: 20px; letter-spacing: 2px; font-weight: bold;
                    background: #E7F5EB; padding: 12px 16px; border-radius: 14px;
                    display: inline-block;">${token}</p>
          <p>O código vale por ${MINUTOS_DE_VALIDADE} minutos e só pode ser usado uma vez.</p>
          <p style="color: #5B6660;">Se não foi você que pediu, pode ignorar este
             e-mail: a sua senha continua a mesma.</p>
        </div>
    `;
}

async function enviarEmailRedefinicaoSenha(para, nome, token) {
    return enviarEmail({
        para,
        assunto: 'Redefinir sua senha do Health Plus',
        texto: montarTexto(nome, token),
        html: montarHtml(nome, token)
    });
}

module.exports = {
    enviarEmailRedefinicaoSenha,
    MINUTOS_DE_VALIDADE
};
