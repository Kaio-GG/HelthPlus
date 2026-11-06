// Todos os e-mails que a API manda, em um lugar só.
//
// Fica separado de servicos/email.js de propósito: ali está COMO enviar
// (o transporte SMTP), aqui está O QUE é enviado. Espalhar o texto dos
// e-mails pelos controllers faz com que cada fluxo novo invente um visual
// e uma assinatura diferentes.
//
// Nenhuma função daqui lança: enviar e-mail é sempre efeito secundário de
// outra operação (cadastrar, redefinir senha), e um provedor de SMTP fora
// do ar não pode derrubar essa operação. Quem chama olha o { enviado }
// para avisar a tela, não para desfazer o que já fez.
const { enviarEmail } = require('./email');

// Validade do código de redefinição de senha. Mora aqui porque o texto do
// e-mail promete esse prazo: se o número mudar num lugar só, o e-mail
// passa a mentir.
const MINUTOS_DE_VALIDADE = 30;

const VERDE_ESCURO = '#204D36';
const VERDE_BOTAO = '#379765';
const VERDE_CLARO = '#E7F5EB';
const TEXTO = '#1F2A24';
const TEXTO_FRACO = '#5B6660';

// Moldura comum de todos os e-mails. O estilo vai escrito em cada tag
// porque cliente de e-mail ignora <style> e folha de estilo externa.
function moldura(titulo, corpo) {
    return `
        <div style="font-family: Arial, Helvetica, sans-serif; color: ${TEXTO}; line-height: 1.6;">
          <h2 style="color: ${VERDE_ESCURO}; margin-bottom: 4px;">${titulo}</h2>
          ${corpo}
        </div>
    `;
}

function botao(link, texto) {
    return `
        <p>
          <a href="${link}"
             style="display: inline-block; background: ${VERDE_BOTAO}; color: #FFFFFF;
                    padding: 12px 20px; border-radius: 14px; text-decoration: none;
                    font-weight: bold;">
            ${texto}
          </a>
        </p>
    `;
}

function destaque(conteudo) {
    return `
        <p style="font-size: 20px; letter-spacing: 2px; font-weight: bold;
                  background: ${VERDE_CLARO}; padding: 12px 16px; border-radius: 14px;
                  display: inline-block;">${conteudo}</p>
    `;
}

function rodape(texto) {
    return `<p style="color: ${TEXTO_FRACO};">${texto}</p>`;
}

