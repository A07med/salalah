/**
 * Capture Dhofar stall gameplay screenshots for visual QA (v2 correction pass).
 * Run: node scripts/capture-stall-qa.mjs (server required)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), ".cursor/references");

async function swipe(page, x1, y1, x2, y2) {
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y2, { steps: 14 });
  await page.mouse.up();
}

async function fruitSwipe(page, settleMs = 250) {
  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!box) throw new Error("hitbox missing");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await swipe(page, cx - 55, cy - 15, cx + 55, cy + 15);
  await page.waitForTimeout(settleMs);
}

async function startGame(page) {
  await page.goto(BASE);
  await page.fill('input[placeholder="اسم اللاعب"]', "اختبار");
  await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.waitForSelector("[data-qa=table-mishli-root]");
  await page.waitForTimeout(900);
}

async function readProgress(page) {
  const el = page.locator("[data-qa=cut-progress-value]");
  const numeric = await el.getAttribute("data-qa-progress-numeric");
  if (numeric != null) return parseInt(numeric, 10);
  const text = await el.textContent();
  return parseInt(text?.replace(/[^\d]/g, "") ?? "0", 10);
}

async function captureStates(page, prefix) {
  await page.screenshot({
    path: path.join(OUT, `fluent-v5-${prefix}-initial.png`),
    fullPage: false,
  });

  await fruitSwipe(page, 100);
  await page.screenshot({
    path: path.join(OUT, `fluent-v5-${prefix}-during.png`),
    fullPage: false,
  });

  let progress = await readProgress(page);
  let guard = 0;
  while (progress < 48 && guard < 12) {
    await fruitSwipe(page);
    progress = await readProgress(page);
    guard += 1;
  }
  await page.waitForTimeout(750);
  await page.screenshot({
    path: path.join(OUT, `fluent-v5-${prefix}-50.png`),
    fullPage: false,
  });

  guard = 0;
  while (progress < 100 && guard < 20) {
    await fruitSwipe(page);
    progress = await readProgress(page);
    guard += 1;
  }
  await page.waitForTimeout(550);
  await page.screenshot({
    path: path.join(OUT, `fluent-v5-${prefix}-split.png`),
    fullPage: false,
  });

  await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT, `fluent-v5-${prefix}-modal.png`),
    fullPage: false,
  });

  const nextBtn = page.getByRole("button", { name: "المستوى التالي" });
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(900);
    await page.screenshot({
      path: path.join(OUT, `fluent-v5-${prefix}-next-level.png`),
      fullPage: false,
    });
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });

  for (const size of [
    { w: 390, h: 844, label: "390" },
    { w: 430, h: 932, label: "430" },
    { w: 1280, h: 800, label: "desktop" },
  ]) {
    const page = await browser.newPage({ viewport: { width: size.w, height: size.h } });
    await startGame(page);
    await captureStates(page, size.label);
    await page.close();
  }

  await browser.close();
  console.log("Screenshots saved to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
