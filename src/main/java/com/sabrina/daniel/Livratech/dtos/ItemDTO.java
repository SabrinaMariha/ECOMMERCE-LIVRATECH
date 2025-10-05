package com.sabrina.daniel.Livratech.dtos;

public record ItemDTO(
        Long id,
        Integer quantidade,
        String nomeProduto,
        String autor,
        Double precoProduto,
        String imagemProduto
) {
}
