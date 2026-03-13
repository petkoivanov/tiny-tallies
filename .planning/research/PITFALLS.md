# Pitfalls Research

**Domain:** High school math expansion (K-12) added to an existing K-8 numeric math engine — algebra domains, multi-select MC, negative input, YouTube tutor integration, grade type expansion, placement test gaps
**Researched:** 2026-03-12
**Confidence:** HIGH (direct codebase analysis: types.ts, distractorGenerator.ts, safetyFilter.ts, eloCalculator.ts, appStore.ts, migrations.ts, PlacementTestScreen.tsx, multipleChoice.ts, onboardingSlice.ts)

---

## Critical Pitfalls

### Pitfall 1: Treating Algebra as Numeric When Answers Are Symbolic

**What goes wrong:**
The current `Answer` discriminated union (`NumericAnswer | FractionAnswer | ComparisonAnswer | CoordinateAnswer | ExpressionAnswer`) and the bridge function `answerNumericValue()` force every answer into a single number for Elo calculation, distractor generation, and the safety pipeline. High school algebra introduces problems where the answer is `x = -3` or `{x: 2, y: 5}` — not a scalar. If a developer adds a `LinearEquationAnswer { type: 'linear_equation'; variable: string; value: number }` type and forgets to update `answerNumericValue()`, the fallback branch `parseFloat(answer.value) || 0` returns `NaN` or `0`, silently corrupting Elo updates and distractor generation for every linear equation problem ever presented.

**Why it happens:**
`answerNumericValue()` has an exhaustive switch but the `expression` branch uses `parseFloat(answer.value) || 0` as a numeric approximation for a string. Developers adding new answer types will add a branch but may not realize the numeric bridge is used downstream by the Elo calculator (`calculateEloUpdate`), the distractor generator (`generateDistractors`), and the safety filter (`checkAnswerLeak`). Each of those systems calls `answerNumericValue()` on the `correctAnswer` field.

**How to avoid:**
- For problems where the answer is a variable's value (e.g. `x = -3`), keep using `NumericAnswer { type: 'numeric', value: -3 }` — the answer IS the numeric value -3. The variable name is display/question text, not the answer type.
- For multi-root quadratic answers (e.g. `x = 2` and `x = -5`), use a new `MultiNumericAnswer { type: 'multi_numeric'; values: number[] }` type, and update `answerNumericValue()` to return the primary root (lowest absolute value, or first element), with a unit test confirming the bridge value.
- Do NOT create a string-based answer type for anything the safety pipeline must compare against a number. String answers bypass `checkAnswerLeak` which operates on `number`, making it impossible to detect if the LLM reveals the answer.
- Write a TypeScript exhaustive check assertion in `answerNumericValue()` so adding a new Answer branch without a case is a compile-time error.

**Warning signs:**
- Elo stays stuck at 1000 for algebra skills (NaN from parseFloat rounds to 0 → K*0 delta → no movement)
- Distractor generator `isValidDistractor` passes all values because `correctAnswer` is 0 or NaN
- Safety pipeline never trips on answer leaks for algebra problems

**Phase to address:** Phase 80 (Foundation — type system expansion)

---

### Pitfall 2: Adjacent ±1 Distractor Phase Generates Nonsensical Algebra Distractors

**What goes wrong:**
`generateDistractors()` Phase 2 always appends `correctAnswer + 1` or `correctAnswer - 1` as an "adjacent" distractor. For arithmetic, this is pedagogically meaningful (off-by-one errors are real). For algebra it creates absurd options. If the answer to a linear equation is `x = -3`, the adjacent distractor `-2` carries no conceptual meaning — it implies "I almost balanced the equation" which is not a real misconception. For sequences/series (e.g. arithmetic sequence next term = 47), ±1 is plausible but for a quadratic factoring problem where roots are `{2, -5}`, a distractor of `{2, -4}` (generated as numeric -4 adjacent to -5) looks arbitrary to a student.

Worse: the random fallback Phase 3 uses `rangeHalf = Math.max(Math.floor(Math.abs(correctAnswer) * 0.4), 5)`. For `x = -3`, the range is `[-3 - 1.2, -3 + 1.2]` clamped to `[-5, -2]` — a cluster of negative values. For `x = 100` (slope calculation result), the range is `[60, 140]` — and the "wrong" options would all be plausible slopes, which is actually decent, but it happened by accident not design.

**Why it happens:**
The distractor generator was designed for K-8 arithmetic answers (integers 0–999, decimals 0–99.99). The "adjacent ±1 is a meaningful misconception signal" assumption breaks for any domain where the answer space is not a linear number line (roots, slopes, intercepts with specific meaning, logarithm values).

**How to avoid:**
- Add a `distractorStrategy` field to `ProblemTemplate` with values: `'adjacent'` (default, current behavior), `'algebra_root'` (±2, ±5, ±10 offsets for roots), `'slope'` (multiples and sign-flips), `'logarithm'` (common wrong log values: off-by-exponent), `'sequence_next_term'` (common delta errors).
- For multi-root problems, generate distractors as full root-sets where one root is wrong, not individual numeric distractors.
- The Phase 2 adjacent step should be configurable per domain: `adjacentStep: number` on the template, defaulting to 1. Algebra templates set `adjacentStep: 5` or `adjacentStep: 10`.
- Bug Library patterns for algebra must be added BEFORE Phase 82 ships, otherwise 100% of distractors come from Phase 3 random — which works but destroys misconception detection.

