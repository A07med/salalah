import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:3225";
const outDir = path.join(process.cwd(), ".cursor", "qa-hud-fix");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

async function startGame(page, touch) {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("[data-qa=start-input]").fill("قصاص");
  if (touch) await page.getByRole("button", { name: "ابدأ اللعب" }).tap();
  else await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.locator("[data-qa=game-stage]").waitFor();
  await page.waitForTimeout(450);
}

async function mouseSwipe(page, x1, y1, x2, y2) {
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y2, { steps: 14 });
  await page.mouse.up();
}

async function touchSwipe(page, context, x1, y1, x2, y2) {
  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: x1, y: y1 }],
  });
  for (let i = 1; i <= 12; i++) {
    const t = i / 12;
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t }],
    });
  }
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

async function fruitGeom(page) {
  return page.evaluate(() => {
    const fruit = document.querySelector("[data-qa=fruit-body]").getBoundingClientRect();
    const hit = document.querySelector("[data-qa=coconut-hitbox]").getBoundingClientRect();
    const zone = document.querySelector("[data-qa=cutting-zone]").getBoundingClientRect();
    const board = document.querySelector("[data-qa=chopping-board]").getBoundingClientRect();
    return {
      fruit: { x: fruit.x, y: fruit.y, w: fruit.width, h: fruit.height },
      hit: { l: hit.left, r: hit.right, t: hit.top, b: hit.bottom },
      zone: { x: zone.x, y: zone.y, w: zone.width, h: zone.height },
      board: { x: board.x, y: board.y, w: board.width, h: board.height },
    };
  });
}

const report = { mouse: null, touch: null, viewports: [] };

// --- Mouse proof (including board-outside start) ---
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  await startGame(page, false);
  const g = await fruitGeom(page);
  // Start on board left of fruit, cross through centre
  await mouseSwipe(
    page,
    g.board.x + 16,
    g.fruit.y + g.fruit.h * 0.5,
    g.fruit.x + g.fruit.w * 0.9,
    g.fruit.y + g.fruit.h * 0.5,
  );
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({
    score: document.querySelector("[data-qa=score-value]")?.textContent,
    pop: document.querySelector("[data-qa=attempt-score-pop]")?.textContent,
    mini0: document.querySelector("[data-qa=mini-mishli-0]")?.getAttribute("data-state"),
  }));
  report.mouse = { after, errors, outsideStartWorked: Boolean(after.pop) };
  await context.close();
}

// --- Touch proof ---
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  await startGame(page, true);
  const g = await fruitGeom(page);
  await touchSwipe(
    page,
    context,
    g.board.x + 16,
    g.fruit.y + g.fruit.h * 0.5,
    g.fruit.x + g.fruit.w * 0.9,
    g.fruit.y + g.fruit.h * 0.5,
  );
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({
    score: document.querySelector("[data-qa=score-value]")?.textContent,
    pop: document.querySelector("[data-qa=attempt-score-pop]")?.textContent,
    mini0: document.querySelector("[data-qa=mini-mishli-0]")?.getAttribute("data-state"),
  }));
  report.touch = { after, errors, outsideStartWorked: Boolean(after.pop) };
  await context.close();
}

