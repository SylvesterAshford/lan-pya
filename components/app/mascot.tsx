/**
 * The traveller.
 *
 * This is the founder's artwork, not an imitation of it. Two attempts at
 * redrawing the character as hand-authored bezier paths produced something
 * that read as a pictogram next to the reference, so the reference itself is
 * now the asset.
 *
 * Prepared rather than shipped raw. The source is a 1024x1536 JPEG whose
 * "transparency" is a baked light checkerboard; a flood fill inward from the
 * borders removes it, which keeps the white shoe soles inside the figure that
 * a simple lightness threshold would have punched out. Trimmed to the figure,
 * resampled to 420px tall (2x the largest place it is drawn) and encoded as
 * WebP, it costs 20KB — well inside what this audience pays for on mobile
 * data, and far below the 964KB original.
 *
 * `MASCOT_SRC` is exported because the mission map draws the same figure with
 * an SVG `<image>` inside its own coordinate space rather than as a DOM node.
 */

export type MascotVariant = "traveller" | "traveller-f";

type VariantArt = { key: MascotVariant; src: string; ratio: number; en: string; my: string };

/**
 * The characters a learner can pick between.
 *
 * Only variants with real artwork belong here. Both are the founder's own
 * drawings, prepared the same way — trimmed to the figure, resampled to 420px
 * tall so the two characters draw at one scale, and encoded as WebP at about
 * 17KB each. The picker on the profile turns itself on once there is more than
 * one entry.
 */
export const MASCOT_VARIANTS: VariantArt[] = [
  // Labelled the way the founder described them. The picker shows the drawing
  // itself, so these names are what a screen reader reads out.
  { key: "traveller", src: "/art/traveller.webp", ratio: 139 / 420, en: "Traveller, male", my: "ခရီးသွား (အမျိုးသား)" },
  { key: "traveller-f", src: "/art/traveller-f.webp", ratio: 132 / 420, en: "Traveller, female", my: "ခရီးသွား (အမျိုးသမီး)" },
];

export function mascotArt(variant?: string | null): VariantArt {
  return MASCOT_VARIANTS.find((v) => v.key === variant) ?? MASCOT_VARIANTS[0];
}

export const MASCOT_SRC = MASCOT_VARIANTS[0].src;

/** Natural proportions of the prepared asset, so callers can size by height
 *  without guessing the width and squashing the figure. */
export const MASCOT_RATIO = MASCOT_VARIANTS[0].ratio;

export function Mascot({
  size = 120,
  variant,
  className,
  title,
}: {
  size?: number;
  variant?: string | null;
  className?: string;
  title?: string;
}) {
  const art = mascotArt(variant);
  const w = Math.round(size * art.ratio);
  return (
    // fixed-size local art with known intrinsic dimensions; the loader adds
    // no value here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={art.src}
      className={className}
      width={w}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      decoding="async"
    />
  );
}
