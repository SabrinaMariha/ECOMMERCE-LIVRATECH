
package com.sabrina.daniel.Livratech.validadoresCadCliente;


import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarTelefone implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {

//        if (cliente.getTelefones() == null || cliente.getTelefones().isEmpty()) {
//            return "O telefone do cliente deve ter entre 10 e 15 caracteres.";
//        }
//        if (!cliente.getTelefones().matches("\\d+")) {
//            return "O telefone do cliente deve conter apenas números.";
//        }
//        if (cliente.getTipoDeTelefone() == null || cliente.getTipoDeTelefone().isEmpty()) {
//            return "O tipo de telefone do cliente é obrigatório.";
//        }

        return null;
    }
}
