require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


const profissionalStorage = require('./storage/profissionalStorage');
const pacienteStorage = require("./storage/pacienteStorage");
const senhaStorage = require("./storage/senhaStorage");
const notificacaoStorage = require("./storage/notificacaoStorage");
 
app.use('/api/profissional', profissionalStorage);
app.use('/api/paciente', pacienteStorage);
// As rotas de senha ficam fora de /api/profissional de proposito: o
// PUT /api/profissional/:id, que ja existe, capturaria /api/profissional/senha.
app.use("/api/senha", senhaStorage);
app.use("/api/notificacao", notificacaoStorage);



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