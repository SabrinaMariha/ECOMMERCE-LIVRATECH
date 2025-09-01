// CLIENTE

const buttons = document.querySelectorAll(".menu-btn");
const sections = document.querySelectorAll(".section");

// Trocar de aba
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    sections.forEach((sec) => sec.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.section).classList.add("active");

    // Fechar todos os modais que usam a classe 'active'
    document.querySelectorAll(".modal").forEach(modal => {
      modal.classList.remove("active");
    });
    // Fechar modais que usam style.display (ex: inativar cliente, editar estoque)
    const modaisDisplay = [
      document.getElementById("inativar-modal"),
      document.getElementById("modalEditarEstoque")
    ];
    modaisDisplay.forEach(modal => {
      if (modal) modal.style.display = "none";
    });
  });
});

// Histórico de transações por cliente
const historicoTransacoes = {
  "João Silva": [
    {
      dataHora: "20/08/2025 10:15",
      valor: 150.0,
      frete: 10.0,
      status: "Concluída",
    },
    {
      dataHora: "15/07/2025 14:40",
      valor: 200.0,
      frete: 15.0,
      status: "Pendente",
    },
  ],
  "Maria Souza": [
    {
      dataHora: "10/08/2025 12:30",
      valor: 300.0,
      frete: 20.0,
      status: "Concluída",
    },
  ],
  "Ana Maria": [
    {
      dataHora: "01/08/2025 09:00",
      valor: 120.0,
      frete: 8.0,
      status: "Concluída",
    },
    {
      dataHora: "05/08/2025 16:45",
      valor: 250.0,
      frete: 12.0,
      status: "Pendente",
    },
  ],
};

// Referências do DOM
const tbodyClientes = document.getElementById("clientes-tbody");
const modalHistorico = document.getElementById("modalHistorico");
const btnFecharHistorico = document.getElementById("btnFecharHistorico");
const tbodyHistorico = document.querySelector("#tabelaHistorico tbody");

const inativarModal = document.getElementById("inativar-modal");
const btnFecharInativar = inativarModal.querySelector(".close-btn");
const btnNao = inativarModal.querySelector(".btn-nao");
const btnSim = inativarModal.querySelector(".btn-sim");

// Lista de clientes
const clientes = [
  {
    nome: "Ana Maria",
    dataNasc: "15/03/1990",
    cpf: "123.456.789-00",
    telefone: "(11) 98765-4321",
    email: "ana.maria@email.com",
    status: "Ativo",
  },
  {
    nome: "Bruno Silva",
    dataNasc: "22/07/1985",
    cpf: "987.654.321-00",
    telefone: "(21) 91234-5678",
    email: "bruno.silva@email.com",
    status: "Ativo",
  },
  {
    nome: "Carla Souza",
    dataNasc: "08/11/1992",
    cpf: "456.123.789-00",
    telefone: "(31) 99876-5432",
    email: "carla.souza@email.com",
    status: "Inativo",
  },
  {
    nome: "João Silva",
    dataNasc: "13/03/2000",
    cpf: "123.456.789-00",
    telefone: "(11) 99806-4723",
    email: "joao@mail.com",
    status: "Ativo",
  },
  {
    nome: "Mariana Costa",
    dataNasc: "05/05/1995",
    cpf: "321.654.987-00",
    telefone: "(21) 98765-1234",
    email: "mariana.costa@mail.com",
    status: "Inativo",
  },
];

