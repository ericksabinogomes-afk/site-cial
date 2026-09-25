
const API_CARRINHO =
    window.API_BASE_URL ||
    "http://localhost:4000";

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
let pedidoAtualId = null;

// ==========================================================
// SISTEMA DE ASSINATURA DAS GARANTIAS
// ==========================================================

let garantiasPendentes = [];
let indiceGarantiaAtual = 0;
let assinaturaCanvas = null;
let assinaturaContexto = null;
let assinaturaDesenhando = false;
let assinaturaTemConteudo = false;


// ==========================================================
// CRIAR MODAL DE ASSINATURA
// ==========================================================

function criarModalAssinaturaGarantia() {

    if (document.getElementById("modalAssinaturaGarantia")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "modalAssinaturaGarantia";

    modal.innerHTML = `
        <div class="assinatura-overlay">

            <div class="assinatura-modal">

                <button
                    type="button"
                    id="fecharModalAssinatura"
                    class="assinatura-fechar"
                    aria-label="Fechar"
                >
                    &times;
                </button>

                <div class="assinatura-header">

                    <i class="fa-solid fa-file-signature"></i>

                    <h2>
                        Assinatura da Garantia
                    </h2>

                    <p id="assinaturaProgresso">
                        Garantia 1 de 1
                    </p>

                </div>


                <div class="assinatura-info">

                    <h3 id="assinaturaProduto">
                        Produto
                    </h3>

                    <p>
                        Este produto possui
                        <strong>1 ano de garantia</strong>.
                    </p>

                    <p id="assinaturaUnidade">
                        Unidade 1
                    </p>

                </div>


                <div class="assinatura-area">

                    <p>
                        Assine no espaço abaixo:
                    </p>

                    <canvas
                        id="canvasAssinatura"
                        width="600"
                        height="220"
                    ></canvas>

                </div>


                <div class="assinatura-acoes">

                    <button
                        type="button"
                        id="limparAssinatura"
                        class="btn-limpar-assinatura"
                    >
                        <i class="fa-solid fa-eraser"></i>
                        Limpar
                    </button>

                    <button
                        type="button"
                        id="confirmarAssinatura"
                        class="btn-confirmar-assinatura"
                        disabled
                    >
                        <i class="fa-solid fa-check"></i>
                        Confirmar e Assinar
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    configurarCanvasAssinatura();
}


// ==========================================================
// CONFIGURAR CANVAS
// ==========================================================

function configurarCanvasAssinatura() {

    assinaturaCanvas =
        document.getElementById("canvasAssinatura");

    if (!assinaturaCanvas) {
        return;
    }

    assinaturaContexto =
        assinaturaCanvas.getContext("2d");

    assinaturaContexto.lineWidth = 2;
    assinaturaContexto.lineCap = "round";
    assinaturaContexto.lineJoin = "round";

    function obterPosicao(evento) {

        const rect =
            assinaturaCanvas.getBoundingClientRect();

        let clientX;
        let clientY;

        if (evento.touches && evento.touches.length) {

            clientX =
                evento.touches[0].clientX;

            clientY =
                evento.touches[0].clientY;

        } else {

            clientX =
                evento.clientX;

            clientY =
                evento.clientY;
        }

        return {
            x:
                (clientX - rect.left) *
                (assinaturaCanvas.width / rect.width),

            y:
                (clientY - rect.top) *
                (assinaturaCanvas.height / rect.height)
        };
    }


    function iniciarAssinatura(evento) {

        evento.preventDefault();

        assinaturaDesenhando = true;

        const posicao =
            obterPosicao(evento);

        assinaturaContexto.beginPath();

        assinaturaContexto.moveTo(
            posicao.x,
            posicao.y
        );
    }


    function desenharAssinatura(evento) {

        if (!assinaturaDesenhando) {
            return;
        }

        evento.preventDefault();

        const posicao =
            obterPosicao(evento);

        assinaturaContexto.lineTo(
            posicao.x,
            posicao.y
        );

        assinaturaContexto.stroke();

        assinaturaTemConteudo = true;

        const botao =
            document.getElementById(
                "confirmarAssinatura"
            );

        if (botao) {
            botao.disabled = false;
        }
    }


    function finalizarAssinatura() {

        assinaturaDesenhando = false;

        assinaturaContexto.closePath();
    }


    assinaturaCanvas.addEventListener(
        "mousedown",
        iniciarAssinatura
    );

    assinaturaCanvas.addEventListener(
        "mousemove",
        desenharAssinatura
    );

    assinaturaCanvas.addEventListener(
        "mouseup",
        finalizarAssinatura
    );

    assinaturaCanvas.addEventListener(
        "mouseleave",
        finalizarAssinatura
    );


    assinaturaCanvas.addEventListener(
        "touchstart",
        iniciarAssinatura,
        { passive: false }
    );

    assinaturaCanvas.addEventListener(
        "touchmove",
        desenharAssinatura,
        { passive: false }
    );

    assinaturaCanvas.addEventListener(
        "touchend",
        finalizarAssinatura,
        { passive: false }
    );


    document
        .getElementById("limparAssinatura")
        ?.addEventListener(
            "click",
            limparCanvasAssinatura
        );


    document
        .getElementById("confirmarAssinatura")
        ?.addEventListener(
            "click",
            confirmarAssinaturaAtual
        );


    document
        .getElementById("fecharModalAssinatura")
        ?.addEventListener(
            "click",
            () => {

                const modal =
                    document.getElementById(
                        "modalAssinaturaGarantia"
                    );

                if (modal) {
                    modal.hidden = true;
                }
            }
        );
}


// ==========================================================
// LIMPAR ASSINATURA
// ==========================================================

function limparCanvasAssinatura() {

    if (!assinaturaCanvas || !assinaturaContexto) {
        return;
    }

    assinaturaContexto.clearRect(
        0,
        0,
        assinaturaCanvas.width,
        assinaturaCanvas.height
    );

    assinaturaTemConteudo = false;

    const botao =
        document.getElementById(
            "confirmarAssinatura"
        );

    if (botao) {
        botao.disabled = true;
    }
}


// ==========================================================
// ABRIR GARANTIA
// ==========================================================

function abrirModalAssinaturaGarantia() {

    if (!garantiasPendentes.length) {

        window.location.href =
            "../cadastro/area-cliente.html";

        return;
    }

    criarModalAssinaturaGarantia();

    indiceGarantiaAtual = 0;

    mostrarGarantiaAtual();
}


// ==========================================================
// MOSTRAR GARANTIA ATUAL
// ==========================================================

function mostrarGarantiaAtual() {

    const garantia =
        garantiasPendentes[indiceGarantiaAtual];

    if (!garantia) {
        finalizarAssinaturasGarantia();
        return;
    }


    const modal =
        document.getElementById(
            "modalAssinaturaGarantia"
        );

    if (!modal) {
        return;
    }


    const produto =
        document.getElementById(
            "assinaturaProduto"
        );

    const progresso =
        document.getElementById(
            "assinaturaProgresso"
        );

    const unidade =
        document.getElementById(
            "assinaturaUnidade"
        );


    if (produto) {

        produto.textContent =
            garantia.nome;
    }


    if (progresso) {

        progresso.textContent =
            `Garantia ${indiceGarantiaAtual + 1} de ${garantiasPendentes.length}`;
    }


    if (unidade) {

        unidade.textContent =
            `Unidade ${garantia.unidade}`;
    }


    limparCanvasAssinatura();

    modal.hidden = false;
}


// ==========================================================
// CONFIRMAR ASSINATURA ATUAL
// ==========================================================

async function confirmarAssinaturaAtual() {

    if (
        !assinaturaCanvas ||
        !assinaturaTemConteudo
    ) {

        alert(
            "Faça sua assinatura antes de continuar."
        );

        return;
    }


    const botao =
        document.getElementById(
            "confirmarAssinatura"
        );

    if (botao) {

        botao.disabled = true;

        botao.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    }


    const assinatura =
        assinaturaCanvas.toDataURL(
            "image/png"
        );


    garantiasPendentes[
        indiceGarantiaAtual
    ].assinatura = assinatura;


    indiceGarantiaAtual++;


    if (
        indiceGarantiaAtual <
        garantiasPendentes.length
    ) {

        mostrarGarantiaAtual();

        return;
    }


    await finalizarAssinaturasGarantia();
}


// ==========================================================
// FINALIZAR ASSINATURAS
// ==========================================================

async function finalizarAssinaturasGarantia() {

    const modal =
        document.getElementById(
            "modalAssinaturaGarantia"
        );

    if (modal) {
        modal.hidden = true;
    }

    const token = obterToken();

    if (!token) {
        alert(
            "Sua sessão expirou. Faça login novamente."
        );

        redirecionarParaLogin();
        return;
    }

    if (!garantiasPendentes.length) {
        alert(
            "Nenhuma garantia foi encontrada para assinatura."
        );
        return;
    }

    // ------------------------------------------------------
    // CONFIRMAR QUE TODAS AS GARANTIAS POSSUEM ASSINATURA
    // ------------------------------------------------------

    const todasAssinadas =
        garantiasPendentes.every(
            garantia =>
                typeof garantia.assinatura === "string" &&
                garantia.assinatura.startsWith(
                    "data:image/png;base64,"
                )
        );

    if (!todasAssinadas) {

        alert(
            "Ainda existem garantias que não foram assinadas."
        );

        return;
    }

    // ------------------------------------------------------
    // PEDIDO
    // ------------------------------------------------------

    const pedidoId =
        Number(
            garantiasPendentes[0].pedidoId
        );

    if (
        !Number.isInteger(pedidoId) ||
        pedidoId <= 0
    ) {
        alert(
            "Não foi possível identificar o pedido."
        );
        return;
    }

    try {

        console.log(
            "Enviando assinaturas para o servidor...",
            {
                pedidoId,
                quantidade:
                    garantiasPendentes.length
            }
        );

        // --------------------------------------------------
        // SALVAR TODAS AS ASSINATURAS
        // --------------------------------------------------

        const resposta =
            await fetch(
                `${API_CARRINHO}/garantias/${pedidoId}/assinar`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        garantias:
                            garantiasPendentes.map(
                                garantia => ({
                                    unidade:
                                        garantia.unidade,

                                    assinatura:
                                        garantia.assinatura
                                })
                            )
                    })
                }
            );

        const resultado =
            await lerResposta(resposta);

        console.log(
            "Assinaturas salvas:",
            resultado
        );

        // --------------------------------------------------
        // AGORA SIM PODE LIMPAR O CARRINHO
        // --------------------------------------------------

        localStorage.removeItem(
            "carrinho"
        );

        localStorage.removeItem(
            "carrinho_itens"
        );

        localStorage.removeItem(
            "pedidoAtualId"
        );

        garantiasPendentes = [];
        indiceGarantiaAtual = 0;

        alert(
            "Todas as garantias foram assinadas e registradas com sucesso!"
        );

        window.location.href =
            "../cadastro/area-cliente.html";

    } catch (erro) {

        console.error(
            "Erro ao salvar assinaturas:",
            erro
        );

        // Reabre o modal para não perder
        // as assinaturas que estão em memória.
        if (modal) {
            modal.hidden = false;
        }

        alert(
            `Não foi possível registrar as garantias:\n${erro.message}`
        );
    }
}

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

// ==================================================
// VERIFICAR PAGAMENTO DO PEDIDO
// ==================================================

async function verificarPagamentoPedido(pedidoId) {
    const token = obterToken();

    if (!token || !Number.isInteger(Number(pedidoId))) {
        return false;
    }

    try {
        const resposta = await fetch(
            `${API_CARRINHO}/pedidos/${pedidoId}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const resultado =
            await lerResposta(resposta);

        const pedido =
            resultado.pedido ||
            resultado.data;

        return pedido?.status === "pago";

    } catch (erro) {
        console.error(
            "Erro ao verificar pagamento:",
            erro
        );

        return false;
    }
}

