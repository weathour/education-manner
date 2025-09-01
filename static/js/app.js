
// 全局状态管理
let appState = {
    currentStudent: null,
    currentSubject: null,
    currentTask: null,
    students: [],
    subjects: [],
    isLoading: false,
    loadError: null
};

// API调用封装
class ApiClient {
    static async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return await response.json();
    }

    // 学生相关API
    static async getStudents() {
        return await this.request('/api/students');
    }

    static async getStudent(studentId) {
        return await this.request(`/api/students/${studentId}`);
    }

    static async addStudent(studentData) {
        return await this.request('/api/students', {
            method: 'POST',
            body: JSON.stringify(studentData),
        });
    }

    static async updateStudent(studentId, studentData) {
        return await this.request(`/api/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(studentData),
        });
    }

    static async deleteStudent(studentId) {
        return await this.request(`/api/students/${studentId}`, {
            method: 'DELETE',
        });
    }

    // 科目相关API
    static async getSubjects() {
        return await this.request('/api/subjects');
    }

    static async getSubject(subjectId) {
        return await this.request(`/api/subjects/${subjectId}`);
    }

    static async addSubject(subjectData) {
        return await this.request('/api/subjects', {
            method: 'POST',
            body: JSON.stringify(subjectData),
        });
    }

    static async updateSubject(subjectId, subjectData) {
        return await this.request(`/api/subjects/${subjectId}`, {
            method: 'PUT',
            body: JSON.stringify(subjectData),
        });
    }

    static async deleteSubject(subjectId) {
        return await this.request(`/api/subjects/${subjectId}`, {
            method: 'DELETE',
        });
    }

    // 进度相关API
    static async getStudentProgress(studentId) {
        return await this.request(`/api/students/${studentId}/progress`);
    }

    static async saveStudentProgress(studentId, progressData) {
        return await this.request(`/api/students/${studentId}/progress`, {
            method: 'POST',
            body: JSON.stringify(progressData),
        });
    }

    static async getSubjectProgress(studentId, subjectId) {
        return await this.request(`/api/students/${studentId}/subjects/${subjectId}/progress`);
    }

    // 统计API
    static async getOverallStats() {
        return await this.request('/api/stats/overall');
    }

    // 批量操作API
    static async addSubjectToStudents(subjectId, studentIds) {
        return await this.request('/api/batch/add-subject-to-students', {
            method: 'POST',
            body: JSON.stringify({ subjectId, studentIds }),
        });
    }
}

// 初始化应用
async function initApp() {
    try {
        appState.isLoading = true;
        showLoading();

        // 加载数据
        await loadDataFromAPI();
        
        appState.isLoading = false;
        hideLoading();
        
        // 渲染学生列表
        renderStudents();
        
        console.log('✅ 应用初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
        appState.loadError = error.message;
        appState.isLoading = false;
        showError(`数据加载失败: ${error.message}`);
    }
}

// 从API加载数据
async function loadDataFromAPI() {
    try {
        // 并行加载学生和科目数据
        const [students, subjects] = await Promise.all([
            ApiClient.getStudents(),
            ApiClient.getSubjects()
        ]);

        appState.students = students;
        appState.subjects = subjects;

        console.log('数据加载完成:', { 
            students: appState.students.length, 
            subjects: appState.subjects.length 
        });
    } catch (error) {
        console.error('加载数据失败:', error);
        throw error;
    }
}

// 显示加载状态
function showLoading() {
    const existingOverlay = document.getElementById('loading-overlay');
    if (existingOverlay) return;

    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(102, 126, 234, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-size: 1.2em;
    `;
    overlay.innerHTML = '<div>📚 正在加载数据...</div>';
    
    document.body.appendChild(overlay);
}

// 隐藏加载状态
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// 显示错误信息
function showError(message) {
    hideLoading();
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 10000;
        max-width: 500px;
    `;
    
    errorDiv.innerHTML = `
        <div style="color: #c62828; margin-bottom: 15px;">
            <h3>⚠️ 加载错误</h3>
            <p style="margin-top: 10px;">${message}</p>
        </div>
        <button class="btn" onclick="location.reload()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
            重新加载
        </button>
    `;
    
    document.body.appendChild(errorDiv);
}

// 计算学生总进度
function calculateOverallProgress(progressData) {
    let totalTasks = 0;
    let completedTasks = 0;

    Object.keys(progressData.subjects || {}).forEach(subjectId => {
        const subjectData = progressData.subjects[subjectId];
        const subject = appState.subjects.find(s => s.id === subjectId);
        
        if (subject && subject.levels) {
            subject.levels.forEach(level => {
                (level.chapters || []).forEach(chapter => {
                    (chapter.tasks || []).forEach(task => {
                        totalTasks++;
                        const taskProgress = subjectData.tasks?.[task.id];
                        if (taskProgress && taskProgress.status === 'completed') {
                            completedTasks++;
                        }
                    });
                });
            });
        }
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

// 计算学科进度
function calculateSubjectProgress(subjectId, progressData) {
    const subject = appState.subjects.find(s => s.id === subjectId);
    if (!subject || !subject.levels) return { progress: 0, completed: 0, total: 0 };

    let totalTasks = 0;
    let completedTasks = 0;

    subject.levels.forEach(level => {
        (level.chapters || []).forEach(chapter => {
            (chapter.tasks || []).forEach(task => {
                totalTasks++;
                const subjectData = progressData.subjects?.[subjectId];
                const taskProgress = subjectData?.tasks?.[task.id];
                if (taskProgress && taskProgress.status === 'completed') {
                    completedTasks++;
                }
            });
        });
    });

    return {
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        completed: completedTasks,
        total: totalTasks
    };
}

// 渲染学生列表
function renderStudents() {
    const grid = document.getElementById('student-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    // 渲染现有学生
    appState.students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.onclick = () => selectStudent(student.id);
        
        // 获取学生的学科列表
        const studentSubjects = (student.subjects || []).map(subjectId => {
            const subject = appState.subjects.find(s => s.id === subjectId);
            return subject ? subject.icon + subject.name : subjectId;
        }).join(', ');
        
        card.innerHTML = `
            <div class="student-avatar">${student.avatar || '👦'}</div>
            <div class="student-name">${student.name}</div>
            <div class="student-progress">总进度: ${student.overallProgress || 0}%</div>
            <div class="student-subjects-list">学科: ${studentSubjects || '无'}</div>
            <button class="student-edit-btn" onclick="event.stopPropagation(); editStudent('${student.id}')" title="编辑学生">
                ✏️
            </button>
        `;
        
        grid.appendChild(card);
    });

    // 添加新学生按钮
    const addCard = document.createElement('div');
    addCard.className = 'student-card add-student';
    addCard.onclick = () => showAddStudentModal();
    addCard.innerHTML = `
        <div class="student-avatar">➕</div>
        <div class="student-name">添加学生</div>
    `;
    grid.appendChild(addCard);
}

// 🔧 编辑学生功能
async function editStudent(studentId) {
    try {
        const student = appState.students.find(s => s.id === studentId);
        if (!student) return;

        // 填充表单
        document.getElementById('edit-student-id').value = student.id;
        document.getElementById('edit-student-name').value = student.name;
        document.getElementById('edit-student-avatar').value = student.avatar || '👦';
        document.getElementById('edit-student-grade').value = student.grade || '一年级';
        document.getElementById('edit-student-notes').value = student.notes || '';

        // 渲染科目复选框
        renderEditSubjectCheckboxes();
        
        // 设置已选择的科目
        const studentSubjects = student.subjects || [];
        document.querySelectorAll('#edit-student-subjects-checkboxes input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = studentSubjects.includes(checkbox.value);
        });

        showModal('edit-student-modal');
    } catch (error) {
        showMessage(`加载学生信息失败: ${error.message}`, 'error');
    }
}

// 渲染编辑学科选择复选框
function renderEditSubjectCheckboxes() {
    const container = document.getElementById('edit-student-subjects-checkboxes');
    if (!container) return;

    container.innerHTML = '';

    appState.subjects.forEach(subject => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'subject-checkbox';

        checkboxDiv.innerHTML = `
            <input type="checkbox" id="edit_subject_${subject.id}" value="${subject.id}">
            <label for="edit_subject_${subject.id}" class="subject-checkbox-label">
                <span>${subject.icon}</span>
                <span>${subject.name}</span>
            </label>
        `;

        container.appendChild(checkboxDiv);
    });
}

// 显示添加学生模态框
function showAddStudentModal() {
    renderSubjectCheckboxes();
    showModal('add-student-modal');
}

// 渲染学科选择复选框
function renderSubjectCheckboxes() {
    const container = document.getElementById('student-subjects-checkboxes');
    if (!container) return;

    container.innerHTML = '';

    appState.subjects.forEach(subject => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'subject-checkbox';

        checkboxDiv.innerHTML = `
            <input type="checkbox" id="subject_${subject.id}" value="${subject.id}">
            <label for="subject_${subject.id}" class="subject-checkbox-label">
                <span>${subject.icon}</span>
                <span>${subject.name}</span>
            </label>
        `;

        container.appendChild(checkboxDiv);
    });
}

// 选择学生
async function selectStudent(studentId) {
    try {
        showLoading();
        
        const student = appState.students.find(s => s.id === studentId);
        if (!student) return;

        appState.currentStudent = student;
        const progressData = await ApiClient.getStudentProgress(studentId);
        
        // 更新学生信息显示
        document.getElementById('current-student-avatar').textContent = student.avatar || '👦';
        document.getElementById('current-student-name').textContent = student.name;
        
        // 计算总体进度
        const overallProgress = calculateOverallProgress(progressData);
        document.getElementById('overall-progress-text').textContent = `${overallProgress}%`;
        document.getElementById('overall-progress-bar').style.width = `${overallProgress}%`;

        // 渲染学科卡片
        renderSubjects(progressData);

        // 渲染最近活动
        renderRecentActivities(progressData);

        hideLoading();
        showPage('student-dashboard');
    } catch (error) {
        hideLoading();
        showMessage(`加载学生数据失败: ${error.message}`, 'error');
    }
}

// 渲染学科卡片
function renderSubjects(progressData) {
    const grid = document.getElementById('subjects-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    // 只渲染学生拥有的学科
    (appState.currentStudent.subjects || []).forEach(subjectId => {
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const subjectProgress = calculateSubjectProgress(subject.id, progressData);
        
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.style.setProperty('--subject-color', subject.color);
        card.onclick = () => selectSubject(subject.id);
        
        card.innerHTML = `
            <div class="subject-icon">${subject.icon}</div>
            <div class="subject-name">${subject.name}</div>
            <div class="subject-stats">
                <div>${subjectProgress.progress}% 进度</div>
                <div>${subjectProgress.completed}/${subjectProgress.total} 任务</div>
                <div class="progress-bar" style="margin-top: 8px;">
                    <div class="progress-fill" style="width: ${subjectProgress.progress}%"></div>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// 渲染最近活动
function renderRecentActivities(progressData) {
    const container = document.getElementById('recent-activities-list');
    if (!container) return;
    
    container.innerHTML = '';

    const activities = [];

    // 收集所有任务活动
    Object.keys(progressData.subjects || {}).forEach(subjectId => {
        const subjectData = progressData.subjects[subjectId];
        const subject = appState.subjects.find(s => s.id === subjectId);
        
        if (subject && subject.levels) {
            subject.levels.forEach(level => {
                (level.chapters || []).forEach(chapter => {
                    (chapter.tasks || []).forEach(task => {
                        const taskProgress = subjectData.tasks?.[task.id];
                        if (taskProgress) {
                            activities.push({
                                task: task.name,
                                subject: subject.name,
                                status: taskProgress.status,
                                completedAt: taskProgress.completedAt || taskProgress.startedAt,
                                currentStep: taskProgress.currentStep || 0
                            });
                        }
                    });
                });
            });
        }
    });

    // 按时间排序并取前5个
    activities.sort((a, b) => new Date(b.completedAt || '1970-01-01') - new Date(a.completedAt || '1970-01-01'))
              .slice(0, 5)
              .forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const statusIcon = activity.status === 'completed' ? '✅' : 
                         activity.status === 'in_progress' ? '🔄' : '⏳';
        
        const statusText = activity.status === 'completed' ? '已完成' :
                         activity.status === 'in_progress' ? `进行中 (第${activity.currentStep + 1}步)` : '未开始';
        
        item.innerHTML = `
            <span class="activity-status">${statusIcon}</span>
            <div>
                <div>${activity.subject} - ${activity.task}</div>
                <small style="color: #666;">${statusText}</small>
            </div>
        `;
        
        container.appendChild(item);
    });

    if (activities.length === 0) {
        container.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">暂无学习记录</div>';
    }
}

