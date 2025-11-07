package com.sabrina.daniel.Livratech.model;

import com.sabrina.daniel.Livratech.enums.Categoria;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", length = 255)
    private String nome;

    @Column(name = "autor", length = 255)
    private String autor;

    @Column(length = 1000)
    private String descricao;
    @Column(length = 5000)
    private String descDetalhada;
    private Double preco;
    private Integer estoque;
    private String imagemUrl;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;
}
