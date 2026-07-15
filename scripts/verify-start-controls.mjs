/**
 * Measure StartScreen input/CTA alignment + capture consistency screenshots.
 * BASE_URL=http://localhost:3024 node scripts/verify-start-controls.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3024";
const OUT = path.join(process.cwd(), ".cursor/references");

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "1440", width: 1440, height: 900 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: "ar",
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem("khareef_best_score", "5960");
    });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);

    const m = await page.evaluate(() => {
      const input = document.querySelector("[data-qa=start-input]");
      const ctaWrap = document.querySelector("[data-qa=start-cta]");
      const button = ctaWrap?.querySelector("button") ?? ctaWrap;
      const h1 = document.querySelector("[data-qa=start-headline] h1");
      if (!input || !button || !h1) return null;
      const ir = input.getBoundingClientRect();
      const br = button.getBoundingClientRect();
      const cs = getComputedStyle(h1);
      return {
        input: { left: ir.left, right: ir.right, width: ir.width, height: ir.height },
        button: { left: br.left, right: br.right, width: br.width, height: br.height },
        leftDelta: Math.abs(ir.left - br.left),
        rightDelta: Math.abs(ir.right - br.right),
        widthDelta: Math.abs(ir.width - br.width),
        textShadow: cs.textShadow,
        lines: document.querySelectorAll("[data-qa=start-headline] .game-headline-line").length,
        overflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      };
    });

    results.push({
      viewport: vp.name,
      pass:
        !!m &&
        m.leftDelta <= 1 &&
        m.rightDelta <= 1 &&
        m.lines === 2 &&
        !m.overflow &&
        m.textShadow !== "none",
      ...m,
    });

    await page.locator("[data-qa=start-scroll]").evaluate(() => {
      const form = document.querySelector("[data-qa=start-form]");
      if (form) form.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(100);
    await page.screenshot({
      path: path.join(OUT, `consistency-start-${vp.name}.png`),
      fullPage: false,
    });

    if (vp.name === "1440") {
      const shell = await page.locator("[data-qa=game-shell]").boundingBox();
      if (shell) {
        await page.screenshot({
          path: path.join(OUT, "consistency-start-1440-canvas.png"),
          clip: {
            x: Math.max(0, shell.x),
            y: 0,
            width: shell.width,
            height: Math.min(vp.height, shell.height || vp.height),
          },
        });
      }
      await page.screenshot({
        path: path.join(OUT, "consistency-start-1440-full.png"),
        fullPage: true,
      });
    }

    // Headline crop
    const hb = await page.locator("[data-qa=start-headline]").boundingBox();
    if (hb) {
      await page.screenshot({
        path: path.join(OUT, `consistency-headline-${vp.name}.png`),
        clip: {
          x: Math.max(0, hb.x - 8),
          y: Math.max(0, hb.y - 12),
          width: Math.min(vp.width, hb.width + 16),
          height: hb.height + 24,
        },
      });
    }

    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.pass).length;
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
