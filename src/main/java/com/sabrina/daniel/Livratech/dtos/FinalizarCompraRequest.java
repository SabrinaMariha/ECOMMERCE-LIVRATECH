package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.model.Item;

import java.util.List;

public record FinalizarCompraRequest(
        Long enderecoId,
        Boolean salvarEndereco,
        List<ItemRequest> itens,
        List<TransacaoRequest> transacoes
) {
}
