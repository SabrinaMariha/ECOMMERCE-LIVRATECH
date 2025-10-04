package com.sabrina.daniel.Livratech.dtos;

public record ItemDTO(
        Long id,
        Integer quantidade,
        String nomeProduto,
        Double precoProduto,
        String imagemProduto
) {
}
