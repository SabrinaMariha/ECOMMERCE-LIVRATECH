package com.sabrina.daniel.Livratech.model;

import com.sabrina.daniel.Livratech.enums.Genero;
import com.sabrina.daniel.Livratech.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "cliente")
public class Cliente extends DomainEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Genero genero;

    @Temporal(TemporalType.DATE)
    private Date dataNascimento;

    private String cpf;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Telefone> telefones;

    private String email;
    private String senha;
    private int ranking;

    @Transient
    private String confirmarSenha;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Endereco> enderecos;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartaoDeCredito> cartoesCredito;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pedido> pedidos;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "carrinho_id")
    private Carrinho carrinho;

    //é pra pré estabelecer como ativo caso não tenha valor no banco ainda (usuario novo)
    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = Status.ATIVO; // define ATIVO apenas se ainda não tiver valor
        }
    }
}