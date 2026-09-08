/*==========================================================
    CONFIGURAÇÕES GLOBAIS DO SITE - CIAL
==========================================================*/

const CONFIG_SITE = {
    nome_empresa: "",
    whatsapp: "",
    telefone: "",
    email: "",
    instagram: "",
    facebook: "",
    endereco: "",
    pix: ""
};


/*==========================================================
    APLICAR CONFIGURAÇÕES NO SITE
==========================================================*/

function aplicarConfiguracoesSite() {

    /*----------------------------------------
        TEXTOS
    ----------------------------------------*/

    document.querySelectorAll("[data-config]").forEach(elemento => {

        const campo = elemento.dataset.config;
        const valor = CONFIG_SITE[campo];

        if (!valor) return;

        elemento.textContent = valor;

    });


    /*----------------------------------------
        LINKS
    ----------------------------------------*/

    document.querySelectorAll("[data-config-href]").forEach(elemento => {

        const campo = elemento.dataset.configHref;
        const valor = CONFIG_SITE[campo];

        if (!valor) return;

        elemento.href = valor;

    });


    /*----------------------------------------
        TÍTULO DA PÁGINA
    ----------------------------------------*/

    if (CONFIG_SITE.nome_empresa) {

        document.title =
            `${CONFIG_SITE.nome_empresa} | Loja Autorizada STIHL`;

    }

}


/*==========================================================
    CARREGAR CONFIGURAÇÕES
==========================================================*/

async function carregarConfiguracoesSite() {

    try {

        const resposta = await fetch(
            "http://localhost:4000/configuracoes"
        );

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar as configurações."
            );

        }


        const resultado = await resposta.json();


        if (
            resultado.ok &&
            resultado.data
        ) {

            Object.assign(
                CONFIG_SITE,
                resultado.data
            );

        }


        console.log(
            "Configurações do site carregadas:",
            CONFIG_SITE
        );


        /*----------------------------------------
            APLICAR NO HTML
        ----------------------------------------*/

        aplicarConfiguracoesSite();


        return CONFIG_SITE;


    } catch (erro) {

        console.error(
            "Erro ao carregar configurações do site:",
            erro
        );

        return CONFIG_SITE;

    }

}


/*==========================================================
    PROMISE GLOBAL
==========================================================*/

const CONFIG_SITE_PRONTO =
    carregarConfiguracoesSite();
/*==================================================
        CARDS DE PRODUTOS
        SISTEMA GLOBAL
==================================================*/

