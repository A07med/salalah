// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AttemptMishliIndicator } from "@/components/game/AttemptMishliIndicator";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import { toArabicNumeral } from "@/lib/game/arabicNumerals";
import {
  getMishliAccuracyColor,
  PERFECT_MISHLI_GREEN,
} from "@/lib/game/mishliAccuracyColor";

describe("AttemptMishliIndicator", () => {
  it("renders exactly three miniature Mishlis", () => {
    const { container } = render(
      <AttemptMishliIndicator
        attemptScores={[]}
        activeAttempt={0}
        phase="ready"
      />,
    );
    expect(container.querySelectorAll("[data-qa^=mini-mishli-]")).toHaveLength(
      3,
    );
  });

  it("updates the rightmost icon after attempt 1", () => {
    const { container } = render(
      <AttemptMishliIndicator
        attemptScores={[875]}
        activeAttempt={1}
        phase="ready"
      />,
    );
    const items = container.querySelectorAll("[data-qa^=mini-mishli-]");
    // DOM LTR order: index 2, 1, 0 → physical right is last
    expect(items[2]?.getAttribute("data-qa")).toBe("mini-mishli-0");
    expect(items[2]?.getAttribute("data-state")).toBe("hit");
    expect(items[1]?.getAttribute("data-state")).toBe("pending");
    expect(items[0]?.getAttribute("data-state")).toBe("pending");
  });

  it("updates the middle icon after attempt 2", () => {
    const { container } = render(
      <AttemptMishliIndicator
        attemptScores={[400, 600]}
        activeAttempt={2}
        phase="ready"
      />,
    );
    const mid = container.querySelector("[data-qa=mini-mishli-1]");
    expect(mid?.getAttribute("data-state")).toBe("hit");
  });

  it("updates the leftmost icon after attempt 3", () => {
    const { container } = render(
      <AttemptMishliIndicator
        attemptScores={[400, 600, 900]}
        activeAttempt={2}
        phase="run-complete"
      />,
    );
    const left = container.querySelector("[data-qa=mini-mishli-2]");
    expect(left?.getAttribute("data-state")).toBe("hit");
  });

  it("keeps a miss neutral with a red mark", () => {
    const { container } = render(
      <AttemptMishliIndicator
        attemptScores={[0]}
        activeAttempt={1}
        phase="ready"
      />,
    );
    const first = container.querySelector("[data-qa=mini-mishli-0]");
    expect(first?.getAttribute("data-state")).toBe("miss");
    expect(first?.querySelector('g[stroke="#EF3340"]')).toBeTruthy();
  });

  it("uses original Mishli green for a perfect score fill", () => {
    const { container } = render(
      <AttemptMishliIndicator
        attemptScores={[1000]}
        activeAttempt={1}
        phase="ready"
      />,
    );
    const path = container.querySelector(
      "[data-qa=mini-mishli-0] path",
    ) as SVGPathElement | null;
    expect(path?.getAttribute("fill")?.toLowerCase()).toBe(
      PERFECT_MISHLI_GREEN.toLowerCase(),
    );
  });

  it("uses a pale green for a low score", () => {
    const expected = getMishliAccuracyColor(200);
    const { container } = render(
      <AttemptMishliIndicator
        attemptScores={[200]}
        activeAttempt={1}
        phase="ready"
      />,
    );
    const path = container.querySelector(
      "[data-qa=mini-mishli-0] path",
    ) as SVGPathElement | null;
    expect(path?.getAttribute("fill")?.toLowerCase()).toBe(
      expected.toLowerCase(),
    );
  });
});

describe("ScoreBoard Arabic zero", () => {
  it("renders Arabic ٠ for score zero", () => {
    render(<ScoreBoard score={0} />);
    const value = document.querySelector("[data-qa=score-value]");
    expect(value?.textContent).toBe(toArabicNumeral(0));
    expect(value?.textContent).toBe("٠");
    expect(value?.textContent).not.toBe(".");
    expect(value?.textContent).not.toBe("0");
  });
});
