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

    categorias: document.querySelectorAll(".categorias li"),

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
                    PRODUTOS
==================================================*/

/*

Aqui ficará nosso banco de produtos.

Por enquanto será um array.

Depois o Backend substituirá
automaticamente.

*/

const produtos = [

    /*==================================================
                    MOTOSSERRAS
    ==================================================*/

    {

        id:1,

        categoria:"motosserras",

        nome:"MS 162",

        codigo:"MS162",

        selo:"NOVO",

        preco:1299.90,

        valor:1299.90,

        parcela:"10x de R$ 129,99",

        estoque:"Em estoque",

        aplicacao:"Uso Doméstico",

        destaque:"Lançamentos",

        imagem:"imagens/produtos/motosserras/ms162.png"

    },

    {

        id:2,

        categoria:"motosserras",

        nome:"MS 170",

        codigo:"MS170",

        selo:"MAIS VENDIDA",

        preco:1799.90,

        valor:1799.90,

        parcela:"10x de R$ 179,99",

        estoque:"Em estoque",

        aplicacao:"Uso Doméstico",

        destaque:"Mais Vendidos",

        imagem:"imagens/produtos/motosserras/ms170.png"

    },

    {

        id:3,

        categoria:"motosserras",

        nome:"MS 172",

        codigo:"MS172",

        selo:"NOVO",

        preco:1999.90,

        valor:1999.90,

        parcela:"10x de R$ 199,99",

        estoque:"Em estoque",

        aplicacao:"Uso Doméstico",

        destaque:"Lançamentos",

        imagem:"imagens/produtos/motosserras/ms172.png"

    },

    {

        id:4,

        categoria:"motosserras",

        nome:"MS 180",

        codigo:"MS180",

        selo:"POPULAR",

        preco:2299.90,

        valor:2299.90,

        parcela:"10x de R$ 229,99",

        estoque:"Em estoque",

        aplicacao:"Uso Doméstico",

        destaque:"Mais Vendidos",

        imagem:"imagens/produtos/motosserras/ms180.png"

    },

    {

        id:5,

        categoria:"motosserras",

        nome:"MS 182",

        codigo:"MS182",

        selo:"NOVO",

        preco:2499.90,

        valor:2499.90,

        parcela:"10x de R$ 249,99",

        estoque:"Em estoque",

        aplicacao:"Uso Doméstico",

        destaque:"Lançamentos",

        imagem:"imagens/produtos/motosserras/ms182.png"

    },

];
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

    categorias: document.querySelectorAll(".categorias li"),

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

