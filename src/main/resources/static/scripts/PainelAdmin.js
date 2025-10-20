// ======================= CONTROLE DE ABAS =======================
const buttons = document.querySelectorAll(".menu-btn");
const sections = document.querySelectorAll(".section");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    sections.forEach((sec) => sec.classList.remove("active"));

    btn.classList.add("active");
    const section = document.getElementById(btn.dataset.section);
    if (section) section.classList.add("active"); // Fechar todos os modais que usam a classe 'active' ou 'modal-filtro'

    document
      .querySelectorAll(".modal.active, .modal-filtro.active")
      .forEach((modal) => modal.classList.remove("active")); // Fechar modais que usam style.display

    ["inativar-modal", "modalEditarEstoque", "modalDetalhesCliente"].forEach(
      (id) => {
        // Inclui modalDetalhesCliente
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "none";
      }
    );
  });
});

// ======================= CLIENTES (FETCH) =======================
const tbodyClientes = document.getElementById("clientes-tbody");
const modalHistorico = document.getElementById("modalHistorico");
const btnFecharHistorico = document.getElementById("btnFecharHistorico");
const tbodyHistorico = document.querySelector("#tabelaHistorico tbody");

const inativarModal = document.getElementById("inativar-modal");
const btnFecharInativar = inativarModal?.querySelector(".close-btn");
const btnNao = inativarModal?.querySelector(".btn-nao");
const btnSim = inativarModal?.querySelector(".btn-sim");

const modalDetalhes = document.getElementById("modalDetalhesCliente");
const btnFecharDetalhes = document.getElementById("btnFecharDetalhes");
// const btnFecharDetalhesBtn = document.getElementById("btnFecharDetalhesBtn"); // REMOVIDO
const detalhesClienteContent = document.getElementById(
  "detalhesClienteContent"
);

let clientesCarregados = [];
let clienteParaInativar = null;

