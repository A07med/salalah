/** Shared Mishli silhouette — intact body for whole fruit. */
export const MISHLI_BODY_PATH =
  "M56 20 C78 18 98 34 102 60 C106 88 96 116 74 126 C60 132 46 130 32 120 C14 106 6 78 10 52 C14 28 34 18 56 20 Z";

export const MISHLI_GREEN_BASE = "#6B8F3C";
export const MISHLI_GREEN_FIBRE = "#A8C878";
export const MISHLI_GREEN_LIGHT = "#B8D080";
export const MISHLI_GREEN_DEEP = "#4A6B32";
export const MISHLI_SHELL_EDGE = "#C49252";
export const MISHLI_FLESH = "#FFF8E7";
export const MISHLI_FLESH_CREASE = "#E8C9A0";
export const MISHLI_WET = "#DCE8DF";
export const MISHLI_INK = "#2D1C15";

/**
 * Cut-face-forward halves — broad interior visible, no clipPath/CSS mirror.
 * Outer curves align with MISHLI_BODY_PATH when joined at x=56/64 seam.
 */
export const LEFT_HALF = {
  husk:
    "M4 14 C2 44 6 92 26 118 C38 126 54 118 58 98 L58 16 C46 8 24 8 12 16 C6 18 4 14 4 14 Z",
  fibre:
    "M10 22 C8 48 12 86 28 108 C38 114 50 108 54 94 L54 22 C42 18 24 20 10 22 Z",
  flesh:
    "M58 18 C44 24 36 46 36 72 C36 98 44 116 52 122 L58 122 L58 18 Z",
  shellEdge: "M56 22 C54 50 54 82 56 110",
  wet: { cx: 46, cy: 68, rx: 10, ry: 18 },
  crease: "M42 48 C44 66 43 84 45 100",
  highlight: { cx: 22, cy: 56, rx: 12, ry: 16 },
  fibreLines: "M14 48 Q24 62 20 76 M12 74 Q24 88 20 100",
};

export const RIGHT_HALF = {
  husk:
    "M60 14 C62 44 58 92 38 118 C26 126 10 118 6 98 L6 16 C18 8 40 8 52 16 C58 18 60 14 60 14 Z",
  fibre:
    "M54 22 C56 48 52 86 36 108 C26 114 14 108 10 94 L10 22 C22 18 40 20 54 22 Z",
  flesh:
    "M6 18 C20 24 28 46 28 72 C28 98 20 116 12 122 L6 122 L6 18 Z",
  shellEdge: "M8 22 C10 50 10 82 8 110",
  wet: { cx: 18, cy: 68, rx: 10, ry: 18 },
  crease: "M22 48 C20 66 21 84 19 100",
  highlight: { cx: 42, cy: 56, rx: 12, ry: 16 },
  fibreLines: "M50 48 Q40 62 44 76 M52 74 Q40 88 44 100",
};
