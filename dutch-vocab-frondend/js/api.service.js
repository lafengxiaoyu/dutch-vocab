const API_URL = 'http://localhost:8080/api/words';

// 获取所有单词
export const getWords = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    return response.json();
};

// 添加新单词
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

// 删除单词
export const deleteWord = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`删除失败! 状态码: ${response.status}`);
    }
};