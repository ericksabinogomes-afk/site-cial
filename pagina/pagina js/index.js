/*==================================================
                CONFIGURAÇÕES
==================================================*/

const CONFIG = {

    whatsappLoja:"556198112731",

    whatsappTecnico:"556196569866",

    tempoMensagem:5000,

    scrollOffset:120

};



/*==================================================
                ELEMENTOS
==================================================*/

const elementos = {

    modal:

        document.getElementById("modalAssistencia"),

    abrirModal:

        document.getElementById("abrirAssistencia"),

    fecharModal:

        document.getElementById("fecharModal"),

    btnAssistencia:

        document.getElementById("btnAssistencia"),

    btnWhatsappTecnico:

        document.getElementById("btnWhatsappTecnico"),

    btnWhatsapp:

        document.getElementById("btnWhatsapp"),

    footerAssistencia:

        document.getElementById("footerAssistencia"),

    marcas:

        document.querySelector(".marcas-slider"),

    secoes:

        document.querySelectorAll("section")

};



/*==================================================
                ESTADO
==================================================*/

const estado = {

    modalAberto:false,

    animando:false

};
/*==================================================
                UTILITÁRIOS
==================================================*/

function abrirLink(url){

    window.open(

        url,

        "_blank"

    );

}



function scrollTopo(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}
/*==================================================
                MODAL
==================================================*/

function abrirModal(){

    elementos.modal.classList.add("ativo");

    document.body.style.overflow="hidden";

    estado.modalAberto=true;

}



function fecharModal(){

    elementos.modal.classList.remove("ativo");

    document.body.style.overflow="";

    estado.modalAberto=false;

}
/*==================================================
            EVENTOS MODAL
==================================================*/

function iniciarModal(){



    elementos.abrirModal.addEventListener(

        "click",

        event=>{

            event.preventDefault();

            abrirModal();

        }

    );



    elementos.btnAssistencia.addEventListener(

        "click",

        abrirModal

    );



    elementos.footerAssistencia.addEventListener(

        "click",

        event=>{

            event.preventDefault();

            abrirModal();

        }

    );



    elementos.fecharModal.addEventListener(

        "click",

        fecharModal

    );



    elementos.modal.addEventListener(

        "click",

        event=>{

            if(event.target===elementos.modal){

                fecharModal();

            }

        }

    );

}
/*==================================================
                ESC
==================================================*/

document.addEventListener(

    "keydown",

    event=>{

        if(

            event.key==="Escape"

            &&

            estado.modalAberto

        ){

            fecharModal();

        }

    }

);
/*==================================================
            WHATSAPP LOJA
==================================================*/

function abrirWhatsappLoja(){

    const url =

        `https://wa.me/${CONFIG.whatsappLoja}`;

    abrirLink(url);

}
/*==================================================
        WHATSAPP TÉCNICO
==================================================*/

function abrirWhatsappTecnico(){

    const modelo =
        document.getElementById("modeloMaquina").value.trim();

    const problema =
        document.getElementById("problemaMaquina").value.trim();


    /* ==========================================
       VALIDAÇÃO
    ========================================== */

    if(!modelo){

        alert("Por favor, informe o modelo da máquina.");

        document.getElementById("modeloMaquina").focus();

        return;

    }


    if(!problema){

        alert("Por favor, descreva o problema da máquina.");

        document.getElementById("problemaMaquina").focus();

        return;

    }


    /* ==========================================
       MENSAGEM PARA O TÉCNICO
    ========================================== */

    const mensagem =
        `Olá! Gostaria de solicitar assistência técnica.

Modelo da máquina: ${modelo}

Problema: ${problema}`;


    /* ==========================================
       ABRE O WHATSAPP
    ========================================== */

    const url =
        `https://wa.me/${CONFIG.whatsappTecnico}?text=${encodeURIComponent(mensagem)}`;


    fecharModal();

    abrirLink(url);

}

/*==================================================
            EVENTOS WHATSAPP
==================================================*/

function iniciarWhatsapp(){



    elementos.btnWhatsapp.addEventListener(

        "click",

        event=>{

            event.preventDefault();

            abrirWhatsappLoja();

        }

    );



    elementos.btnWhatsappTecnico.addEventListener(

        "click",

        ()=>{

            abrirWhatsappTecnico();

        }

    );

}
/*==================================================
            SCROLL REVEAL
==================================================*/

function revelarSecoes(){

    const topo = window.innerHeight * 0.85;

    elementos.secoes.forEach(secao=>{

        const posicao =

            secao.getBoundingClientRect().top;

        if(posicao < topo){

            secao.classList.add("mostrar");

        }

    });

}
/*==================================================
            HERO
==================================================*/

function iniciarHero(){

    const texto =

        document.querySelector(".hero-texto");

    const imagem =

        document.querySelector(".hero-imagem");



    texto.classList.add("mostrar");



    setTimeout(()=>{

        imagem.classList.add("mostrar");

    },300);

}
/*==================================================
                MARCAS
==================================================*/

