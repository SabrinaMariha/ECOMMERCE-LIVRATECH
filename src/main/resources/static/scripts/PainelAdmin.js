// ======================= CONTROLE DE ABAS =======================
const buttons = document.querySelectorAll(".menu-btn");
const sections = document.querySelectorAll(".section");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    sections.forEach((sec) => sec.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.section).classList.add("active");

    // Fechar todos os modais que usam a classe 'active'
    document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("active"));

    // Fechar modais que usam style.display (inativar, editar estoque)
    const modaisDisplay = [
      document.getElementById("inativar-modal"),
      document.getElementById("modalEditarEstoque")
    ];
    modaisDisplay.forEach(modal => { if(modal) modal.style.display = "none"; });
  });
});

// ======================= CLIENTES (FETCH) =======================
const tbodyClientes = document.getElementById("clientes-tbody");
const modalHistorico = document.getElementById("modalHistorico");
const btnFecharHistorico = document.getElementById("btnFecharHistorico");
const tbodyHistorico = document.querySelector("#tabelaHistorico tbody");

const inativarModal = document.getElementById("inativar-modal");
const btnFecharInativar = inativarModal.querySelector(".close-btn");
const btnNao = inativarModal.querySelector(".btn-nao");
const btnSim = inativarModal.querySelector(".btn-sim");

