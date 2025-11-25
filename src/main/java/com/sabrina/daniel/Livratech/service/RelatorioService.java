package com.sabrina.daniel.Livratech.service;// Exemplo: com.sabrina.daniel.Livratech.services.RelatorioService

import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.dtos.VendaDiaDTO;
import com.sabrina.daniel.Livratech.dtos.VendasPorCategoriaAgrupadaDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RelatorioService{

    private final PedidoRepository pedidoRepository;

    public RelatorioService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    /**
     * Busca dados planos (DB) e os agrupa em uma estrutura aninhada por Categoria.
     */
    public List<VendasPorCategoriaAgrupadaDTO> getVendasAgrupadasPorCategoria(Date dataInicio, Date dataFim) {

        // 1. Obtém a lista plana (flat list) do banco de dados (valorTotal é Double)
        List<PedidoRepository.VendaCategoriaProjection> projections =
                pedidoRepository.findVendasPorCategoriaEPeriodo(dataInicio, dataFim);

        // 2. Agrupa os resultados por 'categoria'
        Map<String, List<PedidoRepository.VendaCategoriaProjection>> vendasAgrupadas = projections.stream()
                .collect(Collectors.groupingBy(PedidoRepository.VendaCategoriaProjection::getCategoria));

        // 3. Transforma o Map agrupado na lista de DTOs final
        return vendasAgrupadas.entrySet().stream()
                .map(entry -> {
                    String categoria = entry.getKey();
                    List<PedidoRepository.VendaCategoriaProjection> vendasDaCategoria = entry.getValue();

                    // Mapeia a lista de Projections para a lista do seu VendaDiaDTO, 
                    // fazendo a conversão de Double para BigDecimal.
                    List<VendaDiaDTO> detalhesPorDia = vendasDaCategoria.stream()
                            .map(p -> {
                                // Conversão de Double (da Projection) para BigDecimal (do seu DTO)
                                BigDecimal valorTotalBd = BigDecimal.valueOf(p.getValorTotal());

                                return new VendaDiaDTO(
                                        p.getData(),
                                        p.getVolumeVendas(),
                                        valorTotalBd
                                );
                            })
                            .collect(Collectors.toList());

                    // Cria e retorna o DTO final VendasPorCategoriaAgrupadaDTO
                    VendasPorCategoriaAgrupadaDTO dto = new VendasPorCategoriaAgrupadaDTO();
                    dto.setCategoria(categoria);
                    dto.setVendasPorDia(detalhesPorDia);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}