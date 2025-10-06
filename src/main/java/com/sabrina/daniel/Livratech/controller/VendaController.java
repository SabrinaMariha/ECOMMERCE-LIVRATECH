package com.sabrina.daniel.Livratech.controller;


import com.sabrina.daniel.Livratech.dtos.AlterarSenhaCliente;
import com.sabrina.daniel.Livratech.dtos.DadosClienteResponse;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.PedidoResponse;
import com.sabrina.daniel.Livratech.model.*;
import com.sabrina.daniel.Livratech.service.ClienteService;
import com.sabrina.daniel.Livratech.service.ProdutoService;
import com.sabrina.daniel.Livratech.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/cliente")
    public class VendaController {
    @Autowired
    private VendaService vendaService;
    @Autowired
    private ClienteService clienteService;
    @Autowired
    private ProdutoService produtoService;

    @GetMapping("/{id}")
    public ResponseEntity< DadosClienteResponse> buscarPorId(@PathVariable long id) throws Exception {
        DadosConsultaCliente dto = clienteService.findDTOById(id);
        DadosClienteResponse response = new DadosClienteResponse(dto.enderecos(), dto.cartoesCredito());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/endereco")
    public ResponseEntity<?> cadastrarNovoEndereco(@PathVariable Long id, @RequestBody Endereco endereco) {
        try {
            Endereco enderecoSalvo = vendaService.salvarEndereco(id, endereco);
            return ResponseEntity.ok(enderecoSalvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cartao")
    public ResponseEntity<?> cadastrarNovoCartao(@PathVariable Long id, @RequestBody CartaoDeCredito cartao) {
        try {
            CartaoDeCredito cartaoSalvo = vendaService.salvarCartao(id, cartao);
            return ResponseEntity.ok(cartaoSalvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/{id}/finalizar-compra")
    public ResponseEntity<?> finalizarCompra(@PathVariable Long id, @RequestBody Pedido pedido) {
        try {
            Cliente cliente = clienteService.findById(id);

            pedido.setCliente(cliente);

            // Define data da transação
            pedido.getTransacoes().forEach(t -> {
                t.setPedido(pedido);
                t.setData(new java.util.Date());
            });

            // Associa os itens ao pedido
            pedido.getItens().forEach(item -> {
                Long produtoId = item.getProduto().getId();
                Produto produto = produtoService.findById(produtoId).orElse(null);
                item.setProduto(produto);
            });

            Pedido pedidoSalvo = vendaService.salvarPedido(pedido); // precisa criar método no service

            return ResponseEntity.ok(new PedidoResponse(
                    pedidoSalvo.getId(),
                    pedidoSalvo.getTransacoes().get(0).getValor(),
                    pedidoSalvo.getItens()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/pedidos")
    public ResponseEntity<?> listarPedidosPorCliente(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.findById(id);
            List<Pedido> pedidos = cliente.getPedidos();
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pedidos")
    public ResponseEntity<?> listarTodosPedidos() {
        try {
            List<Pedido> pedidos = vendaService.listarTodosPedidos();
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
