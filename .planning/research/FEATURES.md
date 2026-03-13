# Feature Research

**Domain:** K-12 math learning app — high school expansion (Algebra 1/2, Pre-Calc) + YouTube video hints
**Researched:** 2026-03-12
**Confidence:** MEDIUM (competitor UX mostly inferred from public behavior; pedagogy claims HIGH from research literature)

---

## Context: What Is Already Built

The following exist and are NOT re-researched here:

- 18 math domains, 151 skills, grades 1-8
- Single-select MC + numeric free-text (NumberPad)
- AI tutor (HINT/TEACH/BOOST) — Socratic, never reveals answers
- Staircase placement test (grades 1-8)
- Elo + BKT adaptive difficulty, spaced repetition, prerequisite DAG
- Bug Library misconception detection, remediation mini-sessions
- Full gamification stack (XP, badges, themes, avatars, daily challenges)

This research focuses exclusively on the **v1.2 additions**:
- 9 high school domains (Algebra 1/2 + Pre-Calc topics)
- Grade range expansion from 1-8 to 1-12
- NumberPad negative input (`-` key)
- Multi-select MC format (checkbox-style, for quadratic roots)
- YouTube video integration in AI tutor (post-hint-ladder)

---

## Five Domain Questions Answered

### Q1: Algebra Problem Presentation — Symbolic vs Word Problem Mix

**Finding (MEDIUM confidence):** Effective algebra instruction requires both, but the optimal mix shifts with grade level and topic type.

Research consensus (IES practice guide, PMC meta-analyses):
- **Grades 8-9 (Algebra 1 entry):** Start with contextual/word problems to anchor abstract ideas. Seeing "3x + 5 = 20" makes more sense after "three times a number plus 5 equals 20."
- **Grades 9-11 (Algebra 1-2):** Shift to approximately 60% symbolic, 40% contextual. Pure symbolic problems build procedural fluency; word problems build transfer and motivation.
- **Grades 10-12 (Pre-Calc):** Topics like logarithms and sequences lean heavily symbolic (~70-80%) because real-world context is harder to construct authentically.

App behavior of major competitors:
- **Khan Academy:** Mixes symbolic exercises with word problem exercises within the same topic unit. Video lessons often use real-world framing; exercises are primarily symbolic.
- **IXL:** Almost entirely symbolic for algebra (type answer into text boxes). Occasionally uses table/graph context. Word problems appear at the "Applied math" level, not the default skill drill level.
- **Photomath/Symbolab:** Pure symbolic — these are homework-solver tools, not practice platforms.

**Recommendation for Tiny Tallies:** Follow the existing word problem system architecture. Apply the `prefix` mode for linear equations, quadratics at the entry level; use pure symbolic for the advanced sub-skills (completing the square, log rules). The existing `maxGrade` reading-level calibration already handles appropriate complexity of prose.

**Specific notes per new domain:**
- Linear equations: Both modes — "solve 3x - 7 = 14" AND "a bike costs $7 more than three times a helmet; total is $97"
- Systems of equations: Mostly symbolic 2×2 grids; word problems valuable for motivation ("two trains leave...")
- Quadratics: Symbolic for factoring/formula; word problems for projectile motion (parabola arc, area problems)
- Exponential / logarithms: Primarily symbolic — authentic word problems require compound interest or decay rates that introduce reading-level complexity beyond the math

---

### Q2: Multi-Part Answers — Quadratic Roots UX

**Finding (HIGH confidence from first-principles analysis, MEDIUM from competitor research):**

Quadratic equations solved by factoring or the quadratic formula typically yield two roots, e.g., x = 3 and x = -2. This is the primary multi-answer scenario in the 9 new domains. Other multi-answer cases are rare within the planned scope.

**How major apps handle it:**

