import { calcularFretePorEstado, atualizarFrete } from "./CalcularFrete.js";
import { atualizarTotais } from "./CalcularTotais.js";
import { addCard } from "./ProcessarCupons.js";
import { carregarItensFinalizarCompra } from "./ProcessarItens.js";

// ----------------- CLIENTE -----------------
const clienteId = localStorage.getItem("clienteId");
if (!clienteId) console.error("Cliente não logado!");
console.log("Cliente ID:", clienteId);

// ----------------- CARREGA DADOS DO CLIENTE -----------------
async function carregarDadosCliente(clienteId) {
  if (!clienteId) return;

  try {
    const response = await fetch(`http://localhost:8080/clientes/${clienteId}`);
    if (!response.ok) throw new Error("Erro ao buscar dados do cliente");

    const dados = await response.json();
    window.dadosCliente = dados; // salva globalmente
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
        atualizarFrete(estado);
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

      // Preenche formulário ao selecionar um cartão
      selectCartoes.addEventListener("change", (e) => {
        const cartaoId = parseInt(e.target.value);
        const cartaoSelecionado = window.dadosCliente.cartoesCredito.find(
          (c) => c.id === cartaoId
        );
        preencherFormularioCartao(cartaoSelecionado);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar dados do cliente:", error);
  }
}

// ----------------- FUNÇÕES AUXILIARES -----------------
function preencherFormularioCartao(cartao) {
  const form = document.querySelector("#card-template-cartao");
  if (!form) return;

  if (!cartao) {
    limparFormularioCartao();
    return;
  }

  form.querySelector("input[name='numero-cartao']").value = cartao.numeroCartao;
  form.querySelector("input[name='nome-titular']").value = cartao.nomeImpresso;
  form.querySelector("select[name='bandeira']").value = cartao.bandeira;
  form.querySelector("input[name='cvv']").value = "";
  form.querySelector("input[name='validade']").value = "";
  form.querySelector("input[name='valor']").value = "";
  form.querySelector("input[name='salvar-cartao']").checked = false;
}

function limparFormularioCartao() {
  const form = document.querySelector("#card-template-cartao");
  if (!form) return;

  form.querySelector("input[name='numero-cartao']").value = "";
  form.querySelector("input[name='nome-titular']").value = "";
  form.querySelector("select[name='bandeira']").value = "Escolha...";
  form.querySelector("input[name='cvv']").value = "";
  form.querySelector("input[name='validade']").value = "";
  form.querySelector("input[name='valor']").value = "";
  form.querySelector("input[name='salvar-cartao']").checked = false;
}


// ----------------- FINALIZAR COMPRA -----------------
async function finalizarCompra(clienteId) {
  if (!clienteId) {
    alert("Cliente não logado!");
    return;
  }

  try {
    const itens = Array.from(document.querySelectorAll(".cart-item"))
      .filter((el) => el.dataset.produtoId)
      .map((el) => {
        return {
          produtoId: parseInt(el.dataset.produtoId),
          quantidade: parseInt(el.querySelector(".itemQuantidade")?.value) || 1,
        };
      });

    if (itens.length === 0) {
      alert("Não há itens para finalizar a compra!");
      return;
    }

    // ----------- ENDEREÇO -----------
    let enderecoId =
      parseInt(document.querySelector("select[name='enderecos']")?.value) || null;
    const salvarEndereco =
      document.querySelector("input[name='salvar-endereco-entrega']")?.checked ||
      false;

    const novoEndereco = enderecoId
      ? null
      : {
          tipoResidencia:
            document.querySelector("select[name='tipoResidencia']")?.value,
          tipoLogradouro:
            document.querySelector("select[name='tipoLogradouro']")?.value,
          tipoEndereco: "ENTREGA",
          logradouro: document.querySelector("input[name='logradouro']")?.value,
          numero: document.querySelector("input[name='numero']")?.value,
          bairro: document.querySelector("input[name='bairro']")?.value,
          cep: document.querySelector("input[name='cep']")?.value,
          cidade: document.querySelector("input[name='cidade']")?.value,
          estado: document.querySelector("input[name='estado']")?.value,
          pais: document.querySelector("input[name='pais']")?.value,
          observacoes:
            document.querySelector("textarea[name='observacoes']")?.value,
        };

    // ----------- TRANSACÇÕES -----------
    const frete =
      parseFloat(
        document
          .getElementById("valorFreteResumoTotal")
          ?.textContent.replace("R$", "")
          .replace(",", ".")
      ) || 0;

    const totalItens = itens.reduce((acc, item) => {
      const el = document.querySelector(
        `.cart-item[data-produto-id='${item.produtoId}'] .item-price`
      );
      const preco = el ? parseFloat(el.textContent.replace("R$", "").replace(",", ".").trim()) : 0;
      return acc + preco * item.quantidade;
    }, 0);

    const transacoes = [];

    // Itera todos os formulários de cartões adicionados
    document
      .querySelectorAll("#card-container-cartoes .card-container")
      .forEach((cardEl) => {
        const numero = cardEl.querySelector("input[name='numeroCartao']")?.value;
        if (!numero) return;

        const cartaoObj = {
          numeroCartao: numero,
          nomeImpresso: cardEl.querySelector("input[name='nomeImpresso']")?.value,
          bandeira: cardEl.querySelector("select[name='bandeira']")?.value,
          codigoSeguranca: cardEl.querySelector("input[name='cvv']")?.value,
          preferencial: cardEl.querySelector("input[name='preferencial']")?.checked || false,
        };

        const valor = parseFloat(
          cardEl
            .querySelector("input[name='valor']")
            ?.value.replace("R$", "")
            .replace(",", ".")
        ) || 0;

        const salvarCartao =
          cardEl.querySelector("input[name='salvar-cartao']")?.checked || false;

        transacoes.push({
          valor: valor,
          status: "EM_PROCESSAMENTO",
          salvarCartao: salvarCartao,
          cartaoExistenteId: null,
          cartaoNovo: cartaoObj,
        });
      });

    // ----------- MONTAR REQUEST -----------
    const pedido = {
      enderecoId: enderecoId || null,
      salvarEndereco: salvarEndereco,
      itens: itens,
      transacoes: transacoes,
    };

    console.log("Pedido enviado:", pedido);

    const response = await fetch(
      `http://localhost:8080/cliente/${clienteId}/finalizar-compra`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro no backend: ${response.status} ${response.statusText}\n${text}`);
    }

    const pedidoSalvo = await response.json();
    alert(`Compra finalizada com sucesso! Pedido ID: ${pedidoSalvo.id}`);

    // Limpa carrinho e cupom
    await fetch(`http://localhost:8080/carrinho/${clienteId}/limpar`, {
      method: "DELETE",
    });
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
  carregarItensFinalizarCompra(clienteId, atualizarTotais);

  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("itemQuantidade")) {
      atualizarTotais();
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target;

    if (target.closest("#btnFinalizarPedido")) {
      finalizarCompra(clienteId);
    }

    if (target.closest("[data-tipo-card]")) {
      const tipoCard = target.closest("[data-tipo-card]").dataset.tipoCard;
      if (tipoCard) addCard(tipoCard, atualizarTotais);
    }

    if (target.closest("[data-tipo-cupom]")) {
      const tipoCupom = target.closest("[data-tipo-cupom]").dataset.tipoCupom;
      if (tipoCupom) addCard(tipoCupom, atualizarTotais);
    }
  });
});
