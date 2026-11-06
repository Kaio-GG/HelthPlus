// Conteúdo educativo do aplicativo do paciente.
//
// Por que existe: tirados os registros de água e refeições e o "Meu
// plano", a área do paciente ficaria com duas telas de números e mais
// nada. Este arquivo é o que dá o que ler e o que explorar entre uma
// consulta e outra.
//
// Tudo aqui é TEXTO FIXO, escrito no código: nada depende de banco, de
// API nem de conexão. É de propósito — o conteúdo não muda por paciente,
// e assim ele abre na hora e funciona offline.
//
// O conteúdo é orientação geral, do tipo que cabe num folheto de sala de
// espera. Nada aqui é prescrição: cada tela que mostra isto repete que
// quem orienta o caso dele é o nutricionista.
//
// Fontes das recomendações:
//   Guia Alimentar para a População Brasileira, Ministério da Saúde, 2014
//   WHO, Healthy diet (fact sheet nº 394, revisado em 2020)
//   Harvard T.H. Chan School of Public Health, Healthy Eating Plate

// ---------------------------------------------------------------
// Dica do dia
//
// A dica não é sorteada: ela é escolhida pelo DIA DO ANO, então todo
// mundo vê a mesma no mesmo dia, e ela só troca quando o dia troca. Com
// Math.random() a dica mudava a cada vez que a tela era redesenhada, o
// que parecia defeito.
// ---------------------------------------------------------------
export const dicasDoDia = [
  'Comece o prato pelos vegetais. O que entra primeiro é o que você come em maior quantidade.',
  'Água antes do café: o corpo passa a noite sem beber nada, e a sede da manhã costuma ser confundida com fome.',
  'Comida de verdade em vez de produto: arroz, feijão, ovo e fruta alimentam melhor do que qualquer barrinha "fit".',
  'Mastigar devagar dá tempo ao corpo de avisar que já está satisfeito. O aviso leva cerca de 20 minutos.',
  'Compre com a lista pronta e depois de comer. Fome no mercado escolhe por você.',
  'Leia a lista de ingredientes, não só a tabela nutricional: cinco ingredientes ou mais, com nomes que você não reconhece, é ultraprocessado.',
  'Guardar fruta lavada e cortada na geladeira é o jeito mais barato de ter lanche pronto.',
  'Refrigerante zero não tem açúcar, mas também não tem nada. Água com limão resolve a vontade de algo com sabor.',
  'Dormir mal aumenta a fome no dia seguinte — e a vontade é sempre de doce e de gordura.',
  'Cozinhar o dobro no domingo é o que faz o almoço de terça-feira não virar delivery.',
  'Não existe alimento proibido para a vida inteira. Existe frequência: o que é todo dia e o que é de vez em quando.',
  'Prato colorido não é enfeite: cada cor de vegetal traz um grupo diferente de vitaminas.',
  'Tomou o café da manhã em pé, na cozinha? Senta. Comer com atenção faz diferença no quanto você come.',
  'Fome de verdade aceita qualquer comida. Vontade de comer escolhe um alimento específico.',
  'Tempere com alho, cebola, ervas e limão. Quem tempera bem precisa de menos sal.',
];

// Índice da dica de hoje. O "dia do ano" vem da diferença entre hoje e o
// primeiro de janeiro, em dias.
export const dicaDeHoje = (quando = new Date()) => {
  const inicioDoAno = new Date(quando.getFullYear(), 0, 1);
  const diaDoAno = Math.floor((quando - inicioDoAno) / 86400000);

  return dicasDoDia[diaDoAno % dicasDoDia.length];
};

