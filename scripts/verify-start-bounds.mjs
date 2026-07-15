/**
 * StartScreen portrait-canvas bounds QA.
 * BASE_URL=http://localhost:3022 node scripts/verify-start-bounds.mjs
 */
import { chromium, webkit } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3022";
const OUT = path.join(process.cwd(), ".cursor/references");

const PRIMARY = [
  "start-banner",
  "start-headline",
  "start-hero",
  "start-instructions",
  "start-best-score",
  "start-form",
  "start-leaderboard",
];

const VIEWPORTS = [
  { name: "390", width: 390, height: 844, engine: "chromium" },
  { name: "430", width: 430, height: 932, engine: "chromium" },
  { name: "1280", width: 1280, height: 800, engine: "chromium" },
  { name: "1440", width: 1440, height: 900, engine: "chromium" },
];

const LB = [
  { id: "1", name: "احمد العبري", score: 5960, date: Date.now() },
  { id: "2", name: "عبدالرحمن محمد الكثيري", score: 12500, date: Date.now() },
  {
    id: "3",
    name: "مستخدم باسم طويل جدًا للاختبار",
    score: 99999,
    date: Date.now(),
  },
];

async function setup(page) {
  await page.addInitScript((entries) => {
    localStorage.setItem("khareef_best_score", "5960");
    localStorage.setItem("khareef_leaderboard", JSON.stringify(entries));
  }, LB);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function checkBounds(page, label) {
  const results = [];
  const data = await page.evaluate((primary) => {
    const shell = document.querySelector("[data-qa=game-shell]");
    if (!shell) return { error: "no shell" };
    const shellRect = shell.getBoundingClientRect();
    const items = primary.map((id) => {
      const el = document.querySelector(`[data-qa=${id}]`);
      if (!el) return { id, missing: true };
      const r = el.getBoundingClientRect();
      const pad = 0.75;
      return {
        id,
        left: r.left,
        right: r.right,
        width: r.width,
        inside:
          r.left >= shellRect.left - pad && r.right <= shellRect.right + pad,
        shellLeft: shellRect.left,
        shellRight: shellRect.right,
        shellWidth: shellRect.width,
      };
    });
    const col = document.querySelector("[data-qa=start-column]");
    const colDisplay = col ? getComputedStyle(col).display : null;
    const colFlex = col ? getComputedStyle(col).flexDirection : null;
    const headlineLines = document.querySelectorAll(
      "[data-qa=start-headline] .game-headline-line",
    ).length;
    const hasLgRow = !!document.querySelector(
      ".lg\\:flex-row, [class*='lg:flex-row']",
    );
    return {
      shellWidth: shellRect.width,
      shellLeft: shellRect.left,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      noHScroll:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1,
      colDisplay,
      colFlex,
      headlineLines,
      hasLgRow,
      items,
    };
  }, PRIMARY);

  if (data.error) {
    results.push({ viewport: label, test: "game-shell present", pass: false });
    return results;
  }

  results.push({
    viewport: label,
    test: "shell max-width ≤ 480",
    pass: data.shellWidth <= 480.5,
    value: Math.round(data.shellWidth),
  });
  results.push({
    viewport: label,
    test: "no horizontal overflow",
    pass: data.noHScroll,
    value: `${data.scrollWidth}/${data.clientWidth}`,
  });
  results.push({
    viewport: label,
    test: "single-column flex",
    pass: data.colFlex === "column",
    value: data.colFlex,
  });
  results.push({
    viewport: label,
    test: "headline 2 lines",
    pass: data.headlineLines === 2,
    value: data.headlineLines,
  });

  for (const item of data.items) {
    if (item.missing) {
      // best-score may be absent if score 0 — we seed it
      results.push({
        viewport: label,
        test: `${item.id} present`,
        pass: item.id === "start-best-score",
      });
      continue;
    }
    results.push({
      viewport: label,
      test: `${item.id} inside shell`,
      pass: item.inside,
      value: `L${Math.round(item.left)} R${Math.round(item.right)} vs ${Math.round(item.shellLeft)}-${Math.round(item.shellRight)}`,
    });
  }

  // Leaderboard below form (same column)
  const order = await page.evaluate(() => {
    const form = document.querySelector("[data-qa=start-form]");
    const board = document.querySelector("[data-qa=start-leaderboard]");
    if (!form || !board) return null;
    const fr = form.getBoundingClientRect();
    const br = board.getBoundingClientRect();
    return { formBottom: fr.bottom, boardTop: br.top, below: br.top >= fr.bottom - 1 };
  });
  if (order) {
    results.push({
      viewport: label,
      test: "leaderboard below CTA/form",
      pass: order.below,
      value: Math.round(order.boardTop - order.formBottom),
    });
  }

  return results;
}

async function shots(page, tag) {
  await page.screenshot({
    path: path.join(OUT, `bounds-start-${tag}-top.png`),
    fullPage: false,
  });
  await page.locator("[data-qa=start-scroll]").evaluate((el) => {
    el.scrollTop = el.scrollHeight * 0.45;
  });
  await page.waitForTimeout(150);
  await page.screenshot({
    path: path.join(OUT, `bounds-start-${tag}-mid.png`),
    fullPage: false,
  });
  await page.locator("[data-qa=start-scroll]").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(150);
  await page.screenshot({
    path: path.join(OUT, `bounds-start-${tag}-bottom.png`),
    fullPage: false,
  });
  await page.screenshot({
    path: path.join(OUT, `bounds-start-${tag}-full.png`),
    fullPage: true,
  });
}

async function runBrowser(browserType, engineName, vp) {
  const launchOpts =
    engineName === "chromium"
      ? { channel: "chrome", headless: true }
      : { headless: true };
  const browser = await browserType.launch(launchOpts);
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    locale: "ar",
  });
  const page = await context.newPage();
  await setup(page);
  const results = await checkBounds(page, `${engineName}-${vp.name}`);
  await shots(page, `${engineName}-${vp.name}`);
  await context.close();
  await browser.close();
  return results;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const all = [];

  for (const vp of VIEWPORTS) {
    const results = await runBrowser(chromium, "chromium", vp);
    all.push(...results);
    console.log(`Captured chromium ${vp.name}`);
  }

  try {
    const wk = await runBrowser(webkit, "webkit", {
      name: "1440",
      width: 1440,
      height: 900,
    });
    all.push(...wk);
    console.log("Captured webkit 1440");
  } catch (err) {
    console.log("WebKit unavailable:", err?.message ?? err);
    all.push({
      viewport: "webkit-1440",
      test: "webkit browser available",
      pass: false,
      value: String(err?.message ?? err),
    });
  }

  let failed = 0;
  console.log("\n=== Bounds results ===");
  for (const r of all) {
    if (r.test === "webkit browser available" && !r.pass) {
      console.log(`[SKIP] ${r.viewport} · ${r.test} = ${r.value}`);
      continue;
    }
    const mark = r.pass ? "PASS" : "FAIL";
    if (!r.pass) failed += 1;
    console.log(
      `[${mark}] ${r.viewport} · ${r.test}${r.value != null ? ` = ${r.value}` : ""}`,
    );
  }
  console.log(`\n${all.filter((r) => r.pass).length} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
