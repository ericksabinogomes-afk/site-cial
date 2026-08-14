const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

    // Gerar hash da senha
    const saltRounds = 10;
    const senhaHash = bcrypt.hashSync(senha, saltRounds);
    
    // Inserir na tabela usuarios
    const { data: usuarios, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        senha: senhaHash,            // HASH
        cpf,
        telefone,
        whastapp: whatsapp, 
        tipo: tipo_pessoa   // Fisica / Juridica
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

/*==========================================================
    UPLOAD DE IMAGENS (LOCAL)
==========================================================*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // pasta uploads/
  },
  filename: (req, file, cb) => {
    const nome = Date.now() + '-' + file.originalname;
    cb(null, nome);
  }
});

const upload = multer({ storage });
const uploadMultiplas = multer({
  storage

});

// ==========================================================
// UPLOAD DE UMA IMAGEM
// ==========================================================

app.post(
  '/upload-imagem',
  autenticarToken,
  upload.single('imagem'),
  (req, res) => {

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        erro: 'Nenhum arquivo enviado'
      });
    }

    const baseUrl =
      process.env.BASE_URL || 'http://localhost:4000';

    const url =
      `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      ok: true,
      url
    });
  }
);


// ==========================================================
// UPLOAD DE MÚLTIPLAS IMAGENS
// ==========================================================

app.post(
  '/upload-imagens',
  autenticarToken,
  uploadMultiplas.array('imagens', 10),
  (req, res) => {

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        erro: 'Nenhuma imagem enviada'
      });
    }

    const baseUrl =
      process.env.BASE_URL || 'http://localhost:4000';

    const urls = req.files.map(file => {
      return `${baseUrl}/uploads/${file.filename}`;
    });

    res.json({
      ok: true,
      urls
    });
  }
);


// ==========================================================
// SERVIR IMAGENS
// ==========================================================

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

  // ==========================================================
// UPLOAD DE MÚLTIPLAS IMAGENS
// ==========================================================

app.post(
  '/upload-imagens',
  autenticarToken,
  uploadMultiplas.array('imagens', 10),
  (req, res) => {

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        erro: 'Nenhuma imagem enviada'
      });
    }

    const baseUrl =
      process.env.BASE_URL || "http://localhost:4000";

    const urls = req.files.map(file => {
      return `${baseUrl}/uploads/${file.filename}`;
    });

    res.json({
      ok: true,
      urls
    });
  }
);

  const baseUrl = process.env.BASE_URL || "http://localhost:4000";

  // URL pública completa
  const url = `${baseUrl}/uploads/${req.file.filename}`;

  res.json({ ok: true, url });



// servir a pasta de uploads como arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ ok: false, erro: 'Token não informado' });
  }

  const [, token] = authHeader.split(' '); // "Bearer token"

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // se você quiser acessar depois (id, tipo, etc.)
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, erro: 'Token inválido ou expirado' });
  }
}



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

// Listar todos (para o admin)
app.get('/admin/produtos', autenticarToken , async (req, res) => {
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
app.post('/admin/produtos', autenticarToken , async (req, res) => {
  const {
    nome,
    codigo,
    categoria,
    preco,
    estoque,
    imagem,
    imagens,
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
        imagens: Array.isArray(imagens) ? imagens : [],
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
app.put('/admin/produtos/:id', autenticarToken ,  async (req, res) => {
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
app.delete('/admin/produtos/:id', autenticarToken , async (req, res) => {
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
    FAVORITOS
==========================================================*/

// Listar favoritos do usuário logado
app.get('/favoritos', autenticarToken, async (req, res) => {

    const usuarioId = req.usuario.id;

    try {

        const { data, error } = await supabase

            .from('favoritos')

            .select(`
                id,
                produto_id,
                created_at,
                produtos (*)
            `)

            .eq('usuario_id', usuarioId)

            .order('created_at', {
                ascending: false
            });


        if (error) {

            console.error(
                'Erro ao buscar favoritos:',
                error
            );

            return res.status(500).json({
                ok: false,
                erro: error.message
            });

        }


        res.json({
            ok: true,
            data
        });


    } catch (err) {

        console.error(
            'Erro inesperado nos favoritos:',
            err
        );

        res.status(500).json({
            ok: false,
            erro: err.message
        });

    }

});


// Adicionar produto aos favoritos
app.post('/favoritos', autenticarToken, async (req, res) => {

    const usuarioId = req.usuario.id;

    const {
        produto_id
    } = req.body;


    if (!produto_id) {

        return res.status(400).json({
            ok: false,
            erro: 'Produto não informado'
        });

    }


    try {

        const { data, error } = await supabase

            .from('favoritos')

            .insert([{

                usuario_id: usuarioId,

                produto_id: Number(produto_id)

            }])

            .select();


        if (error) {

            // Produto já está favoritado
            if (error.code === '23505') {

                return res.status(409).json({
                    ok: false,
                    erro: 'Produto já está nos favoritos'
                });

            }


            console.error(
                'Erro ao adicionar favorito:',
                error
            );

            return res.status(500).json({
                ok: false,
                erro: error.message
            });

        }


        res.status(201).json({
            ok: true,
            data
        });


    } catch (err) {

        console.error(
            'Erro inesperado ao adicionar favorito:',
            err
        );

        res.status(500).json({
            ok: false,
            erro: err.message
        });

    }

});


// Remover produto dos favoritos
app.delete(
    '/favoritos/:produto_id',
    autenticarToken,
    async (req, res) => {

        const usuarioId = req.usuario.id;

        const produtoId =
            parseInt(
                req.params.produto_id,
                10
            );


        if (!produtoId) {

            return res.status(400).json({
                ok: false,
                erro: 'ID do produto inválido'
            });

        }


        try {

            const { error } = await supabase

                .from('favoritos')

                .delete()

                .eq('usuario_id', usuarioId)

                .eq('produto_id', produtoId);


            if (error) {

                console.error(
                    'Erro ao remover favorito:',
                    error
                );

                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });

            }


            res.json({
                ok: true
            });


        } catch (err) {

            console.error(
                'Erro inesperado ao remover favorito:',
                err
            );

            res.status(500).json({
                ok: false,
                erro: err.message
            });

        }

    }
);

/*==========================================================
    Login
==========================================================*/

app.post('/login', async (req, res) => {
  const { identificador, senha } = req.body;

  if (!identificador || !senha) {
    return res.status(400).json({ ok: false, erro: 'Informe identificador e senha' });
  }

  try {
    const cpfLimpo = identificador.replace(/\D/g, '');
    const ehCpf = cpfLimpo.length === 11 && !identificador.includes('@');

    let data;
    let error;

    if (ehCpf) {
      // LOGIN POR CPF (formatado e só números)
      let resultado = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', identificador)
        .limit(1);

      data = resultado.data;
      error = resultado.error;

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

    // Comparar senha digitada com o hash
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ ok: false, erro: 'Senha inválida' });
    }

// ====== Gerar token JWT ======
const token = jwt.sign(
  {
    id: usuario.id,
    email: usuario.email,
    tipo: usuario.tipo || null,      // Fisica / Juridica
    perfil: usuario.perfil || 'cliente'   // admin / cliente
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

res.json({
  ok: true,
  token,
  usuario: {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    telefone: usuario.telefone,
    tipo: usuario.tipo || null,           // Fisica / Juridica
    perfil: usuario.perfil || 'cliente'   // admin / cliente
  }
});

  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});



const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
