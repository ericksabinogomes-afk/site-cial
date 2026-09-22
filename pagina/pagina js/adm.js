//==================================================
// CONFIGURAÇÃO DA API
//==================================================

const API_BASE =
    window.API_BASE_URL ||
    "http://localhost:4000";

/*==================================================
                ELEMENTOS
==================================================*/

const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".admin-section");
const btnLogout = document.querySelector(".logout");
const btnSave = document.querySelector(".btn-save");
const btnAddProduto = document.querySelectorAll(
    "#produtos .btn-add"
);
const btnAddCategoria = document.querySelector(
    "#categorias .btn-add"
);
const listaClientes = document.getElementById("listaClientes");
const btnAtualizarUsuarios =document.getElementById("btnAtualizarUsuarios");

/*==================================================
            AUTENTICAÇÃO DO ADMIN
==================================================*/
function obterTokenAtual() {
    return localStorage.getItem("tokenCial");
}

const tokenInicial = obterTokenAtual();

if (!tokenInicial) {
    window.location.href = "../cadastro/login.html";
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

if (secao === "categorias") {
    carregarCategorias();
}

if (secao === "dashboard") {
    carregarDashboardAdmin();
}

if (secao === "pedidos") {
    carregarPedidosAdmin();

}

if (secao === "relatorios") {
    carregarRelatoriosAdmin();
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

/*==================================================
        CONFIGURAÇÕES DO SITE
==================================================*/

const camposConfiguracoes = {
    nome_empresa: document.getElementById("configNomeEmpresa"),
    whatsapp: document.getElementById("configWhatsApp"),
    telefone: document.getElementById("configTelefone"),
    email: document.getElementById("configEmail"),
    instagram: document.getElementById("configInstagram"),
    facebook: document.getElementById("configFacebook"),
    endereco: document.getElementById("configEndereco"),
    pix: document.getElementById("configPix")
};


/*==================================================
        CARREGAR CONFIGURAÇÕES
==================================================*/

async function carregarConfiguracoesAdmin() {

    try {

        const resposta = await fetch(
            `${API_BASE}/admin/configuracoes`,
            {
                headers: {
                 "Authorization": `Bearer ${obterTokenAtual()}`
                }
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.ok) {
            throw new Error(
                resultado.erro ||
                "Erro ao carregar configurações."
            );
        }

        const dados = resultado.data || {};

        Object.keys(camposConfiguracoes).forEach(campo => {

            if (camposConfiguracoes[campo]) {

                camposConfiguracoes[campo].value =
                    dados[campo] || "";

            }

        });

        console.log(
            "Configurações carregadas:",
            dados
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar configurações:",
            erro
        );

    }

}


/*==================================================
        SALVAR CONFIGURAÇÕES
==================================================*/

if (btnSave) {

    btnSave.addEventListener("click", async () => {

        try {

            btnSave.disabled = true;

            const dados = {};

            Object.keys(camposConfiguracoes).forEach(campo => {

                dados[campo] =
                    camposConfiguracoes[campo]?.value.trim() || "";

            });


            console.log(
                "Salvando configurações:",
                dados
            );


            const resposta = await fetch(
                `${API_BASE}/admin/configuracoes`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                     "Authorization": `Bearer ${obterTokenAtual()}`
                    },

                    body: JSON.stringify(dados)
                }
            );


            const resultado = await resposta.json();


            if (!resposta.ok || !resultado.ok) {

                throw new Error(
                    resultado.erro ||
                    "Erro ao salvar configurações."
                );

            }


            alert(
                "Configurações salvas com sucesso!"
            );


            console.log(
                "Configurações salvas:",
                resultado.data
            );


        } catch (erro) {

            console.error(
                "Erro ao salvar configurações:",
                erro
            );

            alert(
                `Erro ao salvar configurações: ${erro.message}`
            );


        } finally {

            btnSave.disabled = false;

        }

    });

}


/*==================================================
        INICIAR CONFIGURAÇÕES
==================================================*/

carregarConfiguracoesAdmin();


/*==================================================
        MODAL — NOVO PRODUTO
==================================================*/

const modalNovoProduto =
  document.getElementById("modalNovoProduto");

const fecharModalProduto =
  document.getElementById("fecharModalProduto");


/*==================================================
        LIMPAR FORMULÁRIO — NOVO PRODUTO
==================================================*/

function limparFormularioProduto() {

    if (!modalNovoProduto) {
        return;
    }

    modalNovoProduto
        .querySelectorAll("input, textarea, select")
        .forEach(campo => {

            if (
                campo.type === "checkbox" ||
                campo.type === "radio"
            ) {
                campo.checked = false;
                return;
            }

            if (campo.tagName === "SELECT") {
                campo.selectedIndex = 0;
                return;
            }

            campo.value = "";
        });

    /* ATIVO COMEÇA MARCADO */
    const ativo =
        document.getElementById(
            "novoProdutoAtivo"
        );

    if (ativo) {
        ativo.checked = true;
    }

    /* LIMPAR IMAGENS */
    arquivosSelecionados = [];

    if (inputImagem) {
        inputImagem.value = "";
    }

    if (previewImagem) {
        previewImagem.innerHTML = "";
    }

    atualizarPreviewImagem("");

    /* LIMPAR CATEGORIAS */
    checkboxesCategorias.forEach(
        checkbox => {
            checkbox.checked = false;
        }
    );

    atualizarResumoCategorias();

    /* LIMPAR FILTROS */
    atualizarFiltrosDinamicos();

    /* LIMPAR ESPECIFICAÇÕES */
    atualizarEspecificacoesProduto();

    /* VOLTAR PARA ETAPA 1 */
    mostrarEtapaProduto(1);

    /* SAIR DO MODO EDIÇÃO */
    produtoEditandoId = null;
    produtoEditando = null;
}


/* ABRIR */

btnAddProduto.forEach(botao => {

    botao.addEventListener("click", () => {

        if (!modalNovoProduto) {
            return;
        }

        limparFormularioProduto();

        modalNovoProduto.classList.add("ativo");

    });

});

/*==================================================
        NOVA CATEGORIA — BOTÃO
==================================================*/

btnAddCategoria?.addEventListener("click", () => {

    abrirModalCategoria();

});


/* FECHAR */

fecharModalProduto?.addEventListener(
  "click",
  () => {

    modalNovoProduto?.classList.remove("ativo");

  }
);


/* FECHAR CLICANDO FORA */

modalNovoProduto?.addEventListener(
  "click",
  event => {

    if (event.target === modalNovoProduto) {

      modalNovoProduto.classList.remove("ativo");

    }

  }
);

/*==================================================
        NAVEGAÇÃO — NOVO PRODUTO
==================================================*/

const etapasProduto =
  document.querySelectorAll(".produto-etapa");

const conteudosEtapaProduto =
  document.querySelectorAll(".produto-etapa-conteudo");

const btnAnterior =
  document.getElementById("btnAnterior");

const btnProximo =
  document.getElementById("btnProximo");

const btnPublicarProduto =
  document.getElementById("btnPublicarProduto");

let etapaProdutoAtual = 1;


/*==================================================
        MOSTRAR ETAPA
==================================================*/

function mostrarEtapaProduto(numeroEtapa) {

  etapaProdutoAtual = numeroEtapa;


  /* ETAPAS */

  etapasProduto.forEach(etapa => {

    const numero =
      Number(etapa.dataset.etapa);

    etapa.classList.remove(
      "ativa",
      "concluida"
    );

    if (numero === numeroEtapa) {

      etapa.classList.add("ativa");

    } else if (numero < numeroEtapa) {

      etapa.classList.add("concluida");

    }

  });


  /* CONTEÚDO */

  conteudosEtapaProduto.forEach(conteudo => {

    const numero =
      Number(conteudo.dataset.conteudoEtapa);

    conteudo.classList.remove("ativa");

    if (numero === numeroEtapa) {

      conteudo.classList.add("ativa");

    }

  });


  /* BOTÃO VOLTAR */

  if (btnAnterior) {

    btnAnterior.style.display =
      numeroEtapa === 1
        ? "none"
        : "inline-flex";

  }


  /* BOTÃO CONTINUAR */

  if (btnProximo) {

    btnProximo.style.display =
      numeroEtapa === 5
        ? "none"
        : "inline-flex";

  }


  /* BOTÃO CADASTRAR */

  if (btnPublicarProduto) {

    btnPublicarProduto.style.display =
      numeroEtapa === 5
        ? "inline-flex"
        : "none";

  }

}


/*==================================================
        BOTÃO PRÓXIMO
==================================================*/

btnProximo?.addEventListener(
  "click",
  () => {

    if (etapaProdutoAtual < 5) {

      mostrarEtapaProduto(
        etapaProdutoAtual + 1
      );

    }

  }
);


/*==================================================
        BOTÃO VOLTAR
==================================================*/

btnAnterior?.addEventListener(
  "click",
  () => {

    if (etapaProdutoAtual > 1) {

      mostrarEtapaProduto(
        etapaProdutoAtual - 1
      );

    }

  }
);

async function enviarImagensProduto() {

    console.log("🔥 UPLOAD FOI CHAMADO");
console.log("📸 ARQUIVOS NO UPLOAD:", arquivosSelecionados);

    if (!arquivosSelecionados || arquivosSelecionados.length === 0) {
        return [];
    }

    const formData = new FormData();

    arquivosSelecionados.forEach(arquivo => {
        formData.append("imagens", arquivo);
    });

    const res = await fetch(`${API_BASE}/upload-imagens`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${obterTokenAtual()}`
        },
        body: formData
    });

    const texto = await res.text();

    let json;

    try {
        json = JSON.parse(texto);
    } catch {
        throw new Error(
            `Resposta inválida ao enviar imagens: ${texto}`
        );
    }

    if (!res.ok || !json.ok) {
        throw new Error(
            json.erro || "Erro ao enviar imagens"
        );
    }

    return json.urls || [];
}

/*==================================================
        BOTÃO CADASTRAR PRODUTO
==================================================*/

btnPublicarProduto?.addEventListener(
    "click",
    async () => {

        try {

            btnPublicarProduto.disabled = true;

            btnPublicarProduto.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Cadastrando...
            `;


            /* INFORMAÇÕES */

            const informacoes =
                obterInformacoesProduto();


            /* FILTROS */

            const filtros =
                obterFiltrosSelecionados();


            /* ESPECIFICAÇÕES */

            const especificacoes =
                obterEspecificacoesProduto();


            /* CATEGORIAS */

            const categorias =
                Array.from(
                    checkboxesCategorias
                )
                .filter(
                    checkbox => checkbox.checked
                )
                .map(
                    checkbox => checkbox.value
                );

            

    /* IMAGENS */

let imagemPrincipal =
    produtoEditando?.imagem || "";

let imagensAdicionais =
    Array.isArray(produtoEditando?.imagens)
        ? [...produtoEditando.imagens]
        : [];

/*
 * Só substitui as imagens existentes
 * quando o usuário realmente enviar
 * novas imagens.
 */
if (
    arquivosSelecionados &&
    arquivosSelecionados.length > 0
) {

    const urlsImagens =
        await enviarImagensProduto();

    if (urlsImagens.length > 0) {

        imagemPrincipal =
            urlsImagens[0] || imagemPrincipal;

        imagensAdicionais =
            urlsImagens.slice(1);

    }

}

            /* DADOS DO PRODUTO */

                     const dadosProduto = {

                ...informacoes,

                imagem: imagemPrincipal,
                imagens: imagensAdicionais,

                /* MANTÉM OS DOIS FORMATOS */
                categoria: categorias[0] || "",
                categorias,

                filtros,

                especificacoes,

                preco:


                    Number(
                        document.getElementById(
                            "novoProdutoPreco"
                        )?.value || 0
                    ),

                estoque:
                    Number(
                        document.getElementById(
                            "novoProdutoEstoque"
                        )?.value || 0
                    ),

                promocao:
                    document.getElementById(
                        "novoProdutoPromocao"
                    )?.checked || false,

                lancamento:
                    document.getElementById(
                        "novoProdutoLancamento"
                    )?.checked || false,

                mais_vendido:
                    document.getElementById(
                        "novoProdutoMaisVendido"
                    )?.checked || false,

               novidade:
    document.getElementById(
        "novoProdutoNovidade"
    )?.checked || false,

destaque:
    document.getElementById(
        "novoProdutoDestaque"
    )?.checked || false,

ativo:
    document.getElementById(
        "novoProdutoAtivo"
    )?.checked ?? true
            };


            console.log(
                "Produto pronto para cadastro:",
                dadosProduto
            );


            /* CADASTRAR */

const produtoSalvo = produtoEditandoId
    ? await atualizarProduto(
        produtoEditandoId,
        dadosProduto
      )
    : await criarProduto(
        dadosProduto
      );


           console.log(
    "Produto cadastrado:",
    produtoSalvo
);


            alert(
                "Produto cadastrado com sucesso!"
            );


          /* FECHAR MODAL */

const modal =
    document.getElementById(
        "modalNovoProduto"
    );

if (modal) {
    modal.classList.remove("ativo");
}

/* LIMPAR FORMULÁRIO E IMAGENS APÓS SUCESSO */
limparFormularioProduto();


            /* ATUALIZAR LISTA */

            if (
                typeof carregarProdutosAdmin ===
                "function"
            ) {
                carregarProdutosAdmin();
            }


        } catch (erro) {

            console.error(
                "Erro ao cadastrar produto:",
                erro
            );

            alert(
                `Erro ao cadastrar produto: ${erro.message}`
            );


        } finally {

            btnPublicarProduto.disabled = false;

            btnPublicarProduto.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Cadastrar produto
            `;

        }

    }
);

/*==================================================
        CLIQUE DIRETO NAS ETAPAS
==================================================*/

etapasProduto.forEach(etapa => {

  etapa.addEventListener(
    "click",
    () => {

      const numero =
        Number(etapa.dataset.etapa);

      /*
       * Por enquanto permitimos clicar
       * somente nas etapas já alcançadas.
       */

      if (numero <= etapaProdutoAtual) {

        mostrarEtapaProduto(numero);

      }

    }
  );

});


/*==================================================
        ESTADO INICIAL
==================================================*/

mostrarEtapaProduto(1);

/*==================================================
        CATEGORIAS — RESUMO DINÂMICO
==================================================*/

const checkboxesCategorias =
  document.querySelectorAll(
    'input[name="categoriasProduto"]'
  );

const resumoCategoriasProduto =
  document.getElementById(
    "resumoCategoriasProduto"
  );


function atualizarResumoCategorias() {

  if (!resumoCategoriasProduto) {
    return;
  }


  const selecionadas = Array.from(
    checkboxesCategorias
  ).filter(checkbox => checkbox.checked);


  if (selecionadas.length === 0) {

    resumoCategoriasProduto.innerHTML = `
      <span class="resumo-vazio">
        Nenhuma categoria selecionada.
      </span>
    `;

    return;
  }


  resumoCategoriasProduto.innerHTML =
    selecionadas.map(checkbox => {

      const label =
        checkbox.closest(
          ".categoria-checkbox"
        );

      const nome =
        label?.querySelector(
          "span:last-child"
        )?.textContent.trim()
        || checkbox.value;


      return `
        <span class="resumo-categoria">
          ${nome}
        </span>
      `;

    }).join("");

}


/* ATUALIZA AO MARCAR/DESMARCAR */

checkboxesCategorias.forEach(
  checkbox => {

    checkbox.addEventListener(
      "change",
      atualizarResumoCategorias
    );

  }
);


/* ESTADO INICIAL */

atualizarResumoCategorias();

/*==================================================
        CONFIGURAÇÃO — FILTROS DOS PRODUTOS
==================================================*/

const filtrosProdutos = {

    motosserras: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ],
        linha: [
            "Gasolina",
            "Elétrica",
            "Bateria"
        ]
    },

    rocadeiras: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ],
        linha: [
            "Gasolina",
            "Elétrica",
            "Bateria"
        ]
    },

    sopradores: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ],
        linha: [
            "Gasolina",
            "Elétrica",
            "Bateria"
        ]
    },

    lavadoras: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem"
        ],
        linha: [
            "Elétrica",
            "Bateria"
        ]
    },

    "lavadoras-alta-pressao": {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "cortadores-grama": {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ],
        linha: [
            "Gasolina",
            "Elétrica",
            "Bateria"
        ]
    },

    "podadores-cerca-viva": {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Paisagismo"
        ],
        linha: [
            "Gasolina",
            "Elétrica",
            "Bateria"
        ]
    },

    motopodas: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ],
        linha: [
            "Gasolina",
            "Bateria"
        ]
    },

    colhedores: {
        aplicacao: [
            "Uso Profissional",
            "Agricultura"
        ],
        linha: [
            "Gasolina",
            "Bateria"
        ]
    },

    kombisystem: {
        aplicacao: [
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ],
        linha: [
            "Gasolina",
            "Bateria"
        ]
    },

   "linha-eletrica": {
    aplicacao: [
        "Uso Doméstico",
        "Uso Profissional",
        "Jardinagem",
        "Paisagismo"
    ],
    linha: [
        "Elétrica"
    ]
},

    aspiradores: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem"
        ],
        linha: [
            "Elétrica",
            "Bateria"
        ]
    },

    "pecas-reposicao": {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ]
    },

    "ferramentas-corte": {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ]
    },

    lubrificantes: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura"
        ]
    },

    combustiveis: {
        aplicacao: [
            "Uso Profissional",
            "Agricultura",
            "Jardinagem"
        ]
    },

    epis: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ]
    },

    acessorios: {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ]
    },

     "linha-bateria": {
        aplicacao: [
            "Uso Doméstico",
            "Uso Profissional",
            "Jardinagem",
            "Agricultura",
            "Paisagismo"
        ],
        linha: [
            "Bateria"
        ]
    },

    /*========================================
        BOMBAS E IRRIGAÇÃO
    ========================================*/

    "bombas-centrifugas": {
        aplicacao: [
            "Uso Residencial",
            "Uso Comercial",
            "Uso Industrial",
            "Agricultura",
            "Irrigação"
        ],
        linha: [
            "Elétrica",
            "Gasolina",
            "Diesel"
        ]
    },

    "bombas-perifericas": {
        aplicacao: [
            "Uso Residencial",
            "Uso Comercial",
            "Irrigação"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-submersas": {
        aplicacao: [
            "Abastecimento de água",
            "Uso Residencial",
            "Agricultura",
            "Irrigação"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-submersiveis": {
        aplicacao: [
            "Drenagem",
            "Uso Residencial",
            "Uso Comercial",
            "Uso Industrial"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-autoaspirantes": {
        aplicacao: [
            "Abastecimento de água",
            "Uso Residencial",
            "Agricultura",
            "Irrigação"
        ],
        linha: [
            "Elétrica",
            "Gasolina",
            "Diesel"
        ]
    },

    "bombas-injetoras": {
        aplicacao: [
            "Abastecimento de água",
            "Agricultura",
            "Irrigação"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-motobombas-irrigacao": {
        aplicacao: [
            "Irrigação",
            "Agricultura",
            "Uso Profissional"
        ],
        linha: [
            "Gasolina",
            "Diesel"
        ]
    },

    "bombas-piscina": {
        aplicacao: [
            "Piscina",
            "Uso Residencial",
            "Uso Comercial"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-irrigacao": {
        aplicacao: [
            "Irrigação",
            "Agricultura",
            "Uso Profissional"
        ],
        linha: [
            "Elétrica",
            "Gasolina",
            "Diesel"
        ]
    },

    "bombas-poco": {
        aplicacao: [
            "Abastecimento de água",
            "Uso Residencial",
            "Agricultura"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-drenagem": {
        aplicacao: [
            "Drenagem",
            "Uso Comercial",
            "Uso Industrial",
            "Construção"
        ],
        linha: [
            "Elétrica",
            "Gasolina",
            "Diesel"
        ]
    },

    "bombas-esgoto": {
        aplicacao: [
            "Esgoto",
            "Uso Residencial",
            "Uso Comercial",
            "Uso Industrial"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-pressurizadores": {
        aplicacao: [
            "Pressurização",
            "Uso Residencial",
            "Uso Comercial"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-sistemas-pressurizacao": {
        aplicacao: [
            "Pressurização",
            "Uso Residencial",
            "Uso Comercial",
            "Uso Industrial"
        ],
        linha: [
            "Elétrica"
        ]
    },

    "bombas-acessorios": {
        aplicacao: [
            "Uso Residencial",
            "Uso Comercial",
            "Uso Industrial",
            "Irrigação"
        ]
    }

};

/*==================================================
        MOTOR — FILTROS DINÂMICOS
==================================================*/

const filtrosDinamicosProduto =
    document.getElementById(
        "filtrosDinamicosProduto"
    );


function atualizarFiltrosDinamicos() {

    if (!filtrosDinamicosProduto) {
        return;
    }


    const categoriasSelecionadas =
        Array.from(
            checkboxesCategorias
        )
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);


    /* Nenhuma categoria */

    if (categoriasSelecionadas.length === 0) {

        filtrosDinamicosProduto.innerHTML = `
            <div class="filtro-vazio">

                <i class="fa-solid fa-wand-magic-sparkles"></i>

                <strong>
                    Os filtros aparecerão conforme as categorias.
                </strong>

                <p>
                    Primeiro selecione as categorias do produto.
                </p>

            </div>
        `;

        return;
    }


    /*==================================================
            JUNTA OS FILTROS
    ==================================================*/

    const filtrosCombinados = {};


    categoriasSelecionadas.forEach(
        categoria => {

            const configuracao =
                filtrosProdutos[categoria];


            if (!configuracao) {
                return;
            }


            Object.entries(configuracao)
                .forEach(
                    ([grupo, opcoes]) => {

                        if (!filtrosCombinados[grupo]) {

                            filtrosCombinados[grupo] =
                                new Set();

                        }


                        opcoes.forEach(opcao => {

                            filtrosCombinados[grupo]
                                .add(opcao);

                        });

                    }
                );

        }
    );


    /*==================================================
            NENHUM FILTRO CONFIGURADO
    ==================================================*/

    if (
        Object.keys(filtrosCombinados).length === 0
    ) {

        filtrosDinamicosProduto.innerHTML = `
            <div class="filtro-vazio">

                <i class="fa-solid fa-filter"></i>

                <strong>
                    Esta categoria ainda não possui filtros.
                </strong>

                <p>
                    Os filtros poderão ser adicionados
                    posteriormente.
                </p>

            </div>
        `;

        return;
    }


    /*==================================================
            NOMES DOS GRUPOS
    ==================================================*/

    const nomesGrupos = {

        aplicacao: "Aplicação",

        linha: "Linha"

    };


    /*==================================================
            MONTAR HTML
    ==================================================*/

    filtrosDinamicosProduto.innerHTML =
        Object.entries(filtrosCombinados)
        .map(
            ([grupo, opcoes]) => {

                const nomeGrupo =
                    nomesGrupos[grupo]
                    || grupo;


                return `
                    <div class="grupo-filtro-produto">

                        <div class="grupo-filtro-header">

                            <div>

                                <h4>
                                    ${nomeGrupo}
                                </h4>

                                <span>
                                    Selecione uma ou mais opções
                                </span>

                            </div>

                        </div>


                        <div class="lista-filtros-produto">

                            ${
                                Array.from(opcoes)
                                .map(
                                    opcao => `
                                        <label
                                            class="filtro-checkbox-produto"
                                        >

                                            <input
                                                type="checkbox"
                                                name="filtro_${grupo}"
                                                value="${opcao}"
                                            >

                                            <span>
                                                ${opcao}
                                            </span>

                                        </label>
                                    `
                                )
                                .join("")
                            }

                        </div>

                    </div>
                `;

            }
        )
        .join("");

}


/*==================================================
        ATUALIZAR AO ALTERAR CATEGORIA
==================================================*/

checkboxesCategorias.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            atualizarFiltrosDinamicos
        );

    }
);


/*==================================================
        ESTADO INICIAL
==================================================*/

atualizarFiltrosDinamicos();

/*==================================================
        COLETAR FILTROS SELECIONADOS
==================================================*/

function obterFiltrosSelecionados() {

    const filtros = {};

    if (!filtrosDinamicosProduto) {
        return filtros;
    }


    const checkboxes =
        filtrosDinamicosProduto.querySelectorAll(
            'input[type="checkbox"]'
        );


    checkboxes.forEach(checkbox => {

        if (!checkbox.checked) {
            return;
        }


        const grupo =
            checkbox.name.replace(
                "filtro_",
                ""
            );


        if (!filtros[grupo]) {
            filtros[grupo] = [];
        }


        filtros[grupo].push(
            checkbox.value
        );

    });


    return filtros;
}

/*==================================================
        INFORMAÇÕES — NOVO PRODUTO
==================================================*/

function obterInformacoesProduto() {

    const nome =
        document.getElementById(
            "novoProdutoNome"
        )?.value.trim() || "";


    const codigo =
        document.getElementById(
            "novoProdutoCodigo"
        )?.value.trim() || "";


    const marca =
        document.getElementById(
            "novoProdutoMarca"
        )?.value.trim() || "";


    const linha =
        document.getElementById(
            "novoProdutoLinha"
        )?.value.trim() || "";


    const modelo =
        document.getElementById(
            "novoProdutoModelo"
        )?.value.trim() || "";


    const descricao =
        document.getElementById(
            "novoProdutoDescricao"
        )?.value.trim() || "";


    return {

        nome,

        codigo,

        marca,

        linha,

        modelo,

        descricao

    };

}

/*==================================================
        CONFIGURAÇÃO — ESPECIFICAÇÕES TÉCNICAS
==================================================*/

const especificacoesCategoriasProduto = {

    /*========================================
        MOTOSSERRAS
    ========================================*/
    motosserras: [
        {
            id: "cilindrada",
            nome: "Cilindrada",
            tipo: "text",
            placeholder: "Ex.: 30,1 cm³"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1,2 kW"
        },
        {
            id: "comprimento-sabre",
            nome: "Comprimento do sabre",
            tipo: "text",
            placeholder: "Ex.: 30 cm"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 4,2 kg"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "2 tempos",
                "Elétrico",
                "Bateria"
            ]
        },
        {
            id: "capacidade-tanque",
            nome: "Capacidade do tanque",
            tipo: "text",
            placeholder: "Ex.: 0,25 l"
        }
    ],


    /*========================================
        ROÇADEIRAS
    ========================================*/
    rocadeiras: [
        {
            id: "cilindrada",
            nome: "Cilindrada",
            tipo: "text",
            placeholder: "Ex.: 27,2 cm³"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 0,8 kW"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 5,5 kg"
        },
        {
            id: "diametro-corte",
            nome: "Diâmetro de corte",
            tipo: "text",
            placeholder: "Ex.: 420 mm"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "2 tempos",
                "Elétrico",
                "Bateria"
            ]
        },
        {
            id: "capacidade-tanque",
            nome: "Capacidade do tanque",
            tipo: "text",
            placeholder: "Ex.: 0,34 l"
        }
    ],


    /*========================================
        SOPRADORES
    ========================================*/
    sopradores: [
        {
            id: "cilindrada",
            nome: "Cilindrada",
            tipo: "text",
            placeholder: "Ex.: 27,2 cm³"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 0,8 kW"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 3,5 kg"
        },
        {
            id: "velocidade-ar",
            nome: "Velocidade máxima do ar",
            tipo: "text",
            placeholder: "Ex.: 70 m/s"
        },
        {
            id: "vazao-ar",
            nome: "Vazão de ar",
            tipo: "text",
            placeholder: "Ex.: 800 m³/h"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "2 tempos",
                "Elétrico",
                "Bateria"
            ]
        }
    ],


    /*========================================
        LAVADORAS
    ========================================*/
    lavadoras: [
        {
            id: "pressao-maxima",
            nome: "Pressão máxima",
            tipo: "text",
            placeholder: "Ex.: 150 bar"
        },
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 500 l/h"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 2,2 kW"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 20 kg"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "Elétrico",
                "Bateria"
            ]
        }
    ],


    /*========================================
        LAVADORAS DE ALTA PRESSÃO
    ========================================*/
    "lavadoras-alta-pressao": [
        {
            id: "pressao-maxima",
            nome: "Pressão máxima",
            tipo: "text",
            placeholder: "Ex.: 180 bar"
        },
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 600 l/h"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 2,5 kW"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 25 kg"
        },
        {
            id: "comprimento-mangueira",
            nome: "Comprimento da mangueira",
            tipo: "text",
            placeholder: "Ex.: 10 m"
        }
    ],


    /*========================================
        CORTADORES DE GRAMA
    ========================================*/
    "cortadores-grama": [
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1,8 kW"
        },
        {
            id: "largura-corte",
            nome: "Largura de corte",
            tipo: "text",
            placeholder: "Ex.: 46 cm"
        },
        {
            id: "altura-corte",
            nome: "Altura de corte",
            tipo: "text",
            placeholder: "Ex.: 25–75 mm"
        },
        {
            id: "capacidade-recolhedor",
            nome: "Capacidade do recolhedor",
            tipo: "text",
            placeholder: "Ex.: 55 l"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 28 kg"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "Gasolina",
                "Elétrico",
                "Bateria"
            ]
        }
    ],


    /*========================================
        PODADORES DE CERCA VIVA
    ========================================*/
    "podadores-cerca-viva": [
        {
            id: "cilindrada",
            nome: "Cilindrada",
            tipo: "text",
            placeholder: "Ex.: 24,1 cm³"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 0,7 kW"
        },
        {
            id: "comprimento-lamina",
            nome: "Comprimento da lâmina",
            tipo: "text",
            placeholder: "Ex.: 60 cm"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 5,2 kg"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "2 tempos",
                "Elétrico",
                "Bateria"
            ]
        }
    ],


    /*========================================
        MOTOPODAS
    ========================================*/
    motopodas: [
        {
            id: "cilindrada",
            nome: "Cilindrada",
            tipo: "text",
            placeholder: "Ex.: 27,2 cm³"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 0,8 kW"
        },
        {
            id: "comprimento-sabre",
            nome: "Comprimento do sabre",
            tipo: "text",
            placeholder: "Ex.: 30 cm"
        },
        {
            id: "alcance",
            nome: "Alcance",
            tipo: "text",
            placeholder: "Ex.: 3,5 m"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 7 kg"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "2 tempos",
                "Bateria"
            ]
        }
    ],


    /*========================================
        COLHEDORES
    ========================================*/
    colhedores: [
        {
            id: "cilindrada",
            nome: "Cilindrada",
            tipo: "text",
            placeholder: "Ex.: 27,2 cm³"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 0,8 kW"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 6 kg"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "2 tempos",
                "Bateria"
            ]
        }
    ],


    /*========================================
        KOMBISYSTEM
    ========================================*/
    kombisystem: [
        {
            id: "cilindrada",
            nome: "Cilindrada",
            tipo: "text",
            placeholder: "Ex.: 27,2 cm³"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 0,8 kW"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 4,5 kg"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: [
                "2 tempos",
                "Bateria"
            ]
        }
    ],


    /*========================================
        LINHA ELÉTRICA
    ========================================*/
    "linha-eletrica": [
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1,5 kW"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "text",
            placeholder: "Ex.: 220 V"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 4 kg"
        },
        {
            id: "tipo-alimentacao",
            nome: "Alimentação",
            tipo: "select",
            opcoes: [
                "Elétrica"
            ]
        }
    ],


    /*========================================
        ASPIRADORES
    ========================================*/
    aspiradores: [
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1,4 kW"
        },
        {
            id: "vazao-ar",
            nome: "Vazão de ar",
            tipo: "text",
            placeholder: "Ex.: 210 m³/h"
        },
        {
            id: "capacidade-reservatorio",
            nome: "Capacidade do reservatório",
            tipo: "text",
            placeholder: "Ex.: 20 l"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 7,5 kg"
        },
        {
            id: "tipo-alimentacao",
            nome: "Alimentação",
            tipo: "select",
            opcoes: [
                "Elétrica",
                "Bateria"
            ]
        }
    ],


    /*========================================
        PEÇAS DE REPOSIÇÃO
    ========================================*/
    "pecas-reposicao": [
        {
            id: "codigo-peca",
            nome: "Código da peça",
            tipo: "text",
            placeholder: "Ex.: 1123 640 2000"
        },
        {
            id: "aplicacao-peca",
            nome: "Aplicação",
            tipo: "text",
            placeholder: "Ex.: MS 170"
        },
        {
            id: "material",
            nome: "Material",
            tipo: "text",
            placeholder: "Ex.: Aço"
        }
    ],


    /*========================================
        FERRAMENTAS DE CORTE
    ========================================*/
    "ferramentas-corte": [
        {
            id: "tipo-ferramenta",
            nome: "Tipo de ferramenta",
            tipo: "text",
            placeholder: "Ex.: Lâmina de corte"
        },
        {
            id: "diametro",
            nome: "Diâmetro",
            tipo: "text",
            placeholder: "Ex.: 230 mm"
        },
        {
            id: "espessura",
            nome: "Espessura",
            tipo: "text",
            placeholder: "Ex.: 2,5 mm"
        },
        {
            id: "material",
            nome: "Material",
            tipo: "text",
            placeholder: "Ex.: Aço"
        }
    ],


    /*========================================
        LUBRIFICANTES
    ========================================*/
    lubrificantes: [
        {
            id: "tipo-lubrificante",
            nome: "Tipo de lubrificante",
            tipo: "text",
            placeholder: "Ex.: Óleo para motor 2 tempos"
        },
        {
            id: "volume",
            nome: "Volume",
            tipo: "text",
            placeholder: "Ex.: 1 litro"
        },
        {
            id: "aplicacao-lubrificante",
            nome: "Aplicação",
            tipo: "text",
            placeholder: "Ex.: Motores 2 tempos"
        }
    ],


    /*========================================
        COMBUSTÍVEIS
    ========================================*/
    combustiveis: [
        {
            id: "tipo-combustivel",
            nome: "Tipo de combustível",
            tipo: "text",
            placeholder: "Ex.: Combustível para motores 2 tempos"
        },
        {
            id: "volume",
            nome: "Volume",
            tipo: "text",
            placeholder: "Ex.: 5 litros"
        }
    ],


    /*========================================
        EPIs
    ========================================*/
    epis: [
        {
            id: "tipo-epi",
            nome: "Tipo de EPI",
            tipo: "text",
            placeholder: "Ex.: Protetor auricular"
        },
        {
            id: "tamanho",
            nome: "Tamanho",
            tipo: "text",
            placeholder: "Ex.: M"
        },
        {
            id: "material",
            nome: "Material",
            tipo: "text",
            placeholder: "Ex.: Policarbonato"
        },
        {
            id: "certificacao",
            nome: "Certificação",
            tipo: "text",
            placeholder: "Ex.: CA 12345"
        }
    ],


    /*========================================
        ACESSÓRIOS
    ========================================*/
    acessorios: [
        {
            id: "tipo-acessorio",
            nome: "Tipo de acessório",
            tipo: "text",
            placeholder: "Ex.: Carregador"
        },
        {
            id: "compatibilidade",
            nome: "Compatibilidade",
            tipo: "text",
            placeholder: "Ex.: Linha STIHL AP"
        },
        {
            id: "material",
            nome: "Material",
            tipo: "text",
            placeholder: "Ex.: Plástico"
        }
    ],


    /*========================================
        LINHA A BATERIA
    ========================================*/
    "linha-bateria": [
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "text",
            placeholder: "Ex.: 36 V"
        },
        {
            id: "capacidade-bateria",
            nome: "Capacidade da bateria",
            tipo: "text",
            placeholder: "Ex.: 4,8 Ah"
        },
        {
            id: "tempo-funcionamento",
            nome: "Tempo de funcionamento",
            tipo: "text",
            placeholder: "Ex.: Até 45 min"
        },
        {
            id: "tempo-carregamento",
            nome: "Tempo de carregamento",
            tipo: "text",
            placeholder: "Ex.: 80 min"
        },
        {
            id: "peso",
            nome: "Peso",
            tipo: "text",
            placeholder: "Ex.: 3,2 kg"
        }
    ],

    /*========================================
        BOMBAS CENTRÍFUGAS
    ========================================*/
    "bombas-centrifugas": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 10 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 30 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1,5 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-entrada",
            nome: "Diâmetro de entrada",
            tipo: "text",
            placeholder: "Ex.: 1 1/2 polegada"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 1 polegada"
        },
        {
            id: "rotacao",
            nome: "Rotação",
            tipo: "text",
            placeholder: "Ex.: 3500 rpm"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: ["Elétrico", "Gasolina", "Diesel"]
        }
    ],

    /*========================================
        BOMBAS PERIFÉRICAS
    ========================================*/
    "bombas-perifericas": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 3 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 40 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-entrada",
            nome: "Diâmetro de entrada",
            tipo: "text",
            placeholder: "Ex.: 1 polegada"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 1 polegada"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: ["Elétrico"]
        }
    ],

    /*========================================
        BOMBAS SUBMERSAS
    ========================================*/
    "bombas-submersas": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 5 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 50 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 2 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 1 1/4 polegada"
        },
        {
            id: "diametro-bomba",
            nome: "Diâmetro da bomba",
            tipo: "text",
            placeholder: "Ex.: 4 polegadas"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: ["Elétrico"]
        }
    ],

    /*========================================
        BOMBAS SUBMERSÍVEIS
    ========================================*/
    "bombas-submersiveis": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 12 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 15 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: ["Elétrico"]
        }
    ],

    /*========================================
        BOMBAS AUTOASPIRANTES
    ========================================*/
    "bombas-autoaspirantes": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 15 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 35 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 2 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-entrada",
            nome: "Diâmetro de entrada",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: ["Elétrico", "Gasolina", "Diesel"]
        }
    ],

    /*========================================
        BOMBAS INJETORAS
    ========================================*/
    "bombas-injetoras": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 2 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 60 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-entrada",
            nome: "Diâmetro de entrada",
            tipo: "text",
            placeholder: "Ex.: 1 polegada"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 1 polegada"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: ["Elétrico"]
        }
    ],

    /*========================================
        MOTOBOMBAS PARA IRRIGAÇÃO
    ========================================*/
    "bombas-motobombas-irrigacao": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 30 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 40 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 5,5 cv"
        },
        {
            id: "combustivel",
            nome: "Combustível",
            tipo: "select",
            opcoes: ["Gasolina", "Diesel"]
        },
        {
            id: "diametro-entrada",
            nome: "Diâmetro de entrada",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        },
        {
            id: "rotacao",
            nome: "Rotação",
            tipo: "text",
            placeholder: "Ex.: 3600 rpm"
        }
    ],

    /*========================================
        BOMBAS PARA PISCINA
    ========================================*/
    "bombas-piscina": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 12 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 12 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-entrada",
            nome: "Diâmetro de entrada",
            tipo: "text",
            placeholder: "Ex.: 1 1/2 polegada"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 1 1/2 polegada"
        }
    ],

    /*========================================
        BOMBAS PARA IRRIGAÇÃO
    ========================================*/
    "bombas-irrigacao": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 20 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 40 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 3 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-entrada",
            nome: "Diâmetro de entrada",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        }
    ],

    /*========================================
        BOMBAS PARA POÇO
    ========================================*/
    "bombas-poco": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 5 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 80 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 2 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-bomba",
            nome: "Diâmetro da bomba",
            tipo: "text",
            placeholder: "Ex.: 4 polegadas"
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 1 1/4 polegada"
        }
    ],

    /*========================================
        BOMBAS PARA DRENAGEM
    ========================================*/
    "bombas-drenagem": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 15 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 15 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 2 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 2 polegadas"
        },
        {
            id: "tipo-motor",
            nome: "Tipo de motor",
            tipo: "select",
            opcoes: ["Elétrico"]
        }
    ],

    /*========================================
        BOMBAS PARA ESGOTO
    ========================================*/
    "bombas-esgoto": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 20 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 20 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 3 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "diametro-saida",
            nome: "Diâmetro de saída",
            tipo: "text",
            placeholder: "Ex.: 3 polegadas"
        },
        {
            id: "passagem-solidos",
            nome: "Passagem de sólidos",
            tipo: "text",
            placeholder: "Ex.: 35 mm"
        }
    ],

    /*========================================
        PRESSURIZADORES
    ========================================*/
    "bombas-pressurizadores": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 4 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 20 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 1 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "pressao-maxima",
            nome: "Pressão máxima",
            tipo: "text",
            placeholder: "Ex.: 40 mca"
        }
    ],

    /*========================================
        SISTEMAS DE PRESSURIZAÇÃO
    ========================================*/
    "bombas-sistemas-pressurizacao": [
        {
            id: "vazao",
            nome: "Vazão",
            tipo: "text",
            placeholder: "Ex.: 10 m³/h"
        },
        {
            id: "altura-manometrica",
            nome: "Altura manométrica",
            tipo: "text",
            placeholder: "Ex.: 30 m"
        },
        {
            id: "potencia",
            nome: "Potência",
            tipo: "text",
            placeholder: "Ex.: 3 cv"
        },
        {
            id: "tensao",
            nome: "Tensão",
            tipo: "select",
            opcoes: ["127 V", "220 V", "380 V", "Bivolt"]
        },
        {
            id: "fase",
            nome: "Fase",
            tipo: "select",
            opcoes: ["Monofásica", "Trifásica"]
        },
        {
            id: "pressao-maxima",
            nome: "Pressão máxima",
            tipo: "text",
            placeholder: "Ex.: 40 mca"
        },
        {
            id: "numero-bombas",
            nome: "Número de bombas",
            tipo: "text",
            placeholder: "Ex.: 2"
        }
    ],

    /*========================================
        ACESSÓRIOS PARA BOMBAS
    ========================================*/
    "bombas-acessorios": [
        {
            id: "tipo-acessorio",
            nome: "Tipo de acessório",
            tipo: "text",
            placeholder: "Ex.: Flange, válvula ou conexão"
        },
        {
            id: "diametro",
            nome: "Diâmetro",
            tipo: "text",
            placeholder: "Ex.: 1 1/2 polegada"
        },
        {
            id: "material",
            nome: "Material",
            tipo: "text",
            placeholder: "Ex.: PVC"
        },
        {
            id: "compatibilidade",
            nome: "Compatibilidade",
            tipo: "text",
            placeholder: "Ex.: Bombas 1,5 cv"
        }
    ]

};

/*==================================================
        ESPECIFICAÇÕES — MOTOR DINÂMICO
==================================================*/

const especificacoesDinamicasProduto =
    document.getElementById(
        "especificacoesDinamicasProduto"
    );


function atualizarEspecificacoesProduto() {

    if (!especificacoesDinamicasProduto) {
        return;
    }


    /*==================================================
            CATEGORIAS SELECIONADAS
    ==================================================*/

    const categoriasSelecionadas =
        Array.from(
            checkboxesCategorias
        )
        .filter(
            checkbox => checkbox.checked
        )
        .map(
            checkbox => checkbox.value
        );


    /*==================================================
            COMBINAR ESPECIFICAÇÕES
    ==================================================*/

    const especificacoesCombinadas =
        new Map();


    categoriasSelecionadas.forEach(
        categoria => {

            const configuracao =
                especificacoesCategoriasProduto[
                    categoria
                ];


            if (!configuracao) {
                return;
            }


            configuracao.forEach(
                especificacao => {

                    if (
                        !especificacoesCombinadas.has(
                            especificacao.id
                        )
                    ) {

                        especificacoesCombinadas.set(
                            especificacao.id,
                            especificacao
                        );

                    }

                }
            );

        }
    );


    /*==================================================
            NENHUMA ESPECIFICAÇÃO
    ==================================================*/

    if (
        especificacoesCombinadas.size === 0
    ) {

        especificacoesDinamicasProduto.innerHTML = `

            <div class="especificacoes-vazio">

                <i class="fa-solid fa-sliders"></i>

                <strong>
                    Nenhuma especificação cadastrada
                </strong>

                <p>
                    Esta categoria ainda não possui
                    campos técnicos configurados.
                </p>

            </div>

        `;

        return;
    }


    /*==================================================
            CRIAR CAMPOS
    ==================================================*/

    especificacoesDinamicasProduto.innerHTML = `

        <div class="especificacoes-grid">

            ${
                Array.from(
                    especificacoesCombinadas.values()
                )
                .map(
                    especificacao => {

                        /* SELECT */

                        if (
                            especificacao.tipo === "select"
                        ) {

                            return `

                                <div
                                    class="campo-especificacao"
                                >

                                    <label
                                        for="especificacao_${especificacao.id}"
                                    >
                                        ${especificacao.nome}
                                    </label>

                                    <select
                                        id="especificacao_${especificacao.id}"
                                        name="especificacao_${especificacao.id}"
                                    >

                                        <option value="">
                                            Selecione...
                                        </option>

                                        ${
                                            (
                                                especificacao.opcoes || []
                                            )
                                            .map(
                                                opcao => `
                                                    <option
                                                        value="${opcao}"
                                                    >
                                                        ${opcao}
                                                    </option>
                                                `
                                            )
                                            .join("")
                                        }

                                    </select>

                                </div>

                            `;

                        }


                        /* INPUT */

                        return `

                            <div
                                class="campo-especificacao"
                            >

                                <label
                                    for="especificacao_${especificacao.id}"
                                >
                                    ${especificacao.nome}
                                </label>

                                <input
                                    type="${especificacao.tipo || "text"}"
                                    id="especificacao_${especificacao.id}"
                                    name="especificacao_${especificacao.id}"
                                    placeholder="${especificacao.placeholder || ""}"
                                    autocomplete="off"
                                >

                            </div>

                        `;

                    }
                )
                .join("")
            }

        </div>

    `;

}
/*==================================================
        COLETAR ESPECIFICAÇÕES DO PRODUTO
==================================================*/

function obterEspecificacoesProduto() {

    const especificacoes = {};

    if (!especificacoesDinamicasProduto) {
        return especificacoes;
    }

    const campos =
        especificacoesDinamicasProduto.querySelectorAll(
            "input, select"
        );

    campos.forEach(campo => {

        if (!campo.id.startsWith("especificacao_")) {
            return;
        }

        const id =
            campo.id.replace(
                "especificacao_",
                ""
            );

        especificacoes[id] =
            campo.value.trim();

    });

    return especificacoes;
}

/*==================================================
        ATUALIZAR AO ALTERAR CATEGORIA
==================================================*/

checkboxesCategorias.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            atualizarEspecificacoesProduto
        );

    }
);


/*==================================================
        ESTADO INICIAL
==================================================*/

atualizarEspecificacoesProduto();

/*==================================================
                PRODUTOS - VIA API
==================================================*/
 
let produtosAdmin = [];


let produtoEditandoId = null;
let produtoEditando = null;

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

async function carregarCategorias() {

    const listaCategorias =
        document.getElementById("listaCategorias");

    if (!listaCategorias) {
        return;
    }

    const tokenAtual =
        localStorage.getItem("tokenCial");

    if (!tokenAtual) {
        return;
    }

    listaCategorias.innerHTML = `
        <tr>
            <td colspan="3">
                Carregando categorias...
            </td>
        </tr>
    `;

    try {

        const resposta = await fetch(
            `${API_BASE}/admin/categorias`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${tokenAtual}`
                }
            }
        );

        const resultado =
            await resposta.json();

        if (resposta.status === 401) {

            localStorage.removeItem("tokenCial");
            localStorage.removeItem("usuarioCial");

            window.location.href =
                "../cadastro/login.html";

            return;
        }

        if (!resposta.ok || !resultado.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao carregar categorias."
            );

        }

        const categorias =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];

        if (categorias.length === 0) {

            listaCategorias.innerHTML = `
                <tr>
                    <td colspan="3">
                        Nenhuma categoria encontrada.
                    </td>
                </tr>
            `;

            return;
        }

           listaCategorias.innerHTML =
            categorias.map(item => `

                <tr>

                    <td>
                        ${escaparHTML(item.nome)}
                    </td>

                    <td>
                        ${item.produtos ?? 0}
                    </td>

                    <td>

                                              <button
                            type="button"
                            class="btn-editar-categoria"
                            data-id="${item.id}"
                            data-categoria="${escaparHTML(item.nome)}"
                            data-grupo="${escaparHTML(item.grupo || "Produtos")}"
                            title="Editar categoria">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            type="button"
                            class="btn-excluir-categoria"
                            data-id="${item.id}"
                            data-categoria="${escaparHTML(item.nome)}"
                            data-grupo="${escaparHTML(item.grupo || "Produtos")}"
                            title="Excluir categoria">


                    </td>

                </tr>

            `).join("");
            
    } catch (erro) {

        console.error(
            "Erro ao carregar categorias:",
            erro
        );

        listaCategorias.innerHTML = `
            <tr>
                <td colspan="3">
                    ${escaparHTML(erro.message)}
                </td>
            </tr>
        `;

    }
}

