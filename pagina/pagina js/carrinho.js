
const API_CARRINHO = "http://localhost:4000";

const cartProducts =
    document.querySelector(".cart-products");

const subtotalElement =
    document.getElementById("subtotal");

const shippingElement =
    document.getElementById("shipping");

const discountElement =
    document.getElementById("discount");

const totalElement =
    document.getElementById("total");

const observation =
    document.getElementById("obs");

const btnFinish =
    document.querySelector(".btn-finish");

const btnWhatsapp =
    document.querySelector(".btn-whatsapp");

let carrinho = [];



function obterToken() {
    return localStorage.getItem("tokenCial");
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ==================================================
// MODAL DE ESCOLHA DE PAGAMENTO
// ==================================================

const modalPagamento =
    document.getElementById("modalPagamento");

const fecharModalPagamento =
    document.getElementById("fecharModalPagamento");

    // ==================================================
// FECHAR MODAL DE ESCOLHA DE PAGAMENTO
// ==================================================

fecharModalPagamento?.addEventListener(
    "click",
    () => {

        if (modalPagamento) {
            modalPagamento.hidden = true;
        }

    }
);

const btnPagamentoPix =
    document.getElementById("btnPagamentoPix");

const btnPagamentoCartao =
    document.getElementById("btnPagamentoCartao");

    // ==================================================
// ABRIR MODAL DE CARTÃO
// ==================================================

const modalCartao =
    document.getElementById("modalCartao");

const fecharModalCartao =
    document.getElementById("fecharModalCartao");

btnPagamentoCartao?.addEventListener(
    "click",
    () => {

        if (modalPagamento) {
            modalPagamento.hidden = true;
        }

        if (modalCartao) {
            modalCartao.hidden = false;
        }

        atualizarOpcoesParcelas();
        atualizarTotalCartao();

       }
);

// ==================================================
// FECHAR MODAL DE CARTÃO
// ==================================================

fecharModalCartao?.addEventListener(
    "click",
    () => {

        if (modalCartao) {
            modalCartao.hidden = true;
        }

    }
);

// ==================================================
// FORMATAÇÃO DOS CAMPOS DO CARTÃO
// ==================================================

const numeroCartao =
    document.getElementById("numeroCartao");

const nomeCartao =
    document.getElementById("nomeCartao");

const validadeCartao =
    document.getElementById("validadeCartao");

const cvvCartao =
    document.getElementById("cvvCartao");

const parcelasCartao =
    document.getElementById("parcelasCartao");

const totalCartao =
    document.getElementById("totalCartao");


// NÚMERO DO CARTÃO
numeroCartao?.addEventListener(
    "input",
    () => {

        let valor = numeroCartao.value
            .replace(/\D/g, "")
            .slice(0, 16);

        valor = valor.replace(
            /(\d{4})(?=\d)/g,
            "$1 "
        );

        numeroCartao.value = valor;
    }
);


// VALIDADE
validadeCartao?.addEventListener(
    "input",
    () => {

        let valor = validadeCartao.value
            .replace(/\D/g, "")
            .slice(0, 4);

        if (valor.length >= 3) {
            valor =
                valor.slice(0, 2) +
                "/" +
                valor.slice(2);
        }

        validadeCartao.value = valor;
    }
);


// CVV
cvvCartao?.addEventListener(
    "input",
    () => {

        cvvCartao.value =
            cvvCartao.value
                .replace(/\D/g, "")
                .slice(0, 4);
    }
);

// ==================================================
// ATUALIZAR TOTAL DAS PARCELAS
// ==================================================

function obterTotalCarrinho() {

    return carrinho.reduce(
        (total, item) => {
            return total +
                Number(item.preco) *
                Number(item.quantidade);
        },
        0
    );
}

// ==================================================
// LIMITE DE PARCELAS SEM JUROS
// ==================================================

function produtoPermite5xSemJuros(item) {

    const nome =
        String(item.nome || "").toLowerCase();

    return (
        nome.includes("motosserra") ||
        nome.includes("roçadeira") ||
        nome.includes("rocadeira")
    );
}


function obterMaximoParcelasSemJuros() {

    if (carrinho.length === 0) {
        return 3;
    }

    const todosPermitem5x =
        carrinho.every(
            item => produtoPermite5xSemJuros(item)
        );

    return todosPermitem5x ? 5 : 3;
}


function atualizarOpcoesParcelas() {

    if (!parcelasCartao) {
        return;
    }

    const maximo =
        obterMaximoParcelasSemJuros();

    parcelasCartao.innerHTML = "";

    for (let parcela = 1; parcela <= maximo; parcela++) {

        const option =
            document.createElement("option");

        option.value = parcela;

        option.textContent =
            `${parcela}x sem juros`;

        parcelasCartao.appendChild(option);
    }

    parcelasCartao.value = "1";
}

function atualizarTotalCartao() {

    if (!parcelasCartao || !totalCartao) {
        return;
    }

    const total = obterTotalCarrinho();

    const parcelas =
        Number(parcelasCartao.value) || 1;

    const valorParcela =
        total / parcelas;

    totalCartao.textContent =
        `${parcelas}x de ${formatarPreco(valorParcela)}`;
}


parcelasCartao?.addEventListener(
    "change",
    atualizarTotalCartao
);

function redirecionarParaLogin() {
    localStorage.removeItem("tokenCial");
    localStorage.removeItem("usuarioCial");

    window.location.href =
        "../cadastro/login.html";
}

async function lerResposta(resposta) {
    const texto = await resposta.text();

    let resultado;

    try {
        resultado = texto
            ? JSON.parse(texto)
            : {};
    } catch {
        throw new Error(
            `Resposta inválida do servidor: ${texto}`
        );
    }

    if (!resposta.ok || resultado.ok === false) {
        throw new Error(
            resultado.erro ||
            "Erro na requisição"
        );
    }

    return resultado;
}

async function carregarCarrinho() {
    const token = obterToken();

    if (!token) {
        carrinho = [];
        renderizarCarrinho();
        return;
    }

    try {
        const resposta = await fetch(
            `${API_CARRINHO}/carrinho`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (resposta.status === 401) {
            redirecionarParaLogin();
            return;
        }

        const resultado =
            await lerResposta(resposta);

        carrinho = Array.isArray(resultado.data)
            ? resultado.data
            : [];

        renderizarCarrinho();
        atualizarContadorHeader();
        await atualizarHeaderGlobal();
    } catch (erro) {
        console.error(
            "Erro ao carregar carrinho:",
            erro
        );

        if (cartProducts) {
            cartProducts.innerHTML = `
                <div class="cart-empty">
                    <h2>
                        Não foi possível carregar o carrinho
                    </h2>
                    <p>
                        ${escaparHTML(erro.message)}
                    </p>
                </div>
            `;
        }
    }
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function criarCarrinhoVazio() {
    return `
        <div class="cart-empty">
            <i class="fa-solid fa-cart-shopping"></i>

            <h2>
                Seu carrinho está vazio
            </h2>

            <p>
                Adicione alguns produtos para começar sua compra.
            </p>
        </div>
    `;
}

function criarCardProduto(item) {
    const nome = escaparHTML(item.nome);
    const imagem = escaparHTML(
        item.imagem ||
        "imagem/produto-sem-imagem.png"
    );

    const produtoId = Number(item.produto_id);
    const quantidade = Number(item.quantidade);
    const preco = Number(item.preco);

    return `
        <article class="cart-item">
            <div class="cart-item-image">
                <img
                    src="${imagem}"
                    alt="${nome}"
                    onerror="
                        this.src='imagem/produto-sem-imagem.png'
                    "
                >
            </div>

            <div class="cart-item-info">
                <h3>${nome}</h3>

                <strong>
                    ${formatarPreco(preco)}
                </strong>
            </div>

            <div class="cart-item-quantity">
                <button
                    type="button"
                    class="btn-minus"
                    data-produto-id="${produtoId}"
                    aria-label="Diminuir quantidade"
                >
                    <i class="fa-solid fa-minus"></i>
                </button>

                <span class="quantity">
                    ${quantidade}
                </span>

                <button
                    type="button"
                    class="btn-plus"
                    data-produto-id="${produtoId}"
                    aria-label="Aumentar quantidade"
                >
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>

            <div class="cart-item-subtotal">
                ${formatarPreco(preco * quantidade)}
            </div>

            <button
                type="button"
                class="btn-remove"
                data-produto-id="${produtoId}"
                aria-label="Remover produto"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        </article>
    `;
}

function renderizarCarrinho() {
    if (!cartProducts) {
        console.error(
            "Elemento .cart-products não encontrado."
        );

        return;
    }

    if (carrinho.length === 0) {
        cartProducts.innerHTML =
            criarCarrinhoVazio();

        atualizarResumo();
        return;
    }

    cartProducts.innerHTML =
        carrinho
            .map(criarCardProduto)
            .join("");

    atualizarResumo();
}

function atualizarResumo() {
    const subtotal =
        carrinho.reduce((total, item) => {
            return total +
                Number(item.preco) *
                Number(item.quantidade);
        }, 0);

    const desconto = 0;
    const frete = subtotal > 0 ? 0 : 0;
    const total = subtotal - desconto + frete;

    if (subtotalElement) {
        subtotalElement.textContent =
            formatarPreco(subtotal);
    }

    if (shippingElement) {
        shippingElement.textContent =
            subtotal > 0
                ? formatarPreco(frete)
                : "A calcular";
    }

    if (discountElement) {
        discountElement.textContent =
            formatarPreco(desconto);
    }

    if (totalElement) {
        totalElement.textContent =
            formatarPreco(total);
    }
}

function atualizarContadorHeader() {
    const contador =
        document.getElementById(
            "contadorCarrinho"
        );

    if (!contador) {
        return;
    }

    const quantidade =
        carrinho.reduce((total, item) => {
            return total +
                Number(item.quantidade || 0);
        }, 0);

    contador.textContent = quantidade;
}

async function atualizarHeaderGlobal() {
    if (
        typeof window.atualizarContadorCarrinho ===
        "function"
    ) {
        await window.atualizarContadorCarrinho();
    }
}

async function alterarQuantidade(
    produtoId,
    quantidade
) {
    const token = obterToken();

    if (!token) {
        redirecionarParaLogin();
        return;
    }

    try {
        const resposta = await fetch(
            `${API_CARRINHO}/carrinho/${produtoId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantidade
                })
            }
        );

        if (resposta.status === 401) {
            redirecionarParaLogin();
            return;
        }

        await lerResposta(resposta);
        await carregarCarrinho();
        await atualizarHeaderGlobal();
    } catch (erro) {
        console.error(
            "Erro ao alterar quantidade:",
            erro
        );

        alert(erro.message);
    }
}

async function removerProduto(produtoId) {
    const token = obterToken();

    if (!token) {
        redirecionarParaLogin();
        return;
    }

    try {
        const resposta = await fetch(
            `${API_CARRINHO}/carrinho/${produtoId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (resposta.status === 401) {
            redirecionarParaLogin();
            return;
        }

        await lerResposta(resposta);
        await carregarCarrinho();
        await atualizarHeaderGlobal();
    } catch (erro) {
        console.error(
            "Erro ao remover produto:",
            erro
        );

        alert(erro.message);
    }
}

cartProducts?.addEventListener(
    "click",
    event => {
        const botaoMais =
            event.target.closest(".btn-plus");

        if (botaoMais) {
            const produtoId =
                Number(
                    botaoMais.dataset.produtoId
                );

            const item = carrinho.find(
                produto =>
                    Number(produto.produto_id) ===
                    produtoId
            );

            if (item) {
                alterarQuantidade(
                    produtoId,
                    Number(item.quantidade) + 1
                );
            }

            return;
        }

        const botaoMenos =
            event.target.closest(".btn-minus");

        if (botaoMenos) {
            const produtoId =
                Number(
                    botaoMenos.dataset.produtoId
                );

            const item = carrinho.find(
                produto =>
                    Number(produto.produto_id) ===
                    produtoId
            );

            if (item) {
                const novaQuantidade =
                    Number(item.quantidade) - 1;

                if (novaQuantidade <= 0) {
                    removerProduto(produtoId);
                } else {
                    alterarQuantidade(
                        produtoId,
                        novaQuantidade
                    );
                }
            }

            return;
        }

        const botaoRemover =
            event.target.closest(".btn-remove");

        if (botaoRemover) {
            removerProduto(
                Number(
                    botaoRemover.dataset.produtoId
                )
            );
        }
    }
);

// ==================================================
// ABRIR MODAL DE ESCOLHA DE PAGAMENTO
// ==================================================

btnFinish?.addEventListener(
    "click",
    event => {
        event.preventDefault();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        if (modalPagamento) {
            modalPagamento.hidden = false;
        }
    }
);

btnPagamentoPix?.addEventListener(
    "click",
    async event => {

        event.preventDefault();

        if (modalPagamento) {
            modalPagamento.hidden = true;
        }

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const token = obterToken();

        if (!token) {
            redirecionarParaLogin();
            return;
        }

        const usuario = JSON.parse(
            localStorage.getItem("usuarioCial") || "{}"
        );

        if (!usuario.id) {
            alert(
                "Usuário não encontrado. Faça login novamente."
            );

            redirecionarParaLogin();
            return;
        }

        const observacoes = observation?.value?.trim() || "";

        btnFinish.disabled = true;
        btnFinish.textContent = "Criando pedido...";

        try {
            /*
             * 1. Cria pedido + itens usando o carrinho salvo
             *    no Supabase. O backend recalcula o valor.
             */
            const respostaPedido = await fetch(
                `${API_CARRINHO}/pedidos/criar-do-carrinho`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        observacoes
                    })
                }
            );

            const resultadoPedido =
                await lerResposta(respostaPedido);

            const pedido = resultadoPedido.pedido;

            if (!pedido?.id) {
                throw new Error(
                    "O pedido foi criado, mas o ID não foi retornado."
                );
            }

            btnFinish.textContent = "Gerando Pix...";

            /*
             * 2. Cria a cobrança usando o ID do pedido.
             *    O backend consulta o valor salvo no Supabase.
             */
            const respostaPagamento = await fetch(
                `${API_CARRINHO}/api/asaas/cobrancas/pix`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        pedidoId: pedido.id,
                        descricao:
                            `Pedido ${pedido.numero} - Cial Site`
                    })
                }
            );

            const resultadoPagamento =
                await lerResposta(respostaPagamento);

            const pagamento =
                resultadoPagamento.pagamento;

            if (!pagamento?.id) {
                throw new Error(
                    "A cobrança Pix foi criada, mas o ID não foi retornado."
                );
            }

            btnFinish.textContent = "Gerando QR Code...";

            /*
             * 3. Busca o QR Code da cobrança criada.
             */
            const respostaQrCode = await fetch(
                `${API_CARRINHO}/api/asaas/cobrancas/${pagamento.id}/pix-qrcode`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dadosQrCode =
                await lerResposta(respostaQrCode);

            const modalPix =
                document.getElementById("modalPix");

            const pixQrCode =
                document.getElementById("pixQrCode");

            const pixCopiaCola =
                document.getElementById("pixCopiaCola");

            const pixValidade =
                document.getElementById("pixValidade");

            const pixStatus =
                document.getElementById("pixStatus");

            const pixDescricao =
                document.getElementById("pixDescricao");

            if (!modalPix || !pixQrCode || !pixCopiaCola) {
                throw new Error(
                    "Elementos do pagamento Pix não foram encontrados no carrinho.html."
                );
            }

            const dadosPix =
                dadosQrCode.pix || dadosQrCode;

            if (!dadosPix.encodedImage) {
                throw new Error(
                    "A API não retornou a imagem do QR Code Pix."
                );
            }

            if (!dadosPix.payload) {
                throw new Error(
                    "A API não retornou o código Pix copia e cola."
                );
            }

            pixQrCode.src =
                `data:image/png;base64,${dadosPix.encodedImage}`;

            pixCopiaCola.value =
                dadosPix.payload;

            if (pixDescricao) {
                pixDescricao.textContent =
                    `Pedido ${pedido.numero} — ` +
                    `${formatarPreco(pedido.valor)}`;
            }

            if (
                pixValidade &&
                dadosPix.expirationDate
            ) {
                pixValidade.textContent =
                    `Válido até: ${dadosPix.expirationDate}`;
            }

            if (pixStatus) {
                pixStatus.textContent =
                    "Aguardando confirmação do pagamento...";
            }

            console.log(
                "Pedido e pagamento criados:",
                {
                    pedidoId: pedido.id,
                    numeroPedido: pedido.numero,
                    pagamentoId: pagamento.id
                }
            );

            modalPix.hidden = false;
        } catch (erro) {
            console.error(
                "Erro ao finalizar compra:",
                erro
            );

            alert(
                `Não foi possível finalizar a compra:\n${erro.message}`
            );
        } finally {
            btnFinish.disabled = false;
            btnFinish.textContent = "Finalizar compra";
        }
    }
);

