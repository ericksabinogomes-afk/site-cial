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

if (secao === "categorias") {
    carregarCategorias();
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

/*==================================================
        MODAL — NOVO PRODUTO
==================================================*/

const modalNovoProduto =
  document.getElementById("modalNovoProduto");

const fecharModalProduto =
  document.getElementById("fecharModalProduto");


/* ABRIR */

btnAdd.forEach(botao => {

  botao.addEventListener("click", () => {

    if (!modalNovoProduto) {
      return;
    }

    modalNovoProduto.classList.add("ativo");

  });

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
            tipo: "text",
            placeholder: "Ex.: 2 tempos"
        },

        {
            id: "capacidade-tanque",
            nome: "Capacidade do tanque",
            tipo: "text",
            placeholder: "Ex.: 0,25 l"
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


    const categoriasSelecionadas =
        Array.from(
            checkboxesCategorias
        )
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);


    /*==================================================
            NENHUMA CATEGORIA
    ==================================================*/

    if (categoriasSelecionadas.length === 0) {

        especificacoesDinamicasProduto.innerHTML = `
            <div class="especificacoes-vazio">

                <i class="fa-solid fa-sliders"></i>

                <strong>
                    Especificações técnicas
                </strong>

                <p>
                    Os campos específicos aparecerão
                    conforme as categorias selecionadas.
                </p>

            </div>
        `;

        return;
    }


    /*==================================================
            JUNTAR ESPECIFICAÇÕES
    ==================================================*/

    const especificacoesCombinadas = new Map();


    categoriasSelecionadas.forEach(
        categoria => {

            const especificacoes =
                especificacoesCategoriasProduto[
                    categoria
                ];


            if (!especificacoes) {
                return;
            }


            especificacoes.forEach(
                especificacao => {

                    if (
                        !especificacoesCombinadas
                            .has(especificacao.id)
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
                    especificacao => `
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
                    `
                )
                .join("")
            }

        </div>
    `;

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

// Ajuste se sua API rodar em outra porta/origem
const API_BASE = "http://localhost:4000"; 



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
                            title="Editar categoria">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            type="button"
                            class="btn-excluir-categoria"
                            data-id="${item.id}"
                            data-categoria="${escaparHTML(item.nome)}"
                            title="Excluir categoria">

                            <i class="fa-solid fa-trash"></i>

                        </button>

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

function abrirModalEditarCategoria(id, nomeAtual) {

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
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                nome,
                                grupo: "Produtos"
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

    abrirModalEditarCategoria(
        id,
        nomeAtual
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
                                `Bearer ${token}`
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
                                    `Bearer ${token}`
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
  const url = `${API_BASE}/admin/produtos/${id}`;

  console.log("Excluindo produto:", id);
  console.log("URL:", url);

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
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
                INICIALIZAÇÃO
==================================================*/

document.addEventListener(
  "DOMContentLoaded",
  () => {
    mostrarSecao("dashboard");

    carregarProdutosAdmin();
  }
  
);