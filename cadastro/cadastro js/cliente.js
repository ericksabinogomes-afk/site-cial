/* =====================================================
   ELEMENTOS DO SISTEMA
===================================================== */

const botoesMenu = document.querySelectorAll(".menu");
const secoes = document.querySelectorAll(".secao");
const cards = document.querySelectorAll(".card");

const btnDetalhes = document.querySelectorAll(".btn-detalhes");
const btnVer = document.querySelectorAll(".btn-ver");
const btnRemover = document.querySelectorAll(".btn-remover");
const btnOrcamento = document.querySelectorAll(".btn-orcamento");
const btnGarantia = document.querySelectorAll(".btn-garantia");

const btnSalvar = document.querySelector(".btn-salvar");
const btnAlterarSenha = document.querySelector(".btn-alterar-senha");

/* ===== Usuário logado ===== */

let usuarioAtual = null;

function carregarUsuarioLogado() {
    const usuarioJSON = localStorage.getItem("usuarioCial");
    const token = localStorage.getItem("tokenCial");

    // Área protegida: precisa ter token e dados do usuário
    if (!token || !usuarioJSON) {
        localStorage.removeItem("tokenCial");
        localStorage.removeItem("usuarioCial");

        window.location.href = "login.html";
        return null;
    }

    try {
        
        return JSON.parse(usuarioJSON);

    } catch (erro) {
        console.error("Erro ao ler usuarioCial:", erro);

        localStorage.removeItem("tokenCial");
        localStorage.removeItem("usuarioCial");

        window.location.href = "login.html";
        return null;
    }
}

function atualizarInterfaceUsuario() {
    if (!usuarioAtual) return;

    const nomeCompleto = usuarioAtual.nome || "Cliente";
    const primeiroNome = nomeCompleto.split(" ")[0];
    const iniciais = nomeCompleto
        .split(" ")
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    // Topo
    const spanNomeUsuario = document.getElementById("nomeUsuario");
    if (spanNomeUsuario) {
        spanNomeUsuario.textContent = `Olá, ${primeiroNome} 👋`;
    }

    const avatarTopo = document.querySelector(".avatar");
    if (avatarTopo) {
        avatarTopo.textContent = iniciais;
    }

    const fotoPerfil = document.querySelector(".foto-perfil");
    if (fotoPerfil) {
        fotoPerfil.textContent = iniciais;
    }

    const h2PerfilNome = document.querySelector(".perfil h2");
    if (h2PerfilNome) {
        h2PerfilNome.textContent = nomeCompleto;
    }

    // Form "Meus Dados"
    const inputNome = document.getElementById("nome");
    const inputEmail = document.getElementById("email");
    const inputTelefone = document.getElementById("telefone");
    const inputCpf = document.getElementById("cpf");

    if (inputNome) inputNome.value = usuarioAtual.nome || "";
    if (inputEmail) inputEmail.value = usuarioAtual.email || "";
    if (inputTelefone) inputTelefone.value = usuarioAtual.telefone || "";
    if (inputCpf) inputCpf.value = usuarioAtual.cpf || "";
}

/* ===== Logout ===== */

function fazerLogout() {
    
    localStorage.removeItem("usuarioCial");
  
    localStorage.removeItem("tokenCial");
    
    window.location.href = "login.html";

}


/* =====================================================
   ABRIR SEÇÃO
===================================================== */

function abrirSecao(nomeSecao) {

    secoes.forEach(secao => {

        secao.classList.remove("ativa");

    });

    const secaoAtiva = document.getElementById(nomeSecao);

    if (secaoAtiva) {

        secaoAtiva.classList.add("ativa");

    }

    botoesMenu.forEach(botao => {

        botao.classList.remove("ativo");

        if (botao.dataset.secao === nomeSecao) {

            botao.classList.add("ativo");

        }

    });

}
/* =====================================================
   MENU LATERAL
===================================================== */

