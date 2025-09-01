package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // DAO para Cliente

}