async function carregarClientes() {
  tbodyClientes.innerHTML =
    '<tr><td colspan="8" style="text-align:center;">Carregando clientes...</td></tr>'; // Colspan 8 ok

  try {
    const res = await fetch("/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error("Erro ao carregar clientes");

    const data = await res.json();
    clientesCarregados = data.clientes || [];
    clientesCarregados.sort((a, b) => a.id - b.id);
    renderizarClientes(clientesCarregados);
  } catch (err) {
    tbodyClientes.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">${err.message}</td></tr>`; // Colspan 8 ok
  }
}

function renderizarClientes(clientes) {
  tbodyClientes.innerHTML = "";

  if (clientes.length === 0) {
    tbodyClientes.innerHTML =
      '<tr><td colspan="8" style="text-align:center;">Nenhum cliente encontrado.</td></tr>'; // Colspan 8 ok
    return;
  }

  clientes.forEach((c) => {
    const tr = document.createElement("tr");
    tr.dataset.clienteId = c.id;
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nome || "-"}</td>
      <td>${
        c.dataNascimento
          ? new Date(c.dataNascimento).toLocaleDateString("pt-BR")
          : "-"
      }</td>
      <td>${c.cpf || "-"}</td>
      <td>${
        c.telefones && c.telefones.length > 0
          ? `(${c.telefones[0].ddd}) ${c.telefones[0].numero}`
          : "-"
      }</td>
      <td>${c.email || "-"}</td>
      <td>${c.status || "-"}</td>
      <td>
        <button class="btn-acao-tabela btn-detalhes" data-id="${
          c.id
        }"><i class="fa-solid fa-circle-info"></i></button>
        <button class="btn-acao-tabela btn-historico" data-id="${
          c.id
        }"><i class="fa-solid fa-clock-rotate-left"></i></button>
        <button class="btn-acao-tabela btn-inativar" data-id="${
          c.id
        }"><i class="fa-solid fa-ban"></i></button>
      </td>
    `;
    tbodyClientes.appendChild(tr);

    // --- Listeners ---
    const btnDetalhes = tr.querySelector(".btn-detalhes");
    if (btnDetalhes) {
      btnDetalhes.addEventListener("click", async (e) => {
        detalhesClienteContent.innerHTML =
          '<p style="text-align:center;">Carregando detalhes...</p>';
        modalDetalhes.style.display = "flex";
        modalDetalhes.classList.add("active");
        try {
          const clienteId = e.currentTarget.dataset.id;
          const res = await fetch(`/admin/cliente/${clienteId}`); // Corrigido
          if (!res.ok) throw new Error("Erro ao carregar detalhes do cliente");
          const data = await res.json();
          const telefones =
            data.telefones?.map((t) => `(${t.ddd}) ${t.numero}`).join(", ") ||
            "-";
          const enderecos =
            data.enderecos
              ?.map(
                (e) => `${e.logradouro}, ${e.numero} - ${e.cidade}/${e.estado}`
              )
              .join("<br>") || "-";
          const cartoes =
            data.cartoesCredito
              ?.map(
                (cc) =>
                  `**** **** **** ${cc.numeroCartao.slice(-4)} (${cc.bandeira})`
              )
              .join("<br>") || "-";
          detalhesClienteContent.innerHTML = `
                    <table class="detalhes-tabela">
                    <thead> <tr><th>ID</th><th>Nome</th><th>Gênero</th><th>Nascimento</th><th>CPF</th><th>Telefones</th><th>E-mail</th><th>Status</th><th>Endereços</th><th>Cartões</th></tr></thead>
                    <tbody><tr>
                        <td>${data.id}</td><td>${data.nome}</td><td>${
            data.genero || "-"
          }</td><td>${
            data.dataNascimento
              ? new Date(data.dataNascimento).toLocaleDateString("pt-BR")
              : "-"
          }</td><td>${data.cpf}</td>
                        <td>${telefones}</td><td>${data.email}</td><td>${
            data.status
          }</td><td>${enderecos}</td><td>${cartoes}</td>
                    </tr></tbody>
                    </table>`;
        } catch (err) {
          console.error("Erro ao buscar detalhes:", err);
          detalhesClienteContent.innerHTML = `<p style="color:red; text-align:center;">${err.message}</p>`;
        }
      });
    }

    const btnHistorico = tr.querySelector(".btn-historico");
    if (btnHistorico) {
      btnHistorico.addEventListener("click", async (e) => {
        const clienteId = e.currentTarget.dataset.id;
        tbodyHistorico.innerHTML =
          '<tr><td colspan="4" style="text-align:center;">Carregando histórico...</td></tr>';
        modalHistorico.classList.add("active");
        try {
          const res = await fetch(`/cliente/${clienteId}/pedidos`); // Correto
          if (!res.ok)
            throw new Error(`Erro ao buscar pedidos: ${res.statusText}`);
          const pedidos = await res.json();
          tbodyHistorico.innerHTML = "";
          if (pedidos.length === 0) {
            tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum pedido encontrado.</td></tr>`;
          } else {
            pedidos.forEach((pedido) => {
              const trHist = document.createElement("tr");
              const dataFormatada = new Date(pedido.data).toLocaleDateString(
                "pt-BR",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );
              const valorFormatado = pedido.valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });
              trHist.innerHTML = `<td>${
                pedido.id
              }</td><td>${dataFormatada}</td><td>${valorFormatado}</td><td>${
                pedido.status || "N/A"
              }</td>`;
              tbodyHistorico.appendChild(trHist);
            });
          }
        } catch (err) {
          console.error("Erro ao carregar histórico:", err);
          tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro: ${err.message}</td></tr>`;
        }
      });
    }

    const btnInativar = tr.querySelector(".btn-inativar");
    if (btnInativar) {
      btnInativar.addEventListener("click", (e) => {
        clienteParaInativar = e.currentTarget.dataset.id;
        inativarModal.style.display = "flex";
      });
    }
  });
}

carregarClientes();

// ======================= MODAIS CLIENTES =======================
btnFecharHistorico?.addEventListener("click", () =>
  modalHistorico.classList.remove("active")
);
modalHistorico?.addEventListener("click", (e) => {
  if (e.target === modalHistorico) modalHistorico.classList.remove("active");
});
btnFecharInativar?.addEventListener(
  "click",
  () => (inativarModal.style.display = "none")
);
btnNao?.addEventListener("click", () => (inativarModal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === inativarModal) inativarModal.style.display = "none";
});

btnSim?.addEventListener("click", async () => {
  if (!clienteParaInativar) return;
  try {
    const res = await fetch(`/admin/cliente/${clienteParaInativar}/inativar`, {
      method: "PATCH",
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(`Erro ao inativar cliente: ${errorMsg}`);
    }
    await carregarClientes();
    inativarModal.style.display = "none";
    clienteParaInativar = null;
    alert("Cliente inativado com sucesso!");
  } catch (err) {
    console.error("Erro ao inativar:", err);
    alert(err.message);
  }
});

btnFecharDetalhes?.addEventListener("click", () => {
  modalDetalhes.style.display = "none";
  modalDetalhes.classList.remove("active");
});
window.addEventListener("click", (e) => {
  if (e.target === modalDetalhes) {
    modalDetalhes.style.display = "none";
    modalDetalhes.classList.remove("active");
  }
});

// ======================= FILTROS (GENÉRICO E CLIENTES) =======================
function criarFiltro(
  btnAbrirId,
  painelId,
  btnFecharId,
  btnLimparId,
  formId,
  btnFiltrarId,
  funcaoFiltrar
) {
  const btnAbrir = document.getElementById(btnAbrirId);
  const painel = document.getElementById(painelId);
  const btnFechar = document.getElementById(btnFecharId);
  const btnLimpar = document.getElementById(btnLimparId);
  const form = document.getElementById(formId);
  const btnFiltrar = document.getElementById(btnFiltrarId);

  btnAbrir?.addEventListener("click", () => painel?.classList.toggle("active"));
  btnFechar?.addEventListener("click", () =>
    painel?.classList.remove("active")
  );
  btnLimpar?.addEventListener("click", () => {
    form?.reset();
    // Se for o filtro de clientes, recarrega todos
    if (formId === "formFiltro") {
      carregarClientes();
    }
    // Adicionar lógica similar para outros filtros se necessário
  });
  btnFiltrar?.addEventListener("click", () => {
    if (form && funcaoFiltrar) {
      funcaoFiltrar(form);
    }
  });
}

async function filtrarClientes(form) {
  const filtros = {
    nome: form.nome.value || null,
    dataNascimento: form.dataNascimento.value || null,
    cpf: form.cpf.value || null,
    email: form.email.value || null,
  };
  Object.keys(filtros).forEach(
    (key) => filtros[key] === null && delete filtros[key]
  );
  tbodyClientes.innerHTML =
    '<tr><td colspan="8" style="text-align:center;">Filtrando...</td></tr>';
  try {
    const res = await fetch("/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filtros),
    });
    if (!res.ok) throw new Error("Erro ao filtrar clientes");
    const data = await res.json();
    const clientesFiltrados = data.clientes || [];
    clientesFiltrados.sort((a, b) => a.id - b.id);
    renderizarClientes(clientesFiltrados);
  } catch (err) {
    tbodyClientes.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">${err.message}</td></tr>`;
  }
}