/*==================================================
        EDITAR CATEGORIA - MODAL
==================================================*/

function abrirModalEditarCategoria(id, nomeAtual, grupoAtual) {

    const modalExistente =
        document.getElementById("modalCategoria");

    if (modalExistente) {
        modalExistente.remove();
    }

    const modal =
        document.createElement("div");

    modal.id = "modalCategoria";

    modal.innerHTML = `
        <div class="modal-categoria-overlay">

            <div class="modal-categoria">

                <div class="modal-categoria-header">

                    <div>
                        <h2>Editar Categoria</h2>

                        <p>
                            Altere o nome da categoria.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="fechar-modal-categoria"
                        id="fecharModalEditarCategoria">
                        ×
                    </button>

                </div>


                <div class="modal-categoria-body">

                    <label for="nomeEditarCategoria">
                        Nome da categoria
                    </label>

                    <input
                        type="text"
                        id="nomeEditarCategoria"
                        value="${escaparHTML(nomeAtual)}"
                        autocomplete="off"
                    >

                </div>


                <div class="modal-categoria-footer">

                    <button
                        type="button"
                        class="btn-cancelar-categoria"
                        id="cancelarModalEditarCategoria">

                        Cancelar

                    </button>


                    <button
                        type="button"
                        class="btn-salvar-categoria"
                        id="salvarModalEditarCategoria">

                        <i class="fa-solid fa-check"></i>

                        Salvar Alterações

                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    const fechar =
        document.getElementById(
            "fecharModalEditarCategoria"
        );

    const cancelar =
        document.getElementById(
            "cancelarModalEditarCategoria"
        );

    const salvar =
        document.getElementById(
            "salvarModalEditarCategoria"
        );

    const inputNome =
        document.getElementById(
            "nomeEditarCategoria"
        );


    function fecharModalEditarCategoria() {
        modal.remove();
    }


    fechar?.addEventListener(
        "click",
        fecharModalEditarCategoria
    );


    cancelar?.addEventListener(
        "click",
        fecharModalEditarCategoria
    );


    modal
        .querySelector(".modal-categoria-overlay")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.classList.contains(
                        "modal-categoria-overlay"
                    )
                ) {
                    fecharModalEditarCategoria();
                }

            }
        );


    salvar?.addEventListener(
        "click",
        async () => {

            const nome =
                inputNome.value.trim();


            if (!nome) {

                alert(
                    "Informe o nome da categoria."
                );

                inputNome.focus();

                return;
            }


            salvar.disabled = true;

            salvar.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Salvando...
            `;


            try {

                             const resposta =
                    await fetch(
                        `${API_BASE}/admin/categorias/${id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json",

                                Authorization:
                                  `Bearer ${obterTokenAtual()}`
                            },

                            body: JSON.stringify({
                                nome,
                                grupo: grupoAtual
                            })
                        }
                    );


                const resultado =
                    await resposta.json();


                if (
                    !resposta.ok ||
                    !resultado.ok
                ) {

                    throw new Error(
                        resultado.erro ||
                        "Erro ao editar categoria."
                    );

                }


                fecharModalEditarCategoria();

                await carregarCategorias();


                alert(
                    "Categoria atualizada com sucesso!"
                );


            } catch (erro) {

                console.error(
                    "Erro ao editar categoria:",
                    erro
                );


                alert(
                    `Erro ao editar categoria: ${erro.message}`
                );


                salvar.disabled = false;

                salvar.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Salvar Alterações
                `;

            }

        }
    );


    setTimeout(() => {

        inputNome?.focus();
        inputNome?.select();

    }, 50);

}

