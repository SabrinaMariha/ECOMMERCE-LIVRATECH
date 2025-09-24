package com.sabrina.daniel.Livratech.validadoresCadCliente;


import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;

public class ValidarDadosObrigatoriosCadastro implements IStrategy<Cliente> {

    @Override
    public String processar(Cliente cliente) {
        StringBuilder erros = new StringBuilder();

        if (cliente.getNome() == null || cliente.getNome().isEmpty()) {
            erros.append("O nome do cliente é obrigatório.\n");
        }
        if (cliente.getEmail() == null || cliente.getEmail().isEmpty()) {
            erros.append("O email do cliente é obrigatório.\n");
        }
        if (cliente.getCpf() == null || cliente.getCpf().isEmpty()) {
            erros.append("O CPF do cliente é obrigatório.\n");
        }
        if (cliente.getDataNascimento() == null) {
            erros.append("A data de nascimento do cliente é obrigatória.\n");
        }
//        if (cliente.getTelefones() == null || cliente.getTelefones().isEmpty()) {
//            erros.append("O telefone do cliente é obrigatório.\n");
//        }
        if (cliente.getEnderecos() == null || cliente.getEnderecos().isEmpty()) {
            erros.append("O cliente deve ter pelo menos um endereço cadastrado.\n");
        }

        // Validar detalhes dos endereços
        String erroEndereco = new ValidarDadosObrigatoriosEnderecos().processar(cliente);
        if (erroEndereco != null) erros.append(erroEndereco).append("\n");

        // Validar detalhes dos cartões
        String erroCartao = new ValidarDadosObrigatoriosCartoes().processar(cliente);
        if (erroCartao != null) erros.append(erroCartao).append("\n");

        return erros.length() > 0 ? erros.toString().trim() : null;
    }
}
