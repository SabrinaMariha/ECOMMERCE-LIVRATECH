package com.sabrina.daniel.Livratech.controller;


import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.FiltroCliente;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.service.AdminService;
import com.sabrina.daniel.Livratech.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;


    @PostMapping("/clientes")
    public ResponseEntity<Map<String, Object>> buscarClientes(@RequestBody FiltroCliente filtroClientes) throws Exception {
        List<Cliente> clientes = adminService.findAll(filtroClientes);

        // Faz a conversão de Cliente → DadosConsultaCliente
        List<DadosConsultaCliente> clientesDto = clientes.stream()
                .map(cliente -> new DadosConsultaCliente(
                        cliente.getId(),
                        cliente.getNome(),
                        cliente.getGenero(),
                        cliente.getDataNascimento(),
                        cliente.getCpf(),
                        cliente.getTelefones(),
                        cliente.getEmail(),
                        cliente.getStatus(),
                        cliente.getEnderecos(),
                        cliente.getCartoesCredito()
                ))
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
    public ResponseEntity<String> inativarPorId(@PathVariable long id) throws Exception {
        DadosConsultaCliente dto = adminService.inativarPorId(id);
        return ResponseEntity.ok("Cliente " + dto.nome() + " inativado com sucesso!");
    }

    @GetMapping("/vendas")
    public ResponseEntity<List<Map<String, Object>>> buscarVendas() throws Exception {
        List<Map<String, Object>> vendas = adminService.buscarVendas();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("vendas/{pedidoId}/detalhes")
    public ResponseEntity<Map<String, Object>> buscarDetalhesDoPedido(@PathVariable Long pedidoId) throws Exception {
        Map<String, Object> detalhes = adminService.buscarDetalhesDoPedido(pedidoId);
        return ResponseEntity.ok(detalhes);
    }

    @PutMapping("/vendas/{pedidoId}/atualizar-status")
    public ResponseEntity<String> atualizarStatusDoPedido(@PathVariable Long pedidoId, @RequestParam String novoStatus) throws Exception {
        adminService.atualizarStatusDoPedido(pedidoId, novoStatus);
        return ResponseEntity.ok("Status do pedido atualizado com sucesso para: " + novoStatus);
    }
}
