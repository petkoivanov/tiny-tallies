# Stack Research: v1.2 High School Math Expansion + YouTube Video Tutor Hints

**Domain:** K-12 math learning app — high school curriculum (grades 9-12), YouTube video tutor integration, NumberPad negative input, multi-select MC answer format
**Researched:** 2026-03-12
**Confidence:** HIGH — verified against official Expo docs, npm registry, library documentation, and direct codebase inspection

## Executive Summary

Five capability areas are targeted for v1.2. **Four require no new dependencies** — they are pure TypeScript/component changes within the existing stack. **One requires a single new library** (`react-native-youtube-iframe`) plus **one Expo-bundled peer dependency** (`react-native-webview`, already available in Expo 54 managed workflow). The total stack surface change for this entire milestone is minimal: one new package to install, one to declare as a peer dependency.

---

## Feature-by-Feature Analysis

### (1) Negative Number Input on NumberPad

**Status: No new dependency. Component-only change to `NumberPad.tsx`.**

The existing `NumberPad.tsx` handles input via `useState<string>` with string manipulation. Current interface:
```typescript
interface NumberPadProps {
  onSubmit: (value: string) => void;
  maxDigits?: number;
  showDecimal?: boolean;
  onShowMe?: () => void;
}
```

Adding negative input requires:
- New `showNegative?: boolean` prop (default `false` — backward compatible; existing callers unaffected)
- A `±` or `−` toggle key in the bottom row (same position as `.` when `showDecimal` is false)
- Toggle logic: if value is empty, set to `'-'`; if value starts with `'-'`, strip it; otherwise prepend `'-'`
- The `maxDigits` guard should count digits only, excluding the leading `-` character
- Validation: submit guard already requires `value.length > 0`; extend to require `value !== '-'`

The `NumericAnswer.value` field is already `number` (supports negatives). The `answerNumericValue()` bridge already handles `parseFloat()` which correctly parses negative strings. No type changes needed.

---

### (2) Multi-Select MC Answer Format (Checkbox Style + Check Button)

**Status: No new dependency. New component using existing React Native primitives + existing `lucide-react-native`.**

The existing single-select answer format uses `CompactAnswerRow.tsx` (horizontal flex row, immediate submit on press). Multi-select needs a parallel `MultiSelectAnswerGrid` component:

- Selected items tracked in local `useState<Set<number>>`
- Options rendered in a 2-column grid (same `width: '45%'` pattern used by `AnswerFeedbackAnimation`)
- Checkbox visual: `Square` icon (unselected) / `CheckSquare` icon (selected) from `lucide-react-native` — already installed at `^0.554.0`
- "Check" button (disabled until at least 1 selection) using `Check` icon from `lucide-react-native`
- On submit: pass sorted selected values as string to `onSubmit`; feedback phase shows correct/incorrect highlighting

**Answer type extension needed:** The existing `Answer` discriminated union in `types.ts` needs a new member for multi-root answers (e.g., quadratic with two integer roots):

```typescript
// Option A: Encode as ExpressionAnswer string (no type change)
// correctAnswer = { type: 'expression', value: '-2,2' }  (sorted, comma-separated)

// Option B: Add MultiAnswer to the union (clean but requires migration consideration)
export interface MultiAnswer {
  readonly type: 'multi';
  readonly values: readonly number[];
}
```

Option A (use `ExpressionAnswer` with comma-separated encoding) avoids a store migration since `Answer` values are not directly persisted in the Zustand store — they live in the session queue and problem objects, which are ephemeral. Either option works; Option A has less risk but is less semantically clean.

---

### (3) YouTube Video Embedding via react-native-youtube-iframe

**Status: One new library required. One Expo-bundled peer dependency to install explicitly.**

`react-native-youtube-iframe` embeds YouTube's iframe player API via `react-native-webview`. It does NOT use the native YouTube app or Android's native YouTube SDK — this is the stable, cross-platform approach.

#### New Dependencies

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `react-native-youtube-iframe` | `2.4.1` | YouTube iframe player component | Only maintained YouTube player wrapper with explicit Expo managed workflow documentation; stable WebView-based approach avoids native YouTube SDK complexity |
| `react-native-webview` | `13.16.0` | Peer dependency for youtube-iframe | This IS the Expo SDK 54 bundled version — must be installed via `npx expo install` |

#### Why react-native-youtube-iframe over alternatives

