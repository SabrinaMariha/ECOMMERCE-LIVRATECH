const clienteId = 42; // ID do cliente logado (substituir dinamicamente depois)

async function carregarDadosCliente(clienteId) {
    try {

        const response = await fetch(`http://localhost:8080/cliente/${clienteId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do cliente");

        const dados = await response.json();
        const enderecos = dados.enderecos;
        const cartoes = dados.cartoes;
        // ---------- ENDEREÇOS ----------

        const selectEnderecos = document.querySelector("select[name='enderecos']");
        selectEnderecos.innerHTML = "";

        enderecos.forEach(endereco => {
            const option = document.createElement("option");
            option.value = endereco.id;
            option.textContent = endereco.fraseIdentificadora;
            selectEnderecos.appendChild(option);
        });

        // ---------- CARTÕES ----------
                const selectCartoes = document.querySelector("select[name='cartoes']");
                selectCartoes.innerHTML = "";
                    console.log(cartoes);
                cartoes.forEach(cartao => {
                    const option = document.createElement("option");
                    option.value = cartao.id;
                    // Exibir só os 4 últimos dígitos do número do cartão
                    const ultimosDigitos = cartao.numeroCartao.slice(-4);
                    option.textContent = `${cartao.bandeira} **** ${ultimosDigitos}`;
                    selectCartoes.appendChild(option);
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
        tipoResidencia: form.querySelector("select[name='tipoResidencia']").value,
        cep: form.querySelector("input[name='cep']").value,
        tipoLogradouro: form.querySelector("select[name='tipoLogradouro']").value,
        logradouro: form.querySelector("input[name='logradouro']").value,
        numero: form.querySelector("input[name='numero']").value,
        bairro: form.querySelector("input[name='bairro']").value,
        cidade: form.querySelector("input[name='cidade']").value,
        estado: form.querySelector("input[name='estado']").value,
        pais: form.querySelector("input[name='pais']").value,
        observacoes: form.querySelector("textarea[name='observacoes']").value,
        tipoEndereco: "ENTREGA"
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


async function salvarTodosCartoes(clienteId) {
    const container = document.getElementById('card-container-cartoes');
    const cards = container.querySelectorAll('.card-container');
    const cartoesSalvos = [];

    for (const card of cards) {
        if (card.id === 'card-template-cartao') continue;

        const checkbox = card.querySelector("input[name='salvar-cartao']");
        if (!checkbox.checked) continue;

        const numeroCartao = card.querySelector("input[name='numero-cartao']").value.trim();
        const nomeImpresso = card.querySelector("input[name='nome-titular']").value.trim();
        const codigoSeguranca = card.querySelector("input[name='cvv']").value.trim();
        const bandeira = card.querySelector("select[name='bandeira']").value.trim().toUpperCase();

        if (!numeroCartao || !nomeImpresso || !codigoSeguranca || !bandeira) continue;

        const cartao = { numeroCartao, nomeImpresso, codigoSeguranca, bandeira, preferencial: true };

        try {
            const response = await fetch(`http://localhost:8080/cliente/${clienteId}/cartao`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cartao)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erro ao salvar cartão");
            }

            const data = await response.json();
            console.log("Cartão salvo com sucesso:", data);
            cartoesSalvos.push(data);

            // desmarca o checkbox apenas depois de salvar
            checkbox.checked = false;
        } catch (error) {
            console.error("Erro ao salvar cartão:", error);
        }
    }


    return cartoesSalvos;
}


async function finalizarCompra(clienteId) {
    console.log("Finalizando compra para cliente:", clienteId);
    // aqui depois você envia a venda/pedido para o backend
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosCliente(clienteId);    function addCard(tipo) {

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


     addCard('cupom');

    window.addCard = addCard;
async function atualizarTotais() {
    let totalItens = 0;

    document.querySelectorAll('.cart-item').forEach(item => {
        const precoEl = item.querySelector('.item-price');
        const qtdEl = item.querySelector('.itemQuantidade');
        const totalEl = item.querySelector('.valorTotal');

        if (!precoEl || !qtdEl || !totalEl) return;

        const precoTexto = precoEl.textContent.replace('R$', '').replace(',', '.').trim();
        const preco = parseFloat(precoTexto);
        const quantidade = parseInt(qtdEl.value) || 1;
        const total = preco * quantidade;
        totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        totalItens += total;
    });

    // Atualiza o total de cada item quando a quantidade muda
    function atualizarTotais() {
        document.querySelectorAll('.cart-item').forEach(item => {
            const precoTexto = item.querySelector('.item-price').textContent.replace('R$', '').replace(',', '.').trim();
            const preco = parseFloat(precoTexto);
            const quantidade = parseInt(item.querySelector('.itemQuantidade').value) || 1;
            const total = preco * quantidade;

    const freteTexto = document.getElementById('valorFreteResumo').textContent
        .replace('R$', '').replace(',', '.').trim();
    const frete = parseFloat(freteTexto) || 0;

    const cupons = 15.00; // futuramente pode vir da API
    const totalGeral = totalItens + frete - cupons;

    // Atualiza no console
    console.log("Total do pedido + frete:", totalGeral.toFixed(2));

    // Atualiza no HTML
    document.getElementById("valorItens").textContent = `R$ ${totalItens.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorFreteResumo").textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorCupons").textContent = `- R$ ${cupons.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorTotal").textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

    // Escuta mudanças de quantidade
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('itemQuantidade')) {
            atualizarTotais();
        }
    });

    // Atualiza os totais ao carregar a página
    atualizarTotais();

    document.getElementById("btnFinalizar").addEventListener("click", async () => {
        const enderecoSalvo = await salvarNovoEndereco(clienteId);
        const cartoesSalvos = await salvarTodosCartoes(clienteId);

        if (cartoesSalvos.length > 0) {
            console.log("Cartões salvos:", JSON.stringify(cartoesSalvos));
        } else {
            console.log("Nenhum cartão novo foi salvo.");
        }

        finalizarCompra(clienteId);
    });

});



// Carrega os itens do carrinho
function carregarItensFinalizarCompra() {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) return;

    fetch(`http://localhost:8080/carrinho/${clienteId}`)
        .then(response => response.json())
        .then(carrinho => {
            const container = document.querySelector(".secao-itens");
            if (!container) return;

            // Remove apenas os elementos de itens (mantém o <h2>)
            const itensExistentes = container.querySelectorAll(".cart-item");
            itensExistentes.forEach(item => item.remove());

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
                                    <label class="label-campo">Total: </label>
                                    <label class="label-campo valorTotal">
                                        R$ ${(item.precoProduto * item.quantidade).toFixed(2)}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                container.insertAdjacentHTML("beforeend", itemHTML);
            });
        })
        .catch(err => console.error("Erro ao carregar itens para finalizar compra:", err));
}

