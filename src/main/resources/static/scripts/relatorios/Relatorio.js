// --- ELEMENTOS DOM ---
const btnFiltrarRelatorio = document.getElementById("btnFiltrarRelatorio");
const btnLimparRelatorio = document.getElementById("btnLimparRelatorio");
// Usamos getContext aqui para ter o contexto 2D que o Chart.js precisa
const ctxGrafico = document.getElementById("graficoVendasLinha").getContext("2d");
const dataInicioInput = document.getElementById("dataInicio");
const dataFimInput = document.getElementById("dataFim");
// Mantido caso seja usado para mensagens de loading/erro, mas não para renderizar a tabela
const tbodyVendasCategoria = document.getElementById("tbodyVendasCategoria");

let graficoPrincipal = null;

// Categorias fixas do sistema (usadas apenas para gerar legendas e datasets)
const CATEGORIAS_FIXAS = ["SUSPENSE", "INFANTIL", "TECNICO", "ROMANCE"];

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
export function inicializarRelatorios() {
    if (btnFiltrarRelatorio) btnFiltrarRelatorio.addEventListener("click", handleFiltrarRelatorio);
    if (btnLimparRelatorio) btnLimparRelatorio.addEventListener("click", handleLimparRelatorio);
    // Renderiza o gráfico vazio ao iniciar (sem range de datas)
    renderCategoryLineChart([]);
}

// --- FUNÇÃO AUXILIAR PARA GERAR O RANGE DE DATAS ---
/**
 * Gera um array de strings de data ('YYYY-MM-DD') entre dataInicio e dataFim (inclusivas).
 */
function generateDateRange(startDateStr, endDateStr) {
    const dates = [];
    // Adiciona 'T00:00:00' para evitar problemas de fuso horário e garantir que seja meia-noite
    let currentDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T00:00:00');

    while (currentDate <= endDate) {
        // Formata a data como YYYY-MM-DD
        const formattedDate = currentDate.toISOString().slice(0, 10);
        dates.push(formattedDate);

        // Avança para o próximo dia
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
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

    try {
        const categoryData = await fetchCategorySalesData(dataInicio, dataFim);

        if (categoryData && categoryData.length > 0) {
            // Passa os dados e o range completo para a renderização do gráfico
            renderCategoryLineChart(categoryData, dataInicio, dataFim);
            // renderCategoryTable(categoryData); <-- REMOVIDO
        } else {
            alert("Nenhuma venda encontrada para o período selecionado.");
            // Passa o range de datas mesmo sem dados, para exibir as datas no Eixo X
            renderCategoryLineChart([], dataInicio, dataFim);
            // renderCategoryTable([]); <-- REMOVIDO
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

    // Destrói a instância do gráfico
    if (graficoPrincipal) {
        graficoPrincipal.destroy();
        graficoPrincipal = null;
    }

    // Limpa a tabela (Mantido apenas se a div da tabela for usada para exibir mensagens)
    if (tbodyVendasCategoria) {
        tbodyVendasCategoria.innerHTML =
            '<tr><td colspan="2" style="text-align:center;">Nenhum dado filtrado.</td></tr>';
    }

    // Cria um novo gráfico vazio (sem range de datas)
    renderCategoryLineChart([]);
}

// --- BUSCA NA API ---
async function fetchCategorySalesData(dataInicio, dataFim) {
    // Exibe mensagem de carregando no local da tabela (se ainda existir)
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
        // Exibe erro no local da tabela (se ainda existir)
        if (tbodyVendasCategoria) {
            tbodyVendasCategoria.innerHTML =
                `<tr><td colspan="2" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>`;
        }
        return [];
    }
}

// --- FUNÇÃO AUXILIAR DE PREPARAÇÃO DE DADOS PARA CHART.JS ---
function prepareChartData(dataAgrupada, dataInicio, dataFim) {

    // 1. GERA TODAS AS DATAS NO PERÍODO SELECIONADO (O EIXO X COMPLETO)
    const labels = generateDateRange(dataInicio, dataFim);

    // 2. Mapeia cada grupo de categoria para um Dataset do Chart.js
    const datasets = dataAgrupada.map((catGroup, index) => {
        const categoria = catGroup.categoria;

        // Mapeia Vendas por Dia: (Data -> ValorTotal) para preenchimento rápido
        const vendasPorDataMap = new Map();
        catGroup.vendasPorDia.forEach(venda => {
            // Usando valorTotal no gráfico
            vendasPorDataMap.set(venda.data, venda.valorTotal);
        });

        // 3. Cria o array de dados para o dataset, usando o array COMPLETO de 'labels'
        const dadosLinha = labels.map(dataLabel => {
            // Se a data existir no mapa de vendas, pega o valor; senão, é 0 (ponto vazio no gráfico)
            return vendasPorDataMap.get(dataLabel) || 0;
        });

        // Gera uma cor baseada no índice para diferenciar as linhas (usando HSL)
        const color = `hsl(${index * 50}, 70%, 50%)`;

        return {
            label: `Vendas: ${categoria}`,
            data: dadosLinha, // Valores de venda total, com zeros para dias sem venda
            borderColor: color,
            backgroundColor: color + '33',
            fill: false,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: color,
        };
    });

    return { labels, datasets };
}

// --- GRÁFICO DE LINHA ---
function renderCategoryLineChart(data, dataInicio, dataFim) {
    const ctx = ctxGrafico;

    // Destroi o gráfico antigo, se existir
    if (graficoPrincipal) {
        graficoPrincipal.destroy();
    }

    // Se não houver range de datas (início), não renderiza o gráfico
    if (!dataInicio || !dataFim) {
        graficoPrincipal = null;
        return;
    }

    // Chama a função para estruturar os dados, passando o range completo
    const chartData = prepareChartData(data, dataInicio, dataFim);

    // As labels agora são as datas completas do período, e os datasets são as categorias
    graficoPrincipal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels, // Datas de dataInicio até dataFim (Eixo X)
            datasets: chartData.datasets // Múltiplas linhas por categoria
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dia da Venda'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor Total (R$)'
                    }
                }
            }
        }
    });
}