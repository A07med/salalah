/**
 * Pointer alignment, scroll behaviour, and crack-location verification.
 * Run: BASE_URL=http://localhost:3010 node scripts/verify-input-qa.mjs
 */
import { chromium, devices } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), ".cursor/references");
const QA = process.env.NEXT_PUBLIC_INPUT_QA === "1";

async function swipe(page, x1, y1, x2, y2) {
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y2, { steps: 12 });
  await page.mouse.up();
}

async function readProgress(page) {
  const numeric = await page
    .locator("[data-qa=cut-progress-value]")
    .getAttribute("data-qa-progress-numeric");
  return parseInt(numeric ?? "0", 10);
}

async function fruitSwipe(page, offsetX = 0, offsetY = 0) {
  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!box) throw new Error("hitbox missing");
  const cx = box.x + box.width / 2 + offsetX;
  const cy = box.y + box.height / 2 + offsetY;
  await swipe(page, cx - 55, cy - 15, cx + 55, cy + 15);
  await page.waitForTimeout(280);
}

async function readCrackCentres(page) {
  return page.evaluate(() => {
    const nodes = document.querySelectorAll("[data-qa-crack-centre]");
    return Array.from(nodes).map((el) => {
      const [nx, ny] = (el.getAttribute("data-qa-crack-centre") ?? "0,0")
        .split(",")
        .map(Number);
      return { x: nx, y: ny };
    });
  });
}

async function startGame(page) {
  await page.goto(BASE);
  await page.fill('input[placeholder="اسم اللاعب"]', "اختبار");
  await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.waitForSelector("[data-qa=cutting-zone]");
  await page.waitForTimeout(500);
}

async function runStartScreenScroll(page, label) {
  await page.goto(BASE);
  await page.waitForSelector('input[placeholder="اسم اللاعب"]');
  // Force tall content inside the StartScreen scroll container
  const scrolled = await page.evaluate(async () => {
    const scroller = document.querySelector("[data-qa=start-scroll]");
    if (!scroller) return { ok: false, reason: "no-scroller" };
    const pad = document.createElement("div");
    pad.style.height = "140vh";
    pad.setAttribute("data-qa", "scroll-pad");
    scroller.appendChild(pad);
    const before = scroller.scrollTop;
    scroller.scrollTop = 220;
    await new Promise((r) => setTimeout(r, 40));
    const after = scroller.scrollTop;
    const can =
      scroller.scrollHeight > scroller.clientHeight + 40 && after > before;
    return {
      ok: can,
      before,
      after,
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
    };
  });
  return {
    viewport: label,
    test: "StartScreen can scroll when content exceeds viewport",
    pass: Boolean(scrolled.ok),
    detail: scrolled,
  };
}

