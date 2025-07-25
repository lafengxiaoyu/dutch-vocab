// 根据当前环境动态选择API URL
const getApiBaseUrl = () => {
    // 检查当前窗口URL
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
        return 'http://localhost:8080/api/words';  // 本地开发环境
    } else {
        // 生产环境URL - 使用Render后端
        return 'https://dutch-vocab.onrender.com/api/words';
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
export const addWordsBulk = async (wordsData, progressCallback = null) => {
    // 如果提供了进度回调，先初始化进度为0
    if (progressCallback) {
        progressCallback(0, wordsData.length);
    }
    
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

    // 如果提供了进度回调，完成时设置进度为100%
    if (progressCallback) {
        progressCallback(wordsData.length, wordsData.length);
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

// 获取与目标单词相同词性的随机单词（用于选择题选项）
export const getRandomWordsByPartOfSpeech = async (count = 3, targetWordId) => {
    try {
        if (!targetWordId) {
            throw new Error('目标单词ID不能为空');
        }
        
        // 构建查询参数
        const params = new URLSearchParams();
        params.append('count', count);
        params.append('targetWordId', targetWordId);

        const url = `${API_URL}/random-by-part-of-speech?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            let errorMessage = `获取相同词性的随机单词失败! 状态码: ${response.status}`;
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
        console.error('Get random words by part of speech error:', error);
        throw error;
    }
};

// 获取下一个单词
export const getNextWord = async (currentId) => {
    try {
        // 首先获取所有单词
        const allWords = await getWords();
        
        // 找到当前单词在列表中的索引
        const currentIndex = allWords.findIndex(word => word.id === currentId);
        
        // 如果找不到当前单词，抛出错误
        if (currentIndex === -1) {
            throw new Error('找不到当前单词');
        }
        
        // 计算下一个单词的索引（如果是最后一个单词，则返回第一个单词）
        const nextIndex = (currentIndex + 1) % allWords.length;
        
        // 返回下一个单词
        return allWords[nextIndex];
    } catch (error) {
        console.error('Get next word error:', error);
        throw error;
    }
};