export function addCard(tipo, atualizarTotaisCallback) {
  if (tipo === "cupom") {
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
      if (atualizarTotaisCallback) atualizarTotaisCallback();
    });

    const selectCupom = clone.querySelector("select[name='bandeira']");
    selectCupom.addEventListener("change", (e) => {
      const valor = parseFloat(e.target.value.replace("%", "")) || 0;
      descontoAtivo = valor;
      if (atualizarTotaisCallback) atualizarTotaisCallback();
    });

  } else if (tipo === "cartao") {
      const container = document.getElementById("card-container-cartoes");
      const template = document.getElementById("card-template-cartao");
      const clone = template.cloneNode(true);
      clone.style.display = "block";
      clone.removeAttribute("id");

      // Permite adicionar vários cartões
      container.appendChild(clone);

      // **CORREÇÃO: Popula o select do novo formulário clonado**
      const selectCartoesClone = clone.querySelector("select[name='cartoes']");
      const cartoesCliente = window.dadosCliente ? window.dadosCliente.cartoesCredito || [] : [];

      // Chama a nova função para popular o select
      popularSelectCartoes(selectCartoesClone, cartoesCliente);

      // Botão remover cartão
      clone.querySelector(".remove-btn").addEventListener("click", () => {
        clone.remove();
        if (atualizarTotaisCallback) atualizarTotaisCallback();
      });
    }
  }
