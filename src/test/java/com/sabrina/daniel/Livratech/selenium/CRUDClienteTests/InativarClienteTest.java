package com.sabrina.daniel.Livratech.selenium.CRUDClienteTests;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.enums.*;
import com.sabrina.daniel.Livratech.model.CartaoDeCredito;
import com.sabrina.daniel.Livratech.model.Cliente;
import com.sabrina.daniel.Livratech.model.Endereco;
import com.sabrina.daniel.Livratech.model.Telefone;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
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
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class InativarClienteTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Cliente clienteTeste;

    @BeforeAll
    void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        // --- Cria cliente fictício ---
        clienteTeste = new Cliente();
        clienteTeste.setNome("TESTE DE INATIVAÇÃO");
        clienteTeste.setGenero(Genero.FEMININO);
        clienteTeste.setCpf("98765432100");
        clienteTeste.setEmail("cliente.teste@example.com");
        clienteTeste.setSenha(passwordEncoder.encode("Senha@123"));

        Telefone telefone = new Telefone();
        telefone.setTipo(TipoTelefone.CELULAR);
        telefone.setDdd("51");
        telefone.setNumero("999888777");
        telefone.setCliente(clienteTeste);
        clienteTeste.setTelefones(List.of(telefone));

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

        CartaoDeCredito cartao = new CartaoDeCredito();
        cartao.setBandeira(BandeiraCartao.VISA);
        cartao.setNumeroCartao("4111111111111111");
        cartao.setNomeImpresso("Cliente Teste");
        cartao.setCodigoSeguranca("123");
        cartao.setPreferencial(true);
        cartao.setCliente(clienteTeste);
        clienteTeste.setCartoesCredito(List.of(cartao));

        // Salva cliente no banco
        clienteTeste = clienteRepository.save(clienteTeste);
    }

    @AfterAll
    void teardown() {
        if (driver != null) driver.quit();
        if (clienteTeste != null) clienteRepository.deleteById(clienteTeste.getId());
    }

    @Test
    public void testInativarCliente() throws InterruptedException {
        driver.get("http://localhost:8080/painelAdmin.html");

        // Espera o botão de inativar ficar clicável
        WebElement btnInativar = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("button.btn-acao-tabela.btn-inativar[data-id='" + clienteTeste.getId() + "']")));
        btnInativar.click();

        WebElement btnSim = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".modal-content .btn-sim")));
        btnSim.click();

        // Aguarda o status mudar para INATIVO
        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.xpath("//tr[@data-cliente-id='" + clienteTeste.getId() + "']/td[6]"), "INATIVO"));
        Thread.sleep(5000);
        WebElement tdStatus = driver.findElement(By.xpath("//tr[@data-cliente-id='" + clienteTeste.getId() + "']/td[6]"));
        assertEquals("INATIVO", tdStatus.getText(), "O cliente não foi inativado corretamente");
    }
}
