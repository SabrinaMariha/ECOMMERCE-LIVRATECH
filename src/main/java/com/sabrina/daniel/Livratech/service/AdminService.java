package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.FiltroCliente;
import com.sabrina.daniel.Livratech.enums.Status;
import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.model.Pedido;
import com.sabrina.daniel.Livratech.negocio.IStrategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class AdminService {
    Map<String, List<IStrategy>> rns = new HashMap<String, List<IStrategy>>();

    List<IStrategy> regrasCliente = new ArrayList<IStrategy>();

    Map<String, JpaRepository> repositories = new HashMap<String, JpaRepository>();

    ClienteRepository clienteRepository;
    PedidoRepository pedidoRepository;

    public AdminService(ClienteRepository clienteRepository, PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;


        rns.put(Cliente.class.getName(), regrasCliente);

        repositories.put(Cliente.class.getName(),  clienteRepository);
    }



    public List<Cliente> findAll(FiltroCliente clienteASerConsultado) {
        List<Cliente> clientes = clienteRepository.findAllByFiltros(clienteASerConsultado);
        return clientes;
    }
    public DadosConsultaCliente findDTOById(Long id) throws Exception {
        Cliente cliente = clienteRepository.findById(id).orElseThrow(() -> new Exception("Cliente não encontrado"));
        return toDTO(cliente);
    }

    public DadosConsultaCliente toDTO(Cliente cliente) {
        return new DadosConsultaCliente(
                cliente.getId(),
                cliente.getNome(),
                cliente.getGenero(),
                cliente.getDataNascimento(),
                cliente.getCpf(),
                List.copyOf(cliente.getTelefones()), // evita mutabilidade externa
                cliente.getEmail(),
                cliente.getStatus(),
                List.copyOf(cliente.getEnderecos()),
                List.copyOf(cliente.getCartoesCredito())
        );
    }

    public DadosConsultaCliente inativarPorId(long id) {
        Cliente cliente = clienteRepository.findById(id).orElseThrow();
        cliente.setStatus(Status.INATIVO);
        clienteRepository.save(cliente);
        return toDTO(cliente);
    }


    public List<Map<String, Object>> buscarVendas() {
        return pedidoRepository.findAll().stream().map(pedido -> {
            Map<String, Object> vendaDetalhes = new HashMap<>();
            vendaDetalhes.put("pedidoId", pedido.getId());
            vendaDetalhes.put("clienteNome", pedido.getCliente().getNome());
            vendaDetalhes.put("status", pedido.getStatus());
            List<Map<String, Object>> transacoesDetalhes = new ArrayList<>();
            pedido.getTransacoes().forEach(transacao -> {
                Map<String, Object> transacaoDetalhe = new HashMap<>();
                transacaoDetalhe.put("transacaoId", transacao.getId());
                transacaoDetalhe.put("status", transacao.getStatus());
                transacaoDetalhe.put("valor", transacao.getValor());
                transacaoDetalhe.put("data", transacao.getData());

                CartaoDeCredito cartao = transacao.getCartao();

                if (cartao != null) {
                    transacaoDetalhe.put("numeroCartao", cartao.getNumeroCartao());
                    transacaoDetalhe.put("nomeCartao", cartao.getNomeImpresso());
                } else {
                    transacaoDetalhe.put("numeroCartao", "N/A");
                    transacaoDetalhe.put("nomeCartao", "N/A");
                }

                transacoesDetalhes.add(transacaoDetalhe);
            });
            vendaDetalhes.put("transacoes", transacoesDetalhes);
            vendaDetalhes.put("valorTotal", pedido.getValorTotal());
            return vendaDetalhes;
        }).toList();

    }

    public Map<String, Object> buscarDetalhesDoPedido(Long pedidoId) {

        // 1. BUSCA O PEDIDO ESPECÍFICO PELO ID
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NoSuchElementException("Pedido não encontrado com ID: " + pedidoId));

        // 2. MAPEA OS DETALHES DESTE ÚNICO PEDIDO
        Map<String, Object> pedidoDetalhes = new HashMap<>();

        // Adiciona campos de nível superior
        pedidoDetalhes.put("pedidoId", pedido.getId());
        pedidoDetalhes.put("valorTotal", pedido.getValorTotal()); // Assumindo que Pedido tem getValorTotal()
        pedidoDetalhes.put("status", pedido.getStatus());
        pedidoDetalhes.put("clienteNome", pedido.getCliente().getNome());
         //endereço
        Endereco endereco = pedido.getEnderecoPedido();
        if (endereco != null) {
            Map<String, Object> enderecoDetalhe = new HashMap<>();

            // Mapeie apenas os campos necessários para a exibição no Front-End
            enderecoDetalhe.put("logradouro", endereco.getLogradouro() != null ? endereco.getLogradouro() : "N/A"); // Usando logradouro (Rua/Av)
            enderecoDetalhe.put("numero", endereco.getNumero() != null ? endereco.getNumero() : "N/A");
            enderecoDetalhe.put("bairro", endereco.getBairro() != null ? endereco.getBairro() : "N/A");
            enderecoDetalhe.put("cidade", endereco.getCidade() != null ? endereco.getCidade() : "N/A");
            enderecoDetalhe.put("estado", endereco.getEstado() != null ? endereco.getEstado() : "N/A");
            enderecoDetalhe.put("cep", endereco.getCep() != null ? endereco.getCep() : "N/A");

            pedidoDetalhes.put("enderecoEntrega", enderecoDetalhe); // Adiciona o mapa de endereço
        } else {
            pedidoDetalhes.put("enderecoEntrega", null); // Garante que o Front-End saiba que não há endereço
        }

        // Mapeamento dos Itens
        List<Map<String, Object>> itensDetalhes = new ArrayList<>();
        pedido.getItens().forEach(item -> {
            Map<String, Object> itemDetalhe = new HashMap<>();
            itemDetalhe.put("produtoId", item.getProduto().getId());
            itemDetalhe.put("nomeProduto", item.getProduto().getNome());
            itemDetalhe.put("quantidade", item.getQuantidade());
            itemDetalhe.put("precoUnitario", item.getProduto().getPreco());
            itensDetalhes.add(itemDetalhe);
        });
        pedidoDetalhes.put("itens", itensDetalhes);

        // Mapeamento das Transações
        List<Map<String, Object>> transacoesDetalhes = new ArrayList<>();
        pedido.getTransacoes().forEach(transacao -> {
            Map<String, Object> transacaoDetalhe = new HashMap<>();
            transacaoDetalhe.put("transacaoId", transacao.getId());
            transacaoDetalhe.put("status", transacao.getStatus());
            transacaoDetalhe.put("valor", transacao.getValor());
            transacaoDetalhe.put("data", transacao.getData());

            CartaoDeCredito cartao = transacao.getCartao();

            if (cartao != null) {
                transacaoDetalhe.put("numeroCartao", cartao.getNumeroCartao());
                transacaoDetalhe.put("nomeCartao", cartao.getNomeImpresso());
            } else {
                transacaoDetalhe.put("numeroCartao", "N/A");
                transacaoDetalhe.put("nomeCartao", "N/A");
            }

            transacoesDetalhes.add(transacaoDetalhe);
        });
        pedidoDetalhes.put("transacoes", transacoesDetalhes);

        // 3. RETORNA O ÚNICO MAPA DE DETALHES
        return pedidoDetalhes;
    }

    @Transactional // Garante que a operação de persistência seja concluída
    public void atualizarStatusDoPedido(Long pedidoId, String novoStatus) throws IllegalArgumentException, NoSuchElementException {

            // 1. Encontra o Pedido
            Pedido pedido = pedidoRepository.findById(pedidoId)
                    .orElseThrow(() -> new NoSuchElementException("Pedido não encontrado com ID: " + pedidoId));

            // 2. Converte a String de status para o Enum
            StatusCompra novoStatusEnum;
            try {
                novoStatusEnum = StatusCompra.valueOf(novoStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Lança uma exceção se o status fornecido não for válido
                throw new IllegalArgumentException("Status de compra inválido: " + novoStatus);
            }

            // 3. Atualiza o status
            pedido.setStatus(novoStatusEnum);

            // 4. Salva a mudança no banco de dados
            pedidoRepository.save(pedido);

            // Você pode adicionar aqui lógica de log ou notificação, se necessário.


    }
}