**Warning signs:**
- All algebra distractors have `source: 'random'` in the `DistractorResult[]` — no bug library hits, no meaningful adjacent distractors
- MC options for a quadratic root problem are `{-3, -2, -1}` — a cluster of adjacent integers instead of pedagogically distinct wrong roots

**Phase to address:** Phase 80 (distractor strategy field on template), then each domain phase (82–90) adds its own bug library patterns

---

### Pitfall 3: `checkAnswerLeak` Breaks for Negative Answers and Multi-Root Answers

**What goes wrong:**
`checkAnswerLeak(response, correctAnswer: number)` builds regex patterns from `String(correctAnswer)`. For `correctAnswer = -3`, `answerStr = "-3"`, and `escapeRegex("-3")` produces `\-3`. The word boundary pattern `\b\-3\b` will NOT match "-3" in a sentence because `\b` does not work at the boundary between whitespace and a minus sign in JavaScript regex. The hint "Try subtracting 3 from both sides" would pass the leak check even though it reveals the procedure leading directly to -3.

For multi-root answers where `answerNumericValue()` returns only the primary root (say `2` from `{2, -5}`), the secondary root `-5` is never checked. The LLM could say "one of the roots is negative five" and the safety pipeline would not catch it.

**Why it happens:**
The safety pipeline was designed when all answers were positive integers or simple decimals. The `numberToWord()` helper only covers integers 0–20 (or similar small range). The `\b` anchor does not recognize `-` as a word boundary character.

**How to avoid:**
- Fix `checkAnswerLeak` to handle negative numbers: check for both `String(Math.abs(correctAnswer))` with a preceding `-` or `negative` word pattern.
- For multi-root answer types, call `checkAnswerLeak` once per root value, OR pass all roots as an array to a new `checkMultiAnswerLeak(response, roots: number[])` function.
- Add regression tests: `checkAnswerLeak("subtract three from x", -3)` should return `safe: false`. `checkAnswerLeak("one root is negative five", -5)` should return `safe: false`.
- The `numberToWord()` function must handle negative number descriptions: "negative three", "minus three".

**Warning signs:**
- Unit tests for `checkAnswerLeak` with `correctAnswer = -3` pass when they should fail
- Hint for a linear equation problem includes the procedure that trivially reveals a negative answer

**Phase to address:** Phase 80 (before any algebra domain ships — fix the safety pipeline first)

---

### Pitfall 4: `Grade` Type Is a Literal Union — Adding 9/10/11/12 Is Not One Line

**What goes wrong:**
`Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8` in `src/services/mathEngine/types.ts` is used as the `grades` array type on every `ProblemTemplate` and every `SkillDefinition`, as a cast in `PlacementTestScreen.tsx` (`grade as Grade`), in `getSkillsByGrade(grade as Grade)`, in `profileInitService`, and in the BKT age-bracket mapping. The staircase algorithm hard-codes `MAX_GRADE = 8` in `PlacementTestScreen.tsx`. The `onboardingSlice` comment says `placementGrade: number | null` — grade 1-8 — and the completed placement calls `completePlacement(grade, theta)` with no guard above 8.

If a developer simply adds `| 9 | 10 | 11 | 12` to the `Grade` type, TypeScript will compile, but `getSkillsByGrade(9)` returns an empty array (no skills registered at grade 9 yet), `MAX_GRADE = 8` in the placement screen means grade 9-12 is unreachable in placement, and any UI that displays grade as an ordinal string (`"${grade}th grade"`) will show "8th grade" as the ceiling.

**Why it happens:**
The `Grade` type was intentionally constrained to 1-8 as a correctness guard. It was expanded from 1-4 to 1-8 in a prior milestone (noted in PROJECT.md: "Grade type expanded from 1-4 to 1-8 — pre-v0.9"), which means there is precedent for the pattern, but each expansion requires updating more than just the type.

**How to avoid:**
A checklist for the Grade type expansion (Phase 80):
1. Change `Grade = 1|2|3|4|5|6|7|8` to `Grade = 1|2|3|4|5|6|7|8|9|10|11|12`.
2. Update `MAX_GRADE` constant in `PlacementTestScreen.tsx` from `8` to `12`.
3. Update `requiredStreak()` in `PlacementTestScreen.tsx` — the "at or above child's grade" boundary may need recalibration for older students.
4. Update `onboardingSlice.ts` comment.
5. Update `ProfileCreationWizard.tsx`: `autoGrade = Math.max(0, Math.min(6, selectedAge - 5))` — currently caps at grade 6 for age 11. High school students need grades up to 12. Change to `Math.max(0, Math.min(12, selectedAge - 5))`.
6. Update the `AgeRange` type in `childProfileSlice.ts`: `'6-7' | '7-8' | '8-9' | null` — this needs brackets through `'17-18'` or a more flexible representation for high school students.
7. The BKT parameters are age-bracketed — high school students (14-18) have different learning rates than the existing 6-9 brackets. A missing bracket defaults to undefined, causing `undefined` parameter lookups in `bktCalculator.ts`.
8. Run `npm run typecheck` — TypeScript exhaustive checks on the Grade union will surface any missed consumers.