// Texto escrito por uma pessoa (um nome, um recado) não entra cru no
// HTML do e-mail: um "<" solto quebraria a mensagem.
function escaparHtml(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// "Olá, Maria?" soa errado; "Olá, tudo bem?" resolve o caso sem nome.
function saudacao(nome) {
    return nome ? `Olá, ${nome}!` : 'Olá, tudo bem?';
}

// ---------------------------------------------------------------
// Redefinição de senha (nutricionista e paciente)
//
// O link usa o esquema "healthplus://", que o aplicativo registra em
// app.json. Alguns celulares (e o Expo Go) não abrem esse tipo de link
// direto do e-mail, então o código também vai escrito: a tela "Verifique
// seu e-mail" aceita o código digitado.
// ---------------------------------------------------------------
function enviarEmailRedefinicaoSenha(para, nome, token) {
    const link = `healthplus://redefinir-senha?token=${token}`;

    const texto = [
        saudacao(nome),
        '',
        'Recebemos um pedido para redefinir a sua senha do Health Plus.',
        '',
        'Abra este link no celular:',
        link,
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

    const html = moldura('Redefinir sua senha', `
        <p>${saudacao(nome)}</p>
        <p>Recebemos um pedido para redefinir a sua senha do Health Plus.</p>
        ${botao(link, 'Criar uma nova senha')}
        <p>Se o botão não abrir o aplicativo, use este código na tela
           <strong>Verifique seu e-mail</strong>:</p>
        ${destaque(token)}
        <p>O código vale por ${MINUTOS_DE_VALIDADE} minutos e só pode ser usado uma vez.</p>
        ${rodape('Se não foi você que pediu, pode ignorar este e-mail: a sua senha continua a mesma.')}
    `);

    return enviarEmail({
        para,
        assunto: 'Redefinir sua senha do Health Plus',
        texto,
        html
    });
}

// O convite de acesso do paciente NÃO mora aqui: ele está em
// servicos/conviteEmail.js, que avisa o paciente de que a senha dele é a
// própria data de nascimento (ver servicos/senhaTemporaria.js). Juntar os
// dois módulos num só é uma arrumação que vale a pena, mas que mexe em
// código de outra pessoa — fica para quando a equipe decidir.

// ---------------------------------------------------------------
// Boas-vindas do nutricionista
//
// Não é verificação de e-mail: a conta já entra liberada. Serve para a
// pessoa ter registro de que o cadastro saiu e com qual e-mail — é por
// ele que ela vai pedir a redefinição de senha um dia.
// ---------------------------------------------------------------
function enviarEmailBoasVindasProfissional(para, nome) {
    const texto = [
        saudacao(nome),
        '',
        'Sua conta no Health Plus está pronta.',
        '',
        `Você entra com este e-mail: ${para}`,
        '',
        'Guarde esta mensagem: é por este endereço que você recebe o código',
        'caso precise redefinir a senha.',
        '',
        'Se não foi você que criou esta conta, responda este e-mail.',
        '',
        'Equipe Health Plus'
    ].join('\n');

    const html = moldura('Bem-vindo ao Health Plus', `
        <p>${saudacao(nome)}</p>
        <p>Sua conta no Health Plus está pronta.</p>
        <p>Você entra com este e-mail:</p>
        ${destaque(para)}
        <p>Guarde esta mensagem: é por este endereço que você recebe o código caso
           precise redefinir a senha.</p>
        ${rodape('Se não foi você que criou esta conta, responda este e-mail.')}
    `);

    return enviarEmail({
        para,
        assunto: 'Bem-vindo ao Health Plus',
        texto,
        html
    });
}

// ---------------------------------------------------------------
// Aviso de senha alterada
//
// Sai DEPOIS de a troca já ter acontecido. É o que permite perceber uma
// troca que não foi a pessoa que fez — sem este aviso, uma senha roubada
// e trocada passa em silêncio.
// ---------------------------------------------------------------
function enviarEmailSenhaAlterada(para, nome) {
    const texto = [
        saudacao(nome),
        '',
        'A senha da sua conta do Health Plus acabou de ser alterada.',
        '',
        'Se foi você, não precisa fazer nada.',
        '',
        'Se não foi, use "Esqueci minha senha" na tela de login agora: isso',
        'cria uma senha nova e derruba a que acabou de ser cadastrada.',
        '',
        'Equipe Health Plus'
    ].join('\n');

    const html = moldura('Sua senha foi alterada', `
        <p>${saudacao(nome)}</p>
        <p>A senha da sua conta do Health Plus acabou de ser alterada.</p>
        <p>Se foi você, não precisa fazer nada.</p>
        <p>Se não foi, use <strong>Esqueci minha senha</strong> na tela de login
           agora: isso cria uma senha nova e derruba a que acabou de ser cadastrada.</p>
    `);

    return enviarEmail({
        para,
        assunto: 'Sua senha do Health Plus foi alterada',
        texto,
        html
    });
}

// ---------------------------------------------------------------
// Aviso do sino, por e-mail
//
// Só sai quando o profissional ligou "Avisos por e-mail" nas preferências
// (preferencia_notificacao.st_email). O padrão é desligado.
// ---------------------------------------------------------------
function enviarEmailNotificacao(para, nome, { titulo, mensagem }) {
    const texto = [
        saudacao(nome),
        '',
        titulo,
        mensagem || '',
        '',
        'Abra o Health Plus para ver os detalhes.',
        '',
        'Para parar de receber estes avisos por e-mail, desligue "Avisos por',
        'e-mail" em Perfil > Preferências de notificação.',
        '',
        'Equipe Health Plus'
    ].join('\n');

    const html = moldura(titulo, `
        <p>${saudacao(nome)}</p>
        ${mensagem ? `<p>${mensagem}</p>` : ''}
        <p>Abra o Health Plus para ver os detalhes.</p>
        ${rodape('Para parar de receber estes avisos por e-mail, desligue "Avisos por e-mail" em Perfil &gt; Preferências de notificação.')}
    `);

    return enviarEmail({
        para,
        assunto: `Health Plus: ${titulo}`,
        texto,
        html
    });
}

// ---------------------------------------------------------------
// Convite para testar o aplicativo
//
// O Health Plus ainda não está na Play Store: quem vai testar precisa do
// endereço de instalação (o link do Expo Go, ou o APK). Esse endereço
// muda a cada rodada de teste, então vem do .env (LINK_TESTE_APP) — não
// escrito aqui.
//
// Quem convida escreve o próprio recado, que entra no e-mail como texto
// simples (escapado): é conteúdo de usuário dentro do nosso HTML.
// ---------------------------------------------------------------
function enviarEmailConviteTeste(para, { nomeQuemConvida, link, recado }) {
    const convidadoPor = nomeQuemConvida
        ? `${nomeQuemConvida} está te convidando`
        : 'Você está sendo convidado';

    const texto = [
        'Olá, tudo bem?',
        '',
        `${convidadoPor} para testar o Health Plus, um aplicativo de`,
        'acompanhamento nutricional.',
        '',
        recado ? `Recado de quem convidou: "${recado}"` : '',
        recado ? '' : '',
        'Para instalar, abra este link no celular:',
        link,
        '',
        'O aplicativo está em fase de testes e ainda não está nas lojas.',
        'Qualquer problema que você encontrar é exatamente o que queremos',
        'saber: responda este e-mail contando.',
        '',
        'Equipe Health Plus'
    ].filter((linha, indice, todas) => !(linha === '' && todas[indice - 1] === '')).join('\n');

    const html = moldura('Teste o Health Plus', `
        <p>Olá, tudo bem?</p>
        <p>${escaparHtml(convidadoPor)} para testar o <strong>Health Plus</strong>,
           um aplicativo de acompanhamento nutricional.</p>
        ${recado ? `<p style="border-left: 3px solid ${VERDE_BOTAO}; padding-left: 12px;">${escaparHtml(recado)}</p>` : ''}
        ${botao(link, 'Instalar o aplicativo')}
        <p>Se o botão não abrir, copie este endereço no navegador do celular:<br />
           <span style="font-family: monospace;">${escaparHtml(link)}</span></p>
        ${rodape('O aplicativo está em fase de testes e ainda não está nas lojas. Qualquer problema que você encontrar é o que queremos saber: responda este e-mail contando.')}
    `);

    return enviarEmail({
        para,
        assunto: 'Convite para testar o Health Plus',
        texto,
        html
    });
}

module.exports = {
    MINUTOS_DE_VALIDADE,
    enviarEmailRedefinicaoSenha,
    enviarEmailBoasVindasProfissional,
    enviarEmailSenhaAlterada,
    enviarEmailNotificacao,
    enviarEmailConviteTeste
};
