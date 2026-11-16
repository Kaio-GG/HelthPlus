// app/utilitarios/relatorioPdf.js
// Relatório de acompanhamento nutricional em PDF, para o paciente baixar.
//
// Como funciona:
//   1. a tela busca os dados em /api/lgpd/paciente/meus-dados (a mesma
//      rota da cópia dos dados, já protegida e registrada na auditoria);
//   2. montarHtmlDoRelatorio() transforma esses dados numa página HTML
//      com tabelas e gráficos;
//   3. gerarECompartilharPdf() converte o HTML em PDF NO PRÓPRIO CELULAR
//      (expo-print) e abre a folha de compartilhar (expo-sharing): salvar
//      em Arquivos, mandar por WhatsApp ou e-mail, imprimir. O arquivo fica
//      no cache privado do app até o próximo relatório ser gerado.
//
// O PDF nunca passa pelo servidor: os dados saem da API como hoje, e o
// arquivo é montado no aparelho de quem pediu.
//
// Pacotes necessários (rode UMA vez dentro de app/):
//
//     npx expo install expo-print expo-sharing
//
// Os require ficam dentro de try, como no armazenamentoSeguro.js: sem os
// pacotes o app continua abrindo, e o botão avisa o que falta.
import { Platform } from 'react-native';

let Print = null;
let Sharing = null;
let ArquivoExpo = null;
let PastasExpo = null;

try {
  Print = require('expo-print');
} catch {
  Print = null;
}

try {
  Sharing = require('expo-sharing');
} catch {
  Sharing = null;
}

try {
  // Vem junto com o pacote "expo". Copia o PDF para a pasta de documentos
  // do app antes de compartilhar (ver gerarECompartilharPdf) e apaga o
  // relatório anterior.
  const sistemaDeArquivos = require('expo-file-system');
  ArquivoExpo = sistemaDeArquivos.File;
  PastasExpo = sistemaDeArquivos.Paths;
} catch {
  ArquivoExpo = null;
  PastasExpo = null;
}

// No navegador o relatório usa a impressão do próprio navegador e não
// precisa dos pacotes.
export const pdfDisponivel =
  Platform.OS === 'web' || Boolean(Print?.printToFileAsync || Print?.printAsync);

// ---------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------

// Todo texto que vem do banco passa por aqui antes de entrar no HTML. Sem
// isso, um nome com "<" ou "&" quebraria a página, e um texto malicioso
// gravado numa observação viraria código dentro do relatório.
const esc = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const numero = (valor, casas = 1) =>
  Number.isFinite(Number(valor)) && valor !== null && valor !== ''
    ? Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
    : '—';

const comSinal = (valor, casas = 2) => {
  if (!Number.isFinite(Number(valor)) || valor === null) return '—';
  const texto = numero(Math.abs(Number(valor)), casas);
  return Number(valor) > 0 ? `+${texto}` : Number(valor) < 0 ? `−${texto}` : texto;
};

