import { addWord } from './api.service.js';
import { showError } from './word-table.js';

// 获取DOM元素
const dutchWordInput = document.getElementById('dutchWord');
const englishTranslationInput = document.getElementById('englishTranslation');
const partsOfSpeechSelect = document.getElementById('partsOfSpeech');
const exampleSentenceInput = document.getElementById('exampleSentence');
const nounGenderGroup = document.getElementById('nounGenderGroup');
const nounGenderSelect = document.getElementById('nounGender');
const addWordBtn = document.getElementById('addWordBtn');
const successMessage = document.getElementById('successMessage');

// 显示成功消息
const showSuccess = (message) => {
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        successMessage.style.color = '#27ae60';

        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
};

// 设置单词表单
export const setupWordForm = (onSuccessCallback) => {
    // 检查词性选择，显示或隐藏名词性别选择
    const checkPartsOfSpeech = () => {
        const selectedOptions = Array.from(partsOfSpeechSelect.selectedOptions);
        const isNounSelected = selectedOptions.some(option => option.value === 'NOUN');
        
        // 如果选择了名词，显示性别选择
        if (isNounSelected) {
            nounGenderGroup.style.display = 'block';
        } else {
            nounGenderGroup.style.display = 'none';
            nounGenderSelect.value = ''; // 重置选择
        }
    };
    
    // 添加词性选择变化事件监听
    partsOfSpeechSelect.addEventListener('change', checkPartsOfSpeech);
    
    // 初始检查词性
    checkPartsOfSpeech();

    // 添加单词函数
    const handleAddWord = async () => {
        const dutchWord = dutchWordInput.value.trim();
        const englishTranslation = englishTranslationInput.value.trim();
        
        // 获取选中的词性
        const selectedOptions = Array.from(partsOfSpeechSelect.selectedOptions);
        const partsOfSpeech = selectedOptions.map(option => option.value);
        
        // 获取例句
        const exampleSentence = exampleSentenceInput ? exampleSentenceInput.value.trim() : '';
        
        // 获取名词性别（如果适用）
        const isNoun = partsOfSpeech.includes('NOUN');
        const gender = isNoun ? nounGenderSelect.value : null;

        if (!dutchWord || !englishTranslation) {
            showError('请输入荷兰语单词和英语翻译');
            return;
        }

        if (partsOfSpeech.length === 0) {
            showError('请至少选择一个词性');
            return;
        }
        
        // 如果是名词但没有选择性别
        if (isNoun && !gender) {
            showError('请为名词选择性别（DE或HET）');
            return;
        }

        try {
            await addWord({ 
                dutchWord, 
                englishTranslation, 
                partsOfSpeech, 
                exampleSentence,
                gender // 添加性别信息
            });

            // 清空输入框
            dutchWordInput.value = '';
            englishTranslationInput.value = '';
            
            // 清空词性选择
            for (let option of partsOfSpeechSelect.options) {
                option.selected = false;
            }
            
            // 清空例句
            if (exampleSentenceInput) {
                exampleSentenceInput.value = '';
            }

            // 显示成功消息
            showSuccess('单词添加成功！');

            // 如果提供了回调函数（在主页上时），则执行回调函数刷新表格
            if (onSuccessCallback) onSuccessCallback();

        } catch (error) {
            showError(`添加失败: ${error.message}`);
        }
    };

    // 添加按钮点击事件
    addWordBtn.addEventListener('click', handleAddWord);

    // 输入框回车事件
    [dutchWordInput, englishTranslationInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddWord();
            }
        });
    });
};