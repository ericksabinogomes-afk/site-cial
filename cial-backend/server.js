const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RecuperacaoRoute = require('./RecuperacaoRoute');

const app = express();
const axios = require('axios');
app.use(cors());
app.use(express.json());
app.use('/api', RecuperacaoRoute);

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
        tipo: tipo_pessoa,   // Fisica / Juridica
        perfil: "cliente"
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

app.put("/meus-dados/:id", autenticarToken, async (req, res) => {
  const usuarioId = Number(req.params.id);
  const { nome, telefone } = req.body;

  if (!usuarioId) {
    return res.status(400).json({
      ok: false,
      erro: "ID inválido"
    });
  }

  // Cliente só pode editar a própria conta.
  if (req.usuario.id !== usuarioId) {
    return res.status(403).json({
      ok: false,
      erro: "Você não tem permissão para editar estes dados"
    });
  }

  if (!nome) {
    return res.status(400).json({
      ok: false,
      erro: "Nome é obrigatório"
    });
  }

  try {
    const { error } = await supabase
      .from("usuarios")
      .update({
        nome,
        telefone
      })
      .eq("id", usuarioId);

    if (error) {
      return res.status(500).json({
        ok: false,
        erro: error.message
      });
    }



    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      erro: err.message
    });
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

// servir a pasta de uploads como arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));






function autenticarToken(req, res, next) {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            erro: "Token não informado"
        });
    }

    const token = authHeader.substring(7);

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = payload;

        next();
    } catch (err) {
        return res.status(401).json({
            ok: false,
            erro: "Token inválido ou expirado"
        });
    }
}

async function exigirAdmin(req, res, next) {
  try {
    const usuarioId = Number(req.usuario.id);

    console.log("Validando administrador:", {
      usuarioId,
      payload: req.usuario
    });

    if (!Number.isInteger(usuarioId)) {
      return res.status(401).json({
        ok: false,
        erro: "Usuário inválido"
      });
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("id, email, perfil")
      .eq("id", usuarioId)
      .single();

    console.log("Usuário encontrado:", {
      usuario,
      error
    });

    if (error || !usuario) {
      return res.status(401).json({
        ok: false,
        erro: "Usuário não encontrado"
      });
    }

    if (usuario.perfil !== "admin") {
      return res.status(403).json({
        ok: false,
        erro: "Acesso permitido somente para administradores"
      });
    }

    req.usuarioAtual = usuario;
    next();

  } catch (err) {
    console.error(
      "Erro ao validar administrador:",
      err
    );

    return res.status(500).json({
      ok: false,
      erro: "Erro ao validar permissão"
    });
  }
}


/*==========================================================
    ROTAS DE PRODUTOS
==========================================================*/

// Listar produtos (apenas ativos)
app.get('/produtos', async (req, res) => {
  try {

    // Buscar produtos ativos
    const { data: produtos, error: erroProdutos } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (erroProdutos) {
      return res.status(500).json({
        ok: false,
        erro: erroProdutos.message
      });
    }

    // Buscar categorias relacionadas aos produtos
    const { data: relacoes, error: erroRelacoes } = await supabase
      .from('produto_categorias')
      .select('produto_id, categoria_id');

    if (erroRelacoes) {
      return res.status(500).json({
        ok: false,
        erro: erroRelacoes.message
      });
    }

    // Buscar categorias
    const { data: categorias, error: erroCategorias } = await supabase
      .from('categorias')
      .select('id, slug');

    if (erroCategorias) {
      return res.status(500).json({
        ok: false,
        erro: erroCategorias.message
      });
    }

    // Montar as categorias de cada produto
    const produtosComCategorias = (produtos || []).map(produto => {

      const categoriasDoProduto = (relacoes || [])
        .filter(relacao => relacao.produto_id === produto.id)
        .map(relacao => {

          const categoria = (categorias || [])
            .find(cat => cat.id === relacao.categoria_id);

          return categoria ? categoria.slug : null;

        })
        .filter(Boolean);

      return {
        ...produto,
        categorias: categoriasDoProduto
      };

    });

    res.json({
      ok: true,
      data: produtosComCategorias
    });

  } catch (err) {

    console.error('Erro ao listar produtos públicos:', err);

    res.status(500).json({
      ok: false,
      erro: err.message
    });

  }
});

// Listar todos (para o admin)
app.get(
  "/admin/produtos",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("created_at", {
          ascending: false
        });

      if (error) {
        console.error(
          "Erro Supabase em GET /admin/produtos:",
          error
        );

        return res.status(500).json({
          ok: false,
          erro: error.message,
          detalhes: error.details,
          hint: error.hint,
          codigo: error.code
        });
      }

      return res.json({
        ok: true,
        data: data || []
      });

    } catch (err) {
      console.error(
        "Erro inesperado em GET /admin/produtos:",
        err
      );

      return res.status(500).json({
        ok: false,
        erro: err.message
      });
    }
  }
);

// EXCLUIR PRODUTO
app.delete(
  "/admin/produtos/:id",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Exemplo com Supabase:
      const { data, error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id)
        .select();

      if (error || !data || data.length === 0) {
        return res.status(404).json({
          ok: false,
          erro: "Produto não encontrado ou erro ao excluir"
        });
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      res.status(500).json({
        ok: false,
        erro: "Erro interno ao excluir produto"
      });
    }
  }
);

// ==========================================================
// CATEGORIAS PÚBLICAS
// ==========================================================

// Listar categorias para o site público
app.get("/categorias", async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("categorias")
      .select("id, nome, slug, grupo")
      .order("nome", { ascending: true });

    if (error) {
      console.error(
        "Erro ao buscar categorias públicas:",
        error
      );

      return res.status(500).json({
        ok: false,
        erro: error.message
      });
    }

    return res.json({
      ok: true,
      data: data || []
    });

  } catch (err) {

    console.error(
      "Erro inesperado ao listar categorias públicas:",
      err
    );

    return res.status(500).json({
      ok: false,
      erro: err.message
    });
  }
});

// ==========================================================
// CATEGORIAS DO ADMIN
// ==========================================================

// LISTAR CATEGORIAS
app.get(
  "/admin/categorias",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {

    try {

      // Buscar categorias já cadastradas
      const { data: categoriasExistentes, error: erroCategorias } =
        await supabase
          .from("categorias")
          .select("id, nome, slug, grupo")
          .order("nome", { ascending: true });

      if (erroCategorias) {
        console.error(
          "Erro ao buscar categorias:",
          erroCategorias
        );

        return res.status(500).json({
          ok: false,
          erro: erroCategorias.message
        });
      }

      // Buscar categorias que já existem nos produtos
      const { data: produtos, error: erroProdutos } =
        await supabase
          .from("produtos")
          .select("categoria");

      if (erroProdutos) {
        return res.status(500).json({
          ok: false,
          erro: erroProdutos.message
        });
      }

      // Categorias já cadastradas na tabela
      const nomesExistentes = new Set(
        (categoriasExistentes || []).map(categoria =>
          String(categoria.nome).trim()
        )
      );

      // Descobrir categorias que existem nos produtos
      const categoriasDosProdutos = [
        ...new Set(
          (produtos || [])
            .map(produto =>
              String(produto.categoria || "").trim()
            )
            .filter(Boolean)
        )
      ];

      // Criar automaticamente na tabela categorias
      // aquilo que já existe nos produtos
      const novasCategorias =
        categoriasDosProdutos
          .filter(nome => !nomesExistentes.has(nome))
          .map(nome => ({
            nome,
            slug: nome
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
            grupo: "Produtos"
          }));

      if (novasCategorias.length > 0) {

        const { error: erroInsercao } =
          await supabase
            .from("categorias")
            .insert(novasCategorias);

        if (erroInsercao) {
          console.error(
            "Erro ao sincronizar categorias:",
            erroInsercao
          );

          return res.status(500).json({
            ok: false,
            erro: erroInsercao.message
          });
        }
      }

      // Buscar novamente depois da sincronização
      const { data: categorias, error: erroFinal } =
        await supabase
          .from("categorias")
          .select("id, nome, slug, grupo")
          .order("nome", { ascending: true });

      if (erroFinal) {
        return res.status(500).json({
          ok: false,
          erro: erroFinal.message
        });
      }

      // Montar contagem de produtos por categoria
      const contagem = {};

      (produtos || []).forEach(produto => {

        const categoria =
          String(produto.categoria || "").trim();

        if (!categoria) {
          return;
        }

        contagem[categoria] =
          (contagem[categoria] || 0) + 1;

      });

      const resultado =
        (categorias || []).map(categoria => ({
          id: categoria.id,
          nome: categoria.nome,
          slug: categoria.slug,
          grupo: categoria.grupo,
          produtos: contagem[categoria.nome] || 0
        }));

      return res.json({
        ok: true,
        data: resultado
      });

    } catch (err) {

      console.error(
        "Erro inesperado ao listar categorias:",
        err
      );

      return res.status(500).json({
        ok: false,
        erro: err.message
      });

    }
  }
);


// ==========================================================
// CRIAR CATEGORIA
// ==========================================================

app.post(
  "/admin/categorias",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {

    try {

      const nome =
        String(req.body.nome || "").trim();

      const grupo =
        String(req.body.grupo || "Produtos").trim();

      if (!nome) {
        return res.status(400).json({
          ok: false,
          erro: "Nome da categoria é obrigatório"
        });
      }

      const { data: existente } =
        await supabase
          .from("categorias")
          .select("id")
          .eq("nome", nome)
          .maybeSingle();

      if (existente) {
        return res.status(409).json({
          ok: false,
          erro: "Essa categoria já existe"
        });
      }

      const slug =
        nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const { data, error } =
        await supabase
          .from("categorias")
          .insert([{
            nome,
            slug,
            grupo
          }])
          .select("id, nome, slug, grupo")
          .single();

      if (error) {
        return res.status(500).json({
          ok: false,
          erro: error.message
        });
      }

      return res.status(201).json({
        ok: true,
        data
      });

    } catch (err) {

      console.error(
        "Erro ao criar categoria:",
        err
      );

      return res.status(500).json({
        ok: false,
        erro: err.message
      });

    }
  }
);


