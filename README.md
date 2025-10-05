# ProjectHub — Project & Team Management (Vanilla JS SPA)

ProjectHub is a single-page web app for managing projects, tasks, timelines (Gantt), Kanban, notes, time tracking, reports, and a small team directory. It runs as a static site (no build step) and stores data in LocalStorage by default, with optional Supabase adapters (already wired for Notes and easy to extend for other entities).

## Contents

- Overview
- Quick start
- Project structure
- Data & persistence
- Features and UX
- Architecture & modules
- Gantt: behaviors and internals
- Time Tracking: timer + Pomodoro focus sessions
- Notes: OneNote-like editor + Supabase schema
- Reports & analytics
- Styling & theming
- Localization
- Accessibility, keyboard, and UX details
- Extending and customizing
- Known limitations & troubleshooting

---

## Overview

ProjectHub provides a cohesive set of tools:

- Projects and Tasks with priorities, statuses, assignees, and subtasks.
- Gantt chart with zoom scales, drag-resize, dependency management, weekend highlighting, and drag-to-pan navigation.
- Kanban board with drag-and-drop.
- Notes (a lightweight OneNote) with sections/pages, templates, duplicate/export, and optional Supabase sync.
- Time Tracking with a simple timer and Focus Sessions (Pomodoro) that can auto-log entries.
- Reports with several charts (Chart.js) and filters.
- Team directory with member management.

All of this is delivered in a single-page application implemented in vanilla JavaScript and a robust CSS system.

## Quick start

No build step is required. You can open `index.html` directly in the browser or serve it via a simple static server.

- Open directly: double-click `index.html`.
- Recommended: run via a lightweight server (for correct relative paths and future APIs).

PowerShell (optional):

```powershell
# If you have Node.js
npx serve .
# or
npx http-server -p 8080 .
```

Then open the printed URL in your browser.

## Project structure

```
.
├─ index.html            # App shell & page layout (Dashboard, Tasks, Kanban, Calendar, Reports, Gantt, Notes, Time Tracking)
├─ style.css             # Design tokens, layout, components, and feature styling (incl. Gantt)
├─ app.js                # Main SPA logic: routing, data adapters, rendering, modals, events, pages, charts
├─ gantt.js              # GanttManager: timeline rendering, drag/resize, dependencies, panels, export
├─ dataStore.js          # LocalStorage adapter (if present)
├─ supabaseAdapter.js    # Optional Supabase adapter (if present)
├─ ui/toast.js           # Toast notifications helper
├─ kanbanEnhancements.js # Kanban UX extras
├─ supabase_notes_schema.sql # SQL for Notes tables, triggers, and permissive RLS
└─ docs/                 # (Optional) additional docs
```

## Data & persistence

- Default: LocalStorage via `DataStore`. The structure in `this.data` includes `{ projects, tasks, users, timeEntries, comments }`.
- Optional: `SupabaseStore` (if loaded) is auto-detected and used. Notes include explicit Supabase schema; other entities are easily adaptable.
- Time entries: Stored in `data.timeEntries` (local by default). Focus sessions (Pomodoro) can auto-append entries.

Supabase Notes schema (excerpt):

- `notes_sections(id, project_id, title, created_at, updated_at)`
- `notes_pages(id, section_id, title, content, created_at, updated_at)`
- Triggers to maintain `updated_at`
- RLS enabled with permissive policies for quick-start (important: lock down for multi-user)

See `supabase_notes_schema.sql` for the full DDL and policies.

## Features and UX

- Dashboard with KPIs, deadlines, and recent activity (recent limited to last 6 entries in UI logic).
- Projects CRUD, Tasks CRUD (subtasks supported), and inline table rendering.
- Kanban board: drag-and-drop between status columns, counters, and avatars.
- Gantt chart:
  - Scales: day, week, month; weekend highlighting in day scale (header and striped background layer).
  - Task bars draggable and resizable; subtasks appear on their own rows with lighter bars.
  - Milestones (diamond) when flagged or zero-length durations.
  - Dependencies: create by dragging from the orange handle; paths are routed with lane staggering to reduce overlaps.
  - Delete dependency via click (with confirm and toast-undo behavior); cycle detection prevents invalid edges.
  - Today line; PNG/CSV export; draggable details panels with backdrops.
  - Drag-to-pan on timeline: hold left mouse on empty timeline area and drag to scroll horizontally/vertically/diagonally; header/body synced; sidebar vertically synced.
- Notes: sections and pages with contenteditable editor, formatting toolbar, templates, duplicate/export, optional cloud sync via Supabase.
- Time Tracking: simple timer (start/stop) and Focus Sessions (Pomodoro) with configurable durations and automatic logging of completed focus phases.
- Reports: multiple charts with project/user/date filters (Chart.js).
- Team: members with emoji/avatar, hours/week, and stats.

