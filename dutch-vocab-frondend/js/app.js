import { fetchAndDisplayWords } from './word-table.js';
import { setupWordForm } from './word-form.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化单词表格
    fetchAndDisplayWords();

    // 设置刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', fetchAndDisplayWords);

    // 初始化添加单词表单
    setupWordForm(fetchAndDisplayWords);
});