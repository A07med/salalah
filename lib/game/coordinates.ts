import type { Point } from "./types";

export function clientToLocal(
  clientX: number,
  clientY: number,
  stageRect: DOMRect,
): Point {
  return {
    x: clientX - stageRect.left,
    y: clientY - stageRect.top,
  };
}

export function rectToLocal(rect: DOMRect, stageRect: DOMRect): DOMRect {
  return {
    left: rect.left - stageRect.left,
    top: rect.top - stageRect.top,
    right: rect.right - stageRect.left,
    bottom: rect.bottom - stageRect.top,
    width: rect.width,
    height: rect.height,
    x: rect.left - stageRect.left,
    y: rect.top - stageRect.top,
    toJSON: () => ({}),
  } as DOMRect;
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function swipeAngleDeg(start: Point, end: Point): number {
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
}
