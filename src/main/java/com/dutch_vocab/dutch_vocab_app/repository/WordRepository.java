package com.dutch_vocab.dutch_vocab_app.repository;

import com.dutch_vocab.dutch_vocab_app.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WordRepository extends JpaRepository<Word, Long> {
    List<Word> findAllByOrderByLastReviewedAsc();

    // 可选: 按难度级别查找
    List<Word> findByDifficultyLevelOrderByLastReviewedAsc(int difficultyLevel);
}