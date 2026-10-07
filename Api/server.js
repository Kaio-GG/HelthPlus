const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./connection');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API funcionando!'
    });
});

app.get('/teste-banco', async (req, res) => {
    const { data, error } = await supabase
        .from('tb_paciente')
        .select('*');

    if (error) {
        console.error(error);

        return res.status(500).json({
            erro: error.message
        });
    }

    res.json(data);
});


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});