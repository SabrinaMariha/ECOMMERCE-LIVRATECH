package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.enums.StatusCompra;
import com.sabrina.daniel.Livratech.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.itens i " +
            "LEFT JOIN FETCH i.produto " +
            "WHERE p.cliente.id = :clienteId")
    List<Pedido> findPedidosComItensPorCliente(@Param("clienteId") Long clienteId);

    @Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.itens i LEFT JOIN FETCH i.produto ORDER BY p.id DESC")
    List<Pedido> findAllWithItens();

    // Buscar por Status (Exemplo simples)
    List<Pedido> findByTransacoes_Status(StatusCompra status);

    @Query("SELECT p FROM Pedido p WHERE p.status NOT IN :statuses")
    List<Pedido> findByStatusNotIn(@Param("statuses") List<StatusCompra> statuses);
}
