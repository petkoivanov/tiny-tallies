# Project Research Summary

**Project:** Tiny Tallies v1.2 — High School Math Expansion + YouTube Video Tutor Hints
**Domain:** K-12 adaptive math learning app — expanding from grades 1-8 to 1-12 with 9 new algebra/pre-calc domains and inline YouTube instructional videos
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

The v1.2 milestone is a well-scoped extension to an existing, mature adaptive engine. The core infrastructure — Elo + BKT adaptive difficulty, spaced repetition, prerequisite DAG, AI tutor escalation ladder, Bug Library misconception detection — requires zero architectural rework. The expansion adds one new dependency (`react-native-youtube-iframe@2.4.1` via WebView), one new answer union variant (`MultiSelectAnswer`), nine domain handler files, and targeted modifications to a small set of existing files (NumberPad, ChatPanel, useTutor, tutorSlice, safetyFilter). The stack surface change is minimal by design: four of the five capability areas require no new dependencies at all.

The recommended approach is a strict phase-order execution: Phase 80 is a hard blocker for all subsequent work. It establishes the type system foundation (Grade 1-12, MultiSelectAnswer, AgeBracket expansion for high school students, distractor strategy field, safety pipeline fixes for negative numbers) and the store migration (STORE_VERSION 21 to 22). YouTube integration (Phase 81) is independent of domain phases but must follow Phase 80 for STORE_VERSION consistency. The nine domain handlers (Phases 82-90) have no inter-dependencies and can be parallelized. Phase 91 integrates everything and must come last since it depends on all domain skills being registered before the placement staircase can reach grade 9-12 content.

The two highest risks are COPPA compliance for the YouTube feature and correctness of the MultiSelectAnswer evaluation pipeline. YouTube embedding with default settings exposes related video recommendations, tracks usage via Google's ad network, and constitutes a COPPA violation for under-13 users — this must be mitigated with `rel=0`, `youtube-nocookie.com`, and a dedicated parental consent gate before the feature ships. The MultiSelectAnswer pitfall is subtler: correctness checking must use set equality (not sum comparison), the Elo bridge must return a sum proxy only for Elo calculation while `answerDisplayValue()` serves the BOOST prompt separately, and `checkAnswerLeak` must be extended to check all roots. Both risks are fully preventable with the patterns documented in ARCHITECTURE.md and PITFALLS.md.

---

## Key Findings

### Recommended Stack

The entire v1.2 milestone requires only one new npm package. All other capability areas are pure TypeScript and component changes within the existing React Native 0.81 + Expo SDK 54 stack. See `.planning/research/STACK.md` for full details.

**Core technologies:**

- `react-native-youtube-iframe@2.4.1` — YouTube iframe player for AI tutor video hints; only maintained Expo-compatible YouTube wrapper; WebView-based (no native YouTube SDK complications); actively maintained (July 2025 release). Install via `npm install react-native-youtube-iframe`.
- `react-native-webview@13.16.0` — Peer dependency for youtube-iframe; this is the Expo SDK 54 bundled version. Must install via `npx expo install react-native-webview` (not bare npm) to get the SDK-pinned version.
- All other capabilities (NumberPad `-` key, MultiSelectMC component, 9 domain handlers, Grade type expansion, symbolic answer display) — no new dependencies; the existing stack covers everything.

**Critical constraints:** FlashList v1.x only per CLAUDE.md (v2.x crashes on RN 0.81); no LaTeX renderer needed (plain Text + ExpressionAnswer string is sufficient through logarithms); no CAS library (CLAUDE.md guardrail: LLM must never compute math answers).

### Expected Features

See `.planning/research/FEATURES.md` for full feature analysis, prioritization matrix, and competitor breakdown.

**Must have (table stakes — v1.2 launch blockers):**

