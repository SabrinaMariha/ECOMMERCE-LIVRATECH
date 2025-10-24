package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.enums.StatusCompra; // Importar
import com.sabrina.daniel.Livratech.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional; // Importar

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Metodo existente para buscar pedidos de um cliente
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.itens i " +
            "LEFT JOIN FETCH i.produto prod " + // Adicionado alias prod
            "LEFT JOIN FETCH p.cliente c " +     // Adicionado fetch do cliente
            "WHERE c.id = :clienteId")
    List<Pedido> findPedidosComItensPorCliente(@Param("clienteId") Long clienteId);

    // Novo metodo para buscar todos os pedidos com detalhes para o admin
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.itens i " +
            "LEFT JOIN FETCH i.produto prod " + // Adicionado alias prod
            "LEFT JOIN FETCH p.cliente c " +     // Adicionado fetch do cliente
            "ORDER BY p.id DESC")
    List<Pedido> findAllPedidosComDetalhes();

    // Novo metodo para buscar pedido com detalhes por ID (para atualização de status)
    @Query("SELECT p FROM Pedido p " +
            "LEFT JOIN FETCH p.transacoes t " +
            "LEFT JOIN FETCH p.cliente c " +
            "WHERE p.id = :pedidoId")
    Optional<Pedido> findByIdWithTransacoes(@Param("pedidoId") Long pedidoId);

    // Novo: Metodo para filtrar pedidos (exemplo simples por status)
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.itens i " +
            "LEFT JOIN FETCH i.produto prod " +
            "LEFT JOIN FETCH p.cliente c " +
            "LEFT JOIN p.transacoes t " +
            "WHERE t.status = :status " +
            "ORDER BY p.id DESC")
    List<Pedido> findPedidosComDetalhesByStatus(@Param("status") StatusCompra status);

}