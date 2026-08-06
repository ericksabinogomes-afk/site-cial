/*==================================================
                ELEMENTOS
==================================================*/

const menuItems = document.querySelectorAll(".menu-item");

const sections = document.querySelectorAll(".admin-section");

const btnLogout = document.querySelector(".logout");

const btnSave = document.querySelector(".btn-save");

const btnAdd = document.querySelectorAll(".btn-add");


/*==================================================
                FUNÇÕES
==================================================*/

function abrirSecao(nomeSecao){

    sections.forEach(secao =>{

        secao.classList.remove("active");

    });

    const secaoSelecionada = document.getElementById(nomeSecao);

    if(secaoSelecionada){

        secaoSelecionada.classList.add("active");

    }

    menuItems.forEach(item =>{

        item.classList.remove("active");

        if(item.dataset.section === nomeSecao){

            item.classList.add("active");

        }

    });

}


/*==================================================
                ANIMAÇÃO
==================================================*/

function mostrarSecao(nomeSecao){

    abrirSecao(nomeSecao);

    const secao = document.getElementById(nomeSecao);

    if(secao){

        secao.style.opacity = "0";

        secao.style.transform = "translateY(20px)";

        setTimeout(()=>{

            secao.style.opacity = "1";

            secao.style.transform = "translateY(0)";

        },100);

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

        const confirmar = confirm("Deseja realmente sair do painel administrativo?");

        if (confirmar) {

            // Alterar futuramente para a página de login
            window.location.href = "login.html";

        }

    });

}


if (btnSave) {

    btnSave.addEventListener("click", () => {

        alert("Configurações salvas com sucesso!");

    });

}


btnAdd.forEach(botao => {

    botao.addEventListener("click", () => {

        if (botao.textContent.includes("Produto")) {

            alert("Tela de cadastro de produto em desenvolvimento.");

        }

        else if (botao.textContent.includes("Categoria")) {

            alert("Tela de cadastro de categoria em desenvolvimento.");

        }

    });

});


/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    mostrarSecao("dashboard");

});