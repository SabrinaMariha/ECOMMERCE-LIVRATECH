package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartaoRepository extends JpaRepository<CartaoDeCredito, Long> {
}
