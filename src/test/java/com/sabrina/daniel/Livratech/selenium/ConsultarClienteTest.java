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

        driver.get("http://localhost:8080/painelAdmin.html");

        WebElement btnDetalhes = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("button.btn-acao-tabela.btn-detalhes[data-id='5']")));
        btnDetalhes.click();
        WebElement modalContent = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".modal-conteudo #detalhesClienteContent")));

        String textoModal = modalContent.getText();
        assertEquals(false, textoModal.isEmpty(), "O modal de detalhes do cliente está vazio");

        WebElement btnFechar = driver.findElement(By.id("btnFecharDetalhes"));
        btnFechar.click();
    }

}
