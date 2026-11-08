// Envio de e-mail da API.
//
// Enquanto não houver SMTP configurado no .env, o e-mail NÃO é enviado: ele
// é impresso no terminal da API. Isso deixa o fluxo inteiro testável sem
// conta de envio, e no dia em que as variáveis SMTP_* forem preenchidas o
// envio passa a valer sem mudar uma linha de código.
const nodemailer = require('nodemailer');

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_REMETENTE
} = process.env;

const smtpConfigurado = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);

// Um transporte só, criado na primeira vez que for preciso.
let transporte = null;

function obterTransporte() {
    if (!transporte) {
        transporte = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            // 465 é a porta de SSL direto; as outras usam STARTTLS.
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD
            }
        });
    }

    return transporte;
}

// Imprime o e-mail no terminal, no lugar de enviar.
//
// Só em DESENVOLVIMENTO. O corpo do e-mail leva código de redefinição de
// senha, e em produção o terminal vira arquivo de log — que raramente tem
// o mesmo controle de acesso do banco. Lá, só o aviso de que não saiu.
function mostrarNoTerminal({ para, assunto, texto }) {
    if (process.env.NODE_ENV === 'production') {
        console.warn(`[email] Não enviado (SMTP não configurado ou falhou): "${assunto}".`);
        return;
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('E-MAIL NAO ENVIADO (SMTP nao configurado no Api/.env)');
    console.log('Para:    ', para);
    console.log('Assunto: ', assunto);
    console.log('-'.repeat(70));
    console.log(texto);
    console.log('='.repeat(70));
    console.log('');
}

// Devolve { enviado: true } quando saiu de verdade e { enviado: false }
// quando só foi para o terminal. Nunca lança: um e-mail que falha não pode
// derrubar o pedido que o originou.
async function enviarEmail({ para, assunto, texto, html }) {
    if (!smtpConfigurado) {
        mostrarNoTerminal({ para, assunto, texto });
        return { enviado: false };
    }

    try {
        await obterTransporte().sendMail({
            from: SMTP_REMETENTE || SMTP_USER,
            to: para,
            subject: assunto,
            text: texto,
            html
        });

        return { enviado: true };
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error.message);
        mostrarNoTerminal({ para, assunto, texto });
        return { enviado: false, erro: error.message };
    }
}

module.exports = {
    enviarEmail,
    smtpConfigurado
};
