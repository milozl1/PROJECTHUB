// ProjectHub - Project Management Application (Enhanced)
// Import (ESM-like inline) - since no bundler, we dynamically load if available
// dataStore.js should be loaded via script tag before app.js for real import; fallback to global

class ProjectHub {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        // internationalization: default locale
        this.locale = localStorage.getItem('locale') || 'ro';
        this.translations = {
            ro: {
                'create.button': 'Creează',
                'create.newTask': 'Nou Task',
                'create.newProject': 'Proiect Nou',
                'create.quickNote': 'Notă Rapidă',
                'page.dashboard': 'Dashboard',
                'page.projects': 'Proiecte',
                'page.tasks': 'Task-uri',
                'page.kanban': 'Kanban',
                'page.calendar': 'Calendar',
                'page.team': 'Echipa',
                'page.reports': 'Rapoarte',
                'page.gantt': 'Diagramă Gantt',
                'page.time-tracking': 'Time Tracking',
                'search.global.placeholder': 'Caută proiecte, task-uri, membri...',
                'search.tasks.placeholder': 'Căutare task...',
                'loading': 'Se încarcă ProjectHub...',
                'stat.projects': 'Proiecte Active',
                'stat.tasks': 'Task-uri Totale',
                'stat.completed': 'Task-uri Finalizate',
                'stat.team': 'Membri Echipă',
                'recent.activity': 'Activitate Recentă',
                'projects.subtitle': 'Gestionează toate proiectele echipei',
                'search.button': 'Caută',
                'tasks.subtitle': 'Lista completă a task-urilor',
                'status.notStarted': 'Neînceput',
                'status.inProgress': 'În Progres',
                'status.done': 'Finalizat',
                'priority.low': 'Mică',
                'priority.medium': 'Medie',
                'priority.high': 'Mare',
                'priority.critical': 'Critică',
                'kanban.subtitle': 'Vizualizare task-uri în format board',
                'kanban.notStarted': 'Neînceput',
                'kanban.inProgress': 'În Progres',
                'kanban.review': 'În Revizie & Testare',
                'team.subtitle': 'Membrii echipei și distribuția sarcinilor',
                'team.invite': 'Invită Membru',
                'time.subtitle': 'Urmărește timpul petrecut pe proiecte',
                'time.today': 'Timp Astăzi',
                'time.recent': 'Intrări Recente',
                'reports.subtitle': 'Analytics și rapoarte de progres',
                'gantt.legendTitle': 'Legendă Gantt',
                'gantt.inferred': 'Date inferate — lipsă start/due completate din proiect sau setate implicit',
                'gantt.bulkAddTitle': 'Adaugă proiect în Gantt',
                'gantt.todayTitle': 'Astăzi',
                'gantt.todayDesc': 'Linia verticală marchează data curentă.',
                'gantt.depTitle': 'Dependență',
                'gantt.depDesc': 'Săgețile între bare indică dependențe Finish→Start; roșu = critic / neîndeplinit, gri = normal.',
                'gantt.lateTitle': 'Întârziat',
                'gantt.lateDesc': 'Barele întârziate sunt evidențiate când data de finalizare este trecută și starea nu este "Done".',
                'gantt.milestoneTitle': 'Piatra de hotar',
                'gantt.milestoneDesc': 'Evenimente punctuale afișate ca romburi.',
                'gantt.progressTitle': 'Progres (%)',
                'gantt.progressDesc': 'Bara de progres în interiorul unei activități arată procentul finalizat.',
                'gantt.shortGuideTitle': 'Scurt ghid',
                'gantt.guide.click': 'Click pe o bară pentru detalii și pentru a edita task-ul.',
                'gantt.guide.drag': 'Folosește drag pentru a reprograma sau redimensionează pentru a schimba duratele.',
                'gantt.guide.critical': 'Dependențele critice sunt marcate când succesorul este întârziat — opțional putem calcula calea critică completă.',
                'gantt.subtitle': 'Planificare temporală proiecte și task-uri',
                'gantt.scale.week': 'Săptămânal'
                ,
                'app.title': 'ProjectHub - Gestionare Proiecte',
                'btn.save': 'Salvează',
                'btn.cancel': 'Anulează',
                'btn.close': 'Închide',
                'btn.delete': 'Șterge',
                'btn.edit': 'Editează',
                'tasks.header.task': 'Task',
                'tasks.header.project': 'Proiect',
                'tasks.header.assignee': 'Asignat',
                'tasks.header.status': 'Status',
                'tasks.header.priority': 'Prioritate',
                'tasks.header.due': 'Scadența',
                'tasks.header.progress': 'Progres',
                'tasks.header.actions': 'Acțiuni',
                'subtask.none': 'Nicio subtask',
                'subtask.titleRequired': 'Titlul subtask-ului nu poate fi gol',
                'confirm.deleteProject': 'Sigur doriți să ștergeți proiectul "{name}"? Această acțiune este ireversibilă.',
                'confirm.deleteTask': 'Sigur doriți să ștergeți task-ul "{name}"?',
                'confirm.deleteMember': 'Sigur vrei să ștergi membrul "{name}"?',
                'member.added': 'Membru adăugat',
                'member.updated': 'Membru actualizat',
                'member.deleted': 'Membru șters',
                'project.deleted': 'Proiect șters',
                'task.deleted': 'Task șters',
                'audit.deleteProject': 'Ștergere proiect',
                'audit.deleteTask': 'Ștergere task',
                'project.updated': 'Proiect actualizat',
                'gantt.bulkAdded': 'Task-uri adăugate în Gantt',
                'gantt.depCreated': 'Dependență creată',
                'gantt.depExists': 'Dependența există deja',
                'gantt.depDeleted': 'Dependență ștearsă',
                'undo': 'Undo',
                'label.start': 'Start',
                'label.end': 'Final',
                'label.priority': 'Prioritate',
                'label.status': 'Status',
                'subtask.header': 'Subtask-uri',
                'task.saved': 'Task salvat',
                'gantt.confirmSaveMsg': 'Salvezi modificările făcute pentru acest task?',
                'gantt.changesSaved': 'Modificări salvate',
                'gantt.changesCancelled': 'Modificări anulate',
                'gantt.configTitle': 'Configurează în Gantt — {title}',
                'unassigned': 'Neasignat',
                'team.stat.tasks': 'Task-uri',
                'team.stat.completed': 'Finalizate',
                'team.stat.hoursTotal': 'Ore Totale',
                'team.stat.hoursWeek': 'Ore/Săpt',
                'chart.projects.title': 'Progresul Proiectelor',
                'chart.activity.title': 'Activitate Recentă',
                'chart.deadlines.title': 'Deadline-uri Apropiate',
                'gantt.emptyTasks': 'Nu există task-uri potrivite filtrării',
                'gantt.depHandleTitle': 'Creează dependență: trage spre o altă activitate',
                'gantt.deleteDep.confirm': 'Ștergi dependența: "{from} → {to}"?',
                'gantt.deleteCanceled': 'Ștergere anulată',
                'gantt.cycleBlocked': 'Operațiune blocată: ar crea ciclu între task-uri',
                'subtask.add.placeholder': 'Adaugă subtask...',
                'subtask.add': 'Adaugă',
                'task.desc.placeholder': 'Descriere',
                'gantt.dateRangeError': 'Data de finalizare trebuie să fie după data de start',
                'html2canvas.missing': 'html2canvas nu este încă încărcat – adaugă librăria pentru export PNG',
                'create.newMember': 'Adaugă Membru',
                'member': 'Membru',
                'member.nameRequired': 'Numele membrului este obligatoriu',
                'selection.cycleInvalid': 'Selecție invalidă: creează ciclu cu task-ul selectat'
                ,
                'audit.history': 'Istoric modificări',
                'gantt.selectProjectFirst': 'Selectează mai întâi un proiect în filtrul Gantt.',
                'gantt.noTasksForProject': 'Nu există task-uri pentru proiectul selectat.',
                'gantt.bulkAddConfirm': 'Adaugi {n} task-uri din proiect în Gantt?',
                'projects.none': 'Nu există proiecte de afișat.',
                'project.editTitle': 'Editează Proiect',
                'project.newTitle': 'Proiect Nou',
                'project.created': 'Proiect creat',
                'task.editTitle': 'Editează Task',
                'task.newTitle': 'Task Nou',
                'task.updated': 'Task actualizat',
                'task.created': 'Task creat',
                'gantt.managerMissing': 'GanttManager indisponibil',
                'project.updated': 'Proiect actualizat'
                ,
                'status.updated': 'Status task actualizat la {status}',
                'task.titleUpdated': 'Titlu task actualizat'
            },
            en: {
                'create.button': 'Create',
                'create.newTask': 'New Task',
                'create.newProject': 'New Project',
                'create.quickNote': 'Quick Note',
                'page.dashboard': 'Dashboard',
                'page.projects': 'Projects',
                'page.tasks': 'Tasks',
                'page.kanban': 'Kanban',
                'page.calendar': 'Calendar',
                'page.team': 'Team',
                'page.reports': 'Reports',
                'page.gantt': 'Gantt Chart',
                'page.time-tracking': 'Time Tracking',
                'search.global.placeholder': 'Search projects, tasks, members...',
                'search.tasks.placeholder': 'Search tasks...',
                'loading': 'Loading ProjectHub...',
                'stat.projects': 'Active Projects',
                'stat.tasks': 'Total Tasks',
                'stat.completed': 'Completed Tasks',
                'stat.team': 'Team Members',
                'recent.activity': 'Recent Activity',
                'projects.subtitle': 'Manage all team projects',
                'search.button': 'Search',
                'tasks.subtitle': 'The full tasks list',
                'status.notStarted': 'Not Started',
                'status.inProgress': 'In Progress',
                'status.done': 'Done',
                'priority.low': 'Low',
                'priority.medium': 'Medium',
                'priority.high': 'High',
                'priority.critical': 'Critical',
                'kanban.subtitle': 'View tasks in board format',
                'kanban.notStarted': 'Not Started',
                'kanban.inProgress': 'In Progress',
                'kanban.review': 'Review & Testing',
                'team.subtitle': 'Team members and workload distribution',
                'team.invite': 'Invite Member',
                'time.subtitle': 'Track time spent on projects',
                'time.today': "Time Today",
                'time.recent': 'Recent entries',
                'reports.subtitle': 'Analytics and progress reports',
                'gantt.legendTitle': 'Gantt Legend',
                'gantt.inferred': 'Inferred dates — missing start/end filled from project or set by default',
                'gantt.bulkAddTitle': 'Add project to Gantt',
                'gantt.todayTitle': 'Today',
                'gantt.todayDesc': 'Vertical line shows the current date.',
                'gantt.depTitle': 'Dependency',
                'gantt.depDesc': 'Arrows between bars indicate Finish→Start dependencies; red = critical / overdue, gray = normal.',
                'gantt.lateTitle': 'Late',
                'gantt.lateDesc': 'Late bars are highlighted when the end date is past and status is not "Done".',
                'gantt.milestoneTitle': 'Milestone',
                'gantt.milestoneDesc': 'Point-in-time events rendered as diamonds.',
                'gantt.progressTitle': 'Progress (%)',
                'gantt.progressDesc': 'Progress bar inside a task shows percent complete.',
                'gantt.shortGuideTitle': 'Quick guide',
                'gantt.guide.click': 'Click a bar for details and to edit the task.',
                'gantt.guide.drag': 'Use drag to reschedule or resize to change durations.',
                'gantt.guide.critical': 'Critical dependencies are marked when a successor is late — we can optionally compute a full critical path.',
                'gantt.subtitle': 'Temporal planning for projects and tasks',
                'gantt.scale.week': 'Weekly'
                ,
                'app.title': 'ProjectHub - Project Management',
                'btn.save': 'Save',
                'btn.cancel': 'Cancel',
                'btn.close': 'Close',
                'btn.delete': 'Delete',
                'btn.edit': 'Edit',
                'tasks.header.task': 'Task',
                'tasks.header.project': 'Project',
                'tasks.header.assignee': 'Assignee',
                'tasks.header.status': 'Status',
                'tasks.header.priority': 'Priority',
                'tasks.header.due': 'Due',
                'tasks.header.progress': 'Progress',
                'tasks.header.actions': 'Actions',
                'subtask.none': 'No subtasks',
                'subtask.titleRequired': "Subtask title can't be empty",
                'confirm.deleteProject': 'Delete project "{name}"? This action is irreversible.',
                'confirm.deleteTask': 'Delete task "{name}"?',
                'confirm.deleteMember': 'Delete member "{name}"?',
                'member.added': 'Member added',
                'member.updated': 'Member updated',
                'member.deleted': 'Member deleted',
                'project.deleted': 'Project deleted',
                'task.deleted': 'Task deleted',
                'audit.deleteProject': 'Delete project',
                'audit.deleteTask': 'Delete task',
                'unassigned': 'Unassigned',
                'team.stat.tasks': 'Tasks',
                'team.stat.completed': 'Completed',
                'team.stat.hoursTotal': 'Total Hours',
                'team.stat.hoursWeek': 'Hours/Week',
                'chart.projects.title': 'Project Progress',
                'chart.activity.title': 'Recent Activity',
                'chart.deadlines.title': 'Upcoming Deadlines',
                'gantt.emptyTasks': 'No tasks match the filter',
                'gantt.depHandleTitle': 'Create dependency: drag to another task',
                'gantt.deleteDep.confirm': 'Delete dependency: "{from} → {to}"?',
                'gantt.deleteCanceled': 'Deletion cancelled',
                'gantt.cycleBlocked': 'Operation blocked: would create cycle between tasks',
                'subtask.add.placeholder': 'Add subtask...',
                'subtask.add': 'Add',
                'task.desc.placeholder': 'Description',
                'label.start': 'Start',
                'label.end': 'End',
                'label.priority': 'Priority',
                'label.status': 'Status',
                'subtask.header': 'Subtasks',
                'task.saved': 'Task saved',
                'gantt.dateRangeError': 'End date must be >= start date',
                'html2canvas.missing': 'html2canvas is not loaded yet — include the library for PNG export',
                'create.newMember': 'Add Member',
                'member': 'Member',
                'member.nameRequired': 'Member name is required',
                'selection.cycleInvalid': 'Invalid selection: would create cycle with selected task'
                ,
                'audit.history': 'Change history',
                'gantt.selectProjectFirst': 'Please select a project first in the Gantt filter.',
                'gantt.noTasksForProject': 'No tasks exist for the selected project.',
                'gantt.bulkAddConfirm': 'Add {n} tasks from the project to Gantt?',
                'projects.none': 'No projects to show.',
                'project.editTitle': 'Edit Project',
                'project.newTitle': 'New Project',
                'project.created': 'Project created',
                'task.editTitle': 'Edit Task',
                'task.newTitle': 'New Task',
                'task.updated': 'Task updated',
                'task.created': 'Task created',
                'gantt.managerMissing': 'GanttManager unavailable',
                'project.updated': 'Project updated'
                ,
                'status.updated': 'Task status updated to {status}',
                'task.titleUpdated': 'Task title updated'
            }
        };
        this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.timer = {
            isRunning: false,
            startTime: null,
            elapsedTime: 0,
            interval: null
        };
        // Focus sessions (Pomodoro) state
        this.pomodoro = {
            running: false,
            paused: false,
            phase: 'focus', // 'focus' | 'short' | 'long'
            cyclesCompleted: 0,
            totalMs: 25*60000,
            remainingMs: 25*60000,
            focusMs: 25*60000,
            shortMs: 5*60000,
            longMs: 15*60000,
            longEvery: 4,
            autoContinue: true,
            interval: null,
            taskId: '',
            sound: (localStorage.getItem('pomo.sound')||'true') === 'true'
        };
        // Global Focus Mode preference
        this.focusMode = (localStorage.getItem('focus.mode')||'false') === 'true';
        // Data layer selection: prefer SupabaseStore if present
        if (window.SupabaseStore && window.SupabaseStore._isSupabase) {
            this.store = window.SupabaseStore;
            this.data = { projects: [], tasks: [], users: [], timeEntries: [], comments: [] }; // placeholder until fetch
            this._usingSupabase = true;
        } else if (window.DataStore || (typeof DataStore !== 'undefined')) {
            this.data = (window.DataStore || DataStore).getData();
            this.store = (window.DataStore || DataStore);
            this._usingSupabase = false;
        } else {
            console.warn('No persistence store found – using in-memory fallback');
            this.data = { projects: [], tasks: [], users: [], timeEntries: [], comments: [] };
            this.store = { getData: () => this.data, save: () => {} };
            this._usingSupabase = false;
        }

        // Notifications data
        this.notifications = [
            {
                id: 'notif-1',
                type: 'task',
                message: 'Task nou asignat: Develop responsive navigation',
                time: '2 ore în urmă',
                read: false
            },
            {
                id: 'notif-2',
                type: 'deadline',
                message: 'Deadline aproape: Create wireframes for homepage',
                time: '4 ore în urmă',
                read: false
            },
            {
                id: 'notif-3',
                type: 'comment',
                message: 'Comentariu nou de la Maria Ionescu',
                time: '1 zi în urmă',
                read: false
            }
        ];

        // Ensure tasks have default flags
        if (this.data && this.data.tasks) {
            this.data.tasks.forEach(t => {
                if (typeof t._ganttVisible === 'undefined') t._ganttVisible = 0;
                if (typeof t.isArchived === 'undefined') t.isArchived = false;
            });
        }
        // Ensure projects have default flags
        if (this.data && this.data.projects) {
            this.data.projects.forEach(p => {
                if (typeof p.isArchived === 'undefined') p.isArchived = false;
            });
        }

        // Auth gate if Supabase is enabled
        this._isAuthenticated = false;
        this._dataLoaded = false;
        this._initAuthGate().then(()=>{
            this.init();
            if (this._usingSupabase && this._isAuthenticated) {
                this._loadSupabaseData();
            }
        });

        // Safety watchdog: periodic cleanup of orphaned modal backdrops that could block UI
        this._uiWatchdogTimer = setInterval(()=>{
            try {
                // If there is no visible modal but a generated backdrop still exists, remove it & restore scroll
                const anyVisibleModal = !!document.querySelector('.modal.show');
                const orphanBackdrops = Array.from(document.querySelectorAll('.modal-backdrop[data-generated="true"]'))
                    .filter(b => !anyVisibleModal || b.previousElementSibling && !b.previousElementSibling.classList.contains('show'));
                if(orphanBackdrops.length){
                    orphanBackdrops.forEach(b => b.remove());
                    if(!anyVisibleModal){ document.body.style.overflow = 'auto'; }
                }
                // Also guard against body overflow stuck on hidden when no modal
                if(!anyVisibleModal && document.body.style.overflow === 'hidden'){
                    document.body.style.overflow = 'auto';
                }
            } catch(e){ /* silent */ }
        }, 3000);

