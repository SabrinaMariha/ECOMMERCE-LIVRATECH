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

let books = [];
const booksPerPage = 20;
let currentPage = 1;

async function fetchBooks() {
  try{
    const response = await fetch("http://localhost:8080/produtos");
    if (!response.ok) {
      throw new Error("Erro ao buscar livros");
    }
    const data = await response.json();
    books = data;
    renderBooks(currentPage);
    renderPagination();
  }catch(error){
    console.error("Erro ao buscar livros:", error);
    document.getElementById("books-container").innerHTML = "<p>Erro ao carregar livros. Tente novamente mais tarde.</p>";
  }
}

function renderBooks(page) {
  const start = (page - 1) * booksPerPage;
  const end = start + booksPerPage;
  const currentBooks = books.slice(start, end);

  const container = document.getElementById("books-container");
  container.innerHTML = "";

  currentBooks.forEach((book) => {
    const card = document.createElement("div");
    card.classList.add("book-card");

    card.innerHTML = `
      <img src="${book.imagemUrl}" alt="${book.nome}">
      <div class="book-info">
        <p class = "book-name"><strong>${book.nome}</strong></p>
        <p>${book.autor}</p>
        <p class="preco-card">R$ ${book.preco.toFixed(2)}</p>
        <button class="comprar-btn">Comprar</button>
      </div>
    `;

    // Adiciona evento no card inteiro
    card.addEventListener('click', () => {
      window.location.href = `./detalhesProduto.html?id=${book.id}`;
    });

    // Clica na imagem ou botão abre detalhes
    card.querySelector('.comprar-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `./detalhesProduto.html?id=${book.id}`;
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
fetchBooks();
