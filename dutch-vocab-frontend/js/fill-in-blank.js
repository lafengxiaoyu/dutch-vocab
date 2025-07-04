import { getWordById, updateWordReviewInfo, getRandomWord, updateWordQuizStats } from './api.service.js';

// 添加全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('JavaScript error:', message, 'at', source, lineno, colno);
    console.error('Error object:', error);
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Fill-in-blank page loaded');
    const urlParams = new URLSearchParams(window.location.search);
    const wordId = urlParams.get('id');
    
    if (wordId) {
        loadWordDetails(wordId);
    } else {
        // 如果没有ID参数，直接获取一个随机单词
        loadRandomWord();
    }

    // 添加返回按钮事件监听
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log('Back button clicked');
            window.location.href = 'index.html';
        });
    } else {
        console.error('Back button not found');
    }
    
    // 添加"下一个随机单词"按钮事件监听
    const nextRandomWordBtn = document.getElementById('nextRandomWordBtn');
    if (nextRandomWordBtn) {
        nextRandomWordBtn.addEventListener('click', () => {
            console.log('Next random word button clicked');
            loadRandomWord();
        });
    } else {
        console.error('Next random word button not found');
    }
    
    // 添加"标记为已复习"按钮事件监听
    const markReviewedButton = document.getElementById('markReviewedButton');
    if (markReviewedButton) {
        markReviewedButton.addEventListener('click', async () => {
            console.log('Mark as reviewed button clicked');
            const currentWordId = getCurrentWordId();
            if (currentWordId) {
                try {
                    await updateWordReview(currentWordId);
                } catch (error) {
                    console.error('更新复习信息失败:', error);
                    document.getElementById('error').textContent = error.message;
                    document.getElementById('error').style.display = 'block';
                }
            }
        });
    } else {
        console.error('Mark as reviewed button not found');
    }
    
    // 添加提交答案按钮事件监听
    const submitAnswerBtn = document.getElementById('submitAnswer');
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', () => {
            console.log('Submit answer button clicked');
            checkAnswer();
        });
    } else {
        console.error('Submit answer button not found');
    }
    
    // 添加输入框回车键事件监听
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                console.log('Enter key pressed in answer input');
                event.preventDefault();
                checkAnswer();
            }
        });
    } else {
        console.error('Answer input not found');
    }
    
    // 荷兰语单词点击事件，用于更新复习信息
    const dutchWordElement = document.getElementById('dutchWord');
    if (dutchWordElement) {
        dutchWordElement.addEventListener('click', async () => {
            console.log('Dutch word clicked, updating review info');
            const currentWordId = getCurrentWordId();
            if (currentWordId) {
                try {
                    await updateWordReview(currentWordId);
                } catch (error) {
                    console.error('更新复习信息失败:', error);
                    document.getElementById('error').textContent = error.message;
                    document.getElementById('error').style.display = 'block';
                }
            }
        });
        // 添加鼠标悬停样式，提示可点击
        dutchWordElement.style.cursor = 'pointer';
        dutchWordElement.title = '点击标记为已复习';
    } else {
        console.error('Dutch word element not found');
    }
});

// 获取当前显示的单词ID
function getCurrentWordId() {
    return document.getElementById('wordDetail').dataset.wordId;
}

// 加载随机单词
async function loadRandomWord() {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('wordDetail').style.display = 'none';
        document.getElementById('error').style.display = 'none';

        const word = await getRandomWord();
        console.log('Loaded random word:', word);
        
        // 更新URL，但不刷新页面
        const newUrl = `fill-in-blank.html?id=${word.id}`;
        window.history.pushState({ wordId: word.id }, '', newUrl);
        
        displayWordDetails(word);
    } catch (error) {
        console.error('加载随机单词失败:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').textContent = error.message;
        document.getElementById('error').style.display = 'block';
    }
}

// 根据ID加载单词详情
async function loadWordDetails(id) {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('wordDetail').style.display = 'none';
        document.getElementById('error').style.display = 'none';

        const word = await getWordById(id);
        console.log('Loaded word details:', word);
        
        displayWordDetails(word);
    } catch (error) {
        console.error('加载单词详情失败:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').textContent = error.message;
        document.getElementById('error').style.display = 'block';
    }
}

