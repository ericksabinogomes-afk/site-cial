/*==================================================
            ELEMENTOS DO LOGIN
==================================================*/

const loginForm = document.getElementById("loginForm");

const usuario = document.getElementById("usuario");

const senha = document.getElementById("senha");

const toggleSenha = document.getElementById("toggleSenha");


/*==================================================
        MOSTRAR / OCULTAR SENHA
==================================================*/

toggleSenha.addEventListener("click", () => {

    if (senha.type === "password") {

        senha.type = "text";

        toggleSenha.textContent = "🙈";

    } else {

        senha.type = "password";

        toggleSenha.textContent = "👁";

    }

});
/*==================================================
            VALIDAÇÃO DO LOGIN
==================================================*/

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const usuarioValor = usuario.value.trim();

    const senhaValor = senha.value.trim();

    if (usuarioValor === "") {

        alert("Por favor, informe seu e-mail ou CPF.");

        usuario.focus();

        return;

    }

    if (senhaValor === "") {

        alert("Por favor, informe sua senha.");

        senha.focus();

        return;

    }

    realizarLogin(usuarioValor, senhaValor);

});
/*==================================================
            LOGIN (SIMULAÇÃO)
==================================================*/

function realizarLogin(usuarioDigitado, senhaDigitada){

    console.log("Usuário:", usuarioDigitado);

    console.log("Senha:", senhaDigitada);

    alert("Login validado com sucesso! (Modo de desenvolvimento)");

}
/*==================================================
        LOGIN (SIMULAÇÃO)
====================================================

function realizarLogin(usuarioDigitado, senhaDigitada){

    const botaoLogin = document.querySelector(".btn-login");

    botaoLogin.disabled = true;

    botaoLogin.textContent = "Entrando...";

    setTimeout(() => {

        console.log("Usuário:", usuarioDigitado);

        console.log("Senha:", senhaDigitada);

        alert("Login validado com sucesso! (Modo de desenvolvimento)");

        botaoLogin.disabled = false;

        botaoLogin.textContent = "Entrar";

    },1000);

}*/

/*==================================================
        LOGIN (BACKEND REAL)
==================================================*/

async function realizarLogin(usuarioDigitado, senhaDigitada){

    const botaoLogin = document.querySelector(".btn-login");

    botaoLogin.disabled = true;
    botaoLogin.textContent = "Entrando...";

    try {
        const response = await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: usuarioDigitado, // se o campo for e-mail
                senha: senhaDigitada
            })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            alert(result.erro || "E-mail ou senha inválidos.");
            botaoLogin.disabled = false;
            botaoLogin.textContent = "Entrar";
            return;
        }

        alert("Login realizado com sucesso!");
        // redirecionar se quiser:
        // window.location.href = "index.html";
    } catch (error) {
        console.error(error);
        alert("Erro de conexão com o servidor. Tente novamente.");
    } finally {
        botaoLogin.disabled = false;
        botaoLogin.textContent = "Entrar";
    }
}