function iniciarMarcas(){

    if(!elementos.marcas){
        return;
    }

    const slider = elementos.marcas;

    // Evita iniciar duas vezes
    if(slider.dataset.iniciado === "true"){
        return;
    }

    slider.dataset.iniciado = "true";


    // Guarda as marcas originais
    const marcasOriginais = Array.from(
        slider.querySelectorAll(".marca-card")
    );


    // Duplica as marcas
    // Isso cria o efeito de carrossel infinito
    marcasOriginais.forEach(marca => {

        const clone = marca.cloneNode(true);

        clone.setAttribute(
            "aria-hidden",
            "true"
        );

        slider.appendChild(clone);

    });


    // Velocidade do carrossel
    let velocidade = 0.6;


    function animarMarcas(){

        slider.scrollLeft += velocidade;


        /*
        Quando chegarmos na metade do conteúdo,
        voltamos para o começo.

        Como as marcas estão duplicadas,
        visualmente o usuário não percebe o salto.
        */

        if(
            slider.scrollLeft >=
            slider.scrollWidth / 2
        ){

            slider.scrollLeft = 0;

        }


        requestAnimationFrame(
            animarMarcas
        );

    }


    animarMarcas();

}
/*==================================================
        BOTÃO WHATSAPP
==================================================*/

function iniciarBotaoWhatsapp(){

    elementos.btnWhatsapp.addEventListener(

        "mouseenter",

        ()=>{

            elementos.btnWhatsapp.title =

                "Fale conosco pelo WhatsApp";

        }

    );

}
/*==================================================
            SCROLL
==================================================*/

 window.addEventListener(
 "scroll",
    revelarSecoes
);
/*==================================================*
* PRODUTOS DO BACKEND
*==================================================*/

const API_URL = "http://localhost:4000";


async function carregarProdutosDestaque(){

    const container =
        document.getElementById("produtosDestaque");


    if(!container){

        return;

    }


    try{

        const resposta =
            await fetch(`${API_URL}/produtos`);


        if(!resposta.ok){

            throw new Error(
                "Erro ao buscar produtos."
            );

        }


        const resultado =
            await resposta.json();


        if(
            !resultado.ok ||
            !Array.isArray(resultado.data)
        ){

            throw new Error(
                "Resposta inválida da API."
            );

        }


        const produtos =
            resultado.data
                .filter(produto => produto.destaque)
                .slice(0, 4);


        if(produtos.length === 0){

            container.innerHTML = `

                <div class="produtos-vazio">

                    <i class="fa-solid fa-box-open"></i>

                    <p>
                        Nenhum produto em destaque no momento.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            produtos
                .map(criarCardDestaque)
                .join("");


    }catch(erro){

        console.error(
            "Erro ao carregar produtos:",
            erro
        );


        container.innerHTML = `

            <div class="produtos-erro">

                <i class="fa-solid fa-circle-exclamation"></i>

                <p>
                    Não foi possível carregar os produtos.
                </p>

            </div>

        `;

    }

}
/*==================================================*
* CARD DE PRODUTO EM DESTAQUE
*==================================================*/

function criarCardDestaque(produto)
{

    return `

        <article class="produto-destaque-card">

            <div class="produto-destaque-imagem">

                <img
                    src="${produto.imagem}"
                    alt="${produto.nome}"
                    loading="lazy"
                    onerror="this.src='imagem/produto-sem-imagem.png'">

                ${
                    produto.selo
                    ?
                    `<span class="produto-selo">
                        ${produto.selo}
                    </span>`
                    :
                    ""
                }

            </div>


            <div class="produto-destaque-info">

                <span class="produto-categoria">

                    ${produto.categoria || ""}

                </span>


                <h3>

                    ${produto.nome}

                </h3>
                
                <a
                    href="produtos.html"
                    class="btn-laranja">

                    Ver Produto

                </a>

            </div>

        </article>

    `;

}

/*==================================================
                CARROSSEL DE MARCAS
==================================================*/

function iniciarMarcas(){

    const slider = document.querySelector(".marcas-slider");

    if(!slider){
        return;
    }

    // Evita iniciar duas vezes
    if(slider.dataset.iniciado === "true"){
        return;
    }

    slider.dataset.iniciado = "true";


    // Pega as marcas que já existem no HTML
    const marcas = Array.from(
        slider.querySelectorAll(".marca-card")
    );


    if(marcas.length === 0){
        return;
    }


    // Cria o trilho
    const track = document.createElement("div");

    track.className = "marcas-track";


    // Coloca as marcas originais dentro do trilho
    marcas.forEach(marca => {

        track.appendChild(marca);

    });


    // Duplica as marcas para criar o loop infinito
    marcas.forEach(marca => {

        const clone = marca.cloneNode(true);

        clone.setAttribute(
            "aria-hidden",
            "true"
        );

        track.appendChild(clone);

    });


    // Coloca o trilho dentro do slider
    slider.appendChild(track);


    // Animação
    let posicao = 0;

    const velocidade = 0.5;


    function animar(){

        posicao -= velocidade;


        // Metade do trilho = conjunto original
        const metade = track.scrollWidth / 2;


        if(Math.abs(posicao) >= metade){

            posicao = 0;

        }


        track.style.transform =
            `translateX(${posicao}px)`;


        requestAnimationFrame(animar);

    }


    animar();

}
/*==================================================
            INICIALIZAÇÃO DO SITE
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    iniciarModal();

    iniciarWhatsapp();

    iniciarBotaoWhatsapp();

    iniciarHero();

    iniciarMarcas();

    revelarSecoes();

    carregarProdutosDestaque();

});
