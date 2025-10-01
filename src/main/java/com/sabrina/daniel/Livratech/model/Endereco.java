package com.sabrina.daniel.Livratech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sabrina.daniel.Livratech.enums.TipoEndereco;
import com.sabrina.daniel.Livratech.enums.TiposLogradouros;
import com.sabrina.daniel.Livratech.enums.TiposResidencias;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Endereco extends DomainEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TiposResidencias tipoResidencia;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TiposLogradouros tipoLogradouro;

    @Enumerated(EnumType.STRING)
    private TipoEndereco tipoEndereco;
    private String logradouro;
    private String numero;
    private String bairro;
    private String cep;
    private String cidade;
    private String estado;
    private String pais;
    private String observacoes;
    private String fraseIdentificadora;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @PrePersist
    @PreUpdate
    private void preencherFraseIdentificadora() {
        this.fraseIdentificadora = logradouro + " " + numero + " - " + cidade;
    }
}