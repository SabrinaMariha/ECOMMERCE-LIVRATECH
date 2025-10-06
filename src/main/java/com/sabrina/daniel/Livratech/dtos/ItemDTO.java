package com.sabrina.daniel.Livratech.dtos;

public record ItemDTO(
        Long id,
        Long produtoId,
        Integer quantidade,
        String nomeProduto,
        String autor,
        Double precoProduto,
        String imagemProduto
) {
}
