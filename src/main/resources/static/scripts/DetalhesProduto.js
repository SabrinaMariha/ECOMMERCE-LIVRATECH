document.addEventListener('DOMContentLoaded', async () => {
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if(id){
        await carregarProduto(id);7
        configurarCarrinho(id);
    }
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

// Carrega produto pelo id
async function carregarProduto(id){
    try{
        const response = await fetch(`http://localhost:8080/produtos/${id}`);
        if (!response.ok) throw new Error("Produto não encontrado");
        const produto = await response.json();

        // Atualizar os campos do HTML com os dados do produto
        document.querySelector('.nome-livro').textContent = produto.nome;
        document.querySelector('.autor').textContent = `por ${produto.autor}`;
        document.querySelector('.descricao').textContent = produto.descricao;
        document.querySelector('.preco-atual').textContent = `R$ ${produto.preco.toFixed(2)}`;
        document.querySelector('.imagem-principal img').src = produto.imagemUrl;
        document.querySelector('.descricao-detalhada p').textContent = produto.descDetalhada;
    }catch(error){
        console.error("Erro ao carregar produto:", error);
        document.getElementById('produto').innerHTML = "<p>Produto não encontrad0</p>";
    }
}

// Configura botão do carrinho para chamar função centralizada
function configurarCarrinho(produtoId) {
    const btnAdicionarCarrinho = document.querySelector('.btn-adicionar-carrinho');
    if (!btnAdicionarCarrinho || !produtoId) return;

    btnAdicionarCarrinho.addEventListener('click', () => {
        adicionarItemAoCarrinho(parseInt(produtoId), 1);
        openCart();
    });
}

