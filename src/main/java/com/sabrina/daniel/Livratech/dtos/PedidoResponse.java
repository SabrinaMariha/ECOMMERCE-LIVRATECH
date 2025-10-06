package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.model.Item;

import java.math.BigDecimal;
import java.util.List;

public record PedidoResponse(Long id, BigDecimal valor, List<Item> itens) {}