// ==========================================================
// EDITAR CATEGORIA
// ==========================================================

app.put(
  "/admin/categorias/:id",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {

    try {

      const categoriaId =
        Number.parseInt(req.params.id, 10);

      const novoNome =
        String(req.body.nome || "").trim();

      const novoGrupo =
        String(req.body.grupo || "Produtos").trim();

      if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({
          ok: false,
          erro: "ID da categoria inválido"
        });
      }

      if (!novoNome) {
        return res.status(400).json({
          ok: false,
          erro: "Nome da categoria é obrigatório"
        });
      }

      // Buscar categoria atual
      const { data: categoriaAtual, error: erroBusca } =
        await supabase
          .from("categorias")
          .select("id, nome")
          .eq("id", categoriaId)
          .single();

      if (erroBusca || !categoriaAtual) {
        return res.status(404).json({
          ok: false,
          erro: "Categoria não encontrada"
        });
      }

      const slug =
        novoNome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      // Atualizar a categoria
      const { data, error } =
        await supabase
          .from("categorias")
          .update({
            nome: novoNome,
            slug,
            grupo: novoGrupo
          })
          .eq("id", categoriaId)
          .select("id, nome, slug, grupo")
          .single();

      if (error) {
        return res.status(500).json({
          ok: false,
          erro: error.message
        });
      }

      // Atualizar também os produtos que usavam o nome antigo
      const { error: erroProdutos } =
        await supabase
          .from("produtos")
          .update({
            categoria: novoNome
          })
          .eq("categoria", categoriaAtual.nome);

      if (erroProdutos) {
        console.error(
          "Erro ao atualizar produtos da categoria:",
          erroProdutos
        );

        return res.status(500).json({
          ok: false,
          erro: erroProdutos.message
        });
      }

      return res.json({
        ok: true,
        data
      });

    } catch (err) {

      console.error(
        "Erro ao editar categoria:",
        err
      );

      return res.status(500).json({
        ok: false,
        erro: err.message
      });

    }
  }
);


// ==========================================================
// EXCLUIR CATEGORIA
// ==========================================================

app.delete(
  "/admin/categorias/:id",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {

    try {

      const categoriaId =
        Number.parseInt(req.params.id, 10);

      if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({
          ok: false,
          erro: "ID da categoria inválido"
        });
      }

      // Buscar categoria
      const { data: categoria, error: erroCategoria } =
        await supabase
          .from("categorias")
          .select("id, nome")
          .eq("id", categoriaId)
          .single();

      if (erroCategoria || !categoria) {
        return res.status(404).json({
          ok: false,
          erro: "Categoria não encontrada"
        });
      }

      // Verificar se existem produtos usando essa categoria
      const { data: produtos, error: erroProdutos } =
        await supabase
          .from("produtos")
          .select("id")
          .eq("categoria", categoria.nome);

      if (erroProdutos) {
        return res.status(500).json({
          ok: false,
          erro: erroProdutos.message
        });
      }

      if (produtos && produtos.length > 0) {
        return res.status(409).json({
          ok: false,
          erro:
            `Não é possível excluir "${categoria.nome}" porque existem ${produtos.length} produto(s) usando essa categoria.`
        });
      }

      // Excluir categoria
      const { error } =
        await supabase
          .from("categorias")
          .delete()
          .eq("id", categoriaId);

      if (error) {
        return res.status(500).json({
          ok: false,
          erro: error.message
        });
      }

      return res.json({
        ok: true,
        mensagem: "Categoria excluída com sucesso"
      });

    } catch (err) {

      console.error(
        "Erro ao excluir categoria:",
        err
      );

      return res.status(500).json({
        ok: false,
        erro: err.message
      });

    }
  }
);

