import { Compass, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type MeTab = "profile" | "careers" | "portfolio" | "privacy";

/**
 * Me navigation.
 *
 * Each tab carries its own accent so the section is recognisable at a glance
 * rather than four identical text links. The accents are existing palette
 * tokens used semantically — teal for you and your evidence, amber for
 * exploration, purple for privacy — not decorative colour invented for variety.
 * DESIGN.md keeps decoration minimal; this spends its budget on wayfinding.
 */
export function MeNav({
  locale,
  active,
  pathCount,
}: {
  locale: string;
  active: MeTab;
  pathCount?: number;
}) {
  const items = [
    { key: "profile", href: "/app/profile", en: "Profile", my: "ပရိုဖိုင်", icon: UserRound, tone: "you" as const, count: undefined },
    { key: "careers", href: "/app/careers", en: "Careers", my: "လမ်းကြောင်းများ", icon: Compass, tone: "explore" as const, count: pathCount },
    { key: "privacy", href: "/app/privacy", en: "Privacy", my: "ကိုယ်ရေးလုံခြုံမှု", icon: ShieldCheck, tone: "private" as const, count: undefined },
  ] as const;

  return (
    <nav className="me-nav" aria-label={locale === "my" ? "ကျွန်ုပ်၏ အကောင့်" : "My account"}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;
        return (
          <Link
            className={`me-tab ${item.tone}${isActive ? " active" : ""}`}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            key={item.key}
          >
            <span className="me-tab-icon"><Icon size={18} aria-hidden="true" /></span>
            <span className="me-tab-label">{locale === "my" ? item.my : item.en}</span>
            {typeof item.count === "number" ? <span className="me-tab-count">{item.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
