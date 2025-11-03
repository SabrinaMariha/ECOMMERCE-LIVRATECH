package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.ItemRepository;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.daos.SolicitacaoTrocaRepository;
import com.sabrina.daniel.Livratech.dtos.SolicitacaoTrocaDTO;
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

    private SolicitacaoTrocaDTO toDTO(SolicitacaoTroca solicitacao) {
        if (solicitacao == null) {
            return null;
        }
        Long pedidoId = (solicitacao.getPedido() != null) ? solicitacao.getPedido().getId() : null;
        Long itemId = (solicitacao.getItem() != null) ? solicitacao.getItem().getId() : null;
        String nomeProduto = "N/A";
        if (solicitacao.getItem() != null && solicitacao.getItem().getProduto() != null) {
            nomeProduto = solicitacao.getItem().getProduto().getNome();
        }

        String clienteNome = "N/A";
        if (solicitacao.getPedido() != null && solicitacao.getPedido().getCliente() != null) {
            clienteNome = solicitacao.getPedido().getCliente().getNome();
        }

        return new SolicitacaoTrocaDTO(
                solicitacao.getId(),
                pedidoId,
                itemId,
                nomeProduto,
                clienteNome,
                solicitacao.getMotivo(),
                solicitacao.getDataSolicitacao(),
                solicitacao.getStatus()
        );
    }

    public SolicitacaoTrocaDTO solicitarTrocaItem(Long pedidoId, Long itemId, String motivo) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido com ID " + pedidoId + " não encontrado."));

        if (pedido.getStatus() != StatusCompra.ENTREGUE) {
            throw new ValidacaoException("Não é possível solicitar troca para pedidos que não foram entregues. Status atual: " + pedido.getStatus());
        }

        Item itemParaTrocar = pedido.getItens().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ValidacaoException("Item com ID " + itemId + " não encontrado no pedido " + pedidoId + "."));

        SolicitacaoTroca novaSolicitacao = new SolicitacaoTroca();
        novaSolicitacao.setPedido(pedido);
        novaSolicitacao.setItem(itemParaTrocar);
        novaSolicitacao.setMotivo(motivo);
        novaSolicitacao.setDataSolicitacao(LocalDateTime.now());
        novaSolicitacao.setStatus(StatusTroca.PENDENTE);

        SolicitacaoTroca solicitacaoSalva = solicitacaoTrocaRepository.save(novaSolicitacao);

        pedido.setStatus(StatusCompra.EM_TROCA);
        pedidoRepository.save(pedido);

        return toDTO(solicitacaoSalva);
    }

    public List<SolicitacaoTrocaDTO> listarTrocasPorCliente(Long clienteId) {
        List<SolicitacaoTroca> solicitacoes = solicitacaoTrocaRepository.findByPedidoClienteId(clienteId);
        return solicitacoes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SolicitacaoTrocaDTO> listarTodasSolicitacoesAdmin() {
        // Usa o novo método do repositório
        List<SolicitacaoTroca> solicitacoes = solicitacaoTrocaRepository.findAllByOrderByDataSolicitacaoDesc();
        return solicitacoes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}