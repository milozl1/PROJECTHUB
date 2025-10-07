// Kanban Enhancements: undo/redo, drag reordering, inline title edit
(function(){
    function enhance(){
        const hub = window.projectHub;
        if(!hub){ return setTimeout(enhance, 50); }
        if(hub._kanbanEnhanced) return; // idempotent
        hub._kanbanEnhanced = true;

        // Initialize stacks & ordering
        hub.kanbanUndoStack = [];
        hub.kanbanRedoStack = [];
        hub.kanbanOrder = JSON.parse(localStorage.getItem('kanbanOrder') || '{}');

        // Helpers
        hub.captureKanbanOrder = function(){
            return JSON.parse(JSON.stringify(this.kanbanOrder));
        };
        hub.updateKanbanHistoryButtons = function(){
            const undoBtn = document.getElementById('kanbanUndoBtn');
            const redoBtn = document.getElementById('kanbanRedoBtn');
            if(undoBtn) undoBtn.disabled = this.kanbanUndoStack.length === 0;
            if(redoBtn) redoBtn.disabled = this.kanbanRedoStack.length === 0;
        };
        hub.pushKanbanHistory = function(action){
            this.kanbanUndoStack.push(action);
            this.kanbanRedoStack = [];
            this.updateKanbanHistoryButtons();
        };
        hub.applyKanbanAction = async function(action){
            switch(action.type){
                case 'move': {
                    await this.updateTaskStatus(action.taskId, action.to, { skipHistory:true, skipRender:true, silent:true });
                    if(action.prevOrder) this.kanbanOrder = JSON.parse(JSON.stringify(action.prevOrder));
                    break;
                }
                case 'edit-title': {
                    const t = this.data.tasks.find(t=> t.id === action.taskId);
                    if(!t) break;
                    t.title = action.to;
                    try{
                        if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                            await this.store.updateTask(t.id, { title: t.title });
                        } else if(this.store && typeof this.store.save === 'function'){
                            this.store.save();
                        }
                    }catch(_){ }
                    break;
                }
            }
        };
        hub.applyKanbanInverseAction = async function(action){
            switch(action.type){
                case 'move': {
                    await this.updateTaskStatus(action.taskId, action.from, { skipHistory:true, skipRender:true, silent:true });
                    if(action.prevOrder) this.kanbanOrder = JSON.parse(JSON.stringify(action.prevOrder));
                    break;
                }
                case 'edit-title': {
                    const t = this.data.tasks.find(t=> t.id === action.taskId);
                    if(!t) break;
                    t.title = action.from;
                    try{
                        if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                            await this.store.updateTask(t.id, { title: t.title });
                        } else if(this.store && typeof this.store.save === 'function'){
                            this.store.save();
                        }
                    }catch(_){ }
                    break;
                }
            }
        };
        hub.handleKanbanUndo = function(){
            const action = this.kanbanUndoStack.pop();
            if(!action) return;
            this.kanbanRedoStack.push(action);
            this.applyKanbanInverseAction(action);
            this.updateKanbanBoard();
            this.updateKanbanHistoryButtons();
        };
        hub.handleKanbanRedo = function(){
            const action = this.kanbanRedoStack.pop();
            if(!action) return;
            this.kanbanUndoStack.push(action);
            this.applyKanbanAction(action);
            this.updateKanbanBoard();
            this.updateKanbanHistoryButtons();
        };
        hub.getKanbanDragAfterElement = function(container, y){
            const elements = [...container.querySelectorAll('.kanban-task:not(.dragging)')];
            return elements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height/2;
                if(offset < 0 && offset > closest.offset){
                    return { offset, element: child };
                }
                return closest;
            }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
        };
        hub.persistColumnOrder = function(container){
            const status = container.dataset.status;
            const ids = [...container.querySelectorAll('.kanban-task')].map(el=> el.dataset.taskId);
            this.kanbanOrder[status] = ids;
            localStorage.setItem('kanbanOrder', JSON.stringify(this.kanbanOrder));
        };

        // Override updateTaskStatus to accept opts
        const originalUpdateTaskStatus = hub.updateTaskStatus.bind(hub);
        hub.updateTaskStatus = async function(taskId, newStatus, opts = {}){
            try{
                const task = this.data.tasks.find(t=> t.id === taskId);
                if(!task) return;
                if(task.status === newStatus) return;
                const prevStatus = task.status;
                const prevOrder = this.captureKanbanOrder();
                // Persist change
                task.status = newStatus;
                try{
                    if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                        const progress = (this.computeTaskProgress ? this.computeTaskProgress(task) : (task.progress||0));
                        await this.store.updateTask(taskId, { status: newStatus, progress });
                    } else if(this.store && typeof this.store.save === 'function') {
                        this.store.save();
                    }
                }catch(_){ }
                // History
                if(!opts.skipHistory){
                    this.pushKanbanHistory({ type:'move', taskId, from: prevStatus, to: newStatus, prevOrder });
                }
                // Re-render Kanban and Tasks
                if(!opts.skipRender){
                    if(this.currentPage === 'kanban') this.updateKanbanBoard();
                    try{ this.renderTasks && this.renderTasks(); }catch(_){ }
                }
                // Notification
                if(!opts.silent){
                    const msg = this.t ? this.t('status.updated').replace('{status}', this.translateStatus(newStatus)) : `Status task actualizat la ${this.translateStatus(newStatus)}`;
                    this.showNotification(msg, 'success');
                }
                // Keep aggregates in sync
                try{ this.recalculateAllProjectProgresses && this.recalculateAllProjectProgresses(); }catch(_){ }
            }catch(_){
                // Fallback to original if something goes wrong
                try{ originalUpdateTaskStatus(taskId, newStatus); }catch(__){}
            }
        };

        // Override updateKanbanBoard with ordering + inline edit
        const originalUpdateKanbanBoard = hub.updateKanbanBoard.bind(hub);
        hub.updateKanbanBoard = function(){
            const selectedProject = document.getElementById('kanbanProjectFilter').value;
            const tasks = selectedProject ? this.data.tasks.filter(t=> t.projectId === selectedProject) : this.data.tasks;
            const statuses = ['Not Started','In Progress','Review','Done'];
            statuses.forEach(status => {
                const container = document.querySelector(`[data-status="${status}"] .tasks-container`);
                if(!container) return;
                const statusTasks = tasks.filter(task => task.status === status);
                const count = document.querySelector(`[data-status="${status}"] .task-count`);
                if(count) count.textContent = statusTasks.length;

                if(!this.kanbanOrder[status]){
                    this.kanbanOrder[status] = statusTasks.map(t=> t.id);
                } else {
                    statusTasks.forEach(t=> { if(!this.kanbanOrder[status].includes(t.id)) this.kanbanOrder[status].push(t.id); });
                    this.kanbanOrder[status] = this.kanbanOrder[status].filter(id => statusTasks.some(t=> t.id === id));
                }
                localStorage.setItem('kanbanOrder', JSON.stringify(this.kanbanOrder));

                const orderedTasks = this.kanbanOrder[status].map(id => statusTasks.find(t=> t.id === id)).filter(Boolean);
                container.innerHTML = orderedTasks.map(task => {
                    const assignee = this.data.users.find(u => u.id === task.assignedTo);
                    const completedSub = (task.subtasks || []).filter(st => st.completed).length;
                    const totalSub = (task.subtasks || []).length;
                    const priorityClass = (task.priority || '').toLowerCase();
                    const assigneeHtml = assignee ? (this._avatarHtml ? this._avatarHtml(assignee.avatar,20,assignee.name,'assignee-avatar') : `<img src="${assignee.avatar}" alt="${assignee.name}" class="assignee-avatar">`) : '';
                    return `
                            <div class="kanban-task" data-task-id="${task.id}" draggable="true">
                                <div class="kanban-task-title" data-editable="title" tabindex="0">${task.title}</div>
                                <div class="kanban-task-meta">
                                    <span class="priority-badge priority-${priorityClass}">${this.translatePriority(task.priority)}</span>
                                    ${assigneeHtml}
                                    ${totalSub ? `<span class="subtask-progress-badge">${completedSub}/${totalSub}</span>` : ''}
                                </div>
                            </div>`;
                }).join('');
            });

            // Inline editing attach
            document.querySelectorAll('.kanban-task-title[data-editable="title"]').forEach(el => {
                el.addEventListener('dblclick', () => this.activateInlineEdit(el));
                el.addEventListener('keydown', (e) => {
                    if(e.key === 'Enter'){ e.preventDefault(); this.commitInlineEdit(el); }
                    else if(e.key === 'Escape'){ this.cancelInlineEdit(el); }
                });
            });
            this.updateKanbanHistoryButtons();
        };

        // Override drag & drop
        hub.setupDragAndDrop = function(){
            document.addEventListener('dragstart', (e) => {
                const el = e.target.closest('.kanban-task');
                if (el) {
                    el.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', el.dataset.taskId);
                }
            });
            document.addEventListener('dragend', (e) => {
                const el = e.target.closest('.kanban-task');
                if (el) el.classList.remove('dragging');
            });
            document.addEventListener('dragover', (e) => {
                const container = e.target.closest('.tasks-container');
                if (container) {
                    e.preventDefault();
                    const afterElement = hub.getKanbanDragAfterElement(container, e.clientY);
                    const dragging = document.querySelector('.kanban-task.dragging');
                    if (dragging) {
                        if (afterElement == null) container.appendChild(dragging);
                        else container.insertBefore(dragging, afterElement);
                    }
                }
            });
            document.addEventListener('drop', async (e) => {
                const zone = e.target.closest('.tasks-container');
                if (!zone) return;
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                if (!taskId) return;
                const newStatus = zone.dataset.status;
                const task = hub.data.tasks.find(t=> t.id === taskId);
                const prevStatus = task ? task.status : null;
                const prevOrder = hub.captureKanbanOrder();
                await hub.updateTaskStatus(taskId, newStatus, { skipRender:true, skipHistory:true, silent:true });
                hub.persistColumnOrder(zone);
                hub.pushKanbanHistory({ type:'move', taskId, from: prevStatus, to: newStatus, prevOrder });
                hub.updateKanbanBoard();
                const msg = hub.t ? hub.t('status.updated').replace('{status}', hub.translateStatus(newStatus)) : `Status task actualizat la ${hub.translateStatus(newStatus)}`;
                hub.showNotification(msg, 'success');
            });
        };

        // Inline edit helpers
        hub.activateInlineEdit = function(el){
            if(el.dataset.editing) return;
            el.dataset.originalText = el.textContent.trim();
            el.dataset.editing = 'true';
            el.contentEditable = 'true';
            el.classList.add('editing');
            el.focus();
            document.execCommand('selectAll', false, null);
            const blurHandler = () => { hub.commitInlineEdit(el); };
            el.addEventListener('blur', blurHandler, { once:true });
        };
        hub.commitInlineEdit = async function(el){
            if(!el.dataset.editing) return;
            el.contentEditable = 'false';
            el.classList.remove('editing');
            const newTitle = el.textContent.trim();
            const taskId = el.closest('.kanban-task').dataset.taskId;
            const task = hub.data.tasks.find(t=> t.id === taskId);
            if(task && newTitle && newTitle !== task.title){
                const prevTitle = task.title;
                task.title = newTitle;
                try{
                    if(hub._usingSupabase && hub.store && typeof hub.store.updateTask === 'function'){
                        await hub.store.updateTask(task.id, { title: task.title });
                    } else if(hub.store && typeof hub.store.save === 'function'){
                        hub.store.save();
                    }
                }catch(_){ }
                hub.pushKanbanHistory({ type:'edit-title', taskId, from: prevTitle, to: newTitle });
                const tmsg = hub.t ? hub.t('task.titleUpdated') : 'Titlu task actualizat';
                hub.showNotification(tmsg, 'success');
            } else if(task && !newTitle){
                el.textContent = task.title; // revert dacă gol
            }
            delete el.dataset.editing;
        };
        hub.cancelInlineEdit = function(el){
            if(!el.dataset.editing) return;
            el.textContent = el.dataset.originalText || '';
            el.contentEditable = 'false';
            el.classList.remove('editing');
            delete el.dataset.editing;
        };

        // Bind undo/redo buttons if present
        const undoBtn = document.getElementById('kanbanUndoBtn');
        const redoBtn = document.getElementById('kanbanRedoBtn');
        undoBtn && undoBtn.addEventListener('click', () => hub.handleKanbanUndo());
        redoBtn && redoBtn.addEventListener('click', () => hub.handleKanbanRedo());

    // Note: do not re-init drag listeners here to avoid duplicating document-level handlers
    // The base app has already attached drag/drop listeners; enhancements reuse those.
        hub.updateKanbanHistoryButtons();
    }
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', enhance);
    } else {
        enhance();
    }
})();
