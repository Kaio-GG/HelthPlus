
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const profissionalStorage = require('./storage/profissionalStorage');
const pacienteStorage = require('./storage/pacienteStorage');
const planoStorage = require('./storage/planoStorage');
const consultaStorage = require('./storage/consultaStorage');
const conviteStorage = require('./storage/conviteStorage');
const senhaStorage = require('./storage/senhaStorage');
const notificacaoStorage = require('./storage/notificacaoStorage');
const assinaturaStorage = require('./storage/assinaturaStorage');

app.use('/api/profissional', profissionalStorage);
app.use('/api/paciente', pacienteStorage);
app.use('/api/plano', planoStorage);
app.use('/api/consulta', consultaStorage);
app.use('/api/convite', conviteStorage);

// Rotas de senha
app.use('/api/senha', senhaStorage);

// Notificações
app.use('/api/notificacao', notificacaoStorage);

// Assinatura paga do nutricionista
app.use('/api/assinatura', assinaturaStorage);

// TESTE DE CONEXÃO
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API HelthPlus funcionando!'
    });
});

// PORTA DA API
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API rodando na porta ${PORT}`);
});
