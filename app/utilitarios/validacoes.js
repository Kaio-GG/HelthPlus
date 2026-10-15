// Validações simples usadas nos formulários.

export const emailValido = (email = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

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
