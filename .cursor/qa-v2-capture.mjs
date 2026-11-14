import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3210";
const outDir = path.join(process.cwd(), ".cursor", "qa-v2");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

const viewports = [
  { name: "390", width: 390, height: 844, touch: true },
  { name: "430", width: 430, height: 932, touch: true },
  { name: "1440", width: 1440, height: 900, touch: false },
];

const report = [];

async function swipe(page, box, x1, y1, x2, y2) {
  await page.mouse.move(box.x + box.width * x1, box.y + box.height * y1);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * x2, box.y + box.height * y2, {
    steps: 12,
  });
  await page.mouse.up();
}

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    hasTouch: vp.touch,
    isMobile: vp.touch,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-start.png`),
    fullPage: true,
  });

  await page.locator("[data-qa=start-input]").fill("أحمد");
  if (vp.touch) {
    await page.getByRole("button", { name: "ابدأ اللعب" }).tap();
  } else {
    await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  }
  await page.locator("[data-qa=game-stage]").waitFor({ state: "visible" });
  await page.waitForTimeout(600);

  const measurements = await page.evaluate(() => {
    const overflow =
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth + 1;
    const hasProgress = Boolean(
      document.querySelector("[data-qa=cut-progress-bar]"),
    );
    const hasLevel = Boolean(
      [...document.querySelectorAll("*")].some((el) =>
        (el.textContent || "").includes("المستوى"),
      ),
    );
    const attempt = document
      .querySelector("[data-qa=attempt-badge]")
      ?.textContent?.replace(/\s+/g, " ")
      .trim();
    const target = Boolean(document.querySelector("[data-qa=cut-target]"));
    const fruit = document.querySelector("[data-qa=fruit-body]");
    const board = document.querySelector("[data-qa=chopping-board]");
    let fruitContained = false;
    if (fruit && board) {
      const fr = fruit.getBoundingClientRect();
      const br = board.getBoundingClientRect();
      fruitContained =
        fr.left >= br.left - 8 &&
        fr.right <= br.right + 8 &&
        fr.bottom <= br.bottom + 24;
    }
    return { overflow, hasProgress, hasLevel, attempt, target, fruitContained };
  });

  await page.screenshot({
    path: path.join(outDir, `${vp.name}-fruit1-ready.png`),
  });

  const zone = page.locator("[data-qa=cutting-zone]");
  const box = await zone.boundingBox();
  if (!box) throw new Error("missing cutting zone");

  // Hit swipe — capture immediately for cleaver-at-impact
  const hitPromise = page
    .locator("[data-qa=attempt-score-pop]")
    .waitFor({ state: "visible", timeout: 2000 });
  await swipe(page, box, 0.18, 0.48, 0.82, 0.48);
  await page.waitForTimeout(40);
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-fruit1-impact.png`),
  });
  await hitPromise;
  await page.waitForTimeout(280);
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-fruit1-result.png`),
  });

  // Wait for fruit 2
  await page.waitForFunction(
    () =>
      (document.querySelector("[data-qa=attempt-badge]")?.textContent || "")
        .replace(/\s+/g, " ")
        .includes("المشلي ٢ من ٣"),
    { timeout: 3000 },
  );
  await page.waitForTimeout(200);
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-fruit2-ready.png`),
  });

  // Deliberate miss — left of padded hitbox (HIT_PADDING = 22)
  const hitBox = await page.evaluate(() => {
    const h = document
      .querySelector("[data-qa=coconut-hitbox]")
      ?.getBoundingClientRect();
    if (!h) return null;
    return { l: h.left, t: h.top, b: h.bottom };
  });
  if (!hitBox) throw new Error("missing hitbox");
  const missPromise = page
    .locator("[data-qa=attempt-score-pop]")
    .waitFor({ state: "visible", timeout: 2000 });
  const missY = (hitBox.t + hitBox.b) / 2;
  await page.mouse.move(hitBox.l - 55, missY);
  await page.mouse.down();
  await page.mouse.move(hitBox.l - 30, missY, { steps: 8 });
  await page.mouse.up();
  await missPromise;
  await page.waitForTimeout(120);
  const missText = await page
    .locator("[data-qa=attempt-score-pop]")
    .innerText();
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-miss-result.png`),
  });

  await page.waitForFunction(
    () =>
      (document.querySelector("[data-qa=attempt-badge]")?.textContent || "")
        .replace(/\s+/g, " ")
        .includes("المشلي ٣ من ٣"),
    { timeout: 3000 },
  );
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-fruit3-ready.png`),
  });

  const fruit3Pop = page
    .locator("[data-qa=attempt-score-pop]")
    .waitFor({ state: "visible", timeout: 2500 });
  await swipe(page, box, 0.22, 0.55, 0.78, 0.45);
  await fruit3Pop;
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-fruit3-split.png`),
  });

  await page.locator("[data-qa=final-run-modal]").waitFor({
    state: "visible",
    timeout: 4000,
  });
  await page.screenshot({
    path: path.join(outDir, `${vp.name}-final-modal.png`),
  });

  report.push({
    viewport: `${vp.width}x${vp.height}`,
    measurements,
    missText: missText.replace(/\s+/g, " ").trim(),
    pageErrors: errors,
    finalVisible: await page.locator("[data-qa=final-run-modal]").isVisible(),
  });

  await context.close();
}

await browser.close();
fs.writeFileSync(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
