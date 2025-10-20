package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.model.CartaoDeCredito;

import java.math.BigDecimal;

public record TransacaoRequest(
        BigDecimal valor,
        StatusCompra status,
        Boolean salvarCartao,
        Long cartaoExistenteId,
        CartaoDeCredito cartaoNovo
) {
}
