// app/utilitarios/acessibilidade.js
// Preferências de acessibilidade que valem para o aplicativo inteiro.
//
//   tamanhoTexto     'normal' | 'grande' | 'muitoGrande'
//   altoContraste    true troca a paleta por uma de contraste reforçado
//   reduzirMovimento true desliga as animações de transição
//
// Como o tamanho do texto e o contraste chegam em TODAS as telas sem mexer
// em cada style.js: os estilos do projeto são criados com StyleSheet.create
// e leem as cores de tema/index.js na hora em que o arquivo é carregado.
// O index.js da raiz lê as preferências ANTES de carregar o App, e então:
//   - troca os valores do objeto "cores" pela paleta de alto contraste;
//   - embrulha o StyleSheet.create para multiplicar fontSize e lineHeight.
// Por isso essas duas mudanças valem a partir da próxima abertura do app
// (a tela de Acessibilidade avisa e oferece reiniciar).
//
// O tamanho de fonte do SISTEMA (Configurações > Acessibilidade do celular)
// continua valendo por cima disto: o app não bloqueia o ajuste do aparelho.
import { AccessibilityInfo, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cores } from '../tema';

export const CHAVE_PREFERENCIAS = '@healthplus:acessibilidade';

export const PREFERENCIAS_PADRAO = {
  tamanhoTexto: 'normal',
  altoContraste: false,
  reduzirMovimento: false,
};

export const ESCALAS_DE_TEXTO = {
  normal: { rotulo: 'Normal', fator: 1 },
  grande: { rotulo: 'Grande', fator: 1.15 },
  muitoGrande: { rotulo: 'Muito grande', fator: 1.3 },
};

// Paleta de alto contraste. Todas as combinações de texto e fundo passam
// de 7:1 (nível AAA da WCAG), menos o verde dos botões, que fica em 7,7:1
// com o texto branco. A paleta normal foi ajustada para passar de 4,5:1
// (nível AA) — ver tema/index.js.
const PALETA_ALTO_CONTRASTE = {
  verdeCabecalho: '#A8DDBE',
  verdeEscuro: '#0B2618',
  verdeBotao: '#1E5E3C',
  verdeLink: '#1A5C38',
  bordaVerde: '#2E5E42',
  fundo: '#FFFFFF',
  textoPrincipal: '#111111',
  textoSecundario: '#26302B',
  textoDesabilitado: '#4A534E',
  linha: '#6F7873',
  erro: '#9E2A1E',
  alertaTexto: '#5C3C00',
  infoTexto: '#123F5E',
};

let preferenciasAplicadas = { ...PREFERENCIAS_PADRAO };

export async function carregarPreferencias() {
  try {
    const salvo = await AsyncStorage.getItem(CHAVE_PREFERENCIAS);
    return salvo ? { ...PREFERENCIAS_PADRAO, ...JSON.parse(salvo) } : { ...PREFERENCIAS_PADRAO };
  } catch {
    return { ...PREFERENCIAS_PADRAO };
  }
}

export async function salvarPreferencias(preferencias) {
  try {
    await AsyncStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
  } catch (erro) {
    console.log('Erro ao salvar as preferências de acessibilidade:', erro);
  }
}

// O que foi aplicado na abertura do app (para a tela saber se precisa
// reiniciar para uma mudança valer).
export const preferenciasEmVigor = () => preferenciasAplicadas;

function escalarEstilo(estilo, fator) {
  if (!estilo || typeof estilo !== 'object') return estilo;

  const novo = { ...estilo };
  if (typeof novo.fontSize === 'number') novo.fontSize = Math.round(novo.fontSize * fator);
  if (typeof novo.lineHeight === 'number') novo.lineHeight = Math.round(novo.lineHeight * fator);
  return novo;
}

// Chamada UMA vez, no index.js, antes de carregar o App.
export function aplicarNoTema(preferencias) {
  preferenciasAplicadas = { ...preferencias };

  if (preferencias.altoContraste) {
    Object.assign(cores, PALETA_ALTO_CONTRASTE);
  }

  const fator = ESCALAS_DE_TEXTO[preferencias.tamanhoTexto]?.fator ?? 1;

  if (fator !== 1) {
    const criarOriginal = StyleSheet.create;

    try {
      StyleSheet.create = (estilos) =>
        criarOriginal(
          Object.fromEntries(
            Object.entries(estilos).map(([nome, estilo]) => [nome, escalarEstilo(estilo, fator)])
          )
        );
    } catch (erro) {
      // Se um dia o StyleSheet ficar somente-leitura, o app abre normal,
      // só sem o texto maior.
      console.log('Não foi possível aplicar o tamanho de texto:', erro);
    }
  }
}

// Fala um texto pelo leitor de tela (TalkBack / VoiceOver), se estiver
// ligado. Serve para avisos que aparecem sem mudança de foco: erro de
// formulário, "salvo com sucesso", lista que terminou de carregar.
export function anunciar(texto) {
  if (!texto) return;
  try {
    AccessibilityInfo.announceForAccessibility(String(texto));
  } catch {
    // Plataforma sem leitor de tela (web antigo): nada a fazer.
  }
}

// Descrição falada de um gráfico: o leitor de tela não "vê" o desenho, então
// diz em palavras o que ele mostra. Ex.: "Gráfico com 4 medições, de 12/03 a
// 10/09. Primeira: 20,1 kg. Última: 23,4 kg. Menor: 20,1 kg. Maior: 23,4 kg."
export function descreverSerie(pontos = [], { sufixo = '', casas = 1, titulo = 'Gráfico' } = {}) {
  const validos = (pontos || []).filter((p) => Number.isFinite(Number(p?.valor)));
  if (validos.length === 0) return `${titulo} sem dados.`;

  const formatar = (valor) =>
    `${Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: casas })}${sufixo ? ` ${sufixo.trim()}` : ''}`;
  const valores = validos.map((p) => Number(p.valor));
  const primeiro = validos[0];
  const ultimo = validos[validos.length - 1];

  if (validos.length === 1) {
    return `${titulo} com uma medição${primeiro.rotulo ? ` em ${primeiro.rotulo}` : ''}: ${formatar(primeiro.valor)}.`;
  }

  return [
    `${titulo} com ${validos.length} medições${primeiro.rotulo ? `, de ${primeiro.rotulo} a ${ultimo.rotulo}` : ''}.`,
    `Primeira: ${formatar(primeiro.valor)}.`,
    `Última: ${formatar(ultimo.valor)}.`,
    `Menor: ${formatar(Math.min(...valores))}.`,
    `Maior: ${formatar(Math.max(...valores))}.`,
  ].join(' ');
}
