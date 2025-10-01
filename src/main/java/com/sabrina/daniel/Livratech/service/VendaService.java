package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.CartaoRepository;
import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.daos.EnderecoRepository;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.model.Carrinho;
import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.negocio.IStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@Transactional
public class VendaService {

    private EnderecoRepository enderecoRepository;
    private ClienteRepository clienteRepository;
    private CartaoRepository cartaoRepository;
    @Autowired
    public VendaService(EnderecoRepository enderecoRepository, ClienteRepository clienteRepository, CartaoRepository cartaoRepository) {
        this.enderecoRepository = enderecoRepository;
         this.clienteRepository = clienteRepository;
            this.cartaoRepository = cartaoRepository;
    }

    public Cliente save(Cliente cliente) {
        return cliente;
    }

    public Endereco salvarEndereco(Long idCliente, Endereco enderecoNovo) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com id: " + idCliente));

        // associa o cliente certo
        enderecoNovo.setCliente(cliente);

        return enderecoRepository.save(enderecoNovo);
    }

    public CartaoDeCredito salvarCartao(Long idCliente, CartaoDeCredito cartaoNovo) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com id: " + idCliente));
        cartaoNovo.setCliente(cliente);
        return cartaoRepository.save(cartaoNovo);
    }

}
