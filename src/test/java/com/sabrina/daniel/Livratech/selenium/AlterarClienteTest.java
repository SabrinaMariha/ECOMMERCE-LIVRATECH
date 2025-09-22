package com.sabrina.daniel.Livratech.selenium;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.model.Cliente;
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

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class AlterarClienteTest {

    private WebDriver driver;

    @Autowired
    private ClienteRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    public void setUp() {
        Cliente user = userRepository.findById(5L).orElseThrow();
        user.setSenha(passwordEncoder.encode("123"));
        userRepository.save(user);

        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("http://localhost:8080/perfilCliente.html");

        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
            wait.until(ExpectedConditions.alertIsPresent());
            driver.switchTo().alert().accept();
        } catch (Exception ignored) {
        }

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("localStorage.setItem('clienteId', '5');");
        driver.navigate().refresh();
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
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

        inputSenhaAtual.sendKeys("123");
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
