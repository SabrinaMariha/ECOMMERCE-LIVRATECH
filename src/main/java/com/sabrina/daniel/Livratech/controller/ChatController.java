package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.dtos.DadosMensagemCliente;
import com.sabrina.daniel.Livratech.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/mensagem/livros-disponiveis")
    public ResponseEntity<String> obterRespostaIA(@RequestBody DadosMensagemCliente dto) {
        String respostaIA = chatService.consultarLivrosDisponiveis(dto);
        return ResponseEntity.ok(respostaIA);
    }
}
