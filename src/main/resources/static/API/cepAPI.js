document.addEventListener("click", async (e) => {
    // Verifica se clicou em um botão de buscar CEP
    if (e.target.closest(".btnBuscarCep")) {
        const btn = e.target.closest(".btnBuscarCep");
        const inputCep = btn.closest(".cepInputGroup").querySelector("input[name='cep']");
        const addressContainer = btn.closest(".address-container");

        if (!inputCep) return;

        let cep = inputCep.value.replace(/\D/g, ""); // Remove tudo que não for número

        if (cep.length !== 8) {
            alert("CEP inválido! Digite 8 números.");
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error("Erro ao consultar CEP");

            const data = await response.json();

            if (data.erro) {
                alert("CEP não encontrado!");
                return;
            }

            // Preenche os campos do endereço
            addressContainer.querySelector("input[name='logradouro']").value = data.logradouro || "";
            addressContainer.querySelector("input[name='bairro']").value = data.bairro || "";
            addressContainer.querySelector("input[name='cidade']").value = data.localidade || "";
            addressContainer.querySelector("input[name='estado']").value = data.uf || "";
            addressContainer.querySelector("input[name='pais']").value = "Brasil";

            // Preenche tipo de logradouro se possível
            const tipoLogradouroSelect = addressContainer.querySelector("select[name='tipoLogradouro']");
            if (tipoLogradouroSelect && data.logradouro) {
                const tipo = data.logradouro.split(" ")[0].toUpperCase(); // primeira palavra
                [...tipoLogradouroSelect.options].forEach(opt => {
                    if (opt.value === tipo) tipoLogradouroSelect.value = tipo;
                });
            }

        } catch (error) {
            console.error(error);
            alert("Erro ao buscar o CEP.");
        }
    }
});
