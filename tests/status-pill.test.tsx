import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "@/components/app/status-pill";

describe("StatusPill", () => {
  it("exposes the full readiness label", () => {
    render(<StatusPill tone="warning">Build toward</StatusPill>);
    expect(screen.getByText("Build toward")).toHaveClass("warning");
  });
});
