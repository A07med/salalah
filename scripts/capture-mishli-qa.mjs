/**
 * Capture gameplay layout QA screenshots from production preview.
 * Run: node scripts/capture-mishli-qa.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const OUT = ".cursor/references";

async function startGame(page) {
  await page.goto(BASE);
  await page.fill('input[placeholder="اسم اللاعب"]', "اختبار");
  await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.waitForSelector("[data-qa=coconut-hitbox]");
  await page.waitForTimeout(1000);
}

async function captureGameplaySequence(page, prefix) {
  await startGame(page);
  await page.screenshot({ path: `${OUT}/${prefix}-before.png` });

  const box = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  if (!box) throw new Error("hitbox missing");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx - 40, cy - 15);
  await page.mouse.down();
  await page.mouse.move(cx + 40, cy + 15, { steps: 8 });
  await page.screenshot({ path: `${OUT}/${prefix}-during.png` });
  await page.mouse.up();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${prefix}-after.png` });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });

  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await captureGameplaySequence(page, "layout-fix-game-390");
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
    await captureGameplaySequence(page, "layout-fix-game-430");
    await page.close();
  }

  await browser.close();
  console.log("Screenshots saved to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
