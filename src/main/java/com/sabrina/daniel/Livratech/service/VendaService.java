package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.CartaoRepository;
import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.daos.EnderecoRepository;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.dtos.*;
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
import java.util.Optional;
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
//    public CartaoDeCredito salvarCartao(Long clienteId, CartaoDeCredito cartao) {
//        Cliente cliente = clienteRepository.findById(clienteId)
//                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
//        cartao.setCliente(cliente);
//        return cartaoRepository.save(cartao);
//    }
    public List<CartaoDeCredito> salvarCartoes(Long clienteId, List<CartaoDeCredito> cartoes) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        cartoes.forEach(cartao -> cartao.setCliente(cliente));
        return cartaoRepository.saveAll(cartoes);
    }

    public List<CartaoDeCredito> listarCartoesCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        return cliente.getCartoesCredito();
    }

    // ------------------ PEDIDOS ------------------
//    public PedidoDTO finalizarCompra(Long clienteId, Pedido pedido) {
//        Cliente cliente = clienteRepository.findById(clienteId)
//                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
//        pedido.setCliente(cliente);
//
//        // Associa itens ao pedido
//        if (pedido.getItens() != null) {
//            pedido.getItens().forEach(item -> {
//                Produto produto = produtoService.findById(item.getProduto().getId())
//                        .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
//                item.setProduto(produto);
//                item.setPedido(pedido);
//            });
//        }
//
//        // Associa transações
//        if (pedido.getTransacoes() != null) {
//            pedido.getTransacoes().forEach(t -> {
//                t.setPedido(pedido);
//                t.setData(new Date());
//            });
//        }
//
//        // Associa endereço pelo id na tabela de endereços
//        if (pedido.getEnderecoPedido() != null) {
//            Endereco endereco = enderecoRepository.findById(pedido.getEnderecoPedido().getId())
//                    .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
//            pedido.setEnderecoPedido(endereco);
//        }
//
//
//        Pedido pedidoSalvo = pedidoRepository.save(pedido);
//
//        // Mapeia itens para DTO
//        List<ItemDTO> itensDTO = pedidoSalvo.getItens().stream()
//                .map(item -> new ItemDTO(
//                        item.getId(),
//                        item.getProduto().getId(),
//                        item.getQuantidade(),
//                        item.getProduto().getNome(),
//                        item.getProduto().getAutor(),
//                        item.getProduto().getPreco().doubleValue(),
//                        item.getProduto().getImagemUrl()
//                )).toList();
//
//        BigDecimal valorTotal = pedidoSalvo.getTransacoes().stream()
//                .map(t -> t.getValor() != null ? t.getValor() : BigDecimal.ZERO)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        // Endereço usado
//        String enderecoEntrega = pedidoSalvo.getEnderecoPedido() == null ? "" :
//                pedidoSalvo.getEnderecoPedido().getLogradouro() + ", " +
//                        pedidoSalvo.getEnderecoPedido().getNumero() + ", " +
//                        pedidoSalvo.getEnderecoPedido().getBairro() + ", " +
//                        pedidoSalvo.getEnderecoPedido().getCidade() + ", " +
//                        pedidoSalvo.getEnderecoPedido().getEstado() + ", " +
//                        pedidoSalvo.getEnderecoPedido().getCep();
//
//
//        Date dataPedido = pedidoSalvo.getTransacoes().isEmpty() ? new Date() :
//                pedidoSalvo.getTransacoes().get(0).getData();
//
//        String status = pedidoSalvo.getTransacoes().isEmpty() ? "SEM_TRANSACAO" :
//                pedidoSalvo.getTransacoes().get(0).getStatus().name();
//
//        return new PedidoDTO(
//                pedidoSalvo.getId(),
//                dataPedido,
//                status,
//                valorTotal,
//                itensDTO,
//                enderecoEntrega,
//                pedidoSalvo.getTransacoes()
//        );
//    }

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

            // Mapeia transações para DTO (evita erro do Jackson)
            List<TransacaoDTO> transacoesDTO = pedido.getTransacoes().stream()
                    .map(t -> new TransacaoDTO(
                            t.getId(),
                            t.getValor(),
                            t.getStatus() != null ? t.getStatus().name() : "DESCONHECIDO",
                            t.getData(),
                            t.getCartao() != null ? t.getCartao().getBandeira().name() : null,
                            t.getCartao() != null ? t.getCartao().getNumeroCartao().substring(t.getCartao().getNumeroCartao().length() - 4) : null
                    ))
                    .toList();

            // Calcula valor total
            BigDecimal valorTotal = transacoesDTO.stream()
                    .map(t -> t.valor() != null ? t.valor() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Endereço usado no pedido
            String enderecoEntrega = pedido.getEnderecoPedido() == null ? "" :
                    pedido.getEnderecoPedido().getLogradouro() + ", " +
                            pedido.getEnderecoPedido().getNumero() + ", " +
                            pedido.getEnderecoPedido().getBairro() + ", " +
                            pedido.getEnderecoPedido().getCidade() + ", " +
                            pedido.getEnderecoPedido().getEstado() + ", " +
                            pedido.getEnderecoPedido().getCep();

            // Data e status do pedido (usa primeira transação)
            Date dataPedido = pedido.getTransacoes().isEmpty()
                    ? new Date()
                    : pedido.getTransacoes().get(0).getData();

            String status = pedido.getTransacoes().isEmpty()
                    ? "SEM_TRANSACAO"
                    : pedido.getTransacoes().get(0).getStatus().name();

            return new PedidoDTO(
                    pedido.getId(),
                    dataPedido,
                    status,
                    valorTotal,
                    itensDTO,
                    enderecoEntrega,
                    transacoesDTO // ✅ agora usamos DTOs, não entidades
            );
        }).toList();
    }



    public PedidoDTO finalizarCompra(Long clienteId, FinalizarCompraRequest request) {
    Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));


        BigDecimal totalPago = request.transacoes().stream()
                // Obtém o valor de cada transação (garantindo que não seja nulo)
                .map(t -> t.valor() != null ? t.valor() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Calcular o Valor Total do Pedido (usando a nova função)
        BigDecimal valorTotalPedido = calcularValorTotalPedido(request); // <-- CHAMADA AQUI!

        // 3. Comparar
        // O método compareTo retorna 0 se os valores forem iguais.
        if (totalPago.compareTo(valorTotalPedido) != 0) {
            throw new ValidacaoException(
                    "Erro de pagamento: O valor total pago nos cartões (R$ " + totalPago +
                            ") não corresponde ao valor total do pedido (R$ " + valorTotalPedido + ")."
            );
        }

    Pedido pedido = new Pedido();
    pedido.setCliente(cliente);


    // ---------- ENDEREÇO ----------
    if (request.enderecoId() != null) {
        Endereco endereco = enderecoRepository.findById(request.enderecoId())
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
        pedido.setEnderecoPedido(endereco);

        // Se cliente marcar salvar, associa ao perfil
        if (Boolean.TRUE.equals(request.salvarEndereco())) {
            endereco.setCliente(cliente);
            enderecoRepository.save(endereco);
        }
    }

    // ---------- ITENS ----------
    if (request.itens() != null && !request.itens().isEmpty()) {
        List<Item> itens = request.itens().stream().map(itemReq -> {

            Produto produto = produtoService.findById(itemReq.produtoId())
                    .orElseThrow(() -> new ValidacaoException("Produto com ID " + itemReq.produtoId() + " não encontrado"));

            Item item = new Item();
            item.setProduto(produto);
            item.setQuantidade(itemReq.quantidade());
            item.setPedido(pedido);

            return item;
        }).toList();

        pedido.setItens(itens);
    }



    // ---------- TRANSAÇÕES ----------
    if (request.transacoes() != null) {
        List<Transacao> transacoes = request.transacoes().stream().map(t -> {
            Transacao transacao = new Transacao();
            transacao.setValor(t.valor());
            transacao.setStatus(t.status());
            transacao.setData(new Date());
            transacao.setPedido(pedido);

            CartaoDeCredito cartao;
            if (t.cartaoExistenteId() != null) {
                cartao = cartaoRepository.findById(t.cartaoExistenteId())
                        .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));
            } else {
                cartao = t.cartaoNovo();
            }

            if (t.cartaoExistenteId() == null && Boolean.TRUE.equals(t.salvarCartao())) {
                cartao.setCliente(cliente);
                cartaoRepository.save(cartao);
            }

            transacao.setCartao(cartao);
            return transacao;
        }).toList();

        pedido.setTransacoes(transacoes);
    }
        System.out.println("Número de transações a salvar: " + pedido.getTransacoes().size());
    // ---------- SALVAR PEDIDO ----------
    Pedido pedidoSalvo = pedidoRepository.save(pedido);

    // ---------- MAPEAR PARA DTO ----------
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

    String enderecoEntrega = pedidoSalvo.getEnderecoPedido() == null ? "" :
            pedidoSalvo.getEnderecoPedido().getLogradouro() + ", " +
                    pedidoSalvo.getEnderecoPedido().getNumero() + ", " +
                    pedidoSalvo.getEnderecoPedido().getBairro() + ", " +
                    pedidoSalvo.getEnderecoPedido().getCidade() + ", " +
                    pedidoSalvo.getEnderecoPedido().getEstado() + ", " +
                    pedidoSalvo.getEnderecoPedido().getCep();

    Date dataPedido = pedidoSalvo.getTransacoes().isEmpty() ? new Date() :
            pedidoSalvo.getTransacoes().get(0).getData();

    String status = pedidoSalvo.getTransacoes().isEmpty() ? "SEM_TRANSACAO" :
            pedidoSalvo.getTransacoes().get(0).getStatus().name();

        List<TransacaoDTO> transacoesDTO = pedidoSalvo.getTransacoes().stream()
                .map(transacao -> new TransacaoDTO(
                        transacao.getId(),
                        transacao.getValor(),
                        transacao.getStatus() != null ? transacao.getStatus().name() : null,
                        transacao.getData(),
                        transacao.getCartao() != null ? transacao.getCartao().getBandeira().name() : null, // bandeira
                        transacao.getCartao() != null ? transacao.getCartao().getNumeroCartao().substring(
                                Math.max(0, transacao.getCartao().getNumeroCartao().length() - 4)
                        ) : null // últimos 4 dígitos
                ))
                .toList();


        return new PedidoDTO(
                pedidoSalvo.getId(),
                dataPedido,
                status,
                valorTotal,
                itensDTO,
                enderecoEntrega,
                transacoesDTO
        );
    }
    // VendaService.java

    private BigDecimal calcularValorTotalPedido(FinalizarCompraRequest request) {

        BigDecimal valorTotalItens = request.itens().stream()
                .map(itemReq -> {
                    Produto produto = produtoService.findById(itemReq.produtoId())
                            .orElseThrow(() -> new ValidacaoException("Produto com ID " + itemReq.produtoId() + " não encontrado"));

                    // CORREÇÃO APLICADA AQUI:
                    // Converte o retorno de produto.getPreco() (que deve ser Double) para BigDecimal
                    return BigDecimal.valueOf(produto.getPreco())
                            .multiply(BigDecimal.valueOf(itemReq.quantidade()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal valorTotalPedido = valorTotalItens;

        return valorTotalPedido;
    }
}