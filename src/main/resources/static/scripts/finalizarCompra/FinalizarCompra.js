// Arquivo: FinalizarCompra.js

import { calcularFretePorEstado, atualizarFrete } from "./CalcularFrete.js";
import { atualizarTotais } from "./CalcularTotais.js";
import { addCard, repopularCuponsEmTodosCards } from "./ProcessarCupons.js";
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

    // --- CUPONS ---
    const selectCupons = document.querySelector("#card-template-cupom select[name='cupons']");
        if (selectCupons) {
      popularSelectCupons(selectCupons, dados.cupons || []);
    }
   } catch (error) {
     console.error("Erro ao carregar dados do cliente:", error);
   }
 } // <--- FIM CORRETO DA FUNÇÃO

// ----------------- FUNÇÕES AUXILIARES -----------------

/**
 * Coleta os IDs de todos os cupons selecionados nos cards ativos.
 * @returns {number[]} Array de IDs dos cupons selecionados.
 */
function getCuponsSelecionadosIds() {
    const cuponsIds = [];
    document.querySelectorAll("#card-container-cupom .card-container:not(#card-template-cupom) select[name='cupons']").forEach(cardSelect => {
        const cupomId = parseInt(cardSelect.value);
        if (!isNaN(cupomId) && cardSelect.value !== "") {
            cuponsIds.push(cupomId);
        }
    });
    return cuponsIds;
}

