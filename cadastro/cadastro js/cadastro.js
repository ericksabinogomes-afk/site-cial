/*==========================================================
    CIAL ASA SUL
    cadastro.js
==========================================================*/


/*==========================================================
    ELEMENTOS
==========================================================*/

const form = document.getElementById("cadastroForm");

const steps = document.querySelectorAll(".form-step");

const nextButtons = document.querySelectorAll(".btn-next");

const backButtons = document.querySelectorAll(".btn-back");

const progressFill = document.querySelector(".progress-fill");

const progressText = document.querySelector(".progress-text");


/*==========================================================
    CONTROLE DAS ETAPAS
==========================================================*/

let currentStep = 0;


/*==========================================================
    ATUALIZA BARRA
==========================================================*/

function updateProgress(){

    const percentage = ((currentStep + 1) / steps.length) * 100;

    progressFill.style.width = percentage + "%";

    progressText.textContent =
        `Etapa ${currentStep + 1} de ${steps.length}`;

}


/*==========================================================
    MOSTRA ETAPA
==========================================================*/

function showStep(index){

    steps.forEach(step=>{

        step.classList.remove("active");

    });

    steps[index].classList.add("active");

    currentStep = index;

    updateProgress();

}


/*==========================================================
    PRÓXIMO
==========================================================*/

nextButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        if(!validarEtapa()){

            return;

        }

        if(currentStep < steps.length - 1){

            showStep(currentStep + 1);

        }

    });

});


/*==========================================================
    VOLTAR
==========================================================*/

backButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        if(currentStep > 0){

            showStep(currentStep - 1);

        }

    });

});


/*==========================================================
    INICIALIZA
==========================================================*/

updateProgress();

/*==========================================================
    CAMPOS
==========================================================*/

const cpf = document.getElementById("cpf");

const cnpj = document.getElementById("cnpj");

const cep = document.getElementById("cep");

const telefone = document.getElementById("telefone");

const whatsapp = document.getElementById("whatsapp");


/*==========================================================
    FUNÇÃO GERAL
==========================================================*/

function somenteNumeros(valor){

    return valor.replace(/\D/g,"");

}


/*==========================================================
    CPF
==========================================================*/

if(cpf){

    cpf.addEventListener("input",()=>{

        let valor = somenteNumeros(cpf.value);

        valor = valor.replace(/^(\d{3})(\d)/,"$1.$2");
        valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3");
        valor = valor.replace(/\.(\d{3})(\d)/,".$1-$2");

        cpf.value = valor;

    });

}


/*==========================================================
    CNPJ
==========================================================*/

if(cnpj){

    cnpj.addEventListener("input",()=>{

        let valor = somenteNumeros(cnpj.value);

        valor = valor.replace(/^(\d{2})(\d)/,"$1.$2");
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3");
        valor = valor.replace(/\.(\d{3})(\d)/,".$1/$2");
        valor = valor.replace(/(\d{4})(\d)/,"$1-$2");

        cnpj.value = valor;

    });

}


/*==========================================================
    CEP
==========================================================*/

if(cep){

    cep.addEventListener("input",()=>{

        let valor = somenteNumeros(cep.value);

        valor = valor.replace(/^(\d{5})(\d)/,"$1-$2");

        cep.value = valor;

    });

}


/*==========================================================
    TELEFONE
==========================================================*/

function mascaraTelefone(campo){

    campo.addEventListener("input",()=>{

        let valor = somenteNumeros(campo.value);

        if(valor.length <= 10){

            valor = valor.replace(/^(\d{2})(\d)/,"($1) $2");
            valor = valor.replace(/(\d{4})(\d)/,"$1-$2");

        }else{

            valor = valor.replace(/^(\d{2})(\d)/,"($1) $2");
            valor = valor.replace(/(\d{5})(\d)/,"$1-$2");

        }

        campo.value = valor;

    });

}


if(telefone){

    mascaraTelefone(telefone);

}

if(whatsapp){

    mascaraTelefone(whatsapp);

}

/*==========================================================
    PESSOA FÍSICA / PESSOA JURÍDICA
==========================================================*/

const tipoPessoa = document.getElementById("tipoPessoa");

const dadosPJ = document.getElementById("dadosPJ");

const razaoSocial = document.getElementById("razaoSocial");

const nomeFantasia = document.getElementById("nomeFantasia");

const campoCNPJ = document.getElementById("cnpj");


/*==========================================================
    ATUALIZA CAMPOS PJ
==========================================================*/