// ==================================================
// PREPARAR E ABRIR GARANTIAS
// ==================================================

async function prepararEabrirGarantias(
    pedidoId,
    modalParaFechar = null
) {

    const token = obterToken();

    if (!token) {
        redirecionarParaLogin();
        return false;
    }

    try {

        console.log(
            "Preparando garantias do pedido:",
            pedidoId
        );

        const resposta = await fetch(
            `${API_CARRINHO}/garantias/${pedidoId}/preparar`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const resultado =
            await lerResposta(resposta);

        const garantias =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];

        console.log(
            "Garantias recebidas:",
            garantias
        );

        garantiasPendentes =
            garantias.map(garantia => ({
                nome:
                    garantia["nome do produto"],

                unidade:
                    garantia.unidade,

                pedidoId,

                garantiaId:
                    garantia.id
            }));

        console.log(
            "Garantias pendentes:",
            garantiasPendentes
        );

        // Fechar o modal de pagamento
        if (modalParaFechar) {
            modalParaFechar.hidden = true;
        }

        // Pedido sem produtos com garantia
        if (!garantiasPendentes.length) {

            localStorage.removeItem(
                "carrinho"
            );

            localStorage.removeItem(
                "carrinho_itens"
            );

            localStorage.removeItem(
                "pedidoAtualId"
            );

            alert(
                "Pagamento aprovado! Este pedido não possui produtos com garantia."
            );

            window.location.href =
                "../cadastro/area-cliente.html";

            return false;
        }

        // Abrir modal de assinatura
        abrirModalAssinaturaGarantia();

        return true;

    } catch (erro) {

        console.error(
            "Erro ao preparar garantias:",
            erro
        );

        alert(
            `Pagamento aprovado, mas não foi possível preparar as garantias:\n${erro.message}`
        );

        return false;
    }
}


