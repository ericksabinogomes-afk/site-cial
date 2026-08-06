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

/* ===== NOVO: usuário logado ===== */

let usuarioAtual = null;

function carregarUsuarioLogado() {
    const usuarioJSON = localStorage.getItem("usuarioCial");

    if (!usuarioJSON) {
        // Não está logado -> volta para login

        window.location.href = "../cadastro/login.html";
        return null;
    }

    try {
        const usuario = JSON.parse(usuarioJSON);
        return usuario;

    } catch (e) {
        console.error("Erro ao ler usuarioCial:", e);
        localStorage.removeItem("usuarioCial");
        window.location.href = "../cadastro/login.html";
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
    window.location.href = "../cadastro/login.html";
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

function iniciarPedidos() {

    btnDetalhes.forEach(botao => {

        botao.addEventListener("click", () => {

            alert("Em breve você poderá visualizar todos os detalhes deste pedido.");

        });

    });

}
/* =====================================================
   FAVORITOS
===================================================== */

function iniciarFavoritos() {

    btnVer.forEach(botao => {

        botao.addEventListener("click", () => {

            alert("Página do produto em desenvolvimento.");

        });

    });

    btnRemover.forEach(botao => {

        botao.addEventListener("click", () => {

            const confirmar = confirm("Deseja remover este produto dos favoritos?");

            if (confirmar) {

                alert("Produto removido dos favoritos.");

            }

        });

    });

}
/* =====================================================
   ORÇAMENTOS
===================================================== */

function iniciarOrcamentos() {

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
    if (!btnSalvar) return;

    btnSalvar.addEventListener("click", async (event) => {
        event.preventDefault();

        if (!usuarioAtual) {
            alert("Usuário não encontrado na sessão.");
            return;
        }

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim(); // por enquanto só exibe
        const telefone = document.getElementById("telefone").value.trim();
        const cpf = document.getElementById("cpf").value.trim();

        if (!nome || !email) {
            alert("Nome e email são obrigatórios.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/meus-dados/${usuarioAtual.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nome, telefone, cpf })
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                alert("Erro ao salvar dados: " + (result.erro || "tente novamente"));
                return;
            }

            // Atualiza também o que está no localStorage
            usuarioAtual.nome = nome;
            usuarioAtual.telefone = telefone;
            usuarioAtual.cpf = cpf;
            localStorage.setItem("usuarioCial", JSON.stringify(usuarioAtual));

            atualizarInterfaceUsuario();
            alert("Dados atualizados com sucesso!");
        } catch (error) {
            console.error(error);
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
    iniciarPedidos();
    iniciarFavoritos();
    iniciarOrcamentos();
    iniciarGarantias();
    iniciarDados();
    iniciarSeguranca();
    abrirSecao("inicio");

});
