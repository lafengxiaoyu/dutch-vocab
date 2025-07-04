import { fetchAndDisplayWords, initializePagination, initializeSorting } from './word-table.js';
import { setupWordForm } from './word-form.js';
import { setupBulkAddForm } from './word-bulk-add.js';
import { getRandomWord } from './api.service.js';

// 处理随机单词功能
const setupRandomWordFeature = () => {
    const randomWordBtn = document.getElementById('randomWordBtn');
    
    // 点击随机单词按钮
    randomWordBtn.addEventListener('click', async () => {
        try {
            const word = await getRandomWord();
            // 在当前页面导航到随机单词页面
            window.location.href = `random-word.html?id=${word.id}`;
        } catch (error) {
            console.error('获取随机单词失败:', error);
            alert('获取随机单词失败，请稍后再试');
        }
    });
};

// 处理填空测试功能
const setupFillInBlankFeature = () => {
    const fillInBlankBtn = document.getElementById('fillInBlankBtn');
    
    // 点击填空测试按钮
    fillInBlankBtn.addEventListener('click', async () => {
        try {
            const word = await getRandomWord();
            // 在当前页面导航到填空测试页面
            window.location.href = `fill-in-blank.html?id=${word.id}`;
        } catch (error) {
            console.error('获取随机单词失败:', error);
            alert('获取随机单词失败，请稍后再试');
        }
    });
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化单词表格
    fetchAndDisplayWords();

    // 初始化分页功能
    initializePagination();
    
    // 初始化排序功能
    initializeSorting();

    // 设置刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', fetchAndDisplayWords);

    // 初始化添加单词表单
    setupWordForm(fetchAndDisplayWords);
    
    // 初始化批量添加单词功能
    setupBulkAddForm(fetchAndDisplayWords);
    
    // 初始化随机单词功能
    setupRandomWordFeature();
    
    // 初始化填空测试功能
    setupFillInBlankFeature();
});