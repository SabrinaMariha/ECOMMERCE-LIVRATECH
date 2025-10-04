// Carrega o carrinho do cliente
function carregarCarrinhoDoCliente() {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) return;

    fetch(`http://localhost:8080/carrinho/${clienteId}`)
        .then(response => response.json())
        .then(carrinho => {
            const cartContainer = document.getElementById("cart-active-items");
            if (!cartContainer) return;

            cartContainer.innerHTML = ""; // limpa itens antigos

            carrinho.itens.forEach(item => {
                const itemHTML = `
                <div class="cart-item">
                    <img src="${item.imagemProduto}" alt="${item.nomeProduto}">
                    <div class="item-info">
                        <p class="item-name">${item.nomeProduto}</p>
                        <p class="item-price">R$ ${item.precoProduto.toFixed(2)}</p>
                        <div class="item-actions">
                            <input type="number" value="${item.quantidade}" min="1" onchange="atualizarQuantidade(${item.id}, this.value)">
                            <button class="trash-btn" onclick="removerItemDoCarrinho(${item.id}, this)">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
                cartContainer.insertAdjacentHTML("beforeend", itemHTML);
            });
        })
        .catch(err => console.error("Erro ao carregar carrinho:", err));
}

// Adiciona item ao carrinho (somente se cliente estiver logado)
function adicionarItemAoCarrinho(produtoId, quantidade = 1) {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) {
        alert("Faça login para adicionar itens ao carrinho!");
        return;
    }

    fetch(`http://localhost:8080/carrinho/${clienteId}/adicionar?produtoId=${produtoId}&quantidade=${quantidade}`, {
        method: "POST"
    })
    .then(response => response.json())
    .then(() => carregarCarrinhoDoCliente())
    .catch(err => console.error("Erro ao adicionar item ao carrinho:", err));
}

// Remove item do carrinho
function removerItemDoCarrinho(itemId, button) {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) return;

    fetch(`http://localhost:8080/carrinho/${clienteId}/item/${itemId}`, {
        method: "DELETE"
    })
    .then(() => carregarCarrinhoDoCliente())
    .catch(err => console.error("Erro ao remover item do carrinho:", err));
}

// Atualiza quantidade de um item no carrinho
function atualizarQuantidade(itemId, quantidade) {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) return;

    fetch(`http://localhost:8080/carrinho/${clienteId}/item/${itemId}?quantidade=${quantidade}`, {
        method: "PUT"
    })
    .then(() => carregarCarrinhoDoCliente())
    .catch(err => console.error("Erro ao atualizar quantidade:", err));
}