## Architecture & modules

### `index.html`
- Declares the full app shell, sidebar navigation, page containers, and modals.
- Gantt page uses `.gantt-container` with a left task list and a right timeline wrapper (`#ganttTaskList`, `#ganttTimelineHeader`, `#ganttTimelineBody`).
- Notes page defines sections list, pages list, and editor area with toolbar.
- Time Tracking page includes a simple timer and the Pomodoro card (Focus Sessions) added under `time-trackingPage`.

### `style.css`
- Design tokens (CSS variables) and components (cards, buttons, inputs, modals, toasts).
- Gantt styles:
  - `.gantt-container`, `.gantt-timeline-wrapper` (scroll container), `.gantt-timeline-header`, `.gantt-timeline-body`, `.gantt-row`, `.gantt-bar`, handles, and milestone.
  - Weekend: `.gantt-scale-cell.weekend`, `.gantt-weekend-layer`, `.gantt-weekend-col`.
  - Drag-to-pan feedback: `.gantt-timeline-wrapper.can-pan` (grab) and `.is-panning` (grabbing).

### `app.js` (Main SPA)
- Initialization: theme, sidebar, router, data store selection (local or Supabase), charts init, and watchdog for stray backdrops.
- Routing: `navigateToPage`, `renderCurrentPage`, and page-specific renderers (`renderGanttPage`, `renderNotesPage`, `renderTimeTracking`, `renderReports`, etc.).
- Modals: `showModal`, `closeModals`, and helpers for Project/Task forms and Gantt config.
- CRUD: `saveProject`, `saveTask`, member add/edit/delete, task delete confirmation, audits.
- Filters/search: task filters, kanban filters, quick search, reset.
- Kanban DnD setup (`setupDragAndDrop`).
- Reports: Chart.js rendering and filter binding.
- Time Tracking:
  - Simple timer: `startTimer`, `stopTimer`, `updateTimerDisplay`.
  - Aggregates: `updateTodayTime`, `renderRecentTimeEntries`.
  - Focus Sessions (Pomodoro):
    - State: `this.pomodoro` with phase (`focus|short|long`), durations, long-interval, auto-continue, cycle counts, and selected task.
    - UI binding: `_initPomodoroUI()` and `_refreshPomodoroTaskOptions()` to populate task select and wire controls.
    - Control flow: `_setPomodoroPhase`, `_startPomodoro`, `_pausePomodoro`, `_resumePomodoro`, `_skipPomodoroPhase`, `_resetPomodoro`, `_tickPomodoro`, `_handlePomodoroComplete`.
    - Completion: finishes a focus phase → logs a time entry (decimal hours) to `data.timeEntries`, updates Today/Recent, increments cycles, switches to next phase (short/long break) with auto-continue option.

### `gantt.js` (GanttManager)
- Public surface:
  - `render()` — orchestrates headers, scale, rows, bars, dependencies, today line; defers if hidden to avoid bad sizes.
  - `renderTaskList(tasks)` — left-side labels with collapse/expand for subtasks and DnD reorder of top-level tasks.
  - `renderBars(tasks)` — rows for tasks and subtasks; bars, handles, milestone diamonds, progress fill; tooltips.
  - `renderDependencies(tasks)` — SVG overlay with routed, staggered paths; critical/normal styles; hover tooltips; delete with confirm and toast-undo; cycle detection.
  - `renderTodayLine()` — vertical ‘today’ indicator.
  - `openDetailPanel(taskId, anchorEl)` — draggable panel for main task fields and add-subtask row.
  - `openSubtaskPanel(taskId, subtaskId, anchorEl)` — focused subtask editor in its own draggable panel.
  - `exportCSV()` and `exportPNG()` using html2canvas (PNG).
- Input handling:
  - Global doc handlers: `handleMouseDown/Move/Up` for drag/resize of bars and dependency creation via small orange handle.
  - Drag-to-pan: `_bindTimelinePanning()` adds left-drag on empty timeline area; sync vertical scroll between timeline and sidebar in `_bindScrollSync()`.
- Helpers:
  - `buildScale(start, end, scale)` — computes day/week/month units; day units mark weekends.
  - `unitIndex(date)` — map a date to its scale bucket.
  - `range(tasks)` — infer min/max dates from tasks and subtasks, ensuring minimum span.
  - `taskProgress`, `projectColor`, `userName` — formatting and metadata.
  - `_depPathBetweenRects` — router that computes a polyline with rounded corners between source/target (bars/milestones), preferring gaps between bars and using stagger lanes.
  - `_createsCycle(sourceId, targetId)` — DFS on the dependency graph to block cyclic edges.

