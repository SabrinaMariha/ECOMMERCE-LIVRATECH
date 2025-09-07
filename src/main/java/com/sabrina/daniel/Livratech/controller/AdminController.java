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
@CrossOrigin(origins = "*")
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
}
