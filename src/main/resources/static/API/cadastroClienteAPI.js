function adicionarTelefone() {
        const container = document.getElementById('telefones-container');
        const template = document.getElementById('telefone-template');
        if (!container || !template) return;

        const clone = template.cloneNode(true);
        clone.style.display = '';
        clone.removeAttribute('id');
        clone.classList.add('telefone-clone');

        const removeBtn = clone.querySelector('.remove-btn');
        if (removeBtn) removeBtn.onclick = () => clone.remove();

        container.appendChild(clone);
    }

function addAddress() {
        const container = document.getElementById('address-container');
        const template = document.getElementById('address-template');
        if (!container || !template) return;

        const clone = template.cloneNode(true);
        clone.style.display = '';
        clone.style.border = '#c9c9c9 0.1px solid';
        clone.style.padding = '10px';
        clone.removeAttribute('id');
        clone.classList.add('address-clone');

        const removeBtn = clone.querySelector('.remove-btn');
        if (removeBtn) removeBtn.onclick = () => clone.remove();

        container.appendChild(clone);
    }

function addCard() {
        const container = document.getElementById('card-container');
        const template = document.getElementById('card-template');
        if (!container || !template) return;

        const clone = template.cloneNode(true);
        clone.style.display = '';
        clone.removeAttribute('id');
        clone.classList.add('card-clone');

        const removeBtn = clone.querySelector('.remove-btn');
        if (removeBtn) removeBtn.onclick = () => clone.remove();

        container.appendChild(clone);
    }
    document.addEventListener("DOMContentLoaded", () => {
    // Funções para adicionar clones


    // Cria campos iniciais
    adicionarTelefone();
    addAddress();
    addCard();

    // Modal sucesso
    const modalSucesso = document.getElementById("success-modal");
    const closeSucesso = modalSucesso?.querySelector(".close-btn");
    const abrirModal = (modal) => modal && (modal.style.display = 'flex');
    const fecharModal = (modal) => modal && (modal.style.display = 'none');

    closeSucesso?.addEventListener("click", () => {
        fecharModal(modalSucesso);
        window.location.replace("index.html");
    });

    window.addEventListener("click", (event) => {
        if (event.target === modalSucesso) {
            fecharModal(modalSucesso);
            window.location.replace("index.html");
        }
    });

    // Submit do formulário
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const telefones = Array.from(document.querySelectorAll('.telefone-clone'))
            .map(frame => {
                const tipo = frame.querySelector('select[name="tipo"]')?.value;
                const ddd = frame.querySelector('input[name="ddd"]')?.value.trim();
                const numero = frame.querySelector('input[name="numero"]')?.value.trim();
                // Ignora clones vazios
                if (!tipo || !ddd || !numero) return null;
                return { tipo: tipo.toUpperCase(), ddd, numero };
            })
            .filter(t => t !== null);

        const enderecos = Array.from(document.querySelectorAll('.address-clone'))
            .map(frame => {
                const tipoResidencia = frame.querySelector('select[name="tipoResidencia"]')?.value;
                const tipoLogradouro = frame.querySelector('select[name="tipoLogradouro"]')?.value;
                const logradouro = frame.querySelector('input[name="logradouro"]')?.value.trim();
                const numero = frame.querySelector('input[name="numero"]')?.value.trim();
                const bairro = frame.querySelector('input[name="bairro"]')?.value.trim();
                const cep = frame.querySelector('input[name="cep"]')?.value.trim();
                const cidade = frame.querySelector('input[name="cidade"]')?.value.trim();
                const estado = frame.querySelector('input[name="estado"]')?.value.trim();
                const pais = frame.querySelector('input[name="pais"]')?.value.trim();
                const observacoes = frame.querySelector('textarea[name="observacoes"]')?.value.trim();
                const cobranca = frame.querySelector('input[name="endereco-cobranca"]')?.checked || false;
                const entrega = frame.querySelector('input[name="endereco-entrega"]')?.checked || false;

                if (!tipoResidencia || !tipoLogradouro || !logradouro) return null;

                // Converte para enum esperado pelo back-end
                let tipoEndereco = null;
                if (cobranca && entrega) tipoEndereco = "ENTREGA_COBRANCA";
                else if (cobranca) tipoEndereco = "COBRANCA";
                else if (entrega) tipoEndereco = "ENTREGA";

                return {
                    tipoResidencia: tipoResidencia.toUpperCase(),
                    tipoLogradouro: tipoLogradouro.toUpperCase(),
                    logradouro,
                    numero, bairro, cep, cidade, estado, pais, observacoes,
                    tipoEndereco // string compatível com enum do back-end
                };
            })
            .filter(e => e !== null);


        const cartoesCredito = Array.from(document.querySelectorAll('.card-clone'))
            .map(frame => {
                const bandeira = frame.querySelector('select[name="bandeira"]')?.value;
                const numeroCartao = frame.querySelector('input[name="numero-cartao"]')?.value.trim();
                const nomeImpresso = frame.querySelector('input[name="nome-titular"]')?.value.trim();
                const codigoSeguranca = frame.querySelector('input[name="cvv"]')?.value.trim();
                const preferencial = frame.querySelector('input[name="cartao-preferencial"]')?.checked || false;

                if (!bandeira || bandeira === "ESCOLHA...") return null; // ignora cartões sem bandeira
                return { numeroCartao, bandeira: bandeira.toUpperCase(), nomeImpresso, codigoSeguranca, preferencial };
            })
            .filter(c => c !== null);

        const cliente = {
            nome: document.getElementById("nome")?.value.trim() || "",
            dataNascimento: document.getElementById("data-nascimento")?.value || "",
            genero: document.getElementById("genero")?.value.toUpperCase() || "",
            cpf: document.getElementById("cpf")?.value.trim() || "",
            email: document.getElementById("email")?.value.trim() || "",
            senha: document.getElementById("senha")?.value.trim() || "",
            confirmarSenha: document.getElementById("confirmacao-senha")?.value.trim() || "",
            telefones,
            enderecos,
            cartoesCredito
        };

        if (cliente.senha !== cliente.confirmarSenha) {
            alert("As senhas não coincidem. Verifique e tente novamente.");
            return;
        }

        console.log("JSON enviado:", JSON.stringify(cliente, null, 2));

        try {
            const response = await fetch("/clientes/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cliente)
            });

            if (response.ok) {
                abrirModal(modalSucesso);
            } else {
                const text = await response.text();
                alert("Erro: " + text);
            }
        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert("Ocorreu um erro ao cadastrar o cliente. Tente novamente mais tarde.");
        }
    });

});
