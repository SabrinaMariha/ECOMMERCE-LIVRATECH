package com.sabrina.daniel.Livratech.daos;

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
}