// ---------------------------------------------------------------
// O prato saudável
//
// A proporção do "prato" é a forma mais fácil de orientar sem contar
// caloria nenhuma: metade vegetais, um quarto de proteína, um quarto de
// carboidrato. "proporcao" é a fatia do prato, e é com ela que a tela
// desenha o gráfico de rosca.
// ---------------------------------------------------------------
export const gruposDoPrato = [
  {
    chave: 'vegetais',
    nome: 'Legumes, verduras e frutas',
    proporcao: 50,
    cor: '#379765',
    resumo: 'Metade do prato. Quanto mais cores, melhor.',
    exemplos: [
      'Folhas: alface, rúcula, couve, espinafre',
      'Legumes: abobrinha, cenoura, beterraba, chuchu',
      'Frutas: as da estação são as mais baratas e mais saborosas',
    ],
    porque:
      'São o que traz fibra, vitaminas e minerais com pouca caloria. A fibra é também o que dá a sensação de prato cheio.',
  },
  {
    chave: 'proteina',
    nome: 'Proteínas',
    proporcao: 25,
    cor: '#C0392B',
    resumo: 'Um quarto do prato, em todas as refeições principais.',
    exemplos: [
      'Feijão, lentilha, grão-de-bico, ervilha',
      'Ovo, frango, peixe, carne',
      'Queijo e iogurte entram como complemento',
    ],
    porque:
      'É o que mantém o músculo e o que mais segura a fome entre as refeições. O feijão com arroz, junto, forma proteína completa.',
  },
  {
    chave: 'carboidrato',
    nome: 'Carboidratos',
    proporcao: 25,
    cor: '#E0A526',
    resumo: 'O outro quarto. Integral sempre que der.',
    exemplos: [
      'Arroz, macarrão, pão, aveia',
      'Batata, mandioca, batata-doce, inhame',
      'Milho, cuscuz, tapioca',
    ],
    porque:
      'É o combustível do corpo. Cortar carboidrato não é o caminho: a versão integral, que tem a fibra, é o que muda a conta.',
  },
];

// ---------------------------------------------------------------
// Perguntas que todo mundo faz
//
// Lista de abrir e fechar (acordeão). A resposta é curta de propósito:
// texto longo em tela de celular não é lido.
// ---------------------------------------------------------------
export const perguntasFrequentes = [
  {
    chave: 'imc',
    pergunta: 'O que é o IMC que aparece na minha evolução?',
    resposta:
      'É o seu peso dividido pela sua altura ao quadrado. Serve para comparar o seu peso com o esperado para a sua altura. É um número de triagem, não um diagnóstico: ele não distingue músculo de gordura, e é por isso que o seu nutricionista olha outras medidas junto.',
  },
  {
    chave: 'escore-z',
    pergunta: 'E o "escore-z"?',
    resposta:
      'É o quanto a sua medida está longe da média de pessoas da mesma idade e do mesmo sexo. Zero é exatamente a média. Entre -2 e +2 está dentro do esperado. Fora disso é o que o nutricionista olha com mais atenção.',
  },
  {
    chave: 'percentil',
    pergunta: 'O percentil 70 quer dizer que estou acima do peso?',
    resposta:
      'Não. Quer dizer que, em 100 pessoas da sua idade e do seu sexo, cerca de 70 estariam abaixo daquela medida. É posição numa fila, não nota. A classificação (eutrofia, sobrepeso...) é que diz se o valor pede atenção.',
  },
  {
    chave: 'peso-oscila',
    pergunta: 'Meu peso muda de um dia para o outro. Isso é normal?',
    resposta:
      'Sim, e muito: de 1 a 2 kg ao longo do mesmo dia, por causa de água, sal, intestino e ciclo menstrual. É por isso que a sua evolução é feita das pesagens da consulta, sempre no mesmo tipo de condição, e não da balança de casa todo dia.',
  },
  {
    chave: 'balanca',
    pergunta: 'Posso me pesar em casa?',
    resposta:
      'Pode, se isso não virar angústia. Se for fazer, escolha um dia fixo da semana, de manhã, depois do banheiro e antes de comer. Comparar pesagens feitas em condições diferentes é comparar coisas diferentes.',
  },
  {
    chave: 'dieta',
    pergunta: 'Posso seguir uma dieta que vi na internet?',
    resposta:
      'Dieta que promete resultado rápido, corta grupos inteiros de alimentos ou vende suplemento junto costuma dar o peso de volta — e às vezes com juros. Leve a dieta que viu para a próxima consulta e pergunte: faz muito mais sentido que tentar sozinho.',
  },
  {
    chave: 'suplemento',
    pergunta: 'Preciso tomar suplemento?',
    resposta:
      'A maioria das pessoas não precisa. Suplemento serve para cobrir uma falta identificada — e identificar a falta é trabalho de quem acompanha você, com exame e avaliação. Comprar por indicação de rede social é gastar dinheiro no escuro.',
  },
  {
    chave: 'consulta',
    pergunta: 'Com que frequência devo voltar?',
    resposta:
      'Quem define é o seu nutricionista, e depende do seu caso. Na fase de ajuste costuma ser mais de perto; depois, de manutenção, mais espaçado. As consultas marcadas aparecem na aba Consultas deste aplicativo.',
  },
  {
    chave: 'dados',
    pergunta: 'Quem vê os meus dados aqui?',
    resposta:
      'Você e o nutricionista que cadastrou você. As medidas das suas consultas ficam na sua ficha com ele. Se quiser que os seus dados sejam apagados, peça: a ficha pode ser excluída por completo, e é um direito seu pela LGPD.',
  },
  {
    chave: 'senha',
    pergunta: 'Minha senha é a minha data de nascimento. Isso é seguro?',
    resposta:
      'É a senha do primeiro acesso, para você conseguir entrar sem esperar e-mail. Justamente por ser fácil de adivinhar, vale trocá-la: Perfil > Alterar senha, e escolha uma senha só sua.',
  },
];

