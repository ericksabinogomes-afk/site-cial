/*==================================================
                CARRINHO CIAL
==================================================*/

const areaProdutos = document.querySelector(".cart-products");

const subtotal = document.getElementById("subtotal");

const total = document.getElementById("total");

const observacoes = document.getElementById("observacoes");

const btnWhatsapp = document.querySelector(".btn-whatsapp");

const btnFinish = document.querySelector(".btn-finish");

/*==================================================
                DADOS
==================================================*/

let carrinho = JSON.parse(

    localStorage.getItem("carrinho")

) || [];

function salvarCarrinho(){

    localStorage.setItem(

        "carrinho",

        JSON.stringify(carrinho)

    );

}

function formatarPreco(valor){

    return valor.toLocaleString(

        "pt-BR",

        {

            style:"currency",

            currency:"BRL"

        }

    );

}

function formatarPreco(valor){

    return valor.toLocaleString(

        "pt-BR",

        {

            style:"currency",

            currency:"BRL"

        }

    );

}

/*==================================================
                RENDERIZAR CARRINHO
==================================================*/

function renderizarCarrinho(){

    areaProdutos.innerHTML = "";

    if(carrinho.length === 0){

        areaProdutos.innerHTML = `

            <h2 class="cart-empty">

                Seu carrinho está vazio.

            </h2>

        `;

        atualizarResumo();

        return;

            carrinho.forEach(produto=>{

        areaProdutos.innerHTML += `

            <div class="cart-item">

                <div class="product-image">

                    <img src="${produto.imagem}" alt="${produto.nome}">

                </div>

                <div class="product-info">

                    <h2>${produto.nome}</h2>

                    <p>${produto.descricao}</p>

                </div>

                <div class="product-quantity">

                    <label>Quantidade</label>

                    <div class="quantity-control">

                        <button class="btn-minus"

                            data-id="${produto.id}">

                            -

                        </button>

                        <span>

                            ${produto.quantidade}

                        </span>

                        <button class="btn-plus"

                            data-id="${produto.id}">

                            +

                        </button>

                    </div>

                </div>

                <div class="product-price">

                    <label>Valor</label>

                    <strong>

                        ${formatarPreco(produto.preco)}

                    </strong>

                </div>

                <div class="product-remove">

                    <button class="btn-remove"

                        data-id="${produto.id}">

                        Remover

                    </button>

                </div>

            </div>

        `;

    });

    atualizarResumo();

}

    }
    
/*==================================================
            AUMENTAR QUANTIDADE
==================================================*/

function aumentarQuantidade(id){

    const produto = carrinho.find(item => item.id === id);

    if(produto){

        produto.quantidade++;

        salvarCarrinho();

        renderizarCarrinho();

    }

}

/*==================================================
            DIMINUIR QUANTIDADE
==================================================*/

function diminuirQuantidade(id){

    const produto = carrinho.find(item => item.id === id);

    if(produto){

        if(produto.quantidade > 1){

            produto.quantidade--;

        }else{

            carrinho = carrinho.filter(item => item.id !== id);

        }

        salvarCarrinho();

        renderizarCarrinho();

    }

}

/*==================================================
            REMOVER PRODUTO
==================================================*/

function removerProduto(id){

    carrinho = carrinho.filter(item => item.id !== id);

    salvarCarrinho();

    renderizarCarrinho();

}

/*==================================================
                EVENTOS
==================================================*/

document.addEventListener("click", function(event){

    // Botão +
    if(event.target.classList.contains("btn-plus")){

        aumentarQuantidade(event.target.dataset.id);

    }

    // Botão -
    if(event.target.classList.contains("btn-minus")){

        diminuirQuantidade(event.target.dataset.id);

    }

    // Botão Remover
    if(event.target.classList.contains("btn-remove")){

        removerProduto(event.target.dataset.id);

    }

});

/*==================================================
                EVENTOS
==================================================*/

document.addEventListener("click", function(event){

    // Botão +
    if(event.target.classList.contains("btn-plus")){

        aumentarQuantidade(event.target.dataset.id);

    }

    // Botão -
    if(event.target.classList.contains("btn-minus")){

        diminuirQuantidade(event.target.dataset.id);

    }

    // Botão Remover
    if(event.target.classList.contains("btn-remove")){

        removerProduto(event.target.dataset.id);

    }

});

/*==================================================
                INICIALIZAÇÃO
==================================================*/

function iniciarCarrinho(){

    renderizarCarrinho();

    atualizarResumo();

}

iniciarCarrinho();

/*==================================================
            WHATSAPP
==================================================*/

function finalizarWhatsapp(){

    console.log("Finalizar pelo WhatsApp");

}

function finalizarPedido(){

    console.log("Finalizar Pedido");

}

btnFinish.addEventListener("click", finalizarPedido);
