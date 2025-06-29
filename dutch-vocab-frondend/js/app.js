import { fetchAndDisplayWords, initializePagination } from './word-table.js';
import { setupWordForm } from './word-form.js';
import { setupBulkAddForm } from './word-bulk-add.js';
import { getRandomWord } from './api.service.js';

// 处理随机单词功能
const setupRandomWordFeature = () => {
    const modal = document.getElementById('randomWordModal');
    const randomWordBtn = document.getElementById('randomWordBtn');
    const closeBtn = modal.querySelector('.close');
    const nextRandomWordBtn = document.getElementById('nextRandomWordBtn');
    
    // 显示随机单词
    const showRandomWord = async () => {
        try {
            const word = await getRandomWord();
            document.getElementById('randomDutchWord').textContent = word.dutch || '';
            document.getElementById('randomEnglishTranslation').textContent = word.english || '';
            document.getElementById('randomChineseTranslation').textContent = word.chinese || '';
            document.getElementById('randomExample').textContent = word.example || '';
            modal.style.display = 'block';
        } catch (error) {
            console.error('获取随机单词失败:', error);
            alert('获取随机单词失败，请稍后再试');
        }
    };
    
    // 点击随机单词按钮
    randomWordBtn.addEventListener('click', showRandomWord);
    
    // 点击下一个按钮
    nextRandomWordBtn.addEventListener('click', showRandomWord);
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化单词表格
    fetchAndDisplayWords();

    // 初始化分页功能
    initializePagination();

    // 设置刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', fetchAndDisplayWords);

    // 初始化添加单词表单
    setupWordForm(fetchAndDisplayWords);
    
    // 初始化批量添加单词功能
    setupBulkAddForm(fetchAndDisplayWords);
    
    // 初始化随机单词功能
    setupRandomWordFeature();
});