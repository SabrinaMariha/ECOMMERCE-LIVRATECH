// --- ELEMENTOS DOM ---
const btnFiltrarRelatorio = document.getElementById("btnFiltrarRelatorio");
const btnLimparRelatorio = document.getElementById("btnLimparRelatorio");
// Usamos getContext aqui para ter o contexto 2D que o Chart.js precisa
const ctxGrafico = document.getElementById("graficoVendasLinha").getContext("2d");
const dataInicioInput = document.getElementById("dataInicio");
const dataFimInput = document.getElementById("dataFim");
const tbodyVendasCategoria = document.getElementById("tbodyVendasCategoria");

let graficoPrincipal = null;

// Categorias fixas do sistema
const CATEGORIAS_FIXAS = ["SUSPENSE", "INFANTIL", "TECNICO", "ROMANCE"];

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
export function inicializarRelatorios() {
    if (btnFiltrarRelatorio) btnFiltrarRelatorio.addEventListener("click", handleFiltrarRelatorio);
    if (btnLimparRelatorio) btnLimparRelatorio.addEventListener("click", handleLimparRelatorio);
    // Renderiza o gráfico vazio ao iniciar para ter a instância pronta (opcional, mas bom)
    renderCategoryLineChart([]);
}

// --- FILTRAR ---
async function handleFiltrarRelatorio(e) {
    e?.preventDefault();

    const dataInicio = dataInicioInput.value;
    const dataFim = dataFimInput.value;

    if (!dataInicio || !dataFim) {
        alert("Por favor, selecione as datas de início e fim.");
        return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
        alert("A data de início não pode ser posterior à data de fim.");
        return;
    }

    // A destruição agora é feita APENAS no renderCategoryLineChart para centralizar
    // e garantir que a nova instância seja criada corretamente.

    try {
        const categoryData = await fetchCategorySalesData(dataInicio, dataFim);

        if (categoryData && categoryData.length > 0) {
            renderCategoryLineChart(categoryData);
            renderCategoryTable(categoryData);
        } else {
            alert("Nenhuma venda encontrada para o período selecionado.");
            renderCategoryLineChart([]); // renderiza com zero em tudo
            renderCategoryTable([]);
        }
    } catch (error) {
        console.error("Erro ao filtrar relatórios:", error);
        alert("Erro ao carregar relatórios. Verifique o console.");
    }
}

// --- LIMPAR ---
function handleLimparRelatorio() {
    dataInicioInput.value = '';
    dataFimInput.value = '';

    // A destruição é feita aqui e na renderização
    if (graficoPrincipal) {
        graficoPrincipal.destroy();
        graficoPrincipal = null;
    }

    if (tbodyVendasCategoria) {
        tbodyVendasCategoria.innerHTML =
            '<tr><td colspan="2" style="text-align:center;">Nenhum dado filtrado.</td></tr>';
    }

    // Cria um novo gráfico vazio para que o canvas não fique vazio
    renderCategoryLineChart([]);
}

// --- BUSCA NA API ---
async function fetchCategorySalesData(dataInicio, dataFim) {
    if (tbodyVendasCategoria) {
        tbodyVendasCategoria.innerHTML =
            '<tr><td colspan="2" style="text-align:center;">Carregando...</td></tr>';
    }

    const url = `/admin/relatorios/vendas-categoria?dataInicio=${dataInicio}&dataFim=${dataFim}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao buscar dados.`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar dados de categoria:", error);
        if (tbodyVendasCategoria) {
            tbodyVendasCategoria.innerHTML =
                `<tr><td colspan="2" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>`;
        }
        return [];
    }
}

// --- TABELA ---
function renderCategoryTable(data) {
    if (!tbodyVendasCategoria) return;
    tbodyVendasCategoria.innerHTML = "";

    // cria um mapa de categoria -> volume
    const mapa = {};
    CATEGORIAS_FIXAS.forEach(cat => mapa[cat] = 0);

    // sobrescreve com dados retornados da API
    data.forEach(item => {
        // Normaliza a categoria para garantir a correspondência
        const categoriaChave = item.categoria?.toUpperCase();
        if (mapa[categoriaChave] !== undefined) {
            mapa[categoriaChave] = item.volumeVendas;
        }
    });

    CATEGORIAS_FIXAS.forEach(categoria => {
        // Você precisa dos 3 campos para a tabela? Se sim, você precisa do valorTotal aqui
        // Mas como só mapeamos o volumeVendas, vou manter simples (corrija se a tabela tem 3 colunas)
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${categoria}</td>
            <td style="text-align:center;">${mapa[categoria]}</td>
        `;
        tbodyVendasCategoria.appendChild(tr);
    });
}

// --- GRÁFICO DE LINHA ---
function renderCategoryLineChart(data) {
    const ctx = ctxGrafico; // usa o contexto já declarado

    // Destroi o gráfico antigo, se existir
    if (graficoPrincipal) {
        graficoPrincipal.destroy();
    }

    // cria mapa padrão
    const mapa = {};
    CATEGORIAS_FIXAS.forEach(cat => mapa[cat] = 0);

    // sobrescreve com os dados da API
    data.forEach(item => {
        if (mapa[item.categoria] !== undefined) {
            mapa[item.categoria] = item.volumeVendas;
        }
    });

    const labels = CATEGORIAS_FIXAS;
    const volumeVendas = labels.map(cat => mapa[cat]);

    graficoPrincipal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Volume de Vendas por Categoria',
                    data: volumeVendas,
                    borderColor: 'rgba(255, 180, 70, 1)',
                    backgroundColor: 'rgba(255, 180, 70, 0.3)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(255, 180, 70, 1)',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
