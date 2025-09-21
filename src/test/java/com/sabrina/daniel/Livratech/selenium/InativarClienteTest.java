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

public class InativarClienteTest {
    private static WebDriver driver;
    private static WebDriverWait wait;

    @BeforeAll
    static void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    }

    @AfterAll
    static void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testInativarCliente() throws InterruptedException {
        // 1️⃣ Abrir painel
        driver.get("http://localhost:8080/painelAdmin.html");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

// 2️⃣ Clicar no botão inativar
        WebElement btnInativar = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("button.btn-acao-tabela.btn-inativar[data-id='5']")));
        btnInativar.click();

// 3️⃣ Clicar no botão "Sim" do modal
        WebElement btnSim = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".modal-content .btn-sim")));
        btnSim.click();

// 4️⃣ Esperar o status atualizar para INATIVO
        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.xpath("//tr[@data-cliente-id='5']/td[6]"), "INATIVO"));
        Thread.sleep(3000);

// 5️⃣ Agora pega o elemento e valida
        WebElement tdStatus = driver.findElement(By.xpath("//tr[@data-cliente-id='5']/td[6]"));
        assertEquals("INATIVO", tdStatus.getText(), "O cliente não foi inativado corretamente");

    }
}
