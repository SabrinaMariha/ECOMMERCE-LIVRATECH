package com.sabrina.daniel.Livratech;

import com.sabrina.daniel.Livratech.daos.ClienteRepository;
import com.sabrina.daniel.Livratech.model.Cliente;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication(scanBasePackages = "com.sabrina.daniel.Livratech")
public class LivratechApplication {
	public static void main(String[] args) {
		SpringApplication.run(LivratechApplication.class, args);
	}

	// Bean do PasswordEncoder
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	CommandLineRunner init(ClienteRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {

		};
	}
}
