import { getWordById, updateWordReviewInfo } from './api.service.js';
import { formatDate } from './utils.js';

const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const wordDetailDiv = document.getElementById('wordDetail');

// 显示错误信息
const showError = (message) => {
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
};

// 显示单词详情
const displayWordDetail = (word) => {
    document.getElementById('dutchWord').textContent = word.dutchWord;
    document.getElementById('englishTranslation').textContent = word.englishTranslation;
    document.getElementById('dateAdded').textContent = formatDate(word.dateAdded);
    document.getElementById('lastReviewed').textContent = formatDate(word.lastReviewed);
    document.getElementById('reviewCount').textContent = word.reviewCount || 0;

    // 显示详情区域
    document.getElementById('loading').style.display = 'none';
    document.getElementById('wordDetail').style.display = 'block';
    document.getElementById('dateAdded').textContent = new Date(word.dateAdded).toLocaleDateString();
    document.getElementById('lastReviewed').textContent = word.lastReviewed ? new Date(word.lastReviewed).toLocaleDateString() : '尚未复习';
    document.getElementById('reviewCount').textContent = word.reviewCount || 0;

    loadingDiv.style.display = 'none';
    wordDetailDiv.style.display = 'block';
};

// 从URL获取单词ID
const getWordIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
};

// 初始化页面
const initPage = async () => {
    try {
        const wordId = getWordIdFromUrl();
        if (!wordId) {
            throw new Error('未找到单词ID');
        }

        const word = await getWordById(wordId);
        displayWordDetail(word);
        
        // 自动调用review方法更新复习信息
        try {
            const updatedWord = await updateWordReviewInfo(wordId);
            // 更新显示的复习信息
            document.getElementById('lastReviewed').textContent = updatedWord.lastReviewed ? new Date(updatedWord.lastReviewed).toLocaleDateString() : '尚未复习';
            document.getElementById('reviewCount').textContent = updatedWord.reviewCount || 0;
        } catch (reviewError) {
            console.error('更新复习信息失败:', reviewError);
        }
    } catch (error) {
        showError(error.message);
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initPage);