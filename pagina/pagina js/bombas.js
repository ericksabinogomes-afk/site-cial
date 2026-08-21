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

const nomesCategoriasIrrigacao = {
    "aspersores": "Aspersores",
    "microaspersores": "Microaspersores",
    "gotejamento": "Gotejamento",
    "mangueiras-irrigacao": "Mangueiras de Irrigação",
    "tubos-irrigacao": "Tubos para Irrigação",
    "conexoes-irrigacao": "Conexões de Irrigação",
    "filtros-irrigacao": "Filtros de Irrigação",
    "valvulas-irrigacao": "Válvulas de Irrigação",
    "acessorios-irrigacao": "Acessórios de Irrigação"
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

    destaque: "",

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


       estado.produtos = (resultado.data || []).map(p => ({

    ...p,

    marcaBomba: p.marca_bomba || "",
    potenciaBomba: p.potencia_bomba || "",
    vazaoBomba: p.vazao_bomba || "",
    aplicacaoBomba: p.aplicacao_bomba || "",

    marcaIrrigacao: p.marca_irrigacao || "",
    tipoIrrigacao: p.tipo_irrigacao || ""

}));

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

    "bombas-motobombas-irrigacao",

    "bombas-piscina",

    "bombas-irrigacao",

    "bombas-poco",

    "bombas-drenagem",

    "bombas-esgoto",

    "bombas-pressurizadores",

    "bombas-sistemas-pressurizacao",

    "bombas-acessorios"

];

const categoriasIrrigacao = [
    "aspersores",
    "microaspersores",
    "gotejamento",
    "mangueiras-irrigacao",
    "tubos-irrigacao",
    "conexoes-irrigacao",
    "filtros-irrigacao",
    "valvulas-irrigacao",
    "acessorios-irrigacao"
];

