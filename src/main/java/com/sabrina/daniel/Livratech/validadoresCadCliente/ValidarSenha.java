package com.sabrina.daniel.Livratech.validadoresCadCliente;


import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarSenha implements IStrategy<Cliente> {
    @Override
    public String processar(Cliente cliente) {
        if (cliente.getSenha() == null || cliente.getSenha().isEmpty()) {
            return "A senha é obrigatória.";
        }
        if (cliente.getSenha().length() < 8) {
            return "A senha deve ter pelo menos 8 caracteres.";
        }
        if (!cliente.getSenha().matches(".*[A-Z].*")) {
            return "A senha deve conter pelo menos uma letra maiúscula.";
        }
        if (!cliente.getSenha().matches(".*[a-z].*")) {
            return "A senha deve conter pelo menos uma letra minúscula.";
        }
        if (!cliente.getSenha().matches(".*\\d.*")) {
            return "A senha deve conter pelo menos um dígito.";
        }
        return null;
    }
}