import { LevelInsignia } from "@/components/app/emblem";
import { StepsRing } from "@/components/app/steps-ring";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { localizeGate, localizeLevel, type PathProgress } from "@/lib/domain/progress";

/**
 * Path level meter.
 *
 * Two variants on purpose. `full` is the first element on Home, where "where am
 * I" is the screen's whole job. `compact` is a single line on Roadmap and
 * Missions, because repeating a large panel on every screen is how an app turns
 * into a dashboard mosaic — which DESIGN.md's App UI rules forbid outright.
 *
 * The gate list is the part that matters. A bare number invites the question
 * "what is this out of, and who decided?", and the founder plan requires the
 * rule to be shown before the action. Every gate states its requirement and
 * whether it is met, so the level reads as earned rather than assigned.
 */
export function LevelMeter({
  progress,
  locale,
  variant = "full",
  pathTitle,
}: {
  progress: PathProgress;
  locale: string;
  variant?: "full" | "compact";
  pathTitle?: string;
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const name = localizeLevel(locale, progress.level);
  const percent = Math.round(progress.fraction * 100);

  if (variant === "compact") {
    return (
      <div className="level-strip">
        <LevelInsignia rank={progress.level.rank} hue={progress.level.hue} size={30} />
        <strong>{name}</strong>
        <span className="level-strip-track" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </span>
        <span className="level-strip-xp">
          {progress.isMax
            ? (my ? `ခြေလှမ်း ${num(progress.xp)}` : `${num(progress.xp)} steps`)
            : (my ? `ခြေလှမ်း ${num(progress.xp)} / ${num(progress.next!.minXp)}` : `${num(progress.xp)} / ${num(progress.next!.minXp)} steps`)}
        </span>
      </div>
    );
  }

  return (
    <section className="level-card" aria-label={my ? "လမ်းကြောင်း တိုးတက်မှု" : "Path progress"}>
      <StepsRing progress={progress} locale={locale} />

      <div className="level-main">
        <div className="level-top">
          <span className="level-name">{name}</span>
          <span className="level-rank">
            {my ? `အဆင့် ${num(progress.level.rank)} / ${num(5)}` : `Level ${progress.level.rank} of 5`}
          </span>
          {pathTitle ? <span className="level-path">{pathTitle}</span> : null}
        </div>

        <p className="level-xp">
          {progress.isMax ? (
            my
              ? `${num(progress.xp)} ခြေလှမ်း · အမြင့်ဆုံးအဆင့် ရောက်ရှိပြီး`
              : `${num(progress.xp)} steps · highest level reached`
          ) : (
            <>
              <b>{num(progress.xpToNext)}</b>
              {my ? ` ခြေလှမ်း ကျန်သည် — ` : " steps to "}
              <b>{localizeLevel(locale, progress.next!)}</b>
            </>
          )}
        </p>

        {progress.gates.length ? (
          <ul className="level-gates">
            {progress.gates.map((gate) => (
              <li key={gate.en} className={gate.met ? "met" : ""}>
                <GateTick met={gate.met} />
                <span>
                  {localizeGate(locale, gate)}
                  {!gate.met && typeof gate.have === "number" && typeof gate.need === "number" ? (
                    <b> · {my ? `${num(gate.have)} / ${num(gate.need)}` : `${num(gate.have)} of ${num(gate.need)}`}</b>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="level-honesty">
          {my
            ? "အဆင့်များသည် Lan Pya အတွင်း တိုးတက်မှုကို ဖော်ပြသည်။ အလုပ်အကိုင် ရရှိနိုင်မှုကို မဆိုလိုပါ။"
            : "Levels describe progress inside Lan Pya. They do not claim you are employable."}
        </p>
      </div>
    </section>
  );
}

function GateTick({ met }: { met: boolean }) {
  return (
    <svg className="gate-tick" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {met ? (
        <>
          <circle cx="8" cy="8" r="7" fill="var(--teal-500)" />
          <path d="M5 8.5 L7 10.5 L11 5.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="var(--hairline)" strokeWidth="2" />
      )}
    </svg>
  );
}
