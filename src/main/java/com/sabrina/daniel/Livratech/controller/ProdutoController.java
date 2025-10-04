package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.model.Produto;
import com.sabrina.daniel.Livratech.service.ProdutoService;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public List<Produto> buscarProdutos(){
        return produtoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id){
        return  produtoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/estoque")
    public ResponseEntity<Produto> atualizarEstoque(@PathVariable Long id, @RequestBody Integer quantidade){
        try{
            Produto atualizado =  produtoService.atualizarEstoque(id, quantidade);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e){
            return ResponseEntity.notFound().build();
        }
    }

}
