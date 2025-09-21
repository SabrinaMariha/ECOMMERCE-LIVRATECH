package com.sabrina.daniel.Livratech.validadoresCadCliente;


import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarTiposEndereco implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        for (Endereco endereco : cliente.getEnderecos()) {
//            if (endereco.get().equals("Nao")) {
//                return "Todo cliente deve ter pelo menos um endereço de cobrança.";
//            }
//            if (endereco.getEntrega().equals("Nao")) {
//                return "Todo cliente deve ter pelo menos um endereço de entrega.";
//            }
        }
        return null;
    }
}
