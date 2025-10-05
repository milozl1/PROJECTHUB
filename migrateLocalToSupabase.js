// migrateLocalToSupabase.js
// One-off migration script: Reads existing localStorage seed structure and imports into Supabase tables.
// Usage: Include this script in index.html temporarily, open app in browser, run window.runLocalMigration().
// After successful migration, remove the script to avoid accidental duplicates.

import { supabase } from './supabaseAdapter.js';

// Simple UUID helper using built-in crypto (modern browsers)
function genId(){ return (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0, v = c==='x'?r:(r&0x3|0x8); return v.toString(16); }); }

async function fetchCount(table){
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return count || 0;
}

async function ensureTags(tagNames){
  if(!tagNames.length) return {};
  const unique = [...new Set(tagNames)].filter(Boolean);
  const rows = unique.map(name => ({ name }));
  // Upsert by unique constraint (name)
  const { data, error } = await supabase.from('tags')
    .upsert(rows, { onConflict: 'name', ignoreDuplicates: true })
    .select();
  if(error) console.warn('Tag upsert error', error);
  const map = {}; (data||[]).forEach(r => { map[r.name] = r.id; });
  return map;
}

async function batchInsert(table, rows, chunk=500){
  for(let i=0; i<rows.length; i+=chunk){
    const slice = rows.slice(i,i+chunk);
    const { error } = await supabase.from(table).insert(slice);
    if(error) { console.error('Insert error', table, error); throw error; }
  }
}

