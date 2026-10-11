"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FarRange, Massif, MidHills, NearGround, SkyStars, STOPS, Trail, TRAIL_D, WORLD_H, WORLD_W, type StopKey } from "./climb-art";
import "./climb.css";

/**
 * The landing page as one climb.
 *
 * Scrolling is the climb. Two travellers walk a trail that draws itself under
 * them, past three stops (choose, build, prove), and when they reach the top
 * the sun comes up and the whole landscape turns from night to dawn. That
 * sunrise is the page's one peak; everything before it is pacing for it.
 *
 * Governed by DESIGN.md "Marketing surfaces": scroll-linked motion is allowed
 * here because it is driven by the reader's own hand. Nothing loops except the
 * hero's rotating word, which was already the page's one ambient motion.
 *
 * Cost model, because the audience is on budget phones and mobile data:
 *  - No video, no images except the two 17KB mascot cut-outs.
 *  - Every moving thing is a whole element moved by `transform`, so the
 *    compositor does the work. The only per-frame repaint is the trail's
 *    dash offset, on a plane that holds nothing else.
 *  - One scroll listener that only records a target, one rAF loop that eases
 *    toward it and stops itself when it arrives.
 *
 * Under `prefers-reduced-motion` the page is a still: the summit at dawn, the
 * trail walked, and every stop's copy as a plain list underneath.
 */

export type ClimbBlock = { key: "hero" | StopKey; content: ReactNode };

type Props = {
  blocks: ClimbBlock[];
  stopLabels: Record<StopKey, string>;
  navLabel: string;
  navStops: Record<"start" | StopKey, string>;
  travellerAlt: string;
};

// Scroll budget, in fractions of the section's travel.
// Knots map scroll progress p to walk progress w (fraction of the trail).
// Between a stop's pair of knots the travellers slow right down, so the shot
// lands while that stop's copy is on screen.
const DWELL = 0.022;
function knotsFor(stops: Record<StopKey, number>): [number, number][] {
  return [
    [0, 0],
    [0.15, stops.choose - DWELL],
    [0.25, stops.choose + DWELL],
    [0.37, stops.build - DWELL],
    [0.47, stops.build + DWELL],
    [0.58, stops.prove - DWELL],
    [0.68, stops.prove + DWELL],
    // The quiet stretch: no copy, darkest sky, only the climb.
    [0.82, 0.985],
    [0.88, 1],
    [1, 1],
  ];
}

// Which copy block owns which stretch of scroll.
const WINDOWS: Record<ClimbBlock["key"], [number, number]> = {
  hero: [-1, 0.06],
  choose: [0.11, 0.29],
  build: [0.33, 0.51],
  prove: [0.54, 0.72],
  summit: [0.86, 2],
};