criarFiltro(
  "btnAbrirFiltro",
  "painelFiltro",
  "btnFecharFiltro",
  "btnLimpar",
  "formFiltro",
  "btnFiltrarClientes",
  filtrarClientes
);

// ======================= ESTOQUE =======================
const tbodyEstoque = document.getElementById("estoque-tbody");
const modalEditarEstoque = document.getElementById("modalEditarEstoque");
const formEditarEstoque = document.getElementById("formEditarEstoque");
const btnFecharModalEstoque = document.getElementById("btnFecharModalEstoque");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");
let produtoParaEditarId = null;

async function carregarEstoque() {
  if (!tbodyEstoque) return;
  tbodyEstoque.innerHTML =
    '<tr><td colspan="7" style="text-align:center;">Carregando estoque...</td></tr>';

  try {
    const res = await fetch("/produtos");
    if (!res.ok) throw new Error("Erro ao carregar estoque");
    const produtos = await res.json();

    tbodyEstoque.innerHTML = "";

    if (produtos.length === 0) {
      tbodyEstoque.innerHTML =
        '<tr><td colspan="7" style="text-align:center;">Nenhum produto encontrado.</td></tr>';
      return;
    }

    produtos.sort((a, b) => a.id - b.id);

    produtos.forEach((produto) => {
      const tr = document.createElement("tr");
      tr.dataset.produtoId = produto.id;
      tr.innerHTML = `
                <td>${produto.id}</td>          
                <td>${produto.nome || "-"}</td> 
                <td>${produto.autor || "-"}</td> 
                <td>${
        produto.preco
          ? produto.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "-"
      }</td> 
                <td>${produto.estoque !== null ? produto.estoque : "-"}</td> 
                <td>Ativo</td>
                <td>
                    <button class="btn-acao-tabela btnEditarEstoque" data-id="${
        produto.id
      }"><i class='bx bx-edit'></i></button>
                </td>
            `;
      tbodyEstoque.appendChild(tr); // Listener botão Editar

      const btnEditar = tr.querySelector(".btnEditarEstoque");
      if (btnEditar) {
        btnEditar.addEventListener("click", (e) => {
          // Removido async desnecessário
          produtoParaEditarId = e.currentTarget.dataset.id;
          abrirModalEditarEstoque(produtoParaEditarId);
        });
      }
    });
  } catch (err) {
    console.error("Erro ao carregar estoque:", err);
    tbodyEstoque.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${err.message}</td></tr>`;
  }
}

async function abrirModalEditarEstoque(produtoId) {
  if (!formEditarEstoque || !modalEditarEstoque) return;
  formEditarEstoque.reset();
  formEditarEstoque.querySelector("#editId").value = ""; // Limpa ID oculto

  try {
    const res = await fetch(`/produtos/${produtoId}`);
    if (!res.ok) throw new Error("Produto não encontrado para edição.");
    const produto = await res.json();

    formEditarEstoque.querySelector("#editId").value = produto.id;
    formEditarEstoque.querySelector("#editNome").value = produto.nome || "";
    formEditarEstoque.querySelector("#editAutor").value = produto.autor || "";
    formEditarEstoque.querySelector("#editDescricao").value =
      produto.descricao || "";
    formEditarEstoque.querySelector("#editDescDetalhada").value =
      produto.descDetalhada || "";
    formEditarEstoque.querySelector("#editPreco").value =
      produto.preco !== null ? produto.preco : "";
    formEditarEstoque.querySelector("#editEstoque").value =
      produto.estoque !== null ? produto.estoque : "";
    formEditarEstoque.querySelector("#editImagemUrl").value =
      produto.imagemUrl || "";

    modalEditarEstoque.style.display = "flex"; // Abre o modal
  } catch (err) {
    console.error("Erro ao buscar produto para edição:", err);
    alert(`Erro ao carregar dados do produto: ${err.message}`);
  }
}

if (formEditarEstoque) {
  formEditarEstoque.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Pega ID do campo oculto, mais seguro que variável global
    const idDoProduto = formEditarEstoque.querySelector("#editId").value;
    if (!idDoProduto) {
      alert("ID do produto não encontrado no formulário.");
      return;
    }

    const novaQuantidadeInput = formEditarEstoque.querySelector("#editEstoque");
    if (!novaQuantidadeInput || novaQuantidadeInput.value === "") {
      alert("Por favor, insira uma quantidade válida.");
      return;
    }
    const novaQuantidade = parseInt(novaQuantidadeInput.value);
    if (isNaN(novaQuantidade) || novaQuantidade < 0) {
      alert("A quantidade deve ser um número não negativo.");
      return;
    }

    try {
      const res = await fetch(`/produtos/${idDoProduto}/estoque`, {
        // Usa ID do form
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: novaQuantidade }),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(`Erro ao atualizar estoque: ${errorMsg}`);
      }

      alert("Estoque atualizado com sucesso!");
      modalEditarEstoque.style.display = "none";
      produtoParaEditarId = null; // Limpa variável global se ainda usar
      await carregarEstoque(); // Recarrega a tabela
    } catch (err) {
      console.error("Erro ao salvar estoque:", err);
      alert(`Erro ao salvar: ${err.message}`);
    }
  });
}

// Listeners Modais Estoque
btnFecharModalEstoque?.addEventListener("click", () => {
  modalEditarEstoque.style.display = "none";
  produtoParaEditarId = null;
});
btnCancelarEditar?.addEventListener("click", () => {
  modalEditarEstoque.style.display = "none";
  produtoParaEditarId = null;
});
window.addEventListener("click", (e) => {
  if (e.target === modalEditarEstoque) {
    modalEditarEstoque.style.display = "none";
    produtoParaEditarId = null;
  }
});

// Cria Filtro Estoque
criarFiltro(
  "btnAbrirFiltroEstoque",
  "painelFiltroEstoque",
  "btnFecharFiltroEstoque",
  "btnLimparEstoque",
  "formFiltroEstoque",
  null,
  null
);

carregarEstoque(); // Carrega estoque ao iniciar

// ======================= VENDAS (Exemplo) =======================
const vendas = [
  {
    idVenda: 101,
    cliente: "Ana Maria",
    data: "2025-08-01",
    total: 150.5,
    status: "Concluída",
  },
  {
    idVenda: 102,
    cliente: "Bruno Silva",
    data: "2025-08-05",
    total: 320.0,
    status: "Pendente",
  },
  {
    idVenda: 103,
    cliente: "Carla Souza",
    data: "2025-08-10",
    total: 75.25,
    status: "Cancelada",
  },
];
const tbodyVendas = document.getElementById("vendas-tbody");
const modalStatusVenda = document.getElementById("modalStatusVenda");
const btnFecharStatusVenda = document.getElementById("btnFecharStatusVenda");
const btnCancelarStatusVenda = document.getElementById(
  "btnCancelarStatusVenda"
);

if (tbodyVendas) {
  // Verifica se tbodyVendas existe antes de usar
  tbodyVendas.innerHTML = ""; // Limpa
  vendas.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.idVenda}</td><td>${item.cliente}</td><td>${
      item.data
    }</td><td>R$ ${item.total.toFixed(2)}</td><td>${
      item.status
    }</td><td><button class="btn-acao-tabela btnAlterarStatusVenda"><i class='bx bx-edit'></i></button></td>`;
    tbodyVendas.appendChild(tr);
  });
}