// "2015-03-12" ou um ISO completo -> "12/03/2015".
const dataBR = (valor) => {
  if (!valor) return '—';
  const texto = String(valor);
  if (/^\d{2}\/\d{2}\/\d{4}/.test(texto)) return texto.slice(0, 10);
  const iso = texto.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return esc(texto);
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

const dataHoraBR = (valor) => {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '—';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(data.getDate())}/${p(data.getMonth() + 1)}/${data.getFullYear()} às ${p(data.getHours())}:${p(data.getMinutes())}`;
};

// "12/03/2015" -> dias desde 1970, para posicionar no gráfico.
const diasDesde = (dataBRTexto) => {
  const [dia, mes, ano] = String(dataBRTexto || '').split('/').map(Number);
  return Date.UTC(ano, (mes || 1) - 1, dia || 1) / 864e5 || 0;
};

// "12/03/2015" -> número para ordenar.
const chaveDaData = (dataBRTexto) => {
  const [dia, mes, ano] = String(dataBRTexto || '').split('/');
  return Number(`${ano}${mes}${dia}`) || 0;
};

const SEXO = { F: 'Feminino', M: 'Masculino' };

const STATUS_CONSULTA = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  faltou: 'Faltou',
};

const COR_DO_TOM = { adequado: '#1E6B43', atencao: '#8A5A00', risco: '#9E2A1E' };

// ---------------------------------------------------------------------
// Gráfico de linha em SVG (dentro do HTML do PDF)
// ---------------------------------------------------------------------

function graficoDeLinha(pontos, { titulo, unidade, cor }) {
  if (pontos.length < 2) return '';

  const largura = 520;
  const altura = 170;
  const margem = { esquerda: 44, direita: 16, topo: 16, base: 30 };
  const valores = pontos.map((p) => p.valor);
  let minimo = Math.min(...valores);
  let maximo = Math.max(...valores);

  if (minimo === maximo) {
    minimo -= 1;
    maximo += 1;
  }

  const folga = (maximo - minimo) * 0.15;
  minimo -= folga;
  maximo += folga;

  // Os pontos ficam no eixo pela DATA, e não um ao lado do outro: uma
  // consulta três meses depois da anterior fica três vezes mais longe que
  // uma de um mês. Com espaçamento igual, a curva mentiria sobre o ritmo
  // do crescimento.
  const dias = pontos.map((p) => diasDesde(p.rotulo));
  const primeiroDia = Math.min(...dias);
  const ultimoDia = Math.max(...dias);
  const x = (i) => {
    const fracao =
      ultimoDia > primeiroDia ? (dias[i] - primeiroDia) / (ultimoDia - primeiroDia) : i / (pontos.length - 1);
    return margem.esquerda + fracao * (largura - margem.esquerda - margem.direita);
  };
  const y = (v) =>
    margem.topo + (1 - (v - minimo) / (maximo - minimo)) * (altura - margem.topo - margem.base);

  const linha = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ');

  const marcas = [minimo, (minimo + maximo) / 2, maximo]
    .map(
      (v) =>
        `<line x1="${margem.esquerda}" x2="${largura - margem.direita}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="#E3E7E4"/>` +
        `<text x="${margem.esquerda - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#5B6660">${numero(v, 1)}</text>`
    )
    .join('');

  // Rótulos de data: o primeiro, o último e, se couber, o do meio.
  const indicesDosRotulos = [...new Set([0, Math.floor((pontos.length - 1) / 2), pontos.length - 1])];
  // O primeiro rótulo alinha à esquerda e o último à direita, para não
  // serem cortados na borda do gráfico.
  const ancora = (i) => (i === 0 ? 'start' : i === pontos.length - 1 ? 'end' : 'middle');
  const rotulos = indicesDosRotulos
    .map(
      (i) =>
        `<text x="${x(i).toFixed(1)}" y="${altura - 8}" text-anchor="${ancora(i)}" font-size="10" fill="#5B6660">${esc(pontos[i].rotulo)}</text>`
    )
    .join('');

  const bolinhas = pontos
    .map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.valor).toFixed(1)}" r="3" fill="${cor}"/>`)
    .join('');

  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const variacao = ultimo.valor - primeiro.valor;
  const descricao = `${titulo}: de ${numero(primeiro.valor)} ${unidade} em ${primeiro.rotulo} para ${numero(ultimo.valor)} ${unidade} em ${ultimo.rotulo}`;

  return `
    <figure class="grafico">
      <figcaption><strong>${esc(titulo)}</strong>
        <span>${comSinal(variacao, 1)} ${esc(unidade)} desde a primeira avaliação</span></figcaption>
      <svg viewBox="0 0 ${largura} ${altura}" width="100%" role="img" aria-label="${esc(descricao)}">
        ${marcas}
        <polyline points="${linha}" fill="none" stroke="${cor}" stroke-width="2"/>
        ${bolinhas}
        ${rotulos}
      </svg>
    </figure>`;
}

// ---------------------------------------------------------------------
// HTML do relatório
// ---------------------------------------------------------------------

