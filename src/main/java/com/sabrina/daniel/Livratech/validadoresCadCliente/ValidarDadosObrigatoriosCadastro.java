//package com.sabrina.daniel.Livratech.validadoresCadCliente;
//
//import com.eng.soft.TrabalhoFinal.model.Cliente;
//import com.eng.soft.TrabalhoFinal.negocio.IStrategy;
//
//public class ValidarDadosObrigatoriosCadastro implements IStrategy<Cliente> {
//
//    @Override
//    public String processar(Cliente cliente) {
//        System.out.println("Cliente recebido para validação: " + cliente);
//        System.out.println("Endereços: " + cliente.getEnderecos());
//        if (cliente.getNome() == null || cliente.getNome().isEmpty()) {
//            return "O nome do cliente é obrigatório.";
//        }
//        if (cliente.getEmail() == null || cliente.getEmail().isEmpty()) {
//            return "O email do cliente é obrigatório.";
//        }
//        if (cliente.getCpf() == null || cliente.getCpf().isEmpty()) {
//            return "O CPF do cliente é obrigatório.";
//        }
//        if (cliente.getDataDeNascimento() == null) {
//            return "A data de nascimento do cliente é obrigatória.";
//        }
//        if (cliente.getTelefone() == null || cliente.getTelefone().isEmpty()) {
//            return "O telefone do cliente é obrigatório.";
//        }
//        if (cliente.getEnderecos() == null || cliente.getEnderecos().isEmpty()) {
//            return "O cliente deve ter pelo menos um endereço cadastrado.";
//        }
//
//        // Validar detalhes dos endereços
//        String erroEndereco = new ValidarDadosObrigatoriosEnderecos().processar(cliente);
//        if (erroEndereco != null) return erroEndereco;
//
//        // Validar detalhes dos cartões
//        String erroCartao = new ValidarDadosObrigatoriosCartoes().processar(cliente);
//        if (erroCartao != null) return erroCartao;
//
//        return null;
//    }
//}
