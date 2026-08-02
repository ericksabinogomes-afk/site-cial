const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

/*Conectar a API (node e supabase)*/

app.get('/', (req, res) => {
  res.send('API do CIAL rodando');
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/*Teste do bd*/

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


 /* Salvar os dados no bd */
app.post('/cadastro', async (req, res) => {
  const {
    nome,
    email,
    senha,
    cpf,
    telefone,
    whatsapp,
    cep,
    rua,
    bairro,
    cidade,
    estado,
    numero_endereco,
    tipo_pessoa,
    cnpj,
    razao_social,
    nome_fantasia
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        senha, // depois vamos trocar por hash
        cpf,
        telefone,
        whatsapp,
        cep,
        rua,
        bairro,
        cidade,
        estado,
        numero_endereco,
        tipo_pessoa,
        cnpj,
        razao_social,
        nome_fantasia
      }], { returning: 'minimal' });

    if (error) {
      return res.status(500).json({ ok: false, erro: error.message });
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

/* Login */

app.post('/login', async (req, res) => {
  const { identificador, senha } = req.body;

  if (!identificador || !senha) {
    return res.status(400).json({ ok: false, erro: 'Informe identificador e senha' });
  }

  try {
    // busca por email OU cpf
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .or(`email.eq.${identificador},cpf.eq.${identificador}`)
      .limit(1);

    if (error) {
      return res.status(500).json({ ok: false, erro: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ ok: false, erro: 'Usuário não encontrado (email/cpf)' });
    }

    const usuario = data[0];

    // comparação simples sem hash
    if (usuario.senha !== senha) {
      return res.status(401).json({ ok: false, erro: 'Senha inválida' });
    }

    res.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});