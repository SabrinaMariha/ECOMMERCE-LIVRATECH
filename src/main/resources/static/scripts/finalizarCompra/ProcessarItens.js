export async function carregarItensFinalizarCompra(clienteId, atualizarTotaisCallback) {
  const container = document.querySelector(".secao-itens");
  if (!container) return;

  container.querySelectorAll(".cart-item").forEach((item) => item.remove());

  const compraDireta = JSON.parse(localStorage.getItem("compraDireta"));

  if (compraDireta) {
    try {
      const response = await fetch(
        `http://localhost:8080/produtos/${compraDireta.produtoId}`
      );
      if (!response.ok) throw new Error("Produto não encontrado");
      const produto = await response.json();

      const itemHTML = `
        <div class="cart-item" data-produto-id="${produto.id}">
            <img src="${produto.imagemUrl}" alt="${produto.nome}">
            <div class="item-info">
                <p class="item-name">${produto.nome}</p>
                <p class="item-autor">Autor: ${produto.autor}</p>
                <p class="item-price">R$ ${produto.preco.toFixed(2)}</p>
                <div class="item-actions">
                    <div class="itens-venda">
                        <div class="item-quantidade">
                            <input type="number" class="itemQuantidade" value="${compraDireta.quantidade}" min="1">
                        </div>
                        <div class="itens-total">
                            <label class="label-campo">Total: </label>
                            <label class="label-campo valorTotal">R$ ${(produto.preco * compraDireta.quantidade).toFixed(2)}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", itemHTML);
      atualizarTotaisCallback();
    } catch (err) {
      console.error("Erro ao carregar produto da compra direta:", err);
    }
  }
}
