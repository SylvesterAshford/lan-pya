import { ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PARTNERS, PARTNERS_CHECKED_AT } from "@/lib/domain/partners";
import { formatAppDate } from "@/lib/i18n/app-copy";

/**
 * The site footer.
 *
 * It carries two real institutional marks, so it says what it is claiming and
 * when that claim was last checked, exactly as the partner band on the
 * opportunities board does. A logo wall labelled "trusted by" asks the reader
 * to take a relationship on faith; naming the programme and dating the check
 * makes it something they can go and verify.
 *
 * Both the list and the date come from `lib/domain/partners.ts`. If a
 * partnership lapses, deleting its entry there stops every surface claiming it
 * at once — an out-of-date partner logo is a false claim, not a stale one.
 *
 * Every link here goes somewhere that exists. A footer padded with dead links
 * to pages nobody has built is the cheapest way to look untrustworthy on the
 * one screen where trust is the whole subject.
 */
export function SiteFooter({ locale }: { locale: string }) {
  const my = locale === "my";

  return (
    <footer className="site-foot">
      <div className="foot-inner">
        <section className="foot-partners" aria-labelledby="foot-partners-title">
          <span className="foot-eyebrow" id="foot-partners-title">
            <ShieldCheck size={14} aria-hidden="true" />
            {my ? "အတည်ပြုထားသော အစီအစဉ် မိတ်ဖက်များ" : "Verified program partners"}
          </span>
          <ul className="foot-marks">
            {PARTNERS.map((partner) => (
              <li key={partner.name} className={`partner-mark ${partner.ground}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local
                    art with known intrinsic size; the loader adds nothing. */}
                <img src={partner.src} alt={partner.name} width={partner.width} height={partner.height} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
          <p className="foot-checked">
            {my ? "မိတ်ဖက် အချက်အလက်ကို စစ်ဆေးသည့်ရက်" : "Partner information checked"}{" "}
            {formatAppDate(locale, PARTNERS_CHECKED_AT)}
          </p>
        </section>

        <div className="foot-main">
          <div className="foot-brand">
            <Link href="/" className="brand-lockup static light" aria-label="Lan Pya">
              <span className="brand-mark">လ</span>
              <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
            </Link>
            <p>
              {my
                ? "လမ်းပြသည် အလုပ်အကိုင်ရည်မှန်းချက်တစ်ခုကို လမ်းကြောင်း၊ လက်တွေ့လုပ်ငန်းနှင့် မျှဝေနိုင်သော သက်သေအဖြစ် ပြောင်းပေးသည်။"
                : "Lan Pya turns one career goal into a roadmap, real work, and proof you can share."}
            </p>
          </div>

          <nav className="foot-links" aria-label={my ? "အောက်ခြေ လင့်ခ်များ" : "Footer"}>
            <div>
              <h2>{my ? "စတင်ရန်" : "Get started"}</h2>
              <Link href="/login">{my ? "အကောင့်ဝင်ရန်" : "Sign in"}</Link>
              <Link href="/login?demo=1">{my ? "နမူနာအကောင့် အသုံးပြုမည်" : "Use the demo account"}</Link>
              <Link href="/demo">{my ? "နမူနာ ကြည့်ရန်" : "See the demo"}</Link>
            </div>
            <div>
              <h2>{my ? "ဘာသာစကား" : "Language"}</h2>
              <Link href="/" locale="en" hrefLang="en">English</Link>
              <Link href="/" locale="my" hrefLang="my">မြန်မာ</Link>
            </div>
          </nav>
        </div>

        <div className="foot-legal">
          <small>© {new Date().getFullYear()} Lan Pya · {my ? "ရန်ကုန်၊ မြန်မာ" : "Yangon, Myanmar"}</small>
          <small>{my ? "မူလအတိုင်း ကိုယ်ရေးကိုယ်တာလုံခြုံ — သင်မမျှဝေမချင်း သင့်လက်ရာကို မည်သူမျှ မမြင်ရပါ။" : "Private by default. Nobody sees your work until you share it."}</small>
        </div>
      </div>
    </footer>
  );
}
