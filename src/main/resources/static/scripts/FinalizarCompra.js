// ----------------- CLIENTE -----------------
const clienteId = localStorage.getItem("clienteId");
if (!clienteId) console.error("Cliente não logado!");
console.log("Cliente ID:", clienteId);

// ----------------- CUPOM -----------------
let descontoAtivo = 0; // percentual do cupom ativo (apenas 1)

// ----------------- CARREGA DADOS DO CLIENTE -----------------
async function carregarDadosCliente(clienteId) {
  if (!clienteId) return;

  try {
    const response = await fetch(`http://localhost:8080/clientes/${clienteId}`);
    if (!response.ok) throw new Error("Erro ao buscar dados do cliente");

    const dados = await response.json();
    console.log("Dados do cliente:", dados);

    const enderecos = dados.enderecos || [];
    const cartoes = dados.cartoesCredito || [];

    // --- ENDEREÇOS ---
    const selectEnderecos = document.querySelector("select[name='enderecos']");
    if (selectEnderecos) {
      selectEnderecos.innerHTML = "";
      enderecos.forEach((endereco) => {
        const option = document.createElement("option");
        option.value = endereco.id;
        option.textContent =
          endereco.fraseIdentificadora || `Endereço ${endereco.id}`;
        option.dataset.estado = endereco.estado || "";
        selectEnderecos.appendChild(option);
      });

      if (enderecos.length > 0) {
        const primeiro = selectEnderecos.options[0];
        selectEnderecos.value = primeiro.value;
        atualizarFrete(primeiro.dataset.estado);
      }

      selectEnderecos.addEventListener("change", (e) => {
        const estado = e.target.selectedOptions[0].dataset.estado || "";
        const frete = calcularFretePorEstado(estado);
        atualizarTotais(frete);
      });
    }

    // --- CARTÕES ---
    const selectCartoes = document.querySelector("select[name='cartoes']");
    if (selectCartoes) {
      selectCartoes.innerHTML = "";
      cartoes.forEach((cartao) => {
        const option = document.createElement("option");
        option.value = cartao.id;
        const ultimosDigitos = cartao.numeroCartao.slice(-4);
        option.textContent = `${cartao.bandeira} **** ${ultimosDigitos}`;
        selectCartoes.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar dados do cliente:", error);
  }
}

// ----------------- FRETE -----------------
function calcularFretePorEstado(estado) {
  switch (estado) {
    case "SP":
    case "RJ":
    case "MG":
      return 25;
    case "RS":
    case "PR":
    case "SC":
      return 20;
    default:
      return 30;
  }
}

function atualizarFrete(estado) {
  const frete = calcularFretePorEstado(estado);
  document.getElementById("valorFreteResumo").textContent = `R$ ${frete
    .toFixed(2)
    .replace(".", ",")}`;
  document.getElementById("valorFreteResumoTotal").textContent = `R$ ${frete
    .toFixed(2)
    .replace(".", ",")}`;
  atualizarTotais();
}

// ----------------- TOTAIS -----------------
function atualizarTotais(frete = null) {
  let totalItens = 0;

  document.querySelectorAll(".cart-item").forEach((item) => {
    const precoEl = item.querySelector(".item-price");
    const qtdEl = item.querySelector(".itemQuantidade");
    const totalEl = item.querySelector(".valorTotal");

    if (!precoEl || !qtdEl || !totalEl) return;

    const preco = parseFloat(
      precoEl.textContent.replace("R$", "").replace(",", ".").trim()
    );
    const quantidade = parseInt(qtdEl.value) || 1;
    const total = preco * quantidade;
    totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    totalItens += total;
  });

  if (frete === null) {
    frete =
      parseFloat(
        document
          .getElementById("valorFreteResumoTotal")
          .textContent.replace("R$", "")
          .replace(",", ".")
      ) || 0;
  }

  const valorDesconto = totalItens * (descontoAtivo / 100);
  const totalGeral = totalItens + frete - valorDesconto;

  document.getElementById("valorItensResumo").textContent = `R$ ${totalItens
    .toFixed(2)
    .replace(".", ",")}`;
  document.getElementById("valorFreteResumoTotal").textContent = `R$ ${frete
    .toFixed(2)
    .replace(".", ",")}`;
  document.getElementById(
    "valorCuponsResumo"
  ).textContent = `- R$ ${valorDesconto.toFixed(2).replace(".", ",")}`;
  document.getElementById("valorTotalResumo").textContent = `R$ ${totalGeral
    .toFixed(2)
    .replace(".", ",")}`;
}

// ----------------- CARREGAR ITENS -----------------
async function carregarItensFinalizarCompra() {
  const container = document.querySelector(".secao-itens");
  if (!container) return;

  // Limpa itens antigos
  container.querySelectorAll(".cart-item").forEach((item) => item.remove());

  // Checa se existe compra direta
  const compraDireta = JSON.parse(localStorage.getItem("compraDireta"));

  if (compraDireta) {
    // Busca os dados do produto no backend
    try {
      const response = await fetch(`http://localhost:8080/produtos/${compraDireta.produtoId}`);
      if (!response.ok) throw new Error("Produto não encontrado");
      const produto = await response.json();

      const itemHTML = `
        <div class="cart-item" data-produto-id="${produto.id}">
            <img src="${produto.imagemUrl}" alt="${produto.nome}">
            <div class="item-info">
                <p class="item-name">${produto.nome}</p>
                <p class="item-autor">Autor: ${produto.autor}</p>
                <p class="item-price">R$ ${produto.preco.toFixed(2)}</p>
                <div class="item-actions">
                    <div class="itens-venda">
                        <div class="item-quantidade">
                            <input type="number" class="itemQuantidade" value="${compraDireta.quantidade}" min="1">
                        </div>
                        <div class="itens-total">
                            <label class="label-campo">Total: </label>
                            <label class="label-campo valorTotal">R$ ${(produto.preco * compraDireta.quantidade).toFixed(2)}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", itemHTML);

      atualizarTotais();
    } catch (err) {
      console.error("Erro ao carregar produto da compra direta:", err);
    }
  } else {
    // Se não houver compra direta, carrega o carrinho normalmente
    if (!clienteId) return;
    try {
      const response = await fetch(`http://localhost:8080/carrinho/${clienteId}`);
      const carrinho = await response.json();
      carrinho.itens.forEach((item) => {
        const itemHTML = `
        <div class="cart-item" data-item-id="${item.id}" data-produto-id="${item.produtoId}">
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
    } catch (err) {
      console.error("Erro ao carregar itens do carrinho:", err);
    }
  }
}


// ----------------- ADICIONAR CUPOM -----------------
function addCard(tipo) {
  if (tipo !== "cupom") return;

  const container = document.getElementById("card-container-cupom");
  const template = document.getElementById("card-template-cupom");
  const clone = template.cloneNode(true);
  clone.style.display = "block";
  clone.removeAttribute("id");
  container.innerHTML = ""; // remove cupom anterior
  container.appendChild(clone);
  descontoAtivo = 0;

  clone.querySelector(".remove-btn").addEventListener("click", () => {
    descontoAtivo = 0;
    clone.remove();
    atualizarTotais();
  });

  const selectCupom = clone.querySelector("select[name='bandeira']");
  selectCupom.addEventListener("change", (e) => {
    const valor = parseFloat(e.target.value.replace("%", "")) || 0;
    descontoAtivo = valor;
    atualizarTotais();
  });
}

// ----------------- FINALIZAR COMPRA -----------------
async function finalizarCompra(clienteId) {
  if (!clienteId) {
    alert("Cliente não logado!");
    return;
  }

  try {
    // Pega itens do carrinho
    const itens = Array.from(document.querySelectorAll(".cart-item"))
      .filter(el => el.dataset.produtoId)
      .map(el => {
        const quantidade = parseInt(el.querySelector(".itemQuantidade")?.value) || 1;
        return { quantidade, produto: { id: parseInt(el.dataset.produtoId) } };
      });

    if (itens.length === 0) {
      alert("Não há itens para finalizar a compra!");
      return;
    }

    // Endereço e cartão
    const enderecoId = parseInt(document.querySelector("select[name='enderecos']")?.value) || null;
    const cartaoId = parseInt(document.querySelector("select[name='cartoes']")?.value) || null;

    // Calcula total geral
    const totalItens = itens.reduce((acc, item) => {
      const precoEl = document.querySelector(`.cart-item[data-produto-id='${item.produto.id}'] .item-price`);
      const preco = precoEl ? parseFloat(precoEl.textContent.replace("R$", "").replace(",", ".").trim()) : 0;
      return acc + preco * item.quantidade;
    }, 0);

    const frete = parseFloat(document.getElementById("valorFreteResumoTotal")?.textContent.replace("R$", "").replace(",", ".")) || 0;

    // Aplica cupom
    let desconto = 0;
    const selectCupom = document.querySelector("#card-container-cupom select");
    if (selectCupom && selectCupom.value && selectCupom.value !== "Escolha...") {
      const valorCupom = selectCupom.value;
      desconto = valorCupom.endsWith("%")
        ? (totalItens + frete) * (parseFloat(valorCupom.replace("%", "")) / 100)
        : parseFloat(valorCupom.replace("R$", "").replace(",", ".")) || 0;
    }

    const totalGeral = totalItens + frete - desconto;

    // Monta pedido
    const pedido = {
      itens,
      transacoes: [{ valor: totalGeral, status: "EM_PROCESSAMENTO" }],
      enderecoPedido: enderecoId ? { id: enderecoId } : null,
      cartaoPedido: cartaoId ? { id: cartaoId } : null
    };

    console.log("Pedido enviado (JSON):", JSON.stringify(pedido, null, 2));

    const response = await fetch(`http://localhost:8080/cliente/${clienteId}/finalizar-compra`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
      credentials: "include"
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro no backend: ${response.status} ${response.statusText}\n${text}`);
    }

    const pedidoSalvo = await response.json();

    alert(`Compra finalizada com sucesso! Pedido ID: ${pedidoSalvo.id}`);

    // Limpa carrinho e cupom
    await fetch(`http://localhost:8080/carrinho/${clienteId}/limpar`, { method: "DELETE" });
    document.querySelector(".secao-itens").innerHTML = '<h2 class="itens">Itens</h2>';
    document.getElementById("card-container-cupom").innerHTML = "";
    atualizarTotais();
    window.location.href = "index.html";

  } catch (err) {
    console.error("Erro ao finalizar compra:", err);
    alert("Erro ao finalizar compra: " + err.message);
  }
}

// ----------------- DOM -----------------
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosCliente(clienteId);
  carregarItensFinalizarCompra();
  atualizarTotais();

  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("itemQuantidade")) atualizarTotais();
  });

  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "btnFinalizarPedido") finalizarCompra(clienteId);
    if (e.target && e.target.dataset.tipoCard)
      addCard(e.target.dataset.tipoCard);
  });
});
