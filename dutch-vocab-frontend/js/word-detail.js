import { getWordById, updateWordReviewInfo, deleteWord, updateWord, getNextWord } from './api.service.js';

// 检查浏览器是否支持语音合成
const isSpeechSupported = () => {
    return 'speechSynthesis' in window;
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
    console.log('DOM fully loaded');
    const urlParams = new URLSearchParams(window.location.search);
    const wordId = urlParams.get('id');

    // 添加例句朗读按钮事件
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'speakExampleButton') {
            const sentence = document.getElementById('exampleSentence').textContent;
            if (sentence) {
                speakDutchSentence(sentence);
            }
        }
    });

    // 初始化词性按钮（移到loadWordDetails中统一处理）
    
    if (wordId) {
        loadWordDetails(wordId);
    } else {
        document.getElementById('error').textContent = '未找到单词ID';
        document.getElementById('error').style.display = 'block';
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
    
    // 添加"下一个单词"按钮事件监听
    const nextWordButton = document.getElementById('nextWordButton');
    if (nextWordButton) {
        nextWordButton.addEventListener('click', async () => {
            console.log('Next word button clicked');
            if (wordId) {
                try {
                    document.getElementById('loading').style.display = 'block';
                    document.getElementById('wordDetail').style.display = 'none';
                    
                    // 获取下一个单词
                    const nextWord = await getNextWord(wordId);
                    console.log('Next word:', nextWord);
                    
                    // 跳转到下一个单词的详情页面
                    window.location.href = `word-detail.html?id=${nextWord.id}`;
                } catch (error) {
                    console.error('获取下一个单词失败:', error);
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('error').textContent = error.message;
                    document.getElementById('error').style.display = 'block';
                }
            }
        });
    } else {
        console.error('Next word button not found');
    }
    
    // 添加"标记为已复习"按钮事件监听
    const markReviewedButton = document.getElementById('markReviewedButton');
    if (markReviewedButton) {
        markReviewedButton.addEventListener('click', async () => {
            console.log('Mark as reviewed button clicked');
            if (wordId) {
                try {
                    await updateWordReview(wordId);
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
    
    // 保留单词点击事件监听，用于更新复习信息
    const dutchWordElement = document.getElementById('dutchWord');
    if (dutchWordElement) {
        dutchWordElement.addEventListener('click', async () => {
            console.log('Dutch word clicked, updating review info');
            if (wordId) {
                try {
                    await updateWordReview(wordId);
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

    // 添加编辑按钮事件监听
    const editBtn = document.getElementById('editButton');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log('Edit button clicked');
            switchToEditMode();
        });
    } else {
        console.error('Edit button not found');
    }

    // 添加取消按钮事件监听
    const cancelBtn = document.getElementById('cancelButton');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            console.log('Cancel button clicked');
            switchToViewMode();
        });
    } else {
        console.error('Cancel button not found');
    }

    // 添加表单提交事件监听
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            await saveWordChanges(wordId);
        });
    } else {
        console.error('Edit form not found');
    }
});

