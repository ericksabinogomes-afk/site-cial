const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do CIAL rodando');
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/teste-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(
        [{ nome, email, senha }],
        { returning: 'minimal' } // <--- adiciona isso
      );

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});