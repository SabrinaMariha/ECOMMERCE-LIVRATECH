document.addEventListener("DOMContentLoaded", async () => {
    // 1. Obter IDs da URL
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedidoId');
    const itemId = params.get('itemId');
    const clienteId = localStorage.getItem('clienteId');

    const container = document.getElementById("pedido-container-dinamico");

    if (!pedidoId || !itemId || !clienteId) {
        container.innerHTML = "<p style='color: red; text-align: center;'>Erro: Informações do pedido ou item não encontradas. Volte para a página de pedidos.</p>";
        return;
    }

    try {
        // 2. Buscar os dados do pedido específico
        // Usamos o endpoint que já lista todos os pedidos e filtramos
        const response = await fetch(`http://localhost:8080/cliente/${clienteId}/pedidos`);
        if (!response.ok) throw new Error("Erro ao buscar dados do pedido.");

        const pedidos = await response.json();

        // Encontra o pedido correto
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) throw new Error("Pedido não encontrado.");

        // Encontra o item específico dentro do pedido
        const item = pedido.itens.find(i => i.id == itemId);
        if (!item) throw new Error("Item não encontrado no pedido.");

        // 3. Renderizar o HTML dinâmico
        renderizarItemParaTroca(container, pedido, item);

    } catch (error) {
        console.error("Erro ao carregar dados da troca:", error);
        container.innerHTML = `<p style='color: red; text-align: center;'>${error.message}</p>`;
    }
});

/**
 * Renderiza o bloco do pedido e do item na tela.
 */
function renderizarItemParaTroca(container, pedido, item) {
    const dataFormatada = new Date(pedido.data).toLocaleDateString("pt-BR");
    const valorTotal = pedido.valorTotal.toFixed(2).replace(".", ",");

    // HTML apenas do item que será trocado
    const itemHTML = `
        <div class="cart-item">
            <img src="${item.imagemProduto || 'https://via.placeholder.com/100'}" alt="${item.nomeProduto}">
            <div class="item-info">
                <p class="item-name">${item.nomeProduto}</p>
                <p class="item-price">R$ ${item.precoProduto.toFixed(2).replace(".", ",")}</p>
                <div class="item-actions" id="actions-solicita-troca">
                    <div class="itens-venda">
                        <div class="opcoes-motivo-troca">
                            <p class="item-name">Escolha o motivo da troca:</p>
                            <label class="radio-option">
                                <input type="radio" name="motivo-troca" value="Produto errado">
                                Produto errado
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="motivo-troca" value="Produto com defeito">
                                Produto com defeito
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="motivo-troca" value="Arrependimento">
                                Arrependimento/Não gostei
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="motivo-troca" value="Outro">
                                Outro
                            </label>
                        </div>
                    </div>
                    <label class="label-campo label-troca" id="label-feedback-troca" style="display:none; color: #007bff;"></label>

                    <button class="btn-principal btn-troca" id="btn-confirmar-troca"
                            data-pedido-id="${pedido.id}"
                            data-item-id="${item.id}">Solicitar troca</button>
                </div>
            </div>
        </div>
    `;

    // Monta o card completo do pedido
    const pedidoHTML = `
        <div class="pedido-container" data-pedido-id="${pedido.id}">
            <div class="pedido-card">
                <div class="pedido-info">
                    <p><strong>Pedido:</strong> ${pedido.id}</p>
                    <p><strong>Data:</strong> ${dataFormatada}</p>
                    <p><strong>Status:</strong> ${pedido.status}</p>
                    <p><strong>Total:</strong> R$ ${valorTotal}</p>
                </div>
                <div class="pedido-detalhes" style="display: block;"> <h4>Item para troca:</h4>
                    ${itemHTML}
                    <h4>Endereço de Entrega (do pedido):</h4>
                    <p>${pedido.enderecoEntrega}</p>
                </div>
            </div>
        </div>
    `;

    // Limpa o "Carregando..." e insere o HTML final
    container.innerHTML = pedidoHTML;

    // 4. Adicionar 'event listener' ao novo botão
    const btnConfirmar = document.getElementById('btn-confirmar-troca');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            const clienteId = localStorage.getItem('clienteId');
            // Chama a função que envia para o backend
            enviarSolicitacaoTroca(clienteId, pedido.id, item.id, btnConfirmar);
        });
    }
}

/**
 * Pega o motivo selecionado e envia a solicitação para o backend.
 */
async function enviarSolicitacaoTroca(clienteId, pedidoId, itemId, botaoElement) {
    // 1. Pegar o motivo selecionado
    const motivoSelecionado = document.querySelector('input[name="motivo-troca"]:checked');

    if (!motivoSelecionado) {
        alert("Por favor, selecione um motivo para a troca.");
        return;
    }
    const motivo = motivoSelecionado.value;

    // Feedback visual
    botaoElement.disabled = true;
    botaoElement.textContent = "Solicitando...";

    try {
        // 2. Chamar a API de Troca (TrocaController)
        const url = `http://localhost:8080/trocas/cliente/${clienteId}/solicitar/pedido/${pedidoId}/item/${itemId}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ motivo: motivo }) // Envia o motivo no corpo
        });

        // 3. Tratar a Resposta
        if (!response.ok) {
            const erroMsg = await response.text();
            throw new Error(erroMsg || "Falha ao solicitar a troca.");
        }

        const solicitacaoDTO = await response.json();
        console.log("Solicitação de troca criada:", solicitacaoDTO);

        // 4. Atualizar a UI
        // Esconde o botão e mostra o label de feedback
        const labelFeedback = document.getElementById('label-feedback-troca');
        if (labelFeedback) {
            labelFeedback.textContent = "Troca em análise";
            labelFeedback.style.display = "block";
        }
        botaoElement.style.display = "none";

        // Desabilita os radio buttons
        document.querySelectorAll('input[name="motivo-troca"]').forEach(radio => {
            radio.disabled = true;
        });

        // Abre o modal de sucesso
        const modalSucesso = document.getElementById("success-modal");
        if(modalSucesso) modalSucesso.style.display = "flex";

        // Adiciona listener para fechar o modal e voltar para perfilCliente
        const fecharModalBtn = modalSucesso.querySelector(".close-btn");
        if (fecharModalBtn) {
            fecharModalBtn.onclick = () => { // Usamos onclick para garantir que é o único listener
                modalSucesso.style.display = "none";
                window.location.href = "perfilCliente.html";
            };
        }

        // Redireciona após 3 segundos
        setTimeout(() => {
            window.location.href = "perfilCliente.html";
        }, 3000);


    } catch (error) {
        console.error("Erro ao solicitar troca:", error);
        alert("Erro ao solicitar troca: " + error.message);

        // Reabilita o botão em caso de erro
        botaoElement.disabled = false;
        botaoElement.textContent = "Solicitar troca";
    }
}