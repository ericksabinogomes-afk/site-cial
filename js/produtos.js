/*==================================================
                ELEMENTOS
==================================================*/

const gridProdutos = document.getElementById("gridProdutos");

const totalProdutos = document.getElementById("totalProdutos");

const pesquisa = document.getElementById("pesquisa");

const ordenacao = document.getElementById("ordenacaoTopo");

const categorias = document.querySelectorAll(".categoria-btn");

const filtros = document.querySelectorAll(".filtro-btn");

const atalhos = document.querySelectorAll(".atalho");



/*==================================================
                ESTADO
==================================================*/

let produtos = [];

let produtosFiltrados = [];

let categoriaAtual = "Todos";



/*==================================================
                DADOS
==================================================*/

/*

Os produtos serão carregados futuramente
pela API.

Por enquanto utilizaremos um array.

*/

const produtosExemplo = [

];
/*==================================================
                RENDERIZAÇÃO
==================================================*/

function renderizarProdutos(lista){

    gridProdutos.innerHTML = "";

    totalProdutos.textContent = lista.length;

    if(lista.length === 0){

        gridProdutos.innerHTML = `

            <div class="sem-produtos">

                <i class="fa-solid fa-box-open"></i>

                <h2>Nenhum produto encontrado</h2>

                <p>

                    Tente alterar os filtros ou realizar uma nova pesquisa.

                </p>

            </div>

        `;

        return;

    }

    lista.forEach(produto=>{

        const card = document.createElement("div");

        card.classList.add("card-produto");

        card.innerHTML = `

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

                        R$ ${produto.preco}

                    </span>

                    <span class="parcelamento">

                        ${produto.parcelamento}

                    </span>

                </div>

                <div class="card-estoque">

                    <i class="fa-solid fa-circle-check"></i>

                    ${produto.estoque}

                </div>

                <div class="card-botoes">

                    <button
                        class="btn-ver"
                        data-id="${produto.id}">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                    <button
                        class="btn-carrinho"
                        data-id="${produto.id}">

                        <i class="fa-solid fa-cart-shopping"></i>

                    </button>

                </div>

            </div>

        `;

        gridProdutos.appendChild(card);

    });

}
/*==================================================
                PESQUISA
==================================================*/

function pesquisarProdutos(){

    const texto = pesquisa.value.toLowerCase().trim();

    produtosFiltrados = produtos.filter(produto=>{

        return(

            produto.nome.toLowerCase().includes(texto)

            ||

            produto.codigo.toLowerCase().includes(texto)

            ||

            produto.categoria.toLowerCase().includes(texto)

        );

    });

    renderizarProdutos(produtosFiltrados);

}



/*==================================================
                ORDENAÇÃO
==================================================*/

function ordenarProdutos(){

    const tipo = ordenacao.value;

    switch(tipo){

        case "menor":

            produtosFiltrados.sort((a,b)=>a.valor-b.valor);

            break;

        case "maior":

            produtosFiltrados.sort((a,b)=>b.valor-a.valor);

            break;

        case "az":

            produtosFiltrados.sort((a,b)=>a.nome.localeCompare(b.nome));

            break;

        case "za":

            produtosFiltrados.sort((a,b)=>b.nome.localeCompare(a.nome));

            break;

        default:

            break;

    }

    renderizarProdutos(produtosFiltrados);

}



/*==================================================
                CATEGORIAS
==================================================*/

categorias.forEach(botao=>{

    botao.addEventListener("click",()=>{

        categorias.forEach(btn=>{

            btn.classList.remove("ativo");

        });

        botao.classList.add("ativo");

        categoriaAtual = botao.dataset.categoria;

        if(categoriaAtual==="Todos"){

            produtosFiltrados=[...produtos];

        }

        else{

            produtosFiltrados=produtos.filter(produto=>{

                return produto.categoria===categoriaAtual;

            });

        }

        renderizarProdutos(produtosFiltrados);

    });

});



/*==================================================
                PESQUISA
==================================================*/

pesquisa.addEventListener("keyup",pesquisarProdutos);



/*==================================================
                ORDENAÇÃO
==================================================*/

ordenacao.addEventListener("change",ordenarProdutos);
/*==================================================
                FAVORITOS
==================================================*/

function iniciarFavoritos(){

    document.addEventListener("click",(e)=>{

        const botao = e.target.closest(".btn-favorito");

        if(!botao) return;

        botao.classList.toggle("ativo");

        const icone = botao.querySelector("i");

        if(botao.classList.contains("ativo")){

            icone.classList.remove("fa-regular");

            icone.classList.add("fa-solid");

        }

        else{

            icone.classList.remove("fa-solid");

            icone.classList.add("fa-regular");

        }

    });

}



/*==================================================
                CARRINHO
==================================================*/

function iniciarCarrinho(){

    document.addEventListener("click",(e)=>{

        const botao = e.target.closest(".btn-carrinho");

        if(!botao) return;

        const id = botao.dataset.id;

        console.log("Adicionar ao carrinho:", id);

        // Backend futuramente

    });

}



/*==================================================
                VER PRODUTO
==================================================*/

function iniciarVisualizacao(){

    document.addEventListener("click",(e)=>{

        const botao = e.target.closest(".btn-ver");

        if(!botao) return;

        const id = botao.dataset.id;

        console.log("Abrir produto:", id);

        // Futuramente:
        // window.location = `produto.html?id=${id}`;

    });

}



/*==================================================
            ABRIR CATEGORIAS
==================================================*/

document.querySelectorAll(".categoria-btn").forEach(botao=>{

    botao.addEventListener("click",()=>{

        const sub = botao.nextElementSibling;

        if(!sub) return;

        sub.classList.toggle("ativa");

    });

});



/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener("DOMContentLoaded",()=>{

    produtos = [...produtosExemplo];

    produtosFiltrados = [...produtos];

    renderizarProdutos(produtosFiltrados);

    iniciarFavoritos();

    iniciarCarrinho();

    iniciarVisualizacao();

});