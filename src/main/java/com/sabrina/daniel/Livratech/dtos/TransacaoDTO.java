package com.sabrina.daniel.Livratech.dtos;

import java.math.BigDecimal;
import java.util.Date;

public record TransacaoDTO(
        Long id,
        BigDecimal valor,
        String status,
        Date data,
        String bandeiraCartao,
        String ultimosDigitosCartao
) {}
