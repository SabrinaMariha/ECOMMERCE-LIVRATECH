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
                        <p class="item-autor">Autor: ${item.autor || "Desconhecido"}</p>
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

// Adiciona item ao carrinho
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

// Remove item do carrinho e atualiza apenas a seção de itens
function removerItemDoCarrinho(itemId, button) {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) return;

    fetch(`http://localhost:8080/carrinho/${clienteId}/item/${itemId}`, {
        method: "DELETE"
    })
    .then(() => {
        // 🔹 Remove o item clicado visualmente
        const cartItem = button.closest(".cart-item");
        if (cartItem) cartItem.remove();

        // 🔹 Atualiza totais, se existir função
        if (typeof atualizarTotais === "function") {
            atualizarTotais();
        }

        // 🔹 Atualiza o carrinho lateral se ele estiver aberto
        const cartContainer = document.getElementById("cart-active-items");
        if (cartContainer) {
            // Busca todos os itens do carrinho no backend e atualiza apenas os visuais restantes
            carregarCarrinhoDoCliente(); // mantém a lista sincronizada
        }
    })
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

// Botão "Finalizar Compra"
document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "btnFinalizar") {
    console.log("Botão clicado!");

    // Limpa qualquer compra direta anterior
    localStorage.removeItem("compraDireta");

    // Redireciona para a página de finalização
    window.location.href = "finalizarCompra.html";
  }
});