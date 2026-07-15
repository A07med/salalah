import type { MishliHitMark, Point } from "./types";
import { clamp01 } from "./coordinates";

const MAX_MARKS = 8;

export function normalizeImpactToMark(
  impact: Point,
  fruitBodyRect: DOMRect,
  angle: number,
  id: string,
): MishliHitMark {
  return {
    id,
    x: clamp01((impact.x - fruitBodyRect.left) / fruitBodyRect.width),
    y: clamp01((impact.y - fruitBodyRect.top) / fruitBodyRect.height),
    angle,
    strength: 1,
  };
}

function markDistance(a: MishliHitMark, mark: MishliHitMark): number {
  return Math.hypot(a.x - mark.x, a.y - mark.y);
}

export function addHitMark(
  marks: MishliHitMark[],
  incoming: MishliHitMark,
): MishliHitMark[] {
  if (marks.length < MAX_MARKS) {
    return [...marks, incoming];
  }

  let nearestIdx = 0;
  let nearestDist = Infinity;
  marks.forEach((m, i) => {
    const d = markDistance(m, incoming);
    if (d < nearestDist) {
      nearestDist = d;
      nearestIdx = i;
    }
  });

  return marks.map((m, i) =>
    i === nearestIdx
      ? {
          ...m,
          strength: Math.min(3, m.strength + 0.35),
          angle: incoming.angle,
        }
      : m,
  );
}
