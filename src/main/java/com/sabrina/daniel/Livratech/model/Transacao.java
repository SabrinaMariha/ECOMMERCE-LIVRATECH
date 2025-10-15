package com.sabrina.daniel.Livratech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sabrina.daniel.Livratech.enums.StatusCompra;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transacao extends DomainEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date data;

    @Getter
    @Setter
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatusCompra status;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartao_id")
    private CartaoDeCredito cartao;

}