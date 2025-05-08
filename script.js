class Task {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.completed = false;
        this.createdAt = new Date();
        this.completedAt = null;
    }

    toggleComplete() {
        this.completed = !this.completed;
        this.completedAt = this.completed ? new Date() : null;
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.loadTasks();
    }

    addTask(title) {
        const id = Date.now().toString();
        const task = new Task(id, title);
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    updateTask(id, title) {
        const task = this.getTask(id);
        if (task) {
            task.title = title;
            this.saveTasks();
        }
    }

    toggleComplete(id) {
        const task = this.getTask(id);
        if (task) {
            task.toggleComplete();
            this.saveTasks();
        }
    }

    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        try {
            const tasksJSON = localStorage.getItem('tasks');
            if (tasksJSON) {
                this.tasks = JSON.parse(tasksJSON);
                
                this.tasks.forEach(task => {
                    task.createdAt = new Date(task.createdAt);
                    task.completedAt = task.completedAt ? new Date(task.completedAt) : null;
                });
            }
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            this.tasks = [];
        }
    }
}

class UI {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.pendingTasksList = document.getElementById('pendingTasks');
        this.completedTasksList = document.getElementById('completedTasks');
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.pendingCount = document.getElementById('pendingCount');
        this.completedCount = document.getElementById('completedCount');
        
