import { addWord } from './api.service.js';
import { showError } from './word-table.js';

// 获取DOM元素
const dutchWordInput = document.getElementById('dutchWord');
const englishTranslationInput = document.getElementById('englishTranslation');
const addWordBtn = document.getElementById('addWordBtn');
const successMessage = document.getElementById('successMessage');

// 显示成功消息
const showSuccess = (message) => {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    successMessage.style.color = '#27ae60';

    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
};

// 设置单词表单
export const setupWordForm = (onSuccessCallback) => {
    // 添加单词函数
    const handleAddWord = async () => {
        const dutchWord = dutchWordInput.value.trim();
        const englishTranslation = englishTranslationInput.value.trim();

        if (!dutchWord || !englishTranslation) {
            showError('请输入荷兰语单词和英语翻译');
            return;
        }

        try {
            await addWord({ dutchWord, englishTranslation });

            // 清空输入框
            dutchWordInput.value = '';
            englishTranslationInput.value = '';

            // 显示成功消息
            showSuccess('单词添加成功！');

            // 执行回调函数（通常是刷新表格）
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