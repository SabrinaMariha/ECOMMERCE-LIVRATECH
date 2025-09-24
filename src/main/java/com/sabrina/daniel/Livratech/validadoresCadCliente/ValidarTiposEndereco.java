package com.sabrina.daniel.Livratech.validadoresCadCliente;


import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarTiposEndereco implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        StringBuilder erros = new StringBuilder();
        for (Endereco endereco : cliente.getEnderecos()) {

            if (endereco.getTipoEndereco() == null ) {
                erros.append( "Todo cliente deve ter pelo menos um endereço de cobrança e de entrega.\n");
            }

        }
        return erros.length() > 0 ? erros.toString().trim() : null;

    }
}
