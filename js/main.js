// 1. 从 config.js 导入配置
import { SUPABASE_URL, SUPABASE_KEY, EVAL_TABLE_NAME } from './config.js';

// 2. 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 初始化筛选按钮
function initFilters() {
    const categories = ['全部', ...new Set(aiToolsData.map(t => t.category))];
    const container = document.getElementById('toolFilterContainer');
    container.innerHTML = categories.map(cat => 
        `<button class="filter-btn ${cat === '全部' ? 'active' : ''}" data-category="${cat === '全部' ? 'all' : cat}">${cat}</button>`
    ).join('');

    // 绑定点击事件
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterTools(this.dataset.category);
        });
    });
}

// 渲染工具卡片
function renderTools(tools) {
    const grid = document.getElementById('toolsGrid');
    if (tools.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-light);">当前分类下暂无工具。</p>';
        return;
    }
    grid.innerHTML = tools.map((tool, index) => `
        <div class="tool-card" onclick="showToolDetails(${index})">
            <div class="card-header">
                <div class="tool-category">${tool.category}</div>
                <div class="tool-name">${tool.name}</div>
            </div>
            <div class="card-body">
                <div class="tool-section">
                    <div class="section-title">核心功能</div>
                    <div class="section-content">${tool.feature}</div>
                </div>
                <div class="tool-section">
                    <div class="section-title">适用场景</div>
                    <div class="section-content">${tool.scene}</div>
                </div>
                <button class="detail-btn">查看详情</button>
            </div>
        </div>
    `).join('');
}

// 筛选工具
function filterTools(category) {
    if (category === 'all') {
        renderTools(aiToolsData);
    } else {
        const filtered = aiToolsData.filter(t => t.category === category);
        renderTools(filtered);
    }
}

// 显示工具详情
function showToolDetails(index) {
    const tool = aiToolsData[index];
    document.getElementById('modalToolName').textContent = tool.name;
    document.getElementById('modalToolCategory').textContent = tool.category;
    document.getElementById('modalBody').innerHTML = `
        <div class="modal-section">
            <div class="modal-section-title">核心功能</div>
            <div class="modal-text">${tool.feature}</div>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">主要适用场景</div>
            <div class="modal-text">${tool.scene}</div>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">具体操作方法</div>
            <div class="modal-text">${tool.operation}</div>
        </div>
        <div class="modal-section">
            <div class="modal-section-title">运用提示（注意事项）</div>
            <div class="modal-text">${tool.note}</div>
        </div>
    `;
    document.getElementById('toolModal').classList.add('show');
}

// 关闭弹窗
function closeModal() {
    document.getElementById('toolModal').classList.remove('show');
}

// 点击弹窗外部关闭
document.getElementById('toolModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// 渲染决策域
function renderDomains() {
    const container = document.getElementById('domainsContainer');
    container.innerHTML = domainsData.map((domain, index) => `
        <div class="domain-card" onclick="showDomainDetail(${index})">
            <div class="domain-card-header">
                <span class="domain-card-title">${domain.id}. ${domain.name}</span>
                <span class="domain-card-icon">${domain.icon}</span>
            </div>
            <div class="domain-card-desc">${domain.desc}</div>
            <div style="margin-top: 10px; font-size: 12px; color: var(--primary-purple);">
                推荐工具：${domain.tools.join('、')}
            </div>
        </div>
    `).join('');
}

// 显示决策域详情
function showDomainDetail(index) {
    const domain = domainsData[index];
    document.getElementById('domainsContainer').style.display = 'none';
    document.getElementById('domainDetail').style.display = 'block';
    document.getElementById('domainDetail').innerHTML = `
        <div class="tool-card">
            <div class="card-header">
                <div class="tool-category">决策域 ${domain.id}</div>
                <div class="tool-name">${domain.icon} ${domain.name}</div>
            </div>
            <div class="card-body">
                <div class="tool-section">
                    <div class="section-title">定义</div>
                    <div class="section-content">${domain.detail.definition}</div>
                </div>
                <div class="tool-section">
                    <div class="section-title">典型应用场景</div>
                    <div class="section-content">
                        ${domain.detail.scenarios.map(s => `• ${s}`).join('<br>')}
                    </div>
                </div>
                <div class="tool-section">
                    <div class="section-title">关键要点</div>
                    <div class="section-content">
                        ${domain.detail.keyPoints.map(p => `• ${p}`).join('<br>')}
                    </div>
                </div>
                <div class="tool-section">
                    <div class="section-title">推荐工具</div>
                    <div class="section-content">${domain.tools.join('、')}</div>
                </div>
                <button onclick="backToDomains()" style="padding: 12px 30px; background: var(--primary-purple); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 10px;">← 返回决策域列表</button>
            </div>
        </div>
    `;
}

function backToDomains() {
    document.getElementById('domainsContainer').style.display = 'block';
    document.getElementById('domainDetail').style.display = 'none';
}

// 切换内容区
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        
        // 🔥 重点修复：如果是诊断页面，确保问卷已正确初始化
        if (sectionId === 'diagnosis') {
            // 使用 setTimeout 确保 DOM 完全渲染后再执行
            setTimeout(() => {
                initQuiz(); 
            }, 50);
        }
    } else {
        console.error("未找到页面ID:", sectionId);
        return;
    }

    // 更新导航标签状态
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        if (tab.getAttribute('onclick').includes(sectionId)) {
            tab.classList.add('active');
        }
    });
}

