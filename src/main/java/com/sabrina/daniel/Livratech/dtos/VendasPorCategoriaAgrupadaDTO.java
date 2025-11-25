package com.sabrina.daniel.Livratech.dtos;

import java.util.List;

/**
 * Representa as vendas agrupadas por Categoria (o Eixo Y do seu gráfico).
 */
public class VendasPorCategoriaAgrupadaDTO {
    private String categoria;
    private List<VendaDiaDTO> vendasPorDia;

    // Getters, Setters e Construtores devem ser criados,
    // já que esta não é um record e precisa ser populada pelo service.

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public List<VendaDiaDTO> getVendasPorDia() {
        return vendasPorDia;
    }

    public void setVendasPorDia(List<VendaDiaDTO> vendasPorDia) {
        this.vendasPorDia = vendasPorDia;
    }
}