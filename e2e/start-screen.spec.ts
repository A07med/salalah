import { expect, test, type Page } from "playwright/test";

async function disableNativeRandomUuid(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(window.crypto), "randomUUID", {
      configurable: true,
      value: undefined,
    });
  });
}

async function expectImmediateGameStage(
  page: Page,
  start: () => Promise<void>,
): Promise<void> {
  const startedAt = Date.now();
  await start();
  await expect(page.locator("[data-qa=game-stage]")).toBeVisible({
    timeout: 300,
  });
  expect(Date.now() - startedAt).toBeLessThanOrEqual(300);
}

test.describe("390x844 touch with a pending leaderboard", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("tap starts locally without a score POST", async ({ page }) => {
    await disableNativeRandomUuid(page);
    await page.route("**/api/leaderboard?*", () => new Promise(() => undefined));
    const postRequests: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes("/api/leaderboard")
      ) {
        postRequests.push(request.url());
      }
    });

    await page.goto("/");
    await page.locator("[data-qa=start-input]").fill("أحمد");
    await expectImmediateGameStage(page, () =>
      page.getByRole("button", { name: "ابدأ اللعب" }).tap(),
    );

    expect(postRequests).toHaveLength(0);
  });
});

test.describe("430x932 touch with an unavailable database", () => {
  test.use({
    viewport: { width: 430, height: 932 },
    hasTouch: true,
    isMobile: true,
  });

  test("Enter starts locally after a leaderboard 503", async ({ page }) => {
    await disableNativeRandomUuid(page);
    await page.route("**/api/leaderboard?*", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "LEADERBOARD_UNAVAILABLE" }),
      }),
    );

    await page.goto("/");
    const input = page.locator("[data-qa=start-input]");
    await input.fill("سالم");
    await expectImmediateGameStage(page, () => input.press("Enter"));
  });
});

test.describe("1440x900 desktop with a successful leaderboard", () => {
  test.use({ viewport: { width: 1440, height: 900 }, hasTouch: false });

  test("mouse click starts locally after leaderboard success", async ({
    page,
  }) => {
    await disableNativeRandomUuid(page);
    await page.route("**/api/leaderboard?*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ entries: [] }),
      }),
    );

    await page.goto("/");
    await page.locator("[data-qa=start-input]").fill("مريم");
    await expectImmediateGameStage(page, () =>
      page.getByRole("button", { name: "ابدأ اللعب" }).click(),
    );
  });
});
