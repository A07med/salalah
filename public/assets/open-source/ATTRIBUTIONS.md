# Open-Source Asset Attributions

This file records third-party artwork used or adapted in Salala (تحدي مشلي الخريف).

**Status:** Integrated — adapted geometry is used in React SVG components. Canonical source files are archived under `docs/open-source-asset-references/` (not shipped in production).

---

## Integrated assets

### Meat Cleaver — knife decoration

| Field | Value |
|-------|-------|
| Asset name | Meat Cleaver |
| Creator | Lorc (Sébastien Bénard) |
| Original URL | https://game-icons.net/1x1/lorc/meat-cleaver.html |
| License | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Date accessed | 2026-07-13 |
| Reference file | `docs/open-source-asset-references/lorc-meat-cleaver.svg` |
| Cleaned gameplay asset | `public/assets/open-source/meat-cleaver.svg` |
| Gameplay component | `components/game/GameplayCleaver.tsx` |
| StartScreen decoration | `components/game/EdgeDecorations.tsx` |
| Status | **Integrated** — cleaned silhouette + handle/edge accents |
| Modifications | Removed opaque background; kept Lorc cleaver path with transparent hole; applied Dhofar palette (`#E8E8E8` blade, `#7A4B30` handle, `#EF3340` accent); dark `#2D1C15` outline; StartScreen uses the public SVG; gameplay embeds matching stylings in `GameplayCleaver` |

**Attribution:** “Meat Cleaver” by [Lorc](https://lorcblog.blogspot.com), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), modified. Available on https://game-icons.net/1x1/lorc/meat-cleaver.html

---

### Coconut half — split Mishli geometry (gameplay + level-complete)

| Field | Value |
|-------|-------|
| Asset name | Coconut (Flat variant) |
| Creator | Microsoft Corporation |
| Repository | https://github.com/microsoft/fluentui-emoji |
| Original URL | https://github.com/microsoft/fluentui-emoji/blob/main/assets/Coconut/Flat/coconut_flat.svg |
| License | [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) |
| Date accessed | 2026-07-13 |
| Reference file | `docs/open-source-asset-references/fluent-emoji-coconut-flat.svg` |
| License archive | `docs/open-source-asset-references/fluentui-emoji-LICENSE` |
| Integrated in | `components/game/illustrations/MishliHalfIllustration.tsx`, `components/game/TableMishli.tsx`, `components/game/LevelCompleteModal.tsx` |
| Status | **Integrated** — cross-section geometry reference only |
| Modifications | Flat variant used (not Color/3D). Cross-section flesh curves and inner-shell layering informed by Fluent paths; redrawn as green Dhofar Mishli halves sharing `mishliPaths.ts` silhouette with intact `CoconutIllustration` table variant. Applied `#6B8F3C` husk, `#C49252` shell edge, `#FFF8E7` flesh, `#DCE8DF` wet cut, `#2D1C15` ink; flat fills only; no Fluent gradients or brown emoji shell. Intact gameplay Mishli remains custom green. |

**Attribution:** Coconut emoji artwork from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT License), modified.

---

### Coconuts — coconut-half decoration geometry

| Field | Value |
|-------|-------|
| Asset name | Coconuts |
| Creator | Delapouite (Sébastien Bénard) |
| Original URL | https://game-icons.net/1x1/delapouite/coconuts.html |
| License | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Date accessed | 2026-07-13 |
| Reference file | `docs/open-source-asset-references/delapouite-coconuts.svg` |
| Integrated in | `components/game/illustrations/CoconutHalfSticker.tsx` |
| Status | **Integrated** — adapted geometry |
| Modifications | Half-shell curvature and fibre rhythm informed by Delapouite icon; redrawn as asymmetric clipped coconut-half; palette `#7A4B30` husk, `#FFF8E7` flesh, `#2D1C15` ink; no verbatim SVG path import |

