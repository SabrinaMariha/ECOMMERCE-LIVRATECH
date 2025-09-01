// Carrosel
let currentIndex = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const slidesContainer = document.querySelector(".slides");

function showSlide(index) {
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;

  slidesContainer.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  currentIndex = index;
}

function currentSlide(index) {
  showSlide(index);
}

// Troca automática
setInterval(() => {
  showSlide(currentIndex + 1);
}, 7000);

// Inicializa carrosel
showSlide(0);

// Livros
const books = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: `Livro ${i + 1}`,
  autor: `Autor ${i + 1}`,
  price: (Math.random() * 100 + 20).toFixed(2),
  img: "https://m.media-amazon.com/images/I/71Vkg7GfPFL._SY385_.jpg"
}));

const booksPerPage = 20;
let currentPage = 1;

function renderBooks(page) {
  const start = (page - 1) * booksPerPage;
  const end = start + booksPerPage;
  const currentBooks = books.slice(start, end);

  const container = document.getElementById("books-container");
  container.innerHTML = ""; // limpa antes de renderizar

  currentBooks.forEach((book) => {
    const card = document.createElement("div");
    card.classList.add("book-card");

    card.innerHTML = `
      <img src="${book.img}" alt="${book.title}">
      <div class="book-info">
        <p><strong>${book.title}</strong></p>
        <p>${book.autor}</p>
        <p class="preco-card">R$ ${book.price}</p>
        <button class="comprar-btn">Comprar</button>
      </div>
    `;

    // Evento de clique no card (ou você pode deixar só no botão "Comprar")
    card.addEventListener("click", () => {
      // aqui você pode decidir: abrir modal, redirecionar ou trocar de página
     // window.location.href = `/E-COMMERCE_LIVRARIA/detalhesProduto.html`; // ?id=${book.id}
          window.location.href = './detalhesProduto.html'

    });

    container.appendChild(card);
  });
}

function renderPagination() {
  const totalPages = Math.ceil(books.length / booksPerPage);
  const pagination = document.getElementById("pagination");

  pagination.innerHTML = "";

  // Botão Anterior
  const prev = document.createElement("button");
  prev.textContent = "Anterior";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => changePage(currentPage - 1));
  pagination.appendChild(prev);

  // Botões numéricos
  Array.from({ length: totalPages }, (_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    if (currentPage === i + 1) btn.classList.add("active");
    btn.addEventListener("click", () => changePage(i + 1));
    pagination.appendChild(btn);
  });

  // Botão Próximo
  const next = document.createElement("button");
  next.textContent = "Próximo";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => changePage(currentPage + 1));
  pagination.appendChild(next);
}

function changePage(page) {
  currentPage = page;
  renderBooks(page);
  renderPagination();
}

// Inicialização dos card dos livros e paginação
renderBooks(currentPage);
renderPagination();