        this.init();
    }

    init() {
        this.addTaskBtn.addEventListener('click', this.handleAddTask.bind(this));
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTask();
            }
        });

        this.renderTasks();
    }

    handleAddTask() {
        const title = this.taskInput.value.trim();
        if (title) {
            const task = this.taskManager.addTask(title);
            this.renderTask(task, this.pendingTasksList);
            this.taskInput.value = '';
            this.updateTaskCount();
            this.checkEmptyLists();
        }
    }

    handleDeleteTask(id) {
        this.taskManager.deleteTask(id);
        const taskElement = document.getElementById(`task-${id}`);
        if (taskElement) {
            taskElement.remove();
            this.updateTaskCount();
            this.checkEmptyLists();
        }
    }

    handleToggleComplete(id) {
        const task = this.taskManager.getTask(id);
        if (task) {
            this.taskManager.toggleComplete(id);
            
            const taskElement = document.getElementById(`task-${id}`);
            if (taskElement) {
                taskElement.remove();
                
                if (task.completed) {
                    this.renderTask(task, this.completedTasksList);
                } else {
                    this.renderTask(task, this.pendingTasksList);
                }
                
                this.updateTaskCount();
                this.checkEmptyLists();
            }
        }
    }

    handleEditTask(id) {
        const taskElement = document.getElementById(`task-${id}`);
        if (taskElement) {
            const editForm = taskElement.querySelector('.edit-form');
            editForm.classList.toggle('active');
            
            if (editForm.classList.contains('active')) {
                const task = this.taskManager.getTask(id);
                const editInput = editForm.querySelector('.edit-input');
                editInput.value = task.title;
                editInput.focus();
            }
        }
    }

    handleUpdateTask(id) {
        const taskElement = document.getElementById(`task-${id}`);
        if (taskElement) {
            const editForm = taskElement.querySelector('.edit-form');
            const editInput = editForm.querySelector('.edit-input');
            const newTitle = editInput.value.trim();
            
            if (newTitle) {
                this.taskManager.updateTask(id, newTitle);
                const titleElement = taskElement.querySelector('.task-title');
                titleElement.textContent = newTitle;
                editForm.classList.remove('active');
            }
        }
    }

    handleCancelEdit(id) {
        const taskElement = document.getElementById(`task-${id}`);
        if (taskElement) {
            const editForm = taskElement.querySelector('.edit-form');
            editForm.classList.remove('active');
        }
    }

    formatDate(date) {
        if (!date) return '';
        
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Date(date).toLocaleDateString('en-US', options);
    }

    renderTask(task, listElement) {
        const noTasksMessage = listElement.querySelector('.no-tasks');
        if (noTasksMessage) {
            noTasksMessage.remove();
        }

        const taskElement = document.createElement('li');
        taskElement.id = `task-${task.id}`;
        taskElement.className = `task-item new-task ${task.completed ? 'completed-task' : ''}`;
        
        const dateInfo = task.completed ? 
            `Created: ${this.formatDate(task.createdAt)}<br>Completed: ${this.formatDate(task.completedAt)}` :
            `Created: ${this.formatDate(task.createdAt)}`;
        
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    ${!task.completed ? `
                        <button class="task-btn task-btn-complete" title="Mark as complete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                            </svg>
                        </button>
                        <button class="task-btn task-btn-edit" title="Edit task">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                        </button>
                    ` : `
                        <button class="task-btn task-btn-complete" title="Mark as incomplete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                            </svg>
                        </button>
                    `}
                    <button class="task-btn task-btn-delete" title="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="task-info">
                <div class="task-date">
                    <span class="date-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                    </span>
                    <span>${dateInfo}</span>
                </div>
            </div>
            <div class="edit-form">
                <input type="text" class="form-control edit-input" placeholder="Edit task...">
                <div class="form-row">
                    <button class="btn btn-primary update-btn">Update</button>
                    <button class="btn cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        
        const completeBtn = taskElement.querySelector('.task-btn-complete');
        completeBtn.addEventListener('click', () => this.handleToggleComplete(task.id));
        
        const deleteBtn = taskElement.querySelector('.task-btn-delete');
        deleteBtn.addEventListener('click', () => this.handleDeleteTask(task.id));
        
        if (!task.completed) {
            const editBtn = taskElement.querySelector('.task-btn-edit');
            editBtn.addEventListener('click', () => this.handleEditTask(task.id));
            
            const updateBtn = taskElement.querySelector('.update-btn');
            updateBtn.addEventListener('click', () => this.handleUpdateTask(task.id));
            
            const cancelBtn = taskElement.querySelector('.cancel-btn');
            cancelBtn.addEventListener('click', () => this.handleCancelEdit(task.id));
            
            const editInput = taskElement.querySelector('.edit-input');
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleUpdateTask(task.id);
                }
            });
        }
        
        listElement.appendChild(taskElement);
    }

    renderTasks() {
        this.pendingTasksList.innerHTML = '';
        this.completedTasksList.innerHTML = '';
        
        const pendingTasks = this.taskManager.getPendingTasks();
        const completedTasks = this.taskManager.getCompletedTasks();
        
        if (pendingTasks.length === 0) {
            this.pendingTasksList.innerHTML = '<li class="no-tasks">No pending tasks</li>';
        } else {
            pendingTasks.forEach(task => this.renderTask(task, this.pendingTasksList));
        }
        
        if (completedTasks.length === 0) {
            this.completedTasksList.innerHTML = '<li class="no-tasks">No completed tasks</li>';
        } else {
            completedTasks.forEach(task => this.renderTask(task, this.completedTasksList));
        }
        
        this.updateTaskCount();
    }

    updateTaskCount() {
        const pendingCount = this.taskManager.getPendingTasks().length;
        const completedCount = this.taskManager.getCompletedTasks().length;
        
        this.pendingCount.textContent = pendingCount;
        this.completedCount.textContent = completedCount;
    }

    checkEmptyLists() {
        const pendingTasks = this.taskManager.getPendingTasks();
        if (pendingTasks.length === 0 && !this.pendingTasksList.querySelector('.no-tasks')) {
            this.pendingTasksList.innerHTML = '<li class="no-tasks">No pending tasks</li>';
        }
        
        const completedTasks = this.taskManager.getCompletedTasks();
        if (completedTasks.length === 0 && !this.completedTasksList.querySelector('.no-tasks')) {
            this.completedTasksList.innerHTML = '<li class="no-tasks">No completed tasks</li>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
    const ui = new UI(taskManager);
});