package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.model.Pedido;
import com.sabrina.daniel.Livratech.model.SolicitacaoTroca;
import com.sabrina.daniel.Livratech.service.TrocaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/trocas")
public class TrocaController {

    private final TrocaService trocaService;
    private final PedidoRepository pedidoRepository;

    @Autowired
    public TrocaController(TrocaService trocaService, PedidoRepository pedidoRepository) {
        this.trocaService = trocaService;
        this.pedidoRepository = pedidoRepository;
    }

    @PostMapping("/cliente/{clienteId}/solicitar/pedido/{pedidoId}/item/{itemId}")
    public ResponseEntity<?> solicitarTrocaItem(
            @PathVariable Long clienteId,
            @PathVariable Long pedidoId,
            @PathVariable Long itemId,
            @RequestBody Map<String, String> body) {

        String motivo = body.get("motivo");
        if (motivo == null || motivo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("O motivo da troca é obrigatório.");
        }

        try {
            Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow(() -> new RuntimeException("Pedido não encontrado."));
            if (!pedido.getCliente().getId().equals(clienteId)) {
                 return ResponseEntity.status(403).body("Este pedido não pertence ao cliente informado.");
            }

            SolicitacaoTroca solicitacaoSalva = trocaService.solicitarTrocaItem(pedidoId, itemId, motivo);

            return ResponseEntity.ok(solicitacaoSalva);

        } catch (ValidacaoException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            System.err.println("Erro ao solicitar troca: " + e.getMessage());
            return ResponseEntity.status(500).body("Erro interno ao processar a solicitação de troca.");
        }
    }

    @GetMapping("/cliente/{clienteId}/solicitacoes")
    public ResponseEntity<?> listarTrocasDoCliente(@PathVariable Long clienteId) {
        try {
            List<SolicitacaoTroca> solicitacoes = trocaService.listarTrocasPorCliente(clienteId);
            if (solicitacoes.isEmpty()) {
                return ResponseEntity.ok("Nenhuma solicitação de troca encontrada para este cliente.");
            }
            return ResponseEntity.ok(solicitacoes);
        } catch (Exception e) {
            System.err.println("Erro ao listar trocas do cliente: " + e.getMessage());
            return ResponseEntity.status(500).body("Erro interno ao buscar as solicitações de troca.");
        }
    }


    // --- Endpoints para ADMIN ---
    // (Mantidos como estavam, podem ser movidos para AdminController se preferir)
    /*
    @GetMapping("/admin/pendentes")
    // ...
    @PutMapping("/admin/{solicitacaoId}/autorizar")
    // ...
    @PutMapping("/admin/{solicitacaoId}/confirmar-recebimento")
    // ...
    */

}