function escaparHTML(valor) {

    if (valor === undefined || valor === null) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*==================================================
        FORMATAR PREÇO DO CARD
==================================================*/

function formatarPrecoCard(valor) {

    const numero = Number(valor) || 0;

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/*==================================================
        OBTER ESPECIFICAÇÕES DO CARD
==================================================*/

/*==================================================
        OBTER ESPECIFICAÇÕES DO CARD
==================================================*/

function obterEspecificacoesCard(produto) {

    if (!produto) {
        return [];
    }

    let especificacoes =
        produto.especificacoes;


    /*========================================
        SE VIER COMO JSON EM TEXTO
    ========================================*/

    if (typeof especificacoes === "string") {

        try {

            especificacoes =
                JSON.parse(especificacoes);

        } catch (erro) {

            console.warn(
                "Não foi possível interpretar as especificações:",
                produto.nome,
                especificacoes
            );

            return [];

        }

    }


    /*========================================
        GARANTIR QUE É OBJETO
    ========================================*/

    if (
        !especificacoes ||
        typeof especificacoes !== "object" ||
        Array.isArray(especificacoes)
    ) {

        return [];

    }


    /*========================================
        PEGAR SOMENTE CAMPOS PREENCHIDOS
    ========================================*/

    return Object.entries(especificacoes)

        .filter(([nome, valor]) => {

            return (
                valor !== undefined &&
                valor !== null &&
                String(valor).trim() !== ""
            );

        })

        .slice(0, 3);

}

/*==================================================
        FORMATAR NOME DA ESPECIFICAÇÃO
==================================================*/

function formatarNomeEspecificacao(nome) {

    if (!nome) {
        return "";
    }

    const nomes = {

        "cilindrada": "Cilindrada",

        "potencia": "Potência",

        "comprimento-sabre": "Comprimento do sabre",

        "comprimento_lamina": "Comprimento da lâmina",

        "peso": "Peso",

        "tipo-motor": "Tipo de motor",

        "capacidade-tanque": "Capacidade do tanque",

        "diametro-corte": "Diâmetro de corte",

        "pressao-maxima": "Pressão máxima",

        "vazao": "Vazão",

        "tensao": "Tensão",

        "fase": "Fase",

        "altura-manometrica": "Altura manométrica",

        "largura-corte": "Largura de corte",

        "altura-corte": "Altura de corte",

        "velocidade-ar": "Velocidade do ar",

        "vazao-ar": "Vazão de ar",

        "capacidade-bateria": "Capacidade da bateria",

        "tempo-funcionamento": "Tempo de funcionamento",

        "tempo-carregamento": "Tempo de carregamento",

        "tipo-alimentacao": "Tipo de alimentação",

        "marca": "Marca",

        "modelo": "Modelo",

        "aplicacao": "Aplicação",

        "tipo": "Tipo"

    };

    if (nomes[nome]) {
        return nomes[nome];
    }

    return String(nome)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, letra =>
            letra.toUpperCase()
        );

}


/*==================================================
        CRIAR CARD
==================================================*/

function criarCardProdutoGlobal(produto) {

    if (!produto) {
        return "";
    }

    const favoritado =
        Array.isArray(estado?.favoritos) &&
        estado.favoritos.includes(
            Number(produto.id)
        );

    const especificacoes =
        obterEspecificacoesCard(produto);

    const imagem =
        produto.imagem ||
        "imagens/produto-sem-imagem.png";

    const categoria =
        produto.categoria || "Produto";


    /*========================================
        ESPECIFICAÇÕES
    ========================================*/

    const htmlEspecificacoes =
        especificacoes.length > 0

            ? `
                <div class="card-produto-especificacoes">

                    ${especificacoes
                        .map(([nome, valor]) => `
                            
                            <div class="card-produto-especificacao">

                                <span class="card-especificacao-nome">
                                    ${escaparHTML(
                                        formatarNomeEspecificacao(nome)
                                    )}
                                </span>

                                <span class="card-especificacao-valor">
                                    ${escaparHTML(valor)}
                                </span>

                            </div>

                        `)
                        .join("")}

                </div>
            `

            : "";


    /*========================================
        PARCELAMENTO
    ========================================*/

    const parcelamento =
        produto.parcela &&
        String(produto.parcela).trim() !== ""

            ? `
                <div class="card-produto-parcela">
                    ${escaparHTML(produto.parcela)}
                </div>
            `

            : "";


    /*========================================
        CARD
    ========================================*/

    return `

        <article
            class="card-produto"
            data-id="${Number(produto.id)}"
        >

            <div class="card-produto-imagem">

                ${
                    produto.selo
                        ? `
                            <span class="card-produto-selo">
                                ${escaparHTML(produto.selo)}
                            </span>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="btn-favorito ${favoritado ? "ativo" : ""}"
                    data-id="${Number(produto.id)}"
                    aria-label="Favoritar produto"
                >

                    <i class="${
                        favoritado
                            ? "fa-solid"
                            : "fa-regular"
                    } fa-heart"></i>

                </button>

                <img
                    src="${escaparHTML(imagem)}"
                    alt="${escaparHTML(produto.nome)}"
                    loading="lazy"
                >

            </div>


            <div class="card-produto-conteudo">

                <span class="card-produto-categoria">
                    ${escaparHTML(categoria)}
                </span>


                <h3 class="card-produto-nome">
                    ${escaparHTML(produto.nome)}
                </h3>


                ${htmlEspecificacoes}


                <div class="card-produto-preco">

                    ${formatarPrecoCard(produto.preco)}

                </div>


                ${parcelamento}


                <div class="card-produto-acoes">

                    <button
                        type="button"
                        class="btn-ver"
                        data-id="${Number(produto.id)}"
                    >
                        <i class="fa-solid fa-eye"></i>
                        Ver produto
                    </button>


                    <button
                        type="button"
                        class="btn-carrinho"
                        data-id="${Number(produto.id)}"
                    >
                        <i class="fa-solid fa-cart-shopping"></i>
                        Adicionar ao carrinho
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

    const grid =
        document.getElementById(
            "gridProdutos"
        );

    if (!grid) {
        return;
    }

    const produtos =
        Array.isArray(
            estado?.produtosFiltrados
        )
            ? estado.produtosFiltrados
            : [];


    if (produtos.length === 0) {

        grid.innerHTML = `

            <div class="produtos-vazio">

                <i class="fa-solid fa-box-open"></i>

                <h3>Nenhum produto encontrado</h3>

                <p>
                    Tente alterar os filtros ou realizar outra pesquisa.
                </p>

            </div>

        `;

        return;

    }


    grid.innerHTML =
        produtos
            .map(criarCardProdutoGlobal)
            .join("");

}