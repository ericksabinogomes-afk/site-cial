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
      preco,
      estoque,
      imagem,
      imagens,
      selo,
      destaque,
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

<<<<<<< Updated upstream
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
=======
    catch (err) {
>>>>>>> Stashed changes
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


/* ==============
    SERVIDOR 
    SEMPRE COLOCAR ATRAS DELE!!!
   ==============*/

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
