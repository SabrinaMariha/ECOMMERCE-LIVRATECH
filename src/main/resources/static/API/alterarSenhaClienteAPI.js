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
          const response = await fetch(
            "http://localhost:8080/clientes/4/senha",
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

          // Lê o texto primeiro
          const text = await response.text();

          // Tenta converter para JSON, se possível
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text }; // se não for JSON, considera texto simples
          }

          if (!response.ok) {
            throw new Error(data.message || "Erro ao alterar senha.");
          }

          // Sucesso
          fecharModal(modalSenha);

          // Dispara evento customizado para modal de cliente atualizado
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
