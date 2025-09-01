document.addEventListener("DOMContentLoaded", function () {
  fetch("chatbot.html")
    .then(response => response.text())
    .then(data => {
      // Insere o HTML do chatbot no final do body
      document.body.insertAdjacentHTML("beforeend", data);

      // Seletores
      const btn = document.getElementById("chatbot-btn");
      const modal = document.getElementById("chatbot-modal");
      const close = document.getElementById("chatbot-close");
      const sendBtn = document.getElementById("chatbot-send");
      const input = document.getElementById("chatbot-input");
      const messages = document.getElementById("chatbot-messages");

      // Abre e fecha o modal
      btn.addEventListener("click", () => modal.classList.toggle("active"));
      close.addEventListener("click", () => modal.classList.remove("active"));

      // Fecha modal ao clicar fora do conteúdo
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });

      // Função para enviar mensagens
      function sendMessage() {
        const msg = input.value.trim();
        if (!msg) return;

        // Mensagem do usuário
        const userMsg = document.createElement("p");
        userMsg.className = "user-msg";
        userMsg.textContent = msg;
        messages.appendChild(userMsg);

        // Limpa input
        input.value = "";

        // Resposta simulada da IA
        setTimeout(() => {
          const botMsg = document.createElement("p");
          botMsg.className = "bot-msg";
          botMsg.textContent = "Essa é uma resposta simulada da IA 😃";
          messages.appendChild(botMsg);

          // Scroll automático para a última msg
          messages.scrollTop = messages.scrollHeight;
        }, 800);
      }

      // Eventos de envio
      sendBtn.addEventListener("click", sendMessage);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault(); // Evita quebra de linha
          sendMessage();
        }
      });
    })
    .catch(error => console.error("Erro ao carregar chatbot:", error));
});