// Criar produto (admin)
app.post(
    "/admin/produtos",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {

const {
    nome,
    codigo,
    categoria,
    categorias,
   especificacoes,
    preco,
    estoque,
    imagem,
    imagens,
    selo,
    destaque,

    descricao,
    funcao,

    linhaProduto,

    descricaoStihl,
    aplicacaoStihl,

    marcaBomba,
    potenciaBomba,
    vazaoBomba,
    aplicacaoBomba,

    marcaIrrigacao,
    tipoIrrigacao
} = req.body;

// Aceita tanto categoria única quanto as categorias do novo formulário
const categoriaFinal =
    categoria ||
    (Array.isArray(categorias) && categorias.length > 0
        ? categorias[0]
        : "");

 if (!nome || !categoriaFinal || preco == null) {
    return res.status(400).json({
      ok: false,
      erro: 'Informe nome, categoria e preço'
    });
}

  try {
 const { data, error } = await supabase
    .from('produtos')
    .insert([{
        nome,
        codigo: codigo || `CIAL-${Date.now()}`,
        categoria: categoriaFinal,
        preco: Number(preco),
        estoque: estoque || 'Em estoque',
        imagem: imagem || '',
        imagens: Array.isArray(imagens) ? imagens : [],
        selo: selo || null,
        destaque: !!destaque,
        especificacoes: especificacoes || {},
        ativo: true,
       descricao: descricao || "",
       funcao: funcao || "",

      descricao_stihl: descricaoStihl || "",
      linha_produto: linhaProduto || "",
      aplicacao_stihl: aplicacaoStihl || "",

      marca_bomba: marcaBomba || "",
      potencia_bomba: potenciaBomba || "",
      vazao_bomba: vazaoBomba || "",
      aplicacao_bomba: aplicacaoBomba || "",

      marca_irrigacao: marcaIrrigacao || "",
      tipo_irrigacao: tipoIrrigacao || ""
    }])
    .select("*")
    .single();


   if (error) {
  return res.status(500).json({
    ok: false,
    erro: error.message
  });
}


/*==================================================
    SALVAR TODAS AS CATEGORIAS DO PRODUTO
==================================================*/

const categoriasSelecionadas =
  Array.isArray(categorias)
    ? categorias.filter(Boolean)
    : categoriaFinal
      ? [categoriaFinal]
      : [];


if (categoriasSelecionadas.length > 0) {

  /* Buscar os IDs das categorias pelo slug */

  const {
    data: categoriasBanco,
    error: erroCategorias
  } = await supabase
    .from("categorias")
    .select("id, slug")
    .in("slug", categoriasSelecionadas);


  if (erroCategorias) {

    console.error(
      "Erro ao buscar categorias:",
      erroCategorias
    );

    /* desfaz o produto criado */

    await supabase
      .from("produtos")
      .delete()
      .eq("id", data.id);

    return res.status(500).json({
      ok: false,
      erro: erroCategorias.message
    });

  }


  /* Verificar se todas as categorias existem */

  console.log("🔎 CATEGORIAS SELECIONADAS:", categoriasSelecionadas);
console.log("🔎 CATEGORIAS ENCONTRADAS NO BANCO:", categoriasBanco);


  if (
    !categoriasBanco ||
    categoriasBanco.length !==
      categoriasSelecionadas.length
  ) {

    await supabase
      .from("produtos")
      .delete()
      .eq("id", data.id);

    return res.status(400).json({
      ok: false,
      erro:
        "Uma ou mais categorias selecionadas não foram encontradas."
    });

  }


  /* Montar relações */

  const relacoesCategorias =
    categoriasBanco.map(categoria => ({
      produto_id: data.id,
      categoria_id: categoria.id
    }));


  /* Gravar relações */

  const {
    error: erroRelacoes
  } = await supabase
    .from("produto_categorias")
    .insert(relacoesCategorias);


  if (erroRelacoes) {

    console.error(
      "Erro ao salvar categorias do produto:",
      erroRelacoes
    );

    /* desfaz o produto criado */

    await supabase
      .from("produtos")
      .delete()
      .eq("id", data.id);

    return res.status(500).json({
      ok: false,
      erro: erroRelacoes.message
    });

  }

}


return res.status(201).json({
  ok: true,
  data
});
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// Atualizar produto (admin)
app.put(
  "/admin/produtos/:id",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {
    const produtoId = Number.parseInt(req.params.id, 10);

    const {
      nome,
      codigo,
      categoria,
      categorias,
      preco,
      estoque,
      imagem,
      imagens,
      selo,
      destaque,
      especificacoes,
      ativo,
      descricao,
      funcao,
      linhaProduto,
      descricaoStihl,
      aplicacaoStihl,
      marcaBomba,
      potenciaBomba,
      vazaoBomba,
      aplicacaoBomba,
      marcaIrrigacao,
      tipoIrrigacao
    } = req.body;

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return res.status(400).json({
        ok: false,
        erro: "ID inválido"
      });
    }

    const dadosAtualizacao = {};

    if (nome !== undefined) {
      dadosAtualizacao.nome = nome;
    }

    if (codigo !== undefined) {
      dadosAtualizacao.codigo = codigo;
    }

    if (categoria !== undefined) {
      dadosAtualizacao.categoria = categoria;
    }

    if (preco !== undefined) {
      const precoNumerico = Number(preco);

      if (!Number.isFinite(precoNumerico)) {
        return res.status(400).json({
          ok: false,
          erro: "Preço inválido"
        });
      }

      dadosAtualizacao.preco = precoNumerico;
    }

    if (estoque !== undefined) {
      dadosAtualizacao.estoque = estoque;
    }

    if (imagem !== undefined) {
      dadosAtualizacao.imagem = imagem;
    }

    if (imagens !== undefined) {
      dadosAtualizacao.imagens = Array.isArray(imagens)
        ? imagens
        : [];
    }

    if (selo !== undefined) {
      dadosAtualizacao.selo = selo;
    }

    if (destaque !== undefined) {
      dadosAtualizacao.destaque = Boolean(destaque);
    }
    
   if (especificacoes !== undefined) {
    dadosAtualizacao.especificacoes = especificacoes || {};
    }

    if (ativo !== undefined) {
      dadosAtualizacao.ativo = Boolean(ativo);
    }

    if (descricao !== undefined) {
      dadosAtualizacao.descricao = descricao;
    }

    if (funcao !== undefined) {
      dadosAtualizacao.funcao = funcao;
    }

    if (linhaProduto !== undefined) {
    dadosAtualizacao.linha_produto = linhaProduto;
   }

    if (descricaoStihl !== undefined) {
      dadosAtualizacao.descricao_stihl = descricaoStihl;
    }

    if (aplicacaoStihl !== undefined) {
      dadosAtualizacao.aplicacao_stihl = aplicacaoStihl;
    }

    if (marcaBomba !== undefined) {
      dadosAtualizacao.marca_bomba = marcaBomba;
    }

    if (potenciaBomba !== undefined) {
      dadosAtualizacao.potencia_bomba = potenciaBomba;
    }

    if (vazaoBomba !== undefined) {
      dadosAtualizacao.vazao_bomba = vazaoBomba;
    }

    if (aplicacaoBomba !== undefined) {
      dadosAtualizacao.aplicacao_bomba = aplicacaoBomba;
    }

    if (marcaIrrigacao !== undefined) {
      dadosAtualizacao.marca_irrigacao = marcaIrrigacao;
    }

    if (tipoIrrigacao !== undefined) {
      dadosAtualizacao.tipo_irrigacao = tipoIrrigacao;
    }

    if (Object.keys(dadosAtualizacao).length === 0) {
      return res.status(400).json({
        ok: false,
        erro: "Nenhum campo informado para atualização"
      });
    }

    try {
      const { data, error } = await supabase
        .from("produtos")
        .update(dadosAtualizacao)
        .eq("id", produtoId)
        .select("*")
        .single();

      if (error) {
        console.error("Erro ao atualizar produto:", error);

        return res.status(500).json({
          ok: false,
          erro: error.message
        });
      }



      // ==========================================================
      // ATUALIZAR CATEGORIAS DO PRODUTO
      // ==========================================================

          // ==========================================================
      // ATUALIZAR CATEGORIAS DO PRODUTO
      // ==========================================================

      if (Array.isArray(categorias)) {

        const categoriasSelecionadas =
          categorias
            .filter(Boolean)
            .map(slug => String(slug).trim());

        console.log(
          "🔎 CATEGORIAS RECEBIDAS NO PUT:",
          categoriasSelecionadas
        );

        // Se não houver categorias selecionadas,
        // remove todas as relações do produto.
        if (categoriasSelecionadas.length === 0) {

          const { error: erroRemoverCategorias } =
            await supabase
              .from("produto_categorias")
              .delete()
              .eq("produto_id", produtoId);

          if (erroRemoverCategorias) {
            console.error(
              "Erro ao remover categorias:",
              erroRemoverCategorias
            );

            return res.status(500).json({
              ok: false,
              erro: erroRemoverCategorias.message
            });
          }

        } else {

          // Buscar TODAS as categorias selecionadas
          const {
            data: categoriasBanco,
            error: erroCategorias
          } = await supabase
            .from("categorias")
            .select("id, slug")
            .in("slug", categoriasSelecionadas);

          if (erroCategorias) {

            console.error(
              "Erro ao buscar categorias:",
              erroCategorias
            );

            return res.status(500).json({
              ok: false,
              erro: erroCategorias.message
            });
          }

          console.log(
            "🔎 CATEGORIAS ENCONTRADAS NO BANCO:",
            categoriasBanco
          );

          // IMPORTANTE:
          // Só altera as relações se TODAS as categorias
          // selecionadas realmente existirem.
          if (
            !categoriasBanco ||
            categoriasBanco.length !==
              categoriasSelecionadas.length
          ) {

            console.error(
              "❌ CATEGORIAS NÃO ENCONTRADAS:",
              {
                selecionadas: categoriasSelecionadas,
                encontradas: categoriasBanco
              }
            );

            return res.status(400).json({
              ok: false,
              erro:
                "Uma ou mais categorias selecionadas não foram encontradas."
            });
          }

          // Montar relações
          const relacoesCategorias =
            categoriasBanco.map(categoria => ({
              produto_id: produtoId,
              categoria_id: categoria.id
            }));

          // Agora sim remove as relações antigas
          const {
            error: erroRemoverCategorias
          } = await supabase
            .from("produto_categorias")
            .delete()
            .eq("produto_id", produtoId);

          if (erroRemoverCategorias) {

            console.error(
              "Erro ao remover categorias antigas:",
              erroRemoverCategorias
            );

            return res.status(500).json({
              ok: false,
              erro: erroRemoverCategorias.message
            });
          }

          // Gravar TODAS as novas relações
          const {
            error: erroInserirCategorias
          } = await supabase
            .from("produto_categorias")
            .insert(relacoesCategorias);

          if (erroInserirCategorias) {

            console.error(
              "Erro ao inserir categorias:",
              erroInserirCategorias
            );

            return res.status(500).json({
              ok: false,
              erro: erroInserirCategorias.message
            });
          }

          console.log(
            "✅ CATEGORIAS SALVAS:",
            relacoesCategorias
          );
        }
      }
      
      
      return res.json({
        ok: true,
        data
      });
    } catch (err) {
      console.error("Erro inesperado ao atualizar produto:", err);

      return res.status(500).json({
        ok: false,
        erro: err.message
      });
    }
  }
);

// Remover favorito do usuário
app.delete("/favoritos/:produto_id", autenticarToken, async (req, res) => {

    const produtoId = Number(req.params.produto_id);

    if (!produtoId) {

        return res.status(400).json({
            ok: false,
            erro: "ID do produto inválido"
        });

    }

    try {

        const { error } = await supabase
            .from("favoritos")
            .delete()
            .eq("produto_id", produtoId)
            .eq("usuario_id", req.usuario.id);

        if (error) {

            return res.status(500).json({
                ok: false,
                erro: error.message
            });

        }

        return res.json({
            ok: true
        });

    } catch (err) {

        return res.status(500).json({
            ok: false,
            erro: err.message
        });

    }

});

/*==========================================================
    FAVORITOS
==========================================================*/

// Listar favoritos do usuário logado
app.get("/favoritos", autenticarToken, async (req, res) => {

    try {

        const usuarioId = req.usuario.id;

        const { data, error } = await supabase
            .from("favoritos")
            .select(`
                id,
                produto_id,
                produto_nome,
                produto_imagem,
                produto_preco,
                produto_slug,
                created_at
            `)
            .eq("usuario_id", usuarioId)
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "Erro ao buscar favoritos:",
                error
            );

            return res.status(500).json({
                ok: false,
                erro: error.message
            });
        }

        return res.json({
            ok: true,
            data: data || []
        });

    } catch (err) {

        console.error(
            "Erro inesperado ao buscar favoritos:",
            err
        );

        return res.status(500).json({
            ok: false,
            erro: err.message
        });
    }
});

