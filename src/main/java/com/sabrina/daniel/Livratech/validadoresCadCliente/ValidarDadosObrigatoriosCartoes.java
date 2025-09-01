//package com.sabrina.daniel.Livratech.validadoresCadCliente;
//
//import com.eng.soft.TrabalhoFinal.model.CartaoDeCredito;
//import com.eng.soft.TrabalhoFinal.model.Cliente;
//import com.eng.soft.TrabalhoFinal.negocio.IStrategy;
//
//
//
//
//public class ValidarDadosObrigatoriosCartoes implements IStrategy<Cliente>  {
//
//    @Override
//    public String processar(Cliente cliente) {
//    if (cliente.getCartoesDeCredito()!= null || cliente.getCartoesDeCredito().isEmpty()){
//            int preferencial=0;
//            for (CartaoDeCredito cartao : cliente.getCartoesDeCredito()) {
//                if (cartao.getNumero() == null || cartao.getNumero().isEmpty()) {
//                    return "O número do cartão é obrigatório.";
//                }
//                if (cartao.getNomeTitular() == null || cartao.getNomeTitular().isEmpty()) {
//                    return "O nome impresso no cartão é obrigatório.";
//                }
//                if (cartao.getBandeira() == null || cartao.getBandeira().isEmpty()) {
//                    return "A bandeira do cartão é obrigatória.";
//                }
//                if (cartao.getCvv() == null || cartao.getCvv().isEmpty()) {
//                    return "O código de segurança do cartão é obrigatório.";
//                }
//                if(cartao.getPreferencial()== true || cartao.getPreferencial().equals("true")){
//                    preferencial++;
//                }
//
//            }
//
//            new ValidarBandeiraCartao().processar(cliente);
//        if(preferencial==0) return "É obrigatório que algum cartão seja preferencial.";
//        }
//        return null;
//    }
//}
