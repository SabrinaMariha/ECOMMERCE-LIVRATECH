document.addEventListener("DOMContentLoaded", function () {
  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      const path = window.location.pathname;

      // verifica se a página é login ou cadastro
      if (
        path.includes("cadastroCliente.html") ||
        path.includes("adminConsulta.html") ||
        path.includes("painelAdmin.html")
      ) {
        document.querySelector(".navbar-search").style.display = "none";
        const navbarSearch = document.querySelector(".navbar-search");
        if (navbarSearch) {
          navbarSearch.style.display = "none";
        }
        const navbarButtons = document.querySelector(".navbar-buttons");
        if (navbarButtons) {
          navbarButtons.style.display = "none";
        }
      }
    });
});

function carregarCarrinhoSidebar() {
  fetch('carrinhoCompra.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('cartSidebar').innerHTML = html;
    });
}

// Chame essa função quando a página carregar
document.addEventListener('DOMContentLoaded', carregarCarrinhoSidebar);

function openCart() {
  document.getElementById("cartSidebar").classList.add("active");
}

function closeCart() {
  document.getElementById("cartSidebar").classList.remove("active");
}

function removeItem(button) {
  const item = button.closest(".cart-item");
  item.remove();
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
    // Remove do carrinho ativo
    document.getElementById("cart-active-items").removeChild(itemElement);

    // Marca como expirado
    itemElement.classList.add("expired");

    // Adiciona botão para reativar
    const actions = itemElement.querySelector(".item-actions");
    actions.innerHTML = `
        <button onclick="reactivateItem(this)" class="btn-adicionar-novamente">Adicionar novamente ao carrinho</button>
    `;

    // Joga na seção de expirados
    document.getElementById("cart-expired-items").appendChild(itemElement);

    // Desabilita checkout se houver expirados
    document.querySelector(".checkout-btn").disabled = true;
}

function reactivateItem(button) {
    const itemElement = button.closest(".cart-item");

    // Remove do expirado
    document.getElementById("cart-expired-items").removeChild(itemElement);

    // Remove classe de expirado
    itemElement.classList.remove("expired");

    // Restaura ações normais
    itemElement.querySelector(".item-actions").innerHTML = `
        <input type="number" value="1" min="1">
        <button class="trash-btn" onclick="removeItem(this)">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;

    // Coloca de volta no ativo
    document.getElementById("cart-active-items").appendChild(itemElement);

    // Habilita checkout novamente se não houver expirados
    if (document.getElementById("cart-expired-items").children.length === 1) {
        document.querySelector(".checkout-btn").disabled = false;
    }
}

// Exemplo: expira automaticamente o primeiro item em 20 segundos
setTimeout(() => {
    const firstItem = document.querySelector("#cart-active-items .cart-item");
    if (firstItem) {
        expireItem(firstItem);
    }
}, 20000);