const viewports = [
  { name: "390", width: 390, height: 844, touch: true },
  { name: "430", width: 430, height: 932, touch: true },
  { name: "1440", width: 1440, height: 900, touch: false },
];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    hasTouch: vp.touch,
    isMobile: vp.touch,
  });
  const page = await context.newPage();
  await startGame(page, vp.touch);

  const hud = await page.evaluate(() => {
    const score = document.querySelector("[data-qa=score-board]")?.getBoundingClientRect();
    const cuts = document.querySelector("[data-qa=attempt-cuts-card]")?.getBoundingClientRect();
    const overflow =
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth + 1;
    const pe = {
      target: getComputedStyle(document.querySelector("[data-qa=cut-target]") || document.body).pointerEvents,
      cleaverParent: getComputedStyle(document.querySelector("[data-qa=game-stage] .pointer-events-none") || document.body).pointerEvents,
      back: getComputedStyle(document.querySelector(".stall-back-tag") || document.body).pointerEvents,
      zone: getComputedStyle(document.querySelector("[data-qa=cutting-zone]")).pointerEvents,
      boardSvg: getComputedStyle(document.querySelector("[data-qa=chopping-board] svg")).pointerEvents,
    };
    return {
      overflow,
      score: score && { x: score.x, y: score.y, w: score.width, h: score.height },
      cuts: cuts && { x: cuts.x, y: cuts.y, w: cuts.width, h: cuts.height },
      heightsMatch: score && cuts ? Math.abs(score.height - cuts.height) <= 2 : false,
      scoreLeftOfCuts: score && cuts ? score.x < cuts.x : false,
      pe,
      zeroText: document.querySelector("[data-qa=score-value]")?.textContent,
      pending: [...document.querySelectorAll("[data-qa^=mini-mishli-]")].map((el) =>
        el.getAttribute("data-state"),
      ),
    };
  });

  await page.screenshot({ path: path.join(outDir, `${vp.name}-initial.png`) });

  const swipe = async (x1, y1, x2, y2) => {
    if (vp.touch) await touchSwipe(page, context, x1, y1, x2, y2);
    else await mouseSwipe(page, x1, y1, x2, y2);
  };

  let g = await fruitGeom(page);
  // Excellent / centre cut
  await swipe(
    g.fruit.x + g.fruit.w * 0.12,
    g.fruit.y + g.fruit.h * 0.5,
    g.fruit.x + g.fruit.w * 0.88,
    g.fruit.y + g.fruit.h * 0.5,
  );
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(outDir, `${vp.name}-impact.png`) });
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(outDir, `${vp.name}-excellent.png`) });
  await page.waitForTimeout(900);

  // Miss
  g = await fruitGeom(page);
  await swipe(g.hit.l - 55, (g.hit.t + g.hit.b) / 2, g.hit.l - 28, (g.hit.t + g.hit.b) / 2);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outDir, `${vp.name}-miss.png`) });
  await page.waitForTimeout(900);

  // Weak / bad angle through fruit
  g = await fruitGeom(page);
  await swipe(
    g.fruit.x + g.fruit.w * 0.45,
    g.fruit.y + g.fruit.h * 0.15,
    g.fruit.x + g.fruit.w * 0.55,
    g.fruit.y + g.fruit.h * 0.9,
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, `${vp.name}-weak.png`) });

  await page.locator("[data-qa=final-run-modal]").waitFor({ state: "visible", timeout: 3500 });
  const finals = await page.evaluate(() => ({
    states: [...document.querySelectorAll("[data-qa^=mini-mishli-]")].map((el) => ({
      qa: el.getAttribute("data-qa"),
      state: el.getAttribute("data-state"),
      fill: el.querySelector("path")?.getAttribute("fill"),
    })),
    total: document.querySelector("[data-qa=score-value]")?.textContent,
    rows: [...document.querySelectorAll("[data-qa=final-attempt-row]")].map((el) =>
      el.textContent?.replace(/\s+/g, " ").trim(),
    ),
  }));
  await page.screenshot({ path: path.join(outDir, `${vp.name}-final.png`) });

  report.viewports.push({ viewport: `${vp.width}x${vp.height}`, hud, finals });
  await context.close();
}

// Medium capture on 390 only — restart and aim for medium
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await startGame(page, true);
  const g = await fruitGeom(page);
  // Mild offset horizontal
  await touchSwipe(
    page,
    context,
    g.fruit.x + g.fruit.w * 0.1,
    g.fruit.y + g.fruit.h * 0.62,
    g.fruit.x + g.fruit.w * 0.9,
    g.fruit.y + g.fruit.h * 0.62,
  );
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(outDir, "390-medium.png") });
  await context.close();
}

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
