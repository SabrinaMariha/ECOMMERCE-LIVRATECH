package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.model.Carrinho;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Service
public class ClienteService implements IFachada<Cliente> {

    Map<String, List<IStrategy>> rns = new HashMap<String, List<IStrategy>>();

    List<IStrategy> regrasCliente = new ArrayList<IStrategy>();

    Map<String, JpaRepository> repositories = new HashMap<String, JpaRepository>();

    ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
//        regrasCliente.add(new ValidarDadosObrigatoriosCadastro());
//        regrasCliente.add(new ValidarTelefone());
//        regrasCliente.add(new ValidarTiposEndereco());
//        regrasCliente.add(new ValidarSenha());

        rns.put(Cliente.class.getName(), regrasCliente);

        repositories.put(Cliente.class.getName(),  clienteRepository);
    }

    @Override
    public String save(Cliente cliente) {
        String nmClasse = cliente.getClass().getName();
        List<IStrategy> rn = rns.get(nmClasse);
        StringBuilder sb = new StringBuilder();

        // Executa as regras de negócio
        for (IStrategy s : rn) {
            String msg = s.processar(cliente);
            if (msg != null) {
                sb.append("\n").append(msg);
            }
        }

        // Se não houver mensagens de erro, salva o cliente
        if (sb.length() == 0) {
            // Associa cliente aos filhos
            if (cliente.getTelefones() != null) {
                cliente.getTelefones().forEach(t -> t.setCliente(cliente));
            }
            if (cliente.getEnderecos() != null) {
                cliente.getEnderecos().forEach(e -> e.setCliente(cliente));
            }
            if (cliente.getCartoesCredito() != null) {
                cliente.getCartoesCredito().forEach(c -> c.setCliente(cliente));
            }

            // Cria um carrinho vazio para o cliente
            if (cliente.getCarrinho() == null) {
                cliente.setCarrinho(new Carrinho());
            }

            JpaRepository repository = repositories.get(nmClasse);
            repository.save(cliente);
            return "Cliente cadastrado com sucesso!";
        }

        return sb.toString();
    }


    @Override
    public String update(Cliente cliente) {
        String nmClasse = cliente.getClass().getName();
        List<IStrategy> rn = rns.get(nmClasse);
        StringBuilder sb = new StringBuilder();

        for (IStrategy s : rn) {
            String msg = s.processar(cliente);
            if (msg != null) {
                sb.append("\n" + msg);
            }
        }
        if (sb.length() == 0) {
            JpaRepository repository = repositories.get(nmClasse);
            //repository.update(cliente);
            return "Cliente atualizado com sucesso!";
        }
        return sb.toString();
    }

    @Override
    public String updateSenha(Cliente cliente) {
        String nmClasse = cliente.getClass().getName();
        List<IStrategy> rn = rns.get(nmClasse);
        StringBuilder sb = new StringBuilder();

        for (IStrategy s : rn) {
            String msg = s.processar(cliente);
            if (msg != null) {
                sb.append("\n" + msg);
            }
        }
        if (sb.length() == 0) {
            JpaRepository repository = repositories.get(nmClasse);
            //repository.updateSenha(cliente);
            return "Senha atualizada com sucesso!";
        }
        return sb.toString();
    }

    @Override
    public String delete(Cliente cliente) {
        String nmClasse = cliente.getClass().getName();
        JpaRepository repository = repositories.get(nmClasse);
        repository.delete(cliente);
        return "Cliente deletado com sucesso!";
    }

    @Override
    public List<Cliente> findAll(Cliente cliente) {
        return List.of();
    }

//    @Override
//    public List<Cliente> findAll(Cliente clienteASerConsultado) {
//        List<Cliente> clientes = clienteRepository.findAll(clienteASerConsultado);
//        return clientes;
//    }

//    @Override
//    public Cliente findById(Long id)  throws SQLException {
//        return clienteRepository.findById(id);
//    }
}