function atualizarPessoa(){

    if(!tipoPessoa || !dadosPJ) return;

    if(tipoPessoa.value === "pj"){

        dadosPJ.classList.remove("hidden");

        razaoSocial.required = true;

        nomeFantasia.required = true;

        campoCNPJ.required = true;

    }else{

        dadosPJ.classList.add("hidden");

        razaoSocial.required = false;

        nomeFantasia.required = false;

        campoCNPJ.required = false;

        razaoSocial.value = "";

        nomeFantasia.value = "";

        campoCNPJ.value = "";

    }

}


/*==========================================================
    EVENTO
==========================================================*/

if(tipoPessoa){

    tipoPessoa.addEventListener("change", atualizarPessoa);

    atualizarPessoa();

}

/*==========================================================
    VALIDA ETAPA
==========================================================*/

function validarEtapa(){

    const etapaAtual = steps[currentStep];

    const campos = etapaAtual.querySelectorAll("[required]");

    for(const campo of campos){

        if(campo.offsetParent === null){
            continue;
        }

        if(campo.type === "checkbox"){

            if(!campo.checked){

                alert("Você precisa aceitar os termos para continuar.");

                campo.focus();

                return false;

            }

        }else{

            if(campo.value.trim() === ""){

                alert("Preencha todos os campos obrigatórios.");

                campo.focus();

                return false;

            }

        }

    }

    return true;

}

/*==========================================================
    VIA CEP
==========================================================*/

async function buscarCEP(){

    const cepLimpo = cep.value.replace(/\D/g,"");

    if(cepLimpo.length !== 8){

        return;

    }

    try{

        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

        const dados = await resposta.json();

        if(dados.erro){

            alert("CEP não encontrado.");

            return;

        }

        document.getElementById("rua").value = dados.logradouro || "";

        document.getElementById("bairro").value = dados.bairro || "";

        document.getElementById("cidade").value = dados.localidade || "";

        document.getElementById("estado").value = dados.uf || "";

        document.getElementById("numero").focus();

    }catch(error){

        console.error(error);

        alert("Erro ao consultar o CEP.");

    }

}


/*==========================================================
    EVENTO CEP
==========================================================*/

if(cep){

    cep.addEventListener("blur", buscarCEP);

}

/*==========================================================
    VALIDAÇÃO FINAL
==========================================================*/

form.addEventListener("submit", async function(event){

    event.preventDefault();

    if(!validarEtapa()){
        return;
    }

    const senha = document.getElementById("senha");

    const confirmarSenha = document.getElementById("confirmarSenha");


    /*======================================================
        CONFERE SENHAS
    ======================================================*/

    if(senha.value !== confirmarSenha.value){

        alert("As senhas não coincidem.");

        confirmarSenha.focus();

        return;

    }


    if(senha.value.length < 6){

        alert("A senha deve possuir pelo menos 6 caracteres.");

        senha.focus();

        return;

    }


/*======================================================
    Pegar campos para o back
=======================================================*/
  const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const cpfValor = document.getElementById("cpf").value;
    const telefoneValor = document.getElementById("telefone")?.value || "";
    const whatsappValor = document.getElementById("whatsapp")?.value || "";
    const cepValor = document.getElementById("cep").value;
    const ruaValor = document.getElementById("rua").value;
    const bairroValor = document.getElementById("bairro").value;
    const cidadeValor = document.getElementById("cidade").value;
    const estadoValor = document.getElementById("estado").value;
    const numeroEnderecoValor = document.getElementById("numero").value;
    const tipoPessoaValor = document.getElementById("tipoPessoa")?.value || null;
    const cnpjValor = document.getElementById("cnpj")?.value || "";
    const razaoSocialValor = document.getElementById("razaoSocial")?.value || "";
    const nomeFantasiaValor = document.getElementById("nomeFantasia")?.value || "";

    try {
        const response = await fetch("http://localhost:4000/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                email,
                senha: senha.value,
                cpf: cpfValor,
                telefone: telefoneValor,
                whatsapp: whatsappValor,
                cep: cepValor,
                rua: ruaValor,
                bairro: bairroValor,
                cidade: cidadeValor,
                estado: estadoValor,
                numero_endereco: numeroEnderecoValor,
                tipo_pessoa: tipoPessoaValor,
                cnpj: cnpjValor,
                razao_social: razaoSocialValor,
                nome_fantasia: nomeFantasiaValor
            })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            alert("Erro ao cadastrar: " + (result.erro || "tente novamente"));
            return;
        }

        window.location.href = "../cadastro/login.html";
    } catch (error) {
        console.error(error);
        alert("Erro de conexão. Tente novamente.");
    }
});