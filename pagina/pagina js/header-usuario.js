/*==================================================
        CONTROLE DE USUÁRIO NO INDEX
==================================================*/

console.log("index-usuarios.js carregado");

const usuarioRaw = localStorage.getItem("usuarioCial");
const token = localStorage.getItem("tokenCial");

console.log("usuarioRaw no index:", usuarioRaw);
console.log("token no index:", token);

const linkEntrar = document.getElementById("linkEntrar");
const usuarioLogado = document.getElementById("usuarioLogado");
const nomeUsuarioSpan = document.getElementById("nomeUsuario");
const btnAreaCliente = document.getElementById("btnAreaCliente");
const btnAdmin = document.getElementById("btnAdmin");
const btnSair = document.getElementById("btnSair");


if (!usuarioRaw || !token) {
  // Não logado
  if (linkEntrar) linkEntrar.style.display = "inline-block";

  if (usuarioLogado) usuarioLogado.style.display = "none";

} else {
  // Logado
const usuario = JSON.parse(usuarioRaw);

if (nomeUsuarioSpan) {
  const nomeCompleto = (usuario.nome || "").trim();
  const primeiroNome = nomeCompleto.split(/\s+/)[0];

  nomeUsuarioSpan.textContent = primeiroNome || usuario.email || "Usuário";

}

// Normalizar perfil: remover aspas extras, espaços etc.
let perfil = usuario.perfil || "cliente";

if (typeof perfil === "string") {

  perfil = perfil.replace(/"/g, "").trim();

}
console.log("perfil normalizado:", perfil);

  // Esconde "Entrar" e mostra área do usuário

  if (linkEntrar) linkEntrar.style.display = "none";

  if (usuarioLogado) usuarioLogado.style.display = "flex";

  // Área do Cliente: para todos os logados

  if (btnAreaCliente) {

    btnAreaCliente.style.display = "inline-block";

    btnAreaCliente.addEventListener("click", () => {

      window.location.href = "../../cadastro/area-cliente.html"; 
    });
  }

  // Painel Admin: só para admin
  if (perfil === "admin" && btnAdmin) {

    btnAdmin.style.display = "inline-block";

    btnAdmin.addEventListener("click", () => {

      window.location.href = "../pagina/admin.html"; 
    });
  }

  // Botão Sair
  if (btnSair) {

    btnSair.style.display = "inline-block";

    btnSair.addEventListener("click", () => {

      localStorage.removeItem("tokenCial");

      localStorage.removeItem("usuarioCial");

      window.location.reload();
    });
  }
}

/*==================================================
        CONTADOR DO CARRINHO NO BANCO
==================================================*/

const API_CARRINHO_HEADER =
    window.API_BASE_URL ||
    "http://localhost:4000";

async function atualizarContadorCarrinho() {
    const contador =
        document.getElementById(
            "contadorCarrinho"
        );

    if (!contador) {
        return;
    }

    const tokenAtual =
        localStorage.getItem("tokenCial");

    if (!tokenAtual) {
        contador.textContent = "0";
        return;
    }

    try {
        const resposta = await fetch(
            `${API_CARRINHO_HEADER}/carrinho`,
            {
                headers: {
                    Authorization:
                        `Bearer ${tokenAtual}`
                }
            }
        );

        if (resposta.status === 401) {
            contador.textContent = "0";
            return;
        }

        const resultado =
            await resposta.json();

        if (!resposta.ok || !resultado.ok) {
            throw new Error(
                resultado.erro ||
                "Erro ao carregar contador do carrinho"
            );
        }

        const quantidade =
            (resultado.data || [])
                .reduce((total, item) => {
                    return total +
                        Number(item.quantidade || 0);
                }, 0);

        contador.textContent =
            quantidade;
    } catch (erro) {
        console.error(
            "Erro no contador do carrinho:",
            erro
        );

        contador.textContent = "0";
    }
}

window.atualizarContadorCarrinho =
    atualizarContadorCarrinho;

document.addEventListener(
    "DOMContentLoaded",
    atualizarContadorCarrinho
);