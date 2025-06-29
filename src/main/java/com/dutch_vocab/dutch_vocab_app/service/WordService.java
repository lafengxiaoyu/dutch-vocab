package com.dutch_vocab.dutch_vocab_app.service;

import com.dutch_vocab.dutch_vocab_app.exception.DuplicateWordException;
import com.dutch_vocab.dutch_vocab_app.model.Word;
import com.dutch_vocab.dutch_vocab_app.repository.WordRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
}