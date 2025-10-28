package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.ItemRepository;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.daos.SolicitacaoTrocaRepository;
import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.enums.StatusTroca;
import com.sabrina.daniel.Livratech.model.Item;
import com.sabrina.daniel.Livratech.model.Pedido;
import com.sabrina.daniel.Livratech.model.SolicitacaoTroca;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrocaService {

    private final PedidoRepository pedidoRepository;
    private final ItemRepository itemRepository;
    private final SolicitacaoTrocaRepository solicitacaoTrocaRepository;

    @Autowired
    public TrocaService(PedidoRepository pedidoRepository,
                        ItemRepository itemRepository,
                        SolicitacaoTrocaRepository solicitacaoTrocaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.itemRepository = itemRepository;
        this.solicitacaoTrocaRepository = solicitacaoTrocaRepository;
    }

    public SolicitacaoTroca solicitarTrocaItem(Long pedidoId, Long itemId, String motivo) {
        // 1. Buscar o Pedido
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido com ID " + pedidoId + " não encontrado."));

        // 2. Validar Status do Pedido (RN0043)
        if (pedido.getStatus() != StatusCompra.ENTREGUE) {
            throw new ValidacaoException("Não é possível solicitar troca para pedidos que não foram entregues. Status atual: " + pedido.getStatus());
        }

        // 3. Buscar o Item específico dentro do pedido
        Item itemParaTrocar = pedido.getItens().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ValidacaoException("Item com ID " + itemId + " não encontrado no pedido " + pedidoId + "."));

        // 4. Criar a Solicitação de Troca
        SolicitacaoTroca novaSolicitacao = new SolicitacaoTroca();
        novaSolicitacao.setPedido(pedido);
        novaSolicitacao.setItem(itemParaTrocar);
        novaSolicitacao.setMotivo(motivo);
        novaSolicitacao.setDataSolicitacao(LocalDateTime.now());
        novaSolicitacao.setStatus(StatusTroca.PENDENTE); // Status inicial

        // 5. Salvar a Solicitação de Troca
        SolicitacaoTroca solicitacaoSalva = solicitacaoTrocaRepository.save(novaSolicitacao);

        // 6. (Opcional - Decidir se o status do pedido principal muda para EM_TROCA - RN0041)
        // Se você decidir que *qualquer* solicitação de item muda o status do pedido inteiro:
        // pedido.setStatus(StatusCompra.EM_TROCA);
        // pedidoRepository.save(pedido);
        // Nota: Considere se isso faz sentido. Talvez seja melhor manter o pedido como ENTREGUE
        // e gerenciar o status apenas na SolicitacaoTroca.

        // 7. Retornar a solicitação salva
        return solicitacaoSalva;
    }

    public List<SolicitacaoTroca> listarTrocasPorCliente(Long clienteId) {
        return solicitacaoTrocaRepository.findByPedidoClienteId(clienteId);
    }
}