package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.CartaoRepository;
import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.daos.EnderecoRepository;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.ItemDTO;
import com.sabrina.daniel.Livratech.dtos.PedidoDTO;
import com.sabrina.daniel.Livratech.model.*;
import com.sabrina.daniel.Livratech.negocio.IStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VendaService {

    private final EnderecoRepository enderecoRepository;
    private final ClienteRepository clienteRepository;
    private final CartaoRepository cartaoRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoService produtoService;

    @Autowired
    public VendaService(EnderecoRepository enderecoRepository,
                        PedidoRepository pedidoRepository,
                        ClienteRepository clienteRepository,
                        CartaoRepository cartaoRepository,
                        ProdutoService produtoService) {
        this.enderecoRepository = enderecoRepository;
        this.clienteRepository = clienteRepository;
        this.cartaoRepository = cartaoRepository;
        this.pedidoRepository = pedidoRepository;
        this.produtoService = produtoService;
    }

    // ------------------ ENDEREÇOS ------------------
    public Endereco salvarEndereco(Long idCliente, Endereco enderecoNovo) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com id: " + idCliente));

        enderecoNovo.setCliente(cliente);
        return enderecoRepository.save(enderecoNovo);
    }


    public List<Endereco> listarEnderecosCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        return cliente.getEnderecos();
    }

    // ------------------ CARTÕES ------------------
    public CartaoDeCredito salvarCartao(Long clienteId, CartaoDeCredito cartao) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        cartao.setCliente(cliente);
        return cartaoRepository.save(cartao);
    }

    public List<CartaoDeCredito> listarCartoesCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        return cliente.getCartoesCredito();
    }

    // ------------------ PEDIDOS ------------------
    public PedidoDTO finalizarCompra(Long clienteId, Pedido pedido) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        pedido.setCliente(cliente);

        // Associa itens ao pedido
        if (pedido.getItens() != null) {
            pedido.getItens().forEach(item -> {
                Produto produto = produtoService.findById(item.getProduto().getId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
                item.setProduto(produto);
                item.setPedido(pedido);
            });
        }

        // Associa transações
        if (pedido.getTransacoes() != null) {
            pedido.getTransacoes().forEach(t -> {
                t.setPedido(pedido);
                t.setData(new Date());
            });
        }

        // Associa endereço e cartão existentes pelo id
        if (pedido.getEnderecoPedido() != null) {
            Endereco endereco = enderecoRepository.findById(pedido.getEnderecoPedido().getId())
                    .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
            pedido.setEnderecoPedido(endereco);
        }

        if (pedido.getCartaoPedido() != null) {
            CartaoDeCredito cartao = cartaoRepository.findById(pedido.getCartaoPedido().getId())
                    .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));
            pedido.setCartaoPedido(cartao);
        }

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // Mapeia itens para DTO
        List<ItemDTO> itensDTO = pedidoSalvo.getItens().stream()
                .map(item -> new ItemDTO(
                        item.getId(),
                        item.getProduto().getId(),
                        item.getQuantidade(),
                        item.getProduto().getNome(),
                        item.getProduto().getAutor(),
                        item.getProduto().getPreco().doubleValue(),
                        item.getProduto().getImagemUrl()
                )).toList();

        BigDecimal valorTotal = pedidoSalvo.getTransacoes().stream()
                .map(t -> t.getValor() != null ? t.getValor() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Endereço usado
        String enderecoEntrega = pedidoSalvo.getEnderecoPedido() == null ? "" :
                pedidoSalvo.getEnderecoPedido().getLogradouro() + ", " +
                        pedidoSalvo.getEnderecoPedido().getNumero() + ", " +
                        pedidoSalvo.getEnderecoPedido().getBairro() + ", " +
                        pedidoSalvo.getEnderecoPedido().getCidade() + ", " +
                        pedidoSalvo.getEnderecoPedido().getEstado() + ", " +
                        pedidoSalvo.getEnderecoPedido().getCep();

        // Cartão usado (somente últimos 4 dígitos)
        String cartaoUtilizado = pedidoSalvo.getCartaoPedido() == null ? "" :
                "**** **** **** " + pedidoSalvo.getCartaoPedido().getNumeroCartao().substring(
                        pedidoSalvo.getCartaoPedido().getNumeroCartao().length() - 4
                );

        Date dataPedido = pedidoSalvo.getTransacoes().isEmpty() ? new Date() :
                pedidoSalvo.getTransacoes().get(0).getData();

        String status = pedidoSalvo.getTransacoes().isEmpty() ? "SEM_TRANSACAO" :
                pedidoSalvo.getTransacoes().get(0).getStatus().name();

        return new PedidoDTO(
                pedidoSalvo.getId(),
                dataPedido,
                status,
                valorTotal,
                itensDTO,
                enderecoEntrega,
                cartaoUtilizado
        );
    }

    public List<PedidoDTO> listarPedidosDoCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        List<Pedido> pedidos = pedidoRepository.findPedidosComItensPorCliente(clienteId);

        return pedidos.stream().map(pedido -> {
            // Mapeia itens para DTO
            List<ItemDTO> itensDTO = pedido.getItens().stream()
                    .map(item -> new ItemDTO(
                            item.getId(),
                            item.getProduto().getId(),
                            item.getQuantidade(),
                            item.getProduto().getNome(),
                            item.getProduto().getAutor(),
                            item.getProduto().getPreco().doubleValue(),
                            item.getProduto().getImagemUrl()
                    ))
                    .toList();

            // Calcula valor total
            BigDecimal valorTotal = pedido.getTransacoes().stream()
                    .map(t -> t.getValor() != null ? t.getValor() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Endereço usado no pedido
            String enderecoEntrega = pedido.getEnderecoPedido() == null ? "" :
                    pedido.getEnderecoPedido().getLogradouro() + ", " +
                            pedido.getEnderecoPedido().getNumero() + ", " +
                            pedido.getEnderecoPedido().getBairro() + ", " +
                            pedido.getEnderecoPedido().getCidade() + ", " +
                            pedido.getEnderecoPedido().getEstado() + ", " +
                            pedido.getEnderecoPedido().getCep();

            // Cartão usado no pedido (últimos 4 dígitos)
            String cartaoUtilizado = pedido.getCartaoPedido() == null ? "" :
                    "**** **** **** " + pedido.getCartaoPedido().getNumeroCartao()
                            .substring(pedido.getCartaoPedido().getNumeroCartao().length() - 4);

            // Data do pedido (pega a primeira transação como referência)
            Date dataPedido = pedido.getTransacoes().isEmpty() ? new Date() :
                    pedido.getTransacoes().get(0).getData();

            // Status do pedido (pega a primeira transação como referência)
            String status = pedido.getTransacoes().isEmpty() ? "SEM_TRANSACAO" :
                    pedido.getTransacoes().get(0).getStatus().name();

            return new PedidoDTO(
                    pedido.getId(),
                    dataPedido,
                    status,
                    valorTotal,
                    itensDTO,
                    enderecoEntrega,
                    cartaoUtilizado
            );
        }).toList();
    }
}
