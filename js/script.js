/*==================================================
                CIAL ASA SUL
                  VERSÃO 2.0
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    iniciarSite();

});

/*==================================================
                INICIALIZAÇÃO
==================================================*/

function iniciarSite() {

    destacarPaginaAtual();

    atualizarCarrinho();

}
/*==================================================
            DESTACAR MENU ATUAL
==================================================*/

function destacarPaginaAtual() {

    const pagina = window.location.pathname.split("/").pop();

    const links = document.querySelectorAll(".menu a");

    links.forEach(link => {

        link.classList.remove("active");

        const href = link.getAttribute("href");

        if (href === pagina || (pagina === "" && href === "index.html")) {

            link.classList.add("active");

        }

    });

}
/*==================================================
            CONTADOR DO CARRINHO
==================================================*/

function atualizarCarrinho() {

    const contador = document.querySelector(".cart span");

    if (!contador) return;

    const quantidade = localStorage.getItem("carrinhoQuantidade") || 0;

    contador.textContent = quantidade;

}
/*==================================================
                PESQUISA
==================================================*/

function iniciarPesquisa() {

    const input = document.querySelector(".search-box input");

    if (!input) return;

    input.addEventListener("keydown", function(event) {

        if (event.key !== "Enter") return;

        pesquisarProduto(this.value);

    });

}

function pesquisarProduto(texto) {

    texto = texto.trim().toLowerCase();

    if (texto === "") return;

    if (
        texto.includes("gta") ||
        texto.includes("fs") ||
        texto.includes("ms") ||
        texto.includes("motosserra") ||
        texto.includes("roçadeira") ||
        texto.includes("rocadeira") ||
        texto.includes("bomba") ||
        texto.includes("irrigação") ||
        texto.includes("irrigacao")
    ){

        window.location.href = "produtos.html";

        return;

    }

    alert("Nenhum produto encontrado.");

}
/*==================================================
            VOLTAR AO TOPO
==================================================*/

function voltarAoTopo(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}
/*==================================================
                INICIALIZAÇÃO
==================================================*/

function iniciarSite(){

    destacarPaginaAtual();

    atualizarCarrinho();

    iniciarPesquisa();

}
/*==================================================
            ANIMAÇÃO DOS CARDS
==================================================*/

function animarCards() {

    const elementos = document.querySelectorAll(

        ".feature, .category-card, .product-card, .brands-grid img"

    );

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold:0.15

    });

    elementos.forEach(elemento => {

        observer.observe(elemento);

    });

}
/*==================================================
                INICIALIZAÇÃO
==================================================*/

function iniciarSite(){

    destacarPaginaAtual();

    atualizarCarrinho();

    iniciarPesquisa();

    animarCards();

}
/*==================================================
                FIM DO SCRIPT
==================================================*/