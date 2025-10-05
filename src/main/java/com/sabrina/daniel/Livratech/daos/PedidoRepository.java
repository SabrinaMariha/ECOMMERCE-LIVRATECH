package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}