// Adicionar favorito
app.post("/favoritos", autenticarToken, async (req, res) => {

    console.log("🔥🔥🔥 ROTA FAVORITOS NOVA FOI CHAMADA 🔥🔥🔥");
    const produtoId = Number(req.body.produto_id);

    if (!produtoId) {
        return res.status(400).json({
            ok: false,
            erro: "Produto não informado"
        });
    }

    try {

        // Buscar o produto
        const { data: produto, error: produtoError } = await supabase
            .from("produtos")
            .select("id, nome, imagem, preco")
            .eq("id", produtoId)
            .single();

        if (produtoError || !produto) {
            return res.status(404).json({
                ok: false,
                erro: "Produto não encontrado"
            });
        }

        // TESTE
        console.log("========== TESTE FAVORITO ==========");
        console.log("BODY RECEBIDO:", req.body);
        console.log("PRODUTO ENCONTRADO:", produto);
        console.log("====================================");

        // Salvar favorito
        const { data, error } = await supabase
            .from("favoritos")
            .insert([{
                usuario_id: req.usuario.id,
                produto_id: produto.id,
                produto_nome: produto.nome,
                produto_imagem: produto.imagem || null,
                produto_preco: Number(produto.preco) || 0
            }])
            .select();

        if (error) {
            console.error("Erro ao adicionar favorito:", error);

            return res.status(500).json({
                ok: false,
                erro: error.message
        
              });
        }

        return res.status(201).json({
            ok: true,
            data
        });

    } catch (err) {

        console.error("Erro inesperado ao adicionar favorito:", err);

        return res.status(500).json({
            ok: false,
            erro: err.message
     
          });
   
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

    const hashDaSenha = usuario.password || usuario.senha;

    if (!hashDaSenha) {
      return res.status(401).json({
        ok: false,
        erro: 'Senha não cadastrada para este usuário'
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      hashDaSenha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        ok: false,
        erro: 'Senha inválida'
      });
    }
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



/*==========================================================
  PEDIDOS DO CLIENTE
==========================================================*/

app.get("/pedidos", autenticarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        *,
        pedido_itens (
          id,
          produto_nome,
          quantidade,
          preco_unitario
        )
      `)
      .eq("usuario_id", req.usuario.id)
      .order("data_pedido", { ascending: false });

    if (error) {
      return res.status(500).json({
        ok: false,
        erro: error.message
      });
    }

    return res.json({
      ok: true,
      data
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      erro: err.message
    });
  }
});


/*==========================================================
  GARANTIAS DO CLIENTE
==========================================================*/

app.get("/garantias", autenticarToken, async (req, res) => {

  try {

    const usuarioId =
      Number(req.usuario.id);

    const {
      data: garantias,
      error
    } = await supabase
      .from("garantias")
      .select(`
        id,
        pedido_id,
        unidade,
        usuario_id,
        "nome do produto",
        data_compra,
        meses_garantia,
        vencimento
      `)
      .eq("usuario_id", usuarioId)
      .order("data_compra", {
        ascending: false
      });

    if (error) {

      console.error(
        "Erro ao buscar garantias:",
        error
      );

      return res.status(500).json({
        ok: false,
        erro: error.message
      });
    }

    return res.json({
      ok: true,
      data: garantias || []
    });

  } catch (err) {

    console.error(
      "Erro inesperado ao buscar garantias:",
      err
    );

    return res.status(500).json({
      ok: false,
      erro: err.message
    });
  }
});

/*==========================================================
  ORÇAMENTOS DO CLIENTE
==========================================================*/

app.get("/orcamentos", autenticarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orcamentos")
      .select("*")
      .eq("usuario_id", req.usuario.id)
      .order("data_solicitacao", { ascending: false });

    if (error) {
      return res.status(500).json({
        ok: false,
        erro: error.message
      });
    }

    return res.json({
      ok: true,
      data
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      erro: err.message
    });
  }
});





/*==========================================================
    CONTROLE DE USUÁRIOS
==========================================================*/


// Listar usuários

app.get(
    "/admin/usuarios",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {
        try {
            const { data, error } = await supabase
                .from("usuarios")
                .select(`
                    id,
                    nome,
                    email,
                    cpf,
                    telefone,
                    tipo,
                    perfil,
                    created_at
                `)
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                console.error(
                    "Erro ao listar usuários:",
                    error
                );

                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            return res.json({
                ok: true,
                data: data || []
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao listar usuários"
            });
        }
    }
);

// TROCAR DE PERFIL


app.patch(
    "/admin/usuarios/:id/perfil",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {
        try {
            const usuarioId = Number(req.params.id);
            const { perfil } = req.body;

            if (!Number.isInteger(usuarioId)) {
                return res.status(400).json({
                    ok: false,
                    erro: "ID de usuário inválido"
                });
            }

            if (!["cliente", "admin"].includes(perfil)) {
                return res.status(400).json({
                    ok: false,
                    erro: "Perfil deve ser cliente ou admin"
                });
            }

            if (
                Number(req.usuario.id) === usuarioId
            ) {
                return res.status(400).json({
                    ok: false,
                    erro: "Você não pode alterar o próprio perfil"
                });
            }

            const { data, error } = await supabase
                .from("usuarios")
                .update({
                    perfil
                })
                .eq("id", usuarioId)
                .select(`
                    id,
                    nome,
                    email,
                    perfil
                `)
                .single();

            if (error) {
                console.error(
                    "Erro ao alterar perfil:",
                    error
                );

                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            return res.json({
                ok: true,
                mensagem: "Perfil atualizado com sucesso",
                data
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao alterar perfil"
            });
        }
    }
);




/*==========================================================
    CARRINHO
==========================================================*/

app.get(
    "/carrinho",
    autenticarToken,
    async (req, res) => {
        try {
            const usuarioId =
                Number(req.usuario.id);

            const { data, error } =
                await supabase
                    .from("carrinho_itens")
                    .select(`
                        id,
                        produto_id,
                        quantidade,
                        criado_em,
                        atualizado_em,
                        produtos (
                            id,
                            nome,
                            preco,
                            imagem,
                            estoque,
                            ativo
                        )
                    `)
                    .eq("usuario_id", usuarioId)
                    .order("criado_em", {
                        ascending: true
                    });

            if (error) {
                console.error(
                    "Erro ao buscar carrinho:",
                    error
                );

                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            const itens = (data || [])
                .filter(item => item.produtos)
                .map(item => ({
                    id: item.id,
                    produto_id: item.produto_id,
                    quantidade: item.quantidade,
                    nome: item.produtos.nome,
                    preco: Number(item.produtos.preco),
                    imagem: item.produtos.imagem || "",
                    estoque: item.produtos.estoque,
                    ativo: item.produtos.ativo
                }));

            return res.json({
                ok: true,
                data: itens
            });
        } catch (err) {
            console.error(
                "Erro inesperado ao buscar carrinho:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao buscar carrinho"
            });
        }
    }
);

//  ADICIONAR PRODUTO
app.post(
    "/carrinho",
    autenticarToken,
    async (req, res) => {
        try {
            const usuarioId =
                Number(req.usuario.id);

            const produtoId =
                Number(req.body.produto_id);

            const quantidade =
                Number(req.body.quantidade || 1);

            if (
                !Number.isInteger(produtoId) ||
                produtoId <= 0
            ) {
                return res.status(400).json({
                    ok: false,
                    erro: "Produto inválido"
                });
            }

            if (
                !Number.isInteger(quantidade) ||
                quantidade <= 0
            ) {
                return res.status(400).json({
                    ok: false,
                    erro: "Quantidade inválida"
                });
            }

            const { data: produto, error: produtoError } =
                await supabase
                    .from("produtos")
                    .select("id, nome, estoque, ativo")
                    .eq("id", produtoId)
                    .eq("ativo", true)
                    .single();

            if (
                produtoError ||
                !produto
            ) {
                return res.status(404).json({
                    ok: false,
                    erro: "Produto não encontrado ou inativo"
                });
            }

            const { data: itemExistente, error: buscaError } =
                await supabase
                    .from("carrinho_itens")
                    .select("id, quantidade")
                    .eq("usuario_id", usuarioId)
                    .eq("produto_id", produtoId)
                    .maybeSingle();

            if (buscaError) {
                return res.status(500).json({
                    ok: false,
                    erro: buscaError.message
                });
            }

            let item;

            if (itemExistente) {
                const novaQuantidade =
                    itemExistente.quantidade +
                    quantidade;

                const resultado =
                    await supabase
                        .from("carrinho_itens")
                        .update({
                            quantidade: novaQuantidade,
                            atualizado_em:
                                new Date().toISOString()
                        })
                        .eq("id", itemExistente.id)
                        .eq("usuario_id", usuarioId)
                        .select()
                        .single();

                item = resultado.data;

                if (resultado.error) {
                    return res.status(500).json({
                        ok: false,
                        erro: resultado.error.message
                    });
                }
            } else {
                const resultado =
                    await supabase
                        .from("carrinho_itens")
                        .insert({
                            usuario_id: usuarioId,
                            produto_id: produtoId,
                            quantidade
                        })
                        .select()
                        .single();

                item = resultado.data;

                if (resultado.error) {
                    return res.status(500).json({
                        ok: false,
                        erro: resultado.error.message
                    });
                }
            }

            return res.status(201).json({
                ok: true,
                data: item
            });
        } catch (err) {
            console.error(
                "Erro ao adicionar ao carrinho:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao adicionar ao carrinho"
            });
        }
    }
);

//REMOVER PRODUTO

app.delete(
    "/carrinho/:produtoId",
    autenticarToken,
    async (req, res) => {
        try {
            const usuarioId =
                Number(req.usuario.id);

            const produtoId =
                Number(req.params.produtoId);

            if (
                !Number.isInteger(produtoId) ||
                produtoId <= 0
            ) {
                return res.status(400).json({
                    ok: false,
                    erro: "Produto inválido"
                });
            }

            const { error } =
                await supabase
                    .from("carrinho_itens")
                    .delete()
                    .eq("usuario_id", usuarioId)
                    .eq("produto_id", produtoId);

            if (error) {
                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            return res.json({
                ok: true,
                mensagem: "Item removido do carrinho"
            });
        } catch (err) {
            console.error(
                "Erro ao remover item:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao remover item"
            });
        }
    }
);

// LIMPAR CARRINHO

app.delete(
    "/carrinho",
    autenticarToken,
    async (req, res) => {
        try {
            const usuarioId =
                Number(req.usuario.id);

            const { error } =
                await supabase
                    .from("carrinho_itens")
                    .delete()
                    .eq("usuario_id", usuarioId);

            if (error) {
                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            return res.json({
                ok: true,
                mensagem: "Carrinho limpo"
            });
        } catch (err) {
            console.error(
                "Erro ao limpar carrinho:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro: "Erro interno ao limpar carrinho"
            });
        }
    }
);

/*==========================================================
    ALTERAR QUANTIDADE DO CARRINHO
==========================================================*/

app.patch(
    "/carrinho/:produtoId",
    autenticarToken,
    async (req, res) => {
        try {
            const usuarioId =
                Number(req.usuario.id);

            const produtoId =
                Number(req.params.produtoId);

            const quantidade =
                Number(req.body.quantidade);

            if (
                !Number.isInteger(usuarioId) ||
                usuarioId <= 0
            ) {
                return res.status(401).json({
                    ok: false,
                    erro: "Usuário inválido"
                });
            }

            if (
                !Number.isInteger(produtoId) ||
                produtoId <= 0
            ) {
                return res.status(400).json({
                    ok: false,
                    erro: "Produto inválido"
                });
            }

            if (
                !Number.isInteger(quantidade) ||
                quantidade <= 0
            ) {
                return res.status(400).json({
                    ok: false,
                    erro:
                        "A quantidade deve ser maior que zero"
                });
            }

            const { data, error } =
                await supabase
                    .from("carrinho_itens")
                    .update({
                        quantidade,
                        atualizado_em:
                            new Date().toISOString()
                    })
                    .eq("usuario_id", usuarioId)
                    .eq("produto_id", produtoId)
                    .select()
                    .single();

            if (error) {
                console.error(
                    "Erro ao alterar quantidade:",
                    error
                );

                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    ok: false,
                    erro:
                        "Item não encontrado no carrinho"
                });
            }

            return res.json({
                ok: true,
                data
            });
        } catch (err) {
            console.error(
                "Erro inesperado ao alterar quantidade:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro:
                    "Erro interno ao alterar quantidade"
            });
        }
    }
);





app.post(
  '/pedidos/criar-do-carrinho',
  autenticarToken,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;

      const {
        data: itensCarrinho,
        error: erroCarrinho
      } = await supabase
        .from('carrinho_itens')
        .select(`
          produto_id,
          quantidade,
          produtos (
            id,
            nome,
            preco,
            ativo
          )
        `)
        .eq('usuario_id', usuarioId);

      if (erroCarrinho) {
        throw erroCarrinho;
      }

      if (!itensCarrinho || itensCarrinho.length === 0) {
        return res.status(400).json({
          ok: false,
          erro: 'Seu carrinho está vazio.'
        });
      }

      const itensPedido = itensCarrinho.map(item => {
        const produto = item.produtos;

        if (!produto || !produto.ativo) {
          throw new Error(
            `Produto inválido ou inativo: ${item.produto_id}`
          );
        }

        const quantidade = Number(item.quantidade);
        const precoUnitario = Number(produto.preco);

        if (
          !Number.isInteger(quantidade) ||
          quantidade <= 0
        ) {
          throw new Error(
            `Quantidade inválida para o produto ${produto.nome}.`
          );
        }

        if (
          !Number.isFinite(precoUnitario) ||
          precoUnitario < 0
        ) {
          throw new Error(
            `Preço inválido para o produto ${produto.nome}.`
          );
        }

        return {
          produto_id: produto.id,
          produto_nome: produto.nome,
          quantidade,
          preco_unitario: precoUnitario
        };
      });

      const valorTotal = itensPedido.reduce(
        (total, item) => {
          return total +
            item.quantidade * item.preco_unitario;
        },
        0
      );

      const numeroPedido = `PED-${Date.now()}`;

      const { data: pedido, error: erroPedido } =
        await supabase
          .from('pedidos')
          .insert({
            usuario_id: usuarioId,
            numero: numeroPedido,
            status: 'aguardando_pagamento',
            valor: valorTotal,
            gateway: 'asaas',
            gateway_status: 'PENDING',
            observacoes: req.body.observacoes || null
          })
          .select()
          .single();

      if (erroPedido) {
        throw erroPedido;
      }

      const itensParaInserir = itensPedido.map(item => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        produto_nome: item.produto_nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      }));

      const { error: erroItens } =
        await supabase
          .from('pedido_itens')
          .insert(itensParaInserir);

      if (erroItens) {
        throw erroItens;
      }

      console.log(
        'Pedido criado no Supabase:',
        {
          id: pedido.id,
          numero: pedido.numero,
          valor: pedido.valor,
          usuarioId
        }
      );

      return res.status(201).json({
        ok: true,
        pedido: {
          id: pedido.id,
          numero: pedido.numero,
          valor: pedido.valor
        }
      });
    } catch (erro) {
      console.error(
        'Erro ao criar pedido a partir do carrinho:',
        erro
      );

      return res.status(500).json({
        ok: false,
        erro: 'Não foi possível criar o pedido.',
        detalhes: erro.message
      });
    }
  }
);



/*==========================================================
    DASHBOARD ADMINISTRATIVO
==========================================================*/

app.get(
    "/admin/dashboard",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {

        try {

            /*==================================================
                PRODUTOS
            ==================================================*/

            const {
                data: produtos,
                error: erroProdutos
            } = await supabase
                .from("produtos")
                .select("id, nome, estoque, ativo, preco")
                .eq("ativo", true);

            if (erroProdutos) {
                throw erroProdutos;
            }


            /*==================================================
                CLIENTES
            ==================================================*/

            const {
                count: totalClientes,
                error: erroClientes
            } = await supabase
                .from("usuarios")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("perfil", "cliente");

            if (erroClientes) {
                throw erroClientes;
            }


            /*==================================================
                PEDIDOS
            ==================================================*/

            const {
                data: pedidos,
                error: erroPedidos
            } = await supabase
                .from("pedidos")
                .select(`
                    *,
                    pedido_itens (
                        id,
                        produto_nome,
                        quantidade,
                        preco_unitario
                    )
                `)
                .order("data_pedido", {
                    ascending: false
                });

            if (erroPedidos) {
                throw erroPedidos;
            }


            /*==================================================
                TOTAL DE PEDIDOS
            ==================================================*/

            const totalPedidos =
                (pedidos || []).length;


            /*==================================================
                PEDIDOS DE HOJE
            ==================================================*/

            const inicioHoje =
                new Date();

            inicioHoje.setHours(
                0,
                0,
                0,
                0
            );

            const fimHoje =
                new Date();

            fimHoje.setHours(
                23,
                59,
                59,
                999
            );


            const pedidosHoje =
                (pedidos || []).filter(pedido => {

                    if (!pedido.data_pedido) {
                        return false;
                    }

                    const data =
                        new Date(
                            pedido.data_pedido
                        );

                    return (
                        data >= inicioHoje &&
                        data <= fimHoje
                    );

                }).length;


            /*==================================================
                FATURAMENTO
            ==================================================*/

            let faturamento = 0;

            (pedidos || []).forEach(pedido => {

                const itens =
                    pedido.pedido_itens || [];

                itens.forEach(item => {

                    const quantidade =
                        Number(
                            item.quantidade
                        ) || 0;

                    const preco =
                        Number(
                            item.preco_unitario
                        ) || 0;

                    faturamento +=
                        quantidade * preco;

                });

            });


            /*==================================================
                ESTOQUE BAIXO
            ==================================================*/

            const estoqueBaixo =
                (produtos || []).filter(
                    produto =>
                        String(
                            produto.estoque || ""
                        ).trim().toLowerCase()
                        === "estoque baixo"
                ).length;

          /*==================================================
                ÚLTIMOS PEDIDOS
            ==================================================*/

            const pedidosRecentes =
                (pedidos || []).slice(0, 5);

            /* Buscar nomes dos clientes */

            const idsClientes = [
                ...new Set(
                    pedidosRecentes
                        .map(pedido => pedido.usuario_id)
                        .filter(Boolean)
                )
            ];

            let clientesMap = {};

            if (idsClientes.length > 0) {

                const {
                    data: clientes,
                    error: erroClientesNomes
                } = await supabase
                    .from("usuarios")
                    .select("id, nome")
                    .in("id", idsClientes);

                if (erroClientesNomes) {
                    throw erroClientesNomes;
                }

                (clientes || []).forEach(cliente => {
                    clientesMap[cliente.id] = cliente.nome;
                });
            }


            const ultimosPedidos =
                pedidosRecentes.map(pedido => {

                    let total = 0;

                    (
                        pedido.pedido_itens || []
                    ).forEach(item => {

                        const quantidade =
                            Number(item.quantidade) || 0;

                        const preco =
                            Number(item.preco_unitario) || 0;

                        total += quantidade * preco;
                    });


                    return {

                        id: pedido.id,

                        usuario_id:
                            pedido.usuario_id,

                       cliente:
    clientesMap[pedido.usuario_id] || null,

status:
    pedido.status ||
    pedido.situacao ||
    pedido.estado ||
    null,

                        data_pedido:
                            pedido.data_pedido,

                        total
                    };

                });

            /*==================================================
                RESPOSTA
            ==================================================*/

            return res.json({

                ok: true,

                data: {

                    totalProdutos:
                        (produtos || []).length,

                    totalPedidos,

                    totalClientes:
                        totalClientes || 0,

                    faturamento,

                    pedidosHoje,

                    estoqueBaixo,

                    ultimosPedidos

                }

            });


        } catch (err) {

            console.error(
                "Erro ao carregar Dashboard:",
                err
            );

            return res.status(500).json({

                ok: false,

                erro:
                    err.message ||
                    "Erro ao carregar Dashboard"

            });

        }

    }
);


/*==========================================================
    PAGAMENTOS ASAAS
==========================================================*/

async function buscarPedidoDoUsuarioPorPagamento(
  usuarioId,
  pagamentoId
) {
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select(`
      id,
      usuario_id,
      numero,
      valor,
      status,
      gateway,
      gateway_payment_id,
      gateway_status,
      paid_at
    `)
    .eq('usuario_id', usuarioId)
    .eq('gateway', 'asaas')
    .eq('gateway_payment_id', pagamentoId)
    .single();

  if (error || !pedido) {
    return null;
  }

  return pedido;
}


/*==========================================================
    CONSULTAR COBRANÇA DO USUÁRIO
==========================================================*/

app.get(
  '/api/asaas/cobrancas/:id',
  autenticarToken,
  async (req, res) => {
    try {
      const { id: pagamentoId } = req.params;
      const usuarioId = Number(req.usuario.id);

      const pedido =
        await buscarPedidoDoUsuarioPorPagamento(
          usuarioId,
          pagamentoId
        );

      if (!pedido) {
        return res.status(404).json({
          ok: false,
          erro: 'Cobrança não encontrada para este usuário.'
        });
      }

      const resposta = await axios.get(
        `${process.env.ASAAS_BASE_URL}/payments/${pagamentoId}`,
        {
          headers: {
            access_token:
              process.env.ASAAS_API_KEY
          }
        }
      );

      return res.status(200).json({
        ok: true,
        pedidoId: pedido.id,
        pagamento: resposta.data
      });
    } catch (erro) {
      console.error(
        'Erro ao consultar cobrança Asaas:',
        erro.response?.data ||
          erro.message
      );

      return res.status(
        erro.response?.status || 500
      ).json({
        ok: false,
        erro:
          'Não foi possível consultar a cobrança.',
        detalhes:
          erro.response?.data ||
          erro.message
      });
    }
  }
);


/*==========================================================
    CRIAR COBRANÇA PIX
==========================================================*/

app.post(
  '/api/asaas/cobrancas/pix',
  autenticarToken,
  async (req, res) => {
    try {
      const {
        pedidoId,
        descricao
      } = req.body;

      const usuarioId =
        Number(req.usuario.id);

      if (!pedidoId) {
        return res.status(400).json({
          ok: false,
          erro: 'pedidoId é obrigatório.'
        });
      }
        const {
          data: usuario,
          error: erroUsuario
        } = await supabase
          .from('usuarios')
          .select(`
            id,
            nome,
            email,
            cpf,
            telefone,
            asaas_customer_id
          `)
          .eq('id', usuarioId)
          .single();

        if (erroUsuario || !usuario) {
          return res.status(404).json({
            ok: false,
            erro: 'Usuário autenticado não encontrado.'
          });
        }

      let customerId =
        usuario.asaas_customer_id;

      if (!customerId) {
        const respostaCliente =
          await axios.post(
            `${process.env.ASAAS_BASE_URL}/customers`,
            {
              name: usuario.nome,
              email: usuario.email,
              cpfCnpj: String(usuario.cpf || '')
                .replace(/\D/g, ''),
              mobilePhone: String(usuario.telefone || '')
                .replace(/\D/g, '') || undefined,
              externalReference: String(usuario.id)
            },
            {
              headers: {
                access_token:
                  process.env.ASAAS_API_KEY,
                'Content-Type':
                  'application/json'
              }
            }
          );

        customerId = respostaCliente.data.id;

        const {
          error: erroSalvarCustomerId
        } = await supabase
          .from('usuarios')
          .update({
            asaas_customer_id: customerId
          })
          .eq('id', usuario.id);

        if (erroSalvarCustomerId) {
          throw erroSalvarCustomerId;
        }

        console.log(
          'Cliente criado no Asaas e vinculado ao usuário:',
          {
            usuarioId: usuario.id,
            customerId
          }
        );
      }
      const {
        data: pedido,
        error: erroPedido
      } = await supabase
        .from('pedidos')
        .select(`
          id,
          usuario_id,
          numero,
          valor,
          status,
          gateway_payment_id
        `)
        .eq('id', pedidoId)
        .eq('usuario_id', usuarioId)
        .single();

      if (erroPedido || !pedido) {
        return res.status(404).json({
          ok: false,
          erro: 'Pedido não encontrado.'
        });
      }

      if (pedido.gateway_payment_id) {
        return res.status(409).json({
          ok: false,
          erro:
            'Este pedido já possui uma cobrança criada.',
          pagamentoId:
            pedido.gateway_payment_id
        });
      }

      if (
        pedido.status !==
        'aguardando_pagamento'
      ) {
        return res.status(409).json({
          ok: false,
          erro:
            `Pedido não pode ser pago. ` +
            `Status atual: ${pedido.status}`
        });
      }

      const valorPedido = Number(pedido.valor);

      if (
        !Number.isFinite(valorPedido) ||
        valorPedido <= 0
      ) {
        return res.status(400).json({
          ok: false,
          erro: 'O valor do pedido é inválido.'
        });
      }

      const hoje = new Date()
        .toISOString()
        .split('T')[0];

      const resposta = await axios.post(
        `${process.env.ASAAS_BASE_URL}/payments`,
        {
          customer: customerId,
          billingType: 'PIX',
          value: valorPedido,
          dueDate: hoje,
          description:
            descricao ||
            `Pedido ${pedido.numero} - Cial Site`,
          externalReference:
            String(pedido.id)
        },
        {
          headers: {
            access_token:
              process.env.ASAAS_API_KEY,
            'Content-Type':
              'application/json'
          }
        }
      );

      const {
        error: erroAtualizarPedido
      } = await supabase
        .from('pedidos')
        .update({
          gateway: 'asaas',
          gateway_payment_id:
            resposta.data.id,
          gateway_status:
            resposta.data.status
        })
        .eq('id', pedido.id)
        .is('gateway_payment_id', null);

      if (erroAtualizarPedido) {
        throw erroAtualizarPedido;
      }

      console.log(
        'Cobrança Pix vinculada ao pedido:',
        {
          pedidoId: pedido.id,
          numeroPedido: pedido.numero,
          pagamentoId: resposta.data.id,
          status: resposta.data.status,
          valor: resposta.data.value
        }
      );

      return res.status(201).json({
        ok: true,
        pagamento: resposta.data
      });
    } catch (erro) {
      console.error(
        'Erro ao criar cobrança Pix:',
        erro.response?.data ||
          erro.message
      );

      return res.status(
        erro.response?.status || 500
      ).json({
        ok: false,
        erro:
          'Não foi possível criar a cobrança Pix.',
        detalhes:
          erro.response?.data ||
          erro.message
      });
    }
  }
);


/*==========================================================
    CRIAR COBRANÇA CARTÃO DE CRÉDITO
==========================================================*/

app.post(
  '/api/asaas/cobrancas/cartao',
  autenticarToken,
  async (req, res) => {
    try {
      console.log(
  'ROTA CARTÃO FOI CHAMADA:',
  {
    pedidoId: req.body.pedidoId,
    parcelas: req.body.parcelas,
    temNumeroCartao:
      Boolean(req.body.numeroCartao),
    temNomeCartao:
      Boolean(req.body.nomeCartao),
    temValidade:
      Boolean(req.body.validadeCartao),
    temCvv:
      Boolean(req.body.cvvCartao)
  }
);
      const {
        pedidoId,
        parcelas = 1,
        numeroCartao,
        nomeCartao,
        validadeCartao,
        cvvCartao
      } = req.body;;

      if (
        !numeroCartao ||
        !nomeCartao ||
        !validadeCartao ||
        !cvvCartao
      ) {
        return res.status(400).json({
          ok: false,
          erro:
            'Informe todos os dados do cartão.'
        });
      }

      const usuarioId =
        Number(req.usuario.id);

      if (!pedidoId) {
        return res.status(400).json({
          ok: false,
          erro: 'pedidoId é obrigatório.'
        });
      }

      const quantidadeParcelas =
        Number(parcelas);

      if (
        !Number.isInteger(
          quantidadeParcelas
        ) ||
        quantidadeParcelas < 1 ||
        quantidadeParcelas > 12
      ) {
        return res.status(400).json({
          ok: false,
          erro:
            'Informe uma quantidade de parcelas entre 1 e 12.'
        });
      }

      const {
        data: usuario,
        error: erroUsuario
      } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome,
          email,
          cpf,
          telefone,
          asaas_customer_id
        `)
        .eq('id', usuarioId)
        .single();

      if (erroUsuario || !usuario) {
        return res.status(404).json({
          ok: false,
          erro:
            'Usuário autenticado não encontrado.'
        });
      }
      const cpfRaw = String(usuario.cpf || '').replace(/\D/g, '');
      if (cpfRaw.length !== 11) {
        return res.status(400).json({
          ok: false,
          erro: 'O usuário precisa ter um CPF válido cadastrado.'
        });
      }

      const cpfParaAsaas = cpfRaw;

      if (!usuario.asaas_customer_id) {
        return res.status(409).json({
          ok: false,
          erro:
            'Cliente Asaas não encontrado. Gere um Pix primeiro para criar seu cadastro de pagamento.'
        });
      }

      const {
        data: pedido,
        error: erroPedido
      } = await supabase
        .from('pedidos')
        .select(`
          id,
          usuario_id,
          numero,
          valor,
          status,
          gateway_payment_id
        `)
        .eq('id', pedidoId)
        .eq('usuario_id', usuarioId)
        .single();

      if (erroPedido || !pedido) {
        return res.status(404).json({
          ok: false,
          erro: 'Pedido não encontrado.'
        });
      }

      if (pedido.gateway_payment_id) {
        return res.status(409).json({
          ok: false,
          erro:
            'Este pedido já possui uma cobrança criada.',
          pagamentoId:
            pedido.gateway_payment_id
        });
      }

      if (
        pedido.status !==
        'aguardando_pagamento'
      ) {
        return res.status(409).json({
          ok: false,
          erro:
            `Pedido não pode ser pago. ` +
            `Status atual: ${pedido.status}`
        });
      }

      const valorPedido =
        Number(pedido.valor);

      if (
        !Number.isFinite(valorPedido) ||
        valorPedido <= 0
      ) {
        return res.status(400).json({
          ok: false,
          erro: 'O valor do pedido é inválido.'
        });
      }

      const hoje = new Date()
        .toISOString()
        .split('T')[0];

      /*
       * Esta cobrança é criada no Asaas.
       * Na próxima etapa vamos usar o link seguro
       * para o cliente preencher os dados do cartão.
       */

      console.log(
  'Enviando cobrança de cartão para o Asaas:',
  {
    pedidoId: pedido.id,
    valor: valorPedido,
    parcelas: quantidadeParcelas,
    customerId:
      usuario.asaas_customer_id,
    cpfInformado:
      Boolean(usuario.cpf),
    telefoneInformado:
      Boolean(usuario.telefone)
  }
);
console.log(
  'Dados do titular do cartão (holder):',
  {
    nome: usuario.nome,
    email: usuario.email,
    cpfRaw: usuario.cpf,
    cpfEnviado: cpfParaAsaas,
    telefone: usuario.telefone
  }
);
      const resposta = await axios.post(
        `${process.env.ASAAS_BASE_URL}/payments`,
        {
          customer:
            usuario.asaas_customer_id,
          billingType:
            'CREDIT_CARD',
          value: valorPedido,
          dueDate: hoje,
          installmentCount:
            quantidadeParcelas,
          installmentValue:
            Number(
              (
                valorPedido /
                quantidadeParcelas
              ).toFixed(2)
            ),
          description:
  `Pedido ${pedido.numero} - Cial Site`,
externalReference:
  String(pedido.id),

creditCard: {
  holderName:
    String(nomeCartao).trim(),
  number:
    String(numeroCartao)
      .replace(/\D/g, ''),
  expiryMonth:
    String(validadeCartao)
      .split('/')[0]
      .trim(),
  expiryYear:
    `20${String(validadeCartao)
      .split('/')[1]
      .trim()}`,
  ccv:
    String(cvvCartao)
      .replace(/\D/g, '')
},

creditCardHolderInfo: {
  name: usuario.nome,
  email: usuario.email,
  cpfCnpj: cpfParaAsaas,
  postalCode: '01001000',
  addressNumber: '1',
  phone:
    String(usuario.telefone || '11900000000')
      .replace(/\D/g, '')
},

remoteIp:
  String(
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    ''
  )
    .split(',')[0]
    .trim()
        },
        {
          headers: {
            access_token:
              process.env.ASAAS_API_KEY,
            'Content-Type':
              'application/json'
          }
        }
      );
      console.log(
        'Resposta do Asaas para cartão:',
        {
          pagamentoId: resposta.data?.id,
          status: resposta.data?.status
        }
      );
      const {
        error: erroAtualizarPedido
      } = await supabase
        .from('pedidos')
        .update({
          gateway: 'asaas',
          gateway_payment_id:
            resposta.data.id,
          gateway_status:
            resposta.data.status,
          metodo_pagamento:
            'cartao_credito',
          parcelas:
            quantidadeParcelas,
          status:
            resposta.data.status === 'CONFIRMED'
              ? 'pago'
              : 'aguardando_pagamento',
          paid_at:
            resposta.data.status === 'CONFIRMED'
              ? new Date().toISOString()
              : null
              
        })
        
        .eq('id', pedido.id)
        .is('gateway_payment_id', null);

      if (erroAtualizarPedido) {
        throw erroAtualizarPedido;
      }
if (resposta.data.status === "CONFIRMED") {
    const { error: erroLimparCarrinho } =
        await supabase
            .from("carrinho_itens")
            .delete()
            .eq("usuario_id", usuarioId);

    if (erroLimparCarrinho) {
        console.error(
            "Erro ao limpar carrinho:",
            erroLimparCarrinho
        );
    } else {
        console.log(
            "Carrinho limpo para usuarioId:",
            usuarioId
        );
    }
}
      return res.status(201).json({
        ok: true,
        pagamento: resposta.data
      });
    } catch (erro) {
      console.error(
        'Erro ao criar cobrança por cartão:',
        erro.response?.data ||
          erro.message
      );

      return res.status(
        erro.response?.status || 500
      ).json({
        ok: false,
        erro:
          'Não foi possível criar a cobrança por cartão.',
        detalhes:
          erro.response?.data ||
          erro.message
      });
    }
  }
);

