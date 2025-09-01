//
//package com.sabrina.daniel.Livratech.validadoresCadCliente;
//import com.eng.soft.TrabalhoFinal.model.Cliente;
//import com.eng.soft.TrabalhoFinal.negocio.IStrategy;
//
//
//public class ValidarBandeiraCartao implements IStrategy<Cliente> {
//
//
//    @Override
//    public String processar(Cliente cliente) {
//
//        if(cliente.getCartoesDeCredito() != null || !cliente.getCartoesDeCredito().isEmpty()) {
//            for (var cartao : cliente.getCartoesDeCredito()) {
//
//                if (!cartao.getBandeira().equals("Visa") || !cartao.getBandeira().equals("MasterCard") || !cartao.getBandeira().equals("Amex")) {
//                    return "A bandeira do cartão de crédito deve ser uma das seguintes: Visa, MasterCard ou Amex.";
//                }
//            }
//        }
//
//        return null;
//    }
//}
