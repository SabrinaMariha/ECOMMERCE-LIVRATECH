package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // --- Projeção para Análise de Vendas ---
    public interface VendaDiaProjection {
        String getData();
        Long getVolumeVendas();
        BigDecimal getValorTotal();
    }

    public interface VendaCategoriaProjection {
        // O nome da Categoria (campo `categoria` da entidade Produto)
        String getCategoria();
        // A soma dos valores de venda para essa Categoria
        Double getValorTotal();
        // Data da venda (Dia)
        String getData();
        // O volume de vendas (Soma das quantidades)
        Long getVolumeVendas();
    }

    // Consulta de Agregação por Período (Vendas por Dia)
    @Query("SELECT TO_CHAR(t.data, 'YYYY-MM-DD') AS data, " +
            "SUM(i.quantidade) AS volumeVendas, " +
            "SUM(i.quantidade * i.produto.preco) AS valorTotal " +
            "FROM Pedido p JOIN p.itens i " +
            "JOIN p.transacoes t " +
            "WHERE p.status IN ('APROVADA', 'ENTREGUE', 'EM_TRANSITO') " +
            "AND t.data BETWEEN :dataInicio AND :dataFim " +
            "GROUP BY data ORDER BY data")
    List<VendaDiaProjection> findVendasAgregadasPorPeriodo(@Param("dataInicio") Date dataInicio, @Param("dataFim") Date dataFim);

    /**
     * Retorna as vendas agregadas por Categoria e por Dia.
     * Esta é a query corrigida.
     */
    @Query("SELECT TO_CHAR(t.data, 'YYYY-MM-DD') AS data, " +
            "prod.categoria AS categoria, " +
            "SUM(prod.preco * i.quantidade) AS valorTotal, " +
            "SUM(i.quantidade) AS volumeVendas " +
            "FROM Pedido p " +
            "JOIN p.itens i " +
            "JOIN i.produto prod " +
            "JOIN p.transacoes t " +
            "WHERE p.status IN ('APROVADA', 'ENTREGUE', 'EM_TRANSITO','EM_PROCESSAMENTO') " +
            "AND t.data BETWEEN :dataInicio AND :dataFim " +
            "GROUP BY data, prod.categoria " +
            "ORDER BY data, valorTotal DESC")
    List<VendaCategoriaProjection> findVendasPorCategoriaEPeriodo(
            @Param("dataInicio") Date dataInicio,
            @Param("dataFim") Date dataFim);

    // --- Outros métodos de consulta ---
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.itens i " +
            "LEFT JOIN FETCH i.produto " +
            "WHERE p.cliente.id = :clienteId")
    List<Pedido> findPedidosComItensPorCliente(@Param("clienteId") Long clienteId);

    @Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.itens i LEFT JOIN FETCH i.produto ORDER BY p.id DESC")
    List<Pedido> findAllWithItens();

    List<Pedido> findByTransacoes_Status(StatusCompra status);

    @Query("SELECT p FROM Pedido p WHERE p.status NOT IN :statuses")
    List<Pedido> findByStatusNotIn(@Param("statuses") List<StatusCompra> statuses);
}