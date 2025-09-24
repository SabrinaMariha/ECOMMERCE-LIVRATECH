package com.sabrina.daniel.Livratech.validadoresCadCliente;

import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Telefone;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarTelefone implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        StringBuilder erros = new StringBuilder();

        if (cliente.getTelefones() == null || cliente.getTelefones().isEmpty()) {
            erros.append("O cliente deve ter pelo menos um telefone cadastrado.\n");
        } else {
            for (Telefone telefone : cliente.getTelefones()) {
                if (telefone.getTipo() == null) {
                    erros.append("O tipo do telefone é obrigatório.\n");
                }
                if (telefone.getDdd() == null || telefone.getDdd().isEmpty()) {
                    erros.append("O DDD do telefone é obrigatório.\n");
                } else if (!telefone.getDdd().matches("\\d{2}")) {
                    erros.append("O DDD do telefone deve ter 2 dígitos numéricos.\n");
                }
                if (telefone.getNumero() == null || telefone.getNumero().isEmpty()) {
                    erros.append("O número do telefone é obrigatório.\n");
                } else if (!telefone.getNumero().matches("\\d{8,9}")) {
                    erros.append("O número do telefone deve ter entre 8 e 9 dígitos numéricos.\n");
                }
            }
        }

        return erros.length() > 0 ? erros.toString().trim() : null;
    }
}
