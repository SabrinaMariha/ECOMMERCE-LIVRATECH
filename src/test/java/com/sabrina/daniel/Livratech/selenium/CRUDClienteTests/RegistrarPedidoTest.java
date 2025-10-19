package com.sabrina.daniel.Livratech.selenium.CRUDClienteTests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class RegistrarPedidoTest {
    private WebDriver driver;
    private WebDriverWait wait;

    // Defini ID e Nome do cliente que esta´sendo usando no teste
    private static final Long CLIENTE_ID_PREDEFINIDO = 3L;
    private static final String CLIENTE_NOME_PREDEFINIDO = "Sabrina Mariha";

    // O ID do produto a ser usado no teste
    private Long produtoIdParaTeste = 1L;
    private Long produtoIdParaTeste2 = 2L;

    @BeforeAll
    void setupClass(){
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @AfterAll
    void teardownClass(){
        if(driver != null){
            driver.quit();
        }
    }

    @BeforeEach
    void setupTest() {
        driver.get("http://localhost:8080/index.html");
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("localStorage.clear();");
        js.executeScript("localStorage.setItem('clienteId', arguments[0]);", CLIENTE_ID_PREDEFINIDO);
        js.executeScript("localStorage.setItem('clienteName', arguments[0]);", CLIENTE_NOME_PREDEFINIDO);
    }

    @Test
    void deveRegistrarPedidoComSucessoViaCompraDireta() throws InterruptedException {
        // 1. Navegar para a página do produto
        driver.get("http://localhost:8080/detalhesProduto.html?id=" + produtoIdParaTeste);

        // 2. Clicar em "Comprar Agora"
        WebElement btnComprarAgora = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-comprar-agora")));
        btnComprarAgora.click();

        // 3. Aguardar o redirecionamento para finalizarCompra.html e a página carregar
        wait.until(ExpectedConditions.urlContains("finalizarCompra.html"));
        wait.until(d -> ((JavascriptExecutor) d).executeScript("return document.readyState").equals("complete"));
        Thread.sleep(1500);

        // 4. Selecionar Endereço (Verificar se há opções)
        WebElement selectEnderecos = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("select[name='enderecos']")));
        Select dropdownEnderecos = new Select(selectEnderecos);
        if (dropdownEnderecos.getOptions().isEmpty()) {
            fail("Nenhum endereço encontrado para o cliente ID " + CLIENTE_ID_PREDEFINIDO + ". O teste requer um endereço pré-cadastrado.");
        }
        // Seleciona a primeira opção por padrão
        // dropdownEnderecos.selectByIndex(0); // Opção já vem selecionada

        // 5. Selecionar Cartão (Verificar se há opções)
        WebElement selectCartoes = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("select[name='cartoes']")));
        Select dropdownCartoes = new Select(selectCartoes);
        if (dropdownCartoes.getOptions().isEmpty()) {
            fail("Nenhum cartão encontrado para o cliente ID " + CLIENTE_ID_PREDEFINIDO + ". O teste requer um cartão pré-cadastrado.");
        }
        // Seleciona a primeira opção por padrão
        // dropdownCartoes.selectByIndex(0);

        // 6. Clicar em "Finalizar Compra"
        WebElement btnFinalizarPedido = wait.until(ExpectedConditions.elementToBeClickable(By.id("btnFinalizarPedido")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btnFinalizarPedido);

        // 7. Verificar o resultado
        try {
            // Tenta esperar pelo alerta
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            String alertText = alert.getText();
            assertTrue(alertText.toLowerCase().contains("compra finalizada com sucesso"),
                    "Alerta de sucesso não apareceu ou texto incorreto. Texto: " + alertText);
            alert.accept();
            System.out.println("Alerta de sucesso confirmado.");
            // Espera redirecionamento após aceitar o alerta
            wait.until(ExpectedConditions.urlContains("index.html"));
            System.out.println("Redirecionado para index.html após alerta.");

        } catch (TimeoutException e) {
            // Se não houver alerta, verifica o redirecionamento direto
            System.out.println("Nenhum alerta apareceu em tempo hábil. Verificando redirecionamento...");
            wait.until(ExpectedConditions.urlContains("index.html"));
            System.out.println("Pedido registrado com sucesso e redirecionado para index.html (sem alerta).");
        } catch (NoAlertPresentException e) {
            // Caso o alerta já tenha sido fechado ou não exista
            System.out.println("Nenhum alerta presente. Verificando redirecionamento...");
            wait.until(ExpectedConditions.urlContains("index.html"));
            System.out.println("Pedido registrado com sucesso e redirecionado para index.html (sem alerta).");
        }
    }

    @Test
    void deveRegistrarPedidoComSucessoViaCarrinhoComDoisItens() throws InterruptedException {
        // --- Adicionar Item 1 ---
        // 1. Navegar para a página do produto 1
        driver.get("http://localhost:8080/detalhesProduto.html?id=" + produtoIdParaTeste);

        // 2. Clicar em "Adicionar ao Carrinho" para o produto 1
        WebElement btnAdicionarCarrinho1 = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-adicionar-carrinho")));
        btnAdicionarCarrinho1.click();
        Thread.sleep(500);

        // --- Adicionar Item 2 ---
        // 3. Navegar para a página do produto 2
        driver.get("http://localhost:8080/detalhesProduto.html?id=" + produtoIdParaTeste2);

        // 4. Clicar em "Adicionar ao Carrinho" para o produto 2
        WebElement btnAdicionarCarrinho2 = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-adicionar-carrinho")));
        btnAdicionarCarrinho2.click();

        // --- Finalizar a partir do Carrinho ---
        // 5. Esperar a sidebar do carrinho ficar ativa E o botão "Finalizar Compra" dentro dela estar clicável
        wait.until(ExpectedConditions.attributeContains(By.id("cartSidebar"), "class", "active")); // Espera a sidebar ter a classe 'active'
        WebElement btnFinalizarCarrinho = wait.until(ExpectedConditions.elementToBeClickable(By.id("btnFinalizar"))); // Espera o botão DENTRO da sidebar

        // 6. Clicar em "Finalizar Compra" dentro do carrinho
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btnFinalizarCarrinho);

        // --- Página de Checkout ---
        // 7. Aguardar o redirecionamento para finalizarCompra.html e a página carregar
        wait.until(ExpectedConditions.urlContains("finalizarCompra.html"));
        wait.until(d -> ((JavascriptExecutor) d).executeScript("return document.readyState").equals("complete"));
        Thread.sleep(1500);

        // 8. Selecionar Endereço
        WebElement selectEnderecos = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("select[name='enderecos']")));
        Select dropdownEnderecos = new Select(selectEnderecos);
        if (dropdownEnderecos.getOptions().isEmpty()) {
            fail("Nenhum endereço encontrado para o cliente ID " + CLIENTE_ID_PREDEFINIDO);
        }
        // Geralmente o primeiro já vem selecionado
        // dropdownEnderecos.selectByIndex(0);

        // 9. Selecionar Cartão
        WebElement selectCartoes = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("select[name='cartoes']")));
        Select dropdownCartoes = new Select(selectCartoes);
        if (dropdownCartoes.getOptions().isEmpty()) {
            fail("Nenhum cartão encontrado para o cliente ID " + CLIENTE_ID_PREDEFINIDO);
        }
        // Geralmente o primeiro já vem selecionado
        // dropdownCartoes.selectByIndex(0);

        // 10. Clicar em "Finalizar Compra" na página de checkout
        WebElement btnFinalizarPedido = wait.until(ExpectedConditions.elementToBeClickable(By.id("btnFinalizarPedido")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btnFinalizarPedido);

        // 11. Verificar o resultado
        try {
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            String alertText = alert.getText();
            assertTrue(alertText.toLowerCase().contains("compra finalizada com sucesso"),
                    "Alerta de sucesso não apareceu ou texto incorreto. Texto: " + alertText);
            alert.accept();
            System.out.println("Alerta de sucesso confirmado.");
            wait.until(ExpectedConditions.urlContains("index.html"));
            System.out.println("Redirecionado para index.html após alerta.");
        } catch (TimeoutException | NoAlertPresentException e) {
            System.out.println("Nenhum alerta detectado ou presente. Verificando redirecionamento...");
            wait.until(ExpectedConditions.urlContains("index.html"));
            System.out.println("Pedido via carrinho (2 itens) registrado com sucesso e redirecionado para index.html (sem alerta).");
        }
    }
}
