document.addEventListener('DOMContentLoaded', () => {

    const btnAdicionarCarrinho = document.querySelector('.btn-adicionar-carrinho');
    const cartItemsContainer = document.querySelector('.cart-items');

    btnAdicionarCarrinho.addEventListener('click', () => {
        const nomeProduto = document.querySelector('.nome-livro').textContent;
        const precoProduto = document.querySelector('.preco-atual').textContent;
        const imagemProduto = document.querySelector('.imagem-principal img').src;

        // Tenta encontrar um item existente no carrinho com o mesmo nome
        const itemExistente = document.querySelector(`.cart-item .item-name`);

        if (itemExistente && itemExistente.textContent === nomeProduto) {
            // Se o item já existe, encontre o input e aumente a quantidade
            const inputQuantidade = itemExistente.closest('.cart-item').querySelector('input[type="number"]');
            inputQuantidade.value = parseInt(inputQuantidade.value) + 1;
        } else {
            // Se o item não existe, crie e adicione um novo item ao carrinho
            const novoItemHTML = `
                <div class="cart-item">
                    <img src="${imagemProduto}" alt="${nomeProduto}">
                    <div class="item-info">
                        <p class="item-name">${nomeProduto}</p>
                        <p class="item-price">${precoProduto}</p>
                        <div class="item-actions">
                            <input type="number" value="1" min="1">
                            <button class="trash-btn" onclick="removeItem(this)">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', novoItemHTML);
        }

        // Abre o carrinho para o usuário ver a alteração
        openCart();
    });

});

// As funções openCart(), closeCart() e removeItem() continuam as mesmas.
function openCart() {
    document.getElementById("cartSidebar").classList.add("active");
}

function closeCart() {
    document.getElementById("cartSidebar").classList.remove("active");
}

function removeItem(button) {
    const item = button.closest(".cart-item");
    item.remove();
}