| Approach | Example Apps | How It Works |
|----------|-------------|--------------|
| Two free-text boxes | IXL, Desmos Activity Builder | "x = [ ] or x = [ ]" with two NumberPad inputs |
| Multi-select MC | Some textbook platforms | Checkbox list of four options, select both correct roots |
| Ordered free text | Khan Academy | Single answer expected, often asks "list smaller root first" |
| Single root drill | Drill-style apps | Asks for "one root" per problem, avoids two-answer UX entirely |

**IXL approach (verified via public behavior):** IXL's quadratic practice presents "x = ___ or x = ___" with two separate text entry boxes. Students must enter both roots in order (typically smaller first). This avoids "select all that apply" UI complexity but requires two validation passes.

**Planned approach (multi-select MC checkbox):** The planned multi-select MC format is a sound differentiator versus IXL's free-text two-box approach. Checkboxes reduce keyboard fatigue for mobile users and let the app construct meaningful distractors from the Bug Library (e.g., sign flip error, missing one root).

**Design imperatives for multi-select MC:**
- Make it unambiguous that multiple selections are valid — label says "Select all correct answers"
- Show a distinct "Check" button (not auto-submit on selection) — this is the correct pattern for multi-select
- Require at least 1 selection before enabling "Check"
- Confirm-on-submit visual: selected items glow, correct items turn green, incorrect items turn red
- For quadratics: always offer exactly 4 options (both correct roots + 2 distractors) — distractors drawn from common errors: sign flip, forgot ±, computed wrong discriminant

**When NOT to use multi-select MC:** Use single-select or free-text for problems with unique answers (one root from a perfect square, evaluate polynomial at a point, exponential growth rate). Multi-select only when the problem genuinely has multiple correct discrete answers.

---

### Q3: Negative Number Input UX

**Finding (HIGH confidence — direct constraint from iOS platform):**

iOS numeric keyboards do not include a negative/minus key in the standard `numeric` or `decimal` input modes. This is a documented platform limitation with no system-level workaround.

**Approaches used by apps:**

| Approach | UX Quality | Complexity |
|----------|-----------|------------|
| Custom NumberPad with `-` toggle key | Best — taps natively, no context switch | LOW (existing NumberPad already built) |
| `+/-` button that toggles sign of entered number | Good — familiar from calculator UX | LOW |
| Text field with system keyboard | Acceptable on Android, broken on iOS (no `-` key) | PROBLEMATIC |
| Up/down stepper | Good for small integers, bad for large values | MEDIUM |

**Recommendation:** Add a `-` toggle key to the existing custom NumberPad. The key should toggle the sign of the current entered number (like a calculator `+/-` key), NOT prefix a new digit. This is familiar to older students who have used calculators.

**Placement in NumberPad:** Bottom-left position (where `0` has expanded space currently) or dedicated left-column position. The key must visually distinguish itself from digit keys — use a different background color or the `±` symbol label.

**Edge case considerations:**
- What is `−0`? Normalize to `0`.
- Student types `−` then digits: display as `−3` not `3−`
- Maximum digit length should still apply to the absolute value portion
- For coordinate pairs like `(x, y)`: may need two separate NumberPad states (x negative, y negative independently) — this is a future concern for coordinate geometry sub-skills

---

### Q4: Video Hints Within Learning Flow

**Finding (MEDIUM confidence — pattern observed from competitor UX, not official docs):**

**How Khan Academy integrates video hints:**
Khan Academy is the canonical reference for "video + exercise" integration in math learning. Their pattern:
1. Primary path: Exercise → Hint (text/worked example)
2. Secondary path: "Watch a video" link always present in hint panel
3. Video plays inline (or in a separate tab), then returns to exercise
4. Video is a pre-recorded lesson, not specific to the student's exact current problem

**Key observation:** Khan Academy shows the "Watch a video" link BEFORE the student struggles, as a peer option alongside hints. Tiny Tallies' planned approach (offer video AFTER hint ladder exhausted) is more targeted and pedagogically defensible — it avoids video becoming a shortcut to avoid thinking.

