package com.sabrina.daniel.Livratech.validadoresCadCliente;

import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarDadosObrigatoriosEnderecos implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        StringBuilder erros = new StringBuilder();

        if (cliente.getEnderecos() != null && !cliente.getEnderecos().isEmpty()) {
            for (Endereco endereco : cliente.getEnderecos()) {
                if (endereco.getTipoResidencia() == null) {
                    erros.append("O tipo de residência é obrigatório.\n");
                }
                if (endereco.getTipoLogradouro() == null) {
                    erros.append("O tipo de logradouro é obrigatório.\n");
                }
                if (endereco.getLogradouro() == null || endereco.getLogradouro().isEmpty()) {
                    erros.append("O logradouro é obrigatório.\n");
                }
                if (endereco.getNumero() == null || endereco.getNumero().isEmpty()) {
                    erros.append("O número é obrigatório.\n");
                }
                if (endereco.getBairro() == null || endereco.getBairro().isEmpty()) {
                    erros.append("O bairro é obrigatório.\n");
                }
                if (endereco.getCep() == null || endereco.getCep().isEmpty()) {
                    erros.append("O CEP é obrigatório.\n");
                }
                if (endereco.getCidade() == null || endereco.getCidade().isEmpty()) {
                    erros.append("A cidade é obrigatória.\n");
                }
                if (endereco.getEstado() == null || endereco.getEstado().isEmpty()) {
                    erros.append("O estado é obrigatório.\n");
                }
                if (endereco.getPais() == null || endereco.getPais().isEmpty()) {
                    erros.append("O país é obrigatório.\n");
                }
            }

//            // Validação complementar (se houver regras de tipos de endereço)
//            String erroTipos = new ValidarTiposEndereco().processar(cliente);
//            if (erroTipos != null && !erroTipos.isEmpty()) {
//                erros.append(erroTipos).append("\n");
//            }
        }

        return erros.length() > 0 ? erros.toString().trim() : null;
    }
}
