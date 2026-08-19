"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The one piece of ambient motion on the site, permitted by DESIGN.md
 * "Marketing surfaces" and nowhere else.
 *
 * It types out what proof is actually for — proof, a portfolio, an interview,
 * a job — because the headline stops half-way through the argument otherwise.
 * "Start building proof" is a claim; watching it become "a job" is the reason
 * to care. That is why this is allowed to loop and a decorative animation
 * would not be.
 *
 * Two things it refuses to do. It never leaves a screen reader reading a
 * half-typed word: the animated text is aria-hidden and a stable sentence sits
 * beside it. And under `prefers-reduced-motion` it does not merely slow down —
 * it stops on the first word and stays there, because for a reader who asked
 * for less motion, slower motion is still motion.
 */

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1700;
const BLANK_MS = 320;

export function RotatingWord({ words }: { words: string[] }) {
  // The first word is rendered whole on the server and is what a reduced-motion
  // reader keeps, so the hero never paints empty or shifts on hydration.
  const [text, setText] = useState(words[0] ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (words.length < 2) return;
    if (typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    let cut = words[0].length;
    let deleting = false;
    let live = true;

    const step = () => {
      if (!live) return;
      const word = words[index];

      if (!deleting && cut === word.length) {
        deleting = true;
        timer.current = setTimeout(step, HOLD_MS);
        return;
      }
      if (deleting && cut === 0) {
        deleting = false;
        index = (index + 1) % words.length;
        timer.current = setTimeout(step, BLANK_MS);
        return;
      }

      cut += deleting ? -1 : 1;
      setText(words[index].slice(0, cut));
      timer.current = setTimeout(step, deleting ? DELETE_MS : TYPE_MS);
    };

    timer.current = setTimeout(step, HOLD_MS);
    return () => {
      live = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [words]);

  return (
    <span className="rotator">
      {/* The sentence a screen reader gets: whole, stable, never mid-keystroke. */}
      <span className="sr-only">{words[0]}</span>
      <span className="rotator-text" aria-hidden="true">{text}</span>
      {/* Whether the caret is shown is a presentation question, not a state
          one: CSS hides it under prefers-reduced-motion, so nothing here has
          to know what the reader asked for. */}
      {words.length > 1 ? <span className="rotator-caret" aria-hidden="true" /> : null}
    </span>
  );
}