document.querySelectorAll(".btnAlterarStatusVenda").forEach((btn) => {
  btn.addEventListener("click", () => modalStatusVenda.classList.add("active"));
});
btnFecharStatusVenda?.addEventListener("click", () =>
  modalStatusVenda.classList.remove("active")
);
btnCancelarStatusVenda?.addEventListener("click", () =>
  modalStatusVenda.classList.remove("active")
);
window.addEventListener("click", (e) => {
  if (e.target === modalStatusVenda)
    modalStatusVenda.classList.remove("active");
});

criarFiltro(
  "btnAbrirFiltroVendas",
  "painelFiltroVendas",
  "btnFecharFiltroVendas",
  "btnLimparVendas",
  "formFiltroVendas",
  null,
  null
);

// ======================= TROCAS/DEVOLUÇÕES (Exemplo) =======================
const trocas = [
  {
    idPedido: 1,
    cliente: "Ana Maria",
    produto: "Livro A",
    dataSolicitacao: "2025-08-15",
    motivo: "Defeito na impressão",
    status: "Pendente",
  },
  {
    idPedido: 2,
    cliente: "Carlos Souza",
    produto: "Livro B",
    dataSolicitacao: "2025-08-18",
    motivo: "Troca por outro título",
    status: "Aprovada",
  },
  {
    idPedido: 3,
    cliente: "Fernanda Lima",
    produto: "Livro C",
    dataSolicitacao: "2025-08-20",
    motivo: "Devolução por arrependimento",
    status: "Recusada",
  },
];
const tbodyTrocas = document.getElementById("trocas-tbody");
const modalStatusTroca = document.getElementById("modalStatusTroca");
const btnFecharStatus = document.getElementById("btnFecharStatus");
const btnCancelarStatus = document.getElementById("btnCancelarStatus");

