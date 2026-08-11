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
            AUTENTICAÇÃO DO ADMIN
==================================================*/

const token = localStorage.getItem("tokenCial");

if (!token) {
  window.location.href = "../login/login.html"; // ajuste o caminho conforme sua pasta de login
}

/*==================================================
            UPLOAD DE IMAGEM (DRAG & DROP)
==================================================*/

const dropArea = document.getElementById("dropArea");
const inputImagem = document.getElementById("arquivoImagem");
const previewImagem = document.getElementById("previewImagem");

// Arquivo selecionado 
let arquivoSelecionado = null;

// Clique na área abre o input file
if (dropArea && inputImagem) {
  dropArea.addEventListener("click", () => {
    inputImagem.click();
  });

  // Quando escolhe arquivo pelo input
  inputImagem.addEventListener("change", () => {
    if (inputImagem.files && inputImagem.files[0]) {
      handleFile(inputImagem.files[0]);
    }
  });

  // Evita comportamento padrão do navegador
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Estilo quando arrasta por cima
  ["dragenter", "dragover"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add("ativo");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove("ativo");
    });
  });

  // Quando solta o arquivo na área
  dropArea.addEventListener("drop", e => {
    const arquivos = e.dataTransfer.files;
    if (arquivos && arquivos[0]) {
      handleFile(arquivos[0]);
    }
  });
}

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Envie somente imagens.");
    return;
  }

  arquivoSelecionado = file;

  // Preview
  const reader = new FileReader();
  reader.onload = () => {
    previewImagem.src = reader.result;
    previewImagem.style.display = "block";
  };
  reader.readAsDataURL(file);
}

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
      // Limpa token e usuário
      localStorage.removeItem("tokenCial");
      localStorage.removeItem("usuarioCial");
      window.location.href = "../login/login.html";
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

/*==================================================
                PRODUTOS - VIA API
==================================================*/

let produtosAdmin = [];

// Ajuste se sua API rodar em outra porta/origem
const API_BASE = "http://localhost:4000"; 

async function carregarProdutosAdmin() {
  try {
    const res = await fetch(`${API_BASE}/admin/produtos`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

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
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
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
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
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

  const imagemTexto = document.getElementById("imagemProduto")
    ? document.getElementById("imagemProduto").value.trim()
    : "";

  let imagemUrl = imagemTexto;

  try {
    if (arquivoSelecionado) {
      const formData = new FormData();
      formData.append("imagem", arquivoSelecionado);

      const resUpload = await fetch(`${API_BASE}/upload-imagem`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const jsonUpload = await resUpload.json();
      if (!jsonUpload.ok) {
        throw new Error(jsonUpload.erro || "Erro no upload da imagem");
      }

      imagemUrl = jsonUpload.url;
    }

    const novoProduto = {
      nome,
      codigo,
      categoria,
      preco,
      estoque,
      imagem: imagemUrl
    };

    await criarProduto(novoProduto);
    await carregarProdutosAdmin();
    fecharModal();
    alert("Produto cadastrado com sucesso!");

    arquivoSelecionado = null;
    if (previewImagem) {
      previewImagem.style.display = "none";
      previewImagem.src = "";
    }
    if (inputImagem) {
      inputImagem.value = "";
    }
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
    await carregarProdutosAdmin();
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
  carregarProdutosAdmin();
});