// 选择学科 - 修复版本
async function selectSubject(subjectId) {
    try {
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        appState.currentSubject = subject;
        const progressData = await ApiClient.getStudentProgress(appState.currentStudent.id);

        // 🔧 关键修复：确保科目进度数据存在
        if (!progressData.subjects) {
            progressData.subjects = {};
        }
        
        if (!progressData.subjects[subjectId]) {
            progressData.subjects[subjectId] = {
                currentLevel: 'grade_1',
                totalProgress: 0,
                tasks: {}
            };
            // 自动保存修复后的数据
            await ApiClient.saveStudentProgress(appState.currentStudent.id, progressData);
        }

        // 更新学科头部
        document.getElementById('subject-title').textContent = `${subject.icon} ${subject.name}`;
        document.getElementById('subject-header').style.background = subject.color;

        // 渲染任务列表
        renderTasks(subject, progressData.subjects[subjectId]);

        showPage('subject-tasks');
    } catch (error) {
        showMessage(`加载学科数据失败: ${error.message}`, 'error');
    }
}

// 渲染任务列表 - 修复版本
function renderTasks(subject, subjectProgressData) {
    const container = document.getElementById('chapters-container');
    if (!container) return;
    
    container.innerHTML = '';

    // 🔧 确保subjectProgressData存在并有tasks属性
    if (!subjectProgressData) {
        subjectProgressData = { tasks: {} };
    }
    if (!subjectProgressData.tasks) {
        subjectProgressData.tasks = {};
    }

    if (!subject.levels) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">该学科暂无内容</div>';
        return;
    }

    subject.levels.forEach(level => {
        (level.chapters || []).forEach(chapter => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'chapter';

            // 计算章节进度
            const chapterTasks = (chapter.tasks || []).length;
            const chapterCompleted = (chapter.tasks || []).filter(task => {
                const taskProgress = subjectProgressData.tasks[task.id];
                return taskProgress && taskProgress.status === 'completed';
            }).length;
            const chapterProgress = chapterTasks > 0 ? Math.round((chapterCompleted / chapterTasks) * 100) : 0;

            chapterDiv.innerHTML = `
                <div class="chapter-header">
                    <div class="chapter-title">${chapter.name}</div>
                    <div style="color: #666; font-size: 0.9em;">
                        ${chapter.description} - 进度: ${chapterProgress}%
                    </div>
                    <div class="progress-bar" style="margin-top: 5px;">
                        <div class="progress-fill" style="width: ${chapterProgress}%"></div>
                    </div>
                </div>
            `;

            const taskList = document.createElement('div');
            taskList.className = 'task-list';

            (chapter.tasks || []).forEach(task => {
                const taskProgress = subjectProgressData.tasks[task.id];
                const isLocked = (task.prerequisites || []).some(prereq => {
                    const prereqProgress = subjectProgressData.tasks[prereq];
                    return !prereqProgress || prereqProgress.status !== 'completed';
                });

                const taskItem = document.createElement('div');
                taskItem.className = `task-item ${taskProgress?.status || 'pending'}${isLocked ? ' locked' : ''}`;

                const statusIcon = taskProgress?.status === 'completed' ? '✅' : 
                                 taskProgress?.status === 'in_progress' ? '🔄' : 
                                 isLocked ? '🔒' : '⏳';

                const stars = '⭐'.repeat(task.difficulty || 1);
                const completedSteps = taskProgress?.currentStep || 0;
                const totalSteps = (task.steps || []).length;
                const stepProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                taskItem.innerHTML = `
                    <div class="task-stats">
                        ${stars} 完成度: ${stepProgress}% | 预计用时: ${task.estimatedTime || 30}分钟
                        ${taskProgress?.status === 'in_progress' ? ` | 当前: 第${completedSteps + 1}步` : ''}
                    </div>
                    <div class="task-actions">
                        ${!isLocked ? `
                            <button class="btn" onclick="selectTask('${task.id}')">
                                ${taskProgress?.status === 'completed' ? '查看详情' : taskProgress?.status === 'in_progress' ? '继续学习' : '开始学习'}
                            </button>
                            ${taskProgress && taskProgress.status !== 'pending' ? 
                                '<button class="btn secondary" onclick="resetTaskProgress(\'' + task.id + '\')">重置</button>' : ''
                            }
                        ` : '<span style="color: #666;">需要完成前置任务</span>'}
                    </div>
                `;

                taskList.appendChild(taskItem);
            });

            chapterDiv.appendChild(taskList);
            container.appendChild(chapterDiv);
        });
    });
}

