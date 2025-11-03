package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.model.SolicitacaoTroca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitacaoTrocaRepository extends JpaRepository<SolicitacaoTroca, Long> {

    @Query("SELECT st FROM SolicitacaoTroca st JOIN FETCH st.pedido p WHERE p.cliente.id = :clienteId")
    List<SolicitacaoTroca> findByPedidoClienteId(@Param("clienteId") Long clienteId);

    List<SolicitacaoTroca> findAllByOrderByDataSolicitacaoDesc();
}