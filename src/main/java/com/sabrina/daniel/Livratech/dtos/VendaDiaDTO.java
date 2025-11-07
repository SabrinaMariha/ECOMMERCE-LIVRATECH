package com.sabrina.daniel.Livratech.dtos;

import java.math.BigDecimal;

public record VendaDiaDTO(String data, // Formato "yyyy-MM-dd"
                          Long volumeVendas, // Quantidade total de itens vendidos
                          BigDecimal valorTotal // Valor total das vendas no dia
                           ) {
}