- NumberPad `±` key — without it, ~70% of high school answers cannot be entered; iOS numeric keyboard has no `-` key (platform constraint)
- Grade range 1-12 throughout onboarding, placement, and skill map — foundational repositioning of the product
- Multi-select MC format with explicit "Check" button — quadratic equations with two roots cannot be correctly assessed without it; all-or-nothing evaluation (no partial credit in v1.2)
- Linear equations domain — highest-demand Algebra 1 skill; entry point for all high school content
- Systems of equations and quadratic equations domains — core Algebra 1-2 content completing the minimum viable HS curriculum
- Prerequisite DAG with K-8 to HS edges — without this, skill map shows disconnected HS nodes and session orchestrator cannot surface HS content appropriately
- YouTube video hints post-BOOST exhaustion — safety-net UX for stuck students; COPPA compliance is mandatory before ship

**Should have (competitive differentiators):**

- Misconception-aware Bug Library for all 9 algebra domains — 4-8 bug patterns per domain; extends the K-8 Bug Library advantage to HS (research base: Lamar University Common Math Errors, ERIC algebra misconception studies)
- Seamless grade-band transition (K-12) — same unified adaptive engine across all grades; competitors silo by grade band (Khan Academy Kids vs. Khan Academy proper)
- Inline YouTube player with thumbs vote — no redirect to YouTube app; vote stored locally per skill; more Socratic than Khan Academy's always-available video links

**Defer to v1.3+:**

- CPA pictorial mode for algebra (bar balance model, parabola sketches) — high value but high complexity; separate SVG renderers needed per domain
- Trigonometry domain — scope equivalent to all 9 planned domains combined; validate HS adoption first
- Calculus domain — requires graphical output infrastructure not yet built
- Graphing calculator or Desmos integration — full product scope; Desmos exists as an external tool students already use

**Anti-features (do not build in v1.2):**

- Free-text algebraic expression input — no production-quality CAS for React Native; design problems to avoid requiring it
- Complex or imaginary number answers — out of scope; generate real-root-only quadratics (if discriminant < 0, generate a different problem)
- Social leaderboard — COPPA prohibition on comparative child data; also causes math anxiety (research-documented)
- Step-by-step solution reveal — defeats the Socratic tutor architecture; BOOST mode fills this gap without revealing the final answer

### Architecture Approach

The v1.2 expansion is purely additive. The generator → registry → domain handler pipeline, the Elo/BKT/Leitner engines, the tutor escalation state machine, the session orchestrator, and the safety pipeline are all unchanged. New capabilities wire in at precisely defined extension points. See `.planning/research/ARCHITECTURE.md` for component-level detail, data flows, and the complete file-by-file change inventory.

**Major new/modified components:**

1. `src/services/mathEngine/types.ts` (MODIFY) — add `MultiSelectAnswer` as a 6th union variant, extend `Grade` to 9-12, add 9 `MathDomain` values, add `answerDisplayValue()` export alongside existing `answerNumericValue()`
2. `src/components/session/MultiSelectMC.tsx` (NEW) — checkbox-style MC with independent "Check" button; set equality correctness check; never auto-submit on selection; cap at 4-5 options
3. `src/services/tutor/videoMap.ts` (NEW) — static `DOMAIN_VIDEO_MAP` constant; `getVideoForDomain()` pure function; module-level constant, NOT a Zustand slice
4. `src/components/chat/VideoCard.tsx` (NEW) — wraps `react-native-youtube-iframe`; passes restrictive playerVars (`rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1, fs: 0`); gates on `isConnected`
5. `src/hooks/useTutor.ts` (MODIFY) — expose `videoId: string | null` computed from `ladderExhausted && getVideoForDomain(currentProblem.operation)`
6. `src/services/mathEngine/domains/*.ts` (9 NEW files) — one `DomainHandler` per domain, each paired with skills + templates files and bug patterns
7. `src/store/appStore.ts` + `src/store/migrations.ts` (MODIFY) — STORE_VERSION 21 to 22 with migration for grade expansion and new Phase 80 fields (including `youtubeConsentGranted`)

**Key architectural decisions:**