// 选择任务
async function selectTask(taskId) {
    try {
        const subject = appState.currentSubject;
        let targetTask = null;

        // 查找任务
        subject.levels.forEach(level => {
            (level.chapters || []).forEach(chapter => {
                const task = (chapter.tasks || []).find(t => t.id === taskId);
                if (task) targetTask = task;
            });
        });

        if (!targetTask) return;

        appState.currentTask = targetTask;
        const progressData = await ApiClient.getStudentProgress(appState.currentStudent.id);
        const taskProgress = progressData.subjects[appState.currentSubject.id].tasks[taskId] || {
            status: 'pending',
            currentStep: 0,
            stepProgress: []
        };

        // 如果是新任务，初始化进度
        if (!progressData.subjects[appState.currentSubject.id].tasks[taskId]) {
            taskProgress.status = 'in_progress';
            taskProgress.startedAt = new Date().toISOString();
            taskProgress.stepProgress = (targetTask.steps || []).map(() => ({ completed: false }));
            progressData.subjects[appState.currentSubject.id].tasks[taskId] = taskProgress;
            await ApiClient.saveStudentProgress(appState.currentStudent.id, progressData);
        }

        // 更新任务详情页面
        document.getElementById('task-detail-title').textContent = `📋 ${targetTask.name}`;
        document.getElementById('task-estimated-time').textContent = `${targetTask.estimatedTime || 30}分钟`;
        document.getElementById('task-difficulty').textContent = '⭐'.repeat(targetTask.difficulty || 1);

        const currentStep = taskProgress.currentStep || 0;
        const totalSteps = (targetTask.steps || []).length;
        const stepProgress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

        document.getElementById('task-progress-text').textContent = `${stepProgress}%`;
        document.getElementById('task-step-info').textContent = `第${currentStep + 1}步/共${totalSteps}步`;
        document.getElementById('task-progress-bar').style.width = `${stepProgress}%`;
        
        // 设置任务头部颜色
        document.getElementById('task-header-detail').style.background = appState.currentSubject.color;

        // 渲染步骤
        renderTaskSteps(targetTask, taskProgress);

        showPage('task-detail');
    } catch (error) {
        showMessage(`加载任务失败: ${error.message}`, 'error');
    }
}

// 🔧 修改 renderTaskSteps 函数 - 更新步骤标题显示
function renderTaskSteps(task, taskProgress) {
    const container = document.getElementById('steps-container');
    if (!container) return;
    
    container.innerHTML = '';

    (task.steps || []).forEach((step, index) => {
        const stepData = (taskProgress.stepProgress || [])[index] || { completed: false };
        const isCurrent = index === taskProgress.currentStep;
        const isPending = index > taskProgress.currentStep;

        const stepItem = document.createElement('div');
        stepItem.className = `step-item ${stepData.completed ? 'completed' : isCurrent ? 'current' : 'pending'}`;

        const statusIcon = stepData.completed ? '✅' : isCurrent ? '🔄' : '⏳';
        
        // 🔧 修改这里 - 移除固定的步骤类型，直接显示步骤内容
        const stepTitle = `${statusIcon} 第${index + 1}步`;

        stepItem.innerHTML = `
            <div class="step-header">
                <div class="step-title">
                    ${stepTitle}${isCurrent ? ' ← 当前步骤' : ''}
                </div>
            </div>
            <div class="step-description">
                ${step}
                ${stepData.completedAt ? `<br><small style="color: #4CAF50;">完成时间: ${new Date(stepData.completedAt).toLocaleString()}</small>` : ''}
            </div>
            <div class="step-actions">
                ${!isPending ? `
                    ${!stepData.completed ? `
                        <button class="btn" onclick="completeStep(${index})">✅ 标记完成</button>
                        <button class="btn secondary" onclick="skipStep(${index})">⏭️ 跳过</button>
                    ` : `
                        <button class="btn secondary" onclick="uncompleteStep(${index})">↩️ 取消完成</button>
                    `}
                ` : ''}
            </div>
        `;

        container.appendChild(stepItem);
    });
}

// 获取步骤类型文本
function getStepTypeText(index) {

    return `步骤 ${index + 1}`;
}

// 完成步骤
async function completeStep(stepIndex) {
    try {
        const progressData = await ApiClient.getStudentProgress(appState.currentStudent.id);
        const taskProgress = progressData.subjects[appState.currentSubject.id].tasks[appState.currentTask.id];

        if (!taskProgress.stepProgress[stepIndex]) {
            taskProgress.stepProgress[stepIndex] = { completed: false };
        }

        taskProgress.stepProgress[stepIndex].completed = true;
        taskProgress.stepProgress[stepIndex].completedAt = new Date().toISOString();

        // 更新当前步骤
        if (stepIndex === taskProgress.currentStep) {
            taskProgress.currentStep = Math.min(stepIndex + 1, (appState.currentTask.steps || []).length);
        }

        // 检查是否完成所有步骤
        if (taskProgress.stepProgress.every(step => step && step.completed)) {
            taskProgress.status = 'completed';
            taskProgress.completedAt = new Date().toISOString();
            showCompletionMessage();
        }

        await ApiClient.saveStudentProgress(appState.currentStudent.id, progressData);
        renderTaskSteps(appState.currentTask, taskProgress);
        updateTaskProgress(taskProgress);
    } catch (error) {
        showMessage(`保存进度失败: ${error.message}`, 'error');
    }
}

// 取消完成步骤
async function uncompleteStep(stepIndex) {
    try {
        const progressData = await ApiClient.getStudentProgress(appState.currentStudent.id);
        const taskProgress = progressData.subjects[appState.currentSubject.id].tasks[appState.currentTask.id];

        if (taskProgress.stepProgress[stepIndex]) {
            taskProgress.stepProgress[stepIndex].completed = false;
            delete taskProgress.stepProgress[stepIndex].completedAt;
        }

        // 更新任务状态
        taskProgress.status = 'in_progress';
        taskProgress.currentStep = Math.min(stepIndex, taskProgress.currentStep);
        delete taskProgress.completedAt;

        await ApiClient.saveStudentProgress(appState.currentStudent.id, progressData);
        renderTaskSteps(appState.currentTask, taskProgress);
        updateTaskProgress(taskProgress);
    } catch (error) {
        showMessage(`更新进度失败: ${error.message}`, 'error');
    }
}

// 跳过步骤
async function skipStep(stepIndex) {
    try {
        const progressData = await ApiClient.getStudentProgress(appState.currentStudent.id);
        const taskProgress = progressData.subjects[appState.currentSubject.id].tasks[appState.currentTask.id];

        // 标记为完成但添加跳过标记
        if (!taskProgress.stepProgress[stepIndex]) {
            taskProgress.stepProgress[stepIndex] = { completed: false };
        }

        taskProgress.stepProgress[stepIndex].completed = true;
        taskProgress.stepProgress[stepIndex].skipped = true;
        taskProgress.stepProgress[stepIndex].completedAt = new Date().toISOString();

        // 更新当前步骤
        if (stepIndex === taskProgress.currentStep) {
            taskProgress.currentStep = Math.min(stepIndex + 1, (appState.currentTask.steps || []).length);
        }

        await ApiClient.saveStudentProgress(appState.currentStudent.id, progressData);
        renderTaskSteps(appState.currentTask, taskProgress);
        updateTaskProgress(taskProgress);
    } catch (error) {
        showMessage(`跳过步骤失败: ${error.message}`, 'error');
    }
}

// 更新任务进度显示
function updateTaskProgress(taskProgress) {
    const currentStep = taskProgress.currentStep || 0;
    const totalSteps = (appState.currentTask.steps || []).length;
    const stepProgress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

    document.getElementById('task-progress-text').textContent = `${stepProgress}%`;
    document.getElementById('task-step-info').textContent = `第${currentStep + 1}步/共${totalSteps}步`;
    document.getElementById('task-progress-bar').style.width = `${stepProgress}%`;
}

