"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { PanelLeft } from "lucide-react";

type SidebarContextValue = {
  open: boolean;
  openMobile: boolean;
  isMobile: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
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
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((value) => !value);
    else setOpen((value) => !value);
  }, [isMobile]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobile && openMobile) {
        setOpenMobile(false);
        return;
      }
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, openMobile, toggleSidebar]);

  const value = useMemo(
    () => ({ open, openMobile, isMobile, setOpen, setOpenMobile, toggleSidebar }),
    [open, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className="sidebar-provider" data-sidebar-state={open ? "expanded" : "collapsed"}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, ...props }: HTMLAttributes<HTMLElement>) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();
  const visible = isMobile ? openMobile : open;

  return (
    <>
      {isMobile && openMobile ? (
        <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setOpenMobile(false)} />
      ) : null}
      <aside
        {...props}
        className={`app-sidebar${props.className ? ` ${props.className}` : ""}`}
        data-mobile={isMobile || undefined}
        data-state={visible ? "expanded" : "collapsed"}
        aria-hidden={isMobile && !openMobile ? true : undefined}
        inert={isMobile && !openMobile ? true : undefined}
      >
        {children}
      </aside>
    </>
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
  const { open, isMobile, openMobile, toggleSidebar } = useSidebar();
  const expanded = isMobile ? openMobile : open;
  return (
    <button
      {...props}
      className={`sidebar-trigger${className ? ` ${className}` : ""}`}
      type="button"
      aria-label={expanded ? "Collapse navigation" : "Open navigation"}
      aria-expanded={expanded}
      onClick={toggleSidebar}
    >
      <PanelLeft aria-hidden="true" />
    </button>
  );
}

export function SidebarRail() {
  const { open, setOpen } = useSidebar();
  return (
    <button
      className="sidebar-rail"
      type="button"
      aria-label={open ? "Collapse navigation" : "Expand navigation"}
      title={open ? "Collapse navigation (⌘B)" : "Expand navigation (⌘B)"}
      onClick={() => setOpen(!open)}
    />
  );
}
