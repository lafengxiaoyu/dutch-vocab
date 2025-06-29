package com.dutch_vocab.dutch_vocab_app.controller;

import com.dutch_vocab.dutch_vocab_app.exception.NoWordsAvailableException;
import com.dutch_vocab.dutch_vocab_app.model.Word;
import com.dutch_vocab.dutch_vocab_app.service.WordService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*") // 允许所有来源访问(开发时)
@AllArgsConstructor
public class WordController {
    private final WordService wordService;

    @GetMapping("/{id}")
    public Word getWord(@PathVariable String id) {
        return wordService.getWordById(id);
    }

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
    public Word markAsReviewed(@PathVariable String id) {
        Word result = wordService.markWordAsReviewed(id);
        log.info("Just reviewed the word: {}", result);
        return result;
    }

    // Delete Word
    @DeleteMapping("/{id}")
    public void deleteWord(@PathVariable String id) {
        wordService.deleteWord(id);
    }
    
    // Update Word
    @PutMapping("/{id}")
    public Word updateWord(@PathVariable String id, @RequestBody Word word) {
        log.info("Updating word with id: {}", id);
        return wordService.updateWord(id, word);
    }

    /**
     * 批量添加单词的请求体
     */
    @Data
    public static class BulkAddRequest {
        private List<Word> words;
    }

    /**
     * 批量添加单词
     * @param request 包含多个单词的请求体
     * @return 添加成功的单词列表
     */
    @PostMapping("/bulk")
    public List<Word> addWordsBulk(@RequestBody BulkAddRequest request) {
        log.info("Received request to add {} words in bulk", request.getWords().size());
        return wordService.addWordsBulk(request.getWords());
    }
    
    /**
     * 获取一个随机单词
     * @param difficultyLevel 可选的难度级别 (1-5)
     * @param excludeRecentlyReviewed 是否排除最近复习过的单词
     * @return 随机单词
     */
    @GetMapping("/random")
    public ResponseEntity<?> getRandomWord(
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false, defaultValue = "false") boolean excludeRecentlyReviewed) {
        log.info("Getting a random word with difficultyLevel: {}, excludeRecentlyReviewed: {}", 
                difficultyLevel, excludeRecentlyReviewed);
        try {
            Word word = wordService.getRandomWord(difficultyLevel, excludeRecentlyReviewed);
            return ResponseEntity.ok(word);
        } catch (NoWordsAvailableException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No words available matching the selected criteria"));
        }
    }
}