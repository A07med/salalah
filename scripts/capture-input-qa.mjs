/**
 * Capture input QA screenshots with and without crosshair overlay.
 * Run: node scripts/capture-input-qa.mjs (server required)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), ".cursor/references");

async function swipe(page, x1, y1, x2, y2) {
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y2, { steps: 12 });
  await page.mouse.up();
}

async function startGame(page) {
  await page.goto(BASE);
  await page.fill('input[placeholder="اسم اللاعب"]', "اختبار");
  await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.waitForSelector("[data-qa=cutting-zone]");
  await page.waitForTimeout(700);
}

async function fruitSwipe(page) {
  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!box) throw new Error("hitbox missing");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await swipe(page, cx - 55, cy - 15, cx + 55, cy + 15);
  await page.waitForTimeout(300);
}

async function capture(page, prefix) {
  await page.screenshot({
    path: path.join(OUT, `${prefix}.png`),
    fullPage: false,
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });

  for (const size of [
    { w: 390, h: 844, label: "390" },
    { w: 430, h: 932, label: "430" },
  ]) {
    const page = await browser.newPage({
      viewport: { width: size.w, height: size.h },
      hasTouch: true,
    });
    await startGame(page);
    await fruitSwipe(page);
    await capture(page, `input-v1-${size.label}-clean`);
    await page.close();
  }

  await browser.close();
  console.log("Screenshots saved to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
