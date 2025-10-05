package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.daos.CarrinhoRepository;
import com.sabrina.daniel.Livratech.daos.ItemRepository;
import com.sabrina.daniel.Livratech.daos.ProdutoRepository;
import com.sabrina.daniel.Livratech.dtos.CarrinhoDTO;
import com.sabrina.daniel.Livratech.dtos.ItemDTO;
import com.sabrina.daniel.Livratech.model.Carrinho;
import com.sabrina.daniel.Livratech.model.Item;
import com.sabrina.daniel.Livratech.model.Produto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ItemRepository itemRepository;
    private final ProdutoRepository produtoRepository;

    private Carrinho getCarrinho(Long carrinhoId) {
        return carrinhoRepository.findById(carrinhoId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado"));
    }

    private CarrinhoDTO converterParaDTO(Carrinho carrinho) {
        List<ItemDTO> itensDTO = carrinho.getItens().stream()
                .map(i -> new ItemDTO(
                        i.getId(),
                        i.getQuantidade(),
                        i.getProduto().getNome(),
                        i.getProduto().getAutor(),
                        i.getProduto().getPreco(),
                        i.getProduto().getImagemUrl()
                ))
                .collect(Collectors.toList());

        return new CarrinhoDTO(carrinho.getId(), itensDTO);
    }

    @Transactional
    public CarrinhoDTO listarCarrinho(Long carrinhoId) {
        Carrinho carrinho = getCarrinho(carrinhoId);
        return converterParaDTO(carrinho);
    }

    @Transactional
    public CarrinhoDTO adicionarItem(Long carrinhoId, Long produtoId, Integer quantidade) {
        Carrinho carrinho = getCarrinho(carrinhoId);
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        Item itemExistente = carrinho.getItens().stream()
                .filter(i -> i.getProduto().getId().equals(produtoId))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            itemExistente.setQuantidade(itemExistente.getQuantidade() + quantidade);
            itemRepository.save(itemExistente);
        } else {
            Item novoItem = new Item();
            novoItem.setCarrinho(carrinho);
            novoItem.setProduto(produto);
            novoItem.setQuantidade(quantidade);
            carrinho.getItens().add(novoItem);
            carrinhoRepository.save(carrinho);
        }

        return converterParaDTO(carrinho);
    }

    @Transactional
    public CarrinhoDTO removerItem(Long carrinhoId, Long itemId) {
        Carrinho carrinho = getCarrinho(carrinhoId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        if (!item.getCarrinho().getId().equals(carrinhoId)) {
            throw new RuntimeException("Item não pertence a esse carrinho");
        }
        carrinho.getItens().remove(item);
        itemRepository.delete(item);
        return converterParaDTO(carrinho);
    }

    @Transactional
    public CarrinhoDTO limparCarrinho(Long carrinhoId) {
        Carrinho carrinho = getCarrinho(carrinhoId);
        carrinho.getItens().clear();
        carrinhoRepository.save(carrinho);
        return converterParaDTO(carrinho);
    }

    @Transactional
    public CarrinhoDTO atualizarQuantidade(Long carrinhoId, Long itemId, Integer quantidade) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        if (!item.getCarrinho().getId().equals(carrinhoId)) {
            throw new RuntimeException("Item não pertence a esse carrinho");
        }
        item.setQuantidade(quantidade);
        itemRepository.save(item);
        return converterParaDTO(item.getCarrinho());
    }
}
