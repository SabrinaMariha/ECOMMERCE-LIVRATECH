document.addEventListener("DOMContentLoaded", function () {
  fetch("chatbot.html")
    .then(response => response.text())
    .then(data => {
      document.body.insertAdjacentHTML("beforeend", data);

      const btn = document.getElementById("chatbot-btn");
      const modal = document.getElementById("chatbot-modal");
      const close = document.getElementById("chatbot-close");
      const sendBtn = document.getElementById("chatbot-send");
      const input = document.getElementById("chatbot-input");
      const messages = document.getElementById("chatbot-messages");

      const formatMarkdownToHTML = (text) => {
        return text
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/^\s*[\*\-]\s+(.*)$/gm, "<li>$1</li>")
          .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
          .replace(/\n/g, "<br>");
      };

      btn.addEventListener("click", () => modal.classList.toggle("active"));
      close.addEventListener("click", () => modal.classList.remove("active"));
      window.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });

      async function sendMessage() {
        const msg = input.value.trim();
        if (!msg) return;

        const userMsg = document.createElement("p");
        userMsg.className = "user-msg";
        userMsg.textContent = msg;
        messages.appendChild(userMsg);
        input.value = "";
        messages.scrollTop = messages.scrollHeight;

        try {
          const response = await fetch(`/chat/mensagem/livros-disponiveis`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: msg })
          });

          if (!response.ok) throw new Error("Erro na comunicação com a IA");

          const data = await response.text();

          const botMsg = document.createElement("p");
          botMsg.className = "bot-msg";
          botMsg.innerHTML = formatMarkdownToHTML(data);
          messages.appendChild(botMsg);
        } catch (error) {
          const botMsg = document.createElement("p");
          botMsg.className = "bot-msg error";
          botMsg.textContent = "⚠️ Ocorreu um erro ao se comunicar com a IA.";
          messages.appendChild(botMsg);
        } finally {
          messages.scrollTop = messages.scrollHeight;
        }
      }

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