export function popularSelectCupons(selectElement, cuponsCadastrados) {
    if (!selectElement) return;

    selectElement.innerHTML = "";

    // 1. Adiciona a opção padrão
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Selecione um cupom";
    defaultOption.value = "";
    selectElement.appendChild(defaultOption);

    // 2. Adiciona os cupons cadastrados
    cuponsCadastrados.forEach((cupom) => {
        const option = document.createElement("option");
        option.value = cupom.id;

        const codigo = cupom.codigo || `ID: ${cupom.id}`;

        option.textContent = `${cupom.descricao} ${codigo} - Desconto: R$ ${cupom.valor.toFixed(2)}`;

        option.dataset.desconto = cupom.valor.toFixed(2);
        selectElement.appendChild(option);
    });
}
 export function popularSelectCartoes(selectElement, cartoesCadastrados) {
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
      limparFormularioCartao(formEl);
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

/**
 * Função corrigida: Atualiza a label no card do cupom.
 */
export function atualizarDadosCupom(selectElement) {
    const cardContainer = selectElement.closest(".card-container");
    const labelCupom = cardContainer.querySelector(".label-cupom-selecionado");

    const selectedOption = selectElement.options[selectElement.selectedIndex];


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

    const novoEndereco = enderecoId ? null : {
          // ... (novo endereco fields mantidos)
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

    // ----------- FRETE, ITENS E TOTAIS -----------
    const frete =
      parseFloat(
        document
          .getElementById("valorFreteResumoTotal")
          ?.textContent.replace("R$", "")
          .replace(",", ".")
      ) || 0;

         // A variável subTotalItens (soma dos itens)
         const subTotalItens = itens.reduce((acc, item) => {
                    const itemElement = document.querySelector(
                      `.cart-item[data-produto-id='${item.produtoId}']`
                    );

                    if (!itemElement) return acc;

                    const precoUnitarioEl = itemElement.querySelector('.item-price');
                    const precoUnitario = precoUnitarioEl
                      ? parseFloat(precoUnitarioEl.textContent.replace("R$", "").replace(",", ".").trim())
                      : 0;

                    return acc + precoUnitario * item.quantidade;

                  }, 0);
                  
        const totalCompra = subTotalItens + frete; // Base para cálculo do excesso
    
    // ----------- TRANSACÇÕES (CARTÕES) -----------
    const transacoes = [];

    document
      .querySelectorAll("#card-container-cartoes .card-container")
      .forEach((cardEl) => {
          // ... (cálculo de transações de cartão mantido)
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
          cartaoExistenteId: cartaoExistenteId,
          cartaoNovo: cartaoNovo,
        });
      });

      // ----------- CUPONS PARA REQUEST -----------
      const valorDescontoAplicado = // Desconto limitado ao total da compra
             parseFloat(
               document
                 .getElementById("valorCuponsResumo")
                 ?.textContent.replace("- R$", "")
                 .replace(",", ".")
                 .trim()
             ) || 0;

      const cuponsIds = getCuponsSelecionadosIds();
      const valorCuponsBruto = window.somaCuponsBruta || 0; // Valor total dos cupons sem limite

    // ----------- MONTAR REQUEST -----------
    const pedido = {
      enderecoId: enderecoId || null,
      salvarEndereco: salvarEndereco,
      itens: itens,
      transacoes: transacoes,
      valorFrete: frete,
      valorDesconto: valorDescontoAplicado,
      cuponsIds: cuponsIds,
      valorCuponsBruto: valorCuponsBruto,
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
          // ... (tratamento de erro mantido)
          let errorMessage = `Erro no backend: ${response.status} ${response.statusText}`;

          try {
            const errorData = await response.json();
            if (errorData.message) { errorMessage = errorData.message; }
            else if (errorData.detail) { errorMessage = errorData.detail; } 
            else if (errorData.error) { errorMessage = errorData.error; } 
            else { 
                 const text = await response.text();
                 if (text) errorMessage = text;
            }
          } catch (e) {
            const text = await response.text();
            if (text) errorMessage = text;
          }

          throw new Error(errorMessage);
        }

    const pedidoSalvo = await response.json();
    alert(`Compra finalizada com sucesso! Pedido ID: ${pedidoSalvo.id}`);
    
    // --- NOVO: Lógica para Cupom de Troca ---
    const valorExcessivo = valorCuponsBruto - totalCompra; // Usa totalCompra calculada acima!

    if (valorExcessivo > 0.01) { 
        console.log("Valor excessivo de cupons detectado:", valorExcessivo.toFixed(2));

        try {
            const cupomResponse = await fetch(
                `http://localhost:8080/trocas/${clienteId}/gerarCupomPorPagamento`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(valorExcessivo),
                    credentials: "include",
                }
            );

            if (cupomResponse.ok) {
                alert(`Cupom de Troca de R$ ${valorExcessivo.toFixed(2).replace('.', ',')} gerado com sucesso!`);
            } else {
                 console.error("Erro ao gerar cupom de troca no backend.");
            }
        } catch (e) {
            console.error("Erro de conexão ao tentar gerar Cupom de Troca:", e);
        }
    }
if (cuponsIds.length > 0) {
            console.log(`Deletando ${cuponsIds.length} cupons utilizados.`);

            // Usamos Promise.all para executar todas as exclusões em paralelo,
            // ou um loop simples para executar sequencialmente (mais seguro em alguns casos)
            for (const cupomId of cuponsIds) {
                try {
                    const deleteResponse = await fetch(
                        `http://localhost:8080/trocas/${cupomId}`, // Assumindo que seu endpoint é /cupom/{cupomId}
                        {
                            method: "DELETE",
                            credentials: "include",
                        }
                    );

                    if (deleteResponse.ok) {
                        console.log(`Cupom ID ${cupomId} deletado com sucesso.`);
                    } else {
                        console.error(`Falha ao deletar Cupom ID ${cupomId}. Status: ${deleteResponse.status}`);
                    }
                } catch (e) {
                    console.error(`Erro de conexão ao tentar deletar Cupom ID ${cupomId}:`, e);
                }
            }
        }

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
             if (e.target.matches("select[name='cupons']")) {

                 atualizarDadosCupom(e.target);
                 repopularCuponsEmTodosCards();
                 atualizarTotais();
            }

            if (e.target.classList.contains("itemQuantidade")) {
              atualizarTotais();
            }

      });
});