// 重置任务进度
async function resetTaskProgress(taskId) {
    try {
        if (!confirm('确定要重置这个任务吗？所有进度将被清除。')) return;
        
        const progressData = await ApiClient.getStudentProgress(appState.currentStudent.id);
        
        if (progressData.subjects[appState.currentSubject.id].tasks[taskId]) {
            delete progressData.subjects[appState.currentSubject.id].tasks[taskId];
            await ApiClient.saveStudentProgress(appState.currentStudent.id, progressData);
            
            if (appState.currentTask && appState.currentTask.id === taskId) {
                backToSubjectTasks();
            } else {
                selectSubject(appState.currentSubject.id);
            }
            
            showMessage('任务已重置', 'success');
        }
    } catch (error) {
        showMessage(`重置失败: ${error.message}`, 'error');
    }
}

// 重置任务
async function resetTask() {
    if (appState.currentTask) {
        await resetTaskProgress(appState.currentTask.id);
    }
}

// 保存进度
async function saveProgress() {
    try {
        showMessage('进度已自动保存！', 'success');
    } catch (error) {
        showMessage(`保存失败: ${error.message}`, 'error');
    }
}

// 显示完成消息
function showCompletionMessage() {
    showMessage(`🎉 恭喜完成任务：${appState.currentTask.name}！`, 'success');
}

// 🔧 管理面板功能
async function renderAdminPanel() {
    try {
        // 渲染统计信息
        await renderStats();
        
        // 渲染学生管理列表
        renderStudentsAdminList();
        
        // 渲染科目管理列表
        renderSubjectsAdminList();
        
    } catch (error) {
        showMessage(`加载管理面板失败: ${error.message}`, 'error');
    }
}