// Função para carregar clientes via fetch
async function carregarClientes() {
   tbodyClientes.innerHTML = ""; // limpar tabela antes de preencher

   try {
     const res = await fetch("/admin/clientes", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ /* filtros aqui se quiser */ })
     });

     if (!res.ok) throw new Error("Erro ao carregar clientes");

     const data = await res.json(); // pega o JSON da resposta

     const clientes = data.clientes || []; // seu back retorna { clientes: [...] }

     clientes.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nome}</td>
        <td>${c.dataNascimento}</td>
        <td>${c.cpf}</td>
        <td>${c.telefones.length > 0 ? c.telefones[0].ddd + " " + c.telefones[0].numero : ""}</td>
        <td>${c.email}</td>
        <td>${c.status}</td>
        <td>
          <button class="btn-acao-tabela btn-historico"><i class="fa-solid fa-clock-rotate-left"></i></button>
          <button class="btn-acao-tabela btn-inativar"><i class="fa-solid fa-ban"></i></button>
        </td>
      `;
      tbodyClientes.appendChild(tr);

      // Histórico
      tr.querySelector(".btn-historico").addEventListener("click", async () => {
        tbodyHistorico.innerHTML = "";
        try {
          const histRes = await fetch(`/clientes/${encodeURIComponent(c.nome)}/historico`);
          if (!histRes.ok) throw new Error("Erro ao carregar histórico");
          const transacoes = await histRes.json();

          if (transacoes.length === 0) {
            tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhuma transação encontrada</td></tr>`;
          } else {
            transacoes.forEach((t) => {
              const trHist = document.createElement("tr");
              trHist.innerHTML = `
                <td>${t.dataHora}</td>
                <td>R$ ${t.valor.toFixed(2)}</td>
                <td>R$ ${t.frete.toFixed(2)}</td>
                <td>${t.status}</td>
              `;
              tbodyHistorico.appendChild(trHist);
            });
          }
          modalHistorico.classList.add("active");
        } catch (err) {
          tbodyHistorico.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">${err.message}</td></tr>`;
          modalHistorico.classList.add("active");
        }
      });

      // Inativar
      tr.querySelector(".btn-inativar").addEventListener("click", () => {
        inativarModal.style.display = "flex";
      });
    });

  } catch (err) {
    tbodyClientes.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${err.message}</td></tr>`;
  }
}

// Chamar função ao carregar página
carregarClientes();

// Fechar modais de cliente
btnFecharHistorico.addEventListener("click", () => modalHistorico.classList.remove("active"));
modalHistorico.addEventListener("click", (e) => { if(e.target===modalHistorico) modalHistorico.classList.remove("active"); });

btnFecharInativar.addEventListener("click", () => inativarModal.style.display="none");
btnNao.addEventListener("click", () => inativarModal.style.display="none");
btnSim.addEventListener("click", () => inativarModal.style.display="none");
window.addEventListener("click", (e) => { if(e.target===inativarModal) inativarModal.style.display="none"; });


// ======================= FILTROS =======================
function criarFiltro(btnAbrir, painel, btnFechar, btnLimpar, formId) {
  btnAbrir.addEventListener("click", () => painel.classList.toggle("active"));
  btnFechar.addEventListener("click", () => painel.classList.remove("active"));
  btnLimpar.addEventListener("click", () => document.getElementById(formId).reset());
}

criarFiltro(
  document.getElementById("btnAbrirFiltro"),
  document.getElementById("painelFiltro"),
  document.getElementById("btnFecharFiltro"),
  document.getElementById("btnLimpar"),
  "formFiltro"
);

criarFiltro(
  document.getElementById("btnAbrirFiltroEstoque"),
  document.getElementById("painelFiltroEstoque"),
  document.getElementById("btnFecharFiltroEstoque"),
  document.getElementById("btnLimparEstoque"),
  "formFiltroEstoque"
);

criarFiltro(
  document.getElementById("btnAbrirFiltroVendas"),
  document.getElementById("painelFiltroVendas"),
  document.getElementById("btnFecharFiltroVendas"),
  document.getElementById("btnLimparVendas"),
  "formFiltroVendas"
);

criarFiltro(
  document.getElementById("btnFiltroTrocas"),
  document.getElementById("painelFiltroTrocas"),
  document.getElementById("btnFecharFiltroTrocas"),
  document.getElementById("btnLimparTrocas"),
  "formFiltroTrocas"
);

// ======================= ESTOQUE =======================
const estoque = [
  { idLivro: 1, titulo: "Livro A", quantidade: 10, fornecedor: "Fornecedor X", dataEntrada: "2025-08-01", valorCusto: 50.0, status: "Ativo" },
  { idLivro: 2, titulo: "Livro B", quantidade: 0, fornecedor: "Fornecedor Y", dataEntrada: "2025-08-05", valorCusto: 35.0, status: "Ativo" },
  { idLivro: 3, titulo: "Livro C", quantidade: 5, fornecedor: "Fornecedor Z", dataEntrada: "2025-08-10", valorCusto: 42.5, status: "Ativo" }
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
  btn.addEventListener("click", () => modalEditarEstoque.style.display="flex");
});

btnFecharModalEstoque.addEventListener("click", () => modalEditarEstoque.style.display="none");
btnCancelarEditar.addEventListener("click", () => modalEditarEstoque.style.display="none");
window.addEventListener("click", (e) => { if(e.target===modalEditarEstoque) modalEditarEstoque.style.display="none"; });

// ======================= VENDAS =======================
const vendas = [
  { idVenda:101, cliente:"Ana Maria", data:"2025-08-01", total:150.5, status:"Concluída" },
  { idVenda:102, cliente:"Bruno Silva", data:"2025-08-05", total:320.0, status:"Pendente" },
  { idVenda:103, cliente:"Carla Souza", data:"2025-08-10", total:75.25, status:"Cancelada" }
];
const tbodyVendas = document.getElementById("vendas-tbody");
const modalStatusVenda = document.getElementById("modalStatusVenda");
const btnFecharStatusVenda = document.getElementById("btnFecharStatusVenda");
const btnCancelarStatusVenda = document.getElementById("btnCancelarStatusVenda");

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
btnFecharStatusVenda.addEventListener("click", () => modalStatusVenda.classList.remove("active"));
btnCancelarStatusVenda.addEventListener("click", () => modalStatusVenda.classList.remove("active"));
window.addEventListener("click", (e) => { if(e.target===modalStatusVenda) modalStatusVenda.classList.remove("active"); });

// ======================= TROCAS/DEVOLUÇÕES =======================
const trocas = [
  { idPedido:1, cliente:"Ana Maria", produto:"Livro A", dataSolicitacao:"2025-08-15", motivo:"Defeito na impressão", status:"Pendente" },
  { idPedido:2, cliente:"Carlos Souza", produto:"Livro B", dataSolicitacao:"2025-08-18", motivo:"Troca por outro título", status:"Aprovada" },
  { idPedido:3, cliente:"Fernanda Lima", produto:"Livro C", dataSolicitacao:"2025-08-20", motivo:"Devolução por arrependimento", status:"Recusada" }
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
btnFecharStatus.addEventListener("click", () => modalStatusTroca.classList.remove("active"));
btnCancelarStatus.addEventListener("click", () => modalStatusTroca.classList.remove("active"));
window.addEventListener("click", (e) => { if(e.target===modalStatusTroca) modalStatusTroca.classList.remove("active"); });
