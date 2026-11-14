import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://172.20.10.4:3238";
const outDir = path.join(process.cwd(), ".cursor", "qa-gesture");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

const configs = [
  { name: "390-touch", width: 390, height: 844, touch: true },
  { name: "430-touch", width: 430, height: 932, touch: true },
  { name: "1440-mouse", width: 1440, height: 900, touch: false },
];

async function touchSegment(client, type, points) {
  await client.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: points,
  });
}

async function beginGesture(page, context, touch, x, y) {
  if (touch) {
    const client = await context.newCDPSession(page);
    await touchSegment(client, "touchStart", [{ x, y }]);
    return client;
  }
  await page.mouse.move(x, y);
  await page.mouse.down();
  return null;
}

async function moveGesture(page, client, touch, x, y) {
  if (touch) {
    await touchSegment(client, "touchMove", [{ x, y }]);
  } else {
    await page.mouse.move(x, y, { steps: 8 });
  }
}

async function endGesture(page, client, touch) {
  if (touch) {
    await touchSegment(client, "touchEnd", []);
  } else {
    await page.mouse.up();
  }
}

async function geometry(page) {
  return page.evaluate(() => {
    const get = (selector) =>
      document.querySelector(selector)?.getBoundingClientRect();
    const fruit = get("[data-qa=fruit-body]");
    const board = get("[data-qa=chopping-board]");
    const hit = get("[data-qa=coconut-hitbox]");
    if (!fruit || !board || !hit) throw new Error("Missing gameplay geometry");
    return {
      fruit: {
        left: fruit.left,
        right: fruit.right,
        top: fruit.top,
        bottom: fruit.bottom,
        cx: fruit.left + fruit.width / 2,
        cy: fruit.top + fruit.height / 2,
      },
      board: {
        left: board.left,
        right: board.right,
        top: board.top,
        bottom: board.bottom,
      },
      hit: {
        left: hit.left,
        right: hit.right,
        top: hit.top,
        bottom: hit.bottom,
      },
    };
  });
}

const report = [];