if (tbodyTrocas) {
  // Verifica se tbodyTrocas existe
  tbodyTrocas.innerHTML = ""; // Limpa
  trocas.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.idPedido}</td><td>${item.cliente}</td><td>${item.produto}</td><td>${item.dataSolicitacao}</td><td>${item.motivo}</td><td>${item.status}</td><td><button class="btn-acao-tabela btnAlterarStatusTroca"><i class='bx bx-edit'></i></button></td>`;
    tbodyTrocas.appendChild(tr);
  });
}

document.querySelectorAll(".btnAlterarStatusTroca").forEach((btn) => {
  btn.addEventListener("click", () => modalStatusTroca.classList.add("active"));
});
btnFecharStatus?.addEventListener("click", () =>
  modalStatusTroca.classList.remove("active")
);
btnCancelarStatus?.addEventListener("click", () =>
  modalStatusTroca.classList.remove("active")
);
window.addEventListener("click", (e) => {
  if (e.target === modalStatusTroca)
    modalStatusTroca.classList.remove("active");
});

criarFiltro(
  "btnFiltroTrocas",
  "painelFiltroTrocas",
  "btnFecharFiltroTrocas",
  "btnLimparTrocas",
  "formFiltroTrocas",
  null,
  null
);

// ======================= DETALHES CLIENTE =======================
btnFecharDetalhes?.addEventListener(
  "click",
  () => (modalDetalhes.style.display = "none")
);
// btnFecharDetalhesBtn?.addEventListener(
//   "click",
//   () => (modalDetalhes.style.display = "none")
// );
window.addEventListener("click", (e) => {
  if (e.target === modalDetalhes) modalDetalhes.style.display = "none";
});
