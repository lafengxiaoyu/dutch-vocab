package com.dutch_vocab.dutch_vocab_app.service;

import com.dutch_vocab.dutch_vocab_app.exception.DuplicateWordException;
import com.dutch_vocab.dutch_vocab_app.exception.NoWordsAvailableException;
import com.dutch_vocab.dutch_vocab_app.model.Noun;
import com.dutch_vocab.dutch_vocab_app.model.PartOfSpeech;
import com.dutch_vocab.dutch_vocab_app.model.Word;
import com.dutch_vocab.dutch_vocab_app.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;

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
    
    /**
     * 根据词性获取单词列表
     * @param partOfSpeech 词性
     * @return 指定词性的单词列表
     */
    public List<Word> getWordsByPartOfSpeech(PartOfSpeech partOfSpeech) {
        return wordRepository.findByPartsOfSpeechContaining(partOfSpeech);
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
        existingWord.setPartsOfSpeech(updatedWord.getPartsOfSpeech());
        existingWord.setExampleSentence(updatedWord.getExampleSentence());
        existingWord.setDifficultyLevel(updatedWord.getDifficultyLevel());
        
        // 如果是Noun类型，则处理gender字段
        if (existingWord instanceof Noun && updatedWord instanceof Noun) {
            ((Noun) existingWord).setGender(((Noun) updatedWord).getGender());
        }
        
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
     * @return 随机单词
     * @throws NoWordsAvailableException 如果没有找到单词
     * @throws RuntimeException 如果发生其他错误
     */
    public Word getRandomWord() {
        return getRandomWords(1, null).get(0);
    }

    /**
     * 更新单词的答题统计信息并根据正确率自动调整难度级别
     * @param id 单词ID
     * @param isIncorrect 是否答错
     * @return 更新后的单词
     */
    public Word updateWordQuizStats(String id, boolean isIncorrect) {
        var objectId = getObjectId(id);
        var existingWord = wordRepository.findById(objectId)
            .orElseThrow(() -> new RuntimeException("Word not found with id: " + id));
        
        // 更新答题次数
        existingWord.setQuizCount(existingWord.getQuizCount() + 1);
        
        // 如果答错了，更新答错次数
        if (isIncorrect) {
            existingWord.setIncorrectCount(existingWord.getIncorrectCount() + 1);
        }
        
        // 根据正确率自动调整难度级别
        adjustDifficultyBasedOnAccuracy(existingWord);
        
        log.info("Word quiz stats updated: {}, incorrect: {}, difficulty level: {}", 
                existingWord.getDutchWord(), isIncorrect, existingWord.getDifficultyLevel());
        return wordRepository.save(existingWord);
    }
    
    /**
     * 根据单词的正确率自动调整难度级别
     * 规则：
     * 1. 正确率70-100%或答题次数小于3次 -> 难度级别1（最简单）
     * 2. 正确率50-70% -> 难度级别2
     * 3. 正确率30-50% -> 难度级别3
     * 4. 正确率10-30% -> 难度级别4
     * 5. 正确率0-10% -> 难度级别5（最难）
     * @param word 需要调整难度的单词
     */
    private void adjustDifficultyBasedOnAccuracy(Word word) {
        int quizCount = word.getQuizCount();
        int incorrectCount = word.getIncorrectCount();
        int currentDifficulty = word.getDifficultyLevel();
        
        // 如果答题次数小于3次，设置为最简单难度
        if (quizCount < 3) {
            if (currentDifficulty != 1) {
                log.info("Setting difficulty to 1 for word: {} (quiz count < 3)", word.getDutchWord());
                word.setDifficultyLevel(1);
            }
            return;
        }
        
        // 计算正确率
        double accuracyRate = (double) (quizCount - incorrectCount) / quizCount;
        int newDifficulty;
        
        // 根据正确率设置难度级别
        if (accuracyRate >= 0.7) {
            newDifficulty = 1; // 70-100% -> 难度1
        } else if (accuracyRate >= 0.5) {
            newDifficulty = 2; // 50-70% -> 难度2
        } else if (accuracyRate >= 0.3) {
            newDifficulty = 3; // 30-50% -> 难度3
        } else if (accuracyRate >= 0.1) {
            newDifficulty = 4; // 10-30% -> 难度4
        } else {
            newDifficulty = 5; // 0-10% -> 难度5
        }
        
        // 如果难度级别有变化，更新并记录日志
        if (currentDifficulty != newDifficulty) {
            log.info("Adjusted difficulty for word: {} from {} to {} (accuracy: {})", 
                    word.getDutchWord(), currentDifficulty, newDifficulty, 
                    String.format("%.2f", accuracyRate));
            word.setDifficultyLevel(newDifficulty);
        }
    }

    /**
     * 计算单词的权重
     * 权重计算规则：
     * 1. 基础权重 = 1.0
     * 2. 如果单词从未被测试过（quizCount = 0），权重 *= 2.0
     * 3. 如果单词有测试记录，权重 *= (1.0 + incorrectRate)
     */
    private double calculateWeight(Word word) {
        double weight = 1.0;
        
        // 如果单词从未被测试过，给予较高权重
        if (word.getQuizCount() == 0) {
            weight *= 2.0;
        } else {
            // 计算错误率并增加权重
            double incorrectRate = (double) word.getIncorrectCount() / word.getQuizCount();
            weight *= (1.0 + incorrectRate);
        }
        
        return weight;
    }

    /**
     * 获取加权随机单词
     * @param count 需要获取的单词数量
     * @param excludeId 需要排除的单词ID
     * @return 随机单词列表
     */
    public List<Word> getRandomWords(int count, String excludeId) {
        try {
            if (count < 1) {
                throw new IllegalArgumentException("Count must be greater than 0");
            }

            log.info("Attempting to get {} weighted random words (excluding ID: {})", count, excludeId);
            
            // 创建基础查询
            var query = new Query();
            
            // 如果有需要排除的ID，添加到查询条件中
            if (excludeId != null && !excludeId.isEmpty()) {
                var excludeObjectId = getObjectId(excludeId);
                query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("_id").ne(excludeObjectId));
            }
            
            // 获取所有符合条件的单词
            var allWords = mongoTemplate.find(query, Word.class);
            if (allWords.isEmpty()) {
                log.error("No words available in the database");
                throw new NoWordsAvailableException("No words available in the database");
            }

            // 如果请求的数量大于总数，调整为总数
            count = Math.min(count, allWords.size());
            
            // 计算每个单词的权重
            var weights = new ArrayList<Double>();
            double totalWeight = 0.0;
            for (Word word : allWords) {
                double weight = calculateWeight(word);
                weights.add(weight);
                totalWeight += weight;
            }
            
            // 使用权重进行随机选择
            var selectedWords = new ArrayList<Word>();
            Random random = new Random();
            
            while (selectedWords.size() < count) {
                double randomValue = random.nextDouble() * totalWeight;
                double currentSum = 0.0;
                
                for (int i = 0; i < allWords.size(); i++) {
                    if (selectedWords.contains(allWords.get(i))) {
                        continue;  // 跳过已选择的单词
                    }
                    
                    currentSum += weights.get(i);
                    if (currentSum >= randomValue) {
                        selectedWords.add(allWords.get(i));
                        break;
                    }
                }
            }

            log.info("Successfully retrieved {} weighted random words", selectedWords.size());
            return selectedWords;

        } catch (IllegalArgumentException e) {
            log.error("Invalid count parameter: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error getting weighted random words: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get weighted random words: " + e.getMessage());
        }
    }
    
    /**
     * 获取与目标单词相同词性的随机单词
     * @param count 需要获取的单词数量
     * @param targetWordId 目标单词ID
     * @return 与目标单词相同词性的随机单词列表
     */
    public List<Word> getRandomWordsByPartOfSpeech(int count, String targetWordId) {
        try {
            if (count < 1) {
                throw new IllegalArgumentException("Count must be greater than 0");
            }
            
            // 获取目标单词
            if (targetWordId == null || targetWordId.isEmpty()) {
                log.error("Target word ID cannot be null or empty");
                throw new IllegalArgumentException("Target word ID cannot be null or empty");
            }
            
            var targetObjectId = getObjectId(targetWordId);
            var targetWord = wordRepository.findById(targetObjectId)
                .orElseThrow(() -> new RuntimeException("Target word not found with id: " + targetWordId));
            
            // 获取目标单词的词性
            var targetPartsOfSpeech = targetWord.getPartsOfSpeech();
            if (targetPartsOfSpeech == null || targetPartsOfSpeech.isEmpty()) {
                log.warn("Target word has no parts of speech defined, falling back to regular random selection");
                return getRandomWords(count, targetWordId);
            }
        
            log.info("Attempting to get {} random words with same part of speech as word ID: {}", count, targetWordId);
            log.info("Target word parts of speech: {}", targetPartsOfSpeech);
            
            // 创建基础查询，排除目标单词
            var query = new Query();
            query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("_id").ne(targetObjectId));
            
            // 获取所有符合条件的单词
            var allWords = mongoTemplate.find(query, Word.class);
            if (allWords.isEmpty()) {
                log.error("No words available in the database");
                throw new NoWordsAvailableException("No words available in the database");
            }
            
            // 筛选出与目标单词具有相同词性的单词
            var samePartOfSpeechWords = allWords.stream()
                .filter(word -> {
                    List<PartOfSpeech> wordPartsOfSpeech = word.getPartsOfSpeech();
                    if (wordPartsOfSpeech == null || wordPartsOfSpeech.isEmpty()) {
                        return false;
                    }
                    // 检查是否有任何词性匹配
                    return wordPartsOfSpeech.stream()
                        .anyMatch(targetPartsOfSpeech::contains);
                })
                .toList();
            
            // 如果没有找到相同词性的单词，回退到普通随机选择
            if (samePartOfSpeechWords.isEmpty()) {
                log.warn("No words with same part of speech found, falling back to regular random selection");
                return getRandomWords(count, targetWordId);
            }
            
            // 如果相同词性的单词数量不足，调整请求数量
            int availableCount = samePartOfSpeechWords.size();
            int adjustedCount = Math.min(count, availableCount);
            
            // 计算每个单词的权重
            var weights = new ArrayList<Double>();
            double totalWeight = 0.0;
            for (Word word : samePartOfSpeechWords) {
                double weight = calculateWeight(word);
                weights.add(weight);
                totalWeight += weight;
            }
            
            // 使用权重进行随机选择
            var selectedWords = new ArrayList<Word>();
            Random random = new Random();
            
            while (selectedWords.size() < adjustedCount) {
                double randomValue = random.nextDouble() * totalWeight;
                double currentSum = 0.0;
                
                for (int i = 0; i < samePartOfSpeechWords.size(); i++) {
                    if (selectedWords.contains(samePartOfSpeechWords.get(i))) {
                        continue;  // 跳过已选择的单词
                    }
                    
                    currentSum += weights.get(i);
                    if (currentSum >= randomValue) {
                        selectedWords.add(samePartOfSpeechWords.get(i));
                        break;
                    }
                }
            }
            
            // 如果选择的单词数量不足，从所有单词中随机选择剩余的单词
            if (selectedWords.size() < count) {
                log.info("Not enough words with same part of speech, adding random words to reach count");
                
                // 从所有单词中排除已选择的单词和目标单词
                var remainingWords = allWords.stream()
                    .filter(word -> !selectedWords.contains(word))
                    .toList();
                
                if (!remainingWords.isEmpty()) {
                    // 计算剩余单词的权重
                    var remainingWeights = new ArrayList<Double>();
                    double remainingTotalWeight = 0.0;
                    for (Word word : remainingWords) {
                        double weight = calculateWeight(word);
                        remainingWeights.add(weight);
                        remainingTotalWeight += weight;
                    }
                    
                    // 随机选择剩余的单词
                    while (selectedWords.size() < count) {
                        double randomValue = random.nextDouble() * remainingTotalWeight;
                        double currentSum = 0.0;
                        
                        for (int i = 0; i < remainingWords.size(); i++) {
                            currentSum += remainingWeights.get(i);
                            if (currentSum >= randomValue) {
                                selectedWords.add(remainingWords.get(i));
                                break;
                            }
                        }
                    }
                }
            }

            log.info("Successfully retrieved {} random words with same part of speech as target word", selectedWords.size());
            return selectedWords;

        } catch (IllegalArgumentException e) {
            log.error("Invalid parameter: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error getting random words by part of speech: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get random words by part of speech: " + e.getMessage());
        }
    }
}