// ==================================================
// AGUARDAR PAGAMENTO E ABRIR GARANTIAS
// ==================================================

async function aguardarPagamentoEPedirGarantias(
    pedidoId,
    modalParaFechar = null
) {

    console.log(
        "Aguardando confirmação do pagamento:",
        pedidoId
    );

    const maxTentativas = 60;

    for (
        let tentativa = 0;
        tentativa < maxTentativas;
        tentativa++
    ) {

        const pago =
            await verificarPagamentoPedido(
                pedidoId
            );

        if (pago) {

            console.log(
                "Pagamento confirmado!",
                pedidoId
            );

            await prepararEabrirGarantias(
                pedidoId,
                modalParaFechar
            );

            return true;
        }

        await new Promise(
            resolve =>
                setTimeout(resolve, 3000)
        );
    }

    console.warn(
        "Pagamento ainda não confirmado após o tempo de espera."
    );

    return false;
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
// MODAL DE ENDEREÇO DE ENTREGA
// ==================================================

const modalEndereco =
    document.getElementById("modalEndereco");

const fecharModalEndereco =
    document.getElementById("fecharModalEndereco");

const confirmarEndereco =
    document.getElementById("confirmarEndereco");

const enderecoCep =
    document.getElementById("enderecoCep");

const enderecoRua =
    document.getElementById("enderecoRua");

const enderecoNumero =
    document.getElementById("enderecoNumero");

const enderecoBairro =
    document.getElementById("enderecoBairro");

const enderecoCidade =
    document.getElementById("enderecoCidade");

const enderecoEstado =
    document.getElementById("enderecoEstado");

const statusEndereco =
    document.getElementById("statusEndereco");

let enderecoAtualId = null;


// ==================================================
// ABRIR MODAL DE ENDEREÇO
// ==================================================

btnFinish?.addEventListener(
    "click",
    async event => {

        event.preventDefault();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const token = obterToken();

        if (!token) {
            redirecionarParaLogin();
            return;
        }

        if (!modalEndereco) {
            console.error(
                "Modal de endereço não encontrado."
            );

            alert(
                "Não foi possível abrir o endereço de entrega."
            );

            return;
        }

        try {

            if (statusEndereco) {
                statusEndereco.textContent =
                    "Carregando endereço...";
            }

            if (confirmarEndereco) {
                confirmarEndereco.disabled = true;
            }

            const respostaEndereco =
                await fetch(
                    `${API_CARRINHO}/meu-endereco`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const resultadoEndereco =
                await lerResposta(
                    respostaEndereco
                );

            const endereco =
                resultadoEndereco.data;

            if (!endereco?.id) {
                throw new Error(
                    "Nenhum endereço válido foi encontrado."
                );
            }

            enderecoAtualId =
                Number(endereco.id);

            if (enderecoCep) {
                enderecoCep.textContent =
                    endereco.cep || "—";
            }

            if (enderecoRua) {
                enderecoRua.textContent =
                    endereco.rua || "—";
            }

            if (enderecoNumero) {
                enderecoNumero.textContent =
                    endereco.numero_endereco || "—";
            }

            if (enderecoBairro) {
                enderecoBairro.textContent =
                    endereco.bairro || "—";
            }

            if (enderecoCidade) {
                enderecoCidade.textContent =
                    endereco.cidade || "—";
            }

            if (enderecoEstado) {
                enderecoEstado.textContent =
                    endereco.estado || "—";
            }

            if (statusEndereco) {
                statusEndereco.textContent = "";
            }

            modalEndereco.hidden = false;

        } catch (erro) {

            console.error(
                "Erro ao carregar endereço:",
                erro
            );

            if (statusEndereco) {
                statusEndereco.textContent =
                    erro.message;
            }

            alert(
                `Não foi possível carregar seu endereço:\n${erro.message}`
            );

        } finally {

            if (confirmarEndereco) {
                confirmarEndereco.disabled = false;
            }
        }
    }
);


// ==================================================
// FECHAR MODAL DE ENDEREÇO
// ==================================================

fecharModalEndereco?.addEventListener(
    "click",
    () => {

        if (modalEndereco) {
            modalEndereco.hidden = true;
        }

    }
);


// ==================================================
// CONFIRMAR ENDEREÇO E CRIAR PEDIDO
// ==================================================

confirmarEndereco?.addEventListener(
    "click",
    async event => {

        event.preventDefault();

        if (!enderecoAtualId) {

            if (statusEndereco) {
                statusEndereco.textContent =
                    "Endereço inválido.";
            }

            return;
        }

        const token = obterToken();

        if (!token) {
            redirecionarParaLogin();
            return;
        }

        try {

            confirmarEndereco.disabled = true;

            if (statusEndereco) {
                statusEndereco.textContent =
                    "Criando seu pedido...";
            }

            const respostaPedido =
                await fetch(
                    `${API_CARRINHO}/pedidos/criar-do-carrinho`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            endereco_id:
                                enderecoAtualId,

                            observacoes:
                                observation?.value?.trim() || ""
                        })
                    }
                );

            const resultadoPedido =
                await lerResposta(
                    respostaPedido
                );

            const pedido =
                resultadoPedido.pedido;

            if (!pedido?.id) {
                throw new Error(
                    "O pedido foi criado, mas o ID não foi retornado."
                );
            }

            pedidoAtualId =
                Number(pedido.id);

            localStorage.setItem(
                "pedidoAtualId",
                String(pedidoAtualId)
            );

            console.log(
                "Pedido criado para pagamento:",
                pedidoAtualId
            );

            // Fecha endereço
            if (modalEndereco) {
                modalEndereco.hidden = true;
            }

            // Abre pagamento
            if (modalPagamento) {
                modalPagamento.hidden = false;
            }

        } catch (erro) {

            console.error(
                "Erro ao criar pedido:",
                erro
            );

            if (statusEndereco) {
                statusEndereco.textContent =
                    erro.message;
            }

            alert(
                `Não foi possível criar o pedido:\n${erro.message}`
            );

        } finally {

            confirmarEndereco.disabled = false;
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

 const pedidoId = Number(pedidoAtualId);

if (!Number.isInteger(pedidoId)) {
    throw new Error(
        "Não foi possível identificar o pedido. Finalize a compra novamente."
    );
}

btnFinish.disabled = true;
btnFinish.textContent = "Gerando Pix...";

try {

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
    pedidoId,
    descricao:
        `Pedido ${pedidoId} - Cial Site`
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
                 `Pedido ${pedidoId}`;
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
                    pedidoId: pedidoId,
                    numeroPedido: pedidoId,
                    pagamentoId: pagamento.id
                }
            );

       modalPix.hidden = false;

// ==================================================
// AGUARDAR PAGAMENTO PIX
// ==================================================

aguardarPagamentoEPedirGarantias(
    pedidoId,
    modalPix
).then(confirmado => {

    if (!confirmado && pixStatus) {
        pixStatus.textContent =
            "Pagamento ainda não confirmado. Você pode continuar acompanhando.";
    }

});

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


// ==========================================================
// SOLICITAR ORÇAMENTO PELO CARRINHO
// ==========================================================

btnWhatsapp?.addEventListener(
    "click",
    async event => {

        event.preventDefault();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const token = obterToken();

        if (!token) {
            redirecionarParaLogin();
            return;
        }

        const observacoes =
            observation?.value?.trim() || "";

        btnWhatsapp.disabled = true;
        btnWhatsapp.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Criando orçamento...';

        try {

            // ==================================================
            // 1. CRIAR ORÇAMENTO NO SUPABASE PELO BACKEND
            // ==================================================

            const resposta = await fetch(
                `${API_CARRINHO}/orcamentos/criar-do-carrinho`,
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

            const resultado =
                await lerResposta(resposta);

            const orcamento =
                resultado.orcamento;

            if (!orcamento?.id) {
                throw new Error(
                    "O orçamento foi criado, mas o ID não foi retornado."
                );
            }


            // ==================================================
            // 2. MONTAR MENSAGEM PARA A CIAL
            // ==================================================

            let mensagem =
                "📋 *NOVO ORÇAMENTO — CIAL ASA SUL*\n\n";

            mensagem +=
                `🧾 Orçamento: *${orcamento.numero}*\n`;

            mensagem +=
                `📊 Status: *EM ANÁLISE*\n\n`;

            mensagem +=
                "🛒 *PRODUTOS SOLICITADOS*\n\n";


            carrinho.forEach(item => {

                const subtotal =
                    Number(item.preco) *
                    Number(item.quantidade);

                mensagem +=
                    `• *${item.nome}*\n`;

                mensagem +=
                    `  Quantidade: ${item.quantidade}\n`;

                mensagem +=
                    `  Valor: ${formatarPreco(subtotal)}\n\n`;
            });


            const total =
                carrinho.reduce(
                    (valor, item) => {

                        return valor +
                            Number(item.preco) *
                            Number(item.quantidade);

                    },
                    0
                );


            mensagem +=
                `💰 *Total estimado: ${formatarPreco(total)}*\n`;


            if (observacoes) {

                mensagem +=
                    `\n📝 *Observação do cliente:*\n${observacoes}\n`;
            }


            mensagem +=
                "\n🏪 CIAL Asa Sul";


            // ==================================================
            // 3. ABRIR WHATSAPP DA LOJA
            // ==================================================

            const numero =
                "5561998112731"; // Número da CIAL Asa Sul

            window.open(
                `https://wa.me/${numero}?text=${encodeURIComponent(
                    mensagem
                )}`,
                "_blank"
            );


            // ==================================================
            // 4. AVISAR CLIENTE
            // ==================================================

            alert(
                `Orçamento ${orcamento.numero} criado com sucesso!\n\n` +
                "Ele foi registrado e a mensagem foi preparada para o WhatsApp da CIAL."
            );


            console.log(
                "Orçamento criado:",
                orcamento
            );


        } catch (erro) {

            console.error(
                "Erro ao solicitar orçamento:",
                erro
            );

            alert(
                erro.message ||
                "Não foi possível criar o orçamento."
            );

        } finally {

            btnWhatsapp.disabled = false;

            btnWhatsapp.innerHTML =
                '<i class="fa-brands fa-whatsapp"></i> Solicitar orçamento';

        }

    }
);


document.addEventListener(
    "DOMContentLoaded",
    carregarCarrinho
);

const confirmarPagamentoCartao =
    document.getElementById(
        "confirmarPagamentoCartao"
    );

confirmarPagamentoCartao?.addEventListener(
    "click",
    async () => {
        const token = obterToken();

        if (!token) {
            redirecionarParaLogin();
            return;
        }

        const pedidoId = Number(pedidoAtualId);

        console.log(
            "Pedido enviado para cartão:",
            pedidoId
        );

        console.log(
            "Pedido enviado para cartão:",
            pedidoId
            );

        if (!Number.isInteger(pedidoId)) {
            alert(
                "Não foi possível identificar o pedido. Tente finalizar a compra novamente."
            );

            return;
        }

        const numeroCartao =
            document.getElementById(
                "numeroCartao"
            )?.value
                .trim();

        const nomeCartao =
            document.getElementById(
                "nomeCartao"
            )?.value
                .trim();

        const validadeCartao =
            document.getElementById(
                "validadeCartao"
            )?.value
                .trim();

        const cvvCartao =
            document.getElementById(
                "cvvCartao"
            )?.value
                .trim();

        const parcelas =
            Number(
                document.getElementById(
                    "parcelasCartao"
                )?.value || 1
            );

        if (
            !numeroCartao ||
            !nomeCartao ||
            !validadeCartao ||
            !cvvCartao
        ) {
            alert(
                "Preencha todos os dados do cartão."
            );

            return;
        }

        if (
            !/^\d{2}\/\d{2}$/.test(
                validadeCartao
            )
        ) {
            alert(
                "Informe a validade no formato MM/AA."
            );

            return;
        }

        confirmarPagamentoCartao.disabled = true;
        confirmarPagamentoCartao.textContent =
            "Processando pagamento...";

        try {
            const resposta = await fetch(
                `${API_CARRINHO}/api/asaas/cobrancas/cartao`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        pedidoId,
                        parcelas,
                        numeroCartao,
                        nomeCartao,
                        validadeCartao,
                        cvvCartao
                    })
                }
            );

            const resultado =
                await lerResposta(resposta);

            const pagamento =
                resultado.pagamento;

            if (!pagamento?.id) {
                throw new Error(
                    "O pagamento não foi criado corretamente."
                );
            }

// ==================================================
// AGUARDAR CONFIRMAÇÃO DO PAGAMENTO
// ==================================================

console.log(
    "Pagamento recebido pela Asaas:",
    pagamento.status,
    pedidoId
);

if (confirmarPagamentoCartao) {
    confirmarPagamentoCartao.textContent =
        "Aguardando confirmação...";
}

// Aguarda o webhook/backend confirmar que o pedido
// realmente foi marcado como pago.
const confirmado =
    await aguardarPagamentoEPedirGarantias(
        pedidoId,
        modalCartao
    );

if (!confirmado) {

    alert(
        "O pagamento ainda não foi confirmado. Você pode continuar acompanhando o pedido."
    );

} else {

    console.log(
        "Pagamento confirmado e garantias encaminhadas para assinatura:",
        pedidoId
    );
}

// ==================================================
// LIMPAR DADOS DO CARTÃO
// ==================================================

const campoNumero =
    document.getElementById("numeroCartao");

const campoNome =
    document.getElementById("nomeCartao");

const campoValidade =
    document.getElementById("validadeCartao");

const campoCvv =
    document.getElementById("cvvCartao");

if (campoNumero) {
    campoNumero.value = "";
}

if (campoNome) {
    campoNome.value = "";
}

if (campoValidade) {
    campoValidade.value = "";
}

if (campoCvv) {
    campoCvv.value = "";
}


        } catch (erro) {
            console.error(
                "Erro ao processar pagamento por cartão:",
                erro
            );

            alert(
                `Não foi possível processar o cartão:\n${erro.message}`
            );
        } finally {
            confirmarPagamentoCartao.disabled = false;
            confirmarPagamentoCartao.innerHTML =
                '<i class="fa-solid fa-lock"></i> Confirmar pagamento';
        }
    }
);

