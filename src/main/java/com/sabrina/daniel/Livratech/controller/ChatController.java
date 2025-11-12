package com.sabrina.daniel.Livratech.controller;

import com.sabrina.daniel.Livratech.dtos.DadosMensagemCliente;
import com.sabrina.daniel.Livratech.enums.Categoria;
import com.sabrina.daniel.Livratech.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/mensagem/livros-disponíveis/{categoria}")
    public ResponseEntity<String> obterRespostaIA(@RequestBody DadosMensagemCliente dto, @PathVariable Categoria categoria){
        StringBuilder respostaIA = new StringBuilder(chatService.consultarGenerosDisponiveis(dto, categoria));
        return ResponseEntity.ok(respostaIA.toString());
    }

}