// Função para criar linhas da tabela
clientes.forEach((c) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${c.nome}</td>
    <td>${c.dataNasc}</td>
    <td>${c.cpf}</td>
    <td>${c.telefone}</td>
    <td>${c.email}</td>
    <td>${c.status}</td>
    <td>
      <button class="btn-acao-tabela btn-historico"><i class="fa-solid fa-clock-rotate-left"></i></button>
      <button class="btn-acao-tabela btn-inativar"><i class="fa-solid fa-ban"></i></button>
    </td>
  `;
  tbodyClientes.appendChild(tr);

  // Abrir modal de histórico
  const btnHistorico = tr.querySelector(".btn-historico");
  btnHistorico.addEventListener("click", () => {
    tbodyHistorico.innerHTML = "";
    const transacoes = historicoTransacoes[c.nome] || [];
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
  });

  // Abrir modal de inativar cliente
  const btnInativar = tr.querySelector(".btn-inativar");
  btnInativar.addEventListener("click", () => {
    inativarModal.style.display = "flex";
  });
});

// Fechar modal histórico
btnFecharHistorico.addEventListener("click", () => {
  modalHistorico.classList.remove("active");
});
modalHistorico.addEventListener("click", (e) => {
  if (e.target === modalHistorico) modalHistorico.classList.remove("active");
});

// Fechar modal inativar
btnFecharInativar.addEventListener("click",
  () => (inativarModal.style.display = "none")
);
btnNao.addEventListener("click", () => (inativarModal.style.display = "none"));
btnSim.addEventListener("click", () => (inativarModal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === inativarModal) inativarModal.style.display = "none";
});

const btnAbrirFiltro = document.getElementById("btnAbrirFiltro");
const painelFiltro = document.getElementById("painelFiltro");
const btnFecharFiltro = document.getElementById("btnFecharFiltro");
const btnLimpar = document.getElementById("btnLimpar");

btnAbrirFiltro.addEventListener("click", () => {
  painelFiltro.classList.toggle("active");
});

btnFecharFiltro.addEventListener("click", () => {
  painelFiltro.classList.remove("active");
});

btnLimpar.addEventListener("click", () => {
  document.getElementById("formFiltro").reset();
});

// ESTOQUE
const btnAbrirFiltroEstoque = document.getElementById("btnAbrirFiltroEstoque");
const painelFiltroEstoque = document.getElementById("painelFiltroEstoque");
const btnFecharFiltroEstoque = document.getElementById(
  "btnFecharFiltroEstoque"
);
const btnLimparEstoque = document.getElementById("btnLimparEstoque");

btnAbrirFiltroEstoque.addEventListener("click", () => {
  painelFiltroEstoque.classList.toggle("active");
});

btnFecharFiltroEstoque.addEventListener("click", () => {
  painelFiltroEstoque.classList.remove("active");
});

btnLimparEstoque.addEventListener("click", () => {
  document.getElementById("formFiltroEstoque").reset();
});

// Adicionar produtos (exemplo)
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
      <button class="btn-acao-tabela"><i class='bx bx-edit'></i></button>
    </td>
  `;
  tbodyEstoque.appendChild(tr);
});

// MODAL ESTOQUE
// Seletores do modal
const modalEditarEstoque = document.getElementById("modalEditarEstoque");
const btnFecharModalEstoque = document.getElementById("btnFecharModalEstoque");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");

// Abrir modal ao clicar no botão editar
document.querySelectorAll(".btn-acao-tabela").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    // Aqui no futuro você pode carregar os dados do item[index]
    modalEditarEstoque.style.display = "flex";
  });
});

// Fechar modal
btnFecharModalEstoque.addEventListener("click", () => {
  modalEditarEstoque.style.display = "none";
});

btnCancelarEditar.addEventListener("click", () => {
  modalEditarEstoque.style.display = "none";
});

// Fechar modal clicando fora dele
window.addEventListener("click", (e) => {
  if (e.target === modalEditarEstoque) {
    modalEditarEstoque.style.display = "none";
  }
});

// vendas

const btnAbrirFiltroVendas = document.getElementById("btnAbrirFiltroVendas");
const painelFiltroVendas = document.getElementById("painelFiltroVendas");
const btnFecharFiltroVendas = document.getElementById("btnFecharFiltroVendas");
const btnLimparVendas = document.getElementById("btnLimparVendas");

btnAbrirFiltroVendas.addEventListener("click", () => {
  painelFiltroVendas.classList.toggle("active");
});

btnFecharFiltroVendas.addEventListener("click", () => {
  painelFiltroVendas.classList.remove("active");
});

btnLimparVendas.addEventListener("click", () => {
  document.getElementById("formFiltroVendas").reset();
});

// Adicionar vendas (exemplo)
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

const modalStatusVenda = document.getElementById("modalStatusVenda");
const btnFecharStatusVenda = document.getElementById("btnFecharStatusVenda");
const btnCancelarStatusVenda = document.getElementById(
  "btnCancelarStatusVenda"
);

// Abrir modal ao clicar no botão de editar venda
document.querySelectorAll(".btnAlterarStatusVenda").forEach((btn) => {
  btn.addEventListener("click", () => {
    modalStatusVenda.classList.add("active");
  });
});

// Fechar modal
btnFecharStatusVenda.addEventListener("click", () => {
  modalStatusVenda.classList.remove("active");
});
btnCancelarStatusVenda.addEventListener("click", () => {
  modalStatusVenda.classList.remove("active");
});

// Fechar modal clicando fora
window.addEventListener("click", (e) => {
  if (e.target === modalStatusVenda) {
    modalStatusVenda.classList.remove("active");
  }
});

// RELATORIOS
// Dados fictícios iniciais para gráficos
// let vendasHistorico = [
//   { mes: "Jan", valor: 5000 },
//   { mes: "Fev", valor: 7000 },
//   { mes: "Mar", valor: 4000 },
//   { mes: "Abr", valor: 9000 },
//   { mes: "Mai", valor: 6000 },
//   { mes: "Jun", valor: 7500 },
// ];

