package com.sabrina.daniel.Livratech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sabrina.daniel.Livratech.enums.TipoTelefone;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Telefone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoTelefone tipo;

    private String ddd;
    private String numero;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}