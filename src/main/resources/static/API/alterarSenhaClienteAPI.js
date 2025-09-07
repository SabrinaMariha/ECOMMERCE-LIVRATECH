document.addEventListener("DOMContentLoaded", () => {
  // --- Submissão dos formulários ---
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (form.id === "formulario-senha") {
        const senhaAtual = document.getElementById("senha-atual").value;
        const novaSenha = document.getElementById("nova-senha").value;
        const confirmacaoSenha = document.getElementById(
          "confirmacao-nova-senha"
        ).value;

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

          if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || "Erro ao alterar senha.");
          }

          fecharModal(modalSenha);
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
