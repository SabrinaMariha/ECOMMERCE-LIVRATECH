package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.enums.Genero;
import com.sabrina.daniel.Livratech.enums.Status;
import com.sabrina.daniel.Livratech.model.*;

import java.util.Date;
import java.util.List;

public record DadosConsultaCliente(
        Long id,
        String nome,
        Genero genero,
        Date dataNascimento,
        String cpf,
        List<Telefone> telefones,
        String email,
        Status status,
        List<Endereco> enderecos,
        List<CartaoDeCredito> cartoesCredito,
        List<Cupom> cupons
){}