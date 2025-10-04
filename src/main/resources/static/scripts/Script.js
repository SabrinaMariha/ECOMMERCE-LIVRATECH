document.addEventListener("DOMContentLoaded", function () {
  // Carrega navbar
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-container").innerHTML = data;

      const path = window.location.pathname;

      // -------------------------
      // Esconder search e botões em páginas específicas
      // -------------------------
      if (
        path.includes("cadastroCliente.html") ||
        path.includes("adminConsulta.html") ||
        path.includes("painelAdmin.html")
      ) {
        const navbarSearch = document.querySelector(".navbar-search");
        if (navbarSearch) navbarSearch.style.display = "none";

        const navbarButtons = document.querySelector(".navbar-buttons");
        if (navbarButtons) navbarButtons.style.display = "none";
      }

      // -------------------------
      // Atualiza navbar se o cliente estiver logado
      // -------------------------
      const clienteName = localStorage.getItem("clienteName");
      const clienteId = localStorage.getItem("clienteId");
      const cartIcon = document.querySelector(".cart-icon.fas.fa-shopping-cart");

      const perfilLink = document.querySelector(".user-box > a"); // <a href="perfilCliente.html">
      const perfilIcon = perfilLink?.querySelector(".fa-circle-user");
      const userTextDiv = document.querySelector(".user-box .user-text");

      if (clienteName && clienteId && perfilIcon && userTextDiv && perfilLink) {
        // Exibe ícone de perfil e carrinho
        perfilIcon.style.display = "inline-block";
        cartIcon.style.display = "inline-block";

        // Substitui "Entre / Cadastre-se" pelo nome e link de logout
        userTextDiv.innerHTML = `
          <p class="welcome">Olá, bem-vindo(a)!</p>
          <p class="welcome" style="font-size:13px; display: flex; align-items: center; gap: 10px;">
              ${clienteName} 
              <a href="index.html" id="logout-link" class="link" style="font-size:12px; color: #007bff;">Sair</a>
          </p>
        `;

        // Evento de logout
        document.getElementById("logout-link").addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("clienteName");
          localStorage.removeItem("clienteId");
          window.location.href = "index.html";
        });

        // Carrega itens do carrinho
        carregarCarrinhoSidebar(clienteId);

      } else if (perfilIcon) {
        // Oculta ícone se não há cliente logado
        perfilIcon.style.display = "none";
        cartIcon.style.display = "none";
      }
    });
});

// -------------------------
// Funções do carrinho sidebar
// -------------------------
function carregarCarrinhoSidebar(clienteId) {
  fetch("carrinhoCompra.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("cartSidebar").innerHTML = html;
      if (clienteId) {
        carregarCarrinhoDoCliente(clienteId);
      }
    });
}

function openCart() {
  document.getElementById("cartSidebar").classList.add("active");
}

function closeCart() {
  document.getElementById("cartSidebar").classList.remove("active");
}

function toggleExpired() {
  const expiredSection = document.getElementById("cart-expired-items");
  const arrow = document.getElementById("expired-arrow");

  if (expiredSection.style.display === "none") {
    expiredSection.style.display = "block";
    arrow.classList.add("open");
  } else {
    expiredSection.style.display = "none";
    arrow.classList.remove("open");
  }
}

function expireItem(itemElement) {
  const activeContainer = document.getElementById("cart-active-items");
  const expiredContainer = document.getElementById("cart-expired-items");

  activeContainer.removeChild(itemElement);
  itemElement.classList.add("expired");

  const actions = itemElement.querySelector(".item-actions");
  actions.innerHTML = `
      <button onclick="reactivateItem(this)" class="btn-adicionar-novamente">Adicionar novamente ao carrinho</button>
  `;

  expiredContainer.appendChild(itemElement);
  document.querySelector(".checkout-btn").disabled = true;
}

function reactivateItem(button) {
  const itemElement = button.closest(".cart-item");
  const activeContainer = document.getElementById("cart-active-items");
  const expiredContainer = document.getElementById("cart-expired-items");

  expiredContainer.removeChild(itemElement);
  itemElement.classList.remove("expired");

  itemElement.querySelector(".item-actions").innerHTML = `
      <input type="number" value="1" min="1">
      <button class="trash-btn" onclick="removeItem(this)">
          <i class="fa-solid fa-trash-can"></i>
      </button>
  `;

  activeContainer.appendChild(itemElement);

  if (expiredContainer.children.length === 0) {
    document.querySelector(".checkout-btn").disabled = false;
  }
}