/*==========================================================
    BUSCAR QR CODE PIX DO USUÁRIO
==========================================================*/

app.get(
  '/api/asaas/cobrancas/:id/pix-qrcode',
  autenticarToken,
  async (req, res) => {
    try {
      const { id: pagamentoId } = req.params;
      const usuarioId = Number(req.usuario.id);

      const pedido =
        await buscarPedidoDoUsuarioPorPagamento(
          usuarioId,
          pagamentoId
        );

      if (!pedido) {
        return res.status(404).json({
          ok: false,
          erro:
            'Cobrança Pix não encontrada para este usuário.'
        });
      }

      if (pedido.status === 'pago') {
        return res.status(409).json({
          ok: false,
          erro:
            'Este pedido já está pago.'
        });
      }

      const resposta = await axios.get(
        `${process.env.ASAAS_BASE_URL}/payments/${pagamentoId}/pixQrCode`,
        {
          headers: {
            access_token:
              process.env.ASAAS_API_KEY
          }
        }
      );

      return res.status(200).json({
        ok: true,
        pedidoId: pedido.id,
        pix: resposta.data
      });
    } catch (erro) {
      console.error(
        'Erro ao buscar QR Code Pix:',
        erro.response?.data ||
          erro.message
      );

      return res.status(
        erro.response?.status || 500
      ).json({
        ok: false,
        erro:
          'Não foi possível buscar o QR Code Pix.',
        detalhes:
          erro.response?.data ||
          erro.message
      });
    }
  }
);