// =====================================================
// MONITORAMENTO DE STATUS DO PAGAMENTO (WEBHOOK)
// =====================================================

// Função para copiar o código Pix
async function copiarPix() {
    const pixCopiaCola = document.getElementById('pixCopiaCola');
    if (!pixCopiaCola) return;
    
    try {
        await navigator.clipboard.writeText(pixCopiaCola.value);
        alert('Código Pix copiado com sucesso!');
    } catch (err) {
        // Fallback para navegadores mais antigos
        pixCopiaCola.select();
        document.execCommand('copy');
        alert('Código Pix copiado com sucesso!');
    }
}

// Função para exibir o status do pagamento
function exibirStatusPagamento(status, gatewayStatus) {
    const container = document.getElementById('statusPagamentoContainer');
    const badge = document.getElementById('statusPagamentoBadge');
    const descricao = document.getElementById('statusPagamentoDescricao');
    
    if (!container || !badge || !descricao) return;
    
    container.style.display = 'block';
    
    const statusConfig = {
        'pago': { 
            cor: '#28a745', 
            texto: '✅ Pago', 
            descricao: 'Seu pagamento foi confirmado e o pedido está sendo processado.' 
        },
        'andamento': { 
            cor: '#ffc107', 
            texto: '⏳ Aguardando Pagamento', 
            descricao: 'Aguardando a confirmação do pagamento.' 
        },
        'vencido': { 
            cor: '#dc3545', 
            texto: '❌ Vencido', 
            descricao: 'O pagamento não foi realizado até a data de vencimento.' 
        },
        'cancelado': { 
            cor: '#6c757d', 
            texto: '🚫 Cancelado', 
            descricao: 'O pagamento foi cancelado ou recusado.' 
        },
        'estornado': { 
            cor: '#fd7e14', 
            texto: '💸 Estornado', 
            descricao: 'O pagamento foi estornado. O valor será devolvido conforme a política da operadora.' 
        },
        'chargeback': { 
            cor: '#dc3545', 
            texto: '⚠️ Chargeback', 
            descricao: 'Há uma disputa de chargeback em andamento. Entre em contato com o suporte.' 
        }
    };
    
    const config = statusConfig[status] || statusConfig['andamento'];
    
    badge.style.background = config.cor;
    badge.style.color = '#fff';
    badge.textContent = config.texto;
    descricao.textContent = config.descricao;
}

