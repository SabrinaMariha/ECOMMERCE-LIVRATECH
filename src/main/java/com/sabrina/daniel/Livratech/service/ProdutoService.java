package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.ProdutoRepository;
import com.sabrina.daniel.Livratech.model.Produto;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.sabrina.daniel.Livratech.enums.Categoria;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    //Busca todos os produtos
    public List<Produto> findAll(){
        return produtoRepository.findAllByOrderByIdAsc();
    }

     public List<Produto> filtrarProdutos(String nome, String autor, Double precoMin, Double precoMax, List<String> categorias) {
        List<Categoria> categoriasEnum = null;

        if (categorias != null && !categorias.isEmpty()) {
            categoriasEnum = categorias.stream()
                    .map(String::toUpperCase)
                    .filter(cat -> {
                        try {
                            Categoria.valueOf(cat);
                            return true;
                        } catch (IllegalArgumentException e) {
                            return false;
                        }
                    })
                    .map(Categoria::valueOf)
                    .collect(Collectors.toList());
        }
         List<Produto> resultadosComDuplicata = produtoRepository.filtrarProdutos(nome, autor, precoMin, precoMax, categoriasEnum);

         // 2. ✅ CORREÇÃO: Remove duplicatas (usando o ID como chave)
         return resultadosComDuplicata.stream()
                 .collect(Collectors.toMap(
                         Produto::getId,         // Chave: ID do Produto
                         produto -> produto,     // Valor: O próprio Produto
                         (existing, replacement) -> existing // Função de Merge: se houver duplicata, mantém o primeiro encontrado
                 ))
                 .values().stream()         // Pega todos os valores (produtos únicos)
                 .collect(Collectors.toList()); // Converte de volta para List
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

    @Transactional
    public Produto deduzirEstoque(Long id, Integer quantidadeVendida) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com id: " + id));

        Integer estoqueAtual = produto.getEstoque();

        if (estoqueAtual < quantidadeVendida) {
            throw new ValidacaoException("Estoque insuficiente para o produto: " + produto.getNome() + ". Disponível: " + estoqueAtual);
        }

        produto.setEstoque(estoqueAtual - quantidadeVendida);
        return produtoRepository.save(produto);
    }
}
