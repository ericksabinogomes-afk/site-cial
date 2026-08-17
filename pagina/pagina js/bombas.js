/*==================================================
                    CONFIGURAÇÕES
==================================================*/

const CONFIG = {

    moeda: "BRL",

    locale: "pt-BR",

    parcelas: 10

};

const nomesCategoriasBombas = {
  "bombas-centrifugas": "Bombas Centrífugas",
  "bombas-perifericas": "Bombas Periféricas",
  "bombas-submersas": "Bombas Submersas",
  "bombas-submersiveis": "Bombas Submersíveis",
  "bombas-autoaspirantes": "Bombas Autoaspirantes",
  "bombas-injetoras": "Bombas Injetoras",
  "bombas-motobombas-irrigacao": "Motobombas para Irrigação",
  "bombas-piscina": "Bombas para Piscina",
  "bombas-irrigacao": "Bombas para Irrigação",
  "bombas-poco": "Bombas para Poço",
  "bombas-drenagem": "Bombas para Drenagem",
  "bombas-esgoto": "Bombas para Esgoto",
  "bombas-pressurizadores": "Pressurizadores",
  "bombas-sistemas-pressurizacao": "Sistemas de Pressurização",
  "bombas-acessorios": "Acessórios para Bombas"
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

    marca: "",

    aplicacao: "",

    potencia: "",

    ordenacao: "recentes",

    favoritos: [],

    carrinho: []

};



/*==================================================
            BANCO DE PRODUTOS
==================================================*/

/*

Os produtos NÃO ficarão cadastrados aqui.

Eles serão enviados pelo Painel Administrativo.

Fluxo:

Administrador

↓

Banco de Dados

↓

API

↓

bombas.js

*/

const produtos = [];
/*==================================================
            CARREGAR PRODUTOS
==================================================*/

async function carregarProdutos(){

    try{

        console.log("🔄 Carregando produtos do backend...");

        const resposta = await fetch(
            "http://localhost:4000/produtos"
        );

        if(!resposta.ok){

            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );

        }

        const resultado = await resposta.json();

        console.log(
            "📦 Produtos recebidos:",
            resultado
        );


        /*
        ==========================================
        O BACKEND RETORNA:

        {
            ok: true,
            data: [...]
        }
        ==========================================
        */

        if(!resultado.ok){

            throw new Error(
                "Backend retornou erro."
            );

        }


        estado.produtos = resultado.data || [];


        /*
        ==========================================
        MOSTRAR SOMENTE PRODUTOS DE
        BOMBAS E IRRIGAÇÃO
        ==========================================
        */

    const categoriasBombas = [

    "bombas-centrifugas",

    "bombas-perifericas",

    "bombas-submersas",

    "bombas-submersiveis",

    "bombas-autoaspirantes",

    "bombas-injetoras",

    "motobombas-irrigacao",

    "bombas-piscina",

    "bombas-irrigacao",

    "bombas-poco",

    "bombas-drenagem",

    "bombas-esgoto",

    "pressurizadores",

    "sistemas-pressurizacao",

    "acessorios-bombas"

];

        estado.produtos = estado.produtos.filter(

            produto =>

                categoriasBombas.includes(

                    String(
                        produto.categoria
                    ).toLowerCase()

                )

        );


        estado.produtosFiltrados = [

            ...estado.produtos

        ];


        atualizarTotal();

        renderizarProdutos();


        console.log(
            "✅ Produtos de bombas carregados:",
            estado.produtos.length
        );

    }

    catch(erro){

        console.error(
            "❌ Erro ao carregar produtos:",
            erro
        );


        elementos.grid.innerHTML = `

            <div class="sem-produtos">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h2>
                    Não foi possível carregar os produtos
                </h2>

                <p>
                    Verifique se o servidor está funcionando.
                </p>

            </div>

        `;

    }

}
/*==================================================
            TOTAL DE PRODUTOS
==================================================*/

function atualizarTotal(){

    elementos.total.textContent =

        estado.produtosFiltrados.length;

}
/*==================================================
                UTILITÁRIOS
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

                    ${nomesCategoriasBombas[produto.categoria] || produto.categoria}

                </span>

                <h3 class="card-titulo">

                    ${produto.nome}

                </h3>

                <div class="card-especificacoes">

                    <span>

                        <strong>Marca:</strong>

                        ${produto.marca}

                    </span>

                    <span>

                        <strong>Potência:</strong>

                        ${produto.potencia}

                    </span>

                    <span>

                        <strong>Vazão:</strong>

                        ${produto.vazao}

                    </span>

                    <span>

                        <strong>Aplicação:</strong>

                        ${produto.aplicacao}

                    </span>

                </div>

                <div class="card-preco">

                    <span class="preco">

                        ${formatarPreco(produto.preco)}

                    </span>

                    <span class="parcelamento">

                        ${produto.parcelamento}

                    </span>

                </div>

                <div class="card-estoque">

                    ✔ ${produto.estoque}

                </div>

                <div class="card-botoes">

                    <button
                        class="btn-ver"
                        data-id="${produto.id}">

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



    const cards = estado.produtosFiltrados.map(produto=>{

        return criarCard(produto);

    });



    elementos.grid.innerHTML = cards.join("");



    atualizarTotal();

}
/*==================================================
            FILTRAR PRODUTOS
==================================================*/

