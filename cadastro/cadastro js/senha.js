/*==================================================
                ELEMENTOS
==================================================*/

const etapas = document.querySelectorAll(".step");

const btnEnviar = document.getElementById("btnEnviar");
const btnValidar = document.getElementById("btnValidar");
const btnAlterar = document.getElementById("btnAlterar");

const email = document.getElementById("email");
const codigo = document.getElementById("codigo");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");
const mensagem = document.getElementById("mensagem");

/*==================================================
                FUNÇÕES
==================================================*/

function mostrarEtapa(id) {

    etapas.forEach(etapa => {

        etapa.classList.remove("active");

    });

    const etapaAtual = document.getElementById(id);

    if (etapaAtual) {

        etapaAtual.classList.add("active");

    }

}


function validarEmail() {

    if (email.value.trim() === "") {

        mostrarMensagem("Informe seu e-mail.","erro");

        return false;

    }

    return true;

}


function validarCodigo() {

    if (codigo.value.trim().length !== 6) {

        mostrarMensagem("Digite o código de 6 dígitos.","erro");

        return false;

    }

    return true;

}


function validarSenha() {

    if (novaSenha.value.length < 6) {

       mostrarMensagem("A senha deve possuir pelo menos 6 caracteres.","erro");

        return false;

    }

    if (novaSenha.value !== confirmarSenha.value) {

        mostrarMensagem("As senhas não coincidem.","erro");

        return false;

    }

    return true;

}

function mostrarMensagem(texto, tipo){

    mensagem.textContent = texto;

    mensagem.className = "";

    mensagem.classList.add(tipo);

}



/*==================================================
                EVENTOS
==================================================*/

btnEnviar.addEventListener("click", () => {

    if (!validarEmail()) return;

    // Backend futuramente

    mostrarEtapa("step-code");

});


btnValidar.addEventListener("click", () => {

    if (!validarCodigo()) return;

    // Backend futuramente

    mostrarEtapa("step-password");

});


btnAlterar.addEventListener("click", () => {

    if (!validarSenha()) return;

    // Backend futuramente

   mostrarMensagem("Senha alterada com sucesso!","sucesso");

    window.location.href = "login.html";

});



/*==================================================
                BACKEND
==================================================*/

/*

async function enviarCodigo(){

}

async function validarCodigoAPI(){

}

async function alterarSenha(){

}

*/



/*==================================================
                INICIALIZAÇÃO
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    mostrarEtapa("step-email");

});