**Placement pattern recommendation:**
```
Hint ladder flow:
  HINT (Socratic prompt)
    → wrong again → TEACH (CPA explanation)
      → wrong again → BOOST (scaffolded walkthrough)
        → still stuck → "Watch a video?" button appears [NEW]
          → YouTube player opens (inline or modal)
          → Video plays Khan Academy or similar curated content
          → User votes: Helpful / Not helpful
          → Returns to problem with attempt counter reset
```

**Video player UX patterns from EdTech:**
- Inline players (not full-screen redirect) preserve learning context
- Auto-pause when leaving app (iOS/Android lifecycle)
- No autoplay of next video — intentional single-video consumption
- Close/dismiss button always visible (not hidden behind fullscreen controls)
- Vote prompt shown after video ends, not during

**react-native-youtube-iframe status:**
- Version 2.4.1, released July 1, 2025 (relatively recent)
- 63 open GitHub issues; primary known issue is iframe timeout due to GitHub Pages dependency (solved via `useLocalHTML={true}` prop)
- New Architecture compatibility not explicitly documented — moderate risk
- `useLocalHTML={true}` is the recommended configuration to avoid the GitHub Pages timeout issue
- LOW confidence on full New Architecture stability; recommend testing early in Phase 81

**Alternative if react-native-youtube-iframe proves incompatible:**
- `expo-video` with YouTube URL deep-link (opens YouTube app) — worst UX but zero library risk
- WebView embedding YouTube embed URL directly — lower-level but controllable
- `react-native-bridges/react-native-youtube-bridge` — newer alternative (less community testing)

**Vote system design:**
- Thumbs up / Thumbs down after video ends
- Store votes per `(videoId, skillId)` pair in local store
- Use votes to surface most helpful videos per skill in future (ML potential, but local heuristic sufficient for v1.2)
- Do NOT use votes for COPPA-sensitive cloud collection of child behavior

---

### Q5: Difficulty Progression — Algebra 1 → Algebra 2 → Pre-Calc

**Finding (HIGH confidence — based on Common Core CCSS standards, IES guidance, and curriculum analysis):**

The standard US high school math sequence:
```
Algebra 1 (grades 8-10) → Geometry (grades 9-10) → Algebra 2 (grades 10-12) → Pre-Calculus (grades 11-12)
```

Tiny Tallies' 9 new domains span this range. Prerequisite relationships that must be encoded in the prerequisite DAG:

```
Linear equations (G8-9, Algebra 1)
    └──prereq──> Systems of equations (G9-10, Algebra 1-2)
    └──prereq──> Coordinate geometry (G8-10, Algebra 1-2)

Coordinate geometry (G8-10)
    └──enables──> Quadratic equations (G9-10, Algebra 1-2)

Quadratic equations (G9-10)
    └──prereq──> Polynomial operations (G9-10, Algebra 1-2)

Polynomial operations (G9-10)
    └──prereq──> Exponential functions (G9-11, Algebra 2)

Exponential functions (G9-11)
    └──prereq──> Logarithms (G10-11, Algebra 2)

Sequences & series (G9-11)
    └──parallel──> Exponential functions (geometric sequences share base)

Statistics extensions (G9-11)
    └──prereq from K-8──> data_analysis domain (already built)
```

**Intra-domain difficulty laddering:**
Each new domain should follow the existing skill progression model:
- Entry skills: concrete (numeric values, simple integers)
- Intermediate skills: abstract (variables, signed numbers)
- Advanced skills: combined (multi-step, real-valued coefficients)

Example for linear equations:
1. One-step equations (add/subtract): `x + 5 = 12`
2. One-step equations (multiply/divide): `3x = 15`
3. Two-step equations: `2x + 3 = 11`
4. Variables on both sides: `3x + 2 = x + 8`
5. Distribution: `2(x + 3) = 14`
6. Fractional coefficients: `x/3 + 2 = 5`
7. Inequalities (linear): `2x - 1 > 5`
8. Absolute value basics: `|x| = 4`

