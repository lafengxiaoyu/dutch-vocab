package com.dutch_vocab.dutch_vocab_app.controller;

import com.dutch_vocab.dutch_vocab_app.repository.WordRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    private final WordRepository wordRepository;

    public TestController(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    @GetMapping("/test")
    public String testConnection() {
        long count = wordRepository.count();
        return "MongoDB连接成功! 当前单词数: " + count;
    }
}