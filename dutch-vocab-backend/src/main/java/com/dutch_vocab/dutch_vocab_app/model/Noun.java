package com.dutch_vocab.dutch_vocab_app.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 表示荷兰语名词
 * 继承自Word类，添加了性别属性
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Document(collection = "words") // 使用与Word相同的集合
public class Noun extends Word {
    private NounGender gender; // 名词性别：DE（通性）或HET（中性）
    
    public Noun() {
        super();
        // 确保partsOfSpeech包含NOUN
        this.addPartOfSpeech(PartOfSpeech.NOUN);
    }
    
    /**
     * 添加词性NOUN到partsOfSpeech列表
     */
    private void addPartOfSpeech(PartOfSpeech pos) {
        if (getPartsOfSpeech() == null) {
            setPartsOfSpeech(java.util.Arrays.asList(pos));
        } else if (!getPartsOfSpeech().contains(pos)) {
            java.util.List<PartOfSpeech> updatedPos = new java.util.ArrayList<>(getPartsOfSpeech());
            updatedPos.add(pos);
            setPartsOfSpeech(updatedPos);
        }
    }
}