/*==========================================================
    CRIAR GARANTIAS DO PEDIDO
==========================================================*/

async function criarGarantiasDoPedido(pedidoId) {

  console.log(
    'Iniciando criação das garantias do pedido:',
    pedidoId
  );

  // Buscar o pedido e seus itens
  const {
    data: pedido,
    error: erroPedido
  } = await supabase
    .from('pedidos')
    .select(`
      id,
      usuario_id,
      data_pedido,
      pedido_itens (
        id,
        produto_id,
        produto_nome,
        quantidade
      )
    `)
    .eq('id', pedidoId)
    .single();

  if (erroPedido || !pedido) {
    throw erroPedido ||
      new Error('Pedido não encontrado.');
  }

  if (!pedido.usuario_id) {
    throw new Error(
      'Pedido não possui usuário vinculado.'
    );
  }

  const dataCompra =
    pedido.data_pedido
      ? new Date(pedido.data_pedido)
          .toISOString()
          .split('T')[0]
      : new Date()
          .toISOString()
          .split('T')[0];

  const garantias = [];

  /*
   * Cada unidade comprada gera
   * uma garantia individual.
   */
  for (const item of pedido.pedido_itens || []) {

    const quantidade =
      Number(item.quantidade);

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      continue;
    }

    for (
      let unidade = 1;
      unidade <= quantidade;
      unidade++
    ) {

      // Data de vencimento = 12 meses
      // após a data da compra
      const vencimento =
        new Date(dataCompra);

      vencimento.setFullYear(
        vencimento.getFullYear() + 1
      );

      const dataVencimento =
        vencimento
          .toISOString()
          .split('T')[0];

      garantias.push({
        usuario_id: pedido.usuario_id,

        "nome do produto":
          item.produto_nome,

        data_compra:
          dataCompra,

        meses_garantia:
          12,

        vencimento:
          dataVencimento
      });
    }
  }

  if (garantias.length === 0) {
    console.log(
      'Nenhuma garantia para criar no pedido:',
      pedidoId
    );

    return [];
  }

  /*
   * Verificar quantas garantias já existem
   * para este cliente/produto/data.
   *
   * Isso ajuda a evitar duplicações caso
   * o webhook seja recebido novamente.
   */
  const {
    data: garantiasExistentes,
    error: erroExistentes
  } = await supabase
    .from('garantias')
    .select('id, usuario_id, "nome do produto", data_compra')
    .eq('usuario_id', pedido.usuario_id)
    .eq('data_compra', dataCompra);

  if (erroExistentes) {
    throw erroExistentes;
  }

  const existentes =
    garantiasExistentes || [];

  /*
   * Como a tabela de garantias ainda não possui
   * pedido_id/pedido_item_id, fazemos a criação
   * somente quando ainda não houver garantias
   * correspondentes para esse pedido.
   */
  if (existentes.length >= garantias.length) {

    console.log(
      'Garantias aparentemente já criadas:',
      {
        pedidoId,
        quantidade: existentes.length
      }
    );

    return existentes;
  }

  const {
    data: novasGarantias,
    error: erroGarantias
  } = await supabase
    .from('garantias')
    .insert(garantias)
    .select();

  if (erroGarantias) {
    throw erroGarantias;
  }

  console.log(
    'Garantias criadas com sucesso:',
    {
      pedidoId,
      quantidade:
        novasGarantias?.length || 0
    }
  );

  return novasGarantias || [];
}

