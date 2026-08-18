"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Opens the mobile navigation drawer.
 *
 * Lives in the slim top bar on phones. The drawer replaced the bottom tab bar
 * rather than joining it: the same five destinations in two places would put
 * every one of them in the tab order twice and read out twice to a screen
 * reader, which is the reason the sidebar used not to render on phones at all.
 */
export function MobileNavTrigger({ label }: { label: string }) {
  const { isMobile, mobileOpen, toggleSidebar } = useSidebar();
  if (!isMobile) return null;

  return (
    <button
      type="button"
      className="mobile-nav-trigger"
      onClick={toggleSidebar}
      aria-label={label}
      aria-expanded={mobileOpen}
    >
      <Menu size={20} aria-hidden="true" />
    </button>
  );
}
