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
 * Only variants with real artwork belong here. A picker whose options render
 * the same drawing is worse than no picker, so `traveller-f` appears the
 * moment its file does — add the entry, and the profile picker turns itself
 * on. Nothing else needs changing; the database already accepts the key.
 */
export const MASCOT_VARIANTS: VariantArt[] = [
  { key: "traveller", src: "/art/traveller.webp", ratio: 139 / 420, en: "Traveller", my: "ခရီးသွား" },
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
    // eslint-disable-next-line @next/next/no-img-element -- fixed-size local
    // art with known intrinsic dimensions; the loader adds no value here.
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
