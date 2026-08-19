import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RotatingWord } from "@/components/marketing/rotating-word";

const WORDS = ["proof", "a portfolio", "an interview", "a job"];

function withReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("RotatingWord", () => {
  beforeEach(() => vi.useFakeTimers());

  // The headline is the one thing everybody reads. A reader on a screen reader
  // must get the whole sentence, never a word caught mid-keystroke.
  it("exposes one stable word to assistive technology", () => {
    withReducedMotion(false);
    const { container } = render(<RotatingWord words={WORDS} />);
    // Both spans read "proof" at rest, so query the structure, not the text.
    expect(container.querySelector(".sr-only")).toHaveTextContent("proof");
    expect(container.querySelector(".rotator-text")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".rotator-caret")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the first word whole before any timer runs", () => {
    withReducedMotion(false);
    const { container } = render(<RotatingWord words={WORDS} />);
    // Server output and first paint agree, so the hero never appears empty.
    expect(container.querySelector(".rotator-text")).toHaveTextContent("proof");
  });

  it("types its way to the next word", () => {
    withReducedMotion(false);
    const { container } = render(<RotatingWord words={WORDS} />);
    act(() => { vi.advanceTimersByTime(8000); });
    const shown = container.querySelector(".rotator-text")?.textContent ?? "";
    // Whatever it lands on is a prefix of one of the words, never a mixture.
    expect(WORDS.some((w) => w.startsWith(shown))).toBe(true);
    expect(shown).not.toBe("proof");
  });

  // Reduced motion means stop, not slow down.
  it("never moves when the reader asked for less motion", () => {
    withReducedMotion(true);
    const { container } = render(<RotatingWord words={WORDS} />);
    act(() => { vi.advanceTimersByTime(30000); });
    expect(container.querySelector(".rotator-text")).toHaveTextContent("proof");
  });

  it("shows no caret when there is nothing to rotate", () => {
    withReducedMotion(false);
    const { container } = render(<RotatingWord words={["proof"]} />);
    expect(container.querySelector(".rotator-caret")).toBeNull();
  });
});