**Warning signs:**
- `getSkillsByGrade(9)` returns `[]` after the type change but before skills are registered
- Placement test completes at grade 8 for a student who gets every question right
- BKT mastery probability never changes for grade 9+ students (missing age bracket → NaN parameters)

**Phase to address:** Phase 80 — Grade type expansion must be the very first thing, before any domain handlers are added

---

### Pitfall 5: Store Migration Version Must Be Bumped for Grade Type Change

**What goes wrong:**
Expanding the Grade type from 1-8 to 1-12 does not by itself require a store migration — BUT if the `childGrade` field in `childProfileSlice` is currently stored as a number validated elsewhere to be 1-8, existing users re-taking placement in high school might get assigned grade 9-12. That stored value then flows into `getSkillsByGrade()` which returns `[]` until Phase 82 domains are registered. More critically, any store field that uses `Grade` as an array element type (e.g. `grades: Grade[]` in skill state) will have persisted grade values of 1-8. When `Grade` expands, the persisted data is still valid, but the developer may be tempted to skip the migration since "no data changes." The real danger is any new slice fields added in Phase 80 (e.g. a `gradeRange` field for K-12 app positioning, a `youtubeConsentGranted` boolean, a `negativeInputEnabled` feature flag) without a migration function.

The CLAUDE.md guardrail is explicit: "Don't modify store migration version without adding a corresponding migration function." The complementary risk is adding new slice fields WITHOUT bumping the version — existing users never get the new field initialized, causing `undefined` reads that TypeScript doesn't catch because `partialize` only persists a subset of the store.

**Why it happens:**
Developers add new fields to slices and test on a clean install (where Zustand initializes everything from slice defaults). On upgrade, existing users have the old persisted JSON which does not include the new field. Zustand's `persist` middleware does NOT deep-merge new fields from defaults — it replaces the persisted subtree entirely only when the version changes and `migrate()` runs. Without a version bump, the missing field is simply absent, and JavaScript `undefined` propagates silently.

**How to avoid:**
- Current `STORE_VERSION = 21`. Phase 80 adds at least: `youtubeConsentGranted: boolean` (new parental consent), potentially `negativeInputEnabled: boolean`. Bump to STORE_VERSION 22 and add migration: `state.youtubeConsentGranted ??= false`.
- Phase 81 (YouTube) must bump again if it adds any persisted fields.
- Any phase that adds slice fields must bump and migrate. Add a CI test that cross-references STORE_VERSION with the count of `if (version < N)` blocks in migrations.ts.
- The `partialize` function in `appStore.ts` only persists the per-child `ChildData` blob plus auth fields. New top-level (non-child) fields must be explicitly added to `partialize` or they will not survive app restart, even with correct migration.

**Warning signs:**
- New feature works on fresh install but fails on upgrade (classic "upgrade regression")
- `youtubeConsentGranted` is `undefined` at runtime despite being typed as `boolean`
- `STORE_VERSION` is bumped but no `if (version < N)` block exists in `migrations.ts`

**Phase to address:** Phase 80 and every subsequent phase that touches slice state

---

### Pitfall 6: YouTube Embedding in COPPA-Regulated App Requires Specific Technical Controls

**What goes wrong:**
Embedding YouTube via `react-native-youtube-iframe` with default settings loads YouTube's standard player, which includes: autoplay recommendations ("Up Next"), the YouTube branding that leads to a full YouTube app, comments visible on some embeds, and possibly ads targeted by Google's ad network. In a COPPA-regulated app for users under 13, this is a direct legal exposure. The YouTube Data API v3 and YouTube IFrame Player API both have specific COPPA compliance modes, but they are not enabled by default. The `react-native-youtube-iframe` library wraps the IFrame Player API but does not automatically pass `origin`, `rel=0`, `modestbranding=1`, or `playsinline=1` unless the developer explicitly sets them.

Additionally, `react-native-youtube-iframe` renders inside a WebView. If the WebView allows JavaScript execution (it must, for the player to work), it creates a new attack surface: the YouTube player iframe can execute JavaScript that may reach back into the WebView's bridge. This is mitigated by the library's sandboxing but not eliminated.

**Why it happens:**
Developers integrate YouTube for the content (Khan Academy curated videos) and do not realize the player carries behavioral tracking and recommendation logic that violates COPPA. The "it works" moment hides the compliance issue entirely — the player loads fine, plays video fine, but is sending analytics to Google and potentially showing non-compliant content paths.

