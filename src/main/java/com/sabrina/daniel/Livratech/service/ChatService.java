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
        // Busca todos os produtos
        List<Produto> produtos = produtoRepository.findAll();

        StringBuilder sbContexto = new StringBuilder();
        for (Produto produto : produtos) {
            sbContexto.append(String.format("""
                    - Título: %s | Autor: %s | Categoria: %s | Preço: R$ %.2f | Sinopse: %s
                    """,
                    produto.getNome(),
                    produto.getAutor(),
                    produto.getCategoria(),
                    produto.getPreco(),
                    produto.getDescricao()
            ));
        }

        StringBuilder sbPrompt = new StringBuilder();
        sbPrompt.append("""
                Você é um atendente experiente, simpático e sagaz da livraria 'LivraTec'.
                Converse de forma natural, fluida e humana.

                SUAS DIRETRIZES:
                
                1. **Perguntas Estranhas/Inusitadas:** Se o cliente fizer perguntas absurdas (ex: ler mergulhando, livro à prova de fogo), informe **resumidamente** que isso não é recomendado ou possível e mude o assunto para livros normais. Não dê longas explicações.
                
                2. **Fora do Escopo (Out of Scope):**
                   Se a pergunta NÃO for sobre livros ou sobre a livraria (ex: receitas, conselhos de vida, política, futebol), responda educadamente que **não pode ajudar com esse assunto** e que seu foco são apenas indicações e dúvidas sobre livros.
                
                3. **Aterramento (Grounding):** Recomende APENAS livros que estão na lista de 'ESTOQUE' abaixo. Se o cliente pedir um livro que não está na lista, diga que infelizmente não tem. NUNCA invente livros.
                
                4. **Vendas:** Sempre cite o preço ao sugerir um livro.

                ESTOQUE DA LIVRATEC (Use apenas estes dados):
                """);

        sbPrompt.append(sbContexto);

        sbPrompt.append("\n\nCLIENTE DISSE: ").append(dto.mensagem());
        sbPrompt.append("\nSUA RESPOSTA:");

        return obterReposta(sbPrompt);
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