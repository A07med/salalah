---
name: visual-ui-qa
description: >-
  Visually verifies responsive UI through rendered screenshots and iterative
  comparison against reference images. Use when checking UI polish, responsive
  layouts, start screens, visual redesigns, reference screenshot matching, RTL
  alignment, mobile overflow, touch targets, or before marking UI work complete.
---

# Visual UI QA

**Purpose:** Prove the implementation matches the intended design — not just that it compiles.

Use alongside `playful-arabic-game-ui` and `dhofar-sticker-illustration` when illustrations or game screens change.

## When to run

- User supplies a reference screenshot or mockup
- After start screen, HUD, or modal redesign
- Before closing any UI task that claims "matches the reference"
- After a correction pass from visual review

## Tools (in order of preference)

1. **Cursor Browser or Design Mode** — when available; inspect live layout and RTL.
2. **Playwright CLI** — project has no Playwright dependency; use ephemeral CLI:
   ```bash
   npx playwright screenshot --wait-for-timeout=1500 \
     --viewport-size=390,844 http://localhost:3000/ .cursor/qa-390.png
   ```
3. **Production build preview** — `npm run build && npm run start` for stable screenshots (dev HMR can shift layout).

Do **not** add Playwright to `package.json` unless the user requests persistent E2E tests.

## Standard viewports

| Name | Size | Role |
|------|------|------|
| Mobile narrow | `390×844` | iPhone-class; primary QA |
| Mobile tall | `430×932` | Large phone; spacing stress |
| Desktop | `1280×800` | Two-column / wide layout |

Save captures under `.cursor/` with clear names: `qa-390.png`, `qa-430.png`, `qa-desktop.png`.

## Workflow

Copy this checklist and complete every step:

```
Visual QA Progress:
- [ ] 1. Run the application (dev or production)
- [ ] 2. Capture screenshots at 390×844, 430×932, and 1280×800
- [ ] 3. Compare implementation with supplied reference
- [ ] 4. Review composition, hierarchy, spacing, typography, illustrations, colour, shadows, RTL, clipping, unused space
- [ ] 5. Check horizontal overflow and mobile touch targets (≥44px)
- [ ] 6. Apply at least one correction pass if meaningful differences remain
- [ ] 7. Re-capture screenshots after corrections
- [ ] 8. Run TypeScript, lint, and production build
- [ ] 9. Report remaining visual differences honestly
```

### Step 1 — Run the app

```bash
npm run dev
# or for stable captures:
npm run build && npm run start -- -p 3005
```

Note the active port if 3000 is busy.

### Step 2 — Capture screenshots

```bash
PORT=3000  # adjust
npx playwright screenshot --wait-for-timeout=1500 --viewport-size=390,844 \
  http://localhost:$PORT/ .cursor/qa-390.png
npx playwright screenshot --wait-for-timeout=1500 --viewport-size=430,932 \
  http://localhost:$PORT/ .cursor/qa-430.png
npx playwright screenshot --wait-for-timeout=1500 --viewport-size=1280,800 \
  http://localhost:$PORT/ .cursor/qa-desktop.png
```

If Playwright browsers are missing: `npx playwright install chromium` (one-time).

Wait for hydration — Framer Motion `opacity: 0` initial states can produce false failures on instant capture.

### Step 3–4 — Compare with reference

Open reference and captures side by side. Score each area:

| Area | Questions |
|------|-----------|
| **Composition** | Is the hero centred? Correct visual weight top → bottom? |
| **Hierarchy** | Banner → headline → hero → CTA order clear? |
| **Spacing** | Consistent gaps? Cramped or floating sections? |
| **Typography** | Changa display + Tajawal body? Sizes ≥ 16px body? |
| **Illustrations** | Sticker style consistent? Correct scale vs reference? |
| **Colour** | Cream paper, ink outlines, red CTA — no stray greens/glass? |
| **Shadows** | Hard offset shadows only — no blur? |
| **RTL** | Text aligns start; logical `ms`/`me`; numerals readable |
| **Clipping** | Arabic headlines or badges cut off at edges? |
| **Unused space** | Awkward voids on desktop? Content hugging wrong edge? |

### Step 5 — Overflow and touch targets

In browser or via script, confirm:

- `document.documentElement.scrollWidth <= clientWidth + 1` at 390px
- Primary buttons and inputs ≥ `44×44px` clickable area
- No essential content only reachable by horizontal scroll

### Step 6–7 — Correction pass

If differences are **meaningful** (wrong colours, missing headline, broken RTL, illustration style mismatch):

1. Fix the highest-impact issue first (hierarchy > micro-spacing).
2. Re-run captures at all three viewports.
3. Repeat once more only if the reference still clearly diverges.

Skip correction passes for subjective 2–4px spacing unless the user asked for pixel-perfect match.

### Step 8 — Build validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Lint warnings in untouched gameplay files do not block UI QA if modified files are clean.

### Step 9 — Report

Use this template:

```markdown
## Visual QA Report

### Viewports checked
- 390×844 — [pass / issues]
- 430×932 — [pass / issues]
- 1280×800 — [pass / issues]

### Matches reference
- [bullet list]

### Remaining differences
- [honest list — do not claim pixel-perfect if not true]

### Technical checks
- TypeScript: [pass/fail]
- Lint: [pass/fail / notes]
- Build: [pass/fail]

### Screenshots
- .cursor/qa-390.png
- .cursor/qa-430.png
- .cursor/qa-desktop.png
```

## Common false positives

| Symptom | Likely cause |
|---------|----------------|
| Headline invisible | Framer Motion `initial={{ opacity: 0 }}` before hydration |
| Wrong port / blank page | Dev server on 3001+; update URL |
| Desktop single column | Breakpoint not hit; verify width ≥ 1024 (`lg:`) |
| Horizontal scroll | Fixed-width child wider than viewport; check `max-w` + `overflow-x-hidden` |

## Do not

- Mark UI complete from code review alone without screenshots
- Hide known reference mismatches in the report
- Add screenshot dependencies to the project without user approval
- Use browser automation to work around missing MCP when Cursor Browser is available
