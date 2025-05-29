package com.dutch_vocab.dutch_vocab_app.repository;

import com.dutch_vocab.dutch_vocab_app.model.Word;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WordRepository extends MongoRepository<Word, Long> {
    List<Word> findByDutchWord(String dutchWord);

//    List<Word> findByDifficulty(int difficulty);

    List<Word> findAllByOrderByLastReviewedAsc();

    boolean existsByDutchWord(String dutchWord);
}