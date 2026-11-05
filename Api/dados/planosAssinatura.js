// Catálogo dos planos de assinatura, do lado do servidor.
//
// Precisa ficar IGUAL a app/dados/planosAssinatura.js no que estas duas
// listas têm em comum: id, nome, preço e limite de pacientes. O aplicativo
// usa o arquivo dele para desenhar a tela (descrição, benefícios, selo de
// destaque); a API usa este para três coisas que não podem vir do
// aplicativo:
//
//   1. dizer se o plano pedido existe;
//   2. saber o preço a gravar na cobrança — senão o cliente escolhe
//      quanto quer pagar;
//   3. conferir o limite de pacientes antes de aceitar um downgrade.
//
// "limitePacientes: null" significa pacientes ilimitados.
const planos = [
  { id: 'basico', nome: 'Básico', preco: 29.9, limitePacientes: 10, tipo: 'individual' },
  { id: 'profissional', nome: 'Profissional', preco: 59.9, limitePacientes: 50, tipo: 'individual' },
  { id: 'avancado', nome: 'Avançado', preco: 99.9, limitePacientes: null, tipo: 'individual' },
  { id: 'clinica_start', nome: 'Clínica Start', preco: 149.9, limitePacientes: 150, tipo: 'clinica' },
  { id: 'clinica_plus', nome: 'Clínica Plus', preco: 349.9, limitePacientes: 600, tipo: 'clinica' },
  // Preço nulo = "sob consulta": não é contratado pelo aplicativo.
  { id: 'clinica_enterprise', nome: 'Clínica Enterprise', preco: null, limitePacientes: null, tipo: 'clinica' },
];

function buscarPlano(id) {
  return planos.find((plano) => plano.id === String(id || '')) || null;
}

module.exports = { planos, buscarPlano };
