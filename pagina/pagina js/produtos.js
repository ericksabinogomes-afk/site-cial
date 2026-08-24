/*==================================================
                    CONFIGURAÇÕES
==================================================*/

const CONFIG = {

    moeda: "BRL",

    locale: "pt-BR",

    parcelas: 10

};



/*==================================================
                    ELEMENTOS
==================================================*/

const elementos = {

    grid: document.getElementById("gridProdutos"),

    pesquisa: document.getElementById("pesquisa"),

    total: document.getElementById("totalProdutos"),

    ordenacao: document.getElementById("ordenacao"),

    categorias: [],

    atalhos: document.querySelectorAll(".atalho"),

    filtroPreco: document.getElementById("filtroPreco"),

    filtros: document.querySelectorAll(".filtros li")

};



/*==================================================
                    ESTADO
==================================================*/

const estado = {

    produtos: [],

    produtosFiltrados: [],

    categoria: "todos",

    pesquisa: "",

    preco: "",

    destaque: "",

    aplicacao: "",

    ordenacao: "recentes",

    favoritos: [],

    carrinho: []

};


/*==================================================
            CARREGAR PRODUTOS
==================================================*/

async function carregarProdutos() {
  try {
    const API_BASE = "http://localhost:4000";
    const res = await fetch(`${API_BASE}/produtos`);
    const json = await res.json();

    if (!json.ok) {
      throw new Error(json.erro || "Erro ao carregar produtos");
    }

    const dados = json.data || [];

    estado.produtos = dados
  .filter(p => {
    const categoria = String(p.categoria || "")
      .trim()
      .toLowerCase();

    // produtos.html: remove qualquer categoria que comece com "bombas-"
    return !categoria.startsWith("bombas-");
  })
  .map(p => ({
    id: Number(p.id),

    categoria: p.categoria || "",

    nome: p.nome || "",

    selo: p.selo || "",

    preco: Number(p.preco) || 0,

    parcela: p.parcela || "",

    estoque: p.estoque || "Em estoque",

    descricao: p.descricao || "",

    funcao: p.funcao || "",


    /*========================================
            IMAGEM PRINCIPAL
    ========================================*/

    imagem: p.imagem || "",


    /*========================================
            IMAGENS ADICIONAIS
    ========================================*/

    imagens:
        Array.isArray(p.imagens)
            ? p.imagens
            : [],


    /*========================================
            STIHL
    ========================================*/

    descricaoStihl:
        p.descricao_stihl || "",

    aplicacaoStihl:
        p.aplicacao_stihl || "",


    /*========================================
            BOMBAS
    ========================================*/

    marcaBomba:
        p.marca_bomba || "",

    potenciaBomba:
        p.potencia_bomba || "",

    vazaoBomba:
        p.vazao_bomba || "",

    aplicacaoBomba:
        p.aplicacao_bomba || "",


    /*========================================
            IRRIGAÇÃO
    ========================================*/

    marcaIrrigacao:
        p.marca_irrigacao || "",

    tipoIrrigacao:
        p.tipo_irrigacao || ""

}));

    estado.produtosFiltrados = [...estado.produtos];
    ordenarProdutos();
    atualizarTotal();
    renderizarProdutos();
    abrirProdutoDaUrl();
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}


/*==================================================
            TOTAL DE PRODUTOS
==================================================*/

function atualizarTotal(){

    elementos.total.textContent = estado.produtosFiltrados.length;

}
/*==================================================
            FORMATA PREÇO
==================================================*/

function formatarPreco(valor){

    return valor.toLocaleString(

        CONFIG.locale,

        {

            style:"currency",

            currency:CONFIG.moeda

        }

    );

}



/*==================================================
            CRIAR CARD
==================================================*/

function criarCard(produto) {
  const favorito = estado.favoritos.includes(produto.id);

  return `
    <article class="card-produto">
      <div class="card-topo">
        ${produto.selo ? `
          <span class="selo">
            ${produto.selo}
          </span>
        ` : ""}

        <button
          type="button"
          class="btn-favorito"
          data-id="${produto.id}"
          aria-label="Adicionar ${produto.nome} aos favoritos">
          <i class="${favorito ? "fa-solid" : "fa-regular"} fa-heart"></i>
        </button>
      </div>

      <div class="card-imagem">
        <img
          src="${produto.imagem || 'imagens/produto-sem-imagem.png'}"
          alt="${produto.nome}"
          loading="lazy"
          onerror="this.src='imagens/produto-sem-imagem.png'">
      </div>

      <div class="card-info">
        <span class="card-categoria">
          ${produto.categoria}
        </span>

        <h3 class="card-titulo">
          ${produto.nome}
        </h3>

        <div class="card-avaliacao" aria-label="5 estrelas">
        5/5
          ★★★★★
        </div>

        <div class="card-preco">
          <span class="preco">
            ${formatarPreco(produto.preco)}
          </span>

          <span class="parcelamento">
            ${produto.parcela || ""}
          </span>
        </div>

        <div class="card-estoque">
          <i class="fa-solid fa-circle-check"></i>
          ${produto.estoque}
        </div>

        <div class="card-botoes">
          <button
            type="button"
            class="btn-ver"
            data-id="${produto.id}">
            Ver produto
          </button>

          <button
            type="button"
            class="btn-carrinho"
            data-id="${produto.id}">
            <i class="fa-solid fa-cart-shopping"></i>
            Adicionar
          </button>
        </div>
      </div>
    </article>
  `;
}

/*==================================================
            RENDERIZAR PRODUTOS
==================================================*/

function renderizarProdutos() {
    elementos.grid.innerHTML = "";

    if (estado.produtosFiltrados.length === 0) {
        elementos.grid.innerHTML = `
            <div class="sem-produtos">
                <i class="fa-solid fa-box-open"></i>
                <h2>Nenhum produto encontrado</h2>
                <p>
                    Tente alterar os filtros ou realizar outra pesquisa.
                </p>
            </div>
        `;

        atualizarTotal();
        return;
    }

    estado.produtosFiltrados.forEach(produto => {
        elementos.grid.insertAdjacentHTML(
            "beforeend",
            criarCard(produto)
        );
    });

    atualizarTotal();
}

/*==================================================
        CATEGORIAS DINÂMICAS
==================================================*/

const ordemCategoriasProdutos = [

    "motosserras",
    "rocadeiras",
    "sopradores",
    "lavadoras",
    "cortadores",
    "podadores",
    "motopodas",
    "colhedores",
    "kombisystem",
    "bateria",
    "eletrica",
    "aspiradores",
    "pecas",
    "ferramentas",
    "lubrificantes",
    "combustiveis",
    "epis",
    "acessorios"

];


const iconesCategoriasProdutos = {

    "motosserras": "🪚",

    "rocadeiras": "🌿",

    "sopradores": "💨",

    "lavadoras": "💦",

    "cortadores": "🌱",

    "podadores": "✂️",

    "motopodas": "🌳",

    "colhedores": "🌾",

    "kombisystem": "🔧",

    "bateria": "🔋",

    "eletrica": "🔌",

    "aspiradores": "🧹",

    "pecas": "⚙️",

    "ferramentas": "🛠",

    "lubrificantes": "🛢",

    "combustiveis": "⛽",

    "epis": "🦺",

    "acessorios": "🎒"

};


async function carregarCategoriasProdutos(){

    const lista =
        document.querySelector(".categorias");

    if(!lista){
        return;
    }

    try{

        const resposta =
            await fetch(
                "http://localhost:4000/categorias"
            );


        if(!resposta.ok){

            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );

        }


        const resultado =
            await resposta.json();


        if(!resultado.ok){

            throw new Error(
                resultado.erro ||
                "Erro ao carregar categorias."
            );

        }


        const categorias =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];

                console.log("📦 TODAS AS CATEGORIAS VINDAS DO BANCO:", categorias);

        /*========================================
            PEGAR SOMENTE CATEGORIAS DE PRODUTOS
        ========================================*/

        const categoriasProdutos =
            categorias.filter(categoria => {

                const grupo =
                    String(
                        categoria.grupo || ""
                    )
                    .trim()
                    .toLowerCase();


                const slug =
                    String(
                        categoria.slug || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    grupo === "produtos" &&
                    !slug.startsWith("bombas-")
                );

            });


        /*========================================
            ORDENAR
        ========================================*/

        categoriasProdutos.sort((a, b) => {

            const indiceA =
                ordemCategoriasProdutos.indexOf(
                    String(a.slug || "").toLowerCase()
                );

            const indiceB =
                ordemCategoriasProdutos.indexOf(
                    String(b.slug || "").toLowerCase()
                );


            if(indiceA !== -1 && indiceB !== -1){

                return indiceA - indiceB;

            }


            if(indiceA !== -1){

                return -1;

            }


            if(indiceB !== -1){

                return 1;

            }


            return String(a.nome || "")
                .localeCompare(
                    String(b.nome || ""),
                    "pt-BR"
                );

        });


        /*========================================
            LIMPAR CATEGORIAS ANTIGAS
        ========================================*/

        lista.innerHTML = "";


        /*========================================
            TODOS OS PRODUTOS
        ========================================*/

        const todos =
            document.createElement("li");

        todos.dataset.categoria =
            "todos";

        todos.classList.add("ativo");

        todos.innerHTML = `

            <span class="icone-categoria">
                🏠
            </span>

            <span>
                Todos os Produtos
            </span>

        `;

        lista.appendChild(todos);


        /*========================================
            CRIAR CATEGORIAS
        ========================================*/

        categoriasProdutos.forEach(categoria => {

            const li =
                document.createElement("li");


            const slug =
                String(
                    categoria.slug || ""
                )
                .trim()
                .toLowerCase();


            const icone =
                iconesCategoriasProdutos[slug] ||
                "📦";


            li.dataset.categoria =
                categoria.slug;


            li.innerHTML = `

                <span
                    class="icone-categoria"
                    style="margin-right: 8px;"
                >
                    ${icone}
                </span>

                <span>
                    ${categoria.nome}
                </span>

            `;


            lista.appendChild(li);

        });


        /*========================================
            ATUALIZAR REFERÊNCIA
        ========================================*/

        elementos.categorias =
            lista.querySelectorAll("li");


        console.log(
            "✅ Categorias de produtos carregadas:",
            categoriasProdutos
        );


    } catch(erro){

        console.error(
            "❌ Erro ao carregar categorias de produtos:",
            erro
        );

    }

}

