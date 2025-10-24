export function atualizarTotais(frete = null, descontoAtivo = 0) {
  let totalItens = 0;

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

  if (frete === null) {
      // ⚠️ RE-APLICANDO A CONVERSÃO DE VÍRGULA PARA PONTO PARA GARANTIR O FLOAT
      frete =
        parseFloat(
          document
            .getElementById("valorFreteResumoTotal")
            .textContent.replace("R$", "")
            .replace(",", ".") // MANTENHA ISSO!
        ) || 0;
    }

  const valorDesconto = totalItens * (descontoAtivo / 100);
  const totalGeral = totalItens + frete - valorDesconto;

  document.getElementById("valorItensResumo").textContent = `R$ ${totalItens
    .toFixed(2)
    .replace(".", ",")}`;
  document.getElementById("valorFreteResumoTotal").textContent = `R$ ${frete
    .toFixed(2)
    .replace(".", ",")}`;
  document.getElementById("valorCuponsResumo").textContent = `- R$ ${valorDesconto
    .toFixed(2)
    .replace(".", ",")}`;
  document.getElementById("valorTotalResumo").textContent = `R$ ${totalGeral
    .toFixed(2)
    .replace(".", ",")}`;
}
