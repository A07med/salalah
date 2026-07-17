import type { Point } from "./types";

/**
 * Tiny geometric slop for sub-pixel edges only.
 * Must not expand the hitbox onto the chopping board.
 */
const HIT_PADDING = 4;

export function normalizePointerEvent(
  clientX: number,
  clientY: number,
): Point {
  return { x: clientX, y: clientY };
}

export function getRectCenter(rect: DOMRect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function pointInRect(
  point: Point,
  rect: DOMRect,
  padding = HIT_PADDING,
): boolean {
  return (
    point.x >= rect.left - padding &&
    point.x <= rect.right + padding &&
    point.y >= rect.top - padding &&
    point.y <= rect.bottom + padding
  );
}

function cross(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function onSegment(a: Point, b: Point, c: Point): boolean {
  return (
    Math.min(a.x, b.x) <= c.x + 0.001 &&
    c.x <= Math.max(a.x, b.x) + 0.001 &&
    Math.min(a.y, b.y) <= c.y + 0.001 &&
    c.y <= Math.max(a.y, b.y) + 0.001
  );
}

function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);

  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true;
  }

  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;

  return false;
}

export function lineIntersectsRect(
  start: Point,
  end: Point,
  rect: DOMRect,
): boolean {
  const left = rect.left - HIT_PADDING;
  const right = rect.right + HIT_PADDING;
  const top = rect.top - HIT_PADDING;
  const bottom = rect.bottom + HIT_PADDING;

  if (pointInRect(start, rect) || pointInRect(end, rect)) return true;

  const tl: Point = { x: left, y: top };
  const tr: Point = { x: right, y: top };
  const br: Point = { x: right, y: bottom };
  const bl: Point = { x: left, y: bottom };

  return (
    segmentsIntersect(start, end, tl, tr) ||
    segmentsIntersect(start, end, tr, br) ||
    segmentsIntersect(start, end, br, bl) ||
    segmentsIntersect(start, end, bl, tl)
  );
}

export function calculateDistanceFromCenter(point: Point, rect: DOMRect): number {
  const center = getRectCenter(rect);
  return Math.hypot(point.x - center.x, point.y - center.y);
}

export function getSwipeLength(start: Point, end: Point): number {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function pointInsideExpandedRect(p: Point, rect: DOMRect): boolean {
  const left = rect.left - HIT_PADDING;
  const right = rect.right + HIT_PADDING;
  const top = rect.top - HIT_PADDING;
  const bottom = rect.bottom + HIT_PADDING;
  return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom;
}

/** Midpoint along the swipe segment where it crosses the padded hitbox. */
export function getSegmentImpactPoint(
  start: Point,
  end: Point,
  rect: DOMRect,
): Point | null {
  if (!lineIntersectsRect(start, end, rect)) return null;

  const left = rect.left - HIT_PADDING;
  const right = rect.right + HIT_PADDING;
  const top = rect.top - HIT_PADDING;
  const bottom = rect.bottom + HIT_PADDING;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const ts: number[] = [];

  const tryT = (t: number) => {
    if (t < -0.001 || t > 1.001) return;
    const x = start.x + dx * t;
    const y = start.y + dy * t;
    if (x >= left - 0.5 && x <= right + 0.5 && y >= top - 0.5 && y <= bottom + 0.5) {
      ts.push(Math.min(1, Math.max(0, t)));
    }
  };

  if (Math.abs(dx) > 1e-9) {
    tryT((left - start.x) / dx);
    tryT((right - start.x) / dx);
  }
  if (Math.abs(dy) > 1e-9) {
    tryT((top - start.y) / dy);
    tryT((bottom - start.y) / dy);
  }

  if (pointInsideExpandedRect(start, rect)) ts.push(0);
  if (pointInsideExpandedRect(end, rect)) ts.push(1);

  if (ts.length === 0) {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
  }

  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const tMid = (tMin + tMax) / 2;
  return { x: start.x + dx * tMid, y: start.y + dy * tMid };
}
