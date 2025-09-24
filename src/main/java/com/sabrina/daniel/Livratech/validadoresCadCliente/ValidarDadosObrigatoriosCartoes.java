package com.sabrina.daniel.Livratech.validadoresCadCliente;


import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarDadosObrigatoriosCartoes implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        StringBuilder erros = new StringBuilder();

        if (cliente.getCartoesCredito() != null && !cliente.getCartoesCredito().isEmpty()) {
            int preferencial = 0;

            for (CartaoDeCredito cartao : cliente.getCartoesCredito()) {
                if (cartao.getNumeroCartao() == null || cartao.getNumeroCartao().isEmpty()) {
                    erros.append("O número do cartão é obrigatório.\n");
                }
                if (cartao.getNomeImpresso() == null || cartao.getNomeImpresso().isEmpty()) {
                    erros.append("O nome impresso no cartão é obrigatório.\n");
                }
                if (cartao.getBandeira() == null) {
                    erros.append("A bandeira do cartão é obrigatória.\n");
                }
                if (cartao.getCodigoSeguranca() == null || cartao.getCodigoSeguranca().isEmpty()) {
                    erros.append("O código de segurança do cartão é obrigatório.\n");
                }
                if (Boolean.TRUE.equals(cartao.getPreferencial())) {
                    preferencial++;
                }
            }

            // Valida bandeira
            String erroBandeira = new ValidarBandeiraCartao().processar(cliente);
            if (erroBandeira != null && !erroBandeira.isEmpty()) {
                erros.append(erroBandeira).append("\n");
            }

            // Verifica se existe pelo menos um preferencial
            if (preferencial == 0) {
                erros.append("É obrigatório que algum cartão seja preferencial.\n");
            }
        }

        return erros.length() > 0 ? erros.toString().trim() : null;
    }
}

