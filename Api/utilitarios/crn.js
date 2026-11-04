// Registro no Conselho Regional de Nutricionistas.
//
// Mesmas regras de app/utilitarios/validacoes.js. Se mudar lá, mude aqui:
// a tela ajuda quem está digitando, mas quem garante é o servidor — o app
// pode ser contornado batendo direto na API.
//
// Não há consulta ao conselho: a conferência é de formato. A regional vai
// de 1 a 11 (as que existem) e o número tem de 3 a 7 dígitos. O "P" no
// fim marca o registro provisório, de quem ainda não colou grau.
//
// A regional e o número têm de vir separados — por espaço, hífen ou barra.
// Sem essa exigência "12345" era aceito e virava "CRN-1 2345": o primeiro
// dígito do número era lido como regional e o registro ia errado para o
// banco, calado. É melhor pedir o formato completo do que gravar outro.
//
// Aceita com ou sem o "CRN": "CRN-3 12345", "crn3/12345", "3 12345".
const FORMATO_DO_CRN =
    /^(?:CRN\s*[-/]?\s*)?(1[01]|[1-9])(?:\s*[-/]\s*|\s+)(\d{3,7})(?:\s*[-/]?\s*(P))?$/i;

function crnValido(crn = '') {
    return FORMATO_DO_CRN.test(String(crn).trim());
}

// Deixa todo CRN gravado na mesma forma: "CRN-3 12345".
//
// Sem isso o mesmo registro digitado de dois jeitos ("crn3 12345" e
// "CRN-3 12345") passa pela checagem de duplicado e vira duas contas.
function normalizarCrn(crn = '') {
    const texto = String(crn).trim();
    const partes = FORMATO_DO_CRN.exec(texto);

    if (!partes) return texto.toUpperCase();

    const [, regional, numero, provisorio] = partes;

    return `CRN-${regional} ${numero}${provisorio ? '/P' : ''}`;
}

module.exports = {
    FORMATO_DO_CRN,
    crnValido,
    normalizarCrn
};
