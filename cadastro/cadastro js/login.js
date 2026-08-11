/*==================================================
            ELEMENTOS DO LOGIN
==================================================*/

const loginForm = document.getElementById("loginForm");
const usuario = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");

/*==================================================
        MOSTRAR / OCULTAR SENHA
==================================================*/

toggleSenha.addEventListener("click", () => {
  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    toggleSenha.textContent = "🙈";
  } else {
    senhaInput.type = "password";
    toggleSenha.textContent = "👁";
  }
});

/*==================================================
            VALIDAÇÃO DO LOGIN
==================================================*/

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const usuarioValor = usuario.value.trim();
  const senhaValor = senhaInput.value.trim();

  if (usuarioValor === "") {
    alert("Por favor, informe seu e-mail ou CPF.");
    usuario.focus();
    return;
  }

  if (senhaValor === "") {
    alert("Por favor, informe sua senha.");
    senhaInput.focus();
    return;
  }

  realizarLogin(usuarioValor, senhaValor);
});

/*==================================================
        LOGIN (BACKEND REAL)
==================================================*/

async function realizarLogin(usuarioDigitado, senhaDigitada) {
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
        identificador: usuarioDigitado, // pode ser e-mail OU CPF
        senha: senhaDigitada
      })
    });

    const result = await response.json();

    console.log("result do login:", result);
    console.log("response.ok:", response.ok);

    if (!response.ok || !result.ok) {
    alert(result.erro || "Usuário ou senha inválidos.");
    botaoLogin.disabled = false;
    botaoLogin.textContent = "Entrar";
    return;
    }

    // ====== Salvar token e usuário ======
    const usuarioLogado = result.usuario;
    const token = result.token;

    if (!token) {
      alert("Login bem-sucedido, mas sem token. Verifique o backend.");
      botaoLogin.disabled = false;
      botaoLogin.textContent = "Entrar";
      return;
    }

    localStorage.setItem("usuarioCial", JSON.stringify(usuarioLogado));
    localStorage.setItem("tokenCial", token);

    // Redirecionar para o painel admin
    window.location.href = "../../pagina/index.html";

  } catch (error) {
    console.error(error);
    alert("Erro de conexão com o servidor. Tente novamente.");
  } finally {
    botaoLogin.disabled = false;
    botaoLogin.textContent = "Entrar";
  }
}