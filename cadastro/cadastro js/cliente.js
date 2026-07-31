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

                    alert("Logout em desenvolvimento.");

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

    btnSalvar.addEventListener("click", (event) => {

        event.preventDefault();

        alert("Dados atualizados com sucesso!");

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
