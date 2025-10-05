# Developer Guide — ProjectHub

This guide maps the core modules, public methods, internal helpers, and data flow of ProjectHub. Use it alongside the code to navigate features quickly and extend safely.

Contents
- Module overview
- app.js — main SPA controller
- gantt.js — GanttManager
- style.css — key classes and layers
- index.html — app shell & important regions
- Data flow & persistence
- UI & events: contracts and edge cases
- Testing & troubleshooting tips

---

## Module overview

- index.html — Declares the app shell (sidebar, header, pages), modals, and containers used by feature modules.
- style.css — Design tokens, base components, and feature styling. Gantt and modal/backdrop layers are important.
- app.js — Main controller: routing, data model, CRUD, charts, Notes wiring, Time Tracking (timer + Pomodoro), and Gantt bootstrapping.
- gantt.js — GanttManager: timeline rendering, drag/resize/move, dependency creation/deletion, overlays, panels, export, drag-to-pan.
- supabaseAdapter.js — Optional Supabase integration (API surface aligns to the local DataStore shapes).
- ui/toast.js — Toast notifications (info/success/error + undo callback support).

## app.js — main SPA controller

The app uses a singleton-like controller that initializes UI, routes between pages, and operates on `this.data` (projects, tasks, users, timeEntries, comments). If `SupabaseStore` is present (and `_isSupabase`), it becomes `this.store`; otherwise, local `DataStore` is used.

### Initialization & state
- Theme, sidebar collapsed flag, and language are restored from LocalStorage.
- `this.data` provides arrays for projects, tasks, users, timeEntries, and comments.
- `this.timer` — simple stopwatch with `isRunning`, `startTime`, `elapsedTime`, `interval`.
- `this.pomodoro` — focus sessions state: `phase (focus|short|long)`, durations, `longEvery`, `autoContinue`, `cyclesCompleted`, selection `taskId`, and tick `interval`.
- UI watchdog periodically removes orphaned modal backdrops.

### Routing & rendering
- `navigateToPage(page)` — Updates nav highlights, shows the page container, sets title, and calls `renderCurrentPage()`. If leaving Time Tracking with the timer running, it safely stops the timer.
- `renderGanttPage()` — Instantiates `GanttManager`, populates filters, binds events (scale/project/assignee changes), and calls `ganttManager.render()`.
- `renderNotesPage()` — Ensures notes local state, optionally merges cloud state, and populates sections/pages/editor.
- `renderTimeTracking()` — Updates Today summary and Recent entries; refreshes Pomodoro UI and task options.
- `renderReports()` — Debounced chart rendering (Chart.js) with filter wiring.

### Modals
- `showModal(el)` / `closeModals()` — Centralized modal open/close with backdrop generation, escape key handling, and body scroll lock.
- Project/Task/Gantt config/Member modals have helpers to populate and save.

### Data management
- Projects: `saveProject` with Supabase/local persistence and audit trail.
- Tasks: `saveTask`, `confirmDeleteTask`. Subtasks are included if present pre-save.
- Members: add/edit/delete; unassign tasks on delete.
- Audit: `addAudit` and `renderAuditTrail` keeps a local history for reference.

### Kanban
- `setupDragAndDrop()` — Uses HTML5 DnD to move tasks between status columns; `updateTaskStatus` (elsewhere) adjusts the model.
- `updateKanbanBoard()` — Renders columns, counts, and avatars; filters by project.

### Reports
- Chart renderers: create or update Chart.js instances across multiple dashboards.
- `_populateReportsFilters`, `_getReportsFilters`, `_bindReportsControls` — Filter lifecycle; CSV export helper.

