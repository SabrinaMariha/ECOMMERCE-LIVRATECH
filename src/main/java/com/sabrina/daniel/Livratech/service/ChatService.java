package com.sabrina.daniel.Livratech.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.sabrina.daniel.Livratech.daos.ProdutoRepository;
import com.sabrina.daniel.Livratech.dtos.DadosMensagemCliente;
import com.sabrina.daniel.Livratech.model.Produto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ChatService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public String consultarLivrosDisponiveis(DadosMensagemCliente dto) {
        List<Produto> produtos = produtoRepository.findAll();

        StringBuilder sbPergunta = new StringBuilder();
        sbPergunta.append("""
                Você é um assistente educado e simpático da livraria LivraTec. 
                Use os livros abaixo para responder às dúvidas do cliente sobre indicações, preços ou autores.
                Seja breve e gentil:
                """).append("\n\n");

        for (Produto produto : produtos) {
            sbPergunta.append("📘 **").append(produto.getNome())
                    .append("** — ").append(produto.getAutor())
                    .append(" (R$").append(produto.getPreco()).append(")\n");
        }

        sbPergunta.append("\nCliente perguntou: ").append(dto.mensagem());

        return obterReposta(sbPergunta);
    }

    private String obterReposta(StringBuilder mensagemUsuario) {
        String apiKey = System.getenv("GOOGLE_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getProperty("GOOGLE_API_KEY");
        }

        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("A chave GOOGLE_API_KEY não foi encontrada. Verifique o arquivo .env!");
        }

        Client client = new Client.Builder()
                .apiKey(apiKey)
                .build();

        GenerateContentResponse response = client.models.generateContent(
                "gemini-2.5-flash",
                mensagemUsuario.toString(),
                null
        );

        System.out.println("🤖 Resposta da IA: " + response.text());
        return response.text();
    }
}