Example for quadratic equations:
1. Factor when a=1, positive roots: `x² - 5x + 6 = 0`
2. Factor when a=1, negative roots: `x² + x - 6 = 0`
3. Factor perfect squares: `x² - 9 = 0`
4. Factor when a≠1: `2x² - 7x + 3 = 0`
5. Quadratic formula (integer solutions): discriminant is perfect square
6. Quadratic formula (non-integer): discriminant gives irrational roots

**Progression from K-8 anchor points:**
- Integers domain (already built) → Linear equations (new) via one-variable thinking
- Expressions domain (already built) → Polynomial operations (new) via algebraic manipulation
- Exponents domain (already built) → Exponential functions (new) via extending power rules
- Data analysis domain (already built) → Statistics extensions (new) via extending central tendency to spread

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that a K-12 math app must have when expanding to high school. Missing these makes the product feel underpowered for the high school audience.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Negative number input on NumberPad | High school math pervasively involves negative numbers (integers, linear equations, quadratics). Without it, free-text answers for half the new domains are impossible. | LOW | Existing NumberPad + one new `±` toggle key. Sign stored in answer state. Normalize −0 to 0. |
| Multi-answer format for quadratics | Quadratic equations have two roots. Asking only for one root feels wrong to a student who knows both. Major platforms (IXL) support dual-answer entry. | MEDIUM | Multi-select MC checkbox-style with "Check" button. 4 options (2 correct roots + 2 distractors). Label "Select all correct answers." |
| Correct answer progression logic for new domains | New domains must feed the existing Elo + BKT + Leitner engine. Without this, high school skills don't get spaced repetition. | LOW | Register all new domain handlers in domain registry. Implement `DomainHandler` interface per domain. No new engine work needed. |
| Prerequisite graph connectivity | High school skills must connect to the existing K-8 prerequisite DAG. Without edges, the placement test and skill map show disconnected floating nodes. | MEDIUM | Add DAG edges from existing anchor domains (integers → linear equations, expressions → polynomials, exponents → exponential, data_analysis → stats extensions). |
| Grade 9-12 Elo seeding | Placement test needs to seed starting Elo for grade 9-12 students correctly. Without calibrated initial values, students start at wrong difficulty. | LOW | Extend `eloToLevel` mapping and `gradeToElo` initial seeding function to cover grades 9-12. |
| Updated placement test staircase (grades 9-12) | Current staircase tops out at grade 8. A grade 10 student placed in the app would not reach high school content. | LOW | Extend staircase algorithm upper bound from grade 8 to grade 12. Add new domain problems to the question bank for grades 9-12 staircase. |
| Skill map with high school nodes | The existing visual DAG skill map must show new nodes. Students expect to see where high school skills fit relative to what they've mastered. | MEDIUM | Layout engine must accommodate ~9 new domain clusters. May need scroll or zoom for the extended map. |
| Word problems in high school domains | Even algebraically sophisticated students need application problems to understand what they're actually computing. Pure-symbolic practice without context is demotivating. | MEDIUM | Apply existing word problem prefix mode to linear equations, systems, quadratics, exponential (growth/decay). Log and stats keep minimal prose. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| YouTube video hint (post-exhaustion) | When hint ladder is fully used and student is still stuck, showing a curated instructional video is a safety net with real value. Khan Academy shows videos from the start as an alternative; Tiny Tallies shows them as a last resort — more Socratic, less shortcut-enabling. | MEDIUM | react-native-youtube-iframe with `useLocalHTML={true}`. Khan Academy video IDs curated per skill (static map). Vote system (helpful/not helpful) stored locally per skill. Requires COPPA review — no video data sent to server. |
| Misconception-aware Bug Library for algebra | The K-8 Bug Library with 70+ patterns is a genuine differentiator. Extending it to cover high school algebra misconceptions (sign errors in quadratics, exponent rule confusion, log domain violations) gives unique diagnostic value not found in IXL or Khan Academy's hint systems. | HIGH | Each new domain needs 4-8 bug patterns. Algebra bugs are well-documented in research literature (Lamar University Common Math Errors, ERIC studies). High ROI: wrong answers become diagnostic. |
| CPA progression for algebra (pictorial phase) | Most algebra apps go straight to abstract symbols. Bar model diagrams for linear equations (visual balance model) and number lines for inequalities are CPA-consistent. | HIGH | Extends existing CPA system to new domains. Requires new PictorialDiagram SVG renderers for each domain. Bar balance for linear equations, number line for inequalities, parabola sketch for quadratics. This is ambitious — defer to post-v1.2 for most domains. |
| Seamless grade-band transition (K-12) | Very few apps span K-12 without feeling like two different products. Tiny Tallies' unified BKT/Elo/Leitner engine means a student who mastered fractions in grade 4 has the same adaptive experience in linear equations in grade 9. Competitors typically silo by grade band (Khan Academy Kids vs Khan Academy proper). | LOW (engineering) HIGH (positioning) | No new engineering required — existing engine handles it. Marketing and onboarding must communicate continuity. Placement test update handles grade-band bridging. |
| Inline video with vote feedback (no redirect) | Most apps redirect to YouTube or open a browser. Keeping video inline preserves learning context and reduces drop-off. | LOW | react-native-youtube-iframe handles this. Key: "back to problem" button always visible during video. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Graphing calculator built-in | Every high school student uses Desmos. Seems like a natural addition for coordinate geometry, quadratics, exponential functions. | ENORMOUS scope. Building a functional, trustworthy graphing calculator is a product in itself. Desmos took years. A bad one damages trust. Also: state testing policies prohibit CAS calculators. Students who rely on a built-in grapher won't develop understanding. | Teach the CONCEPTS behind graphs via CPA pictorial mode (static SVG parabola sketches, labeled number lines). Students do not need to graph interactively to understand slope or vertex. Defer graphing to a future version if demand is validated. |
| Free-text algebraic expression input | "Type x^2 - 5x + 6" as an answer. Seems necessary for some algebra problems. | Parsing algebraic expressions from keyboard input is a non-trivial NLP + math parsing problem. Students on mobile have no `^` key, no parentheses muscle memory. Error rate and frustration would be very high. Not what the existing NumberPad was designed for. | Design problems to avoid needing expression input. Use MC for "identify the factored form." Use NumberPad for coefficient-only answers. For multi-step, break the problem into sub-problems each with a numeric answer. |
| Calculus domain | Pre-calculus is in scope. Calculus is the logical "next step." | The planned scope is 9 new domains; calculus (limits, derivatives, integrals) would add at minimum 8-10 more domains of equivalent complexity. Calculus also requires graphical output that the app cannot yet produce. Scope creep would delay v1.2 launch by months. | Flag as a v1.3+ milestone candidate once high school adoption is validated. Limits (informal) can be the final skill in the exponential/logarithms domain as a teaser. |
| Complex/imaginary number answers | Some quadratic equations produce complex roots (discriminant < 0). Students will encounter these in Algebra 2. | NumberPad extension for `i` (imaginary unit) is a significant UX problem. Displaying complex answers requires special rendering. Complex numbers are also out of scope of the 9 planned domains. | When discriminant < 0, generate a different problem or note "this equation has no real solutions" and give a fact-acknowledgment question. Do not introduce complex numbers in v1.2. |
| Trigonometry | Appears in Pre-Calc and is adjacent to coordinate geometry and sequences. | Sin, cos, tan require unit circle visualization, radian/degree input, and calculator-level precision. This is a domain of comparable size to all 9 planned domains combined. | Flag as a v1.3+ milestone. Coordinate geometry (slope, distance, midpoint) provides a sufficient Pre-Calc foundation for v1.2. |
| Step-by-step worked solution reveal | Students want to see the full solution path after getting a problem wrong. Competitors like Photomath do this. | The entire tutor architecture is designed around Socratic learning — NEVER revealing the answer. A "show solution" button bypasses the HINT/TEACH/BOOST ladder and defeats the pedagogical model. Also: once the answer is seen, BKT should not credit the subsequent "correct" attempt. | The BOOST mode already provides deep scaffolding that walks through the reasoning without explicitly giving the final answer. The YouTube video fills the remaining gap. Do NOT add a "show solution" button. |
| Social leaderboard by grade | High school students are more competitive than elementary students. A leaderboard by grade sounds engaging. | COPPA compliance. Any ranking that reveals one child's data to another is prohibited. Also, rankings cause math anxiety and harm motivation for lower-performing students (well-documented in math anxiety research). | Keep daily challenges with XP/badges as the competitive outlet. XP is personal, not comparative. Daily challenge completion badges provide social proof without head-to-head ranking. |

