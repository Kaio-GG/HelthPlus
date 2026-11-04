// Validações simples usadas nos formulários.

export const emailValido = (email = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

// Registro no Conselho Regional de Nutricionistas.
//
// Mesmas regras de Api/utilitarios/crn.js. Se mudar aqui, mude lá: a tela
// ajuda quem está digitando, mas quem garante é o servidor.
//
// Não há consulta ao conselho, então a conferência é de formato: a regional
// (de 1 a 11, as que existem) e o número, de 3 a 7 dígitos. O "P" no fim
// marca o registro provisório, de quem ainda não colou grau. Já basta para
// barrar o acidente que interessa — a senha ou o e-mail caindo neste campo
// pelo preenchimento automático do celular.
//
// A regional e o número têm de vir separados — por espaço, hífen ou barra.
// Sem essa exigência "12345" era aceito e virava "CRN-1 2345": o primeiro
// dígito do número era lido como regional e o registro ia errado para o
// banco, calado. É melhor pedir o formato completo do que gravar outro.
//
// Aceita com ou sem o "CRN": "CRN-3 12345", "crn3/12345", "3 12345".
export const FORMATO_DO_CRN =
  /^(?:CRN\s*[-/]?\s*)?(1[01]|[1-9])(?:\s*[-/]\s*|\s+)(\d{3,7})(?:\s*[-/]?\s*(P))?$/i;

export const crnValido = (crn = '') => FORMATO_DO_CRN.test(crn.trim());

// ----- CRN digitado em dois campos (regional + número) -----
//
// A tela de criar conta não pede o CRN inteiro num campo só. Ali o campo
// precisa abrir o teclado numérico, e num teclado numérico ninguém digita
// o "CRN-" nem o hífen: a regional virou uma lista e, para digitar, sobrou
// só o número. É também o que tira de vez o preenchimento automático do
// caminho — num campo de dígitos o gerenciador de senhas não tem o que pôr.

// As regionais que existem hoje: CRN-1 a CRN-11.
export const REGIONAIS_DO_CRN = Array.from({ length: 11 }, (_, i) => `CRN-${i + 1}`);

// Quantos dígitos o número do registro pode ter.
//
// Não há tamanho único no país — cada regional numera do seu jeito —, então
// o limite é a faixa que o formato aceita. Como não dá para dizer "são
// exatamente N dígitos", a tela mostra um contador: o usuário vê quantos já
// digitou, até onde pode ir e quando o número ficou válido.
export const DIGITOS_MINIMOS_DO_CRN = 3;
export const DIGITOS_MAXIMOS_DO_CRN = 7;

export const numeroDoCrnValido = (numero = '') =>
  new RegExp(`^\\d{${DIGITOS_MINIMOS_DO_CRN},${DIGITOS_MAXIMOS_DO_CRN}}$`).test(numero);

// Junta os dois campos no formato que o servidor espera: "CRN-3 12345".
//
// O "provisorio" não é digitado em lugar nenhum: ele vem de um registro já
// gravado e só volta para o texto na hora de salvar. Sem esse caminho de
// volta, abrir o perfil para trocar o telefone apagava o "/P" do CRN de
// quem ainda não colou grau — calado, e sem ninguém ter pedido.
export const montarCrn = (regional = '', numero = '', provisorio = false) =>
  `${regional} ${numero}${provisorio ? '/P' : ''}`.trim();

// Caminho inverso: quebra um CRN já gravado nas partes que a tela edita.
//
// Devolve null quando o texto não está no formato — registro antigo, ou
// digitado fora do padrão antes de a tela passar a exigi-lo. Aí não há o
// que pré-selecionar, e é melhor a lista começar vazia do que chutar uma
// regional e gravar o registro de outra pessoa.
export const separarCrn = (crn = '') => {
  const partes = FORMATO_DO_CRN.exec(String(crn).trim());

  if (!partes) return null;

  const [, regional, numero, provisorio] = partes;

  return { regional: `CRN-${regional}`, numero, provisorio: Boolean(provisorio) };
};

// Deixa todo CRN gravado na mesma forma: "CRN-3 12345".
//
// Sem isso o mesmo registro digitado de dois jeitos ("crn3 12345" e
// "CRN-3 12345") passa pela checagem de duplicado e vira duas contas.
export const normalizarCrn = (crn = '') => {
  const partes = FORMATO_DO_CRN.exec(crn.trim());

  if (!partes) return crn.trim().toUpperCase();

  const [, regional, numero, provisorio] = partes;

  return `CRN-${regional} ${numero}${provisorio ? '/P' : ''}`;
};

// Lista de requisitos da senha. Cada item indica se já foi atendido,
// usado no checklist da tela "Nova senha".
export const requisitosDaSenha = (senha = '') => [
  { chave: 'tamanho', rotulo: 'Mínimo de 8 caracteres', atendido: senha.length >= 8 },
  { chave: 'maiuscula', rotulo: 'Uma letra maiúscula', atendido: /[A-ZÀ-Ý]/.test(senha) },
  { chave: 'numero', rotulo: 'Um número', atendido: /\d/.test(senha) },
  { chave: 'especial', rotulo: 'Um caractere especial', atendido: /[^A-Za-z0-9\s]/.test(senha) },
];

export const senhaForte = (senha = '') =>
  requisitosDaSenha(senha).every((requisito) => requisito.atendido);
