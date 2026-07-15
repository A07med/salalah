// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LeaderboardPanel } from "./LeaderboardPanel";

afterEach(cleanup);

describe("LeaderboardPanel", () => {
  it("renders stable loading skeleton rows", () => {
    render(<LeaderboardPanel entries={[]} status="loading" />);
    expect(
      screen.getByLabelText("جارٍ تحميل أفضل القصاصين"),
    ).toBeInTheDocument();
  });

  it("renders the empty state", () => {
    render(<LeaderboardPanel entries={[]} status="success" />);
    expect(
      screen.getByText("العب أول جولة وسجّل أول نتيجة!"),
    ).toBeInTheDocument();
  });

  it("renders a controlled error state and retries", () => {
    const onRetry = vi.fn();
    render(
      <LeaderboardPanel
        entries={[]}
        status="error"
        onRetry={onRetry}
      />,
    );

    expect(
      screen.getByText("تعذّر تحميل أفضل القصاصين"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "حاول مرة ثانية" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders names and Arabic scores without rank clutter", () => {
    render(
      <LeaderboardPanel
        status="success"
        entries={[
          {
            playerName: "أحمد العبري",
            score: 5960,
            levelReached: 4,
          },
        ]}
      />,
    );

    expect(screen.getByText("أحمد العبري")).toBeInTheDocument();
    expect(screen.getByText("٥٩٦٠")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("truncates long Arabic names while keeping score unwrapped", () => {
    render(
      <LeaderboardPanel
        status="success"
        entries={[
          {
            playerName: "اسم عربي طويل جداً للاختبار البصري",
            score: 4000,
            levelReached: 3,
          },
        ]}
      />,
    );

    expect(
      screen.getByText("اسم عربي طويل جداً للاختبار البصري"),
    ).toHaveClass("truncate");
    expect(screen.getByText("٤٠٠٠").parentElement).toHaveClass(
      "whitespace-nowrap",
    );
  });
});
