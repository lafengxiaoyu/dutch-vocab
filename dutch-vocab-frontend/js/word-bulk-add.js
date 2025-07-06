import { addWordsBulk } from './api.service.js';

export function setupBulkAddForm(onSuccess) {
    const modal = document.getElementById('bulkAddModal');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const closeBtn = modal.querySelector('.close');
    const submitBtn = document.getElementById('submitBulkBtn');
    const textarea = document.getElementById('bulkWordsInput');
    const errorMessage = document.getElementById('bulkErrorMessage');
    const successMessage = document.getElementById('bulkSuccessMessage');
    
    // 进度条相关元素
    const progressContainer = document.getElementById('bulkProgressContainer');
    const progressBar = document.getElementById('bulkProgressBar');
    const progressText = document.getElementById('bulkProgressText');

    // 打开模态框
    bulkAddBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        textarea.value = '';
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    });

    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 提交表单
    submitBtn.addEventListener('click', async () => {
        try {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            
            // 重置进度条
            progressBar.style.width = '0%';
            progressText.textContent = '0/0';

            // 解析JSON数据
            const wordsData = JSON.parse(textarea.value);
            
            // 验证数据格式
            if (!Array.isArray(wordsData)) {
                throw new Error('输入数据必须是数组格式');
            }

            // 验证每个单词对象的格式
            wordsData.forEach((word, index) => {
                if (!word.dutchWord || !word.englishTranslation) {
                    throw new Error(`第${index + 1}个单词缺少必要字段`);
                }
            });
            
            // 显示进度条
            progressContainer.style.display = 'block';
            
            // 进度更新回调函数
            const updateProgress = (current, total) => {
                const percentage = Math.round((current / total) * 100);
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `${current}/${total}`;
            };

            // 调用API批量添加单词，传入进度回调
            const result = await addWordsBulk(wordsData, updateProgress);
            
            // 显示成功消息和摘要
            const totalWords = wordsData.length;
            const successElement = document.getElementById('bulkSuccessMessage');
            
            // 清空之前的内容
            successElement.innerHTML = '';
            
            // 添加成功消息
            const messageText = document.createElement('p');
            messageText.textContent = `成功添加${totalWords}个单词！`;
            successElement.appendChild(messageText);
            
            // 添加摘要信息
            const summaryMessage = document.createElement('div');
            summaryMessage.className = 'summary-message';
            summaryMessage.innerHTML = `
                <h3>批量添加摘要</h3>
                <p>总共处理: ${totalWords}个单词</p>
                <p>成功存储: ${totalWords}个单词</p>
                <p>添加时间: ${new Date().toLocaleString()}</p>
            `;
            
            // 添加摘要到成功消息元素
            successElement.appendChild(summaryMessage);
            successElement.style.display = 'block';
            
            // 清空输入框
            textarea.value = '';
            
            // 刷新单词列表
            if (onSuccess) {
                onSuccess();
            }

            // 3秒后关闭模态框和隐藏进度条
            setTimeout(() => {
                modal.style.display = 'none';
                progressContainer.style.display = 'none';
            }, 3000);

        } catch (error) {
            // 显示错误消息
            errorMessage.textContent = `错误: ${error.message}`;
            errorMessage.style.display = 'block';
            
            // 隐藏进度条
            progressContainer.style.display = 'none';
        }
    });
}