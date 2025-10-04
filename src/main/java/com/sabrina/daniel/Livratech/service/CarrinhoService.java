package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.daos.CarrinhoRepository;
import com.sabrina.daniel.Livratech.daos.ItemRepository;
import com.sabrina.daniel.Livratech.daos.ProdutoRepository;
import com.sabrina.daniel.Livratech.model.Carrinho;
import com.sabrina.daniel.Livratech.model.Item;
import com.sabrina.daniel.Livratech.model.Produto;
import jakarta.persistence.Transient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ItemRepository itemRepository;
    private final ProdutoRepository produtoRepository;

    public Carrinho getCarrinho(Long carrinhoId){
        return carrinhoRepository.findById(carrinhoId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado"));
    }

    public List<Item> listarItens(Long carrinhoId){
        return itemRepository.findByCarrinhoId(carrinhoId);
    }

    @Transactional
    public Item adicionarItem(Long carrinhoId, Long produtoId, Integer quantidade) {
        Carrinho carrinho = getCarrinho(carrinhoId);
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Verifica se já existe o item no carrinho
        Item itemExistente = carrinho.getItens().stream()
                .filter(i -> i.getProduto().getId().equals(produtoId))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            itemExistente.setQuantidade(itemExistente.getQuantidade() + quantidade);
            return itemRepository.save(itemExistente);
        }

        Item novoItem = new Item();
        novoItem.setCarrinho(carrinho);
        novoItem.setProduto(produto);
        novoItem.setQuantidade(quantidade);

        carrinho.getItens().add(novoItem);

        carrinhoRepository.save(carrinho);
        return novoItem;
    }

    @Transactional
    public void removerItem(Long carrinhoId, Long itemId) {
        Carrinho carrinho = getCarrinho(carrinhoId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        if (!item.getCarrinho().getId().equals(carrinhoId)) {
            throw new RuntimeException("Item não pertence a esse carrinho");
        }
        carrinho.getItens().remove(item);
        itemRepository.delete(item);
    }

    @Transactional
    public void limparCarrinho(Long carrinhoId) {
        Carrinho carrinho = getCarrinho(carrinhoId);
        carrinho.getItens().clear();
        carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Item atualizarQuantidade(Long carrinhoId, Long itemId, Integer quantidade) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        if (!item.getCarrinho().getId().equals(carrinhoId)) {
            throw new RuntimeException("Item não pertence a esse carrinho");
        }
        item.setQuantidade(quantidade);
        return itemRepository.save(item);
    }
}
