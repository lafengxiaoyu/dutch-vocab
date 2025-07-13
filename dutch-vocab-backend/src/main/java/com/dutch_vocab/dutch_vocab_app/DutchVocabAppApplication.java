package com.dutch_vocab.dutch_vocab_app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

@SpringBootApplication
public class DutchVocabAppApplication {

	private static final Logger log = LoggerFactory.getLogger(DutchVocabAppApplication.class);
	public static void main(String[] args) {
		SpringApplication.run(DutchVocabAppApplication.class, args);
	}

	@Bean
	public CommandLineRunner demo() {
		return (args -> {
            log.info("Application started with args: {}", Arrays.toString(args));
		});
	}
}