**How to avoid:**
- Always pass `playerVars` with: `{ rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1, fs: 0, cc_load_policy: 0 }`. The `rel: 0` flag prevents related videos after playback (limits cross-links to YouTube content).
- Use YouTube's "No Cookie" domain (`youtube-nocookie.com`) — `react-native-youtube-iframe` supports this via `webViewProps` or by passing a custom `baseUrl`. This reduces tracking.
- Gate the entire YouTube feature behind the existing `tutorConsentGranted` parental PIN consent — the same consent that gates the AI tutor. Do NOT show YouTube videos to children whose parent has not consented to the AI tutor (treat YouTube as equivalent risk).
- Add a second specific consent disclosure for video content in the `ParentalControlsScreen` (separate boolean: `youtubeConsentGranted`), since parents may consent to AI text tutoring but not to embedding YouTube.
- Maintain a curated allow-list of video IDs (Khan Academy specific videos only). Never dynamically fetch recommended videos from YouTube API. Hardcode or store the curated map in the app bundle.
- The curated map should live in a file that can be updated via OTA (Expo Updates), not in the app binary, so broken or inappropriate videos can be pulled without an App Store release.

**Warning signs:**
- YouTube player shows "Up Next" recommendations after video ends
- YouTube player shows YouTube logo that deep-links to YouTube app
- Parent reports "my child ended up watching unrelated YouTube content"
- App Store review flags embedded browser/WebView content

**Phase to address:** Phase 81 (YouTube integration) — consent gate is prerequisite, curated allow-list is mandatory before shipping

---

### Pitfall 7: AI Tutor `AgeBracket` Is Hard-Coded to `'6-7' | '7-8' | '8-9'` — High School Students Get Wrong Hint Register

**What goes wrong:**
`AgeBracket = '6-7' | '7-8' | '8-9'` is used throughout the tutor pipeline: `CONTENT_WORD_LIMITS`, `MAX_WORD_LENGTH`, `buildSystemInstruction`, `runSafetyPipeline`, and `validateContent`. A 15-year-old doing Algebra 2 should receive hints with adult vocabulary and full sentences. Currently, any child in grades 9-12 would have `childAge` outside 6-9, and whatever age-to-bracket mapping exists would either clamp to `'8-9'` or produce `undefined` (causing `CONTENT_WORD_LIMITS[undefined]` to return `undefined`, and `maxWordsPerSentence = undefined` would skip the word count check entirely — a silent over-permissive failure).

The `buildSystemInstruction` prompt tells Gemini to "use vocabulary appropriate for a [age]-year-old child." For a 16-year-old, this produces kindergarten-register hints, which are insulting and ineffective.

**Why it happens:**
`AgeBracket` was sized for the original 6-9 age target. The type is a literal union with exactly 3 values. There is no default/fallback bracket for ages outside 6-9.

**How to avoid:**
- Add high school brackets to `AgeBracket`: `'9-10' | '10-11' | '11-12' | '12-14' | '14-18'`. The last bracket covers all of high school.
- Update `CONTENT_WORD_LIMITS` and `MAX_WORD_LENGTH` in `safetyConstants.ts` with appropriate values for each new bracket. For `'14-18'`, the word limit should be 25-30 (no restriction needed), word length 15+ (no restriction).
- Update `buildSystemInstruction` to use age-appropriate register: for `'14-18'`, instruct Gemini to use "algebra terminology appropriate for a high school student."
- The existing content validation for high school brackets should still check for *mathematical* vocabulary appropriateness (no accidentally adult topics) but the word-length filter becomes irrelevant — keep the structure but with permissive limits.
- The age-to-bracket mapping function (wherever it lives) must handle ages 10-18. Add a test: `ageToBracket(16)` returns `'14-18'`, not `undefined` or `'8-9'`.

**Warning signs:**
- Hints for a 16-year-old say "great job!" and "count on your fingers" — '8-9' bracket limits are being applied
- `validateContent` never rejects any hint for grade 9+ students — undefined word limits = permissive fallback
- TypeScript shows no error when a grade-11 student's `ageBracket` is computed as `'8-9'`

**Phase to address:** Phase 80 (AgeBracket expansion) or Phase 81 (whichever phase first sends tutor requests for high school students)

---

### Pitfall 8: Socratic Hints for Algebra Are Harder to Write Without Implying the Answer

**What goes wrong:**
For arithmetic, the Socratic constraint is clear: "don't say 7, say count up from 5." For algebra, ANY procedural hint implies the answer if the student knows how to follow the procedure. "Think about what operation isolates x" → student does the operation → gets the answer. The existing safety pipeline checks if the LLM response contains the numeric answer digit, but for `x = -3`, a hint like "what happens when you subtract 6 from both sides?" does NOT contain `-3` but directly reveals the solving step. The `checkAnswerLeak` regex for `-3` would not fire.

The existing Socratic prompting strategy in `buildSystemInstruction` is calibrated for K-8 arithmetic ("what is the missing piece?", "count the groups"). These phrasings are meaningless for algebra where the concept is equality preservation, not counting.

**Why it happens:**
The tutor's `promptTemplates.ts` builds system instructions referencing `operation` (the `MathDomain` value). For arithmetic domains, the CPA progression (Concrete → Pictorial → Abstract) maps naturally: concrete = manipulatives, pictorial = diagrams, abstract = symbols. For algebra, "concrete" has no natural manipulative analog in the existing 6-manipulative set (counters, ten frames, number line, base-ten blocks, fraction strips, bar models).