// 显示单词详情
async function displayWordDetails(word) {
    // 存储单词ID到DOM元素中，方便后续操作
    const wordDetailElement = document.getElementById('wordDetail');
    wordDetailElement.dataset.wordId = word.id;
    
    // 更新荷兰语单词显示
    document.getElementById('dutchWord').textContent = word.dutchWord;
    
    // 隐藏单词详情，先显示填空题
    document.getElementById('wordInfoContainer').style.display = 'none';
    
    // 填充单词详情（但暂时不显示）
    document.getElementById('dutchWordInfo').textContent = word.dutchWord;
    document.getElementById('englishTranslation').textContent = word.englishTranslation;
    document.getElementById('dateAdded').textContent = formatDate(word.dateAdded);
    document.getElementById('lastReviewed').textContent = word.lastReviewed ? formatDate(word.lastReviewed) : '未复习';
    document.getElementById('reviewCount').textContent = word.reviewCount || 0;
    document.getElementById('quizCount').textContent = word.quizCount || 0;
    document.getElementById('incorrectCount').textContent = word.incorrectCount || 0;
    
    // 计算并显示正确率
    const quizCount = word.quizCount || 0;
    const incorrectCount = word.incorrectCount || 0;
    let accuracyRate = '0%';
    let correctRateValue = 0;
    
    if (quizCount > 0) {
        correctRateValue = (quizCount - incorrectCount) / quizCount * 100;
        accuracyRate = correctRateValue.toFixed(1) + '%';
    }
    
    const accuracyElement = document.getElementById('accuracyRate');
    accuracyElement.textContent = accuracyRate;
    
    // 根据正确率添加视觉指示器（颜色）
    if (quizCount === 0) {
        accuracyElement.style.color = ''; // 默认颜色
    } else if (correctRateValue < 50) {
        accuracyElement.style.color = '#ff4d4d'; // 红色
    } else if (correctRateValue < 80) {
        accuracyElement.style.color = '#ffaa00'; // 黄色
    } else {
        accuracyElement.style.color = '#4caf50'; // 绿色
    }
    
    // 处理词性显示
    const partOfSpeechContainer = document.getElementById('partOfSpeechContainer');
    const partOfSpeechElement = document.getElementById('partOfSpeech');
    if (word.partOfSpeech && word.partOfSpeech.trim() !== '') {
        partOfSpeechElement.textContent = word.partOfSpeech;
        partOfSpeechContainer.style.display = 'block';
    } else {
        partOfSpeechContainer.style.display = 'none';
    }
    
    // 处理难度显示
    const difficultyContainer = document.getElementById('difficultyContainer');
    const difficultyElement = document.getElementById('difficulty');
    if (word.difficulty && word.difficulty.trim() !== '') {
        difficultyElement.textContent = word.difficulty;
        difficultyContainer.style.display = 'block';
    } else {
        difficultyContainer.style.display = 'none';
    }
    
    // 处理例句显示
    const exampleSentenceContainer = document.getElementById('exampleSentenceContainer');
    const exampleSentenceElement = document.getElementById('exampleSentence');
    if (word.exampleSentence && word.exampleSentence.trim() !== '') {
        exampleSentenceElement.textContent = word.exampleSentence;
        exampleSentenceContainer.style.display = 'block';
    } else {
        exampleSentenceContainer.style.display = 'none';
    }

    // 重置填空题
    resetFillInBlank();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('wordDetail').style.display = 'block';
}

// 重置填空题
function resetFillInBlank() {
    // 清空输入框
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.value = '';
        answerInput.disabled = false;
        answerInput.focus();
    }
    
    // 启用提交按钮
    const submitAnswerBtn = document.getElementById('submitAnswer');
    if (submitAnswerBtn) {
        submitAnswerBtn.disabled = false;
    }
    
    // 重置反馈区域
    const feedbackElement = document.getElementById('feedback');
    if (feedbackElement) {
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback';
        feedbackElement.style.display = 'none';
    }
}

