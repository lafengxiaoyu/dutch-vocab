package com.dutch_vocab.dutch_vocab_app.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Data
@Entity
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String dutchWord;

    @Column(nullable = false)
    private String englishTranslation;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date dateAdded = new Date();

    @Temporal(TemporalType.TIMESTAMP)
    private Date lastReviewed;

    private int reviewCount = 0;

    // 可选字段
    private String partOfSpeech; // 词性: noun, verb, adjective等
    private String exampleSentence; // 例句
    private int difficultyLevel = 1; // 难度等级1-5
}