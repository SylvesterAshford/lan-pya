"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { PanelLeft } from "lucide-react";

/**
 * Sidebar primitives, restored from the pre-2026-08-13 shell.
 *
 * Written in shadcn's component API but hand-rolled: no Radix, no extra
 * dependency, and styling lives in globals.css with the rest of the system
 * rather than in utility classes.
 *
 * Difference from the original: the viewport query uses `useSyncExternalStore`
 * instead of `useState` + `useEffect`. The original set state from an effect,
 * which the current lint config rejects, and which rendered one frame at the
 * desktop width before correcting itself on mobile.
 *
 * Below 860px the sidebar is not a drawer. It is removed, and the bottom tab
 * bar owns navigation, because this product is read one-handed on budget
 * Android phones and a top-left hamburger is the hardest target on the screen.
 */

const MOBILE_QUERY = "(max-width: 860px)";

function subscribe(callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** Server and hydration agree on `false`; the client corrects after mount. */
function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    // matchMedia is absent in jsdom and in a few old mobile browsers. Falling
    // back to desktop keeps the sidebar rendered rather than losing navigation
    // entirely, which is the safer failure for a nav component.
    () => (typeof window.matchMedia === "function" ? window.matchMedia(MOBILE_QUERY).matches : false),
    () => false,
  );
}

type SidebarContextValue = {
  open: boolean;
  isMobile: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside SidebarProvider");
  return context;
}

export function SidebarProvider({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const isMobile = useIsMobile();

  const toggleSidebar = useCallback(() => setOpen((value) => !value), []);

  // Cmd/Ctrl+B collapses the rail, the shortcut the original shipped with.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  const value = useMemo(
    () => ({ open, isMobile, setOpen, toggleSidebar }),
    [open, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className="sidebar-provider" data-sidebar-state={open ? "expanded" : "collapsed"} data-mobile={isMobile || undefined}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, ...props }: HTMLAttributes<HTMLElement>) {
  const { isMobile, open } = useSidebar();

  // Not rendered at all on phones. Hiding it with CSS would leave five extra
  // links in the tab order and read out twice to a screen reader, since the
  // bottom bar carries the same destinations.
  if (isMobile) return null;

  return (
    <aside
      {...props}
      className={`app-sidebar${props.className ? ` ${props.className}` : ""}`}
      data-state={open ? "expanded" : "collapsed"}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`sidebar-header${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarContent(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`sidebar-content${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarFooter(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`sidebar-footer${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarGroup(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`sidebar-group${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarGroupLabel(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`sidebar-group-label${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarMenu(props: HTMLAttributes<HTMLUListElement>) {
  return <ul {...props} className={`sidebar-menu${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarMenuItem(props: HTMLAttributes<HTMLLIElement>) {
  return <li {...props} className={`sidebar-menu-item${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarMenuButton({ isActive, children }: { isActive?: boolean; children: React.ReactNode }) {
  return <div className="sidebar-menu-button" data-active={isActive || undefined}>{children}</div>;
}

export function SidebarInset(props: HTMLAttributes<HTMLElement>) {
  return <main {...props} className={`sidebar-inset${props.className ? ` ${props.className}` : ""}`} />;
}

export function SidebarTrigger({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, isMobile, toggleSidebar } = useSidebar();
  if (isMobile) return null;
  return (
    <button
      {...props}
      className={`sidebar-trigger${className ? ` ${className}` : ""}`}
      type="button"
      aria-label={open ? "Collapse navigation" : "Expand navigation"}
      aria-expanded={open}
      onClick={toggleSidebar}
    >
      <PanelLeft aria-hidden="true" />
    </button>
  );
}

/** The thin hit area on the sidebar's edge. Decorative on touch, so it is
 *  hidden from assistive tech where the trigger already does the job. */
export function SidebarRail() {
  const { open, setOpen, isMobile } = useSidebar();
  if (isMobile) return null;
  return (
    <button
      className="sidebar-rail"
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      title={open ? "Collapse navigation (⌘B)" : "Expand navigation (⌘B)"}
      onClick={() => setOpen(!open)}
    />
  );
}