// 检查答案
async function checkAnswer() {
    const answerInput = document.getElementById('answerInput');
    const submitAnswerBtn = document.getElementById('submitAnswer');
    const feedbackElement = document.getElementById('feedback');
    
    if (!answerInput || !submitAnswerBtn || !feedbackElement) {
        console.error('Required elements not found');
        return;
    }
    
    // 禁用输入框和提交按钮，防止重复提交
    answerInput.disabled = true;
    submitAnswerBtn.disabled = true;
    
    // 获取用户输入的答案和当前单词
    const userAnswer = answerInput.value.trim();
    const wordId = getCurrentWordId();
    
    if (!wordId) {
        console.error('No word ID found');
        return;
    }
    
    try {
        const word = await getWordById(wordId);
        const correctAnswer = word.englishTranslation;
        
        // 检查答案是否正确（不区分大小写和空格）
        const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
        
        // 显示反馈信息
        feedbackElement.textContent = isCorrect 
            ? '恭喜！你的答案正确。' 
            : `很遗憾，正确的翻译是: ${correctAnswer}`;
        feedbackElement.className = `feedback ${isCorrect ? 'success' : 'error'}`;
        feedbackElement.style.display = 'block';
        
        try {
            // 更新答题统计信息
            const updatedWord = await updateWordQuizStats(wordId, !isCorrect);
            console.log('Quiz stats updated for word:', wordId);
            
            // 立即更新页面上的统计信息
            document.getElementById('quizCount').textContent = updatedWord.quizCount || 0;
            document.getElementById('incorrectCount').textContent = updatedWord.incorrectCount || 0;
            
            // 计算并更新正确率
            const quizCount = updatedWord.quizCount || 0;
            const incorrectCount = updatedWord.incorrectCount || 0;
            let accuracyRate = '0%';
            let correctRateValue = 0;
            
            if (quizCount > 0) {
                correctRateValue = (quizCount - incorrectCount) / quizCount * 100;
                accuracyRate = correctRateValue.toFixed(1) + '%';
            }
            
            const accuracyElement = document.getElementById('accuracyRate');
            accuracyElement.textContent = accuracyRate;
            
            // 根据正确率更新颜色
            if (quizCount === 0) {
                accuracyElement.style.color = ''; // 默认颜色
            } else if (correctRateValue < 50) {
                accuracyElement.style.color = '#ff4d4d'; // 红色
            } else if (correctRateValue < 80) {
                accuracyElement.style.color = '#ffaa00'; // 黄色
            } else {
                accuracyElement.style.color = '#4caf50'; // 绿色
            }
        } catch (error) {
            console.error('更新答题统计失败:', error);
            // 不显示错误给用户，因为这不影响主要功能
        }
        
        // 延迟显示单词详情
        setTimeout(() => {
            document.getElementById('wordInfoContainer').style.display = 'block';
        }, 1500);
        
    } catch (error) {
        console.error('检查答案失败:', error);
        feedbackElement.textContent = '检查答案时出错: ' + error.message;
        feedbackElement.className = 'feedback error';
        feedbackElement.style.display = 'block';
    }
}

// 标准化答案，去除多余空格并转为小写，用于比较
function normalizeAnswer(answer) {
    if (!answer) return '';
    // 去除所有空格，转为小写
    return answer.toLowerCase().replace(/\s+/g, '');
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 更新单词复习信息
async function updateWordReview(wordId) {
    try {
        console.log('Updating review info for word ID:', wordId);
        
        // 显示加载状态
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // 调用API更新复习信息
        const updatedWord = await updateWordReviewInfo(wordId);
        console.log('Review info updated:', updatedWord);
        
        // 更新页面上的复习信息
        const lastReviewedElement = document.getElementById('lastReviewed');
        const reviewCountElement = document.getElementById('reviewCount');
        
        if (lastReviewedElement) {
            lastReviewedElement.textContent = updatedWord.lastReviewed ? formatDate(updatedWord.lastReviewed) : '未复习';
        }
        
        if (reviewCountElement) {
            reviewCountElement.textContent = updatedWord.reviewCount || 0;
        }
        
        // 隐藏加载状态
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // 显示成功消息
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = '复习信息已更新！';
        successMessage.style.color = 'green';
        successMessage.style.padding = '10px';
        successMessage.style.marginTop = '10px';
        
        const wordDetailElement = document.getElementById('wordDetail');
        if (wordDetailElement) {
            wordDetailElement.appendChild(successMessage);
            
            // 3秒后移除成功消息
            setTimeout(() => {
                if (successMessage.parentNode === wordDetailElement) {
                    wordDetailElement.removeChild(successMessage);
                }
            }, 3000);
        }
        
    } catch (error) {
        console.error('更新复习信息失败:', error);
        document.getElementById('error').textContent = error.message;
        document.getElementById('error').style.display = 'block';
        
        // 隐藏加载状态
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}