// 🔧 渲染统计信息
async function renderStats() {
    try {
        const stats = await ApiClient.getOverallStats();
        const container = document.getElementById('stats-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.totalStudents || 0}</div>
                <div class="stat-label">学生总数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalSubjects || 0}</div>
                <div class="stat-label">科目总数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalTasks || 0}</div>
                <div class="stat-label">任务总数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.averageProgress || 0}%</div>
                <div class="stat-label">平均进度</div>
            </div>
        `;
    } catch (error) {
        console.error('加载统计信息失败:', error);
        const container = document.getElementById('stats-grid');
        if (container) {
            container.innerHTML = '<div style="color: #666; text-align: center;">加载统计信息失败</div>';
        }
    }
}

// 🔧 渲染学生管理列表
function renderStudentsAdminList() {
    const container = document.getElementById('students-admin-list');
    if (!container) return;

    container.innerHTML = '';

    appState.students.forEach(student => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';

        const subjectNames = (student.subjects || []).map(subjectId => {
            const subject = appState.subjects.find(s => s.id === subjectId);
            return subject ? subject.name : subjectId;
        }).join(', ');

        item.innerHTML = `
            <div class="admin-list-info">
                <strong>${student.avatar || '👦'} ${student.name}</strong>
                <div style="color: #666; font-size: 0.9em;">
                    年级: ${student.grade || '未设置'} | 学科: ${subjectNames || '无'}
                </div>
                <div style="color: #666; font-size: 0.9em;">
                    进度: ${student.overallProgress || 0}% | 创建时间: ${student.createdAt || '未知'}
                </div>
            </div>
            <div class="admin-list-actions">
                <button class="btn secondary" onclick="editStudent('${student.id}')">编辑</button>
                <button class="btn danger" onclick="deleteStudent('${student.id}')">删除</button>
            </div>
        `;

        container.appendChild(item);
    });
}

// 🔧 渲染科目管理列表
function renderSubjectsAdminList() {
    const container = document.getElementById('subjects-admin-list');
    if (!container) return;

    container.innerHTML = '';

    appState.subjects.forEach(subject => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';

        const taskCount = countSubjectTasks(subject);

        item.innerHTML = `
            <div class="admin-list-info">
                <strong>${subject.icon || '📚'} ${subject.name}</strong>
                <div style="color: #666; font-size: 0.9em;">
                    ID: ${subject.id} | 任务数: ${taskCount}
                </div>
                <div style="color: #666; font-size: 0.9em;">
                    ${subject.description || '无描述'}
                </div>
            </div>
            <div class="admin-list-actions">
                <button class="btn secondary" onclick="manageSubjectTasks('${subject.id}')">管理任务</button>
                <button class="btn danger" onclick="deleteSubject('${subject.id}')">删除</button>
            </div>
        `;

        container.appendChild(item);
    });
}

// 计算科目任务数
function countSubjectTasks(subject) {
    let count = 0;
    if (subject.levels) {
        subject.levels.forEach(level => {
            (level.chapters || []).forEach(chapter => {
                count += (chapter.tasks || []).length;
            });
        });
    }
    return count;
}

// 🔧 管理科目任务
async function manageSubjectTasks(subjectId) {
    try {
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        document.getElementById('manage-subject-id').value = subject.id;
        document.getElementById('manage-subject-name').textContent = `${subject.icon} ${subject.name}`;
        document.getElementById('manage-subject-description').textContent = subject.description || '暂无描述';

        renderTaskManagement(subject);
        showModal('manage-subject-tasks-modal');
    } catch (error) {
        showMessage(`加载科目任务管理失败: ${error.message}`, 'error');
    }
}

// 🔧 章节排序功能（简单实现）
function reorderChapters(subjectId) {
    showMessage('章节排序功能: 拖拽功能开发中，当前可通过编辑章节来调整顺序', 'info');
}


// 🔧 在任务管理界面中也移除固定步骤类型的提示
function renderTaskManagement(subject) {
    const container = document.getElementById('task-management');
    if (!container) return;

    container.innerHTML = '';

    if (!subject.levels || subject.levels.length === 0) {
        container.innerHTML = `
            <div style="color: #666; text-align: center; padding: 40px;">
                <h4>该科目暂无内容</h4>
                <p style="margin: 15px 0;">请先创建默认结构，然后添加章节和任务</p>
                <div>
                    <button class="btn" onclick="addDefaultContent('${subject.id}')">🏗️ 创建默认结构</button>
                </div>
            </div>
        `;
        return;
    }

    // 添加操作按钮区域
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'margin-bottom: 20px; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;';
    controlsDiv.innerHTML = `
        <button class="btn" onclick="addNewChapter()" style="margin-right: 10px;">📖 添加新章节</button>
        <button class="btn secondary" onclick="reorderChapters('${subject.id}')">🔄 章节排序</button>
        <div style="margin-top: 10px; color: #666; font-size: 0.9em;">
            💡 提示：任务步骤完全自定义，不再限制固定的学习模式
        </div>
    `;
    container.appendChild(controlsDiv);

    subject.levels.forEach(level => {
        const levelDiv = document.createElement('div');
        levelDiv.style.cssText = 'margin-bottom: 30px; border: 2px solid #e9ecef; border-radius: 12px; overflow: hidden;';
        
        levelDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
                <h4 style="margin: 0; color: #333;">📚 ${level.name}</h4>
            </div>
        `;
        
        const chaptersContainer = document.createElement('div');
        chaptersContainer.style.padding = '15px';
        
        if (!level.chapters || level.chapters.length === 0) {
            chaptersContainer.innerHTML = `
                <div style="color: #666; text-align: center; padding: 20px;">
                    该级别暂无章节
                    <div style="margin-top: 10px;">
                        <button class="btn" onclick="addNewChapter()">添加章节</button>
                    </div>
                </div>
            `;
        } else {
            level.chapters.forEach((chapter, chapterIndex) => {
                const chapterDiv = document.createElement('div');
                chapterDiv.className = 'chapter-management';
                chapterDiv.style.marginBottom = '15px';

                chapterDiv.innerHTML = `
                    <div class="chapter-management-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <div>
                            <strong>📖 ${chapter.name}</strong>
                            <div style="font-size: 0.9em; opacity: 0.9; margin-top: 5px;">
                                ${chapter.description || '暂无描述'} | 任务数: ${(chapter.tasks || []).length}
                            </div>
                        </div>
                        <div>
                            <button class="btn" onclick="editChapter('${chapter.id}')" style="background: rgba(255,255,255,0.2); color: white; margin-right: 8px;">✏️ 编辑</button>
                            <button class="btn" onclick="addNewTask('${chapter.id}')" style="background: rgba(255,255,255,0.9); color: #333;">➕ 添加任务</button>
                        </div>
                    </div>
                    <div class="chapter-management-content" style="background: #fff;">
                        ${(chapter.tasks || []).length === 0 ? 
                            '<div style="color: #666; padding: 20px; text-align: center;">暂无任务<br><button class="btn" onclick="addNewTask(\'' + chapter.id + '\')" style="margin-top: 10px;">添加第一个任务</button></div>' :
                            (chapter.tasks || []).map((task, taskIndex) => `
                                <div class="task-management-item" style="position: relative;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                        <div style="flex: 1;">
                                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                                <strong style="color: #333;">📋 ${task.name}</strong>
                                                <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">
                                                    ${getTaskTypeText(task.type)}
                                                </span>
                                            </div>
                                            <div style="color: #666; font-size: 0.9em; margin: 8px 0; line-height: 1.4;">
                                                <span style="margin-right: 15px;">🎯 难度: ${'⭐'.repeat(task.difficulty || 1)}</span>
                                                <span style="margin-right: 15px;">⏱️ 用时: ${task.estimatedTime || 30}分钟</span>
                                                <span>📝 步骤: ${(task.steps || []).length}个</span>
                                            </div>
                                            <div style="font-size: 0.9em; color: #666; margin: 8px 0;">
                                                🔗 前置任务: ${(task.prerequisites || []).length > 0 ? 
                                                    (task.prerequisites || []).join(', ') : 
                                                    '<span style="color: #999;">无</span>'
                                                }
                                            </div>
                                            <div style="font-size: 0.8em; color: #999; margin-top: 8px; font-family: monospace;">
                                                ID: ${task.id}
                                            </div>
                                            ${(task.steps || []).length > 0 ? `
                                                <details style="margin-top: 10px;">
                                                    <summary style="cursor: pointer; color: #667eea; font-size: 0.9em;">📋 查看学习步骤</summary>
                                                    <div style="margin-top: 8px; padding-left: 15px; border-left: 3px solid #667eea;">
                                                        ${(task.steps || []).map((step, idx) => `
                                                            <div style="margin: 5px 0; font-size: 0.9em; color: #555;">
                                                                <strong>第${idx + 1}步:</strong> ${step}
                                                            </div>
                                                        `).join('')}
                                                    </div>
                                                </details>
                                            ` : ''}
                                        </div>
                                        <div style="display: flex; gap: 8px; margin-left: 15px;">
                                            <button class="btn secondary" style="font-size: 12px; padding: 6px 12px;" onclick="editTask('${task.id}')" title="编辑任务">
                                                ✏️ 编辑
                                            </button>
                                            <button class="btn secondary" style="font-size: 12px; padding: 6px 12px;" onclick="duplicateTask('${chapter.id}', '${task.id}')" title="复制任务">
                                                📋 复制
                                            </button>
                                            <button class="btn danger" style="font-size: 12px; padding: 6px 12px;" onclick="deleteTask('${chapter.id}', '${task.id}')" title="删除任务">
                                                🗑️ 删除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                `;

                chaptersContainer.appendChild(chapterDiv);
            });
        }
        
        levelDiv.appendChild(chaptersContainer);
        container.appendChild(levelDiv);
    });
}

// 🔧 删除学生
async function deleteStudent(studentId) {
    try {
        const student = appState.students.find(s => s.id === studentId);
        if (!student) return;

        if (!confirm(`确定要删除学生 "${student.name}" 吗？此操作不可恢复。`)) return;

        await ApiClient.deleteStudent(studentId);
        
        // 重新加载数据
        appState.students = await ApiClient.getStudents();
        renderStudents();
        renderStudentsAdminList();
        
        showMessage(`学生 "${student.name}" 已删除`, 'success');
    } catch (error) {
        showMessage(`删除学生失败: ${error.message}`, 'error');
    }
}

// 🔧 删除科目
async function deleteSubject(subjectId) {
    try {
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        if (!confirm(`确定要删除科目 "${subject.name}" 吗？此操作不可恢复。`)) return;

        await ApiClient.deleteSubject(subjectId);
        
        // 重新加载数据
        appState.subjects = await ApiClient.getSubjects();
        renderSubjectsAdminList();
        
        showMessage(`科目 "${subject.name}" 已删除`, 'success');
    } catch (error) {
        showMessage(`删除科目失败: ${error.message}`, 'error');
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10001;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// 表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    // 添加学生表单
    const addStudentForm = document.getElementById('add-student-form');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const name = document.getElementById('student-name').value.trim();
                const avatar = document.getElementById('student-avatar').value.trim();
                const grade = document.getElementById('student-grade').value.trim();
                const notes = document.getElementById('student-notes').value.trim();
                
                // 获取选中的学科
                const selectedSubjects = [];
                document.querySelectorAll('#student-subjects-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
                    selectedSubjects.push(checkbox.value);
                });
                
                if (!name) {
                    showMessage('请填写学生姓名', 'error');
                    return;
                }
                
                if (selectedSubjects.length === 0) {
                    showMessage('请至少选择一个学科', 'error');
                    return;
                }

                const studentData = {
                    id: 'student_' + Date.now(),
                    name,
                    avatar: avatar || '👦',
                    grade: grade || '一年级',
                    notes: notes || '',
                    subjects: selectedSubjects
                };

                // 调用API添加学生
                await ApiClient.addStudent(studentData);
                
                // 重新加载学生列表
                appState.students = await ApiClient.getStudents();
                renderStudents();
                closeModal('add-student-modal');
                
                // 清空表单
                addStudentForm.reset();
                document.getElementById('student-avatar').value = '👦';
                document.getElementById('student-grade').value = '一年级';
                document.querySelectorAll('#student-subjects-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
                
                showMessage(`学生 ${name} 添加成功！`, 'success');
            } catch (error) {
                showMessage(`添加学生失败: ${error.message}`, 'error');
            }
        });
    }

    // 编辑学生表单
    const editStudentForm = document.getElementById('edit-student-form');
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const studentId = document.getElementById('edit-student-id').value;
                const name = document.getElementById('edit-student-name').value.trim();
                const avatar = document.getElementById('edit-student-avatar').value.trim();
                const grade = document.getElementById('edit-student-grade').value.trim();
                const notes = document.getElementById('edit-student-notes').value.trim();
                
                // 获取选中的学科
                const selectedSubjects = [];
                document.querySelectorAll('#edit-student-subjects-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
                    selectedSubjects.push(checkbox.value);
                });
                
                if (!name) {
                    showMessage('请填写学生姓名', 'error');
                    return;
                }
                
                if (selectedSubjects.length === 0) {
                    showMessage('请至少选择一个学科', 'error');
                    return;
                }

                const studentData = {
                    name,
                    avatar: avatar || '👦',
                    grade: grade || '一年级',
                    notes: notes || '',
                    subjects: selectedSubjects
                };

                // 调用API更新学生
                await ApiClient.updateStudent(studentId, studentData);
                
                // 重新加载学生列表
                appState.students = await ApiClient.getStudents();
                renderStudents();
                renderStudentsAdminList();
                closeModal('edit-student-modal');
                
                showMessage(`学生 ${name} 更新成功！`, 'success');
            } catch (error) {
                showMessage(`更新学生失败: ${error.message}`, 'error');
            }
        });
    }

    // 添加科目表单
    const addSubjectForm = document.getElementById('add-subject-form');
    if (addSubjectForm) {
        addSubjectForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const id = document.getElementById('subject-id').value.trim();
                const name = document.getElementById('subject-name').value.trim();
                const icon = document.getElementById('subject-icon').value.trim();
                const color = document.getElementById('subject-color').value;
                const description = document.getElementById('subject-description').value.trim();
                
                if (!id || !name) {
                    showMessage('请填写科目ID和名称', 'error');
                    return;
                }

                const subjectData = {
                    id,
                    name,
                    icon: icon || '📚',
                    color: color || '#666666',
                    description: description || '',
                    levels: [
                        {
                            id: 'grade_1',
                            name: '一年级',
                            chapters: [
                                {
                                    id: 'chapter_1',
                                    name: '基础章节',
                                    description: '基础学习内容',
                                    tasks: []
                                }
                            ]
                        }
                    ]
                };

                // 调用API添加科目
                await ApiClient.addSubject(subjectData);
                
                // 重新加载科目列表
                appState.subjects = await ApiClient.getSubjects();
                renderSubjectsAdminList();
                closeModal('add-subject-modal');
                
                // 清空表单
                addSubjectForm.reset();
                document.getElementById('subject-icon').value = '📚';
                document.getElementById('subject-color').value = '#666666';
                
                showMessage(`科目 ${name} 添加成功！`, 'success');
            } catch (error) {
                showMessage(`添加科目失败: ${error.message}`, 'error');
            }
        });
    }
});

// 页面导航功能
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // 如果是管理面板页面，渲染管理内容
        if (pageId === 'admin-panel') {
            renderAdminPanel();
        }
    }
}

function backToStudentDashboard() {
    if (appState.currentStudent) {
        selectStudent(appState.currentStudent.id);
    } else {
        showPage('students-page');
    }
}

function backToSubjectTasks() {
    if (appState.currentSubject) {
        selectSubject(appState.currentSubject.id);
    } else {
        backToStudentDashboard();
    }
}

// 模态框功能
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// 显示添加科目模态框
function showAddSubjectModal() {
    showModal('add-subject-modal');
}

// 点击模态框背景关闭
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});



// 🔧 添加新章节功能
function addNewChapter() {
    const subjectId = document.getElementById('manage-subject-id').value;
    showAddChapterModal(subjectId);
}


// 🔧 显示添加章节模态框
function showAddChapterModal(subjectId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10003';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>添加新章节</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="add-chapter-form" style="padding: 20px;">
                <input type="hidden" value="${subjectId}">
                <div class="form-group">
                    <label>章节名称</label>
                    <input type="text" id="new-chapter-name" placeholder="例如：数字认知" required>
                </div>
                <div class="form-group">
                    <label>章节描述</label>
                    <textarea id="new-chapter-description" placeholder="例如：学习0-100的数字概念" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>所属级别</label>
                    <select id="new-chapter-level" required>
                        <!-- 选项将动态生成 -->
                    </select>
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn secondary" onclick="this.closest('.modal').remove()">取消</button>
                    <button type="submit" class="btn">创建章节</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 填充级别选项
    const subject = appState.subjects.find(s => s.id === subjectId);
    const levelSelect = modal.querySelector('#new-chapter-level');
    if (subject && subject.levels) {
        subject.levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.id;
            option.textContent = level.name;
            levelSelect.appendChild(option);
        });
    } else {
        levelSelect.innerHTML = '<option value="grade_1">一年级</option>';
    }
    
    // 添加表单提交处理
    const form = modal.querySelector('#add-chapter-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewChapter(subjectId);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 🔧 创建新章节
async function createNewChapter(subjectId) {
    try {
        const chapterName = document.getElementById('new-chapter-name').value.trim();
        const chapterDescription = document.getElementById('new-chapter-description').value.trim();
        const levelId = document.getElementById('new-chapter-level').value;
        
        if (!chapterName) {
            showMessage('请填写章节名称', 'error');
            return;
        }
        
        const chapterData = {
            id: 'chapter_' + Date.now(),
            name: chapterName,
            description: chapterDescription || '',
            tasks: []
        };
        
        // 获取当前科目数据
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) {
            showMessage('科目不存在', 'error');
            return;
        }
        
        // 确保科目有levels结构
        if (!subject.levels) {
            subject.levels = [{
                id: 'grade_1',
                name: '一年级',
                chapters: []
            }];
        }
        
        // 找到对应级别并添加章节
        let levelFound = false;
        subject.levels.forEach(level => {
            if (level.id === levelId) {
                if (!level.chapters) level.chapters = [];
                level.chapters.push(chapterData);
                levelFound = true;
            }
        });
        
        if (!levelFound) {
            showMessage('级别不存在', 'error');
            return;
        }
        
        // 保存更新后的科目数据
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载科目数据
        appState.subjects = await ApiClient.getSubjects();
        const updatedSubject = appState.subjects.find(s => s.id === subjectId);
        
        // 重新渲染任务管理界面
        renderTaskManagement(updatedSubject);
        
        // 关闭模态框
        document.querySelector('.modal[style*="10003"]').remove();
        
        showMessage(`章节 "${chapterName}" 添加成功！`, 'success');
        
    } catch (error) {
        showMessage(`添加章节失败: ${error.message}`, 'error');
    }
}



// 🔧 添加新任务功能
function addNewTask(chapterId) {
    const taskName = prompt('请输入任务名称:');
    
    if (!taskName || !taskName.trim()) {
        showMessage('任务名称不能为空', 'error');
        return;
    }
    
    // 显示任务创建表单
    showAddTaskModal(chapterId, taskName);
}

// 🔧 修改任务创建/编辑模态框中的步骤提示文本
function showAddTaskModal(chapterId, taskName) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10002';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>添加新任务</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="add-task-form" style="padding: 20px;">
                <input type="hidden" value="${chapterId}">
                <div class="form-group">
                    <label>任务名称</label>
                    <input type="text" id="new-task-name" value="${taskName}" required>
                </div>
                <div class="form-group">
                    <label>任务类型</label>
                    <select id="new-task-type" required>
                        <option value="concept">概念学习</option>
                        <option value="skill">技能训练</option>
                        <option value="practice">练习题</option>
                        <option value="test">测试</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>难度等级</label>
                    <select id="new-task-difficulty" required>
                        <option value="1">⭐ 简单</option>
                        <option value="2">⭐⭐ 普通</option>
                        <option value="3">⭐⭐⭐ 困难</option>
                        <option value="4">⭐⭐⭐⭐ 很难</option>
                        <option value="5">⭐⭐⭐⭐⭐ 极难</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>预计用时(分钟)</label>
                    <input type="number" id="new-task-time" value="30" min="5" max="120" required>
                </div>
                <div class="form-group">
                    <label>学习步骤 (每行一个步骤)</label>
                    <textarea id="new-task-steps" rows="4" required placeholder="请输入具体的学习步骤，每行一个步骤，例如：
观看教学视频了解基本概念
阅读教材第1-3页的相关内容
完成练习册第5页的题目
进行在线测试验证掌握情况"></textarea>
                </div>
                <div class="form-group">
                    <label>前置任务ID (用逗号分隔，可选)</label>
                    <input type="text" id="new-task-prerequisites" placeholder="例如: task_001, task_002">
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn secondary" onclick="this.closest('.modal').remove()">取消</button>
                    <button type="submit" class="btn">创建任务</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加表单提交处理
    const form = modal.querySelector('#add-task-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewTask(chapterId);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}





// 🔧 创建新任务
async function createNewTask(chapterId) {
    try {
        const subjectId = document.getElementById('manage-subject-id').value;
        const taskName = document.getElementById('new-task-name').value.trim();
        const taskType = document.getElementById('new-task-type').value;
        const difficulty = parseInt(document.getElementById('new-task-difficulty').value);
        const estimatedTime = parseInt(document.getElementById('new-task-time').value);
        const stepsText = document.getElementById('new-task-steps').value.trim();
        const prerequisitesText = document.getElementById('new-task-prerequisites').value.trim();
        
        if (!taskName || !stepsText) {
            showMessage('请填写任务名称和学习步骤', 'error');
            return;
        }
        
        // 解析步骤
        const steps = stepsText.split('\n').filter(step => step.trim()).map(step => step.trim());
        
        // 解析前置任务
        const prerequisites = prerequisitesText 
            ? prerequisitesText.split(',').map(p => p.trim()).filter(p => p)
            : [];
        
        const taskData = {
            id: 'task_' + Date.now(),
            name: taskName,
            type: taskType,
            steps: steps,
            estimatedTime: estimatedTime,
            difficulty: difficulty,
            prerequisites: prerequisites
        };
        
        // 获取当前科目数据
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) {
            showMessage('科目不存在', 'error');
            return;
        }
        
        // 找到对应章节并添加任务
        let taskAdded = false;
        subject.levels.forEach(level => {
            level.chapters.forEach(chapter => {
                if (chapter.id === chapterId) {
                    if (!chapter.tasks) chapter.tasks = [];
                    chapter.tasks.push(taskData);
                    taskAdded = true;
                }
            });
        });
        
        if (!taskAdded) {
            showMessage('章节不存在', 'error');
            return;
        }
        
        // 保存更新后的科目数据
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载科目数据
        appState.subjects = await ApiClient.getSubjects();
        
        // 重新渲染任务管理界面
        renderTaskManagement(subject);
        
        // 关闭模态框
        document.querySelector('.modal[style*="10002"]').remove();
        
        showMessage(`任务 "${taskName}" 添加成功！`, 'success');
        
    } catch (error) {
        showMessage(`添加任务失败: ${error.message}`, 'error');
    }
}

// 🔧 增强的任务管理界面渲染
function renderTaskManagement(subject) {
    const container = document.getElementById('task-management');
    if (!container) return;

    container.innerHTML = '';

    if (!subject.levels || subject.levels.length === 0) {
        container.innerHTML = `
            <div style="color: #666; text-align: center; padding: 20px;">
                该科目暂无内容
                <div style="margin-top: 10px;">
                    <button class="btn" onclick="addDefaultContent('${subject.id}')">创建默认结构</button>
                </div>
            </div>
        `;
        return;
    }

    subject.levels.forEach(level => {
        (level.chapters || []).forEach(chapter => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'chapter-management';

            chapterDiv.innerHTML = `
                <div class="chapter-management-header">
                    <div>
                        <strong>${chapter.name}</strong>
                        <div style="color: #666; font-size: 0.9em;">${chapter.description || ''}</div>
                    </div>
                    <div>
                        <button class="btn secondary" onclick="editChapter('${chapter.id}')">✏️ 编辑</button>
                        <button class="btn" onclick="addNewTask('${chapter.id}')">➕ 添加任务</button>
                    </div>
                </div>
                <div class="chapter-management-content">
                    ${(chapter.tasks || []).map((task, index) => `
                        <div class="task-management-item">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="flex: 1;">
                                    <strong>${task.name}</strong>
                                    <div style="color: #666; font-size: 0.9em; margin: 5px 0;">
                                        类型: ${getTaskTypeText(task.type)} | 
                                        难度: ${'⭐'.repeat(task.difficulty || 1)} | 
                                        用时: ${task.estimatedTime || 30}分钟 | 
                                        步骤: ${(task.steps || []).length}个
                                    </div>
                                    <div style="font-size: 0.9em; color: #666;">
                                        前置任务: ${(task.prerequisites || []).join(', ') || '无'}
                                    </div>
                                    <div style="font-size: 0.8em; color: #888; margin-top: 5px;">
                                        ID: ${task.id}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 5px;">
                                    <button class="btn secondary" style="font-size: 12px; padding: 5px 10px;" onclick="editTask('${task.id}')">编辑</button>
                                    <button class="btn danger" style="font-size: 12px; padding: 5px 10px;" onclick="deleteTask('${chapter.id}', '${task.id}')">删除</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${(chapter.tasks || []).length === 0 ? '<div style="color: #666; padding: 10px;">暂无任务</div>' : ''}
                </div>
            `;

            container.appendChild(chapterDiv);
        });
    });
}