/*==================================================
        AÇÕES DAS CATEGORIAS
==================================================*/

document.addEventListener("click", async event => {

    /* EDITAR CATEGORIA */
const botaoEditar =
    event.target.closest(".btn-editar-categoria");

if (botaoEditar) {

     const id =
        Number(botaoEditar.dataset.id);

    const nomeAtual =
        botaoEditar.dataset.categoria || "";

    const grupoAtual =
        botaoEditar.dataset.grupo || "Produtos";

    abrirModalEditarCategoria(
        id,
        nomeAtual,
        grupoAtual
    );

    return;
}

 


    /* EXCLUIR CATEGORIA */
    const botaoExcluir =
        event.target.closest(".btn-excluir-categoria");

    if (botaoExcluir) {

        const id =
            Number(botaoExcluir.dataset.id);

        const nome =
            botaoExcluir.dataset.categoria || "esta categoria";

        const confirmar =
            confirm(
                `Deseja realmente excluir "${nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {

            const resposta =
                await fetch(
                    `${API_BASE}/admin/categorias/${id}`,
                    {
                        method: "DELETE",

                        headers: {
                            Accept:
                                "application/json",

                            Authorization:
                              `Bearer ${obterTokenAtual()}`
                        }
                    }
                );

            const resultado =
                await resposta.json();

            if (
                !resposta.ok ||
                !resultado.ok
            ) {
                throw new Error(
                    resultado.erro ||
                    "Erro ao excluir categoria."
                );
            }

            await carregarCategorias();

            alert(
                "Categoria excluída com sucesso!"
            );

        } catch (erro) {

            console.error(
                "Erro ao excluir categoria:",
                erro
            );

            alert(
                `Erro ao excluir categoria: ${erro.message}`
            );
        }

        return;
    }

});

/*==================================================
        NOVA CATEGORIA
==================================================*/

function abrirModalCategoria() {

    // Evita abrir dois modais
    const modalExistente =
        document.getElementById("modalCategoria");

    if (modalExistente) {
        modalExistente.remove();
    }

    const modal = document.createElement("div");

    modal.id = "modalCategoria";

    modal.innerHTML = `
        <div class="modal-categoria-overlay">

            <div class="modal-categoria">

                <div class="modal-categoria-header">
                    <div>
                        <h2>Nova Categoria</h2>
                        <p>Cadastre uma nova categoria para os produtos.</p>
                    </div>

                    <button
                        type="button"
                        class="fechar-modal-categoria"
                        id="fecharModalCategoria">
                        ×
                    </button>
                </div>

                <div class="modal-categoria-body">

                    <label for="nomeNovaCategoria">
                        Nome da categoria
                    </label>

                    <input
                        type="text"
                        id="nomeNovaCategoria"
                        placeholder="Ex.: Bombas Centrífugas"
                        autocomplete="off"
                    >

                    <label for="grupoNovaCategoria">
                        Grupo
                    </label>

                    <select id="grupoNovaCategoria">

                        <option value="Produtos">
                            Produtos
                        </option>

                        <option value="STIHL">
                            STIHL
                        </option>

                        <option value="Bombas">
                            Bombas
                        </option>

                        <option value="Irrigação">
                            Irrigação
                        </option>

                    </select>

                </div>

                <div class="modal-categoria-footer">

                    <button
                        type="button"
                        class="btn-cancelar-categoria"
                        id="cancelarModalCategoria">
                        Cancelar
                    </button>

                    <button
                        type="button"
                        class="btn-salvar-categoria"
                        id="salvarModalCategoria">
                        <i class="fa-solid fa-check"></i>
                        Salvar Categoria
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    const fechar =
        document.getElementById(
            "fecharModalCategoria"
        );

    const cancelar =
        document.getElementById(
            "cancelarModalCategoria"
        );

    const salvar =
        document.getElementById(
            "salvarModalCategoria"
        );

    const inputNome =
        document.getElementById(
            "nomeNovaCategoria"
        );


    function fecharModalCategoria() {
        modal.remove();
    }


    fechar?.addEventListener(
        "click",
        fecharModalCategoria
    );

    cancelar?.addEventListener(
        "click",
        fecharModalCategoria
    );


    // Fechar clicando fora do modal
    modal
        .querySelector(".modal-categoria-overlay")
        ?.addEventListener("click", event => {

            if (
                event.target.classList.contains(
                    "modal-categoria-overlay"
                )
            ) {
                fecharModalCategoria();
            }

        });


    salvar?.addEventListener(
        "click",
        async () => {

            const nome =
                inputNome.value.trim();

            const grupo =
                document.getElementById(
                    "grupoNovaCategoria"
                ).value;


            if (!nome) {

                alert(
                    "Informe o nome da categoria."
                );

                inputNome.focus();

                return;
            }


            salvar.disabled = true;

            salvar.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Salvando...
            `;


            try {

                const resposta =
                    await fetch(
                        `${API_BASE}/admin/categorias`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json",

                                Authorization:
                                 `Bearer ${obterTokenAtual()}`
                            },

                            body: JSON.stringify({
                                nome,
                                grupo
                            })
                        }
                    );


                const resultado =
                    await resposta.json();


                if (
                    !resposta.ok ||
                    !resultado.ok
                ) {

                    throw new Error(
                        resultado.erro ||
                        "Erro ao criar categoria."
                    );

                }


                fecharModalCategoria();

                await carregarCategorias();


                alert(
                    "Categoria criada com sucesso!"
                );


            } catch (erro) {

                console.error(
                    "Erro ao criar categoria:",
                    erro
                );

                alert(
                    `Erro ao criar categoria: ${erro.message}`
                );


                salvar.disabled = false;

                salvar.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Salvar Categoria
                `;

            }

        }
    );


    // Foco automático
    setTimeout(() => {
        inputNome?.focus();
    }, 50);

}

async function criarProduto(dados) {
  const res = await fetch(`${API_BASE}/admin/produtos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
     "Authorization": `Bearer ${obterTokenAtual()}`
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
    "Authorization": `Bearer ${obterTokenAtual()}`
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
  const url = `${API_BASE}/admin/produtos/${id}`;

  console.log("Excluindo produto:", id);
  console.log("URL:", url);

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
    "Authorization": `Bearer ${obterTokenAtual()}`
    }
  });

  const text = await res.text();

  console.log("Status HTTP:", res.status);
  console.log("Resposta bruta:", text.slice(0, 500)); // limita pra não poluir demais

  // Se o status já indicar erro, lança já
  if (!res.ok) {
    let mensagem = `Erro ${res.status} ao excluir produto`;

    // tenta extrair mensagem do JSON, se for o caso
    try {
      const json = JSON.parse(text);
      if (json && json.erro) {
        mensagem += ": " + json.erro;
      }
    } catch {
      // não era JSON, ignora
    }

    throw new Error(mensagem);
  }

  // tenta transformar em JSON
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("Resposta não é JSON:", text.slice(0, 300));
    throw new Error("A API não retornou JSON. Veja o console.");
  }

  if (!json.ok) {
    throw new Error(json.erro || "Erro ao excluir produto");
  }
}


/*==================================================
            DASHBOARD ADMINISTRATIVO
==================================================*/

async function carregarDashboardAdmin() {

  try {

    const tokenAtual =
      localStorage.getItem("tokenCial");

    if (!tokenAtual) {
      throw new Error(
        "Token não encontrado. Faça login novamente."
      );
    }

    const resposta = await fetch(
      `${API_BASE}/admin/dashboard`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokenAtual}`
        }
      }
    );

    const resultado =
      await resposta.json();

    if (resposta.status === 401) {

      localStorage.removeItem("tokenCial");
      localStorage.removeItem("usuarioCial");

      alert(
        resultado.erro ||
        "Sua sessão expirou. Faça login novamente."
      );

      window.location.href =
        "../cadastro/login.html";

      return;
    }

    if (!resposta.ok || !resultado.ok) {
      throw new Error(
        resultado.erro ||
        "Erro ao carregar Dashboard."
      );
    }

    const dados =
      resultado.data || {};

    /* =========================
       CARDS
    ========================= */

    const totalProdutos =
      document.getElementById("totalProdutos");

    const totalPedidos =
      document.getElementById("totalPedidos");

    const totalClientes =
      document.getElementById("totalClientes");

    const faturamento =
      document.getElementById("faturamento");

    const pedidosHoje =
      document.getElementById("pedidosHoje");

    const estoqueBaixo =
      document.getElementById("estoqueBaixo");


    if (totalProdutos) {
      totalProdutos.textContent =
        dados.totalProdutos ?? 0;
    }

    if (totalPedidos) {
      totalPedidos.textContent =
        dados.totalPedidos ?? 0;
    }

    if (totalClientes) {
      totalClientes.textContent =
        dados.totalClientes ?? 0;
    }

    if (faturamento) {
      faturamento.textContent =
        formatarMoeda(dados.faturamento ?? 0);
    }

    if (pedidosHoje) {
      pedidosHoje.textContent =
        dados.pedidosHoje ?? 0;
    }

    if (estoqueBaixo) {
      estoqueBaixo.textContent =
        dados.estoqueBaixo ?? 0;
    }


    /* =========================
       ÚLTIMOS PEDIDOS
    ========================= */

    const tabela =
      document.getElementById("ultimosPedidos");

    if (!tabela) {
      return;
    }

    const pedidos =
      Array.isArray(dados.ultimosPedidos)
        ? dados.ultimosPedidos
        : [];


    if (pedidos.length === 0) {

      tabela.innerHTML = `
        <tr>
          <td colspan="5">
            Nenhum pedido encontrado.
          </td>
        </tr>
      `;

      return;
    }


    tabela.innerHTML =
      pedidos.map(pedido => {

        const data =
          pedido.data_pedido
            ? new Date(
                pedido.data_pedido
              ).toLocaleDateString("pt-BR")
            : "-";

      const status =
    pedido.status || "";

const cliente =
    pedido.cliente || "";

             return `
          <tr>

            <td>
              #${escaparHTML(
                pedido.id
              )}
            </td>

            <td>
              ${escaparHTML(cliente)}
            </td>

            <td>
              ${escaparHTML(status)}
            </td>

            <td>
              ${formatarMoeda(
                pedido.total ??
                pedido.valor ??
                0
              )}
            </td>

            <td>
              ${data}
            </td>

          </tr>
        `;

      }).join("");


  } catch (erro) {

    console.error(
      "Erro ao carregar Dashboard:",
      erro
    );

  }

}