// Função para verificar status periodicamente (polling como fallback)
async function verificarStatusPedido(numeroPedido) {
    try {
        const resposta = await fetch(`${API_CARRINHO}/api/pedidos/${numeroPedido}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!resposta.ok) throw new Error('Erro ao buscar status');
        
        const dados = await resposta.json();
        
        if (dados && dados.status) {
            exibirStatusPagamento(dados.status, dados.gateway_status);
        }
    } catch (erro) {
        console.error('Erro ao verificar status do pedido:', erro);
    }
}

// Inicia o monitoramento após finalizar o pedido
function iniciarMonitoramentoPagamento(numeroPedido) {
    // Verifica imediatamente
    verificarStatusPedido(numeroPedido);
    
    // Verifica a cada 10 segundos por 5 minutos (30 verificações)
    let tentativas = 0;
    const maxTentativas = 30;
    
    const intervalo = setInterval(() => {
        tentativas++;
        verificarStatusPedido(numeroPedido);
        
        // Para após 5 minutos ou se o status for 'pago'
        if (tentativas >= maxTentativas) {
            clearInterval(intervalo);
        }
    }, 10000); // 10 segundos
    
    return intervalo;
}

// =====================================================
// INTEGRAÇÃO COM O FLUXO DE PAGAMENTO EXISTENTE
// =====================================================

// Após o pagamento Pix ser gerado, exibe o status e inicia o monitoramento
if (typeof finalizarCompraPix === 'function') {
    const finalizarCompraPixOriginal = finalizarCompraPix;
    
    finalizarCompraPix = async function() {
        try {
            const resultado = await finalizarCompraPixOriginal();
            
            // Se o pagamento foi criado com sucesso
            if (resultado && resultado.numeroPedido) {
                // Exibe o status inicial
                exibirStatusPagamento('andamento', 'PENDING');
                
                // Inicia o monitoramento
                iniciarMonitoramentoPagamento(resultado.numeroPedido);
            }
            
            return resultado;
        } catch (erro) {
            console.error('Erro ao finalizar compra Pix:', erro);
            throw erro;
        }
    };
}

// =====================================================
// MONITORAMENTO DE STATUS DO PAGAMENTO (WEBHOOK)
// =====================================================

// Função para copiar o código Pix
async function copiarPix() {
    const pixCopiaCola = document.getElementById('pixCopiaCola');
    if (!pixCopiaCola) return;
    
    try {
        await navigator.clipboard.writeText(pixCopiaCola.value);
        alert('Código Pix copiado com sucesso!');
    } catch (err) {
        // Fallback para navegadores mais antigos
        pixCopiaCola.select();
        document.execCommand('copy');
        alert('Código Pix copiado com sucesso!');
    }
}

// Função para exibir o status do pagamento
function exibirStatusPagamento(status, gatewayStatus) {
    const container = document.getElementById('statusPagamentoContainer');
    const badge = document.getElementById('statusPagamentoBadge');
    const descricao = document.getElementById('statusPagamentoDescricao');
    
    if (!container || !badge || !descricao) return;
    
    container.style.display = 'block';
    
    const statusConfig = {
        'pago': { 
            cor: '#28a745', 
            texto: 'Pago', 
            descricao: 'Seu pagamento foi confirmado e o pedido está sendo processado.' 
        },
        'andamento': { 
            cor: '#ffc107', 
            texto: 'Aguardando Pagamento', 
            descricao: 'Aguardando a confirmação do pagamento.' 
        },
        'vencido': { 
            cor: '#dc3545', 
            texto: 'Vencido', 
            descricao: 'O pagamento não foi realizado até a data de vencimento.' 
        },
        'cancelado': { 
            cor: '#6c757d', 
            texto: 'Cancelado', 
            descricao: 'O pagamento foi cancelado ou recusado.' 
        },
        'estornado': { 
            cor: '#fd7e14', 
            texto: 'Estornado', 
            descricao: 'O pagamento foi estornado. O valor será devolvido conforme a política da operadora.' 
        },
        'chargeback': { 
            cor: '#dc3545', 
            texto: 'Chargeback', 
            descricao: 'Há uma disputa de chargeback em andamento. Entre em contato com o suporte.' 
        }
    };
    
    const config = statusConfig[status] || statusConfig['andamento'];
    
    badge.style.background = config.cor;
    badge.style.color = '#fff';
    badge.textContent = config.texto;
    descricao.textContent = config.descricao;
}

// Função para verificar status periodicamente (polling como fallback)
async function verificarStatusPedido(numeroPedido) {
    try {
        const resposta = await fetch(`${API_CARRINHO}/api/pedidos/${numeroPedido}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!resposta.ok) throw new Error('Erro ao buscar status');
        
        const dados = await resposta.json();
        
        if (dados && dados.status) {
            exibirStatusPagamento(dados.status, dados.gateway_status);
        }
    } catch (erro) {
        console.error('Erro ao verificar status do pedido:', erro);
    }
}