- `MultiSelectAnswer` correctness uses `setsEqual()`, not sum comparison — `answerNumericValue()` returns sum only as Elo proxy; `answerDisplayValue()` returns "2 and 3" for BOOST prompt; these two purposes must never be conflated
- `videoMap.ts` is a module constant, not a store slice — video IDs updated via app release or OTA (Expo Updates), not Zustand migration
- All 9 domain handlers use a construction-from-answer pattern (generate answer first, build problem around it) — ensures integer solutions, avoids irrational outputs
- No LaTeX renderer, no CAS — plain Text components for symbolic answers; MC-only for expression selection (e.g., choose the factored form)

### Critical Pitfalls

See `.planning/research/PITFALLS.md` for all 11 pitfalls with full prevention checklists. Top 5 requiring immediate attention in Phase 80:

1. **`checkAnswerLeak` broken for negative numbers** — `\b-3\b` regex fails at word boundaries with negative numbers; must fix before any algebra domain ships; extend to check all roots for multi-select; add regression test `checkAnswerLeak("subtract three", -3)` returns `safe: false`

2. **YouTube COPPA compliance** — default `react-native-youtube-iframe` settings expose related video recommendations and Google ad tracking; must pass `{ rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1, fs: 0 }` and use `youtube-nocookie.com`; gate behind dedicated `youtubeConsentGranted` parental consent (separate from existing `tutorConsentGranted`); curated allow-list bundled in app, never fetched from YouTube API at runtime

3. **`AgeBracket` missing high school brackets** — current `'6-7' | '7-8' | '8-9'` returns `undefined` for age 16; `CONTENT_WORD_LIMITS[undefined]` silently skips word-count validation; `buildSystemInstruction` generates elementary-register hints for 16-year-olds; fix in Phase 80 by adding `'14-18'` bracket with permissive word limits and algebra-appropriate register

4. **MultiSelectAnswer correctness semantics** — sum comparison is wrong for isCorrect check (e.g., {1,5} and {2,4} both sum to 6 but are different answers); use `setsEqual()` at session evaluation; `answerNumericValue()` is Elo-only; `answerDisplayValue()` is for BOOST prompt

5. **Elo `baseElo` miscalibration for HS domains** — a grade-8-completing student arrives at Elo approximately 1050-1150; entry-level linear equation templates must have `baseElo: 1000-1050` (not 1300+); over-seeding triggers the frustration guard on the student's first HS session; calibrate each domain before coding templates

---

## Implications for Roadmap

Based on cross-file research, the 12-phase structure (80-91) is well-founded. The phase ordering is non-negotiable for Phases 80 and 91; Phases 82-90 are parallelizable within that bracket.

### Phase 80: Foundation (HARD BLOCKER — all other phases depend on this)

**Rationale:** Type system changes, safety pipeline fixes, and store migration must land before any domain or YouTube work. Every subsequent phase touches files that Phase 80 changes. AgeBracket expansion is also required here — the first algebra domain (Phase 82) will issue tutor requests for high school students and must not hit undefined bracket lookups.
**Delivers:** Grade 1-12 type expansion (Grade type, MAX_GRADE constant, ProfileCreationWizard age-to-grade mapping, AgeRange, BKT age brackets, onboarding slice); MultiSelectAnswer union variant + `answerDisplayValue()`; NumberPad `±` key (prop-gated `showNegative?: boolean`, backward compatible); MultiSelectMC component; `checkAnswerLeak` fix for negative numbers and multi-root answers; AgeBracket expansion to `'14-18'` with algebra-appropriate register; `distractorStrategy` field on ProblemTemplate; STORE_VERSION 21 to 22 with migration
**Addresses:** NumberPad negative input (table stakes), multi-select MC format (table stakes), grade range expansion (table stakes)
**Avoids:** Pitfalls 1, 3, 4, 5, 7, 9 (all Phase 80 items from the pitfall-to-phase mapping)
**Research flag:** Standard patterns — no research phase needed. All changes are direct codebase modifications with full inspection confidence.

### Phase 81: YouTube Video Tutor Integration

