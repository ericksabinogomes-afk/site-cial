/*==================================================
                ELEMENTOS
==================================================*/

const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".admin-section");
const btnLogout = document.querySelector(".logout");
const btnSave = document.querySelector(".btn-save");
const btnAdd = document.querySelectorAll(".btn-add");
const listaClientes = document.getElementById("listaClientes");
const btnAtualizarUsuarios =document.getElementById("btnAtualizarUsuarios");
const modalProduto = document.getElementById("modalProduto");
const formProduto = document.getElementById("formProduto");
const fecharModalProduto = document.getElementById("fecharModalProduto");
const cancelarProduto = document.getElementById("cancelarProduto");

/*==================================================
            AUTENTICAÇÃO DO ADMIN
==================================================*/

const token = localStorage.getItem("tokenCial");

if (!token) {
  window.location.href = "../cadastro/login.html"; // ajuste o caminho conforme sua pasta de login
}

/*==================================================
            UPLOAD DE IMAGEM (DRAG & DROP)
==================================================*/

const dropArea = document.getElementById("dropArea");
const inputImagem = document.getElementById("arquivoImagem");
const previewImagem = document.getElementById("previewImagens");

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
    // NÃO!! limpa arquivosSelecionados.
    inputImagem.value = "";
});

  // Evitar comportamento padrão do navegador
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