async function loadWordDetails(id) {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('wordDetail').style.display = 'none';
        document.getElementById('error').style.display = 'none';

        const word = await getWordById(id);
        console.log('Loaded word details:', word);
        
        // 更新查看模式的显示
        document.getElementById('dutchWord').textContent = word.dutchWord;
        document.getElementById('englishTranslation').textContent = word.englishTranslation;
        document.getElementById('dateAdded').textContent = formatDate(word.dateAdded);
        document.getElementById('lastReviewed').textContent = word.lastReviewed ? formatDate(word.lastReviewed) : '未复习';
        document.getElementById('reviewCount').textContent = word.reviewCount || 0;
        
        // 处理词性显示
        const partOfSpeechContainer = document.getElementById('partOfSpeechContainer');
        const partOfSpeechElement = document.getElementById('partOfSpeech');
        if (word.partsOfSpeech && word.partsOfSpeech.length > 0) {
            partOfSpeechElement.textContent = word.partsOfSpeech.join(', ');
            partOfSpeechContainer.style.display = 'block';
            console.log('Showing parts of speech:', word.partsOfSpeech);
        } else {
            partOfSpeechContainer.style.display = 'none';
            console.log('Hiding parts of speech (empty)');
        }
        
        // 处理名词性别显示
        const nounGenderContainer = document.getElementById('nounGenderContainer');
        const nounGenderElement = document.getElementById('nounGender');
        const isNoun = word.partsOfSpeech && word.partsOfSpeech.includes('NOUN');
        
        if (isNoun && word.gender) {
            nounGenderElement.textContent = word.gender;
            nounGenderContainer.style.display = 'block';
            console.log('Showing noun gender:', word.gender);
        } else {
            nounGenderContainer.style.display = 'none';
            console.log('Hiding noun gender (not applicable or empty)');
        }
        
        // 处理难度显示
        const difficultyContainer = document.getElementById('difficultyContainer');
        const difficultyElement = document.getElementById('difficulty');
        if (word.difficulty && word.difficulty.trim() !== '') {
            difficultyElement.textContent = word.difficulty;
            difficultyContainer.style.display = 'block';
            console.log('Showing difficulty:', word.difficulty);
        } else {
            difficultyContainer.style.display = 'none';
            console.log('Hiding difficulty (empty)');
        }
        
        // 处理例句显示
        const exampleSentenceContainer = document.getElementById('exampleSentenceContainer');
        const exampleSentenceElement = document.getElementById('exampleSentence');
        if (word.exampleSentence && word.exampleSentence.trim() !== '') {
            exampleSentenceElement.textContent = word.exampleSentence;
            exampleSentenceContainer.style.display = 'block';
            console.log('Showing example sentence:', word.exampleSentence);
        } else {
            exampleSentenceContainer.style.display = 'none';
            console.log('Hiding example sentence (empty)');
        }

        // 填充编辑表单
        document.getElementById('editDutchWord').value = word.dutchWord;
        document.getElementById('editEnglishTranslation').value = word.englishTranslation;
        
        // 设置词性按钮
        if (word.partsOfSpeech && word.partsOfSpeech.length > 0) {
            document.querySelectorAll('.pos-btn').forEach(btn => {
                btn.classList.remove('selected', 'current'); // 先清除所有状态
                if (word.partsOfSpeech.includes(btn.dataset.value)) {
                    btn.classList.add('selected', 'current');
                }
            });
            updateSelectedPartsOfSpeech();
        } else {
            // 如果没有词性数据，清除所有选择
            document.querySelectorAll('.pos-btn').forEach(btn => {
                btn.classList.remove('selected', 'current');
            });
            updateSelectedPartsOfSpeech();
        }
        
        // 设置名词性别选择框
        const editNounGenderGroup = document.getElementById('editNounGenderGroup');
        const editNounGender = document.getElementById('editNounGender');
        
        if (editNounGenderGroup && editNounGender) {
            if (word.partsOfSpeech && word.partsOfSpeech.includes('NOUN')) {
                editNounGenderGroup.style.display = 'block';
                editNounGender.value = word.gender || '';
                console.log('Setting noun gender in edit form:', word.gender);
            } else {
                editNounGenderGroup.style.display = 'none';
                editNounGender.value = '';
                console.log('Hiding noun gender in edit form (not a noun)');
            }
        } else {
            console.error('Noun gender form elements not found');
        }

        // 添加词性按钮点击事件（带详细日志）
        const posButtons = document.querySelectorAll('.pos-btn');
        console.log(`Found ${posButtons.length} POS buttons`);
        
        posButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                console.log('POS button clicked:', this.dataset.value);
                const wasSelected = this.classList.contains('selected');
                this.classList.toggle('selected');
                console.log('Selection state:', !wasSelected);
                
                // 添加新选词性的动画效果
                if (!wasSelected) {
                    console.log('Adding new-selected animation');
                    this.classList.add('new-selected');
                    setTimeout(() => {
                        this.classList.remove('new-selected');
                        console.log('Removed new-selected animation');
                    }, 500);
                }
                
                const selectedValues = updateSelectedPartsOfSpeech();
                console.log('Current selected parts of speech:', selectedValues);
                
                // 处理名词性别选择框的显示/隐藏
                const editNounGenderGroup = document.getElementById('editNounGenderGroup');
                if (editNounGenderGroup) {
                    if (selectedValues.includes('NOUN')) {
                        editNounGenderGroup.style.display = 'block';
                        console.log('Showing noun gender selection');
                    } else {
                        editNounGenderGroup.style.display = 'none';
                        console.log('Hiding noun gender selection');
                    }
                }
            });
        });
        
        if (word.difficulty) {
            document.getElementById('editDifficulty').value = word.difficulty;
        }
        
        // 设置示例句子
        document.getElementById('editExampleSentence').value = word.exampleSentence || '';

        document.getElementById('loading').style.display = 'none';
        document.getElementById('wordDetail').style.display = 'block';
    } catch (error) {
        console.error('加载单词详情失败:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').textContent = error.message;
        document.getElementById('error').style.display = 'block';
    }
}

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

