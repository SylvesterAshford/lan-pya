"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** A4 at 96 dpi: the width the résumé is laid out at, on screen and on paper. */
export const SHEET_WIDTH = 794;

/**
 * Shows a full-size A4 page shrunk to the width it is given, like a page
 * thumbnail: the layout stays exactly what prints, only smaller. The wrapper
 * takes the scaled height so the page around it flows normally.
 */
export function ScaledSheet({ children, label }: { children: ReactNode; label: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 0.5, height: 561 });

  useLayoutEffect(() => {
    const wrap = outer.current;
    const page = inner.current;
    if (!wrap || !page) return;
    const measure = () => {
      const scale = Math.min(1, wrap.clientWidth / SHEET_WIDTH);
      setBox({ scale, height: Math.ceil(page.offsetHeight * scale) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    observer.observe(page);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scaled-sheet" ref={outer} style={{ height: box.height }} role="img" aria-label={label}>
      <div className="scaled-sheet-page" ref={inner} style={{ transform: `scale(${box.scale})` }} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