/*==================================================
        RELATÓRIOS ADMINISTRATIVOS
==================================================*/

async function carregarRelatoriosAdmin() {

    const faturamento =
        document.getElementById(
            "relatorioFaturamento"
        );

    const produtosVendidos =
        document.getElementById(
            "relatorioProdutosVendidos"
        );

    const novosClientes =
        document.getElementById(
            "relatorioNovosClientes"
        );

    const produtosAtivos =
        document.getElementById(
            "relatorioProdutosAtivos"
        );

    if (
        !faturamento &&
        !produtosVendidos &&
        !novosClientes &&
        !produtosAtivos
    ) {
        return;
    }

    const tokenAtual =
        localStorage.getItem("tokenCial");

    if (!tokenAtual) {
        return;
    }

    try {

        const resposta = await fetch(
            `${API_BASE}/admin/relatorios`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization:
                        `Bearer ${tokenAtual}`
                }
            }
        );

        const resultado =
            await resposta.json();

        if (resposta.status === 401) {

            localStorage.removeItem("tokenCial");
            localStorage.removeItem("usuarioCial");

            alert(
                resultado.erro ||
                "Sua sessão expirou. Faça login novamente."
            );

            window.location.href =
                "../cadastro/login.html";

            return;
        }

        if (
            !resposta.ok ||
            !resultado.ok
        ) {
            throw new Error(
                resultado.erro ||
                "Erro ao carregar relatórios."
            );
        }

        const dados =
            resultado.data || {};

        if (faturamento) {
            faturamento.textContent =
                formatarMoeda(
                    dados.faturamentoMensal || 0
                );
        }

        if (produtosVendidos) {
            produtosVendidos.textContent =
                dados.produtosVendidos || 0;
        }

        if (novosClientes) {
            novosClientes.textContent =
                dados.novosClientes || 0;
        }

        if (produtosAtivos) {
            produtosAtivos.textContent =
                dados.produtosAtivos || 0;
        }

        console.log(
            "Relatórios carregados:",
            dados
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar relatórios:",
            erro
        );

    }

}

