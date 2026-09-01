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