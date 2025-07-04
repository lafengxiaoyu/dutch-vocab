// 根据当前环境动态选择API URL
const getApiBaseUrl = () => {
    // 检查当前窗口URL
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
        return 'http://localhost:8080/api/words';
    } else {
        // 生产环境URL - 使用相对路径，这样会自动使用当前域名
        return '/api/words';
    }
};

const API_URL = getApiBaseUrl();

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
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(wordData),
        });

        if (!response.ok) {
            // 尝试解析错误响应
            let errorMessage = `添加失败! 状态码: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                console.error('无法解析错误响应:', e);
            }
            throw new Error(errorMessage);
        }

        return response.json();
    } catch (error) {
        console.error('Add word error:', error);
        throw error;
    }
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

// 更新单词复习信息
export const updateWordReviewInfo = async (id) => {
    const response = await fetch(`${API_URL}/${id}/review`, {
        method: 'PUT'
    });

    if (!response.ok) {
        throw new Error(`更新复习信息失败! 状态码: ${response.status}`);
    }

    return response.json();
};

// 更新单词答题统计信息
export const updateWordQuizStats = async (id, isIncorrect) => {
    const response = await fetch(`${API_URL}/${id}/quiz-stats?isIncorrect=${isIncorrect}`, {
        method: 'PUT'
    });

    if (!response.ok) {
        throw new Error(`更新答题统计信息失败! 状态码: ${response.status}`);
    }

    return response.json();
};

// 更新单词信息
export const updateWord = async (id, wordData) => {
    try {
        console.log('Updating word:', id, 'with data:', wordData);
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(wordData),
        });

        if (!response.ok) {
            // 尝试解析错误响应
            let errorMessage = `更新单词失败! 状态码: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                console.error('无法解析错误响应:', e);
            }
            throw new Error(errorMessage);
        }

        const updatedWord = await response.json();
        console.log('Word updated successfully:', updatedWord);
        return updatedWord;
    } catch (error) {
        console.error('Update word error:', error);
        throw error;
    }
};

// 批量添加单词
export const addWordsBulk = async (wordsData) => {
    const response = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words: wordsData }),
    });

    if (!response.ok) {
        throw new Error(`批量添加失败! 状态码: ${response.status}`);
    }

    return response.json();
};

// 获取随机单词
export const getRandomWord = async (difficultyLevel = null) => {
    try {
        // 构建查询参数
        const params = new URLSearchParams();
        if (difficultyLevel) {
            params.append('difficultyLevel', difficultyLevel);
        }

        const url = `${API_URL}/random${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            // 尝试解析错误响应
            let errorMessage = `获取随机单词失败! 状态码: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                console.error('无法解析错误响应:', e);
            }
            throw new Error(errorMessage);
        }
        return response.json();
    } catch (error) {
        console.error('Get random word error:', error);
        throw error;
    }
};

// 获取多个随机单词（用于选择题选项）
export const getRandomWords = async (count = 3, excludeId = null) => {
    try {
        // 构建查询参数
        const params = new URLSearchParams();
        params.append('count', count);
        if (excludeId) {
            params.append('excludeId', excludeId);
        }

        const url = `${API_URL}/random?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            let errorMessage = `获取随机单词失败! 状态码: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                console.error('无法解析错误响应:', e);
            }
            throw new Error(errorMessage);
        }
        return response.json();
    } catch (error) {
        console.error('Get random words error:', error);
        throw error;
    }
};