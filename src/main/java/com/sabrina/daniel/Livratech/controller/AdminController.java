package com.sabrina.daniel.Livratech.controller;


import com.sabrina.daniel.Livratech.Exceptions.ValidacaoException;
import com.sabrina.daniel.Livratech.daos.PedidoRepository;
import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;
import com.sabrina.daniel.Livratech.dtos.FiltroCliente;
import com.sabrina.daniel.Livratech.dtos.SolicitacaoTrocaDTO;
import com.sabrina.daniel.Livratech.dtos.VendaDiaDTO;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.service.AdminService;
import com.sabrina.daniel.Livratech.service.ClienteService;
import com.sabrina.daniel.Livratech.service.TrocaService;
import com.sabrina.daniel.Livratech.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private TrocaService trocaService;
    @Autowired
    private  VendaService vendaService;
    @Autowired
    private PedidoRepository pedidoRepository;
    @PostMapping("/clientes")
    public ResponseEntity<Map<String, Object>> buscarClientes(@RequestBody FiltroCliente filtroClientes) throws Exception {
        List<Cliente> clientes = adminService.findAll(filtroClientes);

        // Faz a conversão de Cliente → DadosConsultaCliente
        List<DadosConsultaCliente> clientesDto = clientes.stream()
                .map(cliente -> new DadosConsultaCliente(
                        cliente.getId(),
                        cliente.getNome(),
                        cliente.getGenero(),
                        cliente.getDataNascimento(),
                        cliente.getCpf(),
                        cliente.getTelefones(),
                        cliente.getEmail(),
                        cliente.getStatus(),
                        cliente.getEnderecos(),
                        cliente.getCartoesCredito(),
                        cliente.getCupons()
                ))
                .toList();

        Map<String, Object> resposta = new HashMap<>();
        if (clientesDto.isEmpty()) {
            resposta.put("mensagem", "Nenhum cliente encontrado.");
        } else {
            resposta.put("clientes", clientesDto);
        }

        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<DadosConsultaCliente> buscarPorId(@PathVariable long id) throws Exception {
        DadosConsultaCliente dto = adminService.findDTOById(id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/cliente/{id}/inativar")
    public ResponseEntity<String> inativarPorId(@PathVariable long id) throws Exception {
        DadosConsultaCliente dto = adminService.inativarPorId(id);
        return ResponseEntity.ok("Cliente " + dto.nome() + " inativado com sucesso!");
    }

    @GetMapping("/vendas")
    public ResponseEntity<List<Map<String, Object>>> buscarVendas() throws Exception {
        List<Map<String, Object>> vendas = adminService.buscarVendas();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("vendas/{pedidoId}/detalhes")
    public ResponseEntity<Map<String, Object>> buscarDetalhesDoPedido(@PathVariable Long pedidoId) throws Exception {
        Map<String, Object> detalhes = adminService.buscarDetalhesDoPedido(pedidoId);
        return ResponseEntity.ok(detalhes);
    }

    @PutMapping("/vendas/{pedidoId}/atualizar-status")
    public ResponseEntity<String> atualizarStatusDoPedido(@PathVariable Long pedidoId, @RequestParam String novoStatus) throws Exception {
        adminService.atualizarStatusDoPedido(pedidoId, novoStatus);
        return ResponseEntity.ok("Status do pedido atualizado com sucesso para: " + novoStatus);
    }

    @GetMapping("/trocas")
    public ResponseEntity<List<SolicitacaoTrocaDTO>> buscarSolicitacoesDeTroca() {
        List<SolicitacaoTrocaDTO> solicitacoes = trocaService.listarTodasSolicitacoesAdmin();
        return ResponseEntity.ok(solicitacoes);
    }

    @PutMapping("/trocas/{solicitacaoId}/status")
    public ResponseEntity<?> atualizarStatusTroca(
            @PathVariable Long solicitacaoId,
            @RequestParam String novoStatus) { // Recebe ex: "AUTORIZADA"
        try {
            SolicitacaoTrocaDTO dto = trocaService.atualizarStatusTrocaAdmin(solicitacaoId, novoStatus);
            return ResponseEntity.ok(dto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (ValidacaoException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


//    @GetMapping("relatorios/vendas-periodo")
//    public ResponseEntity<List<VendaDiaDTO>> getVendasPorPeriodo(
//            @RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dataInicio,
//            @RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dataFim) {
//
//        List<VendaDiaDTO> data = vendaService.getVolumeVendasPorPeriodo(dataInicio, dataFim);
//        return ResponseEntity.ok(data);
//    }

    @GetMapping("relatorios/vendas-categoria")
    public ResponseEntity<List<PedidoRepository.VendaCategoriaProjection>> findVendasPorCategoria(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dataFim) {

        // CHAMA O SERVIÇO QUE AJUSTA A DATA
        List<PedidoRepository.VendaCategoriaProjection> resultado =
                vendaService.getVendasPorCategoriaEPeriodo(dataInicio, dataFim);

        return ResponseEntity.ok(resultado);
    }
}
