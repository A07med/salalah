# Playful Arabic Game UI — Design System Reference

Supplement for the `playful-arabic-game-ui` skill. Use these patterns in `app/globals.css`, Tailwind classes, and `components/ui/` / `components/game/`.

---

## Shared utilities

Add to `app/globals.css`:

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

.game-surface {
  background: var(--game-surface);
  border: var(--game-border);
  border-radius: var(--game-radius);
  box-shadow: var(--game-shadow);
}

.game-ink-text {
  color: var(--game-ink);
}

@media (prefers-reduced-motion: reduce) {
  .game-btn-primary,
  .game-sticker-pop,
  .game-shake {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 1. Dark title banner

Cream text on dark brown, slight counter-clockwise tilt.

```tsx
<div
  className="inline-block rotate-[-1.5deg] rounded-[20px] border-[5px] border-[var(--game-ink)] bg-[var(--game-ink)] px-6 py-3 shadow-[6px_7px_0_rgba(45,28,21,0.35)]"
  role="banner"
>
  <p className="font-display text-lg font-extrabold tracking-wide text-[var(--game-bg)]">
    #خلاـ_الخريف
  </p>
</div>
```

---

## 2. Large red Arabic headline

Hard offset shadow — no blur.

```tsx
<h1
  className="font-display text-[2.5rem] font-extrabold leading-[1.1] text-[var(--game-red)] sm:text-5xl"
  style={{ textShadow: "4px 5px 0 var(--game-ink)" }}
>
  تحدي مشلي
  <br />
  الخريف
</h1>
```

---

## 3. Sticker-style hero object

Wrap existing `CoconutIllustration` or SVG assets.

```tsx
<div className="relative rotate-[2deg]">
  <CoconutIllustration
    cutProgress={35}
    idPrefix="hero"
    className="h-44 w-40 drop-shadow-none"
    style={{
      filter: "drop-shadow(6px 8px 0 var(--game-ink))",
    }}
  />
</div>
```

Illustration rules:
- Thick ink strokes (`stroke-width: 4–6`)
- Flat fills, no photorealistic gradients
- Slight random rotation per sticker (`-3deg` to `3deg`)

---

## 4. White input

```tsx
<input
  type="text"
  dir="rtl"
  placeholder="اسم اللاعب"
  className="w-full min-h-12 rounded-[22px] border-[5px] border-[var(--game-ink)] bg-[var(--game-surface)] px-5 text-lg font-medium text-[var(--game-ink)] shadow-[6px_7px_0_var(--game-ink)] placeholder:text-[var(--game-muted)] focus:outline-none focus:ring-4 focus:ring-[var(--game-red)]/25"
/>
```

---

## 5. Red primary CTA

Replace or extend `components/ui/Button.tsx` `primary` variant.

```css
.game-btn-primary {
  background: var(--game-red);
  color: var(--game-surface);
  border: var(--game-border);
  border-radius: var(--game-radius);
  box-shadow: var(--game-shadow);
  font-family: var(--font-changa), var(--font-tajawal), sans-serif;
  font-weight: 800;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.game-btn-primary:hover:not(:disabled) {
  background: var(--game-red-dark);
}

.game-btn-primary:active:not(:disabled) {
  transform: translate(4px, 5px);
  box-shadow: 2px 2px 0 var(--game-ink);
}
```

```tsx
<button type="button" className="game-btn-primary w-full max-w-xs px-8 py-4 text-xl">
  ابدأ اللعب
</button>
```

Secondary: white surface + ink border. Ghost: ink text only, no blur.

---

## 6. White card / leaderboard panel

Extend `components/ui/Card.tsx`:

```tsx
<div className="game-surface rounded-[22px] p-5">
  <h2 className="font-display text-xl font-extrabold text-[var(--game-ink)]">
    أفضل النتائج
  </h2>
  <ol className="mt-3 space-y-2">
    {entries.map((entry, i) => (
      <li
        key={entry.id}
        className="flex items-center justify-between rounded-2xl border-[4px] border-[var(--game-ink)] bg-[var(--game-bg)] px-4 py-2"
      >
        <span className="font-display text-lg font-bold text-[var(--game-red)]">
          {i + 1}
        </span>
        <span className="font-medium text-[var(--game-ink)]">{entry.name}</span>
        <span className="font-display font-extrabold tabular-nums text-[var(--game-ink)]">
          {entry.score}
        </span>
      </li>
    ))}
  </ol>
</div>
```

Modal overlay: semi-opaque cream or ink (`bg-[var(--game-ink)]/70`) — **no** `backdrop-blur`.

---

## 7. Edge decorations

Partially clipped stickers at viewport edges.

```tsx
<div className="pointer-events-none absolute -start-6 top-24 z-0 rotate-[-8deg] opacity-90">
  <img src="/illustrations/palm-leaf.svg" alt="" className="h-28 w-28" aria-hidden />
</div>
<div className="pointer-events-none absolute -end-4 bottom-32 z-0 rotate-[6deg]">
  <img src="/illustrations/coconut-half.svg" alt="" className="h-24 w-24" aria-hidden />
</div>
```

Use `pointer-events-none` and `aria-hidden` on decorative assets.

---

## 8. Game HUD

Compact neo-brutalist badges — evolve `ScoreBoard`, `LevelBadge`, `MissCounter`, `CutProgress`.

```tsx
{/* Score */}
<div className="game-surface min-w-[5rem] rounded-2xl px-3 py-1.5 text-center">
  <p className="text-xs font-bold text-[var(--game-muted)]">النقاط</p>
  <p className="font-display text-2xl font-extrabold tabular-nums leading-tight text-[var(--game-red)]">
    {score}
  </p>
</div>

{/* Level */}
<div className="game-surface rounded-full px-4 py-1">
  <span className="font-display text-sm font-bold text-[var(--game-ink)]">
    المستوى {level}
  </span>
</div>

{/* Mistakes — use red accent when low */}
<div className="game-surface rounded-2xl px-3 py-1.5">
  <p className="text-xs font-bold text-[var(--game-muted)]">أخطاء</p>
  <p className="font-display text-lg font-extrabold text-[var(--game-red)]">
    {misses}/{maxMisses}
  </p>
</div>

{/* Cut progress bar */}
<div className="h-4 w-full overflow-hidden rounded-full border-[4px] border-[var(--game-ink)] bg-[var(--game-surface)]">
  <div
    className="h-full bg-[var(--game-red)] transition-[width] duration-200 ease-out"
    style={{ width: `${progress}%` }}
  />
</div>
```

HUD layout: top safe-area row, `gap-3`, `px-4`, never shrink below readable sizes.

---

## Motion snippets

```css
@keyframes game-sticker-pop {
  0% { transform: scale(0.85) rotate(-2deg); opacity: 0; }
  70% { transform: scale(1.04) rotate(1deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes game-success-bounce {
  0%, 100% { transform: scale(1); }
  40% { transform: scale(1.08); }
  70% { transform: scale(0.97); }
}

.game-sticker-pop {
  animation: game-sticker-pop 220ms cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.game-success-bounce {
  animation: game-success-bounce 260ms ease-out;
}

/* Reuse existing .animate-screen-shake for errors — keep ~280ms */
```

Framer Motion (modals / level complete):

```tsx
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.22, ease: [0.34, 1.4, 0.64, 1] }}
  className="game-surface"
>
  {children}
</motion.div>
```

---

## Accessibility checklist

| Check | Target |
|-------|--------|
| Touch targets | ≥ 44×44px |
| Contrast | Cream on ink ≥ 7:1; red on white ≥ 4.5:1 |
| Focus | Visible `ring` on interactive elements |
| Motion | Honor `prefers-reduced-motion` |
| RTL | `dir="rtl"`, logical spacing, Arabic numerals as designed |
| Decorations | `aria-hidden`, no essential info in images alone |

---

## Tailwind @theme mapping (optional)

```css
@theme inline {
  --color-game-bg: var(--game-bg);
  --color-game-surface: var(--game-surface);
  --color-game-red: var(--game-red);
  --color-game-red-dark: var(--game-red-dark);
  --color-game-ink: var(--game-ink);
  --color-game-muted: var(--game-muted);
}
```

Then use `bg-game-bg`, `text-game-ink`, `border-game-ink`, etc.
