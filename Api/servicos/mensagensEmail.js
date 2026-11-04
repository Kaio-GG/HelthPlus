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

// "Olá, Maria?" soa errado; "Olá, tudo bem?" resolve o caso sem nome.
function saudacao(nome) {
    return nome ? `Olá, ${nome}?` : 'Olá, tudo bem?';
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

// ---------------------------------------------------------------
// Convite de acesso do paciente
//
// A senha provisória do paciente é a data de nascimento dele (quem a
// grava é pacienteRepository.inserirPaciente). O e-mail diz o FORMATO,
// não o valor: assim a mensagem não carrega uma senha, e o paciente, que
// sabe a própria data, não precisa dela escrita.
// ---------------------------------------------------------------
function enviarEmailConvitePaciente(para, nome) {
    const texto = [
        saudacao(nome),
        '',
        'Seu nutricionista criou um acesso para você no Health Plus, o',
        'aplicativo onde você acompanha o seu plano alimentar.',
        '',
        'Para entrar:',
        '',
        '1. Abra o Health Plus e escolha "Sou paciente".',
        `2. E-mail: ${para}`,
        '3. Senha: a sua data de nascimento, só os números, no formato',
        '   DDMMAAAA (quem nasceu em 7 de março de 1990 digita 07031990).',
        '',
        'No primeiro acesso o aplicativo pede uma senha nova, sua, e a',
        'confirmação dos Termos de Uso e da Política de Privacidade.',
        '',
        'Se você não esperava este convite, fale com o seu nutricionista.',
        '',
        'Equipe Health Plus'
    ].join('\n');

    const html = moldura('Seu acesso ao Health Plus', `
        <p>${saudacao(nome)}</p>
        <p>Seu nutricionista criou um acesso para você no <strong>Health Plus</strong>,
           o aplicativo onde você acompanha o seu plano alimentar.</p>
        <p>Para entrar, abra o aplicativo, escolha <strong>Sou paciente</strong> e use:</p>
        <p><strong>E-mail:</strong> ${para}<br>
           <strong>Senha:</strong> a sua data de nascimento, só os números, no
           formato DDMMAAAA — quem nasceu em 7 de março de 1990 digita
           <strong>07031990</strong>.</p>
        <p>No primeiro acesso o aplicativo pede uma senha nova, sua, e a confirmação
           dos Termos de Uso e da Política de Privacidade.</p>
        ${rodape('Se você não esperava este convite, fale com o seu nutricionista.')}
    `);

    return enviarEmail({
        para,
        assunto: 'Seu acesso ao Health Plus',
        texto,
        html
    });
}

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

module.exports = {
    MINUTOS_DE_VALIDADE,
    enviarEmailRedefinicaoSenha,
    enviarEmailConvitePaciente,
    enviarEmailBoasVindasProfissional,
    enviarEmailSenhaAlterada,
    enviarEmailNotificacao
};