// Inicia o monitoramento após finalizar o pedido
function iniciarMonitoramentoPagamento(numeroPedido) {
    // Verifica imediatamente
    verificarStatusPedido(numeroPedido);
    
    // Verifica a cada 10 segundos por 5 minutos (30 verificações)
    let tentativas = 0;
    const maxTentativas = 30;
    
    const intervalo = setInterval(() => {
        tentativas++;
        verificarStatusPedido(numeroPedido);
        
        // Para após 5 minutos ou se o status for 'pago'
        if (tentativas >= maxTentativas) {
            clearInterval(intervalo);
        }
    }, 10000); // 10 segundos
    
    return intervalo;
}

// =====================================================
// INTEGRAÇÃO COM O FLUXO DE PAGAMENTO EXISTENTE
// =====================================================

// Após o pagamento Pix ser gerado, exibe o status e inicia o monitoramento
if (typeof finalizarCompraPix === 'function') {
    const finalizarCompraPixOriginal = finalizarCompraPix;
    
    finalizarCompraPix = async function() {
        try {
            const resultado = await finalizarCompraPixOriginal();
            
            // Se o pagamento foi criado com sucesso
            if (resultado && resultado.numeroPedido) {
                // Exibe o status inicial
                exibirStatusPagamento('andamento', 'PENDING');
                
                // Inicia o monitoramento
                iniciarMonitoramentoPagamento(resultado.numeroPedido);
            }
            
            return resultado;
        } catch (erro) {
            console.error('Erro ao finalizar compra Pix:', erro);
            throw erro;
        }
    };
}

