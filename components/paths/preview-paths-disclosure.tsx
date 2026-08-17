"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useId, useState } from "react";

/**
 * Collapses preview paths behind one control so the catalog does not open with
 * every path at once. Only paths a learner cannot start yet are hidden, so
 * nothing actionable is behind the disclosure. DESIGN.md "The Roadmap Catalog".
 */
export function PreviewPathsDisclosure({
  showLabel,
  hideLabel,
  children,
}: {
  showLabel: string;
  hideLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <>
      <button
        type="button"
        className="disclose"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
        {open ? hideLabel : showLabel}
      </button>
      <div id={regionId} hidden={!open}>{children}</div>
    </>
  );
}
