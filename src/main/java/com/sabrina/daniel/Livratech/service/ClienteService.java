package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.model.Carrinho;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.negocio.IStrategy;
import com.sabrina.daniel.Livratech.validadoresCadCliente.ValidarDadosObrigatoriosCadastro;
import com.sabrina.daniel.Livratech.validadoresCadCliente.ValidarSenha;
import com.sabrina.daniel.Livratech.validadoresCadCliente.ValidarTelefone;
import com.sabrina.daniel.Livratech.validadoresCadCliente.ValidarTiposEndereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class ClienteService  {

    Map<String, List<IStrategy>> rns = new HashMap<String, List<IStrategy>>();

    List<IStrategy> regrasCliente = new ArrayList<IStrategy>();

    Map<String, JpaRepository> repositories = new HashMap<String, JpaRepository>();

    ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
        regrasCliente.add(new ValidarDadosObrigatoriosCadastro());
        regrasCliente.add(new ValidarTelefone());
        regrasCliente.add(new ValidarTiposEndereco());
        regrasCliente.add(new ValidarSenha());

        rns.put(Cliente.class.getName(), regrasCliente);

        repositories.put(Cliente.class.getName(), clienteRepository);
    }
    @Transactional(noRollbackFor = ValidacaoException.class)
    public Cliente save(Cliente cliente) {
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

            // Criptografa a senha antes de salvar
            if (cliente.getSenha() != null && !cliente.getSenha().isEmpty()) {
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                cliente.setSenha(encoder.encode(cliente.getSenha()));
            }

            JpaRepository repository = repositories.get(nmClasse);
            return (Cliente) repository.save(cliente); // retorna o cliente com ID gerado
        }
        throw new ValidacaoException(sb.toString());
    }

    public String update(Long id, DadosConsultaCliente dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // Atualiza campos básicos
        cliente.setNome(dto.nome());
        cliente.setGenero(dto.genero());
        cliente.setDataNascimento(dto.dataNascimento());
        cliente.setCpf(dto.cpf());
        cliente.setEmail(dto.email());
        cliente.setStatus(dto.status());

        // Telefones
        if (dto.telefones() != null) {
            cliente.getTelefones().clear();
            dto.telefones().forEach(t -> {
                t.setCliente(cliente);
                cliente.getTelefones().add(t);
            });
        }

        // Endereços
        if (dto.enderecos() != null) {
            cliente.getEnderecos().clear();
            dto.enderecos().forEach(e -> {
                e.setCliente(cliente);
                cliente.getEnderecos().add(e);
            });
        }

        // Cartões (fazendo manual para evitar erro do orphanRemoval)
        if (dto.cartoesCredito() != null) {
            cliente.getCartoesCredito().clear();
            dto.cartoesCredito().forEach(c -> {
                c.setCliente(cliente);
                cliente.getCartoesCredito().add(c);
            });
        }

        clienteRepository.save(cliente);
        return "Cliente atualizado com sucesso!";
    }


    public String updateSenha(Long id, String senhaAtual, String novaSenha, String confirmarSenha) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Verifica senha atual
        if (!encoder.matches(senhaAtual, cliente.getSenha())) {
            throw new RuntimeException("Senha atual incorreta");
        }

        // Verifica se nova senha e confirmação são iguais
        if (!novaSenha.equals(confirmarSenha)) {
            throw new RuntimeException("As senhas não coincidem");
        }

        // Validação da senha forte (RNF0031)
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        if (!novaSenha.matches(regex)) {
            throw new RuntimeException(
                    "A senha deve ter no mínimo 8 caracteres, incluir letras maiúsculas, minúsculas, números e caracteres especiais"
            );
        }

        // Atualiza senha criptografada
        cliente.setSenha(encoder.encode(novaSenha));
        clienteRepository.save(cliente);

        return "Senha alterada com sucesso!";
    }

    public String delete(Cliente cliente) {
        String nmClasse = cliente.getClass().getName();
        JpaRepository repository = repositories.get(nmClasse);
        repository.delete(cliente);
        return "Cliente deletado com sucesso!";
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
                List.copyOf(cliente.getCartoesCredito()),
                List.copyOf(cliente.getCupons())
        );
    }

    public Cliente findById(Long id) {
        return clienteRepository.findById(id).orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }
}