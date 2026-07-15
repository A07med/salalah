---
name: playful-arabic-game-ui
description: >-
  Guides playful Arabic neo-brutalist game UI design for Salala (تحدي مشلي الخريف):
  cream paper backgrounds, thick ink outlines, red CTAs, sticker illustrations,
  RTL mobile-first layouts, and hard offset shadows. Use when designing or
  modifying this game's interface, Arabic game UI, neo-brutalist styling, visual
  redesigns, HUD/screens/modals, or when the user references the visual reference
  screenshot for this project.
---

# Playful Arabic Game UI

**Style:** Playful Arabic neo-brutalist game UI with hand-drawn sticker/comic illustrations.

## Project context

| Area | Location |
|------|----------|
| Global styles / tokens | `app/globals.css` |
| Fonts (Changa + Tajawal) | `app/layout.tsx` (`lang="ar"` `dir="rtl"`) |
| Shared UI | `components/ui/` (`Button`, `Card`, `Modal`) |
| Game UI | `components/game/` |
| Shell | `components/layout/GameShell.tsx` |
| Engine / logic | `lib/game/`, `lib/hooks/useGameEngine.ts` |

**Stack:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion.

**Preserve:** collision, scoring, difficulty, storage, and game state — change presentation only unless the user explicitly requests mechanic changes.

## Visual system

- Mobile-first Arabic RTL layouts
- Warm cream paper-like backgrounds
- Very subtle diagonal grid texture
- Strong red as the main action colour
- Very dark brown instead of pure black
- Thick `4–6px` outlines
- Solid offset shadows with no blur
- Large expressive Arabic display typography
- Chunky rounded buttons and input fields
- Hand-drawn food, tool, and game illustrations
- Slightly playful rotations and imperfect placement
- Clear hierarchy and generous spacing

### Design tokens (starting points)

Add or extend in `app/globals.css` — adjust after comparing with the visual reference:

```css
:root {
  --game-bg: #fff8e7;
  --game-surface: #ffffff;
  --game-red: #ef3340;
  --game-red-dark: #c92130;
  --game-ink: #2d1c15;
  --game-muted: #a9afba;
  --game-border: 5px solid var(--game-ink);
  --game-shadow: 8px 9px 0 var(--game-ink);
  --game-radius: 22px;
}
```

Map into Tailwind `@theme inline` when useful. Legacy `--khareef-*` tokens may coexist during migration — prefer `--game-*` for new UI surfaces.

### Typography

- **Display / titles:** `font-display` → Changa (`600`–`800`). Heavy only — no thin weights.
- **Body / labels:** `font-sans` → Tajawal (`400`–`800`).
- Correct Arabic punctuation, RTL alignment, and logical properties (`ms-`/`me-`, `start`/`end`).
- Minimum body size on mobile: `16px`; HUD labels ≥ `12px`.

## Component patterns

Reuse and extend existing components before creating new ones. Full CSS/React examples: [references/design-system.md](references/design-system.md).

1. **Dark title banner** — cream text, subtle rotation (`-1deg` to `-2deg`), thick border.
2. **Red Arabic headline** — Changa extrabold, hard dark offset shadow (no blur).
3. **Sticker hero** — illustrated coconut/tools with drop shadow + slight rotation; prefer SVG over CSS gradients.
4. **White input** — thick dark outline, muted placeholder, large touch target (`min-h-12`).
5. **Red primary CTA** — thick outline, solid bottom shadow, press-into-shadow interaction.
6. **White card / leaderboard panel** — same border + shadow treatment as inputs.
7. **Edge decorations** — small illustrations partially clipped at viewport edges.
8. **Game HUD** — score, level, mistakes, progress; compact badges with ink border, no glass/blur.

## Background pattern

Use lightweight CSS gradients — not a large background image:

```css
.game-paper-bg {
  background-color: var(--game-bg);
  background-image:
    repeating-linear-gradient(
      -12deg,
      transparent,
      transparent 23px,
      rgba(45, 28, 21, 0.04) 23px,
      rgba(45, 28, 21, 0.04) 24px
    );
}
```

Keep the grid subtle; it must not compete with text.

## Motion

Polished casual mobile game feel. Duration: `120ms`–`300ms`. Respect `prefers-reduced-motion`.

| Interaction | Motion |
|-------------|--------|
| Button press | Translate into shadow (`translateY` ~4px), shadow shrinks |
| Success | Small bounce or squash-and-stretch |
| Error | Short shake (reuse/adapt `screen-shake` in `globals.css`) |
| Stickers / modals | Pop-in scale from `0.85` |
| Slash / cut | Responsive trail feedback — keep gameplay-responsive |

**Avoid:** slow floating loops, glassmorphism, glow, corporate SaaS easing.

## Do not use

- Generic AI-generated landing-page styling
- Glassmorphism or `backdrop-blur` on game panels
- Blurred shadows (`blur`, soft `drop-shadow`)
- Purple or blue gradients
- Thin grey borders (`border border-gray-200`)
- Excessive pill shapes everywhere
- Corporate dashboard cards
- Photorealistic assets mixed with cartoon illustrations
- Random emojis as primary artwork
- Tiny Arabic text
- Desktop-first layouts
- Changing core game mechanics unnecessarily

## Workflow

When this skill applies, follow this order:

```
Task Progress:
- [ ] 1. Inspect framework, styles, fonts, and existing components
- [ ] 2. Identify reusable components (Button, Card, Modal, HUD pieces)
- [ ] 3. Preserve game logic in lib/game and hooks
- [ ] 4. Establish shared --game-* tokens in globals.css
- [ ] 5. Build or update components using patterns above
- [ ] 6. Use SVG / transparent illustration assets when available
- [ ] 7. Check mobile (320–430px) and desktop widths
- [ ] 8. Verify RTL, contrast, touch targets (≥44px), focus states
- [ ] 9. Compare visually against the reference screenshot
- [ ] 10. Run npm run lint and npm run build
```

### Migration notes

Current UI uses a Khareef green/rain theme (`KhareefBackground`, `arcade-btn`, `game-badge`). When redesigning:

- Replace atmospheric layers incrementally; do not break `GameStage` pointer events.
- Swap `Button` variants to neo-brutalist red primary while keeping the same props API.
- Retain `CoconutIllustration` SVG structure; restyle strokes/fills to match ink outlines.
- Update `themeColor` in `app/layout.tsx` to match `--game-bg` or `--game-ink`.

## Reference

- Component examples and code snippets: [references/design-system.md](references/design-system.md)
- Compare implementation against the project's visual reference screenshot before marking UI work complete.
