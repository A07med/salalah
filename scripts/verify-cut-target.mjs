/**
 * Functional verification for Mishli fruit-body cut targeting and gameplay layout.
 * Run: node scripts/verify-cut-target.mjs (requires production server on :3010)
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";

async function readProgress(page) {
  const el = page.locator("[data-qa=cut-progress-value]");
  const numeric = await el.getAttribute("data-qa-progress-numeric");
  if (numeric != null) return parseInt(numeric, 10);
  const text = await el.textContent();
  return parseInt(text?.replace(/[^\d]/g, "") ?? "0", 10);
}

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
  await page.waitForSelector("[data-qa=coconut-hitbox]");
  await page.waitForTimeout(800);
}

async function measureBarToFruitGap(page) {
  const progress = await page.locator("[data-qa=cut-progress]").boundingBox();
  const fruit = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!progress || !fruit) return -1;
  return fruit.y - (progress.y + progress.height);
}

async function measureFruitContainment(page, viewportHeight) {
  const fruit = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  const board = await page.locator("[data-qa=chopping-board]").boundingBox();
  if (!fruit || !board) return null;

  const bottomClearance = viewportHeight - (fruit.y + fruit.height);
  return {
    bottomClearance: Math.round(bottomClearance),
    topInset: Math.round(fruit.y - board.y),
    leftInset: Math.round(fruit.x - board.x),
    rightInset: Math.round(board.x + board.width - (fruit.x + fruit.width)),
    passBottom: bottomClearance >= 28,
    passTop: fruit.y - board.y >= 16,
    passLeft: fruit.x - board.x >= 16,
    passRight: board.x + board.width - (fruit.x + fruit.width) >= 16,
  };
}

async function runGameplayChecks(page, label, viewportHeight) {
  const results = [];

  const containment = await measureFruitContainment(page, viewportHeight);
  if (containment) {
    results.push({
      viewport: label,
      test: "fruit bottom clearance (px)",
      value: containment.bottomClearance,
      pass: containment.passBottom,
    });
    results.push({
      viewport: label,
      test: "fruit inside board top (px)",
      value: containment.topInset,
      pass: containment.passTop,
    });
    results.push({
      viewport: label,
      test: "fruit inside board left (px)",
      value: containment.leftInset,
      pass: containment.passLeft,
    });
    results.push({
      viewport: label,
      test: "fruit inside board right (px)",
      value: containment.rightInset,
      pass: containment.passRight,
    });
  }

  const gap = await measureBarToFruitGap(page);
  results.push({
    viewport: label,
    test: "bar-to-fruit gap (px)",
    value: Math.round(gap),
    pass: gap >= 28,
  });

  const hudPointerEvents = await page.evaluate(() => {
    const el = document.querySelector("[data-qa=cut-progress]");
    return el ? getComputedStyle(el).pointerEvents : null;
  });
  results.push({
    viewport: label,
    test: "HUD progress pointer-events none",
    pass: hudPointerEvents === "none",
    detail: hudPointerEvents,
  });

  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!box) throw new Error("coconut hitbox not found");

  const before = await readProgress(page);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await swipe(page, cx - 50, cy - 20, cx + 50, cy + 20);
  await page.waitForTimeout(300);
  const afterFruit = await readProgress(page);
  results.push({
    viewport: label,
    test: "fruit-body swipe",
    before,
    after: afterFruit,
    pass: afterFruit > before,
  });

  const table = await page.locator("[data-qa=cutting-table]").boundingBox();
  const tableBefore = afterFruit;
  if (table && box) {
    const tableY = box.y + box.height + 36;
    const tableX = table.x + table.width * 0.12;
    await swipe(page, tableX, tableY, tableX + 90, tableY);
    await page.waitForTimeout(300);
    const afterTable = await readProgress(page);
    results.push({
      viewport: label,
      test: "table-only swipe (no fruit)",
      before: tableBefore,
      after: afterTable,
      pass: afterTable === tableBefore,
    });
  }
  const progress = await page.locator("[data-qa=cut-progress]").boundingBox();
  const progressBefore = table ? (await readProgress(page)) : afterFruit;
  if (progress) {
    const px = progress.x + progress.width / 2;
    const py = progress.y + progress.height / 2;
    await swipe(page, px - 20, py, px + 20, py);
    await page.waitForTimeout(300);
    const afterBarOnly = await readProgress(page);
    results.push({
      viewport: label,
      test: "swipe on progress bar outside cutting zone does not cut",
      before: progressBefore,
      after: afterBarOnly,
      pass: afterBarOnly === progressBefore,
    });
  }

  return results;
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const results = [];

  for (const size of [
    { w: 390, h: 844, label: "390" },
    { w: 430, h: 932, label: "430" },
    { w: 1280, h: 800, label: "1280" },
  ]) {
    const page = await browser.newPage({ viewport: { width: size.w, height: size.h } });
    await startGame(page);
    results.push(...(await runGameplayChecks(page, size.label, size.h)));
    await page.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter((r) => r.pass === false);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