- It is the only actively maintained YouTube iframe wrapper for React Native with Expo managed workflow explicitly documented
- Uses WebView (not native YouTube SDK), which avoids App Store policy complications with native YouTube API usage
- v2.4.1 released July 2025 — actively maintained
- `react-native-youtube` (the older, competing package) is deprecated and requires native module linking that is incompatible with Expo managed workflow

#### Critical installation note

`react-native-webview` is a native module. In Expo managed workflow, it is a first-party supported package bundled at SDK 54 as version 13.16.0. Install with `npx expo install react-native-webview` — NOT bare `npm install` — so Expo resolves the exact compatible version.

#### Known limitations and mitigations

- Play/pause state sync callbacks have reported reliability issues (mid-2025 GitHub issues). Mitigation: keep the integration read-only — video plays, no programmatic pause control from app state needed.
- JSX transform warning appears at build time (cosmetic, not functional) — the package internally uses classic JSX runtime. Does not affect behavior.
- Requires network connectivity. Use the same `isConnected` guard already used in `useTutor.ts` (NetInfo). Show "Video unavailable offline" message when disconnected — same pattern as existing tutor offline handling.

---

### (4) High School Math Domains with Symbolic Answers

**Status: No new dependency. Type extension (1-2 lines) + new domain handlers in pure TypeScript.**

#### Existing infrastructure covers all 9 new domains

| Existing capability | Covers for new domains |
|--------------------|------------------------|
| `NumericAnswer` | Linear equation solutions (x = 4), coordinate values, sequence terms, statistics outputs, log evaluations |
| `ExpressionAnswer` (string) | Symbolic expressions ("2x + 3"), slope-intercept form ("y = 2x + 1"), simplified polynomials |
| `CoordinateAnswer` | Coordinate geometry (intersection points, midpoints) |
| `FractionAnswer` | Rational coefficients in polynomial/logarithm problems |
| Multi-select MC (new, see above) | Quadratic roots with two integer solutions |
| `react-native-svg` (15.12.1) | Coordinate plane / graph plotting for geometry problems — new SVG graph type |

#### What is NOT needed

**No LaTeX rendering library.** The app's established pattern displays all question text and answers as formatted plain strings in `Text` components. High school problems at this level use natural-language format: "Solve for x: 2x + 6 = 14" with answer "x = 4". For symbolic expressions, `ExpressionAnswer.value` is a human-readable string like "3x + 2". This is consistent with how `FractionText.tsx` displays fractions — as styled text, not typeset math.

LaTeX rendering (MathJax, KaTeX via WebView) would be needed only if the app displayed typeset notation like $\frac{d}{dx}[x^2]$. None of the targeted v1.2 domains require that. The existing text-based approach is sufficient through at least logarithms and basic polynomial operations.

**No computer algebra system.** The CLAUDE.md guardrail is explicit: "LLM must NEVER compute math answers — always use the programmatic engine." All 9 new domain handlers compute exact answers deterministically — linear equations via algebra, quadratics via discriminant formula, logarithms via `Math.log()`. No external math library is needed.

**No new graphing library.** The existing SVG graph component library (7 types in `src/components/session/graphs/`) covers data visualization. Coordinate geometry problems need a coordinate plane — implementable as a new SVG graph type in the existing pattern using `react-native-svg` (already installed).

#### Type system changes required

```typescript
// src/services/mathEngine/types.ts

// Grade expansion (1-line change):
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// MathDomain expansion (9 new literals):
export type MathDomain =
  | 'addition' | 'subtraction' | 'multiplication' | 'division'
  | 'fractions' | 'place_value' | 'time' | 'money' | 'patterns'
  | 'measurement' | 'ratios' | 'exponents' | 'expressions'
  | 'geometry' | 'probability' | 'number_theory'
  | 'basic_graphs' | 'data_analysis'
  // v1.2 additions:
  | 'linear_equations' | 'systems_of_equations' | 'quadratics'
  | 'polynomials' | 'exponential_functions' | 'logarithms'
  | 'coordinate_geometry' | 'sequences_series' | 'statistics_extensions';
```

---

### (5) Grade Type Expansion from 1-8 to 1-12

**Status: No new dependency. TypeScript type change + data/UI changes.**

The `Grade` type change (see above) is one line. Downstream impacts are all code changes, not library changes:

| Area | Change Required |
|------|----------------|
| Onboarding grade picker | UI must show grades 9-12 options in `ProfileCreationWizard` |
| Placement test staircase | Add grades 9-12 problems from new domain pool; extend staircase ceiling |
| BKT age parameters | `AgeBracket` type in `src/services/tutor/types.ts` extends to cover ages 14-18 (teen bracket) |
| Session orchestration | No change — session mix algorithm is grade-agnostic |
| Skill map | Visual layout engine needs capacity for 9+ new nodes |
| App store metadata | Age rating change from "Ages 6-9" to "Ages 6-18" |

