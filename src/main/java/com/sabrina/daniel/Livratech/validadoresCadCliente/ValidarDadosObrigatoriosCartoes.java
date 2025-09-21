package com.sabrina.daniel.Livratech.validadoresCadCliente;


import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarDadosObrigatoriosCartoes implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
    if (cliente.getCartoesCredito()!= null || cliente.getCartoesCredito().isEmpty()){
            int preferencial=0;
            for (CartaoDeCredito cartao : cliente.getCartoesCredito()) {
                if (cartao.getNumeroCartao() == null || cartao.getNumeroCartao().isEmpty()) {
                    return "O número do cartão é obrigatório.";
                }
                if (cartao.getNomeImpresso() == null || cartao.getNomeImpresso().isEmpty()) {
                    return "O nome impresso no cartão é obrigatório.";
                }
                if (cartao.getBandeira() == null ) {
                    return "A bandeira do cartão é obrigatória.";
                }
                if (cartao.getCodigoSeguranca() == null || cartao.getCodigoSeguranca().isEmpty()) {
                    return "O código de segurança do cartão é obrigatório.";
                }
                if(cartao.getPreferencial()== true || cartao.getPreferencial().equals("true")){
                    preferencial++;
                }

            }

            new ValidarBandeiraCartao().processar(cliente);
        if(preferencial==0) return "É obrigatório que algum cartão seja preferencial.";
        }
        return null;
    }
}
