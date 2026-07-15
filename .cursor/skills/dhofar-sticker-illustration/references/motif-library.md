# Dhofar Sticker Motif Library

Reference for `dhofar-sticker-illustration`. Use when choosing which stickers belong on a given screen and how to draw them consistently.

---

## Khareef-strong motifs (seasonal, use freely in this game)

These read immediately as **Khareef Salalah** — mist, green mountains, drizzle, coconuts, and palms.

### Coconut (whole)

- **Meaning:** Mishli / local coconut harvest; the game's core interactive object.
- **Draw:** Asymmetric husk (`#7A4B30`), fibre strokes in ink, small green stem (`#527A59`), optional cut stages.
- **Use:** Hero centre, HUD thumbnail, modals. One hero per screen.

### Coconut half

- **Meaning:** Cut reward, exposed flesh after a successful slash.
- **Draw:** Dome husk + cream flesh (`#FFF8E7` / `#E8C9A0`), 4px ink outline.
- **Use:** Edge decoration, particle substitute, score pop accent. Not alongside full hero at same scale.

### Palm leaf and connected stem

- **Meaning:** Coconut grove canopy; ties the hanging fruit to its tree.
- **Draw:** Single compound leaf or frond (`#527A59`), central stem to ink line; vein lines ink at 2px, 50% opacity.
- **Use:** Top canopy strip, edge clip, stem above hero coconut. Max 2 fronds per viewport edge.

### Mist-covered green mountains

- **Meaning:** Dhofar's khareef-transformed escarpments — Jabal Qamar / Salalah hills.
- **Draw:** Layered silhouettes: near `#315541`, far `#527A59` at 70% opacity; mist bands `#B9D3CF` as flat horizontal caps.
- **Use:** Background layers behind gameplay; never in front of interactive targets.

### Light drizzle and fog layers

- **Meaning:** Monsoon mist and fine rain — defining Khareef atmosphere.
- **Draw:** Short diagonal ink dashes (drizzle) or 2–3 soft-edge **flat** fog rectangles (no blur filter — use opacity).
- **Use:** `pointer-events-none` overlays; low contrast so UI stays readable.

### Wadi Darbat-inspired waterfall

- **Meaning:** Salalah's iconic seasonal wadi and falls — celebration / level-complete energy.
- **Draw:** Simple cliff ink outline, white/cream water strip, `#B9D3CF` spray dots; keep iconic not geographic.
- **Use:** Level-complete modal, achievement card. **Not** on start screen and HUD simultaneously.

---

## Broader Dhofari cultural accents (use sparingly)

These are **Omani Dhofar**, not exclusively Khareef. They add regional identity but can clutter a fruit-cutting mini-game if overused.

### Frankincense branch, tree, and resin

- **Meaning:** Dhofar's frankincense heritage (Boswellia).
- **Draw:** Angular branch, few teardrop leaves (`#527A59`), resin nuggets `#7A4B30` with ink highlight dot.
- **Use:** Travel stamp corners, badge borders. Max 1 frankincense element per screen.

### Travel stamp and Khareef badge

- **Meaning:** Playful event branding (`#خلاـ_الخريف`), souvenir / festival feel.
- **Draw:** Rounded rect or circle, perforated edge (dashed ink), centred Arabic or icon; red accent allowed.
- **Use:** Event banner, footer badge. One stamp motif per screen.

### Camel, bird, and mountain road (optional accents)

- **Meaning:** Dhofar travel imagery — caravans, khareef visitors, mountain routes.
- **Draw:** Minimal silhouette stickers; same ink weight as other assets.
- **Use:** **Edge decoration only**, partially off-canvas. At most **one** accent species per screen.

---

## Screen placement limits

**Do not place every motif on one screen.** Visual noise breaks the neo-brutalist hierarchy.

| Screen type | Recommended stickers | Avoid |
|-------------|---------------------|-------|
| Start | Hero coconut, 2–3 edge accents (leaf, half, tool) | Mountains, waterfall, camel, frankincense tree together |
| Gameplay HUD | Mountains + drizzle/fog only (background) | Stamps, resin, birds over play area |
| Level complete | Waterfall or stamp + small coconut half | Full hero + waterfall + stamp + camel |
| Game over | Muted coconut (grayscale optional) | Atmospheric layers competing with score |

**Rule of thumb:** 1 hero object + up to 3 decorative edge stickers + background atmosphere layer.

---

## Palette quick reference

```
Paper         #FFF8E7
Khareef green #527A59
Mountain green #315541
Mist blue     #B9D3CF
Coconut brown #7A4B30
Action red    #EF3340
Ink           #2D1C15
```

---

## SVG construction checklist

| Check | Target |
|-------|--------|
| Main outline | 4–6px ink |
| Detail lines | 2–3px ink |
| Gradients | None on stickers |
| Shadow | Solid offset or flat ellipse |
| viewBox | Tight; no empty 20% margins |
| Decorative | `aria-hidden` + `pointer-events-none` on wrapper |
| Meaningful alone | `<title>` in SVG |

---

## Anti-patterns

- Palm trees that look like Caribbean resort clip art
- Photographic mountain textures
- Rain as blue gradient sheets
- Frankincense + coconut grove + waterfall + camel in one 390px-wide frame
- Mixing `CoconutIllustration` gradient husk with new flat sticker on the same object
