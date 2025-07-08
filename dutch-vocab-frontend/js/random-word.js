import { getWordById, updateWordReviewInfo, getRandomWord, getRandomWords, updateWordQuizStats } from './api.service.js';

// 检查浏览器是否支持语音合成
const isSpeechSupported = () => {
    return 'speechSynthesis' in window;
};

// 朗读荷兰语单词
const speakDutchWord = (word) => {
    if (!isSpeechSupported()) {
        console.warn('您的浏览器不支持语音合成功能');
        return;
    }

    // 停止当前正在播放的语音
    speechSynthesis.cancel();

    // 强制使用荷兰语发音
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'nl-NL'; // 强制使用荷兰语
    utterance.rate = 0.8; // 适当减慢语速
    
    // 获取可用语音列表
    let voices = speechSynthesis.getVoices();
    
    // 调试信息
    console.log('可用语音列表:', voices.map(v => `${v.name} (${v.lang})`));
    
    // 严格按优先级选择荷兰语语音
    let selectedVoice = null;
    
    // 1. 首选精确匹配nl-NL的语音
    selectedVoice = voices.find(voice => voice.lang === 'nl-NL');
    
    // 2. 其次选择任何nl开头的语音
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('nl'));
    }
    
    // 3. 再次尝试包含"Dutch"或"Nederlands"的语音
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
            voice.name.includes('Dutch') || 
            voice.name.includes('Nederlands') ||
            voice.name.includes('Holland')
        );
    }
    
    // 4. 最后尝试任何可用的语音，但仍强制lang为nl-NL
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('使用语音:', selectedVoice.name, selectedVoice.lang);
    } else {
        console.warn('未找到荷兰语语音，将使用默认语音');
    }

    // 添加错误处理
    utterance.onerror = function(event) {
        console.error('语音合成错误:', event.error);
    };
    
    // 添加成功回调
    utterance.onend = function() {
        console.log('语音合成完成');
    };

    // 确保语音列表已加载
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = function() {
            voices = speechSynthesis.getVoices();
            console.log('语音列表已加载:', voices.length);
            speechSynthesis.speak(utterance);
        };
    } else {
        speechSynthesis.speak(utterance);
    }
};

// 朗读荷兰语句子
const speakDutchSentence = (sentence) => {
    if (!isSpeechSupported()) {
        console.warn('您的浏览器不支持语音合成功能');
        return;
    }

    // 停止当前正在播放的语音
    speechSynthesis.cancel();

    // 强制使用荷兰语发音
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'nl-NL'; // 强制使用荷兰语
    utterance.rate = 0.8; // 适当减慢语速
    
    // 获取可用语音列表
    let voices = speechSynthesis.getVoices();
    
    // 调试信息
    console.log('可用语音列表:', voices.map(v => `${v.name} (${v.lang})`));
    
    // 严格按优先级选择荷兰语语音
    let selectedVoice = null;
    
    // 1. 首选精确匹配nl-NL的语音
    selectedVoice = voices.find(voice => voice.lang === 'nl-NL');
    
    // 2. 其次选择任何nl开头的语音
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('nl'));
    }
    
    // 3. 再次尝试包含"Dutch"或"Nederlands"的语音
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
            voice.name.includes('Dutch') || 
            voice.name.includes('Nederlands') ||
            voice.name.includes('Holland')
        );
    }
    
    // 4. 最后尝试任何可用的语音，但仍强制lang为nl-NL
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('使用语音:', selectedVoice.name, selectedVoice.lang);
    } else {
        console.warn('未找到荷兰语语音，将使用默认语音');
    }

    // 添加错误处理
    utterance.onerror = function(event) {
        console.error('语音合成错误:', event.error);
    };
    
    // 添加成功回调
    utterance.onend = function() {
        console.log('语音合成完成');
    };

    // 确保语音列表已加载
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = function() {
            voices = speechSynthesis.getVoices();
            console.log('语音列表已加载:', voices.length);
            speechSynthesis.speak(utterance);
        };
    } else {
        speechSynthesis.speak(utterance);
    }
};

// 预加载语音列表并显示调试信息
if ('speechSynthesis' in window) {
    // 初始加载
    let voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        console.log('初始语音列表:', voices.map(v => `${v.name} (${v.lang})`));
    }
    
    // 监听语音列表变化
    speechSynthesis.onvoiceschanged = function() {
        voices = speechSynthesis.getVoices();
        console.log('语音列表已更新:', voices.map(v => `${v.name} (${v.lang})`));
        
        // 检查是否有荷兰语语音
        const dutchVoices = voices.filter(v => 
            v.lang === 'nl-NL' || 
            v.lang.startsWith('nl') || 
            v.name.includes('Dutch') || 
            v.name.includes('Nederlands')
        );
        
        console.log('可用荷兰语语音:', dutchVoices.map(v => `${v.name} (${v.lang})`));
    };
}

