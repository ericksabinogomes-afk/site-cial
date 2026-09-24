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

    document.querySelectorAll("[data-config]").forEach(elemento => {
        const campo = elemento.dataset.config;
        const valor = CONFIG_SITE[campo];
        if (!valor) return;
        elemento.textContent = valor;
    });

    document.querySelectorAll("[data-config-href]").forEach(elemento => {
        const campo = elemento.dataset.configHref;
        const valor = CONFIG_SITE[campo];
        if (!valor) return;
        elemento.href = valor;
    });

    if (CONFIG_SITE.nome_empresa) {
        document.title = `${CONFIG_SITE.nome_empresa} | Loja Autorizada STIHL`;
    }
}

/*==========================================================
    CARREGAR CONFIGURAÇÕES
==========================================================*/


// URL central da API
const API_BASE_URL = window.CIAL_API_URL || "http://localhost:4000";

async function carregarConfiguracoesSite() {
    try {
     const resposta = await fetch(`${API_BASE_URL}/configuracoes`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as configurações.");
        }

        const resultado = await resposta.json();

        if (resultado.ok && resultado.data) {
            Object.assign(CONFIG_SITE, resultado.data);
        }

        console.log("Configurações do site carregadas:", CONFIG_SITE);

        aplicarConfiguracoesSite();
        return CONFIG_SITE;

    } catch (erro) {
        console.error("Erro ao carregar configurações do site:", erro);
        return CONFIG_SITE;
    }
}

const CONFIG_SITE_PRONTO = carregarConfiguracoesSite();

/*==================================================
        CARDS DE PRODUTOS - SISTEMA GLOBAL
==================================================*/