// 决策诊断问卷逻辑
let quizAnswers = {};

// 初始化第一个问题
function initQuiz() {
    const quizContent = document.getElementById('quizContent');
    
    // 如果找不到元素，直接返回
    if (!quizContent) return;

    // 🔥 重点修复：检查是否已经包含“问题 1”，如果没有则注入
    // 这样避免了因空格或隐藏字符导致的判断失效
    if (!quizContent.innerHTML.includes('问题 1')) {
         quizContent.innerHTML = `
            <div class="quiz-question">
                <p style="font-weight: 600; margin-bottom: 15px; color: var(--primary-purple);">问题 1/3：您目前在教学决策中最常遇到的困难是什么？</p>
                <div class="quiz-options">
                    <label style="display:block; margin-bottom: 10px; cursor:pointer;"><input type="radio" name="q1" value="A" style="margin-right: 10px;"> 不了解学生的真实学习情况和前概念</label>
                    <label style="display:block; margin-bottom: 10px; cursor:pointer;"><input type="radio" name="q1" value="B" style="margin-right: 10px;"> 难以确定合适的教学目标和分层要求</label>
                    <label style="display:block; margin-bottom: 10px; cursor:pointer;"><input type="radio" name="q1" value="C" style="margin-right: 10px;"> 缺乏合适的教学素材和情境资源</label>
                    <label style="display:block; margin-bottom: 10px; cursor:pointer;"><input type="radio" name="q1" value="D" style="margin-right: 10px;"> 不知道选择什么教学方法最有效</label>
                    <label style="display:block; margin-bottom: 10px; cursor:pointer;"><input type="radio" name="q1" value="E" style="margin-right: 10px;"> 课堂上难以实时掌握学生学习状态</label>
                    <label style="display:block; margin-bottom: 10px; cursor:pointer;"><input type="radio" name="q1" value="F" style="margin-right: 10px;"> 评价反馈不够及时和精准</label>
                </div>
            </div>
            <button onclick="nextQuestion(1)" style="margin-top: 20px; padding: 12px 30px; background: var(--primary-purple); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: transform 0.1s;">下一步 →</button>
        `;
    }
}