---

## Feature Dependencies

```
Grade range expansion (1-8 → 1-12)
    └──requires──> Placement test staircase updated to grade 12
    └──requires──> eloToLevel + gradeToElo extended to grade 12
    └──enables──> All 9 new domain handlers to register correctly

NumberPad negative input (± key)
    └──requires──> Existing NumberPad refactor (add ± key + sign state)
    └──enables──> Linear equations (negative coefficients)
    └──enables──> Systems of equations (negative solutions)
    └──enables──> Quadratic roots (negative roots)
    └──enables──> Statistics extensions (negative z-scores, deviations)

Multi-select MC (checkbox + Check button)
    └──requires──> New answer format type in Answer discriminated union
    └──requires──> New UI component: CheckboxMC + CheckButton
    └──enables──> Quadratic equations (two roots)
    └──enables──> Polynomial operations (multiple correct factorings)
    └──independent──> All other new domains (use existing MC or free-text)

Domain handlers (all 9 new)
    └──requires──> DomainHandler interface (already exists)
    └──requires──> NumberPad negative input (for domains using signed answers)
    └──requires──> Multi-select MC (for quadratic domain)
    └──enables──> Prerequisite DAG edges (can't add edges to non-existent domains)
    └──enables──> Placement test questions for new domains

Prerequisite DAG edges (K-8 → HS)
    └──requires──> All 9 new domain handlers registered
    └──enables──> Skill map new nodes visible and connected
    └──enables──> Session orchestrator to surface HS skills appropriately

YouTube video integration
    └──requires──> react-native-youtube-iframe installed + tested
    └──requires──> Khan Academy video ID map per skill (static JSON)
    └──requires──> Tutor state machine: new EXHAUSTED state after BOOST
    └──independent──> Domain handlers (can ship before or after)
    └──independent──> Multi-select MC
```

