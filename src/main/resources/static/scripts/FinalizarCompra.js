// ----------------- CLIENTE -----------------
const clienteId = localStorage.getItem("clienteId");
if (!clienteId) {
    console.error("Cliente não logado!");
}

// ----------------- CARREGA DADOS DO CLIENTE -----------------
async function carregarDadosCliente(clienteId) {
    try {
        const response = await fetch(`http://localhost:8080/cliente/${clienteId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do cliente");

        const dados = await response.json();
        const { enderecos, cartoes } = dados;

        // --- ENDEREÇOS ---
        const selectEnderecos = document.querySelector("select[name='enderecos']");
        selectEnderecos.innerHTML = "";

        enderecos.forEach(endereco => {
            const option = document.createElement("option");
            option.value = endereco.id;
            option.textContent = endereco.fraseIdentificadora || `Endereço ${endereco.id}`;
            option.dataset.estado = endereco.estado || ""; // armazenando estado no option
            selectEnderecos.appendChild(option);
        });

        // Seleciona o primeiro endereço e atualiza frete
        if (enderecos.length > 0) {
            const primeiro = selectEnderecos.options[0];
            selectEnderecos.value = primeiro.value;
            atualizarFrete(primeiro.dataset.estado);
        }

        // Evento para mudar endereço
        selectEnderecos.addEventListener("change", (e) => {
            const estado = e.target.selectedOptions[0].dataset.estado || "";
            const frete = calcularFretePorEstado(estado);
            atualizarTotais(frete);
        });


        // --- CARTÕES ---
        const selectCartoes = document.querySelector("select[name='cartoes']");
        selectCartoes.innerHTML = "";
        cartoes.forEach(cartao => {
            const option = document.createElement("option");
            option.value = cartao.id;
            const ultimosDigitos = cartao.numeroCartao.slice(-4);
            option.textContent = `${cartao.bandeira} **** ${ultimosDigitos}`;
            selectCartoes.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error);
    }
}

// ----------------- FRETE -----------------
function calcularFretePorEstado(estado) {
    let frete = 0;
    switch (estado) {
        case "SP":
        case "RJ":
        case "MG":
            frete = 25;
            break;
        case "RS":
        case "PR":
        case "SC":
            frete = 20;
            break;
        default:
            frete = 30;
    }
    return frete;
}

function atualizarFrete(estado) {
    const frete = calcularFretePorEstado(estado);
    document.getElementById("valorFreteResumo").textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorFreteResumoTotal").textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    atualizarTotais();
}

// ----------------- TOTAIS -----------------
function atualizarTotais(frete = null) {
    let totalItens = 0;

    document.querySelectorAll('.cart-item').forEach(item => {
        const precoEl = item.querySelector('.item-price');
        const qtdEl = item.querySelector('.itemQuantidade');
        const totalEl = item.querySelector('.valorTotal');

        if (!precoEl || !qtdEl || !totalEl) return;

        const preco = parseFloat(precoEl.textContent.replace('R$', '').replace(',', '.').trim());
        const quantidade = parseInt(qtdEl.value) || 1;
        const total = preco * quantidade;
        totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        totalItens += total;
    });

    // Se o frete não foi passado, pega do elemento
    if (frete === null) {
        frete = parseFloat(document.getElementById('valorFreteResumoTotal').textContent.replace('R$', '').replace(',', '.')) || 0;
    }

    const cupons = 15.00; // exemplo de cupom
    const totalGeral = totalItens + frete - cupons;

    document.getElementById("valorItensResumo").textContent = `R$ ${totalItens.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorFreteResumoTotal").textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorCuponsResumo").textContent = `- R$ ${cupons.toFixed(2).replace('.', ',')}`;
    document.getElementById("valorTotalResumo").textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}



// ----------------- CARREGAR ITENS -----------------
function carregarItensFinalizarCompra() {
    if (!clienteId) return;

    fetch(`http://localhost:8080/carrinho/${clienteId}`)
        .then(response => response.json())
        .then(carrinho => {
            const container = document.querySelector(".secao-itens");
            if (!container) return;
            container.querySelectorAll(".cart-item").forEach(item => item.remove());

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
                                    <input type="number" class="itemQuantidade" value="${item.quantidade}" min="1">
                                    <button class="trash-btn" onclick="removerItemDoCarrinho(${item.id}, this)">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                                <div class="itens-total">
                                    <label class="label-campo">Total: </label>
                                    <label class="label-campo valorTotal">R$ ${(item.precoProduto * item.quantidade).toFixed(2)}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                container.insertAdjacentHTML("beforeend", itemHTML);
            });

            atualizarTotais();
        })
        .catch(err => console.error("Erro ao carregar itens:", err));
}

