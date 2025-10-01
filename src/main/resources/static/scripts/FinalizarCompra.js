const clienteId = 42; // ID do cliente logado (substituir dinamicamente depois)

async function carregarDadosCliente(clienteId) {
    try {

        const response = await fetch(`http://localhost:8080/cliente/${clienteId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do cliente");

        const enderecos = await response.json();
        const selectEnderecos = document.querySelector("select[name='enderecos']");
        selectEnderecos.innerHTML = "";

        enderecos.forEach(endereco => {
            const option = document.createElement("option");
            option.value = endereco.id;
            option.textContent = endereco.fraseIdentificadora;
            selectEnderecos.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error);
    }
}

async function salvarNovoEndereco(clienteId) {
    const form = document.getElementById("formulario-endereco-novo-entrega");
    const checkbox = form.querySelector("input[name='salvar-endereco-entrega']");

    if (!checkbox.checked) return null;

    const endereco = {
        tipoResidencia: form.tipoResidencia.value,
        cep: form.cep.value,
        tipoLogradouro: form.tipoLogradouro.value,
        logradouro: form.logradouro.value,
        numero: form.numero.value,
        bairro: form.bairro.value,
        cidade: form.cidade.value,
        estado: form.estado.value,
        pais: form.pais.value,
        observacoes: form.observacoes.value,
        tipoEndereco : "ENTREGA",
    };

    try {
        const response = await fetch(`http://localhost:8080/cliente/${clienteId}/endereco`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(endereco)
        });

        if (!response.ok) throw new Error("Erro ao salvar endereço");

        const data = await response.json();
        console.log("Endereço salvo com sucesso:", data);

        const selectEnderecos = document.querySelector("select[name='enderecos']");
        const option = document.createElement("option");
        option.value = data.id;
        option.textContent = data.fraseIdentificadora || `${data.tipoLogradouro} ${data.logradouro}, ${data.numero}`;
        option.selected = true;
        selectEnderecos.appendChild(option);

        form.reset(); // limpa os campos
        return data;
    } catch (error) {
        console.error("Erro:", error);
    }
}

async function finalizarCompra(clienteId) {
    console.log("Finalizando compra para cliente:", clienteId);
    // aqui depois você envia a venda/pedido para o backend
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosCliente(clienteId);    function addCard(tipo) {
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
document.getElementById("btnFinalizar").addEventListener("click", async () => {

    // tenta salvar novo endereço, se checkbox marcada
    await salvarNovoEndereco(clienteId);

    // depois segue com o fluxo da compra normalmente (ex: enviar pedido)
    finalizarCompra(clienteId);
});