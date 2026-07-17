// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SwipeGestureHint } from "./SwipeGestureHint";

describe("SwipeGestureHint", () => {
  it("teaches press-and-drag without intercepting input", () => {
    const { container } = render(<SwipeGestureHint />);

    expect(
      screen.getByText(
        "اسحب الساطور على علامة القطع — اضغط واسحب عبر الخط.",
      ),
    ).toBeVisible();
    expect(
      container.querySelector("[data-qa=swipe-gesture-hint]"),
    ).toHaveClass("pointer-events-none");
    expect(container.querySelector("[data-qa=swipe-hint-motion]")).toBeTruthy();
  });

  it("explains a tap without presenting it as a scored miss", () => {
    const { container } = render(
      <SwipeGestureHint mode="tap-feedback" shakeKey={1} />,
    );

    expect(screen.getByText("اسحب الساطور، لا تنقر فقط")).toBeVisible();
    expect(
      container.querySelector("[data-qa=tap-drag-feedback]"),
    ).toHaveClass("pointer-events-none", "animate-screen-shake");
    expect(screen.queryByText("ما صابت!")).not.toBeInTheDocument();
  });
});
