
package com.sabrina.daniel.Livratech.validadoresCadCliente;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarBandeiraCartao implements IStrategy<Cliente> {


    @Override
    public String processar(Cliente cliente) {

        if(cliente.getCartoesCredito() != null || !cliente.getCartoesCredito().isEmpty()) {
            for (var cartao : cliente.getCartoesCredito()) {

                if (!cartao.getBandeira().equals("VISA") || !cartao.getBandeira().equals("MASTERCARD") || !cartao.getBandeira().equals("ELO")) {
                    return "A bandeira do cartão de crédito deve ser uma das seguintes: Visa, MasterCard ou Amex.";
                }
            }
        }

        return null;
    }
}
