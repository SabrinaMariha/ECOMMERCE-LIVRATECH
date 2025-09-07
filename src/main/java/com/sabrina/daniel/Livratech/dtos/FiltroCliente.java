package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.enums.Genero;
import com.sabrina.daniel.Livratech.enums.Status;
import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.model.Telefone;

import java.util.Date;
import java.util.List;

public record FiltroCliente(Long id,
                            String nome,
                            Genero genero,
                            Date dataNascimento,
                            String cpf,
                            Telefone telefone,
                            String email,
                            Status status,
                            List<Endereco> enderecos,
                            List<CartaoDeCredito> cartoesCredito
){}