/*==========================================================
    WEBHOOK ASAAS
==========================================================*/

app.post(
  '/api/asaas/webhook',
  async (req, res) => {
    try {
      const tokenRecebido =
        req.headers['asaas-access-token'];

      if (
        !process.env.ASAAS_WEBHOOK_TOKEN ||
        tokenRecebido !==
          process.env.ASAAS_WEBHOOK_TOKEN
      ) {
        console.error(
          'Webhook Asaas rejeitado: token inválido.'
        );

        return res.status(401).json({
          ok: false,
          erro:
            'Token de webhook inválido.'
        });
      }

      const evento = req.body;
      const tipoEvento = evento?.event;
      const pagamentoEvento = evento?.payment;

      console.log(
        'Webhook Asaas recebido:',
        {
          eventoId: evento?.id,
          tipoEvento,
          pagamentoId: pagamentoEvento?.id
        }
      );

      if (!pagamentoEvento?.id) {
        return res.sendStatus(200);
      }

      const eventosDePagamento =
        [
          'PAYMENT_RECEIVED',
          'PAYMENT_CONFIRMED'
        ];

      if (
        !eventosDePagamento.includes(
          tipoEvento
        )
      ) {
        return res.sendStatus(200);
      }

      const pagamentoAsaas = await axios.get(
        `${process.env.ASAAS_BASE_URL}/payments/${pagamentoEvento.id}`,
        {
          headers: {
            access_token:
              process.env.ASAAS_API_KEY
          }
        }
      );

      const dadosPagamento =
        pagamentoAsaas.data;

      if (dadosPagamento.status !== 'PAID') {
        console.warn(
          'Webhook recebido, mas pagamento ainda não está PAID:',
          {
            pagamentoId: dadosPagamento.id,
            status: dadosPagamento.status
          }
        );

        return res.sendStatus(200);
      }

      const pedidoId = Number(
        dadosPagamento.externalReference
      );

      if (!Number.isInteger(pedidoId)) {
        console.error(
          'externalReference inválida:',
          dadosPagamento.externalReference
        );

        return res.sendStatus(200);
      }

      const {
        data: pedido,
        error: erroBuscarPedido
      } = await supabase
        .from('pedidos')
        .select(`
          id,
          usuario_id,
          numero,
          valor,
          gateway_payment_id,
          status
        `)
        .eq('id', pedidoId)
        .single();

      if (
        erroBuscarPedido ||
        !pedido
      ) {
        console.error(
          'Pedido não encontrado no webhook:',
          {
            pedidoId,
            erro: erroBuscarPedido
          }
        );

        return res.sendStatus(200);
      }

      if (
        pedido.gateway_payment_id !==
        dadosPagamento.id
      ) {
        console.error(
          'Pagamento não corresponde ao pedido:',
          {
            pedidoId,
            pagamentoRecebido:
              dadosPagamento.id,
            pagamentoEsperado:
              pedido.gateway_payment_id
          }
        );

        return res.sendStatus(200);
      }

      const valorPedido = Number(pedido.valor);
      const valorRecebido = Number(
        dadosPagamento.value
      );

      if (
        !Number.isFinite(valorRecebido) ||
        valorPedido !== valorRecebido
      ) {
        console.error(
          'Valor do pagamento diferente do pedido:',
          {
            pedidoId,
            pagamentoId: dadosPagamento.id,
            valorEsperado: valorPedido,
            valorRecebido
          }
        );

        return res.sendStatus(200);
      }

      const dataPagamento =
        dadosPagamento.paymentDate
          ? new Date(
              dadosPagamento.paymentDate
            ).toISOString()
          : new Date().toISOString();

      const {
        error: erroAtualizarPedido
      } = await supabase
        .from('pedidos')
        .update({
          status: 'pago',
          gateway_status:
            dadosPagamento.status,
          paid_at: dataPagamento
        })
        .eq('id', pedidoId)
        .neq('status', 'pago');

      if (erroAtualizarPedido) {
        throw erroAtualizarPedido;
      }

      // ==========================================================
      // CRIAR GARANTIAS AUTOMATICAMENTE APÓS PAGAMENTO
      // ==========================================================

      await criarGarantiasDoPedido(pedidoId);

      console.log(
        'Garantias do pedido processadas:',
        pedidoId
      );

    /*==========================================================
    CRIAR GARANTIAS DO PEDIDO
==========================================================*/

async function criarGarantiasDoPedido(pedidoId) {

  console.log(
    'Iniciando criação das garantias do pedido:',
    pedidoId
  );

  // Buscar pedido e itens
  const {
    data: pedido,
    error: erroPedido
  } = await supabase
    .from('pedidos')
    .select(`
      id,
      usuario_id,
      data_pedido,
      pedido_itens (
        id,
        produto_id,
        produto_nome,
        quantidade
      )
    `)
    .eq('id', pedidoId)
    .single();

  if (erroPedido || !pedido) {
    throw erroPedido ||
      new Error('Pedido não encontrado.');
  }

  if (!pedido.usuario_id) {
    throw new Error(
      'Pedido não possui usuário vinculado.'
    );
  }

  const dataCompra =
    pedido.data_pedido
      ? new Date(pedido.data_pedido)
          .toISOString()
          .split('T')[0]
      : new Date()
          .toISOString()
          .split('T')[0];

  const garantias = [];

  let contadorUnidade = 0;

  /*
   * Cada unidade comprada gera
   * uma garantia individual.
   */
  for (const item of pedido.pedido_itens || []) {

    const quantidade =
      Number(item.quantidade);

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      continue;
    }

   for (
  let unidadeProduto = 1;
  unidadeProduto <= quantidade;
  unidadeProduto++
) {

  contadorUnidade++;

  const unidade = contadorUnidade;

      const vencimento =
        new Date(dataCompra);

      vencimento.setFullYear(
        vencimento.getFullYear() + 1
      );

      const dataVencimento =
        vencimento
          .toISOString()
          .split('T')[0];

      garantias.push({
        pedido_id: pedido.id,

        unidade,

        usuario_id:
          pedido.usuario_id,

        "nome do produto":
          item.produto_nome,

        data_compra:
          dataCompra,

        meses_garantia:
          12,

        vencimento:
          dataVencimento
      });
    }
  }

  if (garantias.length === 0) {

    console.log(
      'Nenhuma garantia para criar no pedido:',
      pedidoId
    );

    return [];
  }

  /*
   * UPSERT COM PROTEÇÃO CONTRA DUPLICAÇÃO
   *
   * A trava criada no banco usa:
   * pedido_id + unidade
   *
   * Portanto, se o Asaas enviar o mesmo
   * webhook novamente, a garantia existente
   * não será duplicada.
   */
  const {
    data: garantiasCriadas,
    error: erroGarantias
  } = await supabase
    .from('garantias')
    .upsert(
      garantias,
      {
        onConflict:
          'pedido_id,unidade',
        ignoreDuplicates:
          true
      }
    )
    .select();

  if (erroGarantias) {
    throw erroGarantias;
  }

  console.log(
    'Garantias processadas com sucesso:',
    {
      pedidoId,
      quantidadeSolicitada:
        garantias.length,
      novasGarantias:
        garantiasCriadas?.length || 0
    }
  );

  return garantiasCriadas || [];
}

      console.log(
        'Pedido atualizado como pago:',
        {
          pedidoId,
          numeroPedido: pedido.numero,
          pagamentoId:
            dadosPagamento.id,
          statusAsaas:
            dadosPagamento.status,
          valor: valorRecebido
        }
      );

      return res.sendStatus(200);
    } catch (erro) {
      console.error(
        'Erro no webhook Asaas:',
        erro.response?.data ||
          erro.message
      );

      return res.sendStatus(500);
    }
  }
);
/*==========================================================
    PEDIDOS - ADMINISTRATIVO
==========================================================*/