const categoriasBombasIrrigacao = [
    ...categoriasBombas,
    ...categoriasIrrigacao
];

        estado.produtos = estado.produtos.filter(

            produto =>

               categoriasBombasIrrigacao.includes(
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

/*==================================================
                CRIAR CARD
==================================================*/

function criarCard(produto){

    const favorito =
        estado.favoritos.includes(Number(produto.id));


    const nomeCategoria =
        nomesCategoriasBombas[produto.categoria] ||
        nomesCategoriasIrrigacao[produto.categoria] ||
        produto.categoria ||
        "BOMBAS E IRRIGAÇÃO";


    /*==================================================
        ESPECIFICAÇÕES DINÂMICAS
    ==================================================*/

    const especificacoes = [];


    if(produto.marca){

        especificacoes.push(`
            <span>
                <strong>Marca:</strong>
                ${produto.marca}
            </span>
        `);

    }


    if(produto.potencia){

        especificacoes.push(`
            <span>
                <strong>Potência:</strong>
                ${produto.potencia}
            </span>
        `);

    }


    if(produto.vazao){

        especificacoes.push(`
            <span>
                <strong>Vazão:</strong>
                ${produto.vazao}
            </span>
        `);

    }


    if(produto.aplicacao){

        especificacoes.push(`
            <span>
                <strong>Aplicação:</strong>
                ${produto.aplicacao}
            </span>
        `);

    }


    return `

        <article class="card-produto">


            <!-- TOPO -->

            <div class="card-topo">


                ${produto.selo ? `

                    <span class="selo">
                        ${produto.selo}
                    </span>

                ` : ""}


                <button
                    type="button"
                    class="btn-favorito ${favorito ? "ativo" : ""}"
                    data-id="${produto.id}"
                    aria-label="Adicionar ${produto.nome} aos favoritos">

                    <i class="${
                        favorito
                            ? "fa-solid"
                            : "fa-regular"
                    } fa-heart"></i>

                </button>


            </div>


            <!-- IMAGEM -->

            <div class="card-imagem">

                <img
                    src="${
                        produto.imagem ||
                        "imagens/produto-sem-imagem.png"
                    }"
                    alt="${produto.nome || "Produto"}"
                    loading="lazy"
                    onerror="this.src='imagens/produto-sem-imagem.png'">

            </div>


            <!-- INFORMAÇÕES -->

            <div class="card-info">


                <span class="card-categoria">

                    ${nomeCategoria}

                </span>


                <h3 class="card-titulo">

                    ${produto.nome || "Produto"}

                </h3>


                ${
                    especificacoes.length
                        ? `

                            <div class="card-especificacoes">

                                ${especificacoes.join("")}

                            </div>

                        `
                        : ""
                }


                <!-- AVALIAÇÃO -->

                <div
                    class="card-avaliacao"
                    aria-label="5 estrelas">

                    5/5
                    ★★★★★

                </div>


                <!-- PREÇO -->

                <div class="card-preco">

                    <span class="preco">

                        ${formatarPreco(
                            Number(produto.preco) || 0
                        )}

                    </span>


                    <span class="parcelamento">

                        ${produto.parcela || ""}

                    </span>

                </div>


                <!-- ESTOQUE -->

                <div class="card-estoque">

                    <i class="fa-solid fa-circle-check"></i>

                    ${produto.estoque || "Em estoque"}

                </div>


                <!-- BOTÕES -->

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


const destaqueOk =
    estado.destaque === ""
    ||
    String(produto.selo || "").toLowerCase() ===
        estado.destaque.toLowerCase();

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

            destaqueOk

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
                ATALHOS
==================================================*/

function iniciarAtalhos(){

    elementos.atalhos.forEach(botao => {

        botao.addEventListener("click", () => {

            elementos.atalhos.forEach(b => {
                b.classList.remove("ativo");
            });

            botao.classList.add("ativo");

            const texto =
                botao.textContent.trim();

            estado.destaque = "";
            estado.categoria = "todos";


            if(texto === "Promoções"){

                estado.destaque = "promocoes";

            }


            else if(texto === "Lançamentos"){

                estado.destaque = "lancamentos";

            }


            else if(texto === "Mais Vendidos"){

                estado.destaque = "mais-vendidos";

            }


            else if(texto === "Novidades"){

                estado.destaque = "novidades";

            }


            else if(texto === "Irrigação"){

                estado.categoria = "irrigacao";

            }


            else if(texto === "Bombas Residenciais"){

                estado.categoria = "bombas-residenciais";

            }


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

const API_FAVORITOS = "http://localhost:4000";

async function carregarFavoritos(){

    const token =
        localStorage.getItem("tokenCial");

    if(!token){

        estado.favoritos = [];

        atualizarFavoritoHeader();

        return;
    }

    try{

        const resposta =
            await fetch(
                `${API_FAVORITOS}/favoritos`,
                {
                    headers:{
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const resultado =
            await resposta.json();

        if(!resposta.ok || !resultado.ok){

            throw new Error(
                resultado.erro ||
                "Erro ao carregar favoritos"
            );

        }

        estado.favoritos =
            (resultado.data || [])
                .map(item => Number(
                    item.produto_id ??
                    item.id
                ));

        atualizarFavoritoHeader();

        renderizarProdutos();

    }
    catch(erro){

        console.error(
            "❌ Erro ao carregar favoritos:",
            erro
        );

        estado.favoritos = [];

        atualizarFavoritoHeader();

    }

}


function atualizarFavoritoHeader(){

    const botao =
        document.getElementById(
            "btnFavoritosHeader"
        );

    if(!botao) return;

    const icone =
        botao.querySelector("i");

    const contador =
        document.getElementById(
            "contadorFavoritos"
        );

    const quantidade =
        estado.favoritos.length;

    const temFavoritos =
        quantidade > 0;


    /* CORAÇÃO */

    if(icone){

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

    if(contador){

        contador.textContent =
            quantidade;

        contador.style.display =
            temFavoritos
                ? "flex"
                : "none";

    }

}


async function alternarFavorito(id){

    const token =
        localStorage.getItem("tokenCial");

    if(!token){

        window.location.href =
            "../cadastro/login.html";

       
            return;
    }
    

    const existe =
        estado.favoritos.includes(
            Number(id)
        );

    let resposta;

    try{

        if(existe){

            resposta = await fetch(
                `${API_FAVORITOS}/favoritos/${id}`,
                {
                    method: "DELETE",

                    headers:{
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        }else{

            resposta = await fetch(
                `${API_FAVORITOS}/favoritos`,
                {
                    method: "POST",

                    headers:{
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        produto_id: Number(id)
             
                    
                    })

                }
            );

        }

        const resultado =
            await resposta.json();

        if(
            !resposta.ok ||
            !resultado.ok
        ){

            throw new Error(
                resultado.erro ||
                "Erro ao alterar favorito"
            );

        }


        if(existe){

            estado.favoritos =
                estado.favoritos.filter(
                    favorito =>
                        Number(favorito) !==
                        Number(id)
                );

        }else{

            estado.favoritos.push(
                Number(id)
            );
        }



        atualizarFavoritoHeader();

        renderizarProdutos();

        console.log(
            "✅ Favorito atualizado com sucesso!"
        );

    }
    catch(erro){

        console.error(
            "❌ Erro ao alterar favorito:",
            erro
        );

    }

}


function iniciarFavoritos(){

    document.addEventListener(
        "click",
        event => {

            const botao =
                event.target.closest(
                    ".btn-favorito"
                );

            if(!botao) return;

            alternarFavorito(
                Number(
                    botao.dataset.id
                )
            );

        }
    );


    const botaoHeader =
        document.getElementById(
            "btnFavoritosHeader"
        );

    if(botaoHeader){

        botaoHeader.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const token =
                    localStorage.getItem(
                        "tokenCial"
                    );

                if(!token){

                    window.location.href =
                        "../cadastro/login.html";

                    return;

                }

                window.location.href =
                    "../cadastro/area-cliente.html#favoritos";

            }
        );

    }

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
        MODAL DO PRODUTO
        MESMA ESTRUTURA DO MODAL DE PRODUTOS
        COM DADOS ESPECÍFICOS DE BOMBAS
==================================================*/

let produtoModalAtual = null;


function abrirModalProduto(id){

    const produto = estado.produtos.find(
        item => Number(item.id) === Number(id)
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
                ELEMENTOS DO MODAL
    ========================================*/

    const modal =
        document.getElementById(
            "modalProduto"
        );


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


    const codigo =
        document.getElementById(
            "modalCodigoProduto"
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
              CATEGORIA
    ========================================*/

    categoria.textContent =

        nomesCategoriasBombas[
            produto.categoria
        ] ||

        nomesCategoriasIrrigacao[
            produto.categoria
        ] ||

        produto.categoria ||

        "Bombas e Irrigação";


    /*========================================
              NOME
    ========================================*/

    nome.textContent =
        produto.nome || "";


    /*========================================
              CÓDIGO
    ========================================*/

    if(codigo){

        codigo.textContent =

            produto.codigo

                ? `Código: ${produto.codigo}`

                : "";

    }


    /*========================================
              PREÇO
    ========================================*/

    preco.textContent =

        formatarPreco(
            Number(produto.preco) || 0
        );


    /*========================================
              ESTOQUE
    ========================================*/

    estoque.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        ${produto.estoque || "Em estoque"}

    `;


    /*========================================
              DESCRIÇÃO
    ========================================*/

    descricao.textContent =

        produto.descricao ||

        produto.funcao ||

        "Entre em contato com a CIAL Asa Sul para mais informações sobre este produto.";


    /*========================================
        ESPECIFICAÇÕES DE BOMBAS / IRRIGAÇÃO
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


    /*========================================
              IMAGEM PRINCIPAL
    ========================================*/

    imagemPrincipal.src =
        imagens[0];


    imagemPrincipal.alt =
        produto.nome || "Produto";


    /*========================================
              MINIATURAS
    ========================================*/

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
                    alt="${
                        produto.nome ||
                        "Produto"
                    } — imagem ${
                        indice + 1
                    }"
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

            produto.descricaoStihl ||
            produto.descricao

        );


        adicionarEspecificacao(

            especificacoes,

            "Aplicação",

            produto.aplicacaoStihl ||
            produto.aplicacao

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

            produto.marcaBomba ||
            produto.marca

        );


        adicionarEspecificacao(

            especificacoes,

            "Potência",

            produto.potenciaBomba ||
            produto.potencia

        );


        adicionarEspecificacao(

            especificacoes,

            "Vazão",

            produto.vazaoBomba ||
            produto.vazao

        );


        adicionarEspecificacao(

            especificacoes,

            "Aplicação",

            produto.aplicacaoBomba ||
            produto.aplicacao

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

            produto.marcaIrrigacao ||
            produto.marca

        );


        adicionarEspecificacao(

            especificacoes,

            "Tipo",

            produto.tipoIrrigacao ||
            produto.tipo

        );


        adicionarEspecificacao(

            especificacoes,

            "Aplicação",

            produto.aplicacaoIrrigacao ||
            produto.aplicacao

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
        document.getElementById(
            "modalProduto"
        );


    if(!modal){

        return;

    }


    modal.classList.remove(
        "ativo"
    );


    document.body.style.overflow =
        "";


    produtoModalAtual =
        null;

}



/*==================================================
            EVENTOS DO MODAL
==================================================*/

function iniciarModalProduto(){


    /* BOTÃO VER PRODUTO */

    document.addEventListener(
        "click",
        event => {

            const botao =
                event.target.closest(
                    ".btn-ver"
                );


            if(!botao){

                return;

            }


            const id =
                Number(
                    botao.dataset.id
                );


            abrirModalProduto(id);

        }
    );



    /* BOTÃO X */

    const fechar =
        document.getElementById(
            "fecharModalProduto"
        );


    if(fechar){

        fechar.addEventListener(
            "click",
            fecharModalProduto
        );

    }



    /* CLICAR FORA */

    const modal =
        document.getElementById(
            "modalProduto"
        );


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



    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Escape" &&
                modal &&
                modal.classList.contains(
                    "ativo"
                )
            ){

                fecharModalProduto();

            }

        }
    );



    /* FAVORITAR PELO MODAL */

    const btnFavoritar =
        document.getElementById(
            "modalFavoritarProduto"
        );


    if(btnFavoritar){

        btnFavoritar.addEventListener(
            "click",
            () => {

                if(
                    produtoModalAtual
                ){

                    alternarFavorito(
                        Number(
                            produtoModalAtual.id
                        )
                    );

                }

            }
        );

    }



    /* ADICIONAR AO CARRINHO PELO MODAL */

    const btnCarrinho =
        document.getElementById(
            "modalAdicionarCarrinho"
        );


    if(btnCarrinho){

        btnCarrinho.addEventListener(
            "click",
            () => {

                if(
                    produtoModalAtual
                ){

                    adicionarCarrinho(
                        Number(
                            produtoModalAtual.id
                        )
                    );

                }

            }
        );

    }

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

    iniciarMarcas();

    iniciarAplicacao();

    iniciarPotencia();

    iniciarOrdenacao();

    iniciarFavoritos();

    iniciarCarrinho();

    iniciarModalProduto();

    iniciarAtalhos();

}



document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema

);