### Other modules
- `supabaseAdapter.js`: Runtime adapter for Supabase persistence (if present), plus (optional) realtime helpers.
- `ui/toast.js`: Notification toasts with optional undo actions used in dependency deletion.
- `kanbanEnhancements.js`: UX improvements for Kanban rendering and interactions.

## Gantt: behaviors and internals

- Scales and weekends:
  - Day: header cells marked weekend, and an underlay of vertical stripes for Saturday/Sunday.
  - Week/Month: conventional labels (`S{weekNumber}`, `Mon 'YY`).
- Bars and subtasks:
  - Parent task bars include progress fill and handles for resizing; move by dragging the bar.
  - Subtasks render as their own thin bars on child rows (lighter tint of parent color).
  - Milestones render as rotated diamonds; still support dependency handles.
- Dependencies:
  - Create by dragging the small orange handle at the right of a bar/milestone to a target bar.
  - Paths are routed with quadratic corners and lane staggering to avoid collisions.
  - Delete via click → confirm dialog (with undo toast).
  - Blocking cycles: adding `A → B` is prevented if it would create a cycle.
- Panels:
  - Task and Subtask panels are draggable, have backdrops, and include Escape/off-click close.
  - Subtasks are edited in their dedicated panel; the task panel only keeps an add-subtask row.
- Navigation & panning:
  - Dragging on empty timeline pans horizontally/vertically. The left sidebar and header stay aligned.

## Time Tracking: Timer + Pomodoro

- Simple Timer: start/stop buttons with a HH:MM:SS display. Auto-stops if you leave the Time Tracking page.
- Today summary and recent entries show aggregated and latest entries from `data.timeEntries`.
- Focus Sessions (Pomodoro):
  - Configurable durations (focus/short/long), long break after N cycles, auto-continue toggle.
  - Optionally assign a session to a task; completed focus phases log a time entry (duration = focus minutes) to `data.timeEntries` and refresh UI.
  - Controls: Start, Pause/Continue, Skip (complete current phase), Reset.

## Notes: OneNote-like + Supabase

- Sections & Pages with editor: bold/italic/underline, lists, blocks (H1/H2/P), link insert, clear formatting.
- Templates selector and actions: duplicate page, export HTML.
- Optional Supabase persistence for notes; schema provided in `supabase_notes_schema.sql`:
  - `notes_sections` with optional `project_id` FK, and `notes_pages` linked to sections.
  - `set_updated_at` trigger for both tables.
  - RLS enabled with permissive policies for personal/anon usage (tighten for multi-user).

## Reports & analytics

- Multiple charts powered by Chart.js: project progress, team productivity, tasks status distribution, overdue by project, workload by assignee, throughput, and an Aging WIP table.
- Filters: project, user, date range with a reset and CSV export.

## Styling & theming

- A design system with tokens (colors, radii, spacing, typography) and components.
- Light/Dark theme toggle stored in LocalStorage.
- Gantt-specific classes for bars, handles, weekend layers, and dependency overlays.

## Localization (i18n)

- Inline dictionary in `app.js` for common labels.
- Use `this.t(key)` for text lookups; language selector in header switches locales (EN/RO in UI).

## Accessibility & UX details

- Panels and modals respect Escape/off-click closing.
- Draggable panels have clamped boundaries to remain within viewport.
- Tooltips on bars provide start/end/progress/assignee.
- Keyboard: quick create menu, basic navigation, and search inputs.

## Extending and customizing

- Persistence: replicate the Notes Supabase pattern to persist projects/tasks/users/timeEntries.
- Gantt: add more dependency types, auto-critical-path, or resource leveling.
- Pomodoro: add desktop notifications/sounds, presets, weekly stats, or cloud sync for time entries.
- Notes: add tags, page ordering, and cross-linking.
- Reports: extend chart datasets and define custom KPIs.

## Known limitations & troubleshooting

- Opening `index.html` by file path works, but some browsers limit local font/asset loading — prefer a simple static server.
- Gantt render is deferred if the timeline container width is 0 (e.g., hidden tab). It will auto-retry shortly.
- Dependency arrows rely on DOM layout; extreme zoom/scales or transforms may affect hit-testing. Fallback strategies are in place (elementsFromPoint, rect checks).
- Notes RLS policies in the provided SQL are permissive for personal use; restrict before multi-user.

---

If you want a deeper, function-by-function tour with inline references, we can generate a Developer Guide per module (app.js, gantt.js) that enumerates all public and internal methods with call graphs and data flows. Let me know and I’ll add it to `docs/`.
