package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.FiltroCliente;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Service
@Transactional
public class AdminService {
    Map<String, List<IStrategy>> rns = new HashMap<String, List<IStrategy>>();

    List<IStrategy> regrasCliente = new ArrayList<IStrategy>();

    Map<String, JpaRepository> repositories = new HashMap<String, JpaRepository>();

    ClienteRepository clienteRepository;

    public AdminService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
//        regrasCliente.add(new ValidarDadosObrigatoriosCadastro());
//        regrasCliente.add(new ValidarTelefone());
//        regrasCliente.add(new ValidarTiposEndereco());
//        regrasCliente.add(new ValidarSenha());

        rns.put(Cliente.class.getName(), regrasCliente);

        repositories.put(Cliente.class.getName(),  clienteRepository);
    }



    public List<Cliente> findAll(FiltroCliente clienteASerConsultado) {
        List<Cliente> clientes = clienteRepository.findAllByFiltros(clienteASerConsultado);
        return clientes;
    }
    public DadosConsultaCliente findDTOById(Long id) throws Exception {
        Cliente cliente = clienteRepository.findById(id).orElseThrow(() -> new Exception("Cliente não encontrado"));
        return toDTO(cliente);
    }

    public DadosConsultaCliente toDTO(Cliente cliente) {
        return new DadosConsultaCliente(
                cliente.getId(),
                cliente.getNome(),
                cliente.getGenero(),
                cliente.getDataNascimento(),
                cliente.getCpf(),
                List.copyOf(cliente.getTelefones()), // evita mutabilidade externa
                cliente.getEmail(),
                cliente.getStatus(),
                List.copyOf(cliente.getEnderecos()),
                List.copyOf(cliente.getCartoesCredito())
        );
    }
}