function iniciarMenu() {

    botoesMenu.forEach(botao => {

        botao.addEventListener("click", () => {

            const secao = botao.dataset.secao;

            if (secao === "sair") {

                const confirmar = confirm("Deseja realmente sair da sua conta?");

                if (confirmar) {
                    fazerLogout();
                }

                return;

            }

            abrirSecao(secao);

        });

    });

}
/* =====================================================
   CARDS DO DASHBOARD
===================================================== */

function iniciarCards() {

    cards.forEach(card => {

        card.addEventListener("click", () => {

            const secao = card.dataset.secao;

            abrirSecao(secao);

        });

    });

}
/* =====================================================
   PEDIDOS
===================================================== */

async function carregarPedidos() {
  const lista = document.getElementById("listaPedidos");

  if (!lista) return;

  const token = localStorage.getItem("tokenCial");

  if (!token) {
  lista.innerHTML = `
    <tr>
      <td colspan="5">Faça login para visualizar seus pedidos.</td>
    </tr>
  `;

  return;
}

  try {
    const response = await fetch("http://localhost:4000/pedidos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const resultado = await response.json();

    if (!response.ok || !resultado.ok) {
      throw new Error(resultado.erro || "Erro ao carregar pedidos");
    }

    const pedidos = resultado.data || [];

    lista.innerHTML = "";

    if (pedidos.length === 0) {
      lista.innerHTML = `
        <tr>
          <td colspan="5">Nenhum pedido encontrado.</td>
        </tr>
      `;
      return;
    }

    pedidos.forEach((pedido) => {
    const data = pedido.data_pedido || pedido.created_at;

let dataFormatada = "-";

if (data) {
  const dataObj = new Date(data);

  if (!Number.isNaN(dataObj.getTime())) {
    dataFormatada = dataObj.toLocaleDateString("pt-BR");
  }
}

      const valorFormatado = Number(pedido.valor || 0).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      );

const tr = document.createElement("tr");

const statusPedido = String(
    pedido.status || "Em andamento"
).trim();

const statusClasse = statusPedido
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");


    
tr.innerHTML = `
     
        <td>#${pedido.numero || pedido.id}</td>
        <td>${dataFormatada}</td>
        <td>

         <span class="status ${statusClasse}">
         ${statusPedido}
        </span>

        </td>
        <td>${valorFormatado}</td>
        <td>
          <button
            type="button"
            class="btn-detalhes"
            data-id="${pedido.id}"
          >
            Ver detalhes
          </button>
        </td>
      `;


      tr.querySelector(".btn-detalhes").addEventListener("click", () => {

  const modal = document.getElementById("modalDetalhesPedido");

  if (!modal) {
    console.error("Modal de detalhes do pedido não encontrado.");
    return;
  }

  const numero =
    pedido.numero ||
    pedido.id ||
    "—";

  const dataPedido = pedido.created_at
    ? new Date(pedido.created_at).toLocaleDateString("pt-BR")
    : "—";

  const status =
    pedido.status ||
    "Em andamento";

  const valorTotal =
    Number(
        pedido.valor ??
        pedido.total ??
        pedido.valor_total ??
        0
    );
    
  const numeroEl =
    document.getElementById("modalPedidoNumero");

  const dataEl =
    document.getElementById("modalPedidoData");

  const statusEl =
    document.getElementById("modalPedidoStatus");

  const valorEl =
    document.getElementById("modalPedidoValor");

  const totalEl =
    document.getElementById("modalPedidoTotal");

  const listaItens =
    document.getElementById("modalPedidoListaItens");

  if (numeroEl) {
    numeroEl.textContent =
      `Pedido #${numero}`;
  }

  if (dataEl) {
    dataEl.textContent =
      dataPedido;
  }

  if (statusEl) {
    statusEl.textContent =
      status;
  }

  if (valorEl) {
    valorEl.textContent =
      valorTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
  }

  if (totalEl) {
    totalEl.textContent =
      valorTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
  }

  const itens =
    pedido.pedido_itens || [];

  if (listaItens) {

    if (itens.length === 0) {

      listaItens.innerHTML = `
        <p class="modal-pedido__item-qtd">
          Este pedido ainda não possui itens cadastrados.
        </p>
      `;

    } else {

      listaItens.innerHTML =
        itens.map((item) => {

          const quantidade =
            Number(item.quantidade || 0);

          const preco =
            Number(item.preco_unitario || 0);

          const subtotal =
            quantidade * preco;

          return `
            <div class="modal-pedido__item">

              <div>
                <div class="modal-pedido__item-nome">
                  ${item.produto_nome || "Produto"}
                </div>

                <div class="modal-pedido__item-qtd">
                  Quantidade: ${quantidade}
                </div>
              </div>

              <div class="modal-pedido__item-valor">
                ${subtotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </div>

            </div>
          `;

        }).join("");
    }
  }

  modal.hidden = false;

});
    
      lista.appendChild(tr);
    });
  } catch (erro) {
    console.error("Erro ao carregar pedidos:", erro);

    lista.innerHTML = `
      <tr>
        <td colspan="5">Não foi possível carregar os pedidos.</td>
      </tr>
    `;
  }
}