// ---------------------------------------------------------------
// Sinais para procurar o nutricionista antes da próxima consulta
//
// O aplicativo não pode diagnosticar nada, mas pode dizer quando vale
// adiantar a consulta em vez de esperar.
// ---------------------------------------------------------------
export const sinaisDeAlerta = [
  'Perder ou ganhar peso rápido sem ter mudado nada na alimentação',
  'Ficar sem apetite por vários dias seguidos',
  'Sentir tontura, fraqueza ou falta de ar nas tarefas de sempre',
  'Dor ou desconforto na barriga depois de comer, com frequência',
  'Começar um medicamento novo que mexeu com o apetite ou com o intestino',
  'Ter recebido um diagnóstico novo (diabetes, pressão alta, anemia)',
];

// ---------------------------------------------------------------
// Água recomendada por dia
//
// A regra prática mais usada é 35 ml por quilo de peso para adultos. Para
// crianças a conta é outra (Holliday-Segar, por faixa de peso), e é ela
// que a função usa quando o peso é pequeno.
//
// É ESTIMATIVA, e a tela diz isso: quem faz exercício, quem vive em lugar
// quente e quem está doente precisa de mais. É orientação geral, não
// prescrição.
//
// Fontes: Holliday & Segar (1957), para a faixa pediátrica; 30-40 ml/kg
// como faixa usual para adultos.
// ---------------------------------------------------------------
export const ML_POR_KG_ADULTO = 35;

export const aguaRecomendadaLitros = (pesoKg, idadeAnos = 30) => {
  const peso = Number(pesoKg);

  if (!Number.isFinite(peso) || peso <= 0) return null;

  // Criança e adolescente: a regra por faixa de peso.
  if (idadeAnos < 18) {
    let mililitros;

    if (peso <= 10) mililitros = peso * 100;
    else if (peso <= 20) mililitros = 1000 + (peso - 10) * 50;
    else mililitros = 1500 + (peso - 20) * 20;

    return Math.round(mililitros) / 1000;
  }

  return Math.round(peso * ML_POR_KG_ADULTO) / 1000;
};

// Quantos copos de 250 ml dá a quantidade estimada.
export const emCoposDe250 = (litros) =>
  litros ? Math.round((litros * 1000) / 250) : null;
