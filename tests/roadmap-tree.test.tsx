import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoadmapTree } from "@/components/app/roadmap-tree";
import { FRONTEND_MILESTONES } from "@/lib/domain/demo-data";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

describe("RoadmapTree", () => {
  it("opens milestone details and stores the selected step in the URL", () => {
    window.history.replaceState(null, "", "/en/app/roadmap");
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);

    const detailPanel = document.querySelector("#roadmap-detail");
    expect(detailPanel).not.toBeNull();
    expect(within(detailPanel as HTMLElement).getByRole("heading", { name: "CSS and responsive layout" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /JavaScript programming/i }));

    expect(within(detailPanel as HTMLElement).getByRole("heading", { name: "JavaScript programming" })).toBeInTheDocument();
    expect(within(detailPanel as HTMLElement).getByText("DOM & events")).toBeInTheDocument();
    expect(window.location.hash).toBe("#milestone-javascript");
  });
});
