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
      const categorySelect = document.getElementById("chatbot-category-select");

      // --- Função para converter Markdown simples em HTML ---
      function formatMarkdownToHTML(text) {
        return text
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **negrito**
          .replace(/\*(.*?)\*/g, "<em>$1</em>")             // *itálico*
          .replace(/^\s*[\*\-]\s+(.*)$/gm, "<li>$1</li>")   // listas com * ou -
          .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")       // agrupa as listas
          .replace(/\n/g, "<br>");                          // quebras de linha
      }

      // --- Abre e fecha modal ---
      btn.addEventListener("click", () => modal.classList.toggle("active"));
      close.addEventListener("click", () => modal.classList.remove("active"));
      window.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });

      // --- Função para enviar mensagens ---
      async function sendMessage() {
        const msg = input.value.trim();
        const categoria = categorySelect.value;

        if (!msg) return;

        // Mensagem do usuário
        const userMsg = document.createElement("p");
        userMsg.className = "user-msg";
        userMsg.textContent = msg;
        messages.appendChild(userMsg);
        input.value = "";

        // Scroll automático
        messages.scrollTop = messages.scrollHeight;

        try {
          // Envia para sua API Spring Boot
          const response = await fetch(`/chat/mensagem/livros-disponíveis/${categoria}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: msg })
          });

          if (!response.ok) {
            throw new Error("Erro na comunicação com a IA");
          }

          const data = await response.text();

          // Mensagem da IA (com formatação Markdown → HTML)
          const botMsg = document.createElement("p");
          botMsg.className = "bot-msg";
          botMsg.innerHTML = formatMarkdownToHTML(data); // <-- Aqui o segredo!
          messages.appendChild(botMsg);
        } catch (error) {
          const botMsg = document.createElement("p");
          botMsg.className = "bot-msg error";
          botMsg.textContent = "⚠️ Ocorreu um erro ao se comunicar com a IA.";
          messages.appendChild(botMsg);
          console.error(error);
        } finally {
          messages.scrollTop = messages.scrollHeight;
        }
      }

      // Eventos
      sendBtn.addEventListener("click", sendMessage);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessage();
        }
      });
    })
    .catch(error => console.error("Erro ao carregar chatbot:", error));
});
