package com.sabrina.daniel.Livratech.model;

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
    private String nome;
    private String autor;
    @Column(length = 1000)
    private String descricao;
    @Column(length = 5000)
    private String descDetalhada;
    private Double preco;
    private Integer estoque;
    private String imagemUrl;
}