        // Utilities and Reminders bootstrap
        try { this.ensureUtilitiesPanel && this.ensureUtilitiesPanel(); } catch(e){}
        try { this.initReminders && this.initReminders(); } catch(e){}
        // Apply persisted Focus Mode at startup
        try { this.applyFocusMode && this.applyFocusMode(); } catch(e){}
        // Lightweight auto-backup (local-only)
        try {
            clearInterval(this._autoBackupTimer);
            this._autoBackupTimer = setInterval(()=>{
                if(this._usingSupabase) return; // skip when using cloud backend
                try{
                    const snapshot = JSON.stringify(this.data);
                    localStorage.setItem('projecthub.autobackup.data', snapshot);
                    localStorage.setItem('projecthub.autobackup.at', new Date().toISOString());
                }catch(_){/* ignore storage issues */}
            }, 5*60*1000);
        } catch(_){}
    }

    async _initAuthGate(){
        try{
            // No Supabase -> show app directly
            if(!this._usingSupabase || !window.supabaseClient){
                this._showApp();
                this._setupLocalAuthUI();
                return;
            }
            const supabase = window.supabaseClient;
            // Listen to auth changes
            supabase.auth.onAuthStateChange((_event, session)=>{
                this._isAuthenticated = !!session;
                if(session){
                    this._showApp();
                    this._bindLogout();
                    // Ensure a profile row exists in public.users for this auth user (optional)
                    this._ensureProfile(session.user).catch(()=>{});
                    if(this._usingSupabase && !this._dataLoaded){ this._loadSupabaseData(); }
                }
                else { this._showLogin(); }
            });
            // Check current session
            const { data: { session } } = await supabase.auth.getSession();
            this._isAuthenticated = !!session;
            if(session){ this._showApp(); this._bindLogout(); this._ensureProfile(session.user).catch(()=>{}); }
            else { this._showLogin(); }
        }catch(e){
            console.warn('Auth gate init fallback:', e);
            this._showApp();
            this._setupLocalAuthUI();
        }
    }

    _showLogin(){
        const auth = document.getElementById('authScreen');
        const app = document.getElementById('app');
        if(auth){ auth.classList.remove('hidden'); auth.setAttribute('aria-hidden','false'); }
        if(app){ app.classList.add('hidden'); }
        this._wireAuthForms();
    }

    _showApp(){
        const auth = document.getElementById('authScreen');
        const app = document.getElementById('app');
        if(auth){ auth.classList.add('hidden'); auth.setAttribute('aria-hidden','true'); }
        if(app){ app.classList.remove('hidden'); }
        this._bindLogout();
    }

    _setupLocalAuthUI(){
        // When not using Supabase, keep logout hidden and bypass forms
        const logoutBtn = document.getElementById('logoutBtn');
        if(logoutBtn) logoutBtn.classList.add('hidden');
        const auth = document.getElementById('authScreen'); if(auth) auth.classList.add('hidden');
    }

    _bindLogout(){
        const btn = document.getElementById('logoutBtn');
        if(!btn) return;
        btn.classList.remove('hidden');
        btn.onclick = async ()=>{
            if(this._usingSupabase && window.supabaseClient){
                try{ await window.supabaseClient.auth.signOut(); }catch(e){ console.warn('signOut error', e); }
            }
            // Clear any local user hints if needed
            this._showLogin();
        };
    }

    _wireAuthForms(){
        const supabase = window.supabaseClient;
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');
        // Registration disabled per user request (create users only in Supabase console)
        const regForm = null;
        const regError = null;
        const showReg = null;
        const forgot = document.getElementById('authForgotPassword');
        // showReg removed
        if(loginForm){
            loginForm.onsubmit = async (e)=>{
                e.preventDefault();
                if(!supabase){ this._showApp(); return; }
                const email = /** @type {HTMLInputElement} */(document.getElementById('loginEmail')).value.trim();
                const password = /** @type {HTMLInputElement} */(document.getElementById('loginPassword')).value;
                loginError && loginError.classList.add('hidden');
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if(error){ if(loginError){ loginError.textContent = error.message || 'Autentificare eșuată'; loginError.classList.remove('hidden'); } }
                // success path handled by onAuthStateChange -> _showApp
            };
        }
        if(forgot){
            forgot.onclick = async ()=>{
                if(!supabase) return;
                const email = /** @type {HTMLInputElement} */(document.getElementById('loginEmail')).value.trim();
                if(!email){ if(loginError){ loginError.textContent = 'Introdu email pentru resetare.'; loginError.classList.remove('hidden'); } return; }
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                if(error){ if(loginError){ loginError.textContent = error.message || 'Nu s-a putut trimite email-ul de resetare.'; loginError.classList.remove('hidden'); } }
                else { if(loginError){ loginError.textContent = 'Email de resetare trimis (verifică inbox).'; loginError.classList.remove('hidden'); } }
            };
        }
    }

    init() {
        this.hideLoadingScreen();
        this.setupEventListeners();
        this.setupI18n();
        this.setupTheme();
        this.setupSidebar();
        this._checkRecoveryToken();
        this.navigateToPage('dashboard');
        this.initializeCharts();
        this.setupDragAndDrop();
        if(!this._usingSupabase){
            // local data already available
            this.postDataLoadRender();
        } else {
            // Show a lightweight loading hint
            const el = document.getElementById('pageTitle');
            if(el) el.textContent = (this.t ? this.t('loading') : 'Loading...');
        }
    }

    async _checkRecoveryToken(){
        try{
            if(!this._usingSupabase || !window.supabaseClient) return;
            const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
            const type = params.get('type');
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if(type === 'recovery' && access_token){
                // Exchange tokens into a session
                await window.supabaseClient.auth.setSession({ access_token, refresh_token });
                // Show password reset modal
                const modal = document.getElementById('passwordResetModal');
                if(modal) this.showModal(modal);
                const submit = document.getElementById('passwordResetSubmit');
                const err = document.getElementById('passwordResetError');
                if(submit && !submit._bound){
                    submit.addEventListener('click', async ()=>{
                        const p1 = document.getElementById('prNew').value;
                        const p2 = document.getElementById('prConfirm').value;
                        if(p1.length < 6){ err.textContent = 'Parola trebuie să aibă cel puțin 6 caractere.'; err.classList.remove('hidden'); return; }
                        if(p1 !== p2){ err.textContent = 'Parolele nu coincid.'; err.classList.remove('hidden'); return; }
                        err.classList.add('hidden');
                        const { error } = await window.supabaseClient.auth.updateUser({ password: p1 });
                        if(error){ err.textContent = error.message || 'Nu am putut actualiza parola.'; err.classList.remove('hidden'); return; }
                        this.closeModals();
                        // Clean tokens from URL
                        try { history.replaceState(null, '', window.location.origin + window.location.pathname); } catch(_){ }
                        this.showNotification('Parola a fost actualizată. Ești autentificat.', 'success');
                    });
                    submit._bound = true;
                }
            }
        }catch(e){ /* ignore */ }
    }

    async _ensureProfile(authUser){
        try{
            if(!this._usingSupabase || !window.supabaseClient || !authUser) return;
            const email = authUser.email;
            // Try find existing profile by email
            const { data, error } = await window.supabaseClient.from('users').select('id').eq('email', email).limit(1);
            if(error){ console.warn('profile lookup failed', error); return; }
            if(data && data.length){ return; }
            // Insert minimal row
            const name = (authUser.user_metadata && (authUser.user_metadata.full_name || authUser.user_metadata.name)) || (email && email.split('@')[0]) || 'User';
            await window.supabaseClient.from('users').insert({ email, name }).select().single();
        }catch(e){ /* ignore profile creation failure */ }
    }

    async _loadSupabaseData(){
        try {
            const d = await this.store.getData();
            this.data = d;
            this._dataLoaded = true;
            this.postDataLoadRender();
        } catch(e){
            console.error('Supabase data load failed, fallback local if possible', e);
            this.showNotification('Supabase load failed – using local data if present', 'error');
        }
    }

    postDataLoadRender(){
        // recalc progress (in case source missing or outdated)
        try { this.recalculateAllProjectProgresses(); } catch(e){}
        // Always refresh dashboard KPIs if elements exist (safe to call even if not on dashboard)
        try { this.updateDashboardStats && this.updateDashboardStats(); } catch(e){}
        // Update sections opportunistically if their containers exist
        try { if(document.getElementById('recentActivity')) this.renderRecentActivity(); } catch(e){}
        try { if(document.getElementById('upcomingDeadlines')) this.renderUpcomingDeadlines(); } catch(e){}
        try { if(document.getElementById('projectProgressChart')) this.renderProjectProgressChart(); } catch(e){}
        // Always refresh base UI lists
        try { this.renderProjects(); } catch(e){}
        try { this.renderTasks(); } catch(e){}
        try { this.updateKanbanBoard && this.updateKanbanBoard(); } catch(e){}
        try { this.renderTimeTracking && this.renderTimeTracking(); } catch(e){}
        // Refresh reminders with up-to-date tasks
        try { this.initReminders && this.initReminders(true); } catch(e){}
    }

    // Simple i18n helpers
    setupI18n(){
        // apply initial locale to document/lang select
        const sel = document.getElementById('langSelect');
        if(sel){ sel.value = this.locale; sel.addEventListener('change', (e)=>{ this.setLocale(e.target.value); }); }
        // set document language attribute
        try{ document.documentElement.lang = this.locale; }catch(e){}
        // apply texts initially
        this.applyTranslationsToDOM();
    }

    setLocale(loc){
        if(!this.translations[loc]) return;
        this.locale = loc;
        localStorage.setItem('locale', loc);
        try{ document.documentElement.lang = loc; }catch(e){}
        this.applyTranslationsToDOM();
        // re-render page titles and dynamic UI
        this.navigateToPage(this.currentPage);
    }

    t(key){
        return (this.translations[this.locale] && this.translations[this.locale][key]) || (this.translations['ro'] && this.translations['ro'][key]) || key;
    }

    applyTranslationsToDOM(){
        // replace data-i18n text nodes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.getAttribute('data-i18n');
            const txt = this.t(k);
            if(txt) el.textContent = txt;
        });
        // translate elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
            const k = el.getAttribute('data-i18n-placeholder'); el.placeholder = this.t(k);
        });
        // translate attributes (title, value) when present
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const k = el.getAttribute('data-i18n-title'); const v = this.t(k); if(v) el.title = v;
        });
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const k = el.getAttribute('data-i18n-value'); const v = this.t(k); if(v) el.value = v;
        });
        // allow elements to request innerHTML translation when markup is desired
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const k = el.getAttribute('data-i18n-html'); const v = this.t(k); if(v) el.innerHTML = v;
        });
    }

    populateTaskProjectFilter(){
        const sel = document.getElementById('taskProjectFilter');
        if(!sel) return;
        sel.innerHTML = '<option value="">Toate proiectele</option>' + (this.data.projects || []).map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    // Populate Gantt project filter and remember selection
    populateGanttProjectFilter(){
        const sel = document.getElementById('ganttProjectFilter');
        if(!sel) return;
        const prev = localStorage.getItem('gantt.projectFilter.selected') || '';
        const options = ['<option value="">Toate proiectele</option>']
            .concat((this.data.projects || []).map(p => `<option value="${p.id}">${this._escapeHtml ? this._escapeHtml(p.name) : p.name}</option>`));
        sel.innerHTML = options.join('');
        // restore selection if project still exists
        if(prev && (this.data.projects || []).some(p=> p.id === prev)){
            sel.value = prev;
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                const auth = document.getElementById('authScreen');
                const app = document.getElementById('app');
                const shouldShowApp = !auth || auth.classList.contains('hidden');
                if(shouldShowApp && app){ app.classList.remove('hidden'); }
            }, 300);
        }, 1000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('mobileSidebarToggle').addEventListener('click', () => {
            this.toggleMobileSidebar();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Create new button
        document.getElementById('createNewBtn').addEventListener('click', () => {
            this.showCreateMenu();
        });

        // Notification button
        document.querySelector('.notification-btn').addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Project modal
        document.getElementById('newProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });

        // Invite member button (Team page)
        const inviteBtn = document.getElementById('inviteMemberBtn');
        if(inviteBtn) inviteBtn.addEventListener('click', ()=> this.openMemberModal());

        // Emoji palette buttons in member modal (delegated)
        document.addEventListener('click', (e)=>{
            const btn = e.target.closest && e.target.closest('.emoji-btn');
            if(!btn) return;
            const modal = document.getElementById('memberModal');
            if(!modal || !modal.classList.contains('show')) return;
            const input = document.getElementById('memberAvatar');
            if(!input) return;
            input.value = btn.textContent.trim();
        });

        document.getElementById('saveProjectBtn').addEventListener('click', () => {
            this.saveProject();
        });

        // Task modal
        document.getElementById('newTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            this.saveTask();
        });

        // Gantt config modal save
        document.getElementById('saveGanttConfigBtn').addEventListener('click', () => {
            this.saveGanttConfig();
        });
        // Gantt bulk add
        const bulkBtn = document.getElementById('ganttBulkAddBtn');
        if(bulkBtn) bulkBtn.addEventListener('click', ()=> this.ganttBulkAddCurrentProject());
        // Gantt legend button
        const legendBtn = document.getElementById('ganttLegendBtn');
        if(legendBtn && !legendBtn._bound){
            legendBtn.addEventListener('click', ()=>{
                const modal = document.getElementById('ganttLegendModal');
                if(modal) this.showModal(modal);
            });
            legendBtn._bound = true;
        }

    // Member modal save
    const saveMemberBtn = document.getElementById('saveMemberBtn');
    if(saveMemberBtn) saveMemberBtn.addEventListener('click', ()=> this.saveMember());

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Timer controls
        document.getElementById('timerStart').addEventListener('click', () => {
            this.startTimer();
        });

        document.getElementById('timerStop').addEventListener('click', () => {
            this.stopTimer();
        });

        // Populate time-task select and bind Pomodoro controls on first init
        this._initPomodoroUI();

        // Focus Mode toggle button
        const fmBtn = document.getElementById('focusModeToggle');
        if(fmBtn && !fmBtn._bound){
            fmBtn.addEventListener('click', ()=> this.toggleFocusMode());
            fmBtn._bound = true;
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e)=>{
            try{
                const key = (e.key||'').toLowerCase();
                // Ctrl/Cmd+Shift+F: Toggle Focus Mode
                if((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'f'){
                    e.preventDefault(); this.toggleFocusMode(); return;
                }
                // Ctrl/Cmd+N: New Task
                if((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && key === 'n'){
                    e.preventDefault(); this.openTaskModal(); return;
                }
                // Ctrl/Cmd+Alt+P: Pomodoro play/pause/resume
                if((e.ctrlKey || e.metaKey) && e.altKey && key === 'p'){
                    e.preventDefault();
                    if(!this.pomodoro.running){ this._startPomodoro(); }
                    else if(this.pomodoro.paused){ this._resumePomodoro(); }
                    else { this._pausePomodoro(); }
                    return;
                }
            }catch(_){ }
        });

        // Filters
        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.filterTasks();
        });

        document.getElementById('priorityFilter')?.addEventListener('change', () => {
            this.filterTasks();
        });

        // Tasks page project filter
        document.getElementById('taskProjectFilter')?.addEventListener('change', () => {
            this.filterTasks();
        });

        document.getElementById('kanbanProjectFilter')?.addEventListener('change', () => {
            this.filterKanbanTasks();
        });

        // View toggles
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.dataset.view);
            });
        });

        // Tasks tab: inline search
        const taskSearchInput = document.getElementById('taskSearchInput');
        if(taskSearchInput){
            taskSearchInput.addEventListener('input', (e)=>{
                this._taskSearchQuery = (e.target.value || '').trim().toLowerCase();
                this.filterTasks();
            });
        }
        // Reset filters button (repurposed search button in toolbar)
        const resetBtn = document.getElementById('searchBtn');
        if(resetBtn && !resetBtn._bound){
            resetBtn.addEventListener('click', ()=>{
                const statusSel = document.getElementById('statusFilter'); if(statusSel) statusSel.value = '';
                const prioritySel = document.getElementById('priorityFilter'); if(prioritySel) prioritySel.value = '';
                const projectSel = document.getElementById('taskProjectFilter'); if(projectSel) projectSel.value = '';
                const searchInput = document.getElementById('taskSearchInput'); if(searchInput) searchInput.value = '';
                this._taskSearchQuery = '';
                try{ localStorage.removeItem('tasks.savedFilters.selectedId'); }catch(_){ }
                this.filterTasks();
            });
            resetBtn._bound = true;
        }
    }

    // Small quick-create popover shown when the "Creează" button is pressed
    showCreateMenu() {
        // If menu already exists, toggle it
        let menu = document.getElementById('createNewMenu');
        if (menu) {
            const isVisible = !menu.classList.contains('hidden');
            if (isVisible) {
                menu.classList.add('hidden');
                return;
            }
        } else {
            menu = document.createElement('div');
            menu.id = 'createNewMenu';
            menu.className = 'create-popover';
            menu.innerHTML = `
                <button class="create-item" data-action="newTask">${this.t('create.newTask')}</button>
                <button class="create-item" data-action="newProject">${this.t('create.newProject')}</button>
                <button class="create-item" data-action="quickNote">${this.t('create.quickNote')}</button>
            `;
            // Append hidden first to measure size reliably, then position
            menu.style.visibility = 'hidden';
            document.body.appendChild(menu);

            // delegate clicks
            menu.addEventListener('click', (ev) => {
                const btn = ev.target.closest && ev.target.closest('.create-item');
                if (!btn) return;
                const action = btn.dataset.action;
                menu.classList.add('hidden');
                if (action === 'newTask') this.openTaskModal();
                else if (action === 'newProject') this.openProjectModal();
                else if (action === 'quickNote') {
                        // Quick note opens task modal with prefilled title
                        this.openTaskModal();
                        setTimeout(()=>{ const t = document.getElementById('taskTitle'); if(t) t.value = this.t('create.quickNote'); }, 30);
                }
            });

            // close popover on outside click or Esc
            const onDocClick = (e) => {
                if (!menu.contains(e.target) && e.target.id !== 'createNewBtn') menu.classList.add('hidden');
            };
            document.addEventListener('click', onDocClick);
            document.addEventListener('keydown', (ev)=>{ if(ev.key === 'Escape') menu.classList.add('hidden'); });
        }

        // position the popover near the button
        const btn = document.getElementById('createNewBtn');
        if (btn && menu) {
            const positionMenu = ()=>{
                const rect = btn.getBoundingClientRect();
                menu.style.top = (rect.bottom + window.scrollY + 8) + 'px';
                const w = menu.offsetWidth || menu.getBoundingClientRect().width || 160;
                // align to right edge of the button for balance, clamp inside viewport
                let left = rect.right + window.scrollX - 10 - w;
                const maxLeft = window.scrollX + document.documentElement.clientWidth - w - 12;
                if(left > maxLeft) left = maxLeft;
                if(left < window.scrollX + 12) left = window.scrollX + 12;
                menu.style.left = left + 'px';
                menu.style.visibility = '';
                menu.classList.remove('hidden');
            };
            // Defer to ensure layout is up-to-date
            if('requestAnimationFrame' in window) requestAnimationFrame(positionMenu); else setTimeout(positionMenu, 0);
        }
    }

    setupTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.setupTheme();
    }

    setupSidebar() {
        const app = document.querySelector('.app-container');
        if (this.sidebarCollapsed) {
            app.classList.add('sidebar-collapsed');
        }
    }

    toggleSidebar() {
        const app = document.querySelector('.app-container');
        this.sidebarCollapsed = !this.sidebarCollapsed;
        app.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
        localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
    }

    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
    }

    navigateToPage(page) {
        // Defensive: close stray modals/backdrops before switching pages to avoid frozen UI
        try {
            const strayBackdrops = document.querySelectorAll('.modal-backdrop[data-generated="true"]');
            const openModals = document.querySelectorAll('.modal.show');
            if(strayBackdrops.length && !openModals.length){
                strayBackdrops.forEach(b=> b.remove());
                document.body.style.overflow = 'auto';
            }
        } catch(e) { /* ignore */ }
        // Auto-stop timer if leaving time-tracking page while running
        if(this.currentPage === 'time-tracking' && page !== 'time-tracking' && this.timer && this.timer.isRunning){
            try { this.stopTimer(); } catch(e){}
        }
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Handle calendar page specifically
        if (page === 'calendar') {
            this.showCalendarPage();
        } else {
            const pageElement = document.getElementById(`${page}Page`);
            if (pageElement) {
                pageElement.classList.add('active');
            }
        }

        // Update page title using translations
        const titleKey = 'page.' + page;
        const pageTitleEl = document.getElementById('pageTitle');
        if(pageTitleEl) pageTitleEl.textContent = this.t(titleKey);

        this.currentPage = page;
        this.renderCurrentPage();
        // Ensure utilities panel exists on page changes
        try { this.ensureUtilitiesPanel && this.ensureUtilitiesPanel(); } catch(e){}
    }

    // ---------- Utilities Panel & Quick Capture ----------
    ensureUtilitiesPanel(){
        if(document.getElementById('utilitiesFab')) return;
        const fab = document.createElement('button');
        fab.id='utilitiesFab';
        fab.className='btn btn--primary';
        fab.style.cssText='position:fixed;right:16px;bottom:16px;z-index:1200;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;';
        fab.innerHTML='<i class="fas fa-toolbox"></i>';
        const panel = document.createElement('div');
        panel.id='utilitiesPanel';
        panel.className='card';
        panel.style.cssText='position:fixed;right:16px;bottom:72px;z-index:1199;min-width:300px;display:none;';
                panel.innerHTML = `
          <div class="card__header"><h3 style="font-size:14px;margin:0;">Utilities</h3></div>
          <div class="card__body" style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;gap:8px;align-items:center;">
              <input id="quickCaptureInput" class="form-control" placeholder="Quick task..." />
              <button id="quickCaptureAdd" class="btn btn--sm btn--primary">Add</button>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="exportJsonBtn" class="btn btn--sm btn--outline">Export JSON</button>
              <button id="importJsonBtn" class="btn btn--sm btn--outline">Import JSON</button>
              <input id="importJsonFile" type="file" accept="application/json" style="display:none;" />
              <button id="exportIcalBtn" class="btn btn--sm btn--outline">Export iCal</button>
              <button id="reminderPermBtn" class="btn btn--sm btn--outline">Enable notifications</button>
                            <button id="restoreBackupBtn" class="btn btn--sm btn--outline">Restore auto-backup</button>
            </div>
          </div>`;
        document.body.appendChild(fab);
        document.body.appendChild(panel);
        fab.addEventListener('click', ()=>{ panel.style.display = (panel.style.display==='none' || !panel.style.display) ? 'block' : 'none'; });
        document.getElementById('quickCaptureAdd').addEventListener('click', ()=> this.quickCaptureSubmit());
        document.getElementById('quickCaptureInput').addEventListener('keydown', (e)=>{ if(e.key==='Enter') this.quickCaptureSubmit(); });
        document.getElementById('exportJsonBtn').addEventListener('click', ()=> this.exportJSON());
        document.getElementById('importJsonBtn').addEventListener('click', ()=> document.getElementById('importJsonFile').click());
        document.getElementById('importJsonFile').addEventListener('change', (e)=> this.importJSON(e));
        document.getElementById('exportIcalBtn').addEventListener('click', ()=> this.exportICS());
    document.getElementById('reminderPermBtn').addEventListener('click', ()=> this.requestNotificationPermission());
    document.getElementById('restoreBackupBtn').addEventListener('click', ()=> this.restoreFromAutoBackup());
        // Hotkey Ctrl+K to toggle panel & focus quick capture
        document.addEventListener('keydown', (e)=>{
          if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){
            e.preventDefault(); panel.style.display='block'; setTimeout(()=> document.getElementById('quickCaptureInput').focus(), 10);
          }
        });
    }
    restoreFromAutoBackup(){
        try{
            const raw = localStorage.getItem('projecthub.autobackup.data');
            const at = localStorage.getItem('projecthub.autobackup.at');
            if(!raw) return alert('Nu există backup automat.');
            const ok = confirm(`Restaurăm datele din backup-ul automat de la ${at || 'necunoscut'}? Aceasta va înlocui datele locale curente.`);
            if(!ok) return;
            const json = JSON.parse(raw);
            if(this._usingSupabase){ alert('Restaurarea auto-backup-ului este disponibilă doar în modul local.'); return; }
            this.data = json;
            this.store && this.store.save && this.store.save();
            this.postDataLoadRender();
            this.showNotification('Date restaurate din auto-backup', 'success');
        }catch(e){ alert('Restaurare eșuată.'); }
    }
    async quickCaptureSubmit(){
        const input = document.getElementById('quickCaptureInput'); if(!input) return;
        const title = (input.value||'').trim(); if(!title) return;
        const defaultProject = document.getElementById('taskProjectFilter')?.value || (this.data.projects[0]?.id || null);
        const task = { id: 't-'+Date.now(), projectId: defaultProject, title, description:'', status:'Not Started', priority:'Medium', startDate: new Date().toISOString().split('T')[0], dueDate: null, assignedTo:'', subtasks:[] };
        try{
            if(this._usingSupabase && this.store && this.store.addTask){
                const newId = await this.store.addTask(task); if(newId) task.id = newId;
            } else {
                this.data.tasks.push(task); this.store.save && this.store.save();
            }
            input.value=''; this.renderTasks(); this.updateKanbanBoard && this.updateKanbanBoard(); this.showNotification('Task added', 'success');
        }catch(e){ this.showNotification('Failed to add quick task', 'error'); }
    }

    // ---------- Export / Import JSON ----------
    exportJSON(){
        const snapshot = JSON.stringify(this.data, null, 2);
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([snapshot], {type:'application/json'}));
        a.download = `projecthub_backup_${new Date().toISOString().replace(/[:.]/g,'-')}.json`; a.click();
    }
    async importJSON(ev){
        try{
            const file = ev.target.files[0]; if(!file) return; const text = await file.text();
            const json = JSON.parse(text);
            if(!confirm('Import will MERGE data into current workspace. Continue?')) return;
            const addManySeq = async (items, fn)=>{ for(const it of (items||[])){ try{ await fn(it); }catch(_){/*ignore*/} } };
            if(this._usingSupabase){
                await addManySeq(json.projects, async p=>{ const copy={...p}; delete copy.id; await this.store.addProject(copy); });
                await addManySeq(json.tasks, async t=>{ const copy={...t}; delete copy.id; await this.store.addTask(copy); });
            } else {
                this.data.projects.push(...(json.projects||[]));
                this.data.tasks.push(...(json.tasks||[]));
                this.data.users.push(...(json.users||[]));
                this.data.timeEntries.push(...(json.timeEntries||[]));
                this.data.comments.push(...(json.comments||[]));
                this.store.save && this.store.save();
            }
            this.postDataLoadRender();
            this.showNotification('Import completed', 'success');
        }catch(e){ this.showNotification('Import failed', 'error'); }
        finally { try{ ev.target.value=''; }catch(_){} }
    }

    // ---------- iCal Export ----------
    exportICS(){
        const lines = [ 'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ProjectHub//EN' ];
        const tasks = (this.data.tasks||[]).filter(t=> t.dueDate || t.startDate);
        const dtstamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        tasks.forEach(t=>{
            const uid = `${t.id}@projecthub.local`;
            const DTSTART = (t.startDate? t.startDate : t.dueDate || '').replace(/-/g,'');
            const DTEND = (t.dueDate? t.dueDate : t.startDate || '').replace(/-/g,'');
            lines.push('BEGIN:VEVENT');
            if(DTSTART) lines.push(`DTSTART;VALUE=DATE:${DTSTART}`);
            if(DTEND) lines.push(`DTEND;VALUE=DATE:${DTEND}`);
            lines.push(`DTSTAMP:${dtstamp}`);
            lines.push(`SUMMARY:${this._escapeHtml ? this._escapeHtml(t.title) : (t.title||'')}`);
            if(t.description) lines.push(`DESCRIPTION:${String(t.description).slice(0,120).replace(/\n/g,' ')}`);
            lines.push(`UID:${uid}`);
            lines.push('END:VEVENT');
        });
        lines.push('END:VCALENDAR');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], {type:'text/calendar'})); a.download='projecthub.ics'; a.click();
    }

    // ---------- Local Reminders & Notifications ----------
    requestNotificationPermission(){ try{ Notification.requestPermission(); }catch(_){} }
    initReminders(force=false){
        try{
            if(!('Notification' in window)) return;
            // clear previous timers when forced
            this._reminderTimers = this._reminderTimers || [];
            if(force){ this._reminderTimers.forEach(id=> clearTimeout(id)); this._reminderTimers = []; }
            const now = new Date();
            (this.data.tasks||[]).forEach(t=>{
                if(!t.dueDate) return;
                const due = new Date(t.dueDate+'T09:00:00');
                let ms = due - now;
                if(ms < 0 && (now - due) < 12*3600*1000) ms = 1000; // overdue this morning -> nudge now
                if(ms > 0 && ms < 10*24*3600*1000){
                    const timer = setTimeout(()=> this._showDueNotification(t), ms);
                    this._reminderTimers.push(timer);
                }
            });
        }catch(e){}
    }
    _showDueNotification(task){
        try{
            if(!('Notification' in window) || Notification.permission !== 'granted') return;
            const title = `Due: ${task.title}`;
            const body = task.dueDate ? `Scadență: ${this.formatDate(task.dueDate)}` : 'Scadență azi';
            new Notification(title, { body });
        }catch(e){}
    }

    showCalendarPage() {
        // Hide all pages first
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Create calendar page if it doesn't exist
        let calendarPage = document.getElementById('calendarPage');
        if (!calendarPage) {
            calendarPage = this.createCalendarPage();
            document.querySelector('.page-content').appendChild(calendarPage);
        }
        
        calendarPage.classList.add('active');
        // Initialize month/year and filters if not set
        const today = new Date();
        if (typeof this._calMonth !== 'number') this._calMonth = today.getMonth();
        if (typeof this._calYear !== 'number') this._calYear = today.getFullYear();
        if (!this._calView) this._calView = 'month';
        if (typeof this._calCompact !== 'boolean') this._calCompact = false;
        this._calendarFilters = this._calendarFilters || { projectId: '', status: '' };
        // Projects-only mode: show only project start and deadline markers in calendar
        if (typeof this._calProjectsOnly !== 'boolean') {
            try {
                const raw = localStorage.getItem('calendar.projectsOnly');
                this._calProjectsOnly = (raw === null) ? true : (raw === 'true');
            } catch(_) { this._calProjectsOnly = true; }
        }
        // Render
        this.renderCalendar();
    }

    createCalendarPage() {
        const calendarPage = document.createElement('div');
        calendarPage.id = 'calendarPage';
        calendarPage.className = 'page';
        
        calendarPage.innerHTML = `
            <div class="page-header">
                <div class="page-title-section">
                    <h2>Calendar</h2>
                    <p class="page-subtitle">Vizualizează deadline-urile și planificarea proiectelor</p>
                </div>
                <div class="page-actions calendar-controls">
                    <div class="month-nav">
                        <button id="calPrev" class="btn btn--outline btn--sm" title="Luna anterioară"><i class="fas fa-chevron-left"></i></button>
                        <div id="calMonthLabel" class="month-label">—</div>
                        <button id="calNext" class="btn btn--outline btn--sm" title="Luna următoare"><i class="fas fa-chevron-right"></i></button>
                        <button id="calToday" class="btn btn--ghost btn--sm" title="Astăzi">Astăzi</button>
                    </div>
                    <div class="calendar-filters">
                        <select id="calendarProjectFilter" class="form-control" title="Filtrează după proiect"></select>
                        <select id="calendarStatusFilter" class="form-control" title="Filtrează după status">
                            <option value="">Toate statusurile</option>
                            <option value="Not Started">Neînceput</option>
                            <option value="In Progress">În Progres</option>
                            <option value="Review">În Revizie & Testare</option>
                            <option value="Done">Finalizat</option>
                        </select>
                        <button id="calExport" class="btn btn--outline btn--sm" title="Export iCal"><i class="fas fa-download"></i> ICS</button>
                        <button id="calViewToggle" class="btn btn--outline btn--sm" title="Comută între lună și săptămână">Săptămână</button>
                        <button id="calDensityToggle" class="btn btn--ghost btn--sm" title="Compact/Normal">Compact</button>
                        <button id="calProjectsOnlyToggle" class="btn btn--outline btn--sm" title="Arată doar început și deadline proiect">Proiecte</button>
                    </div>
                </div>
            </div>
            
            <div class="calendar-container">
                <div class="card">
                    <div class="card__header">
                        <h3 id="calMonthLabelHeader">Luna</h3>
                    </div>
                    <div class="card__body">
                        <div class="calendar-grid">
                            <div class="calendar-header">
                                <div class="calendar-day-header">Lu</div>
                                <div class="calendar-day-header">Ma</div>
                                <div class="calendar-day-header">Mi</div>
                                <div class="calendar-day-header">Jo</div>
                                <div class="calendar-day-header">Vi</div>
                                <div class="calendar-day-header">Sâ</div>
                                <div class="calendar-day-header">Du</div>
                            </div>
                            <div class="calendar-body" id="calendarBody">
                                ${this.generateCalendarDays()}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="calendar-sidebar">
                    <div class="card">
                        <div class="card__header"><h3>Ziua selectată</h3></div>
                        <div class="card__body" id="dayDetails">
                            <div class="text-muted">Selectează o zi pentru a vedea task-urile.</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card__header">
                            <h3>Deadline-uri Apropiate</h3>
                        </div>
                        <div class="card__body">
                            <div class="upcoming-events">
                                ${this.generateUpcomingEvents()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Wire controls after insertion
        setTimeout(()=>{
            const prev = calendarPage.querySelector('#calPrev');
            const next = calendarPage.querySelector('#calNext');
            const todayBtn = calendarPage.querySelector('#calToday');
            const exportBtn = calendarPage.querySelector('#calExport');
            const viewBtn = calendarPage.querySelector('#calViewToggle');
            const densityBtn = calendarPage.querySelector('#calDensityToggle');
            const projSel = calendarPage.querySelector('#calendarProjectFilter');
            const statusSel = calendarPage.querySelector('#calendarStatusFilter');
            const projOnlyBtn = calendarPage.querySelector('#calProjectsOnlyToggle');
            if(prev && !prev._bound){ prev.addEventListener('click', ()=>{ this.shiftCalendarMonth(-1); }); prev._bound = true; }
            if(next && !next._bound){ next.addEventListener('click', ()=>{ this.shiftCalendarMonth(1); }); next._bound = true; }
            if(todayBtn && !todayBtn._bound){ todayBtn.addEventListener('click', ()=>{ const d=new Date(); this._calMonth=d.getMonth(); this._calYear=d.getFullYear(); this.renderCalendar(); }); todayBtn._bound = true; }
            if(exportBtn && !exportBtn._bound){ exportBtn.addEventListener('click', ()=> this.exportICS()); exportBtn._bound = true; }
            if(viewBtn && !viewBtn._bound){
                viewBtn.addEventListener('click', ()=>{
                    this._calView = (this._calView === 'week') ? 'month' : 'week';
                    viewBtn.textContent = this._calView === 'week' ? 'Lună' : 'Săptămână';
                    if(this._calView === 'week' && !this._selectedCalDate){ const d=new Date(this._calYear, this._calMonth, 1); this._selectedCalDate = d.toISOString().split('T')[0]; }
                    this.renderCalendar();
                });
                viewBtn._bound = true;
            }
            if(densityBtn && !densityBtn._bound){
                densityBtn.addEventListener('click', ()=>{ this._calCompact = !this._calCompact; densityBtn.classList.toggle('active', !!this._calCompact); this.renderCalendar(); });
                densityBtn._bound = true;
            }
            if(projOnlyBtn && !projOnlyBtn._bound){
                const syncBtn = ()=>{ projOnlyBtn.classList.toggle('active', !!this._calProjectsOnly); };
                syncBtn();
                projOnlyBtn.addEventListener('click', ()=>{ this._calProjectsOnly = !this._calProjectsOnly; try{ localStorage.setItem('calendar.projectsOnly', String(!!this._calProjectsOnly)); }catch(_){} syncBtn(); this.renderCalendar(); });
                projOnlyBtn._bound = true;
            }
            if(projSel && !projSel._init){ this.populateCalendarProjectFilter(); projSel.addEventListener('change', ()=>{ this._calendarFilters.projectId = projSel.value || ''; this.renderCalendar(); }); projSel._init = true; }
            if(statusSel && !statusSel._init){ statusSel.addEventListener('change', ()=>{ this._calendarFilters.status = statusSel.value || ''; this.renderCalendar(); }); statusSel._init = true; }
            // Delegated clicks for day selection and event chips
            calendarPage.addEventListener('click', (e)=>{
                const dayEl = e.target.closest('.calendar-day');
                if(dayEl && !dayEl.classList.contains('empty')){
                    const date = dayEl.getAttribute('data-date');
                    this._selectedCalDate = date;
                    this.renderCalendar();
                    this.renderDayDetails(date);
                    return;
                }
                const more = e.target.closest('.more-events');
                if(more){ const d = more.getAttribute('data-date'); this._selectedCalDate = d; this.renderDayDetails(d); }
                const chip = e.target.closest('.event-chip');
                if(chip){
                    const pid = chip.getAttribute('data-project-id');
                    if(pid){ const p = (this.data.projects||[]).find(x=> x.id === pid); if(p) this.openProjectModal(p); return; }
                    const id = chip.getAttribute('data-task-id');
                    if(id){ const t = (this.data.tasks||[]).find(x=> x.id === id); if(t) this.openTaskModal(t); }
                }
            });
            // Drag & drop reschedule from chips to days
            calendarPage.addEventListener('dragstart', (e)=>{
                const chip = e.target.closest && e.target.closest('.event-chip');
                if(!chip) return;
                try{ e.dataTransfer.setData('text/task-id', chip.getAttribute('data-task-id')); }catch(_){ }
                try{ e.dataTransfer.effectAllowed='move'; }catch(_){ }
            });
            calendarPage.addEventListener('dragover', (e)=>{
                const day = e.target.closest && e.target.closest('.calendar-day');
                if(day && !day.classList.contains('empty')){ e.preventDefault(); day.classList.add('drag-over'); }
            });
            calendarPage.addEventListener('dragleave', (e)=>{
                const day = e.target.closest && e.target.closest('.calendar-day'); if(day) day.classList.remove('drag-over');
            });
            calendarPage.addEventListener('drop', async (e)=>{
                const day = e.target.closest && e.target.closest('.calendar-day'); if(!day) return;
                e.preventDefault(); day.classList.remove('drag-over');
                let id = '';
                try{ id = e.dataTransfer.getData('text/task-id') || e.dataTransfer.getData('text/plain'); }catch(_){ }
                if(!id) return;
                const t = (this.data.tasks||[]).find(x=> x.id === id); if(!t) return;
                const newDate = day.getAttribute('data-date'); if(!newDate) return;
                t.dueDate = newDate;
                if(t.startDate && new Date(t.startDate) > new Date(newDate)) t.startDate = newDate;
                try{
                    if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                        await this.store.updateTask(t.id, { dueDate: t.dueDate, startDate: t.startDate });
                    } else if(this.store && typeof this.store.save === 'function'){
                        this.store.save();
                    }
                }catch(_){ }
                this.renderCalendar();
                if(this.currentPage === 'kanban') this.updateKanbanBoard();
            });
        }, 30);
        return calendarPage;
    }

    generateCalendarDays(month = this._calMonth, year = this._calYear) {
        const view = this._calView || 'month';
        const today = new Date();
        let days = [];
        if(view === 'week'){
            const anchor = this._selectedCalDate ? new Date(this._selectedCalDate+'T00:00:00') : new Date(year, month, today.getDate());
            const dow = (anchor.getDay()+6)%7; // Monday=0
            const start = new Date(anchor); start.setDate(anchor.getDate() - dow);
            for(let i=0;i<7;i++){ const d = new Date(start); d.setDate(start.getDate()+i); days.push(d); }
        } else {
            const currentMonth = typeof month === 'number' ? month : (new Date().getMonth());
            const currentYear = typeof year === 'number' ? year : (new Date().getFullYear());
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
            const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start
            for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
            for (let day = 1; day <= daysInMonth; day++) days.push(new Date(currentYear, currentMonth, day));
        }
        let daysHTML = '';
        for(const d of days){
            if(!d){ daysHTML += '<div class="calendar-day empty"></div>'; continue; }
            const iso = d.toISOString().split('T')[0];
            const isToday = d.toDateString() === today.toDateString();
            const dayOfWeek = (d.getDay()+6)%7; const isWeekend = dayOfWeek>=5;
            const isSelected = this._selectedCalDate === iso;
            let eventsHtml = '';
            let moreHtml = '';
            if(this._calProjectsOnly){
                const markers = this.getProjectMarkersForDate(d);
                const shown = markers.slice(0,3);
                eventsHtml = shown.map(m=> this._calendarProjectMarkerChipHTML(m)).join('');
                const moreCount = markers.length - shown.length;
                moreHtml = moreCount>0 ? `<a href="#" class="more-events" data-date="${iso}">+${moreCount} proiecte</a>` : '';
            } else {
                const rangeTasks = this.getRangeTasksForDate(d);
                const dueTasksAll = this.getTasksForDate(d);
                const dueTasks = dueTasksAll.filter(t=> !(t.startDate && t.dueDate && t.startDate !== t.dueDate));
                const chipsRange = rangeTasks.map(t=> this._calendarRangeChipHTML(t, this._rangePositionForDate(t, d))).join('');
                const spaceLeft = Math.max(0, 3 - rangeTasks.length);
                const chipsDue = dueTasks.slice(0, spaceLeft).map(t=> this._calendarEventChipHTML(t)).join('');
                const totalShown = rangeTasks.length + Math.min(dueTasks.length, spaceLeft);
                const moreCount = (rangeTasks.length + dueTasks.length) - totalShown;
                moreHtml = moreCount>0 ? `<a href="#" class="more-events" data-date="${iso}">+${moreCount} ${moreCount===1? 'task' : 'task-uri'}</a>` : '';
                eventsHtml = chipsRange + chipsDue;
            }
            daysHTML += `
                <div class="calendar-day ${isToday?'today':''} ${isWeekend?'weekend':''} ${isSelected?'selected':''}" data-date="${iso}">
                    <span class="day-number">${d.getDate()}</span>
                    <div class="events">${eventsHtml}${moreHtml}</div>
                </div>`;
        }
        return daysHTML;
    }

    hasEventsOnDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.data.tasks.some(task => task.dueDate === dateString);
    }

    getTasksForDate(date){
        try{
            const dateString = date.toISOString().split('T')[0];
            const { projectId, status } = this._calendarFilters || {};
            const tasks = (this.data.tasks||[]) .filter(t=> {
                if(t.dueDate !== dateString) return false;
                if(projectId && t.projectId !== projectId) return false;
                if(status && t.status !== status) return false;
                return true;
            });
            const rank = { Critical:0, High:1, Medium:2, Low:3 };
            tasks.sort((a,b)=> (rank[a.priority||'Medium'] - rank[b.priority||'Medium']) || String(a.title||'').localeCompare(b.title||''));
            return tasks;
        }catch(e){ return []; }
    }

    _calendarEventChipHTML(task){
        const proj = (this.data.projects||[]).find(p=> p.id === task.projectId);
        const user = (this.data.users||[]).find(u=> u.id === task.assignedTo);
        const color = (proj && proj.color) || 'var(--color-primary)';
        const esc = (s)=> this._escapeHtml ? this._escapeHtml(s) : String(s||'');
        const statusCls = (task.status||'').toLowerCase().replace(/\s+/g,'-');
        const pr = (task.priority||'').toLowerCase();
        const title = `${esc(task.title)}\nProiect: ${proj?esc(proj.name):'-'}\nAsignat: ${user?esc(user.name):'-'}\nPrioritate: ${task.priority||'-'}\nStatus: ${task.status||'-'}`;
        return `<div class="event-chip chip-${statusCls} chip-pr-${pr}" draggable="true" data-task-id="${task.id}" title="${title}"><span class="dot" style="background:${color}"></span><span class="txt">${esc(task.title)}</span><span class="badge badge-pr ${pr}" title="Prioritate: ${esc(task.priority||'-')}">${esc((task.priority||'').slice(0,1))}</span></div>`;
    }

    // --- Projects-only mode helpers ---
    getProjectMarkersForDate(date){
        try{
            const iso = date.toISOString().split('T')[0];
            const { projectId } = this._calendarFilters || {};
            const projects = (this.data.projects||[]).filter(p=> !projectId || p.id === projectId);
            const markers = [];
            projects.forEach(p=>{
                if(p.startDate === iso) markers.push({ type:'start', project:p });
                if(p.dueDate === iso) markers.push({ type:'deadline', project:p });
            });
            // Sort: deadline first, then start; then by name
            markers.sort((a,b)=> (a.type===b.type? 0 : (a.type==='deadline'?-1:1)) || String(a.project?.name||'').localeCompare(b.project?.name||''));
            return markers;
        }catch(e){ return []; }
    }
    _calendarProjectMarkerChipHTML(marker){
        const p = marker.project || {};
        const color = p.color || 'var(--color-primary)';
        const esc = (s)=> this._escapeHtml ? this._escapeHtml(s) : String(s||'');
        const isStart = marker.type === 'start';
        const badgeCls = isStart ? 'badge-start' : 'badge-deadline';
        const badgeTxt = isStart ? 'S' : 'D';
        const title = `${isStart? 'Start proiect:':'Deadline proiect:'} ${esc(p.name||'')}`;
        return `<div class="event-chip project-chip" data-project-id="${p.id||''}" title="${title}"><span class="dot" style="background:${color}"></span><span class="txt">${esc(p.name||'')}</span><span class="badge ${badgeCls}">${badgeTxt}</span></div>`;
    }

    getRangeTasksForDate(date){
        try{
            const iso = date.toISOString().split('T')[0];
            const { projectId, status } = this._calendarFilters || {};
            const tasks = (this.data.tasks||[]).filter(t=>{
                if(!t.startDate || !t.dueDate) return false;
                let s = t.startDate, e = t.dueDate;
                if(s>e){ const tmp=s; s=e; e=tmp; }
                if(iso < s || iso > e) return false;
                if(projectId && t.projectId !== projectId) return false;
                if(status && t.status !== status) return false;
                return true;
            });
            const rank = { Critical:0, High:1, Medium:2, Low:3 };
            tasks.sort((a,b)=> (rank[a.priority||'Medium'] - rank[b.priority||'Medium']) || String(a.title||'').localeCompare(b.title||''));
            return tasks;
        }catch(e){ return []; }
    }
    _rangePositionForDate(task, date){
        const iso = date.toISOString().split('T')[0];
        if(task.startDate === iso && task.dueDate === iso) return 'single';
        if(task.startDate === iso) return 'start';
        if(task.dueDate === iso) return 'end';
        return 'mid';
    }
    _calendarRangeChipHTML(task, pos){
        const proj = (this.data.projects||[]).find(p=> p.id === task.projectId);
        const color = (proj && proj.color) || 'var(--color-primary)';
        const esc = (s)=> this._escapeHtml ? this._escapeHtml(s) : String(s||'');
        const user = (this.data.users||[]).find(u=> u.id === task.assignedTo);
        const title = `${esc(task.title)}\nInterval: ${task.startDate||''} → ${task.dueDate||''}\nProiect: ${proj?esc(proj.name):'-'}\nAsignat: ${user?esc(user.name):'-'}\nPrioritate: ${task.priority||'-'}\nStatus: ${task.status||'-'}`;
        return `<div class="range-chip ${pos}" title="${title}" style="--bar:${color}"></div>`;
    }

    renderCalendar(){
        const body = document.getElementById('calendarBody'); if(!body) return;
        const label = document.getElementById('calMonthLabel'); const header = document.getElementById('calMonthLabelHeader');
        const text = this._formatMonthYear(this._calMonth, this._calYear);
        if(label) label.textContent = text;
        if(header) header.textContent = text;
        body.innerHTML = this.generateCalendarDays(this._calMonth, this._calYear);
        const cont = body.closest('.card__body'); if(cont){ cont.classList.toggle('calendar-compact', !!this._calCompact); }
        this.populateCalendarProjectFilter();
        const upc = document.querySelector('.upcoming-events'); if(upc) upc.innerHTML = this.generateUpcomingEvents();
        // reflect controls state
        const projOnlyBtn = document.getElementById('calProjectsOnlyToggle'); if(projOnlyBtn){ projOnlyBtn.classList.toggle('active', !!this._calProjectsOnly); }
        const statusSel = document.getElementById('calendarStatusFilter'); if(statusSel){ statusSel.disabled = !!this._calProjectsOnly; statusSel.title = this._calProjectsOnly ? 'Indisponibil în modul Proiecte' : 'Filtrează după status'; }
        if(this._selectedCalDate){ this.renderDayDetails(this._selectedCalDate); }
    }

    shiftCalendarMonth(delta){
        if(this._calView === 'week') return this.shiftCalendarWeek(delta);
        let m = (this._calMonth||0) + delta; let y = this._calYear||new Date().getFullYear();
        if(this._calView === 'week') return this.shiftCalendarWeek(delta);
        if(m < 0){ m = 11; y -= 1; }
        if(m > 11){ m = 0; y += 1; }
        this._calMonth = m; this._calYear = y; this.renderCalendar();
    }

    shiftCalendarWeek(delta){
        const base = this._selectedCalDate ? new Date(this._selectedCalDate+'T00:00:00') : new Date(this._calYear, this._calMonth, new Date().getDate());
        base.setDate(base.getDate() + (7*delta));
        const iso = base.toISOString().split('T')[0];
        this._selectedCalDate = iso;
        this._calMonth = base.getMonth();
        this._calYear = base.getFullYear();
        this.renderCalendar();
    }
    shiftCalendarWeek(delta){
        const base = this._selectedCalDate ? new Date(this._selectedCalDate+'T00:00:00') : new Date(this._calYear, this._calMonth, new Date().getDate());
        base.setDate(base.getDate() + (7*delta));
        const iso = base.toISOString().split('T')[0];
        this._selectedCalDate = iso;
        this._calMonth = base.getMonth();
        this._calYear = base.getFullYear();
        this.renderCalendar();
    }

    _formatMonthYear(m, y){
        const months = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
        return `${months[m]} ${y}`;
    }

    populateCalendarProjectFilter(){
        const sel = document.getElementById('calendarProjectFilter'); if(!sel) return;
        const prev = this._calendarFilters ? (this._calendarFilters.projectId||'') : '';
        const options = ['<option value="">Toate proiectele</option>']
            .concat((this.data.projects||[]).map(p=> `<option value="${p.id}">${this._escapeHtml ? this._escapeHtml(p.name) : p.name}</option>`));
        const html = options.join('');
        if(sel.innerHTML !== html){ sel.innerHTML = html; }
        sel.value = prev;
    }

    renderDayDetails(isoDate){
        const el = document.getElementById('dayDetails'); if(!el) return;
        const date = new Date(isoDate+'T00:00:00');
        const esc = (s)=> this._escapeHtml ? this._escapeHtml(s) : String(s||'');
        if(this._calProjectsOnly){
            const markers = this.getProjectMarkersForDate(date);
            const header = `<div class="day-details-header"><div class="dd-date">${this.formatDate(date)}</div></div>`;
            if(!markers.length){ el.innerHTML = header + '<div class="text-muted" style="margin-top:8px;">Niciun proiect care începe sau se finalizează în această zi.</div>'; return; }
            const items = markers.map(m=>{
                const p = m.project; const color = (p && p.color) || 'var(--color-primary)';
                const meta = m.type==='start' ? 'Start proiect' : 'Deadline proiect';
                return `<div class="day-task-item"><span class="bar" style="background:${color}"></span><div class="main"><div class="ttl">${esc(p.name||'')}</div><div class="meta">${meta}${p.startDate? ' • '+esc(p.startDate):''}${p.dueDate? ' → '+esc(p.dueDate):''}</div></div><button class="btn btn--sm btn--outline" data-edit-project-id="${p.id}">Editează</button></div>`;
            }).join('');
            el.innerHTML = header + `<div class="day-task-list">${items}</div>`;
            el.querySelectorAll('[data-edit-project-id]').forEach(btn=>{ if(!btn._bound){ btn.addEventListener('click', ()=>{ const id = btn.getAttribute('data-edit-project-id'); const p=(this.data.projects||[]).find(x=> x.id===id); if(p) this.openProjectModal(p); }); btn._bound = true; }});
            return;
        }
        // default: tasks mode
        const due = this.getTasksForDate(date);
        const ranges = this.getRangeTasksForDate(date);
        const map = new Map(); due.forEach(t=> map.set(t.id,{t,kind:'due'})); ranges.forEach(t=>{ if(!map.has(t.id)) map.set(t.id,{t,kind:'range'}); });
        const tasks = Array.from(map.values());
        const header = `<div class="day-details-header"><div class="dd-date">${this.formatDate(date)}</div><button id="addTaskForDay" class="btn btn--sm btn--primary">Task nou în această zi</button></div>`;
        if(!tasks.length){ el.innerHTML = header + '<div class="text-muted" style="margin-top:8px;">Niciun task pentru această zi.</div>'; }
        else {
            const items = tasks.map(({t,kind})=>{
                const proj = (this.data.projects||[]).find(p=> p.id === t.projectId);
                const color = (proj && proj.color) || 'var(--color-primary)';
                const partProj = proj ? esc(proj.name) : '';
                const partPri = t.priority ? (' • ' + esc(t.priority)) : '';
                const partSta = t.status ? (' • ' + esc(t.status)) : '';
                const partKind = kind==='range' ? (` • ${esc(t.startDate||'')} → ${esc(t.dueDate||'')}`) : '';
                return `<div class=\"day-task-item\"><span class=\"bar\" style=\"background:${color}\"></span><div class=\"main\"><div class=\"ttl\">${esc(t.title)}</div><div class=\"meta\">${partProj}${partPri}${partSta}${partKind}</div></div><button class=\"btn btn--sm btn--outline\" data-edit-task-id=\"${t.id}\">Editează</button></div>`;
            }).join('');
            el.innerHTML = header + `<div class="day-task-list">${items}</div>`;
        }
        const addBtn = document.getElementById('addTaskForDay'); if(addBtn && !addBtn._bound){ addBtn.addEventListener('click', ()=> this._newTaskForDate(isoDate)); addBtn._bound = true; }
        el.querySelectorAll('[data-edit-task-id]').forEach(btn=>{ if(!btn._bound){ btn.addEventListener('click', ()=>{ const id = btn.getAttribute('data-edit-task-id'); const t=(this.data.tasks||[]).find(x=> x.id===id); if(t) this.openTaskModal(t); }); btn._bound = true; }});
    }

    _newTaskForDate(iso){ this.openTaskModal(); setTimeout(()=>{ const due = document.getElementById('taskDueDate'); if(due) due.value = iso; }, 50); }

    generateUpcomingEvents() {
        const upcomingTasks = this.data.tasks
            .filter(task => task.dueDate && new Date(task.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        return upcomingTasks.map(task => {
            const project = this.data.projects.find(p => p.id === task.projectId);
            return `
                <div class="event-item">
                    <div class="event-date">${this.formatDate(task.dueDate)}</div>
                    <div class="event-title">${task.title}</div>
                    <div class="event-project">${project ? project.name : 'N/A'}</div>
                </div>
            `;
        }).join('');
    }

    toggleNotifications() {
        // Remove existing notification dropdown if it exists
        const existingDropdown = document.querySelector('.notification-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        // Create notification dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown card';
        dropdown.innerHTML = `
            <div class="notification-header">
                <h3>Notificări</h3>
                <button class="btn btn--sm btn--outline mark-all-read">Marchează toate ca citite</button>
            </div>
            <div class="notification-list">
                ${this.notifications.map(notification => `
                    <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                        <div class="notification-icon">
                            <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-time">${notification.time}</div>
                        </div>
                        ${!notification.read ? '<div class="notification-dot"></div>' : ''}
                    </div>
                `).join('')}
            </div>
            <div class="notification-footer">
                <a href="#" class="btn btn--outline btn--sm">Vezi toate notificările</a>
            </div>
        `;

        // Position dropdown
        const notificationBtn = document.querySelector('.notification-btn');
        const rect = notificationBtn.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = (rect.bottom + 8) + 'px';
        dropdown.style.right = '20px';
        dropdown.style.width = '350px';
        dropdown.style.maxHeight = '400px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.zIndex = '1000';
        dropdown.style.boxShadow = 'var(--shadow-lg)';

        document.body.appendChild(dropdown);

        // Mark all as read functionality
        dropdown.querySelector('.mark-all-read').addEventListener('click', () => {
            this.markAllNotificationsAsRead();
            this.updateNotificationBadge();
            dropdown.remove();
        });

        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                    dropdown.remove();
                }
            }, { once: true });
        }, 100);
    }

    getNotificationIcon(type) {
        const icons = {
            'task': 'tasks',
            'deadline': 'clock',
            'comment': 'comment',
            'project': 'folder'
        };
        return icons[type] || 'bell';
    }

    markAllNotificationsAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    renderCurrentPage() {
        switch (this.currentPage) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'projects':
                this.renderProjects();
                break;
            case 'tasks':
                this.renderTasks();
                break;
            case 'kanban':
                this.renderKanban();
                break;
            case 'calendar':
                // Calendar is handled in showCalendarPage
                break;
            case 'team':
                this.renderTeam();
                break;
            case 'time-tracking':
                this.renderTimeTracking();
                break;
            case 'reports':
                this.renderReports();
                break;
          case 'gantt':
              this.renderGanttPage();
              break;
          case 'notes':
              this.renderNotesPage();
              break;
        }
    }

    renderDashboard() {
        this.updateDashboardStats();
        this.renderRecentActivity();
        this.renderUpcomingDeadlines();
        setTimeout(() => {
            this.renderProjectProgressChart();
        }, 100);
    }

    updateDashboardStats() {
        document.getElementById('totalProjects').textContent = this.data.projects.length;
        document.getElementById('totalTasks').textContent = this.data.tasks.length;
        document.getElementById('completedTasks').textContent = this.data.tasks.filter(t => t.status === 'Done').length;
        document.getElementById('teamMembers').textContent = this.data.users.length;
    }

    async renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if(!container) return;
        // Helper: relative time string in RO
        const relTime = (d)=>{
            try{
                const now = new Date();
                const t = new Date(d);
                const diff = Math.max(0, now - t);
                const mins = Math.floor(diff/60000);
                if(mins < 1) return 'chiar acum';
                if(mins < 60) return `${mins} min în urmă`;
                const hours = Math.floor(mins/60);
                if(hours < 24) return `${hours} ore în urmă`;
                const days = Math.floor(hours/24);
                if(days === 1) return 'ieri';
                return `${days} zile în urmă`;
            }catch(_){ return ''; }
        };
        const escape = (s)=> this._escapeHtml ? this._escapeHtml(s) : String(s||'');
        const userById = (id)=> (this.data.users||[]).find(u=> u.id === id);

        let items = [];
        if(this._usingSupabase && this.store && typeof this.store.getRecentAudit === 'function' && !this.store._auditDisabled){
            // Load from Supabase audit_log
            try{
                const rows = await this.store.getRecentAudit(6);
                items = rows.map(r=>{
                    // Try to infer user and target name
                    const meta = r.metadata || {};
                    let who = (meta.user_id && userById(meta.user_id)) || null;
                    const entityType = r.entity_type;
                    const entityId = r.entity_id;
                    let target = '';
                    if(entityType === 'task'){
                        const t = (this.data.tasks||[]).find(x=> x.id === entityId); target = t? t.title : (meta.description||'');
                    } else if(entityType === 'project'){
                        const p = (this.data.projects||[]).find(x=> x.id === entityId); target = p? p.name : (meta.description||'');
                    } else if(entityType === 'subtask'){
                        target = meta.description || '';
                    } else {
                        target = meta.description || '';
                    }
                    return {
                        user: who || { name: 'Utilizator', avatar: '👤' },
                        action: r.action,
                        target: target,
                        time: relTime(r.created_at)
                    };
                });
            }catch(e){ items = []; }
        }
        if(!items.length){
            // Fallback: local auditTrail
            let trail = [];
            try{ trail = JSON.parse(localStorage.getItem('auditTrail')||'[]'); }catch(_){ trail = []; }
            items = trail.slice(-6).reverse().map(en=>({
                user: { name: en.user || 'Utilizator', avatar: '👤' },
                action: en.action,
                target: en.entity,
                time: relTime(en.date)
            }));
        }
        // Hard cap at 6 to be safe in case any source returns more
        if(items.length > 6) items = items.slice(0,6);
        if(!items.length){
            container.innerHTML = '<div class="empty">Nicio activitate încă.</div>';
            return;
        }
        container.innerHTML = items.map(activity => {
            const user = activity.user || { name: 'Utilizator', avatar: '👤' };
            return `
            <div class="activity-item">
                ${this._avatarHtml(user.avatar, 40, user.name, 'activity-avatar')}
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${escape(user.name)}</strong> ${escape(activity.action)} <em>${escape(activity.target)}</em>
                    </div>
                    <div class="activity-time">${escape(activity.time)}</div>
                </div>
            </div>
        `;
        }).join('');
    }

    renderUpcomingDeadlines() {
        const container = document.getElementById('upcomingDeadlines');
        if(!container) return;
        const tasks = Array.isArray(this.data?.tasks) ? this.data.tasks : [];
        const users = Array.isArray(this.data?.users) ? this.data.users : [];
        const projects = Array.isArray(this.data?.projects) ? this.data.projects : [];
        const esc = (s)=> this._escapeHtml ? this._escapeHtml(s) : String(s||'');
        const rel = (date)=>{
            try { const d=new Date(date); const now=new Date(); const diff= d - now; const mins=Math.round(diff/60000); const abs=Math.abs(mins);
                if(abs < 1) return 'acum';
                if(abs < 60) return mins>0? `în ${abs} min` : `${abs} min în urmă`;
                const h=Math.round(abs/60); if(h<24) return mins>0? `în ${h} ore` : `${h} ore în urmă`;
                const days=Math.round(abs/1440); return mins>0? `în ${days} zile` : `${days} zile în urmă`; } catch(_){ return ''; }
        };
        const startOfDay = (d)=>{ const x=new Date(d); x.setHours(0,0,0,0); return x; };
        const today = startOfDay(new Date());
        const inDays = (d1,d2)=> Math.floor((startOfDay(d2) - startOfDay(d1)) / 86400000);

        const eligible = tasks.filter(t => t.dueDate && t.status !== 'Done');
        const parsed = eligible.map(t=> ({
            t,
            due: new Date(t.dueDate),
            proj: projects.find(p=> p.id === t.projectId),
            user: users.find(u=> u.id === t.assignedTo)
        })).filter(x=> !isNaN(x.due.getTime()));

    const windowDays = parseInt(localStorage.getItem('dashboard.deadline.windowDays')||'60', 10) || 60;
    const overdue = parsed.filter(x=> startOfDay(x.due) < today).sort((a,b)=> a.due - b.due).slice(0,5);
    const dueToday = parsed.filter(x=> startOfDay(x.due).getTime() === today.getTime()).sort((a,b)=> a.due - b.due);
    const soon = parsed.filter(x=> { const d=inDays(today, x.due); return d>0 && d<=windowDays; }).sort((a,b)=> a.due - b.due);

        const renderItem = (x, cls)=>{
            const avatar = x.user ? this._avatarHtml(x.user.avatar, 20, x.user.name, 'assignee-avatar') : '';
            const proj = x.proj ? `<span class="deadline-proj">${esc(x.proj.name)}</span>` : '';
            return `
                <div class="deadline-item ${cls}">
                    <div class="deadline-main">
                        <div class="deadline-title">${esc(x.t.title)}</div>
                        <div class="deadline-meta">${proj}${x.user? `<span class="deadline-dot">•</span>${esc(x.user.name)}`:''}</div>
                    </div>
                    <div class="deadline-side">
                        <div class="deadline-date" title="${this.formatDate(x.due)}">${this.formatDate(x.due)}</div>
                        <div class="deadline-rel">${esc(rel(x.due))}</div>
                        ${avatar}
                    </div>
                </div>`;
        };

        const sections = [];
        if(overdue.length){
            sections.push(`<div class="deadline-group"><div class="deadline-group-title">Întârziate</div>${overdue.map(x=> renderItem(x, 'due-overdue')).join('')}</div>`);
        }
        if(dueToday.length){
            sections.push(`<div class="deadline-group"><div class="deadline-group-title">Astăzi</div>${dueToday.map(x=> renderItem(x, 'due-today')).join('')}</div>`);
        }
        if(soon.length){
            sections.push(`<div class="deadline-group"><div class="deadline-group-title">Următoarele ${windowDays} zile</div>${soon.map(x=> renderItem(x, 'due-soon')).join('')}</div>`);
        }

        if(!sections.length){
            // Fallback: show the next 5 upcoming due dates even if they are outside the window
            const fallback = parsed.sort((a,b)=> a.due - b.due).slice(0,5);
            if(fallback.length){
                sections.push(`<div class="deadline-group"><div class="deadline-group-title">Următoarele scadențe</div>${fallback.map(x=> renderItem(x, 'due-later')).join('')}</div>`);
                container.innerHTML = sections.join('');
            } else {
                container.innerHTML = `<div class="deadline-empty">Nicio scadență apropiată.</div>`;
            }
        } else {
            container.innerHTML = sections.join('');
        }
    }

    renderProjects() {
        // ensure project progress values are up-to-date before rendering
        this.recalculateAllProjectProgresses();
        const container = document.getElementById('projectsContainer');
        // Controls bar for Projects (show archived toggle)
        this._injectProjectsControlsBar && this._injectProjectsControlsBar();
        const showArchivedProj = (localStorage.getItem('projects.showArchived')||'false') === 'true';
        const allProjects = this.data && Array.isArray(this.data.projects) ? this.data.projects : [];
        const projects = showArchivedProj ? allProjects : allProjects.filter(p=> !p.isArchived);
        const users = this.data && Array.isArray(this.data.users) ? this.data.users : [];
        container.innerHTML = projects.map(project => {
            const teamAvatars = Array.isArray(project.teamMembers) ? project.teamMembers.slice(0, 3).map(memberId => {
                const member = users.find(u => u.id === memberId);
                const avatarVal = member && member.avatar ? member.avatar : '👥';
                const name = member && member.name ? member.name : 'Membru';
                return this._avatarHtml(avatarVal, 32, name, 'team-avatar');
            }).join('') : '';

            const tags = Array.isArray(project.tags) ? project.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

            const archived = !!project.isArchived;
            return `
                <div class="project-card card ${archived? 'archived':''}" data-project-id="${project.id}">
                    <div class="project-header">
                        <h3 class="project-title">${project.name}</h3>
                        <p class="project-description">${project.description || ''}</p>
                        <div class="project-actions">
                            <button class="btn btn--sm btn--outline project-edit-btn" data-project-id="${project.id}"><i class="fas fa-edit"></i> ${(this.t && this.t('btn.edit'))}</button>
                            <button class="delete-btn" data-project-id="${project.id}"><i class="fas fa-trash-alt"></i> ${(this.t && this.t('btn.delete'))}</button>
                            <button class="btn btn--sm btn--outline project-archive-btn" data-project-id="${project.id}" title="${archived? 'Re-Activează':'Arhivează'}"><i class="fas fa-box-archive"></i></button>
                            <button class="btn btn--sm btn--outline project-dup-btn" data-project-id="${project.id}" title="Duplicate"><i class="fas fa-copy"></i></button>
                        </div>
                    </div>
                    <div class="project-body">
                        <div class="project-meta">
                            <span class="status status--${this.getStatusClass(project.status)}">${this.translateStatus(project.status)}</span>
                            <span class="priority-badge priority-${(project.priority||'').toLowerCase()}">${this.translatePriority(project.priority)}</span>
                        </div>
                        <div class="project-progress">
                            <div class="progress-label">
                                <span>Progres</span>
                                <span>${project.progress || 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                            </div>
                        </div>
                        <div class="project-footer">
                            <div class="project-team">
                                <i class="fas fa-users"></i>
                                <div class="team-avatars">${teamAvatars}</div>
                            </div>
                            <div class="project-date">
                                <i class="fas fa-calendar"></i>
                                ${this.formatDate(project.dueDate)}
                            </div>
                        </div>
                        <div class="project-tags">${tags}</div>
                    </div>
                </div>
            `;
        }).join('');
        // attach edit listeners
        container.querySelectorAll('.project-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e)=> {
                const id = e.currentTarget.dataset.projectId;
                const proj = this.data.projects.find(p=> p.id === id);
                if(proj) this.openProjectModal(proj);
            });
        });
        // attach delete listeners
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e)=> {
                const id = e.currentTarget.dataset.projectId;
                this.confirmDeleteProject(id);
            });
        });
        // attach duplicate handler
        container.querySelectorAll('.project-dup-btn').forEach(btn => {
            btn.addEventListener('click', (e)=>{
                const id = e.currentTarget.dataset.projectId; this.duplicateProject && this.duplicateProject(id);
            });
        });
        // attach archive toggle
        container.querySelectorAll('.project-archive-btn').forEach(btn => {
            if(btn._bound) return; btn._bound = true;
            btn.addEventListener('click', async (e)=>{
                const id = e.currentTarget.dataset.projectId;
                const p = (this.data.projects||[]).find(x=> x.id === id); if(!p) return;
                p.isArchived = !p.isArchived;
                try{
                    if(this._usingSupabase && this.store && typeof this.store.updateProject === 'function'){
                        await this.store.updateProject(id, { isArchived: p.isArchived });
                    } else if(this.store && typeof this.store.save === 'function'){
                        this.store.save();
                    }
                }catch(_){ }
                this.renderProjects();
            });
        });
        // keep task project filter up-to-date
        this.populateTaskProjectFilter();
        // keep gantt project filter up-to-date
        this.populateGanttProjectFilter();
    }

    _injectProjectsControlsBar(){
        try{
            const page = document.getElementById('projectsPage'); if(!page) return;
            let bar = document.getElementById('projectsControlsBar');
            if(!bar){
                bar = document.createElement('div');
                bar.id = 'projectsControlsBar';
                bar.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;justify-content:flex-end;';
                const container = document.getElementById('projectsContainer');
                if(container && container.parentNode){ container.parentNode.insertBefore(bar, container); }
            }
            const showArchived = (localStorage.getItem('projects.showArchived')||'false')==='true';
            bar.innerHTML = `<label style="display:flex;align-items:center;gap:6px;font-size:.9rem;color:var(--color-text-secondary)"><input type="checkbox" id="toggleShowArchivedProjects" ${showArchived?'checked':''}/> Arată proiecte arhivate</label>`;
            const chk = bar.querySelector('#toggleShowArchivedProjects');
            if(chk && !chk._bound){ chk.addEventListener('change', ()=>{ localStorage.setItem('projects.showArchived', String(!!chk.checked)); this.renderProjects(); }); chk._bound = true; }
        }catch(_){ }
    }

    renderTasks() {
        // keep project progress in sync with tasks/subtasks
        this.recalculateAllProjectProgresses();
        const container = document.getElementById('tasksTable');
        // inject controls bar (show archived)
        this._injectTasksControlsBar && this._injectTasksControlsBar();
        const showArchivedTasks = (localStorage.getItem('tasks.showArchived')||'false') === 'true';
        let tasks = this.getFilteredTasks();
        if(!showArchivedTasks){ tasks = tasks.filter(t=> !t.isArchived); }
        // Order by sortIndex if present, fallback original array order
        if(tasks.some(t=> typeof t.sortIndex === 'number')){
            tasks = [...tasks].sort((a,b)=>{
                const ai = (typeof a.sortIndex === 'number') ? a.sortIndex : Number.MAX_SAFE_INTEGER;
                const bi = (typeof b.sortIndex === 'number') ? b.sortIndex : Number.MAX_SAFE_INTEGER;
                return ai - bi;
            });
        }
        
    // Inject Saved Filters bar above table
    this.injectSavedFiltersToolbar && this.injectSavedFiltersToolbar();
    container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>${this.t('tasks.header.task')}</th>
                        <th>${this.t('tasks.header.project')}</th>
                        <th>${this.t('tasks.header.assignee')}</th>
                        <th>${this.t('tasks.header.status')}</th>
                        <th>${this.t('tasks.header.priority')}</th>
                        <th>${this.t('tasks.header.due')}</th>
                        <th>${this.t('tasks.header.progress')}</th>
                        <th>${this.t('tasks.header.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${tasks.map(task => {
                        const project = this.data.projects.find(p => p.id === task.projectId);
                        const assignee = this.data.users.find(u => u.id === task.assignedTo);
                        const completedSubtasks = (task.subtasks||[]).filter(st => st.completed).length;
                        const totalSubtasks = (task.subtasks||[]).length;
                        // Use the central logic so status=Done reflects 100% even without subtasks
                        const progress = this.computeTaskProgress(task);

                        // render subtasks inline in a compact professional layout
                        const subtasksHtml = (task.subtasks||[]).map(st => `
                            <div class="subtask-item" data-subtask-id="${st.id}">
                                <label class="subtask-label">
                                    <input type="checkbox" class="subtask-checkbox" data-task-id="${task.id}" data-subtask-id="${st.id}" ${st.completed? 'checked' : ''} />
                                    <span class="subtask-title">${st.title}</span>
                                </label>
                                <div class="subtask-meta">
                                    <span class="subtask-duration">${(st.startDate||st.dueDate)? (st.startDate && st.dueDate ? (this.formatDate(st.startDate) + ' → ' + this.formatDate(st.dueDate)) : (st.startDate? this.formatDate(st.startDate) : this.formatDate(st.dueDate))) : (st.duration? st.duration + 'd' : '')}</span>
                    <button class="subtask-edit" data-task-id="${task.id}" data-subtask-id="${st.id}" title="${this.t('btn.edit')}">${this.t('btn.edit')}</button>
                    <button class="subtask-delete" data-task-id="${task.id}" data-subtask-id="${st.id}" title="${this.t('btn.delete')}">${this.t('btn.delete')}</button>
                                </div>
                            </div>
                        `).join('') || `<div class="text-muted">${this.t('subtask.none')}</div>`;

                        const archived = !!task.isArchived;
                        return `
                            <tr data-task-id="${task.id}" class="${archived? 'archived':''}">
                                <td>
                                    <div class="task-title"><input type="checkbox" class="task-complete-toggle" data-task-id="${task.id}" title="Marchează ca finalizat" ${task.status==='Done'? 'checked':''} style="margin-right:8px;vertical-align:middle;"/>${task.title}</div>
                                    <div class="task-description">${task.description || ''}</div>
                                    <div class="task-subtasks" data-task-id="${task.id}">
                                        <div class="subtasks-panel" data-task-id="${task.id}">
                                            <div class="subtasks-header">
                                                <button class="subtasks-toggle" aria-expanded="true" data-task-id="${task.id}">
                                                    <span class="chev">▾</span>
                                                    <span class="label">Subtask-uri</span>
                                                    <span class="count">${completedSubtasks}/${totalSubtasks}</span>
                                                </button>
                                            </div>
                                            <div class="subtasks-list">
                                                ${subtasksHtml}
                                            </div>
                                            <div class="subtask-add" style="margin-top:8px;">
                                                <div style="display:flex;gap:8px;align-items:center;">
                                                    <input type="text" class="form-control inline-new-subtask" placeholder="${this.t('subtask.add.placeholder')}" data-task-id="${task.id}" />
                                                    <input type="date" class="form-control inline-new-subtask-start" data-task-id="${task.id}" style="width:140px;" />
                                                    <input type="date" class="form-control inline-new-subtask-end" data-task-id="${task.id}" style="width:140px;" />
                                                    <button class="btn btn--sm btn--primary inline-add-subtask" data-task-id="${task.id}">${this.t('subtask.add')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>${project ? project.name : 'N/A'}</td>
                                <td>
                                    ${assignee ? `
                                        <div class="assignee-cell">
                                            ${this._avatarHtml(assignee.avatar,28,assignee.name,'assignee-avatar')}
                                            <span class="assignee-name">${assignee.name}</span>
                                        </div>
                                    ` : this.t('unassigned')}
                                </td>
                                <td><span class="status status--${this.getStatusClass(task.status)}">${this.translateStatus(task.status)}</span></td>
                                <td><span class="priority-badge priority-${task.priority.toLowerCase()}">${this.translatePriority(task.priority)}</span></td>
                                <td>${task.dueDate ? this.formatDate(task.dueDate) : 'N/A'}</td>
                                <td>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progress}%"></div>
                                    </div>
                                    <small>${progress}%</small>
                                </td>
                                <td>
                                        <div class="task-actions">
                                            <button class="btn btn--sm btn--outline task-edit-btn" data-task-id="${task.id}"><i class="fas fa-edit"></i></button>
                                <button class="delete-btn" data-task-id="${task.id}"><i class="fas fa-trash-alt"></i></button>
                                            <button class="btn btn--sm btn--outline task-dup-btn" title="Duplicate" data-task-id="${task.id}"><i class="fas fa-copy"></i></button>
                                            <button class="btn btn--sm btn--outline task-extract-checklist" title="Extract checklist" data-task-id="${task.id}"><i class="fas fa-list-check"></i></button>
                                            <button class="btn btn--sm btn--outline task-archive-btn" title="${archived? 'Re-Activează':'Arhivează'}" data-task-id="${task.id}"><i class="fas fa-box-archive"></i></button>
                                            <button class="btn btn--sm btn--outline gantt-config-btn" data-task-id="${task.id}"><i class="fas fa-chart-bar"></i></button>
                                        </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        container.querySelectorAll('.task-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e)=> {
                const id = e.currentTarget.dataset.taskId;
                const t = this.data.tasks.find(tsk=> tsk.id === id);
                if(t) this.openTaskModal(t);
            });
        });
        // delete handlers
        container.querySelectorAll('.delete-btn[data-task-id]').forEach(btn => {
            btn.addEventListener('click', (e)=> {
                const id = e.currentTarget.dataset.taskId;
                this.confirmDeleteTask(id);
            });
        });
        // gantt config handlers
        container.querySelectorAll('.gantt-config-btn').forEach(btn => {
            btn.addEventListener('click', (e)=> {
                const id = e.currentTarget.dataset.taskId;
                const t = this.data.tasks.find(tsk=> tsk.id === id);
                if(t) this.openGanttModal(t);
            });
        });

        // duplicate and checklist handlers
        container.querySelectorAll('.task-dup-btn').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const id = btn.dataset.taskId; this.duplicateTask && this.duplicateTask(id);
            });
        });
        container.querySelectorAll('.task-extract-checklist').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const id = btn.dataset.taskId; this.extractChecklistToSubtasks && this.extractChecklistToSubtasks(id);
            });
        });
        // archive toggle handlers
        container.querySelectorAll('.task-archive-btn').forEach(btn=>{
            if(btn._bound) return; btn._bound = true;
            btn.addEventListener('click', async ()=>{
                const id = btn.dataset.taskId; const t = (this.data.tasks||[]).find(x=> x.id === id); if(!t) return;
                t.isArchived = !t.isArchived;
                try{
                    if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                        await this.store.updateTask(id, { isArchived: t.isArchived });
                    } else if(this.store && typeof this.store.save === 'function'){
                        this.store.save();
                    }
                }catch(_){ }
                this.renderTasks(); this.updateKanbanBoard && this.updateKanbanBoard();
            });
        });

        // quick complete toggle handlers
        container.querySelectorAll('.task-complete-toggle').forEach(chk=>{
            chk.addEventListener('change', ()=>{
                const id = chk.getAttribute('data-task-id');
                const done = chk.checked;
                const newStatus = done ? 'Done' : 'In Progress';
                this.updateTaskStatus(id, newStatus);
                // keep UI coherent
                setTimeout(()=>{
                    if(this.currentPage === 'tasks') this.renderTasks();
                    if(this.currentPage === 'kanban') this.updateKanbanBoard();
                    if(this.currentPage === 'dashboard') this.renderDashboard();
                    if(this.currentPage === 'reports') this.renderReports();
                }, 50);
            });
        });

        // attach subtask inline handlers: checkbox, delete, add
        container.querySelectorAll('.subtask-checkbox').forEach(chk=>{
            chk.addEventListener('change', async (e)=>{
                const taskId = chk.dataset.taskId; const subId = chk.dataset.subtaskId;
                const task = this.data.tasks.find(t=> t.id === taskId); if(!task) return;
                const s = task.subtasks.find(ss=> ss.id === subId); if(!s) return;
                const prev = !!s.completed;
                s.completed = chk.checked;
                if(this._usingSupabase && this.store && this.store.updateSubtask){
                    const ok = await this.store.updateSubtask(subId, { completed: s.completed });
                    if(ok !== true){ s.completed = prev; chk.checked = prev; if(window.Toast) window.Toast.push('Eroare la salvarea subtask-ului', 'error'); }
                } else if(this.store && typeof this.store.save === 'function') {
                    this.store.save();
                }
                // Persist and reflect updated task progress when subtasks change
                try { this.updateTaskComputedProgress && this.updateTaskComputedProgress(taskId); } catch(_){}
                this.renderTasks();
            });
        });
        container.querySelectorAll('.subtask-delete').forEach(btn=>{
            btn.addEventListener('click', async (e)=>{
                const taskId = btn.dataset.taskId; const subId = btn.dataset.subtaskId;
                const task = this.data.tasks.find(t=> t.id === taskId); if(!task) return;
                const idx = task.subtasks.findIndex(s=> s.id === subId); if(idx<0) return;
                const removed = task.subtasks[idx];
                task.subtasks.splice(idx,1);
                if(this._usingSupabase && this.store && this.store.deleteSubtask){
                    const ok = await this.store.deleteSubtask(subId);
                    if(ok !== true){ task.subtasks.splice(idx,0,removed); if(window.Toast) window.Toast.push('Nu pot șterge subtask-ul', 'error'); }
                } else if(this.store && typeof this.store.save === 'function') {
                    this.store.save();
                }
                // Persist and reflect updated task progress when subtasks change
                try { this.updateTaskComputedProgress && this.updateTaskComputedProgress(taskId); } catch(_){}
                this.renderTasks();
            });
        });
        // edit handlers
        container.querySelectorAll('.subtask-edit').forEach(btn=>{
            btn.addEventListener('click', (e)=>{
                const taskId = btn.dataset.taskId; const subId = btn.dataset.subtaskId;
                const task = this.data.tasks.find(t=> t.id === taskId); if(!task) return;
                const sub = task.subtasks.find(s=> s.id === subId); if(!sub) return;
                // replace subtask-item with an edit form inline
                const item = container.querySelector(`.subtask-item[data-subtask-id="${subId}"]`);
                if(!item) return;
                const editHtml = document.createElement('div');
                editHtml.className = 'subtask-edit-row';
                editHtml.innerHTML = `
                    <input class='form-control inline-edit-subtitle' value='${this._escapeHtml(sub.title)}' style='min-width:180px;margin-right:8px;' />
                    <input type='date' class='form-control inline-edit-substart' style='width:140px;margin-right:8px;' value='${sub.startDate||''}' />
                    <input type='date' class='form-control inline-edit-subend' style='width:140px;margin-right:8px;' value='${sub.dueDate||''}' />
                    <button class='btn btn--sm btn--primary inline-edit-save'>Salvează</button>
                    <button class='btn btn--sm btn--secondary inline-edit-cancel'>Anulează</button>
                `;
                item.style.display='none';
                item.parentNode.insertBefore(editHtml, item.nextSibling);
                const saveBtn = editHtml.querySelector('.inline-edit-save');
                const cancelBtn = editHtml.querySelector('.inline-edit-cancel');
                saveBtn.addEventListener('click', async ()=>{
                    const newTitle = editHtml.querySelector('.inline-edit-subtitle').value.trim();
                    const sVal = editHtml.querySelector('.inline-edit-substart').value;
                    const eVal = editHtml.querySelector('.inline-edit-subend').value;
                    if(!newTitle) return alert(this.t('subtask.titleRequired'));
                    if(sVal && eVal && new Date(eVal) < new Date(sVal)) return alert(this.t('gantt.dateRangeError'));
                    const prev = { title: sub.title, startDate: sub.startDate ?? null, dueDate: sub.dueDate ?? null };
                    sub.title = newTitle;
                    // normalize empty -> null so DB can clear values
                    sub.startDate = sVal ? sVal : null;
                    sub.dueDate = eVal ? eVal : null;
                    if(this._usingSupabase && this.store && this.store.updateSubtask){
                        const ok = await this.store.updateSubtask(sub.id, { title: sub.title, startDate: sub.startDate, dueDate: sub.dueDate });
                        if(ok !== true){ Object.assign(sub, prev); if(window.Toast) window.Toast.push('Nu pot salva subtask-ul', 'error'); }
                    } else if(this.store && typeof this.store.save==='function') {
                        this.store.save();
                    }
                    editHtml.remove(); item.style.display='flex'; this.renderTasks();
                });
                cancelBtn.addEventListener('click', ()=>{ editHtml.remove(); item.style.display='flex'; });
            });
        });
        container.querySelectorAll('.inline-add-subtask').forEach(btn=>{
            btn.addEventListener('click', async (e)=>{
                const taskId = btn.dataset.taskId; const input = container.querySelector(`.inline-new-subtask[data-task-id="${taskId}"]`);
                if(!input) return; const val = input.value && input.value.trim(); if(!val) return;
                const startInput = container.querySelector(`.inline-new-subtask-start[data-task-id="${taskId}"]`);
                const endInput = container.querySelector(`.inline-new-subtask-end[data-task-id="${taskId}"]`);
                const startVal = startInput && startInput.value ? startInput.value : undefined;
                const endVal = endInput && endInput.value ? endInput.value : undefined;
                // validate date range if both provided
                if(startVal && endVal && new Date(endVal) < new Date(startVal)){
                    return alert(this.t('gantt.dateRangeError'));
                }
                const task = this.data.tasks.find(t=> t.id === taskId); if(!task) return;
                task.subtasks = task.subtasks || [];
                let id = 'sub-' + Date.now();
                const newSub = { id, title: val, completed: false };
                if(startVal) newSub.startDate = startVal; if(endVal) newSub.dueDate = endVal;
                task.subtasks.push(newSub);
                if(this._usingSupabase && this.store && this.store.addSubtask){
                    const newId = await this.store.addSubtask(taskId, newSub);
                    if(newId) newSub.id = newId; else { task.subtasks = task.subtasks.filter(s=> s !== newSub); if(window.Toast) window.Toast.push('Nu pot adăuga subtask-ul', 'error'); }
                } else if(this.store && typeof this.store.save === 'function') {
                    this.store.save();
                }
                this.renderTasks();
            });
        });

        // ensure subtasks panels reflect persisted collapsed state (use shared map on this)
        this._collapsedTasks = this._collapsedTasks || this._collapsedTasks === undefined ? (this._collapsedTasks) : {}; // preserve existing if present
        // fallback to app-level map if available
        if(this._collapsedTasks === undefined && window.projectHub && window.projectHub._collapsedTasks) this._collapsedTasks = window.projectHub._collapsedTasks;
        // initialize shared map on app if missing
        if(!this._collapsedTasks && window.projectHub) { window.projectHub._collapsedTasks = window.projectHub._collapsedTasks || {}; this._collapsedTasks = window.projectHub._collapsedTasks; }

        container.querySelectorAll('.subtasks-panel').forEach(panel => {
            const taskId = panel.dataset.taskId;
            const collapsed = (window.projectHub && window.projectHub._collapsedTasks) ? window.projectHub._collapsedTasks[taskId] : this._collapsedTasks && this._collapsedTasks[taskId];
            const isCollapsed = typeof collapsed === 'undefined' ? true : !!collapsed; // default collapsed
            if(isCollapsed) panel.classList.add('collapsed'); else panel.classList.remove('collapsed');
            // update toggle aria
            const toggle = panel.querySelector('.subtasks-toggle');
            if(toggle) { toggle.setAttribute('aria-expanded', (!isCollapsed).toString()); toggle.querySelector('.chev').textContent = !isCollapsed ? '▾' : '▸'; }
        });

        // subtasks panel toggle handlers - update shared map and persist (via gantt manager persistence key)
        container.querySelectorAll('.subtasks-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = btn.dataset.taskId;
                const panel = container.querySelector(`.subtasks-panel[data-task-id="${taskId}"]`);
                if(!panel) return;
                const currentlyExpanded = btn.getAttribute('aria-expanded') === 'true';
                const willBeExpanded = !currentlyExpanded;
                // update DOM
                if(willBeExpanded){ panel.classList.remove('collapsed'); btn.setAttribute('aria-expanded','true'); btn.querySelector('.chev').textContent = '▾'; }
                else { panel.classList.add('collapsed'); btn.setAttribute('aria-expanded','false'); btn.querySelector('.chev').textContent = '▸'; }
                // update shared map
                if(window.projectHub){ window.projectHub._collapsedTasks = window.projectHub._collapsedTasks || {}; window.projectHub._collapsedTasks[taskId] = !willBeExpanded ? true : false; localStorage.setItem('gantt.collapsedTasks', JSON.stringify(window.projectHub._collapsedTasks)); }
                else { this._collapsedTasks = this._collapsedTasks || {}; this._collapsedTasks[taskId] = !willBeExpanded ? true : false; localStorage.setItem('gantt.collapsedTasks', JSON.stringify(this._collapsedTasks)); }
                // trigger re-render if Gantt is present so rows line up
                if(window.projectHub && window.projectHub.ganttManager) window.projectHub.ganttManager.render();
            });
        });

        // Enable drag-and-drop reordering for task table rows
        try{
            const tbody = container.querySelector('tbody');
            if(tbody){
                let dragSrcId = null;
                // insertion indicator element (single reused DOM node)
                let insertIndicator = document.getElementById('task-insert-indicator');
                if(!insertIndicator){ insertIndicator = document.createElement('div'); insertIndicator.id='task-insert-indicator'; insertIndicator.style.position='absolute'; insertIndicator.style.height='3px'; insertIndicator.style.background='var(--color-primary)'; insertIndicator.style.boxShadow='0 1px 2px rgba(0,0,0,0.08)'; insertIndicator.style.zIndex='1200'; insertIndicator.style.display='none'; document.body.appendChild(insertIndicator); }

                tbody.querySelectorAll('tr[data-task-id]').forEach(row=>{
                    const tid = row.dataset.taskId;
                    row.setAttribute('draggable','true');
                    row.addEventListener('dragstart', (ev)=>{
                        dragSrcId = tid;
                        try{ ev.dataTransfer.setData('text/plain', tid); }catch(e){}
                        try{ ev.dataTransfer.effectAllowed='move'; }catch(e){}
                        row.classList.add('dragging');
                    });
                    row.addEventListener('dragend', ()=>{
                        dragSrcId = null;
                        row.classList.remove('dragging');
                        // hide indicator and refresh
                        try{ insertIndicator.style.display='none'; }catch(e){}
                        this.renderTasks();
                    });
                    row.addEventListener('dragover', (ev)=>{ 
                        ev.preventDefault(); 
                        try{ ev.dataTransfer.dropEffect='move'; }catch(e){}
                        // show insertion indicator above or below the row depending on pointer
                        try{
                            const rect = row.getBoundingClientRect();
                            const above = ev.clientY < (rect.top + rect.height/2);
                            insertIndicator.style.width = rect.width + 'px';
                            insertIndicator.style.left = rect.left + 'px';
                            insertIndicator.style.top = (above ? rect.top - 2 : rect.bottom - 2) + 'px';
                            insertIndicator.style.display = 'block';
                        }catch(e){}
                    });
                    row.addEventListener('drop', (ev)=>{
                        ev.preventDefault();
                        try{ insertIndicator.style.display='none'; }catch(e){}
                        const targetId = row.dataset.taskId;
                        if(!dragSrcId || !targetId || dragSrcId === targetId) return;
                        try{
                            const tasksArr = this.data.tasks || [];
                            const srcIndex = tasksArr.findIndex(t=> t.id === dragSrcId);
                            let tgtIndex = tasksArr.findIndex(t=> t.id === targetId);
                            if(srcIndex < 0 || tgtIndex < 0) return;
                            const rect = row.getBoundingClientRect();
                            const insertBefore = ev.clientY < (rect.top + rect.height/2);
                            const [moved] = tasksArr.splice(srcIndex, 1);
                            if(!insertBefore){ tgtIndex = tasksArr.findIndex(t=> t.id === targetId) + 1; }
                            else { tgtIndex = tasksArr.findIndex(t=> t.id === targetId); }
                            if(tgtIndex < 0) tgtIndex = tasksArr.length;
                            tasksArr.splice(tgtIndex, 0, moved);
                            // Update sortIndex locally (1-based)
                            tasksArr.forEach((t,i)=> t.sortIndex = i+1);
                            if(this._usingSupabase && this.store && this.store.reorderTasks){
                                // Fire and forget; no await to keep UI smooth
                                this.store.reorderTasks(tasksArr.map(t=> t.id));
                            } else if(this.store && typeof this.store.save === 'function') {
                                this.store.save();
                            }
                            this.renderTasks();
                        }catch(e){ console.warn('Failed to reorder tasks in table', e); }
                    });
                });
            }
        }catch(e){ /* non-fatal */ }
    }

    renderKanban() {
        this.populateKanbanProjectFilter();
        this.updateKanbanBoard();
    }

    _injectTasksControlsBar(){
        try{
            const page = document.getElementById('tasksPage'); if(!page) return;
            let bar = document.getElementById('tasksControlsBar');
            if(!bar){
                bar = document.createElement('div');
                bar.id = 'tasksControlsBar';
                bar.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;justify-content:flex-end;';
                const container = document.getElementById('tasksTable');
                if(container && container.parentNode){ container.parentNode.insertBefore(bar, container); }
            }
            const showArchived = (localStorage.getItem('tasks.showArchived')||'false')==='true';
            bar.innerHTML = `<label style="display:flex;align-items:center;gap:6px;font-size:.9rem;color:var(--color-text-secondary)"><input type="checkbox" id="toggleShowArchivedTasks" ${showArchived?'checked':''}/> Arată task-uri arhivate</label>`;
            const chk = bar.querySelector('#toggleShowArchivedTasks');
            if(chk && !chk._bound){ chk.addEventListener('change', ()=>{ localStorage.setItem('tasks.showArchived', String(!!chk.checked)); this.renderTasks(); }); chk._bound = true; }
        }catch(_){ }
    }

    // Delete confirmations and simple audit trail
    confirmDeleteProject(projectId) {
        const idx = this.data.projects.findIndex(p => p.id === projectId);
        if (idx === -1) return;
        const project = this.data.projects[idx];
    const confirmProjMsg = this.t('confirm.deleteProject').replace('{name}', project.name);
    if (confirm(confirmProjMsg)) {
            const doDelete = async () => {
                try {
                    if(this._usingSupabase && this.store && typeof this.store.deleteProject === 'function'){
                        await this.store.deleteProject(projectId);
                    } else {
                        this.data.projects.splice(idx, 1);
                        this.data.tasks = this.data.tasks.filter(t => t.projectId !== projectId);
                        if (this.store && typeof this.store.save === 'function') this.store.save();
                        this.addAudit(this.t('audit.deleteProject') || 'Delete project', project.name);
                    }
                } catch(e){ console.warn('Failed to delete project', e); }
                this.renderProjects();
                this.renderTasks();
                this.updateKanbanBoard();
                this.showNotification(this.t('project.deleted') || 'Project deleted', 'success');
            };
            doDelete();
        }
    }

    confirmDeleteTask(taskId) {
        const idx = this.data.tasks.findIndex(t => t.id === taskId);
        if (idx === -1) return;
        const task = this.data.tasks[idx];
    const confirmTaskMsg = this.t('confirm.deleteTask').replace('{name}', task.title);
    if (confirm(confirmTaskMsg)) {
            const doDelete = async () => {
                try {
                    if(this._usingSupabase && this.store && typeof this.store.deleteTask === 'function'){
                        await this.store.deleteTask(taskId);
                    } else {
                        this.data.tasks.splice(idx, 1);
                        if (this.store && typeof this.store.save === 'function') this.store.save();
                        this.addAudit(this.t('audit.deleteTask') || 'Delete task', task.title);
                    }
                } catch(e){ console.warn('Failed to delete task', e); }
                this.renderTasks();
                this.updateKanbanBoard();
                this.showNotification(this.t('task.deleted') || 'Task deleted', 'success');
            };
            doDelete();
        }
    }

    addAudit(action, entity) {
        try {
            this.auditTrail = this.auditTrail || JSON.parse(localStorage.getItem('auditTrail') || '[]');
        } catch (e) {
            this.auditTrail = [];
        }
        const entry = { action, entity, user: 'Utilizator', date: new Date().toLocaleString() };
        this.auditTrail.push(entry);
        localStorage.setItem('auditTrail', JSON.stringify(this.auditTrail));
        this.renderAuditTrail();
    }

    renderAuditTrail() {
        try {
            this.auditTrail = this.auditTrail || JSON.parse(localStorage.getItem('auditTrail') || '[]');
        } catch (e) {
            this.auditTrail = [];
        }
        const container = document.getElementById('auditTrail');
        if (!container) return;
        container.innerHTML = '<h4>' + (this.t('audit.history') || 'Change history') + '</h4>' +
            this.auditTrail.slice(-30).reverse().map(en => `
                <div class="audit-entry">[${en.date}] ${en.user}: ${en.action} - ${en.entity}</div>
            `).join('');
    }

    populateKanbanProjectFilter() {
        const select = document.getElementById('kanbanProjectFilter');
        select.innerHTML = '<option value="">Toate proiectele</option>' +
            this.data.projects.map(project => 
                `<option value="${project.id}">${project.name}</option>`
            ).join('');
    }

    updateKanbanBoard() {
        const selectedProject = document.getElementById('kanbanProjectFilter').value;
        const tasks = selectedProject 
            ? this.data.tasks.filter(task => task.projectId === selectedProject)
            : this.data.tasks;

        const statuses = ['Not Started', 'In Progress', 'Review', 'Done'];

        statuses.forEach(status => {
            const container = document.querySelector(`[data-status="${status}"] .tasks-container`);
            const statusTasks = tasks.filter(task => task.status === status);
            const count = document.querySelector(`[data-status="${status}"] .task-count`);
            
            count.textContent = statusTasks.length;
            
            container.innerHTML = statusTasks.map(task => {
                const assignee = this.data.users.find(u => u.id === task.assignedTo);
                const completedSub = (task.subtasks||[]).filter(st => st.completed).length;
                const totalSub = (task.subtasks||[]).length;
                return `
                    <div class="kanban-task" data-task-id="${task.id}" draggable="true">
                        <div class="kanban-task-title">${task.title}</div>
                        <div class="kanban-task-meta">
                            <span class="priority-badge priority-${task.priority.toLowerCase()}">${this.translatePriority(task.priority)}</span>
                            ${assignee ? this._avatarHtml(assignee.avatar,20,assignee.name,'assignee-avatar') : ''}
                            ${totalSub ? `<span class="subtask-progress-badge">${completedSub}/${totalSub}</span>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        });
    }

    renderTeam() {
        const container = document.getElementById('teamGrid');
        container.innerHTML = this.data.users.map(user => {
            const userTasks = this.data.tasks.filter(task => task.assignedTo === user.id);
            const completedTasks = userTasks.filter(task => task.status === 'Done').length;
            const totalHours = this.data.timeEntries
                .filter(entry => entry.userId === user.id)
                .reduce((sum, entry) => sum + entry.hours, 0);
            return `
                <div class="team-member-card card" data-user-id="${user.id}">
                    ${this._avatarHtml(user.avatar,64,user.name,'member-avatar')}
                    <h3 class="member-name">${user.name}</h3>
                    <p class="member-role">${user.role || ''}</p>
                    <div class="member-stats">
                        <div class="stat">
                            <div class="stat-value">${userTasks.length}</div>
                            <div class="stat-name">Task-uri</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${completedTasks}</div>
                            <div class="stat-name">Finalizate</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${totalHours}h</div>
                            <div class="stat-name">Ore Totale</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${user.hoursPerWeek || 0}h</div>
                            <div class="stat-name">Ore/Săpt</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:12px;">
                        <button class="btn btn--sm btn--outline edit-member-btn" data-user-id="${user.id}">${this.t('btn.edit') || 'Edit'}</button>
                        <button class="delete-btn delete-member-btn" data-user-id="${user.id}">${this.t('btn.delete') || 'Delete'}</button>
                    </div>
                </div>
            `;
        }).join('');

        // attach edit/delete handlers
        container.querySelectorAll('.delete-member-btn').forEach(btn=>{
            btn.addEventListener('click', (e)=>{
                const id = e.currentTarget.dataset.userId; this.confirmDeleteMember(id);
            });
        });
        container.querySelectorAll('.edit-member-btn').forEach(btn=>{
            btn.addEventListener('click', (e)=>{
                const id = e.currentTarget.dataset.userId; const user = this.data.users.find(u=>u.id===id); if(user) this.openMemberModal(user);
            });
        });
    }

    openMemberModal(user=null){
        const modal = document.getElementById('memberModal');
        const title = document.getElementById('memberModalTitle');
        const form = document.getElementById('memberForm');
        if(user){
            title.textContent = this.t('btn.edit') + ' ' + (this.t('member') || 'Membru');
            form.dataset.editingId = user.id;
            document.getElementById('memberName').value = user.name || '';
            document.getElementById('memberRole').value = user.role || '';
            document.getElementById('memberAvatar').value = user.avatar || '';
        } else {
            title.textContent = this.t('create.newMember') || 'Adaugă Membru';
            delete form.dataset.editingId;
            form.reset();
        }
        this.showModal(modal);
    }

    saveMember(){
        const form = document.getElementById('memberForm');
        const editingId = form.dataset.editingId;
        const name = document.getElementById('memberName').value && document.getElementById('memberName').value.trim();
    if(!name) { alert(this.t('member.nameRequired') || 'Member name is required'); return; }
        const role = document.getElementById('memberRole').value;
    // Accept either an emoji or an image URL. If empty, use a default emoji.
    const rawAvatar = document.getElementById('memberAvatar').value && document.getElementById('memberAvatar').value.trim();
    const avatar = rawAvatar || '👤';
            if(editingId){
            // Update existing member
            if(this._usingSupabase && this.store && typeof this.store.updateUser === 'function'){
                this.store.updateUser(editingId, { name, role, avatar })
                    .then(()=>{
                        this.closeModals();
                        if(this.currentPage === 'team') this.renderTeam();
                        this.showNotification(this.t('member.updated'), 'success');
                    })
                    .catch(()=>{ this.showNotification('Eroare la actualizarea membrului', 'error'); });
            } else {
                const u = this.data.users.find(x=> x.id === editingId);
                if(u){ u.name = name; u.role = role; u.avatar = avatar; }
                if(this.store && typeof this.store.save === 'function') this.store.save();
                this.closeModals();
                if(this.currentPage === 'team') this.renderTeam();
                this.showNotification(this.t('member.updated'), 'success');
            }
            return;
        }
        // Create new member
        if(this._usingSupabase && this.store && typeof this.store.addUser === 'function'){
            this.store.addUser({ name, role, avatar, hoursPerWeek: 40 })
                .then(()=>{
                    this.closeModals();
                    if(this.currentPage === 'team') this.renderTeam();
                    this.showNotification(this.t('member.added'), 'success');
                })
                .catch(()=>{ this.showNotification('Eroare la adăugarea membrului', 'error'); });
        } else {
            const newUser = { id: 'user-'+Date.now(), name, role, avatar, hoursPerWeek: 40 };
            this.data.users.push(newUser);
            if(this.store && typeof this.store.save === 'function') this.store.save();
            this.closeModals();
            if(this.currentPage === 'team') this.renderTeam();
            this.showNotification(this.t('member.added'), 'success');
        }
    }

    confirmDeleteMember(userId){
        const idx = this.data.users.findIndex(u=> u.id === userId); if(idx === -1) return;
        const user = this.data.users[idx];
        const confirmMemberMsg = this.t('confirm.deleteMember').replace('{name}', user.name);
        if(!confirm(confirmMemberMsg)) return;
        if(this._usingSupabase && this.store && typeof this.store.deleteUser === 'function'){
            this.store.deleteUser(userId)
                .then(()=>{
                    if(this.currentPage === 'team') this.renderTeam();
                    this.showNotification(this.t('member.deleted'), 'success');
                })
                .catch(()=>{ this.showNotification('Nu pot șterge membrul', 'error'); });
        } else {
            // remove locally and unassign tasks
            this.data.users.splice(idx,1);
            this.data.tasks.forEach(t=>{ if(t.assignedTo === userId) t.assignedTo = ''; });
            if(this.store && typeof this.store.save === 'function') this.store.save();
            if(this.currentPage === 'team') this.renderTeam();
            this.showNotification(this.t('member.deleted'), 'success');
        }
    }

    renderTimeTracking() {
        this.updateTodayTime();
        this.renderRecentTimeEntries();
        // refresh Pomodoro UI each time page renders
        try{ this._refreshPomodoroTaskOptions(); this._updatePomodoroUI(); }catch(_){ }
    }

    updateTodayTime() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.data.timeEntries.filter(entry => entry.date === today);
        const totalHours = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);
        
        document.getElementById('todayTime').textContent = `${hours}h ${minutes}m`;
    }

    renderRecentTimeEntries() {
        const container = document.getElementById('recentTimeEntries');
        const sortedEntries = [...this.data.timeEntries]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        container.innerHTML = sortedEntries.map(entry => {
            const task = this.data.tasks.find(t => t.id === entry.taskId);
            const hours = Math.floor(entry.hours);
            const minutes = Math.round((entry.hours - hours) * 60);

            return `
                <div class="time-entry">
                    <div class="time-entry-task">${task ? task.title : 'Task necunoscut'}</div>
                    <div class="time-entry-duration">${hours}h ${minutes}m</div>
                </div>
            `;
        }).join('');
    }

    renderReports() {
        // Debounce multiple rapid navigations to raport tab
        clearTimeout(this._reportsRenderTimer);
        this._reportsRenderTimer = setTimeout(() => {
            try {
                // Ensure data arrays exist to avoid Chart.js throwing on undefined
                this.data.projects = Array.isArray(this.data.projects) ? this.data.projects : [];
                this.data.users = Array.isArray(this.data.users) ? this.data.users : [];
                this.data.tasks = Array.isArray(this.data.tasks) ? this.data.tasks : [];
                // Populate filters (projects/users)
                this._populateReportsFilters();
                this.renderProjectsChart();
            } catch(e){ console.warn('renderProjectsChart failed', e); }
            try {
                this.renderTeamProductivityChart();
            } catch(e){ console.warn('renderTeamProductivityChart failed', e); }
            try { this.renderTasksStatusChart(); } catch(e){ console.warn('renderTasksStatusChart failed', e); }
            try { this.renderOverdueByProjectChart(); } catch(e){ console.warn('renderOverdueByProjectChart failed', e); }
            try { this.renderWorkloadByAssigneeChart(); } catch(e){ console.warn('renderWorkloadByAssigneeChart failed', e); }
            try { this.renderThroughputChart(); } catch(e){ console.warn('renderThroughputChart failed', e); }
            try { this.renderAgingWipTable(); } catch(e){ console.warn('renderAgingWipTable failed', e); }
            try { this._bindReportsControls(); } catch(e){ /* ignore */ }
        }, 140);
    }

    // ===== Pomodoro / Focus Sessions =====
    _initPomodoroUI(){
        const modeSel = document.getElementById('pomoMode');
        const focusIn = document.getElementById('pomoFocusMins');
        const shortIn = document.getElementById('pomoShortMins');
        const longIn = document.getElementById('pomoLongMins');
        const longEveryIn = document.getElementById('pomoLongEvery');
        const autoChk = document.getElementById('pomoAutoContinue');
        const soundChk = document.getElementById('pomoSound');
        const startBtn = document.getElementById('pomoStart');
        const pauseBtn = document.getElementById('pomoPause');
        const resumeBtn = document.getElementById('pomoResume');
        const skipBtn = document.getElementById('pomoSkip');
        const resetBtn = document.getElementById('pomoReset');
        const taskSel = document.getElementById('timeTaskSelect');
        if(!modeSel || modeSel._bound) return; // bind once
        modeSel._bound = true;

        // initial options for task
        this._refreshPomodoroTaskOptions();

        const applyDurations = ()=>{
            const f = Math.max(1, parseInt(focusIn.value||'25',10));
            const s = Math.max(1, parseInt(shortIn.value||'5',10));
            const l = Math.max(1, parseInt(longIn.value||'15',10));
            const le = Math.max(1, parseInt(longEveryIn.value||'4',10));
            this.pomodoro.focusMs = f*60000; this.pomodoro.shortMs = s*60000; this.pomodoro.longMs = l*60000; this.pomodoro.longEvery = le;
            // reset current phase durations keeping remaining proportional only if running
            if(!this.pomodoro.running){ this._setPomodoroPhase(this.pomodoro.phase); this._updatePomodoroUI(); }
        };
        [focusIn, shortIn, longIn, longEveryIn].forEach(inp=> inp.addEventListener('change', applyDurations));
        autoChk.addEventListener('change', ()=>{ this.pomodoro.autoContinue = !!autoChk.checked; });
        modeSel.addEventListener('change', ()=>{ this._setPomodoroPhase(modeSel.value); this._updatePomodoroUI(); });
        if(taskSel){ taskSel.addEventListener('change', ()=>{ this.pomodoro.taskId = taskSel.value || ''; }); }
        if(soundChk){
            try{ soundChk.checked = !!this.pomodoro.sound; }catch(_){ }
            soundChk.addEventListener('change', ()=>{ this.pomodoro.sound = !!soundChk.checked; try{ localStorage.setItem('pomo.sound', String(this.pomodoro.sound)); }catch(_){ } });
        }

        startBtn.addEventListener('click', ()=> this._startPomodoro());
        pauseBtn.addEventListener('click', ()=> this._pausePomodoro());
        resumeBtn.addEventListener('click', ()=> this._resumePomodoro());
        skipBtn.addEventListener('click', ()=> this._skipPomodoroPhase());
        resetBtn.addEventListener('click', ()=> this._resetPomodoro());

        // initial UI sync
        this._setPomodoroPhase('focus');
        this._updatePomodoroUI();
    }

    _refreshPomodoroTaskOptions(){
        const sel = document.getElementById('timeTaskSelect'); if(!sel) return;
        const prev = sel.value || '';
        sel.innerHTML = '<option value="">— Fără task —</option>' + (this.data.tasks||[]).map(t=> `<option value="${t.id}">${this._escapeHtml? this._escapeHtml(t.title): t.title}</option>`).join('');
        // try keep previous selection
        if(prev && Array.from(sel.options).some(o=> o.value===prev)) sel.value = prev;
        this.pomodoro.taskId = sel.value || '';
    }

    _setPomodoroPhase(phase){
        this.pomodoro.phase = phase;
        let ms = this.pomodoro.focusMs;
        if(phase === 'short') ms = this.pomodoro.shortMs;
        if(phase === 'long') ms = this.pomodoro.longMs;
        this.pomodoro.totalMs = ms;
        this.pomodoro.remainingMs = ms;
    }

    _startPomodoro(){
        if(this.pomodoro.running){ return; }
        this.pomodoro.running = true; this.pomodoro.paused = false;
        // set phase from mode select
        const modeSel = document.getElementById('pomoMode');
        if(modeSel) this._setPomodoroPhase(modeSel.value);
        this._tickPomodoro();
        this.pomodoro.interval = setInterval(()=> this._tickPomodoro(), 1000);
        this._updatePomodoroUI();
        this._pomoNotify('start', 'Pomodoro pornit');
    }

    _pausePomodoro(){
        if(!this.pomodoro.running || this.pomodoro.paused) return;
        this.pomodoro.paused = true;
        if(this.pomodoro.interval) clearInterval(this.pomodoro.interval);
        this._updatePomodoroUI();
        this._pomoNotify('pause', 'Pomodoro în pauză');
    }

    _resumePomodoro(){
        if(!this.pomodoro.running || !this.pomodoro.paused) return;
        this.pomodoro.paused = false;
        this.pomodoro.interval = setInterval(()=> this._tickPomodoro(), 1000);
        this._updatePomodoroUI();
        this._pomoNotify('resume', 'Continuă Pomodoro');
    }

    _skipPomodoroPhase(){
        // complete current phase immediately
        this.pomodoro.remainingMs = 0;
        this._handlePomodoroComplete();
    }

    _resetPomodoro(){
        if(this.pomodoro.interval) clearInterval(this.pomodoro.interval);
        this.pomodoro.running = false; this.pomodoro.paused = false;
        this.pomodoro.cyclesCompleted = 0; this._setPomodoroPhase('focus');
        this._updatePomodoroUI();
    }

    _tickPomodoro(){
        if(!this.pomodoro.running || this.pomodoro.paused) return;
        this.pomodoro.remainingMs = Math.max(0, this.pomodoro.remainingMs - 1000);
        this._updatePomodoroUI();
        if(this.pomodoro.remainingMs <= 0){ this._handlePomodoroComplete(); }
    }

    async _handlePomodoroComplete(){
        const wasPhase = this.pomodoro.phase;
        // log time if a focus phase just completed
        if(wasPhase === 'focus'){
            try{
                const hours = this.pomodoro.focusMs / 3600000; // decimal hours
                const date = new Date().toISOString().split('T')[0];
                const userId = (this.data.users[0]?.id) || 'user-1';
                const taskId = this.pomodoro.taskId || '';
                if(this._usingSupabase && this.store && typeof this.store.addTimeEntry === 'function'){
                    // Cloud path: persist to Supabase; adapter will mirror into local data
                    await this.store.addTimeEntry({ userId, taskId, hours, date, description: 'Pomodoro focus session' });
                } else {
                    // Local path
                    const entry = { id: 'time-'+Date.now(), userId, taskId, hours, date };
                    this.data.timeEntries.push(entry);
                    if(this.store && typeof this.store.save === 'function') this.store.save();
                }
                this.updateTodayTime(); this.renderRecentTimeEntries();
                this.showNotification('Sesiune Focus înregistrată (' + (hours*60) + 'm)', 'success');
            }catch(e){ /* ignore */ }
            this.pomodoro.cyclesCompleted += 1;
        }

        // choose next phase
        const cycleCount = this.pomodoro.cyclesCompleted;
        if(wasPhase === 'focus'){
            if(cycleCount % this.pomodoro.longEvery === 0){ this._setPomodoroPhase('long'); }
            else { this._setPomodoroPhase('short'); }
        } else {
            this._setPomodoroPhase('focus');
        }

        // alert user
        try {
            const msg = (this.pomodoro.phase === 'focus') ? 'Începe un nou Focus' : (this.pomodoro.phase === 'short' ? 'Pauză scurtă!' : 'Pauză lungă!');
            this.showNotification(msg, 'info');
            this._pomoNotify('phase', msg);
        } catch(_){ }

        // auto-continue or pause awaiting user
        if(this.pomodoro.autoContinue){
            if(this.pomodoro.interval) clearInterval(this.pomodoro.interval);
            this.pomodoro.paused = false; this.pomodoro.running = true;
            this.pomodoro.interval = setInterval(()=> this._tickPomodoro(), 1000);
        } else {
            if(this.pomodoro.interval) clearInterval(this.pomodoro.interval);
            this.pomodoro.paused = true; this.pomodoro.running = true;
        }
        this._updatePomodoroUI();
    }

    // Desktop notifications + subtle audio beeps for Pomodoro
    _pomoNotify(type, message){
        try{
            if(this.pomodoro.sound) this._beep(type);
            if('Notification' in window && Notification.permission === 'granted'){
                new Notification('ProjectHub • Pomodoro', { body: message||'' });
            }
        }catch(_){ }
    }
    _beep(type='generic'){
        try{
            const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
            const ctx = (this._audioCtx || (this._audioCtx = new AC()));
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = (type==='start')? 880 : (type==='pause'? 440 : (type==='resume'? 660 : (type==='phase'? 780 : 520)));
            g.gain.value = 0.06;
            o.connect(g); g.connect(ctx.destination);
            const now = ctx.currentTime; o.start(now); o.stop(now + 0.18);
        }catch(_){ }
    }

    _formatMMSS(ms){
        const totalSec = Math.ceil(ms/1000);
        const m = Math.floor(totalSec/60).toString().padStart(2,'0');
        const s = (totalSec%60).toString().padStart(2,'0');
        return `${m}:${s}`;
    }

    _updatePomodoroUI(){
        const phaseMap = { focus: 'Focus', short: 'Pauză scurtă', long: 'Pauză lungă' };
        const countdown = document.getElementById('pomoCountdown');
        const phaseEl = document.getElementById('pomoPhase');
        const progress = document.getElementById('pomoProgressInner');
        const cycles = document.getElementById('pomoCycleInfo');
        const startBtn = document.getElementById('pomoStart');
        const pauseBtn = document.getElementById('pomoPause');
        const resumeBtn = document.getElementById('pomoResume');
        const skipBtn = document.getElementById('pomoSkip');
        if(!countdown) return;
        countdown.textContent = this._formatMMSS(this.pomodoro.remainingMs);
        if(phaseEl) phaseEl.textContent = phaseMap[this.pomodoro.phase] || this.pomodoro.phase;
        if(progress){ const pct = Math.max(0, Math.min(100, (1 - (this.pomodoro.remainingMs/this.pomodoro.totalMs)) * 100)); progress.style.width = pct + '%'; }
        if(cycles) cycles.textContent = 'Cicluri: ' + this.pomodoro.cyclesCompleted;
        // buttons
        if(this.pomodoro.running){
            startBtn.disabled = true;
            pauseBtn.disabled = this.pomodoro.paused;
            resumeBtn.classList.toggle('hidden', !this.pomodoro.paused);
            pauseBtn.classList.toggle('hidden', this.pomodoro.paused);
            skipBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resumeBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            skipBtn.disabled = true;
        }
    }

    // Chart rendering methods
    initializeCharts() {
        this.charts = {};
        // Keep charts responsive on window resize
        if (!this._chartsResizeBound) {
            window.addEventListener('resize', () => {
                try {
                    if (this.charts && this.charts.projectProgress && typeof this.charts.projectProgress.resize === 'function') {
                        this.charts.projectProgress.resize();
                    }
                    ['projects','teamProductivity','tasksStatus','overdueByProject','workloadByAssignee','throughput'].forEach(k=>{
                        try{ if(this.charts && this.charts[k] && typeof this.charts[k].resize==='function') this.charts[k].resize(); }catch(_){ }
                    });
                } catch (e) { /* ignore */ }
            });
            this._chartsResizeBound = true;
        }
    }

    _bindReportsControls(){
        const pf = document.getElementById('reportsProjectFilter');
        const uf = document.getElementById('reportsUserFilter');
        const df = document.getElementById('reportsDateFrom');
        const dt = document.getElementById('reportsDateTo');
        const rst = document.getElementById('reportsResetFilters');
        const exp = document.getElementById('reportsExportCsv');
        if(pf && !pf._bound){ pf.addEventListener('change', ()=> this._rerenderReportsCharts()); pf._bound=true; }
        if(uf && !uf._bound){ uf.addEventListener('change', ()=> this._rerenderReportsCharts()); uf._bound=true; }
        if(df && !df._bound){ df.addEventListener('change', ()=> this._rerenderReportsCharts()); df._bound=true; }
        if(dt && !dt._bound){ dt.addEventListener('change', ()=> this._rerenderReportsCharts()); dt._bound=true; }
        if(rst && !rst._bound){ rst.addEventListener('click', ()=>{ if(pf) pf.value=''; if(uf) uf.value=''; if(df) df.value=''; if(dt) dt.value=''; this._rerenderReportsCharts(); }); rst._bound=true; }
        if(exp && !exp._bound){ exp.addEventListener('click', ()=> this.exportReportsCsv()); exp._bound=true; }
    }

    _populateReportsFilters(){
        const pf = document.getElementById('reportsProjectFilter');
        const uf = document.getElementById('reportsUserFilter');
        if(pf && !pf._init){
            pf.innerHTML = '<option value="">Toate proiectele</option>' + (this.data.projects||[]).map(p=> `<option value="${p.id}">${this._escapeHtml? this._escapeHtml(p.name):p.name}</option>`).join('');
            pf._init = true;
        }
        if(uf && !uf._init){
            uf.innerHTML = '<option value="">Toți membrii</option>' + (this.data.users||[]).map(u=> `<option value="${u.id}">${this._escapeHtml? this._escapeHtml(u.name):u.name}</option>`).join('');
            uf._init = true;
        }
    }

    _getReportsFilters(){
        const pf = document.getElementById('reportsProjectFilter');
        const uf = document.getElementById('reportsUserFilter');
        const df = document.getElementById('reportsDateFrom');
        const dt = document.getElementById('reportsDateTo');
        return {
            projectId: pf ? pf.value : '',
            userId: uf ? uf.value : '',
            from: df ? (df.value || '') : '',
            to: dt ? (dt.value || '') : ''
        };
    }

    _taskMatchesReportsFilters(task, f){
        if(!task) return false;
        if(f.projectId && task.projectId !== f.projectId) return false;
        if(f.userId && task.assignedTo !== f.userId) return false;
        // date window applies on dueDate if present, else startDate
        const d = task.dueDate || task.startDate || null;
        if(f.from && d && new Date(d) < new Date(f.from)) return false;
        if(f.to && d && new Date(d) > new Date(f.to)) return false;
        return true;
    }

    _rerenderReportsCharts(){
        try{ this.renderProjectsChart(); }catch(_){}
        try{ this.renderTeamProductivityChart(); }catch(_){}
        try{ this.renderTasksStatusChart(); }catch(_){}
        try{ this.renderOverdueByProjectChart(); }catch(_){}
        try{ this.renderWorkloadByAssigneeChart(); }catch(_){}
        try{ this.renderThroughputChart(); }catch(_){}
        try{ this.renderAgingWipTable(); }catch(_){}
    }

    // Diagnostic helper to inspect potential freeze causes
    diagnosticSnapshot(){
        try {
            const snap = {
                time: new Date().toISOString(),
                page: this.currentPage,
                bodyOverflow: document.body.style.overflow || '(auto/default)',
                modals: Array.from(document.querySelectorAll('.modal')).map(m=>({ id:m.id, hasShow:m.classList.contains('show'), hidden:m.classList.contains('hidden'), z:m.style.zIndex })),
                backdrops: Array.from(document.querySelectorAll('.modal-backdrop')).map(b=>({generated:b.dataset.generated, visible:b.classList.contains('visible'), z:b.style.zIndex})),
                charts: Object.keys(this.charts||{}),
                projectCount: (this.data.projects||[]).length,
                taskCount: (this.data.tasks||[]).length,
                userCount: (this.data.users||[]).length,
                activeElement: document.activeElement && document.activeElement.tagName,
                pendingTimers: Object.keys(window).filter(k=> /^_reportsRenderTimer|_globalSearchTimer$/.test(k))
            };
            console.log('DIAGNOSTIC SNAPSHOT', snap);
            return snap;
        } catch(e){ console.warn('diagnosticSnapshot failed', e); }
    }

    forceUIUnlock(){
        try {
            document.querySelectorAll('.modal-backdrop[data-generated="true"]').forEach(b=> b.remove());
            document.querySelectorAll('.modal.show').forEach(m=> { m.classList.remove('show'); m.classList.add('hidden'); });
            document.body.style.overflow = 'auto';
            console.log('UI unlock forced');
        } catch(e){ console.warn('forceUIUnlock failed', e); }
    }

    renderProjectProgressChart() {
        try {
            console.log('renderProjectProgressChart: start');
            let canvas = document.getElementById('projectProgressChart');
            // If canvas was previously removed (e.g. by earlier implementation when no projects), recreate it
            if (!canvas) {
                const chartContainer = document.querySelector('.chart-section .chart-container');
                if (chartContainer) {
                    canvas = document.createElement('canvas');
                    canvas.id = 'projectProgressChart';
                    chartContainer.appendChild(canvas);
                }
            }
            if (!canvas) { console.log('renderProjectProgressChart: canvas not found'); return; }
            // destroy existing chart if present
            if (this.charts.projectProgress) {
                try { this.charts.projectProgress.destroy(); } catch (e) { /* ignore */ }
            }

            // ensure progress is recalculated from tasks before charting
            try { this.recalculateAllProjectProgresses(); } catch (e) { /* ignore */ }
            const projects = this.data && Array.isArray(this.data.projects) ? this.data.projects : [];
            const container = canvas.parentElement;

            // Empty state handling without removing the canvas (so later renders can proceed)
            const EMPTY_ID = 'projectProgressEmptyState';
            let emptyEl = container ? container.querySelector('#'+EMPTY_ID) : null;
            if(!projects.length){
                if(!emptyEl && container){
                    emptyEl = document.createElement('div');
                    emptyEl.id = EMPTY_ID;
                    emptyEl.style.position = 'absolute';
                    emptyEl.style.top = '0';
                    emptyEl.style.left = '0';
                    emptyEl.style.right = '0';
                    emptyEl.style.bottom = '0';
                    emptyEl.style.display = 'flex';
                    emptyEl.style.alignItems = 'center';
                    emptyEl.style.justifyContent = 'center';
                    emptyEl.style.padding = '16px';
                    emptyEl.style.textAlign = 'center';
                    emptyEl.style.color = 'var(--color-text-secondary)';
                    emptyEl.style.fontSize = '0.95rem';
                    emptyEl.textContent = (this.t && this.t('projects.none')) || 'Nu există proiecte de afișat.';
                    // Ensure container has position for absolute overlay
                    if(getComputedStyle(container).position === 'static') container.style.position = 'relative';
                    container.appendChild(emptyEl);
                } else if(emptyEl){
                    emptyEl.textContent = (this.t && this.t('projects.none')) || 'Nu există proiecte de afișat.';
                }
                if(canvas) canvas.style.display = 'none';
                console.log('renderProjectProgressChart: no projects');
                return;
            } else {
                // We have projects now – remove empty overlay if present
                if(emptyEl) emptyEl.remove();
                if(canvas) canvas.style.display = 'block';
            }

            // Minimal diagnostics kept (Chart availability and basic canvas size)
            try {
                // only log availability and sizes at debug level
                if (typeof Chart === 'undefined' || !window.Chart) console.warn('renderProjectProgressChart: Chart.js not available');
            } catch (diagErr) { /* ignore */ }

            // If the canvas has zero client size it's likely the app or container is still hidden
            const attemptKey = '_chartRenderAttempts';
            this[attemptKey] = this[attemptKey] || 0;
            // If the overall app or dashboard page is currently hidden (e.g., during initial load or tab changes), defer longer
            try{
                const appRoot = document.getElementById('app');
                const dashboardPage = document.getElementById('dashboardPage');
                const pageHidden = dashboardPage ? (!dashboardPage.classList.contains('active') || getComputedStyle(dashboardPage).display === 'none') : false;
                const appHidden = appRoot ? appRoot.classList.contains('hidden') : false;
                if((appHidden || pageHidden) && this[attemptKey] < 10){
                    this[attemptKey]++;
                    console.log(`renderProjectProgressChart: app/page hidden, deferring render (attempt ${this[attemptKey]})`);
                    setTimeout(() => this.renderProjectProgressChart(), 300);
                    return;
                }
            }catch(e){ /* ignore */ }
            if ((canvas.clientWidth === 0 || canvas.clientHeight === 0) && this[attemptKey] < 5) {
                this[attemptKey]++;
                console.log(`renderProjectProgressChart: canvas has zero size, deferring render (attempt ${this[attemptKey]})`);
                setTimeout(() => this.renderProjectProgressChart(), 250);
                return;
            }
            // If after retries the canvas still has zero size, force a sensible height on the container and canvas
            if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
                console.warn('renderProjectProgressChart: canvas still has zero client size after retries — applying fallback sizes');
                try {
                    if (container) container.style.minHeight = container.style.minHeight || '300px';
                    canvas.style.width = canvas.style.width || '100%';
                    canvas.style.height = canvas.style.height || '300px';
                    // update backing store
                    const cw = container ? (container.clientWidth || 300) : 300;
                    const ch = container ? (container.clientHeight || 300) : 300;
                    canvas.width = cw; canvas.height = ch;
                } catch (fallbackErr) { console.warn('renderProjectProgressChart: fallback sizing failed', fallbackErr); }
            }

            // Ensure canvas is sized to its container before Chart.js instantiation
            try {
                canvas.style.width = canvas.style.width || '100%';
                canvas.style.height = canvas.style.height || '100%';
                // set pixel backing store size to match client size (helps on some browsers)
                const cw = canvas.clientWidth || 300;
                const ch = canvas.clientHeight || 150;
                if(!canvas.width || canvas.width !== cw) canvas.width = cw;
                if(!canvas.height || canvas.height !== ch) canvas.height = ch;
            } catch (sizeErr) { console.warn('renderProjectProgressChart: size set failed', sizeErr); }

            const ctx = canvas.getContext('2d');

            const baseColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
            const colors = projects.map((_, i) => baseColors[i % baseColors.length]);

            this.charts.projectProgress = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: projects.map(p => p.name || 'Unnamed'),
                    datasets: [{
                        data: projects.map(p => p.progress || 0),
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });

            // Force an update and resize to ensure layout
            try {
                if(this.charts.projectProgress && typeof this.charts.projectProgress.update === 'function'){
                    this.charts.projectProgress.update();
                }
                if(this.charts.projectProgress && typeof this.charts.projectProgress.resize === 'function'){
                    this.charts.projectProgress.resize();
                }
                // reset attempt counter after success
                this[attemptKey] = 0;
            } catch (postErr){ console.warn('renderProjectProgressChart: post-create action failed', postErr); }
        } catch (err) {
            console.error('renderProjectProgressChart error', err);
        }
    }

    renderProjectsChart() {
        const ctx = document.getElementById('projectsChart');
        if (!ctx) return;
        try { if(this.charts && this.charts.projects && typeof this.charts.projects.destroy==='function') this.charts.projects.destroy(); } catch(e){}
        const f = this._getReportsFilters();
        let projects = this.data && Array.isArray(this.data.projects) ? this.data.projects : [];
        if(f.projectId) projects = projects.filter(p=> p.id === f.projectId);

        // Avoid creating a chart if no projects – show placeholder text once
        if(!projects.length){
            if(!ctx._emptyInjected){
                const parent = ctx.parentElement;
                if(parent){
                    const msg = document.createElement('div');
                    msg.style.position='absolute'; msg.style.inset='0'; msg.style.display='flex'; msg.style.alignItems='center'; msg.style.justifyContent='center'; msg.style.color='var(--color-text-secondary)'; msg.style.fontSize='0.9rem';
                    msg.textContent = (this.t && this.t('projects.none')) || 'Nu există proiecte.';
                    parent.style.position='relative'; parent.appendChild(msg);
                }
                ctx._emptyInjected = true;
            }
            return;
        } else {
            // Remove any previous placeholder overlays
            const parent = ctx.parentElement; if(parent){ Array.from(parent.querySelectorAll(':scope > div')).forEach(d=>{ if(d !== ctx && d.childNodes.length===1 && d.textContent && d.textContent.indexOf('proiect')!==-1) d.remove(); }); }
        }

        this.charts.projects = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: projects.map(p => p.name),
                datasets: [{
                    label: 'Progres (%)',
                    data: projects.map(p => p.progress || 0),
                    backgroundColor: '#1FB8CD',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    renderTeamProductivityChart() {
        const ctx = document.getElementById('teamProductivityChart');
        if (!ctx) return;
        try { if(this.charts && this.charts.teamProductivity && typeof this.charts.teamProductivity.destroy==='function') this.charts.teamProductivity.destroy(); } catch(e){}
        const f = this._getReportsFilters();
        const users = this.data.users.filter(u=> !f.userId || u.id === f.userId);
        const tasks = this.data.tasks.filter(t=> this._taskMatchesReportsFilters(t, f));
        const userData = users.map(user => {
            const userTasks = tasks.filter(task => task.assignedTo === user.id);
            const completedTasks = userTasks.filter(task => task.status === 'Done').length;
            return {
                name: user.name.split(' ')[0],
                completed: completedTasks,
                total: userTasks.length
            };
        });

        if(!userData.length){
            if(!ctx._emptyInjected){
                const parent = ctx.parentElement; if(parent){ const msg=document.createElement('div'); msg.style.position='absolute'; msg.style.inset='0'; msg.style.display='flex'; msg.style.alignItems='center'; msg.style.justifyContent='center'; msg.style.color='var(--color-text-secondary)'; msg.style.fontSize='0.9rem'; msg.textContent='Fără membri.'; parent.style.position='relative'; parent.appendChild(msg); }
                ctx._emptyInjected = true;
            }
            return;
        }

        this.charts.teamProductivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: userData.map(u => u.name),
                datasets: [
                    {
                        label: 'Task-uri Finalizate',
                        data: userData.map(u => u.completed),
                        backgroundColor: '#1FB8CD'
                    },
                    {
                        label: 'Task-uri Totale',
                        data: userData.map(u => u.total),
                        backgroundColor: '#FFC185'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderTasksStatusChart(){
        const ctx = document.getElementById('tasksStatusChart'); if(!ctx) return;
        try { if(this.charts && this.charts.tasksStatus && typeof this.charts.tasksStatus.destroy==='function') this.charts.tasksStatus.destroy(); } catch(_){ }
        const f = this._getReportsFilters();
        const tasks = (this.data.tasks||[]).filter(t=> this._taskMatchesReportsFilters(t, f));
        const statuses = ['Not Started','In Progress','Review','Done'];
        const counts = statuses.map(s=> tasks.filter(t=> t.status===s).length);
        if(!tasks.length){
            if(!ctx._emptyInjected){ const parent=ctx.parentElement; if(parent){ const m=document.createElement('div'); m.style.position='absolute'; m.style.inset='0'; m.style.display='flex'; m.style.alignItems='center'; m.style.justifyContent='center'; m.style.color='var(--color-text-secondary)'; m.textContent='Nu există task-uri în selecție.'; parent.style.position='relative'; parent.appendChild(m); } ctx._emptyInjected=true; } return;
        } else { const parent=ctx.parentElement; if(parent){ Array.from(parent.querySelectorAll(':scope > div')).forEach(el=>{ if(el!==ctx && (el.textContent||'').includes('task-uri')) el.remove(); }); } }
        this.charts.tasksStatus = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: statuses.map(s=> this.translateStatus(s)), datasets:[{ data: counts, backgroundColor:['#94A3B8','#1FB8CD','#FFC185','#34D399'], borderWidth:0 }] },
            options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } } }
        });
    }

    renderOverdueByProjectChart(){
        const ctx = document.getElementById('overdueByProjectChart'); if(!ctx) return;
        try { if(this.charts && this.charts.overdueByProject && typeof this.charts.overdueByProject.destroy==='function') this.charts.overdueByProject.destroy(); } catch(_){ }
        const f = this._getReportsFilters();
        const now = new Date(); now.setHours(0,0,0,0);
        const tasks = (this.data.tasks||[]).filter(t=> this._taskMatchesReportsFilters(t, f));
        const grouped = {};
        tasks.forEach(t=>{
            const overdue = t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done';
            if(overdue){ grouped[t.projectId] = (grouped[t.projectId]||0)+1; }
        });
        const projects = (this.data.projects||[]);
        const labels = Object.keys(grouped).map(pid=> (projects.find(p=> p.id===pid)?.name) || 'N/A');
        const counts = Object.values(grouped);
        if(!labels.length){ if(!ctx._emptyInjected){ const parent=ctx.parentElement; if(parent){ const m=document.createElement('div'); m.style.position='absolute'; m.style.inset='0'; m.style.display='flex'; m.style.alignItems='center'; m.style.justifyContent='center'; m.style.color='var(--color-text-secondary)'; m.textContent='Nicio întârziere în selecție.'; parent.style.position='relative'; parent.appendChild(m); } ctx._emptyInjected=true; } return; }
        this.charts.overdueByProject = new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Întârziate', data: counts, backgroundColor:'#EF4444' }]}, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, precision:0 } } } });
    }

    renderWorkloadByAssigneeChart(){
        const ctx = document.getElementById('workloadByAssigneeChart'); if(!ctx) return;
        try { if(this.charts && this.charts.workloadByAssignee && typeof this.charts.workloadByAssignee.destroy==='function') this.charts.workloadByAssignee.destroy(); } catch(_){ }
        const f = this._getReportsFilters();
        const tasks = (this.data.tasks||[]).filter(t=> this._taskMatchesReportsFilters(t, f));
        const users = (this.data.users||[]).filter(u=> !f.userId || u.id===f.userId);
        const statuses = ['Not Started','In Progress','Review','Done'];
        const labels = users.map(u=> u.name.split(' ')[0]);
        const datasets = statuses.map((s,idx)=> ({
            label: this.translateStatus(s),
            data: users.map(u=> tasks.filter(t=> t.assignedTo===u.id && t.status===s).length),
            backgroundColor: ['#CBD5E1','#1FB8CD','#FFC185','#34D399'][idx]
        }));
        if(!users.length){ if(!ctx._emptyInjected){ const parent=ctx.parentElement; if(parent){ const m=document.createElement('div'); m.style.position='absolute'; m.style.inset='0'; m.style.display='flex'; m.style.alignItems='center'; m.style.justifyContent='center'; m.style.color='var(--color-text-secondary)'; m.textContent='Fără membri în selecție.'; parent.style.position='relative'; parent.appendChild(m); } ctx._emptyInjected=true; } return; }
        this.charts.workloadByAssignee = new Chart(ctx, { type:'bar', data:{ labels, datasets }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } }, scales:{ y:{ beginAtZero:true, precision:0 }, x:{ stacked:true }, yAxes:{ stacked:true } } } });
    }

    renderThroughputChart(){
        const ctx = document.getElementById('throughputChart'); if(!ctx) return;
        try { if(this.charts && this.charts.throughput && typeof this.charts.throughput.destroy==='function') this.charts.throughput.destroy(); } catch(_){ }
        const f = this._getReportsFilters();
        const tasks = (this.data.tasks||[]).filter(t=> this._taskMatchesReportsFilters(t, f));
        // Derive completion week using a heuristic: if status Done and dueDate exists -> use dueDate, else skip
        const done = tasks.filter(t=> t.status==='Done' && (t.dueDate || t.startDate));
        const weekKey = (d)=>{ const dt=new Date(d); const y=dt.getFullYear(); const onejan=new Date(y,0,1); const week=Math.ceil((((dt - onejan) / 86400000) + onejan.getDay()+1)/7); return `${y}-W${String(week).padStart(2,'0')}`; };
        const counts = {};
        done.forEach(t=>{ const d=t.dueDate||t.startDate; if(!d) return; const key=weekKey(d); counts[key]=(counts[key]||0)+1; });
        const labels = Object.keys(counts).sort();
        const data = labels.map(k=> counts[k]);
        if(!labels.length){ if(!ctx._emptyInjected){ const parent=ctx.parentElement; if(parent){ const m=document.createElement('div'); m.style.position='absolute'; m.style.inset='0'; m.style.display='flex'; m.style.alignItems='center'; m.style.justifyContent='center'; m.style.color='var(--color-text-secondary)'; m.textContent='Nicio finalizare în selecție.'; parent.style.position='relative'; parent.appendChild(m); } ctx._emptyInjected=true; } return; }
        this.charts.throughput = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Finalizate / săptămână', data, borderColor:'#1FB8CD', backgroundColor:'rgba(31,184,205,0.25)', tension:0.25, fill:true }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, precision:0 } } } });
    }

    renderAgingWipTable(){
        const cont = document.getElementById('agingWipTable'); if(!cont) return;
        const f = this._getReportsFilters();
        const tasks = (this.data.tasks||[]).filter(t=> this._taskMatchesReportsFilters(t, f));
        const inWip = tasks.filter(t=> t.status && t.status !== 'Done');
        const today = new Date(); today.setHours(0,0,0,0);
        const esc = (s)=> this._escapeHtml? this._escapeHtml(s): String(s||'');
        const rows = inWip.map(t=>{
            const start = t.startDate ? new Date(t.startDate) : null;
            const ageDays = start ? Math.max(0, Math.round((today - start)/86400000)) : '-';
            const proj = (this.data.projects||[]).find(p=> p.id===t.projectId);
            const ass = (this.data.users||[]).find(u=> u.id===t.assignedTo);
            return { title: t.title, project: proj? proj.name:'-', assignee: ass? ass.name:'-', status: this.translateStatus(t.status), start: t.startDate||'-', due: t.dueDate||'-', age: ageDays };
        }).sort((a,b)=> (b.age||0) - (a.age||0));
        if(!rows.length){ cont.innerHTML = '<div class="text-muted" style="padding:12px;">Nu există task-uri în lucru pentru selecție.</div>'; return; }
        cont.innerHTML = '<table class="table"><thead><tr><th>Task</th><th>Proiect</th><th>Asignat</th><th>Status</th><th>Start</th><th>Due</th><th>Vechime (zile)</th></tr></thead><tbody>' +
            rows.map(r=> `<tr><td>${esc(r.title)}</td><td>${esc(r.project)}</td><td>${esc(r.assignee)}</td><td>${esc(r.status)}</td><td>${esc(this.formatDate(r.start))}</td><td>${esc(this.formatDate(r.due))}</td><td>${r.age}</td></tr>`).join('') + '</tbody></table>';
    }

    exportReportsCsv(){
        const f = this._getReportsFilters();
        const tasks = (this.data.tasks||[]).filter(t=> this._taskMatchesReportsFilters(t, f));
        const projects = this.data.projects||[];
        const users = this.data.users||[];
        const esc = (s)=> '"' + String(s||'').replace(/"/g,'""') + '"';
        const header = ['Task ID','Titlu','Proiect','Asignat','Status','Prioritate','Start','Due','Ore Est.'];
        const rows = tasks.map(t=>{
            const p = projects.find(x=> x.id===t.projectId);
            const u = users.find(x=> x.id===t.assignedTo);
            return [t.id, t.title, p? p.name:'', u? u.name:'', this.translateStatus(t.status), this.translatePriority(t.priority), t.startDate||'', t.dueDate||'', t.estimatedHours||''];
        });
        const csv = [header, ...rows].map(r=> r.map(esc).join(',')).join('\r\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' })); a.download = `raport_tasks_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    }

    // Modal methods
    openProjectModal(project = null) {
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        
        if (project) {
            title.textContent = 'Editează Proiect';
            this.populateProjectForm(project);
        } else {
            title.textContent = 'Proiect Nou';
            document.getElementById('projectForm').reset();
        }
        
        this.showModal(modal);
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        
        // Populate project select
        const projectSelect = document.getElementById('taskProject');
        projectSelect.innerHTML = this.data.projects.map(project => 
            `<option value="${project.id}">${project.name}</option>`
        ).join('');

        // Populate user select
        const userSelect = document.getElementById('taskAssignedTo');
        userSelect.innerHTML = `<option value="">${this.t('unassigned')}</option>` +
            this.data.users.map(user => 
                `<option value="${user.id}">${user.name}</option>`
            ).join('');
        
        if (task) {
            title.textContent = 'Editează Task';
            this.populateTaskForm(task);
            // populate subtasks UI
            this._populateSubtasksUI(task);
        } else {
            title.textContent = 'Task Nou';
            document.getElementById('taskForm').reset();
            // clear subtasks UI
            this._populateSubtasksUI(null);
        }
        
        this.showModal(modal);
    }

    _populateSubtasksUI(task){
        const list = document.getElementById('subtasksList');
        const input = document.getElementById('newSubtaskInput');
        const addBtn = document.getElementById('addSubtaskBtn');
        list.innerHTML = '';
        if(!task || !task.subtasks || !task.subtasks.length){
            // nothing to show
        } else {
            task.subtasks.forEach(st => {
                const row = document.createElement('div'); row.className='subtask-line'; row.style.display='flex'; row.style.alignItems='center'; row.style.gap='8px';
                row.dataset.subtaskId = st.id;
                const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = !!st.completed;
                chk.addEventListener('change', ()=>{
                    st.completed = chk.checked;
                    if(this._usingSupabase && this.store && this.store.updateSubtask){
                        this.store.updateSubtask(st.id, { completed: st.completed });
                    } else if(this.store && typeof this.store.save==='function') {
                        this.store.save();
                    }
                });
                const txt = document.createElement('div'); txt.textContent = st.title; txt.style.flex='1';
                const durSpan = document.createElement('div');
                let dtxt = '';
                if(st.startDate || st.dueDate){
                    const s = st.startDate ? this.formatDate(st.startDate) : '';
                    const e = st.dueDate ? this.formatDate(st.dueDate) : '';
                    dtxt = s && e ? `${s} → ${e}` : (s || e);
                } else if(st.duration){ dtxt = st.duration + 'd'; }
                durSpan.textContent = dtxt;
                durSpan.style.marginLeft='8px'; durSpan.style.color='var(--color-text-secondary)';
                const del = document.createElement('button'); del.className='btn btn--sm btn--outline'; del.textContent = this.t('btn.delete');
                del.addEventListener('click', ()=>{
                    const idx = task.subtasks.findIndex(s=> s.id===st.id); if(idx>=0) task.subtasks.splice(idx,1); row.remove();
                    if(this._usingSupabase && this.store && this.store.deleteSubtask){
                        this.store.deleteSubtask(st.id);
                    } else if(this.store && typeof this.store.save==='function') {
                        this.store.save();
                    }
                });
                const editBtn = document.createElement('button'); editBtn.className='btn btn--sm btn--secondary'; editBtn.textContent = this.t('btn.edit');
                editBtn.style.marginLeft='6px';
                editBtn.addEventListener('click', ()=>{
                    // open inline edit within modal
                    const editRow = document.createElement('div'); editRow.style.display='flex'; editRow.style.gap='8px'; editRow.style.marginTop='6px';
                    const titleIn = document.createElement('input'); titleIn.className='form-control'; titleIn.value = st.title; titleIn.style.flex='1';
                    const startIn = document.createElement('input'); startIn.type='date'; startIn.className='form-control'; startIn.value = st.startDate || '';
                    const endIn = document.createElement('input'); endIn.type='date'; endIn.className='form-control'; endIn.value = st.dueDate || '';
                    const saveBtn = document.createElement('button'); saveBtn.className='btn btn--sm btn--primary'; saveBtn.textContent = this.t('btn.save');
                    const cancelBtn = document.createElement('button'); cancelBtn.className='btn btn--sm btn--secondary'; cancelBtn.textContent = this.t('btn.cancel');
                    editRow.appendChild(titleIn); editRow.appendChild(startIn); editRow.appendChild(endIn); editRow.appendChild(saveBtn); editRow.appendChild(cancelBtn);
                    row.style.display='none'; row.parentNode.insertBefore(editRow, row.nextSibling);
                    saveBtn.addEventListener('click', ()=>{
                        const newTitle = titleIn.value.trim();
                        const sVal = startIn.value;
                        const eVal = endIn.value;
                        if(!newTitle) return alert('Titlul subtask-ului nu poate fi gol');
                        if(sVal && eVal && new Date(eVal) < new Date(sVal)) return alert('Data finală trebuie să fie >= data de start');
                        st.title = newTitle; if(sVal) st.startDate = sVal; else delete st.startDate; if(eVal) st.dueDate = eVal; else delete st.dueDate;
                        if(this._usingSupabase && this.store && this.store.updateSubtask){
                            this.store.updateSubtask(st.id, { title: st.title, startDate: st.startDate, dueDate: st.dueDate });
                        } else if(this.store && typeof this.store.save==='function') {
                            this.store.save();
                        }
                        editRow.remove(); row.style.display='flex'; this.renderTasks();
                    });
                    cancelBtn.addEventListener('click', ()=>{ editRow.remove(); row.style.display='flex'; });
                });
                const label = document.createElement('label'); label.className = 'subtask-label';
                label.appendChild(chk);
                const spanTitle = document.createElement('span'); spanTitle.className = 'subtask-title'; spanTitle.textContent = st.title;
                label.appendChild(spanTitle);
                row.appendChild(label);
                row.appendChild(durSpan);
                row.appendChild(editBtn);
                row.appendChild(del);
                list.appendChild(row);
            });
        }
        // add handler to add button
        addBtn.onclick = async ()=>{
            const val = input.value && input.value.trim(); if(!val) return;
            let id = 'sub-' + Date.now();
            const newSub = { id, title: val, completed: false };
            const form = document.getElementById('taskForm');
            const editingId = form.dataset.editingId;
            if(editingId){
                const t = this.data.tasks.find(tsk=> tsk.id === editingId);
                if(t){ t.subtasks = t.subtasks || []; t.subtasks.push(newSub); }
                if(this._usingSupabase && this.store && this.store.addSubtask){
                    try { const newId = await this.store.addSubtask(editingId, newSub); if(newId) newSub.id = newId; } catch(e){ console.warn('addSubtask failed', e); }
                } else if(this.store && typeof this.store.save==='function') {
                    this.store.save();
                }
            } else {
                form._newSubtasks = form._newSubtasks || [];
                form._newSubtasks.push(newSub);
            }
            const row = document.createElement('div'); row.className='subtask-line'; row.style.display='flex'; row.style.alignItems='center'; row.style.gap='8px';
            const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = false; chk.addEventListener('change', ()=> newSub.completed = chk.checked);
            const txt = document.createElement('div'); txt.textContent = newSub.title; txt.style.flex='1';
            const durSpan = document.createElement('div'); durSpan.textContent = newSub.duration ? (newSub.duration + 'd') : ''; durSpan.style.marginLeft='8px'; durSpan.style.color='var(--color-text-secondary)';
            const del = document.createElement('button'); del.className='btn btn--sm btn--outline'; del.textContent = this.t('btn.delete');
            del.addEventListener('click', ()=>{
                if(editingId){ const t = this.data.tasks.find(tsk=> tsk.id === editingId); if(t){ const idx=t.subtasks.findIndex(s=> s.id===newSub.id); if(idx>=0) t.subtasks.splice(idx,1); if(this._usingSupabase && this.store && this.store.deleteSubtask){ this.store.deleteSubtask(newSub.id); } else if(this.store && typeof this.store.save==='function') { this.store.save(); } } }
                else { const arr = form._newSubtasks || []; const idx=arr.findIndex(s=> s.id===newSub.id); if(idx>=0) arr.splice(idx,1); }
                row.remove();
            });
            const label = document.createElement('label'); label.className = 'subtask-label';
            label.appendChild(chk);
            const spanTitle = document.createElement('span'); spanTitle.className = 'subtask-title'; spanTitle.textContent = newSub.title;
            label.appendChild(spanTitle);
            row.appendChild(label);
            row.appendChild(durSpan);
            row.appendChild(del);
            list.appendChild(row);
            input.value=''; input.focus();
        };
    }

    showModal(modal) {
        if(!modal) return;
        // ensure a backdrop exists so clicks outside the modal close it (unless disabled per-modal)
        let backdrop = document.querySelector('.modal-backdrop[data-generated="true"]');
        if(!backdrop){
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.dataset.generated = 'true';
            backdrop.style.position = 'fixed';
            backdrop.style.top = '0'; backdrop.style.left = '0'; backdrop.style.right = '0'; backdrop.style.bottom = '0';
            backdrop.style.zIndex = '999';
            document.body.appendChild(backdrop);
        }
        // read per-modal attribute to determine if clicking the backdrop should dismiss
        const backdropDismissAttr = modal.dataset.backdropDismissable;
        const backdropDismiss = backdropDismissAttr === undefined ? true : (backdropDismissAttr !== 'false');
        // toggle visible class for fade-in
        backdrop.classList.add('visible');
        // attach click handler if allowed
        if(backdropDismiss){
            // ensure only one handler is attached
            backdrop._generatedClickHandler = backdrop._generatedClickHandler || (()=> this.closeModals());
            backdrop.addEventListener('click', backdrop._generatedClickHandler);
        }

        // show modal with show class for animation
        modal.style.zIndex = 1000;
        modal.classList.remove('hidden');
        // mark as shown to apply .show styles
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // register Escape key handler once
        if(!this._modalEscapeHandler){
            this._modalEscapeHandler = (ev)=>{
                if(ev.key === 'Escape' || ev.key === 'Esc'){
                    // if a detail panel is open in gantt, close that first
                    if(window.projectHub && window.projectHub.ganttManager && window.projectHub.ganttManager.detailPanel){
                        window.projectHub.ganttManager.detailPanel.remove(); window.projectHub.ganttManager.detailPanel = null; return;
                    }
                    this.closeModals();
                }
            };
            document.addEventListener('keydown', this._modalEscapeHandler);
        }
    }

    closeModals() {
        // gracefully animate out modals and backdrop
        document.querySelectorAll('.modal').forEach(modal => {
            // replace show with closing which triggers CSS transition then hide
            modal.classList.remove('show');
            modal.classList.add('closing');
            setTimeout(()=>{ modal.classList.add('hidden'); modal.classList.remove('closing'); }, 180);
        });
        // fade out generated backdrop(s) then remove
        document.querySelectorAll('.modal-backdrop[data-generated="true"]').forEach(b => {
            b.classList.remove('visible');
            if(b._generatedClickHandler) b.removeEventListener('click', b._generatedClickHandler);
            setTimeout(()=> b.remove(), 220);
        });
        document.body.style.overflow = 'auto';
        // remove Escape handler
        if(this._modalEscapeHandler){ document.removeEventListener('keydown', this._modalEscapeHandler); this._modalEscapeHandler = null; }
    }

    populateProjectForm(project){
        const form = document.getElementById('projectForm');
        form.dataset.editingId = project.id;
        document.getElementById('projectName').value = project.name || '';
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('projectStartDate').value = project.startDate || '';
        document.getElementById('projectDueDate').value = project.dueDate || '';
        document.getElementById('projectPriority').value = project.priority || 'Medium';
        document.getElementById('projectStatus').value = project.status || 'Not Started';
    }

    populateTaskForm(task){
        const form = document.getElementById('taskForm');
        form.dataset.editingId = task.id;
        document.getElementById('taskTitle').value = task.title || '';
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskProject').value = task.projectId || '';
        document.getElementById('taskAssignedTo').value = task.assignedTo || '';
        document.getElementById('taskPriority').value = task.priority || 'Medium';
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskEstimatedHours').value = task.estimatedHours || 0;
        const stSel = document.getElementById('taskStatus'); if(stSel) stSel.value = task.status || 'Not Started';
    }

    openGanttModal(task){
        document.getElementById('ganttTaskId').value = task.id;
        document.getElementById('ganttStartDate').value = task.startDate || '';
        document.getElementById('ganttEndDate').value = task.dueDate || '';
        document.getElementById('ganttColor').value = (this.data.projects.find(p=>p.id===task.projectId)?.color) || '#1FB8CD';
        document.getElementById('ganttVisible').value = task._ganttVisible === 0 ? '0' : '1';
        // populate dependencies multi-select (exclude self)
        const depSel = document.getElementById('ganttDependencies');
        if(depSel){
            const tasks = this.data.tasks.filter(t => t.id !== task.id).map(t => ({ id: t.id, title: t.title }));
            depSel.innerHTML = tasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
            // mark currently selected dependencies
            if(Array.isArray(task.dependencies)){
                for(const opt of Array.from(depSel.options)){
                    if(task.dependencies.includes(opt.value)) opt.selected = true;
                }
            }
        }
        document.getElementById('ganttConfigTitle').textContent = `Configurează în Gantt — ${task.title}`;
        this.showModal(document.getElementById('ganttConfigModal'));
    }

    async saveGanttConfig(){
        const id = document.getElementById('ganttTaskId').value;
        const task = this.data.tasks.find(t=> t.id === id);
        if(!task) return;
        const s = document.getElementById('ganttStartDate').value;
        const e = document.getElementById('ganttEndDate').value;
        if(s && e && new Date(e) < new Date(s)) { alert('End date trebuie să fie >= start date'); return; }
        const patch = {
            startDate: s || task.startDate,
            dueDate: e || task.dueDate,
            color: document.getElementById('ganttColor').value,
            _ganttVisible: document.getElementById('ganttVisible').value === '1' ? 1 : 0
        };
        // dependencies
        const depSel = document.getElementById('ganttDependencies');
        let selectedDeps = [];
        if(depSel){
            selectedDeps = Array.from(depSel.selectedOptions).map(o => o.value);
            if(this.ganttManager && typeof this.ganttManager._createsCycle === 'function'){
                const bad = selectedDeps.find(depId => this.ganttManager._createsCycle(depId, task.id));
                if(bad){ this.showNotification(this.t('selection.cycleInvalid'), 'error'); return; }
            }
        }
        // apply locally
        Object.assign(task, patch);
        task.dependencies = selectedDeps;
        // persist
        if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
            try { await this.store.updateTask(task.id, patch); } catch(e){ console.warn('updateTask (Gantt config) failed', e); }
            if(typeof this.store.setTaskDependencies === 'function'){
                try { await this.store.setTaskDependencies(task.id, selectedDeps); } catch(e){ console.warn('setTaskDependencies failed', e); }
            }
        } else if(this.store && typeof this.store.save==='function') {
            this.store.save();
        }
        this.closeModals();
        if(this.currentPage === 'gantt'){
            if(this.ganttManager) this.ganttManager.render();
            else this.renderGanttPage();
        }
    }

    // Bulk-add all tasks from selected project into Gantt (set _ganttVisible=1)
    ganttBulkAddCurrentProject(){
        const projectId = document.getElementById('ganttProjectFilter')?.value;
    if(!projectId){ alert(this.t('gantt.selectProjectFirst') || 'Please select a project first'); return; }
    const tasks = this.data.tasks.filter(t=> t.projectId === projectId);
    if(!tasks.length){ alert(this.t('gantt.noTasksForProject') || 'No tasks for selected project'); return; }
    if(!confirm((this.t('gantt.bulkAddConfirm') || 'Add {n} tasks to Gantt?').replace('{n}', tasks.length))) return;
        tasks.forEach(t=> { 
            t._ganttVisible = 1; 
            if(!t.startDate) t.startDate = this.data.projects.find(p=>p.id===projectId)?.startDate || new Date().toISOString().split('T')[0]; 
            if(!t.dueDate) t.dueDate = this.data.projects.find(p=>p.id===projectId)?.dueDate || t.startDate; 
            if(this._usingSupabase && this.store && this.store.updateTask){
                // fire and forget; no await inside loop to keep UI responsive
                try { this.store.updateTask(t.id, { startDate: t.startDate, dueDate: t.dueDate, _ganttVisible: t._ganttVisible }); } catch(e){ /* ignore individual */ }
            }
        });
        if(!this._usingSupabase && this.store && typeof this.store.save === 'function') this.store.save();
    this.showNotification(this.t('gantt.bulkAdded') || 'Tasks added to Gantt', 'success');
        if(this.ganttManager) this.ganttManager.render();
    }

    saveProject() {
        const form = document.getElementById('projectForm');
        const editingId = form.dataset.editingId;
        const payload = {
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
            startDate: document.getElementById('projectStartDate').value,
            dueDate: document.getElementById('projectDueDate').value,
            priority: document.getElementById('projectPriority').value,
            status: document.getElementById('projectStatus').value
        };
        const isEdit = !!editingId;
        const doSave = async () => {
            try {
                if(isEdit){
                    if(this._usingSupabase && this.store && typeof this.store.updateProject === 'function'){
                        await this.store.updateProject(editingId, {
                            name: payload.name,
                            description: payload.description,
                            start_date: payload.startDate,
                            due_date: payload.dueDate,
                            priority: payload.priority,
                            status: payload.status
                        });
                    } else {
                        const proj = this.data.projects.find(p=> p.id === editingId);
                        if(proj){ Object.assign(proj, payload); }
                        if(this.store && typeof this.store.save === 'function') this.store.save();
                        this.addAudit(this.t('project.updated') || 'Project updated', payload.name);
                    }
                } else {
                    if(this._usingSupabase && this.store && typeof this.store.addProject === 'function'){
                        await this.store.addProject({ ...payload, progress:0, color:'#3B82F6', teamMembers:[], tags:[] });
                    } else {
                        const project = { id: 'proj-' + Date.now(), ...payload, progress:0, color:'#3B82F6', teamMembers:[], tags:[] };
                        this.data.projects.push(project);
                        if(this.store && typeof this.store.save === 'function') this.store.save();
                        this.addAudit(this.t('project.created') || 'Project created', payload.name);
                    }
                }
            } catch(e){ console.warn('Failed to save project', e); }
            delete form.dataset.editingId;
            this.closeModals();
            if(this.currentPage === 'projects') this.renderProjects();
            this.showNotification(this.t(isEdit? 'project.updated':'project.created') || (isEdit? 'Project updated':'Project created'), 'success');
        };
        doSave();
    }

    saveTask() {
        const form = document.getElementById('taskForm');
        const editingId = form.dataset.editingId;
        const payload = {
            projectId: document.getElementById('taskProject').value,
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            assignedTo: document.getElementById('taskAssignedTo').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            estimatedHours: parseFloat(document.getElementById('taskEstimatedHours').value) || 0,
            status: (document.getElementById('taskStatus')?.value) || 'Not Started'
        };
        const isEdit = !!editingId;
        const doSave = async () => {
            try {
                if(isEdit){
                    if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                        await this.store.updateTask(editingId, {
                            projectId: payload.projectId,
                            title: payload.title,
                            description: payload.description,
                            assignedTo: payload.assignedTo,
                            priority: payload.priority,
                            dueDate: payload.dueDate,
                            estimatedHours: payload.estimatedHours,
                            status: payload.status,
                            // ensure progress is consistent with status/subtasks
                            progress: this.computeTaskProgress({ ...this.data.tasks.find(tsk=> tsk.id === editingId), ...payload })
                        });
                    } else {
                        const t = this.data.tasks.find(tsk=> tsk.id === editingId);
                        if(t){ Object.assign(t, payload); t.progress = this.computeTaskProgress(t); }
                        if(this.store && typeof this.store.save === 'function') this.store.save();
                        this.addAudit(this.t('task.updated') || 'Task updated', payload.title);
                    }
                } else {
                    // include any subtasks prepared before save
                    const formEl = document.getElementById('taskForm');
                    let subtasks = [];
                    if(formEl && formEl._newSubtasks && formEl._newSubtasks.length){
                        subtasks = formEl._newSubtasks; delete formEl._newSubtasks;
                    }
                    if(this._usingSupabase && this.store && typeof this.store.addTask === 'function'){
                        await this.store.addTask({ ...payload, actualHours:0, tags:[], dependencies:[], subtasks, _ganttVisible:0, progress: this.computeTaskProgress({ ...payload, subtasks }) });
                    } else {
                        const task = { id:'task-' + Date.now(), ...payload, actualHours:0, tags:[], dependencies:[], subtasks, _ganttVisible:0 };
                        task.progress = this.computeTaskProgress(task);
                        this.data.tasks.push(task);
                        if(this.store && typeof this.store.save === 'function') this.store.save();
                        this.addAudit(this.t('task.created') || 'Task created', payload.title);
                    }
                }
            } catch(e){ console.warn('Failed to save task', e); }
            delete form.dataset.editingId;
            this.closeModals();
            if (this.currentPage === 'tasks') this.renderTasks();
            else if (this.currentPage === 'kanban') this.updateKanbanBoard();
            this.showNotification(this.t(isEdit? 'task.updated':'task.created') || (isEdit? 'Task updated':'Task created'), 'success');
        };
        doSave();
    }

    // Timer methods
    startTimer() {
        this.timer.isRunning = true;
        this.timer.startTime = Date.now() - this.timer.elapsedTime;
        
        document.getElementById('timerStart').classList.add('hidden');
        document.getElementById('timerStop').classList.remove('hidden');
        
        this.timer.interval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        this.timer.isRunning = false;
        this.timer.elapsedTime = Date.now() - this.timer.startTime;
        
        document.getElementById('timerStart').classList.remove('hidden');
        document.getElementById('timerStop').classList.add('hidden');
        
        clearInterval(this.timer.interval);
    }

    updateTimerDisplay() {
        const elapsed = Date.now() - this.timer.startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }

    // Re-adăugare drag & drop pentru Kanban (pierdut la refactor)
    setupDragAndDrop() {
        const self = this;
        document.addEventListener('dragstart', (e) => {
            const el = e.target.closest('.kanban-task');
            if (el) {
                el.classList.add('dragging');
                e.dataTransfer.setData('text/plain', el.dataset.taskId);
            }
        });

        document.addEventListener('dragend', (e) => {
            const el = e.target.closest('.kanban-task');
            if (el) {
                el.classList.remove('dragging');
            }
        });

        document.addEventListener('dragover', (e) => {
            if (e.target.closest('.tasks-container')) {
                e.preventDefault();
            }
        });

        document.addEventListener('drop', (e) => {
            const zone = e.target.closest('.tasks-container');
            if (!zone) return;
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            if (!taskId) return;
            const newStatus = zone.dataset.status;
            self.updateTaskStatus(taskId, newStatus);
        });
    }

    renderGanttPage() {
        if(!this.ganttManager){
            if(typeof GanttManager === 'undefined') {
                this.showNotification(this.t('gantt.managerMissing') || 'GanttManager unavailable', 'error');
                return;
            }
            this.ganttManager = new GanttManager(this);
        }
        // ensure filter options are populated before rendering
        this.populateGanttProjectFilter();
        this.ganttManager.render();
        // Re-bind scale change
        const scaleEl = document.getElementById('ganttScale');
        if(scaleEl && !scaleEl._bound){
            scaleEl.addEventListener('change', ()=> this.ganttManager.render());
            scaleEl._bound = true;
        }
        const projEl = document.getElementById('ganttProjectFilter');
        if(projEl && !projEl._bound){
            projEl.addEventListener('change', ()=> {
                try{ localStorage.setItem('gantt.projectFilter.selected', projEl.value||''); }catch(_){ }
                this.ganttManager.render();
            });
            projEl._bound = true;
        }
        const assEl = document.getElementById('ganttAssigneeFilter');
        if(assEl && !assEl._bound){
            assEl.addEventListener('change', ()=> this.ganttManager.render());
            assEl._bound = true;
        }
    }

    showNotification(message, type='info') {
        if(window.Toast){
            window.Toast.push(message, type);
        } else {
            console.log(type.toUpperCase()+': '+message);
        }
    }

    // ===== Notes (OneNote-like) =====
    _ensureNotesState(){
        if(!this._notes){
            // shape: { sections: [{id, projectId, title}], pages: [{id, sectionId, title, content, updatedAt}] }
            try { this._notes = JSON.parse(localStorage.getItem('notes.data')||'{}'); } catch(_) { this._notes = {}; }
            this._notes.sections = Array.isArray(this._notes.sections) ? this._notes.sections : [];
            this._notes.pages = Array.isArray(this._notes.pages) ? this._notes.pages : [];
            this._notes.selectedSectionId = this._notes.selectedSectionId || '';
            this._notes.selectedPageId = this._notes.selectedPageId || '';
        }
    }
    _saveNotes(){ try { localStorage.setItem('notes.data', JSON.stringify(this._notes)); } catch(_){} }
    _genId(prefix){ return prefix + '-' + Math.random().toString(36).slice(2,9); }

    async renderNotesPage(){
        this._ensureNotesState();
        // Attempt cloud sync if available
        let cloud = null;
        if(this._usingSupabase && this.store && typeof this.store.getNotes === 'function'){
            try{ cloud = await this.store.getNotes(); }catch(_){ cloud = null; }
        }
        if(cloud && cloud.cloudAvailable){
            // Merge cloud into local view, preferring cloud values but keeping local-only items
            const localSecs = Array.isArray(this._notes.sections) ? this._notes.sections : [];
            const localPages = Array.isArray(this._notes.pages) ? this._notes.pages : [];
            const cloudSecs = Array.isArray(cloud.sections) ? cloud.sections : [];
            const cloudPages = Array.isArray(cloud.pages) ? cloud.pages : [];
            const secMap = new Map();
            // Start with cloud
            cloudSecs.forEach(s=> secMap.set(s.id, { ...s }));
            // Merge local, preserving projectId if cloud lacks it
            localSecs.forEach(ls=> {
                if(secMap.has(ls.id)){
                    const cs = secMap.get(ls.id);
                    if((!cs.projectId || cs.projectId === '') && ls.projectId){
                        cs.projectId = ls.projectId;
                        secMap.set(ls.id, cs);
                    }
                } else {
                    secMap.set(ls.id, { ...ls });
                }
            });
            const pageMap = new Map();
            cloudPages.forEach(p=> pageMap.set(p.id, p));
            localPages.forEach(p=> { if(!pageMap.has(p.id)) pageMap.set(p.id, p); });
            this._notes.sections = Array.from(secMap.values());
            this._notes.pages = Array.from(pageMap.values());
        }
        // Update title
        const pageTitle = document.getElementById('pageTitle'); if(pageTitle) pageTitle.textContent = 'Notițe';
        // No project filter – notes are global
        // Sections
        const sectionsWrap = document.getElementById('notesSections');
    const sections = this._notes.sections;
        sectionsWrap.innerHTML = sections.map(s=> `
            <div class="notes-section-item ${s.id===this._notes.selectedSectionId? 'active':''}" data-id="${s.id}">
                <div class="title">${this._escapeHtml(s.title)}</div>
                <div class="actions">
                    <button class="btn btn--sm btn--ghost rename-section" data-id="${s.id}" title="Redenumește"><i class="fas fa-pen"></i></button>
                    <button class="btn btn--sm btn--ghost delete-section" data-id="${s.id}" title="Șterge"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
        // Bind section selection
        sectionsWrap.querySelectorAll('.notes-section-item').forEach(el=>{
            el.addEventListener('click', (e)=>{
                const id = el.dataset.id; this._notes.selectedSectionId = id; this._saveNotes(); this.renderNotesPage();
            });
        });
        // Bind section actions
        sectionsWrap.querySelectorAll('.rename-section').forEach(btn=>{
            btn.addEventListener('click', (ev)=>{
                ev.stopPropagation();
                const id = btn.dataset.id; const s = this._notes.sections.find(x=> x.id===id); if(!s) return;
                const name = prompt('Nume secțiune', s.title); if(!name) return;
                s.title = name; this._saveNotes();
                // cloud update
                if(this._usingSupabase && this.store && this.store.updateNoteSection){ this.store.updateNoteSection(id, { title: name }).catch(()=>{}); }
                this.renderNotesPage();
            });
        });
        sectionsWrap.querySelectorAll('.delete-section').forEach(btn=>{
            btn.addEventListener('click', (ev)=>{
                ev.stopPropagation();
                const id = btn.dataset.id; if(!confirm('Ștergi secțiunea și notele ei?')) return;
                this._notes.pages = this._notes.pages.filter(p=> p.sectionId !== id);
                this._notes.sections = this._notes.sections.filter(s=> s.id !== id);
                if(this._notes.selectedSectionId === id) this._notes.selectedSectionId = '';
                if(this._notes.selectedPageId && !this._notes.pages.find(p=> p.id === this._notes.selectedPageId)) this._notes.selectedPageId = '';
                this._saveNotes();
                if(this._usingSupabase && this.store && this.store.deleteNoteSection){ this.store.deleteNoteSection(id).catch(()=>{}); }
                this.renderNotesPage();
            });
        });
        // Add section
        const addSectionBtn = document.getElementById('addSectionBtn');
        if(addSectionBtn && !addSectionBtn._bound){
            addSectionBtn.addEventListener('click', async ()=>{
                const name = prompt('Nume secțiune'); if(!name) return;
                let id = this._genId('sec');
                const section = { id, projectId: '', title: name };
                this._notes.sections.push(section);
                // cloud create
                if(this._usingSupabase && this.store && this.store.addNoteSection){
                    const newId = await this.store.addNoteSection(section).catch(()=>null);
                    if(newId) { section.id = newId; id = newId; }
                }
                this._notes.selectedSectionId = id; this._saveNotes(); this.renderNotesPage();
            });
            addSectionBtn._bound = true;
        }
        // Pages for selected section (or all if none selected but project filtered)
        const pagesWrap = document.getElementById('notesPages');
        let pages = this._notes.pages.filter(p=> (!this._notes.selectedSectionId || p.sectionId === this._notes.selectedSectionId));
        // Search
        const search = document.getElementById('notesSearch');
        const q = (search && search.value || '').toLowerCase();
        if(search && !search._bound){ search.addEventListener('input', ()=> this.renderNotesPage()); search._bound = true; }
        if(q){ pages = pages.filter(p=> (p.title||'').toLowerCase().includes(q) || (p.content||'').toLowerCase().includes(q)); }
        // Render pages list
        pages.sort((a,b)=> (new Date(b.updatedAt||0)) - (new Date(a.updatedAt||0)));
        pagesWrap.innerHTML = pages.map(p=>{
            const text = (p.content||'').replace(/<[^>]*>/g,' ');
            const preview = text.length>120? text.slice(0,120)+'…' : text;
            return `<div class="notes-page-item ${p.id===this._notes.selectedPageId? 'active':''}" data-id="${p.id}">
                <div class="title">${this._escapeHtml(p.title||'Fără titlu')}</div>
                <div class="preview">${this._escapeHtml(preview)}</div>
                <div class="meta">${new Date(p.updatedAt||Date.now()).toLocaleString('ro-RO')}</div>
            </div>`;
        }).join('');
        pagesWrap.querySelectorAll('.notes-page-item').forEach(el=>{
            el.addEventListener('click', ()=>{ this._notes.selectedPageId = el.dataset.id; this._saveNotes(); this.renderNotesPage(); });
        });
        // Add note
        const addNoteBtn = document.getElementById('addNoteBtn');
        if(addNoteBtn && !addNoteBtn._bound){
            addNoteBtn.addEventListener('click', async ()=>{
                if(!this._notes.selectedSectionId){
                    // create a default section if none
                    const idSec = this._genId('sec');
                    this._notes.sections.push({ id: idSec, projectId: activeProject || '', title: 'General' });
                    this._notes.selectedSectionId = idSec;
                }
                let id = this._genId('note');
                const page = { id, sectionId: this._notes.selectedSectionId, title: 'Notă nouă', content: '', updatedAt: new Date().toISOString() };
                this._notes.pages.unshift(page);
                if(this._usingSupabase && this.store && this.store.addNote){
                    const newId = await this.store.addNote(page).catch(()=>null); if(newId){ page.id = newId; id = newId; }
                }
                this._notes.selectedPageId = id;
                this._saveNotes(); this.renderNotesPage();
            });
            addNoteBtn._bound = true;
        }
        // Editor bindings
        const titleInput = document.getElementById('noteTitleInput');
        const editor = document.getElementById('noteEditor');
        const updatedEl = document.getElementById('noteUpdatedAt');
        const delBtn = document.getElementById('deleteNoteBtn');
        const toolbar = document.querySelector('.editor-toolbar');
        const current = this._notes.pages.find(p=> p.id === this._notes.selectedPageId) || null;
        if(current){
            titleInput.value = current.title || '';
            editor.innerHTML = current.content || '';
            updatedEl.textContent = 'Modificat: ' + new Date(current.updatedAt||Date.now()).toLocaleString('ro-RO');
            titleInput.disabled = false; editor.contentEditable = 'true'; delBtn.disabled = false; toolbar.classList.remove('disabled');
        } else {
            titleInput.value = '';
            editor.innerHTML = '<p>Selectează sau adaugă o notă din listă.</p>';
            updatedEl.textContent = '';
            titleInput.disabled = true; editor.contentEditable = 'false'; delBtn.disabled = true; toolbar.classList.add('disabled');
        }
        // Saving indicator helpers
        if(toolbar && !toolbar._saveLabel){
            const lab = document.createElement('span'); lab.className='save-indicator'; lab.textContent='';
            toolbar.appendChild(lab); toolbar._saveLabel = lab;
        }
        const showSaving = ()=>{ if(toolbar && toolbar._saveLabel){ toolbar._saveLabel.textContent='Se salvează…'; } };
        const showSaved = ()=>{ if(toolbar && toolbar._saveLabel){ toolbar._saveLabel.textContent='Salvat'; setTimeout(()=>{ if(toolbar && toolbar._saveLabel) toolbar._saveLabel.textContent=''; }, 1500); } };
        // Title change
        if(!titleInput._bound){
            titleInput.addEventListener('input', ()=>{
                const p = this._notes.pages.find(x=> x.id === this._notes.selectedPageId); if(!p) return;
                showSaving();
                p.title = titleInput.value; p.updatedAt = new Date().toISOString(); this._saveNotes();
                if(this._usingSupabase && this.store && this.store.updateNote) this.store.updateNote(p.id, { title: p.title }).catch(()=>{});
                // live update list title
                const item = document.querySelector(`.notes-page-item[data-id="${p.id}"] .title`); if(item) item.textContent = titleInput.value || 'Fără titlu';
                updatedEl.textContent = 'Modificat: ' + new Date(p.updatedAt).toLocaleString('ro-RO');
                showSaved();
            });
            titleInput._bound = true;
        }
        // Editor commands
        const exec = (cmd, val=null)=> document.execCommand(cmd, false, val);
        if(toolbar && !toolbar._bound){
            toolbar.addEventListener('click', (e)=>{
                const btn = e.target.closest('button'); if(!btn) return;
                const cmd = btn.getAttribute('data-cmd');
                const block = btn.getAttribute('data-block');
                if(cmd){
                    if(cmd === 'createLink'){
                        const url = prompt('URL'); if(url) exec('createLink', url);
                    } else {
                        exec(cmd);
                    }
                } else if(block){
                    if(block === 'h1') exec('formatBlock', '<h1>');
                    else if(block === 'h2') exec('formatBlock', '<h2>');
                    else exec('formatBlock', '<p>');
                }
            });
            toolbar._bound = true;
        }
        const insertLinkBtn = document.getElementById('insertLinkBtn');
        if(insertLinkBtn && !insertLinkBtn._bound){ insertLinkBtn.addEventListener('click', ()=>{ const url = prompt('URL'); if(url) exec('createLink', url); }); insertLinkBtn._bound = true; }
        const clearFormatBtn = document.getElementById('clearFormatBtn');
        if(clearFormatBtn && !clearFormatBtn._bound){ clearFormatBtn.addEventListener('click', ()=> exec('removeFormat')); clearFormatBtn._bound = true; }
        // Templates select
        const tplSel = document.getElementById('noteTemplateSelect');
        if(tplSel && !tplSel._bound){
            tplSel.addEventListener('change', ()=>{
                const val = tplSel.value; if(!val) return;
                const templates = {
                    meeting: '<h2>Ședință</h2><p><strong>Data:</strong> …</p><p><strong>Participanți:</strong> …</p><h3>Agenda</h3><ul><li>…</li></ul><h3>Decizii</h3><ul><li>…</li></ul><h3>Acțiuni</h3><ul><li>…</li></ul>',
                    decision: '<h2>Decizie</h2><p><strong>Context:</strong> …</p><p><strong>Opțiuni:</strong> …</p><p><strong>Decizie:</strong> …</p><p><strong>Impact:</strong> …</p>',
                    daily: '<h2>Daily</h2><ul><li>Ieri: …</li><li>Astăzi: …</li><li>Blocaje: …</li></ul>'
                };
                if(editor) editor.focus();
                document.execCommand('insertHTML', false, templates[val] || '');
                tplSel.value='';
            });
            tplSel._bound = true;
        }
        // Duplicate note
        const dupBtn = document.getElementById('duplicateNoteBtn');
        if(dupBtn && !dupBtn._bound){
            dupBtn.addEventListener('click', async ()=>{
                const src = this._notes.pages.find(p=> p.id === this._notes.selectedPageId); if(!src) return;
                let id = this._genId('note');
                const copy = { id, sectionId: src.sectionId, title: (src.title||'Notă') + ' (copie)', content: src.content, updatedAt: new Date().toISOString() };
                this._notes.pages.unshift(copy);
                if(this._usingSupabase && this.store && this.store.addNote){
                    const newId = await this.store.addNote(copy).catch(()=>null); if(newId){ copy.id = newId; id = newId; }
                }
                this._notes.selectedPageId = id; this._saveNotes(); this.renderNotesPage();
            });
            dupBtn._bound = true;
        }
        // Export note (HTML)
        const expBtn = document.getElementById('exportNoteBtn');
        if(expBtn && !expBtn._bound){
            expBtn.addEventListener('click', ()=>{
                const p = this._notes.pages.find(x=> x.id === this._notes.selectedPageId); if(!p) return;
                const blob = new Blob([`<html><head><meta charset="utf-8"><title>${this._escapeHtml(p.title||'Nota')}</title></head><body>${p.content||''}</body></html>`], { type:'text/html;charset=utf-8' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (p.title||'nota') + '.html'; a.click(); setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
            });
            expBtn._bound = true;
        }
        // Persist content on input
        if(editor && !editor._bound){
            editor.addEventListener('input', ()=>{
                const p = this._notes.pages.find(x=> x.id === this._notes.selectedPageId); if(!p) return;
                showSaving();
                p.content = editor.innerHTML; p.updatedAt = new Date().toISOString(); this._saveNotes();
                if(this._usingSupabase && this.store && this.store.updateNote) this.store.updateNote(p.id, { content: p.content }).catch(()=>{});
                // live update preview/meta
                const item = document.querySelector(`.notes-page-item[data-id="${p.id}"]`);
                if(item){
                    const text = editor.innerText || editor.textContent || '';
                    item.querySelector('.preview').textContent = text.length>120? (text.slice(0,120)+'…') : text;
                    item.querySelector('.meta').textContent = new Date(p.updatedAt).toLocaleString('ro-RO');
                }
                updatedEl.textContent = 'Modificat: ' + new Date(p.updatedAt).toLocaleString('ro-RO');
                showSaved();
            });
            editor._bound = true;
        }
        // Delete note
        if(delBtn && !delBtn._bound){
            delBtn.addEventListener('click', ()=>{
                const id = this._notes.selectedPageId; if(!id) return; if(!confirm('Ștergi această notă?')) return;
                this._notes.pages = this._notes.pages.filter(p=> p.id !== id);
                this._notes.selectedPageId = '';
                this._saveNotes();
                if(this._usingSupabase && this.store && this.store.deleteNote) this.store.deleteNote(id).catch(()=>{});
                this.renderNotesPage();
            });
            delBtn._bound = true;
        }
    }

    // === Utility & Helper Methods (re-adăugate după refactor) ===
    formatDate(dateStr){
        if(!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            if(isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('ro-RO', { day:'2-digit', month:'2-digit', year:'numeric' });
        } catch(e){
            return dateStr;
        }
    }

    translateStatus(status){
        const map = {
            'Not Started':'Neînceput',
            'In Progress':'În Progres',
            'Review':'Review',
            'Done':'Finalizat'
        };
        return map[status] || status;
    }

    getStatusClass(status){
        const map = {
            'Not Started':'not-started',
            'In Progress':'in-progress',
            'Review':'review',
            'Done':'done'
        };
        return map[status] || 'default';
    }

    translatePriority(priority){
        const map = { 'High':'Ridicată', 'Medium':'Medie', 'Low':'Scăzută' };
        return map[priority] || priority;
    }

    // Compute a task's progress (0-100).
    // Logic: if subtasks exist, progress = completedSubtasks/totalSubtasks.
    // Fallback: map status to a sensible progress value.
    computeTaskProgress(task){
        if(!task) return 0;
        // If task is marked Done, force 100% regardless of subtasks
        if(task.status === 'Done') return 100;
        const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
        if(subs.length > 0){
            const completed = subs.filter(s => s.completed).length;
            return Math.round((completed / subs.length) * 100);
        }
        // fallback based on status
        switch(task.status){
            case 'Review': return 80;
            case 'In Progress': return 40;
            case 'Not Started':
            default: return 0;
        }
    }

    // Recalculate progress for a single project (average of its tasks), store result on project.progress
    recalculateProjectProgress(project){
        if(!project) return 0;
        const tasks = this.data.tasks.filter(t => t.projectId === project.id);
        if(!tasks.length){ project.progress = project.progress || 0; return project.progress; }
        const sum = tasks.reduce((acc, t) => acc + this.computeTaskProgress(t), 0);
        const avg = Math.round(sum / tasks.length);
        project.progress = Math.max(0, Math.min(100, avg));
        return project.progress;
    }

    // Recalculate progress for all projects. Saves the store if available.
    recalculateAllProjectProgresses(){
        if(!this.data || !Array.isArray(this.data.projects)) return;
        this.data.projects.forEach(p => this.recalculateProjectProgress(p));
        if(this.store && typeof this.store.save === 'function') this.store.save();
    }

    // Ensure a task's computed progress is persisted and dependent views stay in sync
    async updateTaskComputedProgress(taskId){
        try{
            const task = this.data.tasks.find(t=> t.id === taskId);
            if(!task) return;
            const progress = this.computeTaskProgress(task);
            // Mirror on local object (useful if other parts read task.progress)
            task.progress = progress;
            if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                await this.store.updateTask(taskId, { progress });
            } else if(this.store && typeof this.store.save === 'function') {
                this.store.save();
            }
            // keep project-level progress consistent
            try { this.recalculateAllProjectProgresses(); } catch(_){ }
            // light re-render for pages that show aggregates
            if(this.currentPage === 'projects') this.renderProjects();
            if(this.currentPage === 'dashboard') this.renderDashboard && this.renderDashboard();
            if(this.currentPage === 'reports') this.renderReports && this.renderReports();
        }catch(e){ /* non-fatal */ }
    }

    // Render an avatar slot that supports either an image URL or an emoji/text
    _avatarHtml(val, size = 32, alt = '', extraClass = ''){
        const safeAlt = (alt || '').replace(/"/g,'&quot;');
        const isUrl = typeof val === 'string' && (/^https?:\/\//i.test(val) || /^data:/i.test(val) || /\.(png|jpe?g|svg|gif)(\?.*)?$/i.test(val));
        if(isUrl){
            return `<img src="${val}" alt="${safeAlt}" class="${extraClass}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
        }
        const esc = (s)=> String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        const emoji = esc(val || '👤');
        return `<div class="${extraClass}" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.6)}px;border-radius:50%;background:var(--avatar-bg,#eef2f7);">${emoji}</div>`;
    }

    // Simple HTML escape helper used in dynamic inputs
    _escapeHtml(str){
        if(str == null) return '';
        return String(str)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    }

    updateTaskStatus(taskId, newStatus){
        const task = this.data.tasks.find(t=> t.id === taskId);
        if(!task) return;
        if(task.status === newStatus) return;
        const doUpdate = async () => {
            task.status = newStatus;
            try {
                if(this._usingSupabase && this.store && typeof this.store.updateTask === 'function'){
                    // also recompute progress if needed
                    const progress = this.computeTaskProgress(task);
                    task.progress = progress;
                    await this.store.updateTask(taskId, { status: newStatus, progress });
                } else if(this.store && typeof this.store.save === 'function') {
                    this.store.save();
                }
            } catch(e){ console.warn('Failed to update task status', e); }
            if(this.currentPage === 'kanban') this.updateKanbanBoard();
            this.showNotification(`Status task actualizat la ${this.translateStatus(newStatus)}`, 'success');
            try{ this.recalculateAllProjectProgresses(); }catch(e){}
            if(this.currentPage === 'projects') this.renderProjects();
            if(this.currentPage === 'dashboard') this.renderDashboard && this.renderDashboard();
            if(this.currentPage === 'reports') this.renderReports && this.renderReports();
            // Log to local audit as fallback for Recent Activity
            try { this.addAudit('Status updated', `${task.title} → ${this.translateStatus(newStatus)}`); } catch(_){ }
        };
        doUpdate();
    }

    getFilteredTasks(){
        let tasks = [...this.data.tasks];
        // project filter
        const projectSel = document.getElementById('taskProjectFilter');
        const projectVal = projectSel ? projectSel.value : '';
        if(projectVal) tasks = tasks.filter(t => t.projectId === projectVal);
        const statusSel = document.getElementById('statusFilter');
        const prioritySel = document.getElementById('priorityFilter');
        const statusVal = statusSel ? statusSel.value : '';
        const priorityVal = prioritySel ? prioritySel.value : '';
        if(statusVal){
            tasks = tasks.filter(t=> t.status === statusVal);
        }
        if(priorityVal){
            tasks = tasks.filter(t=> t.priority === priorityVal);
        }
        // tasks search query (by title, description, or subtask title)
        const q = (this._taskSearchQuery || '').trim();
        if(q){
            const ql = q.toLowerCase();
            tasks = tasks.filter(t =>
                (t.title && t.title.toLowerCase().includes(ql)) ||
                (t.description && t.description.toLowerCase().includes(ql)) ||
                (Array.isArray(t.subtasks) && t.subtasks.some(st => (st.title||'').toLowerCase().includes(ql)))
            );
        }
        return tasks;
    }

    // Saved filters: toolbar injection and persistence
    injectSavedFiltersToolbar(){
        try{
            const page = document.getElementById('tasksPage');
            const table = document.getElementById('tasksTable');
            if(!page || !table) return;
            let bar = document.getElementById('savedFiltersBar');
            if(!bar){
                bar = document.createElement('div');
                bar.id = 'savedFiltersBar';
                bar.style.display = 'flex';
                bar.style.alignItems = 'center';
                bar.style.justifyContent = 'space-between';
                bar.style.gap = '8px';
                bar.style.margin = '8px 0 6px 0';
                // insert before tasksTable
                table.parentNode.insertBefore(bar, table);
            }
            // visibility (hidden by default)
            const visible = (localStorage.getItem('tasks.savedFilters.visible')||'false')==='true';
            bar.style.display = visible ? 'flex' : 'none';
            bar.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <label for=\"savedFiltersSelect\" style=\"font-size:.9rem;color:var(--color-text-secondary)\">Filtre salvate:</label>
                    <select id=\"savedFiltersSelect\" class=\"form-control\" style=\"min-width:220px\"></select>
                    <button id=\"applySavedFilterBtn\" class=\"btn btn--sm btn--ghost\" title=\"Aplică filtrul selectat\"><i class=\"fas fa-filter\"></i> <span>Aplică</span></button>
                </div>
                <div style=\"display:flex;align-items:center;gap:8px;flex-wrap:wrap;\">
                    <button id=\"saveCurrentFilterBtn\" class=\"btn btn--sm btn--primary\" title=\"Salvează filtrul curent\"><i class=\"fas fa-floppy-disk\"></i> <span>Salvează</span></button>
                    <button id=\"deleteSavedFilterBtn\" class=\"btn btn--sm btn--secondary\" title=\"Șterge filtrul salvat\"><i class=\"fas fa-trash\"></i> <span>Șterge</span></button>
                </div>
            `;
            this.populateSavedFiltersSelect();
            const sel = bar.querySelector('#savedFiltersSelect');
            const applyBtn = bar.querySelector('#applySavedFilterBtn');
            const saveBtn = bar.querySelector('#saveCurrentFilterBtn');
            const delBtn = bar.querySelector('#deleteSavedFilterBtn');
            if(applyBtn && !applyBtn._bound){
                applyBtn.addEventListener('click', ()=>{ const id = sel && sel.value; if(id) this.applySavedFilter(id); });
                applyBtn._bound = true;
            }
            if(sel && !sel._bound){
                sel.addEventListener('change', ()=>{
                    try{ localStorage.setItem('tasks.savedFilters.selectedId', sel.value||''); }catch(_){ }
                });
                sel._bound = true;
            }
            if(saveBtn && !saveBtn._bound){
                saveBtn.addEventListener('click', ()=> this.saveCurrentTaskFilter());
                saveBtn._bound = true;
            }
            if(delBtn && !delBtn._bound){
                delBtn.addEventListener('click', ()=>{
                    const id = sel && sel.value; if(!id) return;
                    let list = this.getSavedFilters();
                    list = list.filter(f=> f.id !== id);
                    try{ localStorage.setItem('tasks.savedFilters', JSON.stringify(list)); localStorage.removeItem('tasks.savedFilters.selectedId'); }catch(_){ }
                    this.populateSavedFiltersSelect();
                });
                delBtn._bound = true;
            }
            // toggle button handler (in filters toolbar)
            const tgl = document.getElementById('toggleSavedFiltersBar');
            if(tgl && !tgl._bound){
                tgl.addEventListener('click', ()=>{
                    const nowVisible = bar.style.display !== 'none';
                    const next = !nowVisible;
                    bar.style.display = next ? 'flex' : 'none';
                    try{ localStorage.setItem('tasks.savedFilters.visible', String(next)); }catch(_){ }
                });
                tgl._bound = true;
            }
        }catch(e){ /* non-fatal */ }
    }
    getSavedFilters(){
        try{ return JSON.parse(localStorage.getItem('tasks.savedFilters') || '[]'); }catch(_){ return []; }
    }
    populateSavedFiltersSelect(){
        const sel = document.getElementById('savedFiltersSelect'); if(!sel) return;
        const list = this.getSavedFilters();
        const selectedId = localStorage.getItem('tasks.savedFilters.selectedId') || '';
    sel.innerHTML = `<option value="">Selectează…</option>` + list.map(f=> `<option value="${f.id}">${this._escapeHtml(f.name)}</option>`).join('');
        sel.value = selectedId;
    }
    saveCurrentTaskFilter(){
        const name = prompt('Nume filtru salvat:');
        if(!name) return;
        const statusVal = document.getElementById('statusFilter')?.value || '';
        const priorityVal = document.getElementById('priorityFilter')?.value || '';
        const projectVal = document.getElementById('taskProjectFilter')?.value || '';
        const q = (document.getElementById('taskSearchInput')?.value || this._taskSearchQuery || '').trim();
        const filter = { id: 'sf-'+Date.now(), name, filters: { statusVal, priorityVal, projectVal, q } };
        const list = this.getSavedFilters(); list.push(filter);
        try{
            localStorage.setItem('tasks.savedFilters', JSON.stringify(list));
            localStorage.setItem('tasks.savedFilters.selectedId', filter.id);
        }catch(_){ }
        this.populateSavedFiltersSelect();
        this.applySavedFilter(filter.id);
    }
    applySavedFilter(id){
        const list = this.getSavedFilters();
        const f = list.find(x=> x.id === id);
        if(!f) return;
        const { statusVal, priorityVal, projectVal, q } = f.filters || {};
        const statusSel = document.getElementById('statusFilter'); if(statusSel){ statusSel.value = statusVal || ''; }
        const prioritySel = document.getElementById('priorityFilter'); if(prioritySel){ prioritySel.value = priorityVal || ''; }
        const projectSel = document.getElementById('taskProjectFilter'); if(projectSel){ projectSel.value = projectVal || ''; }
        const searchInput = document.getElementById('taskSearchInput'); if(searchInput){ searchInput.value = q || ''; }
        this._taskSearchQuery = (q || '').toLowerCase();
        this.filterTasks();
    }

    // Templates: duplicate task/project and checklist extraction
    async duplicateTask(taskId){
        const src = this.data.tasks.find(t=> t.id === taskId); if(!src) return;
        const copy = { ...src };
        delete copy.id; // let persistence assign
        copy.title = `${src.title} (Copy)`;
        copy.dependencies = []; // avoid cycles
        // progress will be recomputed by adapter if not present
        if(!Array.isArray(copy.subtasks)) copy.subtasks = [];
        // if subtasks exist, strip their ids for insertion
        copy.subtasks = copy.subtasks.map(st=> ({ title: st.title, completed: !!st.completed, startDate: st.startDate||null, dueDate: st.dueDate||null }));
        try{
            if(this._usingSupabase && this.store && this.store.addTask){
                await this.store.addTask(copy);
            } else {
                const newId = 'task-'+Date.now();
                this.data.tasks.push({ ...src, id: newId, title: copy.title, dependencies: [], subtasks: (copy.subtasks||[]).map((s,i)=> ({ id: 'sub-'+Date.now()+'-'+i, ...s })) });
                if(this.store && typeof this.store.save==='function') this.store.save();
            }
            this.renderTasks(); this.updateKanbanBoard && this.updateKanbanBoard();
            this.showNotification('Task duplicat', 'success');
        }catch(e){ console.warn('duplicateTask failed', e); this.showNotification('Duplicare eșuată', 'error'); }
    }
    async duplicateProject(projectId){
        const src = this.data.projects.find(p=> p.id === projectId); if(!src) return;
        const copy = { ...src };
        delete copy.id;
        copy.name = `${src.name} (Copy)`;
        try{
            let newProjectId = null;
            if(this._usingSupabase && this.store && this.store.addProject){
                newProjectId = await this.store.addProject(copy);
            } else {
                newProjectId = 'proj-'+Date.now();
                this.data.projects.push({ ...src, id: newProjectId, name: copy.name });
                if(this.store && typeof this.store.save==='function') this.store.save();
            }
            // duplicate tasks into new project (shallow, no deps)
            const tasksToCopy = this.data.tasks.filter(t=> t.projectId === projectId);
            for(const t of tasksToCopy){
                const tcopy = { ...t };
                delete tcopy.id;
                tcopy.projectId = newProjectId;
                tcopy.dependencies = [];
                tcopy.title = `${t.title}`; // keep original title
                tcopy.subtasks = (t.subtasks||[]).map(st=> ({ title: st.title, completed: !!st.completed, startDate: st.startDate||null, dueDate: st.dueDate||null }));
                if(this._usingSupabase && this.store && this.store.addTask){
                    await this.store.addTask(tcopy);
                } else {
                    const newTaskId = 'task-'+Date.now()+Math.floor(Math.random()*1000);
                    this.data.tasks.push({ ...t, id: newTaskId, projectId: newProjectId, dependencies: [], subtasks: tcopy.subtasks.map((s,i)=> ({ id:'sub-'+Date.now()+'-'+i, ...s })) });
                }
            }
            if(this.store && typeof this.store.save==='function') this.store.save();
            this.renderProjects(); this.renderTasks(); this.updateKanbanBoard && this.updateKanbanBoard();
            this.showNotification('Proiect duplicat', 'success');
        }catch(e){ console.warn('duplicateProject failed', e); this.showNotification('Duplicare proiect eșuată', 'error'); }
    }
    async extractChecklistToSubtasks(taskId){
        const task = this.data.tasks.find(t=> t.id === taskId); if(!task) return;
        const desc = task.description || '';
        const lines = desc.split(/\r?\n/);
        const checklist = [];
        const re = /^\s*[-*]\s*\[( |x|X)\]\s+(.*)$/;
        for(const line of lines){
            const m = line.match(re);
            if(m){ checklist.push({ title: m[2].trim(), completed: (m[1].toLowerCase() === 'x') }); }
        }
        if(!checklist.length){ this.showNotification('Nicio listă de bifat găsită în descriere', 'info'); return; }
        task.subtasks = task.subtasks || [];
        // persist new subtasks
        for(const item of checklist){
            if(this._usingSupabase && this.store && this.store.addSubtask){
                const newId = await this.store.addSubtask(taskId, { title: item.title, completed: item.completed });
                task.subtasks.push({ id: newId || ('sub-'+Date.now()+Math.random()), title: item.title, completed: item.completed });
            } else {
                const nid = 'sub-'+Date.now()+Math.random();
                task.subtasks.push({ id: nid, title: item.title, completed: item.completed });
                if(this.store && typeof this.store.save==='function') this.store.save();
            }
        }
        this.renderTasks(); this.updateKanbanBoard && this.updateKanbanBoard();
        this.showNotification('Checklist extras în subtasks', 'success');
    }

    filterTasks(){
        if(this.currentPage === 'tasks'){
            this.renderTasks();
        }
    }

    filterKanbanTasks(){
        if(this.currentPage === 'kanban'){
            this.updateKanbanBoard();
        }
    }

    handleGlobalSearch(query){
        const q = (query||'').trim();
        const resultsContainer = document.getElementById('globalSearchResults');
        if(!resultsContainer){
            // create a floating panel below the search input
            const input = document.getElementById('globalSearch');
            if(!input) return;
            const panel = document.createElement('div');
            panel.id = 'globalSearchResults';
            panel.style.position = 'absolute';
            panel.style.background = 'var(--color-surface,#fff)';
            panel.style.border = '1px solid var(--color-border,#ddd)';
            panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            panel.style.borderRadius = '8px';
            panel.style.padding = '8px 0';
            panel.style.maxHeight = '360px';
            panel.style.overflowY = 'auto';
            panel.style.zIndex = '1500';
            const rect = input.getBoundingClientRect();
            panel.style.top = (rect.bottom + window.scrollY + 6) + 'px';
            panel.style.left = (rect.left + window.scrollX) + 'px';
            panel.style.width = rect.width + 'px';
            document.body.appendChild(panel);
            // close on outside click
            setTimeout(()=>{
                const closeHandler = (e)=>{ if(!panel.contains(e.target) && e.target !== input){ panel.remove(); document.removeEventListener('click', closeHandler); } };
                document.addEventListener('click', closeHandler);
            },50);
            return this.handleGlobalSearch(query); // re-run with panel now existing
        }
        if(!q){ resultsContainer.innerHTML = '<div style="padding:8px 16px;color:var(--color-text-secondary)">Introduceți text...</div>'; return; }
        // Local fallback search always
        const localTasks = this.data.tasks.filter(t => (t.title||'').toLowerCase().includes(q.toLowerCase()));
        const localProjects = this.data.projects.filter(p => (p.name||'').toLowerCase().includes(q.toLowerCase()));
        // If Supabase full-text available use it (debounced) else show local
        if(this._usingSupabase && this.store && typeof this.store.searchFullText === 'function'){
            clearTimeout(this._globalSearchTimer);
            resultsContainer.innerHTML = '<div style="padding:8px 16px;color:var(--color-text-secondary)">Cautare...</div>';
            this._globalSearchTimer = setTimeout(async ()=>{
                try {
                    const ft = await this.store.searchFullText(q);
                    const tasks = (ft.tasks && ft.tasks.length)? ft.tasks : localTasks;
                    const projects = (ft.projects && ft.projects.length)? ft.projects : localProjects;
                    resultsContainer.innerHTML = this._renderGlobalSearchResults(q, projects, tasks);
                } catch(e){
                    resultsContainer.innerHTML = this._renderGlobalSearchResults(q, localProjects, localTasks);
                }
            }, 220);
        } else {
            resultsContainer.innerHTML = this._renderGlobalSearchResults(q, localProjects, localTasks);
        }
    }
    _renderGlobalSearchResults(q, projects, tasks){
        if(!projects.length && !tasks.length){ return '<div style="padding:8px 16px;color:var(--color-text-secondary)">Niciun rezultat</div>'; }
        const esc = (s)=> String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
        const highlight = (text)=> esc(text).replace(new RegExp(q.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&'),'ig'), m=> `<mark>${m}</mark>`);
        const projHtml = projects.slice(0,5).map(p=> `<div class="gs-item" data-type="project" data-id="${p.id}" style="padding:6px 16px;cursor:pointer;display:flex;align-items:center;gap:8px;">📁 <span>${highlight(p.name||'')}</span></div>`).join('');
        const taskHtml = tasks.slice(0,10).map(t=> `<div class="gs-item" data-type="task" data-id="${t.id}" style="padding:6px 16px;cursor:pointer;display:flex;align-items:center;gap:8px;">✅ <span>${highlight(t.title||'')}</span></div>`).join('');
        const html = (projHtml? `<div style="padding:4px 12px;font-size:12px;font-weight:600;color:var(--color-text-secondary)">Proiecte</div>${projHtml}` : '')+
                     (taskHtml? `<div style="padding:4px 12px;font-size:12px;font-weight:600;color:var(--color-text-secondary);margin-top:4px;">Task-uri</div>${taskHtml}` : '');
        // attach click delegation after insertion
        setTimeout(()=>{
            document.querySelectorAll('#globalSearchResults .gs-item').forEach(it=>{
                it.addEventListener('click', ()=>{
                    const type = it.dataset.type; const id = it.dataset.id;
                    if(type==='project'){
                        // navigate to projects page and maybe scroll/highlight
                        this.navigateToPage('projects');
                        setTimeout(()=>{
                            const card = document.querySelector(`.project-card[data-project-id="${id}"]`);
                            if(card){ card.classList.add('pulse'); setTimeout(()=> card.classList.remove('pulse'), 2000); card.scrollIntoView({behavior:'smooth',block:'center'}); }
                        },120);
                    } else if(type==='task') {
                        this.navigateToPage('tasks');
                        setTimeout(()=>{
                            const row = document.querySelector(`tr[data-task-id="${id}"]`);
                            if(row){ row.classList.add('pulse'); setTimeout(()=> row.classList.remove('pulse'), 2000); row.scrollIntoView({behavior:'smooth',block:'center'}); }
                        },120);
                    }
                    const panel = document.getElementById('globalSearchResults'); if(panel) panel.remove();
                });
            });
        },30);
        return html;
    }

    // ===== Focus Mode =====
    toggleFocusMode(){
        try{ this.focusMode = !this.focusMode; localStorage.setItem('focus.mode', String(!!this.focusMode)); }catch(_){ this.focusMode = !this.focusMode; }
        this.applyFocusMode();
    }
    applyFocusMode(){
        const enabled = !!this.focusMode;
        try{ document.body.classList.toggle('focus-mode', enabled); }catch(_){ }
        const btn = document.getElementById('focusModeToggle');
        if(btn){
            try{ btn.setAttribute('aria-pressed', String(enabled)); }catch(_){ }
            try{ btn.title = enabled ? 'Ieși din Focus Mode (Ctrl+Shift+F)' : 'Pornește Focus Mode (Ctrl+Shift+F)'; }catch(_){ }
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.projectHub = new ProjectHub();
    // Debug shortcut: Alt+U to force unlock UI
    document.addEventListener('keydown', (e)=>{
        if(e.altKey && (e.key === 'u' || e.key === 'U')){
            if(window.projectHub) window.projectHub.forceUIUnlock();
        }
    });
});