// ----------------- ADICIONAR CARTÃO OU CUPOM -----------------
function addCard(tipo) {
    let container, template;
    if (tipo === 'cartao') {
        container = document.getElementById('card-container-cartoes');
        template = document.getElementById('card-template-cartao');
    } else if (tipo === 'cupom') {
        container = document.getElementById('card-container-cupom');
        template = document.getElementById('card-template-cupom');
    } else return;

    const clone = template.cloneNode(true);
    clone.style.display = 'block';
    clone.removeAttribute('id');
    clone.querySelector('.remove-btn').addEventListener('click', () => clone.remove());
    container.appendChild(clone);
}

// ----------------- FINALIZAR COMPRA -----------------
async function finalizarCompra(clienteId) {
    if (!clienteId) {
        alert("Cliente não logado!");
        return;
    }

    try {
        // Seleciona os itens já renderizados na página
        const itens = Array.from(document.querySelectorAll('.secao-itens .cart-item')).map(itemEl => {
            const produtoId = parseInt(itemEl.dataset.itemId);
            const quantidadeEl = itemEl.querySelector('.itemQuantidade');
            const quantidade = quantidadeEl ? parseInt(quantidadeEl.value) || 1 : 1;

            return { quantidade, produto: { id: produtoId } };
        });

        if (itens.length === 0) {
            alert("Não há itens para finalizar a compra!");
            return;
        }

        // Pega valor total da compra da página
        const totalGeralEl = document.getElementById("valorTotalResumo");
        const totalGeral = totalGeralEl
            ? parseFloat(totalGeralEl.textContent.replace('R$', '').replace(',', '.')) || 0
            : 0;

        // Monta transação com valor total
        const transacoes = [{ valor: totalGeral, status: "EM_PROCESSAMENTO" }];

        // Monta pedido
        const pedido = { itens, transacoes };

        // Envia requisição ao backend
        const response = await fetch(`http://localhost:8080/cliente/${clienteId}/finalizar-compra`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });


        const pedidoSalvo = await response.json();
        alert("Compra finalizada com sucesso! Pedido ID: " + pedidoSalvo.id);


// ------------------ Limpar carrinho ------------------
const carrinhoResponse = await fetch(`http://localhost:8080/carrinho/${clienteId}/limpar`, {
    method: "DELETE"
});

if (!carrinhoResponse.ok) {
    console.error("Erro ao limpar carrinho:", await carrinhoResponse.text());
} else {
    console.log("Carrinho limpo com sucesso!");
}

// Limpa os itens da página
document.querySelector(".secao-itens").innerHTML = '<h2 class="itens">Itens</h2>';
atualizarTotais();

    } catch (err) {
        console.error("Erro ao finalizar compra:", err);
        alert("Erro ao finalizar compra: " + err.message);
    }
}


// ----------------- DOM -----------------
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosCliente(clienteId);
    carregarItensFinalizarCompra();
    atualizarTotais();

    window.addCard = addCard;
    addCard('cupom');

    // Atualiza totais ao alterar quantidade
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('itemQuantidade')) atualizarTotais();
    });

    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === "btnFinalizar") {
            finalizarCompra(clienteId);
        }
    });


});