**How to avoid:**
- Add algebra-specific hint phrasings to `buildSystemInstruction` keyed on the new algebra `MathDomain` values. For `linear_equations`, the hint strategy should be: "Does the equation look balanced? What operation could you apply to both sides to move terms?". This is Socratic but algebra-aware.
- Extend `checkAnswerLeak` with an algebra-aware procedure leak check: any hint that contains "subtract [operand]", "divide by [operand]", "add [operand]" where [operand] is a coefficient in the problem should be flagged as potentially revealing the solving step.
- For the CPA stage of algebra: "concrete" should map to a balance-scale mental model prompt (not a manipulative), "pictorial" maps to a worked example with boxes/blanks, "abstract" maps to equation notation. Update `cpaMappingService` to not assign a physical manipulative to algebra domains.
- The BOOST mode for algebra domains must show the full solution method, not just the answer number. This requires `BoostPromptParams.correctAnswer` to be supplemented with `solvingSteps?: string[]` for algebra.

**Warning signs:**
- Hints for linear equations include solving steps that trivially give away the answer
- CPA stage for a linear equation problem is "concrete" but there is no manipulative to show
- The hint ladder for a quadratic has 4 hints all at the same level of abstraction

**Phase to address:** Phase 82 (linear equations domain — first algebra domain) establishes the pattern; Phase 80 lays the infrastructure (AgeBracket, operation-keyed hint phrasings)

---

### Pitfall 9: Multi-Select MC Changes the Answer Correctness Semantics Everywhere

**What goes wrong:**
The existing `MultipleChoicePresentation` returns `correctIndex: number` — one correct answer. Checking correctness is `selectedIndex === correctIndex`. Multi-select (for quadratic roots `{2, -5}`) requires `correctIndices: number[]` and the correctness check is "selected set equals correct set" (order-independent). This change touches:
- `sessionStateSlice.ts`: answer evaluation logic
- `useChatOrchestration.ts`: the `isCorrect` determination fed to Elo update and tutor trigger
- `checkAnswerLeak` in `safetyFilter.ts`: now needs to check both roots
- `answerNumericValue()`: returns only one value, but multi-select answer has two
- `misconceptionSlice.ts`: misconception detection compares `selectedDistractorBugId` against the bug library — for multi-select, a student might get one root right and one wrong

Additionally, partial credit is a UX trap. If the correct answer is `{2, -5}` and the student selects `{2}` only, marking that as "wrong" feels harsh. But marking it as "partially correct" requires a third answer state in the session flow, which currently only knows `correct/incorrect`.

**Why it happens:**
The entire answer evaluation, Elo update, BKT update, and misconception recording pipeline assumes binary correct/incorrect. Adding a "partial" state requires threading that through every downstream consumer.

**How to avoid:**
- Do not implement partial credit for v1.2. Multi-select is all-or-nothing: all roots selected = correct, anything else = incorrect. Communicate this to players via UX copy: "Select ALL roots."
- Create a new `MultiSelectPresentation` type alongside (not replacing) `MultipleChoicePresentation`. The session UI renders either depending on `formattedProblem.format === 'multi_select'`.
- `answerNumericValue()` for multi-select answer: return the product of roots (for Elo calculation uniqueness) or the sum — document the choice explicitly. The exact value matters less than consistency.
- The `Check Answer` button on multi-select should not be submit-on-tap like single MC. It needs an explicit "Check" button press after all selections are made.
- Ordering bias: always shuffle the multi-select options with the same seeded RNG as single MC. Never display options in magnitude order (students learn to pick the two extreme values).

**Warning signs:**
- Elo updates fire with `isCorrect = true` when only one of two roots was selected
- `misconceptionSlice` records wrong-answer bug tags for a multi-select problem where the "distractor" was one of the correct roots
- BKT `masteryProbability` increases for a student who only gets half the roots right

**Phase to address:** Phase 80 (multi-select answer type), Phase 87 (quadratic equations — first consumer of multi-select)

---

### Pitfall 10: Placement Test Staircase Cannot Reach Grade 9-12 Content

**What goes wrong:**
The staircase algorithm in `PlacementTestScreen.tsx` calls `generateForGrade(grade, usedSkillIds)`, which calls `getSkillsByGrade(grade as Grade)`. Until Phase 82-90 domain handlers are registered (phases that add grade 9-12 skills), `getSkillsByGrade(9)` returns `[]`, and `generateForGrade(9)` returns `null`. The staircase logic then cannot advance above grade 8, and `MAX_GRADE = 8` enforces this explicitly. The placement test update is listed as Phase 91 (the last phase), but the staircase needs grade 9-12 skills to be available to function. This creates a dependency: Phase 91 cannot be executed until all domain phases (82-90) are complete — but Phase 91 is already positioned last, so this is fine IF the skills are registered. The pitfall is that Phase 91 may be under-specified: "add new domains in staircase" could be interpreted as just changing `MAX_GRADE = 12`, when in fact it also requires:

1. Skills at grades 9, 10, 11, 12 actually registered in `skills.ts`
2. Templates for those skills registered in `templates.ts`
3. Domain handlers registered in `registry.ts`
4. The staircase's promotion thresholds reconsidered for grades 8→9 transition (current: "3 consecutive correct at or above child's grade" — for a grade 8 student tested at grade 9 content, this is correct, but for a grade 12 senior, starting at grade 10 and requiring 3 consecutive correct is reasonable)