// LISTAR TODOS OS PEDIDOS
app.get(
    "/admin/pedidos",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {

        try {

            const { data, error } = await supabase
                .from("pedidos")
                .select(`
                    *,
                    pedido_itens (
                        id,
                        produto_nome,
                        quantidade,
                        preco_unitario
                    )
                `)
                .order("data_pedido", {
                    ascending: false
                });

            if (error) {
                console.error(
                    "Erro ao listar pedidos:",
                    error
                );

                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            return res.json({
                ok: true,
                data: data || []
            });

        } catch (err) {

            console.error(
                "Erro inesperado ao listar pedidos:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro: err.message
            });
        }
    }
);


// DETALHES DE UM PEDIDO
app.get(
    "/admin/pedidos/:id",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {

        try {

            const pedidoId = req.params.id;

            const { data, error } = await supabase
                .from("pedidos")
                .select(`
                    *,
                    pedido_itens (
                        id,
                        produto_nome,
                        quantidade,
                        preco_unitario
                    )
                `)
                .eq("id", pedidoId)
                .single();

            if (error) {

                console.error(
                    "Erro ao buscar pedido:",
                    error
                );

                return res.status(404).json({
                    ok: false,
                    erro: "Pedido não encontrado."
                });
            }

            // Buscar dados do cliente
            let cliente = null;

            if (data.usuario_id) {

                const resultadoCliente = await supabase
                    .from("usuarios")
                    .select(`
                        id,
                        nome,
                        email,
                        cpf,
                        telefone
                    `)
                    .eq("id", data.usuario_id)
                    .single();

                if (!resultadoCliente.error) {
                    cliente = resultadoCliente.data;
                }
            }

            return res.json({
                ok: true,
                data: {
                    ...data,
                    cliente
                }
            });

        } catch (err) {

            console.error(
                "Erro inesperado ao buscar pedido:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro: err.message
            });
        }
    }
);


// ATUALIZAR STATUS DO PEDIDO
app.patch(
    "/admin/pedidos/:id/status",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {

        try {

            const pedidoId = req.params.id;
            const { status } = req.body;

            if (!status) {

                return res.status(400).json({
                    ok: false,
                    erro: "O status do pedido é obrigatório."
                });
            }

            const { data, error } = await supabase
                .from("pedidos")
                .update({
                    status: status
                })
                .eq("id", pedidoId)
                .select()
                .single();

            if (error) {

                console.error(
                    "Erro ao atualizar status:",
                    error
                );

                return res.status(500).json({
                    ok: false,
                    erro: error.message
                });
            }

            return res.json({
                ok: true,
                mensagem: "Status atualizado com sucesso!",
                data
            });

        } catch (err) {

            console.error(
                "Erro inesperado ao atualizar status:",
                err
            );

            return res.status(500).json({
                ok: false,
                erro: err.message
            });
        }
    }
);


/* ==============
    SERVIDOR 
    SEMPRE COLOCAR ATRAS DELE!!!
   ==============*/

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