//=====================================================
// MONITORAMENTO DE STATUS DO PAGAMENTO (WEBHOOK)
// =====================================================

// Função para copiar o código Pix
async function copiarPix() {
    const pixCopiaCola = document.getElementById('pixCopiaCola');
    if (!pixCopiaCola) return;
    
    try {
        await navigator.clipboard.writeText(pixCopiaCola.value);
        alert('Código Pix copiado com sucesso!');
    } catch (err) {
        // Fallback para navegadores mais antigos
        pixCopiaCola.select();
        document.execCommand('copy');
        alert('Código Pix copiado com sucesso!');
    }
}

// Função para exibir o status do pagamento
function exibirStatusPagamento(status, gatewayStatus) {
    const container = document.getElementById('statusPagamentoContainer');
    const badge = document.getElementById('statusPagamentoBadge');
    const descricao = document.getElementById('statusPagamentoDescricao');
    
    if (!container || !badge || !descricao) return;
    
    container.style.display = 'block';
    
    const statusConfig = {
        'pago': { 
            cor: '#28a745', 
            texto: '✅ Pago', 
            descricao: 'Seu pagamento foi confirmado e o pedido está sendo processado.' 
        },
        'andamento': { 
            cor: '#ffc107', 
            texto: '⏳ Aguardando Pagamento', 
            descricao: 'Aguardando a confirmação do pagamento.' 
        },
        'vencido': { 
            cor: '#dc3545', 
            texto: '❌ Vencido', 
            descricao: 'O pagamento não foi realizado até a data de vencimento.' 
        },
        'cancelado': { 
            cor: '#6c757d', 
            texto: '🚫 Cancelado', 
            descricao: 'O pagamento foi cancelado ou recusado.' 
        },
        'estornado': { 
            cor: '#fd7e14', 
            texto: '💸 Estornado', 
            descricao: 'O pagamento foi estornado. O valor será devolvido conforme a política da operadora.' 
        },
        'chargeback': { 
            cor: '#dc3545', 
            texto: '⚠️ Chargeback', 
            descricao: 'Há uma disputa de chargeback em andamento. Entre em contato com o suporte.' 
        }
    };
    
    const config = statusConfig[status] || statusConfig['andamento'];
    
    badge.style.background = config.cor;
    badge.style.color = '#fff';
    badge.textContent = config.texto;
    descricao.textContent = config.descricao;
}