function atualizarPreviewImagem(src) {
  const areaImagem =
    document.querySelector(
      ".preview-card .preview-imagem"
    );

  if (!areaImagem) {
    return;
  }

  if (!src) {
    areaImagem.innerHTML = `
      <span class="preview-sem-imagem">
        <i class="fa-solid fa-image"></i>
        <small>Sem imagem</small>
      </span>
    `;

    return;
  }

  areaImagem.innerHTML = `
    <img
      src="${src}"
      alt="Prévia do produto"
      style="
        width: 100%;
        height: 100%;
        object-fit: contain;
      "
    >
  `;
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

    const reader =
      new FileReader();

    reader.onload = () => {
      if (index === 0) {
        atualizarPreviewImagem(
          reader.result
        );
      }

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

          if (
            arquivosSelecionados.length === 0
          ) {
            atualizarPreviewImagem("");
          }
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
        const secao =
            item.dataset.section;

        if (!secao) {
            return;
        }

        mostrarSecao(secao);

        if (secao === "clientes") {
            carregarUsuarios();
        }
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
      window.location.href = "../cadastro/login.html";
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
      produtoEditandoId = null;
      produtoEditando = null;

      etapaAtualProduto = 1;
      mostrarEtapaProduto(1);

      formProduto.reset();
      
      atualizarPreviewProduto();
      atualizarPreviewImagem("");

      arquivosSelecionados = [];

      const previewContainer =
        document.getElementById("previewImagens");

      if (previewContainer) {
        previewContainer.innerHTML = "";
      }

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

  atualizarPreviewProduto();
  atualizarPreviewImagem("");

  etapaAtualProduto = 1;
  mostrarEtapaProduto(1);

  produtoEditandoId = null;
  produtoEditando = null;

  arquivosSelecionados = [];

  const previewContainer =
    document.getElementById("previewImagens");

  if (previewContainer) {
    previewContainer.innerHTML = "";
  }

  if (inputImagem) {
    inputImagem.value = "";
  }
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


let produtoEditandoId = null;
let produtoEditando = null;

// Ajuste se sua API rodar em outra porta/origem
const API_BASE = "http://localhost:4000"; 

/*==================================================
        CATEGORIAS DE BOMBAS
==================================================*/

const categoriaProduto =
    document.getElementById("categoriaProduto");

/*==================================================
        CAMPOS ESPECÍFICOS DO PRODUTO
==================================================*/

/*==================================================
        CAMPOS ESPECÍFICOS DO PRODUTO
==================================================*/

const camposStihl =
    document.getElementById("camposStihl");

const camposBombas =
    document.getElementById("camposBombas");

const camposIrrigacao =
    document.getElementById("camposIrrigacao");


/*==================================================
        CATEGORIAS STIHL
==================================================*/

const categoriasStihl = [

    "motosserras",
    "rocadeiras",
    "lavadoras",
    "sopradores",
    "podadores",
    "motobombas",
    "motocultivadores",
    "motores-estacionarios",
    "geradores",
    "cortadores-grama",
    "pulverizadores",
    "ferramentas-multifuncionais",
    "motopodas",
    "perfuradores",
    "cortadores-disco",
    "colhedores",
    "tesouras-serrotes-poda",
    "ferramentas-florestais",
    "aspiradores",
    "baterias-carregadores",
    "acessorios-stihl",
    "epi"

];


/*==================================================
        CATEGORIAS BOMBAS
==================================================*/

const categoriasBombas = [

    "bombas-centrifugas",
    "bombas-perifericas",
    "bombas-submersas",
    "bombas-submersiveis",
    "bombas-autoaspirantes",
    "bombas-injetoras",
    "motobombas-irrigacao",
    "bombas-piscina",
    "bombas-irrigacao",
    "bombas-poco",
    "bombas-drenagem",
    "bombas-esgoto",
    "pressurizadores",
    "sistemas-pressurizacao",
    "acessorios-bombas"

];


/*==================================================
        CATEGORIAS IRRIGAÇÃO
==================================================*/

const categoriasIrrigacao = [

    "aspersores",
    "microaspersores",
    "gotejamento",
    "mangueiras-irrigacao",
    "tubos-irrigacao",
    "conexoes-irrigacao",
    "filtros-irrigacao",
    "valvulas-irrigacao"

];


/*==================================================
        ATUALIZAR CAMPOS ESPECÍFICOS
==================================================*/

function atualizarCamposEspecificos(){

    const categoria =
        categoriaProduto.value;


    /* STIHL */

    if(camposStihl){

        camposStihl.style.display =
            categoriasStihl.includes(categoria)
                ? "block"
                : "none";

    }


    /* BOMBAS */

    if(camposBombas){

        camposBombas.style.display =
            categoriasBombas.includes(categoria)
                ? "block"
                : "none";

    }


    /* IRRIGAÇÃO */

    if(camposIrrigacao){

        camposIrrigacao.style.display =
            categoriasIrrigacao.includes(categoria)
                ? "block"
                : "none";

    }

}


/*==================================================
        EVENTO DA CATEGORIA
==================================================*/

if(categoriaProduto){

    categoriaProduto.addEventListener(
        "change",
        atualizarCamposEspecificos
    );

}
/*==================================================
    INICIALIZAR CAMPOS ESPECÍFICOS
==================================================*/

atualizarCamposEspecificos();


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


/*==================================================
  PRÉ-VISUALIZAÇÃO DO PRODUTO
==================================================*/

function atualizarPreviewProduto() {
  const nomeProduto =
    document.getElementById("nomeProduto");

  const categoriaProduto =
    document.getElementById("categoriaProduto");

  const descricaoProduto =
    document.getElementById("descricaoProduto");

  const precoProduto =
    document.getElementById("precoProduto");

  const previewNome =
    document.getElementById("previewNome");

  const previewCategoria =
    document.getElementById("previewCategoria");

  const previewDescricao =
    document.getElementById("previewDescricao");

  const previewPreco =
    document.getElementById("previewPreco");

  if (
    nomeProduto &&
    previewNome
  ) {
    previewNome.textContent =
      nomeProduto.value.trim() ||
      "Nome do produto";
  }

  if (
    categoriaProduto &&
    previewCategoria
  ) {
    const option =
      categoriaProduto.options[
        categoriaProduto.selectedIndex
      ];

    previewCategoria.textContent =
      option &&
      option.value
        ? option.textContent.trim()
        : "CATEGORIA";
  }

  if (
    descricaoProduto &&
    previewDescricao
  ) {
    previewDescricao.textContent =
      descricaoProduto.value.trim() ||
      "A descrição do produto aparecerá aqui.";
  }

  if (
    precoProduto &&
    previewPreco
  ) {
    const preco =
      Number(precoProduto.value);

    previewPreco.textContent =
      Number.isFinite(preco) &&
      preco > 0
        ? preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })
        : "R$ 0,00";
  }
}