The deeper gap: a student currently in grade 9 who already has the app installed gets `placementGrade: 8` (the old ceiling). When Phase 91 ships, they get re-tested via absence decay / re-assessment — but only if the absence threshold fires. If they use the app daily, they will never re-take placement and remain stuck at grade 8.

**How to avoid:**
- Phase 91 must include a store migration that resets `placementComplete: false` for any child whose `placementGrade === 8` AND who has mastered >80% of grade 8 skills (BKT mastery). This triggers automatic re-assessment via the existing `useAbsenceCheck` hook.
- Add a "retake placement" button in `ParentalControlsScreen` for parents of high schoolers who were assessed under the old ceiling.
- Verify that `getSkillsByGrade(9)` through `getSkillsByGrade(12)` return non-empty arrays in integration tests before Phase 91 ships.

**Warning signs:**
- `generateForGrade(9)` returns null in Phase 91 test run
- High school student's placement completes at grade 8 despite answering every question correctly
- No store migration in Phase 91 for the grade-8-ceiling users

**Phase to address:** Phase 91 (placement update), with prerequisite check in Phase 82 (verify skill registration pattern)

---

### Pitfall 11: Elo `baseElo` for High School Topics Must Be Calibrated Against the Existing 1-8 Scale, Not Invented Independently

**What goes wrong:**
The existing `baseElo` values for K-8 templates range from approximately 600 (early addition) to ~1200 (grade 8 geometry, exponents). High school developers will see this range and might set `baseElo: 1300` for a "hard" quadratic problem and `baseElo: 1100` for a "simple" linear equation. The problem is that the Elo sigmoid `expectedScore(studentElo, templateBaseElo)` means a student at Elo 1000 has a 50% chance of answering a `baseElo: 1000` problem correctly. If ALL high school templates have `baseElo: 1200+`, the app becomes extremely hard for a student transitioning from grade 8 at Elo 1000 — they will fail 85%+ of grade 9 problems, triggering the frustration guard (3 consecutive wrong → easier) repeatedly and making the session demoralizing.

The target is 85% success rate. A new grade 9 student arriving with Elo ~1000 (grade 8 completion) should start with problems at `baseElo: 950-1050` — only slightly above their current level.

**Why it happens:**
Developers assign `baseElo` based on subjective "this is hard" reasoning, not calibrated to what existing student Elos will be at the point of encountering the problem. The curriculum experts writing algebra domain handlers will naturally view quadratics as harder than linear equations, so they assign higher baseElo — but the relative ordering within high school is less important than the absolute calibration against the K-8 Elo ladder.

**How to avoid:**
- Anchor the `baseElo` calibration: a student who has mastered all 18 existing domains through grade 8 should have Elo approximately in the 1050-1150 range. A first-contact linear equations problem should have `baseElo: 1000-1050` (targeting ~55% success rate for that student — slightly challenging, not punishing).
- Linear equations entry: `baseElo: 1000-1050`. Quadratics: `baseElo: 1100-1150`. Logarithms (hardest): `baseElo: 1200-1250`.
- Within each domain, the easiest template (e.g. `x + 5 = 8`) should be `baseElo: 1000`; the hardest (e.g. `2x + 3 = 4x - 7`) should be `baseElo: 1100`.
- Create a calibration document per domain at the time of handler development. Do not rely on intuition alone.

**Warning signs:**
- New domain's easiest problems have `baseElo > 1200`
- Grade 9 students encounter frustration guard (3 consecutive wrong) on their first session
- Average session score drops below 70% for students transitioning from grade 8

**Phase to address:** Each domain phase (82-90) — must specify baseElo range per template in the phase spec before coding begins

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reuse `NumericAnswer` for algebra variable solutions (e.g. `x = -3` → `{type: 'numeric', value: -3}`) | No new answer types, no changes to distractor/safety pipeline | Loses semantic meaning that answer is a variable value, not a direct count | Acceptable permanently — it IS the right approach |
| Skip bug library patterns for Phase 82-90 and rely on Phase 3 random distractors | Ship domains faster, distractors still function | 100% of distractors become random; misconception detection impossible for algebra | MVP only — add bug patterns in a fast-follow phase |
| Hardcode YouTube video IDs per skill in a static map | Simple, no API rate limits, no network latency on lookup | Video IDs become stale when Khan Academy restructures; requires app update to fix broken videos | Acceptable if map is in a hot-patch-able file (not compiled into native binary) |
| Clamp `AgeBracket` to `'8-9'` for ages 10+ | No changes to safety/tutor pipeline in Phase 80 | High school students get elementary-register hints; insulting and ineffective | Never — fix AgeBracket before first algebra domain ships |
| All-or-nothing multi-select (no partial credit) | No new session state, simple correctness check | Students who get 1 of 2 roots correct feel unfairly penalized | Acceptable for v1.2; revisit in v1.3 |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `react-native-youtube-iframe` | Default `playerVars` allow related videos and YouTube branding | Pass `{ rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1, fs: 0 }` and set `webViewProps` to use `youtube-nocookie.com` |
| YouTube API / IFrame Player API | Fetch video metadata from YouTube Data API v3 at runtime | Store all curated video IDs statically in the app; never make YouTube API calls from children's sessions |
| `checkAnswerLeak` with negative answers | Regex `\b-3\b` does not match because `\b` requires word boundary before `-` | Check `\b3\b` AND preceding context, or strip sign and check absolute value separately |
| Store migration with `partialize` | Add new field to slice, assume it persists automatically | New top-level fields must be explicitly added to `appStore.ts` `partialize` function AND a migration must set the default |
| `getSkillsByGrade(9)` before skills registered | Returns `[]` silently — no error, no crash | Add guard in staircase: if `skills.length === 0`, do not advance to that grade; log warning |
| BKT `ageToBracket` with age 16 | Returns `undefined` if age-bracket mapping only covers 6-9 | Add `'14-18'` bracket with permissive but defined parameters before first high school student session |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| YouTube WebView instantiated inside session screen | Session screen takes 2-3 seconds to mount when player pre-loads | Lazy-mount the WebView only when "Watch video" is tapped; unmount on close | First user who taps the session screen after Phase 81 ships |
| Distractor generator `MAX_RANDOM_ITERATIONS = 50` insufficient for sparse integer spaces | Generates only 1-2 distractors for logarithm answers where valid integers are rare | Increase `MAX_RANDOM_ITERATIONS` for domains with sparse answer spaces, or add domain-specific fallback candidates | Any logarithm answer that is a small integer (e.g. `log₂(8) = 3`) |
| Multi-select MC option count scaling | Multi-select with 6 options for 2 correct answers creates 15 possible subsets — confusing | Cap multi-select option count at 4-5; never use the Elo-based `mcOptionCount(elo)` formula for multi-select | Any multi-select problem presented to a student with Elo ≥ 1100 |