/*==================================================
        ABAS — PEDIDOS / ORÇAMENTOS
==================================================*/

function inicializarAbasPedidos() {

    const abas =
        document.querySelectorAll("[data-aba-pedido]");

    const painelPedidos =
        document.getElementById("painelPedidos");

    const painelOrcamentos =
        document.getElementById("painelOrcamentos");


    if (
        !abas.length ||
        !painelPedidos ||
        !painelOrcamentos
    ) {
        return;
    }


    abas.forEach(aba => {

        aba.addEventListener("click", () => {

            const tipo =
                aba.dataset.abaPedido;


            // Remove estado ativo
            abas.forEach(item => {
                item.classList.remove("ativa");
            });


            // Ativa a aba clicada
            aba.classList.add("ativa");


            // ==========================
            // PEDIDOS
            // ==========================

            if (tipo === "pedidos") {

                painelPedidos.style.display = "";
                painelOrcamentos.style.display = "none";

                carregarPedidosAdmin();

                return;
            }


            // ==========================
            // ORÇAMENTOS
            // ==========================

            if (tipo === "orcamentos") {

                painelPedidos.style.display = "none";
                painelOrcamentos.style.display = "";

                carregarOrcamentosAdmin();

            }

        });

    });

}

/*==================================================
        PEDIDOS — ADMINISTRATIVO
==================================================*/