function ativarEventosPreview() {
  const campos = [
    "nomeProduto",
    "categoriaProduto",
    "descricaoProduto",
    "precoProduto"
  ];

  campos.forEach(id => {
    const campo =
      document.getElementById(id);

    if (!campo) {
      return;
    }

    campo.addEventListener(
      "input",
      atualizarPreviewProduto
    );

    campo.addEventListener(
      "change",
      atualizarPreviewProduto
    );
  });

  atualizarPreviewProduto();
}

async function carregarProdutosAdmin() {
  try {
    const tokenAtual =
      localStorage.getItem("tokenCial");

    if (!tokenAtual) {
      throw new Error(
        "Token não encontrado. Faça login novamente."
      );
    }

    const res = await fetch(
      `${API_BASE}/admin/produtos`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokenAtual}`
        }
      }
    );

    const texto = await res.text();

    console.log(
      "Resposta GET /admin/produtos:",
      {
        status: res.status,
        resposta: texto
      }
    );

    let json;

    try {
      json = JSON.parse(texto);
    } catch {
      throw new Error(
        `A API não retornou JSON. Resposta recebida: ${texto}`
      );
    }

    if (res.status === 401) {
      localStorage.removeItem("tokenCial");
      localStorage.removeItem("usuarioCial");

      alert(
        json.erro ||
        "Sua sessão expirou. Faça login novamente."
      );

      window.location.href =
        "../cadastro/login.html";

      return;
    }

    if (res.status === 403) {
      throw new Error(
        json.erro ||
        "Seu usuário não possui perfil de administrador."
      );
    }

    if (!res.ok || !json.ok) {
      throw new Error(
        json.erro ||
        `Erro HTTP ${res.status} ao carregar produtos.`
      );
    }

    produtosAdmin = Array.isArray(json.data)
      ? json.data
      : [];

    renderizarProdutos();

  } catch (erro) {
    console.error(
      "Erro completo ao carregar produtos:",
      erro
    );

    alert(
      `Erro ao carregar produtos: ${erro.message}`
    );
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

  console.log("Resposta da API:", {
    status: res.status,
    resposta: texto,
    dados
  });

  let json;

  try {
    json = JSON.parse(texto);
  } catch {
    throw new Error(
      `Resposta não JSON da API: ${texto}`
    );
  }

  if (!res.ok || !json.ok) {
    if (
      json.erro?.includes("produtos_codigo_key") ||
      json.erro?.includes("duplicate key")
    ) {
      throw new Error("Este código/SKU já está cadastrado.");
    }

    throw new Error(
      json.erro || `Erro HTTP ${res.status}`
    );
  }

  return json.data;
}

async function atualizarProduto(id, dados) {
  const res = await fetch(`${API_BASE}/admin/produtos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(dados)
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.erro || "Erro ao atualizar produto");
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
          class="btn-editar-produto"
          data-id="${produto.id}"
          title="Configurar produto">
          <i class="fa-solid fa-gear"></i>
        </button>

        <button
          type="button"
          class="btn-excluir-produto"
          data-id="${produto.id}"
          title="Excluir produto">
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

/* ============================
    CONFIGURAÇÃO DOS PRODUTOS
   ===========================*/

function abrirEdicaoProduto(id) {
  const produto = produtosAdmin.find(item => item.id === id);
  

  if (!produto) {
    alert("Produto não encontrado.");
    return;
  }

  produtoEditandoId = id;
  produtoEditando = produto;

  document.getElementById("nomeProduto").value =
    produto.nome || "";

  document.getElementById("categoriaProduto").value =
    produto.categoria || "";

  document.getElementById("precoProduto").value =
    produto.preco || "";

  document.getElementById("estoqueProduto").value =
    produto.estoque || "";

  document.getElementById("produtoDestaque").checked =
    Boolean(produto.destaque);

    document.getElementById("skuProduto").value =
    produto.codigo || "";
    
    atualizarPreviewProduto();
    atualizarPreviewImagem(
      produto.imagem || ""
    );

  modalProduto.classList.add("aberto");
}

/* Submit do formulário (criar produto) */
formProduto.addEventListener("submit", async event => {
  event.preventDefault();

  const nome = document.getElementById("nomeProduto").value.trim();
  const categoria = document.getElementById("categoriaProduto").value;
  const preco = Number(
    document.getElementById("precoProduto").value
  );
  const estoque = document.getElementById("estoqueProduto").value;

  const destaque =
    document.getElementById("produtoDestaque").checked;

    /*========================================
    INFORMAÇÕES ESPECÍFICAS
========================================*/

/*========================================
    INFORMAÇÕES ESPECÍFICAS
========================================*/

/* STIHL */

const descricaoStihl =
    document.getElementById("descricaoStihl")?.value.trim() || "";

const aplicacaoStihl =
    document.getElementById("aplicacaoStihl")?.value.trim() || "";


/* BOMBAS */

const marcaBomba =
    document.getElementById("marcaBomba")?.value.trim() || "";

const potenciaBomba =
    document.getElementById("potenciaBomba")?.value.trim() || "";

const vazaoBomba =
    document.getElementById("vazaoBomba")?.value.trim() || "";

const aplicacaoBomba =
    document.getElementById("aplicacaoBomba")?.value.trim() || "";


/* IRRIGAÇÃO */

const marcaIrrigacao =
    document.getElementById("marcaIrrigacao")?.value.trim() || "";

const tipoIrrigacao =
    document.getElementById("tipoIrrigacao")?.value.trim() || "";

let imagemUrl =
  produtoEditando?.imagem || "";

let imagensAdicionais =
  Array.isArray(produtoEditando?.imagens)
    ? [...produtoEditando.imagens]
    : [];

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

        imagemUrl = urls[0] || imagemUrl;

        /*
         * RESTANTE = FOTOS ADICIONAIS
         */
        imagensAdicionais = urls.slice(1);

    }

    const novoProduto = {

    nome,

    categoria,

    preco,

    estoque,

    // FOTO PRINCIPAL
    imagem: imagemUrl,

    // FOTOS ADICIONAIS
    imagens: imagensAdicionais,

    destaque

};

    const codigo = document
    .getElementById("skuProduto")
    .value
    .trim();

   const dados = {

    nome,

    codigo,

    categoria,

    preco,

    estoque,

    imagem: imagemUrl,

    imagens: imagensAdicionais,

    destaque,


    /* STIHL */

    descricaoStihl,

    aplicacaoStihl,


    /* BOMBAS */

    marcaBomba,

    potenciaBomba,

    vazaoBomba,

    aplicacaoBomba,


    /* IRRIGAÇÃO */

    marcaIrrigacao,

    tipoIrrigacao

};

    if (produtoEditandoId) {
      await atualizarProduto(produtoEditandoId, dados);

      alert("Produto atualizado com sucesso!");
  } else {
      await criarProduto(dados);

      alert("Produto cadastrado com sucesso!");
   }
    await carregarProdutosAdmin();

    produtoEditandoId = null;
    produtoEditando = null;

    fecharModal();


    } catch (erro) {
    console.error(
        "Erro completo ao cadastrar/atualizar produto:",
        erro
    );

    alert(
        `Erro ao cadastrar produto: ${erro.message}`
    );
    }
});

