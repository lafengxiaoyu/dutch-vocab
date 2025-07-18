package com.dutch_vocab.dutch_vocab_app.controller;

import com.dutch_vocab.dutch_vocab_app.exception.NoWordsAvailableException;
import com.dutch_vocab.dutch_vocab_app.model.PartOfSpeech;
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
     * 更新单词的答题统计信息
     * @param id 单词ID
     * @param isIncorrect 是否答错
     * @return 更新后的单词
     */
    @PutMapping("/{id}/quiz-stats")
    public Word updateQuizStats(
            @PathVariable String id,
            @RequestParam boolean isIncorrect) {
        log.info("Updating quiz stats for word {}, incorrect: {}", id, isIncorrect);
        return wordService.updateWordQuizStats(id, isIncorrect);
    }

    @GetMapping("/random")
    public ResponseEntity<?> getRandomWords(
            @RequestParam(defaultValue = "1") int count,
            @RequestParam(required = false) String excludeId) {
        log.info("Getting {} random words (excluding ID: {})", count, excludeId);
        try {
            if (count == 1 && excludeId == null) {
                var word = wordService.getRandomWord();
                return ResponseEntity.ok(word);
            }
            var words = wordService.getRandomWords(count, excludeId);
            return ResponseEntity.ok(words);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NoWordsAvailableException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No words available in the database"));
        }
    }
    
    /**
     * 获取与目标单词相同词性的随机单词
     * @param count 需要获取的单词数量
     * @param targetWordId 目标单词ID
     * @return 与目标单词相同词性的随机单词列表
     */
    @GetMapping("/random-by-part-of-speech")
    public ResponseEntity<?> getRandomWordsByPartOfSpeech(
            @RequestParam(defaultValue = "3") int count,
            @RequestParam String targetWordId) {
        log.info("Getting {} random words with same part of speech as word ID: {}", count, targetWordId);
        try {
            var words = wordService.getRandomWordsByPartOfSpeech(count, targetWordId);
            return ResponseEntity.ok(words);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NoWordsAvailableException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No words available in the database"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error getting random words: " + e.getMessage()));
        }
    }
    
    /**
     * 根据词性获取单词
     * @param partOfSpeech 词性
     * @return 指定词性的单词列表
     */
    @GetMapping("/by-part-of-speech/{partOfSpeech}")
    public ResponseEntity<?> getWordsByPartOfSpeech(@PathVariable String partOfSpeech) {
        log.info("Getting words with part of speech: {}", partOfSpeech);
        try {
            var pos = PartOfSpeech.valueOf(partOfSpeech.toUpperCase());
            var words = wordService.getWordsByPartOfSpeech(pos);
            return ResponseEntity.ok(words);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid part of speech: " + partOfSpeech));
        }
    }
}