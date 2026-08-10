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
const fecharModalProduto = document.getElementById("fecharModalProduto");
const cancelarProduto = document.getElementById("cancelarProduto");

/*==================================================
                FUNÇÕES
==================================================*/

function abrirSecao(nomeSecao) {
  sections.forEach(secao => {
    secao.classList.remove("active");
  });

  const secaoSelecionada = document.getElementById(nomeSecao);
  if (secaoSelecionada) {
    secaoSelecionada.classList.add("active");
  }

  menuItems.forEach(item => {
    item.classList.remove("active");
    if (item.dataset.section === nomeSecao) {
      item.classList.add("active");
    }
  });
}

/*==================================================
                ANIMAÇÃO
==================================================*/

function mostrarSecao(nomeSecao) {
  abrirSecao(nomeSecao);
  const secao = document.getElementById(nomeSecao);
  if (secao) {
    secao.style.opacity = "0";
    secao.style.transform = "translateY(20px)";
    setTimeout(() => {
      secao.style.opacity = "1";
      secao.style.transform = "translateY(0)";
    }, 100);
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
    const confirmar = confirm(
      "Deseja realmente sair do painel administrativo?"
    );
    if (confirmar) {
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

fecharModalProduto.addEventListener("click", fecharModal);
cancelarProduto.addEventListener("click", fecharModal);

modalProduto.addEventListener("click", event => {
  if (event.target === modalProduto) {
    fecharModal();
  }
});

/*==================================================
                PRODUTOS - VIA API
==================================================*/

let produtosAdmin = [];

// Ajuste se sua API rodar em outra porta/origem
const API_BASE = "http://localhost:4000"; 

async function carregarProdutosAdmin() {
  try {
    const res = await fetch(`${API_BASE}/admin/produtos`);
    const json = await res.json();

    if (!json.ok) {
      throw new Error(json.erro || "Erro ao carregar produtos");
    }

    produtosAdmin = json.data || [];
    renderizarProdutos();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao carregar produtos. Verifique o console.");
  }
}

async function criarProduto(dados) {
  const res = await fetch(`${API_BASE}/admin/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  const texto = await res.text();
  console.log("Resposta /admin/produtos:", res.status, texto);

  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    throw new Error(`Resposta não-JSON: ${texto}`);
  }

  if (!json.ok) {
    throw new Error(json.erro || "Erro ao criar produto");
  }

  return json.data;
}

async function excluirProduto(id) {
  const res = await fetch(`${API_BASE}/admin/produtos/${id}`, {
    method: "DELETE"
  });

  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.erro || "Erro ao excluir produto");
  }
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function renderizarProdutos() {
  const listaProdutos = document.getElementById("listaProdutos");
  const totalProdutos = document.getElementById("totalProdutos");

  if (!listaProdutos) {
    return;
  }

  listaProdutos.innerHTML = "";

  produtosAdmin.forEach(produto => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>
        <img
          src="${produto.imagem || ""}"
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

/* Submit do formulário (criar produto) */
formProduto.addEventListener("submit", async event => {
  event.preventDefault();

  const nome = document.getElementById("nomeProduto").value.trim();
  const codigo = document.getElementById("codigoProduto").value.trim();
  const categoria = document.getElementById("categoriaProduto").value;
  const preco = Number(
    document.getElementById("precoProduto").value
  );
  const estoque = document.getElementById("estoqueProduto").value;
  const imagem = document.getElementById("imagemProduto").value.trim();

  const novoProduto = {
    nome,
    codigo,
    categoria,
    preco,
    estoque,
    imagem
  };

  try {
    await criarProduto(novoProduto);
    await carregarProdutosAdmin(); // recarrega a tabela
    fecharModal();
    alert("Produto cadastrado com sucesso!");
  } catch (erro) {
    console.error(erro);
    alert("Erro ao cadastrar produto. Verifique o console.");
  }
});

/* Excluir produto */
document.addEventListener("click", async event => {
  const botaoExcluir = event.target.closest(".btn-excluir-produto");
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

  try {
    await excluirProduto(id);
    await carregarProdutosAdmin(); // recarrega a tabela
  } catch (erro) {
    console.error(erro);
    alert("Erro ao excluir produto. Verifique o console.");
  }
});

/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
  mostrarSecao("dashboard");
  carregarProdutosAdmin(); // carrega do back/Supabase
});