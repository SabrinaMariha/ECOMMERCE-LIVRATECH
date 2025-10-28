package com.sabrina.daniel.Livratech.model;

import com.sabrina.daniel.Livratech.enums.StatusTroca;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity

public class SolicitacaoTroca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    private String motivo;
    private LocalDateTime dataSolicitacao;

    @Enumerated(EnumType.STRING)
    private StatusTroca status;
}