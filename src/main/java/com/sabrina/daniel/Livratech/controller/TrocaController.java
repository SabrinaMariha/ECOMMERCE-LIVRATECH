package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.dtos.SolicitacaoTrocaDTO;
import com.sabrina.daniel.Livratech.service.TrocaService;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.model.Pedido;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/trocas")
public class TrocaController {

    private static final Logger logger = LoggerFactory.getLogger(TrocaController.class);

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
            Pedido pedido = pedidoRepository.findById(pedidoId)
                 .orElseThrow(() -> new NoSuchElementException("Pedido não encontrado com ID: " + pedidoId));
            if (pedido.getCliente() == null || !pedido.getCliente().getId().equals(clienteId)) {
                 logger.warn("Tentativa de solicitar troca para pedido {} por cliente não autorizado {}", pedidoId, clienteId);
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Este pedido não pertence ao cliente informado.");
            }

            SolicitacaoTrocaDTO solicitacaoDTO = trocaService.solicitarTrocaItem(pedidoId, itemId, motivo);
            return ResponseEntity.ok(solicitacaoDTO);

        } catch (ValidacaoException e) {
            logger.warn("Falha na validação ao solicitar troca: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (NoSuchElementException e) {
            logger.error("Erro ao solicitar troca (Recurso não encontrado): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Erro interno ao solicitar troca para cliente {} pedido {} item {}", clienteId, pedidoId, itemId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao processar a solicitação de troca.");
        }
    }

    @GetMapping("/cliente/{clienteId}/solicitacoes")
    public ResponseEntity<?> listarTrocasDoCliente(@PathVariable Long clienteId) {
        try {
            List<SolicitacaoTrocaDTO> solicitacoesDTO = trocaService.listarTrocasPorCliente(clienteId);
            return ResponseEntity.ok(solicitacoesDTO);
        } catch (Exception e) {
            logger.error("Erro ao listar trocas para cliente {}", clienteId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao buscar as solicitações de troca.");
        }
    }

    // --- Endpoints para ADMIN (Exemplos) ---
    /*
    @GetMapping("/admin/pendentes")
    public ResponseEntity<?> listarTrocasPendentesAdmin() { ... }

    @PutMapping("/admin/{solicitacaoId}/autorizar")
    public ResponseEntity<?> autorizarTroca(@PathVariable Long solicitacaoId) { ... }

    @PutMapping("/admin/{solicitacaoId}/confirmar-recebimento")
    public ResponseEntity<?> confirmarRecebimento(
            @PathVariable Long solicitacaoId,
            @RequestParam(required = true) boolean retornarEstoque) { ... }
    */
}