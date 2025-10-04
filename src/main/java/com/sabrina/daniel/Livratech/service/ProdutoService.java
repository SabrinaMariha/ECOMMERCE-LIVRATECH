package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.daos.ProdutoRepository;
import com.sabrina.daniel.Livratech.model.Produto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    //Busca todos os produtos
    public List<Produto> findAll(){
        return produtoRepository.findAll();
    }

    // Buscar produto por id
    public Optional<Produto> findById(Long id){
        return produtoRepository.findById(id);
    }

    // Atualizar estoque de um produto
    public Produto atualizarEstoque(Long id, Integer novaQuantidade){
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com id: " + id));
        produto.setEstoque(novaQuantidade);
        return produtoRepository.save(produto);
    }

    // Salva ou atualizar um produto
    public Produto save(Produto produto){
        return produtoRepository.save(produto);
    }
}