### Dependency Notes

- **NumberPad negative input is a prerequisite for most new domains.** Signed-number answers appear throughout algebra. Phase 80 (foundation) correctly places this first.
- **Multi-select MC is only required by quadratic equations domain.** It can be built in Phase 80 as a foundation piece or deferred to Phase 87. Building it in Phase 80 is cleaner since it touches the Answer union type.
- **YouTube integration is fully independent of the 9 new domains.** Phase 81 can proceed in any order relative to domain phases.
- **Prerequisite DAG edges should be added after all 9 domain handlers exist.** Adding partial edges introduces misleading skill map connections. Phase 91 (integration) is the right time.
- **Grade range expansion (1-12) must land before any HS domain can appear in the placement test.** Phase 80 correctly addresses this.

---

## MVP Definition

### Launch With (v1.2 — Phases 80-91)

Phase 80 (foundation) unlocks everything:
- [ ] Grade range 1-12 throughout (placement, onboarding, skill map labels)
- [ ] NumberPad `±` key — required for all new domains with signed answers
- [ ] Multi-select MC format — required for quadratic domain specifically

Phase 81 (YouTube):
- [ ] YouTube video integration in tutor, post-BOOST state
- [ ] Khan Academy video map for at least the first 3 new domains
- [ ] Helpful/not helpful vote stored locally