// Função para verificar status periodicamente (polling como fallback)
async function verificarStatusPedido(numeroPedido) {
    try {
        const resposta = await fetch(`${API_CARRINHO}/api/pedidos/${numeroPedido}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!resposta.ok) throw new Error('Erro ao buscar status');
        
        const dados = await resposta.json();
        
        if (dados && dados.status) {
            exibirStatusPagamento(dados.status, dados.gateway_status);
        }
    } catch (erro) {
        console.error('Erro ao verificar status do pedido:', erro);
    }
}

// Inicia o monitoramento após finalizar o pedido
function iniciarMonitoramentoPagamento(numeroPedido) {
    // Verifica imediatamente
    verificarStatusPedido(numeroPedido);
    
    // Verifica a cada 10 segundos por 5 minutos (30 verificações)
    let tentativas = 0;
    const maxTentativas = 30;
    
    const intervalo = setInterval(() => {
        tentativas++;
        verificarStatusPedido(numeroPedido);
        
        // Para após 5 minutos ou se o status for 'pago'
        if (tentativas >= maxTentativas) {
            clearInterval(intervalo);
        }
    }, 10000); // 10 segundos
    
    return intervalo;
}

// =====================================================
// INTEGRAÇÃO COM O FLUXO DE PAGAMENTO EXISTENTE
// =====================================================

// Após o pagamento Pix ser gerado, exibe o status e inicia o monitoramento
if (typeof finalizarCompraPix === 'function') {
    const finalizarCompraPixOriginal = finalizarCompraPix;
    
    finalizarCompraPix = async function() {
        try {
            const resultado = await finalizarCompraPixOriginal();
            
            // Se o pagamento foi criado com sucesso
            if (resultado && resultado.numeroPedido) {
                // Exibe o status inicial
                exibirStatusPagamento('andamento', 'PENDING');
                
                // Inicia o monitoramento
                iniciarMonitoramentoPagamento(resultado.numeroPedido);
            }
            
            return resultado;
        } catch (erro) {
            console.error('Erro ao finalizar compra Pix:', erro);
            throw erro;
        }
    };
}

