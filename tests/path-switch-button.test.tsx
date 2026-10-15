import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { PathSwitchButton } from "@/components/paths/path-switch-button";
import { getAppCopy } from "@/lib/i18n/app-copy";

describe("PathSwitchButton", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    push.mockReset();
  });

  // The old /app/build page described the same mission as the trail map and
  // drifted from it; choosing a path must open the map, where the path is worked.
  it("opens the Missions trail map after the path changes", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} }), { status: 200 }));
    vi.stubGlobal("fetch", request);
    render(<PathSwitchButton labels={getAppCopy("en").paths} trackKey="content-creator">Switch to this path</PathSwitchButton>);

    fireEvent.click(screen.getByRole("button", { name: "Switch to this path" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm path" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/app/missions"));
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ trackKey: "content-creator" });
    expect(push).not.toHaveBeenCalledWith("/app/build");
  });

  it("stays put and explains when the path cannot change", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "That path is not available to start yet." }), { status: 409 })));
    render(<PathSwitchButton labels={getAppCopy("en").paths} trackKey="video-editor">Switch to this path</PathSwitchButton>);

    fireEvent.click(screen.getByRole("button", { name: "Switch to this path" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm path" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That path is not available to start yet.");
    expect(push).not.toHaveBeenCalled();
  });
});
