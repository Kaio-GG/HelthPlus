// Pacotes de assinatura do aplicativo (valores fictícios, só para ilustração).
// "limitePacientes: null" significa pacientes ilimitados.

export const planosIndividuais = [
  {
    id: 'basico',
    nome: 'Básico',
    descricao: 'Para quem está começando',
    preco: 29.9,
    limitePacientes: 10,
    destaque: false,
    beneficios: ['Até 10 pacientes', 'Calculadora OMS completa', '1 plano alimentar ativo por paciente'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    descricao: 'Para consultórios em crescimento',
    preco: 59.9,
    limitePacientes: 50,
    destaque: true,
    beneficios: ['Até 50 pacientes', 'Modelos de plano reutilizáveis'],
  },
  {
    id: 'avancado',
    nome: 'Avançado',
    descricao: 'Para alto volume de atendimentos',
    preco: 99.9,
    limitePacientes: null,
    destaque: false,
    beneficios: ['Pacientes ilimitados'],
  },
];

export const planosClinica = [
  {
    id: 'clinica_start',
    nome: 'Clínica Start',
    descricao: 'Para equipes pequenas',
    preco: 149.9,
    limitePacientes: 150,
    destaque: false,
    beneficios: ['Até 3 nutricionistas', 'Até 150 pacientes', 'Painel de gestão da equipe'],
  },
  {
    id: 'clinica_plus',
    nome: 'Clínica Plus',
    descricao: 'Para clínicas em expansão',
    preco: 349.9,
    limitePacientes: 600,
    destaque: true,
    beneficios: ['Até 10 nutricionistas', 'Até 600 pacientes'],
  },
  {
    id: 'clinica_enterprise',
    nome: 'Clínica Enterprise',
    descricao: 'Para redes e hospitais',
    preco: null, // "Sob consulta"
    limitePacientes: null,
    destaque: false,
    beneficios: ['Nutricionistas ilimitados'],
  },
];

// Histórico de cobranças mostrado no perfil (exemplo).
export const cobrancasIniciais = [];
