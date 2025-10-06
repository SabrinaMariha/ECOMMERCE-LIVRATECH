package com.sabrina.daniel.Livratech.controller;


import com.sabrina.daniel.Livratech.dtos.AlterarSenhaCliente;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @PostMapping("/")
    public ResponseEntity<?> cadastrar(@RequestBody Cliente cliente) {
        try {
            Cliente clienteSalvo = clienteService.save(cliente);
            return ResponseEntity.ok(clienteSalvo);
        } catch (RuntimeException e) {
            // Retorna status 400 (Bad Request) com a mensagem da exceção
            System.out.println("mensagem de erro do back:"+ e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DadosConsultaCliente> buscarPorId(@PathVariable long id) throws Exception {
        DadosConsultaCliente dto = clienteService.findDTOById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> atualizarCliente(@PathVariable Long id, @RequestBody DadosConsultaCliente dto){
        return ResponseEntity.ok(clienteService.update(id,dto));
    }

    @PutMapping("/{id}/senha")
    public ResponseEntity<String> atualizarSenha(
            @PathVariable Long id,
            @RequestBody AlterarSenhaCliente request) {
        String msg = clienteService.updateSenha(id, request.senhaAtual(), request.novaSenha(), request.confirmarSenha());
        return ResponseEntity.ok(msg);
    }

}
