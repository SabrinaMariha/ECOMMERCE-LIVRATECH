package com.sabrina.daniel.Livratech.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ConsultarClienteTest  {
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
    public void testConsultarClienteModalNaoNulo() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        // 1️⃣ Abrir a página do painel de admin
        driver.get("http://localhost:8080/painelAdmin.html");

        // 2️⃣ Clicar no botão de detalhes do cliente (ex: data-id="4")
        WebElement btnDetalhes = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("button.btn-acao-tabela.btn-detalhes[data-id='5']")));
        btnDetalhes.click();

        // 3️⃣ Esperar o modal abrir
        WebElement modalContent = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".modal-conteudo #detalhesClienteContent")));

        // 4️⃣ Verificar que o conteúdo do modal não está vazio
        String textoModal = modalContent.getText();
        assertEquals(false, textoModal.isEmpty(), "O modal de detalhes do cliente está vazio");

        // 5️⃣ (Opcional) Fechar o modal
        WebElement btnFechar = driver.findElement(By.id("btnFecharDetalhes"));
        btnFechar.click();
    }

}
