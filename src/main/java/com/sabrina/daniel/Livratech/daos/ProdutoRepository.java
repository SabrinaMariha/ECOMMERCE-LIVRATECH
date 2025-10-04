package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

}