async function migrate(options={ dryRun:false, verbose:true }){
  const raw = localStorage.getItem('projecthub-data-v1');
  if(!raw){ console.warn('Nu există date locale.'); return; }
  const data = JSON.parse(raw);
  const already = await fetchCount('projects');
  if(already > 0){
    console.warn('Tabelele nu sunt goale (projects count='+already+'). Oprește migrarea sau golește mai întâi.');
    return;
  }

  const idMap = { users:{}, projects:{}, tasks:{}, subtasks:{}, tags:{} };

  // Collect all tag names
  const allTagNames = [];
  data.projects.forEach(p=> (p.tags||[]).forEach(t=> allTagNames.push(t)));
  data.tasks.forEach(t=> (t.tags||[]).forEach(tag=> allTagNames.push(tag)));
  idMap.tags = await ensureTags(allTagNames);

  // USERS
  const userRows = data.users.map(u => ({
    id: genId(),
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    skills: u.skills,
    hours_per_week: u.hoursPerWeek
  }));
  if(options.dryRun) console.log('[DryRun] Users prepared', userRows.length); else await batchInsert('users', userRows);
  userRows.forEach((row, i) => { idMap.users[data.users[i].id] = row.id; });

  // PROJECTS
  const projectRows = data.projects.map(p => ({
    id: genId(),
    name: p.name,
    description: p.description,
    status: (['Not Started','In Progress','Completed','On Hold'].includes(p.status) ? p.status : 'Not Started'),
    priority: p.priority || 'Medium',
    progress: p.progress || 0,
    start_date: p.startDate || null,
    due_date: p.dueDate || null,
    color: p.color || null
  }));
  if(options.dryRun) console.log('[DryRun] Projects prepared', projectRows.length); else await batchInsert('projects', projectRows);
  projectRows.forEach((row, i) => { idMap.projects[data.projects[i].id] = row.id; });

  // PROJECT TAG LINKS
  const projectTagRows = [];
  data.projects.forEach(p => {
    const newPid = idMap.projects[p.id];
    (p.tags||[]).forEach(tn => { const tid = idMap.tags[tn]; if(tid) projectTagRows.push({ project_id: newPid, tag_id: tid }); });
  });
  if(projectTagRows.length){ if(options.dryRun) console.log('[DryRun] project_tags', projectTagRows.length); else await batchInsert('project_tags', projectTagRows); }

  // TASKS
  const taskRows = data.tasks.map(t => ({
    id: genId(),
    project_id: idMap.projects[t.projectId],
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    start_date: t.startDate || null,
    due_date: t.dueDate || null,
    assigned_to: t.assignedTo ? idMap.users[t.assignedTo] : null,
    estimated_hours: t.estimatedHours || null,
    actual_hours: t.actualHours || null,
    progress: 0,
    color: t.color || null,
    gantt_visible: !!t._ganttVisible,
    milestone: !!t.milestone
  }));
  if(options.dryRun) console.log('[DryRun] Tasks prepared', taskRows.length); else await batchInsert('tasks', taskRows);
  taskRows.forEach((row, i) => { idMap.tasks[data.tasks[i].id] = row.id; });

  // SUBTASKS
  const subtaskRows = [];
  data.tasks.forEach(t => {
    const newTid = idMap.tasks[t.id];
    (t.subtasks||[]).forEach(st => subtaskRows.push({ id: genId(), task_id: newTid, title: st.title, completed: !!st.completed, start_date: st.startDate||null, due_date: st.dueDate||null }));
  });
  if(subtaskRows.length){ if(options.dryRun) console.log('[DryRun] Subtasks prepared', subtaskRows.length); else await batchInsert('subtasks', subtaskRows); }

  // TASK TAG LINKS
  const taskTagRows = [];
  data.tasks.forEach(t => {
    const newTid = idMap.tasks[t.id];
    (t.tags||[]).forEach(tn => { const tid = idMap.tags[tn]; if(tid) taskTagRows.push({ task_id: newTid, tag_id: tid }); });
  });
  if(taskTagRows.length){ if(options.dryRun) console.log('[DryRun] task_tags prepared', taskTagRows.length); else await batchInsert('task_tags', taskTagRows); }

  // DEPENDENCIES
  const depRows = [];
  data.tasks.forEach(t => {
    const succ = idMap.tasks[t.id];
    (t.dependencies||[]).forEach(predOld => { const pred = idMap.tasks[predOld]; if(pred && pred !== succ) depRows.push({ predecessor_task_id: pred, successor_task_id: succ }); });
  });
  // remove duplicates
  const dedup = []; const seen = new Set();
  depRows.forEach(d => { const k = d.predecessor_task_id + '>' + d.successor_task_id; if(!seen.has(k)){ seen.add(k); dedup.push(d); } });
  if(dedup.length){ if(options.dryRun) console.log('[DryRun] dependencies prepared', dedup.length); else await batchInsert('task_dependencies', dedup); }

  // TIME ENTRIES
  const timeRows = data.timeEntries.map(te => ({
    id: genId(),
    task_id: idMap.tasks[te.taskId],
    user_id: te.userId ? idMap.users[te.userId] : null,
    date: te.date,
    hours: te.hours,
    description: te.description
  })).filter(r => r.task_id);
  if(timeRows.length){ if(options.dryRun) console.log('[DryRun] time_entries prepared', timeRows.length); else await batchInsert('time_entries', timeRows); }

  // COMMENTS
  const commentRows = data.comments.map(c => ({
    id: genId(),
    task_id: idMap.tasks[c.taskId],
    user_id: c.userId ? idMap.users[c.userId] : null,
    text: c.text,
    created_at: c.timestamp
  })).filter(r => r.task_id);
  if(commentRows.length){ if(options.dryRun) console.log('[DryRun] comments prepared', commentRows.length); else await batchInsert('comments', commentRows); }

  // TASK progress updates
  if(!options.dryRun){
    for(const oldTask of data.tasks){
      const newId = idMap.tasks[oldTask.id];
      let prog = 0;
      if(Array.isArray(oldTask.subtasks) && oldTask.subtasks.length){
        const done = oldTask.subtasks.filter(s=> s.completed).length;
        prog = Math.round(done / oldTask.subtasks.length * 100);
      } else {
        switch(oldTask.status){ case 'Done': prog=100; break; case 'Review': prog=80; break; case 'In Progress': prog=40; break; default: prog=0; }
      }
      await supabase.from('tasks').update({ progress: prog }).eq('id', newId);
    }
    // Recalc project progress
    for(const p of data.projects){
      const newPid = idMap.projects[p.id];
      await supabase.rpc('recalc_project_progress', { p_project: newPid });
    }
  }

  console.log(options.dryRun ? 'Dry run complete (no inserts committed).' : 'Migration complete ✔');
  if(options.verbose) console.log('ID Map', idMap);
  return { idMap };
}

window.runLocalMigration = (opts) => migrate(opts);
