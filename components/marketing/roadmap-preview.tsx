/**
 * Static roadmap preview for the marketing page.
 *
 * Replaces a 1.5MB decorative PNG collage of twelve unreadable screenshots.
 * This renders in a few KB, stays sharp at every zoom, needs no JavaScript,
 * and shows the actual thing the product is: a map with verified steps on it.
 * Design Spec §8 — "Light by default. The app's speed is the brand."
 *
 * Deliberately not the interactive canvas: this is a server-rendered picture,
 * not a control. Nothing here is focusable and the whole figure carries one
 * description for assistive technology.
 */

type Stage = {
  n: string;
  title: string;
  state: "done" | "active" | "todo";
  left: string;
  right: string;
};

export function RoadmapPreview({ locale }: { locale: string }) {
  const my = locale === "my";

  const stages: Stage[] = my
    ? [
        { n: "၁", title: "အခြေခံများ", state: "done", left: "HTTP နှင့် browser", right: "Editor နှင့် terminal" },
        { n: "၂", title: "Semantic HTML", state: "done", left: "Semantic elements", right: "Forms နှင့် validation" },
        { n: "၃", title: "Responsive layout", state: "active", left: "Box model", right: "Flexbox နှင့် Grid" },
      ]
    : [
        { n: "1", title: "Web foundations", state: "done", left: "HTTP & browsers", right: "Editor & terminal" },
        { n: "2", title: "Semantic HTML", state: "done", left: "Semantic elements", right: "Forms & validation" },
        { n: "3", title: "Responsive layout", state: "active", left: "Box model", right: "Flexbox & Grid" },
      ];

  const forkNote = my ? "လမ်းခွဲသည် — နှစ်ခုစလုံး ဖွင့်ထားသည်" : "The path splits — both stay open";
  const localTrack = my ? "ရန်ကုန်" : "Yangon track";
  const globalTrack = my ? "နိုင်ငံတကာ" : "Global track";
  const caption = my
    ? "Frontend Developer လမ်းကြောင်း၏ ပထမသုံးဆင့်"
    : "The first three stages of the Frontend Developer path";

  const W = 560;
  const CX = 280;
  const SW = 208;
  const SH = 46;
  const MW = 132;
  const MH = 28;
  const BLOCK = 104;
  const PAD = 14;

  const stageX = CX - SW / 2;
  const leftX = 20;
  const rightX = W - 20 - MW;

  const fill = { done: "var(--node-done-fill)", active: "var(--node-stage)", todo: "var(--node-stage)" };
  const stroke = { done: "var(--node-done-border)", active: "var(--node-border)", todo: "var(--node-border)" };

  // Clear of the last stage node plus its 4px active ring.
  const forkY = PAD + stages.length * BLOCK + 8;
  const trackY = forkY + 54;
  const TW = 190;
  const TH = 44;
  const height = trackY + TH + 16;

  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  };

  return (
    <figure className="roadmap-preview">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width={W}
        height={height}
        role="img"
        aria-label={
          my
            ? "Lan Pya လမ်းပြမြေပုံ နမူနာ — အတည်ပြုပြီး အဆင့်နှစ်ခု၊ လုပ်ဆောင်နေသည့် အဆင့်တစ်ခုနှင့် လမ်းခွဲ"
            : "A Lan Pya roadmap: two verified stages, one in progress, and the fork into a local or global track"
        }
      >
        <g aria-hidden="true">
          <path
            d={`M${CX} ${PAD + BLOCK / 2} L${CX} ${PAD + (stages.length - 1) * BLOCK + BLOCK / 2}`}
            className="rm-spine"
          />
          {stages.map((s, i) => {
            const cy = PAD + i * BLOCK + BLOCK / 2;
            return (
              <g key={`c-${s.n}`}>
                <path d={curve(stageX, cy, leftX + MW, cy - 24)} className="rm-connector" />
                <path d={curve(stageX + SW, cy, rightX, cy + 24)} className="rm-connector" />
              </g>
            );
          })}
        </g>

        {stages.map((s, i) => {
          const cy = PAD + i * BLOCK + BLOCK / 2;
          return (
            <g key={s.n} aria-hidden="true">
              <rect x={leftX} y={cy - 24 - MH / 2} width={MW} height={MH} rx={6} fill="var(--node-milestone)" stroke={stroke[s.state]} strokeWidth={1.5} />
              <text className="rmp-small" x={leftX + MW / 2} y={cy - 24 + 4} textAnchor="middle">{s.left}</text>

              <rect x={rightX} y={cy + 24 - MH / 2} width={MW} height={MH} rx={6} fill="var(--node-milestone)" stroke={stroke[s.state]} strokeWidth={1.5} />
              <text className="rmp-small" x={rightX + MW / 2} y={cy + 24 + 4} textAnchor="middle">{s.right}</text>

              {s.state === "active" ? (
                <rect x={stageX - 4} y={cy - SH / 2 - 4} width={SW + 8} height={SH + 8} rx={10} className="rm-ring" />
              ) : null}
              <rect x={stageX} y={cy - SH / 2} width={SW} height={SH} rx={6} fill={fill[s.state]} stroke={stroke[s.state]} strokeWidth={2} />
              <text className="rmp-num" x={CX} y={cy - 6} textAnchor="middle">{my ? "အဆင့်" : "STAGE"} {s.n}</text>
              <text className="rmp-title" x={CX} y={cy + 12} textAnchor="middle">{s.title}</text>

              {s.state === "done" ? (
                <g transform={`translate(${stageX + SW - 12},${cy - SH / 2 - 5})`}>
                  <circle cx="8" cy="8" r="8" fill="var(--node-done-border)" stroke="var(--surface)" strokeWidth="2" />
                  <path d="M4.6 8.2 L7 10.6 L11.4 5.8" fill="none" stroke="var(--surface)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : null}
            </g>
          );
        })}

        <g aria-hidden="true">
          <text className="rmp-fork-note" x={CX} y={forkY + 4} textAnchor="middle">{forkNote}</text>
          <path d={curve(CX, forkY + 14, CX - 12 - TW / 2, trackY + TH / 2)} className="rm-connector local" />
          <path d={curve(CX, forkY + 14, CX + 12 + TW / 2, trackY + TH / 2)} className="rm-connector global" />
          <rect x={CX - 12 - TW} y={trackY} width={TW} height={TH} rx={6} fill="var(--teal-100)" stroke="var(--teal-700)" strokeWidth={2} />
          <text className="rmp-track local" x={CX - 12 - TW / 2} y={trackY + TH / 2 + 5} textAnchor="middle">{localTrack}</text>
          <rect x={CX + 12} y={trackY} width={TW} height={TH} rx={6} fill="var(--purple-100)" stroke="var(--purple-500)" strokeWidth={2} />
          <text className="rmp-track global" x={CX + 12 + TW / 2} y={trackY + TH / 2 + 5} textAnchor="middle">{globalTrack}</text>
        </g>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
