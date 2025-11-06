// Arquivo: CalcularTotais.js

export function atualizarTotais(frete = null) {
    let totalItens = 0;
    let somaDescontosCupons = 0; // Soma bruta de todos os cupons selecionados
    let valorFrete = 0; // Variável para armazenar o valor do frete

    // 1. Calcular o total dos itens
    document.querySelectorAll(".cart-item").forEach((item) => {
        const precoEl = item.querySelector(".item-price");
        const qtdEl = item.querySelector(".itemQuantidade");
        const totalEl = item.querySelector(".valorTotal");

        if (!precoEl || !qtdEl || !totalEl) return;

        const preco = parseFloat(precoEl.textContent.replace("R$", "").replace(",", ".").trim());
        const quantidade = parseInt(qtdEl.value) || 1;
        const total = preco * quantidade;
        totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
        totalItens += total;
    });


    // 2. Calcular a SOMA BRUTA dos cupons selecionados
    document.querySelectorAll("#card-container-cupom .card-container:not(#card-template-cupom) select[name='cupons']").forEach(selectCupom => {
        const selectedOption = selectCupom.options[selectCupom.selectedIndex];

        if (selectedOption && selectedOption.dataset.desconto && selectedOption.value !== "") {
            const descontoUnitario = parseFloat(selectedOption.dataset.desconto) || 0;
            somaDescontosCupons += descontoUnitario; // Soma BRUTA
        }
    });


    // 3. Obter ou Re-obter o valor do Frete
    if (frete === null) {
        valorFrete =
            parseFloat(
                document
                    .getElementById("valorFreteResumoTotal")
                    .textContent.replace("R$", "")
                    .replace(",", ".")
            ) || 0;
    } else {
        valorFrete = frete;
    }

    // NOVO: Calcular o Subtotal da compra (Itens + Frete)
    const subtotalCompra = totalItens + valorFrete;

    // 4. Aplicar o limite: O desconto aplicado nunca pode ser maior que o subtotal da compra.
    const valorDescontoAplicado = Math.min(somaDescontosCupons, subtotalCompra);


    // 5. Calcular o Total Geral
    const totalGeral = subtotalCompra - valorDescontoAplicado;


    // 6. Armazenar a soma BRUTA dos cupons para o BE calcular a diferença!
    window.somaCuponsBruta = somaDescontosCupons;


    // 7. Atualizar a exibição
    document.getElementById("valorItensResumo").textContent = `R$ ${totalItens
        .toFixed(2)
        .replace(".", ",")}`;
    document.getElementById("valorFreteResumoTotal").textContent = `R$ ${valorFrete
        .toFixed(2)
        .replace(".", ",")}`;
    document.getElementById("valorCuponsResumo").textContent = `- R$ ${valorDescontoAplicado
        .toFixed(2)
        .replace(".", ",")}`;
    document.getElementById("valorTotalResumo").textContent = `R$ ${totalGeral
        .toFixed(2)
        .replace(".", ",")}`;
}