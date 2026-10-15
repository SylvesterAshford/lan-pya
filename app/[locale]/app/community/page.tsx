import { Link } from "@/i18n/navigation";
import { CommunityPathSelect, CommunityView, type CommunityPersonView } from "@/components/app/community-view";
import { requireUser } from "@/lib/auth";
import { getCommunity, getCommunitySettings, getPathHistory } from "@/lib/data/app-data";
import { CAREER_TRACKS, getCareerTrack } from "@/lib/domain/career-tracks";
import { initialsFor, leaderboard, linksOf, noteFor, stageSections, toPeople, type CommunityPerson, type CommunitySection } from "@/lib/domain/community";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { getAppCopy, localizeCareerTerm, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";

/**
 * Community: learners on a path who chose to be found (design doc and both
 * reviews, 2026-10-15).
 *
 *   ?track  any catalogue path; defaults to the learner's active path
 *   ?tab    stage (default) | leaderboard; switching tabs never refetches
 *
 * Everything a learner reads is resolved here: who may be seen comes from
 * get_community, where each person stands and in what order from
 * lib/domain/community.ts, and every string from the copy, in one language.
 */
export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ track?: string; tab?: string }>;
}) {
  const { locale } = await params;
  const { track, tab } = await searchParams;
  const user = await requireUser(locale);
  const c = getAppCopy(locale).community;
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  const [history, settings] = await Promise.all([getPathHistory(user.id), getCommunitySettings(user.id)]);
  const active = history.find((path) => path.state === "active") ?? null;
  const paths = CAREER_TRACKS.map((item) => ({ key: item.key, title: localizeCareerTerm(locale, item.key, item.title) }));
  const titleOf = (key: string) => paths.find((path) => path.key === key)?.title ?? key;
  const trackKey = CAREER_TRACKS.some((item) => item.key === track) ? track as string : active?.key;
  const heading = (
    <section className="page-heading compact-heading">
      <h1>{c.title}</h1>
      <p>{c.lede}</p>
    </section>
  );

  if (!trackKey) {
    return (
      <div className="app-page community-page">
        {heading}
        <section className="community-empty">
          <h2>{c.noPathTitle}</h2>
          <p>{c.noPathBody}</p>
          <div className="community-empty-actions">
            <CommunityPathSelect label={c.pathLabel} value="" paths={paths} />
            <Link className="button outline" href="/app/careers">{c.exploreCareers}</Link>
          </div>
        </section>
      </div>
    );
  }

  const result = await getCommunity(trackKey);
  if (!result.ok) {
    return (
      <div className="app-page community-page">
        {heading}
        <section className="community-empty" role="alert">
          <h2>{c.error.title}</h2>
          <p>{c.error.body}</p>
          {/* A full load, not a client navigation, so the request really runs again. */}
          <a className="button outline" href={`/${locale}/app/community?track=${trackKey}`}>{c.error.retry}</a>
        </section>
      </div>
    );
  }

  const pathTitle = titleOf(trackKey);
  const stages = getCareerTrack(trackKey).milestones.map((stage) => localizeRoadmapMilestone(locale, stage));
  const stageName = (index: number) => stages[index]?.title ?? "";
  const verified = (count: number) => (count === 1 ? c.verifiedOne : c.verifiedMany.replace("{n}", num(count)));
  const stageLabel = (person: CommunityPerson) => (person.finished ? c.finishedPath : c.rowStage.replace("{n}", num(person.stageIndex + 1)));

  const view = (person: CommunityPerson): CommunityPersonView => {
    const stage = num(person.stageIndex + 1);
    const meta = person.finished
      ? c.rowFinished.replace("{k}", num(person.verified))
      : person.verified
        ? c.rowVerified.replace("{n}", stage).replace("{k}", num(person.verified))
        : person.completed
          ? c.rowCompleted.replace("{n}", stage).replace("{k}", num(person.completed))
          : c.rowStage.replace("{n}", stage);
    return {
      handle: person.handle,
      alias: person.alias,
      initials: initialsFor(person.alias),
      meta,
      eyebrow: `${pathTitle} · ${stageLabel(person)}`,
      verifiedLabel: verified(person.verified),
      note: noteFor(person, locale),
      points: c.points.replace("{n}", num(person.points)),
      links: linksOf(person),
      isMe: person.isMe,
      isSample: person.isSample,
    };
  };

  const people = toPeople(trackKey, result.data);
  const me = people.find((person) => person.isMe) ?? null;
  const isActivePath = active?.key === trackKey;

  const sectionTitle = (section: CommunitySection) => {
    if (section.kind === "stage") {
      return c.sections.stage.replace("{n}", num((section.stageIndex ?? 0) + 1)).replace("{title}", stageName(section.stageIndex ?? 0));
    }
    return c.sections[section.kind];
  };
  const sections = stageSections(people, { relative: isActivePath }).map((section, index) => ({
    key: `${section.kind}-${section.stageIndex ?? index}`,
    title: sectionTitle(section),
    count: num(section.people.length),
    people: section.people.map(view),
  }));

  const ranked = leaderboard(people);
  const board = {
    podium: ranked.podium ? ranked.podium.map(view) : null,
    rows: ranked.rows.map((row) => ({ person: view(row.person), rank: row.rank === null ? null : num(row.rank) })),
  };

  return (
    <CommunityView
      locale={locale}
      labels={c}
      trackKey={trackKey}
      pathTitle={pathTitle}
      paths={paths}
      activePath={active ? { key: active.key, title: titleOf(active.key) } : null}
      isActivePath={isActivePath}
      viewer={result.data.viewer}
      me={me ? {
        title: me.finished ? c.finishedPath : c.stageTitle.replace("{n}", num(me.stageIndex + 1)).replace("{title}", stageName(me.stageIndex)),
        verifiedLabel: verified(me.verified),
      } : null}
      sections={sections}
      board={board}
      settings={settings}
      initialTab={tab === "leaderboard" ? "leaderboard" : "stage"}
    />
  );
}