function nextQuestion(qNum) {
    const selected = document.querySelector(`input[name="q${qNum}"]:checked`);
    if (!selected) {
        alert('请选择一个选项');
        return;
    }
    quizAnswers[`q${qNum}`] = selected.value;

    if (qNum === 1) {
        document.getElementById('quizContent').innerHTML = `
            <div class="quiz-question" style="margin-bottom: 20px;">
                <p style="font-weight: 600; margin-bottom: 15px; color: var(--primary-purple);">问题 2/3：您希望AI在哪个环节提供最大帮助？</p>
                <div class="quiz-options">
                    <label><input type="radio" name="q2" value="data" style="margin-right: 10px;"> 收集和分析学生数据</label>
                    <label><input type="radio" name="q2" value="content" style="margin-right: 10px;"> 生成教学内容和素材</label>
                    <label><input type="radio" name="q2" value="monitor" style="margin-right: 10px;"> 实时监控课堂状态</label>
                    <label><input type="radio" name="q2" value="feedback" style="margin-right: 10px;"> 提供即时评价反馈</label>
                </div>
            </div>
            <button onclick="nextQuestion(2)" style="padding: 12px 30px; background: var(--primary-purple); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">下一步 →</button>
        `;
    } else if (qNum === 2) {
        document.getElementById('quizContent').innerHTML = `
            <div class="quiz-question" style="margin-bottom: 20px;">
                <p style="font-weight: 600; margin-bottom: 15px; color: var(--primary-purple);">问题 3/3：您的技术熟练程度如何？</p>
                <div class="quiz-options">
                    <label><input type="radio" name="q3" value="beginner" style="margin-right: 10px;"> 初学者 - 希望使用简单、易上手的工具</label>
                    <label><input type="radio" name="q3" value="intermediate" style="margin-right: 10px;"> 中级 - 愿意尝试新工具，有一定技术基础</label>
                    <label><input type="radio" name="q3" value="advanced" style="margin-right: 10px;"> 高级 - 追求功能强大，不惧复杂操作</label>
                </div>
            </div>
            <button onclick="showDiagnosisResult()" style="padding: 12px 30px; background: var(--primary-purple); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">查看诊断结果</button>
        `;
    }
}

function showDiagnosisResult() {
    const selected = document.querySelector('input[name="q3"]:checked');
    if (!selected) {
        alert('请选择一个选项');
        return;
    }
    quizAnswers.q3 = selected.value;

    // 根据答案生成推荐
    const domainMap = {
        'A': { name: '学情诊断', tools: ['豆包智能体', '醍摩豆IRS', 'ASR语音识别'], mode: '精准靶向模式' },
        'B': { name: '目标设定', tools: ['大语言模型', '智能备课系统'], mode: '设计增强模式' },
        'C': { name: '内容选择', tools: ['即梦AI', 'Flux', 'Midjourney'], mode: '设计增强模式' },
        'D': { name: '方法匹配', tools: ['教学法知识库', '大语言模型'], mode: '协同教学模式' },
        'E': { name: '过程调控', tools: ['智慧手环', '醍摩豆IRS'], mode: '协同教学模式' },
        'F': { name: '评价反馈', tools: ['ASR语音评测', 'AI作文批改'], mode: '精准靶向模式' }
    };

    const result = domainMap[quizAnswers.q1];
    document.getElementById('diagnosisQuiz').style.display = 'none';
    document.getElementById('diagnosisResult').style.display = 'block';
    document.getElementById('diagnosisResult').innerHTML = `
        <div class="tool-card">
            <div class="card-header" style="background: linear-gradient(135deg, #27ae60, #229954);">
                <div class="tool-category">诊断结果</div>
                <div class="tool-name">您的决策困境与AI辅助方案</div>
            </div>
            <div class="card-body">
                <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-purple); border-radius: 8px;">
                    <p style="font-weight: 600; color: var(--primary-purple); margin-bottom: 10px;">📍 主要决策困境</p>
                    <p>${result.name} - 这是您当前最需要AI辅助的决策域</p>
                </div>
                <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-purple); border-radius: 8px;">
                    <p style="font-weight: 600; color: var(--primary-purple); margin-bottom: 10px;">🎯 推荐融合模式</p>
                    <p>${result.mode}</p>
                </div>
                <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-purple); border-radius: 8px;">
                    <p style="font-weight: 600; color: var(--primary-purple); margin-bottom: 10px;">🛠 推荐工具</p>
                    <p>${result.tools.join('、')}</p>
                </div>
                <div style="margin-bottom: 20px; padding: 15px; background: #FFF8E1; border-radius: 8px; border-left: 4px solid #FFC107;">
                    <p style="font-weight: 600; color: #5D4037; margin-bottom: 10px;">💡 使用建议</p>
                    <p style="color: #5D4037;">建议从"工具速查"模块查看这些工具的详细使用方法，并在"五步融入法"模块了解如何系统地将AI融入您的教学决策。</p>
                </div>
                <button onclick="resetDiagnosis()" style="padding: 12px 30px; background: var(--primary-purple); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">重新诊断</button>
            </div>
        </div>
    `;
}

