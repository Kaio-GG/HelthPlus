// Api/server.js
// Ponto de entrada da API do Health Plus.
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

// Primeiro de tudo: confere o .env e recusa subir com JWT_SECRET fraco.
const config = require('./config');

const {
  cabecalhosDeSeguranca,
  corsRestrito,
  rotaNaoEncontrada,
  tratarErro,
} = require('./middleware/seguranca');
const { limites } = require('./middleware/limiteTaxa');
const { agendarExpurgo } = require('./servicos/retencao');

const profissionalStorage = require('./storage/profissionalStorage');
const pacienteStorage = require('./storage/pacienteStorage');
const consultaStorage = require('./storage/consultaStorage');
const avaliacaoStorage = require('./storage/avaliacaoStorage');
const conviteStorage = require('./storage/conviteStorage');
const senhaStorage = require('./storage/senhaStorage');
const notificacaoStorage = require('./storage/notificacaoStorage');
const assinaturaStorage = require('./storage/assinaturaStorage');
const lgpdStorage = require('./storage/lgpdStorage');

const app = express();

// Não anuncia "X-Powered-By: Express" para quem faz varredura.
app.disable('x-powered-by');

// Atrás de proxy, req.ip passa a ser o IP real do cliente (e req.secure
// enxerga o HTTPS do proxy). Ver CONFIAR_PROXY no .env.example.
if (config.confiarNoProxy) app.set('trust proxy', 1);

app.use(cabecalhosDeSeguranca);
app.use(corsRestrito);

// 100 KB é folga de sobra para o maior corpo da API (uma avaliação). Sem
// limite, um corpo gigante segura memória do servidor.
app.use(express.json({ limit: '100kb' }));

app.use('/api', limites.geral);

app.use('/api/profissional', profissionalStorage);
app.use('/api/paciente', pacienteStorage);
app.use('/api/consulta', consultaStorage);
app.use('/api/avaliacao', avaliacaoStorage);
app.use('/api/convite', conviteStorage);
app.use('/api/senha', senhaStorage);
app.use('/api/notificacao', notificacaoStorage);
app.use('/api/assinatura', assinaturaStorage);
app.use('/api/lgpd', lgpdStorage);

// As rotas de plano ALIMENTAR (/api/plano) saíram do ar. A função foi
// removida do aplicativo, e rota sem tela que a use é só superfície de
// ataque sobre dado de saúde (LGPD, Art. 6º, III — necessidade). O código
// continua em storage/planoStorage.js; para religar, descomente:
//
//   app.use('/api/plano', require('./storage/planoStorage'));

// Teste de conexão. Não diz versão nem ambiente.
app.get('/', (req, res) => {
  res.json({ mensagem: 'API HelthPlus funcionando!' });
});

app.use(rotaNaoEncontrada);
app.use(tratarErro);

// HTTPS quando há certificado configurado; HTTP no resto (desenvolvimento,
// ou atrás de um proxy que já faz o HTTPS).
function criarServidor() {
  if (config.tls.certificado && config.tls.chave) {
    return {
      protocolo: 'https',
      servidor: https.createServer(
        {
          cert: fs.readFileSync(config.tls.certificado),
          key: fs.readFileSync(config.tls.chave),
          minVersion: 'TLSv1.2',
        },
        app
      ),
    };
  }

  return { protocolo: 'http', servidor: http.createServer(app) };
}

if (require.main === module) {
  const { protocolo, servidor } = criarServidor();

  servidor.listen(config.porta, '0.0.0.0', () => {
    console.log(`API rodando em ${protocolo}://0.0.0.0:${config.porta}`);

    if (protocolo === 'http' && !config.confiarNoProxy) {
      console.log(
        '  (sem HTTPS: serve para desenvolvimento na rede local. Para ' +
          'receber paciente real, configure TLS_CERTIFICADO/TLS_CHAVE ou um proxy com HTTPS.)'
      );
    }
  });

  agendarExpurgo();
}

module.exports = app;
