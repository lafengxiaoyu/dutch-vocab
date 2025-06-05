package com.dutch_vocab.dutch_vocab_app.repository;

import com.dutch_vocab.dutch_vocab_app.model.Word;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends MongoRepository<Word, ObjectId> {
    List<Word> findByDutchWord(String dutchWord);

//    List<Word> findByDifficulty(int difficulty);

    List<Word> findAllByOrderByLastReviewedAsc();

    boolean existsByDutchWord(String dutchWord);
}