async function carregarProdutos(){

    try{

        /*
            Futuramente será:

            const resposta = await fetch("/api/produtos");

            estado.produtos = await resposta.json();
        */

        estado.produtos = [];

        estado.produtosFiltrados = [...estado.produtos];

        atualizarTotal();

        renderizarProdutos();

    }

    catch(erro){

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
            RENDERIZAÇÃO
==================================================*/

function renderizarProdutos(){

    elementos.grid.innerHTML = "";

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

function criarCard(produto){

    return `

    <article class="card-produto">

        <div class="card-topo">

            <span class="selo">

                ${produto.selo}

            </span>

            <button
                class="btn-favorito"
                data-id="${produto.id}">

                <i class="fa-regular fa-heart"></i>

            </button>

            <div class="card-imagem">

                <img
                    src="${produto.imagem}"
                    alt="${produto.nome}">

            </div>

        </div>

        <div class="card-info">

            <span class="card-categoria">

                ${produto.categoria}

            </span>

            <h3 class="card-titulo">

                ${produto.nome}

            </h3>

            <div class="card-avaliacao">

                ★★★★★

            </div>

            <div class="card-codigo">

                Código: ${produto.codigo}

            </div>

            <div class="card-preco">

                <span class="preco">

                    ${formatarPreco(produto.preco)}

                </span>

                <span class="parcelamento">

                    ${produto.parcela}

                </span>

            </div>

            <div class="card-estoque">

                ✔ ${produto.estoque}

            </div>

            <div class="card-botoes">

                <button
                    class="btn-ver">

                    Ver Produto

                </button>

                <button
                    class="btn-carrinho"
                    data-id="${produto.id}">

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

function renderizarProdutos(){

    elementos.grid.innerHTML = "";



    if(estado.produtosFiltrados.length === 0){

        elementos.grid.innerHTML = `

            <div class="sem-produtos">

                <i class="fa-solid fa-box-open"></i>

                <h2>

                    Nenhum produto encontrado

                </h2>

                <p>

                    Tente alterar os filtros ou realizar outra pesquisa.

                </p>

            </div>

        `;

        atualizarTotal();

        return;

    }



    estado.produtosFiltrados.forEach(produto=>{

        elementos.grid.innerHTML += criarCard(produto);

    });



    atualizarTotal();

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

            produto.nome.toLowerCase().includes(texto)

            ||

            produto.codigo.toLowerCase().includes(texto);



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
                FAVORITOS
==================================================*/

function carregarFavoritos(){

    const favoritos = localStorage.getItem("favoritos");

    if(favoritos){

        estado.favoritos = JSON.parse(favoritos);

    }

}



function salvarFavoritos(){

    localStorage.setItem(

        "favoritos",

        JSON.stringify(estado.favoritos)

    );

}
/*==================================================
            ADICIONAR FAVORITO
==================================================*/

function alternarFavorito(id){

    const existe = estado.favoritos.includes(id);

    if(existe){

        estado.favoritos = estado.favoritos.filter(

            favorito => favorito !== id

        );

    }

    else{

        estado.favoritos.push(id);

    }

    salvarFavoritos();

    renderizarProdutos();

}
/*==================================================
            EVENTOS FAVORITOS
==================================================*/

function iniciarFavoritos(){

    document.addEventListener("click",(event)=>{

        const botao = event.target.closest(".btn-favorito");

        if(!botao){

            return;

        }

        alternarFavorito(

            Number(botao.dataset.id)

        );

    });

}
/*==================================================
                CARRINHO
==================================================*/

function carregarCarrinho(){

    const carrinho = localStorage.getItem("carrinho");

    if(carrinho){

        estado.carrinho = JSON.parse(carrinho);

    }

}



function salvarCarrinho(){

    localStorage.setItem(

        "carrinho",

        JSON.stringify(estado.carrinho)

    );

}
/*==================================================
            ADICIONAR AO CARRINHO
==================================================*/

function adicionarCarrinho(id){

    const item = estado.carrinho.find(

        produto => produto.id === id

    );



    if(item){

        item.quantidade++;

    }

    else{

        estado.carrinho.push({

            id,

            quantidade:1

        });

    }



    salvarCarrinho();

    atualizarCarrinho();

}
/*==================================================
            CONTADOR CARRINHO
==================================================*/

function atualizarCarrinho(){

    const quantidade = estado.carrinho.reduce(

        (total,item)=> total + item.quantidade,

        0

    );



    const contador = document.getElementById(

        "contadorCarrinho"

    );



    if(contador){

        contador.textContent = quantidade;

    }

}
/*==================================================
            EVENTOS CARRINHO
==================================================*/

function iniciarCarrinho(){

    document.addEventListener("click",(event)=>{

        const botao = event.target.closest(

            ".btn-carrinho"

        );



        if(!botao){

            return;

        }



        adicionarCarrinho(

            Number(botao.dataset.id)

        );

    });

}
/*==================================================
                INICIALIZAÇÃO
==================================================*/

function iniciarSistema(){

    carregarFavoritos();

    carregarCarrinho();

    carregarProdutos();

    iniciarCategorias();

    iniciarPesquisa();

    iniciarOrdenacao();

    iniciarFavoritos();

    iniciarCarrinho();

}



document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema

);