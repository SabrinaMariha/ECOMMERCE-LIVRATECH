package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.model.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

}