export function montarHtmlDoRelatorio(dados) {
  const ficha = dados?.ficha || {};
  const controlador = dados?.controlador || {};
  const avaliacoes = Array.isArray(dados?.avaliacoes) ? dados.avaliacoes : [];
  const consultas = Array.isArray(dados?.consultas) ? dados.consultas : [];
  const consentimentos = Array.isArray(dados?.consentimentos) ? dados.consentimentos : [];

  // A API manda da mais recente para a mais antiga; o gráfico precisa da
  // ordem do tempo.
  const emOrdem = [...avaliacoes].sort((a, b) => chaveDaData(a.data) - chaveDaData(b.data));
  const ultima = emOrdem[emOrdem.length - 1] || null;

  const seriePeso = emOrdem
    .filter((a) => Number.isFinite(Number(a.pesoKg)) && a.pesoKg !== null)
    .map((a) => ({ rotulo: String(a.data || '').slice(0, 10), valor: Number(a.pesoKg) }));

  const serieAltura = emOrdem
    .filter((a) => Number.isFinite(Number(a.alturaCm)) && a.alturaCm !== null)
    .map((a) => ({ rotulo: String(a.data || '').slice(0, 10), valor: Number(a.alturaCm) }));

  const agora = new Date();
  const proximas = consultas
    .filter((c) => new Date(c.inicio) >= agora && c.status !== 'cancelada')
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
  const anteriores = consultas
    .filter((c) => new Date(c.inicio) < agora)
    .sort((a, b) => new Date(b.inicio) - new Date(a.inicio))
    .slice(0, 10);

  const aceite = consentimentos.find((c) => c.vigente && c.tipo === 'tratamento_dados_saude');

  // ---------- blocos ----------

  const linhaDado = (rotulo, valor) =>
    valor ? `<tr><th scope="row">${esc(rotulo)}</th><td>${esc(valor)}</td></tr>` : '';

  const blocoPaciente = `
    <section>
      <h2>Paciente</h2>
      <table class="dados">
        ${linhaDado('Nome', ficha.nome)}
        ${linhaDado('Data de nascimento', ficha.nascimento ? dataBR(ficha.nascimento) : '')}
        ${linhaDado('Sexo', SEXO[ficha.sexo] || ficha.sexo)}
        ${linhaDado('Responsável', ficha.responsavel)}
      </table>
    </section>`;

  const blocoNutricionista = controlador.nutricionista
    ? `
    <section>
      <h2>Nutricionista responsável</h2>
      <table class="dados">
        ${linhaDado('Nome', controlador.nutricionista)}
        ${linhaDado('Registro', controlador.registro)}
        ${linhaDado('Contato', controlador.contato)}
      </table>
    </section>`
    : '';

  const blocoResumo = ultima
    ? `
    <section>
      <h2>Última avaliação · ${esc(ultima.data)}</h2>
      <div class="cartoes">
        <div class="cartao"><span>Peso</span><strong>${numero(ultima.pesoKg)} kg</strong></div>
        <div class="cartao"><span>Altura</span><strong>${numero(ultima.alturaCm)} cm</strong></div>
        <div class="cartao"><span>IMC</span><strong>${numero(ultima.imc, 2)}</strong></div>
        ${ultima.idade ? `<div class="cartao"><span>Idade</span><strong>${esc(ultima.idade)}</strong></div>` : ''}
      </div>
      ${
        (ultima.resultados || []).length
          ? `
      <table>
        <caption>Comparação com as curvas da OMS</caption>
        <thead><tr><th scope="col">Indicador</th><th scope="col">Escore-z</th><th scope="col">Percentil</th><th scope="col">Classificação</th></tr></thead>
        <tbody>
          ${ultima.resultados
            .map(
              (r) => `<tr>
                <td>${esc(r.rotulo || r.indicador)}</td>
                <td class="num">${comSinal(r.zScore)}</td>
                <td class="num">${r.percentil === null || r.percentil === undefined ? '—' : numero(r.percentil, 0)}</td>
                <td><span style="color:${COR_DO_TOM[r.tom] || '#111'};font-weight:600">${esc(r.classificacao || '—')}</span></td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>`
          : ''
      }
      ${ultima.observacoes ? `<p class="obs"><strong>Observações do nutricionista:</strong> ${esc(ultima.observacoes)}</p>` : ''}
    </section>`
    : `
    <section>
      <h2>Avaliações</h2>
      <p>Ainda não há avaliações registradas.</p>
    </section>`;

  const blocoGraficos =
    seriePeso.length >= 2 || serieAltura.length >= 2
      ? `
    <section>
      <h2>Evolução</h2>
      ${graficoDeLinha(seriePeso, { titulo: 'Peso', unidade: 'kg', cor: '#2B7D52' })}
      ${graficoDeLinha(serieAltura, { titulo: 'Altura', unidade: 'cm', cor: '#1F5F8B' })}
    </section>`
      : '';

  const blocoHistorico =
    emOrdem.length > 1
      ? `
    <section>
      <h2>Histórico de avaliações</h2>
      <table>
        <thead><tr><th scope="col">Data</th><th scope="col">Idade</th><th scope="col">Peso (kg)</th><th scope="col">Altura (cm)</th><th scope="col">IMC</th><th scope="col">Indicadores adequados</th></tr></thead>
        <tbody>
          ${[...emOrdem]
            .reverse()
            .map((a) => {
              const total = (a.resultados || []).length;
              const adequados = (a.resultados || []).filter((r) => r.tom === 'adequado').length;
              return `<tr>
                <td>${esc(a.data)}</td>
                <td>${esc(a.idade || '—')}</td>
                <td class="num">${numero(a.pesoKg)}</td>
                <td class="num">${numero(a.alturaCm)}</td>
                <td class="num">${numero(a.imc, 2)}</td>
                <td class="num">${total ? `${adequados} de ${total}` : '—'}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </section>`
      : '';

  const linhaConsulta = (c) => `<tr>
      <td>${dataHoraBR(c.inicio)}</td>
      <td>${esc(c.tipo || '—')}</td>
      <td>${esc(STATUS_CONSULTA[c.status] || c.status || '—')}</td>
    </tr>`;

  const blocoConsultas =
    proximas.length || anteriores.length
      ? `
    <section>
      <h2>Consultas</h2>
      ${
        proximas.length
          ? `<table class="consultas"><caption>Próximas</caption>
              <thead><tr><th scope="col">Data</th><th scope="col">Tipo</th><th scope="col">Situação</th></tr></thead>
              <tbody>${proximas.map(linhaConsulta).join('')}</tbody></table>`
          : ''
      }
      ${
        anteriores.length
          ? `<table class="consultas"><caption>Anteriores${consultas.length > anteriores.length + proximas.length ? ' (as 10 mais recentes)' : ''}</caption>
              <thead><tr><th scope="col">Data</th><th scope="col">Tipo</th><th scope="col">Situação</th></tr></thead>
              <tbody>${anteriores.map(linhaConsulta).join('')}</tbody></table>`
          : ''
      }
    </section>`
      : '';

  const geradoEm = dataHoraBR(dados?.sobreEsteArquivo?.geradoEm || new Date().toISOString());

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Relatório de acompanhamento nutricional</title>
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif; color: #111; font-size: 11.5pt; line-height: 1.45; margin: 0; }
  header { border-bottom: 3px solid #2B7D52; padding-bottom: 10px; margin-bottom: 18px; }
  .marca { color: #2B7D52; font-weight: 800; font-size: 13pt; letter-spacing: .3px; }
  h1 { font-size: 18pt; margin: 4px 0 2px; color: #163B28; }
  .gerado { color: #4A534E; font-size: 9.5pt; margin: 0; }
  h2 { font-size: 13pt; color: #163B28; margin: 22px 0 8px; border-bottom: 1px solid #DDE3DF; padding-bottom: 4px; }
  section { page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 10.5pt; }
  caption { text-align: left; font-weight: 600; color: #26302B; padding: 4px 0; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #E3E7E4; vertical-align: top; }
  thead th { background: #EEF6F1; color: #163B28; font-weight: 700; }
  table.consultas { table-layout: fixed; }
  table.consultas th:first-child { width: 45%; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  table.dados th { width: 34%; color: #4A534E; font-weight: 600; background: none; }
  .cartoes { display: flex; gap: 10px; margin: 6px 0 12px; }
  .cartao { flex: 1; border: 1px solid #CFE3D6; border-radius: 8px; padding: 8px 10px; }
  .cartao span { display: block; color: #4A534E; font-size: 9.5pt; }
  .cartao strong { font-size: 14pt; color: #163B28; }
  .grafico { margin: 6px 0 14px; page-break-inside: avoid; }
  .grafico figcaption { display: flex; justify-content: space-between; font-size: 10.5pt; margin-bottom: 4px; }
  .grafico figcaption span { color: #4A534E; }
  .obs { background: #F6F8F7; border-left: 3px solid #2B7D52; padding: 8px 10px; font-size: 10.5pt; }
  .aviso { margin-top: 24px; padding: 10px 12px; border: 1px solid #E6D9B8; background: #FFF9E8; border-radius: 8px; font-size: 9.5pt; color: #3D3216; }
  footer { margin-top: 16px; color: #4A534E; font-size: 8.5pt; border-top: 1px solid #DDE3DF; padding-top: 8px; }
</style>
</head>
<body>
  <header>
    <div class="marca">Health Plus</div>
    <h1>Relatório de acompanhamento nutricional</h1>
    <p class="gerado">Gerado em ${geradoEm}, a pedido do paciente</p>
  </header>

  ${blocoPaciente}
  ${blocoNutricionista}
  ${blocoResumo}
  ${blocoGraficos}
  ${blocoHistorico}
  ${blocoConsultas}

  <div class="aviso">
    <strong>Como ler este relatório.</strong> O escore-z diz quantos desvios-padrão a medida está da mediana da referência da OMS, para a mesma idade e sexo; entre −2 e +2 é a faixa esperada para a maioria das crianças. Estes números <strong>não são diagnóstico</strong>: a interpretação e a conduta são do seu nutricionista. Curvas: WHO Child Growth Standards 2006 (0 a 5 anos) e WHO Growth Reference 2007 (5 a 19 anos).
  </div>

  <footer>
    Este documento contém dados de saúde. Guarde-o com cuidado e compartilhe só com quem precisa.
    ${aceite ? `Uso dos dados de saúde autorizado em ${dataBR(aceite.registradoEm)}${aceite.consentidor === 'responsavel' && aceite.nomeConsentidor ? ` por ${esc(aceite.nomeConsentidor)} (responsável)` : ''}.` : ''}
    Para a cópia completa dos dados, correção ou exclusão: Perfil &gt; Meus dados e privacidade, no aplicativo.
  </footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------
// Gerar e entregar
// ---------------------------------------------------------------------

// Nome legível para quem recebe o arquivo: relatorio-helena-souza-2026-11-11.pdf
function nomeDoArquivo(nome) {
  const base = String(nome || 'paciente')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40);
  return `relatorio-${base || 'paciente'}-${new Date().toISOString().slice(0, 10)}.pdf`;
}

// O relatório anterior, apagado quando um novo é gerado. Não dá para
// apagar logo depois de abrir a folha de compartilhar: o app escolhido
// (WhatsApp, Drive...) pode ler o arquivo DEPOIS que o shareAsync volta.
let relatorioAnterior = null;

function apagar(uri) {
  try {
    if (ArquivoExpo && uri) {
      const arquivo = new ArquivoExpo(uri);
      if (arquivo.exists) arquivo.delete();
    }
  } catch {
    // Sem problema: é pasta privada do app.
  }
}

// No Android, o expo-sharing recusa o arquivo que o expo-print grava no
// cache ("Not allowed to read file under given URL"), um problema antigo
// e conhecido. O contorno recomendado no fórum do Expo é copiar o arquivo
// para a pasta de documentos do app e compartilhar a cópia. Sem o
// expo-file-system, devolve o caminho original.
async function copiarParaDocumentos(uri, nome) {
  if (!ArquivoExpo || !PastasExpo?.document) return uri;

  try {
    const origem = new ArquivoExpo(uri);
    const destino = new ArquivoExpo(PastasExpo.document, nomeDoArquivo(nome));

    if (destino.exists) destino.delete();
    await origem.copy(destino);

    // O original no cache não serve mais.
    apagar(uri);

    return destino.uri;
  } catch (erro) {
    console.log('Não foi possível copiar o PDF para os documentos:', erro?.message);
    return uri;
  }
}

// Gera o PDF e abre a folha de compartilhar. Devolve true se abriu.
//
// No navegador (Expo Web) abre a janela de impressão, onde dá para
// escolher "Salvar como PDF".
export async function gerarECompartilharPdf(dados) {
  if (!pdfDisponivel) {
    throw new Error(
      'A geração de PDF ainda não está instalada neste aplicativo. ' +
        'Peça à equipe para rodar "npx expo install expo-print expo-sharing".'
    );
  }

  const html = montarHtmlDoRelatorio(dados);

  // No navegador, o expo-print imprime a página ATUAL, e não o HTML que
  // recebe. Então o relatório abre numa janela própria, e a janela de
  // impressão do navegador oferece "Salvar como PDF".
  if (Platform.OS === 'web') {
    const janela = globalThis.open?.('', '_blank');
    if (!janela) {
      throw new Error('O navegador bloqueou a janela do relatório. Permita pop-ups para este site e tente de novo.');
    }
    janela.document.open();
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    janela.print();
    return true;
  }

  apagar(relatorioAnterior);
  relatorioAnterior = null;

  const { uri: noCache } = await Print.printToFileAsync({ html });
  const uri = await copiarParaDocumentos(noCache, dados?.ficha?.nome);
  relatorioAnterior = uri;

  let compartilhou = false;

  if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
    try {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Relatório de acompanhamento',
      });
      compartilhou = true;
    } catch (erro) {
      console.log('O compartilhamento recusou o PDF; abrindo a impressão:', erro?.message);
    }
  }

  // Sem o expo-sharing, ou se ele recusar o arquivo: abre o PDF na tela de
  // impressão do sistema, que também tem "Salvar como PDF".
  if (!compartilhou) {
    await Print.printAsync({ uri });
  }

  return true;
}
