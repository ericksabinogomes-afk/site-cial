const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

/*==========================================================
    Conectar a API (node e supabase
==========================================================*/

app.get('/', (req, res) => {
  res.send('API do CIAL rodando');
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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


/*==========================================================
    Salvar os dados no bd 
==========================================================*/
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
    // Inserir na tabela usuarios
    const { data: usuarios, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        senha,            // depois trocar por hash
        cpf,
        telefone,
        whastapp: whatsapp, 
        tipo: tipo_pessoa   // Fisica / Juridica, como você definir
      }])
      .select('id');        

    if (usuarioError) {
      console.error('Erro ao inserir em usuarios:', usuarioError);
      return res.status(500).json({ ok: false, erro: usuarioError.message });
    }

    const usuarioId = usuarios[0].id;

    // Inserir endereço na tabela Enderecos
    const { error: enderecoError } = await supabase
      .from('Enderecos')
      .insert([{
        usuario_id: usuarioId,
        cep,
        rua,
        bairro,
        cidade,
        estado,
        numero_endereco
      }]);

    if (enderecoError) {
      console.error('Erro ao inserir em Enderecos:', enderecoError);
      
    }

    // Se for pessoa jurídica, inserir em dados_pj
    const cnpjLimpo = cnpj ? String(cnpj).replace(/\D/g, '') : null;

    if (tipo_pessoa === 'pj' && cnpjLimpo) {
      const { error: pjError } = await supabase
        .from('dados_pj')
        .insert([{
          usuario_id: usuarioId,
          cnpj: cnpjLimpo,
          razao_social,
          nome_fantasia
        }]);

      if (pjError) {
        console.error('Erro ao inserir em dados_pj:', pjError);
      }
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Erro inesperado no /cadastro:', err);
    return res.status(500).json({ ok: false, erro: err.message });
  }
});


/*==========================================================
    Atualizar meus dados
==========================================================*/

app.put('/meus-dados/:id', async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);
  const { nome, telefone, cpf } = req.body;

  if (!usuarioId) {
    return res.status(400).json({ ok: false, erro: 'ID inválido' });
  }

  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nome,
        telefone,
        cpf
      })
      .eq('id', usuarioId);

    if (error) {
      console.error('Erro ao atualizar usuario:', error);
      return res.status(500).json({ ok: false, erro: error.message });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Erro inesperado no /meus-dados:', err);
    return res.status(500).json({ ok: false, erro: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

/*==========================================================
    ROTAS DE PRODUTOS
==========================================================*/

// Listar produtos (apenas ativos)
app.get('/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Listar todos (para o admin, inclusive inativos se quiser)
app.get('/admin/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Criar produto (admin)
app.post('/admin/produtos', async (req, res) => {
  const {
    nome,
    codigo,
    categoria,
    preco,
    estoque,
    imagem,
    selo,
    destaque
  } = req.body;

  if (!nome || !codigo || !categoria || preco == null) {
    return res.status(400).json({
      ok: false,
      erro: 'Informe nome, código, categoria e preço'
    });
  }

  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        nome,
        codigo,
        categoria,
        preco: Number(preco),
        estoque: estoque || 'Em estoque',
        imagem: imagem || '',
        selo: selo || null,
        destaque: !!destaque,
        ativo: true
      }])
      .select('id');

    if (error) {
      return res.status(500).json({ ok: false, erro: error.message });
    }

    res.status(201).json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Atualizar produto (admin)
app.put('/admin/produtos/:id', async (req, res) => {
  const produtoId = parseInt(req.params.id, 10);
  const {
    nome,
    codigo,
    categoria,
    preco,
    estoque,
    imagem,
    selo,
    destaque,
    ativo
  } = req.body;

  if (!produtoId) {
    return res.status(400).json({ ok: false, erro: 'ID inválido' });
  }

  const dadosAtualizacao = {};
  if (nome !== undefined) dadosAtualizacao.nome = nome;
  if (codigo !== undefined) dadosAtualizacao.codigo = codigo;
  if (categoria !== undefined) dadosAtualizacao.categoria = categoria;
  if (preco !== undefined) dadosAtualizacao.preco = Number(preco);
  if (estoque !== undefined) dadosAtualizacao.estoque = estoque;
  if (imagem !== undefined) dadosAtualizacao.imagem = imagem;
  if (selo !== undefined) dadosAtualizacao.selo = selo;
  if (destaque !== undefined) dadosAtualizacao.destaque = !!destaque;
  if (ativo !== undefined) dadosAtualizacao.ativo = !!ativo;

  try {
    const { error } = await supabase
      .from('produtos')
      .update(dadosAtualizacao)
      .eq('id', produtoId);

    if (error) {
      return res.status(500).json({ ok: false, erro: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Excluir produto (admin)
app.delete('/admin/produtos/:id', async (req, res) => {
  const produtoId = parseInt(req.params.id, 10);

  if (!produtoId) {
    return res.status(400).json({ ok: false, erro: 'ID inválido' });
  }

  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', produtoId);

    if (error) {
      return res.status(500).json({ ok: false, erro: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

/*==========================================================
    Login
==========================================================*/

app.post('/login', async (req, res) => {
  const { identificador, senha } = req.body;

  if (!identificador || !senha) {
    return res.status(400).json({ ok: false, erro: 'Informe identificador e senha' });
  }

  try {
    // Remove tudo que não é número
    const cpfLimpo = identificador.replace(/\D/g, '');
    const ehCpf = cpfLimpo.length === 11 && !identificador.includes('@');

    let data;
    let error;

    if (ehCpf) {
      // LOGIN POR CPF

      // tenta achar exatamente como está salvo no banco (formatado)
      let resultado = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', identificador)   // ex: 396.088.388-94
        .limit(1);

      data = resultado.data;
      error = resultado.error;

      // se não achou, tenta versão somente numeros
      if (!data || data.length === 0) {
        resultado = await supabase
          .from('usuarios')
          .select('*')
          .eq('cpf', cpfLimpo)    
          .limit(1);

        data = resultado.data;
        error = resultado.error;
      }
    } else {
      // LOGIN POR E-MAIL 
      const resultado = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', identificador)
        .limit(1);

      data = resultado.data;
      error = resultado.error;
    }

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
        cpf: usuario.cpf,
        telefone: usuario.telefone
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});
