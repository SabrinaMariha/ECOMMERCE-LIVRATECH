document.addEventListener("DOMContentLoaded", () => {
  let formToToggle = null;

  // ========================
  // Funções para adicionar elementos
  // ========================
  function adicionarTelefone(enable = false) {
    const container = document.getElementById("telefones-container");
    const template = document.getElementById("telefone-template");
    const clone = template.cloneNode(true);

    clone.style.display = "flex";
    clone.style.flexWrap = "wrap";
    clone.style.gap = "10px";
    clone.removeAttribute("id");

    if (enable) {
      clone
        .querySelectorAll("input, select, textarea")
        .forEach((campo) => campo.removeAttribute("disabled"));
      clone.querySelector(".remove-btn").removeAttribute("disabled");
    }

    clone
      .querySelector(".remove-btn")
      .addEventListener("click", () => clone.remove());
    container.appendChild(clone);
  }

  function addAddress(enable = false) {
    const container = document.getElementById("address-container");
    const template = document.getElementById("address-template");
    const clone = template.cloneNode(true);

    clone.style.display = "flex";
    clone.style.flexDirection = "column";
    clone.style.border = "#c9c9c9 0.1px solid";
    clone.style.padding = "10px";
    clone.style.marginBottom = "10px";
    clone.removeAttribute("id");

    if (enable) {
      clone
        .querySelectorAll("input, select, textarea")
        .forEach((campo) => campo.removeAttribute("disabled"));
      clone.querySelector(".remove-btn").removeAttribute("disabled");
    }

    clone
      .querySelector(".remove-btn")
      .addEventListener("click", () => clone.remove());
    container.appendChild(clone);
  }

  function addCard(enable = false) {
    const container = document.getElementById("card-container");
    const template = document.getElementById("card-template");
    const clone = template.cloneNode(true);

    clone.style.display = "block";
    clone.removeAttribute("id");

    if (enable) {
      clone
        .querySelectorAll("input, select, textarea")
        .forEach((campo) => campo.removeAttribute("disabled"));
      clone.querySelector(".remove-btn").removeAttribute("disabled");
    }

    clone
      .querySelector(".remove-btn")
      .addEventListener("click", () => clone.remove());
    container.appendChild(clone);
  }

  // ========================
  // Função para alternar campos
  // ========================
  window.toggleCampos = function (formulario, isEditing) {
    const campos = formulario.querySelectorAll("input, select, textarea");
    const botoesExtras = formulario.querySelectorAll(
      "button.remove-btn, .btnBuscarCep"
    );
    const btnAlterar = formulario.querySelector(".btn-alterar");
    const btnCancelar = formulario.querySelector(".btn-cancelar");
    const btnSalvar = formulario.querySelector(".btn-salvar");

    if (!btnAlterar || !btnCancelar || !btnSalvar) return;

    if (isEditing) {
      campos.forEach((campo) => campo.removeAttribute("disabled"));
      botoesExtras.forEach((btn) => btn.removeAttribute("disabled"));
      btnAlterar.style.visibility = "hidden";
      btnCancelar.style.visibility = "visible";
      btnSalvar.style.visibility = "visible";
    } else {
      campos.forEach((campo) => campo.setAttribute("disabled", "disabled"));
      botoesExtras.forEach((btn) => btn.setAttribute("disabled", "disabled"));
      btnAlterar.style.visibility = "visible";
      btnCancelar.style.visibility = "hidden";
      btnSalvar.style.visibility = "hidden";
    }
  };

  // Inicializa formulários como desabilitados
  document
    .querySelectorAll("form")
    .forEach((form) => toggleCampos(form, false));

  // ========================
  // Modais
  // ========================
  const modalSucesso = document.getElementById("success-modal");
  const modalCancelamento = document.getElementById("cancel-modal");
  const modalSenha = document.getElementById("senha-modal");

  window.abrirModal = function (modal) {
    if (modal) modal.style.display = "flex";
  };

  window.fecharModal = function (modal) {
    if (modal) modal.style.display = "none";
  };

  window.abrirModalSenha = function () {
    abrirModal(modalSenha);
  };

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      fecharModal(modal);
      if (modal.id === "senha-modal") modal.querySelector("form").reset();
    });
  });

  modalSucesso?.querySelector(".close-btn")?.addEventListener("click", () => {
    fecharModal(modalSucesso);
    if (formToToggle && formToToggle.id !== "formulario-senha") {
      toggleCampos(formToToggle, false);
      formToToggle = null;
    }
  });

  modalCancelamento
    ?.querySelector(".btn-nao")
    ?.addEventListener("click", () => fecharModal(modalCancelamento));
  modalCancelamento
    ?.querySelector(".btn-sim")
    ?.addEventListener("click", () => {
      fecharModal(modalCancelamento);
      if (formToToggle && formToToggle.id !== "formulario-senha") {
        toggleCampos(formToToggle, false);
        formToToggle = null;
      }
      location.reload();
    });

  // ========================
  // Submissão dos formulários (exceto senha)
  // ========================
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      formToToggle = form;

      // Formulário de senha é tratado em alterarSenhaCliente.js
      if (form.id !== "formulario-senha") {
        abrirModal(modalSucesso);
        toggleCampos(form, false);
      }
    });
  });

  // ========================
  // Botões "Adicionar"
  // ========================
  document
    .querySelector(".formulario-dados-pessoais .btn-principal")
    ?.addEventListener("click", () => {
      adicionarTelefone(true);
      toggleCampos(document.querySelector(".formulario-dados-pessoais"), true);
    });

  document
    .querySelector(".formulario-enderecos .btn-principal")
    ?.addEventListener("click", () => {
      addAddress(true);
      toggleCampos(document.querySelector(".formulario-enderecos"), true);
    });

  document
    .querySelector(".formulario-cartoes .btn-principal")
    ?.addEventListener("click", () => {
      addCard(true);
      toggleCampos(document.querySelector(".formulario-cartoes"), true);
    });

  // ========================
  // Botões "Alterar"
  // ========================
  document.querySelectorAll(".btn-alterar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const form = e.target.closest("form");
      if (form) toggleCampos(form, true);
    });
  });

  // ========================
  // Botões "Cancelar"
  // ========================
  document
    .querySelectorAll(".btn-cancelar, .btn-cancelar-senha")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        formToToggle = e.target.closest("form");
        if (formToToggle.id === "formulario-senha") {
          fecharModal(modalSenha);
          formToToggle.reset();
        } else abrirModal(modalCancelamento);
      });
    });

  // ========================
  // Evento customizado
  // ========================
  document.addEventListener("clienteAtualizado", (event) => {
    console.log("Evento recebido, cliente atualizado:", event.detail);
    abrirModal(modalSucesso);
  });
});

// ========================
// Toggle detalhes do pedido
// ========================
function toggleDetalhes(btn) {
  const detalhes = btn
    .closest(".pedido-card")
    .querySelector(".pedido-detalhes");
  detalhes.style.display = detalhes.style.display === "none" ? "block" : "none";
}
