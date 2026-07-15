/**
 * Capture gameplay feedback: cleaver impact, ProgressPop above fruit, cracks after fade.
 * BASE_URL=http://localhost:3014 node scripts/capture-feedback-qa.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3014";
const OUT = path.join(process.cwd(), ".cursor/references");
const PREFIX = "feedback-v1";

async function swipe(page, x1, y1, x2, y2) {
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y2, { steps: 12 });
  await page.mouse.up();
}

async function startGame(page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.fill('input[placeholder="اسم اللاعب"]', "اختبار");
  await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.waitForSelector("[data-qa=coconut-hitbox]");
  await page.waitForTimeout(700);
}

async function hitboxCentre(page) {
  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!box) throw new Error("hitbox missing");
  return {
    cx: box.x + box.width / 2,
    cy: box.y + box.height / 2,
    box,
  };
}

async function fruitSwipe(page, ox = 0, oy = 0) {
  const { cx, cy } = await hitboxCentre(page);
  await swipe(page, cx - 50 + ox, cy - 12 + oy, cx + 50 + ox, cy + 12 + oy);
}

async function shot(page, name) {
  const file = path.join(OUT, `${PREFIX}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("Screenshot:", file);
}

async function captureViewport(browser, width, height, label) {
  const context = await browser.newContext({
    viewport: { width, height },
    locale: "ar",
  });
  const page = await context.newPage();
  await startGame(page);

  const { cx, cy } = await hitboxCentre(page);

  // Active cleaver during impact fade + ProgressPop above fruit
  await page.mouse.move(cx - 50, cy - 10);
  await page.mouse.down();
  await page.mouse.move(cx + 50, cy + 10, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(18);
  const impactMetrics = await page.evaluate(() => {
    const fruitVisual =
      document.querySelector("[data-qa=coconut-hitbox]") ||
      document.querySelector("[data-qa=fruit-body] svg");
    const pop = document.querySelector("[data-qa=progress-pop]");
    const cleaver = document.querySelector("[data-qa=gameplay-cleaver]");
    const fruitR = fruitVisual?.getBoundingClientRect();
    const popR = pop?.getBoundingClientRect();
    const bar = document.querySelector("[data-qa=cut-progress-bar]")?.getBoundingClientRect();
    return {
      cleaverStyle: cleaver
        ? { w: Math.round(parseFloat(getComputedStyle(cleaver).width)), h: Math.round(parseFloat(getComputedStyle(cleaver).height)) }
        : null,
      cleaverVisible: !!cleaver && getComputedStyle(cleaver).opacity !== "0",
      popText: document.querySelector("[data-qa=progress-pop-value]")?.textContent,
      popAboveFruit: !!(popR && fruitR && popR.bottom <= fruitR.top - 8),
      popBelowBar: !!(popR && bar && popR.top >= bar.bottom + 2),
      gapPopToFruit: popR && fruitR ? Math.round(fruitR.top - popR.bottom) : null,
      gapBarToPop: popR && bar ? Math.round(popR.top - bar.bottom) : null,
    };
  });
  console.log(label, "impact", impactMetrics);
  await shot(page, `${label}-impact-cleaver-pop`);

  // After cleaver fades (~140ms) — cracks remain, cleaver gone
  await page.waitForTimeout(220);
  const afterMetrics = await page.evaluate(() => ({
    cleaverPresent: !!document.querySelector("[data-qa=gameplay-cleaver]"),
    crackGroups: document.querySelectorAll(".animate-crack-appear").length,
  }));
  console.log(label, "after-fade", afterMetrics);
  await shot(page, `${label}-after-cleaver-fade`);

  // Three cracks, wait out any active cleaver fade
  await fruitSwipe(page, -18, -16);
  await page.waitForTimeout(200);
  await fruitSwipe(page, 18, 16);
  await page.waitForTimeout(220);
  await shot(page, `${label}-three-cracks`);

  await context.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  await captureViewport(browser, 390, 844, "390");
  await captureViewport(browser, 430, 932, "430");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