---

## Recommended Stack

### New Dependencies (v1.2 only)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `react-native-youtube-iframe` | `2.4.1` | YouTube iframe player for AI tutor video hints | Only maintained YouTube player wrapper with Expo managed workflow support; WebView-based (stable, no native YouTube SDK); July 2025 release |
| `react-native-webview` | `13.16.0` | Peer dep for youtube-iframe; WebView primitive | Expo SDK 54 bundled version — install via `npx expo install` |

### No New Dependencies Required For

| Feature | Why No New Dep Needed |
|---------|----------------------|
| NumberPad `-` key | Component logic change in `NumberPad.tsx`; existing `useState<string>` + Pressable pattern sufficient |
| Multi-select MC | New component using `View`, `Pressable`, `Text` + `lucide-react-native` `CheckSquare`/`Square` icons (already installed) |
| High school math domains (9 domains) | Domain handlers are pure TypeScript; existing `Answer` union covers all answer types needed |
| Symbolic answer display ("x = 4", "y = 2x + 1") | Existing `Text` + `ExpressionAnswer` string type; no LaTeX/typeset renderer needed |
| Coordinate plane graph | New SVG graph type using existing `react-native-svg@15.12.1` |
| Grade 1-12 type expansion | Union type change in `types.ts` — zero runtime impact, no migration |
| Multi-root answer encoding | Use `ExpressionAnswer` string encoding "-2,2" OR add `MultiAnswer` to union — pure TypeScript either way |

---

## Installation

