const botoesMenu = document.querySelectorAll(".menu");
const secoes = document.querySelectorAll(".secao");
const cards = document.querySelectorAll(".card");



    const secaoSelecionada = document.getElementById(nomeSecao);

    if (secaoSelecionada) {

        secaoSelecionada.classList.add("ativa");

    }

    botoesMenu.forEach(botao => {

        botao.classList.remove("ativo");

        if (botao.dataset.secao === nomeSecao) {

            botao.classList.add("ativo");

        }

    });



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

cards.forEach(card => {

    card.addEventListener("click", () => {

        abrirSecao(card.dataset.secao);

    });

});
function abrirSecao(nomeSecao) {

    secoes.forEach(secao => {

        secao.classList.remove("ativa");

        secao.style.opacity = "0";

        secao.style.transform = "translateY(20px)";

    });

    const secaoSelecionada = document.getElementById(nomeSecao);

    if (secaoSelecionada) {

        secaoSelecionada.classList.add("ativa");

        setTimeout(() => {

            secaoSelecionada.style.opacity = "1";

            secaoSelecionada.style.transform = "translateY(0)";

        }, 80);

    }

    botoesMenu.forEach(botao => {

        botao.classList.remove("ativo");

        if (botao.dataset.secao === nomeSecao) {

            botao.classList.add("ativo");

        }

    });

}
const botoesDetalhes = document.querySelectorAll(".btn-detalhes");

botoesDetalhes.forEach(botao => {

    botao.addEventListener("click", () => {

        alert("Em breve você poderá visualizar todos os detalhes deste pedido.");

    });

});
const botoesVer = document.querySelectorAll(".btn-ver");
const botoesRemover = document.querySelectorAll(".btn-remover");

botoesVer.forEach(botao => {

    botao.addEventListener("click", () => {

        alert("Página do produto em desenvolvimento.");

    });

});

botoesRemover.forEach(botao => {

    botao.addEventListener("click", () => {

        const confirmar = confirm("Deseja remover este produto dos favoritos?");

        if(confirmar){

            alert("Produto removido dos favoritos.");

        }

    });

});
const botoesOrcamento = document.querySelectorAll(".btn-orcamento");

botoesOrcamento.forEach(botao => {

    botao.addEventListener("click", () => {

        alert("Visualização do orçamento em desenvolvimento.");

    });

});
const botoesGarantia = document.querySelectorAll(".btn-garantia");

botoesGarantia.forEach(botao => {

    botao.addEventListener("click", () => {

        alert("Os detalhes da garantia estarão disponíveis em breve.");

    });

});
const botaoSalvar = document.querySelector(".btn-salvar");

if(botaoSalvar){

    botaoSalvar.addEventListener("click", () => {

        alert("Seus dados foram salvos com sucesso!");

    });

}