/*==================================================
            FILTRAR CATEGORIA
==================================================*/

function filtrarCategoria(categoria){

    ordenarProdutos();

    estado.categoria = categoria;



    if(categoria === "todos"){

        estado.produtosFiltrados = [...estado.produtos];

    }

    else{

        estado.produtosFiltrados = estado.produtos.filter(produto=>{

            return produto.categoria === categoria;

        });

    }



    renderizarProdutos();

}
/*==================================================
            EVENTOS CATEGORIAS
==================================================*/

function iniciarCategorias(){

    elementos.categorias.forEach(categoria=>{

        categoria.addEventListener("click",()=>{

            elementos.categorias.forEach(item=>{

                item.classList.remove("ativo");

            });



            categoria.classList.add("ativo");



            filtrarCategoria(

                categoria.dataset.categoria

            );

        });

    });

}

/*==================================================
            EVENTOS DOS ATALHOS
==================================================*/

function iniciarAtalhos() {

    elementos.atalhos.forEach(atalho => {

        atalho.addEventListener("click", () => {

            const filtro =
                atalho.dataset.atalho;

            /* REMOVE ATIVO DOS OUTROS */

            elementos.atalhos.forEach(item => {
                item.classList.remove("ativo");
            });

            atalho.classList.add("ativo");


            /* TODOS */

            if (filtro === "todos") {

                estado.destaque = "";
                estado.categoria = "todos";

                elementos.categorias.forEach(item => {
                    item.classList.remove("ativo");
                });

                const categoriaTodos =
                    document.querySelector(
                        '.categorias li[data-categoria="todos"]'
                    );

                if (categoriaTodos) {
                    categoriaTodos.classList.add("ativo");
                }

                estado.produtosFiltrados =
                    [...estado.produtos];

            }


            /* LINHA A BATERIA */

            else if (filtro === "bateria") {

                estado.destaque = "";
                estado.categoria = "bateria";

                elementos.categorias.forEach(item => {
                    item.classList.remove("ativo");
                });

                const categoriaBateria =
                    document.querySelector(
                        '.categorias li[data-categoria="bateria"]'
                    );

                if (categoriaBateria) {
                    categoriaBateria.classList.add("ativo");
                }

                estado.produtosFiltrados =
                    estado.produtos.filter(produto =>
                        String(produto.categoria || "")
                            .trim()
                            .toLowerCase() === "bateria"
                    );

            }


            /* DESTAQUES */

            else {

                estado.destaque = filtro;
                estado.categoria = "todos";

                elementos.categorias.forEach(item => {
                    item.classList.remove("ativo");
                });

                const categoriaTodos =
                    document.querySelector(
                        '.categorias li[data-categoria="todos"]'
                    );

                if (categoriaTodos) {
                    categoriaTodos.classList.add("ativo");
                }


                estado.produtosFiltrados =
                    estado.produtos.filter(produto => {

                        const selo =
                            String(produto.selo || "")
                                .trim()
                                .toLowerCase();

                        if (filtro === "promocoes") {
                            return selo.includes("promo");
                        }

                        if (filtro === "lancamentos") {
                            return selo.includes("lançamento") ||
                                   selo.includes("lancamento");
                        }

                        if (filtro === "mais-vendidos") {
                            return selo.includes("vendido");
                        }

                        return false;

                    });

            }


            ordenarProdutos();
            renderizarProdutos();

        });

    });

}