```bash
# Install peer dependency via expo install (gets SDK 54 compatible version 13.16.0)
npx expo install react-native-webview

# Install the YouTube iframe wrapper
npm install react-native-youtube-iframe

# No app.json plugin configuration needed for either package
# react-native-webview uses Expo's autolinking (no manual plugin required)
# react-native-youtube-iframe is a JS wrapper with no native code of its own
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `react-native-youtube-iframe` | Raw WebView with YouTube iframe HTML | More boilerplate; no player state callbacks; would need to replicate what the library does for embed params, aspect ratio, and fullscreen handling |
| `react-native-youtube-iframe` | `react-native-youtube` | Deprecated; requires native YouTube SDK; incompatible with Expo managed workflow |
| Plain `Text` for symbolic answers | `react-native-mathjax` (KaTeX via WebView) | Overkill — high school problems at this level use natural-language questions with simple symbolic answers. Each expression rendered in a WebView would hurt scroll performance and introduce visual inconsistency with existing Text-based design. |
| Plain `Text` for symbolic answers | `react-native-math-view` | Requires native modules not available in Expo managed workflow without ejecting |
| Programmatic domain handlers (pure TS) | External CAS library | CLAUDE.md constraint: "LLM must NEVER compute math answers — always use the programmatic engine." Programmatic handlers using `Math.*` and standard arithmetic cover all targeted domains. |
| `ExpressionAnswer` or new `MultiAnswer` | New `MultiAnswer` union member | Either works; `ExpressionAnswer` encoding avoids any migration consideration since `Answer` values are ephemeral (not Zustand-persisted). New member is cleaner semantically — choose based on whether discriminated union exhaustiveness checking is valued over simplicity. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-native-youtube` (old package) | Deprecated; requires native YouTube SDK; not compatible with Expo managed workflow | `react-native-youtube-iframe` |
| `npm install react-native-webview` (bare npm) | Resolves latest npm version, not Expo SDK 54 pinned version — may cause subtle native module incompatibilities | `npx expo install react-native-webview` |
| `react-native-mathjax` | WebView-per-expression; performance penalty at scale; visual inconsistency | Plain `Text` with `ExpressionAnswer` string (sufficient for this app's symbolic answer format) |
| `react-native-math-view` | Requires native modules; Expo managed workflow uses SVG fallback which has worse performance | Plain `Text` or `react-native-svg` for visual math display |
| Any CAS (nerdamer, math.js for solving) | LLM/CAS must never compute math answers (CLAUDE.md guardrail); deterministic engine only | Pure TypeScript domain handlers using `Math.*` |
| FlashList v2.x | Crashes on RN 0.81 (CLAUDE.md guardrail) | FlatList or FlashList v1.x for any new list screens |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `react-native-youtube-iframe@2.4.1` | `react-native-webview@13.16.0` | WebView is the only peer dep; confirmed by library docs |
| `react-native-youtube-iframe@2.4.1` | React Native 0.81.5 | July 2025 release; RN 0.81 confirmed in scope |
| `react-native-youtube-iframe@2.4.1` | React 19.1.0 | Peer dep may emit warning; `--legacy-peer-deps` only if `npm install` fails. Most users do NOT need this flag when installing via Expo tooling. |
| `react-native-webview@13.16.0` | Expo SDK 54 | This IS the Expo 54 bundled version — confirmed by Expo docs and community |
| `lucide-react-native@^0.554.0` | `CheckSquare`, `Square` icons | Already installed; both icons available in current version for multi-select checkbox UI |

---

## Integration Points

### YouTube Video Tutor Architecture

The video hint integrates into the existing tutor escalation state machine (`escalationEngine.ts`) as a post-BOOST option when the hint ladder is exhausted:

```
HINT (Socratic hints 0-N)
  → TEACH (wrong answer threshold)
  → BOOST (deep scaffolding + answer reveal)
  → VIDEO (optional: "Watch a video on this topic")
```

**Implementation approach:**
- `videoMap.ts` in `src/services/tutor/` — static lookup from `skillId` → Khan Academy `videoId`. Static JSON map, no API calls. Khan Academy video IDs are stable public YouTube IDs.
- `YoutubePlayer` component from `react-native-youtube-iframe` renders inline in `ChatPanel` bottom sheet when tutor enters video mode.
- Player params: `modestbranding: 1`, `rel: 0` — minimizes YouTube recommendations (COPPA risk mitigation; keep child focused on learning, not browsing).
- Offline guard: wrap render in `isConnected` check from existing `@react-native-community/netinfo` usage in `useTutor.ts`. Show "Video unavailable — check your connection" message when offline.

**COPPA note:** YouTube iframe embedding is subject to YouTube's own COPPA compliance (YouTube Kids / COPPA settings on channel). Videos must be from COPPA-compliant channels (Khan Academy qualifies). The `rel=0` parameter prevents showing unvetted related videos.

### Domain Handler Pattern for 9 New Domains

All 9 new domains follow the existing `DomainHandler` interface pattern:

```typescript
// Each new domain exports:
export const linearEquationsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData { ... }
};
```

Handlers compute correct answers programmatically:
- **Linear equations** (`ax + b = c`): solve via `(c - b) / a` — integer-constrained generation ensures integer solutions
- **Systems of equations** (2×2): use Cramer's rule or substitution — generated with integer solutions
- **Quadratics** (factorable): generated by choosing two integer roots `r1, r2`, then computing `(x - r1)(x - r2)` — answer is always factorable by construction
- **Logarithms** (`log_b(x) = y`): generated by choosing `b` and `y`, computing `x = b^y` — special values only (no irrational outputs)
- All other domains: similar construction-from-answer pattern (generate answer first, then build problem)

---

## Sources

- [react-native-youtube-iframe install docs](https://lonelycpp.github.io/react-native-youtube-iframe/install/) — Installation requirements, Expo managed workflow compatibility, WebView peer dep (HIGH confidence — official library docs)
- [react-native-youtube-iframe GitHub](https://github.com/LonelyCpp/react-native-youtube-iframe) — v2.4.1 July 2025 release confirmed; open issues reviewed for known problems (HIGH confidence — official source)
- [Expo WebView docs](https://docs.expo.dev/versions/latest/sdk/webview/) — `npx expo install react-native-webview` confirmed as install command; SDK 54 bundled version 13.16.0 confirmed via community sources (HIGH confidence — official Expo docs)
- [react-native-webview npm](https://www.npmjs.com/package/react-native-webview) — Version history and peer dependency information (MEDIUM confidence — npm registry)
- Existing codebase: `src/services/mathEngine/types.ts` — `Answer` discriminated union, `Grade` type, `MathDomain` type (HIGH confidence — direct inspection)
- Existing codebase: `src/components/session/NumberPad.tsx` — current NumberPad interface and state pattern (HIGH confidence — direct inspection)
- Existing codebase: `src/components/session/CompactAnswerRow.tsx` — existing MC component pattern for new multi-select component design (HIGH confidence — direct inspection)
- Existing codebase: `src/services/tutor/types.ts` — tutor mode types, escalation structure (HIGH confidence — direct inspection)
- Existing codebase: `package.json` — confirmed `lucide-react-native@^0.554.0` already installed (HIGH confidence — direct inspection)

---

*Stack research for: Tiny Tallies v1.2 High School Math Expansion + YouTube Video Tutor Hints*
*Researched: 2026-03-12*
