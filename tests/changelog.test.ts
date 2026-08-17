import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseChangelog } from "@/lib/domain/changelog";

describe("parseChangelog", () => {
  it("reads version, date, and kind-tagged entries", () => {
    const releases = parseChangelog(`# Changelog

## [0.9.1.0] - 2026-08-17

### Fixed

- Sharing proof did not work.

### Known issue

- Public proof viewing is unavailable.

## [0.9.0.0] - 2026-08-17

### Added

- Your path now has a level.
`);
    expect(releases).toHaveLength(2);
    expect(releases[0].version).toBe("0.9.1.0");
    expect(releases[0].date).toBe("2026-08-17");
    expect(releases[0].entries).toEqual([
      { kind: "fixed", text: "Sharing proof did not work." },
      { kind: "known", text: "Public proof viewing is unavailable." },
    ]);
    expect(releases[1].entries[0].kind).toBe("added");
  });

  it("strips markdown so the rail renders plain text", () => {
    const [release] = parseChangelog(`## [1.0.0] - 2026-01-01

### Changed

- Uses \`z.guid()\` with **bold** and *italic* and a [link](https://example.com).
`);
    expect(release.entries[0].text).toBe("Uses z.guid() with bold and italic and a link.");
  });

  it("tolerates a heading with no date", () => {
    const [release] = parseChangelog(`## [2.0.0]

### Added

- Something.
`);
    expect(release.version).toBe("2.0.0");
    expect(release.date).toBeNull();
  });

  it("drops releases that have no entries rather than rendering an empty card", () => {
    expect(parseChangelog(`## [1.0.0] - 2026-01-01\n\n### Added\n`)).toEqual([]);
  });

  it("returns an empty list for junk instead of throwing", () => {
    expect(parseChangelog("")).toEqual([]);
    expect(parseChangelog("not a changelog at all")).toEqual([]);
  });

  it("parses the real CHANGELOG.md, newest release first", () => {
    // The rail renders whatever is at the top of the real file. If this ever
    // stops parsing, Home silently loses the "Updated every Friday" promise.
    const source = readFileSync(join(process.cwd(), "CHANGELOG.md"), "utf8");
    const releases = parseChangelog(source);
    expect(releases.length).toBeGreaterThan(3);
    expect(releases[0].entries.length).toBeGreaterThan(0);
    for (const release of releases) {
      expect(release.version).toMatch(/^\d+\.\d+\.\d+/);
    }
    // Newest first, as written.
    const dated = releases.filter((r) => r.date);
    expect(dated[0].date! >= dated[dated.length - 1].date!).toBe(true);
  });
});

describe("firstSentence trimming, as used by the rail", () => {
  // Mirrors the rail's helper. Kept here because the failure mode it guards
  // against — a version string like "v0.9.1.0" being read as four sentences —
  // is silent and only visible on Home.
  const firstSentence = (text: string) => {
    const match = /^(.+?[.!?])\s+[A-Z]/.exec(text);
    const candidate = match?.[1];
    if (candidate && candidate.length >= 24) return candidate;
    return text;
  };

  it("keeps only the opening sentence of a long entry", () => {
    expect(firstSentence("Sharing proof did not work. Every proof the demo account holds was rejected."))
      .toBe("Sharing proof did not work.");
  });

  it("does not split on a version number or abbreviation", () => {
    expect(firstSentence("Bumped to v0.9.1.0 today.")).toBe("Bumped to v0.9.1.0 today.");
    expect(firstSentence("Uses z.guid() for ids now.")).toBe("Uses z.guid() for ids now.");
  });

  it("leaves a single-sentence entry untouched", () => {
    expect(firstSentence("Your path now has a level.")).toBe("Your path now has a level.");
  });

  it("falls back to the full text when the first sentence is uselessly short", () => {
    const value = "Fixed. The share endpoint rejected every seeded identifier.";
    expect(firstSentence(value)).toBe(value);
  });
});