// 🔧 复制任务功能
async function duplicateTask(chapterId, taskId) {
    try {
        const subjectId = document.getElementById('manage-subject-id').value;
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        // 找到要复制的任务
        let originalTask = null;
        subject.levels.forEach(level => {
            level.chapters.forEach(chapter => {
                if (chapter.id === chapterId) {
                    originalTask = chapter.tasks.find(t => t.id === taskId);
                }
            });
        });
        
        if (!originalTask) {
            showMessage('找不到要复制的任务', 'error');
            return;
        }
        
        // 创建副本
        const duplicatedTask = {
            ...originalTask,
            id: 'task_' + Date.now(),
            name: originalTask.name + ' (副本)'
        };
        
        // 添加到同一章节
        subject.levels.forEach(level => {
            level.chapters.forEach(chapter => {
                if (chapter.id === chapterId) {
                    chapter.tasks.push(duplicatedTask);
                }
            });
        });
        
        // 保存更新
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载数据
        appState.subjects = await ApiClient.getSubjects();
        const updatedSubject = appState.subjects.find(s => s.id === subjectId);
        
        // 重新渲染
        renderTaskManagement(updatedSubject);
        
        showMessage(`任务 "${originalTask.name}" 复制成功！`, 'success');
        
    } catch (error) {
        showMessage(`复制任务失败: ${error.message}`, 'error');
    }
}


