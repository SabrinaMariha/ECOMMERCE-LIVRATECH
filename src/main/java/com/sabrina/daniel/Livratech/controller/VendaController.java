package com.sabrina.daniel.Livratech.controller;


import com.sabrina.daniel.Livratech.dtos.AlterarSenhaCliente;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.service.ClienteService;
import com.sabrina.daniel.Livratech.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/cliente")
@CrossOrigin(origins = "*")
    public class VendaController {
    @Autowired
    private VendaService vendaService;
    @Autowired
    private ClienteService clienteService;

    @GetMapping("/{id}")
    public ResponseEntity<List<Endereco>> buscarPorId(@PathVariable long id) throws Exception {
        DadosConsultaCliente dto = clienteService.findDTOById(id);
        List<Endereco> enderecos= dto.enderecos();
        return ResponseEntity.ok(enderecos);
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
}