async function runViewportTests(page, label) {
  const results = [];

  const unlock = await page.evaluate(() => {
    const html = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    return {
      htmlOverflowY: html.overflowY,
      bodyOverflowY: body.overflowY,
      htmlTouch: html.touchAction,
      bodyTouch: body.touchAction,
    };
  });
  results.push({
    viewport: label,
    test: "html/body are not globally scroll-locked",
    pass:
      unlock.htmlOverflowY !== "hidden" &&
      unlock.bodyOverflowY !== "hidden" &&
      unlock.htmlTouch !== "none" &&
      unlock.bodyTouch !== "none",
    detail: unlock,
  });

  const zoneTouch = await page.evaluate(() => {
    const el = document.querySelector("[data-qa=cutting-zone]");
    return el ? getComputedStyle(el).touchAction : null;
  });
  results.push({
    viewport: label,
    test: "cutting zone uses touch-action none",
    pass: zoneTouch === "none",
    detail: zoneTouch,
  });

  // Force overflow so outside-zone wheel can scroll without bloating gameplay layout
  await page.evaluate(() => {
    document.body.style.minHeight = "160vh";
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
  const atTop = await page.evaluate(() => window.scrollY);
  await page.mouse.move(40, 60);
  await page.mouse.wheel(0, 140);
  await page.waitForTimeout(120);
  const afterOutside = await page.evaluate(() => window.scrollY);
  results.push({
    viewport: label,
    test: "vertical gesture outside cutting zone changes scrollY",
    pass: afterOutside > atTop,
    before: atTop,
    after: afterOutside,
  });

  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  const tableRoot = await page.locator("[data-qa=cutting-table]").boundingBox();
  if (box && tableRoot) {
    const before = await readProgress(page);
    const ty = box.y + box.height + 36;
    const tx = tableRoot.x + tableRoot.width * 0.12;
    const scrollBeforeInside = await page.evaluate(() => window.scrollY);
    await swipe(page, tx, ty, tx + 70, ty);
    await page.waitForTimeout(250);
    const after = await readProgress(page);
    const scrollAfterInside = await page.evaluate(() => window.scrollY);
    const cracks = await readCrackCentres(page);
    results.push({
      viewport: label,
      test: "table-only swipe adds no progress and no crack",
      pass: after === before && cracks.length === 0,
      before,
      after,
      cracks: cracks.length,
    });
    results.push({
      viewport: label,
      test: "vertical swipe inside cutting zone does not scroll",
      pass: Math.abs(scrollAfterInside - scrollBeforeInside) < 3,
      before: scrollBeforeInside,
      after: scrollAfterInside,
    });
  }

  await page.evaluate(() => {
    document.body.style.minHeight = "";
  });

  const beforeFruit = await readProgress(page);
  await fruitSwipe(page);
  const afterFruit = await readProgress(page);
  results.push({
    viewport: label,
    test: "mouse swipe through fruit increases progress",
    pass: afterFruit > beforeFruit,
    before: beforeFruit,
    after: afterFruit,
  });

  const fruitBox = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (fruitBox) {
    const px = fruitBox.x + fruitBox.width / 2;
    const py = fruitBox.y + fruitBox.height / 2;
    const endX = px + 30;
    const endY = py + 8;
    await page.mouse.move(px, py);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 8 });
    await page.waitForTimeout(150);
    await page.evaluate(({ x, y }) => {
      window.__lastPointerClient = { x, y };
    }, { x: endX, y: endY });
    const delta = await page.evaluate(() => {
      const anchor = document.querySelector("[data-qa=cleaver-blade-anchor]");
      const pointer = window.__lastPointerClient;
      if (!anchor || !pointer) return null;
      const anchorRect = anchor.getBoundingClientRect();
      const bladeX = anchorRect.left + anchorRect.width / 2;
      const bladeY = anchorRect.top + anchorRect.height / 2;
      return Math.hypot(bladeX - pointer.x, bladeY - pointer.y);
    });
    results.push({
      viewport: label,
      test: "cleaver blade anchor within 6px of pointer",
      pass: delta != null && delta <= 6,
      detail: delta,
    });
    await page.mouse.up();
  }

  const hits = [
    { name: "top-left", ox: -22, oy: -22 },
    { name: "centre", ox: 0, oy: 0 },
    { name: "bottom-right", ox: 22, oy: 22 },
  ];
  const crackResults = [];
  for (const hit of hits) {
    await fruitSwipe(page, hit.ox, hit.oy);
    const cracks = await readCrackCentres(page);
    crackResults.push({ hit: hit.name, norm: cracks[cracks.length - 1] });
  }
  results.push({
    viewport: label,
    test: "three hits at different positions produce different cracks",
    pass:
      crackResults.length === 3 &&
      crackResults.every((c) => c.norm) &&
      Math.hypot(
        crackResults[0].norm.x - crackResults[1].norm.x,
        crackResults[0].norm.y - crackResults[1].norm.y,
      ) > 0.05 &&
      Math.hypot(
        crackResults[2].norm.x - crackResults[1].norm.x,
        crackResults[2].norm.y - crackResults[1].norm.y,
      ) > 0.05,
    detail: crackResults,
  });

  if (QA) {
    const impactDelta = await page.evaluate(() => {
      const impact = document.querySelector('[data-qa-crosshair="impact"] circle');
      const crack = document.querySelector('[data-qa-crosshair="crack"] circle');
      if (!impact || !crack) return null;
      const i = impact.getBoundingClientRect();
      const c = crack.getBoundingClientRect();
      return Math.hypot(
        i.left + i.width / 2 - (c.left + c.width / 2),
        i.top + i.height / 2 - (c.top + c.height / 2),
      );
    });
    results.push({
      viewport: label,
      test: "crack centre within 6px of impact point",
      pass: impactDelta != null && impactDelta <= 6,
      detail: impactDelta,
    });
  }

  await page.screenshot({
    path: path.join(OUT, `input-v2-${label}-${QA ? "qa" : "clean"}.png`),
    fullPage: false,
  });

  return results;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const all = [];

  for (const { w, h, label, touch } of [
    { w: 390, h: 844, label: "390", touch: true },
    { w: 430, h: 932, label: "430", touch: true },
    { w: 1280, h: 800, label: "1280", touch: false },
  ]) {
    const context = await browser.newContext(
      touch
        ? { ...devices["iPhone 12"], viewport: { width: w, height: h } }
        : { viewport: { width: w, height: h } },
    );
    const page = await context.newPage();
    all.push(await runStartScreenScroll(page, label));
    await startGame(page);
    all.push(...(await runViewportTests(page, label)));

    if (touch) {
      const before = await readProgress(page);
      const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
      if (box) {
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        await page.touchscreen.tap(cx - 40, cy - 10);
        await page.waitForTimeout(40);
        await fruitSwipe(page);
      }
      const after = await readProgress(page);
      all.push({
        viewport: label,
        test: "touch swipe through fruit increases progress",
        pass: after > before,
        before,
        after,
      });
    }

    await context.close();
  }

  console.log(JSON.stringify(all, null, 2));
  const failed = all.filter((r) => !r.pass);
  if (failed.length) process.exit(1);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