// 🔧 获取任务类型文本
function getTaskTypeText(type) {
    const types = {
        'concept': '概念学习',
        'skill': '技能训练', 
        'practice': '练习题',
        'test': '测试'
    };
    return types[type] || type;
}

// 🔧 更新创建默认内容的函数 - 提供更灵活的示例
async function addDefaultContent(subjectId) {
    try {
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        // 添加默认的级别和章节结构，包含一个示例任务
        subject.levels = [
            {
                id: 'grade_1',
                name: '一年级',
                chapters: [
                    {
                        id: 'chapter_001',
                        name: '基础入门',
                        description: '基础学习内容',
                        tasks: [
                            {
                                id: 'task_demo_001',
                                name: '示例任务',
                                type: 'concept',
                                difficulty: 1,
                                estimatedTime: 20,
                                steps: [
                                    '了解基本概念和定义',
                                    '观看相关教学材料',
                                    '完成基础练习',
                                    '自我检测理解程度'
                                ],
                                prerequisites: []
                            }
                        ]
                    }
                ]
            }
        ];
        
        // 保存更新
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载数据
        appState.subjects = await ApiClient.getSubjects();
        const updatedSubject = appState.subjects.find(s => s.id === subjectId);
        
        // 重新渲染
        renderTaskManagement(updatedSubject);
        
        showMessage('默认结构创建成功！包含了一个示例任务，您可以编辑或删除它。', 'success');
        
    } catch (error) {
        showMessage(`创建默认结构失败: ${error.message}`, 'error');
    }
}

// 🔧 编辑章节 - 完整实现
function editChapter(chapterId) {
    const subjectId = document.getElementById('manage-subject-id').value;
    const subject = appState.subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    // 找到要编辑的章节
    let targetChapter = null;
    let targetLevel = null;
    
    subject.levels.forEach(level => {
        level.chapters.forEach(chapter => {
            if (chapter.id === chapterId) {
                targetChapter = chapter;
                targetLevel = level;
            }
        });
    });
    
    if (!targetChapter) {
        showMessage('章节不存在', 'error');
        return;
    }
    
    showEditChapterModal(subjectId, targetChapter, targetLevel.id);
}

