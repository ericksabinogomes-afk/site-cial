/*==================================================
                    CONFIGURAÇÕES
==================================================*/

const CONFIG = {

    moeda: "BRL",

    locale: "pt-BR",

    parcelas: 10

};

/*==================================================
            URL DA API
==================================================*/

const API_BASE =
    window.API_BASE_URL ||
    "http://localhost:4000";

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

    categorias:
    Array.isArray(p.categorias)
        ? p.categorias
        : (p.categoria ? [p.categoria] : []),

    nome: p.nome || "",

    selo: p.selo || "",

    preco: Number(p.preco) || 0,

    parcela: p.parcela || "",

    estoque: p.estoque || "Em estoque",

    descricao: p.descricao || "",

    funcao: p.funcao || "",

    linhaProduto:
    p.linha_produto ||
    p.linhaProduto ||
    p.linha ||
    "",

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
    p.tipo_irrigacao || "",

especificacoes:
    p.especificacoes || {}

}));

    estado.produtosFiltrados = [...estado.produtos];
    ordenarProdutos();
    atualizarTotal();
    renderizarProdutos();
  
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

console.log(
    "🔋 PRODUTOS COM LINHA:",
    estado.produtos.map(p => ({
        id: p.id,
        nome: p.nome,
        linhaProduto: p.linhaProduto
    }))
);


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
        `${API_BASE}/categorias`
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

  else {

    estado.produtosFiltrados =
        estado.produtos.filter(produto => {

            const categoriaSelecionada =
                String(categoria || "")
                    .trim()
                    .toLowerCase();

            const categoriasProduto =
                Array.isArray(produto.categorias)
                    ? produto.categorias.map(c =>
                        String(c || "")
                            .trim()
                            .toLowerCase()
                      )
                    : [
                        String(produto.categoria || "")
                            .trim()
                            .toLowerCase()
                      ];

                const categoriasEquivalentes =
    categoriaSelecionada === "bateria"
        ? ["bateria", "linha-bateria"]
        : [categoriaSelecionada];

return categoriasProduto.some(item =>
    categoriasEquivalentes.includes(item)
);
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

            const linha =
                String(produto.linhaProduto || "")
                    .trim()
                    .toLowerCase();

           return (
  linha === "bateria" ||
  produto.categorias.includes("linha-bateria")
);

        });

    }

              /* LINHA ELÉTRICA */

else if (filtro === "eletrica") {

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
        estado.produtos.filter(produto => {

            const linha =
                String(produto.linhaProduto || "")
                    .trim()
                    .toLowerCase();

           return (
    linha === "eletrica" ||
    produto.categorias.includes("linha-eletrica")
);

        });

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

            if (textoFiltro === "Linha a Bateria") {

    estado.destaque = "";
    estado.categoria = "todos";
    estado.aplicacao = "";

    estado.produtosFiltrados =
        estado.produtos.filter(produto => {

            const linha =
                String(produto.linhaProduto || "")
                    .trim()
                    .toLowerCase();

           return (
  linha === "bateria" ||
  produto.categorias.includes("linha-bateria")
);

        });

    ordenarProdutos();
    atualizarTotal();
    renderizarProdutos();

    return;
}

if (textoFiltro === "Linha Elétrica") {

    estado.destaque = "";
    estado.categoria = "todos";
    estado.aplicacao = "";

    estado.produtosFiltrados =
        estado.produtos.filter(produto => {

            const linha =
                String(produto.linhaProduto || "")
                    .trim()
                    .toLowerCase();

           return (
    linha === "eletrica" ||
    produto.categorias.includes("linha-eletrica")
);

        });

    ordenarProdutos();
    atualizarTotal();
    renderizarProdutos();

    return;
}

estado.aplicacao =
    textoFiltro;

aplicarFiltros();

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

    const categoriaSelecionada =
      String(estado.categoria || "")
        .trim()
        .toLowerCase();

const categoriasProduto = Array.isArray(produto.categorias)
    ? produto.categorias.map(c =>
        String(c || "")
            .trim()
            .toLowerCase()
      )
    : [
        String(produto.categoria || "")
            .trim()
            .toLowerCase()
      ];

const correspondeCategoria =
    categoriaSelecionada === "todos" ||
    categoriasProduto.includes(categoriaSelecionada);


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




  const correspondeCategoria =
    estado.categoria === "todos" ||
    (
        Array.isArray(produto.categorias)
            ? produto.categorias.some(categoria =>
                String(categoria)
                    .trim()
                    .toLowerCase() ===
                String(estado.categoria)
                    .trim()
                    .toLowerCase()
            )
            : String(produto.categoria || "")
                .trim()
                .toLowerCase() ===
              String(estado.categoria || "")
                .trim()
                .toLowerCase()

    );



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

    };



    renderizarProdutos();


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

const API_FAVORITOS = API_BASE;


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

const API_CARRINHO = API_BASE;

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

return true;

    } catch (erro) {
        console.error(
            "Erro ao adicionar ao carrinho:",
            erro
        );

        return false;
    }
}

async function removerDoCarrinho(produtoId) {

    const token =
        localStorage.getItem("tokenCial");

    if (!token) {
        window.location.href =
            "../cadastro/login.html";

        return false;
    }

    try {

        const resposta =
            await fetch(
                `${API_CARRINHO}/carrinho/${produtoId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
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

            return false;
        }

        if (!resposta.ok || !resultado.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao remover do carrinho"
            );
        }

        if (window.atualizarContadorCarrinho) {

            await window.atualizarContadorCarrinho();

        }

        return true;

    } catch (erro) {

        console.error(
            "Erro ao remover do carrinho:",
            erro
        );

        return false;
    }
}

async function obterCarrinhoAtual(){

    const token =
        localStorage.getItem("tokenCial");

    if(!token){
        return [];
    }

    try{

        const resposta =
            await fetch(
                `${API_CARRINHO}/carrinho`,
                {
                    headers:{
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const resultado =
            await resposta.json();

        if(
            !resposta.ok ||
            !resultado.ok
        ){
            return [];
        }

        return Array.isArray(resultado.data)
            ? resultado.data
            : [];

    }catch(erro){

        console.error(
            "Erro ao consultar carrinho:",
            erro
        );

        return [];

    }

}

function iniciarCarrinho() {
    // O carrinho dos produtos é controlado
    // pelo sistema global do global.js.
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