function filtrarProdutos(){

    estado.produtosFiltrados = estado.produtos.filter(produto=>{

        const categoriaOk =

            estado.categoria === "todos"

            ||

            produto.categoria === estado.categoria;


const termoPesquisa =
    estado.pesquisa
        .trim()
        .toLowerCase();


const pesquisaOk =

    termoPesquisa === ""

    ||

    String(produto.nome || "")
        .toLowerCase()
        .includes(termoPesquisa)

    ||

    String(produto.codigo || "")
        .toLowerCase()
        .includes(termoPesquisa)

    ||

    String(produto.categoria || "")
        .toLowerCase()
        .includes(termoPesquisa)

    ||

    String(produto.marca || "")
        .toLowerCase()
        .includes(termoPesquisa)

    ||

    String(produto.descricao || "")
        .toLowerCase()
        .includes(termoPesquisa);



        const marcaOk =

            estado.marca === ""

            ||

            produto.marca === estado.marca;



        const aplicacaoOk =

            estado.aplicacao === ""

            ||

            produto.aplicacao === estado.aplicacao;



        const potenciaOk =

            estado.potencia === ""

            ||

            produto.potencia === estado.potencia;



        const precoOk =

            estado.preco === ""

            ||

            produto.preco <= Number(estado.preco);



        return (

            categoriaOk

            &&

            pesquisaOk

            &&

            marcaOk

            &&

            aplicacaoOk

            &&

            potenciaOk

            &&

            precoOk

        );

    });



    ordenarProdutos();

    renderizarProdutos();

}
/*==================================================
            CATEGORIAS
==================================================*/

function iniciarCategorias(){

    elementos.categorias.forEach(item=>{

        item.addEventListener("click",()=>{

            elementos.categorias.forEach(c=>{

                c.classList.remove("ativo");

            });



            item.classList.add("ativo");



            estado.categoria =

                item.dataset.categoria;



            filtrarProdutos();

        });

    });

}
/*==================================================
            CATEGORIAS
==================================================*/

function iniciarCategorias(){

    elementos.categorias.forEach(item=>{

        item.addEventListener("click",()=>{

            elementos.categorias.forEach(c=>{

                c.classList.remove("ativo");

            });



            item.classList.add("ativo");



            estado.categoria =

                item.dataset.categoria;



            filtrarProdutos();

        });

    });

}
/*==================================================
                PESQUISA
==================================================*/

function iniciarPesquisa(){

    elementos.pesquisa.addEventListener("input",()=>{

        estado.pesquisa =

            elementos.pesquisa.value;



        filtrarProdutos();

    });

}
/*==================================================
                MARCAS
==================================================*/

function iniciarMarcas(){

    const marcas = elementos.filtros[0].querySelectorAll("li");

    marcas.forEach(item=>{

        item.addEventListener("click",()=>{

            estado.marca = item.textContent.trim();

            filtrarProdutos();

        });

    });

}
/*==================================================
                APLICAÇÃO
==================================================*/

function iniciarAplicacao(){

    const aplicacoes = elementos.filtros[1].querySelectorAll("li");

    aplicacoes.forEach(item=>{

        item.addEventListener("click",()=>{

            estado.aplicacao = item.textContent.trim();

            filtrarProdutos();

        });

    });

}
/*==================================================
                POTÊNCIA
==================================================*/

function iniciarPotencia(){

    const potencias = elementos.filtros[2].querySelectorAll("li");

    potencias.forEach(item=>{

        item.addEventListener("click",()=>{

            estado.potencia = item.textContent.trim();

            filtrarProdutos();

        });

    });

}
/*==================================================
            ORDENAÇÃO
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

        default:

            estado.produtosFiltrados.sort((a,b)=>b.id-a.id);

            break;

    }

}
/*==================================================
        EVENTO ORDENAÇÃO
==================================================*/

function iniciarOrdenacao(){

    elementos.ordenacao.addEventListener("change",()=>{

        estado.ordenacao =

            elementos.ordenacao.value;

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



function alternarFavorito(id){

    const existe = estado.favoritos.includes(id);

    if(existe){

        estado.favoritos = estado.favoritos.filter(

            favorito=>favorito!==id

        );

    }

    else{

        estado.favoritos.push(id);

    }

    salvarFavoritos();

    renderizarProdutos();

}



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



function adicionarCarrinho(id){

    const item = estado.carrinho.find(

        produto=>produto.id===id

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



function atualizarCarrinho(){

    const quantidade = estado.carrinho.reduce(

        (total,item)=>total+item.quantidade,

        0

    );



    const contador = document.getElementById(

        "contadorCarrinho"

    );



    if(contador){

        contador.textContent=quantidade;

    }

}



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

    iniciarPreco();

    iniciarMarcas();

    iniciarAplicacao();

    iniciarPotencia();

    iniciarOrdenacao();

    iniciarFavoritos();

    iniciarCarrinho();

}



document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema

);
