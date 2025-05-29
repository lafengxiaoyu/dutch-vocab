package com.dutch_vocab.dutch_vocab_app.controller;

import com.dutch_vocab.dutch_vocab_app.repository.WordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class TestController {

    private final WordRepository wordRepository;

    public TestController(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    @GetMapping("/test")
    public String testConnection() {
        long count = wordRepository.count();
        log.info("Calling the endpoint to output the count of words.");
        return "MongoDB connection succeed! Current number of words: " + count;
    }
}