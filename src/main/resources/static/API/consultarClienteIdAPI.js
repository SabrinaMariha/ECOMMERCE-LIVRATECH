document.addEventListener('DOMContentLoaded', async () => {
    // --- Carregar dados do cliente ---
    async function carregarCliente() {
        try {
            const response = await fetch("http://localhost:8080/clientes/3");
            if (!response.ok) throw new Error("Cliente não encontrado");
            const cliente = await response.json();

            preencherDadosPessoais(cliente);
            preencherTelefones(cliente.telefones || []);
            preencherEnderecos(cliente.enderecos || []);
            preencherCartoes(cliente.cartoesCredito || []);

        } catch (error) {
            console.error("Erro na consulta:", error);
        }
    }

    // --- Preencher dados pessoais ---
    function preencherDadosPessoais(cliente) {
        document.getElementById("nome").value = cliente.nome;
        document.getElementById("data-nascimento").value = cliente.dataNascimento;
        document.getElementById("genero").value = cliente.genero;
        document.getElementById("cpf").value = cliente.cpf;
        document.getElementById("email").value = cliente.email;
    }

    // --- Telefones ---
    function preencherTelefones(telefones) {
        const container = document.getElementById("telefones-container");
        container.querySelectorAll(".telefone-container:not(#telefone-template)").forEach(el => el.remove());

        telefones.forEach(tel => {
            const template = document.getElementById("telefone-template");
            const clone = template.cloneNode(true);
            clone.style.display = "flex";
            clone.removeAttribute("id");

            clone.querySelector("select[name='tipo']").value = tel.tipo;
            clone.querySelector("input[name='ddd']").value = tel.ddd;
            clone.querySelector("input[name='numero']").value = tel.numero;

            container.appendChild(clone);
        });
    }

    // --- Endereços ---
    function preencherEnderecos(enderecos) {
        const container = document.getElementById("address-container");
        container.querySelectorAll(".address-container:not(#address-template)").forEach(el => el.remove());

        enderecos.forEach(end => {
            const template = document.getElementById("address-template");
            const clone = template.cloneNode(true);
            clone.style.display = "block";
            clone.removeAttribute("id");

            clone.querySelector("[name='tipoResidencia']").value = end.tipoResidencia;
            clone.querySelector("[name='cep']").value = end.cep;
            clone.querySelector("[name='tipoLogradouro']").value = end.tipoLogradouro;
            clone.querySelector("[name='logradouro']").value = end.logradouro;
            clone.querySelector("[name='numero']").value = end.numero;
            clone.querySelector("[name='bairro']").value = end.bairro;
            clone.querySelector("[name='cidade']").value = end.cidade;
            clone.querySelector("[name='estado']").value = end.estado;
            clone.querySelector("[name='pais']").value = end.pais;
            clone.querySelector("[name='observacoes']").value = end.observacoes;

            // Checkboxes entrega/cobrança
            if (end.tipoEndereco.includes("ENTREGA")) {
                clone.querySelector("input[name='endereco-entrega']").checked = true;
            }
            if (end.tipoEndereco.includes("COBRANCA")) {
                clone.querySelector("input[name='endereco-cobranca']").checked = true;
            }

            container.appendChild(clone);
        });
    }

    // --- Cartões ---
    function preencherCartoes(cartoes) {
        const container = document.getElementById("card-container");
        container.querySelectorAll(".card-container:not(#card-template)").forEach(el => el.remove());

        cartoes.forEach(card => {
            const template = document.getElementById("card-template");
            const clone = template.cloneNode(true);
            clone.style.display = "block";
            clone.removeAttribute("id");

            clone.querySelector("[name='numero-cartao']").value = card.numeroCartao;
            clone.querySelector("[name='bandeira']").value = card.bandeira;
            clone.querySelector("[name='nome-titular']").value = card.nomeImpresso;
            clone.querySelector("[name='cvv']").value = card.codigoSeguranca;

            if (card.preferencial) {
                clone.querySelector("input[name='cartao-preferencial']").checked = true;
            }

            container.appendChild(clone);
        });
    }

    //Chama a API ao carregar
    carregarCliente();
});