/*==================================================
                SALVAR RASCUNHO
==================================================*/

const btnSalvarRascunho =
    document.getElementById("salvarRascunho");

if(btnSalvarRascunho){

    btnSalvarRascunho.addEventListener(
        "click",
        () => {

            const rascunho = {

                nome:
                    document
                        .getElementById("nomeProduto")
                        ?.value
                        .trim() || "",

                codigo:
                    document
                        .getElementById("skuProduto")
                        ?.value
                        .trim() || "",

                categoria:
                    document
                        .getElementById("categoriaProduto")
                        ?.value || "",

                preco:
                    document
                        .getElementById("precoProduto")
                        ?.value || "",

                estoque:
                    document
                        .getElementById("estoqueProduto")
                        ?.value || "",

                descricao:
                    document
                        .getElementById("descricaoProduto")
                        ?.value
                        .trim() || "",

                destaque:
                    document
                        .getElementById("produtoDestaque")
                        ?.checked || false,

                descricaoStihl:
                    document
                        .getElementById("descricaoStihl")
                        ?.value
                        .trim() || "",

                aplicacaoStihl:
                    document
                        .getElementById("aplicacaoStihl")
                        ?.value
                        .trim() || "",

                marcaBomba:
                    document
                        .getElementById("marcaBomba")
                        ?.value
                        .trim() || "",

                potenciaBomba:
                    document
                        .getElementById("potenciaBomba")
                        ?.value
                        .trim() || "",

                vazaoBomba:
                    document
                        .getElementById("vazaoBomba")
                        ?.value
                        .trim() || "",

                aplicacaoBomba:
                    document
                        .getElementById("aplicacaoBomba")
                        ?.value
                        .trim() || "",

                marcaIrrigacao:
                    document
                        .getElementById("marcaIrrigacao")
                        ?.value
                        .trim() || "",

                tipoIrrigacao:
                    document
                        .getElementById("tipoIrrigacao")
                        ?.value
                        .trim() || "",

                etapa:
                    etapaAtualProduto
            };

            localStorage.setItem(
                "produtoRascunho",
                JSON.stringify(rascunho)
            );

            alert(
                "Rascunho salvo com sucesso!"
            );

        }
    );

}

