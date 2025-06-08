const API_URL = 'http://localhost:8080/api/words';

const wordsBody = document.getElementById('wordsBody');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// show loading
export const showError = (message) => {
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
};

// get all the words
export const getWords = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    return response.json();
};
 
// add new word
export const addWord = async (wordData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordData),
    });

    if (!response.ok) {
        throw new Error(`添加失败! 状态码: ${response.status}`);
    }

    return response.json();
};

// 获取单个单词详情
export const getWordById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`获取单词详情失败! 状态码: ${response.status}`);
    }
    return response.json();
};

// 删除单词
export const deleteWord = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(`删除失败! 状态码: ${response.status}`);
    }

    return response.status === 204;
};