Phases 82-90 (9 domain handlers, one per phase):
- [ ] Each domain: problem generator, bug patterns, word problem templates, BKT skill registration
- [ ] Dependencies respected: linear equations first, logarithms last

Phase 91 (integration):
- [ ] Full prerequisite DAG with K-8 → HS edges
- [ ] Placement test staircase extended to grade 12 with HS questions
- [ ] Skill map updated to show HS domain nodes

### Add After Validation (v1.3+)

- [ ] CPA pictorial mode for algebra domains (bar balance model for linear equations, parabola sketch for quadratics) — high value, high complexity
- [ ] Calculus domain (limits, derivatives) — only if high school adoption is validated
- [ ] Trigonometry domain — large scope, validate demand first
- [ ] Richer bug library coverage (> 8 patterns per HS domain) — iterate on real usage data

### Future Consideration (v2+)

- [ ] Graphing calculator integration (or Desmos deep-link) — validate whether students actually want this vs just need concept understanding
- [ ] Teacher/classroom mode — separate product track, COPPA + FERPA complexity
- [ ] Competition/SAT prep mode — distinct content pipeline, validate market

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| NumberPad `±` key | HIGH — without it, ~70% of HS answers can't be entered | LOW — existing NumberPad, add one key + sign state | P1 |
| Grade range 1-12 (type + placement) | HIGH — foundational repositioning | LOW — extend existing gradeToElo mapping, update strings | P1 |
| Linear equations domain | HIGH — foundational Algebra 1 skill, highest demand | MEDIUM — 8 skills, 6 bug patterns, word problems | P1 |
| Multi-select MC format | HIGH — quadratics without it are pedagogically wrong | MEDIUM — new Answer type, new UI component | P1 |
| YouTube video integration | HIGH — critical UX upgrade for stuck students | MEDIUM — library integration + curated video map | P1 |
| Systems of equations domain | HIGH — standard Algebra 1 content | MEDIUM — 5 skills, 2×2 substitution/elimination | P1 |
| Quadratic equations domain | HIGH — most-searched algebra topic | MEDIUM — 6 skills, uses multi-select MC | P1 |
| Coordinate geometry domain | MEDIUM — connects geometry to algebra | MEDIUM — 6 skills, slope/distance/midpoint | P2 |
| Polynomial operations domain | MEDIUM — enables quadratic factoring context | MEDIUM — 6 skills, FOIL as primary | P2 |
| Exponential functions domain | MEDIUM — Algebra 2 core topic | MEDIUM — 5 skills, growth/decay | P2 |
| Sequences & series domain | MEDIUM — covers patterns at HS level | LOW-MEDIUM — 5 skills, builds on K-8 patterns | P2 |
| Statistics extensions domain | MEDIUM — connects to built data_analysis | MEDIUM — 4-5 skills, std dev + normal dist | P2 |
| Logarithms domain | MEDIUM — inverse of exponential | LOW-MEDIUM — 4 skills, special values + log rules | P2 |
| Prerequisite DAG integration (Phase 91) | HIGH — makes skill map coherent | MEDIUM — adding edges, testing placement | P1 (after all domains) |
| CPA pictorial for algebra | HIGH — differentiator, but complex | HIGH — new SVG renderers per domain | P3 (v1.3) |
| Graphing calculator | LOW — Desmos exists, students have it | VERY HIGH — full product scope | P3 (v2+) |
| Trigonometry domain | MEDIUM — natural follow-on | HIGH — large scope, unit circle, radians | P3 (v1.3) |

---

## Competitor Feature Analysis

