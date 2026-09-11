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

  categorias: document.querySelectorAll("#listaCategorias li"),

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



       const marcaProduto = String(
    produto.marcaBomba ||
    produto.marcaIrrigacao ||
    produto.marca ||
    ""
).trim().toLowerCase();

const marcaFiltro = String(
    estado.marca || ""
).trim().toLowerCase();

const marcaOk =
    marcaFiltro === "" ||
    marcaProduto.includes(marcaFiltro);

const aplicacaoProduto = String(
    produto.aplicacaoBomba ||
    produto.aplicacaoIrrigacao ||
    produto.aplicacao ||
    ""
).trim().toLowerCase();

const aplicacaoFiltro = String(
    estado.aplicacao || ""
).trim().toLowerCase();

const aplicacaoOk =
    aplicacaoFiltro === "" ||
    aplicacaoProduto.includes(aplicacaoFiltro);

const potenciaProduto = String(
    produto.potenciaBomba ||
    produto.potencia ||
    ""
).trim().toLowerCase();

const potenciaFiltro = String(
    estado.potencia || ""
).trim().toLowerCase();

let potenciaOk = true;

if (potenciaFiltro !== "") {

    if (potenciaFiltro === "acima de 5 cv") {

        const numeroPotencia =
            parseFloat(potenciaProduto);

        potenciaOk =
            !isNaN(numeroPotencia) &&
            numeroPotencia > 5;

    } else {

        potenciaOk =
            potenciaProduto.includes(
                potenciaFiltro
            );

    }

}


        let precoOk = true;

if (estado.preco !== "") {

    const precoProduto =
        Number(produto.preco) || 0;

    const limite =
        Number(estado.preco);

    if (limite === 999999) {

        precoOk =
            precoProduto > 5000;

    } else {

        precoOk =
            precoProduto <= limite;

    }

}


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

else if(texto === "Irrigação"){

    estado.categoria = "";

    estado.produtosFiltrados =
        estado.produtos.filter(produto => {

            const categoria =
                String(produto.categoria || "")
                    .toLowerCase();

            return categoria.includes("irrig");

        });

    ordenarProdutos();
    renderizarProdutos();

    return;

}

else if(texto === "Bombas Residenciais"){

    estado.categoria = "";

    estado.produtosFiltrados =
        estado.produtos.filter(produto => {

            const aplicacao =
                String(
                    produto.aplicacaoBomba ||
                    produto.aplicacao ||
                    ""
                ).toLowerCase();

            return aplicacao.includes("residencial");

        });

    ordenarProdutos();
    renderizarProdutos();

    return;

}

        });

    });

}

/*==================================================
            CATEGORIAS
==================================================*/

const ordemCategorias = [

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
    "acessorios-bombas",

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


/*==================================================
        ÍCONES DAS CATEGORIAS
==================================================*/

const iconesCategorias = {

    "bombas-centrifugas":
        "fa-solid fa-water",

    "bombas-perifericas":
        "fa-solid fa-droplet",

    "bombas-submersas":
        "fa-solid fa-faucet-drip",

    "bombas-submersiveis":
        "fa-solid fa-arrow-down",

    "bombas-autoaspirantes":
        "fa-solid fa-rotate",

    "bombas-injetoras":
        "fa-solid fa-gears",

    "motobombas-irrigacao":
        "fa-solid fa-tractor",

    "bombas-piscina":
        "fa-solid fa-person-swimming",

    "bombas-irrigacao":
        "fa-solid fa-seedling",

    "bombas-poco":
        "fa-solid fa-arrow-down",

    "bombas-drenagem":
        "fa-solid fa-faucet",

    "bombas-esgoto":
        "fa-solid fa-pipe",

    "pressurizadores":
        "fa-solid fa-gauge-high",

    "sistemas-pressurizacao":
        "fa-solid fa-sliders",

    "acessorios-bombas":
        "fa-solid fa-screwdriver-wrench",

    "aspersores":
        "fa-solid fa-spray-can-sparkles",

    "microaspersores":
        "fa-solid fa-spray-can",

    "gotejamento":
        "fa-solid fa-droplet",

    "mangueiras-irrigacao":
        "fa-solid fa-water",

    "tubos-irrigacao":
        "fa-solid fa-grip-lines",

    "conexoes-irrigacao":
        "fa-solid fa-link",

    "filtros-irrigacao":
        "fa-solid fa-filter",

    "valvulas-irrigacao":
        "fa-solid fa-circle-dot",

    "acessorios-irrigacao":
        "fa-solid fa-screwdriver-wrench"

};


/*==================================================
        CARREGAR CATEGORIAS DO BACKEND
==================================================*/

async function carregarCategorias(){

    const lista =
        document.getElementById("listaCategorias");

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


        /*========================================
            FILTRAR BOMBAS + IRRIGAÇÃO
        ========================================*/

        const categoriasPermitidas =
            categorias.filter(categoria => {

                const grupo =
                    String(
                        categoria.grupo || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    grupo === "bombas" ||
                    grupo === "irrigacao" ||
                    grupo === "irrigação"
                );

            });


        /*========================================
            ORDENAR CATEGORIAS
        ========================================*/

        categoriasPermitidas.sort((a, b) => {

            const indiceA =
                ordemCategorias.indexOf(
                    String(a.slug || "").toLowerCase()
                );

            const indiceB =
                ordemCategorias.indexOf(
                    String(b.slug || "").toLowerCase()
                );


            /* Categorias conhecidas primeiro */

            if(indiceA !== -1 && indiceB !== -1){
                return indiceA - indiceB;
            }


            if(indiceA !== -1){
                return -1;
            }


            if(indiceB !== -1){
                return 1;
            }


            /* Categorias novas ficam em ordem alfabética */

            return String(a.nome || "")
                .localeCompare(
                    String(b.nome || ""),
                    "pt-BR"
                );

        });


        /*========================================
            TODOS OS PRODUTOS
        ========================================*/

        lista.innerHTML = `

            <li
                data-categoria="todos"
                class="ativo">

                <i class="fa-solid fa-layer-group"></i>

                <span>Todos os Produtos</span>

            </li>

        `;


        /*========================================
            CRIAR CATEGORIAS
        ========================================*/

        categoriasPermitidas.forEach(categoria => {

            const li =
                document.createElement("li");


            const slug =
                String(
                    categoria.slug || ""
                )
                .toLowerCase();


            li.dataset.categoria =
                categoria.slug;


            const icone =
                iconesCategorias[slug] ||
                "fa-solid fa-folder";


            li.innerHTML = `

                
        <i class="${icone}" style="margin-right: 8px;"></i>

                <span>

                    ${categoria.nome}

                </span>

            `;


            lista.appendChild(li);

        });


        /*========================================
            ATUALIZAR REFERÊNCIA DOS ELEMENTOS
        ========================================*/

        elementos.categorias =
            lista.querySelectorAll("li");


        /*========================================
            ATIVAR CLIQUES
        ========================================*/

        iniciarCategorias();


        console.log(
            "✅ Categorias carregadas:",
            categoriasPermitidas
        );

    }


    catch(erro){

        console.error(
            "❌ Erro ao carregar categorias:",
            erro
        );

    }

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

    const blocoMarcas =
        elementos.filtros[0];

    if(!blocoMarcas){
        return;
    }

    const marcas =
        blocoMarcas.parentElement
            .querySelectorAll(".filtros li");

    marcas.forEach(item => {

        item.addEventListener("click", () => {

            marcas.forEach(marca => {
                marca.classList.remove("ativo");
            });

            item.classList.add("ativo");

            estado.marca =
                item.textContent
                    .trim();

            filtrarProdutos();

        });

    });

}

