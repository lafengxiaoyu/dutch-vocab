import { getWords, deleteWord } from './api.service.js';
import { formatDate } from './utils.js';

// 获取DOM元素
const wordsBody = document.getElementById('wordsBody');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const pageSizeSelect = document.getElementById('pageSize');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');

// 分页状态
let currentPage = 1;
let pageSize = parseInt(pageSizeSelect.value);
let totalWords = 0;
let allWords = [];

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

// 计算总页数
const calculateTotalPages = () => {
    return Math.ceil(totalWords / pageSize);
};

// 更新分页控件状态
const updatePaginationControls = () => {
    const totalPages = calculateTotalPages();
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
};

// 获取当前页的单词
const getCurrentPageWords = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allWords.slice(startIndex, endIndex);
};

// 渲染单词表格
export const renderWordsTable = (words) => {
    wordsBody.innerHTML = '';

    if (words.length === 0) {
        wordsBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">没有找到单词</td></tr>';
        return;
    }

    words.forEach(word => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td title="${word.dutchWord || ''}"><a href="word-detail.html?id=${word.id}" class="word-link">${word.dutchWord || ''}</a></td>
            <td title="${word.englishTranslation || ''}"><a href="word-detail.html?id=${word.id}" class="word-link">${word.englishTranslation || ''}</a></td>
            <td title="${formatDate(word.dateAdded)}">${formatDate(word.dateAdded)}</td>
            <td title="${formatDate(word.lastReviewed)}">${formatDate(word.lastReviewed)}</td>
            <td title="${word.reviewCount || 0}">${word.reviewCount || 0}</td>
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
        allWords = await getWords();
        totalWords = allWords.length;
        
        // 确保当前页在有效范围内
        const totalPages = calculateTotalPages();
        if (currentPage > totalPages) {
            currentPage = totalPages || 1;
        }
        
        updatePaginationControls();
        renderWordsTable(getCurrentPageWords());
    } catch (error) {
        showError(`加载失败: ${error.message}`);
    } finally {
        setLoading(false);
    }
};

// 初始化分页事件监听器
export const initializePagination = () => {
    // 页面大小改变事件
    pageSizeSelect.addEventListener('change', () => {
        pageSize = parseInt(pageSizeSelect.value);
        currentPage = 1; // 重置到第一页
        fetchAndDisplayWords();
    });

    // 上一页按钮点击事件
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderWordsTable(getCurrentPageWords());
            updatePaginationControls();
        }
    });

    // 下一页按钮点击事件
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < calculateTotalPages()) {
            currentPage++;
            renderWordsTable(getCurrentPageWords());
            updatePaginationControls();
        }
    });
};