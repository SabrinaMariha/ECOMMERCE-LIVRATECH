document.addEventListener("click", async (e) => {
    // Verifica se clicou no botão de buscar CEP
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
                const tipo = data.logradouro.split(" ")[0].toUpperCase();
                [...tipoLogradouroSelect.options].forEach(opt => {
                    if (opt.value === tipo) tipoLogradouroSelect.value = tipo;
                });
            }

            // Atualiza o frete baseado no estado retornado
            const estado = data.uf || "";
            const frete = calcularFrete(estado);

            atualizarTotaisComFrete(frete); // aqui passa o frete calculado


        } catch (error) {
            console.error(error);
            alert("Erro ao buscar o CEP.");
        }
    }
});

// ----------------- FRETE -----------------
function calcularFrete(uf) {
    let frete = 0;
    switch (uf) {
        case "SP":
        case "RJ":
        case "MG":
            frete = 25;
            break;
        case "RS":
        case "PR":
        case "SC":
            frete = 20;
            break;
        default:
            frete = 30;
    }

    // Atualiza na tela
    document.getElementById("valorFreteResumo").textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorFreteResumoTotal").textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    return frete;
}

// ----------------- ATUALIZA TOTAIS -----------------
function atualizarTotaisComFrete(frete = 0) {
    let totalItens = 0;

    document.querySelectorAll('.cart-item').forEach(item => {
        const precoEl = item.querySelector('.item-price');
        const qtdEl = item.querySelector('.itemQuantidade');
        const totalEl = item.querySelector('.valorTotal');

        if (!precoEl || !qtdEl || !totalEl) return;

        const preco = parseFloat(precoEl.textContent.replace('R$', '').replace(',', '.').trim());
        const quantidade = parseInt(qtdEl.value) || 1;
        const total = preco * quantidade;
        totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        totalItens += total - 15.00;
    });

    const totalGeral = totalItens + frete;
    document.getElementById("valorTotalResumo").textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}
