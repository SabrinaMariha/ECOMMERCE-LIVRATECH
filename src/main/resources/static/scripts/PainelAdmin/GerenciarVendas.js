// Arquivo: GerenciarVendas.js (DEVE SER UM ARQUIVO SEPARADO)

// Variáveis DOM e de Estado
const tbodyVendas = document.getElementById("vendas-tbody");
const modalStatusVenda = document.getElementById("modalStatusVenda");
const formStatusVenda = document.getElementById("formStatusVenda");
const btnFecharStatusVenda = document.getElementById("btnFecharStatusVenda");
const btnCancelarStatusVenda = document.getElementById("btnCancelarStatusVenda");

// Elementos do novo Modal Detalhes Venda
const modalDetalhesVenda = document.getElementById("modalDetalhesVenda");
const btnFecharDetalhesVenda = document.getElementById("btnFecharDetalhesVenda");
const detalhesVendaContent = document.getElementById("detalhesVendaContent");
const detalhePedidoIdElement = document.getElementById("detalhePedidoId");


let vendasCarregadas = [];


// ======================= FUNÇÕES DE API =======================

export async function buscarVendasDaApi() {
    const url = "/admin/vendas";

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Erro ao buscar vendas: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return data;

    } catch (error) {
        console.error("Falha ao buscar vendas na API:", error);
        throw error;
    }
}

async function buscarDetalhesVenda(pedidoId) {
    // Assumindo que você tem um endpoint para buscar detalhes de um pedido
    const url = `/admin/vendas/${pedidoId}/detalhes`; // Exemplo de endpoint
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Erro ao buscar detalhes do pedido ${pedidoId}: ${res.status} ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Falha ao buscar detalhes da venda:", error);
        throw error;
    }
}


