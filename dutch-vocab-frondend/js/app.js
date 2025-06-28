import { fetchAndDisplayWords, initializePagination } from './word-table.js';
import { setupWordForm } from './word-form.js';
import { setupBulkAddForm } from './word-bulk-add.js';

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
});