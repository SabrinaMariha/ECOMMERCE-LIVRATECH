// Arquivo: src/main/resources/static/scripts/PainelAdmin/PainelAdmin.js

import { carregarVendas, inicializarListenersVendas } from "./GerenciarVendas.js";
// ======================= CONTROLE DE ABAS =======================
const buttons = document.querySelectorAll(".menu-btn");
const sections = document.querySelectorAll(".section");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    sections.forEach((sec) => sec.classList.remove("active"));

    btn.classList.add("active");

    const sectionId = btn.dataset.section;
    const section = document.getElementById(sectionId);
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

    if (sectionId === 'vendas') {
        carregarVendas();
    }

    if (sectionId === 'trocas') {
        carregarTrocas();
    }
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

    clientesCarregados.sort((a, b) => a.id - b.id);
    renderizarClientes(clientesCarregados);
  } catch (err) {
    tbodyClientes.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">${err.message}</td></tr>`;
  }
}

function renderizarClientes(clientes) {
  tbodyClientes.innerHTML = "";

  if (clientes.length === 0) {
    tbodyClientes.innerHTML =
      '<tr><td colspan="8" style="text-align:center;">Nenhum cliente encontrado.</td></tr>';
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

    // --- Adiciona os event listeners novamente ---
    const btnDetalhes = tr.querySelector(".btn-detalhes");
    if (btnDetalhes) {
      btnDetalhes.addEventListener("click", async (e) => {
        try {
          const clienteId = e.currentTarget.dataset.id;
          const res = await fetch(`admin/cliente/${clienteId}`);
          if (!res.ok) throw new Error("Erro ao carregar cliente");
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

    const btnHistorico = tr.querySelector(".btn-historico");
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
btnSim?.addEventListener("click", () => (inativarModal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === inativarModal) inativarModal.style.display = "none";
});

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

// ======================= ESTOQUE =======================
const tbodyEstoque = document.getElementById("estoque-tbody");
const modalEditarEstoque = document.getElementById("modalEditarEstoque");
const formEditarEstoque = document.getElementById("formEditarEstoque");
const btnFecharModalEstoque = document.getElementById("btnFecharModalEstoque");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");
let produtoParaEditarId = null;

async function carregarEstoque() {
    if (!tbodyEstoque) return;
    tbodyEstoque.innerHTML = '<tr><td colspan="7" style="text-align:center;">Carregando estoque...</td></tr>';

    try {
        const res = await fetch("/produtos");
        if (!res.ok) throw new Error("Erro ao carregar estoque");
        const produtos = await res.json();

        tbodyEstoque.innerHTML = "";

        if (produtos.length === 0) {
            tbodyEstoque.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum produto encontrado.</td></tr>';
            return;
        }

        produtos.sort((a, b) => a.id - b.id);

        produtos.forEach((produto) => {
            const tr = document.createElement("tr");
            tr.dataset.produtoId = produto.id;
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

            const btnEditar = tr.querySelector(".btnEditarEstoque");
            if (btnEditar) {
                btnEditar.addEventListener("click", async (e) => {
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

    try {
        const res = await fetch(`/produtos/${produtoId}`);
        if (!res.ok) throw new Error('Produto não encontrado para edição.');
        const produto = await res.json();

        formEditarEstoque.querySelector("#editId").value = produto.id;
        formEditarEstoque.querySelector("#editNome").value = produto.nome || '';
        formEditarEstoque.querySelector("#editAutor").value = produto.autor || '';
        formEditarEstoque.querySelector("#editDescricao").value = produto.descricao || '';
        formEditarEstoque.querySelector("#editDescDetalhada").value = produto.descDetalhada || '';
        formEditarEstoque.querySelector("#editPreco").value = produto.preco !== null ? produto.preco : '';
        formEditarEstoque.querySelector("#editEstoque").value = produto.estoque !== null ? produto.estoque : '';
        formEditarEstoque.querySelector("#editImagemUrl").value = produto.imagemUrl || '';

        modalEditarEstoque.style.display = "flex";

    } catch (err) {
        console.error("Erro ao buscar produto para edição:", err);
        alert(`Erro ao carregar dados do produto: ${err.message}`);
    }
}

if (formEditarEstoque) {
    formEditarEstoque.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!produtoParaEditarId) {
            alert("Nenhum produto selecionado para edição.");
            return;
        }

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
            const res = await fetch(`/produtos/${produtoParaEditarId}/estoque`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantidade: novaQuantidade })
            });

            if (!res.ok) {
                 const errorMsg = await res.text();
                 throw new Error(`Erro ao atualizar estoque: ${errorMsg}`);
            }

            alert("Estoque atualizado com sucesso!");
            modalEditarEstoque.style.display = "none";
            produtoParaEditarId = null;
            await carregarEstoque();

        } catch (err) {
            console.error("Erro ao salvar estoque:", err);
            alert(`Erro ao salvar: ${err.message}`);
        }
    });
}

btnFecharModalEstoque?.addEventListener("click", () => { modalEditarEstoque.style.display="none"; produtoParaEditarId = null; });
btnCancelarEditar?.addEventListener("click", () => { modalEditarEstoque.style.display="none"; produtoParaEditarId = null; });
window.addEventListener("click", (e) => { if(e.target === modalEditarEstoque) { modalEditarEstoque.style.display="none"; produtoParaEditarId = null; } });

carregarEstoque();


// ======================= VENDAS =======================
// (Lógica importada de GerenciarVendas.js)


// ======================= TROCAS/DEVOLUÇÕES (MODIFICADO) =======================
const tbodyTrocas = document.getElementById("trocas-tbody");
const modalStatusTroca = document.getElementById("modalStatusTroca");
const formStatusTroca = document.getElementById("formStatusTroca"); // <-- Adicionado
const btnFecharStatus = document.getElementById("btnFecharStatus");
const btnCancelarStatus = document.getElementById("btnCancelarStatus");

async function carregarTrocas() {
    if (!tbodyTrocas) return;
    tbodyTrocas.innerHTML = '<tr><td colspan="7" style="text-align:center;">Carregando solicitações de troca...</td></tr>';

    try {
        const res = await fetch("/admin/trocas");
        if (!res.ok) {
            throw new Error(`Erro ao buscar trocas: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        renderizarTrocas(data);

    } catch (err) {
        console.error("Erro ao carregar trocas:", err);
        tbodyTrocas.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${err.message}</td></tr>`;
    }
}

function renderizarTrocas(solicitacoes) {
    if (!tbodyTrocas) return;
    tbodyTrocas.innerHTML = "";

    if (solicitacoes.length === 0) {
        tbodyTrocas.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhuma solicitação de troca encontrada.</td></tr>';
        return;
    }

    solicitacoes.forEach((item) => {
        const tr = document.createElement("tr");
        tr.dataset.solicitacaoId = item.id;

        const dataFormatada = new Date(item.dataSolicitacao).toLocaleString("pt-BR", {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        tr.innerHTML = `
            <td>${item.pedidoId}</td>
            <td>${item.clienteNome}</td>
            <td>${item.nomeProduto}</td>
            <td>${dataFormatada}</td>
            <td>${item.motivo}</td>
            <td>${item.status}</td>
            <td>
                <button class="btn-acao-tabela btnAlterarStatusTroca" data-id="${item.id}" data-status-atual="${item.status}">
                    <i class='bx bx-edit'></i>
                </button>
            </td>
        `;
        tbodyTrocas.appendChild(tr);

        tr.querySelector(".btnAlterarStatusTroca").addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const solicitacaoId = btn.dataset.id;
            const statusAtual = btn.dataset.statusAtual;

            const selectStatus = document.getElementById("novoStatusTroca");

            // Mapeia Backend (Enum) -> Frontend (Option text)
            // Enums: PENDENTE, AUTORIZADA, RECEBIDA, RECUSADA
            // HTML: "Pendente", "Aprovada", "Recusada", "Concluída"

            let statusHtml = "Pendente"; // PENDENTE
            if (statusAtual === "AUTORIZADA") statusHtml = "Aprovada";
            if (statusAtual === "RECUSADA") statusHtml = "Recusada";
            if (statusAtual === "RECEBIDA") statusHtml = "Concluída";

            selectStatus.value = statusHtml;
            formStatusTroca.dataset.solicitacaoId = solicitacaoId; // Salva o ID no formulário

            modalStatusTroca.classList.add("active");
        });
    });
}

// --- ADICIONADO: Event listener para salvar a alteração de status da troca ---
formStatusTroca?.addEventListener("submit", async (e) => {
    e.preventDefault(); // Impede o envio padrão

    const solicitacaoId = e.currentTarget.dataset.solicitacaoId;
    const selectStatus = document.getElementById("novoStatusTroca");
    const statusHtml = selectStatus.value; // Ex: "Aprovada"

    if (!solicitacaoId) {
        alert("Erro: ID da solicitação não encontrado.");
        return;
    }

    // Mapeia Frontend (Option text) -> Backend (Enum String)
    let statusBackend = "PENDENTE";
    if (statusHtml === "Aprovada") statusBackend = "AUTORIZADA";
    if (statusHtml === "Recusada") statusBackend = "RECUSADA";
    if (statusHtml === "Concluída") statusBackend = "RECEBIDA";

    const btnSubmit = formStatusTroca.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Salvando...";

    try {
        const url = `/admin/trocas/${solicitacaoId}/status?novoStatus=${statusBackend}`;

        const res = await fetch(url, {
            method: 'PUT'
            // Não precisamos de body, pois o status está na URL
        });

        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg || `Falha ao atualizar status: ${res.status}`);
        }

        alert("Status da troca atualizado com sucesso!");
        modalStatusTroca.classList.remove("active");
        await carregarTrocas(); // Recarrega a lista de trocas

    } catch (err) {
        console.error("Erro ao salvar status da troca:", err);
        alert("Erro: " + err.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Salvar";
    }
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

// Inicializa os listeners dos modais de Vendas (que são importados)
inicializarListenersVendas();