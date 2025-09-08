document.addEventListener("DOMContentLoaded", () => {
  const modalSucesso = document.getElementById("success-modal");
  const modalSenha = document.getElementById("senha-modal");

  function abrirModal(modal) {
    if (modal) modal.style.display = "flex";
  }

  function fecharModal(modal) {
    if (modal) modal.style.display = "none";
  }

  // --- Submissão do formulário de senha ---
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (form.id === "formulario-senha") {
        const senhaAtual = document.getElementById("senha-atual").value;
        const novaSenha = document.getElementById("nova-senha").value;
        const confirmacaoSenha = document.getElementById("confirmacao-nova-senha").value;

        if (novaSenha !== confirmacaoSenha) {
          return alert("A nova senha e a confirmação não correspondem!");
        }

        const senhaForteRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!senhaForteRegex.test(novaSenha)) {
          return alert(
            "A senha deve ter no mínimo 8 caracteres, incluir letras maiúsculas, minúsculas, números e caracteres especiais."
          );
        }

        try {
          // 🔹 Recupera o ID salvo no localStorage
          const clienteId = localStorage.getItem("clienteId");
          if (!clienteId) {
            throw new Error("ID do cliente não encontrado. Faça login ou cadastre novamente.");
          }

          const response = await fetch(
            `http://localhost:8080/clientes/${clienteId}/senha`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                senhaAtual: senhaAtual,
                novaSenha: novaSenha,
                confirmarSenha: confirmacaoSenha,
              }),
            }
          );

          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text };
          }

          if (!response.ok) {
            throw new Error(data.message || "Erro ao alterar senha.");
          }

          fecharModal(modalSenha);

          const event = new CustomEvent("clienteAtualizado", {
            detail: { message: data.message || "Senha alterada com sucesso!" }
          });
          document.dispatchEvent(event);

          abrirModal(modalSucesso);
          form.reset();
        } catch (error) {
          alert("Erro: " + error.message);
        }
      }
    });
  });

  // --- Toggle de senha (ícone olho) ---
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = document.getElementById(icon.dataset.target);
      if (!input) return;

      input.type = input.type === "password" ? "text" : "password";
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });
});
