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
    preco,
    estoque,
    imagem,
    imagens,
    selo,
    destaque,

    descricao,
    funcao,

    descricaoStihl,
    aplicacaoStihl,

    marcaBomba,
    potenciaBomba,
    vazaoBomba,
    aplicacaoBomba,

    marcaIrrigacao,
    tipoIrrigacao
} = req.body;

  if (!nome || !categoria || preco == null) {
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
        categoria,
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
      return res.status(500).json({ ok: false, erro: error.message });
    }

    return res.status(201).json({ ok: true, data });
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



















/* ==============
    SERVIDOR 
    SEMPRE COLOCAR ATRAS DELE!!!
   ==============*/

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
