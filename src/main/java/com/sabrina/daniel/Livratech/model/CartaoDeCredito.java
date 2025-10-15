package com.sabrina.daniel.Livratech.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sabrina.daniel.Livratech.enums.BandeiraCartao;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartaoDeCredito extends DomainEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String numeroCartao;
    private String nomeImpresso;

    @Enumerated(EnumType.STRING)
    private BandeiraCartao bandeira;
    private String codigoSeguranca;
    private Boolean preferencial;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}
