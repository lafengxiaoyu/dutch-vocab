package com.dutch_vocab.dutch_vocab_app.controller;

import com.dutch_vocab.dutch_vocab_app.model.Word;
import com.dutch_vocab.dutch_vocab_app.service.WordService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*") // 允许所有来源访问(开发时)
@AllArgsConstructor
public class WordController {
    private final WordService wordService;

    // add new word
    @PostMapping
    public Word addWord(@RequestBody Word word) {
        return wordService.addWord(word);
    }

    // Get all words
    @GetMapping
    public List<Word> getAllWords() {
        return wordService.getAllWords();
    }

    // 获取需要复习的单词(按最后复习时间排序)
    @GetMapping("/review")
    public List<Word> getWordsForReview() {
        return wordService.findAllByOrderByLastReviewedAsc();
    }

    // 标记单词为已复习
    @PutMapping("/{id}/review")
    public Word markAsReviewed(@PathVariable Long id) {
        Word word = wordService.getWordById(id.toString());
        word.setLastReviewed(new Date());
        word.setReviewCount(word.getReviewCount() + 1);
        return wordService.addWord(word);
    }

    // Delete Word
    @DeleteMapping("/{id}")
    public void deleteWord(@PathVariable Long id) {
        wordService.deleteWord(String.valueOf(id));
    }
}