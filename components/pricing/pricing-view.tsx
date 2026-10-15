"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Building2, Check, GraduationCap, Handshake, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SheetDialog } from "@/components/app/sheet-dialog";
import {
  CORPORATE_PLAN,
  EMPLOYER_FEES,
  formatKyat,
  formatNumber,
  PERSONAL_PLANS,
  priceFor,
  savingsPercent,
  text,
  UNIVERSITY_PLAN,
  type Billing,
  type PaidPlanKey,
  type PersonalPlan,
  type PlanFeature,
} from "@/lib/domain/plans";
import type { getAppCopy } from "@/lib/i18n/app-copy";

export type PricingLabels = ReturnType<typeof getAppCopy>["pricing"];
type Tab = "personal" | "business";
type InquiryKind = "employer" | "university" | "corporate";

/**
 * Plans and pricing, laid out the way subscription apps do: one full page with
 * a close control, a Personal | Business switch, and plan cards side by side
 * (stacked on phones). Prices and features come from lib/domain/plans.ts.
 *
 * Nothing here takes money. Paid plans take a waitlist, the business plans an
 * inquiry, and every feature that does not exist yet says "Coming soon".
 */
export function PricingView({
  locale,
  labels,
  signedIn,
  isDemo,
  waitlist,
  initialTab,
}: {
  locale: string;
  labels: PricingLabels;
  signedIn: boolean;
  isDemo: boolean;
  waitlist: Partial<Record<PaidPlanKey, Billing>>;
  initialTab: Tab;
}) {
  const id = useId();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [inquiry, setInquiry] = useState<InquiryKind | null>(null);

  function chooseTab(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "personal") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(window.history.state, "", url);
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next: Tab = tab === "personal" ? "business" : "personal";
    chooseTab(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <main className="pricing-shell">
      <header className="pricing-top">
        <Link href={signedIn ? "/app/today" : "/"} className="brand-lockup static pricing-brand">
          <span className="brand-mark">လ</span>
          <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
        </Link>
        <Link href={signedIn ? "/app/today" : "/"} className="pricing-close" aria-label={signedIn ? labels.close : labels.backHome}>
          <X size={20} aria-hidden="true" />
        </Link>
      </header>

      <section className="pricing-head">
        <h1>{signedIn ? labels.titleSignedIn : labels.titlePublic}</h1>
        <p>{tab === "personal" ? labels.personalLede : labels.businessLede}</p>
        <div className="opp-segmented pricing-tabs" role="tablist" aria-label={labels.tabs.label}>
          {(["personal", "business"] as const).map((key) => (
            <button
              key={key}
              id={`${id}-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={tab === key}
              aria-controls={`${id}-panel-${key}`}
              tabIndex={tab === key ? 0 : -1}
              className={tab === key ? "on" : ""}
              onClick={() => chooseTab(key)}
              onKeyDown={onTabKey}
            >
              {labels.tabs[key]}
            </button>
          ))}
        </div>
      </section>

      <div id={`${id}-panel-personal`} role="tabpanel" aria-labelledby={`${id}-tab-personal`} hidden={tab !== "personal"}>
        <p className="pricing-notice">{labels.notice}</p>
        <div className="pricing-grid">
          {PERSONAL_PLANS.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              locale={locale}
              labels={labels}
              signedIn={signedIn}
              isDemo={isDemo}
              joined={plan.key === "free" ? undefined : waitlist[plan.key]}
            />
          ))}
        </div>
      </div>

      <div id={`${id}-panel-business`} role="tabpanel" aria-labelledby={`${id}-tab-business`} hidden={tab !== "business"}>
        <div className="pricing-grid business">
          <article className="pricing-card" aria-labelledby={`${id}-employer`}>
            <CardHead icon={<Building2 size={22} aria-hidden="true" />} id={`${id}-employer`} title={labels.business.employerTitle} tagline={labels.business.employerTagline} />
            <dl className="pricing-fees">
              {EMPLOYER_FEES.map((fee) => (
                <div key={fee.title.en}>
                  <dt>
                    {text(fee.title, locale)}
                    {fee.available ? null : <span className="pricing-soon">{labels.comingSoon}</span>}
                    <small>{text(fee.detail, locale)}</small>
                  </dt>
                  <dd>{text(fee.value, locale)}</dd>
                </div>
              ))}
            </dl>
            <p className="pricing-note">{labels.business.footer}</p>
            <button type="button" className="button outline pricing-cta" onClick={() => setInquiry("employer")}>{labels.business.contact}</button>
          </article>

          <article className="pricing-card" aria-labelledby={`${id}-university`}>
            <CardHead icon={<GraduationCap size={22} aria-hidden="true" />} id={`${id}-university`} title={labels.business.universityTitle} tagline={labels.business.universityTagline} />
            <div className="pricing-price">
              <strong>{formatKyat(UNIVERSITY_PLAN.amount, locale)}</strong>
              <span>{labels.business.perYear}</span>
            </div>
            <button type="button" className="button outline pricing-cta" onClick={() => setInquiry("university")}>{labels.business.contact}</button>
            <p className="pricing-includes">{labels.business.includes}</p>
            <FeatureList features={UNIVERSITY_PLAN.features} locale={locale} soon={labels.comingSoon} />
          </article>

          <article className="pricing-card" aria-labelledby={`${id}-corporate`}>
            <CardHead icon={<Handshake size={22} aria-hidden="true" />} id={`${id}-corporate`} title={labels.business.corporateTitle} tagline={labels.business.corporateTagline} />
            <div className="pricing-price">
              <strong>{formatKyat(CORPORATE_PLAN.monthly, locale)}</strong>
              <span>{labels.per.monthly}</span>
            </div>
            <ul className="pricing-longer">
              {CORPORATE_PLAN.longer.map((option) => (
                <li key={option.months}>
                  <span className="pricing-longer-name">{labels.business.monthsPlan.replace("{n}", formatNumber(option.months, locale))}</span>
                  <strong>{formatKyat(option.amount, locale)}</strong>
                  <small><Struck template={labels.business.instead} amount={formatKyat(CORPORATE_PLAN.monthly * option.months, locale)} /></small>
                  <span className="pricing-save">{labels.save.replace("{n}", formatNumber(savingsPercent(CORPORATE_PLAN.monthly, option.amount, option.months), locale))}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="button outline pricing-cta" onClick={() => setInquiry("corporate")}>{labels.business.contact}</button>
            <p className="pricing-includes">{labels.business.includes}</p>
            <FeatureList features={CORPORATE_PLAN.features} locale={locale} soon={labels.comingSoon} />
          </article>
        </div>
      </div>

      {inquiry ? <InquiryDialog kind={inquiry} labels={labels} onClose={() => setInquiry(null)} /> : null}
    </main>
  );
}

/** "instead of 900,000 MMK" with only the old price struck through, in either word order. */
function Struck({ template, amount }: { template: string; amount: string }) {
  const [before, after = ""] = template.split("{amount}");
  return <>{before}<s>{amount}</s>{after}</>;
}

function CardHead({ icon, id, title, tagline }: { icon: React.ReactNode; id: string; title: string; tagline: string }) {
  return (
    <header className="pricing-card-head">
      <span className="pricing-icon">{icon}</span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{tagline}</p>
      </div>
    </header>
  );
}

function FeatureList({ features, locale, soon }: { features: PlanFeature[]; locale: string; soon: string }) {
  return (
    <ul className="pricing-features">
      {features.map((feature) => (
        <li key={feature.en} className={feature.available ? "" : "soon"}>
          <Check size={16} aria-hidden="true" />
          <span>
            {text(feature, locale)}
            {feature.available ? null : <> <span className="pricing-soon">{soon}</span></>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PlanCard({
  plan,
  locale,
  labels,
  signedIn,
  isDemo,
  joined,
}: {
  plan: PersonalPlan;
  locale: string;
  labels: PricingLabels;
  signedIn: boolean;
  isDemo: boolean;
  joined: Billing | undefined;
}) {
  const id = useId();
  const [billing, setBilling] = useState<Billing>(joined ?? plan.prices[0]?.billing ?? "monthly");
  const [onList, setOnList] = useState<Billing | undefined>(joined);
  const [state, setState] = useState<"idle" | "saving" | "failed" | "demo">("idle");
  const paid = plan.key !== "free";
  const monthly = plan.prices[0];
  const price = priceFor(plan, billing);
  const featured = plan.key === "pro";

  async function join() {
    setState("saving");
    const response = await fetch("/api/plans/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: plan.key, billing }),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);
    if (!response?.ok) {
      setState("failed");
      return;
    }
    setOnList(billing);
    setState(body?.data?.recorded === false || isDemo ? "demo" : "idle");
  }

  let cta: React.ReactNode;
  if (!paid) {
    cta = signedIn
      ? <button type="button" className="button outline pricing-cta" disabled>{labels.currentPlan}</button>
      : <Link className="button outline pricing-cta" href="/login">{labels.startFree}</Link>;
  } else if (!signedIn) {
    cta = <Link className={`button ${featured ? "primary" : "outline"} pricing-cta`} href="/login">{labels.signInToJoin}</Link>;
  } else if (onList === billing) {
    cta = (
      <p className="pricing-joined" role="status">
        <Check size={16} aria-hidden="true" />{labels.joinedFor.replace("{period}", labels.period[billing])}
      </p>
    );
  } else {
    cta = (
      <button type="button" className={`button ${featured ? "primary" : "outline"} pricing-cta`} onClick={join} disabled={state === "saving"}>
        {state === "saving" ? labels.joining : onList ? labels.changeTo.replace("{period}", labels.period[billing]) : labels.join}
      </button>
    );
  }

  return (
    <article className={`pricing-card plan-${plan.key}${featured ? " featured" : ""}`} aria-labelledby={`${id}-name`}>
      <header className="pricing-card-head">
        <div>
          <h2 id={`${id}-name`}>{text(plan.name, locale)}</h2>
          <p>{text(plan.tagline, locale)}</p>
        </div>
      </header>

      <div className="pricing-price">
        {price ? (
          <>
            <strong>{formatKyat(price.amount, locale)}</strong>
            <span>{labels.per[price.billing]}</span>
          </>
        ) : (
          <>
            <strong>{formatKyat(0, locale)}</strong>
            <span>{labels.per.monthly}</span>
          </>
        )}
      </div>

      {paid && monthly ? (
        <div className="pricing-periods" role="radiogroup" aria-label={labels.periodLabel.replace("{plan}", text(plan.name, locale))}>
          {plan.prices.map((option) => {
            const save = savingsPercent(monthly.amount, option.amount, option.months);
            return (
              <button
                key={option.billing}
                type="button"
                role="radio"
                aria-checked={billing === option.billing}
                className={billing === option.billing ? "on" : ""}
                onClick={() => { setBilling(option.billing); setState("idle"); }}
              >
                {labels.period[option.billing]}
                {save > 0 ? <span className="pricing-save">{labels.save.replace("{n}", formatNumber(save, locale))}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {price && price.months > 1 ? (
        <p className="pricing-equiv">{labels.perMonthEquivalent.replace("{amount}", formatKyat(Math.round(price.amount / price.months), locale))}</p>
      ) : null}

      {cta}
      {state === "demo" ? <p className="pricing-status" role="status">{labels.demoJoined}</p> : null}
      {state === "failed" ? <p className="pricing-status error" role="alert">{labels.failed}</p> : null}

      {plan.includes ? <p className="pricing-includes">{text(plan.includes, locale)}</p> : null}
      <FeatureList features={plan.features} locale={locale} soon={labels.comingSoon} />
      <p className="pricing-note">{text(plan.note, locale)}</p>
    </article>
  );
}

function InquiryDialog({ kind, labels, onClose }: { kind: InquiryKind; labels: PricingLabels; onClose: () => void }) {
  const id = useId();
  const l = labels.inquiry;
  const [form, setForm] = useState({ organization: "", contactName: "", contact: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "invalid" | "failed">("idle");
  const set = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (state === "invalid" || state === "failed") setState("idle");
  };

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (form.organization.trim().length < 2 || form.contactName.trim().length < 2 || form.contact.trim().length < 5) {
      setState("invalid");
      return;
    }
    setState("sending");
    const response = await fetch("/api/partners/inquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, ...form }),
    }).catch(() => null);
    setState(response?.ok ? "sent" : "failed");
  }

  return (
    <SheetDialog labelledBy={`${id}-title`} eyebrow={l.eyebrow} closeLabel={labels.close} onClose={onClose} className="pricing-dialog">
      {state === "sent" ? (
        <div className="pricing-sent" role="status">
          <h2 className="community-card-title" id={`${id}-title`}>{l.sentTitle}</h2>
          <p>{l.sentBody}</p>
          <button type="button" className="button primary" onClick={onClose}>{l.done}</button>
        </div>
      ) : (
        <form className="pricing-inquiry" onSubmit={send} noValidate>
          <h2 className="community-card-title" id={`${id}-title`}>{l.title}</h2>
          <p className="pricing-inquiry-interest">{l.interest[kind]}</p>
          <div className="community-field">
            <label htmlFor={`${id}-org`}>{l.organization}</label>
            <input id={`${id}-org`} value={form.organization} onChange={set("organization")} maxLength={120} autoComplete="organization" />
          </div>
          <div className="community-field">
            <label htmlFor={`${id}-name`}>{l.contactName}</label>
            <input id={`${id}-name`} value={form.contactName} onChange={set("contactName")} maxLength={80} autoComplete="name" />
          </div>
          <div className="community-field">
            <label htmlFor={`${id}-contact`}>{l.contact}</label>
            <input id={`${id}-contact`} value={form.contact} onChange={set("contact")} maxLength={120} autoComplete="email" />
          </div>
          <div className="community-field">
            <label htmlFor={`${id}-message`}>{l.message} <span className="community-optional">({l.optional})</span></label>
            <textarea id={`${id}-message`} value={form.message} onChange={set("message")} maxLength={1000} rows={3} />
          </div>
          {/* Never shown to people; a bot that fills it in is ignored. */}
          <div className="pricing-trap" aria-hidden="true">
            <label htmlFor={`${id}-website`}>Website</label>
            <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
          </div>
          {state === "invalid" ? <p className="community-form-error" role="alert">{l.invalid}</p> : null}
          {state === "failed" ? <p className="community-form-error" role="alert">{l.failed}</p> : null}
          <button type="submit" className="button primary pricing-cta" disabled={state === "sending"}>{state === "sending" ? l.sending : l.send}</button>
        </form>
      )}
    </SheetDialog>
  );
}