const modalPix =
    document.getElementById("modalPix");

const fecharModalPix =
    document.getElementById("fecharModalPix");

const copiarCodigoPix =
    document.getElementById("copiarCodigoPix");

const pixCopiaCola =
    document.getElementById("pixCopiaCola");

fecharModalPix?.addEventListener(
    "click",
    () => {
        if (modalPix) {
            modalPix.hidden = true;
        }
    }
);

copiarCodigoPix?.addEventListener(
    "click",
    async () => {
        if (!pixCopiaCola?.value) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                pixCopiaCola.value
            );

            copiarCodigoPix.textContent =
                "Código copiado!";

            setTimeout(
                () => {
                    copiarCodigoPix.textContent =
                        "Copiar código Pix";
                },
                2000
            );
        } catch (erro) {
            console.error(
                "Não foi possível copiar o Pix:",
                erro
            );

            alert(
                "Não foi possível copiar automaticamente. Selecione o código e copie manualmente."
            );
        }
    }
);


btnWhatsapp?.addEventListener(
    "click",
    () => {
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        let mensagem =
            "Olá! Gostaria de fazer este pedido:\n\n";

        carrinho.forEach(item => {
            const subtotal =
                Number(item.preco) *
                Number(item.quantidade);

            mensagem +=
                `Produto: ${item.nome}\n`;

            mensagem +=
                `Quantidade: ${item.quantidade}\n`;

            mensagem +=
                `Subtotal: ${formatarPreco(subtotal)}\n\n`;
        });

        const total =
            carrinho.reduce((valor, item) => {
                return valor +
                    Number(item.preco) *
                    Number(item.quantidade);
            }, 0);

        mensagem +=
            `Total: ${formatarPreco(total)}`;

        const numero =
            "5561999999999";

        window.open(
            `https://wa.me/${numero}?text=${encodeURIComponent(
                mensagem
            )}`,
            "_blank"
        );
    }
);


document.addEventListener(
    "DOMContentLoaded",
    carregarCarrinho
);