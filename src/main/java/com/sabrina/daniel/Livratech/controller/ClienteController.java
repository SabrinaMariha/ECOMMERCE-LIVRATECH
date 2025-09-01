package com.sabrina.daniel.Livratech.controller;


import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @PostMapping("/")
    @Transactional
    public ResponseEntity<String> cadastrar(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteService.save(cliente));
    }

}
