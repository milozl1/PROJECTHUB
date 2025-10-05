// gantt.js - advanced Gantt logic (drag/resize, dependencies, export, detail panel)
(function(global){
  class GanttManager {
    constructor(app){
      this.app = app;
  // store last removed dependency for undo
  this._lastRemovedDependency = null; // { fromId, toId }
      this.unitWidth = 60;
      this.cachedUnits = [];
      this.dragState = null;
      this._inited = false;
      this._rowsContainer = null;
      // use shared collapsed map on the app if available so Tasks page and Gantt share state
      if(this.app){
        this.app._collapsedTasks = this.app._collapsedTasks || {};
        this._collapsedTasks = this.app._collapsedTasks;
      } else {
        this._collapsedTasks = {};
      }
      // load persisted collapsed state into app._collapsedTasks if not already set
      this._loadCollapsedState();
      // Debounce structure for drag persistence
      this._pendingDragPersist = {};
      this._dragDebounceTimer = null;
      // state for timeline drag-to-pan
      this._panState = { active: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 };
    }

    _saveCollapsedState(){
      try{ localStorage.setItem('gantt.collapsedTasks', JSON.stringify(this._collapsedTasks||{})); if(this.app) this.app._collapsedTasks = this._collapsedTasks; }catch(e){ }
    }
    _loadCollapsedState(){
      try{ const raw = localStorage.getItem('gantt.collapsedTasks'); if(raw){ const parsed = JSON.parse(raw); if(this.app) this.app._collapsedTasks = Object.assign(this.app._collapsedTasks || {}, parsed); this._collapsedTasks = this.app ? this.app._collapsedTasks : parsed; } }catch(e){ if(!this._collapsedTasks) this._collapsedTasks = {}; }
    }

  scaleEl(){ return document.getElementById('ganttScale'); }
    projectFilterEl(){ return document.getElementById('ganttProjectFilter'); }
    assigneeFilterEl(){ return document.getElementById('ganttAssigneeFilter'); }
    timelineHeader(){ return document.getElementById('ganttTimelineHeader'); }
    timelineBody(){ return document.getElementById('ganttTimelineBody'); }
  timelineWrapper(){ const el = document.querySelector('.gantt-timeline-wrapper'); return el || (this.timelineBody() && this.timelineBody().parentElement); }
    taskListEl(){ return document.getElementById('ganttTaskList'); }

    initOnce(){
      if(this._inited) return; this._inited = true;
      this.injectExportButtons();
      // No touch/toggle mode injected — dependency creation is only via drag from the yellow handle
      this.bindGlobalEvents();
      // Enable drag-to-pan on the timeline wrapper
      this._bindTimelinePanning();
  // Keep the sidebar labels vertically aligned with the timeline rows
  this._bindScrollSync();
      // wire up legend helper button to open the detailed legend modal
      try{
        const legendBtn = document.getElementById('ganttLegendBtn');
        if(legendBtn && !legendBtn._bound){
          legendBtn.addEventListener('click', ()=>{
            console.debug && console.debug('[Gantt] legendBtn clicked');
            try{
              const modal = document.getElementById('ganttLegendModal');
              if(!modal){ console.debug && console.debug('[Gantt] legend modal element not found'); return; }
              // Prefer the app-level modal helper which handles backdrop/escape/animations
              if(this.app && typeof this.app.showModal === 'function'){
                try{ this.app.showModal(modal); }catch(e){ /* fallback below */ }
              }
              // Fallback / ensure modal is visible even if app.showModal didn't run as expected
              try{
                // If modal is nested inside another container that clips or has transforms, move it to body while open
                if(modal.parentElement !== document.body){
                  modal._originalParent = modal.parentElement;
                  modal._originalNext = modal.nextSibling;
                  document.body.appendChild(modal);
                  modal.dataset._moved = '1';
                }
              }catch(e){}
              modal.style.zIndex = modal.style.zIndex || 1000;
              modal.classList.remove('hidden');
              modal.classList.add('show');
              modal.setAttribute('aria-hidden','false');
              // Also force the inner content visible and on top
              const content = modal.querySelector('.modal-content');
              if(content){ content.style.zIndex = Math.max(1002, parseInt(content.style.zIndex||0)); content.style.display = 'block'; }

              // Ensure a generated backdrop exists and is visible
              let backdrop = document.querySelector('.modal-backdrop[data-generated="true"]');
              if(!backdrop){
                backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                backdrop.dataset.generated = 'true';
                document.body.appendChild(backdrop);
              }
              backdrop.classList.add('visible');
              // Attach click-to-close if not already attached
              if(!backdrop._generatedClickHandler){
                backdrop._generatedClickHandler = ()=>{
                  try{ modal.classList.remove('show'); modal.classList.add('closing'); }catch(e){}
                  backdrop.classList.remove('visible');
                  setTimeout(()=>{
                    try{ modal.classList.add('hidden'); modal.classList.remove('closing'); }catch(e){}
                    try{ backdrop.remove(); }catch(e){}
                    document.body.style.overflow='auto';
                    // If we moved the modal out of its original parent, try to restore it
                    try{
                      if(modal.dataset._moved && modal._originalParent){
                        if(modal._originalNext) modal._originalParent.insertBefore(modal, modal._originalNext);
                        else modal._originalParent.appendChild(modal);
                        delete modal.dataset._moved;
                        delete modal._originalParent; delete modal._originalNext;
                      }
                    }catch(e){}
                  }, 200);
                };
                backdrop.addEventListener('click', backdrop._generatedClickHandler);
              }
              // Wire modal internal close buttons (data-dismiss or .modal-close) to the same handler so the footer button and the X work
              try{
                const closeButtons = modal.querySelectorAll('[data-dismiss="modal"], .modal-close');
                closeButtons.forEach(btn => {
                  if(btn._legendCloseBound) return;
                  btn.addEventListener('click', (ev)=>{
                    ev.preventDefault();
                    // Prefer generated backdrop handler which restores moved modal
                    if(backdrop && backdrop._generatedClickHandler){
                      backdrop._generatedClickHandler();
                      return;
                    }
                    // Fallback to app-level close handler
                    if(this.app && typeof this.app.closeModals === 'function'){
                      this.app.closeModals();
                    } else {
                      // Best-effort manual hide
                      try{ modal.classList.remove('show'); modal.classList.add('closing'); }catch(e){}
                      try{ backdrop && backdrop.classList.remove('visible'); }catch(e){}
                      setTimeout(()=>{
                        try{ modal.classList.add('hidden'); modal.classList.remove('closing'); }catch(e){}
                        try{ backdrop && backdrop.remove(); }catch(e){}
                        document.body.style.overflow='auto';
                        try{
                          if(modal.dataset._moved && modal._originalParent){
                            if(modal._originalNext) modal._originalParent.insertBefore(modal, modal._originalNext);
                            else modal._originalParent.appendChild(modal);
                            delete modal.dataset._moved;
                            delete modal._originalParent; delete modal._originalNext;
                          }
                        }catch(e){}
                      }, 200);
                    }
                  });
                  btn._legendCloseBound = true;
                });
              }catch(e){}
              document.body.style.overflow = 'hidden';
            }catch(e){ console.warn('Failed to open gantt legend modal', e); }
          });
          legendBtn._bound = true;
        }
      }catch(e){ /* non-fatal */ }
    }

    injectExportButtons(){
      const actions = document.querySelector('#ganttPage .page-actions');
      if(!actions) return;
      if(!actions.querySelector('.gantt-export-png')){
        const btnPNG = document.createElement('button');
        btnPNG.className='btn btn--outline gantt-export-png';
        btnPNG.innerHTML='<i class="fas fa-file-image"></i> PNG';
        btnPNG.onclick = ()=> this.exportPNG();
        const btnCSV = document.createElement('button');
        btnCSV.className='btn btn--outline gantt-export-csv';
        btnCSV.innerHTML='<i class="fas fa-file-csv"></i> CSV';
        btnCSV.onclick = ()=> this.exportCSV();
        actions.appendChild(btnPNG);
        actions.appendChild(btnCSV);
      }
    }

    bindGlobalEvents(){
      document.addEventListener('mousedown', (e)=> this.handleMouseDown(e));
      document.addEventListener('mousemove', (e)=> this.handleMouseMove(e));
      document.addEventListener('mouseup', (e)=> this.handleMouseUp(e));
    }

    // Drag-to-pan: allow left-drag on empty timeline/header to scroll horizontally/vertically/diagonally
    _bindTimelinePanning(){
      try{
        const wrap = this.timelineWrapper();
        if(!wrap || wrap._panBound) return;
        wrap._panBound = true;
        // show grab cursor affordance
        try{ wrap.classList.add('can-pan'); }catch(_){ }

        const isInteractiveTarget = (el)=>{
          if(!el) return false;
          return !!(el.closest && el.closest('.gantt-bar, .gantt-milestone, .gantt-bar-handle, .gantt-bar-dep'));
        };

        const onMouseDown = (e)=>{
          // only left button and within wrapper, and not on interactive elements
          if(e.button !== 0) return;
          if(!wrap.contains(e.target)) return;
          if(isInteractiveTarget(e.target)) return;
          // start panning
          this._panState.active = true;
          this._panState.startX = e.clientX;
          this._panState.startY = e.clientY;
          this._panState.startLeft = wrap.scrollLeft;
          this._panState.startTop = wrap.scrollTop;
          try{ wrap.classList.add('is-panning'); }catch(_){ }
          try{ document.body.style.userSelect = 'none'; }catch(_){ }
          e.preventDefault();
        };
        const onMouseMove = (e)=>{
          if(!this._panState.active) return;
          const dx = e.clientX - this._panState.startX;
          const dy = e.clientY - this._panState.startY;
          // invert dx/dy to scroll in drag direction
          wrap.scrollLeft = this._panState.startLeft - dx;
          wrap.scrollTop = this._panState.startTop - dy;
        };
        const endPan = ()=>{
          if(!this._panState.active) return;
          this._panState.active = false;
          try{ wrap.classList.remove('is-panning'); }catch(_){ }
          try{ document.body.style.userSelect = ''; }catch(_){ }
        };

        wrap.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', endPan);
        // defensive: end pan if window loses focus
        window.addEventListener('blur', endPan);
      }catch(_){ /* non-fatal */ }
    }

    // Sync vertical scrolling between the timeline (right) and the task list (left)
    _bindScrollSync(){
      try{
        const wrap = this.timelineWrapper();
        const sidebar = document.getElementById('ganttTaskList');
        if(!wrap || !sidebar || wrap._syncBound) return;
        wrap._syncBound = true;
        let syncing = false;
        const onWrapScroll = ()=>{
          if(syncing) return; syncing = true;
          try{ sidebar.scrollTop = wrap.scrollTop; }catch(_){ }
          syncing = false;
        };
        const onSidebarScroll = ()=>{
          if(syncing) return; syncing = true;
          try{ wrap.scrollTop = sidebar.scrollTop; }catch(_){ }
          syncing = false;
        };
        wrap.addEventListener('scroll', onWrapScroll);
        sidebar.addEventListener('scroll', onSidebarScroll);
      }catch(_){ }
    }

    // Defer render when timeline body has zero width (hidden due to tabs) to avoid wrong calculations
    render(){
      this.initOnce();
      try{
        const tb = this.timelineBody();
        if(tb && tb.getBoundingClientRect && tb.getBoundingClientRect().width === 0){
          setTimeout(()=> this.render(), 60);
          return;
        }
      }catch(e){ }

  const tasks = this.filteredTasks();
  console.debug && console.debug('[Gantt] render start', { tasksLength: tasks.length, scale: this.scaleEl() && this.scaleEl().value });

      // Ensure rows container exists
      if(!this._rowsContainer || !this._rowsContainer.isConnected){
        const rowsWrap = document.createElement('div');
        rowsWrap.className = 'gantt-rows-wrap';
        rowsWrap.style.position = 'relative';
        rowsWrap.style.minWidth = '100%';
        this.timelineBody().appendChild(rowsWrap);
        this._rowsContainer = rowsWrap;
      }

      // If there are no tasks to show, render a friendly message and a minimal timescale
      if(!tasks.length){
        const emptyTxt = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.emptyTasks') : 'No tasks';
        this.taskListEl().innerHTML = `<p class="text-muted" style="padding:8px">${emptyTxt}</p>`;
        const fallbackTasks = (this.app && this.app.data && this.app.data.tasks && this.app.data.tasks.length) ? this.app.data.tasks : [];
        const r = this.range(fallbackTasks.length ? fallbackTasks : [{ startDate: new Date().toISOString().split('T')[0], dueDate: new Date(new Date().getTime()+7*86400000).toISOString().split('T')[0] }]);
        const scale = (this.scaleEl() && this.scaleEl().value) ? this.scaleEl().value : 'week';
        this.cachedUnits = this.buildScale(r.minDate, r.maxDate, scale);
        this.timelineHeader().innerHTML = '';
        this.cachedUnits.forEach(u=>{ const cell=document.createElement('div'); cell.className='gantt-scale-cell'; cell.style.flex=`0 0 ${this.unitWidth}px`; cell.textContent=u.label; this.timelineHeader().appendChild(cell); });
        this._rowsContainer.innerHTML = '';
        this.timelineBody().style.minWidth = (this.cachedUnits.length * this.unitWidth) + 'px';
        return;
      }

      // compute date range and units based on scale
      const r = this.range(tasks);
      const scale = (this.scaleEl() && this.scaleEl().value) ? this.scaleEl().value : 'week';
      this.cachedUnits = this.buildScale(r.minDate, r.maxDate, scale);

      // build header
      const th = this.timelineHeader();
      th.innerHTML = '';
      this.cachedUnits.forEach(u=>{
        const cell = document.createElement('div');
        cell.className = 'gantt-scale-cell';
        cell.style.flex = `0 0 ${this.unitWidth}px`;
        cell.textContent = u.label;
        if(scale === 'day' && u.weekend){ cell.classList.add('weekend'); }
        th.appendChild(cell);
      });

      // Ensure timeline body is positioned so overlays can be absolutely placed
      try{ if(getComputedStyle(this.timelineBody()).position === 'static'){ this.timelineBody().style.position = 'relative'; } }catch(e){}

      // Render or hide weekend background stripes
      this._renderWeekendLayer(scale);

      // Build display rows (task + subtask rows) so subtasks can be rendered on their own lines
      const displayRows = [];
      tasks.forEach(t=>{
        displayRows.push({ type: 'task', task: t });
        if(t.subtasks && t.subtasks.length){
          t.subtasks.forEach(s=> displayRows.push({ type: 'subtask', parentId: t.id, sub: s, parentTask: t }));
        }
      });
      this._displayRows = displayRows;
      const visibleRows = displayRows.filter(r => !(r.type === 'subtask' && this._collapsedTasks[r.parentId]));
      const rowsH = visibleRows.length * 38;
      this._rowsContainer.style.height = rowsH + 'px';
      this.timelineBody().style.minWidth = (this.cachedUnits.length * this.unitWidth) + 'px';

      // render the parts
      this.renderTaskList(tasks);
      this.renderBars(tasks);
      this.renderDependencies(tasks);
      this.renderTodayLine();
    }

    _renderWeekendLayer(scale){
      const body = this.timelineBody();
      let layer = this._weekendLayer;
      if(!layer || !layer.isConnected){
        layer = document.createElement('div');
        layer.className = 'gantt-weekend-layer';
        layer.style.position = 'absolute';
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.right = '0';
        layer.style.bottom = '0';
        layer.style.pointerEvents = 'none';
        layer.style.zIndex = '5';
        // insert under rows so bars stay above stripes
        if(this._rowsContainer && this._rowsContainer.parentNode === body){
          body.insertBefore(layer, this._rowsContainer);
        } else {
          body.appendChild(layer);
        }
        this._weekendLayer = layer;
      }
      if(scale !== 'day'){
        layer.style.display = 'none';
        layer.innerHTML = '';
        return;
      }
      layer.style.display = '';
      layer.innerHTML = '';
      const total = this.cachedUnits.length;
      for(let i=0;i<total;i++){
        const u = this.cachedUnits[i];
        if(u.weekend){
          const stripe = document.createElement('div');
          stripe.className = 'gantt-weekend-col';
          stripe.style.position = 'absolute';
          stripe.style.top = '0';
          stripe.style.bottom = '0';
          stripe.style.left = (i * this.unitWidth) + 'px';
          stripe.style.width = this.unitWidth + 'px';
          layer.appendChild(stripe);
        }
      }
    }

    buildScale(start, end, scale){
      const units=[]; const cur=new Date(start.getTime());
      if(scale==='day'){
        while(cur<=end){
          const isWeekend = (cur.getDay() === 0) || (cur.getDay() === 6); // Sun=0, Sat=6
          units.push({start:new Date(cur), label: cur.getDate()+"/"+(cur.getMonth()+1), weekend: isWeekend});
          cur.setDate(cur.getDate()+1);
        }
      }
      else if(scale==='week'){
        while(cur.getDay()!==1) cur.setDate(cur.getDate()-1);
        while(cur<=end){ units.push({start:new Date(cur), label:'S'+this.weekNumber(cur)}); cur.setDate(cur.getDate()+7);} }
      else { // month
        cur.setDate(1);
        while(cur<=end){ units.push({start:new Date(cur), label: cur.toLocaleString('ro-RO',{month:'short', year:'2-digit'})}); cur.setMonth(cur.getMonth()+1);} }
      return units;
    }

    weekNumber(d){ const date=new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-day); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); return Math.ceil((((date-yearStart)/86400000)+1)/7); }

    unitIndex(date){
      for(let i=0;i<this.cachedUnits.length;i++){ const next=this.cachedUnits[i+1]; if(!next || (date>=this.cachedUnits[i].start && date<next.start)) return i; }
      return -1;
    }

    // Compute date range (minDate, maxDate) from a list of tasks.
    // Accepts tasks where dates may be strings or Date objects. Considers subtasks too.
    range(tasks){
      try{
        if(!tasks || !tasks.length) {
          const now = new Date(); return { minDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()), maxDate: new Date(now.getTime() + 7*86400000) };
        }
        let min = null; let max = null;
        const considerDate = (d)=>{ if(!d) return; const dt = (d instanceof Date) ? d : new Date(d); if(isNaN(dt.getTime())) return; if(min===null || dt < min) min = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()); if(max===null || dt > max) max = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()); };
        tasks.forEach(t=>{
          try{
            considerDate(t.startDate);
            considerDate(t.dueDate);
            if(t.subtasks && Array.isArray(t.subtasks)){
              t.subtasks.forEach(s=>{ considerDate(s.startDate || t.startDate); considerDate(s.dueDate || t.dueDate); });
            }
          }catch(e){}
        });
        if(min===null || max===null){ const now=new Date(); return { minDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()), maxDate: new Date(now.getTime()+7*86400000) }; }
        // ensure at least 7 days span for comfortable rendering
        if((max.getTime() - min.getTime()) < 3*86400000){ max = new Date(min.getTime() + 7*86400000); }
        return { minDate: min, maxDate: max };
      }catch(e){ const now=new Date(); return { minDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()), maxDate: new Date(now.getTime()+7*86400000) }; }
    }

    renderTaskList(tasks){
      // Use previously built displayRows but only render rows that are visible (respect collapse state)
      this._collapsedTasks = this._collapsedTasks || {};
      const allRows = this._displayRows || [];
      const collapsedMap = (this.app && this.app._collapsedTasks) ? this.app._collapsedTasks : this._collapsedTasks || {};
      const visibleRows = allRows.filter(r => !(r.type === 'subtask' && collapsedMap[r.parentId]));
  this.taskListEl().innerHTML = visibleRows.map(r=>{
        if(r.type==='task'){
          const t=r.task; const project=this.app.data.projects.find(p=>p.id===t.projectId);
          const subs=t.subtasks||[]; const completed=subs.filter(s=>s.completed).length;
          const isCollapsed = (typeof collapsedMap[t.id] === 'undefined') ? true : !!collapsedMap[t.id];
          const expanded = !isCollapsed;
          const toggle = subs.length? `<button class="btn btn--sm btn--secondary gantt-subtoggle" data-task="${t.id}" aria-expanded="${expanded}">`+(expanded? '▾ ':'▸ ')+`${completed}/${subs.length}</button>`: '';
          return `<div class="gantt-task-row-label gantt-parent-row" data-task-label="${t.id}">
            <span class="task-title-small" title="${(t.title||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}">${String(t.title||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')} ${t._inferred?'<span class="inferred-badge" title="Date inferate">⚠</span>':''}</span>
            <span class="task-meta-small">${project?project.name:''} ${t.assignedTo? '· '+ (this.userName(t.assignedTo)) : ''}</span>
            ${toggle}
          </div>`;
        } else {
          const s=r.sub; return `<div class="gantt-task-row-label gantt-subtask-row" data-subtask-label="${s.id}" data-parent-task="${r.parentId}"><span class="subtask-dot">•</span><span class="task-title-small" title="${(s.title||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}">${String(s.title||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span></div>`;
        }
      }).join('');

      // Enable drag-and-drop reordering for top-level tasks
      try{
        const listEl = this.taskListEl();
        let dragSrcId = null;
        Array.from(listEl.querySelectorAll('.gantt-task-row-label')).forEach(el => {
          const taskId = el.dataset.taskLabel;
          // only make top-level task rows draggable (not subtasks)
          if(!taskId) return;
          el.setAttribute('draggable', 'true');
          el.addEventListener('dragstart', (ev)=>{
            dragSrcId = taskId;
            try{ ev.dataTransfer.setData('text/plain', taskId); }catch(e){}
            try{ ev.dataTransfer.effectAllowed = 'move'; }catch(e){}
            el.classList.add('dragging');
          });
          el.addEventListener('dragend', ()=>{
            dragSrcId = null;
            el.classList.remove('dragging');
            // ensure UI state is consistent after drag
            this.render();
          });
          el.addEventListener('dragover', (ev)=>{ ev.preventDefault(); try{ ev.dataTransfer.dropEffect='move'; }catch(e){} });
          el.addEventListener('drop', (ev)=>{
            ev.preventDefault();
            const targetId = el.dataset.taskLabel;
            if(!dragSrcId || !targetId || dragSrcId === targetId) return;
            try{
              const tasks = this.app.data.tasks || [];
              const srcIndex = tasks.findIndex(t=> t.id === dragSrcId);
              const tgtIndex = tasks.findIndex(t=> t.id === targetId);
              if(srcIndex < 0 || tgtIndex < 0) return;
              // decide whether to insert before or after target depending on mouse Y
              const rect = el.getBoundingClientRect();
              const insertBefore = ev.clientY < (rect.top + rect.height/2);
              const [moved] = tasks.splice(srcIndex, 1);
              let newIndex = tasks.findIndex(t=> t.id === targetId);
              if(!insertBefore) newIndex = newIndex + 1;
              tasks.splice(newIndex, 0, moved);
              // Reassign sortIndex locally
              tasks.forEach((t,i)=> t.sortIndex = i+1);
              // Persist ordering (Supabase or local)
              if(this.app && this.app.store){
                if(this.app.store._isSupabase && this.app.store.reorderTasks){
                  this.app.store.reorderTasks(tasks.map(t=> t.id));
                } else if(typeof this.app.store.save === 'function') {
                  this.app.store.save();
                }
              }
              // re-render to reflect new order
              this.render();
            }catch(e){ console.warn('Failed to reorder tasks', e); }
          });
        });
      }catch(e){ /* non-fatal if DOM APIs fail */ }

      // bind toggles - collapse/expand subtask rows for a parent task
      this.taskListEl().querySelectorAll('.gantt-subtoggle').forEach(btn=>{
        btn.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          const id = btn.dataset.task;
          const parentRow = this.taskListEl().querySelector(`[data-task-label="${id}"]`);
          if(!parentRow) return;
          // determine current expanded state from shared map
          const map = (this.app && this.app._collapsedTasks) ? this.app._collapsedTasks : this._collapsedTasks || {};
          const currentlyCollapsed = (typeof map[id] === 'undefined') ? true : !!map[id];
          const willBeExpanded = currentlyCollapsed; // clicking will expand if currently collapsed
          // update map: collapsed = !willBeExpanded
          map[id] = !willBeExpanded ? true : false;
          // persist
          this._collapsedTasks = map;
          this._saveCollapsedState();
          // trigger a re-render which will compute visible rows and animate reflow
          this.render();
        });
      });

      // clicking a label opens the detail panel for task or a focused subtask editor
      this.taskListEl().querySelectorAll('.gantt-task-row-label').forEach(el=>{
        el.addEventListener('click', ()=>{
          const tid = el.dataset.taskLabel;
          if(tid) this.openDetailPanel(tid, el);
          else {
            const sid = el.dataset.subtaskLabel; const pid = el.dataset.parentTask; if(pid && sid) this.openSubtaskPanel(pid, sid, el);
          }
        });
      });
    }

    renderBars(tasks){
      const container = this._rowsContainer || this.timelineBody();
      // clear only the rows container (keep timeline header intact)
      container.innerHTML = '';
      this.timelineBody().style.minWidth = (this.cachedUnits.length * this.unitWidth) + 'px';
      const allRows = this._displayRows || [];
      const collapsed = this._collapsedTasks || {};
      const visibleRows = allRows.filter(r => !(r.type === 'subtask' && collapsed[r.parentId]));
    visibleRows.forEach((r, idx) => { 
        const row = document.createElement('div');
        row.className = 'gantt-row';
        row.dataset.rowIndex = idx;
        row.style.position = 'absolute';
        row.style.left = '0';
        row.style.right = '0';
        row.style.top = (idx * 38) + 'px';

        if(r.type === 'task'){
          const t = r.task;
          const start = new Date(t.startDate); const end = new Date(t.dueDate);
          const sIdx = this.unitIndex(start); const eIdx = this.unitIndex(end);
        if(sIdx >= 0 && eIdx >= 0){ 
            const prog = this.taskProgress(t);
            // Milestone: explicit flag or zero-length (start==end)
            if(t.milestone === true || sIdx === eIdx){
              const ms = document.createElement('div');
              ms.className = 'gantt-milestone';
              ms.dataset.taskId = t.id;
              ms.style.width = '16px'; ms.style.height = '16px'; ms.style.boxSizing = 'border-box';
              // center the diamond within the unit
              ms.style.left = (sIdx * this.unitWidth + (this.unitWidth/2) - 8) + 'px';
              ms.style.position = 'absolute';
              ms.style.top = '10px';
              ms.title = `${t.title} — ${this.app.formatDate(t.startDate)}`;
              ms.addEventListener('click', (e)=>{ e.stopPropagation(); this.openDetailPanel(t.id, ms); });
              // add dependency handle so milestones behave like bars for deps
              const depHandle = document.createElement('div');
              depHandle.className = 'gantt-bar-dep';
            depHandle.title = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.depHandleTitle') : 'Create dependency: drag to another task';
              depHandle.dataset.depSource = t.id;
              depHandle.style.position = 'absolute';
              depHandle.style.width = '10px'; depHandle.style.height = '10px';
              depHandle.style.borderRadius = '50%';
              depHandle.style.background = 'rgba(255,159,64,0.95)';
              // position at the visual top-right corner of the rotated diamond
              depHandle.style.right = '-6px';
              depHandle.style.top = '-6px';
              // counter-rotate so the handle remains visually upright
              depHandle.style.transform = 'rotate(-45deg)';
              depHandle.style.cursor = 'crosshair';
              ms.appendChild(depHandle);
              row.appendChild(ms);

              // Ensure milestone visually sits above dependency SVG overlay and is interactive
              try{
                ms.style.zIndex = '200';
                ms.style.pointerEvents = 'auto';
                // make handle above the diamond so it's easily clickable
                depHandle.style.zIndex = '201';
              }catch(e){}
            } else {
              const bar = document.createElement('div');
              bar.className = 'gantt-bar gantt-bar-parent' + (t._inferred ? ' inferred' : '');
              bar.dataset.taskId = t.id;
              const len = Math.max(1, eIdx - sIdx + 1);
              bar.style.left = (sIdx * this.unitWidth + 2) + 'px';
              bar.style.width = ((len * this.unitWidth) - 6) + 'px';
              bar.style.position = 'absolute';
              bar.style.top = '6px';
              bar.style.background = t.color || this.projectColor(t.projectId);
              // progress fill
              const progEl = document.createElement('div');
              progEl.className = 'gantt-bar-progress';
              progEl.style.width = Math.max(0, Math.min(100, prog)) + '%';
              bar.appendChild(progEl);
              // label & handles
              const label = document.createElement('span');
              label.className = 'gantt-bar-label';
              label.innerHTML = `<span class="gantt-bar-title">${t.title}</span><small class="gantt-bar-pct">${prog}%</small>`;
              bar.appendChild(label);
              const leftHandle = document.createElement('div'); leftHandle.className='gantt-bar-handle left'; leftHandle.dataset.handle='left';
              const rightHandle = document.createElement('div'); rightHandle.className='gantt-bar-handle right'; rightHandle.dataset.handle='right';
              bar.appendChild(leftHandle); bar.appendChild(rightHandle);
              // dependency creation handle (small circle at right edge) - inline styles so no CSS edit required
              const depHandle = document.createElement('div');
              depHandle.className = 'gantt-bar-dep';
              depHandle.title = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.depHandleTitle') : 'Create dependency: drag to another task';
              depHandle.dataset.depSource = t.id;
              depHandle.style.position = 'absolute';
              depHandle.style.width = '12px'; depHandle.style.height = '12px';
              depHandle.style.borderRadius = '50%';
              depHandle.style.background = 'rgba(255,159,64,0.95)';
              depHandle.style.right = '-6px';
              depHandle.style.top = '50%';
              depHandle.style.transform = 'translateY(-50%)';
              depHandle.style.cursor = 'crosshair';
              bar.appendChild(depHandle);
              // Tooltip: include start/due/progress/assignee
              const assignee = this.userName(t.assignedTo) || (this.app && this.app.t ? this.app.t('unassigned') : 'Neasignat');
              bar.title = `${t.title}\n${this.app.formatDate(t.startDate)} → ${this.app.formatDate(t.dueDate)}\nProgres: ${prog}%\nAsignat la: ${assignee}`;
              // Mark late tasks (dueDate < today and not done)
              try{
                const today = new Date(); const due = new Date(t.dueDate);
                if(t.status !== 'Done' && !isNaN(due.getTime()) && due < new Date(today.getFullYear(), today.getMonth(), today.getDate())){
                  bar.classList.add('late');
                }
              }catch(e){ }
              bar.addEventListener('click', (e)=>{ e.stopPropagation(); this.openDetailPanel(t.id, bar); });
              row.appendChild(bar);
            }
          }
        } else if(r.type === 'subtask'){
          const s = r.sub; const parent = r.parentTask;
          // mark this row as belonging to a parent task for collapse/expand
          row.dataset.parentTaskId = r.parentId;
          const start = new Date(s.startDate || parent.startDate); const end = new Date(s.dueDate || parent.dueDate);
          const sIdx = this.unitIndex(start); const eIdx = this.unitIndex(end);
          if(sIdx >= 0 && eIdx >= 0){
            const subBar = document.createElement('div');
            subBar.className = 'gantt-bar gantt-bar-subtask' + (s.completed? ' done' : '');
            subBar.dataset.subtaskId = s.id;
            subBar.dataset.parentTaskId = r.parentId;
            const len = Math.max(1, eIdx - sIdx + 1);
            // indent subtask bars a bit
            subBar.style.left = (sIdx * this.unitWidth + 12) + 'px';
            subBar.style.width = Math.max(12, ((len * this.unitWidth) - 24)) + 'px';
            subBar.style.position = 'absolute';
            subBar.style.top = '12px';
            subBar.style.height = '12px';
            subBar.style.background = (parent && parent.color) ? this._lightenColor(parent.color, 0.35) : 'rgba(0,0,0,0.12)';
            subBar.innerHTML = `<span class="gantt-subtask-dot">●</span><span class="gantt-bar-label"><span class="gantt-subtask-title">${s.title}</span></span>`;
            subBar.title = s.title;
            subBar.addEventListener('click', (e)=>{ e.stopPropagation(); this.openSubtaskPanel(r.parentId, s.id, subBar); });
            row.appendChild(subBar);
          }
        }

        container.appendChild(row);
      });
    }

    // Focused subtask editor panel (avoids opening both parent and subtask editors)
    openSubtaskPanel(taskId, subtaskId, anchorEl){
      const task = this.app.data.tasks.find(t=> t.id === taskId); if(!task) return;
      const s = (task.subtasks||[]).find(ss=> ss.id === subtaskId); if(!s) return;
      // close existing panel if any
      if(this.detailPanel) try{ this.detailPanel.remove(); }catch(_){}
      // create a subtle backdrop so the panel reads as focused; click to dismiss
      const backdrop = document.createElement('div');
      backdrop.className = 'gantt-panel-backdrop';
      backdrop.style.position = 'fixed';
      backdrop.style.top = '0';
      backdrop.style.left = '0';
      backdrop.style.right = '0';
      backdrop.style.bottom = '0';
      backdrop.style.background = 'rgba(0,0,0,0.08)';
      backdrop.style.zIndex = '4995';
      backdrop.style.cursor = 'default';
      const panel = document.createElement('div'); panel.className='card gantt-detail-panel'; panel.style.position='absolute'; panel.style.zIndex='50';
        panel.style.minWidth='300px'; panel.style.maxWidth='420px'; panel.style.zIndex='5000';
      const rect = anchorEl.getBoundingClientRect();
      panel.style.top = (window.scrollY + rect.top + rect.height + 8) + 'px';
      panel.style.left = (rect.left) + 'px';
      const t = (k, def)=> (this.app && typeof this.app.t === 'function') ? (this.app.t(k) || def) : def;
      const startLbl = t('label.start','Start');
      const endLbl = t('label.end','End');
      const saveLbl = t('btn.save','Save');
      const closeLbl = t('btn.close','Close');
      const delLbl = t('btn.delete','Delete');
      panel.innerHTML = `
        <div class='card__header'><h3 style='font-size:16px;margin:0;'>${(s.title||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</h3>
          <small style='opacity:.8'>${(task.title||'')}</small>
        </div>
        <div class='card__body'>
          <div style='display:flex;flex-direction:column;gap:8px;'>
            <label>Titlu <input type='text' class='form-control' data-subtitle value='${(s.title||'').replace(/"/g,'&quot;')}'/></label>
            <label style='display:flex;align-items:center;gap:6px;'>${startLbl}<input type='date' class='form-control' style='width:160px' data-substart value='${s.startDate||''}'/></label>
            <label style='display:flex;align-items:center;gap:6px;'>${endLbl}<input type='date' class='form-control' style='width:160px' data-subend value='${s.dueDate||''}'/></label>
            <label style='display:flex;align-items:center;gap:8px;'><input type='checkbox' data-subdone ${s.completed?'checked':''}/> ${t('label.completed','Completed')}</label>
            <div style='display:flex;gap:8px;margin-top:8px;'>
              <button class='btn btn--primary btn--sm' data-action='save'>${saveLbl}</button>
              <button class='btn btn--secondary btn--sm' data-action='close'>${closeLbl}</button>
              <button class='btn btn--outline btn--sm' style='margin-left:auto' data-action='delete'>${delLbl}</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(backdrop);
      document.body.appendChild(panel);
      // outside click to close (defer binding to skip the opening click)
      const outside = (ev)=>{ if(!panel.contains(ev.target)){ try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){} document.removeEventListener('click', outside); document.removeEventListener('keydown', onKey); } };
      setTimeout(()=> document.addEventListener('click', outside), 10);
      const onKey = (ev)=>{ if(ev.key==='Escape'||ev.key==='Esc'){ try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){} document.removeEventListener('click', outside); document.removeEventListener('keydown', onKey); } };
      document.addEventListener('keydown', onKey);

      // make the panel draggable by its header for convenience
      try{
        const header = panel.querySelector('.card__header');
        if(header){
          header.style.cursor = 'move';
          let dragging = false; let startX=0, startY=0; let baseLeft=0, baseTop=0;
          const onMouseDown = (e)=>{
            dragging = true; startX = e.clientX; startY = e.clientY; baseLeft = parseInt(panel.style.left||'0',10); baseTop = parseInt(panel.style.top||'0',10);
            document.body.style.userSelect = 'none';
            e.preventDefault();
          };
          const onMouseMove = (e)=>{
            if(!dragging) return;
            const dx = e.clientX - startX; const dy = e.clientY - startY;
            let nextLeft = baseLeft + dx; let nextTop = baseTop + dy;
            // clamp within viewport bounds
            const maxLeft = Math.max(0, window.innerWidth - (panel.offsetWidth||320) - 8);
            const maxTop = Math.max(0, window.innerHeight - (panel.offsetHeight||200) - 8) + window.scrollY;
            if(nextLeft < 8) nextLeft = 8; if(nextLeft > maxLeft) nextLeft = maxLeft;
            if(nextTop < 8) nextTop = 8; if(nextTop > maxTop) nextTop = maxTop;
            panel.style.left = nextLeft + 'px'; panel.style.top = nextTop + 'px';
          };
          const onMouseUp = ()=>{ if(!dragging) return; dragging = false; document.body.style.userSelect=''; };
          header.addEventListener('mousedown', onMouseDown);
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
          // cleanup on close
          panel._dragCleanup = ()=>{
            try{ header.removeEventListener('mousedown', onMouseDown); }catch(_){ }
            try{ document.removeEventListener('mousemove', onMouseMove); }catch(_){ }
            try{ document.removeEventListener('mouseup', onMouseUp); }catch(_){ }
          };
        }
      }catch(_){ }

      // clicking the backdrop also closes the panel
      backdrop.addEventListener('click', ()=>{ try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){} document.removeEventListener('click', outside); document.removeEventListener('keydown', onKey); if(panel._dragCleanup) panel._dragCleanup(); });

      const save = async ()=>{
        const title = panel.querySelector('[data-subtitle]').value.trim();
        const sVal = panel.querySelector('[data-substart]').value;
        const eVal = panel.querySelector('[data-subend]').value;
        const done = !!panel.querySelector('[data-subdone]').checked;
        if(!title){ this.app.showNotification(t('subtask.titleRequired','Title required'), 'error'); return; }
        if(sVal && eVal && new Date(eVal) < new Date(sVal)){
          const err = t('gantt.dateRangeError','End date must be >= start date'); this.app.showNotification(err, 'error'); return;
        }
        const prev = { title: s.title, startDate: s.startDate||null, dueDate: s.dueDate||null, completed: !!s.completed };
        s.title = title; s.startDate = sVal ? sVal : null; s.dueDate = eVal ? eVal : null; s.completed = done;
        try{
          if(this.app.store && this.app.store._isSupabase && this.app.store.updateSubtask){
            const ok = await this.app.store.updateSubtask(s.id, { title: s.title, startDate: s.startDate, dueDate: s.dueDate, completed: s.completed });
            if(ok !== true){ Object.assign(s, prev); this.app.showNotification('Nu pot salva subtask-ul', 'error'); return; }
          } else if (this.app.store && typeof this.app.store.save === 'function') {
            this.app.store.save();
          }
        }catch(e){ Object.assign(s, prev); }
        // update progress if app provides helper
        try{ this.app.updateTaskComputedProgress && this.app.updateTaskComputedProgress(taskId); }catch(_){ }
        this.render();
        // reopen to the same subtask for continuous editing
        const newAnchor = this.timelineBody().querySelector(`.gantt-bar.gantt-bar-subtask[data-subtask-id="${subtaskId}"]`) || anchorEl;
        this.openSubtaskPanel(taskId, subtaskId, newAnchor);
        this.app.showNotification(t('gantt.changesSaved','Changes saved'), 'success');
      };

      const del = async ()=>{
        const idx = (task.subtasks||[]).findIndex(x=> x.id===subtaskId);
        if(idx<0) return; const removed = task.subtasks[idx]; task.subtasks.splice(idx,1);
        try{
          if(this.app.store && this.app.store._isSupabase && this.app.store.deleteSubtask){
            const ok = await this.app.store.deleteSubtask(subtaskId);
            if(ok !== true){ task.subtasks.splice(idx,0,removed); this.app.showNotification('Nu pot șterge subtask-ul', 'error'); return; }
          } else if (this.app.store && typeof this.app.store.save === 'function') {
            this.app.store.save();
          }
        }catch(e){ task.subtasks.splice(idx,0,removed); }
        try{ this.app.updateTaskComputedProgress && this.app.updateTaskComputedProgress(taskId); }catch(_){ }
        this.render(); try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){} if(panel._dragCleanup) panel._dragCleanup();
      };

      panel.querySelector('[data-action="save"]').onclick = save;
      panel.querySelector('[data-action="delete"]').onclick = del;
      panel.querySelector('[data-action="close"]').onclick = ()=>{ try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){} if(panel._dragCleanup) panel._dragCleanup(); };
      this.detailPanel = panel;
    }

    // lightweight color adjuster for subtask bars (tint toward white)
    _lightenColor(hex, amount){
      try{
        const c = hex.replace('#',''); const num = parseInt(c,16); const r=(num >> 16); const g=(num>>8)&255; const b=num&255;
        const mix = (v)=> Math.round(v + (255 - v) * amount);
        return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
      }catch(e){ return hex; }
    }

    renderDependencies(tasks){
      // simple straight lines (horizontal + elbow) using absolutely positioned divs or svg overlay
      // we'll create an SVG overlay once
      let svg = document.getElementById('ganttDeps');
      if(!svg){ svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.id='ganttDeps'; svg.style.position='absolute'; svg.style.top='0'; svg.style.left='0'; svg.style.width='100%'; svg.style.height='100%'; // do not block interactions with bars/handles; individual paths enable pointer events
        // place dependency SVG above milestone diamonds so arrows can render on top
        svg.style.pointerEvents='none'; svg.style.opacity='0'; svg.style.zIndex = '250'; this.timelineBody().appendChild(svg); }
      // fade out existing paths then redraw for smooth update
      svg.style.opacity = '0';
      setTimeout(()=>{
        svg.innerHTML='';
        const rect = this.timelineBody().getBoundingClientRect();
  // include milestone elements as valid bar targets/sources as well
  const bars = Array.from(this.timelineBody().querySelectorAll('.gantt-bar, .gantt-milestone'));
        const barByTask = {}; bars.forEach(b=> barByTask[b.dataset.taskId]=b);
        // collect all dependency edges first so we can group by corridor
        const edges = [];
        tasks.forEach(t=>{
          if(t.dependencies){ t.dependencies.forEach(depId=>{
            const fromBar=barByTask[depId]; const toBar=barByTask[t.id]; if(!fromBar||!toBar) return;
            edges.push({ fromId: depId, toId: t.id, fromBar, toBar });
          }); }
        });

        // group edges by corridor key (startX_endX)
        const groups = {};
        edges.forEach(edge=>{
          const fromRect = edge.fromBar.getBoundingClientRect(); const toRect = edge.toBar.getBoundingClientRect();
          const startX = Math.round(fromRect.right - rect.left); const endX = Math.round(toRect.left - rect.left);
          const corridorKey = `${startX}_${endX}`;
          edge.fromRect = fromRect; edge.toRect = toRect; edge.corridorKey = corridorKey;
          if(!groups[corridorKey]) groups[corridorKey]=[];
          groups[corridorKey].push(edge);
        });

        // create defs with two arrow markers (normal + critical) and a subtle drop shadow filter
        const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
        defs.innerHTML = `
          <filter id="depShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.12" />
          </filter>
          <!-- smaller normal arrow head -->
          <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L4,3 z" fill="var(--color-warning)" /></marker>
          <!-- smaller critical arrow head -->
          <marker id="arrowHeadCritical" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L0,8 L6,4 z" fill="var(--color-red-500)" /></marker>
        `;
        svg.appendChild(defs);

  // spacing for stagger (px per step)
  const spacing = 20;
  // limit primary lanes to N to avoid too many close lines; extras will be routed with larger multiplier
  const MAX_PRIMARY_LANES = 5;
  const OVERFLOW_MULTIPLIER = 1.8;
        // iterate groups and render paths with computed stagger offsets
        Object.keys(groups).forEach(key=>{
          let list = groups[key];
          // stable visual ordering: sort by source vertical position so arrows are placed symmetrically
          try{ list = list.sort((a,b)=> (a.fromRect.top - b.fromRect.top) || (a.toRect.top - b.toRect.top)); }catch(e){}
          // render each edge - place edges to produce a symmetric, centered layout
          for(let i=0;i<list.length;i++){
            const edge = list[i];
            const fromRect = edge.fromRect; const toRect = edge.toRect;
            // determine if successor is late (simple heuristic)
            let depClass = 'dep-normal';
            try{
              const successor = this.app.data.tasks.find(tt=> tt.id === edge.toId);
              if(successor){ const due = new Date(successor.dueDate); const today = new Date(); if(successor.status !== 'Done' && !isNaN(due.getTime()) && due < new Date(today.getFullYear(), today.getMonth(), today.getDate())) depClass='dep-critical'; }
            }catch(e){}

            // compute a base mid Y: prefer the vertical gap between the two bars if available
            // use a slightly smaller padding so modest gaps between bars are recognized
            const paddingLocal = 4;
            let baseMidYLocal = null;
            try{
              const aTop = fromRect.top - rect.top, aBottom = fromRect.bottom - rect.top, bTop = toRect.top - rect.top, bBottom = toRect.bottom - rect.top;
              if(aBottom + paddingLocal < bTop - paddingLocal){ const gapTop = aBottom + paddingLocal; const gapBottom = bTop - paddingLocal; baseMidYLocal = gapTop + (gapBottom - gapTop)/2; }
              else if(bBottom + paddingLocal < aTop - paddingLocal){ const gapTop = bBottom + paddingLocal; const gapBottom = aTop - paddingLocal; baseMidYLocal = gapTop + (gapBottom - gapTop)/2; }
            }catch(e){ baseMidYLocal = null; }
            if(baseMidYLocal === null){ baseMidYLocal = Math.max(fromRect.bottom, toRect.bottom) + paddingLocal - rect.top; }

            // pick a non-overlapping lane for this corridor.
            // Try primary lanes symmetric around center up to MAX_PRIMARY_LANES, then overflow lanes routed farther away.
            const occupied = [];
            try{ Array.from(svg.querySelectorAll('path.gantt-dep-path[data-mid-y]')).forEach(p=>{ const v=parseFloat(p.getAttribute('data-mid-y')); if(!isNaN(v)) occupied.push(v); }); }catch(e){}
            const minSeparation = Math.max(10, spacing * 0.6);
            // build candidate offsets: 0, +1, -1, +2, -2 ... but with primary limit
            const candidateOffsets = [];
            const primaryHalf = Math.floor((MAX_PRIMARY_LANES - 1) / 2);
            candidateOffsets.push(0);
            for(let s=1; s<=primaryHalf; s++){ candidateOffsets.push(s); candidateOffsets.push(-s); }
            for(let s=primaryHalf+1; s<12; s++){ candidateOffsets.push(s); candidateOffsets.push(-s); }

            let chosenMidY = null;
            for(const co of candidateOffsets){
              const overflowMultiplier = (Math.abs(co) <= primaryHalf) ? 1 : OVERFLOW_MULTIPLIER;
              const cand = baseMidYLocal + (co * spacing * overflowMultiplier);
              if(cand < 2 || cand > rect.height - 2) continue;
              let conflict = false;
              for(const used of occupied){ if(Math.abs(used - cand) < minSeparation){ conflict = true; break; } }
              if(!conflict){ chosenMidY = cand; occupied.push(cand); break; }
            }
            if(chosenMidY === null){ chosenMidY = baseMidYLocal + ((i - (list.length-1)/2) * spacing); }
            const offset = Math.round(chosenMidY - baseMidYLocal);
            const d = this._depPathBetweenRects(fromRect, toRect, rect, offset, { fromEl: edge.fromBar, toEl: edge.toBar });
            const path = document.createElementNS('http://www.w3.org/2000/svg','path');
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', depClass === 'dep-critical' ? 'url(#arrowHeadCritical)' : 'url(#arrowHead)');
            path.setAttribute('class', depClass);
            path.setAttribute('stroke', depClass === 'dep-critical' ? 'var(--color-red-500)' : 'var(--color-warning)');
            // dashed for non-critical edges to reduce visual weight
            if(depClass === 'dep-critical') path.removeAttribute('stroke-dasharray'); else path.setAttribute('stroke-dasharray','6,4');
            path.style.pointerEvents = 'auto';
            // slightly thinner strokes and rounded caps for a cleaner look
            path.setAttribute('stroke-width', depClass === 'dep-critical' ? '2.6' : '1.8');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            // subtle shadow to lift arrows above background
            path.setAttribute('filter', 'url(#depShadow)');
            const fromTask = this.app.data.tasks.find(tt=> tt.id === edge.fromId);
            const toTask = this.app.data.tasks.find(tt=> tt.id === edge.toId);
            const tip = `${fromTask?fromTask.title:'?'} → ${toTask?toTask.title:'?'}${depClass==='dep-critical' ? ' (critic/întârziat)' : ''}`;
            path.setAttribute('title', tip);
            path.style.cursor = 'pointer';
            path.setAttribute('data-dep-from', edge.fromId);
            path.setAttribute('data-dep-to', edge.toId);
            path.setAttribute('data-start-key', edge.corridorKey);
            path.setAttribute('data-mid-y', (baseMidYLocal + offset).toFixed(1));
            // click handler (delete with confirm + undo)
            path.addEventListener('click', (ev)=>{
              ev.stopPropagation();
              try{
                const fromId = ev.currentTarget.getAttribute('data-dep-from'); const toId = ev.currentTarget.getAttribute('data-dep-to');
                const fromTask = this.app.data.tasks.find(tt=> tt.id===fromId);
                const toTask = this.app.data.tasks.find(tt=> tt.id===toId);
                const modal = document.getElementById('ganttSaveConfirmModal');
                if(!modal){
                  if(toTask && Array.isArray(toTask.dependencies)){
                    const idx = toTask.dependencies.indexOf(fromId);
                    if(idx>=0) {
                      toTask.dependencies.splice(idx,1);
                      // Persist dependency change
                      if(this.app.store && this.app.store._isSupabase && typeof this.app.store.setTaskDependencies === 'function'){
                        this.app.store.setTaskDependencies(toTask.id, toTask.dependencies.slice());
                      } else if(this.app.store && typeof this.app.store.save==='function') {
                        this.app.store.save();
                      }
                      this.renderDependencies(this.filteredTasks());
                      const msg = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.depDeleted') : 'Dependency deleted';
                      this.app.showNotification(msg,'success');
                    }
                  }
                  return;
                }
                const saveBtn = modal.querySelector('.gantt-confirm-save');
                const cancelBtn = modal.querySelector('.gantt-confirm-cancel');
                const cleanup = ()=>{ saveBtn.onclick = null; cancelBtn.onclick = null; modal.classList.add('hidden'); };
                {
                  const fmt = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.deleteDep.confirm') : 'Delete dependency: "{from} → {to}"?';
                  const msg = fmt.replace('{from}', fromTask?fromTask.title:'?').replace('{to}', toTask?toTask.title:'?');
                  modal.querySelector('.gantt-confirm-msg').textContent = msg;
                }
                this.app.showModal(modal);
                saveBtn.onclick = ()=>{
                  if(toTask && Array.isArray(toTask.dependencies)){
                    const idx = toTask.dependencies.indexOf(fromId); if(idx>=0) {
                      this._lastRemovedDependency = { fromId, toId };
                      toTask.dependencies.splice(idx,1);
                      if(this.app.store && this.app.store._isSupabase && typeof this.app.store.setTaskDependencies === 'function'){
                        this.app.store.setTaskDependencies(toTask.id, toTask.dependencies.slice());
                      } else if(this.app.store && typeof this.app.store.save==='function') {
                        this.app.store.save();
                      }
                      try{
                        const undoLabel = (this.app && typeof this.app.t === 'function') ? (this.app.t('undo') || 'Undo') : 'Undo';
                        const deletedMsg = (this.app && typeof this.app.t === 'function') ? (this.app.t('gantt.depDeleted') || 'Dependency deleted') : 'Dependency deleted';
                        Toast.push(deletedMsg, 'info', 6000, undoLabel, ()=>{
                          const tsk = this.app.data.tasks.find(tt=> tt.id === toId);
                          if(tsk){
                            tsk.dependencies = tsk.dependencies || [];
                            if(!tsk.dependencies.includes(fromId)) tsk.dependencies.push(fromId);
                            if(this.app.store && this.app.store._isSupabase && typeof this.app.store.setTaskDependencies === 'function'){
                              this.app.store.setTaskDependencies(tsk.id, tsk.dependencies.slice());
                            } else if(this.app.store && typeof this.app.store.save === 'function') {
                              this.app.store.save();
                            }
                            this.render();
                          }
                        });
                      }catch(e){}
                    }
                  }
                  const msgDel = (this.app && typeof this.app.t === 'function') ? (this.app.t('gantt.depDeleted') || 'Dependency deleted') : 'Dependency deleted';
                  this.app.showNotification(msgDel, 'success');
                  cleanup();
                  this.render();
                };
                cancelBtn.onclick = ()=>{ if(this.app && typeof this.app.t === 'function') this.app.showNotification(this.app.t('gantt.deleteCanceled'),'info'); else this.app.showNotification('Deletion cancelled','info'); cleanup(); };
                const modalClose = modal.querySelector('.modal-close'); if(modalClose) modalClose.onclick = ()=> cancelBtn.onclick();
              }catch(err){ console.warn('Failed to handle dep click', err); }
            });
            path.classList.add('gantt-dep-path');
            // interactivity: hover to highlight this arrow, fade others, and show an inline label
            path.addEventListener('mouseenter', ()=>{
              try{
                const all = svg.querySelectorAll('.gantt-dep-path');
                all.forEach(p=>{ if(p!==path) p.style.opacity = '0.25'; else p.style.opacity = '1'; });
                // bring current to top by re-appending
                path.parentNode.appendChild(path);
                // show inline label near the midpoint
                try{
                  const fromTask = this.app.data.tasks.find(tt=> tt.id === edge.fromId);
                  const toTask = this.app.data.tasks.find(tt=> tt.id === edge.toId);
                  const label = `${fromTask?fromTask.title:'?'} → ${toTask?toTask.title:'?'} `;
                  const tip = document.createElement('div');
                  tip.className = 'gantt-dep-tooltip';
                  tip.textContent = label;
                  // basic styling
                  tip.style.position = 'absolute'; tip.style.zIndex = '1200'; tip.style.padding = '6px 8px'; tip.style.background = 'rgba(0,0,0,0.75)'; tip.style.color = '#fff'; tip.style.borderRadius = '6px'; tip.style.fontSize = '12px'; tip.style.pointerEvents = 'none'; tip.style.whiteSpace = 'nowrap';
                  // compute midpoint in container coords
                  const rectC = this.timelineBody().getBoundingClientRect();
                  const fx = fromRect.right - rectC.left; const fy = fromRect.top + fromRect.height/2 - rectC.top;
                  const tx = toRect.left - rectC.left; const ty = toRect.top + (toRect.height||8)/2 - rectC.top;
                  const midX = Math.round((fx + tx)/2); const midY = Math.round((fy + ty)/2);
                  tip.style.left = (midX + 8) + 'px'; tip.style.top = (midY - 18) + 'px';
                  this.timelineBody().appendChild(tip);
                  path._tipEl = tip;
                }catch(e){}
              }catch(e){}
            });
            path.addEventListener('mouseleave', ()=>{
              try{ const all = svg.querySelectorAll('.gantt-dep-path'); all.forEach(p=> p.style.opacity = '1'); }catch(e){}
              try{ if(path._tipEl){ path._tipEl.remove(); delete path._tipEl; } }catch(e){}
            });

            svg.appendChild(path);
          }
        });
        // draw faint horizontal lane dividers for clarity under the bars
        try{
          const laneYs = [];
          Array.from(svg.querySelectorAll('path.gantt-dep-path[data-mid-y]')).forEach(p=>{ const v=parseFloat(p.getAttribute('data-mid-y')); if(!isNaN(v) && laneYs.indexOf(v)===-1) laneYs.push(v); });
          if(laneYs.length){
            const lanesGroup = document.createElementNS('http://www.w3.org/2000/svg','g'); lanesGroup.id='ganttDepLanes';
            laneYs.sort((a,b)=>a-b).forEach(y=>{
              const line = document.createElementNS('http://www.w3.org/2000/svg','line');
              line.setAttribute('x1','0'); line.setAttribute('x2', String(this.cachedUnits.length * this.unitWidth));
              line.setAttribute('y1', String(y)); line.setAttribute('y2', String(y));
              line.setAttribute('stroke','rgba(0,0,0,0.06)'); line.setAttribute('stroke-width','1'); line.setAttribute('stroke-dasharray','4,6');
              lanesGroup.appendChild(line);
            });
            svg.insertBefore(lanesGroup, svg.firstChild);
          }
        }catch(e){}
        // fade in
        setTimeout(()=> svg.style.opacity='1', 20);
      }, 120);
      
    }

    filteredTasks(){
      const base = (this.app && typeof this.app.getFilteredTasks === 'function') ? this.app.getFilteredTasks() : (this.app && this.app.data ? (this.app.data.tasks || []) : []);
      const projSel = this.projectFilterEl() ? Array.from(this.projectFilterEl().selectedOptions).map(o=>o.value).filter(Boolean) : [];
      const assSel = this.assigneeFilterEl() ? Array.from(this.assigneeFilterEl().selectedOptions).map(o=>o.value).filter(Boolean) : [];

      return base.map(orig => {
        const t = Object.assign({}, orig);
        const project = this.app.data.projects ? this.app.data.projects.find(p=>p.id===t.projectId) : null;
        if (t.startDate === '') t.startDate = undefined;
        if (t.dueDate === '') t.dueDate = undefined;
        let inferred = false;
        if (!t.startDate) {
          if (project && project.startDate) { t.startDate = project.startDate; inferred = true; }
          else if (t.dueDate) { t.startDate = t.dueDate; inferred = true; }
          else { t.startDate = new Date().toISOString().split('T')[0]; inferred = true; }
        }
        if (!t.dueDate) {
          if (project && project.dueDate) { t.dueDate = project.dueDate; inferred = true; }
          else if (t.startDate) { t.dueDate = t.startDate; inferred = inferred || true; }
          else { t.dueDate = new Date().toISOString().split('T')[0]; inferred = true; }
        }
        t._inferred = inferred;
        return t;
      }).filter(t=> (
        (typeof t._ganttVisible === 'undefined' || t._ganttVisible === 1) &&
        (projSel.length === 0 || projSel.includes(t.projectId)) &&
        (assSel.length === 0 || (t.assignedTo && assSel.includes(t.assignedTo)))
      ));
    }

    renderTodayLine(){
      const existing = this.timelineBody().querySelector('.gantt-today-line');
      const today = new Date(); const idx=this.unitIndex(today);
      if(idx<0){ if(existing) existing.remove(); return; }
      const leftPos = (idx*this.unitWidth+this.unitWidth/2)+'px';
      if(!existing){ const line=document.createElement('div'); line.className='gantt-today-line'; line.style.left=leftPos; line.style.opacity='0'; this.timelineBody().appendChild(line); setTimeout(()=> line.style.opacity='1', 20); }
      else { existing.style.opacity='0'; setTimeout(()=>{ existing.style.left=leftPos; existing.style.opacity='1'; }, 80); }
    }

    projectColor(projectId){ const p=this.app.data.projects.find(p=>p.id===projectId); return p?.color || 'var(--color-primary)'; }
    taskProgress(t){ if(!t.subtasks||!t.subtasks.length) return t.status==='Done'?100:0; const c=t.subtasks.filter(s=>s.completed).length; return Math.round(c/t.subtasks.length*100); }
    userName(id){ const u=this.app.data.users.find(u=>u.id===id); return u?u.name:''; }

    // detect whether adding edge sourceId -> targetId would create a cycle
    _createsCycle(sourceId, targetId){
      try{
        if(!sourceId || !targetId) return false;
        if(sourceId === targetId) return true;
        const tasks = this.app && this.app.data && Array.isArray(this.app.data.tasks) ? this.app.data.tasks : [];
        // build adjacency: for each dep in task.dependencies: dep -> task.id
        const adj = {};
        tasks.forEach(t=>{
          (t.dependencies||[]).forEach(dep => {
            if(!adj[dep]) adj[dep]=[];
            adj[dep].push(t.id);
          });
        });
        // DFS from target to see if we can reach source
        const stack = [targetId]; const visited = new Set();
        while(stack.length){
          const cur = stack.pop();
          if(cur === sourceId) return true;
          if(visited.has(cur)) continue;
          visited.add(cur);
          const neigh = adj[cur] || [];
          neigh.forEach(n=>{ if(!visited.has(n)) stack.push(n); });
        }
        return false;
      }catch(e){ return false; }
    }

    // Route a polyline path from rect a -> rect b around the outside of both rects.
    // containerRect is the bounding rect of timeline body used to convert client coords to local coords.
  _depPathBetweenRects(aRect, bRect, containerRect, staggerOffset = 0, opts = {}){
      try{
        // convert to local coords
        const a = { left: aRect.left - containerRect.left, right: aRect.right - containerRect.left, top: aRect.top - containerRect.top, bottom: aRect.bottom - containerRect.top, width: aRect.width, height: aRect.height };
        const b = { left: bRect.left - containerRect.left, right: bRect.right - containerRect.left, top: bRect.top - containerRect.top, bottom: bRect.bottom - containerRect.top, width: bRect.width || 8, height: bRect.height || 8 };
        // reduce padding so modest vertical gaps are treated as usable routing corridors
        const padding = 4;
        // Prefer routing through the vertical gap between the two bars if available.
        let baseMidY = null;
        try{
          const aTop = a.top, aBottom = a.bottom, bTop = b.top, bBottom = b.bottom;
          if(aBottom + padding < bTop - padding){ const gapTop = aBottom + padding; const gapBottom = bTop - padding; baseMidY = gapTop + (gapBottom - gapTop)/2; }
          else if(bBottom + padding < aTop - padding){ const gapTop = bBottom + padding; const gapBottom = aTop - padding; baseMidY = gapTop + (gapBottom - gapTop)/2; }
        }catch(e){ baseMidY = null; }
        if(baseMidY === null){ const belowY = Math.max(a.bottom, b.bottom) + padding; baseMidY = belowY; }
  // We'll anchor the path endpoints at the visual centers of the bars
  // account for the small orange handle that sits outside the bar (right: -6px, width:12px)
  const HANDLE_OUTSET = 6;
  const startX = a.right + HANDLE_OUTSET; // origin near the orange handle center
  const startYCenter = a.top + (a.height / 2);
  // target at left edge of the destination bar (center vertically)
  const ARROW_HEAD_INSET = 6; // leave a small inset so the arrow head sits nicely
  const endXCoord = b.left - ARROW_HEAD_INSET;
  const endYCenter = b.top + (b.height / 2);

  // compute a midline Y that tries to pass between the bars when possible,
  // otherwise routes below both. We add the staggerOffset to midY only.
        const approachPad = 2; // small approach padding used in gap check
        const minGap = 2;
        let midY = null;
        try{
          const gapTopCandidate = Math.max(a.bottom + approachPad, b.top + approachPad);
          const gapBottomCandidate = Math.min(b.top - approachPad, a.top - approachPad);
          // preferred gap between bars (either a above b or b above a)
          if(a.bottom + padding < b.top - padding){ const gapTop = a.bottom + padding; const gapBottom = b.top - padding; midY = gapTop + (gapBottom - gapTop)/2; }
          else if(b.bottom + padding < a.top - padding){ const gapTop = b.bottom + padding; const gapBottom = a.top - padding; midY = gapTop + (gapBottom - gapTop)/2; }
        }catch(e){ midY = null; }
        if(midY === null){ midY = Math.max(a.bottom, b.bottom) + padding; }
        midY = midY + (staggerOffset || 0);

        // No special-case nudging for milestones here — rendering order (SVG z-index)
        // will determine whether arrows appear above the milestone. Keep routing
        // generic so the path ends at the expected corner/center positions.

        // horizontal inset points before/after the curve region
  const outX = startX + 12;
  const inX = endXCoord - 12;
        // produce a rounded path using small quadratic curves at elbows (r = 6)
        const r = 6;
  // Build a rounded path starting at the center of the source handle and ending at
  // the center of the target bar. The path leaves the source horizontally, curves
  // to midY, then approaches the target horizontally and drops into the center.
  const d = [];
  d.push(`M ${startX} ${startYCenter}`);
  d.push(`L ${outX} ${startYCenter}`);
  // curve toward midY (quadratic)
  d.push(`Q ${outX} ${ (startYCenter + midY)/2 } ${outX} ${midY}`);
  d.push(`L ${inX} ${midY}`);
  // curve down/up toward target center
  // Final approach: curve down/up toward target center
  const finalEndY = endYCenter;
  d.push(`Q ${inX} ${ (midY + finalEndY)/2 } ${inX} ${finalEndY}`);
  d.push(`L ${endXCoord} ${finalEndY}`);
  return d.join(' ');
      }catch(e){
        try{
          const rect = containerRect;
          const fallbackMidX = (((aRect.left + aRect.right)/2) + ((bRect.left + bRect.right)/2))/2 - rect.left;
          const startY = aRect.top + aRect.height/2 - rect.top;
          const endY = bRect.top + (bRect.height||8)/2 - rect.top;
          return `M ${aRect.right - rect.left} ${startY} L ${fallbackMidX} ${startY} L ${fallbackMidX} ${endY} L ${bRect.left - rect.left} ${endY}`;
        }catch(ee){
          return `M 0 0 L 0 0`;
        }
      }
    }

    handleMouseDown(e){
      const depStart = e.target.closest('.gantt-bar-dep');
      const handle = e.target.closest('.gantt-bar-handle');
      const bar = e.target.closest('.gantt-bar');
      // Dependency creation is handled only via dragging from the small yellow handle on each bar.
      // start creating dependency when dep handle is used
      if(depStart){
        const sourceId = depStart.dataset.depSource;
        // allow milestone as source too
        const sourceBar = this.timelineBody().querySelector(`.gantt-bar[data-task-id="${sourceId}"], .gantt-milestone[data-task-id="${sourceId}"]`);
        if(!sourceBar) return;
        const rect = this.timelineBody().getBoundingClientRect();
        const fromRect = sourceBar.getBoundingClientRect();
        const fromX = fromRect.left + fromRect.width - rect.left;
        const fromY = fromRect.top + fromRect.height/2 - rect.top;
        // create temp SVG overlay for interactive arrow
        let svg = document.getElementById('ganttDepsTemp');
        if(!svg){ svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.id='ganttDepsTemp'; svg.style.position='absolute'; svg.style.top='0'; svg.style.left='0'; svg.style.width='100%'; svg.style.height='100%'; svg.style.pointerEvents='none'; svg.style.zIndex='1100'; this.timelineBody().appendChild(svg); }
        svg.innerHTML = '';
        const defs = document.createElementNS('http://www.w3.org/2000/svg','defs'); defs.innerHTML = '<marker id="tempArrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L4,3 z" fill="var(--color-warning)"/></marker>';
        svg.appendChild(defs);
        // build an initial tiny target rect slightly to the right so the router produces
        // a path that starts at the orange handle center (using the same offset logic)
        const initToRect = { left: fromRect.right + 20, right: fromRect.right + 28, top: fromRect.top + fromRect.height/2 - 4, bottom: fromRect.top + fromRect.height/2 + 4, width:8, height:8 };
        const initialD = this._depPathBetweenRects(fromRect, initToRect, rect, 0, { fromEl: sourceBar });
        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d', initialD);
        path.setAttribute('stroke', 'var(--color-warning)'); path.setAttribute('stroke-width','3'); path.setAttribute('fill','none'); path.setAttribute('marker-end','url(#tempArrow)');
        svg.appendChild(path);
        // store drag state for dependency creation
        this.dragState = { type: 'create-dep', sourceId, startX: e.clientX, from: { x: fromX, y: fromY }, _fromRect: fromRect, _fromEl: sourceBar, _tempSvg: svg, _tempPath: path };
        e.preventDefault();
        return;
      }
      if(handle && bar){
        // could be parent task or subtask (subtasks don't have handles currently, but allow for future)
        const isSub = bar.classList.contains('gantt-bar-subtask');
        if(isSub){
          const subId = bar.dataset.subtaskId; const parentId = bar.dataset.parentTaskId;
          const parentTask = this.app.data.tasks.find(t=> t.id === parentId); if(!parentTask) return;
          const sub = parentTask.subtasks.find(s=> s.id === subId); if(!sub) return;
          const type = handle.dataset.handle==='left' ? 'resize-left-sub':'resize-right-sub';
          this.dragState={ type, subId, parentId, startX: e.clientX, origStart: new Date(sub.startDate || parentTask.startDate), origEnd: new Date(sub.dueDate || parentTask.dueDate), _origSnapshot: { startDate: sub.startDate, dueDate: sub.dueDate } };
          e.preventDefault();
        } else {
          const taskId=bar.dataset.taskId; const task=this.app.data.tasks.find(t=>t.id===taskId); if(!task) return;
          const type = handle.dataset.handle==='left' ? 'resize-left':'resize-right';
          this.dragState={ type, taskId, startX: e.clientX, origStart: new Date(task.startDate), origEnd: new Date(task.dueDate), _origSnapshot: { startDate: task.startDate, dueDate: task.dueDate } };
          e.preventDefault();
        }
      } else if(bar && !handle){
        // Move entire bar (task or subtask)
        if(bar.classList.contains('gantt-bar-subtask')){
          const subId = bar.dataset.subtaskId; const parentId = bar.dataset.parentTaskId; const parentTask = this.app.data.tasks.find(t=> t.id===parentId); if(!parentTask) return;
          const sub = parentTask.subtasks.find(s=> s.id===subId); if(!sub) return;
          this.dragState={ type:'move-sub', subId, parentId, startX:e.clientX, origStart:new Date(sub.startDate || parentTask.startDate), origEnd:new Date(sub.dueDate || parentTask.dueDate), _origSnapshot: { startDate: sub.startDate, dueDate: sub.dueDate } };
          e.preventDefault();
        } else {
          const taskId=bar.dataset.taskId; const task=this.app.data.tasks.find(t=>t.id===taskId); if(!task) return;
          this.dragState={ type:'move', taskId, startX:e.clientX, origStart:new Date(task.startDate), origEnd:new Date(task.dueDate), _origSnapshot: { startDate: task.startDate, dueDate: task.dueDate } };
          e.preventDefault();
        }
      }
    }

    handleMouseMove(e){
      if(!this.dragState) return;
      // interactive dependency path update
      if(this.dragState.type === 'create-dep'){
        const svg = this.dragState._tempSvg; const path = this.dragState._tempPath; if(!svg || !path) return;
        try{
          const rect = this.timelineBody().getBoundingClientRect();
          // build a synthetic toRect around pointer so we can route outside bars
          const toClientX = e.clientX; const toClientY = e.clientY;
          const toRect = { left: toClientX - 4, right: toClientX + 4, top: toClientY - 4, bottom: toClientY + 4, width:8, height:8 };
          // attempt to detect hovered target bar (or milestone) so we can match severity and stagger
          let hoveredEl = null;
          try{ svg.style.display='none'; hoveredEl = document.elementFromPoint(toClientX, toClientY); svg.style.display=''; }catch(ex){ try{ hoveredEl = document.elementFromPoint(toClientX, toClientY); }catch(_) { hoveredEl = null; } }
          let strokeColor = 'var(--color-warning)'; let markerRef = 'url(#tempArrow)'; let staggerOffset = 0;
          if(hoveredEl){
            const targetBar = hoveredEl.closest && hoveredEl.closest('.gantt-bar, .gantt-milestone');
            if(targetBar){
              const targetId = targetBar.dataset.taskId;
              if(targetId){
                try{
                  const successor = this.app.data.tasks.find(tt=> tt.id === targetId);
                  if(successor){ const due = new Date(successor.dueDate); const today = new Date(); if(successor.status !== 'Done' && !isNaN(due.getTime()) && due < new Date(today.getFullYear(), today.getMonth(), today.getDate())){ strokeColor = 'var(--color-red-500)'; markerRef = 'url(#arrowHeadCritical)'; } }
                }catch(e){ }
                // compute corridor key and count existing edges to compute stagger index
                try{
                  const fromRect = this.dragState._fromRect; const toRectCalc = targetBar.getBoundingClientRect();
                  const startX = Math.round(fromRect.right - rect.left); const endX = Math.round(toRectCalc.left - rect.left);
                  const corridorKey = `${startX}_${endX}`;
                  // match permanent lane selection logic
                  const spacing = 20;
                  const paddingLocal = 4;
                  // prefer the vertical gap between bars for preview when available
                  let baseMidYLocal = null;
                  try{
                    const aTop = fromRect.top - rect.top, aBottom = fromRect.bottom - rect.top, bTop = toRectCalc.top - rect.top, bBottom = toRectCalc.bottom - rect.top;
                    if(aBottom + paddingLocal < bTop - paddingLocal){ const gapTop = aBottom + paddingLocal; const gapBottom = bTop - paddingLocal; baseMidYLocal = gapTop + (gapBottom - gapTop)/2; }
                    else if(bBottom + paddingLocal < aTop - paddingLocal){ const gapTop = bBottom + paddingLocal; const gapBottom = aTop - paddingLocal; baseMidYLocal = gapTop + (gapBottom - gapTop)/2; }
                  }catch(e){ baseMidYLocal = null; }
                  if(baseMidYLocal === null) baseMidYLocal = Math.max(fromRect.bottom, toRectCalc.bottom) + paddingLocal - rect.top;
                  const occupied = [];
                  Array.from(document.querySelectorAll('#ganttDeps path.gantt-dep-path[data-mid-y]')).forEach(p=>{ const v=parseFloat(p.getAttribute('data-mid-y')); if(!isNaN(v)) occupied.push(v); });
                  const minSeparation = Math.max(10, spacing * 0.6);
                  const MAX_PRIMARY_LANES = 5; const OVERFLOW_MULTIPLIER = 1.8;
                  const primaryHalf = Math.floor((MAX_PRIMARY_LANES - 1) / 2);
                  const candidateOffsets = [];
                  candidateOffsets.push(0);
                  for(let s=1; s<=primaryHalf; s++){ candidateOffsets.push(s); candidateOffsets.push(-s); }
                  for(let s=primaryHalf+1; s<12; s++){ candidateOffsets.push(s); candidateOffsets.push(-s); }
                  let chosenMidY = null;
                  for(const co of candidateOffsets){
                    const overflowMultiplier = (Math.abs(co) <= primaryHalf) ? 1 : OVERFLOW_MULTIPLIER;
                    const cand = baseMidYLocal + (co * spacing * overflowMultiplier);
                    if(cand < 2 || cand > rect.height - 2) continue;
                    let conflict = false;
                    for(const used of occupied){ if(Math.abs(used - cand) < minSeparation){ conflict = true; break; } }
                    if(!conflict){ chosenMidY = cand; occupied.push(cand); break; }
                  }
                  if(chosenMidY === null) chosenMidY = baseMidYLocal;
                  staggerOffset = Math.round(chosenMidY - baseMidYLocal);
                }catch(e){ staggerOffset = 0; }
              }
            }
          }
          // if the pointer is over a real bar or milestone, use its bounding rect so the preview
          // endpoint lands at the element center; otherwise use a small pointer rect
          const hoveredTargetEl = (hoveredEl && hoveredEl.closest && hoveredEl.closest('.gantt-bar, .gantt-milestone')) ? hoveredEl.closest('.gantt-bar, .gantt-milestone') : null;
          const destRectForRouting = hoveredTargetEl ? hoveredTargetEl.getBoundingClientRect() : toRect;
          const d = this._depPathBetweenRects(this.dragState._fromRect, destRectForRouting, rect, staggerOffset, { fromEl: this.dragState._fromEl, toEl: hoveredTargetEl });
          path.setAttribute('d', d);
          path.setAttribute('stroke', strokeColor);
        }catch(err){ /* ignore */ }
        return;
      }
      const deltaPx = e.clientX - this.dragState.startX;
      const unitsMoved = Math.round(deltaPx / this.unitWidth);
      // handle updates for tasks and subtasks
      if(this.dragState.type && this.dragState.type.endsWith('-sub')){
        const parentTask = this.app.data.tasks.find(t=> t.id===this.dragState.parentId); if(!parentTask) return;
        const sub = parentTask.subtasks.find(s=> s.id===this.dragState.subId); if(!sub) return;
        if(this.dragState.type==='move-sub'){
          const newStart = new Date(this.dragState.origStart.getTime()); newStart.setDate(newStart.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          const newEnd = new Date(this.dragState.origEnd.getTime()); newEnd.setDate(newEnd.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          sub.startDate = newStart.toISOString().split('T')[0]; sub.dueDate = newEnd.toISOString().split('T')[0];
        } else if(this.dragState.type==='resize-left-sub'){
          const newStart = new Date(this.dragState.origStart.getTime()); newStart.setDate(newStart.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          if(newStart < new Date(sub.dueDate || parentTask.dueDate)) sub.startDate = newStart.toISOString().split('T')[0];
        } else if(this.dragState.type==='resize-right-sub'){
          const newEnd = new Date(this.dragState.origEnd.getTime()); newEnd.setDate(newEnd.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          if(newEnd > new Date(sub.startDate || parentTask.startDate)) sub.dueDate = newEnd.toISOString().split('T')[0];
        }
      } else {
        const task = this.app.data.tasks.find(t=>t.id===this.dragState.taskId);
        if(!task) return;
        if(this.dragState.type==='move'){
          const newStart = new Date(this.dragState.origStart.getTime()); newStart.setDate(newStart.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          const newEnd = new Date(this.dragState.origEnd.getTime()); newEnd.setDate(newEnd.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          task.startDate = newStart.toISOString().split('T')[0];
          task.dueDate = newEnd.toISOString().split('T')[0];
        } else if(this.dragState.type==='resize-left') {
          const newStart = new Date(this.dragState.origStart.getTime()); newStart.setDate(newStart.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          if(newStart < new Date(task.dueDate)) task.startDate=newStart.toISOString().split('T')[0];
        } else if(this.dragState.type==='resize-right') {
          const newEnd = new Date(this.dragState.origEnd.getTime()); newEnd.setDate(newEnd.getDate()+unitsMoved*(this.scaleEl().value==='month'?30:this.scaleEl().value==='week'?7:1));
          if(newEnd > new Date(task.startDate)) task.dueDate=newEnd.toISOString().split('T')[0];
        }
      }
      if(this.app.store){
        if(this.app.store._isSupabase && this.dragState && !this.dragState.subId && typeof this.app.store.updateTask === 'function'){
          const task = this.app.data.tasks.find(t=> t.id===this.dragState.taskId);
          if(task){
            this._pendingDragPersist[task.id] = { startDate: task.startDate || null, dueDate: task.dueDate || null };
            clearTimeout(this._dragDebounceTimer);
            this._dragDebounceTimer = setTimeout(()=>{
              const batch = { ...this._pendingDragPersist };
              this._pendingDragPersist = {};
              Object.entries(batch).forEach(([id,p])=>{
                try{ this.app.store.updateTask(id, p); }catch(e){ /* ignore individual */ }
              });
            }, 450);
          }
        } else if(typeof this.app.store.save === 'function') {
          // local mode: save frequently
          this.app.store.save();
        }
      }
      this.render();
    }

  handleMouseUp(e){
      if(!this.dragState) return;
      const pending = this.dragState;
      // handle completion of dependency creation
        if(pending && pending.type === 'create-dep'){
        try{
          // remove temp overlay after evaluating drop target
          const svg = pending._tempSvg; const path = pending._tempPath; if(svg){
            // determine element under pointer - temporarily hide the temp svg so elementFromPoint returns the underlying element
            let prevDisplay = svg.style.display;
            svg.style.display = 'none';
            const x = (e && typeof e.clientX === 'number') ? e.clientX : pending.startX;
            const y = (e && typeof e.clientY === 'number') ? e.clientY : pending.from.y + (this.timelineBody().getBoundingClientRect().top || 0);
            const el = document.elementFromPoint(x, y);
            // restore temp svg display
            svg.style.display = prevDisplay || '';
            let targetBar = el ? (el.closest && el.closest('.gantt-bar, .gantt-milestone')) : null;
            // If elementFromPoint didn't hit the expected element (SVG overlays or transforms can interfere),
            // try a more robust fallback: elementsFromPoint, then bounding-rect containment test.
            if(!targetBar){
              try{
                if(document.elementsFromPoint){
                  const list = document.elementsFromPoint(x, y);
                  for(const it of list){ const c = it.closest && it.closest('.gantt-bar, .gantt-milestone'); if(c){ targetBar = c; break; } }
                }
              }catch(_){}
            }
            if(!targetBar){
              try{
                // final fallback: check all bars/milestones and test their client rects for point containment
                const cand = Array.from(this.timelineBody().querySelectorAll('.gantt-bar, .gantt-milestone'));
                for(const c of cand){ const r = c.getBoundingClientRect(); if(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom){ targetBar = c; break; } }
              }catch(_){}
            }
            if(targetBar){
              const targetId = targetBar.dataset.taskId; const sourceId = pending.sourceId;
              if(targetId && sourceId && targetId !== sourceId){
                // cycle detection
                if(this._createsCycle(sourceId, targetId)){
                  const cycleMsg = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.cycleBlocked') : 'Operation blocked: would create cycle between tasks';
                  this.app.showNotification(cycleMsg, 'error');
                } else {
                  const targetTask = this.app.data.tasks.find(t=> t.id === targetId);
                  if(targetTask){
                    targetTask.dependencies = targetTask.dependencies || [];
                    if(!targetTask.dependencies.includes(sourceId)){
                      targetTask.dependencies.push(sourceId);
                      if(this.app.store && this.app.store._isSupabase && typeof this.app.store.setTaskDependencies === 'function'){
                        this.app.store.setTaskDependencies(targetTask.id, targetTask.dependencies.slice());
                      } else if(this.app.store && typeof this.app.store.save === 'function') {
                        this.app.store.save();
                      }
                      const createdMsg = (this.app && typeof this.app.t === 'function') ? (this.app.t('gantt.depCreated') || 'Dependency created') : 'Dependency created';
                      this.app.showNotification(createdMsg, 'success');
                    } else {
                      const existsMsg = (this.app && typeof this.app.t === 'function') ? (this.app.t('gantt.depExists') || 'Dependency already exists') : 'Dependency already exists';
                      this.app.showNotification(existsMsg, 'info');
                    }
                  }
                }
              }
            }
          }
        }catch(e){ console.warn('create-dep finalize failed', e); }
        try{ if(pending._tempSvg) pending._tempSvg.remove(); }catch(e){}
        this.dragState = null;
        // re-render dependencies to show new link
        try{ this.renderDependencies(this.filteredTasks()); }catch(e){}
        return;
      }
      // clear drag state early so intermediate events don't see it
      this.dragState = null;
      // If nothing actually changed (user just clicked without moving/resizing), skip confirmation
      // determine if a change happened for task or subtask
      if(!pending) return;
      let changed=false; let taskCheck=null;
      if(pending.subId){ const parent = this.app.data.tasks.find(t=> t.id===pending.parentId); if(parent){ const s = parent.subtasks.find(x=> x.id===pending.subId); if(s && pending._origSnapshot){ if(s.startDate !== pending._origSnapshot.startDate || s.dueDate !== pending._origSnapshot.dueDate) changed=true; } }} else { taskCheck = this.app.data.tasks.find(t=>t.id===pending.taskId); if(taskCheck && pending._origSnapshot){ if(taskCheck.startDate !== pending._origSnapshot.startDate || taskCheck.dueDate !== pending._origSnapshot.dueDate) changed=true; } }
      if(!changed) return;
      // attach modal callbacks
      const modal = document.getElementById('ganttSaveConfirmModal');
      const saveBtn = modal.querySelector('.gantt-confirm-save');
      const cancelBtn = modal.querySelector('.gantt-confirm-cancel');
      const cleanup = ()=>{
        saveBtn.onclick = null; cancelBtn.onclick = null;
        modal.querySelector('.modal-close').onclick = null;
        modal.classList.add('hidden');
      };
      modal.querySelector('.gantt-confirm-msg').textContent = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.confirmSaveMsg') : 'Save changes made to this task?';
      this.app.showModal(modal);
      saveBtn.onclick = ()=>{
        // nothing to do: changes already applied to model during drag; just persist
        if(this.app.store){
          if(this.app.store._isSupabase){
            if(pending.subId && this.app.store.updateSubtask){
              // Persist subtask date edits
              const parent = this.app.data.tasks.find(t=> t.id===pending.parentId);
              if(parent){ const s = parent.subtasks.find(x=> x.id===pending.subId); if(s){ this.app.store.updateSubtask(s.id, { startDate: s.startDate || null, dueDate: s.dueDate || null }); } }
            } else if(taskCheck && !pending.subId && typeof this.app.store.updateTask === 'function') {
              this.app.store.updateTask(taskCheck.id, { startDate: taskCheck.startDate || null, dueDate: taskCheck.dueDate || null });
            }
          } else if(typeof this.app.store.save==='function') {
            this.app.store.save();
          }
        }
        this.app.showNotification((this.app && typeof this.app.t === 'function') ? this.app.t('gantt.changesSaved') : 'Changes saved', 'success');
        cleanup();
        this.render();
      };
      cancelBtn.onclick = ()=>{
        // revert to original snapshot
        if(pending.subId){ const parent=this.app.data.tasks.find(t=> t.id===pending.parentId); if(parent){ const s = parent.subtasks.find(x=> x.id===pending.subId); if(s && pending._origSnapshot){ s.startDate = pending._origSnapshot.startDate; s.dueDate = pending._origSnapshot.dueDate; } }} else { const task = this.app.data.tasks.find(t=>t.id===pending.taskId); if(task && pending._origSnapshot){ task.startDate = pending._origSnapshot.startDate; task.dueDate = pending._origSnapshot.dueDate; } }
        this.app.showNotification((this.app && typeof this.app.t === 'function') ? this.app.t('gantt.changesCancelled') : 'Changes cancelled', 'info');
        cleanup();
        this.render();
      };
      modal.querySelector('.modal-close').onclick = ()=>{ cancelBtn.onclick(); };
    }

    openDetailPanel(taskId, anchorEl){
      const task=this.app.data.tasks.find(t=>t.id===taskId); if(!task) return;
      if(this.detailPanel) this.detailPanel.remove();
      // create backdrop beneath the panel
      const backdrop = document.createElement('div');
      backdrop.className = 'gantt-panel-backdrop';
      backdrop.style.position = 'fixed'; backdrop.style.top='0'; backdrop.style.left='0'; backdrop.style.right='0'; backdrop.style.bottom='0';
      backdrop.style.background = 'rgba(0,0,0,0.08)'; backdrop.style.zIndex='4995';
  const panel=document.createElement('div'); panel.className='card gantt-detail-panel'; panel.style.position='absolute'; panel.style.zIndex='5000';
      panel.style.minWidth='320px'; panel.style.maxWidth='420px';
      const rect=anchorEl.getBoundingClientRect();
      panel.style.top=(window.scrollY+rect.top+rect.height+8)+'px';
      panel.style.left=(rect.left)+'px';
      // labels for main task form
  const startLbl = (this.app && typeof this.app.t === 'function') ? this.app.t('label.start') : 'Start';
  const endLbl = (this.app && typeof this.app.t === 'function') ? this.app.t('label.end') : 'End';
      panel.innerHTML=`<div class='card__header'><h3 style='font-size:16px;margin:0;'>${task.title}</h3></div>
        <div class='card__body'>
          <div style='display:flex;flex-direction:column;gap:8px;'>
            <label>${(this.app && typeof this.app.t === 'function') ? this.app.t('label.start') : 'Start'} <input type='date' data-edit='start' value='${task.startDate||''}' class='form-control'/></label>
            <label>${(this.app && typeof this.app.t === 'function') ? this.app.t('label.end') : 'Final'} <input type='date' data-edit='end' value='${task.dueDate||''}' class='form-control'/></label>
            <label>${(this.app && typeof this.app.t === 'function') ? this.app.t('label.priority') : 'Prioritate'} <select data-edit='priority' class='form-control'>${['Low','Medium','High','Critical'].map(p=>`<option ${task.priority===p?'selected':''}>${p}</option>`).join('')}</select></label>
            <label>${(this.app && typeof this.app.t === 'function') ? this.app.t('label.status') : 'Status'} <select data-edit='status' class='form-control'>${['Not Started','In Progress','Review','Done'].map(s=>`<option ${task.status===s?'selected':''}>${s}</option>`).join('')}</select></label>
            <!-- Milestone toggle: when checked, the task is rendered as a diamond (milestone) -->
            <label style='display:flex;align-items:center;gap:8px;'><input type='checkbox' data-edit='milestone' ${task.milestone ? 'checked' : ''}/> ${(this.app && typeof this.app.t === 'function') ? this.app.t('gantt.milestoneTitle') : 'Milestone'}</label>
            <textarea data-edit='desc' class='form-control' rows='3' placeholder='${(this.app && typeof this.app.t === 'function') ? this.app.t('task.desc.placeholder') || 'Descriere' : 'Descriere'}'>${task.description||''}</textarea>
            <div style='margin-top:8px;'>
              <h4 style='margin:6px 0'>${(this.app && typeof this.app.t === 'function') ? this.app.t('subtask.header') : 'Subtasks'}</h4>
              <small class='text-muted' style='display:block;margin-bottom:6px;'>${(this.app && typeof this.app.t === 'function') ? (this.app.t('gantt.hint.editSubInTimeline') || 'Tip: Click a subtask bar in the timeline to edit it here.') : 'Tip: Click a subtask bar in the timeline to edit it here.'}</small>
              <div style='display:flex;gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap;'>
                <input id='detailNewSub' class='form-control' placeholder='${(this.app && typeof this.app.t === 'function') ? this.app.t('subtask.add.placeholder') : 'Add subtask...'}' style='flex:1;min-width:140px;'>
                <input id='detailNewSubStart' type='date' class='form-control' title='${(this.app && typeof this.app.t === 'function') ? this.app.t('label.start') : 'Start'}' style='width:140px;'>
                <input id='detailNewSubEnd' type='date' class='form-control' title='${(this.app && typeof this.app.t === 'function') ? this.app.t('label.end') : 'Final'}' style='width:140px;'>
                <button id='detailAddSub' class='btn btn--primary btn--sm'>${(this.app && typeof this.app.t === 'function') ? this.app.t('subtask.add') : 'Add'}</button>
              </div>
            </div>
            <div style='display:flex;gap:8px;margin-top:8px;'><button class='btn btn--primary btn--sm' data-action='save'>${(this.app && typeof this.app.t === 'function') ? this.app.t('btn.save') : 'Save'}</button><button class='btn btn--secondary btn--sm' data-action='close'>${(this.app && typeof this.app.t === 'function') ? this.app.t('btn.close') : 'Close'}</button></div>
          </div>
        </div>`;
      document.body.appendChild(backdrop);
      document.body.appendChild(panel);
      // setup outside click handler to close panel
      const outsideClickHandler = (ev)=>{
        if(!panel.contains(ev.target)){
          panel.classList.add('closing');
          setTimeout(()=> panel.remove(), 160);
          document.removeEventListener('click', outsideClickHandler);
          try{ backdrop.remove(); }catch(_){ }
        }
      };
      // use setTimeout to avoid immediately triggering from the click that opened it
      setTimeout(()=> document.addEventListener('click', outsideClickHandler), 10);
      // Escape key closes panel as well
      const keyHandler = (ev)=>{ if(ev.key === 'Escape' || ev.key === 'Esc'){ try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){ } document.removeEventListener('keydown', keyHandler); document.removeEventListener('click', outsideClickHandler); } };
      document.addEventListener('keydown', keyHandler);
      // make draggable by header
      try{
        const header = panel.querySelector('.card__header');
        if(header){
          header.style.cursor = 'move';
          let dragging=false, startX=0, startY=0, baseLeft=0, baseTop=0;
          const onMouseDown=(e)=>{ dragging=true; startX=e.clientX; startY=e.clientY; baseLeft=parseInt(panel.style.left||'0',10); baseTop=parseInt(panel.style.top||'0',10); document.body.style.userSelect='none'; e.preventDefault(); };
          const onMouseMove=(e)=>{ if(!dragging) return; const dx=e.clientX-startX; const dy=e.clientY-startY; let nextLeft=baseLeft+dx; let nextTop=baseTop+dy; const maxLeft=Math.max(0, window.innerWidth - (panel.offsetWidth||320) - 8); const maxTop=Math.max(0, window.innerHeight - (panel.offsetHeight||200) - 8) + window.scrollY; if(nextLeft<8) nextLeft=8; if(nextLeft>maxLeft) nextLeft=maxLeft; if(nextTop<8) nextTop=8; if(nextTop>maxTop) nextTop=maxTop; panel.style.left=nextLeft+'px'; panel.style.top=nextTop+'px'; };
          const onMouseUp=()=>{ if(!dragging) return; dragging=false; document.body.style.userSelect=''; };
          header.addEventListener('mousedown', onMouseDown);
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
          panel._dragCleanup = ()=>{ try{ header.removeEventListener('mousedown', onMouseDown); }catch(_){ } try{ document.removeEventListener('mousemove', onMouseMove); }catch(_){ } try{ document.removeEventListener('mouseup', onMouseUp); }catch(_){ } };
        }
      }catch(_){ }
      // backdrop click closes too
      backdrop.addEventListener('click', ()=>{ try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){ } if(panel._dragCleanup) panel._dragCleanup(); document.removeEventListener('click', outsideClickHandler); document.removeEventListener('keydown', keyHandler); });
      // No in-panel subtask editing here; only the add-new-subtask row remains.
      panel.querySelector('#detailAddSub').addEventListener('click', async ()=>{
        const val = panel.querySelector('#detailNewSub').value && panel.querySelector('#detailNewSub').value.trim(); if(!val) return;
        const start = panel.querySelector('#detailNewSubStart').value;
        const end = panel.querySelector('#detailNewSubEnd').value;
        let newId='sub-'+Date.now(); const newSub={id:newId,title:val,completed:false};
        if(start) newSub.startDate = start;
        if(end) newSub.dueDate = end;
        task.subtasks = task.subtasks||[]; task.subtasks.push(newSub);
        if(this.app.store && this.app.store._isSupabase && this.app.store.addSubtask){
          try { const dbId = await this.app.store.addSubtask(task.id, newSub); if(dbId) newSub.id = dbId; } catch(e){ console.warn('addSubtask (detail panel) failed', e); }
        } else if(this.app.store && typeof this.app.store.save==='function') {
          this.app.store.save();
        }
        this.render(); this.openDetailPanel(taskId, anchorEl);
      });
      panel.querySelector('[data-action="close"]').onclick=()=>{ try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){ } if(panel._dragCleanup) panel._dragCleanup(); };
      panel.querySelector('[data-action="save"]').onclick=()=>{
        const sVal = panel.querySelector('[data-edit="start"]').value;
        const eVal = panel.querySelector('[data-edit="end"]').value;
        if(sVal && eVal && new Date(eVal) < new Date(sVal)){
          const errMsg = (this.app && typeof this.app.t === 'function') ? this.app.t('gantt.dateRangeError') || 'End date must be >= start date' : 'End date must be >= start date';
          this.app.showNotification(errMsg, 'error');
          return;
        }
  task.startDate = sVal;
  task.dueDate = eVal;
  task.priority = panel.querySelector('[data-edit="priority"]').value;
  task.status = panel.querySelector('[data-edit="status"]').value;
  task.description = panel.querySelector('[data-edit="desc"]').value;
  task.milestone = !!panel.querySelector('[data-edit="milestone"]').checked;
        if(this.app.store && this.app.store._isSupabase && this.app.store.updateTask){
          this.app.store.updateTask(task.id, { startDate: task.startDate || null, dueDate: task.dueDate || null, priority: task.priority, status: task.status, description: task.description, milestone: task.milestone });
        } else if(this.app.store && typeof this.app.store.save==='function') {
          this.app.store.save();
        }
        this.render();
  this.app.showNotification((this.app && typeof this.app.t === 'function') ? this.app.t('task.saved') : 'Task saved', 'success');
        try{ panel.remove(); }catch(_){} try{ backdrop.remove(); }catch(_){ } if(panel._dragCleanup) panel._dragCleanup();
      };
      this.detailPanel=panel;
    }

    exportCSV(){
      const tasks=this.filteredTasks();
      const lines=['Task,Project,Assignee,Start,End,Progress'];
      tasks.forEach(t=>{
        const p=this.app.data.projects.find(p=>p.id===t.projectId); const u=this.userName(t.assignedTo);
        lines.push(`"${t.title}","${p?p.name:''}","${u}",${t.startDate},${t.dueDate},${this.taskProgress(t)}`);
      });
      const blob=new Blob([lines.join('\n')],{type:'text/csv'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='gantt_export.csv'; a.click();
    }

    exportPNG(){
      // Simplu: folosim html2canvas dacă e disponibil, altfel fallback mesaj
  if(typeof html2canvas==='undefined'){ const msg = (this.app && this.app.t) ? this.app.t('html2canvas.missing') : 'html2canvas is not loaded'; Toast.push(msg,'error',6000); return; }
      const wrapper=document.querySelector('.gantt-container');
      html2canvas(wrapper).then(canvas=>{
        const link=document.createElement('a');
        link.download='gantt.png';
        link.href=canvas.toDataURL();
        link.click();
      });
    }
  }

  global.GanttManager = GanttManager;
})(window);
