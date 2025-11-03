document.addEventListener("DOMContentLoaded", async () => {
    const clienteId = localStorage.getItem("clienteId");
    const secaoPedidos = document.querySelector(".secao-pedidos");

    if (!clienteId) {
        console.error(" ID do cliente não encontrado no localStorage!");
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

            const itensHTML = pedido.itens.map(item => {
                const botaoTrocaHTML = gerarBotaoTroca(pedido, item);

                return `
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
                                ${botaoTrocaHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `}).join("");

            const pedidoHTML = `
                <div class="pedido-container" data-pedido-id="${pedido.id}">
                    <div class="pedido-card">
                        <div class="pedido-info">
                            <p><strong>Pedido:</strong> ${pedido.id}</p>
                            <p><strong>Data:</strong> ${dataFormatada}</p>
                            <p><strong>Status:</strong> <span id="status-pedido-${pedido.id}">${pedido.status}</span></p>
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

        // Adicionar 'event listener' para os botões de troca
        secaoPedidos.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-troca-item')) {
                const botao = event.target;
                const pedidoId = botao.dataset.pedidoId;
                const itemId = botao.dataset.itemId;

                solicitarTroca(clienteId, pedidoId, itemId, botao);
            }
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

// Decide qual botão ou texto mostrar baseado no status
 * @param {object} pedido - O objeto PedidoDTO.
 * @param {object} item - O objeto ItemDTO.
 * @returns {string} - O HTML do botão ou label de troca.
 */
function gerarBotaoTroca(pedido, item) {
    const pedidoId = pedido.id;
    const itemId = item.id;

    // O backend (TrocaService) só aceita trocas de pedidos ENTREGUE
    switch (pedido.status) {
        case "ENTREGUE":
            return `<button class="btn-principal btn-troca btn-troca-item"
                            data-pedido-id="${pedidoId}"
                            data-item-id="${itemId}">Trocar</button>`;

        // Se o pedido já está em troca, mostra um aviso
        case "EM_TROCA":
        case "TROCA_AUTORIZADA":
        case "TROCADO":
            return `<label class="label-campo label-troca" style="color: #007bff;">Troca em análise</label>`;
        // Pedidos em trânsito, aprovados, etc., não podem ser trocados
        case "EM_PROCESSAMENTO":
        case "APROVADA":
        case "EM_TRANSITO":
        default:
            return `<button class="btn-principal btn-troca" disabled title="Aguarde a entrega para solicitar a troca">Trocar</button>`;
    }
}

async function solicitarTroca(clienteId, pedidoId, itemId, botaoElement) {
    // Pedir o motivo ao usuário
    const motivo = prompt("Por favor, descreva o motivo da troca:");

    if (!motivo || motivo.trim() === "") {
        alert("O motivo é obrigatório para solicitar a troca.");
        return;
    }

    // Desabilita o botão para evitar cliques duplos
    botaoElement.disabled = true;
    botaoElement.textContent = "Solicitando...";

    try {
        // Chamar a API de Troca (TrocaController)
        const url = `http://localhost:8080/trocas/cliente/${clienteId}/solicitar/pedido/${pedidoId}/item/${itemId}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ motivo: motivo })
        });

        // Tratar a Resposta
        if (!response.ok) {
            // Se o backend retornar um erro (ex: "pedido não entregue"), mostra aqui
            const erroMsg = await response.text();
            throw new Error(erroMsg || "Falha ao solicitar a troca.");
        }

        // Sucesso!
        const solicitacaoDTO = await response.json();
        console.log("Solicitação de troca criada:", solicitacaoDTO);

        alert("Solicitação de troca enviada com sucesso!");

        // Substitui o botão por um texto
        const labelTroca = document.createElement('label');
        labelTroca.className = "label-campo label-troca";
        labelTroca.style.color = "#007bff"; // Azul para feedback
        labelTroca.textContent = "Troca em análise";

        botaoElement.parentNode.replaceChild(labelTroca, botaoElement);

        // Atualiza o status geral do pedido na tela
        const statusPedidoEl = document.getElementById(`status-pedido-${pedidoId}`);
        if (statusPedidoEl) {
            // O backend muda o status do pedido para EM_TROCA
            statusPedidoEl.textContent = "EM_TROCA";
        }

    } catch (error) {
        console.error("Erro ao solicitar troca:", error);
        alert("Erro ao solicitar troca: " + error.message);

        // Reabilita o botão em caso de erro
        botaoElement.disabled = false;
        botaoElement.textContent = "Trocar";
    }
}