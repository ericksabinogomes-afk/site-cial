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

//  Contador do Carrinho

function atualizarContadorCarrinho() {
    const contador = document.getElementById(
        "contadorCarrinho"
    );

    if (!contador) {
        return;
    }

    try {
        const dados = localStorage.getItem(
            "cial_carrinho"
        );

        const carrinho = dados
            ? JSON.parse(dados)
            : [];

        const quantidade = Array.isArray(carrinho)
            ? carrinho.reduce((total, produto) => {
                return total + Number(
                    produto.quantidade || 0
                );
            }, 0)
            : 0;

        contador.textContent = quantidade;
    } catch (erro) {
        console.error(
            "Erro ao atualizar contador do carrinho:",
            erro
        );

        contador.textContent = "0";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    atualizarContadorCarrinho
);