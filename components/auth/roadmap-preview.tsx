/**
 * A miniature roadmap for the login brand panel.
 *
 * Contra puts a logo wall here: "Trusted by 1M+ creatives", Framer, Figma,
 * Google. Lan Pya has no partner logos, and putting aspirational ones on a
 * login screen is precisely the unearned claim this product exists to argue
 * against. The three feature pills this replaces were the same problem in a
 * smaller form: "Free forever", "Transparent", "Private by default" are
 * adjectives asserting quality rather than anything a visitor can check.
 *
 * So the panel shows the product instead. DESIGN.md calls the roadmap canvas
 * "the screen people remember", and a visitor who has never heard of Lan Pya
 * learns what it does in one glance: stages connect, work gets verified, you
 * are somewhere on a line that continues.
 *
 * Static and illustrative, not a real learner's data. It is labelled as an
 * example so it cannot be mistaken for a live account.
 *
 * Canvas palette on a dark surface: amber stage fills and teal verified fills
 * both hold against the navy panel, and the node border lightens because
 * `--node-border` is ink meant for a light canvas.
 */
export function RoadmapPreview({ locale }: { locale: string }) {
  const my = locale === "my";

  const stages = [
    { label: my ? "အခြေခံများ" : "Foundations", state: "done" as const },
    { label: my ? "တည်ဆောက်ခြင်း" : "Build", state: "done" as const },
    { label: my ? "သုံးသပ်ခြင်း" : "Review", state: "current" as const },
  ];

  const W = 300;
  const NODE_W = 216;
  const NODE_H = 46;
  const GAP = 30;
  const X = (W - NODE_W) / 2;

  return (
    <figure className="auth-roadmap">
      <svg
        viewBox={`0 0 ${W} ${stages.length * (NODE_H + GAP)}`}
        role="img"
        aria-label={my
          ? "နမူနာ လမ်းပြမြေပုံ — အခြေခံများ အတည်ပြုပြီး၊ တည်ဆောက်ခြင်း အတည်ပြုပြီး၊ သုံးသပ်ခြင်း လက်ရှိအဆင့်"
          : "Example roadmap: Foundations verified, Build verified, Review in progress"}
      >
        {/* Spine first so nodes sit above it. */}
        <g aria-hidden="true">
          {stages.slice(0, -1).map((_, i) => {
            const y = i * (NODE_H + GAP) + NODE_H;
            return (
              <line
                key={i}
                x1={W / 2}
                y1={y}
                x2={W / 2}
                y2={y + GAP}
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="2"
                strokeDasharray="2 6"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {stages.map((stage, i) => {
          const y = i * (NODE_H + GAP);
          const done = stage.state === "done";
          return (
            <g key={stage.label} aria-hidden="true">
              <rect
                x={X}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={6}
                fill={done ? "var(--teal-500)" : "var(--node-stage)"}
                stroke={done ? "var(--teal-100)" : "#fff"}
                strokeWidth="1.5"
              />
              <text
                x={X + 18}
                y={y + NODE_H / 2 + 5}
                fontSize="14"
                fontWeight="700"
                fill={done ? "#fff" : "var(--node-border)"}
              >
                {stage.label}
              </text>
              {done ? (
                <g transform={`translate(${X + NODE_W - 32},${y + NODE_H / 2 - 8})`}>
                  <circle cx="8" cy="8" r="8" fill="#fff" />
                  <path d="M4.6 8.2 L6.9 10.5 L11.4 5.8" fill="none" stroke="var(--teal-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : (
                <circle
                  cx={X + NODE_W - 24}
                  cy={y + NODE_H / 2}
                  r="7"
                  fill="none"
                  stroke="var(--node-border)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              )}
            </g>
          );
        })}
      </svg>
      <figcaption>
        {my ? "နမူနာ လမ်းပြမြေပုံ" : "Example roadmap"}
      </figcaption>
    </figure>
  );
}