/*==================================================
                APLICAÇÃO
==================================================*/

function iniciarAplicacao(){

    const blocos =
        document.querySelectorAll(".sidebar-card");

    const blocoAplicacao =
        Array.from(blocos).find(bloco =>
            bloco.querySelector("h2")?.textContent
                .trim()
                .toLowerCase() === "aplicação"
        );

    if(!blocoAplicacao){
        return;
    }

    const aplicacoes =
        blocoAplicacao.querySelectorAll(".filtros li");

    aplicacoes.forEach(item => {

        item.addEventListener("click", () => {

            aplicacoes.forEach(aplicacao => {
                aplicacao.classList.remove("ativo");
            });

            item.classList.add("ativo");

            estado.aplicacao =
                item.textContent
                    .trim();

            filtrarProdutos();

        });

    });

}

/*==================================================
                POTÊNCIA
==================================================*/

function iniciarPotencia(){

    const blocos =
        document.querySelectorAll(".sidebar-card");

    const blocoPotencia =
        Array.from(blocos).find(bloco =>
            bloco.querySelector("h2")?.textContent
                .trim()
                .toLowerCase() === "potência"
        );

    if(!blocoPotencia){
        return;
    }

    const potencias =
        blocoPotencia.querySelectorAll(".filtros li");

    potencias.forEach(item => {

        item.addEventListener("click", () => {

            potencias.forEach(potencia => {
                potencia.classList.remove("ativo");
            });

            item.classList.add("ativo");

            estado.potencia =
                item.textContent
                    .trim();

            filtrarProdutos();

        });

    });

}

/*==================================================
                FILTRO DE PREÇO
==================================================*/

function iniciarFiltroPreco(){

    if(!elementos.filtroPreco){
        return;
    }

    elementos.filtroPreco.addEventListener(
        "change",
        () => {

            estado.preco =
                elementos.filtroPreco.value;

            filtrarProdutos();

        }
    );

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



/*==================================================
        COMPATIBILIDADE COM CARRINHO GLOBAL
==================================================*/

async function obterCarrinhoAtual(){

    return estado.carrinho.map(item => ({

        produto_id: Number(item.id),

        quantidade: Number(item.quantidade) || 1

    }));

}


async function adicionarAoCarrinho(produto){

    if(!produto){
        return false;
    }

    adicionarCarrinho(
        Number(produto.id)
    );

    return true;

}


async function removerDoCarrinho(produtoId){

    const id = Number(produtoId);

    const indice = estado.carrinho.findIndex(
        item => Number(item.id) === id
    );

    if(indice === -1){
        return false;
    }

    estado.carrinho.splice(indice,1);

    salvarCarrinho();

    atualizarCarrinho();

    return true;

}

/*==================================================
                INICIALIZAÇÃO
==================================================*/

function iniciarSistema(){

    carregarFavoritos();

    carregarCarrinho();

    carregarProdutos();

    carregarCategorias();

    iniciarPesquisa();

    iniciarMarcas();

    iniciarAplicacao();

    iniciarPotencia();

    iniciarFiltroPreco();

    iniciarOrdenacao();

    iniciarFavoritos();

    iniciarAtalhos();

}



document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema

);
