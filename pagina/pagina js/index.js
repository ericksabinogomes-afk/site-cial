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

    fecharModal();

    const url =

        `https://wa.me/${CONFIG.whatsappTecnico}`;

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

    let scroll = 0;

    setInterval(()=>{

        scroll += 1;

        elementos.marcas.scrollLeft = scroll;

        if(

            scroll >=

            elementos.marcas.scrollWidth -

            elementos.marcas.clientWidth

        ){

            scroll = 0;

        }

    },25);

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