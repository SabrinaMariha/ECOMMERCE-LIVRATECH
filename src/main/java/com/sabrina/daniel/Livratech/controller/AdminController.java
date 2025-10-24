package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.FiltroCliente;
import com.sabrina.daniel.Livratech.dtos.PedidoDTO;
import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.service.AdminService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/clientes")
    public ResponseEntity<Map<String, Object>> buscarClientes(@RequestBody(required = false) FiltroCliente filtroClientes) throws Exception {
        FiltroCliente filtro = (filtroClientes != null) ? filtroClientes : new FiltroCliente(null, null, null, null, null, null, null, null, null, null);
        List<Cliente> clientes = adminService.findAll(filtro);

        List<DadosConsultaCliente> clientesDto = clientes.stream()
                .map(adminService::toDTO)
                .toList();

        Map<String, Object> resposta = new HashMap<>();
        if (clientesDto.isEmpty()) {
            resposta.put("mensagem", "Nenhum cliente encontrado.");
        } else {
            resposta.put("clientes", clientesDto);
        }
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<DadosConsultaCliente> buscarPorId(@PathVariable long id) throws Exception {
        DadosConsultaCliente dto = adminService.findDTOById(id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/cliente/{id}/inativar")
    public ResponseEntity<String> inativarPorId(@PathVariable long id) {
        try {
            DadosConsultaCliente dto = adminService.inativarPorId(id);
            return ResponseEntity.ok("Cliente " + dto.nome() + " inativado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/pedidos")
    public ResponseEntity<List<PedidoDTO>> listarPedidos(@RequestParam(required = false) StatusCompra status) {
        try {
            List<PedidoDTO> pedidos = adminService.listarTodosPedidos(status);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            System.err.println("Erro ao listar pedidos: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    public record AtualizarStatusRequest(StatusCompra novoStatus) {}

    @PatchMapping("/pedidos/{pedidoId}/status")
    public ResponseEntity<?> atualizarStatusPedido(
            @PathVariable Long pedidoId,
            @RequestBody AtualizarStatusRequest request) {
        try {
            if (request == null || request.novoStatus() == null) {
                return ResponseEntity.badRequest().body("O novo status é obrigatório.");
            }
            PedidoDTO pedidoAtualizado = adminService.atualizarStatusPedido(pedidoId, request.novoStatus());
            return ResponseEntity.ok(pedidoAtualizado);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Erro ao atualizar status do pedido " + pedidoId + ": " + e.getMessage());
            return ResponseEntity.status(500).body("Erro interno ao atualizar status do pedido.");
        }
    }

    @GetMapping("/pedidos/status")
    public ResponseEntity<List<String>> listarTodosStatusCompra() {
        List<String> statusList = Arrays.stream(StatusCompra.values())
                .map(Enum::name) // Pega o nome de cada enum
                .collect(Collectors.toList());
        return ResponseEntity.ok(statusList);
    }
}
