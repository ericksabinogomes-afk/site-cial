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
    id: p.id,
    categoria: p.categoria,
    nome: p.nome,
    codigo: p.codigo,
    selo: p.selo || "",
    preco: Number(p.preco),
    parcela: p.parcela || "",
    estoque: p.estoque || "Em estoque",

    // Imagem principal
    imagem: p.imagem || "",

    // Array de imagens adicionais salvo no JSONB
    imagens: Array.isArray(p.imagens) ? p.imagens : []
    }));

    estado.produtosFiltrados = [...estado.produtos];
    ordenarProdutos();
    atualizarTotal();
    renderizarProdutos();
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

    texto === ""

    ||

    String(produto.nome || "")
        .toLowerCase()
        .includes(texto)

    ||

    String(produto.codigo || "")
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

async function carregarFavoritos(){

    const token = obterToken();


    // Usuário não está logado
    if(!token){

        estado.favoritos = [];

        return;

    }


    try{

        const resposta = await fetch(
            `${API_FAVORITOS}/favoritos`,
            {
                headers:{
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if(resposta.status === 401){

            localStorage.removeItem("tokenCial");
            localStorage.removeItem("usuarioCial");

            estado.favoritos = [];

            return;

        }


        const resultado =
            await resposta.json();


        if(!resultado.ok){

            throw new Error(
                resultado.erro ||
                "Erro ao carregar favoritos"
            );

        }


        estado.favoritos =
            (resultado.data || [])
                .map(item =>
                    Number(item.produto_id)
                );


    }catch(erro){

        console.error(
            "Erro ao carregar favoritos:",
            erro
        );

        estado.favoritos = [];

    }

}


/*==================================================
        ADICIONAR / REMOVER FAVORITO
==================================================*/

async function alternarFavorito(id){

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
        MODAL DO PRODUTO
==================================================*/

let produtoModalAtual = null;

function abrirModalProduto(id){

    const produto = estado.produtos.find(
        item => item.id === id
    );

    if(!produto){
        console.error("Produto não encontrado:", id);
        return;
    }

    produtoModalAtual = produto;

    const modal = document.getElementById("modalProduto");

    const imagemPrincipal =
        document.getElementById("modalImagemPrincipal");

    const miniaturas =
        document.getElementById("modalMiniaturas");

    const categoria =
        document.getElementById("modalCategoria");

    const nome =
        document.getElementById("modalNomeProduto");

    const codigo =
        document.getElementById("modalCodigoProduto");

    const preco =
        document.getElementById("modalPrecoProduto");

    const estoque =
        document.getElementById("modalEstoqueProduto");

    const descricao =
        document.getElementById("modalDescricaoProduto");


    /*========================================
            INFORMAÇÕES
    ========================================*/

    categoria.textContent =
        produto.categoria || "";

    nome.textContent =
        produto.nome || "";

    codigo.textContent =
        `Código: ${produto.codigo || "Não informado"}`;

    preco.textContent =
        formatarPreco(produto.preco || 0);

    estoque.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        ${produto.estoque || "Em estoque"}
    `;

    descricao.textContent =
        produto.descricao ||
        "Entre em contato com a CIAL Asa Sul para mais informações sobre este produto.";


/*========================================
        GALERIA DE IMAGENS
========================================*/

    const imagens = [
        produto.imagem,
        ...(Array.isArray(produto.imagens) ? produto.imagens : [])
        ].filter(Boolean);

        if (imagens.length === 0) {
        imagens.push("imagens/produto-sem-imagem.png");
        }

        imagemPrincipal.src = imagens[0];
        imagemPrincipal.alt = produto.nome || "Produto";

        miniaturas.innerHTML = "";

        imagens.forEach((imagem, indice) => {
    const miniatura = document.createElement("button");

        miniatura.type = "button";

        miniatura.className =
            "modal-produto-miniatura" +
            (indice === 0 ? " ativa" : "");

        miniatura.innerHTML = `
            <img
            src="${imagem}"
            alt="${produto.nome || "Produto"} — imagem ${indice + 1}"
            >
        `;

        miniatura.addEventListener("click", () => {
            imagemPrincipal.src = imagem;

            miniaturas
            .querySelectorAll(".modal-produto-miniatura")
            .forEach((item) => {
                item.classList.remove("ativa");
            });

            miniatura.classList.add("ativa");
        });

        miniaturas.appendChild(miniatura);
        });

/*========================================
        ABRIR MODAL
========================================*/

        modal.classList.add("ativo");

        document.body.style.overflow = "hidden";
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

    carregarCarrinho();
    
    iniciarCategorias();

    carregarProdutos();

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





