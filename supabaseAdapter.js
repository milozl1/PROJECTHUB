// supabaseAdapter.js - Basic Supabase integration layer (read/write) for ProjectHub
// Note: This is an initial lightweight adapter. You can progressively replace usages of DataStore with SupabaseStore.
// IMPORTANT: For production move the anon key out of source (env or server side). This file is client-side only for a personal tool.

// Use ESM import of supabase-js v2
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIG ---
const SUPABASE_URL = 'https://sbhlyjvmnbvzwgzpyuqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiaGx5anZtbmJ2endnenB5dXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTYyMTEsImV4cCI6MjA3NDg3MjIxMX0.0K-q70KFBg_KldQHpZq8vhnWMSqKFqD9xx7Lnh66RZU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility: map task progress (fallback like in app.js)
function computeTaskProgress(task){
  if(!task) return 0;
  // If task marked Done, force 100% regardless of subtasks
  if(task.status === 'Done') return 100;
  if(Array.isArray(task.subtasks) && task.subtasks.length){
    const done = task.subtasks.filter(s=> s.completed).length;
    return Math.round((done / task.subtasks.length) * 100);
  }
  switch(task.status){
    case 'Review': return 80;
    case 'In Progress': return 40;
    default: return 0;
  }
}

// SupabaseStore tries to mimic a subset of DataStore API surface used by app.js
export const SupabaseStore = {
  _cache: null,
  _isSupabase: true,
  _realtimeBound: false,
  _realtimeAutoDisabled: false,
  _realtimeChannels: [],
  _realtimeDebounceTimer: null,
  _lastRealtimeRefresh: 0,
  _diagnostics: { lastError: null, lastAction: null, realtimeDisabled: false },
  _authFailed: false,
  _auditDisabled: false,
  _ensureBanner(){
    if(document.getElementById('supabaseAuthBanner')) return;
    const b = document.createElement('div');
    b.id = 'supabaseAuthBanner';
    b.style.cssText = 'position:fixed;bottom:8px;right:8px;max-width:380px;font:12px/1.4 system-ui,Arial,sans-serif;background:#b91c1c;color:#fff;padding:10px 12px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.25);z-index:3000;';
    b.innerHTML = '<strong>Supabase 401</strong><br/>Cheia anon poate fi greșită sau lipsesc politicile RLS pentru INSERT/SELECT.<br/><button id="supabaseBannerClose" style="margin-top:6px;background:#fff;color:#b91c1c;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:600">Închide</button>';
    document.body.appendChild(b);
    b.querySelector('#supabaseBannerClose').onclick = ()=> b.remove();
  },
  _flagAuthError(error){
    this._authFailed = true;
    this._setDiag('authError', error);
    try { this._ensureBanner(); } catch(e){}
  },
  _setDiag(action, error){
    try {
      this._diagnostics.lastAction = action;
      if(error){ this._diagnostics.lastError = (error.message || error.code || String(error)); }
    } catch(e){}
  },
  _realtimeEnabled(){
    // Allow disabling realtime via localStorage key 'supabase.realtime' = 'off'
    try {
      if(this._realtimeAutoDisabled) return false;
      return (localStorage.getItem('supabase.realtime') || 'on') !== 'off';
    } catch(e){ return !this._realtimeAutoDisabled; }
  },
  async getData(force=false){
    if(this._cache && !force) return this._cache;
    // Parallel fetch
    const [projectsRes, tasksRes, usersRes, subtasksRes, depsRes, timeEntriesRes, commentsRes, projTagsRes, taskTagsRes, tagsRes] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('users').select('*'),
      supabase.from('subtasks').select('*'),
      supabase.from('task_dependencies').select('*'),
      supabase.from('time_entries').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('project_tags').select('*'),
      supabase.from('task_tags').select('*'),
      supabase.from('tags').select('*')
    ]);

    const anyErr = [projectsRes, tasksRes, usersRes, subtasksRes, depsRes, timeEntriesRes, commentsRes].find(r=> r.error);
    if(anyErr){
      console.warn('Supabase fetch error', anyErr.error);
      if(anyErr.error && /401/.test(anyErr.error.message||'')) this._flagAuthError(anyErr.error);
    }
    else {
      // If no error but projects empty after previous localOnly inserts, likely RLS SELECT filtering
      try {
        if(!projectsRes.error && (projectsRes.data||[]).length === 0 && this._cache && (this._cache.projects||[]).length > 0){
          this._setDiag('selectFiltered');
        }
      } catch(e){}
    }

    const tagsById = Object.fromEntries((tagsRes.data||[]).map(t=> [t.id, t]));
    // Reattach subtasks to tasks for in-app compatibility
    const subtasksByTask = {};
    (subtasksRes.data||[]).forEach(st=>{ (subtasksByTask[st.task_id] ||= []).push({ id: st.id, title: st.title, completed: st.completed, startDate: st.start_date, dueDate: st.due_date }); });

    const depsByTask = {};
    (depsRes.data||[]).forEach(d=> { (depsByTask[d.successor_task_id] ||= []).push(d.predecessor_task_id); });

    const projectTagsByProject = {};
    (projTagsRes.data||[]).forEach(pt=> { (projectTagsByProject[pt.project_id] ||= []).push(tagsById[pt.tag_id]?.name); });

    const taskTagsByTask = {};
    (taskTagsRes.data||[]).forEach(tt=> { (taskTagsByTask[tt.task_id] ||= []).push(tagsById[tt.tag_id]?.name); });

    const tasks = (tasksRes.data||[]).map(t => ({
      id: t.id,
      projectId: t.project_id,
      title: t.title,
      description: t.description,
      startDate: t.start_date,
      dueDate: t.due_date,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assigned_to,
      estimatedHours: t.estimated_hours,
      actualHours: t.actual_hours,
      progress: t.progress,
      color: t.color,
      _ganttVisible: t.gantt_visible ? 1 : 0,
      milestone: t.milestone,
      sortIndex: typeof t.sort_index === 'number' ? t.sort_index : undefined,
      dependencies: depsByTask[t.id] || [],
      tags: (taskTagsByTask[t.id]||[]).filter(Boolean),
      subtasks: subtasksByTask[t.id] || []
    }));

    const projects = (projectsRes.data||[]).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      progress: p.progress,
      startDate: p.start_date,
      dueDate: p.due_date,
      priority: p.priority,
      color: p.color,
      teamMembers: [], // will fill from project_members fetch (add if needed later)
      tags: (projectTagsByProject[p.id]||[]).filter(Boolean)
    }));

    const data = {
      projects,
      tasks,
      users: (usersRes.data||[]).map(u=> ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        skills: u.skills || [],
        hoursPerWeek: u.hours_per_week
      })),
      timeEntries: (timeEntriesRes.data||[]).map(te=> ({
        id: te.id,
        taskId: te.task_id,
        userId: te.user_id,
        date: te.date,
        hours: Number(te.hours||0),
        description: te.description || ''
      })),
      comments: (commentsRes.data||[]).map(c=> ({
        id: c.id,
        taskId: c.task_id,
        userId: c.user_id,
        text: c.text,
        timestamp: c.created_at
      }))
    };
    this._cache = data;
    return data;
  },
  async save(){ /* no-op: server is source of truth */ },
  async addTask(task){
    // Insert task then subtasks then dependencies
    const progress = ('progress' in task) ? task.progress : computeTaskProgress(task);
    // Attempt to compute next sort_index (best-effort; ignore errors if column absent)
    let sortIndexVal = null;
    try {
      const { data: maxRow } = await supabase.from('tasks').select('sort_index').order('sort_index', { ascending:false }).limit(1).maybeSingle();
      if(maxRow && typeof maxRow.sort_index === 'number') sortIndexVal = maxRow.sort_index + 1; else sortIndexVal = 1;
    } catch(_) { /* column may not exist yet */ }
    const { data, error } = await supabase.from('tasks').insert({
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status || 'Not Started',
      priority: task.priority || 'Medium',
      start_date: task.startDate || null,
      due_date: task.dueDate || null,
      assigned_to: task.assignedTo || null,
      estimated_hours: task.estimatedHours || null,
      actual_hours: task.actualHours || null,
      progress,
      color: task.color || null,
      gantt_visible: !!task._ganttVisible,
      milestone: !!task.milestone,
      sort_index: sortIndexVal
    }).select().single();
    if(error){
      console.error('addTask error', error);
      this._setDiag('addTask', error);
      if(/401/.test(error.message||'')) this._flagAuthError(error);
      try { if(window.Toast) window.Toast.push('Task insert failed: ' + (error.message||error.code||'unknown'), 'error'); } catch(e){}
      return;
    }
    this._setDiag('addTask');
    const newId = data.id;
    task.id = newId;
    // optimistic local push
    if(window.projectHub && window.projectHub.data){
      const clone = { ...task };
      window.projectHub.data.tasks.push(clone);
    }
    // Subtasks
    if(Array.isArray(task.subtasks) && task.subtasks.length){
      const rows = task.subtasks.map(st=> ({ task_id: newId, title: st.title, completed: !!st.completed, start_date: st.startDate||null, due_date: st.dueDate||null }));
      await supabase.from('subtasks').insert(rows);
    }
    // Dependencies (only predecessor list is stored in task.dependencies)
    if(Array.isArray(task.dependencies) && task.dependencies.length){
      const depRows = task.dependencies.map(pred => ({ predecessor_task_id: pred, successor_task_id: newId }));
      // Some may fail if pred not yet inserted; consider batch after all tasks instead in a migration context.
      await supabase.from('task_dependencies').insert(depRows).catch(()=>{});
    }
    this._cache = null; // invalidate
    // Audit
    try { await this.addAudit('create','task', newId, `Task created: ${task.title}`); } catch(e){}
    return newId;
  },
  async updateTask(id, partial){
    const payload = {};
    const map = {
      projectId:'project_id', description:'description', title:'title', status:'status', priority:'priority', startDate:'start_date', dueDate:'due_date', assignedTo:'assigned_to', estimatedHours:'estimated_hours', actualHours:'actual_hours', progress:'progress', color:'color', milestone:'milestone', sortIndex:'sort_index'
    };
    Object.entries(map).forEach(([k,v])=> { if(k in partial) payload[v] = partial[k]; });
    if('_ganttVisible' in partial) payload.gantt_visible = !!partial._ganttVisible;
    if(Object.keys(payload).length){
  const { error } = await supabase.from('tasks').update(payload).eq('id', id);
  if(error){ console.error('updateTask error', error); this._setDiag('updateTask', error); try { if(window.Toast) window.Toast.push('Task update failed: ' + (error.message||error.code||'unknown'), 'error'); } catch(e){} }
  else this._setDiag('updateTask');
      this._cache = null;
      // local mirror update
      if(window.projectHub && window.projectHub.data){
        const t = window.projectHub.data.tasks.find(tsk=> tsk.id === id);
        if(t) Object.assign(t, partial);
      }
      try { await this.addAudit('update','task', id, `Task updated: ${Object.keys(partial).join(', ')}`); } catch(e){}
    }
  },
  async reorderTasks(orderedIds){
    if(!Array.isArray(orderedIds) || !orderedIds.length) return;
    // Assign incremental indices starting at 1
    // Graceful: if sort_index column missing, swallow error and mark diagnostic
    for(let i=0;i<orderedIds.length;i++){
      const id = orderedIds[i];
      try {
        const { error } = await supabase.from('tasks').update({ sort_index: i+1 }).eq('id', id);
        if(error){
          if(/column .*sort_index/i.test(error.message||'')){
            this._setDiag('reorderTasks.noColumn', error);
            break; // column not present -> stop trying
          }
        }
      } catch(e){ /* ignore individual */ }
      // update local mirror
      if(window.projectHub){
        const t = window.projectHub.data.tasks.find(tsk=> tsk.id === id);
        if(t) t.sortIndex = i+1;
      }
    }
    this._cache = null;
  },
  async setTaskDependencies(taskId, dependencyIds){
    if(!Array.isArray(dependencyIds)) return;
    try {
      // delete existing rows for successor
      const { error: delErr } = await supabase.from('task_dependencies').delete().eq('successor_task_id', taskId);
      if(delErr) { console.warn('setTaskDependencies delete error', delErr); this._setDiag('setTaskDependencies.delete', delErr); try { if(window.Toast) window.Toast.push('Nu pot șterge dependențele existente', 'error'); } catch(_){} return false; }
      if(dependencyIds.length){
        const rows = dependencyIds.filter(id=> id && id !== taskId).map(pred => ({ predecessor_task_id: pred, successor_task_id: taskId }));
        if(rows.length){
          const { error: insErr } = await supabase.from('task_dependencies').insert(rows);
          if(insErr) { console.warn('setTaskDependencies insert error', insErr); this._setDiag('setTaskDependencies.insert', insErr); try { if(window.Toast) window.Toast.push('Nu pot salva dependențele', 'error'); } catch(_){} return false; }
        }
      }
      // update local mirror
      if(window.projectHub && window.projectHub.data){
        const t = window.projectHub.data.tasks.find(tsk=> tsk.id === taskId);
        if(t) t.dependencies = [...dependencyIds];
      }
      return true;
    } catch(e){ console.warn('setTaskDependencies failed', e); this._setDiag('setTaskDependencies.exception', e); try { if(window.Toast) window.Toast.push('Eroare la salvarea dependențelor', 'error'); } catch(_){} return false; }
  },
  // --- Subtasks CRUD (Phase 1) ---
  async addSubtask(taskId, sub){
    try {
      const payload = {
        task_id: taskId,
        title: sub.title,
        completed: !!sub.completed,
        start_date: sub.startDate || null,
        due_date: sub.dueDate || null
      };
      const { data, error } = await supabase.from('subtasks').insert(payload).select().single();
      if(error){ console.warn('addSubtask error', error); this._setDiag('addSubtask', error); try { if(window.Toast) window.Toast.push('Nu pot adăuga subtask-ul', 'error'); } catch(_){} return null; }
      // Do not push into local mirror here; UI already added optimistically and will assign the new id
      this._cache = null;
      try { await this.addAudit && this.addAudit('create','subtask', data.id, `Subtask created: ${data.title}`); } catch(_){ }
      return data.id;
    } catch(e){ console.warn('addSubtask failed', e); this._setDiag('addSubtask.exception', e); return null; }
  },
  async updateSubtask(id, partial){
    try {
      const map = { startDate:'start_date', dueDate:'due_date', title:'title', completed:'completed' };
      const payload = {};
      Object.entries(partial).forEach(([k,v])=>{ if(map[k]) payload[map[k]] = v; });
      if(Object.keys(payload).length === 0) return true;
      const { error } = await supabase.from('subtasks').update(payload).eq('id', id);
      if(error){ console.warn('updateSubtask error', error); this._setDiag('updateSubtask', error); try { if(window.Toast) window.Toast.push('Nu pot actualiza subtask-ul', 'error'); } catch(_){} return false; }
      // UI already updated the local object; avoid double mutation here
      this._cache = null;
      try { await this.addAudit && this.addAudit('update','subtask', id, 'Subtask updated'); } catch(_){ }
      return true;
    } catch(e){ console.warn('updateSubtask failed', e); this._setDiag('updateSubtask.exception', e); }
  },
  async deleteSubtask(id){
    try {
      const { error } = await supabase.from('subtasks').delete().eq('id', id);
      if(error){ console.warn('deleteSubtask error', error); this._setDiag('deleteSubtask', error); try { if(window.Toast) window.Toast.push('Nu pot șterge subtask-ul', 'error'); } catch(_){} return false; }
      // UI a eliminat deja elementul din listă
      this._cache = null;
      try { await this.addAudit && this.addAudit('delete','subtask', id, 'Subtask deleted'); } catch(_){ }
      return true;
    } catch(e){ console.warn('deleteSubtask failed', e); this._setDiag('deleteSubtask.exception', e); }
  },
  async addProject(project){
    const { error, data } = await supabase.from('projects').insert({
      name: project.name,
      description: project.description,
      status: project.status || 'Not Started',
      priority: project.priority || 'Medium',
      progress: project.progress || 0,
      start_date: project.startDate || null,
      due_date: project.dueDate || null,
      color: project.color || null
    }).select().single();
  if(error){ console.error('addProject error', error); this._setDiag('addProject', error); if(/401/.test(error.message||'')) this._flagAuthError(error); try { if(window.Toast) window.Toast.push('Project insert failed: ' + (error.message||error.code||'unknown'), 'error'); } catch(e){} }
  else this._setDiag('addProject');
    this._cache = null;
    if(data && data.id){
      project.id = data.id;
      if(window.projectHub && window.projectHub.data){
        window.projectHub.data.projects.push({ ...project });
      }
    }
    if(data && data.id){ try { await this.addAudit('create','project', data.id, `Project created: ${project.name}`); } catch(e){} }
    return data?.id;
  },
  async updateProject(id, partial){
    const allowed = ['name','description','status','priority','progress','start_date','due_date','color'];
    const payload = {};
    Object.entries(partial).forEach(([k,v])=>{
      const map = { startDate:'start_date', dueDate:'due_date' };
      const col = map[k] || k;
      if(allowed.includes(col)) payload[col] = v;
    });
    if(Object.keys(payload).length){
  const { error } = await supabase.from('projects').update(payload).eq('id', id);
  if(error){ console.error('updateProject error', error); this._setDiag('updateProject', error); if(/401/.test(error.message||'')) this._flagAuthError(error); try { if(window.Toast) window.Toast.push('Project update failed: ' + (error.message||error.code||'unknown'), 'error'); } catch(e){} }
  else this._setDiag('updateProject');
  if(window.projectHub){
        const p = window.projectHub.data.projects.find(pr=> pr.id === id);
        if(p) Object.assign(p, partial);
      }
      this._cache = null;
      try { await this.addAudit('update','project', id, `Project updated: ${Object.keys(partial).join(', ')}`); } catch(e){}
    }
  },
  async deleteProject(id){
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if(error){ console.error('deleteProject error', error); this._setDiag('deleteProject', error); }
    else this._setDiag('deleteProject');
    if(window.projectHub){
      window.projectHub.data.projects = window.projectHub.data.projects.filter(p=> p.id !== id);
      window.projectHub.data.tasks = window.projectHub.data.tasks.filter(t=> t.projectId !== id);
    }
    this._cache = null;
    try { await this.addAudit('delete','project', id, `Project deleted`); } catch(e){}
  },
  async deleteTask(id){
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if(error){ console.error('deleteTask error', error); this._setDiag('deleteTask', error); }
    else this._setDiag('deleteTask');
    if(window.projectHub){
      window.projectHub.data.tasks = window.projectHub.data.tasks.filter(t=> t.id !== id);
    }
    this._cache = null;
    try { await this.addAudit('delete','task', id, `Task deleted`); } catch(e){}
  },
  async addTimeEntry(entry){
    const payload = {
      task_id: entry.taskId || null,
      user_id: entry.userId || null,
      date: entry.date,
      hours: entry.hours,
      description: entry.description || null
    };
    const { data, error } = await supabase.from('time_entries').insert(payload).select().single();
    if(error) { console.error('addTimeEntry error', error); return null; }
    if(data && window.projectHub){
      window.projectHub.data.timeEntries.push({
        id: data.id,
        taskId: data.task_id,
        userId: data.user_id,
        date: data.date,
        hours: Number(data.hours||0),
        description: data.description || ''
      });
    }
    return data?.id || null;
  },
  async addComment(comment){
    const { data, error } = await supabase.from('comments').insert({
      task_id: comment.taskId,
      user_id: comment.userId || null,
      text: comment.text
    }).select().single();
    if(error) console.error('addComment error', error);
    if(data && window.projectHub){
      window.projectHub.data.comments.push({
        id: data.id,
        taskId: data.task_id,
        userId: data.user_id,
        text: data.text,
        timestamp: data.created_at
      });
    }
    if(data && data.id){ try { await this.addAudit('create','comment', data.id, `Comment added on task ${comment.taskId}`); } catch(e){} }
  },
  async addUser(user){
    try {
      const { data, error } = await supabase.from('users').insert({
        name: user.name,
        email: user.email || null,
        role: user.role || null,
        avatar: user.avatar || null,
        skills: user.skills || [],
        hours_per_week: user.hoursPerWeek || 40
      }).select().single();
      if(error) { console.warn('addUser error', error); return null; }
      if(data && window.projectHub){
        window.projectHub.data.users.push({
          id: data.id,
          name: data.name,
          email: data.email,
            role: data.role,
            avatar: data.avatar,
            skills: data.skills || [],
            hoursPerWeek: data.hours_per_week
        });
      }
      try { await this.addAudit('create','user', data.id, `User created: ${data.name}`); } catch(e){}
      return data?.id;
    } catch(e){ console.warn('addUser failed', e); return null; }
  },
  async updateUser(id, partial){
    const map = { hoursPerWeek:'hours_per_week' };
    const payload = {};
    Object.entries(partial).forEach(([k,v])=>{ const col = map[k] || k; payload[col] = v; });
    try {
      const { error } = await supabase.from('users').update(payload).eq('id', id);
      if(error) console.warn('updateUser error', error);
      if(window.projectHub){
        const u = window.projectHub.data.users.find(x=> x.id === id);
        if(u) Object.assign(u, partial);
      }
      try { await this.addAudit('update','user', id, `User updated: ${Object.keys(partial).join(',')}`); } catch(e){}
    } catch(e){ console.warn('updateUser failed', e); }
  },
  async deleteUser(id){
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if(error) console.warn('deleteUser error', error);
      if(window.projectHub){
        window.projectHub.data.users = window.projectHub.data.users.filter(u=> u.id !== id);
        window.projectHub.data.tasks.forEach(t=> { if(t.assignedTo === id) t.assignedTo = ''; });
      }
      try { await this.addAudit('delete','user', id, `User deleted`); } catch(e){}
    } catch(e){ console.warn('deleteUser failed', e); }
  },
  async syncProjectProgresses(projects){
    // Accept array of {id, progress}
    if(!Array.isArray(projects) || !projects.length) return;
    // sequential minimal updates; could be batched with RPC for efficiency later
    for(const p of projects){
      try { await supabase.from('projects').update({ progress: p.progress }).eq('id', p.id); } catch(e){ /* ignore individual failure */ }
    }
  },
  async addAudit(action, entityType, entityId, description){
    if(this._auditDisabled) return;
    try {
      // audit_log schema: action, entity_type, entity_id, user_id, metadata, created_at
      // We map 'description' into metadata JSON so schema differences don't break.
      const payload = { action, entity_type: entityType, entity_id: entityId };
      if(description) payload.metadata = { description };
      const { error } = await supabase.from('audit_log').insert(payload);
      if(error){
        console.warn('addAudit failed', error);
        // Disable further attempts to avoid noise if table/policy missing
        this._auditDisabled = true;
      }
    } catch(e){ console.warn('addAudit exception', e); this._auditDisabled = true; }
  },
  async getRecentAudit(limit = 10){
    // Retrieve latest audit log entries; fallback to empty list if table missing or RLS blocks
    try{
      const { data, error } = await supabase
        .from('audit_log')
        .select('id, action, entity_type, entity_id, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if(error){
        // if unauthorized or table missing, just return empty list and disable further attempts
        if(/401|permission|relation .* does not exist/i.test(error.message||'')){
          this._auditDisabled = true;
        }
        return [];
      }
      return Array.isArray(data) ? data : [];
    }catch(e){
      return [];
    }
  },
  async syncLocalOnly(){
    const ph = window.projectHub;
    if(!ph){ return { projects:0, tasks:0 }; }
    let syncedProjects = 0, syncedTasks = 0;
    // Projects
    for(const p of [...ph.data.projects]){
      if(p._localOnly){
        const temp = { ...p };
        delete temp.id; // let DB assign
        delete temp._localOnly;
        const newId = await this.addProject(temp);
        if(newId && !temp._localOnly){
          // replace old localOnly entry
            const idx = ph.data.projects.findIndex(pr=> pr.id === p.id);
            if(idx>=0){
              temp.id = newId; ph.data.projects[idx] = temp; syncedProjects++;
            }
        }
      }
    }
    // Tasks
    for(const t of [...ph.data.tasks]){
      if(t._localOnly){
        const tempT = { ...t };
        delete tempT.id; delete tempT._localOnly;
        const newTaskId = await this.addTask(tempT);
        if(newTaskId && !tempT._localOnly){
          const idx = ph.data.tasks.findIndex(tsk=> tsk.id === t.id);
          if(idx>=0){ tempT.id = newTaskId; ph.data.tasks[idx] = tempT; syncedTasks++; }
        }
      }
    }
    try { if(window.Toast) window.Toast.push(`Sync localOnly: ${syncedProjects} proiecte, ${syncedTasks} task-uri`, 'info'); } catch(e){}
    return { projects: syncedProjects, tasks: syncedTasks };
  },
  async searchFullText(query){
    if(!query || query.trim().length < 2){ return { projects: [], tasks: []}; }
    const q = query.trim();
    // Attempt text search on generated tsvector columns search_vector (must exist in DB)
    const [tasksRes, projectsRes] = await Promise.all([
      supabase.from('tasks').select('id,title,description,project_id').textSearch('search_vector', q, { type: 'plain' }).limit(25),
      supabase.from('projects').select('id,name,description').textSearch('search_vector', q, { type: 'plain' }).limit(25)
    ]);
    return { tasks: tasksRes.data || [], projects: projectsRes.data || [] };
  },
  bindRealtime(){
    if(!this._realtimeEnabled()){ this._diagnostics.realtimeDisabled = true; return; }
    if(this._realtimeBound) return; this._realtimeBound = true;
    const debounceRefresh = () => {
      const now = Date.now();
      if(now - this._lastRealtimeRefresh < 400){
        clearTimeout(this._realtimeDebounceTimer);
        this._realtimeDebounceTimer = setTimeout(()=> this._doRealtimeRefresh(), 420);
      } else {
        this._doRealtimeRefresh();
      }
    };
    const handleRealtimeFailure = (reason) => {
      try {
        this._setDiag('realtime.failure', reason||'unknown');
        console.warn('Supabase Realtime disabled due to connection issue. Reason:', reason);
        // Prevent future attempts automatically
        this._realtimeAutoDisabled = true;
        this._diagnostics.realtimeDisabled = true;
        try { localStorage.setItem('supabase.realtime','off'); } catch(_){}
        // Unsubscribe any channels we've created
        for(const ch of this._realtimeChannels){
          try { ch.unsubscribe(); } catch(_){}
        }
        this._realtimeChannels = [];
        this._realtimeBound = false;
      } catch(_){ /* noop */ }
    };
    const subscribeSafe = (channelName, filter, handler) => {
      try {
        const ch = supabase.channel(channelName).on('postgres_changes', filter, handler);
        this._realtimeChannels.push(ch);
        let settled = false;
        const timer = setTimeout(()=>{
          if(!settled){ handleRealtimeFailure('timeout'); }
        }, 3500);
        ch.subscribe((status) => {
          // status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR'
          if(status === 'SUBSCRIBED'){
            settled = true; clearTimeout(timer);
          } else if(status === 'TIMED_OUT' || status === 'CHANNEL_ERROR'){
            settled = true; clearTimeout(timer); handleRealtimeFailure(status);
          }
        });
      } catch(e){ handleRealtimeFailure(e?.message || 'exception'); }
    };
    this._doRealtimeRefresh = async () => {
      this._lastRealtimeRefresh = Date.now();
      this._cache = null;
      try {
        const data = await this.getData(true);
        if(window.projectHub){
          window.projectHub.data = data;
          try { window.projectHub.recalculateAllProjectProgresses(); } catch(e){}
          // re-render current views minimally
          if(window.projectHub.currentPage === 'projects') window.projectHub.renderProjects();
          if(window.projectHub.currentPage === 'tasks') window.projectHub.renderTasks();
          if(window.projectHub.currentPage === 'kanban') window.projectHub.updateKanbanBoard();
          if(window.projectHub.currentPage === 'dashboard') { window.projectHub.renderDashboard(); }
          if(window.projectHub.currentPage === 'gantt' && window.projectHub.ganttManager) window.projectHub.ganttManager.render();
        }
      } catch(e){ console.warn('Realtime refresh failed', e); }
    };
    // Subscribe to tasks & projects (wildcard events) with safe handler
    try {
      subscribeSafe('realtime:tasks', { event: '*', schema: 'public', table: 'tasks' }, ()=> debounceRefresh());
      subscribeSafe('realtime:projects', { event: '*', schema: 'public', table: 'projects' }, ()=> debounceRefresh());
      // Optional: dependencies & subtasks for Gantt accuracy
      subscribeSafe('realtime:subtasks', { event: '*', schema: 'public', table: 'subtasks' }, ()=> debounceRefresh());
      subscribeSafe('realtime:deps', { event: '*', schema: 'public', table: 'task_dependencies' }, ()=> debounceRefresh());
    } catch(e){ console.warn('Failed to bind realtime channels', e); }
  },
  async testConnection(){
    try {
      const { data, error } = await supabase.from('projects').select('id').limit(1);
      if(error) return { ok:false, stage:'select', error };
      return { ok:true, count: (data||[]).length };
    } catch(e){ return { ok:false, stage:'exception', error: e }; }
  }
};

