package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.model.Item;
import com.sabrina.daniel.Livratech.service.CarrinhoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carrinho")
@RequiredArgsConstructor
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    @GetMapping("/{carrinhoId}")
    public List<Item> listarItens(@PathVariable Long carrinhoId) {
        return carrinhoService.listarItens(carrinhoId);
    }

    @PostMapping("/{carrinhoId}/adicionar")
    public Item adicionarItem(@PathVariable Long carrinhoId,
                              @RequestParam Long produtoId,
                              @RequestParam Integer quantidade) {
        return carrinhoService.adicionarItem(carrinhoId, produtoId, quantidade);
    }

    @PutMapping("/{carrinhoId}/item/{itemId}")
    public Item atualizarQuantidade(@PathVariable Long carrinhoId,
                                    @PathVariable Long itemId,
                                    @RequestParam Integer quantidade) {
        return carrinhoService.atualizarQuantidade(carrinhoId, itemId, quantidade);
    }

    @DeleteMapping("/{carrinhoId}/item/{itemId}")
    public void removerItem(@PathVariable Long carrinhoId,
                            @PathVariable Long itemId) {
        carrinhoService.removerItem(carrinhoId, itemId);
    }

    @DeleteMapping("/{carrinhoId}/limpar")
    public void limparCarrinho(@PathVariable Long carrinhoId) {
        carrinhoService.limparCarrinho(carrinhoId);
    }
}