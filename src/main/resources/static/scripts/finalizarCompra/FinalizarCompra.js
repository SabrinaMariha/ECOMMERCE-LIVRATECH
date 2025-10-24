import { calcularFretePorEstado, atualizarFrete } from "./CalcularFrete.js";
import { atualizarTotais } from "./CalcularTotais.js";
import { addCard } from "./ProcessarCupons.js";
import { carregarItensFinalizarCompra } from "./ProcessarItens.js";

// ----------------- CLIENTE -----------------
const clienteId = localStorage.getItem("clienteId");
if (!clienteId) console.error("Cliente não logado!");
console.log("Cliente ID:", clienteId);

/// ----------------- CARREGA DADOS DO CLIENTE -----------------
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
       popularSelectCartoes(selectCartoes, cartoes);
       // O Event Listener de 'change' está no final do arquivo (DOMContentLoaded)
     }

   } catch (error) {
     console.error("Erro ao carregar dados do cliente:", error);
   }
 } // <--- FIM CORRETO DA FUNÇÃO

// ----------------- FUNÇÕES AUXILIARES -----------------
function popularSelectCartoes(selectElement, cartoesCadastrados) {
    if (!selectElement) return;

    selectElement.innerHTML = "";

    // 1. Adiciona os cartões cadastrados
    cartoesCadastrados.forEach((cartao) => {
        const option = document.createElement("option");
        option.value = cartao.id;
        const ultimosDigitos = cartao.numeroCartao.slice(-4);
        option.textContent = `${cartao.bandeira} **** ${ultimosDigitos}`;
        selectElement.appendChild(option);
    });

    // 2. Adiciona as opções "Selecione" e "Novo Cartão"
    selectElement.innerHTML += `<option selected> Selecione</option>
                                <option value="novo">Novo cartão</option> `;
}

function preencherFormularioCartao(formEl, cartao) {
  if (!formEl) return;

  if (!cartao) {
      limparFormularioCartao(formEl); // Passa o formEl para limparFormularioCartao
      return;
    }

formEl.dataset.cartaoId = cartao.id;
  formEl.querySelector("input[name='numero-cartao']").value = cartao.numeroCartao;
  formEl.querySelector("input[name='nome-titular']").value = cartao.nomeImpresso;
  formEl.querySelector("select[name='bandeira']").value = cartao.bandeira;
  formEl.querySelector("input[name='cvv']").value = "";
  formEl.querySelector("input[name='valor']").value = "";
  formEl.querySelector("input[name='salvar-cartao']").checked = false;
}

function limparFormularioCartao(formEl) {
  if (!formEl) return;
    formEl.dataset.cartaoId = "";
  formEl.querySelector("input[name='numero-cartao']").value = "";
  formEl.querySelector("input[name='nome-titular']").value = "";
  formEl.querySelector("select[name='bandeira']").value = "Selecione";
  formEl.querySelector("input[name='cvv']").value = "";
  formEl.querySelector("input[name='valor']").value = "";
  formEl.querySelector("input[name='salvar-cartao']").checked = false;
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

    const desconto =
           parseFloat(
             document
               .getElementById("valorCuponsResumo")
               ?.textContent.replace("- R$", "") // Remove o sinal de menos e 'R$'
               .replace(",", ".")
               .trim()
           ) || 0;

         // A variável totalItens que você calculava antes é agora só o subtotal:
         const subTotalItens = itens.reduce((acc, item) => {
           const el = document.querySelector(
             `.cart-item[data-produto-id='${item.produtoId}'] .item-price`
           );
           // Usar a lógica do frontend para obter o preço (PODE SER NECESSÁRIO AJUSTAR AQUI)
           const preco = el ? parseFloat(el.textContent.replace("R$", "").replace(",", ".").trim()) : 0;
           return acc + preco * item.quantidade;
         }, 0);

    const transacoes = [];

    document
      .querySelectorAll("#card-container-cartoes .card-container")
      .forEach((cardEl) => {
        const numero = cardEl.querySelector("input[name='numero-cartao']")?.value;
        if (!numero) return;


        const valor = parseFloat(
          cardEl
            .querySelector("input[name='valor']")
            ?.value.replace("R$", "")
            .replace(",", ".")
        ) || 0;

       const cartaoExistenteId = parseInt(cardEl.dataset.cartaoId) || null;

               const salvarCartao =
                 cardEl.querySelector("input[name='salvar-cartao']")?.checked || false;

               let cartaoNovo = null;

               // Só cria um objeto cartaoNovo se NÃO for um cartão existente
               if (!cartaoExistenteId) {
                 cartaoNovo = {
                   numeroCartao: numero,
                   nomeImpresso: cardEl.querySelector("input[name='nome-titular']")?.value,
                   bandeira: cardEl.querySelector("select[name='bandeira']")?.value,
                   codigoSeguranca: cardEl.querySelector("input[name='cvv']")?.value,
                   preferencial: cardEl.querySelector("input[name='preferencial']")?.checked || false,
                 };
               }
        transacoes.push({
          valor: valor,
          status: "EM_PROCESSAMENTO",
          salvarCartao: salvarCartao,
          cartaoExistenteId: cartaoExistenteId, // Será o ID ou null
          cartaoNovo: cartaoNovo,
        });
      });

    // ----------- MONTAR REQUEST -----------
    const pedido = {
      enderecoId: enderecoId || null,
      salvarEndereco: salvarEndereco,
      itens: itens,
      transacoes: transacoes,
      valorFrete: frete,
      valorDesconto: desconto,
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
          // 1. Tenta ler a resposta como JSON (padrão de muitos erros do Spring)
          let errorMessage = `Erro no backend: ${response.status} ${response.statusText}`;

          try {
            const errorData = await response.json();
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.error) {
                 errorMessage = errorData.error;
            } else {
                 // Se falhar, tenta ler como texto
                 const text = await response.text();
                 if (text) errorMessage = text;
            }
          } catch (e) {
            const text = await response.text();
            if (text) errorMessage = text;
          }

          // Joga o erro (com a mensagem extraída)
          throw new Error(errorMessage);
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

  document.addEventListener("change", (e) => {
          // Verifica se o elemento que disparou o 'change' é um dos selects de cartões
          if (e.target.matches("select[name='cartoes']")) {
              // Reutiliza a lógica que estava dentro de carregarDadosCliente
              const selectCartoesEl = e.target;
              const valor = selectCartoesEl.value;
              const cartaoContainer = selectCartoesEl.closest(".card-container");
              const opcaoSalvarCartao = cartaoContainer.querySelector("input[name='salvar-cartao']");
              const cartaoId = parseInt(valor);

              if (valor === "novo") {
                  opcaoSalvarCartao.disabled = false;
                  preencherFormularioCartao(cartaoContainer, null);
              } else if (!isNaN(cartaoId)) {
                  opcaoSalvarCartao.disabled = true;
                  opcaoSalvarCartao.checked = false;

                  const cartaoSelecionado = window.dadosCliente.cartoesCredito.find(
                    (c) => c.id === cartaoId
                  );
                  preencherFormularioCartao(cartaoContainer, cartaoSelecionado);
              } else {
                  preencherFormularioCartao(cartaoContainer, null);
              }
          }

          if (e.target.classList.contains("itemQuantidade")) {
            atualizarTotais();
          }
      });
});