| Feature | Khan Academy | IXL | Photomath/Symbolab | Tiny Tallies (v1.2) |
|---------|--------------|-----|--------------------|----------------------|
| HS algebra content (grades 9-12) | Yes — full curriculum | Yes — standards-aligned | Yes — solver tool | Yes — 9 new domains |
| Negative number input | System keyboard (freetext) | System keyboard (freetext) | Photo or system keyboard | Custom NumberPad with ± key |
| Quadratic two-root answer entry | Single text box (one answer at a time) or separate graded steps | "x = ___ or x = ___" two text boxes | Shows solution, not a practice tool | Multi-select MC (4 options, checkbox) |
| Video hints during practice | Always-available video link | No inline video | Step-by-step animation | Video only after BOOST exhausted — more Socratic |
| Video integration style | First-class alongside text hints | Not available | Built-in animated steps | Inline YouTube player, vote prompt |
| Adaptive difficulty | Yes — mastery-based progression | Yes — adaptive question selection | No (homework tool) | Yes — Elo + BKT (existing) |
| Bug/misconception detection | No explicit misconception model | Shows "SmartScore" | No | Bug Library: 4-8 patterns per domain |
| Graphing calculator | Linked to Desmos | Not built-in | Yes (photo input) | Not in scope |
| Placement/diagnostic test | Yes (Khan Diagnostic) | Yes (grade-level diagnostic) | No | Staircase algorithm extended to grade 12 |

---

## Sources

- [IES Practice Guide: Teaching Strategies for Improving Algebra Knowledge](https://ies.ed.gov/ncee/wwc/docs/practiceguide/wwc_algebra_040715.pdf) — symbolic vs contextual mix, word problem pedagogy
- [PMC: Does Calculation or Word-Problem Instruction Provide a Stronger Route to Pre-Algebraic Knowledge?](https://pmc.ncbi.nlm.nih.gov/articles/PMC4274629/) — contextual before symbolic for conceptual understanding
- [Common Core High School Algebra Standards (HSA)](https://www.thecorestandards.org/Math/Content/HSA/) — domain structure and skill progression
- [Common Core High School Functions Standards (HSF)](https://www.thecorestandards.org/Math/Content/HSF/) — exponential, logarithmic, sequence functions
- [Lamar University: Common Math Errors](https://tutorial.math.lamar.edu/extras/commonerrors/algebraerrors.aspx) — algebra misconceptions research base for Bug Library
- [ERIC: Common Errors in Algebraic Expressions](https://files.eric.ed.gov/fulltext/EJ1264037.pdf) — distractor and bug pattern source
- [Nature: Math Anxiety and Word Problem Performance](https://www.nature.com/articles/s41598-025-16997-0) — word problems and anxiety interaction
- [react-native-youtube-iframe GitHub](https://github.com/LonelyCpp/react-native-youtube-iframe) — v2.4.1, `useLocalHTML` workaround for iframe timeout
- [Expo SDK 54 New Architecture](https://docs.expo.dev/guides/new-architecture/) — New Architecture default, compatibility warnings
- [Khan Academy: Hint Option behavior](https://support.khanacpp.org/hc/en-us/community/posts/360054875972) — video-first hint placement pattern
- [IXL: Solve quadratic by factoring](https://www.ixl.com/math/algebra-1/solve-a-quadratic-equation-by-factoring) — competitor answer format reference
- [CSS-Tricks: Negative numbers on iOS keyboard](https://forum.bubble.io/t/negative-numbers-on-ios-keyboard/107662) — iOS platform constraint confirmation
- [Common Core HS Math Sequence](https://ospi.k12.wa.us/sites/default/files/2022-12/mathstandards_highschool.pdf) — Algebra 1 → Algebra 2 → Pre-Calc progression
- Existing project context: `.planning/PROJECT.md`, `src/services/tutor/`, `src/store/slices/tutorSlice.ts`

---

*Feature research for: v1.2 High School Math Expansion + YouTube Video Hints*
*Researched: 2026-03-12*
