import { getWords, deleteWord } from './api.service.js';
import { formatDate } from './utils.js';

// 获取DOM元素
const wordsBody = document.getElementById('wordsBody');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// 显示或隐藏加载状态
export const setLoading = (isLoading) => {
    loadingDiv.style.display = isLoading ? 'block' : 'none';
    if (isLoading) errorDiv.style.display = 'none';
};

// 显示错误信息
export const showError = (message) => {
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
};

// 渲染单词表格（已移除ID列）
export const renderWordsTable = (words) => {
    wordsBody.innerHTML = '';

    if (words.length === 0) {
        wordsBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">没有找到单词</td></tr>';
        return;
    }

    words.forEach(word => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${word.dutchWord || ''}</td>
            <td>${word.englishTranslation || ''}</td>
            <td>${formatDate(word.dateAdded)}</td>
            <td>${formatDate(word.lastReviewed)}</td>
            <td>${word.reviewCount || 0}</td>
            <td><button class="delete-btn" data-id="${word.id}">删除</button></td>
        `;

        wordsBody.appendChild(row);
    });

    // 添加删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('确定要删除这个单词吗?')) {
                try {
                    await deleteWord(btn.dataset.id);
                    fetchAndDisplayWords();
                } catch (error) {
                    showError(`删除失败: ${error.message}`);
                }
            }
        });
    });
};

// 获取并显示单词列表
export const fetchAndDisplayWords = async () => {
    try {
        setLoading(true);
        const words = await getWords();
        renderWordsTable(words);
    } catch (error) {
        showError(`加载失败: ${error.message}`);
    } finally {
        setLoading(false);
    }
};