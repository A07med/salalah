/**
 * Collision/hitbox verification without a browser — mirrors GameStage pointer-up logic.
 * Run: npx tsx scripts/verify-cut-collision.ts
 */
import {
  getSegmentImpactPoint,
  lineIntersectsRect,
} from "../lib/game/collision";
import { calculateCutDamage } from "../lib/game/scoring";

function makeRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

const fruit = makeRect(131, 220, 128, 144);
const cx = fruit.left + fruit.width / 2;
const cy = fruit.top + fruit.height / 2;

const fruitSwipe = {
  start: { x: cx - 55, y: cy - 15 },
  end: { x: cx + 55, y: cy + 15 },
};

const stemSwipe = {
  start: { x: cx - 50, y: fruit.top - 36 },
  end: { x: cx + 50, y: fruit.top - 36 },
};

const fruitHit = lineIntersectsRect(fruitSwipe.start, fruitSwipe.end, fruit);
const stemHit = lineIntersectsRect(stemSwipe.start, stemSwipe.end, fruit);

const fruitDamage = fruitHit
  ? calculateCutDamage(fruitSwipe.start, fruitSwipe.end, fruit, 1).damage
  : 0;

const impact = getSegmentImpactPoint(
  fruitSwipe.start,
  fruitSwipe.end,
  fruit,
);

const results = [
  { test: "fruit-body swipe intersects hitbox", pass: fruitHit, detail: fruitHit },
  { test: "fruit-body swipe adds damage", pass: fruitDamage > 0, detail: fruitDamage },
  { test: "stem-only swipe misses hitbox", pass: !stemHit, detail: stemHit },
  {
    test: "impact point lies on swipe segment through fruit",
    pass:
      impact != null &&
      impact.x >= Math.min(fruitSwipe.start.x, fruitSwipe.end.x) - 1 &&
      impact.x <= Math.max(fruitSwipe.start.x, fruitSwipe.end.x) + 1,
    detail: impact,
  },
];

console.log(JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass);
if (failed.length) process.exit(1);
