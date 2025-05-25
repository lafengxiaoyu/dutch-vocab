package com.dutch_vocab.dutch_vocab_app.controller;

import com.dutch_vocab.dutch_vocab_app.model.Word;
import com.dutch_vocab.dutch_vocab_app.repository.WordRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*") // 允许所有来源访问(开发时)
public class WordController {
    private final WordRepository wordRepository;

    public WordController(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    // 添加新单词
    @PostMapping
    public Word addWord(@RequestBody Word word) {
        word.setDateAdded(new Date());
        return wordRepository.save(word);
    }

    // 获取所有单词
    @GetMapping
    public List<Word> getAllWords() {
        return wordRepository.findAll();
    }

    // 获取需要复习的单词(按最后复习时间排序)
    @GetMapping("/review")
    public List<Word> getWordsForReview() {
        return wordRepository.findAllByOrderByLastReviewedAsc();
    }

    // 标记单词为已复习
    @PutMapping("/{id}/review")
    public Word markAsReviewed(@PathVariable Long id) {
        Word word = wordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Word not found with id: " + id));
        word.setLastReviewed(new Date());
        word.setReviewCount(word.getReviewCount() + 1);
        return wordRepository.save(word);
    }

    // 删除单词
    @DeleteMapping("/{id}")
    public void deleteWord(@PathVariable Long id) {
        wordRepository.deleteById(id);
    }
}