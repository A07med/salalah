/**
 * Capture cleaver / crack gameplay screenshots (clean + optional QA overlay).
 * NEXT_PUBLIC_INPUT_QA=1 enables crosshair overlay.
 */
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), ".cursor/references");
const PREFIX = process.env.SHOT_PREFIX ?? "cleaver-v2";
const QA = process.env.NEXT_PUBLIC_INPUT_QA === "1";

async function swipe(page, x1, y1, x2, y2) {
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y2, { steps: 14 });
  await page.mouse.up();
}

async function startGame(page) {
  await page.goto(BASE);
  await page.fill('input[placeholder="اسم اللاعب"]', "اختبار");
  await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.waitForSelector("[data-qa=cutting-zone]");
  await page.waitForTimeout(600);
}

async function fruitSwipe(page, ox = 0, oy = 0) {
  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!box) throw new Error("hitbox missing");
  const cx = box.x + box.width / 2 + ox;
  const cy = box.y + box.height / 2 + oy;
  await swipe(page, cx - 55, cy - 15, cx + 55, cy + 15);
  await page.waitForTimeout(320);
}

async function shot(page, name) {
  await page.screenshot({
    path: path.join(OUT, `${PREFIX}-${name}.png`),
    fullPage: false,
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const tag = QA ? "qa" : "clean";

  // 390 touch
  {
    const ctx = await browser.newContext({
      ...devices["iPhone 12"],
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    await startGame(page);
    const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(120);
      await shot(page, `390-cleaver-follow-${tag}`);
    }
    await fruitSwipe(page, -22, -22);
    await shot(page, `390-first-crack-${tag}`);
    await fruitSwipe(page, 0, 0);
    await fruitSwipe(page, 22, 22);
    await shot(page, `390-three-cracks-${tag}`);
    let progress = 0;
    let guard = 0;
    while (progress < 48 && guard < 10) {
      await fruitSwipe(page);
      progress = parseInt(
        (await page
          .locator("[data-qa=cut-progress-value]")
          .getAttribute("data-qa-progress-numeric")) ?? "0",
        10,
      );
      guard += 1;
    }
    await shot(page, `390-50pct-${tag}`);
    while (progress < 100 && guard < 24) {
      await fruitSwipe(page);
      progress = parseInt(
        (await page
          .locator("[data-qa=cut-progress-value]")
          .getAttribute("data-qa-progress-numeric")) ?? "0",
        10,
      );
      guard += 1;
    }
    await page.waitForTimeout(900);
    await shot(page, `390-split-${tag}`);
    await ctx.close();
  }

  // 430 touch
  {
    const ctx = await browser.newContext({
      ...devices["iPhone 12"],
      viewport: { width: 430, height: 932 },
    });
    const page = await ctx.newPage();
    await startGame(page);
    await fruitSwipe(page);
    await fruitSwipe(page, -20, -18);
    await fruitSwipe(page, 18, 20);
    await shot(page, `430-cracks-${tag}`);
    await ctx.close();
  }

  // 1280 mouse
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await startGame(page);
    await page.evaluate(() => window.scrollTo(0, 80));
    const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2 - 20, box.y + box.height / 2);
      await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 10, {
        steps: 10,
      });
      await page.waitForTimeout(100);
      await shot(page, `1280-mouse-follow-${tag}`);
    }
    await fruitSwipe(page);
    await shot(page, `1280-crack-${tag}`);
    await page.close();
  }

  await browser.close();
  console.log("Saved screenshots to", OUT, "prefix", PREFIX, tag);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
