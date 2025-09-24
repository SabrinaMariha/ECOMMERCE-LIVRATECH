package com.sabrina.daniel.Livratech.selenium.CRUDClienteTests;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.enums.*;
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
public class ConsultarClienteTest {

    private WebDriver driver;

    @Autowired
    private ClienteRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Cliente clienteTeste;

    @BeforeAll
    void setup() {
        // Inicializa driver
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @BeforeEach
    void setUpCliente() {
        // --- Criar cliente completo ---
        clienteTeste = new Cliente();
        clienteTeste.setNome("Teste Consultar");
        clienteTeste.setGenero(Genero.FEMININO);
        clienteTeste.setCpf("98765432100");
        clienteTeste.setDataNascimento(new java.util.Date());
        clienteTeste.getDataNascimento().setDate(15);
        clienteTeste.getDataNascimento().setMonth(5); // junho
        clienteTeste.getDataNascimento().setYear(1990 - 1900);
        clienteTeste.setEmail("consultar@example.com");
        clienteTeste.setSenha(passwordEncoder.encode("Senha@123"));

        // --- Telefone ---
        Telefone telefone = new Telefone();
        telefone.setTipo(TipoTelefone.CELULAR);
        telefone.setDdd("51");
        telefone.setNumero("999999998");
        telefone.setCliente(clienteTeste);
        clienteTeste.setTelefones(List.of(telefone));

        // --- Endereço ---
        Endereco endereco = new Endereco();
        endereco.setTipoResidencia(TiposResidencias.CASA);
        endereco.setTipoLogradouro(TiposLogradouros.RUA);
        endereco.setLogradouro("Rua Consultar");
        endereco.setNumero("321");
        endereco.setBairro("Centro");
        endereco.setCep("87654321");
        endereco.setCidade("Porto Alegre");
        endereco.setEstado("RS");
        endereco.setPais("Brasil");
        endereco.setTipoEndereco(TipoEndereco.ENTREGA);
        endereco.setCliente(clienteTeste);
        clienteTeste.setEnderecos(List.of(endereco));

        // Salva no banco
        clienteTeste = userRepository.save(clienteTeste);
    }

    @AfterEach
    void tearDownCliente() {
        if (clienteTeste != null) {
            userRepository.deleteById(clienteTeste.getId());
        }
    }

    @AfterAll
    void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testConsultarClienteModalNaoNulo() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        driver.get("http://localhost:8080/painelAdmin.html");

        // Seleciona o botão de detalhes usando o ID do cliente criado
        WebElement btnDetalhes = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("button.btn-acao-tabela.btn-detalhes[data-id='" + clienteTeste.getId() + "']")));
        btnDetalhes.click();

        WebElement modalContent = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".modal-conteudo #detalhesClienteContent")));

        String textoModal = modalContent.getText();
        assertEquals(false, textoModal.isEmpty(), "O modal de detalhes do cliente está vazio");
        Thread.sleep(5000);
        WebElement btnFechar = driver.findElement(By.id("btnFecharDetalhes"));
        btnFechar.click();
    }
}
