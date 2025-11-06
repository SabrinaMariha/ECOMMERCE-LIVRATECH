package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.FiltroCliente;
import com.sabrina.daniel.Livratech.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @Query("""
    SELECT c FROM Cliente c
    WHERE (:#{#filtros.nome} IS NULL OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :#{#filtros.nome}, '%')))
      AND (:#{#filtros.dataNascimento} IS NULL OR c.dataNascimento = :#{#filtros.dataNascimento})
      AND (:#{#filtros.cpf} IS NULL OR LOWER(c.cpf) LIKE LOWER(CONCAT('%', :#{#filtros.cpf}, '%')))
      AND (:#{#filtros.email} IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :#{#filtros.email}, '%')))
      AND (:#{#filtros.genero} IS NULL OR c.genero = :#{#filtros.genero})
      AND (:#{#filtros.telefone} IS NULL OR EXISTS (
            SELECT t FROM Telefone t 
            WHERE t.cliente = c AND CONCAT(t.ddd, t.numero) LIKE CONCAT('%', :#{#filtros.telefone}, '%')
      ))
""")
    List<Cliente> findAllByFiltros(@Param("filtros") FiltroCliente filtros);
}