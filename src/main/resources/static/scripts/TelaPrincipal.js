// ----------------------
// Carrossel
// ----------------------

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

setInterval(() => showSlide(currentIndex + 1), 7000);
showSlide(0);

// ----------------------
// Livros
// ----------------------

let books = [];
const booksPerPage = 20;
let currentPage = 1;

async function fetchBooks(params = "") {
  try {
    const response = await fetch(`http://localhost:8080/produtos${params}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar livros");
    }

    const data = await response.json();
    books = data;
    currentPage = 1;
    renderBooks(currentPage);
    renderPagination();
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    document.getElementById("books-container").innerHTML =
      "<p>Erro ao carregar livros. Tente novamente mais tarde.</p>";
  }
}

function renderBooks(page) {
  const start = (page - 1) * booksPerPage;
  const end = start + booksPerPage;
  const currentBooks = books.slice(start, end);
  const container = document.getElementById("books-container");

  container.innerHTML = "";

  if (currentBooks.length === 0) {
    container.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  currentBooks.forEach((book) => {
    const card = document.createElement("div");
    card.classList.add("book-card");

    card.innerHTML = `
      <img src="${book.imagemUrl}" alt="${book.nome}">
      <div class="book-info">
        <p class="book-name"><strong>${book.nome}</strong></p>
        <p>${book.autor}</p>
        <p class="preco-card">R$ ${book.preco.toFixed(2)}</p>
        <button class="comprar-btn">Comprar</button>
      </div>
    `;

    // Clique no card → detalhes
    card.addEventListener("click", () => {
      window.location.href = `./detalhesProduto.html?id=${book.id}`;
    });

    // Clique no botão → compra direta
    card.querySelector(".comprar-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.removeItem("compraDireta");
      localStorage.removeItem("itensCarrinhoTemp");
      localStorage.setItem(
        "compraDireta",
        JSON.stringify({ produtoId: book.id, quantidade: 1 })
      );
      window.location.href = "./finalizarCompra.html";
    });

    container.appendChild(card);
  });
}

function renderPagination() {
  const totalPages = Math.ceil(books.length / booksPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prev = document.createElement("button");
  prev.textContent = "Anterior";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => changePage(currentPage - 1));
  pagination.appendChild(prev);

  Array.from({ length: totalPages }, (_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    if (currentPage === i + 1) btn.classList.add("active");
    btn.addEventListener("click", () => changePage(i + 1));
    pagination.appendChild(btn);
  });

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

// ----------------------
// Filtros (nome, autor, preço, categoria)
// ----------------------

async function filterBooks() {
  const params = new URLSearchParams();

  // Nome
  const nome = document.getElementById("book-name").value.trim();
  if (nome) params.append("nome", nome);

  // Autor
  const autor = document.getElementById("author").value.trim();
  if (autor) params.append("autor", autor);

  // Categorias
  const categoriasSelecionadas = Array.from(
    document.querySelectorAll('.filter-group:nth-of-type(2) input[type="checkbox"]:checked')
  ).map((c) => c.value);

  categoriasSelecionadas.forEach((cat) => params.append("categorias", cat));

  // Faixa de preço
  const precos = document.querySelectorAll(".filter-price input");
  const precoMin = precos[0].value;
  const precoMax = precos[1].value;
  if (precoMin) params.append("precoMin", precoMin);
  if (precoMax) params.append("precoMax", precoMax);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  await fetchBooks(queryString);
}

// ----------------------
// Inicialização
// ----------------------

fetchBooks();

// Aplicar filtro apenas quando clicar no botão "Filtrar"
document.querySelector(".filter-btn").addEventListener("click", async () => {
  await filterBooks();
});