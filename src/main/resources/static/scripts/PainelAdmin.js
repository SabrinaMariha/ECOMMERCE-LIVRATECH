// ======================= CONTROLE DE ABAS =======================
const buttons = document.querySelectorAll(".menu-btn");
const sections = document.querySelectorAll(".section");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    sections.forEach((sec) => sec.classList.remove("active"));

    btn.classList.add("active");
    const section = document.getElementById(btn.dataset.section);
    if (section) section.classList.add("active");

    // Fechar todos os modais que usam a classe 'active'
    document
      .querySelectorAll(".modal.active")
      .forEach((modal) => modal.classList.remove("active"));

    // Fechar modais que usam style.display
    ["inativar-modal", "modalEditarEstoque"].forEach((id) => {
      const modal = document.getElementById(id);
      if (modal) modal.style.display = "none";
    });
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
const btnFecharDetalhesBtn = document.getElementById("btnFecharDetalhesBtn");
const detalhesClienteContent = document.getElementById(
  "detalhesClienteContent"
);

let clientesCarregados = []; // Para armazenar os clientes e usar no filtro
let clienteParaInativar = null; // variável global

async function carregarClientes() {
  tbodyClientes.innerHTML =
    '<tr><td colspan="8" style="text-align:center;">Carregando clientes...</td></tr>';

  try {
    const res = await fetch("/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error("Erro ao carregar clientes");

    const data = await res.json();
    clientesCarregados = data.clientes || [];

    // Ordenar por ID antes de renderizar
    clientesCarregados.sort((a, b) => a.id - b.id);

    renderizarClientes(clientesCarregados);
  } catch (err) {
    tbodyClientes.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">${err.message}</td></tr>`;
  }
}

function renderizarClientes(clientes) {
  tbodyClientes.innerHTML = ""; // Limpa a tabela

  if (clientes.length === 0) {
    // Ajustado colspan para 8
    tbodyClientes.innerHTML =
      '<tr><td colspan="8" style="text-align:center;">Nenhum cliente encontrado.</td></tr>';
    return;
  }

  clientes.forEach((c) => {
    const tr = document.createElement("tr");
    tr.dataset.clienteId = c.id; // Mantém o dataset se precisar
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

    // --- Adiciona os event listeners novamente ---
    // Botão detalhes (código existente)
    const btnDetalhes = tr.querySelector(".btn-detalhes");
    // ... (seu código existente para o event listener de detalhes) ...
    if (btnDetalhes) {
      btnDetalhes.addEventListener("click", async (e) => {
        // Seu código para buscar e exibir detalhes aqui...
        try {
          const clienteId = e.currentTarget.dataset.id;
          const res = await fetch(`admin/cliente/${clienteId}`);
          if (!res.ok) throw new Error("Erro ao carregar cliente");
          const data = await res.json();

          // ... (código para formatar telefones, endereços, cartões) ...
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
                <tr><th>ID</th><th>Nome</th><th>Gênero</th><th>Nascimento</th><th>CPF</th><th>Telefones</th><th>E-mail</th><th>Status</th><th>Endereços</th><th>Cartões</th></tr>
                <tr>
                    <td>${data.id}</td>
                    <td>${data.nome}</td>
                    <td>${data.genero || "-"}</td>
                    <td>${
                      data.dataNascimento
                        ? new Date(data.dataNascimento).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"
                    }</td>
                    <td>${data.cpf}</td>
                    <td>${telefones}</td>
                    <td>${data.email}</td>
                    <td>${data.status}</td>
                    <td>${enderecos}</td>
                    <td>${cartoes}</td>
                </tr>
              </table>
            `;
          modalDetalhes.style.display = "flex";
          modalDetalhes.classList.add("active");
        } catch (err) {
          detalhesClienteContent.innerHTML = `<p style="color:red;">${err.message}</p>`;
          modalDetalhes.classList.add("active");
          modalDetalhes.style.display = "flex";
        }
      });
    }

    // Botão histórico (código modificado no passo 1)
    const btnHistorico = tr.querySelector(".btn-historico");
    // ... (seu código modificado para o event listener de histórico) ...
    if (btnHistorico) {
      btnHistorico.addEventListener("click", async (e) => {
        const clienteId = e.currentTarget.dataset.id;
        tbodyHistorico.innerHTML =
          '<tr><td colspan="4" style="text-align:center;">Carregando histórico...</td></tr>';
        modalHistorico.classList.add("active");

        try {
          const res = await fetch(`/cliente/${clienteId}/pedidos`);
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
                "pt-BR"
              );
              const valorFormatado = pedido.valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });
              trHist.innerHTML = `
                            <td>${pedido.id}</td>
                            <td>${dataFormatada}</td>
                            <td>${valorFormatado}</td>
                            <td>${pedido.status || "N/A"}</td>
                        `;
              tbodyHistorico.appendChild(trHist);
            });
          }
        } catch (err) {
          console.error("Erro ao carregar histórico:", err);
          tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro: ${err.message}</td></tr>`;
        }
      });
    }

    // Botão inativar (código existente)
    const btnInativar = tr.querySelector(".btn-inativar");
    // ... (seu código existente para o event listener de inativar) ...
    if (btnInativar) {
      btnInativar.addEventListener("click", (e) => {
        clienteParaInativar = e.currentTarget.dataset.id;
        inativarModal.style.display = "flex";
      });
    }
  }); // Fim do forEach
} // Fim da função renderizarClientes

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
btnSim?.addEventListener("click", () => (inativarModal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === inativarModal) inativarModal.style.display = "none";
});

