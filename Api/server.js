require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


const profissionalStorage = require('./storage/profissionalStorage');
const pacienteStorage = require("./storage/pacienteStorage");
 
app.use('/api/profissional', profissionalStorage);
app.use('/api/paciente', pacienteStorage);



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