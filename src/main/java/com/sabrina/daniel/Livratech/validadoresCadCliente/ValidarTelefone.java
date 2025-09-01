//
//package com.sabrina.daniel.Livratech.validadoresCadCliente;
//import com.eng.soft.TrabalhoFinal.model.Cliente;
//import com.eng.soft.TrabalhoFinal.negocio.IStrategy;
//
//
//public class ValidarTelefone implements IStrategy<Cliente>  {
//
//    @Override
//    public String processar(Cliente cliente) {
//
//        if (cliente.getTelefone().length() < 10 || cliente.getTelefone().length()
//                > 15) {
//            return "O telefone do cliente deve ter entre 10 e 15 caracteres.";
//        }
//        if (!cliente.getTelefone().matches("\\d+")) {
//            return "O telefone do cliente deve conter apenas números.";
//        }
//        if (cliente.getTipoDeTelefone() == null || cliente.getTipoDeTelefone().isEmpty()) {
//            return "O tipo de telefone do cliente é obrigatório.";
//        }
//
//        return null;
//    }
//}