/*==================================================
            CARREGAR RASCUNHO
==================================================*/

function carregarRascunho() {

    const salvo =
        localStorage.getItem("produtoRascunho");

    if (!salvo) {
        return false;
    }

    try {

        const rascunho =
            JSON.parse(salvo);


        const preencher = (id, valor) => {

            const campo =
                document.getElementById(id);

            if (campo && valor !== undefined) {
                campo.value = valor;
            }

        };


        preencher(
            "nomeProduto",
            rascunho.nome
        );

        preencher(
            "skuProduto",
            rascunho.codigo
        );

        preencher(
            "categoriaProduto",
            rascunho.categoria
        );

        preencher(
            "precoProduto",
            rascunho.preco
        );

        preencher(
            "estoqueProduto",
            rascunho.estoque
        );

        preencher(
            "descricaoProduto",
            rascunho.descricao
        );


        const destaque =
            document.getElementById(
                "produtoDestaque"
            );

        if (destaque) {

            destaque.checked =
                Boolean(rascunho.destaque);

        }


        /* STIHL */

        preencher(
            "descricaoStihl",
            rascunho.descricaoStihl
        );

        preencher(
            "aplicacaoStihl",
            rascunho.aplicacaoStihl
        );


        /* BOMBAS */

        preencher(
            "marcaBomba",
            rascunho.marcaBomba
        );

        preencher(
            "potenciaBomba",
            rascunho.potenciaBomba
        );

        preencher(
            "vazaoBomba",
            rascunho.vazaoBomba
        );

        preencher(
            "aplicacaoBomba",
            rascunho.aplicacaoBomba
        );


        /* IRRIGAÇÃO */

        preencher(
            "marcaIrrigacao",
            rascunho.marcaIrrigacao
        );

        preencher(
            "tipoIrrigacao",
            rascunho.tipoIrrigacao
        );


        /* Atualiza campos da categoria */

        atualizarCamposEspecificos();


        /* Atualiza prévia */

        atualizarPreviewProduto();


        /* Volta para a etapa salva */

        const etapa =
            Number(rascunho.etapa) || 1;

        mostrarEtapaProduto(
            etapa
        );


        return true;


    } catch (erro) {

        console.error(
            "Erro ao carregar rascunho:",
            erro
        );

        return false;

    }

}

/*==================================================
        BOTÃO CONTINUAR RASCUNHO
==================================================*/

const btnContinuarRascunho =
    document.getElementById("continuarRascunho");

if (btnContinuarRascunho) {

    btnContinuarRascunho.addEventListener(
        "click",
        () => {

            const carregou =
                carregarRascunho();

            if (!carregou) {

                alert(
                    "Não existe nenhum rascunho salvo."
                );

                return;
            }

            modalProduto.classList.add("aberto");

        }
    );

}

