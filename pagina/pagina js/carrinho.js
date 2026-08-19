const CHAVE_CARRINHO = "cial_carrinho";

const cartProducts = document.querySelector(".cart-products");

const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("shipping");
const discountElement = document.getElementById("discount");
const totalElement = document.getElementById("total");

const observation = document.getElementById("obs");

const btnFinish = document.querySelector(".btn-finish");
const btnWhatsapp = document.querySelector(".btn-whatsapp");

let carrinho = [];

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function carregarCarrinho() {
    try {
        const dados = localStorage.getItem(CHAVE_CARRINHO);

        carrinho = dados
            ? JSON.parse(dados)
            : [];

        if (!Array.isArray(carrinho)) {
            carrinho = [];
        }
    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);
        carrinho = [];
    }
}

function salvarCarrinho() {
    localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(carrinho)
    );
}

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
                <img
                    src="${produto.imagem || "imagem/produto-sem-imagem.png"}"
                    alt="${produto.nome}"
                >
            </div>

            <div class="cart-item-info">
                <h3>${produto.nome}</h3>
                <strong>
                    ${formatarPreco(produto.preco)}
                </strong>
            </div>

            <div class="cart-item-quantity">
                <button
                    type="button"
                    class="btn-minus"
                    data-index="${index}"
                >
                    <i class="fa-solid fa-minus"></i>
                </button>

                <span class="quantity">
                    ${produto.quantidade}
                </span>

                <button
                    type="button"
                    class="btn-plus"
                    data-index="${index}"
                >
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>

            <div class="cart-item-subtotal">
                ${formatarPreco(
                    Number(produto.preco) *
                    Number(produto.quantidade)
                )}
            </div>

            <button
                type="button"
                class="btn-remove"
                data-index="${index}"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        </article>
    `;
}

function renderizarCarrinho() {
    if (!cartProducts) {
        console.error(
            "Elemento .cart-products não encontrado no HTML."
        );
        return;
    }

    if (carrinho.length === 0) {
        cartProducts.innerHTML = criarCarrinhoVazio();
        atualizarResumo();
        return;
    }

    cartProducts.innerHTML = carrinho
        .map(criarCardProduto)
        .join("");

    atualizarResumo();
}

function atualizarResumo() {
    const subtotal = carrinho.reduce((total, produto) => {
        return total +
            Number(produto.preco) *
            Number(produto.quantidade);
    }, 0);

    const desconto = 0;
    const frete = subtotal > 0 ? 0 : 0;
    const total = subtotal - desconto + frete;

    if (subtotalElement) {
        subtotalElement.textContent =
            formatarPreco(subtotal);
    }

    if (discountElement) {
        discountElement.textContent =
            formatarPreco(desconto);
    }

    if (shippingElement) {
        shippingElement.textContent =
            subtotal > 0
                ? formatarPreco(frete)
                : "A calcular";
    }

    if (totalElement) {
        totalElement.textContent =
            formatarPreco(total);
    }
}

function aumentarQuantidade(index) {
    if (!carrinho[index]) {
        return;
    }

    carrinho[index].quantidade++;
    salvarCarrinho();
    renderizarCarrinho();
}

function diminuirQuantidade(index) {
    if (!carrinho[index]) {
        return;
    }

    if (carrinho[index].quantidade > 1) {
        carrinho[index].quantidade--;
    } else {
        carrinho.splice(index, 1);
    }

    salvarCarrinho();
    renderizarCarrinho();
}

function removerProduto(index) {
    if (!carrinho[index]) {
        return;
    }

    carrinho.splice(index, 1);
    salvarCarrinho();
    renderizarCarrinho();
}

cartProducts?.addEventListener("click", event => {
    const botaoMais = event.target.closest(".btn-plus");

    if (botaoMais) {
        aumentarQuantidade(
            Number(botaoMais.dataset.index)
        );
        return;
    }

    const botaoMenos = event.target.closest(".btn-minus");

    if (botaoMenos) {
        diminuirQuantidade(
            Number(botaoMenos.dataset.index)
        );
        return;
    }

    const botaoRemover = event.target.closest(".btn-remove");

    if (botaoRemover) {
        removerProduto(
            Number(botaoRemover.dataset.index)
        );
    }
});

btnWhatsapp?.addEventListener("click", () => {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    let mensagem =
        "Olá! Gostaria de fazer este pedido:%0A%0A";

    carrinho.forEach(produto => {
        const subtotal =
            Number(produto.preco) *
            Number(produto.quantidade);

        mensagem += `Produto: ${encodeURIComponent(produto.nome)}%0A`;
        mensagem += `Quantidade: ${produto.quantidade}%0A`;
        mensagem += `Subtotal: ${encodeURIComponent(
            formatarPreco(subtotal)
        )}%0A%0A`;
    });

    const total = carrinho.reduce((valor, produto) => {
        return valor +
            Number(produto.preco) *
            Number(produto.quantidade);
    }, 0);

    mensagem += `Total: ${encodeURIComponent(
        formatarPreco(total)
    )}`;

    const numero = "5561999999999";

    window.open(
        `https://wa.me/${numero}?text=${mensagem}`,
        "_blank"
    );
});

document.addEventListener("DOMContentLoaded", () => {
    carregarCarrinho();
    renderizarCarrinho();
});