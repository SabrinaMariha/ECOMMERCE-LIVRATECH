// Arquivo: ProcessarCupons.js

// Importe as funções auxiliares que agora DEVEM ser exportadas de FinalizarCompra.js
import { popularSelectCartoes, popularSelectCupons, atualizarDadosCupom } from "./FinalizarCompra.js";
import { atualizarTotais } from "./CalcularTotais.js"; // Para garantir o recalculo

// ----------------------------------------------------------------------------------
// Lógica para Impedir Duplicidade de Cupons (Funções auxiliares)
// ----------------------------------------------------------------------------------

// Retorna os IDs de cupons atualmente selecionados nos cards ativos
function getCuponsUsados() {
    const usados = [];
    document.querySelectorAll("#card-container-cupom .card-container:not(#card-template-cupom)").forEach(card => {
        const select = card.querySelector("select[name='cupons']");
        // Adiciona o valor se for um cupom selecionado (value !== "")
        if (select && select.value !== "") {
            usados.push(select.value);
        }
    });
    return usados;
}

// ⚠️ ESSENCIAL: Percorre todos os selects de cupom e desativa as opções já usadas.
export function repopularCuponsEmTodosCards() {
    const todosSelects = document.querySelectorAll("#card-container-cupom select[name='cupons']");
    const cuponsUsadosIds = getCuponsUsados();

    todosSelects.forEach(selectElement => {
        const valorAtual = selectElement.value;

        // Itera sobre as opções do select atual
        Array.from(selectElement.options).forEach(option => {

            // Verifica se a opção está sendo usada por outro select (o ID dela está na lista, mas não é o valor atual deste select)
            const isUsadoPorOutro = cuponsUsadosIds.includes(option.value) && option.value !== valorAtual;

            // Desativa se for usado por outro select
            option.disabled = isUsadoPorOutro;

            // Mantém a opção padrão sempre ativa
            if (option.value === "") {
                option.disabled = false;
            }
        });

        // Se o valor selecionado por este card foi desativado (porque foi selecionado em outro card), resetamos
        if (selectElement.selectedOptions[0]?.disabled) {
             selectElement.value = ""; // Reseta para a opção padrão
             // Atualiza a label para limpar (se não for o template)
             const cardContainer = selectElement.closest(".card-container");
             if (cardContainer && cardContainer.id !== "card-template-cupom") {
                  atualizarDadosCupom(selectElement);
             }
        }
    });

    atualizarTotais(); // Garante o recálculo do total após qualquer mudança
}

// ----------------------------------------------------------------------------------
// Lógica Principal: Adicionar e Remover Cards (função addCard revisada)
// ----------------------------------------------------------------------------------

export function addCard(tipo, atualizarTotaisCallback) {
  if (tipo === "cupom") {
    const container = document.getElementById("card-container-cupom");
    const template = document.getElementById("card-template-cupom");

    if (!container || !template) return;

    const clone = template.cloneNode(true);
    clone.style.display = "block";
    clone.removeAttribute("id");

    // Permite MÚLTIPLOS cupons:
    container.appendChild(clone);

    // Popula o SELECT do cupom clonado
    const selectCupom = clone.querySelector("select[name='cupons']");
    const cuponsCadastrados = window.dadosCliente?.cupons || [];

    popularSelectCupons(selectCupom, cuponsCadastrados);

    // Esconde a label de cupom selecionado no card novo
    const labelCupom = clone.querySelector(".label-cupom-selecionado");
    if(labelCupom) {
         labelCupom.textContent = '';
         labelCupom.style.display = 'none';
    }

    // Listener para o botão remover
    clone.querySelector(".remove-btn").addEventListener("click", () => {
      clone.remove();

      repopularCuponsEmTodosCards(); // Reativa as opções

      if (atualizarTotaisCallback) atualizarTotaisCallback();
    });

    // Garante que o novo card seja inicializado com as opções corretas (cupons não usados)
    repopularCuponsEmTodosCards();

  } else if (tipo === "cartao") {
      // Seu código de cartão aqui (mantenha como está)
      const container = document.getElementById("card-container-cartoes");
      const template = document.getElementById("card-template-cartao");
      const clone = template.cloneNode(true);
      clone.style.display = "block";
      clone.removeAttribute("id");

      container.appendChild(clone);

      const selectCartoesClone = clone.querySelector("select[name='cartoes']");
      const cartoesCliente = window.dadosCliente ? window.dadosCliente.cartoesCredito || [] : [];

      popularSelectCartoes(selectCartoesClone, cartoesCliente);

      clone.querySelector(".remove-btn").addEventListener("click", () => {
        clone.remove();
        if (atualizarTotaisCallback) atualizarTotaisCallback();
      });
    }
}