**Rationale:** YouTube integration is independent of domain phases but must follow Phase 80 for STORE_VERSION consistency. It is the highest-risk single change in the milestone (new native dependency + COPPA exposure) and should be proven early to avoid blocking Phase 91.
**Delivers:** `react-native-youtube-iframe@2.4.1` + `react-native-webview@13.16.0` installed via `npx expo install`; `videoMap.ts` with curated Khan Academy video IDs for all 9 planned domains; `VideoCard.tsx` with correct playerVars and `youtube-nocookie.com`; ChatPanel + useTutor modifications; `tutorSlice.videoVotes` (ephemeral, not persisted); `youtubeConsentGranted` parental consent gate in ParentalControlsScreen; offline guard via existing NetInfo pattern; video lazy-mounted only when "Watch video" is tapped; video starts muted
**Addresses:** YouTube video hints (differentiator), inline player with vote feedback (differentiator)
**Avoids:** Pitfall 6 (COPPA), performance trap (lazy-mount WebView only when triggered)
**Research flag:** Needs early validation. `react-native-youtube-iframe` New Architecture compatibility is not explicitly documented — run a minimal proof-of-concept on a real device (not Expo Go) before committing to the full implementation. If incompatible, the fallback is raw WebView embedding a YouTube embed URL directly.

### Phases 82-90: Nine Domain Handlers (parallelizable)

**Rationale:** Each domain phase follows the identical 8-step DomainHandler pattern (domain handler file, skills file, templates file, bug patterns, round-trip tests, baseElo calibration doc). No inter-dependencies between domains. Ordered easy-to-hard within the prerequisite dependency graph to validate the MultiSelectAnswer pipeline incrementally before the most complex domain (quadratics, Phase 87).

**Suggested domain order with rationale:**

- **Phase 82 — linear_equations** (G8-9): Simplest answer type (NumericAnswer only); establishes the algebra Socratic hint phrasing pattern in `buildSystemInstruction`; first validation of `checkAnswerLeak` fix for negative answers; entry baseElo 1000-1050
- **Phase 83 — coordinate_geometry** (G8-10): NumericAnswer + existing CoordinateAnswer; new coordinate plane SVG graph type using existing react-native-svg; validates slope as FractionAnswer path
- **Phase 84 — sequences_series** (G9-11): NumericAnswer only; extends existing `patterns` domain logic; lowest complexity of the 9 new domains
- **Phase 85 — statistics_hs** (G9-11): NumericAnswer; standard deviation requires careful dataset generation and rounding strategy; normal distribution concepts use ExpressionAnswer MC-only (string labels)
- **Phase 86 — systems_equations** (G9-10): NumericAnswer; curated 2x2 integer-coefficient systems with integer solutions via Cramer's rule or substitution
- **Phase 87 — quadratic_equations** (G9-10): First production use of MultiSelectAnswer and MultiSelectMC; validates end-to-end multi-select pipeline; discriminant must be perfect square for all two-root templates; baseElo 1100-1150
- **Phase 88 — polynomials** (G9-10): ExpressionAnswer MC for factored forms (canonical strings assembled by handler); NumericAnswer for polynomial evaluation
- **Phase 89 — exponential_functions** (G9-11): NumericAnswer; integer base and exponent inputs; growth/decay evaluation
- **Phase 90 — logarithms** (G10-11): NumericAnswer; special-value log tables only (e.g., log₂8 = 3); avoid templates requiring log-law symbolic manipulation; baseElo 1200-1250

**Each phase delivers:** Domain handler + skills + templates files; 4-8 bug patterns in Bug Library; round-trip tests (template → generator → answer type); baseElo calibration document per domain
**Avoids:** Pitfall 2 (algebra-appropriate distractor strategy per domain), Pitfall 3 (extend checkAnswerLeak per domain), Pitfall 11 (baseElo calibration against K-8 scale)
**Research flag:** Phase 82 (linear equations) needs manual review of 10 sample AI tutor hints before shipping to verify the Socratic constraint holds for algebra — procedure-revealing hints are the key risk (Pitfall 8). The algebra-aware `buildSystemInstruction` additions from Phase 82 become the template reused by Phases 83-90. All other domain phases are standard patterns.

### Phase 91: Integration (LAST — depends on all domain phases)