### Time Tracking — simple timer
- `startTimer()` — Starts the HH:MM:SS stopwatch, swaps Start/Stop buttons, and starts a 1s interval to update display.
- `stopTimer()` — Stops and fixes elapsed time, swaps buttons back, and clears interval.
- `updateTimerDisplay()` — Computes HH:MM:SS from `Date.now() - startTime`.
- `updateTodayTime()` — Aggregates `data.timeEntries` for the current date and shows total `h m`.
- `renderRecentTimeEntries()` — Renders the latest 10 entries by date.

### Time Tracking — Pomodoro/Focus Sessions
Public UI is declared in `index.html` under the Time Tracking page.

- `_initPomodoroUI()` — Binds all Pomodoro controls (mode, durations, auto-continue, buttons, task select), seeds phase=focus, and updates UI.
- `_refreshPomodoroTaskOptions()` — Populates the task assignment select from `data.tasks` and retains selection if possible.
- `_setPomodoroPhase(phase)` — Updates `phase`, sets `totalMs` and resets `remainingMs` based on configured durations.
- `_startPomodoro()` — Starts ticking every 1s and updates UI.
- `_pausePomodoro()` / `_resumePomodoro()` — Toggle ticking and UI.
- `_skipPomodoroPhase()` — Forces phase completion and triggers the completion handler.
- `_resetPomodoro()` — Clears interval, resets cycles, and reverts to focus phase.
- `_tickPomodoro()` — Decrements `remainingMs` and calls `_handlePomodoroComplete()` when <= 0.
- `_handlePomodoroComplete()` — If the completed phase was `focus`, logs a time entry into `data.timeEntries` (decimal hours) under the selected `taskId` (if any), updates Today/Recent, increments cycle count, selects the next phase (`short`/`long` break based on `longEvery`), optionally auto-continues, and shows a notification.
- `_formatMMSS(ms)` — Formats countdown display.
- `_updatePomodoroUI()` — Reflects state across countdown, phase label, progress width, cycle label, and buttons (Start/Pause/Resume/Skip enable/disable and visibility).

Edge cases & safeguards
- Timer auto-stops on page navigation away from Time Tracking.
- Pomodoro auto-continue can be toggled off to avoid surprise start of next phase.
- Using Supabase for time entries is straightforward: extend the adapter to persist `data.timeEntries` mutations.

## gantt.js — GanttManager

### Public orchestration
- `render()` —
  - Defers if the timeline is hidden (width 0) to avoid bad measurements.
  - Computes tasks via `filteredTasks()`, the date range via `range()`, and the scale via `buildScale()` (day/week/month with weekend flags in day).
  - Renders the scale header (marking weekend cells for day).
  - Ensures `.gantt-weekend-layer` exists and overlays weekend stripes for day scale.
  - Builds `displayRows` with task and subtask rows, filters against collapsed parents, sizes the rows container, and sets body min-width.
  - Calls `renderTaskList`, `renderBars`, `renderDependencies`, and `renderTodayLine`.

### Left list & collapse
- `renderTaskList(tasks)` —
  - Renders parent rows (with a collapse/expand toggle that shows `completed/total` subtasks) and subtask rows.
  - Makes top-level rows draggable to reorder tasks (updates `sortIndex`, persists via store).
  - Click handlers: open parent detail panel or subtask panel depending on row type.
  - Collapse/expand state is shared via `this.app._collapsedTasks` and saved in LocalStorage.

### Bars & subtasks
- `renderBars(tasks)` —
  - For each visible row: creates `.gantt-row` and either a parent bar, a milestone diamond (if flagged or zero-length), or a subtask bar.
  - Parent bars include progress fill, resize handles, dependency handle, tooltip (start/end/progress/assignee), and late-task styling.
  - Subtasks are thinner, indented bars and open the subtask panel on click.

### Panels
- `openDetailPanel(taskId, anchorEl)` — Draggable card with main fields (dates, priority, status, desc, milestone toggle) and an ‘add subtask’ row; backdrop and escape/off-click close.
- `openSubtaskPanel(taskId, subtaskId, anchorEl)` — Draggable card focused on subtask fields (title, dates, done). Save/Delete persist via store/helpers and re-render timeline.

