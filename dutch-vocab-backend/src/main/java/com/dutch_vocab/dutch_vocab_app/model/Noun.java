package com.dutch_vocab.dutch_vocab_app.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;

/**
 * 表示荷兰语名词
 * 继承自Word类，添加了性别属性
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Document(collection = "words") // 使用与Word相同的集合
public class Noun extends Word {
    @NotNull(message = "名词性别不能为空")
    private NounGender gender; // 名词性别：DE（通性）或HET（中性）
    
    public Noun() {
        super();
        // 确保partsOfSpeech包含NOUN
        this.addPartOfSpeech();
    }
    
    /**
     * 添加词性NOUN到partsOfSpeech列表
     */
    private void addPartOfSpeech() {
        if (getPartsOfSpeech() == null) {
            setPartsOfSpeech(Collections.singletonList(PartOfSpeech.NOUN));
        } else if (!getPartsOfSpeech().contains(PartOfSpeech.NOUN)) {
            java.util.List<PartOfSpeech> updatedPos = new java.util.ArrayList<>(getPartsOfSpeech());
            updatedPos.add(PartOfSpeech.NOUN);
            setPartsOfSpeech(updatedPos);
        }
    }
}