**Rationale:** Placement test, skill map, and prerequisite DAG can only be fully integrated after all 9 domain skill registrations exist. `getSkillsByGrade(9)` returning non-empty arrays is a hard prerequisite for Phase 91.
**Delivers:** `MAX_GRADE = 12` in PlacementTestScreen; HS prerequisite DAG edges (linear_equations → systems_equations, linear_equations → coordinate_geometry, quadratic_equations → polynomials, expressions → polynomials, exponents → exponential_functions, exponential_functions → logarithms, data_analysis → statistics_hs); skill map layout with 9 new HS domain clusters; store migration resetting `placementComplete: false` for existing users stuck at the grade-8 ceiling with >80% grade-8 BKT mastery; "Retake Placement" button in ParentalControlsScreen; integration tests verifying `generateForGrade(9)` through `generateForGrade(12)` return non-null Problems
**Avoids:** Pitfall 10 (placement test ceiling at grade 8, existing-user regression)
**Research flag:** Prerequisite DAG edge completeness needs curriculum review against Common Core HS standards before encoding. The dependency graph in FEATURES.md is the starting point but edge cases (e.g., whether statistics_hs requires coordinate_geometry or only data_analysis) should be validated during Phase 91 planning.

### Phase Ordering Rationale

- Phase 80 must be first because the Grade type, MultiSelectAnswer union, AgeBracket expansion, distractor strategy field, safety pipeline fixes, and store migration version are all touched by every subsequent phase.
- Phase 81 must follow Phase 80 (STORE_VERSION consistency) but is otherwise independent — placing it early surfaces YouTube native compatibility issues before they can become blockers.
- Domain phases 82-90 are ordered by prerequisite dependency graph and by incremental MultiSelectAnswer validation (simpler domains before quadratics). They can be parallelized across branches.
- Phase 91 must be last because it requires all 9 domain skill registrations to function correctly, and it includes the existing-user placement migration that should only run once all HS content is available.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 81 (YouTube):** New Architecture compatibility of `react-native-youtube-iframe` not explicitly documented. Run proof-of-concept on a real device early. COPPA playerVars and consent flow should be reviewed against YouTube's Data API COPPA documentation and 16 CFR Part 312 before shipping.
- **Phase 82 (linear_equations):** Socratic hint phrasing for algebra is genuinely novel territory for this codebase. Manual review of 10+ Gemini outputs for linear equation hints is required before Phase 82 ships. The `buildSystemInstruction` algebra-aware additions must be documented for reuse by Phases 83-90.
- **Phase 91 (integration):** Prerequisite DAG edge completeness needs curriculum review against Common Core HS standards. Placement test staircase promotion thresholds (currently "3 consecutive correct") should be reconsidered for the grade-8 to grade-9 transition boundary.

Phases with standard patterns (skip research-phase):

