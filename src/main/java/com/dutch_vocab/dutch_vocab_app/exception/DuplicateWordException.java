package com.dutch_vocab.dutch_vocab_app.exception;

public class DuplicateWordException extends RuntimeException {
    public DuplicateWordException(String message) {
        super("The word already exists: " + message);
    }
}