// botão "sim" (inativar)
btnSim?.addEventListener("click", async () => {
  if (!clienteParaInativar) return;
  try {
    const res = await fetch(`/admin/cliente/${clienteParaInativar}/inativar`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Erro ao inativar cliente");
    await carregarClientes();
    inativarModal.style.display = "none";
    clienteParaInativar = null;
  } catch (err) {
    alert(err.message);
  }
});

// ======================= FILTROS =======================
// function criarFiltro(btnAbrir, painel, btnFechar, btnLimpar, formId) {
//   btnAbrir?.addEventListener("click", () => painel?.classList.toggle("active"));
//   btnFechar?.addEventListener("click", () =>
//     painel?.classList.remove("active")
//   );
//   btnLimpar?.addEventListener("click", () =>
//     document.getElementById(formId)?.reset()
//   );
// }

document.getElementById("btnFiltrarClientes")?.addEventListener("click", () => {
  const form = document.getElementById("formFiltro");
  const filtros = {
    nome: form.nome.value.toLowerCase(),
    dataNascimento: form.dataNascimento.value,
    cpf: form.cpf.value.toLowerCase(),
    genero: form.genero.value.toLowerCase(),
    telefone: form.telefone.value.toLowerCase(),
    email: form.email.value.toLowerCase(),
  };

  const clientesFiltrados = clientesCarregados.filter((c) => {
    const telefone = c.telefones.length
      ? c.telefones[0].ddd + " " + c.telefones[0].numero
      : "";
    return (
      (!filtros.nome || c.nome.toLowerCase().includes(filtros.nome)) &&
      (!filtros.dataNascimento ||
        c.dataNascimento === filtros.dataNascimento) &&
      (!filtros.cpf || c.cpf.toLowerCase().includes(filtros.cpf)) &&
      (!filtros.genero ||
        (c.genero && c.genero.toLowerCase().includes(filtros.genero))) &&
      (!filtros.telefone ||
        telefone.toLowerCase().includes(filtros.telefone)) &&
      (!filtros.email || c.email.toLowerCase().includes(filtros.email))
    );
  });

  renderizarClientes(clientesFiltrados);
});

// criarFiltro(
//   document.getElementById("btnAbrirFiltro"),
//   document.getElementById("painelFiltro"),
//   document.getElementById("btnFecharFiltro"),
//   document.getElementById("btnLimpar"),
//   "formFiltro"
// );

// ======================= ESTOQUE =======================
const tbodyEstoque = document.getElementById("estoque-tbody");
const modalEditarEstoque = document.getElementById("modalEditarEstoque");
const formEditarEstoque = document.getElementById("formEditarEstoque"); // Pegar o form
const btnFecharModalEstoque = document.getElementById("btnFecharModalEstoque");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");
let produtoParaEditarId = null; // Para guardar o ID do produto sendo editado

// Função para buscar e renderizar produtos no estoque
async function carregarEstoque() {
    if (!tbodyEstoque) return;
    tbodyEstoque.innerHTML = '<tr><td colspan="7" style="text-align:center;">Carregando estoque...</td></tr>'; // Colspan 8

    try {
        const res = await fetch("/produtos"); // Chama GET /produtos
        if (!res.ok) throw new Error("Erro ao carregar estoque");
        const produtos = await res.json(); // Lista de objetos Produto

        tbodyEstoque.innerHTML = ""; // Limpa a tabela

        if (produtos.length === 0) {
            tbodyEstoque.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum produto encontrado.</td></tr>';
            return;
        }

        // Ordenar por ID (opcional, mas consistente com clientes)
        produtos.sort((a, b) => a.id - b.id);

        produtos.forEach((produto) => {
            const tr = document.createElement("tr");
            tr.dataset.produtoId = produto.id; // Adiciona dataset para fácil acesso
            tr.innerHTML = `
                <td>${produto.id}</td>          
                <td>${produto.nome || '-'}</td> 
                <td>${produto.autor || '-'}</td>
                <td>${produto.preco ? produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                <td>${produto.estoque !== null ? produto.estoque : '-'}</td>
                <td>Ativo</td>
                <td>
                    <button class="btn-acao-tabela btnEditarEstoque" data-id="${produto.id}"><i class='bx bx-edit'></i></button>
                </td>
            `;
            tbodyEstoque.appendChild(tr);

            // Adiciona listener ao botão Editar desta linha
            const btnEditar = tr.querySelector(".btnEditarEstoque");
            if (btnEditar) {
                btnEditar.addEventListener("click", async (e) => {
                    produtoParaEditarId = e.currentTarget.dataset.id; // Guarda o ID
                    abrirModalEditarEstoque(produtoParaEditarId); // Chama função para buscar dados e abrir modal
                });
            }
        });

    } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        tbodyEstoque.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${err.message}</td></tr>`;
    }
}

// Função para buscar dados do produto e preencher o modal
async function abrirModalEditarEstoque(produtoId) {
    if (!formEditarEstoque || !modalEditarEstoque) return;

    formEditarEstoque.reset(); // Limpa o formulário

    try {
        const res = await fetch(`/produtos/${produtoId}`); // Chama GET /produtos/{id}
        if (!res.ok) throw new Error('Produto não encontrado para edição.');
        const produto = await res.json();

        // Preenche o formulário no modal com os dados do produto
        formEditarEstoque.querySelector("#editId").value = produto.id; // Campo ID (somente leitura)
        formEditarEstoque.querySelector("#editNome").value = produto.nome || '';
        formEditarEstoque.querySelector("#editAutor").value = produto.autor || '';
        formEditarEstoque.querySelector("#editDescricao").value = produto.descricao || '';
        formEditarEstoque.querySelector("#editDescDetalhada").value = produto.descDetalhada || '';
        formEditarEstoque.querySelector("#editPreco").value = produto.preco !== null ? produto.preco : '';
        formEditarEstoque.querySelector("#editEstoque").value = produto.estoque !== null ? produto.estoque : '';
        formEditarEstoque.querySelector("#editImagemUrl").value = produto.imagemUrl || '';
        // Status não vem do backend, pode ser removido ou gerenciado de outra forma se necessário
        // formEditarEstoque.querySelector("#editStatus").value = "Ativo"; 

        modalEditarEstoque.style.display = "flex"; // Abre o modal

    } catch (err) {
        console.error("Erro ao buscar produto para edição:", err);
        alert(`Erro ao carregar dados do produto: ${err.message}`);
    }
}

// Listener para o submit do formulário de edição de estoque
if (formEditarEstoque) {
    formEditarEstoque.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário

        if (!produtoParaEditarId) {
            alert("Nenhum produto selecionado para edição.");
            return;
        }

        // Pega apenas a nova quantidade do formulário
        const novaQuantidadeInput = formEditarEstoque.querySelector("#editEstoque");
        
        if (!novaQuantidadeInput || novaQuantidadeInput.value === '') {
             alert("Por favor, insira uma quantidade válida.");
             return;
        }

        const novaQuantidade = parseInt(novaQuantidadeInput.value);

        if (isNaN(novaQuantidade) || novaQuantidade < 0) {
             alert("A quantidade deve ser um número não negativo.");
             return;
        }


        try {
            // Chama o endpoint PUT para atualizar APENAS o estoque
            const res = await fetch(`/produtos/${produtoParaEditarId}/estoque`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantidade: novaQuantidade }) // Envia o DTO esperado
            });

            if (!res.ok) {
                 const errorMsg = await res.text();
                 throw new Error(`Erro ao atualizar estoque: ${errorMsg}`);
            }

            // Se a atualização foi bem-sucedida
            alert("Estoque atualizado com sucesso!");
            modalEditarEstoque.style.display = "none"; // Fecha o modal
            produtoParaEditarId = null; // Limpa o ID guardado
            await carregarEstoque(); // Recarrega a tabela de estoque

        } catch (err) {
            console.error("Erro ao salvar estoque:", err);
            alert(`Erro ao salvar: ${err.message}`);
        }
    });
}


// Listeners Modais Estoque
btnFecharModalEstoque?.addEventListener("click", () => { modalEditarEstoque.style.display="none"; produtoParaEditarId = null; });
btnCancelarEditar?.addEventListener("click", () => { modalEditarEstoque.style.display="none"; produtoParaEditarId = null; });
window.addEventListener("click", (e) => { if(e.target === modalEditarEstoque) { modalEditarEstoque.style.display="none"; produtoParaEditarId = null; } });

// Cria Filtro Estoque (sem função de filtro real por enquanto)
// criarFiltro(
//   "btnAbrirFiltroEstoque",
//   "painelFiltroEstoque",
//   "btnFecharFiltroEstoque",
//   "btnLimparEstoque",
//   "formFiltroEstoque",
//   null, // ID do botão filtrar (se existir)
//   null // Função de filtro de estoque (a ser criada se necessário)
// );

// Carrega o estoque ao iniciar a página
carregarEstoque();

// ======================= VENDAS =======================
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

vendas.forEach((item) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.idVenda}</td>
    <td>${item.cliente}</td>
    <td>${item.data}</td>
    <td>R$ ${item.total.toFixed(2)}</td>
    <td>${item.status}</td>
    <td>
      <button class="btn-acao-tabela btnAlterarStatusVenda"><i class='bx bx-edit'></i></button>
    </td>
  `;
  tbodyVendas.appendChild(tr);
});

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

// ======================= TROCAS/DEVOLUÇÕES =======================
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

trocas.forEach((item) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.idPedido}</td>
    <td>${item.cliente}</td>
    <td>${item.produto}</td>
    <td>${item.dataSolicitacao}</td>
    <td>${item.motivo}</td>
    <td>${item.status}</td>
    <td>
      <button class="btn-acao-tabela btnAlterarStatusTroca"><i class='bx bx-edit'></i></button>
    </td>
  `;
  tbodyTrocas.appendChild(tr);
});

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

// ======================= DETALHES CLIENTE =======================
btnFecharDetalhes?.addEventListener(
  "click",
  () => (modalDetalhes.style.display = "none")
);
btnFecharDetalhesBtn?.addEventListener(
  "click",
  () => (modalDetalhes.style.display = "none")
);
window.addEventListener("click", (e) => {
  if (e.target === modalDetalhes) modalDetalhes.style.display = "none";
});
