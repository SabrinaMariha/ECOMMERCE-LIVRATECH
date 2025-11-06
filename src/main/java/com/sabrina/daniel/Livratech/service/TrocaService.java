package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.*;
import com.sabrina.daniel.Livratech.dtos.SolicitacaoTrocaDTO;
import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.enums.StatusTroca;
import com.sabrina.daniel.Livratech.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException; // Importar
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrocaService {

    private final PedidoRepository pedidoRepository;
    private final ItemRepository itemRepository;
    private final SolicitacaoTrocaRepository solicitacaoTrocaRepository;
    private final CupomRepository cupomRepository;
    private final ClienteRepository clienteRepository;


    @Autowired
    public TrocaService(PedidoRepository pedidoRepository,
                        ItemRepository itemRepository,
                        SolicitacaoTrocaRepository solicitacaoTrocaRepository,
                        CupomRepository cupomRepository, ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;

        this.cupomRepository = cupomRepository;
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
        List<SolicitacaoTroca> solicitacoes = solicitacaoTrocaRepository.findAllByOrderByDataSolicitacaoDesc();
        return solicitacoes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // --- MÉTODO ATUALIZADO ---
    public SolicitacaoTrocaDTO atualizarStatusTrocaAdmin(Long solicitacaoId, String novoStatusStr) {
        // 1. Encontrar a solicitação
        SolicitacaoTroca solicitacao = solicitacaoTrocaRepository.findById(solicitacaoId)
                .orElseThrow(() -> new NoSuchElementException("Solicitação de troca ID " + solicitacaoId + " não encontrada."));

        // 2. Converter String para Enum
        StatusTroca novoStatus;
        try {
            // Converte a string (ex: "AUTORIZADA") para o enum
            novoStatus = StatusTroca.valueOf(novoStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidacaoException("Status de troca inválido: " + novoStatusStr);
        }

        // 3. Atualizar o status da solicitação
        solicitacao.setStatus(novoStatus);
        SolicitacaoTroca solicitacaoSalva = solicitacaoTrocaRepository.save(solicitacao);

        // 4. Atualizar o status do Pedido principal
        Pedido pedido = solicitacao.getPedido();
        if (pedido != null) {
            switch (novoStatus) {
                case AUTORIZADA:
                    pedido.setStatus(StatusCompra.TROCA_AUTORIZADA);
                    break;
                case RECEBIDA: // "Concluída" no front-end
                    pedido.setStatus(StatusCompra.TROCADO);
                    // TODO: Adicionar lógica para retornar item ao estoque se necessário

                    cupomRepository.save(gerarCupomDeTroca(solicitacao));

                    break;
                case RECUSADA:
                    // Se recusada, o pedido volta ao status "Entregue" (pois a troca não vai acontecer)
                    pedido.setStatus(StatusCompra.ENTREGUE);
                    break;
                case PENDENTE:
                    // Se voltou para pendente, o pedido fica "Em Troca"
                    pedido.setStatus(StatusCompra.EM_TROCA);
                    break;
            }
            pedidoRepository.save(pedido);
        }

        return toDTO(solicitacaoSalva);
    }

    public void gerarCupomDeTrocaPorPagamento(Long clienteId, Double valor){
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);
        Cupom cupom = new Cupom();
        cupom.setCliente(cliente.get());
        cupom.setValor(valor);
        cupom.setDescricao("CUPOM DE TROCA");
       cupomRepository.save(cupom);
    }
    public Cupom gerarCupomDeTroca(SolicitacaoTroca solicitacao){
        Cliente cliente = solicitacao.getPedido().getCliente();
        Cupom cupom = new Cupom();
        cupom.setCliente(cliente);
        cupom.setValor(solicitacao.getItem().getProduto().getPreco());
        cupom.setDescricao("CUPOM DE TROCA");
        return cupom;
    }

    public SolicitacaoTrocaDTO autorizarTroca(Long solicitacaoId) {
        // Este método agora pode usar o novo
        return atualizarStatusTrocaAdmin(solicitacaoId, "AUTORIZADA");
    }

    public SolicitacaoTrocaDTO confirmarRecebimentoTroca(Long solicitacaoId, boolean retornarEstoque) {
        // TODO: Adicionar lógica de 'retornarEstoque'
        return atualizarStatusTrocaAdmin(solicitacaoId, "RECEBIDA");
    }

    public void deletarCupomDeTroca(Long cupomId) {
        cupomRepository.deleteById(cupomId);
    }
}