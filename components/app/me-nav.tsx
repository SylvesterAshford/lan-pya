import { BadgeCheck, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function MeNav({ locale, active }: { locale: string; active: "profile" | "portfolio" | "privacy" }) {
  const items = [
    { key: "profile", href: "/app/profile", en: "Profile", my: "ပရိုဖိုင်", icon: UserRound },
    { key: "portfolio", href: "/app/proof", en: "Portfolio", my: "လက်ရာမှတ်တမ်း", icon: BadgeCheck },
    { key: "privacy", href: "/app/privacy", en: "Privacy", my: "ကိုယ်ရေးလုံခြုံမှု", icon: ShieldCheck },
  ] as const;

  return (
    <nav className="me-nav" aria-label={locale === "my" ? "ကျွန်ုပ်၏ အကောင့်" : "My account"}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;
        return <Link className={isActive ? "active" : ""} href={item.href} aria-current={isActive ? "page" : undefined} key={item.key}><Icon aria-hidden="true" /><span>{locale === "my" ? item.my : item.en}</span></Link>;
      })}
    </nav>
  );
}
