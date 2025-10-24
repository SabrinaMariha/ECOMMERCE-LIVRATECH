package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.FiltroCliente;
import com.sabrina.daniel.Livratech.dtos.PedidoDTO;
import com.sabrina.daniel.Livratech.dtos.ItemDTO;
import com.sabrina.daniel.Livratech.enums.Status;
import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Pedido;
import com.sabrina.daniel.Livratech.model.Transacao;
import com.sabrina.daniel.Livratech.negocio.IStrategy;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {
    Map<String, List<IStrategy>> rns = new HashMap<>();
    List<IStrategy> regrasCliente = new ArrayList<>();
    Map<String, JpaRepository> repositories = new HashMap<>();

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;

    @Autowired
    public AdminService(ClienteRepository clienteRepository, PedidoRepository pedidoRepository) {
        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;

        rns.put(Cliente.class.getName(), regrasCliente);
        repositories.put(Cliente.class.getName(), clienteRepository);
        repositories.put(Pedido.class.getName(), pedidoRepository);
    }

    public List<Cliente> findAll(FiltroCliente clienteASerConsultado) {
        return clienteRepository.findAllByFiltros(clienteASerConsultado);
    }

    public DadosConsultaCliente findDTOById(Long id) throws Exception {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new Exception("Cliente não encontrado"));
        return toDTO(cliente);
    }

    public DadosConsultaCliente toDTO(Cliente cliente) {
        return new DadosConsultaCliente(
                cliente.getId(), cliente.getNome(), cliente.getGenero(), cliente.getDataNascimento(),
                cliente.getCpf(), List.copyOf(cliente.getTelefones()), cliente.getEmail(),
                cliente.getStatus(), List.copyOf(cliente.getEnderecos()), List.copyOf(cliente.getCartoesCredito())
        );
    }

    public DadosConsultaCliente inativarPorId(long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado"));
        cliente.setStatus(Status.INATIVO);
        clienteRepository.save(cliente);
        return toDTO(cliente);
    }

    public List<PedidoDTO> listarTodosPedidos(StatusCompra status) {
        List<Pedido> pedidos = (status != null)
                ? pedidoRepository.findPedidosComDetalhesByStatus(status)
                : pedidoRepository.findAllPedidosComDetalhes();

        return pedidos.stream().map(this::mapPedidoToDTO).toList();
    }

    public PedidoDTO atualizarStatusPedido(Long pedidoId, StatusCompra novoStatus) {
        Pedido pedido = pedidoRepository.findByIdWithTransacoes(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com ID: " + pedidoId));

        if (pedido.getTransacoes() == null || pedido.getTransacoes().isEmpty()) {
            throw new IllegalStateException("Pedido não possui transações para atualizar o status.");
        }

        Transacao transacaoPrincipal = pedido.getTransacoes().get(0);
        StatusCompra statusAtual = transacaoPrincipal.getStatus();

        if (!isTransicaoValida(statusAtual, novoStatus)) {
            throw new IllegalStateException("Transição de status inválida de " + statusAtual + " para " + novoStatus);
        }

        transacaoPrincipal.setStatus(novoStatus);
        return mapPedidoToDTO(pedido);
    }

    private boolean isTransicaoValida(StatusCompra atual, StatusCompra novo) {
        if (atual == StatusCompra.APROVADA && novo == StatusCompra.EM_TRANSITO) return true;
        if (atual == StatusCompra.EM_TRANSITO && novo == StatusCompra.ENTREGUE) return true;
        return false;
    }

    private PedidoDTO mapPedidoToDTO(Pedido pedido) {
        List<ItemDTO> itensDTO = pedido.getItens().stream()
                .map(item -> new ItemDTO(
                        item.getId(),
                        item.getProduto().getId(),
                        item.getQuantidade(),
                        item.getProduto().getNome(),
                        item.getProduto().getAutor(),
                        item.getProduto().getPreco() != null ? item.getProduto().getPreco() : 0.0,
                        item.getProduto().getImagemUrl()
                )).toList();

        BigDecimal valorTotal = BigDecimal.ZERO;
        String status = "SEM_TRANSACAO";
        Date dataPedido = pedido.getId() != null ? new Date() : null;

        if (pedido.getTransacoes() != null && !pedido.getTransacoes().isEmpty()) {
            Transacao transacaoPrincipal = pedido.getTransacoes().get(0);
            status = transacaoPrincipal.getStatus() != null ? transacaoPrincipal.getStatus().name() : "STATUS_NULO";
            dataPedido = transacaoPrincipal.getData() != null ? transacaoPrincipal.getData() : dataPedido;

            valorTotal = pedido.getTransacoes().stream()
                    .map(t -> t.getValor() != null ? t.getValor() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        String enderecoEntrega = pedido.getEnderecoPedido() != null
                ? pedido.getEnderecoPedido().getLogradouro() + ", " +
                pedido.getEnderecoPedido().getNumero() + " - " +
                pedido.getEnderecoPedido().getCidade()
                : "Endereço não informado";

        String cartaoUtilizado = (pedido.getCartaoPedido() != null &&
                pedido.getCartaoPedido().getNumeroCartao() != null &&
                pedido.getCartaoPedido().getNumeroCartao().length() >= 4)
                ? "**** **** **** " + pedido.getCartaoPedido().getNumeroCartao()
                .substring(pedido.getCartaoPedido().getNumeroCartao().length() - 4)
                : "Cartão não informado";

        String nomeCliente = pedido.getCliente() != null ? pedido.getCliente().getNome() : "Cliente não informado";

        return new PedidoDTO(
                pedido.getId(),
                dataPedido,
                status,
                valorTotal,
                itensDTO,
                enderecoEntrega,
                cartaoUtilizado,
                nomeCliente
        );
    }
}
