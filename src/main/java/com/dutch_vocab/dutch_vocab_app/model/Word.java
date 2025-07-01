package com.dutch_vocab.dutch_vocab_app.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.util.Date;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Word {
    @Id
    private ObjectId id;

    public String getId() {
        return id != null ? id.toString() : null;
    }

    private String dutchWord;
    private String englishTranslation;
    private Date dateAdded = new Date();
    private Date lastReviewed;
    private Integer reviewCount = 0;
    private Integer quizCount = 0;     // 答题次数
    private Integer incorrectCount = 0; // 答错次数
    // optional fields
    private String partOfSpeech; // 词性: noun, verb, adjective etc.
    private String exampleSentence; // example
    private Integer difficultyLevel = 1; // difficulty level 1-5
}