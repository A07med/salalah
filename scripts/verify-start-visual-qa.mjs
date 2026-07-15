/**
 * StartScreen visual QA — overlap checks + production screenshots.
 * Run against a production server (no Next.js overlay):
 *   BASE_URL=http://localhost:3010 node scripts/verify-start-visual-qa.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const OUT = path.resolve(".cursor/references");

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "1280", width: 1280, height: 800 },
];

const TEST_LEADERBOARD = [
  { id: "1", name: "احمد العبري", score: 5960, date: Date.now() },
  { id: "2", name: "عبدالرحمن محمد الكثيري", score: 12500, date: Date.now() },
  {
    id: "3",
    name: "مستخدم باسم طويل جدًا للاختبار",
    score: 99999,
    date: Date.now(),
  },
];

function overlaps(a, b, pad = 0.5) {
  return !(
    a.right <= b.left + pad ||
    a.left >= b.right - pad ||
    a.bottom <= b.top + pad ||
    a.top >= b.bottom - pad
  );
}

async function box(page, selector) {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    };
  });
}

async function setupStart(page) {
  await page.addInitScript((entries) => {
    localStorage.setItem("khareef_best_score", "5960");
    localStorage.setItem("khareef_leaderboard", JSON.stringify(entries));
  }, TEST_LEADERBOARD);

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function checkOverlaps(page, label) {
  const results = [];

  const pairs = [
    ["[data-qa=start-banner]", "[data-qa=start-headline]", "banner vs headline"],
    ["[data-qa=start-headline]", "[data-qa=start-hero]", "headline vs hero"],
    ["[data-qa=start-hero]", "[data-qa=start-instructions]", "hero vs instructions"],
    [
      "[data-qa=start-instructions]",
      "[data-qa=start-best-score]",
      "instructions vs best-score",
    ],
    ["[data-qa=start-best-score]", "[data-qa=start-form]", "best-score vs form"],
    ["[data-qa=start-form]", "[data-qa=start-leaderboard]", "form vs leaderboard"],
  ];

  for (const [aSel, bSel, name] of pairs) {
    const aCount = await page.locator(aSel).count();
    const bCount = await page.locator(bSel).count();
    if (!aCount || !bCount) {
      results.push({ viewport: label, test: name, pass: true, skip: true });
      continue;
    }
    const a = await box(page, aSel);
    const b = await box(page, bSel);
    const hit = overlaps(a, b);
    results.push({
      viewport: label,
      test: name,
      pass: !hit,
      gap: Math.round(b.top - a.bottom),
    });
  }

  // Headline line count via range rects
  const lineInfo = await page.locator("[data-qa=start-headline] h1").evaluate((h1) => {
    const lines = [...h1.querySelectorAll(".game-headline-line")];
    return lines.map((line) => {
      const r = line.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height, text: line.textContent };
    });
  });
  results.push({
    viewport: label,
    test: "headline exactly 2 lines",
    pass: lineInfo.length === 2,
    value: lineInfo.length,
  });

  // Banner fully visible
  const banner = await box(page, "[data-qa=start-banner]");
  results.push({
    viewport: label,
    test: "banner fully in viewport top",
    pass: banner.top >= 0,
    value: Math.round(banner.top),
  });

  // Best-score inline gap
  if (await page.locator("[data-qa=start-best-score]").count()) {
    const bestGap = await page.locator("[data-qa=start-best-score]").evaluate((el) => {
      const kids = [...el.children];
      if (kids.length < 2) return -1;
      const a = kids[0].getBoundingClientRect();
      const b = kids[1].getBoundingClientRect();
      return Math.abs(a.left < b.left ? b.left - a.right : a.left - b.right);
    });
    if (bestGap >= 0) {
      results.push({
        viewport: label,
        test: "best-score label/value gap",
        pass: bestGap >= 8 && bestGap <= 20,
        value: Math.round(bestGap),
      });
    }
  } else {
    results.push({
      viewport: label,
      test: "best-score present",
      pass: false,
    });
  }

  // Leaderboard grid
  const rows = page.locator("[data-qa=leaderboard-row]");
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = await row.evaluate((el) => {
      const style = getComputedStyle(el);
      const kids = [...el.children].map((c) => {
        const r = c.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          text: c.textContent?.trim() ?? "",
        };
      });
      return {
        template: style.gridTemplateColumns,
        minHeight: parseFloat(style.minHeight),
        height: el.getBoundingClientRect().height,
        kids,
      };
    });

    results.push({
      viewport: label,
      test: `row ${i + 1} grid columns`,
      pass: cells.kids.length === 3 && cells.template.startsWith("36px"),
      value: cells.template,
    });
    results.push({
      viewport: label,
      test: `row ${i + 1} min height`,
      pass: cells.height >= 48,
      value: Math.round(cells.height),
    });

    if (cells.kids.length >= 3) {
      const [rank, name, score] = cells.kids;
      const nameScoreOverlap = !(name.right <= score.left + 0.5 || score.right <= name.left + 0.5);
      // In RTL physical placement: score column and name must not overlap
      results.push({
        viewport: label,
        test: `row ${i + 1} name vs score no overlap`,
        pass: !nameScoreOverlap,
        value: Math.round(Math.min(Math.abs(name.right - score.left), Math.abs(score.right - name.left))),
      });
      const rankNameOverlap = !(rank.right <= name.left + 0.5 || name.right <= rank.left + 0.5);
      results.push({
        viewport: label,
        test: `row ${i + 1} rank vs name no overlap`,
        pass: !rankNameOverlap,
      });
    }
  }

  // Hero size
  const hero = await box(page, "[data-qa=start-hero]");
  results.push({
    viewport: label,
    test: "start hero width in clamp range",
    pass: hero.width >= 150 && hero.width <= 195,
    value: Math.round(hero.width),
  });

  // Cleaver decoration present
  const cleaverSrc = await page
    .locator('img[src="/assets/open-source/meat-cleaver.svg"]')
    .count();
  results.push({
    viewport: label,
    test: "cleaned cleaver decoration present",
    pass: cleaverSrc >= 1,
  });

  // No horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  results.push({
    viewport: label,
    test: "no horizontal overflow",
    pass: !overflow,
  });

  return { results, hero, lineInfo };
}

async function measureGameplay(page, label) {
  await page.fill('input[placeholder="اسم اللاعب"]', "اختبار");
  await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  await page.waitForSelector("[data-qa=fruit-body]");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const fruitMetrics = await page.locator("[data-qa=fruit-body] svg").evaluate((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      offsetWidth: parseFloat(cs.width) || el.clientWidth || r.width,
      offsetHeight: parseFloat(cs.height) || el.clientHeight || r.height,
      bboxW: r.width,
      bboxH: r.height,
    };
  });
  const hitbox = await page.locator("[data-qa=coconut-hitbox]").boundingBox();
  const cleaver = await page
    .locator("[data-qa=gameplay-cleaver]")
    .boundingBox()
    .catch(() => null);

  const results = [];
  if (fruitMetrics) {
    const growth = (fruitMetrics.offsetHeight / 168 - 1) * 100;
    results.push({
      viewport: label,
      test: "gameplay mishli height",
      pass: fruitMetrics.offsetHeight >= 185 && fruitMetrics.offsetHeight <= 220,
      value: Math.round(fruitMetrics.offsetHeight),
      growthPct: Math.round(growth),
    });
  }
  if (fruitMetrics && hitbox) {
    const fruitBox = await page.locator("[data-qa=fruit-body] svg").boundingBox();
    results.push({
      viewport: label,
      test: "hitbox inside fruit bounds",
      pass:
        !!fruitBox &&
        hitbox.x >= fruitBox.x - 2 &&
        hitbox.y >= fruitBox.y - 2 &&
        hitbox.x + hitbox.width <= fruitBox.x + fruitBox.width + 2 &&
        hitbox.y + hitbox.height <= fruitBox.y + fruitBox.height + 2,
    });
  }
  if (fruitMetrics && cleaver) {
    results.push({
      viewport: label,
      test: "cleaver smaller than fruit",
      pass:
        cleaver.width < fruitMetrics.offsetWidth &&
        cleaver.height < fruitMetrics.offsetHeight,
      fruit: Math.round(fruitMetrics.offsetHeight),
      cleaver: Math.round(cleaver.height),
    });
  }

  return { results, fruit: fruitMetrics };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    channel: process.env.PW_CHANNEL || "chrome",
    headless: true,
  });
  const all = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: "ar",
    });
    const page = await context.newPage();
    await setupStart(page);

    const overlap = await checkOverlaps(page, vp.name);
    all.push(...overlap.results);

    const shotPath = path.join(OUT, `polish-start-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Screenshot: ${shotPath}`);
    console.log(
      `  Start hero ${vp.name}: ${Math.round(overlap.hero.width)}×${Math.round(overlap.hero.height)}`,
    );
    console.log(`  Headline lines: ${overlap.lineInfo.length}`);

    if (vp.name !== "1280") {
      const gp = await measureGameplay(page, vp.name);
      all.push(...gp.results);
      const gpShot = path.join(OUT, `polish-game-${vp.name}.png`);
      await page.screenshot({ path: gpShot, fullPage: false });
      console.log(`Screenshot: ${gpShot}`);
      if (gp.fruit) {
        console.log(
          `  Gameplay Mishli ${vp.name}: ${Math.round(gp.fruit.offsetWidth)}×${Math.round(gp.fruit.offsetHeight)} (layout)`,
        );
      }
    }

    await context.close();
  }

  console.log("\n=== Results ===");
  let failed = 0;
  for (const r of all) {
    const mark = r.pass ? "PASS" : "FAIL";
    if (!r.pass) failed += 1;
    console.log(
      `[${mark}] ${r.viewport} · ${r.test}${r.value != null ? ` = ${r.value}` : ""}${r.growthPct != null ? ` (+${r.growthPct}%)` : ""}`,
    );
  }
  console.log(`\n${all.length - failed}/${all.length} passed`);
  await browser.close();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