async function atualizarStatusVenda(pedidoId, novoStatus) {
    // ... (Sua função existente para atualizar status) ...
    try {
        // Altere o URL e o método conforme o seu backend espera
        const res = await fetch(`/admin/vendas/${pedidoId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus.toUpperCase().replace(/\s/g, '_') })
        });

        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(`Falha ao atualizar status do pedido ${pedidoId}: ${errorMsg}`);
        }

        return true;

    } catch (error) {
        console.error("Erro na atualização do status:", error);
        throw error;
    }
}


// ======================= FUNÇÕES DE RENDERIZAÇÃO E EVENTOS =======================

/**
 * Monta o HTML com os detalhes do pedido e abre o modal.
 */
async function abrirModalDetalhesVenda(pedidoId) {
    if (!modalDetalhesVenda || !detalhesVendaContent) return;

    detalhePedidoIdElement.textContent = `#${pedidoId}`;
    detalhesVendaContent.innerHTML =
        '<p style="text-align:center;">Carregando detalhes do pedido...</p>';
    modalDetalhesVenda.classList.add("active");

    try {
        // Assume que buscarDetalhesVenda retorna a estrutura completa de um pedido
        // (como o objeto único no seu array de exemplo)
        const pedidoDetalhe = await buscarDetalhesVenda(pedidoId);

        // --- 1. RENDERIZA ITENS ---
        const itensHtml = pedidoDetalhe.itens.map(item => {
            const preco = item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            return `
                <tr>
                    <td>${item.produtoId}</td>
                    <td>${item.nomeProduto}</td>
                    <td>${item.quantidade}</td>
                    <td>${preco}</td>
                    <td>${(item.precoUnitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
            `;
        }).join('');

        // --- 2. RENDERIZA TRANSAÇÕES / CARTÃO ---
        let transacaoInfo = '<p>Nenhuma transação encontrada.</p>';
        if (pedidoDetalhe.transacoes && pedidoDetalhe.transacoes.length > 0) {
            const t = pedidoDetalhe.transacoes[0]; // Pega a primeira transação (ou ajuste conforme sua regra)
            const dataTransacao = new Date(t.data).toLocaleString('pt-BR');
            const valorTransacao = t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // Mascara os 4 primeiros e 4 últimos digitos do cartão
            const numCartaoMascara = t.numeroCartao
                ? `${t.numeroCartao.slice(0, 4)} **** **** ${t.numeroCartao.slice(-4)}`
                : 'N/A';

            transacaoInfo = `
                <table class="tabela-clientes tabela-detalhes-venda" style="margin-top:10px;">
                    <thead>
                        <tr><th>ID Transação</th><th>Cartão</th><th>Nome Cartão</th><th>Data</th><th>Valor</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${t.transacaoId || 'N/A'}</td>
                            <td>${numCartaoMascara}</td>
                            <td>${t.nomeCartao || 'N/A'}</td>
                            <td>${dataTransacao}</td>
                            <td>${valorTransacao}</td>
                            <td>${t.status.replace(/_/g, ' ') || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        // --- 3. MONTA O CONTEÚDO FINAL ---
        const valorTotalPedido = pedidoDetalhe.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const statusPedido = (pedidoDetalhe.status || 'N/A').replace(/_/g, ' ');
        const enderecoEntrega = pedidoDetalhe.enderecoEntrega || {};

        detalhesVendaContent.innerHTML = `
            <h4>Informações Gerais do Pedido</h4>
            <table class="tabela-clientes tabela-detalhes-venda">
                <tr><th>Cliente</th><th>ID Pedido</th><th>Valor Total</th><th>Status</th></tr>
                <tr>
                    <td>${pedidoDetalhe.clienteNome || 'N/A'}</td>
                    <td>${pedidoDetalhe.pedidoId}</td>
                    <td>${valorTotalPedido}</td>
                    <td>${statusPedido}</td>
                </tr>
            </table>
            <h4>Endereço de Entrega</h4>
                <table class="tabela-clientes tabela-detalhes-venda">
                    <tr><th>Rua/Logradouro</th><th>Número</th><th>Bairro</th><th>Cidade</th><th>Estado</th><th>CEP</th></tr>
                    <tr>
                        <td>${enderecoEntrega.logradouro || 'N/A'}</td>
                        <td>${enderecoEntrega.numero || 'N/A'}</td>
                        <td>${enderecoEntrega.bairro || 'N/A'}</td>
                        <td>${enderecoEntrega.cidade || 'N/A'}</td>
                        <td>${enderecoEntrega.estado || 'N/A'}</td>
                        <td>${enderecoEntrega.cep || 'N/A'}</td>
                    </tr>
                </table>
            <h4>Itens do Pedido</h4>
            <table class="tabela-clientes tabela-detalhes-venda">
                <thead>
                    <tr><th>ID Produto</th><th>Nome</th><th>Qtd</th><th>Preço Unitário</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                    ${itensHtml || '<tr><td colspan="5" style="text-align:center;">Nenhum item no pedido.</td></tr>'}
                </tbody>
            </table>

            <h4>Transações</h4>
            ${transacaoInfo}
        `;

    } catch (err) {
        console.error("Erro ao abrir detalhes da venda:", err);
        detalhesVendaContent.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar detalhes: ${err.message}</p>`;
    }
}


function renderizarVendas(vendas) {
    if (!tbodyVendas) return;
    tbodyVendas.innerHTML = "";

    if (vendas.length === 0) {
        tbodyVendas.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma venda encontrada.</td></tr>';
        return;
    }

    vendas.forEach((venda) => {
        const valorTotalFormatado = venda.valorTotal
            ? venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'R$ 0,00';

        const dataVenda = (venda.transacoes && venda.transacoes.length > 0 && venda.transacoes[0].data)
            ? new Date(venda.transacoes[0].data).toLocaleDateString('pt-BR')
            : 'N/A';

        const tr = document.createElement("tr");
        tr.dataset.pedidoId = venda.pedidoId;
        const statusFormatado = (venda.status || 'N/A').replace(/_/g, ' ');

        tr.innerHTML = `
            <td>${venda.pedidoId}</td>
            <td>${venda.clienteNome || 'N/A'}</td>
            <td>${dataVenda}</td>
            <td>${valorTotalFormatado}</td>
            <td>${statusFormatado}</td>
            <td>
              <button class="btn-acao-tabela btnAlterarStatusVenda" data-id="${venda.pedidoId}">
              <i class='bx bx-edit'></i></button>
              <button class="btn-acao-tabela btn-detalhes-venda" data-id="${venda.pedidoId}">
              <i class="fa-solid fa-circle-info"></i></button>
            </td>
          `;

        tbodyVendas.appendChild(tr);

        // Listener para o botão de alterar status
        tr.querySelector(".btnAlterarStatusVenda").addEventListener("click", (e) => {
            const pedidoId = e.currentTarget.dataset.id;
            formStatusVenda.dataset.pedidoId = pedidoId;
            const novoStatusSelect = document.getElementById("novoStatusVenda");
            const statusAtual = venda.status;
            Array.from(novoStatusSelect.options).forEach(option => {
                // Seleciona a opção que coincide com o status
                option.selected = (option.value.toUpperCase().replace(/\s/g, '_') === statusAtual);
            });
            modalStatusVenda.classList.add("active");
        });

        // NOVO Listener para o botão de detalhes
        tr.querySelector(".btn-detalhes-venda").addEventListener("click", (e) => {
            const pedidoId = e.currentTarget.dataset.id;
            abrirModalDetalhesVenda(pedidoId);
        });
    });
}


// --- FUNÇÃO PRINCIPAL DE CARREGAMENTO (EXPORTADA) ---
export async function carregarVendas() {
    if (!tbodyVendas) return;
    tbodyVendas.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando vendas...</td></tr>';

    try {
        const data = await buscarVendasDaApi();
        vendasCarregadas = data;
        vendasCarregadas.sort((a, b) => a.pedidoId - b.pedidoId);
        renderizarVendas(vendasCarregadas);

    } catch (err) {
        console.error("Erro ao carregar vendas:", err);
        tbodyVendas.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Erro ao buscar vendas. Verifique o console.</td></tr>`;
    }
}


// --- INICIALIZAÇÃO DE LISTENERS DO MODAL (Chamado uma vez) ---
export function inicializarListenersVendas() {
    // Listeners para fechar modal Status
    btnFecharStatusVenda?.addEventListener("click", () => modalStatusVenda.classList.remove("active"));
    btnCancelarStatusVenda?.addEventListener("click", () => modalStatusVenda.classList.remove("active"));
    window.addEventListener("click", (e) => {
      if (e.target === modalStatusVenda)
        modalStatusVenda.classList.remove("active");
    });

    // NOVO Listener para fechar modal Detalhes
    // Note que o modalDetalhesVenda usa a classe 'modal-filtro', controlada por .active
    btnFecharDetalhesVenda?.addEventListener("click", () => modalDetalhesVenda.classList.remove("active"));
    window.addEventListener("click", (e) => {
      if (e.target === modalDetalhesVenda)
        modalDetalhesVenda.classList.remove("active");
    });

    // Listener de Submit para alterar status
    formStatusVenda?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const pedidoId = form.dataset.pedidoId;
        const novoStatus = form.querySelector("#novoStatusVenda")?.value;

        if (!pedidoId || !novoStatus) {
            alert("Erro: ID do pedido ou novo status inválido.");
            return;
        }

        try {
            // Rota do seu Controller: /vendas/{pedidoId}/atualizar-status?novoStatus=
            const url = `http://localhost:8080/admin/vendas/${pedidoId}/atualizar-status?novoStatus=${novoStatus}`;            const res = await fetch(url, {
                method: 'PUT', // Seu Controller espera um PUT
                headers: { 'Content-Type': 'application/json' },
                // O corpo não é necessário, pois o novoStatus está na query string
            });

            if (!res.ok) {
                const errorMsg = await res.text();
                throw new Error(errorMsg || `Falha ao atualizar status: ${res.status}`);
            }

            alert(`Status do pedido #${pedidoId} atualizado para: ${novoStatus.replace(/_/g, ' ')}`);

            // 1. Fecha o modal
            modalStatusVenda.classList.remove("active");

            // 2. Recarrega a tabela para ver a alteração
            await carregarVendas(); // Assumindo que esta função existe e recarrega os dados

        } catch (error) {
            console.error("Erro na atualização do status:", error);
            alert("Erro ao atualizar status: " + error.message);
        }
    });
}