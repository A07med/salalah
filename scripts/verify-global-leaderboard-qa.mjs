import path from "node:path";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3032";
const OUT = path.join(process.cwd(), ".cursor/references");
const ENTRIES = [
  { playerName: "أحمد العبري", score: 5960, levelReached: 4 },
  {
    playerName: "اسم عربي طويل جداً لاختبار الاقتصاص بدون تغطية النتيجة",
    score: 4000,
    levelReached: 3,
  },
  { playerName: "Mishli Pro", score: 3000, levelReached: 3 },
  { playerName: "سالم", score: 2000, levelReached: 2 },
  { playerName: "مريم", score: 1000, levelReached: 2 },
];

const viewports = [
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "1440", width: 1440, height: 900 },
];

async function preparePage(context, entries = ENTRIES) {
  const page = await context.newPage();
  await page.route("**/api/leaderboard?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ entries }),
    }),
  );
  await page.addInitScript(() => {
    localStorage.setItem("khareef_best_score", "5960");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  if (entries.length > 0) {
    await page.waitForSelector("[data-qa=leaderboard-row]");
  } else {
    await page.getByText("العب أول جولة وسجّل أول نتيجة!").waitFor();
  }
  return page;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: "ar",
    });
    const page = await preparePage(context);

    const metrics = await page.evaluate(() => {
      const input = document.querySelector("[data-qa=start-input]");
      const button = document.querySelector("[data-qa=start-cta] button");
      const shell = document.querySelector("[data-qa=game-shell]");
      const headline = document.querySelector("[data-qa=start-headline] h1");
      const rows = [...document.querySelectorAll("[data-qa=leaderboard-row]")];
      if (!input || !button || !shell || !headline) return null;

      const inputRect = input.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const shellRect = shell.getBoundingClientRect();
      const scores = rows.map((row) => row.lastElementChild);
      return {
        rowCount: rows.length,
        inputButtonLeftDelta: Math.abs(inputRect.left - buttonRect.left),
        inputButtonRightDelta: Math.abs(inputRect.right - buttonRect.right),
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
        shellCenterDelta: Math.abs(
          shellRect.left + shellRect.width / 2 - window.innerWidth / 2,
        ),
        headlineShadow: getComputedStyle(headline).textShadow,
        scoreWraps: scores.some(
          (score) =>
            score instanceof HTMLElement &&
            score.scrollWidth > score.clientWidth + 1,
        ),
        rowOverflows: rows.some(
          (row) => row.scrollWidth > row.clientWidth + 1,
        ),
      };
    });

    await page.locator("[data-qa=start-leaderboard]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.screenshot({
      path: path.join(
        OUT,
        `global-leaderboard-after-${viewport.name}.png`,
      ),
    });
    await page.screenshot({
      path: path.join(
        OUT,
        `global-leaderboard-after-${viewport.name}-full.png`,
      ),
      fullPage: true,
    });

    if (viewport.name === "1440") {
      const shell = await page.locator("[data-qa=game-shell]").boundingBox();
      if (shell) {
        await page.screenshot({
          path: path.join(
            OUT,
            "global-leaderboard-after-1440-canvas.png",
          ),
          clip: {
            x: shell.x,
            y: 0,
            width: shell.width,
            height: viewport.height,
          },
        });
      }
    }

    results.push({ viewport: viewport.name, ...metrics });
    await context.close();
  }

  const statesContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "ar",
  });

  const emptyPage = await preparePage(statesContext, []);
  await emptyPage.locator("[data-qa=start-leaderboard]").scrollIntoViewIfNeeded();
  await emptyPage.screenshot({
    path: path.join(OUT, "global-leaderboard-empty-390.png"),
  });
  await emptyPage.close();

  const errorPage = await statesContext.newPage();
  await errorPage.goto(BASE_URL, { waitUntil: "networkidle" });
  await errorPage.waitForSelector("[data-qa=leaderboard-error]");
  await errorPage.locator("[data-qa=start-leaderboard]").scrollIntoViewIfNeeded();
  await errorPage.screenshot({
    path: path.join(OUT, "global-leaderboard-error-390.png"),
  });
  await errorPage.close();

  const loadingPage = await statesContext.newPage();
  await loadingPage.route("**/api/leaderboard?*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5_000));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ entries: ENTRIES }),
    });
  });
  await loadingPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await loadingPage.waitForSelector("[data-qa=leaderboard-loading]");
  await loadingPage
    .locator("[data-qa=start-leaderboard]")
    .scrollIntoViewIfNeeded();
  await loadingPage.screenshot({
    path: path.join(OUT, "global-leaderboard-loading-390.png"),
  });
  await loadingPage.close();
  await statesContext.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));

  const failed = results.some(
    (result) =>
      result.rowCount !== 5 ||
      result.inputButtonLeftDelta > 1 ||
      result.inputButtonRightDelta > 1 ||
      result.horizontalOverflow ||
      result.shellCenterDelta > 1 ||
      result.headlineShadow === "none" ||
      result.scoreWraps ||
      result.rowOverflows,
  );
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
