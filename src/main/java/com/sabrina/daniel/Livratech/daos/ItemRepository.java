package com.sabrina.daniel.Livratech.daos;

import com.sabrina.daniel.Livratech.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByCarrinhoId(Long carrinhoId);
}