for (const config of configs) {
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    hasTouch: config.touch,
    isMobile: config.touch,
  });
  await context.addInitScript(() => {
    localStorage.setItem("khareef_best_score_v2", "2450");
    localStorage.setItem("khareef_player_name", "اختبار");
  });

  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) =>
    pageErrors.push(error.stack ?? error.message),
  );
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const response = await page.goto(base, {
    waitUntil: "networkidle",
    timeout: 20_000,
  });
  const startScroll = await page.evaluate(() => {
    const el = document.querySelector("[data-qa=start-scroll]");
    return {
      overflowY: el ? getComputedStyle(el).overflowY : null,
      scrollable: el ? el.scrollHeight >= el.clientHeight : false,
    };
  });

  if (config.touch) {
    await page.getByRole("button", { name: "ابدأ اللعب" }).tap();
  } else {
    await page.getByRole("button", { name: "ابدأ اللعب" }).click();
  }
  await page.locator("[data-qa=game-stage]").waitFor();
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const zone = document.querySelector("[data-qa=cutting-zone]");
    zone?.addEventListener("pointerdown", (event) => {
      window.__qaPointerId = event.pointerId;
      window.__qaPointerDowns = (window.__qaPointerDowns ?? 0) + 1;
    });
  });

  const initial = await page.evaluate(() => {
    const rect = (selector) => {
      const r = document.querySelector(selector)?.getBoundingClientRect();
      return r
        ? { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }
        : null;
    };
    const cuts = rect("[data-qa=attempt-cuts-card]");
    const score = rect("[data-qa=score-board]");
    const label = rect("[data-qa=attempt-cuts-label]");
    const card = document.querySelector("[data-qa=attempt-cuts-card]");
    const overlays = [
      "[data-qa=swipe-gesture-hint]",
      "[data-qa=cut-target]",
      "[data-qa=table-mishli-root]",
      "[data-qa=chopping-board] svg",
    ].map((selector) => ({
      selector,
      pointerEvents: getComputedStyle(document.querySelector(selector))
        .pointerEvents,
    }));
    return {
      attemptCount: document
        .querySelector("[data-qa=game-stage]")
        ?.getAttribute("data-attempt-count"),
      tutorial: document
        .querySelector("[data-qa=swipe-gesture-hint]")
        ?.textContent?.replace(/\s+/g, " ")
        .trim(),
      tutorialPointerEvents: getComputedStyle(
        document.querySelector("[data-qa=swipe-gesture-hint]"),
      ).pointerEvents,
      score,
      cuts,
      label,
      equalCardHeights:
        Boolean(score && cuts) && Math.abs(score.height - cuts.height) <= 1,
      labelInsideCard:
        Boolean(label && cuts) &&
        label.y >= cuts.y &&
        label.bottom <= cuts.bottom,
      cardOverflow: card ? getComputedStyle(card).overflow : null,
      horizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
      overlays,
      backPointerEvents: getComputedStyle(
        document.querySelector(".stall-back-tag"),
      ).pointerEvents,
      zoneCursor: getComputedStyle(
        document.querySelector("[data-qa=cutting-zone]"),
      ).cursor,
    };
  });

  await page.screenshot({
    path: path.join(outDir, `${config.name}-initial-tutorial.png`),
  });

  const g = await geometry(page);
  const tapX = g.fruit.cx;
  const tapY = g.fruit.cy;
  if (config.touch) {
    await page.touchscreen.tap(tapX, tapY);
  } else {
    await page.mouse.click(tapX, tapY);
  }
  await page.waitForTimeout(100);
  const tapResult = await page.evaluate(() => ({
    feedback: document
      .querySelector("[data-qa=tap-drag-feedback]")
      ?.textContent?.replace(/\s+/g, " ")
      .trim(),
    attemptCount: document
      .querySelector("[data-qa=game-stage]")
      ?.getAttribute("data-attempt-count"),
    phase: document
      .querySelector("[data-qa=game-stage]")
      ?.getAttribute("data-phase"),
    miniState: document
      .querySelector("[data-qa=mini-mishli-0]")
      ?.getAttribute("data-state"),
  }));
  await page.screenshot({
    path: path.join(outDir, `${config.name}-tap-feedback.png`),
  });

  // Short drag: still instructional, never an attempt.
  const shortClient = await beginGesture(
    page,
    context,
    config.touch,
    tapX,
    tapY,
  );
  await moveGesture(page, shortClient, config.touch, tapX + 10, tapY);
  await endGesture(page, shortClient, config.touch);
  await page.waitForTimeout(80);
  const shortDragAttemptCount = await page
    .locator("[data-qa=game-stage]")
    .getAttribute("data-attempt-count");
  await page.waitForTimeout(1_250);

  // Real board-to-board drag through fruit. End is outside the fruit.
  const startX = g.board.left + 8;
  const endX = g.board.right - 8;
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const client = await beginGesture(
    page,
    context,
    config.touch,
    startX,
    g.fruit.cy,
  );
  await moveGesture(page, client, config.touch, g.fruit.cx, g.fruit.cy);
  await page.waitForTimeout(40);
  const dragProgress = await page.evaluate(() => {
    const zone = document.querySelector("[data-qa=cutting-zone]");
    const id = window.__qaPointerId;
    return {
      pointerDowns: window.__qaPointerDowns ?? 0,
      pointerId: id,
      captured:
        zone && typeof id === "number" ? zone.hasPointerCapture(id) : false,
      cleaverVisible: Boolean(
        document.querySelector("[data-qa=gameplay-cleaver]"),
      ),
      cursor: zone ? getComputedStyle(zone).cursor : null,
    };
  });
  await page.screenshot({
    path: path.join(outDir, `${config.name}-drag-in-progress.png`),
  });

  await moveGesture(page, client, config.touch, endX, g.fruit.cy);
  await endGesture(page, client, config.touch);
  await page.waitForTimeout(65);
  const cutResult = await page.evaluate(() => {
    const stage = document.querySelector("[data-qa=game-stage]");
    const cleaver = document.querySelector("[data-qa=gameplay-cleaver]");
    const impactX = Number(stage?.getAttribute("data-impact-x"));
    const impactY = Number(stage?.getAttribute("data-impact-y"));
    const bladeX = Number(cleaver?.getAttribute("data-anchor-x"));
    const bladeY = Number(cleaver?.getAttribute("data-anchor-y"));
    return {
      phase: stage?.getAttribute("data-phase"),
      attemptCount: stage?.getAttribute("data-attempt-count"),
      score: document.querySelector("[data-qa=score-value]")?.textContent,
      miniState: document
        .querySelector("[data-qa=mini-mishli-0]")
        ?.getAttribute("data-state"),
      splitVisible: !document.querySelector("[data-qa=fruit-body]"),
      tutorialVisible: Boolean(
        document.querySelector("[data-qa=swipe-gesture-hint]"),
      ),
      cleaverVisible: Boolean(cleaver),
      impact: { x: impactX, y: impactY },
      blade: { x: bladeX, y: bladeY },
      alignmentError: Math.hypot(bladeX - impactX, bladeY - impactY),
    };
  });
  await page.screenshot({
    path: path.join(outDir, `${config.name}-successful-cut.png`),
  });
  await page.waitForTimeout(850);
  const nextAttempt = await page.evaluate(() => {
    const stage = document.querySelector("[data-qa=game-stage]");
    return {
      phase: stage?.getAttribute("data-phase"),
      attemptCount: stage?.getAttribute("data-attempt-count"),
      attemptIndex: stage?.getAttribute("data-attempt-index"),
      fruitReady: Boolean(document.querySelector("[data-qa=fruit-body]")),
      tutorialVisible: Boolean(
        document.querySelector("[data-qa=swipe-gesture-hint]"),
      ),
    };
  });
  await page.screenshot({
    path: path.join(outDir, `${config.name}-next-attempt.png`),
  });

  // Reverse-direction swipe on attempt two.
  const g2 = await geometry(page);
  const reverse = await beginGesture(
    page,
    context,
    config.touch,
    g2.board.right - 8,
    g2.fruit.cy,
  );
  await moveGesture(page, reverse, config.touch, g2.fruit.cx, g2.fruit.cy);
  await moveGesture(page, reverse, config.touch, g2.board.left + 8, g2.fruit.cy);
  await endGesture(page, reverse, config.touch);
  await page.waitForTimeout(80);
  const reverseResult = await page.evaluate(() => ({
    attemptCount: document
      .querySelector("[data-qa=game-stage]")
      ?.getAttribute("data-attempt-count"),
    miniState: document
      .querySelector("[data-qa=mini-mishli-1]")
      ?.getAttribute("data-state"),
  }));

  const scrollAfter = await page.evaluate(() => window.scrollY);
  report.push({
    viewport: `${config.width}x${config.height}`,
    input: config.touch ? "touch" : "mouse",
    url: page.url(),
    status: response?.status(),
    hydrated: Boolean(await page.locator("[data-qa=game-stage]").count()),
    pageErrors,
    consoleErrors,
    startScroll,
    initial,
    tapResult,
    shortDragAttemptCount,
    dragProgress,
    cutResult,
    nextAttempt,
    reverseResult,
    gameplayScrolled: scrollAfter !== scrollBefore,
  });

  await context.close();
}

fs.writeFileSync(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