// Where the altimeter jumps to for each stop.
const JUMP: Record<"start" | StopKey, number> = { start: 0, choose: 0.2, build: 0.42, prove: 0.63, summit: 0.97 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function through(knots: [number, number][], x: number) {
  for (let i = 1; i < knots.length; i++) {
    const [x0, y0] = knots[i - 1];
    const [x1, y1] = knots[i];
    if (x <= x1) return x1 === x0 ? y1 : lerp(y0, y1, (x - x0) / (x1 - x0));
  }
  return knots[knots.length - 1][1];
}

export function TheClimb({ blocks, stopLabels, navLabel, navStops, travellerAlt }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
    const stage = q<HTMLElement>(".ascent-stage")!;
    const far = q<SVGSVGElement>(".ascent-far")!;
    const mid = q<SVGSVGElement>(".ascent-mid")!;
    const massif = q<SVGSVGElement>(".ascent-massif")!;
    const trail = q<SVGSVGElement>(".ascent-trail")!;
    const near = q<SVGSVGElement>(".ascent-near")!;
    const sun = q<HTMLElement>(".ascent-sun")!;
    const walkers = Array.from(root.querySelectorAll<HTMLImageElement>(".ascent-walker"));
    const blockEls = Array.from(root.querySelectorAll<HTMLElement>("[data-ascent-block]"));
    const stopEls = Array.from(root.querySelectorAll<SVGGElement>("[data-stop]"));
    const navEls = Array.from(root.querySelectorAll<HTMLElement>("[data-ascent-jump]"));

    // Measure the route once. A path element is needed for geometry; one that
    // is never attached to the document is enough.
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
    probe.setAttribute("d", TRAIL_D);
    const total = probe.getTotalLength();
    const SAMPLES = 600;
    const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const pt = probe.getPointAtLength((total * i) / SAMPLES);
      return { x: pt.x, y: pt.y };
    });
    const at = (w: number) => {
      const f = clamp01(w) * SAMPLES;
      const i = Math.min(SAMPLES - 1, Math.floor(f));
      const t = f - i;
      return { x: lerp(pts[i].x, pts[i + 1].x, t), y: lerp(pts[i].y, pts[i + 1].y, t) };
    };
    const stopAt = {} as Record<StopKey, number>;
    for (const stop of STOPS) {
      let best = 0;
      let bestD = Infinity;
      pts.forEach((pt, i) => {
        const d = (pt.x - stop.x) ** 2 + (pt.y - stop.y) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      });
      stopAt[stop.key] = best / SAMPLES;
    }
    const knots = knotsFor(stopAt);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Layout, refreshed on resize.
    let W = 0, Hs = 0, scale = 1, worldLeft = 0, worldH = 0, anchor = 0.62, walkerH = 0, nearH = 0;
    const measure = () => {
      const r = stage.getBoundingClientRect();
      W = r.width;
      Hs = r.height;
      const mr = massif.getBoundingClientRect();
      scale = mr.width / WORLD_W;
      worldLeft = mr.left - r.left;
      worldH = WORLD_H * scale;
      anchor = W < 760 ? 0.74 : 0.62;
      walkerH = walkers[0]?.getBoundingClientRect().height || 104 * scale;
      nearH = near.getBoundingClientRect().height;
    };

    let target = 0;
    let current = -1;
    let raf = 0;
    let lastActive = "";

    const progress = () => {
      const r = root.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      return travel > 0 ? clamp01(-r.top / travel) : 0;
    };

    const render = (p: number) => {
      const w = through(knots, p);
      const dawn = smooth(0.8, 0.93, p);

      // Camera: keep the lead traveller at a fixed height on screen, clamped
      // to the world so the summit lands at the top and never past it.
      const lead = at(w);
      const minTy = -(worldH - Hs);
      const camTy = Math.min(0, Math.max(minTy, Hs * anchor - lead.y * scale));
      const cam = minTy === 0 ? 1 : 1 - camTy / minTy;

      massif.style.transform = `translate3d(0, ${camTy}px, 0)`;
      trail.style.transform = `translate3d(0, ${camTy}px, 0)`;
      // Distant planes travel down as the climb rises: the far range sinks to
      // a line below the summit, the hills sink out, the trees at the
      // trailhead leave first and fastest.
      far.style.transform = `translate3d(0, ${Hs * lerp(0.1, 0.6, cam)}px, 0)`;
      mid.style.transform = `translate3d(0, ${Hs * lerp(0.44, 1.25, cam)}px, 0)`;
      // The near ground starts sitting on the bottom edge and leaves first.
      near.style.transform = `translate3d(0, ${Hs - nearH * 0.96 + Hs * 1.9 * cam}px, 0)`;

      // The sun sits behind the summit and rises as the climb arrives.
      const sunX = worldLeft + 640 * scale;
      const sunY = 190 * scale + camTy + (1 - dawn) * 170 * scale;
      sun.style.transform = `translate3d(${sunX}px, ${sunY}px, 0) translate(-50%, -50%)`;

      stage.style.setProperty("--walk", w.toFixed(4));
      stage.style.setProperty("--dawn", dawn.toFixed(3));

      // Two travellers, the second a few steps behind. A small step bob tied
      // to distance walked, not to time, so it stops when the reader does.
      walkers.forEach((el, i) => {
        const wi = Math.max(0, w - i * 0.014 * (1 - dawn));
        const pt = at(wi);
        const bob = Math.abs(Math.sin(wi * total / 9)) * 2.4 * scale;
        const spread = lerp(i ? 16 : -6, i ? 13 : -13, dawn);
        const x = worldLeft + (pt.x + spread) * scale - el.offsetWidth / 2;
        const y = pt.y * scale + camTy - walkerH - bob + (i ? 4 * scale * (1 - dawn) : 0);
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      stopEls.forEach((el) => {
        const key = el.dataset.stop as StopKey;
        el.classList.toggle("is-reached", w >= stopAt[key] - 0.004);
        // A flag shows up as the climb approaches it, so the opening frame
        // is not cluttered with stops the reader has no reason to know yet.
        el.classList.toggle("is-near", w >= stopAt[key] - 0.17);
      });

      let active = "";
      for (const el of blockEls) {
        const key = el.dataset.ascentBlock as ClimbBlock["key"];
        const [a, b] = WINDOWS[key];
        const on = p >= a && p <= b;
        el.classList.toggle("is-on", on);
        if (on) active = key;
      }
      if (active !== lastActive) {
        lastActive = active;
        const navKey = active === "hero" ? "start" : active;
        navEls.forEach((el) => el.toggleAttribute("aria-current", el.dataset.ascentJump === navKey));
      }
    };

    const tick = () => {
      raf = 0;
      if (current < 0) current = target;
      current += (target - current) * 0.16;
      if (Math.abs(target - current) < 0.0004) current = target;
      render(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      target = progress();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const setStill = () => {
      root.classList.toggle("is-still", still.matches);
      root.classList.toggle("is-live", !still.matches);
      measure();
      if (still.matches) {
        // A finished climb: summit, dawn, every stop reached.
        cancelAnimationFrame(raf);
        raf = 0;
        render(1);
      } else {
        current = -1;
        wake();
      }
    };

    const onResize = () => { measure(); current = -1; wake(); };
    const onScroll = () => { if (!still.matches) wake(); };

    setStill();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    still.addEventListener("change", setStill);

    // The altimeter jumps along the climb.
    const onJump = (event: Event) => {
      const key = (event.currentTarget as HTMLElement).dataset.ascentJump as keyof typeof JUMP;
      if (still.matches) return;
      const r = root.getBoundingClientRect();
      const top = window.scrollY + r.top;
      window.scrollTo({ top: top + JUMP[key] * (r.height - window.innerHeight), behavior: "smooth" });
    };
    navEls.forEach((el) => el.addEventListener("click", onJump));

    // A focused link that is scrolled out of its window still has to be seen.
    const onFocus = (event: FocusEvent) => {
      const block = (event.target as HTMLElement).closest<HTMLElement>("[data-ascent-block]");
      if (!block || still.matches || block.classList.contains("is-on")) return;
      const key = block.dataset.ascentBlock as ClimbBlock["key"];
      const [a, b] = WINDOWS[key];
      const r = root.getBoundingClientRect();
      const p = clamp01((Math.max(0, a) + Math.min(1, b)) / 2);
      window.scrollTo({ top: window.scrollY + r.top + p * (r.height - window.innerHeight) });
    };
    root.addEventListener("focusin", onFocus);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      still.removeEventListener("change", setStill);
      navEls.forEach((el) => el.removeEventListener("click", onJump));
      root.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <section ref={rootRef} className="ascent is-live">
      <div className="ascent-stage">
        <div className="ascent-scene" aria-hidden="true">
          <div className="ascent-sky">
            <div className="sky-dawn" />
            <SkyStars />
          </div>
          <div className="ascent-sun" />
          <FarRange />
          <MidHills />
          <Massif stopLabels={stopLabels} />
          <Trail />
          {/* eslint-disable-next-line @next/next/no-img-element -- 17KB cut-outs moved every frame; next/image adds nothing here. */}
          <img className="ascent-walker" src="/art/traveller.webp" alt="" width={139} height={420} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ascent-walker" src="/art/traveller-f.webp" alt="" width={132} height={420} />
          <NearGround />
        </div>
        <div className="ascent-scrim" aria-hidden="true" />

        <nav className="ascent-nav" aria-label={navLabel}>
          <ol>
            {(["summit", "prove", "build", "choose", "start"] as const).map((key) => (
              <li key={key}>
                <button type="button" data-ascent-jump={key}>
                  <span className="ascent-nav-dot" aria-hidden="true" />
                  <span>{navStops[key]}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="ascent-copy">
          {blocks.map((block) => (
            <div key={block.key} className={`ascent-block ascent-block-${block.key}${block.key === "hero" ? " is-on" : ""}`} data-ascent-block={block.key}>
              {block.content}
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only">{travellerAlt}</p>
    </section>
  );
}
