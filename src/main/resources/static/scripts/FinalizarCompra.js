document.addEventListener('DOMContentLoaded', () => {

    // Carrega os itens do carrinho ao abrir a página
    if (typeof carregarItensFinalizarCompra === "function") {
        carregarItensFinalizarCompra();
    } else {
        console.error("Função carregarItensFinalizarCompra não encontrada!");
    }

    // Funções auxiliares da página

    function addCard(tipo) {
        let container, template;

        if (tipo === 'cartao') {
            container = document.getElementById('card-container-cartoes');
            template = document.getElementById('card-template-cartao');
        } else if (tipo === 'cupom') {
            container = document.getElementById('card-container-cupom');
            template = document.getElementById('card-template-cupom');
        } else {
            return;
        }

        const clone = template.cloneNode(true);
        clone.style.display = 'block';
        clone.removeAttribute('id');

        clone.querySelector('.remove-btn').addEventListener('click', () => {
            clone.remove();
        });

        container.appendChild(clone);
    }

    // Adiciona os cartões e cupons iniciais
    addCard('cartao');
    addCard('cupom');

    window.addCard = addCard;

    // Atualiza o total de cada item quando a quantidade muda
    function atualizarTotais() {
        document.querySelectorAll('.cart-item').forEach(item => {
            const precoTexto = item.querySelector('.item-price').textContent.replace('R$', '').replace(',', '.').trim();
            const preco = parseFloat(precoTexto);
            const quantidade = parseInt(item.querySelector('.itemQuantidade').value) || 1;
            const total = preco * quantidade;

            item.querySelector('.valorTotal').textContent = 
                `R$ ${total.toFixed(2).replace('.', ',')}`;
        });
    }

    // Escuta mudanças de quantidade
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('itemQuantidade')) {
            atualizarTotais();
        }
    });

    // Atualiza os totais ao carregar a página
    atualizarTotais();
});

// Carrega os itens do carrinho
function carregarItensFinalizarCompra() {
  const clienteId = localStorage.getItem("clienteId");
  const compraDireta = JSON.parse(localStorage.getItem("compraDireta"));
  const container = document.querySelector(".secao-itens");
  if (!container) return;

  // Limpa os itens anteriores (mantendo o título <h2>)
  container.querySelectorAll(".cart-item").forEach(item => item.remove());

  // PRIORIDADE 1 → COMPRA DIRETA
  if (compraDireta && compraDireta.produtoId) {
    // Limpa carrinho antigo (se houver)
    localStorage.removeItem("itensCarrinhoTemp");

    fetch(`http://localhost:8080/produtos/${compraDireta.produtoId}`)
      .then(response => response.json())
      .then(produto => {
        const itemHTML = `
          <div class="cart-item" data-item-id="${produto.id}">
            <img src="${produto.imagemUrl}" alt="${produto.nome}">
            <div class="item-info">
              <p class="item-name">${produto.nome}</p>
              <p class="item-autor">Autor: ${produto.autor || "Desconhecido"}</p>
              <p class="item-price">R$ ${produto.preco.toFixed(2)}</p>
              <div class="item-actions">
                <div class="itens-venda">
                  <div class="item-quantidade">
                    <input type="number" class="itemQuantidade" 
                      value="${compraDireta.quantidade}" min="1">
                  </div>
                  <div class="itens-total">
                    <label class="label-campo">Total:</label>
                    <label class="label-campo valorTotal">
                      R$ ${(produto.preco * compraDireta.quantidade).toFixed(2)}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>`;

        container.insertAdjacentHTML("beforeend", itemHTML);

        // limpa a compra direta do localStorage após carregar
        localStorage.removeItem("compraDireta");
      })
      .catch(err => console.error("Erro ao carregar produto:", err));

    return; // impede de continuar e puxar o carrinho
  }

  // PRIORIDADE 2 → ITENS DO CARRINHO
  if (!clienteId) return;

  // limpa qualquer compra direta antiga
  localStorage.removeItem("compraDireta");

  fetch(`http://localhost:8080/carrinho/${clienteId}`)
    .then(response => response.json())
    .then(carrinho => {
      carrinho.itens.forEach(item => {
        const itemHTML = `
          <div class="cart-item" data-item-id="${item.id}">
            <img src="${item.imagemProduto}" alt="${item.nomeProduto}">
            <div class="item-info">
              <p class="item-name">${item.nomeProduto}</p>
              <p class="item-autor">Autor: ${item.autor || "Desconhecido"}</p>
              <p class="item-descricao">${item.descricaoProduto || ""}</p>
              <p class="item-price">R$ ${item.precoProduto.toFixed(2)}</p>
              <div class="item-actions">
                <div class="itens-venda">
                  <div class="item-quantidade">
                    <input type="number" class="itemQuantidade"
                      value="${item.quantidade}" min="1"
                      onchange="atualizarQuantidade(${item.id}, this.value)">
                    <button class="trash-btn" onclick="removerItemDoCarrinho(${item.id}, this)">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  <div class="itens-total">
                    <label class="label-campo">Total:</label>
                    <label class="label-campo valorTotal">
                      R$ ${(item.precoProduto * item.quantidade).toFixed(2)}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        container.insertAdjacentHTML("beforeend", itemHTML);
      });
    })
    .catch(err => console.error("Erro ao carregar itens do carrinho:", err));
}

