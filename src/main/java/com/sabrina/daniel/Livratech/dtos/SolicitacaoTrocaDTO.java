package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.enums.StatusTroca;
import java.time.LocalDateTime;

public record SolicitacaoTrocaDTO(
        Long id,
        Long pedidoId,
        Long itemId,
        String nomeProduto,
        String clienteNome,
        String motivo,
        LocalDateTime dataSolicitacao,
        StatusTroca status
) {}