// 🔧 显示编辑章节模态框
function showEditChapterModal(subjectId, chapter, currentLevelId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10003';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>编辑章节</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="edit-chapter-form" style="padding: 20px;">
                <input type="hidden" value="${chapter.id}">
                <div class="form-group">
                    <label>章节名称</label>
                    <input type="text" id="edit-chapter-name" value="${chapter.name}" required>
                </div>
                <div class="form-group">
                    <label>章节描述</label>
                    <textarea id="edit-chapter-description" rows="3">${chapter.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>所属级别</label>
                    <select id="edit-chapter-level" required>
                        <!-- 选项将动态生成 -->
                    </select>
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn danger" onclick="deleteChapter('${chapter.id}')" style="float: left;">删除章节</button>
                    <button type="button" class="btn secondary" onclick="this.closest('.modal').remove()">取消</button>
                    <button type="submit" class="btn">保存修改</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 填充级别选项
    const subject = appState.subjects.find(s => s.id === subjectId);
    const levelSelect = modal.querySelector('#edit-chapter-level');
    if (subject && subject.levels) {
        subject.levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.id;
            option.textContent = level.name;
            option.selected = level.id === currentLevelId;
            levelSelect.appendChild(option);
        });
    }
    
    // 添加表单提交处理
    const form = modal.querySelector('#edit-chapter-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateChapter(subjectId, chapter.id);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}


// 🔧 更新章节
async function updateChapter(subjectId, chapterId) {
    try {
        const chapterName = document.getElementById('edit-chapter-name').value.trim();
        const chapterDescription = document.getElementById('edit-chapter-description').value.trim();
        const newLevelId = document.getElementById('edit-chapter-level').value;
        
        if (!chapterName) {
            showMessage('请填写章节名称', 'error');
            return;
        }
        
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        // 找到并更新章节
        let chapterFound = false;
        let currentLevelId = null;
        let chapterData = null;
        
        // 先找到当前章节
        subject.levels.forEach(level => {
            const chapterIndex = level.chapters.findIndex(c => c.id === chapterId);
            if (chapterIndex > -1) {
                chapterData = level.chapters[chapterIndex];
                currentLevelId = level.id;
                chapterFound = true;
                
                // 如果级别改变了，需要移动章节
                if (newLevelId !== currentLevelId) {
                    // 从当前级别移除
                    level.chapters.splice(chapterIndex, 1);
                } else {
                    // 只更新内容
                    chapterData.name = chapterName;
                    chapterData.description = chapterDescription;
                }
            }
        });
        
        if (!chapterFound) {
            showMessage('章节不存在', 'error');
            return;
        }
        
        // 如果级别改变了，添加到新级别
        if (newLevelId !== currentLevelId) {
            chapterData.name = chapterName;
            chapterData.description = chapterDescription;
            
            const targetLevel = subject.levels.find(l => l.id === newLevelId);
            if (targetLevel) {
                if (!targetLevel.chapters) targetLevel.chapters = [];
                targetLevel.chapters.push(chapterData);
            }
        }
        
        // 保存更新
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载数据
        appState.subjects = await ApiClient.getSubjects();
        const updatedSubject = appState.subjects.find(s => s.id === subjectId);
        
        // 重新渲染
        renderTaskManagement(updatedSubject);
        
        // 关闭模态框
        document.querySelector('.modal[style*="10003"]').remove();
        
        showMessage(`章节 "${chapterName}" 更新成功！`, 'success');
        
    } catch (error) {
        showMessage(`更新章节失败: ${error.message}`, 'error');
    }
}

// 🔧 删除章节
async function deleteChapter(chapterId) {
    try {
        if (!confirm('确定要删除这个章节吗？章节下的所有任务也将被删除。')) return;
        
        const subjectId = document.getElementById('manage-subject-id').value;
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        // 找到并删除章节
        let chapterFound = false;
        subject.levels.forEach(level => {
            const chapterIndex = level.chapters.findIndex(c => c.id === chapterId);
            if (chapterIndex > -1) {
                level.chapters.splice(chapterIndex, 1);
                chapterFound = true;
            }
        });
        
        if (!chapterFound) {
            showMessage('章节不存在', 'error');
            return;
        }
        
        // 保存更新
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载数据
        appState.subjects = await ApiClient.getSubjects();
        const updatedSubject = appState.subjects.find(s => s.id === subjectId);
        
        // 重新渲染
        renderTaskManagement(updatedSubject);
        
        // 关闭模态框
        document.querySelector('.modal[style*="10003"]').remove();
        
        showMessage('章节删除成功！', 'success');
        
    } catch (error) {
        showMessage(`删除章节失败: ${error.message}`, 'error');
    }
}










// 🔧 编辑任务 - 完整实现
function editTask(taskId) {
    const subjectId = document.getElementById('manage-subject-id').value;
    const subject = appState.subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    // 找到要编辑的任务
    let targetTask = null;
    let targetChapter = null;
    
    subject.levels.forEach(level => {
        level.chapters.forEach(chapter => {
            const task = chapter.tasks.find(t => t.id === taskId);
            if (task) {
                targetTask = task;
                targetChapter = chapter;
            }
        });
    });
    
    if (!targetTask) {
        showMessage('任务不存在', 'error');
        return;
    }
    
    showEditTaskModal(subjectId, targetTask, targetChapter.id);
}

// 🔧 显示编辑任务模态框
function showEditTaskModal(subjectId, task, chapterId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '10004';
    
    const stepsText = (task.steps || []).join('\n');
    const prerequisitesText = (task.prerequisites || []).join(', ');
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>编辑任务</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="edit-task-form" style="padding: 20px;">
                <input type="hidden" value="${task.id}">
                <input type="hidden" value="${chapterId}">
                <div class="form-group">
                    <label>任务名称</label>
                    <input type="text" id="edit-task-name" value="${task.name}" required>
                </div>
                <div class="form-group">
                    <label>任务类型</label>
                    <select id="edit-task-type" required>
                        <option value="concept" ${task.type === 'concept' ? 'selected' : ''}>概念学习</option>
                        <option value="skill" ${task.type === 'skill' ? 'selected' : ''}>技能训练</option>
                        <option value="practice" ${task.type === 'practice' ? 'selected' : ''}>练习题</option>
                        <option value="test" ${task.type === 'test' ? 'selected' : ''}>测试</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>难度等级</label>
                    <select id="edit-task-difficulty" required>
                        <option value="1" ${task.difficulty === 1 ? 'selected' : ''}>⭐ 简单</option>
                        <option value="2" ${task.difficulty === 2 ? 'selected' : ''}>⭐⭐ 普通</option>
                        <option value="3" ${task.difficulty === 3 ? 'selected' : ''}>⭐⭐⭐ 困难</option>
                        <option value="4" ${task.difficulty === 4 ? 'selected' : ''}>⭐⭐⭐⭐ 很难</option>
                        <option value="5" ${task.difficulty === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ 极难</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>预计用时(分钟)</label>
                    <input type="number" id="edit-task-time" value="${task.estimatedTime || 30}" min="5" max="120" required>
                </div>
                <div class="form-group">
                    <label>学习步骤 (每行一个步骤)</label>
                    <textarea id="edit-task-steps" rows="6" required>${stepsText}</textarea>
                </div>
                <div class="form-group">
                    <label>前置任务ID (用逗号分隔，可选)</label>
                    <input type="text" id="edit-task-prerequisites" value="${prerequisitesText}" placeholder="例如: task_001, task_002">
                </div>
                <div class="form-group">
                    <label>任务ID (只读)</label>
                    <input type="text" value="${task.id}" readonly style="background: #f5f5f5;">
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn danger" onclick="deleteTask('${chapterId}', '${task.id}')" style="float: left;">删除任务</button>
                    <button type="button" class="btn secondary" onclick="this.closest('.modal').remove()">取消</button>
                    <button type="submit" class="btn">保存修改</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加表单提交处理
    const form = modal.querySelector('#edit-task-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateTask(subjectId, task.id, chapterId);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 🔧 更新任务
async function updateTask(subjectId, taskId, chapterId) {
    try {
        const taskName = document.getElementById('edit-task-name').value.trim();
        const taskType = document.getElementById('edit-task-type').value;
        const difficulty = parseInt(document.getElementById('edit-task-difficulty').value);
        const estimatedTime = parseInt(document.getElementById('edit-task-time').value);
        const stepsText = document.getElementById('edit-task-steps').value.trim();
        const prerequisitesText = document.getElementById('edit-task-prerequisites').value.trim();
        
        if (!taskName || !stepsText) {
            showMessage('请填写任务名称和学习步骤', 'error');
            return;
        }
        
        // 解析步骤
        const steps = stepsText.split('\n').filter(step => step.trim()).map(step => step.trim());
        
        // 解析前置任务
        const prerequisites = prerequisitesText 
            ? prerequisitesText.split(',').map(p => p.trim()).filter(p => p)
            : [];
        
        const subject = appState.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        // 找到并更新任务
        let taskFound = false;
        subject.levels.forEach(level => {
            level.chapters.forEach(chapter => {
                const taskIndex = chapter.tasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    chapter.tasks[taskIndex] = {
                        ...chapter.tasks[taskIndex],
                        name: taskName,
                        type: taskType,
                        difficulty: difficulty,
                        estimatedTime: estimatedTime,
                        steps: steps,
                        prerequisites: prerequisites
                    };
                    taskFound = true;
                }
            });
        });
        
        if (!taskFound) {
            showMessage('任务不存在', 'error');
            return;
        }
        
        // 保存更新
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载数据
        appState.subjects = await ApiClient.getSubjects();
        const updatedSubject = appState.subjects.find(s => s.id === subjectId);
        
        // 重新渲染
        renderTaskManagement(updatedSubject);
        
        // 关闭模态框
        document.querySelector('.modal[style*="10004"]').remove();
        
        showMessage(`任务 "${taskName}" 更新成功！`, 'success');
        
    } catch (error) {
        showMessage(`更新任务失败: ${error.message}`, 'error');
    }
}

// 🔧 删除任务
async function deleteTask(chapterId, taskId) {
    try {
        const subjectId = document.getElementById('manage-subject-id').value;
        const subject = appState.subjects.find(s => s.id === subjectId);
        
        if (!subject) return;
        
        // 确认删除
        if (!confirm('确定要删除这个任务吗？')) return;
        
        // 找到并删除任务
        let taskFound = false;
        subject.levels.forEach(level => {
            level.chapters.forEach(chapter => {
                if (chapter.id === chapterId) {
                    const taskIndex = chapter.tasks.findIndex(t => t.id === taskId);
                    if (taskIndex > -1) {
                        chapter.tasks.splice(taskIndex, 1);
                        taskFound = true;
                    }
                }
            });
        });
        
        if (!taskFound) {
            showMessage('任务不存在', 'error');
            return;
        }
        
        // 保存更新
        await ApiClient.updateSubject(subjectId, subject);
        
        // 重新加载数据
        appState.subjects = await ApiClient.getSubjects();
        const updatedSubject = appState.subjects.find(s => s.id === subjectId);
        
        // 重新渲染
        renderTaskManagement(updatedSubject);
        
        showMessage('任务删除成功！', 'success');
        
    } catch (error) {
        showMessage(`删除任务失败: ${error.message}`, 'error');
    }
}




// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);
