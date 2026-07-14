# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) then production build
- `npx tsc -b` — typecheck only
- `npm run lint` — run oxlint
- `npm run preview` — serve the production build locally

There is no test suite configured in this project.

## Architecture

ThesisTrack is a single-page React + TypeScript app (Vite, no backend, no router). It helps a student plan a thesis, track progress against milestones, and persist that plan entirely client-side.

**State lives in one place**: `App.tsx` owns the single `ThesisPlan | null` state object and an `activeView: ViewId` ('overview' | 'plan' | 'progress' | 'gantt'). All mutation flows through a single `updatePlan(updater)` callback passed down to the editing views, which also bumps `updatedAt`. There is no global store — every other component is presentational and receives `plan` (and `onChange` where it edits) as props.

**Data model** (`src/types.ts`): `ThesisPlan` → `meta` (title, student, advisor, dates) + `milestones: Milestone[]`. Each `Milestone` has planned start/end dates, an optional `completedAt`, a `tasks: ThesisTask[]` checklist, and a `log: ProgressEntry[]` of dated notes. Milestone/task completion is derived, not stored as a flat status — see `src/lib/progress.ts`: `milestoneProgress()` computes % from task completion (or `completedAt`), and `milestoneStatus()` derives todo/in-progress/done from that %. Anything computing "is this done/overdue" should go through these helpers rather than checking `completedAt` directly, so task-based and manually-marked completion stay consistent (see `src/lib/date.ts`'s `isOverdue()`, which takes a `done: boolean` for this reason).

**Persistence** (`src/lib/storage.ts`): no backend — the plan round-trips through browser `localStorage` (autosaved on every change, used to restore on reload) and through explicit user-facing save/load of a `.json` file (`downloadPlan()` / `readPlanFile()`). `validatePlan()` is the single point that sanitizes/defaults an arbitrary parsed JSON blob into a well-formed `ThesisPlan` — any loaded file (or corrupted localStorage entry) passes through it. `App.tsx` tracks a `lastSavedSnapshot` ref (JSON string) to detect unsaved changes for the beforeunload warning and the New/Close confirm dialogs.

**Views** (`src/components/`), swapped by tab in `Header.tsx` / `App.tsx`:
- `Overview.tsx` — read-only summary: progress ring, stat row, milestone timeline.
- `PlanEditor.tsx` — structural editing: meta fields, add/edit/delete milestones and tasks (no status editing here).
- `ProgressTracker.tsx` — status editing: check off tasks, mark a milestone complete, add dated log entries.
- `GanttChart.tsx` — visual timeline, backed by `src/lib/gantt.ts` (`computeGanttRange()` scales the chart from plan start to target date, extending if milestones overrun it; `percentForIso()`/`monthTicks()` convert dates to horizontal %). Task ticks inside each bar are evenly spaced by index, not by date — tasks have no dates of their own.

**Design system**: all styling is hand-written CSS (no Tailwind/UI kit) — `src/index.css` holds the design tokens (CSS custom properties for the parchment/ink/rust palette) and generic primitives (buttons, inputs, cards, stamps); `src/App.css` holds layout and per-view styles. Typography pairs Fraunces (serif, headings/emphasis) with IBM Plex Mono (UI chrome, labels, dates), loaded via Google Fonts in `index.html`.
