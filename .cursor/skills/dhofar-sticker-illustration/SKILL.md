---
name: dhofar-sticker-illustration
description: >-
  Creates consistent hand-drawn SVG sticker illustrations for Khareef Dhofar and
  Salala game UI: coconuts, palm leaves, misty mountains, drizzle, Wadi Darbat
  waterfalls, frankincense, travel stamps, and neo-brutalist ink outlines. Use when
  adding or refining game illustrations, SVG assets, sticker decorations, Dhofar
  motifs, Khareef artwork, or coconut/palm/mountain/fog visual elements.
---

# Dhofar Sticker Illustration

**Style:** Hand-drawn SVG stickers for a playful Arabic neo-brutalist game — flat colour, thick ink outlines, slight imperfection, solid offset shadows.

Pair with `playful-arabic-game-ui` for layout and UI tokens. This skill governs **illustration assets only**.

## Project context

| Area | Location |
|------|----------|
| Existing coconut SVG | `components/game/CoconutIllustration.tsx` |
| Edge decoration stickers | `components/game/EdgeDecorations.tsx` |
| UI tokens / shadows | `app/globals.css` (`--game-*`) |
| Illustration output | `components/game/illustrations/` or inline in game components |

**Stack:** React SVG components, no raster hero assets for stickers.

## Colour palette

Use these consistently — do not invent parallel greens or browns:

| Token | Hex | Use |
|-------|-----|-----|
| Paper | `#FFF8E7` | Highlights, cut flesh, stamp paper |
| Khareef green | `#527A59` | Palm leaves, wet foliage, wadi banks |
| Mountain green | `#315541` | Dhofar hills, deep canopy shadow |
| Mist blue | `#B9D3CF` | Fog bands, drizzle, distant atmosphere |
| Coconut brown | `#7A4B30` | Husk, stem, wood accents |
| Action red | `#EF3340` | Slash hints, stamp accents, small badges |
| Ink | `#2D1C15` | All outlines, fibre lines, shadow blocks |

Lighter tints (`#A0714F`, `#E8C9A0`) are allowed only as flat highlight patches — no radial gradients on stickers.

## Drawing rules

1. **Outlines:** `stroke="#2D1C15"`, `strokeWidth` 4–6 on main silhouettes; 2–3 on interior detail.
2. **Fills:** Flat `fill` only. One optional soft highlight ellipse per object max.
3. **Contours:** Slightly asymmetric paths — avoid perfect circles/ellipses.
4. **Shadows:** Solid offset only — `filter: drop-shadow(6px 8px 0 #2D1C15)` or ink ellipse beneath; **no blur/glow**.
5. **Stroke consistency:** Same ink width family across all stickers on one screen.
6. **Rotation:** Per-sticker `-8deg` to `8deg` when placed as decoration.
7. **File size:** Prefer `<path>` over verbose point lists; share `viewBox`; omit unused `<defs>`; target &lt; 4 KB per small sticker, &lt; 8 KB for hero coconut.
8. **Accessibility:** `aria-hidden` on purely decorative stickers; `<title>` inside SVG when the image conveys meaning alone.

## Motif catalogue

Full cultural notes and screen-placement guidance: [references/motif-library.md](references/motif-library.md).

| Motif | Priority | Typical use |
|-------|----------|-------------|
| Coconut (whole) | Core | Hero, HUD, modals |
| Coconut half | Core | Edge decoration, cut feedback |
| Palm leaf + stem | Core | Canopy, edges, hanging stem |
| Misty mountains | Core | Background layers, start/game backdrop |
| Drizzle + fog | Core | Atmospheric strips, subtle motion |
| Wadi Darbat waterfall | Secondary | Level complete, scenic cards |
| Frankincense branch/tree/resin | Secondary | Stamp accents, reward stickers |
| Travel stamp / Khareef badge | Secondary | Event banner, achievements |
| Camel, bird, mountain road | Accent | Sparse edge decoration only |

## Component pattern

Create reusable React SVG components:

```tsx
interface StickerProps {
  className?: string;
  title?: string;
}

export function PalmLeafSticker({ className = "h-28 w-28", title }: StickerProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden={!title}>
      {title && <title>{title}</title>}
      {/* flat fills + ink stroke */}
    </svg>
  );
}
```

Extend `CoconutIllustration` via `variant="sticker"` before duplicating coconut paths.

## Do not use

- Photorealism, photo textures, or mesh gradients
- Emoji or icon-font substitutes for illustrations
- Generic tropical clip art (bright lime palms, cartoon suns)
- Mixed styles (outline stickers beside soft 3D renders)
- Blurred `drop-shadow`, `feGaussianBlur`, or glow filters
- Overloaded screens — max 3–4 decorative stickers visible at once
- Pure black (`#000`) — always ink brown `#2D1C15`

## Workflow

```
Task Progress:
- [ ] 1. Read motif-library.md for cultural fit and placement limits
- [ ] 2. Check existing SVGs (CoconutIllustration, EdgeDecorations)
- [ ] 3. Reuse palette tokens and stroke widths
- [ ] 4. Build or extend SVG component with flat fills + ink outline
- [ ] 5. Apply sticker shadow and slight rotation at placement layer
- [ ] 6. Keep decorative SVGs pointer-events-none; add title if needed
- [ ] 7. Verify file size and visual match with playful-arabic-game-ui
- [ ] 8. Run visual-ui-qa skill if the sticker ships on a visible screen
```

## Reference

- Motif meanings, Khareef vs Dhofar accents, anti-clutter rules: [references/motif-library.md](references/motif-library.md)