async function carregarPedidosAdmin() {

    const tabela =
        document.getElementById("listaPedidos");


    if (!tabela) {
        return;
    }


    const tokenAtual =
        localStorage.getItem("tokenCial");


    if (!tokenAtual) {

        tabela.innerHTML = `
            <tr>
                <td colspan="7">
                    Sessão não encontrada.
                </td>
            </tr>
        `;

        return;
    }


    tabela.innerHTML = `
        <tr>
            <td colspan="7">
                Carregando pedidos...
            </td>
        </tr>
    `;


    try {

        const resposta = await fetch(
            `${API_BASE}/admin/pedidos`,
            {
                method: "GET",

                headers: {
                    Accept: "application/json",

                    Authorization:
                        `Bearer ${tokenAtual}`
                }
            }
        );


        const resultado =
            await resposta.json();


        if (resposta.status === 401) {

            localStorage.removeItem(
                "tokenCial"
            );

            localStorage.removeItem(
                "usuarioCial"
            );

            window.location.href =
                "../cadastro/login.html";

            return;
        }


        if (
            !resposta.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao carregar pedidos."
            );

        }


        const pedidos =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        if (pedidos.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="7">
                        Nenhum pedido encontrado.
                    </td>
                </tr>
            `;

            return;
        }


        tabela.innerHTML =
            pedidos.map(pedido => {

                const numero =
                    pedido.numero || "-";


                const cliente =
                    pedido.cliente || "-";


                const pagamento =
                    pedido.pagamento || "-";


                const status =
                    pedido.status || "-";


                const data =
                    pedido.data_pedido
                        ? new Date(
                            pedido.data_pedido
                        ).toLocaleDateString(
                            "pt-BR"
                        )
                        : "-";


               const valor =
    formatarMoeda(
        pedido.total ?? pedido.valor ?? 0
    );

                return `
                    <tr>

                        <td>
                            ${escaparHTML(numero)}
                        </td>

                        <td>
                            ${escaparHTML(cliente)}
                        </td>

                        <td>
                            ${escaparHTML(pagamento)}
                        </td>

                        <td>
                            ${escaparHTML(status)}
                        </td>

                        <td>
                            ${data}
                        </td>

                        <td>
                            ${valor}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn-acao-pedido"
                              data-id="${pedido.id}"
                            >
                                <i class="fa-solid fa-eye"></i>
                                Ver
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar pedidos:",
            erro
        );


        tabela.innerHTML = `
            <tr>
                <td colspan="7">
                    ${escaparHTML(
                        erro.message
                    )}
                </td>
            </tr>
        `;

    }

}

/*==================================================
        ORÇAMENTOS — ADMINISTRATIVO
==================================================*/