---

## Security / Compliance Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| YouTube player shown without parental consent | COPPA violation — third-party video service accessed by under-13 without VPC | Gate behind existing `tutorConsentGranted` AND add a separate `youtubeConsentGranted` disclosure |
| LLM receives algebra problem context that trivially reveals the variable value | Answer leak via problem context, not response | Ensure `PromptParams.problemText` is scrubbed of intermediate steps before sending; only send the original problem statement |
| `checkAnswerLeak` passes for algebra hints that procedurally reveal the answer | Socratic constraint violated — student gets answer via procedure, not discovery | Add procedure-reveal detection: flag hints that include both the operation and the coefficient that isolates x |
| YouTube video ID allow-list stored server-side and fetched at runtime | Stale allow-list can serve invalid IDs; network failure exposes null video | Bundle the allow-list in the app; use OTA update (Expo Updates) for patches, not server fetch |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Multi-select "submit" auto-triggers on second tap | Student accidentally submits before selecting both roots | Require explicit "Check" button press; show selection count ("2 of 2 selected") |
| NumberPad with `-` key placed beside `0` | Students learning negative numbers accidentally enter `-` when reaching for `0` | Place `-` key in top-left or as a modifier toggle, not adjacent to `0` |
| YouTube video plays audio while parent is not nearby | Parent cannot monitor content; child hears content without context | Always start video muted; show prominent unmute button; respect system mute state via `useSoundSync` hook |
| Hint ladder exhausted → "Watch video" shown immediately | Jump from text hint to 10-minute video is jarring; students will tap "Watch video" to avoid solving | Position video as an optional enrichment ("Want to see how this works in a full lesson?"), not as a hint continuation |
| Placement test reaches grade 9 content for existing grade-8 user | Student suddenly encounters unfamiliar algebra with no explanation | Add a "Level Up" interstitial when placement reaches a new grade band (e.g. transitioning into high school content) |

---

## "Looks Done But Isn't" Checklist

