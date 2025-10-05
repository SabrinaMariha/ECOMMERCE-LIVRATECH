package com.sabrina.daniel.Livratech.dtos;

import java.util.List;

public record CarrinhoDTO(
        Long id,
        List<ItemDTO> itens
) {}
