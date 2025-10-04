package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.dtos.CarrinhoDTO;
import com.sabrina.daniel.Livratech.model.Item;
import com.sabrina.daniel.Livratech.service.CarrinhoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/carrinho")
@RequiredArgsConstructor
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    @GetMapping("/{clienteId}")
    public ResponseEntity<CarrinhoDTO> listarCarrinho(@PathVariable Long clienteId) {
        CarrinhoDTO dto = carrinhoService.listarCarrinho(clienteId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{clienteId}/adicionar")
    public ResponseEntity<CarrinhoDTO> adicionarItem(
            @PathVariable Long clienteId,
            @RequestParam Long produtoId,
            @RequestParam int quantidade
    ) {
        CarrinhoDTO dto = carrinhoService.adicionarItem(clienteId, produtoId, quantidade);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{carrinhoId}/item/{itemId}")
    public ResponseEntity<CarrinhoDTO> atualizarQuantidade(
            @PathVariable Long carrinhoId,
            @PathVariable Long itemId,
            @RequestParam Integer quantidade
    ) {
        CarrinhoDTO dto = carrinhoService.atualizarQuantidade(carrinhoId, itemId, quantidade);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{carrinhoId}/item/{itemId}")
    public ResponseEntity<CarrinhoDTO> removerItem(
            @PathVariable Long carrinhoId,
            @PathVariable Long itemId
    ) {
        CarrinhoDTO dto = carrinhoService.removerItem(carrinhoId, itemId);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{carrinhoId}/limpar")
    public ResponseEntity<CarrinhoDTO> limparCarrinho(@PathVariable Long carrinhoId) {
        CarrinhoDTO dto = carrinhoService.limparCarrinho(carrinhoId);
        return ResponseEntity.ok(dto);
    }
}
