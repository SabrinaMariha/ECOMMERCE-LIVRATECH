package com.sabrina.daniel.Livratech.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CadastroClienteTest {

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

        // driver.findElement(By.id("nome")).sendKeys("Maria Teste"); // omitido intencionalmente

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("document.getElementById('data-nascimento').value = '1995-09-19'");

        driver.findElement(By.id("genero")).sendKeys("FEMININO");
        driver.findElement(By.id("cpf")).sendKeys("12345678901");
        driver.findElement(By.id("email")).sendKeys("teste@example.com");
        driver.findElement(By.id("senha")).sendKeys("Senha@123");
        driver.findElement(By.id("confirmacao-senha")).sendKeys("Senha@123");

        WebElement salvarBtn = driver.findElement(By.cssSelector(".btn-salvar"));
        salvarBtn.click();

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());

        assertTrue(alert.getText().contains("Erro"), "Deveria mostrar alert de erro");

        alert.accept();
    }

}
