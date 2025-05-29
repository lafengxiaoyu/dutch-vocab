package com.dutch_vocab.dutch_vocab_app.service;

import com.dutch_vocab.dutch_vocab_app.exception.DuplicateWordException;
import com.dutch_vocab.dutch_vocab_app.model.Word;
import com.dutch_vocab.dutch_vocab_app.repository.WordRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class WordService {

    private final WordRepository wordRepository;

    public Word addWord(Word word) {
        // Check if the word exists
        if (wordRepository.existsByDutchWord(word.getDutchWord())) {
            throw new DuplicateWordException(word.getDutchWord());
        }

        // set the added date
        word.setDateAdded(new Date());
        wordRepository.save(word);
        log.info("Word {} is saved to database.", word.getDutchWord());
        return word;
    }

    public List<Word> getAllWords() {
        return wordRepository.findAll();
    }

    public Word getWordById(String id) {
        return wordRepository.findById(Long.valueOf(id)).orElse(null);
    }

    public void deleteWord(String id) {
        wordRepository.deleteById(Long.valueOf(id));
    }

    public List<Word> findAllByOrderByLastReviewedAsc() {
        return wordRepository.findAllByOrderByLastReviewedAsc();
    }

    // other methods
}