// 切换到编辑模式
function switchToEditMode() {
    console.log('Switching to edit mode');
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    if (viewMode && editMode) {
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        console.log('Edit mode displayed');
        
        // 确保词性按钮状态正确
        const currentPartsOfSpeech = document.getElementById('editPartsOfSpeech').value.split(',');
        document.querySelectorAll('.pos-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (currentPartsOfSpeech.includes(btn.dataset.value)) {
                btn.classList.add('selected');
            }
        });
        
        // 确保名词性别选择框正确显示
        const editNounGenderGroup = document.getElementById('editNounGenderGroup');
        if (editNounGenderGroup) {
            editNounGenderGroup.style.display = currentPartsOfSpeech.includes('NOUN') ? 'block' : 'none';
        }
    } else {
        console.error('View mode or edit mode elements not found');
        if (!viewMode) console.error('viewMode element not found');
        if (!editMode) console.error('editMode element not found');
    }
}

// 切换到查看模式
function switchToViewMode() {
    console.log('Switching to view mode');
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    if (viewMode && editMode) {
        editMode.style.display = 'none';
        viewMode.style.display = 'block';
        console.log('View mode displayed');
    } else {
        console.error('View mode or edit mode elements not found');
        if (!viewMode) console.error('viewMode element not found');
        if (!editMode) console.error('editMode element not found');
    }
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

function updateSelectedPartsOfSpeech() {
    const selectedButtons = document.querySelectorAll('.pos-btn.selected');
    const selectedValues = Array.from(selectedButtons).map(btn => btn.dataset.value);
    document.getElementById('editPartsOfSpeech').value = selectedValues.join(',');
    return selectedValues;
}

// 保存单词更改
async function saveWordChanges(wordId) {
    try {
        console.log('Starting to save word changes for ID:', wordId);

        // 获取表单元素
        const editDutchWord = document.getElementById('editDutchWord');
        const editEnglishTranslation = document.getElementById('editEnglishTranslation');
        const editDifficulty = document.getElementById('editDifficulty');
        const editExampleSentence = document.getElementById('editExampleSentence');

        // 验证必要的表单元素存在
        if (!editDutchWord || !editEnglishTranslation || !editDifficulty) {
            throw new Error('必要的表单字段未找到');
        }

        // 验证必要字段不为空
        if (!editDutchWord.value.trim() || !editEnglishTranslation.value.trim()) {
            throw new Error('荷兰语单词和英语翻译不能为空');
        }

        // 获取选中的词性
        const partsOfSpeech = updateSelectedPartsOfSpeech();
        
        // 如果是名词，验证性别字段
        if (partsOfSpeech.includes('NOUN')) {
            const editNounGender = document.getElementById('editNounGender');
            if (!editNounGender || !editNounGender.value) {
                throw new Error('名词必须选择性别 (de 或 het)');
            }
            if (!['DE', 'HET'].includes(editNounGender.value)) {
                throw new Error('性别必须是 de 或 het');
            }
        }
        
        // 获取名词性别（如果适用）
        const editNounGender = document.getElementById('editNounGender');
        let gender = null;
        if (partsOfSpeech.includes('NOUN') && editNounGender && editNounGender.value) {
            gender = editNounGender.value;
            console.log('Saving noun gender:', gender);
        }
        
        // 根据词性决定使用哪个类
        let wordData;
        if (partsOfSpeech.includes('NOUN')) {
            // 如果是名词，使用Noun类
            wordData = {
                '@class': 'Noun', // 使用简化的类型名称
                dutchWord: editDutchWord.value.trim(),
                englishTranslation: editEnglishTranslation.value.trim(),
                partsOfSpeech: partsOfSpeech,
                difficulty: editDifficulty.value,
                exampleSentence: editExampleSentence ? editExampleSentence.value.trim() : '',
                gender: gender // 添加名词性别字段
            };
            console.log('Creating Noun instance with gender:', gender);
        } else {
            // 如果不是名词，使用普通Word类
            wordData = {
                dutchWord: editDutchWord.value.trim(),
                englishTranslation: editEnglishTranslation.value.trim(),
                partsOfSpeech: partsOfSpeech,
                difficulty: editDifficulty.value,
                exampleSentence: editExampleSentence ? editExampleSentence.value.trim() : ''
            };
            console.log('Creating Word instance');
        }

        console.log('Prepared word data:', wordData);

        // 发送更新请求
        console.log('Sending update request...');
        await updateWord(wordId, wordData);
        console.log('Update request successful');

        // 显示成功消息
        alert('单词更新成功！');
        
        // 重新加载单词详情并切换回查看模式
        console.log('Reloading word details...');
        await loadWordDetails(wordId);
        console.log('Word details reloaded');
        
        switchToViewMode();
        console.log('Switched back to view mode');
    } catch (error) {
        console.error('更新单词失败:', error);
        document.getElementById('error').textContent = error.message;
        document.getElementById('error').style.display = 'block';
    }
}