- **Phases 83-90 (domain handlers):** All follow the identical 8-step DomainHandler pattern established in Phase 82. Each is a mechanical application of the existing registry/handler/skills/templates structure.
- **Phase 80 (foundation):** Entirely within existing codebase with full direct inspection confidence. All changes are type additions, component additions, and targeted safety pipeline fixes with no external library unknowns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library choices verified against official Expo SDK 54 docs, npm registry, and direct codebase inspection. Only one new dependency. Peer dependency version locked to Expo 54 bundled version. Installation commands verified. |
| Features | MEDIUM-HIGH | Pedagogy claims HIGH (IES practice guides, Common Core standards, PMC meta-analyses). Competitor UX patterns MEDIUM (inferred from public behavior for IXL, Khan Academy — not official API docs). Anti-feature rationale HIGH (first-principles technical and legal analysis). |
| Architecture | HIGH | Based on direct codebase inspection of all integration points: types.ts, useTutor.ts, ChatPanel.tsx, NumberPad.tsx, PlacementTestScreen.tsx, appStore.ts, tutorSlice.ts, onboardingSlice.ts, safetyFilter.ts, distractorGenerator.ts, eloCalculator.ts. Architecture is additive and all extension points are precisely identified. |
| Pitfalls | HIGH | All 11 pitfalls identified via direct codebase analysis. Regex behavior (`\b` with negative numbers), COPPA requirements (16 CFR Part 312), Zustand partialize behavior, BKT bracket lookup patterns, and Elo sigmoid calibration all verified against actual code and official sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **react-native-youtube-iframe New Architecture compatibility:** Library docs do not explicitly confirm RN New Architecture support. Expo SDK 54 enables New Architecture by default. Resolve with a minimal integration proof-of-concept in Phase 81 before full implementation. The fallback (raw WebView with YouTube embed URL) is well-understood.
- **Elo baseElo calibration for HS domains:** The anchor point (grade-8-completing student at Elo 1050-1150) is a reasoned estimate, not a measured value from production analytics. Check actual student Elo distribution at grade-8 completion before setting template baseElo values.
- **Socratic hint register for algebra:** The AI tutor has no precedent for algebra domains in this codebase. The Phase 82 hint pattern must be established carefully and used as the template for Phases 83-90. Manual review of Gemini outputs is required before Phase 82 ships.
- **Prerequisite DAG completeness:** The dependency graph in FEATURES.md covers obvious edges. Edge cases should be reviewed against Common Core HS standards during Phase 91 planning before encoding as permanent DAG structure.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection: `src/services/mathEngine/types.ts`, `src/hooks/useTutor.ts`, `src/components/chat/ChatPanel.tsx`, `src/components/session/NumberPad.tsx`, `src/screens/PlacementTestScreen.tsx`, `src/store/appStore.ts`, `src/store/slices/tutorSlice.ts`, `src/services/tutor/safetyFilter.ts`, `src/services/tutor/types.ts`, `src/services/adaptive/eloCalculator.ts`, `src/services/mathEngine/bugLibrary/distractorGenerator.ts`
- [react-native-youtube-iframe official docs](https://lonelycpp.github.io/react-native-youtube-iframe/install/) — installation, Expo managed workflow, playerVars support
- [Expo WebView docs](https://docs.expo.dev/versions/latest/sdk/webview/) — SDK 54 bundled version 13.16.0 confirmed, `npx expo install` required
- [Common Core HS Algebra Standards (HSA)](https://www.thecorestandards.org/Math/Content/HSA/) — domain structure and skill progression
- [Common Core HS Functions Standards (HSF)](https://www.thecorestandards.org/Math/Content/HSF/) — exponential, logarithmic, sequence domains
- [IES Practice Guide: Teaching Strategies for Improving Algebra Knowledge](https://ies.ed.gov/ncee/wwc/docs/practiceguide/wwc_algebra_040715.pdf) — symbolic vs contextual mix, word problem pedagogy
- COPPA (16 CFR Part 312) — YouTube embedding compliance requirements for under-13 users
- YouTube IFrame Player API docs — `rel=0`, `modestbranding`, `youtube-nocookie.com` parameters

### Secondary (MEDIUM confidence)

- [PMC: Calculation vs Word-Problem Instruction](https://pmc.ncbi.nlm.nih.gov/articles/PMC4274629/) — contextual before symbolic for conceptual understanding
- [react-native-youtube-iframe GitHub](https://github.com/LonelyCpp/react-native-youtube-iframe) — v2.4.1 July 2025; `useLocalHTML` workaround for iframe timeout; open issues reviewed
- [IXL: Solve quadratic by factoring](https://www.ixl.com/math/algebra-1/solve-a-quadratic-equation-by-factoring) — competitor two-box answer format reference
- [Lamar University: Common Math Errors](https://tutorial.math.lamar.edu/extras/commonerrors/algebraerrors.aspx) — algebra misconception source for Bug Library patterns
- [ERIC: Common Errors in Algebraic Expressions](https://files.eric.ed.gov/fulltext/EJ1264037.pdf) — distractor and bug pattern research base

### Tertiary (LOW confidence)

- Khan Academy hint behavior (inferred from public UX, not official docs) — video-first vs. video-last placement pattern comparison
- `react-native-youtube-iframe` New Architecture compatibility — not explicitly documented; inferred from library activity and RN 0.81 compatibility claims

---

*Research completed: 2026-03-12*
*Ready for roadmap: yes*
