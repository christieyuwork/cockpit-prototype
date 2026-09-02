# Cockpit Prototype

Interactive UI prototype for FIFA tournament **Project Cockpits** — modular dashboards, issues tracking, admin configuration, and corporate executive reporting. Built for design/product exploration; data is seeded and client-side only.

## Stack

- React 18 + TypeScript
- Vite
- ECharts (charts)

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

| Script | Description |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |

## Cockpits

Switch profiles from the **avatar menu → Switch profile**:

| Profile | Focus |
| --- | --- |
| **World Cup 2026** | Default cockpit — home modules, exec brief, custom views |
| **Women’s World Cup 2027** | WWC theme, Issues page |
| **FIFA Corporate** | Executive Reporting only (no sidebar) |
| Youth Tournament 2026 | Archived / hidden by default |

Admin Center (where available on a profile card) configures that cockpit’s general settings, top-bar pages, and sidebar items.

## Phase 3 & 4 features

This prototype is currently at **phases 3–4**. Entry points and what to try:

### Chatbot (Query)

- **Entry:** Top bar **communications (chat) icon** → panel tab **Query**
- Ask seeded scenario prompts (risk, flights, issues, matchday, SOP, etc.) or pick from suggestions
- Responses include step evidence, action links, and AI widget cards you can **star** into Starred

### Notifications & starred items

- **Entry:** Same top bar **communications icon**
- **Recent** — feed of matches, issues, documents, arrivals, press; expand a card for detail widgets; filter chips (All / Matches / Issues / Documents)
- **Starred** — saved items + AI widgets; star/unstar from cards or from Query widget cards; filters by type (Issues, Matches, Reports, AI widgets)

### Modularization

- **Entry:** Open any **module-grid** view (e.g. Home / Exec Brief on WC26 or WWC) — not Issues or Executive Reporting full-page layouts
- Canvas **configure (filters) icon** → edit layout mode: drag/resize modules, **Add module**, per-module configure menu
- View **settings** for title/visibility; create additional custom views from the top-bar page flow where available

### Multi-tournament platform

- **Entry:** Avatar → **Switch profile** to move between WC26, WWC, Corporate (and Youth when visible)
- **View all** on that menu opens Admin → **All cockpits**: visibility, status, order, and create cockpit
- Per-cockpit **Admin center** (on profiles that have it) for pages, sidebar, and general settings

### Executive reporting

- **Entry:** Avatar → Switch profile → **FIFA Corporate** (opens Executive Reporting; no sidebar)
- **Active** — know-window groups (today / tomorrow / this week / beyond), sortable Urgency & Know headers, smart search, category chips (owner / FA / tag / upstream)
- **Triage** — upstream candidates: add to tracker or dismiss; dismissed can return to triage
- **Archive** — archived topics
- **Add to tracker** intake — EA card + issue fields; **Save as draft** or submit; drafts listed on Active to continue/delete

## Project layout

```
src/
  components/   # UI surfaces (pages, widgets, admin, reporting)
  data/         # Seed models, cockpit settings, view definitions
  App.tsx       # Shell, profile routing, view sync
```

## Notes

- Prototype only: no backend, auth, or persistence across reloads beyond in-memory state.
- Assets live under `public/assets/`.
