package com.sabrina.daniel.Livratech.selenium.TrocasTests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Esta classe testa o fluxo completo de compra, pagamento,
 * gerenciamento de status pelo admin e solicitação de troca pelo cliente.
 * Os testes são ordenados e dependem do estado do teste anterior.
 */
@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class TrocaTests {

    private WebDriver driver;
    private WebDriverWait wait;

    // --- DADOS DE TESTE ---
    private static final Long CLIENTE_ID = 4L;
    private static final String CLIENTE_NOME = "Sabrina Teste";
    private static final Long PRODUTO_ID_1 = 1L;
    private static final Long PRODUTO_ID_2 = 2L;
    private static final Long PRODUTO_ID_3 = 3L;

    private static Long pedidoId;
    private static Long itemIdParaTroca;
    private static Long solicitacaoTrocaId;

    @BeforeAll
    void setupClass() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    }

    @AfterAll
    void teardownClass() {
        if (driver != null) {
            driver.quit();
        }
    }

    private void loginCliente(Long clienteId, String clienteName) {
        driver.get("http://localhost:8080/index.html");
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("localStorage.clear();");
        js.executeScript("localStorage.setItem('clienteId', arguments[0]);", clienteId);
        js.executeScript("localStorage.setItem('clienteName', arguments[0]);", clienteName);
    }

    private void esperarEAceitarAlerta(String mensagemEsperada) {
        try {
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            String alertText = alert.getText();
            assertTrue(alertText.toLowerCase().contains(mensagemEsperada.toLowerCase()),
                    "Texto do alerta inesperado. Esperado: " + mensagemEsperada + ", Recebido: " + alertText);
            alert.accept();
        } catch (TimeoutException | NoAlertPresentException e) {
            fail("Nenhum alerta de '" + mensagemEsperada + "' apareceu no tempo esperado.");
        }
    }

    // --- TESTES ---

    @Test
    @Order(1)
    public void test_A_realizarCompraSimples() throws InterruptedException {
        // 1. Loga o cliente e navega para a página de um produto (PRODUTO_ID_1)
        loginCliente(CLIENTE_ID, CLIENTE_NOME);

        // Navega para a página de detalhes de um produto
        driver.get("http://localhost:8080/detalhesProduto.html?id=" + PRODUTO_ID_1);

        // 2. Clica em "Comprar Agora" para ir para a tela de finalização
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-comprar-agora"))).click();

        // 3. Espera a página de finalização de compra carregar
        wait.until(ExpectedConditions.urlContains("finalizarCompra.html"));

        // 4. Localiza o container do cartão (assumindo que há apenas 1 formulário inicial)
        WebElement formCartao = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("#card-container-cartoes .card-container")
        ));

        // 5. Seleciona o primeiro cartão cadastrado no select
        WebElement selectCartoes = formCartao.findElement(By.cssSelector("select[name='cartoes']"));
        Select select = new Select(selectCartoes);

        wait.until(d -> select.getOptions().size() > 1);

        // Seleciona o cartão no índice 1
        select.selectByIndex(1);

        // Garante que o evento 'change' do select seja disparado para carregar os dados
        ((JavascriptExecutor) driver).executeScript("arguments[0].dispatchEvent(new Event('change'));", selectCartoes);

        // 6. Preenche o valor de pagamento com o valor total da compra
        String valorTotalStr = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("valorTotalResumo"))).getText();
        String valorLimpo = valorTotalStr.replace("R$", "").replace(".", "").trim().replace(",", ".");
        String valorParaInput = String.format("%,.2f", Double.parseDouble(valorLimpo)).replace(".", ",");

        WebElement valorInput = formCartao.findElement(By.cssSelector("input[name='valor']"));

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView(true); arguments[0].value = arguments[1];",
                valorInput, valorParaInput
        );

        // 7. Finaliza o Pedido
        driver.findElement(By.id("btnFinalizarPedido")).click();

        // 8. Espera o alerta de sucesso e navega para index.html
        esperarEAceitarAlerta("compra finalizada com sucesso");
        wait.until(ExpectedConditions.urlContains("index.html"));
    }

    @Test
    @Order(2)
    void test_B_adminAtualizarStatusParaEntregue() throws InterruptedException {
        driver.get("http://localhost:8080/painelAdmin.html");

        // 1. Clica na aba Vendas
        WebElement btnVendas = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[data-section='vendas']")));
        btnVendas.click();

        // 2. Espera pelo corpo da tabela (vendas-tbody) e que o texto 'Carregando' suma
        By tbodyId = By.id("vendas-tbody");
        wait.until(ExpectedConditions.visibilityOfElementLocated(tbodyId));
        wait.until(ExpectedConditions.not(
                ExpectedConditions.textToBePresentInElementLocated(tbodyId, "Carregando vendas")
        ));

        // 3. Busca a linha <tr> que contém o nome E o status (Correção robusta)
        String xpathLinhaPedido = String.format(
                "//tr[normalize-space(.) and contains(., '%s') and contains(., 'EM PROCESSAMENTO')]",
                CLIENTE_NOME
        );

        By byLinhaPedido = By.xpath(xpathLinhaPedido);

        // Espera a linha do pedido (<tr>) aparecer.
        WebElement linhaPedido = wait.until(ExpectedConditions.visibilityOfElementLocated(byLinhaPedido));

        // 4. Extrai o ID
        pedidoId = Long.parseLong(linhaPedido.getAttribute("data-pedido-id"));
        assertTrue(pedidoId > 0, "Não foi possível extrair o ID do pedido.");

        System.out.println(">>> Pedido ID encontrado: " + pedidoId);

        // 5. Atualiza os status
        atualizarStatusPedido(pedidoId, "APROVADA");
        atualizarStatusPedido(pedidoId, "EM_TRANSITO");
        atualizarStatusPedido(pedidoId, "ENTREGUE");
    }

    // Troca o nome da sua classe se for diferente (TrocasTests.java ou TrocaTests.java)

    @Test
    @Order(3)
    void test_C_clienteSolicitarTrocaItem() {
        if (pedidoId == null) fail("ID do Pedido não foi definido.");

        loginCliente(CLIENTE_ID, CLIENTE_NOME);
        driver.get("http://localhost:8080/perfilCliente.html");

        // 1. Clica na aba Pedidos
        WebElement btnPedidos = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[data-section='pedidos']")));
        btnPedidos.click();

        // Rolagem para garantir que o elemento esteja no viewport
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", btnPedidos);

        // ----------------------------------------------------
        //  CORREÇÃO DE SINCRONIZAÇÃO: ESPERA PELO CONTEÚDO AJAX
        // ----------------------------------------------------

        // Espera de forma geral por um elemento que só existe após o JavaScript carregar *qualquer* pedido,
        // ou seja, o primeiro 'pedido-container' que é injetado.
        // Isso garante que a chamada API e a renderização ocorreram.
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".secao-pedidos .pedido-container")
        ));

        // 2. Localiza o card do pedido específico (Pedido ID: 30, no seu caso).
        // XPath robusto: busca o elemento <p> com o ID e sobe para o pai principal (pedido-container).
        String xpathPedidoCard = "//p[contains(text(), 'Pedido: " + pedidoId + "')]/ancestor::div[contains(@class, 'pedido-container')]";

        System.out.println(">>> Teste C: Procurando pelo Pedido ID: " + pedidoId + " no perfil do cliente.");

        // O erro ocorreu aqui. Agora, com a espera acima, deve funcionar.
        WebElement pedidoCard = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath(xpathPedidoCard)
        ));

        // 3. Clica no botão de detalhes do pedido
        pedidoCard.findElement(By.cssSelector(".btn-detalhes")).click();

        // 4. Localiza o botão de troca para o item específico ('Java Efetivo')
        WebElement btnTroca = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//div[contains(@class, 'pedido-detalhes')][.//p[contains(text(), 'Java Efetivo')]]//button[contains(@class, 'btn-troca')]")
        ));

        // 5. Extrai o ID do item e clica
        String onclickAttr = btnTroca.getAttribute("onclick");
        itemIdParaTroca = Long.parseLong(onclickAttr.split("itemId=")[1].replace("'", ""));
        btnTroca.click();

        // 6. Realiza a troca (telaTroca.html)
        wait.until(ExpectedConditions.urlContains("telaTroca.html"));
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("input[value='Produto com defeito']"))).click();
        driver.findElement(By.id("btn-confirmar-troca")).click();

        // 7. Aguarda o redirecionamento (feito pelo JS)
        wait.until(ExpectedConditions.urlContains("perfilCliente.html"));

        // Clica na aba Pedidos novamente para recarregar o conteúdo com o novo status.
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[data-section='pedidos']"))).click();

        // Espera de novo o carregamento AJAX da lista após o redirecionamento
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".secao-pedidos .pedido-container")
        ));

        // 8. Verifica o status do pedido
        String xpathStatus = xpathPedidoCard + "//p[contains(text(), 'Status:')]";

        WebElement statusPedido = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath(xpathStatus)
        ));

        // Aguarda que o texto do status mude para "EM_TROCA"
        wait.until(ExpectedConditions.textToBePresentInElement(statusPedido, "EM_TROCA"));

        assertTrue(statusPedido.getText().contains("EM_TROCA"), "Status do pedido não atualizou para EM_TROCA. Status atual: " + statusPedido.getText());
    }

    @Order(5)
    void test_E_clienteVerificarCupomTroca() {
        loginCliente(CLIENTE_ID, CLIENTE_NOME);
        driver.get("http://localhost:8080/perfilCliente.html");
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[data-section='cupons']"))).click();

        WebElement cuponsContainer = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("cupons-container")));
        assertTrue(cuponsContainer.getText().contains("CUPOM DE TROCA"), "Nenhum cupom de troca encontrado.");
    }

    @Test
    @Order(6)
    void test_F_realizarCompraNovoEnderecoENovoCartao() {
        loginCliente(CLIENTE_ID, CLIENTE_NOME);
        driver.get("http://localhost:8080/detalhesProduto.html?id=" + PRODUTO_ID_2);
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-comprar-agora"))).click();
        wait.until(ExpectedConditions.urlContains("finalizarCompra.html"));

        WebElement formEndereco = driver.findElement(By.id("formulario-endereco-novo-entrega"));

        // Preenchimento do Endereço (Mantido)
        formEndereco.findElement(By.cssSelector("select[name='tipoResidencia']")).sendKeys("CASA");
        formEndereco.findElement(By.cssSelector("input[name='cep']")).sendKeys("90000001");
        formEndereco.findElement(By.cssSelector("select[name='tipoLogradouro']")).sendKeys("RUA");
        formEndereco.findElement(By.cssSelector("input[name='logradouro']")).sendKeys("Rua Selenium");
        formEndereco.findElement(By.cssSelector("input[name='numero']")).sendKeys("123");
        formEndereco.findElement(By.cssSelector("input[name='bairro']")).sendKeys("Bairro Teste");
        formEndereco.findElement(By.cssSelector("input[name='cidade']")).sendKeys("Porto Alegre");
        formEndereco.findElement(By.cssSelector("input[name='estado']")).sendKeys("RS");
        formEndereco.findElement(By.cssSelector("input[name='pais']")).sendKeys("Brasil");

        // Garante que o checkbox de salvar endereço seja marcado (Mantido)
        WebElement salvarEnderecoCheckbox = formEndereco.findElement(By.cssSelector("input[name='salvar-endereco-entrega']"));
        if (!salvarEnderecoCheckbox.isSelected()) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", salvarEnderecoCheckbox);
        }

        WebElement formCartao = driver.findElement(By.id("card-template-cartao"));
        new Select(formCartao.findElement(By.cssSelector("select[name='cartoes']"))).selectByVisibleText("Novo cartão");
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(8);
        String novoCartaoNum = "411122223333" + timestamp;

        // Preenchimento do Cartão (Mantido)
        formCartao.findElement(By.cssSelector("input[name='numero-cartao']")).sendKeys(novoCartaoNum);
        new Select(formCartao.findElement(By.cssSelector("select[name='bandeira']"))).selectByVisibleText("VISA");
        formCartao.findElement(By.cssSelector("input[name='nome-titular']")).sendKeys("TESTE SELENIUM");
        formCartao.findElement(By.cssSelector("input[name='cvv']")).sendKeys("123");

        // Remove o atributo 'disabled' e marca o checkbox de salvar cartão (Mantido)
        WebElement salvarCartaoFCheckbox = formCartao.findElement(By.cssSelector("input[name='salvar-cartao']"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].removeAttribute('disabled');", salvarCartaoFCheckbox);

        if (!salvarCartaoFCheckbox.isSelected()) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", salvarCartaoFCheckbox);
        }

        // Cálculo de valor e finalização do pedido (Mantido)
        String valorTotalStr = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("valorTotalResumo"))).getText();
        String valorLimpo = valorTotalStr.replace("R$", "").replace(".", "").trim().replace(",", ".");
        String valorParaInput = String.format("%,.2f", Double.parseDouble(valorLimpo)).replace(".", ",");
        WebElement valorInput = formCartao.findElement(By.cssSelector("input[name='valor']"));
        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView(true); arguments[0].value = arguments[1];",
                valorInput, valorParaInput
        );

        driver.findElement(By.id("btnFinalizarPedido")).click();
        esperarEAceitarAlerta("compra finalizada com sucesso");
        wait.until(ExpectedConditions.urlContains("index.html")); // Volta para index.html


    }
    @Test
    @Order(7)
    void test_G_realizarCompraMultiplosCartoesECupom() {
        // 1. Acessa a página de compra
        loginCliente(CLIENTE_ID, CLIENTE_NOME);
        driver.get("http://localhost:8080/detalhesProduto.html?id=" + PRODUTO_ID_3);
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-comprar-agora"))).click();
        wait.until(ExpectedConditions.urlContains("finalizarCompra.html"));

        // 2. Adiciona o Cupom e Seleciona o Valor
        // O JS deve mostrar o card-template-cupom e adicionar outro elemento no container
        driver.findElement(By.cssSelector("button[data-tipo-cupom='cupom']")).click();

        // Espera pelo novo card-container-cupom visível (o template original está 'style="display:none;"')
        // O seletor abaixo busca o primeiro select de cupom visível no container
        WebElement selectCupom = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector("#card-container-cupom .card-container:not([style*='none']) select")
                )
        );

        // Seleciona o cupom de 10%
        new Select(selectCupom).selectByVisibleText("10%");

        // 3. Aguarda o recálculo do valor total após o cupom
        // O valorTotalResumo deve refletir o desconto do cupom (se a lógica JS for síncrona ou rápida)
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("valorCuponsResumo"), "- R$"));

        // Extrai e calcula o valor total (com desconto)
        String valorTotalStr = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("valorTotalResumo"))).getText();
        String valorLimpo = valorTotalStr.replace("R$", "").replace(".", "").replace(",", ".").trim();
        double valorTotal = Double.parseDouble(valorLimpo);

        // Divide o valor em duas metades (metade 1 e metade 2)
        String valorMetade1 = String.format("%.2f", valorTotal / 2.0).replace(".", ",");
        // Garante que o cálculo da segunda metade cubra possíveis perdas de precisão
        String valorMetade2 = String.format("%.2f", valorTotal - (valorTotal / 2.0)).replace(".", ",");

        // 4. Configura o Cartão 1 (Formulário #1 - Usando Cartão Cadastrado)
        WebElement formCartao1 = driver.findElement(By.id("card-template-cartao"));

        // Espera que as opções (incluindo "Novo cartão") tenham sido carregadas.
        wait.until(d -> new Select(d.findElement(By.cssSelector("#card-template-cartao select[name='cartoes']"))).getOptions().size() > 1);

        // Seleciona o PRIMEIRO cartão cadastrado (índice 0, que pode ser o salvo no teste F)
        new Select(formCartao1.findElement(By.cssSelector("select[name='cartoes']"))).selectByIndex(0);

        WebElement valorInput1 = formCartao1.findElement(By.cssSelector("input[name='valor']"));
        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView(true); arguments[0].value = arguments[1];",
                valorInput1, valorMetade1
        );

        // 5. Adiciona o Cartão 2
        driver.findElement(By.cssSelector("button[data-tipo-card='cartao']")).click();

        // Espera até que o novo formulário de cartão seja adicionado ao DOM
        wait.until(ExpectedConditions.numberOfElementsToBe(By.cssSelector("#card-container-cartoes .card-container"), 2));

        // Pega o SEGUNDO formulário de cartão (o novo que foi adicionado)
        List<WebElement> cardForms = driver.findElements(By.cssSelector("#card-container-cartoes .card-container"));
        WebElement formCartao2 = cardForms.get(cardForms.size() - 1); // Último elemento

        // 6. Configura o Cartão 2 (Formulário #2 - Usando Outro Cartão Cadastrado)
        // Espera que as opções no segundo select também estejam carregadas
        wait.until(d -> new Select(formCartao2.findElement(By.cssSelector("select[name='cartoes']"))).getOptions().size() > 1);

        // Seleciona o SEGUNDO cartão cadastrado (índice 1, ou se só tiver um cartão, tenta selecionar o "Novo cartão")
        // Se houver apenas um cartão cadastrado, o índice 1 será a opção "Novo cartão".
        // Para usar outro cartão cadastrado, assumimos que o cliente possui pelo menos dois cartões.
        // Se a opção de interesse for o SEGUNDO cartão cadastrado, use o índice 1 (assumindo que o primeiro cadastrado é 0)
        new Select(formCartao2.findElement(By.cssSelector("select[name='cartoes']"))).selectByIndex(1);

        WebElement valorInput2 = formCartao2.findElement(By.cssSelector("input[name='valor']"));
        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView(true); arguments[0].value = arguments[1];",
                valorInput2, valorMetade2
        );

        // 7. Finaliza o Pedido
        driver.findElement(By.id("btnFinalizarPedido")).click();
        esperarEAceitarAlerta("compra finalizada com sucesso");
        wait.until(ExpectedConditions.urlContains("index.html"));
    }

    private void atualizarStatusPedido(Long idPedido, String novoStatus) {
        // 1. Localiza e clica no botão de alteração
        WebElement linhaPedido = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("tr[data-pedido-id='" + idPedido + "']")));
        linhaPedido.findElement(By.cssSelector(".btnAlterarStatusVenda")).click();

        // 2. Interage com o modal
        WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("modalStatusVenda")));
        new Select(modal.findElement(By.id("novoStatusVenda"))).selectByValue(novoStatus);

        // 3. Clica para submeter
        modal.findElement(By.cssSelector("button[type='submit']")).click();

        // 🌟 CORREÇÃO: Trata o Alerta que é aberto após a submissão.
        try {
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            alert.accept();
        } catch (TimeoutException e) {
            // Se não houver alerta, o teste continua.
        }

        // 4. Espera o modal sumir
        wait.until(ExpectedConditions.invisibilityOf(modal));
    }

    private void atualizarStatusTroca(Long idSolicitacao, String novoStatusTexto) {
        WebElement linhaTroca = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("tr[data-solicitacao-id='" + idSolicitacao + "']")));
        linhaTroca.findElement(By.cssSelector(".btnAlterarStatusTroca")).click();

        WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("modalStatusTroca")));
        new Select(modal.findElement(By.id("novoStatusTroca"))).selectByVisibleText(novoStatusTexto);
        modal.findElement(By.cssSelector("button[type='submit']")).click();

        // 🌟 CORREÇÃO: Trata o Alerta para a troca também.
        try {
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            alert.accept();
        } catch (TimeoutException e) {
            // Se não houver alerta, ignora.
        }

        wait.until(ExpectedConditions.invisibilityOf(modal));
    }
}