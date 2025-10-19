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
  tbodyClientes.innerHTML = "";

  try {
    const res = await fetch("/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error("Erro ao carregar clientes");

    const data = await res.json();
    clientesCarregados = data.clientes || [];

    renderizarClientes(clientesCarregados);
  } catch (err) {
    tbodyClientes.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${err.message}</td></tr>`;
  }
}

function renderizarClientes(clientes) {
  tbodyClientes.innerHTML = "";

  clientes.forEach((c) => {
    const tr = document.createElement("tr");
    tr.dataset.clienteId = c.id;
    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.dataNascimento}</td>
      <td>${c.cpf}</td>
      <td>${
        c.telefones.length
          ? c.telefones[0].ddd + " " + c.telefones[0].numero
          : ""
      }</td>
      <td>${c.email}</td>
      <td>${c.status}</td>
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

    // Botão detalhes
    const btnDetalhes = tr.querySelector(".btn-detalhes");
    btnDetalhes?.addEventListener("click", async (e) => {
      try {
        const clienteId = e.currentTarget.dataset.id;
        const res = await fetch(`admin/cliente/${clienteId}`);
        if (!res.ok) throw new Error("Erro ao carregar cliente");
        const data = await res.json();

        const telefones =
          data.telefones?.map((t) => `${t.ddd} ${t.numero}`).join(", ") || "-";
        const enderecos =
          data.enderecos
            ?.map(
              (e) =>
                `${e.cep}, ${e.logradouro}, ${e.numero}, ${e.cidade}/${e.estado}`
            )
            .join("<br>") || "-";
        const cartoes =
          data.cartoesCredito
            ?.map((cc) => {
              const numero = cc.numeroCartao
                ? `**** **** **** ${cc.numeroCartao.slice(-4)}`
                : "Número indisponível";
              const titular = cc.nomeImpresso || "-";
              return `${numero}, ${titular}`;
            })
            .join("<br>") || "-";

        detalhesClienteContent.innerHTML = `
         <table class="detalhes-tabela">
           <tr>
             <th>Nome</th>
             <th>Gênero</th>
             <th>Data de Nascimento</th>
             <th>CPF</th>
             <th>Telefones</th>
             <th>E-mail</th>
             <th>Status</th>
             <th>Endereços</th>
             <th>Cartões de Crédito</th>
           </tr>
           <tr>
             <td>${data.nome}</td>
             <td>${data.genero || "-"}</td>
             <td>${data.dataNascimento}</td>
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

    // Botão histórico - MODIFICADO para usar fetch
    const btnHistorico = tr.querySelector(".btn-historico");
    if (btnHistorico) {
      btnHistorico.addEventListener("click", async (e) => {
        const clienteId = e.currentTarget.dataset.id;
        tbodyHistorico.innerHTML =
          '<tr><td colspan="4" style="text-align:center;">Carregando histórico...</td></tr>'; // Feedback visual
        modalHistorico.classList.add("active"); // Abre o modal antes de carregar

        try {
          // Faz a chamada para o endpoint GET /cliente/{id}/pedidos
          const res = await fetch(`/cliente/${clienteId}/pedidos`); // Usa o endpoint correto
          if (!res.ok) {
            throw new Error(`Erro ao buscar pedidos: ${res.statusText}`);
          }
          const pedidos = await res.json(); // Array de PedidoDTO

          tbodyHistorico.innerHTML = ""; // Limpa o "Carregando..." ou dados antigos

          if (pedidos.length === 0) {
            tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum pedido encontrado para este cliente.</td></tr>`;
          } else {
            pedidos.forEach((pedido) => {
              const trHist = document.createElement("tr");
              // Formata a data (DD/MM/YYYY) e o valor (R$ XX,XX)
              const dataFormatada = new Date(pedido.data).toLocaleDateString(
                "pt-BR",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ); // Adiciona hora
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
          tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro ao carregar histórico: ${err.message}</td></tr>`;
        }
      });
    }

    // Botão inativar
    tr.querySelector(".btn-inativar")?.addEventListener("click", (e) => {
      clienteParaInativar = e.currentTarget.dataset.id;
      inativarModal.style.display = "flex";
    });
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

btnFecharInativar?.addEventListener("click", () => (inativarModal.style.display = "none"));
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
function criarFiltro(btnAbrir, painel, btnFechar, btnLimpar, formId) {
  btnAbrir?.addEventListener("click", () => painel?.classList.toggle("active"));
  btnFechar?.addEventListener("click", () =>
    painel?.classList.remove("active")
  );
  btnLimpar?.addEventListener("click", () =>
    document.getElementById(formId)?.reset()
  );
}

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

criarFiltro(
  document.getElementById("btnAbrirFiltro"),
  document.getElementById("painelFiltro"),
  document.getElementById("btnFecharFiltro"),
  document.getElementById("btnLimpar"),
  "formFiltro"
);

// ======================= ESTOQUE =======================
// ... (resto do estoque, vendas, trocas e detalhes permanece igual)

const estoque = [
  {
    idLivro: 1,
    titulo: "Livro A",
    quantidade: 10,
    fornecedor: "Fornecedor X",
    dataEntrada: "2025-08-01",
    valorCusto: 50.0,
    status: "Ativo",
  },
  {
    idLivro: 2,
    titulo: "Livro B",
    quantidade: 0,
    fornecedor: "Fornecedor Y",
    dataEntrada: "2025-08-05",
    valorCusto: 35.0,
    status: "Ativo",
  },
  {
    idLivro: 3,
    titulo: "Livro C",
    quantidade: 5,
    fornecedor: "Fornecedor Z",
    dataEntrada: "2025-08-10",
    valorCusto: 42.5,
    status: "Ativo",
  },
];

const tbodyEstoque = document.getElementById("estoque-tbody");
const modalEditarEstoque = document.getElementById("modalEditarEstoque");
const btnFecharModalEstoque = document.getElementById("btnFecharModalEstoque");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");

estoque.forEach((item) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.idLivro}</td>
    <td>${item.titulo}</td>
    <td>${item.quantidade}</td>
    <td>${item.fornecedor}</td>
    <td>${item.dataEntrada}</td>
    <td>R$ ${item.valorCusto.toFixed(2)}</td>
    <td>${item.status}</td>
    <td>
      <button class="btn-acao-tabela btnEditarEstoque"><i class='bx bx-edit'></i></button>
    </td>
  `;
  tbodyEstoque.appendChild(tr);
});

document.querySelectorAll(".btnEditarEstoque").forEach((btn) => {
  btn.addEventListener(
    "click",
    () => (modalEditarEstoque.style.display = "flex")
  );
});

btnFecharModalEstoque?.addEventListener(
  "click",
  () => (modalEditarEstoque.style.display = "none")
);
btnCancelarEditar?.addEventListener(
  "click",
  () => (modalEditarEstoque.style.display = "none")
);
window.addEventListener("click", (e) => {
  if (e.target === modalEditarEstoque)
    modalEditarEstoque.style.display = "none";
});

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
