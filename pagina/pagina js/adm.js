/*==================================================
                ELEMENTOS
==================================================*/

const menuItems = document.querySelectorAll(".menu-item");

const sections = document.querySelectorAll(".admin-section");

const btnLogout = document.querySelector(".logout");

const btnSave = document.querySelector(".btn-save");

const btnAdd = document.querySelectorAll(".btn-add");

const modalProduto = document.getElementById("modalProduto");

const formProduto = document.getElementById("formProduto");

const fecharModalProduto = document.getElementById(
    "fecharModalProduto"
);

const cancelarProduto = document.getElementById(
    "cancelarProduto"
);


/*==================================================
                FUNÇÕES
==================================================*/

function abrirSecao(nomeSecao){

    sections.forEach(secao =>{

        secao.classList.remove("active");

    });

    const secaoSelecionada = document.getElementById(nomeSecao);

    if(secaoSelecionada){

        secaoSelecionada.classList.add("active");

    }

    menuItems.forEach(item =>{

        item.classList.remove("active");

        if(item.dataset.section === nomeSecao){

            item.classList.add("active");

        }

    });

}


/*==================================================
                ANIMAÇÃO
==================================================*/

function mostrarSecao(nomeSecao){

    abrirSecao(nomeSecao);

    const secao = document.getElementById(nomeSecao);

    if(secao){

        secao.style.opacity = "0";

        secao.style.transform = "translateY(20px)";

        setTimeout(()=>{

            secao.style.opacity = "1";

            secao.style.transform = "translateY(0)";

        },100);

    }

}
/*==================================================
                    EVENTOS
==================================================*/

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        const secao = item.dataset.section;

        if (!secao) return;

        mostrarSecao(secao);

    });

});


if (btnLogout) {

    btnLogout.addEventListener("click", () => {

        const confirmar = confirm("Deseja realmente sair do painel administrativo?");

        if (confirmar) {

            // Alterar futuramente para a página de login
            window.location.href = "login.html";

        }

    });

}


if (btnSave) {

    btnSave.addEventListener("click", () => {

        alert("Configurações salvas com sucesso!");

    });

}

 /* ====================
    ADICIONAR PRODUTOS
    ====================*/

btnAdd.forEach(botao => {
    botao.addEventListener("click", () => {
        const textoBotao = botao.textContent.trim();

        if (textoBotao.includes("Novo Produto")) {
            modalProduto.classList.add("aberto");
        }

        if (textoBotao.includes("Nova Categoria")) {
            alert("Cadastro de categoria em desenvolvimento.");
        }
    });
});

function fecharModal() {
    modalProduto.classList.remove("aberto");
    formProduto.reset();
}

fecharModalProduto.addEventListener(
    "click",
    fecharModal
);

cancelarProduto.addEventListener(
    "click",
    fecharModal
);

modalProduto.addEventListener("click", event => {
    if (event.target === modalProduto) {
        fecharModal();
    }
});

/*==================================================
                PRODUTOS
==================================================*/

let produtosAdmin = JSON.parse(
    localStorage.getItem("produtosAdmin")
) || [
    {
        id: 1,
        nome: "MS 162",
        codigo: "MS162",
        categoria: "motosserras",
        preco: 1299.90,
        estoque: "Em estoque",
        imagem: "../pagina/imagens/produtos/motosserras/ms162.png"
    },
    {
        id: 2,
        nome: "MS 170",
        codigo: "MS170",
        categoria: "motosserras",
        preco: 1799.90,
        estoque: "Em estoque",
        imagem: "../pagina/imagens/produtos/motosserras/ms170.png"
    },
    {
        id: 3,
        nome: "MS 172",
        codigo: "MS172",
        categoria: "motosserras",
        preco: 1999.90,
        estoque: "Em estoque",
        imagem: "../pagina/imagens/produtos/motosserras/ms172.png"
    },
    {
        id: 4,
        nome: "MS 180",
        codigo: "MS180",
        categoria: "motosserras",
        preco: 2299.90,
        estoque: "Em estoque",
        imagem: "../pagina/imagens/produtos/motosserras/ms180.png"
    },
    {
        id: 5,
        nome: "MS 182",
        codigo: "MS182",
        categoria: "motosserras",
        preco: 2499.90,
        estoque: "Em estoque",
        imagem: "../pagina/imagens/produtos/motosserras/ms182.png"
    }
];

function salvarProdutos() {
    localStorage.setItem(
        "produtosAdmin",
        JSON.stringify(produtosAdmin)
    );
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function renderizarProdutos() {
    const listaProdutos = document.getElementById(
        "listaProdutos"
    );

    const totalProdutos = document.getElementById(
        "totalProdutos"
    );

    if (!listaProdutos) {
        return;
    }

    listaProdutos.innerHTML = "";

    produtosAdmin.forEach(produto => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>
                <img
                    src="${produto.imagem}"
                    alt="${produto.nome}"
                    class="produto-imagem-tabela">
            </td>

            <td>${produto.nome}</td>

            <td>${produto.codigo}</td>

            <td>${produto.categoria}</td>

            <td>${formatarMoeda(produto.preco)}</td>

            <td>${produto.estoque}</td>

            <td>
                <span class="status-ativo">
                    Ativo
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="btn-excluir-produto"
                    data-id="${produto.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        listaProdutos.appendChild(linha);
    });

    if (totalProdutos) {
        totalProdutos.textContent = produtosAdmin.length;
    }
}

formProduto.addEventListener("submit", event => {
    event.preventDefault();

    const nome = document.getElementById(
        "nomeProduto"
    ).value.trim();

    const codigo = document.getElementById(
        "codigoProduto"
    ).value.trim();

    const categoria = document.getElementById(
        "categoriaProduto"
    ).value;

    const preco = Number(
        document.getElementById(
            "precoProduto"
        ).value
    );

    const estoque = document.getElementById(
        "estoqueProduto"
    ).value;

    const imagem = document.getElementById(
        "imagemProduto"
    ).value.trim();

    const novoProduto = {
        id: Date.now(),
        nome,
        codigo,
        categoria,
        preco,
        estoque,
        imagem
    };

    produtosAdmin.push(novoProduto);

    salvarProdutos();
    renderizarProdutos();
    fecharModal();

    alert("Produto cadastrado com sucesso!");
});

document.addEventListener("click", event => {
    const botaoExcluir = event.target.closest(
        ".btn-excluir-produto"
    );

    if (!botaoExcluir) {
        return;
    }

    const id = Number(botaoExcluir.dataset.id);

    const confirmar = confirm(
        "Deseja realmente excluir este produto?"
    );

    if (!confirmar) {
        return;
    }

    produtosAdmin = produtosAdmin.filter(produto => {
        return produto.id !== id;
    });

    salvarProdutos();
    renderizarProdutos();
});
/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    mostrarSecao("dashboard");

    renderizarProdutos();

});