package com.sabrina.daniel.Livratech.selenium.CRUDClienteTests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class CadastroClienteTest {

    private static WebDriver driver;

    @BeforeAll
    static void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @AfterAll
    static void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void deveCadastrarClienteComSucesso() throws InterruptedException {
        driver.get("http://localhost:8080/cadastroCliente.html");

        driver.findElement(By.id("nome")).sendKeys("Maria Teste");

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('data-nascimento').value = '1995-09-19'");

        driver.findElement(By.id("genero")).sendKeys("FEMININO");
        driver.findElement(By.id("cpf")).sendKeys("12345678901");
        driver.findElement(By.id("email")).sendKeys("teste@example.com");
        driver.findElement(By.id("senha")).sendKeys("Senha@123");
        driver.findElement(By.id("confirmacao-senha")).sendKeys("Senha@123");


        WebElement telefone = driver.findElement(By.cssSelector(".telefone-clone"));
        new Select(telefone.findElement(By.name("tipo"))).selectByVisibleText("Celular");
        telefone.findElement(By.name("ddd")).sendKeys("11");
        telefone.findElement(By.name("numero")).sendKeys("912345678");

        WebElement endereco = driver.findElement(By.cssSelector(".address-clone"));
        new Select(endereco.findElement(By.name("tipoResidencia"))).selectByVisibleText("Apartamento");
        new Select(endereco.findElement(By.name("tipoLogradouro"))).selectByVisibleText("Rua");
        endereco.findElement(By.name("logradouro")).sendKeys("Paulista");
        endereco.findElement(By.name("numero")).sendKeys("1000");
        endereco.findElement(By.name("bairro")).sendKeys("Centro");
        endereco.findElement(By.name("cep")).sendKeys("01001000");
        endereco.findElement(By.name("cidade")).sendKeys("São Paulo");
        endereco.findElement(By.name("estado")).sendKeys("SP");
        endereco.findElement(By.name("pais")).sendKeys("Brasil");
        endereco.findElement(By.name("endereco-entrega")).click();
        endereco.findElement(By.name("endereco-cobranca")).click();

        WebElement cartao = driver.findElement(By.cssSelector(".card-clone"));
        new Select(cartao.findElement(By.name("bandeira"))).selectByVisibleText("Visa");
        cartao.findElement(By.name("numero-cartao")).sendKeys("4111111111111111");
        cartao.findElement(By.name("nome-titular")).sendKeys("Maria Teste");
        cartao.findElement(By.name("cvv")).sendKeys("123");
        cartao.findElement(By.name("validade")).sendKeys("12/25");
        WebElement preferencial = cartao.findElement(By.name("cartao-preferencial"));
        preferencial.click();


        WebElement salvarBtn = driver.findElement(By.cssSelector(".btn-salvar"));
        salvarBtn.click();

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("success-modal")));

        assertTrue(modal.isDisplayed(), "O modal de sucesso deveria aparecer");

    }

    @Test
    void naoDeveCadastrarClienteSemNome() throws InterruptedException {
        driver.get("http://localhost:8080/cadastroCliente.html");

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('data-nascimento').value = '1995-09-19'");

        driver.findElement(By.id("genero")).sendKeys("FEMININO");
        driver.findElement(By.id("cpf")).sendKeys("12345678901");
        driver.findElement(By.id("email")).sendKeys("teste@example.com");
        driver.findElement(By.id("senha")).sendKeys("Senha@123");
        driver.findElement(By.id("confirmacao-senha")).sendKeys("Senha@123");

        // --- TELEFONE ---
        WebElement telefoneFrame = driver.findElement(By.cssSelector(".telefone-clone"));
        new Select(telefoneFrame.findElement(By.name("tipo"))).selectByVisibleText("Celular");
        telefoneFrame.findElement(By.name("ddd")).sendKeys("51");
        telefoneFrame.findElement(By.name("numero")).sendKeys("999999999");

        // --- ENDEREÇO ---
        WebElement enderecoFrame = driver.findElement(By.cssSelector(".address-clone"));
        new Select(enderecoFrame.findElement(By.name("tipoResidencia"))).selectByVisibleText("Casa");
        new Select(enderecoFrame.findElement(By.name("tipoLogradouro"))).selectByVisibleText("Rua");
        enderecoFrame.findElement(By.name("logradouro")).sendKeys("Rua Teste");
        enderecoFrame.findElement(By.name("numero")).sendKeys("123");
        enderecoFrame.findElement(By.name("bairro")).sendKeys("Centro");
        enderecoFrame.findElement(By.name("cep")).sendKeys("12345678");
        enderecoFrame.findElement(By.name("cidade")).sendKeys("Porto Alegre");
        enderecoFrame.findElement(By.name("estado")).sendKeys("RS");
        enderecoFrame.findElement(By.name("pais")).sendKeys("Brasil");
        enderecoFrame.findElement(By.name("observacoes")).sendKeys("Observação teste");
        enderecoFrame.findElement(By.name("endereco-cobranca")).click(); // marca como cobrança

        // --- CARTÃO ---
        WebElement cartaoFrame = driver.findElement(By.cssSelector(".card-clone"));
        new Select(cartaoFrame.findElement(By.name("bandeira"))).selectByVisibleText("Visa");
        cartaoFrame.findElement(By.name("numero-cartao")).sendKeys("4111111111111111");
        cartaoFrame.findElement(By.name("nome-titular")).sendKeys("Maria Teste");
        cartaoFrame.findElement(By.name("cvv")).sendKeys("123");
        cartaoFrame.findElement(By.name("cartao-preferencial")).click();

        // --- SUBMETER ---
        WebElement salvarBtn = driver.findElement(By.cssSelector(".btn-salvar"));
        salvarBtn.click();

        // --- VALIDAR ALERT ---
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());

        Thread.sleep(5000);

        assertTrue(alert.getText().toLowerCase().contains("erro"),
                "Deveria mostrar alert de erro ao tentar cadastrar sem nome");

        alert.accept();
    }

    @Test
    void naoDeveCadastrarClienteSemTelefone() throws InterruptedException {
        driver.get("http://localhost:8080/cadastroCliente.html");

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('data-nascimento').value = '1995-09-19'");
        driver.findElement(By.id("nome")).sendKeys("Maria Teste");

        driver.findElement(By.id("genero")).sendKeys("FEMININO");
        driver.findElement(By.id("cpf")).sendKeys("12345678901");
        driver.findElement(By.id("email")).sendKeys("teste@example.com");
        driver.findElement(By.id("senha")).sendKeys("Senha@123");
        driver.findElement(By.id("confirmacao-senha")).sendKeys("Senha@123");

        // --- TELEFONE ---
        WebElement telefoneFrame = driver.findElement(By.cssSelector(".telefone-clone"));
        new Select(telefoneFrame.findElement(By.name("tipo"))).selectByVisibleText("Celular");
        telefoneFrame.findElement(By.name("ddd")).sendKeys("51");
        //telefoneFrame.findElement(By.name("numero")).sendKeys("999999999");

        // --- ENDEREÇO ---
        WebElement enderecoFrame = driver.findElement(By.cssSelector(".address-clone"));
        new Select(enderecoFrame.findElement(By.name("tipoResidencia"))).selectByVisibleText("Casa");
        new Select(enderecoFrame.findElement(By.name("tipoLogradouro"))).selectByVisibleText("Rua");
        enderecoFrame.findElement(By.name("logradouro")).sendKeys("Rua Teste");
        enderecoFrame.findElement(By.name("numero")).sendKeys("123");
        enderecoFrame.findElement(By.name("bairro")).sendKeys("Centro");
        enderecoFrame.findElement(By.name("cep")).sendKeys("12345678");
        enderecoFrame.findElement(By.name("cidade")).sendKeys("Porto Alegre");
        enderecoFrame.findElement(By.name("estado")).sendKeys("RS");
        enderecoFrame.findElement(By.name("pais")).sendKeys("Brasil");
        enderecoFrame.findElement(By.name("observacoes")).sendKeys("Observação teste");
        enderecoFrame.findElement(By.name("endereco-cobranca")).click(); // marca como cobrança

        // --- CARTÃO ---
        WebElement cartaoFrame = driver.findElement(By.cssSelector(".card-clone"));
        new Select(cartaoFrame.findElement(By.name("bandeira"))).selectByVisibleText("Visa");
        cartaoFrame.findElement(By.name("numero-cartao")).sendKeys("4111111111111111");
        cartaoFrame.findElement(By.name("nome-titular")).sendKeys("Maria Teste");
        cartaoFrame.findElement(By.name("cvv")).sendKeys("123");
        cartaoFrame.findElement(By.name("cartao-preferencial")).click();

        // --- SUBMETER ---
        WebElement salvarBtn = driver.findElement(By.cssSelector(".btn-salvar"));
        salvarBtn.click();

        // --- VALIDAR ALERT ---
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());

        Thread.sleep(5000);

        assertTrue(alert.getText().toLowerCase().contains("erro"),
                "Deveria mostrar alert de erro ao tentar cadastrar sem nome");

        alert.accept();
    }

    @Test
    void naoDeveCadastrarClienteSemEndereco() throws InterruptedException {
        driver.get("http://localhost:8080/cadastroCliente.html");

        driver.findElement(By.id("nome")).sendKeys("Maria Teste");

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('data-nascimento').value = '1995-09-19'");

        driver.findElement(By.id("nome")).sendKeys("Maria Teste");

        driver.findElement(By.id("genero")).sendKeys("FEMININO");
        driver.findElement(By.id("cpf")).sendKeys("12345678901");
        driver.findElement(By.id("email")).sendKeys("teste@example.com");
        driver.findElement(By.id("senha")).sendKeys("Senha@123");
        driver.findElement(By.id("confirmacao-senha")).sendKeys("Senha@123");

        // --- TELEFONE ---
        WebElement telefoneFrame = driver.findElement(By.cssSelector(".telefone-clone"));
        new Select(telefoneFrame.findElement(By.name("tipo"))).selectByVisibleText("Celular");
        telefoneFrame.findElement(By.name("ddd")).sendKeys("51");
         telefoneFrame.findElement(By.name("numero")).sendKeys("999999999");

        // --- ENDEREÇO ---
//        WebElement enderecoFrame = driver.findElement(By.cssSelector(".address-clone"));
//        new Select(enderecoFrame.findElement(By.name("tipoResidencia"))).selectByVisibleText("Casa");
//        new Select(enderecoFrame.findElement(By.name("tipoLogradouro"))).selectByVisibleText("Rua");
//        enderecoFrame.findElement(By.name("logradouro")).sendKeys("Rua Teste");
//        enderecoFrame.findElement(By.name("numero")).sendKeys("123");
//        enderecoFrame.findElement(By.name("bairro")).sendKeys("Centro");
//        enderecoFrame.findElement(By.name("cep")).sendKeys("12345678");
//        enderecoFrame.findElement(By.name("cidade")).sendKeys("Porto Alegre");
//        enderecoFrame.findElement(By.name("estado")).sendKeys("RS");
//        enderecoFrame.findElement(By.name("pais")).sendKeys("Brasil");
//        enderecoFrame.findElement(By.name("observacoes")).sendKeys("Observação teste");
//        enderecoFrame.findElement(By.name("endereco-cobranca")).click(); // marca como cobrança

        // --- CARTÃO ---
        WebElement cartaoFrame = driver.findElement(By.cssSelector(".card-clone"));
        new Select(cartaoFrame.findElement(By.name("bandeira"))).selectByVisibleText("Visa");
        cartaoFrame.findElement(By.name("numero-cartao")).sendKeys("4111111111111111");
        cartaoFrame.findElement(By.name("nome-titular")).sendKeys("Maria Teste");
        cartaoFrame.findElement(By.name("cvv")).sendKeys("123");
        cartaoFrame.findElement(By.name("cartao-preferencial")).click();

        // --- SUBMETER ---
        WebElement salvarBtn = driver.findElement(By.cssSelector(".btn-salvar"));
        salvarBtn.click();

        // --- VALIDAR ALERT ---
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());

        Thread.sleep(5000);

        assertTrue(alert.getText().toLowerCase().contains("erro"),
                "Deveria mostrar alert de erro ao tentar cadastrar sem nome");

        alert.accept();
    }
    @Test
    void errosMultiplosDeValidacao() throws InterruptedException {
        driver.get("http://localhost:8080/cadastroCliente.html");


        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('data-nascimento').value = '1995-09-19'");

        //driver.findElement(By.id("nome")).sendKeys("Maria Teste");

        driver.findElement(By.id("genero")).sendKeys("FEMININO");
        driver.findElement(By.id("cpf")).sendKeys("12345678901");
        driver.findElement(By.id("email")).sendKeys("teste@example.com");
        driver.findElement(By.id("senha")).sendKeys("Senha@123");
        driver.findElement(By.id("confirmacao-senha")).sendKeys("Senha@123");

        // --- TELEFONE ---
        WebElement telefoneFrame = driver.findElement(By.cssSelector(".telefone-clone"));
        new Select(telefoneFrame.findElement(By.name("tipo"))).selectByVisibleText("Celular");
        telefoneFrame.findElement(By.name("ddd")).sendKeys("51");
        telefoneFrame.findElement(By.name("numero")).sendKeys("999999999");

        // --- ENDEREÇO ---
//        WebElement enderecoFrame = driver.findElement(By.cssSelector(".address-clone"));
//        new Select(enderecoFrame.findElement(By.name("tipoResidencia"))).selectByVisibleText("Casa");
//        new Select(enderecoFrame.findElement(By.name("tipoLogradouro"))).selectByVisibleText("Rua");
//        enderecoFrame.findElement(By.name("logradouro")).sendKeys("Rua Teste");
//        enderecoFrame.findElement(By.name("numero")).sendKeys("123");
//        enderecoFrame.findElement(By.name("bairro")).sendKeys("Centro");
//        enderecoFrame.findElement(By.name("cep")).sendKeys("12345678");
//        enderecoFrame.findElement(By.name("cidade")).sendKeys("Porto Alegre");
//        enderecoFrame.findElement(By.name("estado")).sendKeys("RS");
//        enderecoFrame.findElement(By.name("pais")).sendKeys("Brasil");
//        enderecoFrame.findElement(By.name("observacoes")).sendKeys("Observação teste");
//        enderecoFrame.findElement(By.name("endereco-cobranca")).click(); // marca como cobrança

        // --- CARTÃO ---
        WebElement cartaoFrame = driver.findElement(By.cssSelector(".card-clone"));
        new Select(cartaoFrame.findElement(By.name("bandeira"))).selectByVisibleText("Visa");
        cartaoFrame.findElement(By.name("numero-cartao")).sendKeys("4111111111111111");
        cartaoFrame.findElement(By.name("nome-titular")).sendKeys("Maria Teste");
        cartaoFrame.findElement(By.name("cvv")).sendKeys("123");
        cartaoFrame.findElement(By.name("cartao-preferencial")).click();

        // --- SUBMETER ---
        WebElement salvarBtn = driver.findElement(By.cssSelector(".btn-salvar"));
        salvarBtn.click();

        // --- VALIDAR ALERT ---
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());

        Thread.sleep(5000);

        assertTrue(alert.getText().toLowerCase().contains("erro"),
                "Deveria mostrar alert de erro ao tentar cadastrar sem nome");

        alert.accept();
    }
    @Test
    void naoDeveCadastrarClienteSemEnderecoCobrancaEEntrega() throws InterruptedException {
        driver.get("http://localhost:8080/cadastroCliente.html");

        driver.findElement(By.id("nome")).sendKeys("Maria Teste");

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('data-nascimento').value = '1995-09-19'");

        driver.findElement(By.id("nome")).sendKeys("Maria Teste");

        driver.findElement(By.id("genero")).sendKeys("FEMININO");
        driver.findElement(By.id("cpf")).sendKeys("12345678901");
        driver.findElement(By.id("email")).sendKeys("teste@example.com");
        driver.findElement(By.id("senha")).sendKeys("Senha@123");
        driver.findElement(By.id("confirmacao-senha")).sendKeys("Senha@123");

        // --- TELEFONE ---
        WebElement telefoneFrame = driver.findElement(By.cssSelector(".telefone-clone"));
        new Select(telefoneFrame.findElement(By.name("tipo"))).selectByVisibleText("Celular");
        telefoneFrame.findElement(By.name("ddd")).sendKeys("51");
        telefoneFrame.findElement(By.name("numero")).sendKeys("999999999");

        // --- ENDEREÇO ---
        WebElement enderecoFrame = driver.findElement(By.cssSelector(".address-clone"));
        new Select(enderecoFrame.findElement(By.name("tipoResidencia"))).selectByVisibleText("Casa");
        new Select(enderecoFrame.findElement(By.name("tipoLogradouro"))).selectByVisibleText("Rua");
        enderecoFrame.findElement(By.name("logradouro")).sendKeys("Rua Teste");
        enderecoFrame.findElement(By.name("numero")).sendKeys("123");
        enderecoFrame.findElement(By.name("bairro")).sendKeys("Centro");
        enderecoFrame.findElement(By.name("cep")).sendKeys("12345678");
        enderecoFrame.findElement(By.name("cidade")).sendKeys("Porto Alegre");
        enderecoFrame.findElement(By.name("estado")).sendKeys("RS");
        enderecoFrame.findElement(By.name("pais")).sendKeys("Brasil");
        enderecoFrame.findElement(By.name("observacoes")).sendKeys("Observação teste");
        //enderecoFrame.findElement(By.name("endereco-cobranca")).click(); // marca como cobrança

        // --- CARTÃO ---
        WebElement cartaoFrame = driver.findElement(By.cssSelector(".card-clone"));
        new Select(cartaoFrame.findElement(By.name("bandeira"))).selectByVisibleText("Visa");
        cartaoFrame.findElement(By.name("numero-cartao")).sendKeys("4111111111111111");
        cartaoFrame.findElement(By.name("nome-titular")).sendKeys("Maria Teste");
        cartaoFrame.findElement(By.name("cvv")).sendKeys("123");
        cartaoFrame.findElement(By.name("cartao-preferencial")).click();

        // --- SUBMETER ---
        WebElement salvarBtn = driver.findElement(By.cssSelector(".btn-salvar"));
        salvarBtn.click();

        // --- VALIDAR ALERT ---
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());

        Thread.sleep(5000);

        assertTrue(alert.getText().toLowerCase().contains("erro"),
                "Deveria mostrar alert de erro ao tentar cadastrar sem nome");

        alert.accept();
    }
}