**Attribution:** “Coconuts” by [Delapouite](https://delapouite.com), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), modified. Available on https://game-icons.net/1x1/delapouite/coconuts.html

---

### Coconuts — hanging hero geometry reference

| Field | Value |
|-------|-------|
| Asset name | Coconuts (silhouette reference) |
| Creator | Delapouite (Sébastien Bénard) |
| Original URL | https://game-icons.net/1x1/delapouite/coconuts.html |
| License | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Date accessed | 2026-07-13 |
| Reference file | `docs/open-source-asset-references/delapouite-coconuts.svg` |
| Integrated in | `components/game/CoconutIllustration.tsx` (`showPalmStem` hero variant) |
| Status | **Integrated** — geometry reference only |
| Modifications | Custom hanging green Mishli with palm stem and gameplay cut stages on the fruit body; outer husk proportions informed by Game Icons coconut shell curves; full hand redraw — not a direct import |

**Attribution:** “Coconuts” by [Delapouite](https://delapouite.com), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), modified. Available on https://game-icons.net/1x1/delapouite/coconuts.html

---

### Köhler Boswellia — frankincense botanical reference

| Field | Value |
|-------|-------|
| Asset name | Köhler Boswellia (*Boswellia sacra*) |
| Creator | Unknown (Köhler's Medizinal-Pflanzen, 1887) |
| Original URL | https://commons.wikimedia.org/wiki/File:Köhler_Boswellia.jpg |
| License | Public domain (PD-old; faithful reproduction of 2D PD artwork) |
| Date accessed | 2026-07-13 |
| Reference file | `docs/open-source-asset-references/koehler-boswellia.jpg` |
| Integrated in | `components/game/illustrations/FrankincenseSticker.tsx` |
| Status | **Integrated** — simplified trace |
| Modifications | Botanical plate simplified into sticker: knotted central branch, three compound leaf groups, two resin pieces; flat `#527A59` / `#7A4B30` fills; 4px `#2D1C15` outline; no raster embed in UI |

**Attribution (courtesy):** Botanical reference: *Boswellia sacra*, Köhler's Medizinal-Pflanzen (1887), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Köhler_Boswellia.jpg) (public domain).

---

## Reviewed but not used

### Microsoft Fluent Emoji Coconut — Color / 3D variants

| Field | Value |
|-------|-------|
| Creator | Microsoft Corporation |
| Original URL | https://github.com/microsoft/fluentui-emoji/tree/main/assets/Coconut |
| License | MIT |
| Status | **Reference-only review** — not integrated |
| Decision | Rejected for integration — Color and 3D variants use gradient-heavy rendering; Flat variant selected instead |

### Twemoji Coconut (U+1F965)

| Field | Value |
|-------|-------|
| Creator | Twitter / X Corp (Twemoji project) |
| Original URL | https://github.com/twitter/twemoji/blob/master/assets/svg/1f965.svg |
| License | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (see `docs/open-source-asset-references/twemoji-LICENSE`) |
| Date accessed | 2026-07-13 |
| Reference file | `docs/open-source-asset-references/twemoji-coconut-1f965.svg` |
| Status | **Reference-only audit** — not integrated |
| Decision | Rejected — circular emoji silhouette; brown mature coconut; does not match green Mishli or Dhofar sticker system; Fluent Flat preferred |

### Noto Emoji Coconut (U+1F965)

| Field | Value |
|-------|-------|
| Creator | Google (Noto Emoji) |
| Original URL | https://github.com/googlefonts/noto-emoji/blob/main/svg/emoji_u1f965.svg |
| License | [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) (see `docs/open-source-asset-references/noto-emoji-LICENSE`) |
| Date accessed | 2026-07-13 |
| Reference file | `docs/open-source-asset-references/noto-emoji-coconut-u1f965.svg` |
| Status | **Reference-only audit** — not integrated |
| Decision | Rejected — complex Adobe-exported paths; brown photorealistic husk; generic emoji appearance; Fluent Flat preferred |

### OpenMoji coconut (emoji U+1F965)

| Field | Value |
|-------|-------|
| Creator | Marius Schnabel / OpenMoji Project |
| Original URL | https://openmoji.org/library/emoji-1F965/ |
| License | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Status | **Reference-only review** — not integrated |
| Decision | Rejected — ShareAlike obligation; emoji aesthetic; hero must not be replaced with generic emoji |

### Delapouite cleaver (floor saw variant)

| Field | Value |
|-------|-------|
| Creator | Delapouite |
| Original URL | https://game-icons.net/1x1/delapouite/cleaver.html |
| License | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Status | **Reference-only review** — not integrated |
| Decision | Rejected — reads as floor trap / industrial saw; Lorc meat-cleaver is the better match |

---

## License compliance notes

### MIT (Microsoft Fluent Emoji)

- Commercial use: permitted
- Modification: permitted
- Obligations: include copyright and permission notice in copies
- This file satisfies attribution

### CC BY 3.0 (Game Icons)

- Commercial use: permitted
- Modification: permitted
- Obligations: credit creator, link to license, indicate changes made
- This file satisfies attribution; optional in-game credits link may be added later

### Public domain (Köhler plate)

- Commercial use: permitted
- Modification: permitted
- Obligations: none legally required; source citation recommended (see above)

---

## Reference archive

Canonical downloads (not in `public/`):

```
docs/open-source-asset-references/
  fluent-emoji-coconut-flat.svg  ← Microsoft Fluent Emoji Coconut Flat (MIT)
  fluentui-emoji-LICENSE         ← https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE
  twemoji-coconut-1f965.svg       ← Twemoji audit reference (not integrated)
  twemoji-LICENSE
  noto-emoji-coconut-u1f965.svg    ← Noto Emoji audit reference (not integrated)
  noto-emoji-LICENSE
  lorc-meat-cleaver.svg       ← https://game-icons.net/icons/000000/ffffff/1x1/lorc/meat-cleaver.svg
  delapouite-coconuts.svg     ← https://game-icons.net/icons/000000/ffffff/1x1/delapouite/coconuts.svg
  koehler-boswellia.jpg       ← https://commons.wikimedia.org/wiki/Special:FilePath/Köhler_Boswellia.jpg
```

Do not use assets from unclear-licence aggregators or unofficial mirrors.
