/*==================================================
                ELEMENTOS
==================================================*/

const btnEnviar = document.getElementById('btnEnviar');
const btnValidar = document.getElementById('btnValidar');
const btnAlterar = document.getElementById('btnAlterar');
const mensagem = document.getElementById('mensagem');

const emailInput = document.getElementById('email');
const codigoInput = document.getElementById('codigo');
const novaSenhaInput = document.getElementById('novaSenha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');

const stepEmail = document.getElementById('step-email');
const stepCode = document.getElementById('step-code');
const stepPassword = document.getElementById('step-password');

const API_URL = 'http://localhost:4000';

/*==================================================
                ENVIAR CÓDIGO
==================================================*/

let userId = null;

btnEnviar.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  
  if (!email) {
    mostrarMensagem('Digite seu email', 'erro');
    return;
  }
  
  if (!validarEmail(email)) {
    mostrarMensagem('Digite um email válido', 'erro');
    return;
  }
  
  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';
  
  try {
    const response = await fetch(`${API_URL}/api/recuperar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      mostrarMensagem(data.message, 'sucesso');
      setTimeout(() => {
        esconderMensagem();
        stepEmail.classList.remove('active');
        stepCode.classList.add('active');
      }, 1500);
    } else {
      mostrarMensagem(data.error, 'erro');
    }
  } catch (error) {
    mostrarMensagem('Erro ao conectar com servidor', 'erro');
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar Código';
  }
});

/*==================================================
                VALIDAR CÓDIGO
==================================================*/

btnValidar.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const codigo = codigoInput.value.trim();
  
  if (!codigo) {
    mostrarMensagem('Digite o código', 'erro');
    return;
  }
  
  if (codigo.length !== 6) {
    mostrarMensagem('O código deve ter 6 dígitos', 'erro');
    return;
  }
  
  btnValidar.disabled = true;
  btnValidar.textContent = 'Validando...';
  
  try {
    const response = await fetch(`${API_URL}/api/validar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo })
    });
    
    const data = await response.json();
    
    if (response.ok && data.valid) {
      userId = data.user_id;
      mostrarMensagem('Código válido!', 'sucesso');
      setTimeout(() => {
        esconderMensagem();
        stepCode.classList.remove('active');
        stepPassword.classList.add('active');
      }, 1000);
    } else {
      mostrarMensagem(data.error, 'erro');
    }
  } catch (error) {
    mostrarMensagem('Erro ao conectar com servidor', 'erro');
  } finally {
    btnValidar.disabled = false;
    btnValidar.textContent = 'Validar Código';
  }
});

/*==================================================
                ATUALIZAR SENHA
==================================================*/

btnAlterar.addEventListener('click', async () => {
  const password = novaSenhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;
  
  if (!password) {
    mostrarMensagem('Digite a nova senha', 'erro');
    return;
  }
  
  if (password.length < 6) {
    mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'erro');
    return;
  }
  
  if (password !== confirmarSenha) {
    mostrarMensagem('As senhas não coincidem', 'erro');
    return;
  }
  
  btnAlterar.disabled = true;
  btnAlterar.textContent = 'Alterando...';
  
  try {
    const response = await fetch(`${API_URL}/api/atualizar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId, 
        codigo: codigoInput.value.trim(), 
        password 
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      mostrarMensagem(data.message, 'sucesso');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      mostrarMensagem(data.error, 'erro');
    }
  } catch (error) {
    mostrarMensagem('Erro ao conectar com servidor', 'erro');
  } finally {
    btnAlterar.disabled = false;
    btnAlterar.textContent = 'Alterar Senha';
  }
});

// Funções auxiliares
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo;
  mensagem.style.display = 'block';
}

function esconderMensagem() {
  mensagem.style.display = 'none';
  mensagem.className = '';
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/*==================================================
                ENTER NOS INPUTS
==================================================*/

emailInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnEnviar.click();
});

codigoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnValidar.click();
});

novaSenhaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnAlterar.click();
});

confirmarSenhaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnAlterar.click();
});