// Expose globally for app.js detection if needed
window.SupabaseStore = SupabaseStore;
window.supabaseClient = supabase;

// ===== Notes (OneNote-like) — optional Supabase integration =====
// These helper methods are attached to SupabaseStore to keep one namespace.
SupabaseStore.getNotes = async function(){
  try{
    const [secRes, pageRes] = await Promise.all([
      supabase.from('notes_sections').select('*'),
      supabase.from('notes_pages').select('*')
    ]);
    if(secRes.error || pageRes.error){
      // If the schema isn’t present, just signal empty and let app fallback to local
      return { sections: [], pages: [], cloudAvailable: false };
    }
    const sections = (secRes.data||[]).map(s=> ({ id: s.id, projectId: s.project_id || '', title: s.title }));
    // If app cache exists, try to enrich missing projectId from it (in case earlier inserts omitted project_id)
    try{
      if(window.projectHub && window.projectHub._notes && Array.isArray(window.projectHub._notes.sections)){
        const locMap = new Map(window.projectHub._notes.sections.map(x=> [x.id, x.projectId]));
        sections.forEach(sec=> { if(!sec.projectId && locMap.get(sec.id)) sec.projectId = locMap.get(sec.id); });
      }
    }catch(_){ }
    const pages = (pageRes.data||[]).map(p=> ({ id: p.id, sectionId: p.section_id, title: p.title, content: p.content || '', updatedAt: p.updated_at }));
    return { sections, pages, cloudAvailable: true };
  } catch(e){
    return { sections: [], pages: [], cloudAvailable: false };
  }
};
SupabaseStore.addNoteSection = async function(section){
  try{
    let res = await supabase.from('notes_sections').insert({ project_id: section.projectId || null, title: section.title }).select().single();
    if(res.error){
      // If projects table or FK missing, retry without project_id to keep cloud usable
      try {
        res = await supabase.from('notes_sections').insert({ title: section.title }).select().single();
      } catch(_){}
    }
    if(res && res.data) return res.data.id || null;
    return null;
  }catch(e){ return null; }
};
SupabaseStore.updateNoteSection = async function(id, partial){
  try{
    const payload = {}; if('title' in partial) payload.title = partial.title; if('projectId' in partial) payload.project_id = partial.projectId || null;
    if(!Object.keys(payload).length) return true;
    const { error } = await supabase.from('notes_sections').update(payload).eq('id', id); if(error) return false; return true;
  }catch(e){ return false; }
};
SupabaseStore.deleteNoteSection = async function(id){
  try{
    // delete pages first
    await supabase.from('notes_pages').delete().eq('section_id', id);
    const { error } = await supabase.from('notes_sections').delete().eq('id', id);
    if(error) return false; return true;
  }catch(e){ return false; }
};
SupabaseStore.addNote = async function(page){
  try{
    const { data, error } = await supabase.from('notes_pages').insert({ section_id: page.sectionId, title: page.title || 'Notă nouă', content: page.content || '', updated_at: new Date().toISOString() }).select().single();
    if(error) return null; return data?.id || null;
  }catch(e){ return null; }
};
SupabaseStore.updateNote = async function(id, partial){
  try{
    const payload = {}; if('title' in partial) payload.title = partial.title; if('content' in partial) payload.content = partial.content; payload.updated_at = new Date().toISOString();
    const { error } = await supabase.from('notes_pages').update(payload).eq('id', id); if(error) return false; return true;
  }catch(e){ return false; }
};
SupabaseStore.deleteNote = async function(id){
  try{ const { error } = await supabase.from('notes_pages').delete().eq('id', id); if(error) return false; return true; }catch(e){ return false; }
};

// Debug helper: inspect a single task row directly from DB (Gantt related fields)
SupabaseStore.debugGanttRow = async function(taskId){
  if(!taskId){ console.warn('debugGanttRow: taskId required'); return; }
  try {
    const { data, error } = await supabase.from('tasks').select('id,title,start_date,due_date,gantt_visible,milestone,color').eq('id', taskId).single();
    if(error){ console.warn('debugGanttRow error', error); return; }
    console.log('Gantt DB Row', data);
    return data;
  } catch(e){ console.warn('debugGanttRow exception', e); }
};

// Allow manual toggle in console:
//   localStorage.setItem('supabase.realtime','off');  // disable
//   localStorage.removeItem('supabase.realtime');      // enable (default)
// We only bind realtime after a successful connectivity probe to avoid repeated socket failures.
SupabaseStore.testConnection().then(r=> {
  console.log('Supabase connectivity test:', r);
  if(r.ok){
    try { SupabaseStore.bindRealtime(); } catch(e){ console.warn('bindRealtime failed', e); }
  } else {
    console.warn('Skipping realtime binding due to failed connectivity (set localStorage supabase.realtime=off to silence).');
  }
});
