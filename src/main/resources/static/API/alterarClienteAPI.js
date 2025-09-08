document.addEventListener("DOMContentLoaded", () => {
  // Pega o ID do cliente do localStorage
  const clienteId = localStorage.getItem("clienteId");
  if (!clienteId) {
    alert("ID do cliente não encontrado. Faça login ou cadastre-se.");
    return;
  }

  // --- Funções auxiliares ---
  function resolverTipoEndereco(containerEnd) {
    const entrega = containerEnd.querySelector("input[name='endereco-entrega']")?.checked;
    const cobranca = containerEnd.querySelector("input[name='endereco-cobranca']")?.checked;
    if (entrega && cobranca) return "ENTREGA_COBRANCA";
    if (entrega) return "ENTREGA";
    if (cobranca) return "COBRANCA";
    return "COBRANCA";
  }

  function montarClienteData() {
    return {
      id: Number(clienteId),
      nome: document.getElementById("nome").value,
      genero: document.getElementById("genero").value,
      dataNascimento: document.getElementById("data-nascimento").value,
      cpf: document.getElementById("cpf").value,
      email: document.getElementById("email").value,
      status: "ATIVO",
      senha: "Senha@123", // ⚠️ ideal: enviar apenas se for alterar

      telefones: Array.from(document.querySelectorAll("#telefones-container .telefone-container"))
        .map(tel => ({
          id: tel.dataset.id ? Number(tel.dataset.id) : null,
          tipo: tel.querySelector("select[name='tipo']").value,
          ddd: tel.querySelector("input[name='ddd']").value,
          numero: tel.querySelector("input[name='numero']").value
        }))
        .filter(t => t.tipo && t.ddd && t.numero),

      enderecos: Array.from(document.querySelectorAll("#address-container .address-container"))
        .map(end => ({
          id: end.dataset.id ? Number(end.dataset.id) : null,
          tipoResidencia: end.querySelector("select[name='tipoResidencia']").value,
          tipoLogradouro: end.querySelector("select[name='tipoLogradouro']").value,
          tipoEndereco: resolverTipoEndereco(end),
          logradouro: end.querySelector("input[name='logradouro']").value,
          numero: end.querySelector("input[name='numero']").value,
          bairro: end.querySelector("input[name='bairro']").value,
          cep: end.querySelector("input[name='cep']").value,
          cidade: end.querySelector("input[name='cidade']").value,
          estado: end.querySelector("input[name='estado']").value,
          pais: end.querySelector("input[name='pais']").value,
          observacoes: end.querySelector("textarea[name='observacoes']").value
        }))
        .filter(e => e.logradouro && e.cep),

      cartoesCredito: Array.from(document.querySelectorAll("#card-container .card-container"))
        .map(card => ({
          id: card.dataset.id ? Number(card.dataset.id) : null,
          numeroCartao: card.querySelector("input[name='numero-cartao']").value,
          nomeImpresso: card.querySelector("input[name='nome-titular']").value,
          bandeira: card.querySelector("select[name='bandeira']").value,
          codigoSeguranca: card.querySelector("input[name='cvv']").value,
          preferencial: card.querySelector("input[name='cartao-preferencial']").checked
        }))
        .filter(c => c.numeroCartao && c.bandeira && c.bandeira !== "Escolha...")
    };
  }

  async function atualizarCliente() {
    const clienteData = montarClienteData();
    console.log("Payload enviado:", JSON.stringify(clienteData, null, 2));

    try {
      const response = await fetch(`http://localhost:8080/clientes/${clienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(clienteData)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}\n${errText}`);
      }

      const result = await response.text();
      console.log("Cliente atualizado com sucesso:", result);

      // Desativa todos os formulários
      document.querySelectorAll(".form-cliente").forEach(form => toggleCampos(form, false));

      // Abre modal de sucesso
      abrirModal(document.getElementById("success-modal"));
    } catch (error) {
      console.error("Erro na atualização:", error);
      alert(`Falha ao atualizar: ${error.message}`);
    }
  }

  // --- Função para alternar campos e botões ---
  function toggleCampos(formulario, isEditing) {
    const campos = formulario.querySelectorAll("input, select, textarea");
    const botoesExtras = formulario.querySelectorAll("button.remove-btn, #btnBuscarCep");
    const btnAlterar = formulario.querySelector(".btn-alterar");
    const btnCancelar = formulario.querySelector(".btn-cancelar");
    const btnSalvar = formulario.querySelector(".btn-salvar");

    if (!btnAlterar || !btnCancelar || !btnSalvar) return;

    if (isEditing) {
      campos.forEach(c => c.removeAttribute("disabled"));
      botoesExtras.forEach(b => b.removeAttribute("disabled"));
      btnAlterar.style.visibility = "hidden";
      btnCancelar.style.visibility = "visible";
      btnSalvar.style.visibility = "visible";
    } else {
      campos.forEach(c => c.setAttribute("disabled", "disabled"));
      botoesExtras.forEach(b => b.setAttribute("disabled", "disabled"));
      btnAlterar.style.visibility = "visible";
      btnCancelar.style.visibility = "hidden";
      btnSalvar.style.visibility = "hidden";
    }
  }

  // --- Modal helpers ---
  function abrirModal(modal) { if (modal) modal.style.display = "flex"; }
  function fecharModal(modal) { if (modal) modal.style.display = "none"; }

  // --- Configuração inicial de todos os formulários ---
  document.querySelectorAll(".form-cliente").forEach(form => {
    toggleCampos(form, false);

    // Salvar unificado
    form.querySelector(".btn-salvar")?.addEventListener("click", (e) => {
      e.preventDefault();
      atualizarCliente();
    });

    // Alterar
    form.querySelector(".btn-alterar")?.addEventListener("click", (e) => {
      e.preventDefault();
      toggleCampos(form, true);
    });

    // Cancelar
    form.querySelector(".btn-cancelar")?.addEventListener("click", (e) => {
      e.preventDefault();
      toggleCampos(form, false);
    });
  });
});