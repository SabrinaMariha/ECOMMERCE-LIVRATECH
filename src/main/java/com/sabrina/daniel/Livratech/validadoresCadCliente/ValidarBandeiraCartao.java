package com.sabrina.daniel.Livratech.validadoresCadCliente;

import com.sabrina.daniel.Livratech.enums.BandeiraCartao;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarBandeiraCartao implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        StringBuilder erros = new StringBuilder();

        if (cliente.getCartoesCredito() != null && !cliente.getCartoesCredito().isEmpty()) {
            for (var cartao : cliente.getCartoesCredito()) {
                BandeiraCartao bandeira = cartao.getBandeira();

                if (bandeira == null ||
                        (bandeira != BandeiraCartao.VISA &&
                                bandeira != BandeiraCartao.MASTERCARD &&
                                bandeira != BandeiraCartao.ELO)) {  // cuidado com o nome do enum

                    erros.append("A bandeira do cartão de crédito deve ser uma das seguintes: Visa, Mastercard ou Elo.\n");
                }
            }
        }

        return erros.length() > 0 ? erros.toString().trim() : null;
    }
}
