function carregarCarrinhoDoCliente(clienteId) {
    fetch(`http://localhost:8080/carrinho/${clienteId}`)
        .then(response => response.json())
        .then(carrinho => {
            const cartContainer = document.getElementById("cart-active-items");
            cartContainer.innerHTML = ""; // limpa itens antigos

            carrinho.itens.forEach(item => {
                const itemHTML = `
                <div class="cart-item">
                    <img src="${item.imagemProduto}" alt="${item.nomeProduto}">
                    <div class="item-info">
                        <p class="item-name">${item.nomeProduto}</p>
                        <p class="item-price">R$ ${item.precoProduto.toFixed(2)}</p>
                        <div class="item-actions">
                            <input type="number" value="${item.quantidade}" min="1" onchange="atualizarQuantidade(${clienteId}, ${item.id}, this.value)">
                            <button class="trash-btn" onclick="removerItemDoCarrinho(${clienteId}, ${item.id}, this)">
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

function adicionarItemAoCarrinho(clienteId, produtoId, quantidade) {
    fetch(`http://localhost:8080/carrinho/${clienteId}/adicionar?produtoId=${produtoId}&quantidade=${quantidade}`, {
        method: "POST"
    })
    .then(response => response.json())
    .then(carrinho => carregarCarrinhoDoCliente(clienteId))
    .catch(err => console.error("Erro ao adicionar item ao carrinho:", err));
}

function removerItemDoCarrinho(clienteId, itemId, button) {
    fetch(`http://localhost:8080/carrinho/${clienteId}/item/${itemId}`, {
        method: "DELETE"
    })
    .then(() => carregarCarrinhoDoCliente(clienteId))
    .catch(err => console.error("Erro ao remover item do carrinho:", err));
}

function atualizarQuantidade(clienteId, itemId, quantidade) {
    fetch(`http://localhost:8080/carrinho/${clienteId}/item/${itemId}?quantidade=${quantidade}`, {
        method: "PUT"
    })
    .then(() => carregarCarrinhoDoCliente(clienteId))
    .catch(err => console.error("Erro ao atualizar quantidade:", err));
}