function escaparHTML(valor) {
    if (valor === undefined || valor === null) return "";
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatarPrecoCard(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function obterEspecificacoesCard(produto) {
    if (!produto) return [];
    let especificacoes = produto.especificacoes;

    if (typeof especificacoes === "string") {
        try {
            especificacoes = JSON.parse(especificacoes);
        } catch (erro) {
            console.warn("Não foi possível interpretar as especificações:", produto.nome, especificacoes);
            return [];
        }
    }

    if (!especificacoes || typeof especificacoes !== "object" || Array.isArray(especificacoes)) {
        return [];
    }

    return Object.entries(especificacoes)
        .filter(([nome, valor]) => valor !== undefined && valor !== null && String(valor).trim() !== "")
        .slice(0, 3);
}

function formatarNomeEspecificacao(nome) {
    if (!nome) return "";
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

    if (nomes[nome]) return nomes[nome];

    return String(nome)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

function criarCardProdutoGlobal(produto) {
    if (!produto) return "";

    const favoritado = Array.isArray(estado?.favoritos) && estado.favoritos.includes(Number(produto.id));
    const especificacoes = obterEspecificacoesCard(produto);
    const imagem = produto.imagem || "imagens/produto-sem-imagem.png";
    const categoria = produto.categoria || "Produto";

    const htmlEspecificacoes = especificacoes.length > 0
        ? `<div class="card-produto-especificacoes">
            ${especificacoes.map(([nome, valor]) => `
                <div class="card-produto-especificacao">
                    <span class="card-especificacao-nome">${escaparHTML(formatarNomeEspecificacao(nome))}</span>
                    <span class="card-especificacao-valor">${escaparHTML(valor)}</span>
                </div>
            `).join("")}
           </div>`
        : "";

    const parcelamento = produto.parcela && String(produto.parcela).trim() !== ""
        ? `<div class="card-produto-parcela">${escaparHTML(produto.parcela)}</div>`
        : "";

    return `
        <article class="card-produto" data-id="${Number(produto.id)}">
            <div class="card-produto-imagem">
                ${produto.selo ? `<span class="card-produto-selo">${escaparHTML(produto.selo)}</span>` : ""}
                <button type="button" class="btn-favorito ${favoritado ? "ativo" : ""}" data-id="${Number(produto.id)}" aria-label="Favoritar produto">
                    <i class="${favoritado ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>
                <img src="${escaparHTML(imagem)}" alt="${escaparHTML(produto.nome)}" loading="lazy">
            </div>
            <div class="card-produto-conteudo">
                <span class="card-produto-categoria">${escaparHTML(categoria)}</span>
                <h3 class="card-produto-nome">${escaparHTML(produto.nome)}</h3>
                ${htmlEspecificacoes}
                <div class="card-produto-preco">${formatarPrecoCard(produto.preco)}</div>
                ${parcelamento}
                <div class="card-produto-acoes">
                    <button type="button" class="btn-ver" data-id="${Number(produto.id)}">
                        <i class="fa-solid fa-eye"></i> Ver produto
                    </button>
                    <button type="button" class="btn-carrinho" data-id="${Number(produto.id)}">
                        <i class="fa-solid fa-cart-shopping"></i> Adicionar ao carrinho
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderizarProdutos() {
    const grid = document.getElementById("gridProdutos");
    if (!grid) return;

    const produtos = Array.isArray(estado?.produtosFiltrados) ? estado.produtosFiltrados : [];

    if (produtos.length === 0) {
        grid.innerHTML = `
            <div class="produtos-vazio">
                <i class="fa-solid fa-box-open"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente alterar os filtros ou realizar outra pesquisa.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = produtos.map(criarCardProdutoGlobal).join("");
    sincronizarBotoesCarrinho();
}

/*==========================================================
    SISTEMA GLOBAL DO CARRINHO (FUNÇÕES NO ESCOPO GLOBAL)
==========================================================*/

async function verificarProdutoNoCarrinho(produtoId) {
    if (typeof obterCarrinhoAtual !== "function") return false;
    try {
        const carrinho = await obterCarrinhoAtual();
        if (!Array.isArray(carrinho)) return false;
        return carrinho.some(item => Number(item.produto_id) === Number(produtoId));
    } catch (erro) {
        console.error("Erro ao verificar carrinho:", erro);
        return false;
    }
}

function atualizarBotaoCarrinhoGlobal(botao, produtoNoCarrinho, estadoTemporario = "") {
    if (!botao) return;

    if (estadoTemporario === "adicionado") {
        botao.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado ao carrinho';
        botao.classList.add("adicionado");
        botao.classList.remove("remover");
        return;
    }

    if (estadoTemporario === "removido") {
        botao.innerHTML = '<i class="fa-solid fa-check"></i> Removido do carrinho';
        botao.classList.remove("adicionado");
        botao.classList.remove("remover");
        return;
    }

    if (produtoNoCarrinho) {
        botao.innerHTML = '<i class="fa-solid fa-trash"></i> Remover do carrinho';
        botao.classList.add("remover");
        botao.classList.remove("adicionado");
        return;
    }

    botao.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Adicionar ao carrinho';
    botao.classList.remove("remover", "adicionado");
}

function mostrarFeedbackCarrinho(produto, foiAdicionado) {
    const botoes = document.querySelectorAll(`.btn-carrinho[data-id="${Number(produto.id)}"]`);
    botoes.forEach(botao => {
        atualizarBotaoCarrinhoGlobal(botao, foiAdicionado, foiAdicionado ? "adicionado" : "removido");
    });

    const botaoModal = document.querySelector("[data-modal-carrinho]");
    if (botaoModal && Number(botaoModal.dataset.id) === Number(produto.id)) {
        atualizarBotaoCarrinhoGlobal(botaoModal, foiAdicionado, foiAdicionado ? "adicionado" : "removido");
    }

    setTimeout(() => {
        sincronizarBotoesCarrinho(produto);
    }, 1500);
}

async function sincronizarBotoesCarrinho(produto = null) {
    if (produto) {
        const estaNoCarrinho = await verificarProdutoNoCarrinho(produto.id);
        document.querySelectorAll(`.btn-carrinho[data-id="${Number(produto.id)}"]`).forEach(botao => {
            atualizarBotaoCarrinhoGlobal(botao, estaNoCarrinho);
        });

        const botaoModal = document.querySelector("[data-modal-carrinho]");
        if (botaoModal && Number(botaoModal.dataset.id) === Number(produto.id)) {
            atualizarBotaoCarrinhoGlobal(botaoModal, estaNoCarrinho);
        }
        return;
    }

    const botoes = document.querySelectorAll(".btn-carrinho");
    for (const botao of botoes) {
        const id = Number(botao.dataset.id);
        if (!id) continue;
        const estaNoCarrinho = await verificarProdutoNoCarrinho(id);
        atualizarBotaoCarrinhoGlobal(botao, estaNoCarrinho);
    }
}

async function alternarCarrinhoProduto(produto, botao) {
    if (!produto || !botao) return;
    botao.disabled = true;

    try {
        const estaNoCarrinho = await verificarProdutoNoCarrinho(produto.id);

        if (estaNoCarrinho) {
            if (typeof removerDoCarrinho !== "function") {
                console.warn("Função removerDoCarrinho não encontrada.");
                return;
            }
            const sucesso = await removerDoCarrinho(Number(produto.id));
            if (sucesso) mostrarFeedbackCarrinho(produto, false);
            return;
        }

        if (typeof adicionarAoCarrinho !== "function") {
            console.warn("Função adicionarAoCarrinho não encontrada.");
            return;
        }
        const sucesso = await adicionarAoCarrinho(produto);
        if (sucesso) mostrarFeedbackCarrinho(produto, true);

    } finally {
        botao.disabled = false;
    }
}

/*==========================================================
    MODAL GLOBAL DE PRODUTO
==========================================================*/

async function abrirModalProduto(id) {
    const produto = estado?.produtos?.find(p => Number(p.id) === Number(id));

    if (!produto) {
        console.warn("Produto não encontrado:", id);
        return;
    }

    const modal = document.getElementById("modalProdutoGlobal");
    if (!modal) {
        console.warn("Modal global de produto não encontrado no HTML.");
        return;
    }

    const nome = produto.nome || "Produto";
    const descricao = produto.descricao || "";
    const preco = formatarPrecoCard(produto.preco);
    let especificacoes = produto.especificacoes || {};

    if (typeof especificacoes === "string") {
        try {
            especificacoes = JSON.parse(especificacoes);
        } catch (erro) {
            especificacoes = {};
        }
    }

    if (!especificacoes || typeof especificacoes !== "object" || Array.isArray(especificacoes)) {
        especificacoes = {};
    }

    const categoria = produto.categoria || "";
    const elementoNome = modal.querySelector("[data-modal-nome]");
    const elementoDescricao = modal.querySelector("[data-modal-descricao]");
    const elementoPreco = modal.querySelector("[data-modal-preco]");
    const elementoImagem = modal.querySelector("[data-modal-imagem]");
    const elementoCategoria = modal.querySelector("[data-modal-categoria]");
    const containerMiniaturas = modal.querySelector("[data-modal-miniaturas]");

    if (elementoNome) elementoNome.textContent = nome;
    if (elementoDescricao) elementoDescricao.textContent = descricao;
    if (elementoPreco) elementoPreco.textContent = preco;
    if (elementoCategoria) elementoCategoria.textContent = categoria;

    /* GALERIA DE IMAGENS */
    const imagensProduto = [
        produto.imagem,
        ...(Array.isArray(produto.imagens) ? produto.imagens : [])
    ].filter(Boolean);

    const imagensUnicas = [...new Set(imagensProduto)];
    if (imagensUnicas.length === 0) imagensUnicas.push("IMAGENS/produto-sem-imagem.png");

    if (elementoImagem) {
        elementoImagem.src = imagensUnicas[0];
        elementoImagem.alt = nome;
    }

    if (containerMiniaturas) {
        containerMiniaturas.innerHTML = "";
        imagensUnicas.forEach((urlImagem, indice) => {
            const miniatura = document.createElement("button");
            miniatura.type = "button";
            miniatura.className = "modal-produto-miniatura" + (indice === 0 ? " ativa" : "");
            miniatura.innerHTML = `<img src="${escaparHTML(urlImagem)}" alt="${escaparHTML(nome)} — imagem ${indice + 1}">`;

            miniatura.addEventListener("click", () => {
                if (elementoImagem) elementoImagem.src = urlImagem;
                containerMiniaturas.querySelectorAll(".modal-produto-miniatura").forEach(item => item.classList.remove("ativa"));
                miniatura.classList.add("ativa");
            });

            containerMiniaturas.appendChild(miniatura);
        });
    }

    /* ESPECIFICAÇÕES TÉCNICAS */
    const containerEspecificacoes = modal.querySelector("[data-modal-especificacoes]");
    if (containerEspecificacoes) {
        containerEspecificacoes.innerHTML = "";
        Object.entries(especificacoes).forEach(([chave, valor]) => {
            if (valor === null || valor === undefined || String(valor).trim() === "") return;

            const item = document.createElement("div");
            item.className = "modal-especificacao";
            item.innerHTML = `
                <span class="modal-especificacao-nome">${escaparHTML(formatarNomeEspecificacao(chave))}</span>
                <span class="modal-especificacao-valor">${escaparHTML(String(valor))}</span>
            `;
            containerEspecificacoes.appendChild(item);
        });

        if (!containerEspecificacoes.children.length) {
            containerEspecificacoes.innerHTML = `<div class="modal-sem-especificacoes">Nenhuma especificação técnica cadastrada.</div>`;
        }
    }

    /* BOTÃO DO CARRINHO NO MODAL */
    const botaoCarrinho = modal.querySelector("[data-modal-carrinho]");
    if (botaoCarrinho) {
        botaoCarrinho.dataset.id = produto.id;
        sincronizarBotoesCarrinho(produto);
        botaoCarrinho.onclick = async function(event) {
            event.preventDefault();
            event.stopPropagation();
            await alternarCarrinhoProduto(produto, botaoCarrinho);
        };
    }

    /* BOTÃO FAVORITO NO MODAL */
    const botaoFavorito = modal.querySelector("[data-modal-favorito]");
    if (botaoFavorito) {
        const favoritado = Array.isArray(estado?.favoritos) && estado.favoritos.includes(Number(produto.id));
        const icone = botaoFavorito.querySelector("i");

        botaoFavorito.dataset.id = produto.id;
        botaoFavorito.classList.toggle("ativo", favoritado);

        if (icone) {
            icone.classList.toggle("fa-solid", favoritado);
            icone.classList.toggle("fa-regular", !favoritado);
        }

        botaoFavorito.onclick = async function(event) {
            event.preventDefault();
            event.stopPropagation();

            const id = Number(produto.id);
            if (typeof alternarFavorito === "function") {
                await alternarFavorito(id);
            }

            const agoraFavoritado = estado?.favoritos?.includes(id);
            botaoFavorito.classList.toggle("ativo", agoraFavoritado);

            if (icone) {
                icone.classList.toggle("fa-solid", agoraFavoritado);
                icone.classList.toggle("fa-regular", !agoraFavoritado);
            }
        };
    }

    modal.classList.add("ativo");
    document.body.classList.add("modal-aberto");
}

function fecharModalProduto() {
    const modal = document.getElementById("modalProdutoGlobal");
    if (!modal) return;
    modal.classList.remove("ativo");
    document.body.classList.remove("modal-aberto");
}

/*==========================================================
    LISTENERS DE EVENTOS
==========================================================*/

document.addEventListener("click", function (event) {
    const botao = event.target.closest(".btn-ver");
    if (!botao) return;

    const id = botao.dataset.id;
    if (!id) {
        console.warn("Botão Ver produto sem data-id.");
        return;
    }

    abrirModalProduto(id);
});

document.addEventListener("click", function (event) {
    const modal = document.getElementById("modalProdutoGlobal");
    if (!modal) return;

    if (event.target.matches("[data-modal-fechar]") || event.target === modal) {
        fecharModalProduto();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") fecharModalProduto();
});

document.addEventListener("click", async function (event) {
    const botao = event.target.closest(".btn-carrinho");
    if (!botao) return;

    event.preventDefault();
    event.stopPropagation();

    const id = Number(botao.dataset.id);
    if (!id) {
        console.warn("Botão do carrinho sem data-id.");
        return;
    }

    const produto = estado?.produtos?.find(p => Number(p.id) === id);
    if (!produto) {
        console.warn("Produto não encontrado para o carrinho:", id);
        return;
    }

    await alternarCarrinhoProduto(produto, botao);
});