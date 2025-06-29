package com.dutch_vocab.dutch_vocab_app.service;

import com.dutch_vocab.dutch_vocab_app.exception.DuplicateWordException;
import com.dutch_vocab.dutch_vocab_app.exception.NoWordsAvailableException;
import com.dutch_vocab.dutch_vocab_app.model.Word;
import com.dutch_vocab.dutch_vocab_app.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WordService {

    private final WordRepository wordRepository;
    private final MongoTemplate mongoTemplate;

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
        var objectId = getObjectId(id);
        return wordRepository.findById(objectId).orElse(null);
    }


    public void deleteWord(String id) {
        try {
            var objectId = getObjectId(id);
            if (!wordRepository.existsById(objectId)) {
                throw new RuntimeException("Not existence");
            }
            var word = wordRepository.findById(objectId);
            wordRepository.deleteById(objectId);
            log.info("Deletion succeed: {}", word.map(Word::getDutchWord));
        }
        catch (Exception exception) {
            throw new RuntimeException("Something goes wrong with deletion");
        }
    }

    public List<Word> findAllByOrderByLastReviewedAsc() {
        return wordRepository.findAllByOrderByLastReviewedAsc();
    }

    public ObjectId getObjectId(String id) {
        // 1. Validate ID format
        if (!ObjectId.isValid(id)) {
            log.warn("Invalid Object Id format: {}", id);
        }
        return new ObjectId(id);
    }
    
    public Word updateWord(String id, Word updatedWord) {
        var objectId = getObjectId(id);
        var existingWord = wordRepository.findById(objectId)
            .orElseThrow(() -> new RuntimeException("Word not found with id: " + id));
        
        // 保护系统管理的字段，只允许更新用户可编辑的字段
        existingWord.setDutchWord(updatedWord.getDutchWord());
        existingWord.setEnglishTranslation(updatedWord.getEnglishTranslation());
        existingWord.setPartOfSpeech(updatedWord.getPartOfSpeech());
        existingWord.setExampleSentence(updatedWord.getExampleSentence());
        existingWord.setDifficultyLevel(updatedWord.getDifficultyLevel());
        
        log.info("Word {} is Updated by: {}", existingWord, updatedWord);
        return wordRepository.save(existingWord);
    }
    
    /**
     * 标记单词为已复习，更新lastReviewed和reviewCount字段
     * @param id 单词ID
     * @return 更新后的单词
     */
    public Word markWordAsReviewed(String id) {
        var objectId = getObjectId(id);
        var existingWord = wordRepository.findById(objectId)
            .orElseThrow(() -> new RuntimeException("Word not found with id: " + id));
        
        // 更新复习相关字段
        existingWord.setLastReviewed(new Date());
        existingWord.setReviewCount(existingWord.getReviewCount() + 1);
        
        log.info("Word marked as reviewed: {}", existingWord);
        return wordRepository.save(existingWord);
    }

    /**
     * 批量添加单词
     * @param words 要添加的单词列表
     * @return 成功添加的单词列表
     */
    public List<Word> addWordsBulk(List<Word> words) {
        var addedWords = new ArrayList<Word>();
        var currentDate = new Date();
        
        for (var word : words) {
            try {
                // 检查单词是否已存在
                if (wordRepository.existsByDutchWord(word.getDutchWord())) {
                    log.warn("Word {} already exists, skipping", word.getDutchWord());
                    continue;
                }
                
                // set date
                word.setDateAdded(currentDate);
                wordRepository.save(word);
                addedWords.add(word);
                log.info("Word: {} is saved to database.", word.getDutchWord());
            } catch (Exception e) {
                log.error("Error adding word {}: {}", word.getDutchWord(), e.getMessage());
            }
        }
        
        log.info("Bulk add completed: {} out of {} words added successfully", 
                addedWords.size(), words.size());
        return addedWords;
    }
    
    /**
     * 获取一个随机单词
     * @param difficultyLevel 可选的难度级别
     * @param excludeRecentlyReviewed 是否排除最近复习过的单词
     * @return 随机单词
     * @throws NoWordsAvailableException 如果没有找到单词
     * @throws RuntimeException 如果发生其他错误
     */
    public Word getRandomWord(String difficultyLevel, boolean excludeRecentlyReviewed) {
        try {
            //  TODO: fix this method, cause Failed to get random word: No words available in the database NOW
            // 使用MongoDB聚合管道来获取随机单词
            var aggregation = new ArrayList<org.springframework.data.mongodb.core.aggregation.AggregationOperation>();
            
            // 如果指定了难度级别，添加难度过滤
            if (difficultyLevel != null && !difficultyLevel.isEmpty()) {
                aggregation.add(org.springframework.data.mongodb.core.aggregation.Aggregation.match(
                    org.springframework.data.mongodb.core.query.Criteria.where("difficultyLevel").is(difficultyLevel)
                ));
            }
            
            // 如果需要排除最近复习的单词
            if (excludeRecentlyReviewed) {
                // 排除24小时内复习过的单词
                var oneDayAgo = new Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000);
                aggregation.add(org.springframework.data.mongodb.core.aggregation.Aggregation.match(
                    new org.springframework.data.mongodb.core.query.Criteria().orOperator(
                        org.springframework.data.mongodb.core.query.Criteria.where("lastReviewed").lt(oneDayAgo),
                        org.springframework.data.mongodb.core.query.Criteria.where("lastReviewed").isNull()
                    )
                ));
            }
            
            // 使用MongoDB的$sample操作符随机选择一个单词
            aggregation.add(org.springframework.data.mongodb.core.aggregation.Aggregation.sample(1));
            
            var aggregationPipeline = org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation(
                aggregation.toArray(new org.springframework.data.mongodb.core.aggregation.AggregationOperation[0])
            );
            
            var result = mongoTemplate.aggregate(
                aggregationPipeline,
                "words",  // MongoDB集合名称
                Word.class
            );
            
            if (!result.getMappedResults().isEmpty()) {
                var randomWord = result.getMappedResults().get(0);
                log.info("Successfully retrieved random word: {} with difficulty: {}", 
                    randomWord.getDutchWord(), randomWord.getDifficultyLevel());
                return randomWord;
            }
            
            log.error("No words found matching the criteria");
            throw new NoWordsAvailableException();
        } catch (Exception e) {
            log.error("Error getting random word: {}", e.getMessage());
            throw new RuntimeException("Failed to get random word: " + e.getMessage());
        }
    }
}