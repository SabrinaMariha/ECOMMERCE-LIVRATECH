package com.sabrina.daniel.Livratech.controller;


import com.sabrina.daniel.Livratech.dtos.*;
import com.sabrina.daniel.Livratech.model.*;
import com.sabrina.daniel.Livratech.service.ClienteService;
import com.sabrina.daniel.Livratech.service.ProdutoService;
import com.sabrina.daniel.Livratech.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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

    // ------------------ ENDEREÇOS ------------------
    @PostMapping("/{id}/endereco")
    public ResponseEntity<?> cadastrarNovoEndereco(@PathVariable Long id, @RequestBody Endereco endereco) {
        try {
            // garante que a frase será preenchida pelo @PrePersist
            endereco.setFraseIdentificadora(null);

            Endereco enderecoSalvo = vendaService.salvarEndereco(id, endereco);
            return ResponseEntity.ok(enderecoSalvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/{id}/enderecos")
    public ResponseEntity<List<Endereco>> listarEnderecos(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.listarEnderecosCliente(id));
    }

    // ------------------ CARTÕES ------------------
//    @PostMapping("/{id}/cartao")
//    public ResponseEntity<CartaoDeCredito> cadastrarCartao(@PathVariable Long id, @RequestBody CartaoDeCredito cartao) {
//        return ResponseEntity.ok(vendaService.salvarCartao(id, cartao));
//    }
    @PostMapping("/{id}/cartoes")
    public ResponseEntity<List<CartaoDeCredito>> cadastrarCartoes(
            @PathVariable Long id,
            @RequestBody List<CartaoDeCredito> cartoes
    ) {
        return ResponseEntity.ok(vendaService.salvarCartoes(id, cartoes));
    }


    @GetMapping("/{id}/cartoes")
    public ResponseEntity<List<CartaoDeCredito>> listarCartoes(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.listarCartoesCliente(id));
    }

    // ------------------ PEDIDOS ------------------
//    @PostMapping(value = "/{id}/finalizar-compra", produces = MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<PedidoDTO> finalizarCompra(@PathVariable Long id, @RequestBody Pedido pedido) {
//        PedidoDTO salvo = vendaService.finalizarCompra(id, pedido);
//        return ResponseEntity.ok(salvo);
//    }

    @PostMapping(value = "/{id}/finalizar-compra", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PedidoDTO> finalizarCompra(
            @PathVariable Long id,
            @RequestBody FinalizarCompraRequest request
    ) {
        PedidoDTO salvo = vendaService.finalizarCompra(id, request);
        return ResponseEntity.ok(salvo);
    }

    @GetMapping("/{id}/pedidos")
    public ResponseEntity<List<PedidoDTO>> listarPedidosPorCliente(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.listarPedidosDoCliente(id));
    }
}