/* Excluir produto */
document.addEventListener("click", async event => {
  const botaoEditar = event.target.closest(".btn-editar-produto");

  if (botaoEditar) {
    abrirEdicaoProduto(Number(botaoEditar.dataset.id));
    return;
  }

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
        CONTROLE DE USUÁRIOS
==================================================*/

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatarData(data) {
    if (!data) {
        return "-";
    }

    return new Date(data).toLocaleDateString(
        "pt-BR"
    );
}

async function carregarUsuarios() {
    if (!listaClientes) {
        return;
    }

    const tokenAtual =
        localStorage.getItem("tokenCial");

    if (!tokenAtual) {
        listaClientes.innerHTML = `
            <tr>
                <td colspan="6">
                    Sessão não encontrada.
                </td>
            </tr>
        `;

        return;
    }

    listaClientes.innerHTML = `
        <tr>
            <td colspan="6">
                Carregando usuários...
            </td>
        </tr>
    `;

    try {
        const resposta = await fetch(
            `${API_BASE}/admin/usuarios`,
            {
                headers: {
                    Authorization:
                        `Bearer ${tokenAtual}`
                }
            }
        );

        const resultado = await resposta.json();

        if (resposta.status === 401) {
            localStorage.removeItem("tokenCial");
            localStorage.removeItem("usuarioCial");

            window.location.href =
                "../cadastro/login.html";

            return;
        }

        if (resposta.status === 403) {
            throw new Error(
                "Acesso negado: usuário sem perfil admin."
            );
        }

        if (!resposta.ok || !resultado.ok) {
            throw new Error(
                resultado.erro ||
                "Erro ao carregar usuários"
            );
        }

        renderizarUsuarios(resultado.data || []);
    } catch (erro) {
        console.error(
            "Erro ao carregar usuários:",
            erro
        );

        listaClientes.innerHTML = `
            <tr>
                <td colspan="6">
                    ${escaparHTML(erro.message)}
                </td>
            </tr>
        `;
    }
}

function renderizarUsuarios(usuarios) {
    if (!listaClientes) {
        return;
    }

    if (usuarios.length === 0) {
        listaClientes.innerHTML = `
            <tr>
                <td colspan="6">
                    Nenhum usuário encontrado.
                </td>
            </tr>
        `;

        return;
    }

    listaClientes.innerHTML = usuarios.map(usuario => {
        const perfil =
            usuario.perfil === "admin"
                ? "admin"
                : "cliente";

        return `
            <tr>
                <td>
                    ${escaparHTML(usuario.nome)}
                </td>

                <td>
                    ${escaparHTML(usuario.email)}
                </td>

                <td>
                    ${escaparHTML(
                        usuario.telefone || "-"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        usuario.tipo || "-"
                    )}
                </td>

                <td>
                    <select
                        class="select-perfil"
                        data-id="${usuario.id}"
                        data-perfil-atual="${perfil}"
                    >
                        <option
                            value="cliente"
                            ${perfil === "cliente"
                                ? "selected"
                                : ""}
                        >
                            Cliente
                        </option>

                        <option
                            value="admin"
                            ${perfil === "admin"
                                ? "selected"
                                : ""}
                        >
                            Admin
                        </option>
                    </select>
                </td>

                <td>
                    ${formatarData(
                        usuario.created_at
                    )}
                </td>
            </tr>
        `;
    }).join("");
}

async function alterarPerfil(
    usuarioId,
    novoPerfil,
    select
) {
    const tokenAtual =
        localStorage.getItem("tokenCial");

    const confirmou = window.confirm(
        `Alterar o perfil para "${novoPerfil}"?`
    );

    if (!confirmou) {
        select.value =
            select.dataset.perfilAtual;

        return;
    }

    select.disabled = true;

    try {
        const resposta = await fetch(
            `${API_BASE}/admin/usuarios/${usuarioId}/perfil`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${tokenAtual}`
                },
                body: JSON.stringify({
                    perfil: novoPerfil
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.ok) {
            throw new Error(
                resultado.erro ||
                "Erro ao alterar perfil"
            );
        }

        select.dataset.perfilAtual =
            novoPerfil;

        alert(
            "Perfil alterado com sucesso."
        );
    } catch (erro) {
        console.error(
            "Erro ao alterar perfil:",
            erro
        );

        select.value =
            select.dataset.perfilAtual;

        alert(erro.message);
    } finally {
        select.disabled = false;
    }
}


listaClientes?.addEventListener(
    "change",
    event => {
        const select =
            event.target.closest(".select-perfil");

        if (!select) {
            return;
        }

        alterarPerfil(
            Number(select.dataset.id),
            select.value,
            select
        );
    }
);

btnAtualizarUsuarios?.addEventListener(
    "click",
    carregarUsuarios
);


/*==================================================
  NAVEGAÇÃO DAS ETAPAS DO PRODUTO
==================================================*/

let etapaAtualProduto = 1;

const btnProximo =
  document.getElementById("btnProximo");

const btnAnterior =
  document.getElementById("btnAnterior");

const btnPublicarProduto =
  document.getElementById(
    "btnPublicarProduto"
  );

function mostrarEtapaProduto(numeroEtapa) {
  const conteudos =
    document.querySelectorAll(
      ".etapa-conteudo"
    );

  const indicadores =
    document.querySelectorAll(
      ".etapa-produto"
    );

  conteudos.forEach(conteudo => {
    const numero =
      Number(conteudo.dataset.conteudo);

    conteudo.classList.toggle(
      "ativa",
      numero === numeroEtapa
    );
  });

  indicadores.forEach(indicador => {
    const numero =
      Number(indicador.dataset.etapa);

    indicador.classList.toggle(
      "ativa",
      numero === numeroEtapa
    );

    indicador.classList.toggle(
      "concluida",
      numero < numeroEtapa
    );
  });

  etapaAtualProduto = numeroEtapa;

  atualizarBotoesEtapaProduto();
}

function atualizarBotoesEtapaProduto() {
  if (btnAnterior) {
    btnAnterior.style.display =
      etapaAtualProduto > 1
        ? "inline-flex"
        : "none";
  }

  if (btnProximo) {
    btnProximo.style.display =
      etapaAtualProduto < 4
        ? "inline-flex"
        : "none";
  }

  if (btnPublicarProduto) {
    btnPublicarProduto.style.display =
      etapaAtualProduto === 4
        ? "inline-flex"
        : "none";
  }
}

function validarEtapaProduto(numeroEtapa) {
  if (numeroEtapa === 1) {
    const nome =
      document.getElementById("nomeProduto");

    const categoria =
      document.getElementById(
        "categoriaProduto"
      );

    if (!nome || !nome.value.trim()) {
      alert(
        "Informe o nome do produto."
      );

      nome?.focus();

      return false;
    }

    if (
      !categoria ||
      !categoria.value
    ) {
      alert(
        "Selecione uma categoria."
      );

      categoria?.focus();

      return false;
    }
  }

  if (numeroEtapa === 3) {
    const preco =
      document.getElementById(
        "precoProduto"
      );

    const estoque =
      document.getElementById(
        "estoqueProduto"
      );

    if (!preco || !preco.value) {
      alert(
        "Informe o preço do produto."
      );

      preco?.focus();

      return false;
    }

    if (!estoque || !estoque.value) {
      alert(
        "Informe o estoque do produto."
      );

      estoque?.focus();

      return false;
    }
  }

  return true;
}

btnProximo?.addEventListener(
  "click",
  () => {
    if (etapaAtualProduto >= 4) {
      return;
    }

    if (
      !validarEtapaProduto(
        etapaAtualProduto
      )
    ) {
      return;
    }

    mostrarEtapaProduto(
      etapaAtualProduto + 1
    );
  }
);

btnAnterior?.addEventListener(
  "click",
  () => {
    if (etapaAtualProduto <= 1) {
      return;
    }

    mostrarEtapaProduto(
      etapaAtualProduto - 1
    );
  }
);



/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener(
  "DOMContentLoaded",
  () => {
    mostrarSecao("dashboard");

    ativarEventosPreview();

    mostrarEtapaProduto(1);

    carregarProdutosAdmin();
  }
);