/* =====================================================
   FECHAR MODAL — DETALHES DO PEDIDO
===================================================== */

const modalDetalhesPedido =
  document.getElementById("modalDetalhesPedido");

const fecharModalPedido =
  document.getElementById("fecharModalPedido");

const btnFecharDetalhesPedido =
  document.getElementById("btnFecharDetalhesPedido");


function fecharModalDetalhesPedido() {

  if (!modalDetalhesPedido) {
    return;
  }

  modalDetalhesPedido.hidden = true;
}


/* BOTÃO X */

if (fecharModalPedido) {

  fecharModalPedido.addEventListener(
    "click",
    fecharModalDetalhesPedido
  );

}


/* BOTÃO FECHAR */

if (btnFecharDetalhesPedido) {

  btnFecharDetalhesPedido.addEventListener(
    "click",
    fecharModalDetalhesPedido
  );

}

/* =====================================================
   FAVORITOS
===================================================== */

async function carregarFavoritos() {

    const container = document.querySelector(".favoritos-grid");

    if (!container) return;

    const token = localStorage.getItem("tokenCial");

    if (!token) {
        container.innerHTML = `
            <div class="sem-resultados">
                <span class="icone-vazio">❤️</span>
                <p>Faça login para visualizar seus favoritos.</p>
            </div>
        `;
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:4000/favoritos",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const resultado = await response.json();

        if (!response.ok || !resultado.ok) {
            throw new Error(
                resultado.erro || "Erro ao buscar favoritos"
            );
        }

        const favoritos = resultado.data || [];

        const tituloFavoritos = document.querySelector("#favoritos h2");

if (tituloFavoritos) {

    let contador = tituloFavoritos.querySelector(
        ".contador-favoritos"
    );

    if (!contador) {

        contador = document.createElement("span");

        contador.className =
            "contador-favoritos";

        tituloFavoritos.appendChild(contador);
    }

    contador.textContent =
        favoritos.length;
}

        /* ==========================================
           NENHUM FAVORITO
        ========================================== */

        if (favoritos.length === 0) {

            container.innerHTML = `
                <div class="sem-resultados">
                    <span class="icone-vazio">❤️</span>

                    <p>
                        Você ainda não possui favoritos.
                    </p>

                    <small>
                        Quando você salvar um produto,
                        ele aparecerá aqui.
                    </small>
                </div>
            `;

            return;
        }

        /* ==========================================
           LIMPAR CONTAINER
        ========================================== */

        container.innerHTML = "";

        /* ==========================================
           CRIAR CARDS
        ========================================== */

        favoritos.forEach((favorito) => {

            const card = document.createElement("div");

            card.className = "produto-favorito";

            const precoFormatado = Number(
                favorito.produto_preco || 0
            ).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            card.innerHTML = `
                <div class="imagem-favorito">
                    <img
                        src="${
                            favorito.produto_imagem ||
                            "../pagina/imagem/produto-sem-imagem.png"
                        }"
                        alt="${
                            favorito.produto_nome ||
                            "Produto"
                        }"
                    >
                </div>

                <div class="info-favorito">

                    <h3>
                        ${
                            favorito.produto_nome ||
                            "Produto"
                        }
                    </h3>

                    <p class="preco-favorito">
                        ${precoFormatado}
                    </p>

                    <div class="acoes-favorito">

                       <button
                           type="button"
                           class="btn-ver-produto"
                           data-produto-id="${favorito.produto_id}"
                       >

                           🛍️ Ver produto
                         </button>

                         <button
                         type="button"
                         class="btn-remover"
                        data-id="${favorito.id}"

                                                >

                        ❤️ Remover dos favoritos

                       </button>

                </div>
                </div>
            `;

            /* ======================================
               BOTÃO REMOVER
            ====================================== */

            const botaoRemover =
                card.querySelector(".btn-remover");

                const botaoVerProduto =
                card.querySelector(".btn-ver-produto");

                botaoVerProduto.addEventListener("click", () => {

               const produtoId =
                botaoVerProduto.dataset.produtoId;

                window.location.href =
               `../pagina/Produtos.html?produto=${produtoId}`;

});

            botaoRemover.addEventListener(
                "click",
                async () => {

                    const confirmar = confirm(
                        "Deseja remover este produto dos favoritos?"
                    );

                    if (!confirmar) return;

                    try {

                        botaoRemover.disabled = true;

                        botaoRemover.textContent =
                            "Removendo...";

                        const resposta = await fetch(
                            `http://localhost:4000/favoritos/${favorito.produto_id}`,
                            {
                                method: "DELETE",

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );

                        const resultadoRemocao =
                            await resposta.json();

                        if (
                            !resposta.ok ||
                            !resultadoRemocao.ok
                        ) {
                            throw new Error(
                                resultadoRemocao.erro ||
                                "Erro ao remover favorito"
                            );
                        }

                        /* Atualiza a lista */

                        await carregarFavoritos();

                    } catch (erro) {

                        console.error(
                            "Erro ao remover favorito:",
                            erro
                        );

                        botaoRemover.disabled = false;

                        botaoRemover.textContent =
                            "❤️ Remover dos favoritos";

                        alert(
                            "Não foi possível remover o favorito."
                        );
                    }

                }
            );

            container.appendChild(card);

        });

    } catch (erro) {

        console.error(
            "Erro ao carregar favoritos:",
            erro
        );

        container.innerHTML = `
            <div class="sem-resultados">
                <span class="icone-vazio">⚠️</span>

                <p>
                    Não foi possível carregar seus favoritos.
                </p>

                <small>
                    Tente atualizar a página.
                </small>
            </div>
        `;
    }
}


/* =====================================================
   ORÇAMENTOS
===================================================== */

async function carregarOrcamentos() {

    const lista =
        document.getElementById("listaOrcamentos");

    if (!lista) return;

    const token =
        localStorage.getItem("tokenCial");

    if (!token) {

        lista.innerHTML = `
            <tr>
                <td colspan="5">
                    Faça login para visualizar seus orçamentos.
                </td>
            </tr>
        `;

        return;
    }

    lista.innerHTML = `
        <tr>
            <td colspan="5">
                Carregando orçamentos...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(
                "http://localhost:4000/orcamentos",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const resultado =
            await response.json();

        if (
            !response.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao carregar orçamentos."
            );

        }

        const orcamentos =
            resultado.data || [];

        lista.innerHTML = "";

        if (orcamentos.length === 0) {

            lista.innerHTML = `
                <tr>
                    <td colspan="5">
                        Você ainda não possui orçamentos.
                    </td>
                </tr>
            `;

            return;
        }

        orcamentos.forEach(
            orcamento => {

                const data =
                    orcamento.data_solicitacao
                        ? new Date(
                            orcamento.data_solicitacao
                        ).toLocaleDateString(
                            "pt-BR"
                        )
                        : "-";

                const validade =
                    orcamento.validade
                        ? new Date(
                            orcamento.validade
                        ).toLocaleDateString(
                            "pt-BR"
                        )
                        : "-";

                const statusMap = {

                    analise:
                        "EM ANÁLISE",

                    em_analise:
                        "EM ANÁLISE",

                    aprovado:
                        "APROVADO",

                    recusado:
                        "RECUSADO",

                    finalizado:
                        "FINALIZADO"

                };

                const status =
                    statusMap[
                        orcamento.status
                    ] ||
                    "EM ANÁLISE";

                const tr =
                    document.createElement("tr");

                tr.innerHTML = `

                    <td>
                        #${
                            orcamento.numero ||
                            orcamento.id
                        }
                    </td>

                    <td>
                        ${data}
                    </td>

                    <td>
                        <span class="status andamento">
                            ${status}
                        </span>
                    </td>

                    <td>
                        ${validade}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn-orcamento"
                            data-id="${
                                orcamento.id
                            }"
                        >
                            Visualizar
                        </button>

                    </td>

                `;

                tr
                    .querySelector(
                        ".btn-orcamento"
                    )
                    .addEventListener(
                        "click",
                        () => {

                       abrirOrcamentoCliente(
                         orcamento.id
                                     );

                        }
                    );

                lista.appendChild(tr);

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar orçamentos:",
            erro
        );

        lista.innerHTML = `
            <tr>
                <td colspan="5">
                    Não foi possível carregar os orçamentos.
                </td>
            </tr>
        `;

    }

}


function iniciarOrcamentos() {

    carregarOrcamentos();

}

async function abrirOrcamentoCliente(id) {

    const token =
        localStorage.getItem("tokenCial");

    if (!token) {
        alert("Faça login para visualizar o orçamento.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:4000/orcamentos/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const resultado =
            await response.json();

        if (
            !response.ok ||
            !resultado.ok
        ) {
            throw new Error(
                resultado.erro ||
                "Não foi possível carregar o orçamento."
            );
        }

        const orcamento =
            resultado.data;

        const itens =
            orcamento.itens || [];

        const textosStatus = {
            analise: "EM ANÁLISE",
            em_analise: "EM ANÁLISE",
            aprovado: "APROVADO",
            recusado: "RECUSADO",
            finalizado: "FINALIZADO"
        };

        const status =
            textosStatus[
                orcamento.status
            ] || "EM ANÁLISE";

        const data =
            orcamento.data_solicitacao
                ? new Date(
                    orcamento.data_solicitacao
                ).toLocaleDateString("pt-BR")
                : "-";

        const validade =
            orcamento.validade
                ? new Date(
                    orcamento.validade
                ).toLocaleDateString("pt-BR")
                : "-";

        const total =
            Number(
                orcamento.total || 0
            );

        const modalExistente =
            document.getElementById(
                "modalOrcamentoCliente"
            );

        if (modalExistente) {
            modalExistente.remove();
        }

        const modal =
            document.createElement("div");

        modal.id =
            "modalOrcamentoCliente";

        modal.innerHTML = `
            <div class="modal-orcamento-cliente-overlay">

                <div class="modal-orcamento-cliente">

                    <button
                        type="button"
                        class="fechar-modal-orcamento-cliente"
                        aria-label="Fechar"
                    >
                        ×
                    </button>

                    <div class="modal-orcamento-cliente-header">

                        <h2>
                            📄 Orçamento
                        </h2>

                        <strong>
                            #${String(
                                orcamento.id
                            ).padStart(5, "0")}
                        </strong>

                    </div>

                    <div class="orcamento-cliente-info">

                        <div>
                            <span>Data</span>
                            <strong>${data}</strong>
                        </div>

                        <div>
                            <span>Validade</span>
                            <strong>${validade}</strong>
                        </div>

                        <div>
                            <span>Status</span>
                            <strong>${status}</strong>
                        </div>

                    </div>

                    <div class="orcamento-cliente-itens">

                        <h3>
                            Produtos
                        </h3>

                        ${
                            itens.length
                                ? itens.map(item => `
                                    <div class="orcamento-cliente-item">

                                        <div>
                                            <strong>
                                                ${item.produto_nome || item.nome || "Produto"}
                                            </strong>

                                            <small>
                                                Quantidade:
                                                ${item.quantidade || 0}
                                            </small>
                                        </div>

                                        <strong>
                                            R$
                                            ${Number(
                                                item.preco_unitario || 0
                                            ).toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits: 2
                                                }
                                            )}
                                        </strong>

                                    </div>
                                `).join("")
                                : `
                                    <p>
                                        Nenhum item encontrado.
                                    </p>
                                `
                        }

                    </div>

                    <div class="orcamento-cliente-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            R$
                            ${total.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        const fechar =
            modal.querySelector(
                ".fechar-modal-orcamento-cliente"
            );

        fechar?.addEventListener(
            "click",
            () => modal.remove()
        );

        modal
            .querySelector(
                ".modal-orcamento-cliente-overlay"
            )
            ?.addEventListener(
                "click",
                evento => {

                    if (
                        evento.target.classList.contains(
                            "modal-orcamento-cliente-overlay"
                        )
                    ) {
                        modal.remove();
                    }

                }
            );

    } catch (erro) {

        console.error(
            "Erro ao abrir orçamento:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível visualizar o orçamento."
        );
    }
}

