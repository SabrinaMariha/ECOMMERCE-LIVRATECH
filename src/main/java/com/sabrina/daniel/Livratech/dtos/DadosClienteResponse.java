package com.sabrina.daniel.Livratech.dtos;

import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Endereco;

import java.util.List;

public  record DadosClienteResponse (
        List<Endereco> enderecos,
        List<CartaoDeCredito> cartoes

){

}