/*==================================================
            FILTROS LATERAIS
==================================================*/

function iniciarFiltrosLaterais() {

    elementos.filtros.forEach(filtro => {

        filtro.addEventListener("click", () => {

            const textoFiltro =
                filtro.textContent
                    .trim();

            /* REMOVE ATIVO DOS FILTROS */

            elementos.filtros.forEach(item => {
                item.classList.remove("ativo");
            });

            /* ATIVA O FILTRO CLICADO */

            filtro.classList.add("ativo");

            /* GUARDA O FILTRO */

            estado.aplicacao =
                textoFiltro;

            aplicarFiltros();

        });

    });


    /*========================================
                FILTRO DE PREÇO
    ========================================*/

    if (elementos.filtroPreco) {

        elementos.filtroPreco.addEventListener(
            "change",
            event => {

                estado.preco =
                    event.target.value;

                aplicarFiltros();

            }
        );

    }

}

/*==================================================
            APLICAR FILTROS
==================================================*/

function aplicarFiltros() {

    const texto =
        String(estado.pesquisa || "")
            .toLowerCase()
            .trim();


    estado.produtosFiltrados =
        estado.produtos.filter(produto => {

            /*========================================
                    CATEGORIA
            ========================================*/

            const categoriaProduto =
                String(produto.categoria || "")
                    .trim()
                    .toLowerCase();

            const categoriaSelecionada =
                String(estado.categoria || "")
                    .trim()
                    .toLowerCase();

            const correspondeCategoria =
                categoriaSelecionada === "todos" ||
                categoriaProduto === categoriaSelecionada;


            /*========================================
                    PESQUISA
            ========================================*/

            const textoProduto = [

                produto.nome,
                produto.categoria,
                produto.descricao,
                produto.funcao,
                produto.aplicacaoStihl,
                produto.aplicacaoBomba,
                produto.tipoIrrigacao

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const correspondePesquisa =
                texto === "" ||
                textoProduto.includes(texto);


            /*========================================
                    PREÇO
            ========================================*/

            let correspondePreco = true;

            if (estado.preco !== "") {

                const preco =
                    Number(produto.preco);

                const limite =
                    Number(estado.preco);

                if (limite === 999999) {

                    correspondePreco =
                        preco > 3000;

                } else {

                    correspondePreco =
                        preco <= limite;

                }

            }


            /*========================================
                    APLICAÇÃO
            ========================================*/

            let correspondeAplicacao = true;

            if (estado.aplicacao !== "") {

                const aplicacaoProduto = [

                    produto.aplicacaoStihl,
                    produto.aplicacaoBomba,
                    produto.tipoIrrigacao,
                    produto.funcao,
                    produto.descricao

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                correspondeAplicacao =
                    aplicacaoProduto.includes(
                        estado.aplicacao.toLowerCase()
                    );

            }


            return (
                correspondeCategoria &&
                correspondePesquisa &&
                correspondePreco &&
                correspondeAplicacao
            );

        });


    ordenarProdutos();
    renderizarProdutos();

}

/*==================================================
            PESQUISA
==================================================*/

function pesquisarProdutos(){

    ordenarProdutos();

    const texto = elementos.pesquisa.value

        .toLowerCase()

        .trim();

    estado.pesquisa = texto;



    estado.produtosFiltrados = estado.produtos.filter(produto=>{

        const correspondeCategoria =

            estado.categoria === "todos"

            ||

            produto.categoria === estado.categoria;



        const correspondePesquisa =

    texto === ""

    ||

    String(produto.nome || "")
        .toLowerCase()
        .includes(texto)

    ||

    String(produto.categoria || "")
        .toLowerCase()
        .includes(texto)

    ||

    String(produto.marca || "")
        .toLowerCase()
        .includes(texto)

    ||

    String(produto.descricao || "")
        .toLowerCase()
        .includes(texto);
        return correspondeCategoria && correspondePesquisa;

    });



    renderizarProdutos();

}
/*==================================================
            EVENTOS PESQUISA
==================================================*/

function iniciarPesquisa(){

    elementos.pesquisa.addEventListener("input",()=>{

        pesquisarProdutos();

    });

}
/*==================================================
            ORDENAR PRODUTOS
==================================================*/

function ordenarProdutos(){

    switch(estado.ordenacao){

        case "menor":

            estado.produtosFiltrados.sort((a,b)=>a.preco-b.preco);

            break;



        case "maior":

            estado.produtosFiltrados.sort((a,b)=>b.preco-a.preco);

            break;



        case "az":

            estado.produtosFiltrados.sort((a,b)=>

                a.nome.localeCompare(b.nome)

            );

            break;



        case "za":

            estado.produtosFiltrados.sort((a,b)=>

                b.nome.localeCompare(a.nome)

            );

            break;



        case "recentes":

        default:

            estado.produtosFiltrados.sort((a,b)=>

                b.id-a.id

            );

            break;

    }

}
/*==================================================
            EVENTOS ORDENAÇÃO
==================================================*/

function iniciarOrdenacao(){

    elementos.ordenacao.addEventListener("change",(event)=>{

        estado.ordenacao = event.target.value;

        ordenarProdutos();

        renderizarProdutos();

    });

}
/*==================================================
                FAVORITOS - CONTA DO CLIENTE
==================================================*/

const API_FAVORITOS = "http://localhost:4000";


function obterToken(){

    return localStorage.getItem("tokenCial");

}


/*==================================================
        CARREGAR FAVORITOS DO USUÁRIO
==================================================*/

async function carregarFavoritos() {
    const token = obterToken();

    if (!token) {
        estado.favoritos = [];
        return;
    }

    try {
        const resposta = await fetch(
            `${API_FAVORITOS}/favoritos`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.ok) {
            throw new Error(
                resultado.erro ||
                "Erro ao carregar favoritos"
            );
        }

        estado.favoritos = (resultado.data || [])
            .map(item => Number(item.produto_id));

            console.log("🔥 FAVORITOS VINDOS DO BANCO:", resultado.data);
console.log("🔥 IDS DOS FAVORITOS:", estado.favoritos);

    } catch (erro) {
        console.error("Erro ao carregar favoritos:", erro);
        estado.favoritos = [];
    }
}

function atualizarFavoritoHeader() {

    const botao =
        document.getElementById("btnFavoritosHeader");

    if (!botao) return;

    const icone =
        botao.querySelector("i");

    const contador =
        document.getElementById("contadorFavoritos");

    const quantidade =
        estado.favoritos.length;

    const temFavoritos =
        quantidade > 0;

    /* CORAÇÃO */

    if (icone) {

        icone.classList.toggle(
            "fa-solid",
            temFavoritos
        );

        icone.classList.toggle(
            "fa-regular",
            !temFavoritos
        );

        icone.style.color =
            temFavoritos
                ? "#E53935"
                : "";
    }

    /* CONTADOR */

    if (contador) {

        contador.textContent =
            quantidade;

        contador.style.display =
            quantidade > 0
                ? "flex"
                : "none";
    }
}

/*==================================================
        ADICIONAR / REMOVER FAVORITO
==================================================*/

    async function alternarFavorito(id){

    console.log("❤️ FAVORITO CLICADO - ID:", id);
    console.log("⭐ FAVORITOS ATUAIS:", estado.favoritos);

    const token = obterToken();


    // NÃO LOGADO
    if(!token){

        window.location.href =
            "../cadastro/login.html";

        return;

    }


    const existe =
        estado.favoritos.includes(id);


    try{

        let resposta;
 
        /*========================================
                REMOVER FAVORITO
        ========================================*/

        if(existe){

            resposta = await fetch(
                `${API_FAVORITOS}/favoritos/${id}`,
                {
                    method:"DELETE",

                    headers:{
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        }


        /*========================================
                ADICIONAR FAVORITO
        ========================================*/

        else{

            resposta = await fetch(
                `${API_FAVORITOS}/favoritos`,
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:JSON.stringify({

                        produto_id:id

                    })
                }
            );

        }


        if(resposta.status === 401){

            localStorage.removeItem("tokenCial");
            localStorage.removeItem("usuarioCial");

            window.location.href =
                "../cadastro/login.html";

            return;

        }


        const resultado =
            await resposta.json();


        if(!resultado.ok){

            throw new Error(
                resultado.erro ||
                "Erro ao alterar favorito"
            );

        }


        // Atualiza visualmente o coração
        if(existe){

            estado.favoritos =
                estado.favoritos.filter(
                    favorito => favorito !== id
                );

        }

        else{

            estado.favoritos.push(id);

        }

        renderizarProdutos();
        atualizarFavoritoHeader();

    }catch(erro){

        console.error(
            "Erro ao alterar favorito:",
            erro
        );

    }

}


/*==================================================
            EVENTOS FAVORITOS
==================================================*/

function iniciarFavoritos(){

    document.addEventListener(
        "click",
        event => {

            const botao =
                event.target.closest(
                    ".btn-favorito"
                );


            if(!botao){

                return;

            }

            alternarFavorito(
                Number(botao.dataset.id)
            );

        }
    );
}


/*==================================================
                CARRINHO
==================================================*/

const API_CARRINHO =
    "http://localhost:4000";

async function adicionarAoCarrinho(produto) {
    const token =
        localStorage.getItem("tokenCial");

    if (!token) {
        window.location.href =
            "../cadastro/login.html";

        return;
    }

    try {
        const resposta = await fetch(
            `${API_CARRINHO}/carrinho`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },
                body: JSON.stringify({
                    produto_id: Number(produto.id),
                    quantidade: 1
                })
            }
        );

        const resultado =
            await resposta.json();

        if (resposta.status === 401) {
            localStorage.removeItem(
                "tokenCial"
            );

            localStorage.removeItem(
                "usuarioCial"
            );

            window.location.href =
                "../cadastro/login.html";

            return;
        }

        if (!resposta.ok || !resultado.ok) {
            throw new Error(
                resultado.erro ||
                "Erro ao adicionar ao carrinho"
            );
        }

        if (window.atualizarContadorCarrinho) {
            await window.atualizarContadorCarrinho();
        }

        alert(
            `${produto.nome} foi adicionado ao carrinho.`
        );
    } catch (erro) {
        console.error(
            "Erro ao adicionar ao carrinho:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível adicionar o produto."
        );
    }
}

function iniciarCarrinho() {
    document.addEventListener(
        "click",
        event => {
            const botao =
                event.target.closest(
                    ".btn-carrinho"
                );

            if (!botao) {
                return;
            }

            const id =
                Number(botao.dataset.id);

            const produto =
                estado.produtos.find(
                    item =>
                        Number(item.id) === id
                );

            if (!produto) {
                console.error(
                    "Produto não encontrado:",
                    id
                );

                return;
            }

            adicionarAoCarrinho(produto);
        }
    );
}

/*==================================================
        ABRIR PRODUTO PELA URL
==================================================*/

function abrirProdutoDaUrl() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const id = Number(
        parametros.get("produto")
    );

    if (!id) {
        return;
    }

    const produto = estado.produtos.find(
        item => Number(item.id) === id
    );

    if (!produto) {
        console.error(
            "Produto da URL não encontrado:",
            id
        );
        return;
    }

    abrirModalProduto(id);
}

/*==================================================
        MODAL DO PRODUTO
        MODAL INTELIGENTE POR CATEGORIA
==================================================*/

let produtoModalAtual = null;


function abrirModalProduto(id){

    const produto = estado.produtos.find(
        item => item.id === id
    );


    if(!produto){

        console.error(
            "Produto não encontrado:",
            id
        );

        return;

    }


    produtoModalAtual = produto;


    /*========================================
                ELEMENTOS
    ========================================*/

    const modal =
        document.getElementById("modalProduto");


    const imagemPrincipal =
        document.getElementById(
            "modalImagemPrincipal"
        );


    const miniaturas =
        document.getElementById(
            "modalMiniaturas"
        );


    const categoria =
        document.getElementById(
            "modalCategoria"
        );


    const nome =
        document.getElementById(
            "modalNomeProduto"
        );


    const preco =
        document.getElementById(
            "modalPrecoProduto"
        );


    const estoque =
        document.getElementById(
            "modalEstoqueProduto"
        );


    const descricao =
        document.getElementById(
            "modalDescricaoProduto"
        );


    /*========================================
            INFORMAÇÕES PRINCIPAIS
    ========================================*/

    categoria.textContent =
        produto.categoria || "";


    nome.textContent =
        produto.nome || "";


    preco.textContent =
        formatarPreco(
            produto.preco || 0
        );


    estoque.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        ${produto.estoque || "Em estoque"}
    `;


    descricao.textContent =
        produto.descricao ||
        produto.funcao ||
        "Entre em contato com a CIAL Asa Sul para mais informações sobre este produto.";


    /*========================================
        ESPECIFICAÇÕES INTELIGENTES
    ========================================*/

    const especificacoes =
        obterEspecificacoesProduto(
            produto
        );


    renderizarEspecificacoesModal(
        especificacoes
    );


    /*========================================
            GALERIA DE IMAGENS
    ========================================*/

    const imagens = [

        produto.imagem,

        ...(Array.isArray(produto.imagens)
            ? produto.imagens
            : [])

    ].filter(Boolean);


    if(imagens.length === 0){

        imagens.push(
            "imagens/produto-sem-imagem.png"
        );

    }


    imagemPrincipal.src =
        imagens[0];


    imagemPrincipal.alt =
        produto.nome || "Produto";


    miniaturas.innerHTML = "";


    imagens.forEach(
        (imagem, indice) => {

            const miniatura =
                document.createElement(
                    "button"
                );


            miniatura.type =
                "button";


            miniatura.className =
                "modal-produto-miniatura" +
                (
                    indice === 0
                        ? " ativa"
                        : ""
                );


            miniatura.innerHTML = `
                <img
                    src="${imagem}"
                    alt="${produto.nome || "Produto"} — imagem ${indice + 1}"
                >
            `;


            miniatura.addEventListener(
                "click",
                () => {

                    imagemPrincipal.src =
                        imagem;


                    miniaturas
                        .querySelectorAll(
                            ".modal-produto-miniatura"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "ativa"
                                )
                        );


                    miniatura.classList.add(
                        "ativa"
                    );

                }
            );


            miniaturas.appendChild(
                miniatura
            );

        }
    );


    /*========================================
                ABRIR MODAL
    ========================================*/

    modal.classList.add(
        "ativo"
    );


    document.body.style.overflow =
        "hidden";

}


/*==================================================
        ESPECIFICAÇÕES POR CATEGORIA
==================================================*/

function obterEspecificacoesProduto(
    produto
){

    const especificacoes = [];


    const categoria =
        String(
            produto.categoria || ""
        )
        .trim()
        .toLowerCase();


    /*========================================
                    STIHL
    ========================================*/

    if(
        categoria.includes("stihl") ||
        categoria.includes("motosserra") ||
        categoria.includes("rocadeira") ||
        categoria.includes("soprador") ||
        categoria.includes("lavajato")
    ){

        adicionarEspecificacao(
            especificacoes,
            "Descrição",
            produto.descricaoStihl
        );


        adicionarEspecificacao(
            especificacoes,
            "Aplicação",
            produto.aplicacaoStihl
        );

    }


    /*========================================
                    BOMBAS
    ========================================*/

    if(
        categoria.includes("bomba")
    ){

        adicionarEspecificacao(
            especificacoes,
            "Marca",
            produto.marcaBomba
        );


        adicionarEspecificacao(
            especificacoes,
            "Potência",
            produto.potenciaBomba
        );


        adicionarEspecificacao(
            especificacoes,
            "Vazão",
            produto.vazaoBomba
        );


        adicionarEspecificacao(
            especificacoes,
            "Aplicação",
            produto.aplicacaoBomba
        );

    }


    /*========================================
                  IRRIGAÇÃO
    ========================================*/

    if(
        categoria.includes("irrig")
    ){

        adicionarEspecificacao(
            especificacoes,
            "Marca",
            produto.marcaIrrigacao
        );


        adicionarEspecificacao(
            especificacoes,
            "Tipo",
            produto.tipoIrrigacao
        );

    }


    return especificacoes;

}


/*==================================================
        ADICIONAR ESPECIFICAÇÃO
==================================================*/

function adicionarEspecificacao(
    lista,
    nome,
    valor
){

    if(
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ){

        return;

    }


    lista.push({

        nome,

        valor:
            String(valor).trim()

    });

}


/*==================================================
        RENDERIZAR ESPECIFICAÇÕES
==================================================*/

function renderizarEspecificacoesModal(
    especificacoes
){

    const container =
        document.getElementById(
            "modalEspecificacoes"
        );


    if(!container){

        console.warn(
            "Container #modalEspecificacoes não encontrado no modal."
        );

        return;

    }


    if(
        !especificacoes ||
        especificacoes.length === 0
    ){

        container.innerHTML = "";

        container.style.display =
            "none";

        return;

    }


    container.innerHTML = `

        <div class="modal-especificacoes-titulo">

            <i class="fa-solid fa-list-check"></i>

            Especificações

        </div>


        <div class="modal-especificacoes-lista">

            ${especificacoes
                .map(
                    item => `

                    <div class="modal-especificacao">

                        <span class="modal-especificacao-nome">

                            ${item.nome}

                        </span>


                        <span class="modal-especificacao-valor">

                            ${item.valor}

                        </span>

                    </div>

                `
                )
                .join("")}

        </div>

    `;


    container.style.display =
        "";

}


/*==================================================
        FECHAR MODAL
==================================================*/

function fecharModalProduto(){

    const modal =
        document.getElementById("modalProduto");

    modal.classList.remove("ativo");

    document.body.style.overflow = "";

    produtoModalAtual = null;
}


/*==================================================
        EVENTO VER PRODUTO
==================================================*/

function iniciarModalProduto(){

    document.addEventListener(
        "click",
        event => {

            const botao =
                event.target.closest(".btn-ver");

            if(!botao){
                return;
            }

            const id =
                Number(botao.dataset.id);

            abrirModalProduto(id);

        }
    );


    /* BOTÃO X */

    const fechar =
        document.getElementById("fecharModalProduto");

    if(fechar){

        fechar.addEventListener(
            "click",
            fecharModalProduto
        );

    }


    /* CLICAR FORA DO CONTEÚDO */

    const modal =
        document.getElementById("modalProduto");

    if(modal){

        modal.addEventListener(
            "click",
            event => {

                if(
                    event.target === modal
                ){

                    fecharModalProduto();

                }

            }
        );

    }


    /* TECLA ESC */

    document.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Escape" &&
                modal &&
                modal.classList.contains("ativo")
            ){

                fecharModalProduto();

            }

        }
    );

}

/*==================================================
                INICIALIZAÇÃO
==================================================*/

async function iniciarSistema(){

    iniciarFavoritoHeader();

    await carregarFavoritos();

    atualizarFavoritoHeader();

    await carregarCategoriasProdutos();

    iniciarCategorias();

    iniciarAtalhos();

    iniciarFiltrosLaterais();

    await carregarProdutos();

    iniciarPesquisa();

    iniciarOrdenacao();

    iniciarFavoritos();

    iniciarCarrinho();

    iniciarModalProduto();

}

document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema


);


/*==================================================
        FAVORITOS DO HEADER
==================================================*/

function iniciarFavoritoHeader(){

    const botao =
        document.getElementById("btnFavoritosHeader");


    if(!botao){

        return;

    }


    botao.addEventListener("click", function(event){

        event.preventDefault();


        const token =
            localStorage.getItem("tokenCial");


        // NÃO ESTÁ LOGADO
        if(!token){

            window.location.href =
                "../cadastro/login.html";

            return;

        }


        // ESTÁ LOGADO


   window.location.href = "../cadastro/area-cliente.html#favoritos";

    });
}