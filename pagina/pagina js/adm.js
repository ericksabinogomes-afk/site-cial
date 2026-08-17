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
let arquivosSelecionados = [];

// Clique na área abre o input file
if (dropArea && inputImagem) {
  dropArea.addEventListener("click", () => {
    inputImagem.click();
  });

 inputImagem.addEventListener("change", () => {

    if (!inputImagem.files || inputImagem.files.length === 0) {
        return;
    }

    for (const novoArquivo of inputImagem.files) {

        if (!novoArquivo.type.startsWith("image/")) {
            continue;
        }

        const jaExiste = arquivosSelecionados.some(arquivo =>
            arquivo.name === novoArquivo.name &&
            arquivo.size === novoArquivo.size &&
            arquivo.lastModified === novoArquivo.lastModified
        );

        if (!jaExiste) {
            arquivosSelecionados.push(novoArquivo);
        }
    }

    mostrarPreviews(arquivosSelecionados);

    // Limpa somente o input.
    // NÃO limpa arquivosSelecionados.
    inputImagem.value = "";
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

    const arquivos =
        Array.from(e.dataTransfer.files);

    if (!arquivos.length) {
        return;
    }

    arquivos.forEach(novoArquivo => {

    if (!novoArquivo.type.startsWith("image/")) {
        return;
    }

    const jaExiste = arquivosSelecionados.some(arquivo =>
        arquivo.name === novoArquivo.name &&
        arquivo.size === novoArquivo.size &&
        arquivo.lastModified === novoArquivo.lastModified
    );

    if (!jaExiste) {
        arquivosSelecionados.push(novoArquivo);
    }

});

    mostrarPreviews(arquivosSelecionados);

});
}

function mostrarPreviews(arquivos) {

    const container =
        document.getElementById("previewImagens");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    arquivos.forEach((file, index) => {

        if (!file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "preview-imagem-item";

            if (index === 0) {
                wrapper.classList.add("principal");
            }

            wrapper.innerHTML = `

                <button
                    type="button"
                    class="preview-imagem-remover"
                    title="Remover imagem"
                >
                    ×
                </button>

                <img
                    src="${reader.result}"
                    alt="Prévia ${index + 1}"
                >

                <span>
                    ${
                        index === 0
                            ? "PRINCIPAL"
                            : `FOTO ${index + 1}`
                    }
                </span>

            `;

            const botaoRemover =
                wrapper.querySelector(
                    ".preview-imagem-remover"
                );

            botaoRemover.addEventListener(
                "click",
                () => {

                    arquivosSelecionados =
                        arquivosSelecionados.filter(
                            (_, i) => i !== index
                        );

                    mostrarPreviews(
                        arquivosSelecionados
                    );

                }
            );

            container.appendChild(wrapper);

        };

        reader.readAsDataURL(file);

    });
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
        FECHAR MODAL DE PRODUTO
==================================================*/

if (fecharModalProduto) {
    fecharModalProduto.addEventListener("click", () => {
        fecharModal();
    });
}

if (cancelarProduto) {
    cancelarProduto.addEventListener("click", () => {
        fecharModal();
    });
}

/*==================================================
                PRODUTOS - VIA API
==================================================*/

let produtosAdmin = [];

// Ajuste se sua API rodar em outra porta/origem
const API_BASE = "http://localhost:4000"; 

/*==================================================
        CATEGORIAS DE BOMBAS
==================================================*/

const categoriaProduto =
    document.getElementById("categoriaProduto");



const nomesCategoriasBombas = {
  "bombas-centrifugas": "Bombas Centrífugas",
  "bombas-perifericas": "Bombas Periféricas",
  "bombas-submersas": "Bombas Submersas",
  "bombas-submersiveis": "Bombas Submersíveis",
  "bombas-autoaspirantes": "Bombas Autoaspirantes",
  "bombas-injetoras": "Bombas Injetoras",
  "bombas-motobombas-irrigacao": "Motobombas para Irrigação",
  "bombas-piscina": "Bombas para Piscina",
  "bombas-irrigacao": "Bombas para Irrigação",
  "bombas-poco": "Bombas para Poço",
  "bombas-drenagem": "Bombas para Drenagem",
  "bombas-esgoto": "Bombas para Esgoto",
  "bombas-pressurizadores": "Pressurizadores",
  "bombas-sistemas-pressurizacao": "Sistemas de Pressurização",
  "bombas-acessorios": "Acessórios para Bombas"
};



async function carregarProdutosAdmin() {
  try {
    const res = await fetch(`${API_BASE}/admin/produtos`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.status === 403) {
      alert("Acesso negado: seu usuário não tem perfil de administrador.");
      localStorage.removeItem("tokenCial");
      localStorage.removeItem("usuarioCial");
      window.location.href = "../login/login.html";
      return;
    }

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

  const destaque =
    document.getElementById("produtoDestaque").checked;

  const imagemTexto = document.getElementById("imagemProduto")
    ? document.getElementById("imagemProduto").value.trim()
    : "";

let imagemUrl = imagemTexto;
let imagensAdicionais = [];

try {

    if (arquivosSelecionados.length > 0) {

        const formData = new FormData();

        arquivosSelecionados.forEach(file => {

            formData.append("imagens", file);

        });

        const resUpload = await fetch(
            `${API_BASE}/upload-imagens`,
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`
                },

                body: formData
            }
        );

        const jsonUpload = await resUpload.json();

        if (!jsonUpload.ok) {

            throw new Error(
                jsonUpload.erro ||"Erro no upload das imagens"
            );

        }

        const urls = jsonUpload.urls || [];

        /*
         * PRIMEIRA FOTO = PRINCIPAL
         */

        imagemUrl = urls[0] || imagemTexto;

        /*
         * RESTANTE = FOTOS ADICIONAIS
         */
        imagensAdicionais = urls.slice(1);

    }

    const novoProduto = {

    nome,

    codigo,

    categoria,

    preco,

    estoque,

    // FOTO PRINCIPAL
    imagem: imagemUrl,

    // FOTOS ADICIONAIS
    imagens: imagensAdicionais,

    destaque

};

    await criarProduto(novoProduto);
    await carregarProdutosAdmin();
    fecharModal();
    alert("Produto cadastrado com sucesso!");

    arquivosSelecionados = [];

const previewContainer =
    document.getElementById("previewImagens");

if (previewContainer) {
    previewContainer.innerHTML = "";
}

if (inputImagem) {
    inputImagem.value = "";
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
