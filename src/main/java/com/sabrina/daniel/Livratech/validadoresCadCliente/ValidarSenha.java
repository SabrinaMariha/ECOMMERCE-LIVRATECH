package com.sabrina.daniel.Livratech.validadoresCadCliente;

import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarSenha implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        StringBuilder erros = new StringBuilder();
        String senha = cliente.getSenha();

        if (senha == null || senha.isEmpty()) {
            erros.append("A senha é obrigatória.\n");
        } else {
            if (senha.length() < 8) {
                erros.append("A senha deve ter pelo menos 8 caracteres.\n");
            }
            if (!senha.matches(".*[A-Z].*")) {
                erros.append("A senha deve conter pelo menos uma letra maiúscula.\n");
            }
            if (!senha.matches(".*[a-z].*")) {
                erros.append("A senha deve conter pelo menos uma letra minúscula.\n");
            }
            if (!senha.matches(".*\\d.*")) {
                erros.append("A senha deve conter pelo menos um dígito.\n");
            }
        }

        return erros.length() > 0 ? erros.toString().trim() : null;
    }
}
