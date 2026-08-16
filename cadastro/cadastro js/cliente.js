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

      const dataFormatada = data
        ? new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")
        : "-";

      const valorFormatado = Number(pedido.valor || 0).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      );

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>#${pedido.numero || pedido.id}</td>
        <td>${dataFormatada}</td>
        <td>
          <span class="status andamento">
            ${pedido.status || "Em andamento"}
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
        const itens = pedido.pedido_itens || [];

        if (itens.length === 0) {
          alert("Este pedido ainda não possui itens cadastrados.");
          return;
        }

        const textoItens = itens
          .map((item) => {
            return `${item.quantidade}x ${item.produto_nome} — ${Number(
              item.preco_unitario
            ).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}`;
          })
          .join("\n");

        alert(`Pedido #${pedido.numero || pedido.id}\n\n${textoItens}`);
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
   FAVORITOS
===================================================== */

async function carregarFavoritos() {
  const container = document.querySelector(".favoritos-grid");

  if (!container) return;

  const token = localStorage.getItem("tokenCial");

  try {
    const response = await fetch("http://localhost:4000/favoritos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const resultado = await response.json();

    if (!response.ok || !resultado.ok) {
      throw new Error(resultado.erro || "Erro ao buscar favoritos");
    }

    const favoritos = resultado.data || [];

    container.innerHTML = `
      <div class="sem-resultados">
        <span class="icone-vazio">❤️</span>
        <p>Você ainda não possui favoritos.</p>
        <small>
          Quando você salvar um produto, ele aparecerá aqui.
        </small>
      </div>
    `;

    favoritos.forEach((favorito) => {
      const card = document.createElement("div");

      card.className = "produto-favorito";

      const precoFormatado = Number(
        favorito.produto_preco || 0
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });

      card.innerHTML = `
        <img
          src="${favorito.produto_imagem || "../pagina/imagem/produto-sem-imagem.png"}"
          alt="${favorito.produto_nome || "Produto"}"
        >

        <h3>${favorito.produto_nome || "Produto"}</h3>

        <p>${precoFormatado}</p>

        <div class="acoes-favorito">
          <button
            type="button"
            class="btn-remover"
            data-id="${favorito.id}"
          >
            Remover
          </button>
        </div>
      `;

      const botaoRemover = card.querySelector(".btn-remover");

      botaoRemover.addEventListener("click", async () => {
        const confirmar = confirm(
          "Deseja remover este produto dos favoritos?"
        );

        if (!confirmar) return;

        try {
          const resposta = await fetch(
            `http://localhost:4000/favoritos/${favorito.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const resultadoRemocao = await resposta.json();

          if (!resposta.ok || !resultadoRemocao.ok) {
            throw new Error(
              resultadoRemocao.erro || "Erro ao remover favorito"
            );
          }

          await carregarFavoritos();
        } catch (erro) {
          console.error("Erro ao remover favorito:", erro);
          alert("Não foi possível remover o favorito.");
        }
      });

      container.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar favoritos:", erro);
    container.innerHTML = "<p>Não foi possível carregar seus favoritos.</p>";
  }
}


/* =====================================================
   ORÇAMENTOS
===================================================== */

async function iniciarOrcamentos() {

    btnOrcamento.forEach(botao => {

        botao.addEventListener("click", () => {

            alert("Visualização do orçamento em desenvolvimento.");

        });

    });

}
/* =====================================================
   GARANTIAS
===================================================== */

function iniciarGarantias() {

    btnGarantia.forEach(botao => {

        botao.addEventListener("click", () => {

            alert("Visualização da garantia em desenvolvimento.");

        });

    });

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

    btnAlterarSenha.addEventListener("click", (event) => {

        event.preventDefault();

        alert("Senha alterada com sucesso!");

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
