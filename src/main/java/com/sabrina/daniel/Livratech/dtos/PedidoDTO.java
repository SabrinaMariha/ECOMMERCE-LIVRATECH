package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.model.Transacao;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public record PedidoDTO(
        Long id,
        Date data,
        StatusCompra status,
        BigDecimal valorTotal,
        List<ItemDTO> itens,
        String enderecoEntrega,
        List<TransacaoDTO> transacoes // <-- Agora representa corretamente o uso de múltiplos cartões
) {}
