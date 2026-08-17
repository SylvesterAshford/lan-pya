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

export const MASCOT_SRC = "/art/traveller.webp";

/** Natural proportions of the prepared asset, so callers can size by height
 *  without guessing the width and squashing the figure. */
export const MASCOT_RATIO = 139 / 420;

export function Mascot({
  size = 120,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const w = Math.round(size * MASCOT_RATIO);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed-size local
    // art with known intrinsic dimensions; the loader adds no value here.
    <img
      src={MASCOT_SRC}
      className={className}
      width={w}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      decoding="async"
    />
  );
}