/* =====================================================
   GARANTIAS
===================================================== */

async function carregarGarantias() {

    const lista =
        document.getElementById("listaGarantias");

    if (!lista) return;

    const token =
        localStorage.getItem("tokenCial");

    if (!token) {

        lista.innerHTML = `
            <tr>
                <td colspan="5">
                    Faça login para visualizar suas garantias.
                </td>
            </tr>
        `;

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:4000/garantias",
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const resultado =
            await response.json();

        if (
            !response.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao carregar garantias."
            );
        }

        const garantias =
            resultado.data || [];

        lista.innerHTML = "";

        if (garantias.length === 0) {

            lista.innerHTML = `
                <tr>
                    <td colspan="5">
                        Você ainda não possui garantias.
                    </td>
                </tr>
            `;

            return;
        }

        garantias.forEach((garantia) => {

            const dataCompra =
                garantia.data_compra
                    ? new Date(
                        `${garantia.data_compra}T00:00:00`
                    ).toLocaleDateString(
                        "pt-BR"
                    )
                    : "-";

            const vencimento =
                garantia.vencimento
                    ? new Date(
                        `${garantia.vencimento}T00:00:00`
                    ).toLocaleDateString(
                        "pt-BR"
                    )
                    : "-";

            const hoje =
                new Date();

            const dataVencimento =
                garantia.vencimento
                    ? new Date(
                        `${garantia.vencimento}T00:00:00`
                    )
                    : null;

            const garantiaAtiva =
                dataVencimento &&
                dataVencimento >= hoje;

            const statusTexto =
                garantiaAtiva
                    ? "Ativa"
                    : "Vencida";

            const tr =
                document.createElement("tr");

            tr.innerHTML = `
                <td>
                    ${garantia["nome do produto"] || "-"}
                </td>

                <td>
                    ${dataCompra}
                </td>

                <td>
                    <span class="status ${
                        garantiaAtiva
                            ? "andamento"
                            : "cancelado"
                    }">
                        ${statusTexto}
                    </span>
                </td>

                <td>
                    ${vencimento}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn-garantia"
                        data-id="${garantia.id}"
                    >
                        Ver Garantia
                    </button>

                </td>
            `;

            const botao =
                tr.querySelector(
                    ".btn-garantia"
                );

           botao.addEventListener(
    "click",
    () => {

        const modalExistente =
            document.getElementById("modalGarantia");

        if (modalExistente) {
            modalExistente.remove();
        }

        const modal =
            document.createElement("div");

        modal.id = "modalGarantia";

        modal.innerHTML = `
            <div style="
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.65);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
            ">

                <div style="
                    background: #fff;
                    width: 100%;
                    max-width: 600px;
                    border-radius: 18px;
                    padding: 30px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
                    position: relative;
                    font-family: Arial, sans-serif;
                ">

                    <button
                        type="button"
                        id="fecharModalGarantia"
                        style="
                            position: absolute;
                            top: 15px;
                            right: 18px;
                            border: none;
                            background: none;
                            font-size: 25px;
                            cursor: pointer;
                        "
                    >
                        ×
                    </button>

                    <div style="
                        text-align: center;
                        margin-bottom: 25px;
                    ">

                        <div style="
                            font-size: 42px;
                            margin-bottom: 8px;
                        ">
                            🛡️
                        </div>

                        <h2 style="
                            margin: 0;
                            color: #552b04;
                        ">
                            Garantia CIAL Asa Sul
                        </h2>

                        <p style="
                            margin-top: 8px;
                            color: #777;
                        ">
                            Documento de garantia do produto
                        </p>

                    </div>

                    <div style="
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    ">

                        <p>
                            <strong>Produto:</strong><br>
                            ${garantia["nome do produto"] || "-"}
                        </p>

                        <p>
                            <strong>Número da garantia:</strong><br>
                            #${garantia.id}
                        </p>

                        <p>
                            <strong>Pedido:</strong><br>
                            #${garantia.pedido_id || "-"}
                        </p>

                        <p>
                            <strong>Unidade:</strong><br>
                            ${garantia.unidade || "-"}
                        </p>

                        <p>
                            <strong>Data da compra:</strong><br>
                            ${dataCompra}
                        </p>

                        <p>
                            <strong>Período de garantia:</strong><br>
                            ${garantia.meses_garantia || 12} meses
                        </p>

                        <p>
                            <strong>Vencimento:</strong><br>
                            ${vencimento}
                        </p>

                        <p>
                            <strong>Status:</strong><br>

                            <span style="
                                display: inline-block;
                                margin-top: 5px;
                                padding: 6px 14px;
                                border-radius: 20px;
                                background: ${
                                    garantiaAtiva
                                        ? "#e8f7ed"
                                        : "#fdeaea"
                                };
                                color: ${
                                    garantiaAtiva
                                        ? "#218739"
                                        : "#c62828"
                                };
                                font-weight: 600;
                            ">
                                ${statusTexto}
                            </span>

                        </p>

                    </div>

                    <div style="
                        margin-top: 25px;
                        display: flex;
                        justify-content: flex-end;
                    ">

                        <button
                            type="button"
                            id="fecharModalGarantia2"
                            style="
                                border: none;
                                background: #552b04;
                                color: white;
                                padding: 12px 22px;
                                border-radius: 10px;
                                cursor: pointer;
                                font-weight: 600;
                            "
                        >
                            Fechar
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        const fechar =
            () => modal.remove();

        document
            .getElementById("fecharModalGarantia")
            .addEventListener(
                "click",
                fechar
            );

        document
            .getElementById("fecharModalGarantia2")
            .addEventListener(
                "click",
                fechar
            );

        modal
            .firstElementChild
            .addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        modal.firstElementChild
                    ) {
                        fechar();
                    }

                }
            );

    }
);

            lista.appendChild(tr);

        });

    } catch (erro) {

        console.error(
            "Erro ao carregar garantias:",
            erro
        );

        lista.innerHTML = `
            <tr>
                <td colspan="5">
                    Não foi possível carregar suas garantias.
                </td>
            </tr>
        `;
    }
}


function iniciarGarantias() {

    carregarGarantias();

}

/* =====================================================
   MEUS DADOS
===================================================== */

function iniciarDados() {
  const formDados = document.getElementById("formDados");

  if (!formDados) return;

  formDados.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!usuarioAtual) {
      alert("Usuário não encontrado na sessão.");
      return;
    }

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();

    if (!nome) {
      alert("Informe seu nome.");
      return;
    }

    const token = localStorage.getItem("tokenCial");

    if (!token) {
      alert("Sua sessão expirou. Faça login novamente.");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/meus-dados/${usuarioAtual.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nome,
            telefone
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        alert(
          "Erro ao salvar dados: " +
          (result.erro || "tente novamente")
        );
        return;
      }

      usuarioAtual.nome = nome;
      usuarioAtual.telefone = telefone;

      localStorage.setItem(
        "usuarioCial",
        JSON.stringify(usuarioAtual)
      );

      atualizarInterfaceUsuario();

      alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      alert("Erro de conexão ao salvar dados.");
    }
  });
}
/* =====================================================
   SEGURANÇA
===================================================== */

function iniciarSeguranca() {

    if (!btnAlterarSenha) return;

    btnAlterarSenha.addEventListener("click", async (event) => {

        event.preventDefault();

        const senhaAtual = document.getElementById("senhaAtual")?.value.trim();
        const novaSenha = document.getElementById("novaSenha")?.value.trim();
        const confirmarSenha = document.getElementById("confirmarSenha")?.value.trim();

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            alert("Preencha todos os campos de senha.");
            return;
        }

        if (novaSenha.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            alert("A confirmação da nova senha não confere.");
            return;
        }

        if (senhaAtual === novaSenha) {
            alert("A nova senha deve ser diferente da senha atual.");
            return;
        }

        const token = localStorage.getItem("tokenCial");

        if (!token) {
            alert("Sua sessão expirou. Faça login novamente.");
            window.location.href = "login.html";
            return;
        }

        btnAlterarSenha.disabled = true;
        btnAlterarSenha.textContent = "Alterando...";

        try {

            const response = await fetch(
                "http://localhost:4000/minha-senha",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        senhaAtual,
                        novaSenha
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.ok) {
                alert(
                    result.erro ||
                    "Não foi possível alterar a senha."
                );
                return;
            }

            alert("Senha alterada com sucesso!");

            const campoSenhaAtual =
                document.getElementById("senhaAtual");

            const campoNovaSenha =
                document.getElementById("novaSenha");

            const campoConfirmarSenha =
                document.getElementById("confirmarSenha");

            if (campoSenhaAtual) campoSenhaAtual.value = "";
            if (campoNovaSenha) campoNovaSenha.value = "";
            if (campoConfirmarSenha) campoConfirmarSenha.value = "";

        } catch (error) {

            console.error(
                "Erro ao alterar senha:",
                error
            );

            alert(
                "Erro de conexão ao alterar a senha."
            );

        } finally {

            btnAlterarSenha.disabled = false;
            btnAlterarSenha.textContent = "Alterar senha";

        }

    });

}

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Carregar usuário logado
    usuarioAtual = carregarUsuarioLogado();
    if (!usuarioAtual) return; // se não tiver, já redirecionou

    // Atualizar topo e "Meus Dados"
    atualizarInterfaceUsuario();

    // Inicializar o resto da página
    iniciarMenu();
    iniciarCards();
    carregarPedidos();
    carregarFavoritos();
    iniciarOrcamentos();
    iniciarGarantias();
    iniciarDados();
    iniciarSeguranca();
    abrirSecao("inicio");

});

document.addEventListener("DOMContentLoaded", () => {

    const hash = window.location.hash.replace("#", "");

    if (!hash) {
        return;
    }

    const secao = document.getElementById(hash);
    const botao = document.querySelector(
        `.menu[data-secao="${hash}"]`
    );

    if (!secao || !botao) {
        return;
    }

    // Remove a seção ativa atual
    document.querySelectorAll(".secao").forEach(item => {
        item.classList.remove("ativa");
    });

    // Remove o menu ativo atual
    document.querySelectorAll(".menu").forEach(item => {
        item.classList.remove("ativo");
    });

    // Ativa a seção indicada pelo hash
    secao.classList.add("ativa");

    // Ativa o botão correspondente
    botao.classList.add("ativo");

});