// 添加全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('JavaScript error:', message, 'at', source, lineno, colno);
    console.error('Error object:', error);
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Random word page loaded');
    
    // 添加朗读按钮事件
    const speakButton = document.getElementById('speakButton');
    if (speakButton) {
        speakButton.addEventListener('click', function() {
            const word = document.getElementById('dutchWord').textContent;
            if (word) {
                speakDutchWord(word);
            }
        });
    }

    // 添加例句朗读按钮事件
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'speakExampleButton') {
            const sentence = document.getElementById('exampleSentence').textContent;
            if (sentence) {
                speakDutchSentence(sentence);
            }
        }
    });
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
        const newUrl = `random-word.html?id=${word.id}`;
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
    
    // 隐藏单词详情，先显示选择题
    document.getElementById('wordInfoContainer').style.display = 'none';
    
    // 填充单词详情（但暂时不显示）
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
    
    // 处理词性数组显示
    const partOfSpeechContainer = document.getElementById('partOfSpeechContainer');
    const partOfSpeechElement = document.getElementById('partOfSpeech');
    if (word.partsOfSpeech && word.partsOfSpeech.length > 0) {
        partOfSpeechElement.textContent = word.partsOfSpeech.join(', ');
    } else {
        partOfSpeechElement.textContent = '未设置';
    }
    partOfSpeechContainer.style.display = 'block';
    
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

    // 生成选择题选项
    await generateQuizOptions(word);

    document.getElementById('loading').style.display = 'none';
    document.getElementById('wordDetail').style.display = 'block';
}

// 生成选择题选项
async function generateQuizOptions(word) {
    try {
        // 获取3个随机单词作为干扰项
        const randomWords = await getRandomWords(3, word.id);
        
        // 创建选项数组，包含正确答案和干扰项
        const options = [
            { text: word.englishTranslation, correct: true },
            ...randomWords.map(w => ({ text: w.englishTranslation, correct: false }))
        ];
        
        // 随机排序选项
        const shuffledOptions = shuffleArray(options);
        
        // 清空选项容器
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        // 重置反馈区域
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback';
        feedbackElement.style.display = 'none';
        
        // 创建选项按钮
        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.text;
            button.dataset.correct = option.correct;
            button.dataset.index = index;
            
            button.addEventListener('click', function() {
                handleOptionClick(this, word);
            });
            
            optionsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('生成选择题选项失败:', error);
        document.getElementById('error').textContent = '生成选择题选项失败: ' + error.message;
        document.getElementById('error').style.display = 'block';
        
        // 如果选项生成失败，直接显示单词详情
        document.getElementById('wordInfoContainer').style.display = 'block';
    }
}

// 处理选项点击
async function handleOptionClick(optionElement, word) {
    const isCorrect = optionElement.dataset.correct === 'true';
    const feedbackElement = document.getElementById('feedback');
    const optionButtons = document.querySelectorAll('.option-button');
    
    // 禁用所有选项按钮，防止重复点击
    optionButtons.forEach(button => {
        button.disabled = true;
    });
    
    // 标记所有按钮，显示正确和错误的选项
    optionButtons.forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        } else if (button === optionElement && !isCorrect) {
            button.classList.add('incorrect');
        }
    });
    
    // 1. 首先确保反馈信息显示
    feedbackElement.textContent = isCorrect 
        ? '恭喜！你选择了正确的翻译。' 
        : `很遗憾，正确的翻译是: ${word.englishTranslation}`;
    feedbackElement.className = `feedback ${isCorrect ? 'success' : 'error'}`;
    feedbackElement.style.display = 'block';
    
    try {
        // 更新答题统计信息
        const updatedWord = await updateWordQuizStats(word.id, !isCorrect);
        console.log('Quiz stats updated for word:', word.id);
        
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
    
    // 2. 确保反馈已显示后，再设置定时器显示详情
    setTimeout(() => {
        // 再次确认反馈已显示（防御性编程）
        if (feedbackElement.style.display === 'block') {
            document.getElementById('wordInfoContainer').style.display = 'block';
        } else {
            // 如果反馈未显示，先显示反馈再显示详情
            feedbackElement.style.display = 'block';
            document.getElementById('wordInfoContainer').style.display = 'block';
        }
    }, 500);
}

// 数组随机排序函数
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
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