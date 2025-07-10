import { setupWordForm } from './word-form.js';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化添加单词表单
    setupWordForm();
    
    // 设置返回主页按钮
    document.getElementById('backToHomeBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});