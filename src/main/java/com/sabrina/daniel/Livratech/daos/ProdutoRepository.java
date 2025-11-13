package com.sabrina.daniel.Livratech.daos;
// Arquivo: ProdutoRepository.java

import com.sabrina.daniel.Livratech.enums.Categoria;
import com.sabrina.daniel.Livratech.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findAllByOrderByIdAsc();

    @Query("""
    SELECT DISTINCT p FROM Produto p  
    WHERE 
        (COALESCE(NULLIF(:nome, ''), NULL) IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%')))
        AND (COALESCE(NULLIF(:autor, ''), NULL) IS NULL OR LOWER(p.autor) LIKE LOWER(CONCAT('%', :autor, '%')))
        AND (:precoMin IS NULL OR p.preco >= :precoMin)
        AND (:precoMax IS NULL OR p.preco <= :precoMax)
        AND (:#{#categorias == null || #categorias.isEmpty()} = true OR p.categoria IN (:categorias))
""")
    List<Produto> filtrarProdutos(
            @Param("nome") String nome,
            @Param("autor") String autor,
            @Param("precoMin") Double precoMin,
            @Param("precoMax") Double precoMax,
            @Param("categorias") List<Categoria> categorias
    );

    List<Produto> findByCategoria(Categoria categoria);
    List<Produto> findAll();
}