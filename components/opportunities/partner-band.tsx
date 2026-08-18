import { ShieldCheck } from "lucide-react";
import { PARTNERS } from "@/lib/domain/partners";
import { formatAppDate } from "@/lib/i18n/app-copy";

/**
 * Verified program partners.
 *
 * Carries real institutional marks, which is why it states what it is claiming
 * and when that claim was last checked. A logo wall that says only "trusted by"
 * asks the reader to take the relationship on faith; naming the programme and
 * dating the check makes it something they can verify.
 *
 * The founder confirmed both relationships are documented before this shipped.
 * If a partnership lapses, remove its entry here rather than leaving a mark on
 * the page — an out-of-date partner logo is a false claim, not a stale one.
 *
 * The two marks need opposite grounds: the embassy seal is drawn on white and
 * the college wordmark is white on navy. Each therefore sits on its own tile in
 * its own ground rather than being forced onto a shared one, which would have
 * meant recolouring somebody's official mark.
 */

export function PartnerBand({
  locale,
  checkedAt,
}: {
  locale: string;
  /** When partner information was last confirmed. */
  checkedAt: string;
}) {
  const my = locale === "my";

  return (
    <section className="partner-band" aria-labelledby="partner-band-title">
      <div className="partner-band-copy">
        <span className="partner-band-eyebrow">
          <ShieldCheck size={14} aria-hidden="true" />
          {my ? "အတည်ပြုထားသော အစီအစဉ် မိတ်ဖက်များ" : "Verified program partners"}
        </span>
        <h2 id="partner-band-title">
          {my ? "ဒစ်ဂျစ်တယ် စွန့်ဦးတီထွင်မှု စွမ်းဆောင်ရည် အစီအစဉ်" : "Digital Entrepreneurship Empowerment Program"}
        </h2>
        <p>
          {my
            ? "အခွင့်အလမ်းများကို အဖွဲ့အစည်းအမည်၊ မူရင်းလင့်ခ်နှင့် အတည်ပြုသည့်ရက်စွဲတို့နှင့်အတူ ဖော်ပြသည်။"
            : "Opportunities are published with named organizations, source links, and verification dates."}
        </p>
      </div>

      <div className="partner-band-marks">
        {PARTNERS.map((partner) => (
          <span key={partner.name} className={`partner-mark ${partner.ground}`} title={partner.name}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local art
                with known intrinsic size; the loader adds nothing. */}
            <img src={partner.src} alt={partner.name} width={partner.width} height={partner.height} decoding="async" />
          </span>
        ))}
      </div>

      <p className="partner-band-checked">
        {my ? "မိတ်ဖက် အချက်အလက်ကို စစ်ဆေးသည့်ရက်" : "Partner information checked"} {formatAppDate(locale, checkedAt)}
      </p>
    </section>
  );
}