async function carregarOrcamentosAdmin() {

    const tabela =
        document.getElementById("listaOrcamentos");

    if (!tabela) {
        return;
    }

    const tokenAtual =
        localStorage.getItem("tokenCial");

    if (!tokenAtual) {

        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    Sessão não encontrada.
                </td>
            </tr>
        `;

        return;
    }

    tabela.innerHTML = `
        <tr>
            <td colspan="6">
                Carregando orçamentos...
            </td>
        </tr>
    `;

    try {

        const resposta = await fetch(
            `${API_BASE}/admin/orcamentos`,
            {
                method: "GET",

                headers: {
                    Accept: "application/json",
                    Authorization:
                        `Bearer ${tokenAtual}`
                }
            }
        );

        const resultado =
            await resposta.json();

        if (resposta.status === 401) {

            localStorage.removeItem(
                "tokenCial"
            );

            localStorage.removeItem(
                "usuarioCial"
            );

            window.location.href =
                "../cadastro/login.html";

            return;
        }

        if (
            !resposta.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao carregar orçamentos."
            );
        }

        const orcamentos =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];

        if (orcamentos.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhum orçamento encontrado.
                    </td>
                </tr>
            `;

            return;
        }

        tabela.innerHTML =
            orcamentos.map(orcamento => {

                const numero =
                    orcamento.numero || "-";

                const cliente =
                    orcamento.cliente ||
                    orcamento.usuarios?.nome ||
                    "-";

                const data =
                    orcamento.data_solicitacao
                        ? new Date(
                            orcamento.data_solicitacao
                        ).toLocaleDateString(
                            "pt-BR"
                        )
                        : "-";

              const valor =
    formatarMoeda(
        orcamento.valor_total ??
        orcamento.valor ??
        0
    );

                const status =
                    orcamento.status ||
                    "EM ANÁLISE";

                return `
                    <tr>

                        <td>
                            ${escaparHTML(numero)}
                        </td>

                        <td>
                            ${escaparHTML(cliente)}
                        </td>

                        <td>
                            ${data}
                        </td>

                        <td>
                            ${valor}
                        </td>

                        <td>
                            ${escaparHTML(status)}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn-acao-pedido"
                           data-id="${orcamento.id}"
                            >
                                <i class="fa-solid fa-eye"></i>
                                Ver
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    } catch (erro) {

        console.error(
            "Erro ao carregar orçamentos:",
            erro
        );

        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    ${escaparHTML(
                        erro.message
                    )}
                </td>
            </tr>
        `;
    }
}


/*==================================================
        VER ORÇAMENTO — ADMINISTRATIVO
==================================================*/

async function verOrcamentoAdmin(id) {

    try {

        if (!id) {
            alert("Orçamento inválido.");
            return;
        }


       const modal =
    document.getElementById(
        "modalDetalhesOrcamento"
    );


if (!modal) {
    alert(
        "Modal de orçamento não encontrado."
    );
    return;
}


modal.dataset.orcamentoId = id;


        // ==========================================
        // ABRE O MODAL
        // ==========================================

        modal.classList.add("ativo");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        // ==========================================
        // CARREGANDO
        // ==========================================

        const numero =
            document.getElementById(
                "orcamentoModalNumero"
            );

        const identificacao =
            document.getElementById(
                "orcamentoModalIdentificacao"
            );

        const itens =
            document.getElementById(
                "orcamentoModalItens"
            );


        if (numero) {
            numero.textContent =
                "Carregando orçamento...";
        }


        if (identificacao) {
            identificacao.textContent =
                "Buscando informações...";
        }


        if (itens) {
            itens.innerHTML = `
                <tr>
                    <td colspan="4">
                        Carregando itens...
                    </td>
                </tr>
            `;
        }


        // ==========================================
        // TOKEN
        // ==========================================

        const tokenAtual =
            localStorage.getItem(
                "tokenCial"
            );


        if (!tokenAtual) {

            throw new Error(
                "Sessão não encontrada."
            );

        }


        // ==========================================
        // BUSCA O ORÇAMENTO
        // ==========================================

        const resposta =
            await fetch(
                `${API_BASE}/admin/orcamentos/${id}`,
                {
                    method: "GET",

                    headers: {
                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${tokenAtual}`
                    }
                }
            );


        const resultado =
            await resposta.json();


        if (
            !resposta.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao carregar orçamento."
            );

        }


        const orcamento =
            resultado.data;


        console.log(
            "📄 ORÇAMENTO CARREGADO:",
            orcamento
        );


        // ==========================================
        // CLIENTE
        // ==========================================

        const cliente =
            orcamento.usuarios || {};


        const campoCliente =
            document.getElementById(
                "orcamentoModalCliente"
            );

        const campoEmail =
            document.getElementById(
                "orcamentoModalEmail"
            );

        const campoTelefone =
            document.getElementById(
                "orcamentoModalTelefone"
            );

        const campoData =
            document.getElementById(
                "orcamentoModalData"
            );


        if (campoCliente) {

            campoCliente.textContent =
                cliente.nome ||
                orcamento.cliente ||
                "Não informado";

        }


        if (campoEmail) {

            campoEmail.textContent =
                cliente.email ||
                "Não informado";

        }


        if (campoTelefone) {

            campoTelefone.textContent =
                cliente.telefone ||
                "Não informado";

        }


        if (campoData) {

            campoData.textContent =
                orcamento.data_solicitacao
                    ? new Date(
                        orcamento.data_solicitacao
                    ).toLocaleDateString(
                        "pt-BR"
                    )
                    : "Não informada";

        }


        // ==========================================
        // CABEÇALHO
        // ==========================================

        if (numero) {

            numero.textContent =
                orcamento.numero ||
                `#${orcamento.id}`;

        }


        if (identificacao) {

            identificacao.textContent =
                "Solicitação de orçamento";

        }


        // ==========================================
        // STATUS
        // ==========================================

     const campoStatus =
    document.getElementById(
        "orcamentoModalStatus"
    );

const statusOriginal =
    orcamento.status ||
    "analise";

const textosStatus = {
    analise: "EM ANÁLISE",
    em_analise: "EM ANÁLISE",
    aprovado: "APROVADO",
    recusado: "RECUSADO",
    finalizado: "FINALIZADO"
};

const statusTexto =
    textosStatus[statusOriginal] ||
    "EM ANÁLISE";

const selectStatus =
    document.getElementById(
        "selectStatusOrcamento"
    );

if (selectStatus) {

    selectStatus.value =
        statusOriginal === "analise"
            ? "em_analise"
            : statusOriginal;

}

if (campoStatus) {

    campoStatus.textContent =
        statusTexto;

}

        // ==========================================
        // ITENS
        // ==========================================

        const listaItens =
            Array.isArray(
                orcamento.itens
            )
                ? orcamento.itens
                : [];


        if (!itens) {
            return;
        }


        if (listaItens.length === 0) {

            itens.innerHTML = `
                <tr>
                    <td colspan="4">
                        Nenhum item encontrado.
                    </td>
                </tr>
            `;

        } else {

            itens.innerHTML =
                listaItens
                    .map(item => {

                        const quantidade =
                            Number(
                                item.quantidade
                            ) || 0;


                        const precoUnitario =
                            Number(
                                item.preco_unitario
                            ) || 0;


                        const subtotal =
                            Number(
                                item.subtotal
                            ) ||
                            (
                                quantidade *
                                precoUnitario
                            );


                        return `
                            <tr>

                                <td>
                                    ${escaparHTML(
                                        item.produto_nome ||
                                        "Produto"
                                    )}
                                </td>

                                <td>
                                    ${quantidade}
                                </td>

                                <td>
                                    ${formatarMoeda(
                                        precoUnitario
                                    )}
                                </td>

                                <td>
                                    ${formatarMoeda(
                                        subtotal
                                    )}
                                </td>

                            </tr>
                        `;

                    })
                    .join("");

        }


        // ==========================================
        // TOTAL
        // ==========================================

        
const subtotalOrcamento =
    listaItens.reduce(
        (total, item) => {

            const quantidade =
                Number(
                    item.quantidade
                ) || 0;

            const precoUnitario =
                Number(
                    item.preco_unitario
                ) || 0;

            const subtotalItem =
                Number(
                    item.subtotal
                ) ||
                (
                    quantidade *
                    precoUnitario
                );

            return total + subtotalItem;
        },
        0
    );


const valorTotal =
    Number(
        orcamento.valor_total ??
        orcamento.valor ??
        0
    );


const campoSubtotal =
    document.getElementById(
        "orcamentoModalSubtotal"
    );


const campoTotal =
    document.getElementById(
        "orcamentoModalTotal"
    );


if (campoSubtotal) {

    campoSubtotal.textContent =
        formatarMoeda(
            subtotalOrcamento
        );

}


if (campoTotal) {

    campoTotal.textContent =
        formatarMoeda(
            valorTotal
        );

}

        // ==========================================
        // OBSERVAÇÕES
        // ==========================================

        const campoObservacoes =
            document.getElementById(
                "orcamentoModalObservacoes"
            );


        if (campoObservacoes) {

            campoObservacoes.textContent =
                orcamento.observacoes ||
                "Nenhuma observação informada.";

        }


    } catch (erro) {

        console.error(
            "Erro ao visualizar orçamento:",
            erro
        );


        const modal =
            document.getElementById(
                "modalDetalhesOrcamento"
            );


        if (modal) {

            modal.classList.remove(
                "ativo"
            );

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        alert(
            `Erro ao carregar orçamento: ${erro.message}`
        );

    }

}


/*==================================================
        FECHAR MODAL — ORÇAMENTO
==================================================*/

function fecharModalOrcamento() {

    const modal =
        document.getElementById(
            "modalDetalhesOrcamento"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "ativo"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/*==================================================
        IMPRIMIR ORÇAMENTO
==================================================*/

function imprimirOrcamento() {

    const conteudo =
        document.querySelector(
            "#modalDetalhesOrcamento .modal-orcamento-conteudo"
        );

    if (!conteudo) {

        alert(
            "Conteúdo do orçamento não encontrado."
        );

        return;
    }


    const numero =
        document.getElementById(
            "orcamentoModalNumero"
        )?.textContent.trim() || "Orçamento";


    const janela =
        window.open(
            "",
            "_blank",
            "width=1000,height=800"
        );


    if (!janela) {

        alert(
            "O navegador bloqueou a janela de impressão. Permita pop-ups para continuar."
        );

        return;
    }


    janela.document.write(`

        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>
                ${numero}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #222;

                    margin: 30px;

                    background: #fff;
                }


                h1,
                h2,
                h3 {

                    color: #222;
                }


                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 15px;
                }


                th,
                td {

                    border:
                        1px solid #ddd;

                    padding: 10px;

                    text-align: left;
                }


                th {

                    background:
                        #f5f5f5;

                    font-weight: 700;
                }


                button,
                .modal-orcamento-fechar {

                    display:
                        none !important;
                }


                .modal-orcamento-footer {

                    display:
                        none !important;
                }


                @media print {

                    body {

                        margin: 15mm;
                    }

                }

            </style>

        </head>


        <body>

            ${conteudo.innerHTML}

        </body>

        </html>

    `);


    janela.document.close();


    janela.onload = () => {

        janela.focus();

        janela.print();

        janela.close();

    };

}


/*==================================================
        SALVAR ORÇAMENTO EM PDF
==================================================*/

function salvarOrcamentoPDF() {

    /*
     * O navegador abrirá a janela de impressão.
     * Nela, o administrador poderá escolher
     * "Salvar como PDF".
     */

    imprimirOrcamento();

}


/*==================================================
        EVENTOS — MODAL ORÇAMENTO
==================================================*/

const fecharModalOrcamentoBtn =
    document.getElementById(
        "fecharModalOrcamento"
    );


const btnFecharOrcamentoModal =
    document.getElementById(
        "btnFecharOrcamentoModal"
    );


const btnImprimirOrcamento =
    document.getElementById(
        "btnImprimirOrcamento"
    );


const btnPdfOrcamento =
    document.getElementById(
        "btnPdfOrcamento"
    );


/*==================================================
        FECHAR
==================================================*/

fecharModalOrcamentoBtn?.addEventListener(
    "click",
    fecharModalOrcamento
);


btnFecharOrcamentoModal?.addEventListener(
    "click",
    fecharModalOrcamento
);


/*==================================================
        IMPRIMIR
==================================================*/

btnImprimirOrcamento?.addEventListener(
    "click",
    imprimirOrcamento
);


/*==================================================
        SALVAR PDF
==================================================*/

btnPdfOrcamento?.addEventListener(
    "click",
    salvarOrcamentoPDF
);


/*==================================================
        FECHAR CLICANDO FORA
==================================================*/

const modalDetalhesOrcamento =
    document.getElementById(
        "modalDetalhesOrcamento"
    );


modalDetalhesOrcamento?.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            modalDetalhesOrcamento
        ) {

            fecharModalOrcamento();

        }

    }
);

/*==================================================
        MODAL — DETALHES DO PEDIDO
==================================================*/

const modalDetalhesPedido =
    document.getElementById("modalDetalhesPedido");

const fecharModalPedido =
    document.getElementById("fecharModalPedido");

const btnFecharPedidoModal =
    document.getElementById("btnFecharPedidoModal");

const btnSalvarStatusPedido =
    document.getElementById("btnSalvarStatusPedido");


let pedidoAtualAdmin = null;


/*==================================================
        ABRIR MODAL
==================================================*/

async function verPedidoAdmin(idPedido) {

    if (!modalDetalhesPedido) {
        console.error(
            "Modal de detalhes do pedido não encontrado."
        );

        return;
    }


    const tokenAtual =
        localStorage.getItem("tokenCial");


    if (!tokenAtual) {

        alert(
            "Sua sessão expirou. Faça login novamente."
        );

        window.location.href =
            "../cadastro/login.html";

        return;
    }


    /* ESTADO DE CARREGAMENTO */

    modalDetalhesPedido.classList.add("ativo");

    modalDetalhesPedido.setAttribute(
        "aria-hidden",
        "false"
    );


    preencherModalPedidoCarregando();


    try {

        const resposta = await fetch(
            `${API_BASE}/admin/pedidos/${idPedido}`,
            {
                method: "GET",

                headers: {
                    Accept: "application/json",

                    Authorization:
                        `Bearer ${tokenAtual}`
                }
            }
        );


        const resultado =
            await resposta.json();


        if (resposta.status === 401) {

            localStorage.removeItem(
                "tokenCial"
            );

            localStorage.removeItem(
                "usuarioCial"
            );

            alert(
                "Sua sessão expirou. Faça login novamente."
            );

            window.location.href =
                "../cadastro/login.html";

            return;
        }


        if (
            !resposta.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao carregar os detalhes do pedido."
            );

        }


        const pedido =
            resultado.data || resultado.pedido;


        if (!pedido) {

            throw new Error(
                "A API não retornou os dados do pedido."
            );

        }


        pedidoAtualAdmin = pedido;


        preencherModalPedido(pedido);


    } catch (erro) {

        console.error(
            "Erro ao abrir pedido:",
            erro
        );


        preencherModalPedidoErro(
            erro.message
        );

    }

}


/*==================================================
        CARREGANDO
==================================================*/

function preencherModalPedidoCarregando() {

    const numero =
        document.getElementById(
            "pedidoModalNumero"
        );

    const identificacao =
        document.getElementById(
            "pedidoModalIdentificacao"
        );

    const campos = [
        "pedidoModalCliente",
        "pedidoModalEmail",
        "pedidoModalTelefone",
        "pedidoModalCpf",
        "pedidoModalPagamento",
        "pedidoModalData",
        "pedidoModalAtualizado",
        "pedidoModalEndereco",
        "pedidoModalObservacoes"
    ];


    if (numero) {
        numero.textContent =
            "Pedido #—";
    }


    if (identificacao) {
        identificacao.textContent =
            "Carregando informações...";
    }


    campos.forEach(id => {

        const elemento =
            document.getElementById(id);

        if (elemento) {
            elemento.textContent =
                "Carregando...";
        }

    });


    const itens =
        document.getElementById(
            "pedidoModalItens"
        );

    if (itens) {

        itens.innerHTML = `
            <tr>
                <td colspan="4">
                    Carregando itens...
                </td>
            </tr>
        `;

    }

}


/*==================================================
        PREENCHER MODAL
==================================================*/

function preencherModalPedido(pedido) {

    const usuario =
        pedido.usuario ||
        pedido.cliente_dados ||
        {};


    const numero =
        pedido.numero ||
        pedido.id ||
        "—";


    const cliente =
        pedido.cliente ||
        usuario.nome ||
        pedido.nome_cliente ||
        "—";


    const email =
        pedido.email ||
        usuario.email ||
        "—";


    const telefone =
        pedido.telefone ||
        usuario.telefone ||
        "—";


    const cpf =
        pedido.cpf ||
        usuario.cpf ||
        "—";


    const pagamento =
        pedido.pagamento ||
        pedido.forma_pagamento ||
        pedido.metodo_pagamento ||
        "—";


    const data =
        formatarDataPedido(
            pedido.data_pedido
        );


    const atualizado =
        formatarDataPedido(
            pedido.updated_at ||
            pedido.atualizado_em ||
            pedido.data_atualizacao
        );


    const status =
        pedido.status || "";


    /* CABEÇALHO */

    const elementoNumero =
        document.getElementById(
            "pedidoModalNumero"
        );

    if (elementoNumero) {

        elementoNumero.textContent =
            `Pedido #${numero}`;

    }


    const identificacao =
        document.getElementById(
            "pedidoModalIdentificacao"
        );

    if (identificacao) {

        identificacao.textContent =
            "Informações completas do pedido";

    }


    /* CLIENTE */

    definirTexto(
        "pedidoModalCliente",
        cliente
    );

    definirTexto(
        "pedidoModalEmail",
        email
    );

    definirTexto(
        "pedidoModalTelefone",
        telefone
    );

    definirTexto(
        "pedidoModalCpf",
        cpf
    );


    /* PEDIDO */

    const selectStatus =
        document.getElementById(
            "pedidoModalStatus"
        );

    if (selectStatus) {

        selectStatus.value =
            status;

    }


    definirTexto(
        "pedidoModalPagamento",
        pagamento
    );

    definirTexto(
        "pedidoModalData",
        data
    );

    definirTexto(
        "pedidoModalAtualizado",
        atualizado
    );


    /* ITENS */

    preencherItensPedido(
        pedido
    );


    /* ENTREGA */

    preencherEnderecoPedido(
        pedido
    );


    /* OBSERVAÇÕES */

    const observacoes =
        pedido.observacoes ||
        pedido.observacao ||
        pedido.notas ||
        pedido.nota ||
        "—";


    definirTexto(
        "pedidoModalObservacoes",
        observacoes
    );


    /* RESUMO */

    const subtotal =
        calcularSubtotalPedido(
            pedido
        );


    const frete =
        Number(
            pedido.frete ||
            pedido.valor_frete ||
            0
        );


    const desconto =
        Number(
            pedido.desconto ||
            pedido.valor_desconto ||
            0
        );


    const total =
        Number(
            pedido.total ||
            pedido.valor ||
            subtotal + frete - desconto
        );


    definirTexto(
        "pedidoModalSubtotal",
        formatarMoeda(subtotal)
    );


    definirTexto(
        "pedidoModalFrete",
        formatarMoeda(frete)
    );


    definirTexto(
        "pedidoModalDesconto",
        formatarMoeda(desconto)
    );


    definirTexto(
        "pedidoModalTotal",
        formatarMoeda(total)
    );

}


/*==================================================
        ITENS DO PEDIDO
==================================================*/

function preencherItensPedido(pedido) {

    const tabela =
        document.getElementById(
            "pedidoModalItens"
        );


    if (!tabela) {
        return;
    }


    const itens =
        Array.isArray(pedido.itens)
            ? pedido.itens
            : Array.isArray(pedido.pedido_itens)
                ? pedido.pedido_itens
                : [];


    if (itens.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="4">
                    Nenhum item encontrado neste pedido.
                </td>
            </tr>
        `;

        return;
    }


    tabela.innerHTML =
        itens.map(item => {

            const nome =
                item.produto_nome ||
                item.nome ||
                item.produto?.nome ||
                "Produto";


            const quantidade =
                Number(
                    item.quantidade || 0
                );


            const preco =
                Number(
                    item.preco_unitario ||
                    item.preco ||
                    item.valor_unitario ||
                    0
                );


            const total =
                quantidade * preco;


            return `
                <tr>

                    <td>
                        ${escaparHTML(nome)}
                    </td>

                    <td>
                        ${quantidade}
                    </td>

                    <td>
                        ${formatarMoeda(preco)}
                    </td>

                    <td>
                        ${formatarMoeda(total)}
                    </td>

                </tr>
            `;

        }).join("");

}


/*==================================================
        ENDEREÇO
==================================================*/

function preencherEnderecoPedido(pedido) {

    const elemento =
        document.getElementById(
            "pedidoModalEndereco"
        );


    if (!elemento) {
        return;
    }


    const endereco =
        pedido.endereco_entrega ||
        pedido.endereco ||
        pedido.endereco_entrega_completo ||
        pedido.dados_entrega;


    if (!endereco) {

        elemento.textContent =
            "Nenhum endereço informado.";

        return;

    }


    if (typeof endereco === "string") {

        elemento.textContent =
            endereco;

        return;

    }


    const partes = [

        endereco.rua,

        endereco.numero &&
            `nº ${endereco.numero}`,

        endereco.complemento,

        endereco.bairro,

        endereco.cidade,

        endereco.estado,

        endereco.cep &&
            `CEP ${endereco.cep}`

    ].filter(Boolean);


    elemento.textContent =
        partes.length
            ? partes.join(", ")
            : "Nenhum endereço informado.";

}


/*==================================================
        SUBTOTAL
==================================================*/

function calcularSubtotalPedido(pedido) {

    if (
        pedido.subtotal !== undefined &&
        pedido.subtotal !== null
    ) {

        return Number(
            pedido.subtotal
        ) || 0;

    }


    const itens =
        Array.isArray(pedido.itens)
            ? pedido.itens
            : Array.isArray(pedido.pedido_itens)
                ? pedido.pedido_itens
                : [];


    return itens.reduce(
        (total, item) => {

            const quantidade =
                Number(
                    item.quantidade || 0
                );


            const preco =
                Number(
                    item.preco_unitario ||
                    item.preco ||
                    0
                );


            return total +
                (quantidade * preco);

        },
        0
    );

}


/*==================================================
        ERRO
==================================================*/

function preencherModalPedidoErro(mensagem) {

    definirTexto(
        "pedidoModalNumero",
        "Pedido"
    );


    definirTexto(
        "pedidoModalIdentificacao",
        mensagem || "Erro ao carregar pedido."
    );


    const tabela =
        document.getElementById(
            "pedidoModalItens"
        );


    if (tabela) {

        tabela.innerHTML = `
            <tr>
                <td colspan="4">
                    Não foi possível carregar os itens.
                </td>
            </tr>
        `;

    }

}


/*==================================================
        AUXILIARES
==================================================*/

function definirTexto(id, valor) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {
        return;
    }


    elemento.textContent =
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
            ? String(valor)
            : "—";

}


function formatarDataPedido(data) {

    if (!data) {
        return "—";
    }


    const dataObj =
        new Date(data);


    if (Number.isNaN(
        dataObj.getTime()
    )) {

        return String(data);

    }


    return dataObj.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


/*==================================================
        FECHAR MODAL
==================================================*/

function fecharModalDetalhesPedido() {

    if (!modalDetalhesPedido) {
        return;
    }


    modalDetalhesPedido.classList.remove(
        "ativo"
    );


    modalDetalhesPedido.setAttribute(
        "aria-hidden",
        "true"
    );


    pedidoAtualAdmin = null;

}


fecharModalPedido?.addEventListener(
    "click",
    fecharModalDetalhesPedido
);


btnFecharPedidoModal?.addEventListener(
    "click",
    fecharModalDetalhesPedido
);


/* FECHAR CLICANDO FORA */

modalDetalhesPedido?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modalDetalhesPedido
        ) {

            fecharModalDetalhesPedido();

        }

    }
);


/* ESC */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modalDetalhesPedido?.classList.contains(
                "ativo"
            )
        ) {

            fecharModalDetalhesPedido();

        }

    }
);


/*==================================================
        SALVAR STATUS
==================================================*/

btnSalvarStatusPedido?.addEventListener(
    "click",
    async () => {

        if (!pedidoAtualAdmin) {

            alert(
                "Nenhum pedido selecionado."
            );

            return;

        }


        const selectStatus =
            document.getElementById(
                "pedidoModalStatus"
            );


        const novoStatus =
            selectStatus?.value || "";


        if (!novoStatus) {

            alert(
                "Selecione um status."
            );

            return;

        }


        const tokenAtual =
            localStorage.getItem(
                "tokenCial"
            );


        if (!tokenAtual) {

            alert(
                "Sua sessão expirou. Faça login novamente."
            );

            window.location.href =
                "../cadastro/login.html";

            return;

        }


        try {

            btnSalvarStatusPedido.disabled =
                true;


            btnSalvarStatusPedido.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Salvando...
            `;


            const resposta = await fetch(
                `${API_BASE}/admin/pedidos/${pedidoAtualAdmin.id}/status`,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${tokenAtual}`

                    },

                    body: JSON.stringify({
                        status: novoStatus
                    })

                }
            );


            const resultado =
                await resposta.json();


            if (!resposta.ok || !resultado.ok) {

                throw new Error(
                    resultado.erro ||
                    "Não foi possível atualizar o status."
                );

            }


            pedidoAtualAdmin.status =
                novoStatus;


            alert(
                "Status do pedido atualizado com sucesso!"
            );


            await carregarPedidosAdmin();

            await carregarDashboardAdmin();


        } catch (erro) {

            console.error(
                "Erro ao salvar status:",
                erro
            );


            alert(
                `Erro ao salvar status: ${erro.message}`
            );


        } finally {

            btnSalvarStatusPedido.disabled =
                false;

            btnSalvarStatusPedido.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Salvar status
            `;

        }

    }
);

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

    const categoriasProduto =
      Array.isArray(produto.categorias) &&
      produto.categorias.length > 0
        ? produto.categorias
        : produto.categoria
            ? [produto.categoria]
            : [];

    const categoriaExibicao =
      categoriasProduto.join(", ") || "Sem categoria";

    linha.innerHTML = `
      <td>
              <img
          src="${escaparHTML(produto.imagem || "")}"
          alt="${escaparHTML(produto.nome)}"
          class="produto-imagem-tabela">
      </td>

      <td>${escaparHTML(produto.nome)}</td>

      <td>${escaparHTML(categoriaExibicao)}</td>

      <td>${formatarMoeda(produto.preco)}</td>



           <td>

        <span class="${produto.ativo ? "status-ativo" : "status-inativo"}">

          ${produto.ativo ? "Ativo" : "Inativo"}

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

/*==================================================
        EDITAR PRODUTO
==================================================*/

async function abrirEdicaoProduto(id) {

    const produto = produtosAdmin.find(
        item => Number(item.id) === Number(id)
    );

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    produtoEditandoId = produto.id;
    produtoEditando = produto;

    const modal = document.getElementById("modalNovoProduto");

    if (!modal) {
        alert("Modal de produto não encontrado.");
        return;
    }

    /* ABRIR MODAL */

    modal.classList.add("ativo");

    /* NOME */

    const nome = document.getElementById("novoProdutoNome");
    if (nome) {
        nome.value = produto.nome || "";
    }

    /* CÓDIGO */

    const codigo = document.getElementById("novoProdutoCodigo");
    if (codigo) {
        codigo.value = produto.codigo || "";
    }

    /* MARCA */

    const marca = document.getElementById("novoProdutoMarca");
    if (marca) {
        marca.value = produto.marca || "";
    }

    /* LINHA */

    const linha = document.getElementById("novoProdutoLinha");
    if (linha) {
        linha.value = produto.linha || "";
    }

    /* MODELO */

    const modelo = document.getElementById("novoProdutoModelo");
    if (modelo) {
        modelo.value = produto.modelo || "";
    }

    /* DESCRIÇÃO */

    const descricao = document.getElementById("novoProdutoDescricao");
    if (descricao) {
        descricao.value = produto.descricao || "";
    }

    /* PREÇO */

    const preco = document.getElementById("novoProdutoPreco");
    if (preco) {
        preco.value = produto.preco ?? 0;
    }

    /* ESTOQUE */

    const estoque = document.getElementById("novoProdutoEstoque");
    if (estoque) {
        estoque.value = produto.estoque ?? 0;
    }

    /* DESTAQUES */

    const promocao = document.getElementById("novoProdutoPromocao");
    if (promocao) {
        promocao.checked = !!produto.promocao;
    }

    const lancamento = document.getElementById("novoProdutoLancamento");
    if (lancamento) {
        lancamento.checked = !!produto.lancamento;
    }

    const maisVendido = document.getElementById("novoProdutoMaisVendido");
    if (maisVendido) {
        maisVendido.checked = !!produto.mais_vendido;
    }

    const novidade = document.getElementById("novoProdutoNovidade");
    if (novidade) {
        novidade.checked = !!produto.novidade;

    }

    const destaque = document.getElementById(
    "novoProdutoDestaque"
);

if (destaque) {
    destaque.checked = !!produto.destaque;
}

    const ativo = document.getElementById("novoProdutoAtivo");
    if (ativo) {
        ativo.checked = produto.ativo ?? true;
    }

    /* CATEGORIAS */

      const categoriasProduto =
        Array.isArray(produto.categorias) &&
        produto.categorias.length > 0
            ? produto.categorias
            : produto.categoria
                ? [produto.categoria]
                : [];

    checkboxesCategorias.forEach(checkbox => {

        checkbox.checked =
            categoriasProduto.includes(checkbox.value);

    });

   atualizarResumoCategorias();

/* ATUALIZA FILTROS DINÂMICOS */
atualizarFiltrosDinamicos();

/* ATUALIZA ESPECIFICAÇÕES DINÂMICAS */
atualizarEspecificacoesProduto();

/* RESTAURA ESPECIFICAÇÕES SALVAS */
const especificacoesSalvas =
    produto.especificacoes || {};

Object.entries(especificacoesSalvas).forEach(
    ([id, valor]) => {

        const campo =
            document.getElementById(
                `especificacao_${id}`
            );

        if (campo) {
            campo.value = valor ?? "";
        }

    }
);

/* RESTAURA FILTROS SALVOS */
const filtrosSalvos = produto.filtros || {};

    Object.entries(filtrosSalvos).forEach(
        ([grupo, valores]) => {

            if (!Array.isArray(valores)) {
                return;
            }

            valores.forEach(valor => {

                const checkbox =
                    filtrosDinamicosProduto.querySelector(
                        `input[name="filtro_${grupo}"][value="${valor}"]`
                    );

                if (checkbox) {
                    checkbox.checked = true;
                }

            });

        }
    );

    /* ETAPA INICIAL */

    mostrarEtapaProduto(1);

    console.log(
        "Editando produto:",
        produto
    );
}

/* Excluir produto */
document.addEventListener("click", async event => {

  /* ==========================================
     VER PEDIDO / VER ORÇAMENTO
     ========================================== */

  const botaoVer =
    event.target.closest(".btn-acao-pedido[data-id]");

  if (botaoVer) {

    const id =
      Number(botaoVer.dataset.id);

    if (
      botaoVer.closest("#painelPedidos")
    ) {
      verPedidoAdmin(id);
      return;
    }

    if (
      botaoVer.closest("#painelOrcamentos")
    ) {
      verOrcamentoAdmin(id);
      return;
    }
  }


  /* ==========================================
     EDITAR PRODUTO
     ========================================== */

  const botaoEditar =
    event.target.closest(".btn-editar-produto");

  if (botaoEditar) {

    abrirEdicaoProduto(
      Number(botaoEditar.dataset.id)
    );

    return;
  }


  /* ==========================================
     EXCLUIR PRODUTO
     ========================================== */

  const botaoExcluir =
    event.target.closest(".btn-excluir-produto");

  if (!botaoExcluir) {
    return;
  }

  const id =
    Number(botaoExcluir.dataset.id);

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

    alert(
      "Erro ao excluir produto. Verifique o console."
    );

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
        ALTERAR STATUS DO ORÇAMENTO
==================================================*/

async function salvarStatusOrcamentoAdmin() {

    const select =
        document.getElementById(
            "selectStatusOrcamento"
        );

    if (!select) {
        alert("Campo de status não encontrado.");
        return;
    }

    const novoStatus = select.value;

    if (!novoStatus) {
        alert("Selecione uma situação.");
        return;
    }

    /*
     * Recupera o orçamento que está aberto
     */
    const modal =
        document.getElementById(
            "modalDetalhesOrcamento"
        );

    const id =
        modal?.dataset?.orcamentoId;

    if (!id) {
        alert(
            "Não foi possível identificar o orçamento."
        );
        return;
    }

    const tokenAtual =
        localStorage.getItem(
            "tokenCial"
        );

    if (!tokenAtual) {
        alert("Sessão expirada.");
        return;
    }

    const botao =
        document.getElementById(
            "btnSalvarStatusOrcamento"
        );

    try {

        if (botao) {

            botao.disabled = true;

            botao.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Salvando...
            `;

        }


        const resposta =
            await fetch(
                `${API_BASE}/admin/orcamentos/${id}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${tokenAtual}`
                    },

                    body: JSON.stringify({
                        status: novoStatus
                    })
                }
            );


        const resultado =
            await resposta.json();


        if (
            !resposta.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao atualizar o status."
            );

        }


        /*
         * Atualiza o status visual
         */
        const campoStatus =
            document.getElementById(
                "orcamentoModalStatus"
            );


        const textosStatus = {

            em_analise:
                "EM ANÁLISE",

            aprovado:
                "APROVADO",

            recusado:
                "RECUSADO",

            finalizado:
                "FINALIZADO"

        };


        if (campoStatus) {

            campoStatus.textContent =
                textosStatus[novoStatus] ||
                novoStatus;

        }


        alert(
            "Situação do orçamento atualizada com sucesso!"
        );


        /*
         * Atualiza a lista de orçamentos
         */
        if (
            typeof carregarOrcamentosAdmin ===
            "function"
        ) {

            carregarOrcamentosAdmin();

        }


    } catch (erro) {

        console.error(
            "Erro ao alterar status do orçamento:",
            erro
        );

        alert(
            `Erro ao atualizar situação: ${erro.message}`
        );


    } finally {

        if (botao) {

            botao.disabled = false;

            botao.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Salvar situação
            `;

        }

    }

}


/*==================================================
        CONECTAR BOTÃO DE STATUS
==================================================*/

document
    .getElementById(
        "btnSalvarStatusOrcamento"
    )
    ?.addEventListener(
        "click",
        salvarStatusOrcamentoAdmin
    );



/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener(
  "DOMContentLoaded",
  () => {

    mostrarSecao("dashboard");

    carregarDashboardAdmin();

    carregarProdutosAdmin();

    inicializarAbasPedidos();

  }
);
