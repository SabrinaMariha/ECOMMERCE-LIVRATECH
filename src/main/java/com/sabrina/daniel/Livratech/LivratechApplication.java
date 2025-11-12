package com.sabrina.daniel.Livratech;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication(scanBasePackages = "com.sabrina.daniel.Livratech")
public class LivratechApplication {

	public static void main(String[] args) {
		// Carrega o .env
		Dotenv dotenv = Dotenv.load();

		// Armazena como propriedade do sistema (acessível via System.getProperty)
		String apiKey = dotenv.get("GOOGLE_API_KEY");
		if (apiKey != null && !apiKey.isEmpty()) {
			System.setProperty("GOOGLE_API_KEY", apiKey);
			System.out.println("✅ GOOGLE_API_KEY carregada com sucesso do .env");
		} else {
			System.err.println("⚠️ GOOGLE_API_KEY não encontrada no .env!");
		}

		SpringApplication.run(LivratechApplication.class, args);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	CommandLineRunner init(ClienteRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {};
	}
}