// let vendasStatus = [
//   { status: "Pendente", qtd: 3 },
//   { status: "Concluída", qtd: 5 },
//   { status: "Cancelada", qtd: 1 },
// ];

// // Criar gráfico de linhas
// const ctxLinha = document.getElementById("graficoVendasLinha").getContext("2d");
// let graficoLinha = new Chart(ctxLinha, {
//   type: "line",
//   data: {
//     labels: vendasHistorico.map((v) => v.mes),
//     datasets: [
//       {
//         label: "Vendas (R$)",
//         data: vendasHistorico.map((v) => v.valor),
//         borderColor: "#1abc9c",
//         backgroundColor: "rgba(26,188,156,0.2)",
//         fill: true,
//         tension: 0.3,
//       },
//     ],
//   },
//   options: {
//     responsive: true,
//     plugins: {
//       legend: { display: true, position: "top" },
//     },
//     scales: {
//       y: { beginAtZero: true },
//     },
//   },
// });

// // Criar gráfico de barras
// const ctxStatus = document
//   .getElementById("graficoVendasStatus")
//   .getContext("2d");
// let graficoStatus = new Chart(ctxStatus, {
//   type: "bar",
//   data: {
//     labels: vendasStatus.map((v) => v.status),
//     datasets: [
//       {
//         label: "Quantidade de Vendas",
//         data: vendasStatus.map((v) => v.qtd),
//         backgroundColor: ["#1abc9c", "#3498db", "#e74c3c"],
//       },
//     ],
//   },
//   options: {
//     responsive: true,
//     plugins: { legend: { display: false } },
//     scales: { y: { beginAtZero: true } },
//   },
// });

// // Filtrar histórico de vendas por período (RF0055)
// document.getElementById("btnFiltrarRelatorio").addEventListener("click", () => {
//   const inicio = new Date(document.getElementById("dataInicio").value);
//   const fim = new Date(document.getElementById("dataFim").value);

//   if (!inicio || !fim) return alert("Escolha um período válido");

//   // Filtrando os dados fictícios (exemplo)
//   const dadosFiltrados = vendasHistorico.filter((v) => {
//     // Exemplo: assume que mes é o número do mês em string (Jan=1, Fev=2...)
//     const mesesMap = { Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5 };
//     const dataV = new Date(2025, mesesMap[v.mes], 1);
//     return dataV >= inicio && dataV <= fim;
//   });

//   graficoLinha.data.labels = dadosFiltrados.map((v) => v.mes);
//   graficoLinha.data.datasets[0].data = dadosFiltrados.map((v) => v.valor);
//   graficoLinha.update();
// });

// // Limpar filtro
// document.getElementById("btnLimparRelatorio").addEventListener("click", () => {
//   document.getElementById("dataInicio").value = "";
//   document.getElementById("dataFim").value = "";

//   graficoLinha.data.labels = vendasHistorico.map((v) => v.mes);
//   graficoLinha.data.datasets[0].data = vendasHistorico.map((v) => v.valor);
//   graficoLinha.update();
// });

// TROCAS E DEVOLUÇÕES
const btnAbrirFiltroTrocas = document.getElementById("btnFiltroTrocas");
const painelFiltroTrocas = document.getElementById("painelFiltroTrocas");
const btnFecharFiltroTrocas = document.getElementById("btnFecharFiltroTrocas");
const btnLimparTrocas = document.getElementById("btnLimparTrocas");

btnAbrirFiltroTrocas.addEventListener("click", () => {
  painelFiltroTrocas.classList.toggle("active");
});

btnFecharFiltroTrocas.addEventListener("click", () => {
  painelFiltroTrocas.classList.remove("active");
});

btnLimparTrocas.addEventListener("click", () => {
  document.getElementById("formFiltroTrocas").reset();
});

// Adicionar solicitações de tr
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

const modalTrocas = document.getElementById("modalTrocas");
const btnFecharModalTrocas = document.getElementById("btnFecharModalTrocas");
const modalStatusTroca = document.getElementById("modalStatusTroca");
const btnFecharStatus = document.getElementById("btnFecharStatus");
const btnCancelarStatus = document.getElementById("btnCancelarStatus");

// Abrir modal ao clicar no botão de editar
document.querySelectorAll(".btnAlterarStatusTroca").forEach((btn) => {
  btn.addEventListener("click", () => {
    modalStatusTroca.classList.add("active");
  });
});

// Fechar modal
btnFecharStatus.addEventListener("click", () => {
  modalStatusTroca.classList.remove("active");
});

btnCancelarStatus.addEventListener("click", () => {
  modalStatusTroca.classList.remove("active");
});

//fecha modal clicando fora
window.addEventListener("click", (e) => {
  if (e.target === modalStatusTroca) {
    modalStatusTroca.classList.remove("active");
  }
});
