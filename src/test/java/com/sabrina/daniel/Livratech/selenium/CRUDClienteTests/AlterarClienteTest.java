package com.sabrina.daniel.Livratech.selenium.CRUDClienteTests;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.enums.*;
import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.model.Telefone;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class AlterarClienteTest {

    private WebDriver driver;

    @Autowired
    private ClienteRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    private Cliente clienteTeste;

    @BeforeEach
    public void setUp() {
        // --- Criar cliente completo ---
        clienteTeste = new Cliente();
        clienteTeste.setNome("Teste");
        clienteTeste.setGenero(Genero.FEMININO);
        clienteTeste.setCpf("12345678901");
        clienteTeste.setDataNascimento(new java.util.Date());
        clienteTeste.getDataNascimento().setDate(19);
        clienteTeste.getDataNascimento().setMonth(8); // setembro (0-index)
        clienteTeste.getDataNascimento().setYear(1995 - 1900);
        clienteTeste.setEmail("teste@example.com");
        clienteTeste.setSenha(passwordEncoder.encode("Senha@123"));

        // --- Telefone ---
        Telefone telefone = new Telefone();
        telefone.setTipo(TipoTelefone.CELULAR);
        telefone.setDdd("51");
        telefone.setNumero("999999999");
        telefone.setCliente(clienteTeste);
        clienteTeste.setTelefones(List.of(telefone));

        // --- Endereço ---
        Endereco endereco = new Endereco();
        endereco.setTipoResidencia(TiposResidencias.CASA);
        endereco.setTipoLogradouro(TiposLogradouros.RUA);
        endereco.setLogradouro("Rua Teste");
        endereco.setNumero("123");
        endereco.setBairro("Centro");
        endereco.setCep("12345678");
        endereco.setCidade("Porto Alegre");
        endereco.setEstado("RS");
        endereco.setPais("Brasil");
        endereco.setTipoEndereco(TipoEndereco.ENTREGA);
        endereco.setCliente(clienteTeste);
        clienteTeste.setEnderecos(List.of(endereco));

        // --- Cartão de crédito ---
        CartaoDeCredito cartao = new CartaoDeCredito();
        cartao.setBandeira(BandeiraCartao.VISA);
        cartao.setNumeroCartao("4111111111111111");
        cartao.setNomeImpresso("Maria Teste");
        cartao.setCodigoSeguranca("123");
        cartao.setPreferencial(true);
        cartao.setCliente(clienteTeste);
        clienteTeste.setCartoesCredito(List.of(cartao));

        // Salva cliente completo no banco
        clienteTeste = userRepository.save(clienteTeste);

        // --- Inicializa o driver ---
        driver = new ChromeDriver();
        driver.manage().window().maximize();

        // Abre página neutra
        driver.get("http://localhost:8080/index.html");

        // Setar clienteId no localStorage
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("localStorage.setItem('clienteId', '" + clienteTeste.getId() + "');");

        // Agora abre a página real
        driver.get("http://localhost:8080/perfilCliente.html");

        // Aguarda a página carregar completamente
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait.until(webDriver -> ((JavascriptExecutor) webDriver)
                .executeScript("return document.readyState").equals("complete"));
    }



    @AfterEach
    public void tearDown() {
        if (driver != null) driver.quit();
        if (clienteTeste != null) userRepository.deleteById(clienteTeste.getId());
    }

    @Test
    public void testAlterarNomeCliente() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement abaDados = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("button.menu-btn[data-section='dados']")));
        abaDados.click();

        WebElement btnAlterar = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".formulario-dados-pessoais .btn-alterar")));
        btnAlterar.click();

        WebElement inputNome = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("nome")));
        inputNome.clear();
        inputNome.sendKeys("Sabrina Teste");

        WebElement btnSalvar = driver.findElement(By.cssSelector(".formulario-dados-pessoais .btn-salvar"));
        btnSalvar.click();
        Thread.sleep(3000);

        WebElement modalSucesso = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("success-modal")));
        assertEquals("flex", modalSucesso.getCssValue("display"));
    }

    @Test
    public void testAlterarSenhaCliente() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement abaDados = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("button.menu-btn[data-section='dados']")));
        abaDados.click();

        WebElement btnAlterarSenha = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".formulario-dados-pessoais .btn-alterar-senha")));
        btnAlterarSenha.click();

        WebElement modalSenha = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("senha-modal")));

        WebElement inputSenhaAtual = modalSenha.findElement(By.id("senha-atual"));
        WebElement inputNovaSenha = modalSenha.findElement(By.id("nova-senha"));
        WebElement inputConfirmacao = modalSenha.findElement(By.id("confirmacao-nova-senha"));

        inputSenhaAtual.sendKeys("Senha@123");
        inputNovaSenha.sendKeys("NovaSenha123!");
        inputConfirmacao.sendKeys("NovaSenha123!");

        WebElement btnSalvarSenha = modalSenha.findElement(By.cssSelector(".btn-salvar-senha"));
        btnSalvarSenha.click();

        try {
            WebDriverWait waitAlert = new WebDriverWait(driver, Duration.ofSeconds(5));
            Alert alert = waitAlert.until(ExpectedConditions.alertIsPresent());
            System.out.println("Alerta detectado: " + alert.getText());
            alert.accept();
        } catch (TimeoutException ignored) {
        }

        WebElement modalSucesso = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("success-modal")));
        assertEquals("flex", modalSucesso.getCssValue("display"));
    }



}