### Dependencies (SVG overlay)
- `renderDependencies(tasks)` —
  - Routes edges using `_depPathBetweenRects()` into a rounded multi-segment path with lane staggering, avoiding tight overlaps.
  - Marks critical edges when successor is late; uses different arrowheads and styles.
  - Hover highlights path and shows an inline tooltip.
  - Click deletes with confirm/undo (toast), or direct removal if confirm modal is absent.
- `_createsCycle(from, to)` — DFS to detect cycles and block creation.

### Input & gestures
- Global drag state for resize/move and dependency creation via the small orange handle.
- Drag-to-pan: `_bindTimelinePanning()` enables left-drag on empty timeline area; `_bindScrollSync()` keeps the left task list vertically aligned with the timeline scrollTop.

### Timeline & helpers
- `buildScale(start, end, scale)` — Day/week/month units, with `unit.weekend` set for day.
- `unitIndex(d)` — Maps a given date to the relevant unit index.
- `range(tasks)` — Computes min/max from tasks and subtasks and ensures a minimum span for comfort.
- `_depPathBetweenRects(aRect, bRect, containerRect, staggerOffset)` — Computes a path that prefers the vertical gap between bars, otherwise routes below, and applies stagger offset to minimize overlaps.

## style.css — key classes

- Containers: `.app-container`, `.sidebar`, `.main-content`, `.page`.
- Cards, buttons, inputs, modals, backdrops, toasts.
- Gantt: `.gantt-container`, `.gantt-sidebar`, `.gantt-timeline-wrapper`, `.gantt-timeline-header`, `.gantt-timeline-body`, `.gantt-row`, `.gantt-bar`, `.gantt-milestone`, `.gantt-bar-handle`, `.gantt-bar-dep`, `.gantt-weekend-layer`, `.gantt-weekend-col`, `.gantt-scale-cell.weekend`.
- Panning cursors: `.gantt-timeline-wrapper.can-pan` and `.is-panning`.

## index.html — app shell

- Sidebar with navigation; header with search, create menu, notifications, and language selector.
- Pages as divs: Dashboard, Notes, Projects, Tasks, Kanban, Team, Time Tracking, Reports, Gantt.
- Gantt page: task list + timeline wrapper with header/body containers; legend modal.
- Modals: Project, Gantt Config, Gantt Save Confirm, Task, Member.

## Data flow & persistence

- `this.data` is the source of truth in the client.
- Local mode: `DataStore.save()` persists to LocalStorage.
- Supabase mode: `SupabaseStore` provides methods like `updateTask`, `addTask`, `deleteTask`, `setTaskDependencies`, `addSubtask`, `updateSubtask`, etc.
- Notes use explicit Supabase tables; the same pattern can be expanded to other entities.

## UI & events: contracts and edge cases

- Modals use generated backdrops; if stray backdrops exist without visible modals, a watchdog removes them every few seconds.
- Gantt defers rendering until its container has width > 0 to avoid mis-sized bars.
- Dependency creation uses temporary SVG preview; robustly locates the underlying bar under cursor using `elementsFromPoint` fallback.
- Drag handlers avoid interfering with panning by scoping panning to empty timeline space.
- Time Tracking: navigating away auto-stops the simple timer to avoid ghost intervals.

## Testing & troubleshooting

- Rendering tests: switch pages quickly to verify the Gantt render deferral logic handles hidden containers.
- Dependencies: create many parallel edges and verify stagger lanes; delete with undo toast; attempt a cycle to confirm it’s blocked.
- Panning: drag over empty timeline to scroll; ensure header and sidebar remain aligned.
- Pomodoro: set small durations (e.g., 1–2 minutes) for quick cycles; verify time entries log on focus completion.
- Supabase: run SQL from `supabase_notes_schema.sql` and ensure RLS and triggers are active before enabling cloud mode in the app.
