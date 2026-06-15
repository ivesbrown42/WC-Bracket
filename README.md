# 🏆 Sticker Cup '26

A playful, mobile-first web app for picking your **2026 FIFA World Cup** bracket
(full 48-team format) and sharing it with friends — in a retro sticker-album /
Panini visual style.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build
npm run test     # unit tests (Vitest)
npm run preview  # serve the production build
```

## What's inside

| Area | Where |
| --- | --- |
| **Design tokens** (single source of truth) | `src/design/tokens/` → flattened to CSS vars by `src/design/buildCssVars.ts` |
| **UI primitives** | `src/components/ui/` (StickerCard, TeamSticker, Button, Badge, Chip, ProgressBar, Confetti, Flag) |
| **Bracket components** | `src/components/bracket/` (GroupCard, MatchCard) |
| **Tournament data** | `src/data/worldCup2026.ts` — 48 teams, 12 groups, knockout template |
| **Bracket logic** (pure, tested) | `src/data/bracketLogic.ts` + `bracketLogic.test.ts` |
| **State + persistence** | `src/store/` — Zustand store with a swappable `StorageAdapter` |
| **Screens** | `src/screens/` (Home, Groups, Bracket, Summary, StyleGuide) |
| **Living style guide** | visit `/style-guide` |

## How the bracket works

1. **Group stage** (`/groups`) — rank each of the 12 groups (tap teams 1→4).
2. **Best thirds** — choose which 8 of the 12 third-placed teams advance.
3. **Knockout** (`/bracket`) — the 32-team bracket auto-seeds from your picks;
   tap winners through to a champion 🎉.
4. **Share** (`/summary`) — champion card + "road to glory", copy a share link
   or download an image. Open a friend's link at `/share#…`.

## Design decisions & deferred work

- **Design system is code-first.** Tokens live in `src/design/tokens/` and are
  shaped to export to **Figma (Tokens Studio)** later — that pipeline is a
  follow-up, not built yet.
- **Storage is swappable.** v1 persists to the browser (`localStorageAdapter`).
  `remoteAdapter.ts` marks the seam for real **accounts + a live leaderboard**
  (e.g. Supabase) — designed-for, not built.
- **Tournament data is illustrative.** The exact 2026 draw wasn't confirmed when
  this was built, so group assignments in `worldCup2026.ts` are a plausible
  seeding (with flagged placeholders). It's the single place to correct them.
- **R32 third-place slotting is simplified** — a valid, balanced bracket rather
  than FIFA's official third-place lookup table. Easy to layer in later.

_Made for fun · not affiliated with FIFA._

---

Built with Vite + React + TypeScript, Zustand, Framer Motion, and React Router.
