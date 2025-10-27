// Arquivo: processaritens.js

export async function carregarItensFinalizarCompra(clienteId, atualizarTotaisCallback) {
  const container = document.querySelector(".secao-itens");
  if (!container || !clienteId) return;

  // Limpa os itens antigos, mantendo apenas o título se necessário
  container.innerHTML = '<h2 class="itens">Itens</h2>';
  container.insertAdjacentHTML("beforeend", '<p style="text-align: center;">Carregando itens...</p>');

  const compraDireta = JSON.parse(localStorage.getItem("compraDireta"));

  try {
    let itensParaExibir = [];

    // 1. Lógica para COMPRA DIRETA (já existia)
    if (compraDireta && compraDireta.produtoId) {
      const response = await fetch(
        `http://localhost:8080/produtos/${compraDireta.produtoId}`
      );
      if (!response.ok) throw new Error("Produto da compra direta não encontrado");
      const produto = await response.json();

      itensParaExibir.push({
        produtoId: produto.id,
        nomeProduto: produto.nome,
        autor: produto.autor,
        imagemProduto: produto.imagemUrl,
        precoProduto: produto.preco,
        quantidade: compraDireta.quantidade
      });

    } else {
      // 2. Lógica para CARRINHO (NOVA LÓGICA ESSENCIAL)
      const response = await fetch(`http://localhost:8080/carrinho/${clienteId}`);
      if (!response.ok) throw new Error("Erro ao buscar itens do carrinho.");
      const carrinho = await response.json();
      
      // Mapeia os itens do carrinho para o formato de exibição
      itensParaExibir = carrinho.itens.map(item => ({
          produtoId: item.produtoId,
          nomeProduto: item.nomeProduto,
          autor: item.autor,
          imagemProduto: item.imagemProduto,
          precoProduto: item.precoProduto,
          quantidade: item.quantidade
      }));
    }

    // 3. RENDERIZAÇÃO DOS ITENS
    container.innerHTML = '<h2 class="itens">Itens</h2>'; // Limpa o "Carregando"

    if (itensParaExibir.length === 0) {
        container.insertAdjacentHTML("beforeend", '<p style="text-align: center;">Não há itens para finalizar a compra.</p>');
    } else {
        itensParaExibir.forEach(item => {
            const precoUnitario = item.precoProduto || 0;
            const subtotal = precoUnitario * item.quantidade;
            
            const itemHTML = `
                <div class="cart-item" data-produto-id="${item.produtoId}">
                    <img src="${item.imagemProduto}" alt="${item.nomeProduto}">
                    <div class="item-info">
                        <p class="item-name">${item.nomeProduto}</p>
                        <p class="item-autor">Autor: ${item.autor || 'Desconhecido'}</p>
                        <p class="item-price" style="display:none;">R$ ${precoUnitario.toFixed(2)}</p>
                        <div class="item-actions">
                            <div class="itens-venda">
                                <div class="item-quantidade">
                                    <label>Qtd:</label>
                                    <input type="number" 
                                           class="itemQuantidade" 
                                           value="${item.quantidade}" 
                                           min="1" 
                                           style="width: 50px;" 
                                           data-produto-id-item="${item.produtoId}"> 
                                </div>
                                <div class="itens-total">
                                    <label class="label-campo">Total: </label>
                                    <label class="label-campo valorTotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", itemHTML);
        });
    }

    // Chama o callback para recalcular os valores no resumo
    if (atualizarTotaisCallback) atualizarTotaisCallback();
    
  } catch (err) {
    console.error("Erro ao carregar itens para finalizar compra:", err);
    container.innerHTML = '<h2 class="itens">Itens</h2><p style="color: red; text-align: center;">Erro ao carregar itens.</p>';
  }
}