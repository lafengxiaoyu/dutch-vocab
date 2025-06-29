package com.dutch_vocab.dutch_vocab_app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NoWordsAvailableException extends RuntimeException {
    
    public NoWordsAvailableException(String message) {
        super(message);
    }
    
    public NoWordsAvailableException() {
        super("No words available in the database");
    }
}