- [ ] **Grade type expansion:** `Grade` type updated, `MAX_GRADE` updated in PlacementTestScreen, `ProfileCreationWizard` age-to-grade mapping updated, BKT brackets extended — verify ALL four, not just the type definition
- [ ] **AgeBracket expansion:** Type updated, `CONTENT_WORD_LIMITS` and `MAX_WORD_LENGTH` have entries for all new brackets, `buildSystemInstruction` generates age-appropriate register for `'14-18'` — verify `ageToBracket(16)` returns `'14-18'`, not `undefined`
- [ ] **Negative NumberPad:** `-` key added to UI — verify it also works in PLACEMENT TEST (not just practice sessions), that the answer evaluation `parseInt(input)` handles `-3` correctly, and that the input display shows the sign correctly
- [ ] **Multi-select MC:** `MultiSelectPresentation` type added, UI renders checkboxes — verify `isCorrect` requires ALL correct options selected, verify Elo and BKT updates use the binary correct/incorrect (not partial), verify distractor `bugId` tracking still works for single wrong options
- [ ] **YouTube integration:** Player loads and plays — verify `rel: 0` in playerVars (no related videos), verify parent consent gate fires before player renders, verify curated allow-list rejects unknown IDs, verify video does not auto-play on screen mount
- [ ] **Safety pipeline for algebra:** `checkAnswerLeak` updated for negative numbers — verify `checkAnswerLeak("subtract three", -3)` returns `safe: false` in unit tests
- [ ] **Store migration:** STORE_VERSION bumped — verify `migrations.ts` has a corresponding `if (version < N)` block with defaults for ALL new fields, verify `partialize` includes any new top-level fields
- [ ] **Placement test ceiling:** `MAX_GRADE` updated to 12 — verify `generateForGrade(9)` returns a non-null Problem (requires Phase 82 skills to be registered first)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| `answerNumericValue()` returns NaN for new answer type | MEDIUM | Hotfix the bridge function; Elo states for affected users will be anomalous but self-correcting over 20-30 sessions as the variable K-factor re-converges |
| YouTube player shows unfiltered related videos in production | HIGH | Disable YouTube feature via OTA feature flag; add `rel: 0` fix in next OTA release; file incident report per COPPA breach procedure |
| Store migration bug corrupts existing child data | HIGH | Revert STORE_VERSION to previous; provide a "Reset Placement Test" button in ParentalControlsScreen as emergency escape hatch; restore from cloud sync delta if backend records are intact |
| Placement test ceiling at grade 8 for existing users after Phase 91 | LOW | Add migration in Phase 91 that resets `placementComplete` for users at the ceiling grade; existing users re-take placement on next app open |
| AgeBracket returns undefined for high school students | MEDIUM | `CONTENT_WORD_LIMITS[undefined]` is undefined → `maxWordsPerSentence = undefined` → word count check skipped → content over-permissive (hints too long), not dangerous. Fix in next OTA. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Algebra answers treated as symbolic strings | Phase 80 — type system review | TypeScript exhaustive switch on `answerNumericValue`; unit test `answerNumericValue({type:'numeric',value:-3})` returns -3 |
| Adjacent ±1 distractor nonsensical for algebra | Phase 80 — `distractorStrategy` field on template | Distractor generator test: algebra template produces no `source: 'adjacent'` distractors with step=1 |
| `checkAnswerLeak` broken for negative answers | Phase 80 — before any algebra domain | Unit test: `checkAnswerLeak("subtract three", -3)` returns `safe: false` |
| `Grade` type needs checklist expansion | Phase 80 | `tsc --noEmit` passes; `getSkillsByGrade(9)` returns skills after Phase 82; `MAX_GRADE = 12` |
| Store migration skipped for new fields | Every phase adding slice fields | CI assertion: `STORE_VERSION` matches count of migration blocks in `migrations.ts` |
| YouTube COPPA compliance | Phase 81 | Manual test: video ends, no related videos shown; consent gate blocks video without parent PIN |
| AgeBracket missing high school brackets | Phase 80 | Unit test: `ageToBracket(16)` returns `'14-18'`; `buildSystemInstruction` output contains appropriate register |
| Socratic algebra hints reveal procedure | Phase 82 (first algebra domain) | Prompt test: 10 sample hints for linear equations, manually verify none reveal solving steps |
| Multi-select correctness semantics | Phase 80 (type) + Phase 87 (quadratics) | Session test: selecting one of two correct roots evaluated as `isCorrect: false` |
| Placement test staircase gap at grade 8→9 | Phase 91 | Integration test: `generateForGrade(9)` non-null; migration resets placement for grade-8-ceiling users |
| Elo `baseElo` miscalibration | Each domain phase 82-90 | Calibration check: grade 9 entry problem `baseElo ≤ 1060`; student at Elo 1000 has >45% expected success |

---

## Sources

- Codebase analysis: `src/services/mathEngine/types.ts` (Answer union, Grade type, answerNumericValue)
- Codebase analysis: `src/services/mathEngine/bugLibrary/distractorGenerator.ts` (three-phase distractor assembly, adjacent step logic)
- Codebase analysis: `src/services/tutor/safetyFilter.ts` (checkAnswerLeak regex patterns, validateContent word limits)
- Codebase analysis: `src/services/tutor/types.ts` (AgeBracket literal union, BoostPromptParams)
- Codebase analysis: `src/services/adaptive/eloCalculator.ts` (ELO_MIN/MAX, K-factor decay, expectedScore formula)
- Codebase analysis: `src/store/appStore.ts` (STORE_VERSION=21, partialize function, migration chain)
- Codebase analysis: `src/screens/PlacementTestScreen.tsx` (MAX_GRADE=8, staircase algorithm, generateForGrade)
- Codebase analysis: `src/store/slices/onboardingSlice.ts` (placementGrade: number | null)
- Codebase analysis: `src/store/slices/childProfileSlice.ts` (AgeRange type '6-7'|'7-8'|'8-9')
- Codebase analysis: `src/services/mathEngine/answerFormats/multipleChoice.ts` (correctIndex: number, single correct answer assumption)
- `.planning/PROJECT.md` (milestone context, STORE_VERSION history, architecture decisions)
- COPPA regulations (16 CFR Part 312) — YouTube embedding requires VPC before collecting data on known under-13 users
- YouTube IFrame Player API docs — `rel=0`, `modestbranding`, `youtube-nocookie.com` parameters (HIGH confidence from official docs)
- `react-native-youtube-iframe` library — WebView-based, supports `playerVars` passthrough (MEDIUM confidence — library behavior may vary by version)

---
*Pitfalls research for: v1.2 High School Math Expansion — K-12 grade type, algebra domains, multi-select MC, negative input, YouTube tutor integration*
*Researched: 2026-03-12*