function resetDiagnosis() {
    quizAnswers = {};
    document.getElementById('diagnosisResult').style.display = 'none';
    document.getElementById('diagnosisQuiz').style.display = 'block';
    initQuiz(); // 重置问卷内容
}

// 保存效果评价
async function saveEval(e) {
    e.preventDefault(); // 阻止表单默认提交刷新页面

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    // 1. 获取表单数据
    const evalDate = document.getElementById('evalDate').value;
    const topic = document.getElementById('evalTopic').value;
    const toolName = document.getElementById('evalTool').value;
    const domainCode = document.getElementById('evalDomain').value;
    
    // 获取单选框的值
    const ratingElement = document.querySelector('input[name="rating"]:checked');
    const rating = ratingElement ? parseInt(ratingElement.value) : 0;

    const description = document.getElementById('evalDesc').value;
    const issues = document.getElementById('evalIssue').value;

    // 简单验证
    if (!topic || !toolName || !domainCode || !rating) {
        alert('请填写完整信息，特别是课题、工具和评分！');
        return;
    }

    // 2. 更改按钮状态为“保存中...”
    submitBtn.disabled = true;
    submitBtn.innerText = '正在上传数据...';

    try {
        // 3. 调用 Supabase 插入数据
        const { data, error } = await supabase
            .from(EVAL_TABLE_NAME)
            .insert([
                {
                    eval_date: evalDate,
                    topic: topic,
                    tool_name: toolName,
                    domain_code: domainCode,
                    rating: rating,
                    description: description,
                    issues: issues
                }
            ]);

        if (error) {
            throw error;
        }

        // 4. 成功处理
        const successMsg = document.getElementById('evalSaved');
        successMsg.style.display = 'block';
        successMsg.innerHTML = '✅ 评价已成功保存至数据库！感谢您的反馈。';
        
        // 重置表单
        document.getElementById('evalForm').reset();
        document.getElementById('evalDate').valueAsDate = new Date();

        // 3秒后隐藏提示
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 4000);

    } catch (err) {
        console.error('保存失败:', err);
        alert('❌ 保存失败：' + err.message + '\n请检查网络连接或联系管理员。');
    } finally {
        // 5. 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    }
}

// 保存决策日记
function saveJournal(e) {
    e.preventDefault();
    document.getElementById('journalSaved').style.display = 'block';
    setTimeout(() => {
        document.getElementById('journalSaved').style.display = 'none';
        document.getElementById('journalForm').reset();
        document.getElementById('journalDate').valueAsDate = new Date();
    }, 3000);
}

// 初始化
window.onload = function() {
    initFilters();
    renderTools(aiToolsData);
    renderDomains();
    initQuiz(); // 初始化问卷
    
    // 设置默认日期
    const today = new Date();
    const evalDateInput = document.getElementById('evalDate');
    const journalDateInput = document.getElementById('journalDate');
    
    if(evalDateInput) evalDateInput.valueAsDate = today;
    if(journalDateInput) journalDateInput.valueAsDate = today;
};

// ==========================================
// 👇 新增这部分代码：将函数暴露给全局 window 对象
// ==========================================
window.showSection = showSection;
window.showToolDetails = showToolDetails;
window.closeModal = closeModal;
window.showDomainDetail = showDomainDetail;
window.backToDomains = backToDomains;
window.nextQuestion = nextQuestion;
window.showDiagnosisResult = showDiagnosisResult;
window.resetDiagnosis = resetDiagnosis;
window.saveEval = saveEval;
window.saveJournal = saveJournal;