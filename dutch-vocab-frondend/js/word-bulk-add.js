import { addWordsBulk } from './api.service.js';

export function setupBulkAddForm(onSuccess) {
    const modal = document.getElementById('bulkAddModal');
    const bulkAddBtn = document.getElementById('bulkAddBtn');
    const closeBtn = modal.querySelector('.close');
    const submitBtn = document.getElementById('submitBulkBtn');
    const textarea = document.getElementById('bulkWordsInput');
    const errorMessage = document.getElementById('bulkErrorMessage');
    const successMessage = document.getElementById('bulkSuccessMessage');

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

            // 解析JSON数据
            const wordsData = JSON.parse(textarea.value);
            
            // 验证数据格式
            if (!Array.isArray(wordsData)) {
                throw new Error('输入数据必须是数组格式');
            }

            // 验证每个单词对象的格式
            wordsData.forEach((word, index) => {
                if (!word.dutchWord || !word.englishTranslation || !word.chineseTranslation) {
                    throw new Error(`第${index + 1}个单词缺少必要字段`);
                }
            });

            // 调用API批量添加单词
            await addWordsBulk(wordsData);
            
            // 显示成功消息
            successMessage.textContent = `成功添加${wordsData.length}个单词！`;
            successMessage.style.display = 'block';
            
            // 清空输入框
            textarea.value = '';
            
            // 刷新单词列表
            if (onSuccess) {
                onSuccess();
            }

            // 3秒后关闭模态框
            setTimeout(() => {
                modal.style.display = 'none';
            }, 3000);

        } catch (error) {
            // 显示错误消息
            errorMessage.textContent = `错误: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });
}