/*==================================================
                ELEMENTOS
==================================================*/

const cartProducts = document.querySelector(".cart-products");

const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("shipping");
const discountElement = document.getElementById("discount");
const totalElement = document.getElementById("total");

const observation = document.getElementById("obs");

const btnFinish = document.querySelector(".btn-finish");
const btnWhatsapp = document.querySelector(".btn-whatsapp");


/*==================================================
                ESTADO
==================================================*/

let carrinho = [];


/*==================================================
                UTILIDADES
==================================================*/

function formatarPreco(valor) {

    return valor.toLocaleString("pt-BR", {

        style: "currency",

        currency: "BRL"

    });

}


/*==================================================
                COMPONENTES
==================================================*/

function criarCarrinhoVazio() {

    return `

        <div class="cart-empty">

            <i class="fa-solid fa-cart-shopping"></i>

            <h2>Seu carrinho está vazio</h2>

            <p>

                Adicione alguns produtos para começar sua compra.

            </p>

        </div>

    `;

}


function criarCardProduto(produto, index) {

    return `

        <article class="cart-item">

            <div class="cart-item-image">

                <img src="${produto.imagem}" alt="${produto.nome}">

            </div>

            <div class="cart-item-info">

                <h3>${produto.nome}</h3>

                <p>Código: ${produto.codigo}</p>

                <strong>${formatarPreco(produto.preco)}</strong>

            </div>

            <div class="cart-item-quantity">

                <button
                    class="btn-minus"
                    data-index="${index}">

                    <i class="fa-solid fa-minus"></i>

                </button>

                <span class="quantity">

                    ${produto.quantidade}

                </span>

                <button
                    class="btn-plus"
                    data-index="${index}">

                    <i class="fa-solid fa-plus"></i>

                </button>

            </div>

            <div class="cart-item-subtotal">

                ${formatarPreco(produto.preco * produto.quantidade)}

            </div>

            <button
                class="btn-remove"
                data-index="${index}">

                <i class="fa-solid fa-trash"></i>

            </button>

        </article>

    `;

}
/*==================================================
                RENDERIZAÇÃO
==================================================*/

function renderizarCarrinho() {

    cartProducts.innerHTML = "";

    if (carrinho.length === 0) {

        cartProducts.innerHTML = criarCarrinhoVazio();

        atualizarResumo();

        return;

    }

    carrinho.forEach((produto, index) => {

        cartProducts.insertAdjacentHTML(

            "beforeend",

            criarCardProduto(produto, index)

        );

    });

    atualizarResumo();

}


function atualizarResumo() {

    let subtotal = 0;

    let desconto = 0;

    let frete = 0;

    carrinho.forEach(produto => {

        subtotal += produto.preco * produto.quantidade;

    });


    subtotalElement.textContent = formatarPreco(subtotal);

    discountElement.textContent = formatarPreco(desconto);


    if (subtotal === 0) {

        shippingElement.textContent = "A calcular";

    } else {

        shippingElement.textContent = formatarPreco(frete);

    }


    totalElement.textContent = formatarPreco(

        subtotal - desconto + frete

    );

}
/*==================================================
                    AÇÕES
==================================================*/

function aumentarQuantidade(index) {

    carrinho[index].quantidade++;

    renderizarCarrinho();

}


function diminuirQuantidade(index) {

    if (carrinho[index].quantidade > 1) {

        carrinho[index].quantidade--;

    }

    renderizarCarrinho();

}


function removerProduto(index) {

    carrinho.splice(index, 1);

    renderizarCarrinho();

}


function limparCarrinho() {

    carrinho = [];

    renderizarCarrinho();

}
/*==================================================
                    EVENTOS
==================================================*/

cartProducts.addEventListener("click", (event) => {

    const btnPlus = event.target.closest(".btn-plus");

    if (btnPlus) {

        aumentarQuantidade(Number(btnPlus.dataset.index));

        return;

    }


    const btnMinus = event.target.closest(".btn-minus");

    if (btnMinus) {

        diminuirQuantidade(Number(btnMinus.dataset.index));

        return;

    }


    const btnRemove = event.target.closest(".btn-remove");

    if (btnRemove) {

        removerProduto(Number(btnRemove.dataset.index));

        return;

    }

});


btnFinish.addEventListener("click", () => {

    console.log("Finalizar pedido");

});


btnWhatsapp.addEventListener("click", () => {

    console.log("Enviar pedido via WhatsApp");

});
/*==================================================
                    BACKEND
==================================================*/

async function carregarCarrinho() {

    try {

        /*
        EXEMPLO:

        const response = await fetch("/api/carrinho");

        const dados = await response.json();

        carrinho = dados;

        */

        renderizarCarrinho();

    } catch (erro) {

        console.error("Erro ao carregar o carrinho:", erro);

    }

}


async function salvarCarrinho() {

    try {

        /*
        EXEMPLO:

        await fetch("/api/carrinho", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(carrinho)

        });

        */

    } catch (erro) {

        console.error("Erro ao salvar o carrinho:", erro);

    }

}
/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    carregarCarrinho();

});