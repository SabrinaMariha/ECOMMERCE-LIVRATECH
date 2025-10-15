package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.model.Transacao;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public record PedidoDTO(
        Long id,
        Date data,
        String status,
        BigDecimal valorTotal,
        List<ItemDTO> itens,
        String enderecoEntrega,
        List<Transacao> transacoes // <-- Agora representa corretamente o uso de múltiplos cartões
) {}
