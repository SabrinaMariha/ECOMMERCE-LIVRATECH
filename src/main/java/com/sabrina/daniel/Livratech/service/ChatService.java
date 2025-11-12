package com.sabrina.daniel.Livratech.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.sabrina.daniel.Livratech.daos.ProdutoRepository;
import com.sabrina.daniel.Livratech.dtos.DadosMensagemCliente;
import com.sabrina.daniel.Livratech.enums.Categoria;
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

    public String consultarGenerosDisponiveis(DadosMensagemCliente dto, Categoria categoria) {
        List<Produto> produtosDaCategoria = produtoRepository.findByCategoria(categoria);

        StringBuilder sbPergunta = new StringBuilder();
        sbPergunta.append("Responda com uma resposta breve e gentil para o cliente com base nos seguintes livros disponíveis na categoria ")
                .append(categoria)
                .append(":\n");

        for (Produto produto : produtosDaCategoria) {
            sbPergunta.append("Título: ").append(produto.getNome())
                    .append(", Autor: ").append(produto.getAutor())
                    .append(", Preço: R$").append(produto.getPreco())
                    .append("\n");
        }

        sbPergunta.append("Cliente perguntou: ").append(dto.mensagem());

        return obterReposta(sbPergunta);
    }

    public String obterReposta(StringBuilder mensagemUsuario) {
        // 🧠 Busca a API key — tenta primeiro variável de ambiente, depois propriedade do sistema
        String apiKey = System.getenv("GOOGLE_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getProperty("GOOGLE_API_KEY");
        }

        // 🚨 Verificação de segurança
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("A chave GOOGLE_API_KEY não foi encontrada. Verifique o arquivo .env!");
        }

        // 🪄 Inicializa o cliente com a chave carregada
        Client client = new Client.Builder()
                .apiKey(apiKey)
                .build();

        // ✨ Envia a solicitação
        GenerateContentResponse response = client.models.generateContent(
                "gemini-2.5-flash",
                mensagemUsuario.toString(),
                null
        );

        System.out.println("🤖 Resposta da IA: " + response.text());
        return response.text();
    }
}
