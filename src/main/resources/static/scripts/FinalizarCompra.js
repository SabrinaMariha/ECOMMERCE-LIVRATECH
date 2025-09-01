document.addEventListener('DOMContentLoaded', () => {

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

    
     addCard('cartao');
     addCard('cupom');

    window.addCard = addCard;
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

    // Atualiza quando o usuário mudar a quantidade
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('itemQuantidade')) {
            atualizarTotais();
        }
    });

    // Atualiza no carregamento inicial
    atualizarTotais();
});
