document.addEventListener("DOMContentLoaded", async () => {
    const clienteId = localStorage.getItem("clienteId");
    const secaoPedidos = document.querySelector(".secao-pedidos");

    if (!clienteId) {
        console.error("❌ ID do cliente não encontrado no localStorage!");
        secaoPedidos.insertAdjacentHTML("beforeend", "<p>Cliente não identificado.</p>");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/cliente/${clienteId}/pedidos`);
        if (!response.ok) throw new Error("Erro ao buscar pedidos");
        const pedidos = await response.json();

        if (pedidos.length === 0) {
            secaoPedidos.insertAdjacentHTML("beforeend", "<p>Você ainda não possui pedidos.</p>");
            return;
        }

        pedidos.forEach(pedido => {
            const dataFormatada = new Date(pedido.data).toLocaleDateString("pt-BR");
            const valorTotal = pedido.valorTotal.toFixed(2).replace(".", ",");

            // Monta os itens do pedido corretamente
            const itensHTML = pedido.itens.map(item => `
                <div class="cart-item">
                    <img src="${item.imagemProduto || 'https://via.placeholder.com/100'}" alt="${item.nomeProduto}">
                    <div class="item-info">
                        <p class="item-name">${item.nomeProduto}</p>
                        <p class="item-price">R$ ${item.precoProduto.toFixed(2).replace(".", ",")}</p>
                        <div class="item-actions">
                            <div class="itens-venda">
                                <div class="itens-total">
                                    <div class="itens-quantidade">
                                        <label>Qtd: </label>
                                        <input type="number" value="${item.quantidade}" min="1" disabled>
                                    </div>
                                    <label>Total: R$ ${(item.precoProduto * item.quantidade).toFixed(2).replace(".", ",")}</label>
                                </div>
                                <button class="btn-principal btn-troca"
                                    onclick="window.location.href='telaTroca.html'">Trocar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join("");

            // Monta o card completo do pedido
            const pedidoHTML = `
                <div class="pedido-container">
                    <div class="pedido-card">
                        <div class="pedido-info">
                            <p><strong>Pedido:</strong> ${pedido.id}</p>
                            <p><strong>Data:</strong> ${dataFormatada}</p>
                            <p><strong>Status:</strong> ${pedido.status}</p>
                            <p><strong>Total:</strong> R$ ${valorTotal}</p>
                            <button class="btn-principal btn-detalhes" onclick="toggleDetalhes(this)">Detalhes</button>
                        </div>

                        <div class="pedido-detalhes" style="display: none;">
                            <h4>Itens:</h4>
                            ${itensHTML}
                            <h4>Endereço de Entrega:</h4>
                            <p>${pedido.enderecoEntrega}</p>
                        </div>
                    </div>
                </div>
            `;

            secaoPedidos.insertAdjacentHTML("beforeend", pedidoHTML);
        });

    } catch (erro) {
        console.error("Erro ao carregar pedidos:", erro);
        secaoPedidos.insertAdjacentHTML("beforeend", "<p>Erro ao carregar pedidos.</p>");
    }
});

// Função para abrir/fechar os detalhes do pedido
function toggleDetalhes(botao) {
    const detalhes = botao.closest(".pedido-card").querySelector(".pedido-detalhes");
    detalhes.style.display = detalhes.style.display === "none" ? "block" : "none";
}
