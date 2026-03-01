# Onboarding & Diagnostic Placement Testing

**Research Date:** 2026-03-01
**Focus:** First-time user experience, adaptive diagnostic placement, cold start calibration

---

## Table of Contents

1. [First-Time Onboarding Flow](#1-first-time-onboarding-flow)
2. [Diagnostic Placement Testing](#2-diagnostic-placement-testing)
3. [Cold Start Problem](#3-cold-start-problem)
4. [Placement Mapping](#4-placement-mapping)
5. [Re-assessment](#5-re-assessment)
6. [UX Considerations](#6-ux-considerations)
7. [Data Models](#7-data-models)
8. [References](#8-references)

---

## 1. First-Time Onboarding Flow

### 1.1 Design Principles

The onboarding flow serves two users with conflicting needs: the **parent** wants assurance the app is safe, age-appropriate, and educationally sound; the **child** wants to play immediately. Research on children's app engagement shows that onboarding abandonment rates spike sharply after 60 seconds for ages 6-9 (Fails et al., 2012; Hourcade, 2015). The flow must therefore split into a parent setup phase (which can tolerate more friction) and a child-facing phase (which cannot).

**Core principles:**

- **Parent screens first, child screens second.** The parent configures the account before handing the device to the child. This prevents children from encountering consent forms or settings screens.
- **Collect only what is needed for placement.** Every additional field increases abandonment. Age and grade are essential. Prior experience is valuable but optional.
- **Default aggressively.** If a parent skips optional fields, use age-based defaults rather than blocking progress.
- **Time budget: 90 seconds for parent setup, 3-5 minutes for child diagnostic.** Total onboarding under 7 minutes including the diagnostic.

### 1.2 Information to Collect

#### Required (Parent Screen)

| Field | Purpose | Format |
|-------|---------|--------|
| Child's first name | Personalization, character dialog | Free text, max 20 chars |
| Age | Prior initialization, content filtering | Selector: 5, 6, 7, 8, 9, 10 |
| Grade | Curriculum alignment, starting point | Selector: K, 1, 2, 3, 4 |

#### Optional (Parent Screen)

| Field | Purpose | Default if Skipped |
|-------|---------|-------------------|
| Prior math app experience | Adjusts diagnostic starting difficulty | "None" |
| Areas of difficulty | Seeds BKT priors for specific skills | Even priors across all skills |
| Learning goals | Personalizes encouragement messaging | General encouragement |

#### Child Screen (During Diagnostic)

| Field | Purpose | Format |
|-------|---------|--------|
| Avatar/character choice | Engagement, ownership | Pick from 4-6 options |
| Favorite color | Theme personalization | Tap a color |

### 1.3 Flow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                    PARENT SCREENS                            │
│                                                              │
│  1. Welcome + Value Prop (5s)                                │
│     "Tiny Tallies adapts to your child's level"              │
│                                                              │
│  2. Child Profile (15s)                                      │
│     Name, Age, Grade [REQUIRED]                              │
│     Prior experience [OPTIONAL, expandable]                  │
│                                                              │
│  3. Parental Controls Setup (15s)                            │
│     PIN creation (4-digit)                                   │
│     Session time limits                                      │
│                                                              │
│  4. Hand-off Screen (5s)                                     │
│     "Give the device to [Name]!"                             │
│     Large friendly illustration                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    CHILD SCREENS                             │
│                                                              │
│  5. Character Selection (15s)                                │
│     "Pick your math buddy!"                                  │
│     4-6 animated characters                                  │
│                                                              │
│  6. Character Introduction (10s)                             │
│     Character speaks: "Hi [Name]! I'm [Character]!          │
│     Let's play some math games together!"                    │
│                                                              │
│  7. Diagnostic Placement (3-5 min)                           │
│     Framed as "adventure" or "treasure hunt"                 │
│     10-20 adaptive questions                                 │
│     See Section 2 for details                                │
│                                                              │
│  8. Results Celebration (15s)                                │
│     "You're a [Level] Mathematician!"                        │
│     Unlock first area on the map                             │
│                                                              │
│  9. First Activity (immediate)                               │
│     Begins with a problem the child can definitely solve     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Parent vs Child Screen Guidelines

**Parent screens:**
- Standard UI patterns (text, dropdowns, toggles)
- Can use smaller text (14-16pt)
- Privacy policy and terms accessible (not blocking)
- Skip buttons for optional fields

**Child screens:**
- Large tap targets (minimum 48x48dp, prefer 64x64dp)
- Minimal text, heavy illustration
- Audio narration for all instructions
- No keyboard input required
- Animated transitions between screens
- Character guide present on every screen

---

## 2. Diagnostic Placement Testing

### 2.1 Overview

The diagnostic placement test determines a child's starting position across multiple math skill dimensions. It must accomplish two things: (1) estimate the child's overall ability level to set an initial Elo rating, and (2) probe specific skill areas to determine which nodes in the prerequisite graph should be marked as mastered, in-progress, or locked.

The challenge is doing this in under 5 minutes, without it feeling like a test, while maintaining psychometric reliability.

### 2.2 Computerized Adaptive Testing (CAT)

Computerized Adaptive Testing selects each question based on the responses to all previous questions, converging on an ability estimate much faster than fixed-form tests. The core algorithm is:

1. **Start** with an item at the expected ability level (based on age/grade priors).
2. **Administer** the item.
3. **Update** the ability estimate using a scoring rule.
4. **Select** the next item that provides maximum information at the current ability estimate.
5. **Terminate** when a stopping criterion is met.

**Why CAT for children's placement:**
- Reduces test length by 50% compared to fixed-form tests while maintaining equivalent reliability (Wainer et al., 2000).
- Each child sees different items, reducing test anxiety from "hard questions."
- Can be framed as a branching adventure rather than a linear test.

### 2.3 Item Response Theory (IRT) for Item Calibration

Each diagnostic item is calibrated using a **2-Parameter Logistic (2PL) IRT model**:

```
P(correct | theta) = 1 / (1 + exp(-a * (theta - b)))
```

Where:
- `theta` (θ) = child's latent ability
- `b` = item difficulty (on the same scale as theta)
- `a` = item discrimination (how well the item differentiates between ability levels)

**Why 2PL and not 3PL:** The 3PL model adds a guessing parameter `c`, which is important for multiple-choice tests with older students. For ages 6-9 with our mix of constructed-response and multiple-choice items, the guessing parameter is less stable and harder to calibrate. The 2PL model is sufficient and more robust with smaller calibration samples (de Ayala, 2009).

**Item bank requirements:**
- Minimum 60-80 items across all skill areas for reliable adaptive selection
- Each item pre-calibrated with difficulty `b` and discrimination `a` parameters
- Items tagged with skill area, prerequisite skills, and CPA level
- Items should span the full difficulty range from kindergarten to grade 4

### 2.4 Ability Estimation: Expected A Posteriori (EAP)

After each response, update the ability estimate using **Expected A Posteriori (EAP)** estimation with a Gaussian prior:

```
Prior:     theta ~ N(mu_prior, sigma_prior)
           where mu_prior is set from age/grade (see Section 3)

Likelihood: L(theta | responses) = PRODUCT of P(x_i | theta, a_i, b_i)

Posterior:  P(theta | responses) proportional to Prior * Likelihood

EAP:       theta_hat = integral(theta * P(theta | responses)) / integral(P(theta | responses))

SE:        Computed from posterior variance
```

EAP is preferred over Maximum Likelihood Estimation (MLE) for short tests because MLE is undefined after 0 or all-correct response patterns, which is common in the first few items (Bock & Mislevy, 1982). EAP always produces a finite estimate by incorporating the prior.

**Numerical integration:** Use Gauss-Hermite quadrature with 40 points over the range [-4, 4]. This is standard practice and computationally trivial on modern devices.

### 2.5 Item Selection: Maximum Fisher Information

Select the next item that maximizes **Fisher Information** at the current ability estimate:

```
I(theta) = a^2 * P(theta) * (1 - P(theta))
```

Where `P(theta)` is the probability of a correct response at the current estimate. Fisher Information is maximized when `P(theta) = 0.5`, meaning the algorithm naturally selects items where the child has roughly a 50/50 chance of success. However, for a children's app, this is too frustrating.

**Modification for child-friendly difficulty:** Instead of maximizing information at `theta_hat`, maximize at `theta_hat - 0.5` (a half-standard-deviation below the estimate). This biases item selection toward slightly easier items, resulting in roughly 60-65% success rate during the diagnostic rather than 50%. The information loss is modest (about 10-15%) but the engagement gain is substantial.

Additionally, apply **content balancing constraints** to ensure the diagnostic samples across skill areas rather than drilling into one:

```
For each skill area s:
  items_administered_in_s <= ceil(total_items * weight_s) + 1
```

Where `weight_s` is the proportion of the curriculum that skill `s` represents.

### 2.6 Test Length and Stopping Criteria

**Research on minimum test length:**

- Kingsbury & Zara (1989) found that CAT achieves reliable placement (r > 0.90 with full-length test) in 10-20 items for broad ability estimation.
- Wang & Kolen (2001) showed that 15 items is sufficient for classification into 4-5 proficiency levels with classification accuracy above 85%.
- For children, Shapiro & Gebhardt (2012) recommend 12-18 items to balance reliability with attention span.

**Recommended test length: 12-18 items with dual stopping criteria:**

1. **Precision criterion:** Stop when `SE(theta) < 0.40`. This corresponds to a 95% confidence interval of approximately ±0.8 on the ability scale, sufficient to distinguish between grade levels.
2. **Maximum length:** Stop after 18 items regardless of precision. Extended testing reduces engagement.
3. **Minimum length:** Administer at least 8 items even if precision is reached early, to sample enough skill areas.

**Expected distribution:**
- Most children: 12-15 items (3-4 minutes)
- Highly consistent responders: 8-10 items (2-3 minutes)
- Erratic responders: 18 items (5 minutes, hard cap)

### 2.7 Starting Difficulty by Age/Grade

| Age | Grade | Starting Theta | Starting Item Difficulty | Typical Skills |
|-----|-------|---------------|------------------------|----------------|
| 5-6 | K | -1.5 | -1.5 | Counting to 20, number recognition, basic shapes |
| 6-7 | 1 | -0.5 | -0.5 | Addition/subtraction within 20, place value to 100 |
| 7-8 | 2 | 0.5 | 0.5 | Addition/subtraction within 100, intro multiplication |
| 8-9 | 3 | 1.5 | 1.5 | Multiplication/division facts, fractions, multi-digit arithmetic |

The theta scale is centered at 0 representing a mid-grade-2 student, with one standard deviation corresponding to roughly one grade level.

### 2.8 Diagnostic Structure: Skill-Stratified Adaptive Testing

Rather than a single unidimensional CAT, use a **multi-stage adaptive test (MST)** that combines global ability estimation with skill-specific probing:

**Stage 1: Routing Module (4-6 items)**
- Items sample broadly across skill areas
- Establishes a coarse global ability estimate
- Determines which skill areas to probe in Stage 2

**Stage 2: Skill Probes (6-12 items)**
- Adaptive within each skill area
- Focuses on skills near the child's ability frontier (where mastery is uncertain)
- Skips skill areas clearly above or below the child's level

```
┌─────────────────────────────────────────────────────┐
│              STAGE 1: ROUTING (4-6 items)            │
│                                                      │
│  Item 1: Grade-level number sense                    │
│  Item 2: Adapt up or down                            │
│  Item 3: Basic operations at estimated level         │
│  Item 4: Different skill area at estimated level     │
│  (Items 5-6 if needed for convergence)               │
│                                                      │
│  Output: Global theta estimate + skill area weights  │
├─────────────────────────────────────────────────────┤
│           STAGE 2: SKILL PROBES (6-12 items)         │
│                                                      │
│  For each skill area near the ability frontier:      │
│    Administer 2-3 targeted items                     │
│    Estimate skill-specific mastery                   │
│                                                      │
│  Skip skill areas that are:                          │
│    - Clearly mastered (theta >> b for all items)     │
│    - Clearly too advanced (theta << b for all items) │
│                                                      │
│  Output: Per-skill mastery estimates                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Cold Start Problem

### 3.1 The Problem

A new user has no interaction history. The adaptive system (Elo, BKT, Leitner) depends on response data to function. Without data, we need principled defaults that:

1. Do not overwhelm the child with problems that are too hard.
2. Do not bore the child with problems that are too easy.
3. Converge to accurate estimates quickly once data starts flowing.

### 3.2 Age/Grade-Based Priors for BKT Parameters

Bayesian Knowledge Tracing models each skill with four parameters:

- `P(L0)` — prior probability the skill is already known
- `P(T)` — probability of learning the skill on each opportunity
- `P(G)` — probability of guessing correctly without knowing
- `P(S)` — probability of slipping (incorrect despite knowing)

**Default BKT parameters (from research):**

Baker et al. (2008) and Pardos & Heffernan (2010) provide empirically validated defaults:

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| P(T) | 0.10 | 0.05-0.30 | Conservative; children learn at varied rates |
| P(G) | 0.20 | 0.10-0.30 | Higher for multiple choice, lower for constructed response |
| P(S) | 0.10 | 0.05-0.20 | Careless errors; higher for younger children |

`P(L0)` is set from diagnostic results:

| Diagnostic Result for Skill | P(L0) | Interpretation |
|------------------------------|-------|----------------|
| All items correct (2+) | 0.85 | Very likely mastered |
| Most items correct (>70%) | 0.60 | Probably known but not certain |
| Mixed results (~50%) | 0.30 | Partially learned |
| Most items incorrect (<30%) | 0.10 | Likely not yet learned |
| Not tested (below ability) | 0.02 | Too advanced; assume unknown |
| Not tested (above ability) | 0.90 | Too basic; assume known |

**Age-based adjustments to P(G) and P(S):**

| Age | P(S) Adjustment | P(G) Adjustment | Rationale |
|-----|----------------|----------------|-----------|
| 5-6 | +0.05 (0.15) | +0.05 (0.25) | More motor errors, more random tapping |
| 7 | +0.02 (0.12) | +0.02 (0.22) | Moderate adjustment |
| 8-9 | 0 (0.10) | 0 (0.20) | Baseline |

### 3.3 Rapid Calibration Strategy (First 2-3 Sessions)

The first 2-3 sessions use a modified problem selection strategy that prioritizes **information gathering** over pure mastery-based progression:

**Session 1 (post-diagnostic):**
- Composition: 70% problems at or slightly below estimated level, 30% exploratory problems from adjacent skill areas.
- Purpose: Confirm diagnostic placement, build confidence.
- Special rule: If the child gets 3 consecutive correct at the current level, introduce one problem from the next difficulty tier. If incorrect, return to current level immediately.

**Session 2:**
- Composition: 60% at current level, 20% confirmatory (re-test skills estimated as mastered), 20% exploratory.
- Purpose: Refine skill-specific estimates, calibrate Elo.
- BKT updates begin accumulating meaningful data.

**Session 3:**
- Composition: Normal adaptive algorithm with full weight.
- Purpose: Transition to steady-state operation.
- By this point, Elo has 20-40 data points and BKT has 5-10 observations per active skill.

### 3.4 When to Trust the Adaptive System vs Use Defaults

The system tracks a **calibration confidence** metric per child:

```
calibrationConfidence = min(1.0, totalResponses / CALIBRATION_THRESHOLD)
```

Where `CALIBRATION_THRESHOLD = 40` (approximately 2-3 sessions of 15-20 problems each).

**Blending rule:**

```
effectiveParameter = calibrationConfidence * adaptiveEstimate
                   + (1 - calibrationConfidence) * priorDefault
```

This creates a smooth transition from prior-based defaults to data-driven estimates. At 0 responses, the system uses 100% priors. At 20 responses, it is 50/50. At 40+ responses, it uses 100% adaptive estimates.

| Metric | Trust Threshold | Behavior Before Threshold | Behavior After Threshold |
|--------|----------------|--------------------------|-------------------------|
| Elo Rating | 30 responses | Blend with age/grade prior | Full Elo |
| BKT P(Ln) | 8 responses per skill | Blend with diagnostic P(L0) | Full BKT |
| Leitner Box | 5 responses per card | Start in box determined by diagnostic | Normal promotion/demotion |
| Difficulty Selection | 20 responses | Bias toward 85% success | Target 85% via Elo |

---

## 4. Placement Mapping

### 4.1 Diagnostic Results to Initial Elo Rating

The diagnostic produces a theta estimate on the IRT scale [-4, 4]. This maps to the Elo rating system:

```
initialElo = ELO_CENTER + (theta * ELO_SCALE)

Where:
  ELO_CENTER = 1000  (average mid-grade-2 student)
  ELO_SCALE  = 200   (one SD on theta = 200 Elo points)
```

| Theta | Elo | Approximate Level |
|-------|-----|-------------------|
| -2.0 | 600 | Below kindergarten |
| -1.5 | 700 | Early kindergarten |
| -1.0 | 800 | Late kindergarten |
| -0.5 | 900 | Early grade 1 |
| 0.0 | 1000 | Mid grade 2 |
| 0.5 | 1100 | Late grade 2 |
| 1.0 | 1200 | Early grade 3 |
| 1.5 | 1300 | Mid grade 3 |
| 2.0 | 1400 | Late grade 3 / early grade 4 |

**Confidence-based Elo K-factor:**

```
K = K_MAX * (1 - calibrationConfidence) + K_MIN * calibrationConfidence

Where:
  K_MAX = 40  (first few sessions — large adjustments)
  K_MIN = 16  (steady state — smaller adjustments)
```

### 4.2 Diagnostic Results to Skill States

Each skill node transitions through states:

```
LOCKED → AVAILABLE → IN_PROGRESS → MASTERED
```

**Mapping rules from diagnostic:**

1. **Skills with diagnostic data (directly tested):**
   - Mastery probability >= 0.80 → `MASTERED`
   - Mastery probability 0.30-0.79 → `IN_PROGRESS`
   - Mastery probability < 0.30 → `AVAILABLE` (if prerequisites met) or `LOCKED`

2. **Skills without diagnostic data (inferred from global theta):**
   - Skill difficulty `b` < theta - 1.0 → `MASTERED` (assumed; well below ability)
   - Skill difficulty `b` within theta ± 1.0 → `AVAILABLE`
   - Skill difficulty `b` > theta + 1.0 → `LOCKED`

3. **Prerequisite enforcement:**
   - A skill cannot be `AVAILABLE` or higher unless all prerequisites are `MASTERED`.
   - If inference marks a skill as `MASTERED` but a prerequisite is not mastered, mark the prerequisite as `MASTERED` too (propagate upward).
   - If this creates an inconsistency (a prerequisite was directly tested and failed), trust the direct test data and downgrade the inferred skill.

**Algorithm: Consistent State Assignment**

```typescript
function assignInitialStates(skills, diagnosticResults, theta) {
  // Phase 1: Assign raw states
  for (const skill of topologicalOrder(skills)) {
    if (diagnosticResults.has(skill.id)) {
      skill.state = stateFromMastery(diagnosticResults.get(skill.id));
    } else {
      skill.state = stateFromTheta(skill.difficulty, theta);
    }
  }

  // Phase 2: Enforce prerequisites (top-down)
  for (const skill of topologicalOrder(skills)) {
    if (skill.state >= AVAILABLE) {
      for (const prereq of skill.prerequisites) {
        if (prereq.state < MASTERED) {
          skill.state = LOCKED;
          break;
        }
      }
    }
  }

  // Phase 3: Propagate mastery upward (bottom-up)
  for (const skill of reverseTopologicalOrder(skills)) {
    if (skill.state === MASTERED) {
      for (const prereq of skill.prerequisites) {
        if (prereq.state < MASTERED && !diagnosticResults.has(prereq.id)) {
          prereq.state = MASTERED;
        }
      }
    }
  }

  // Phase 4: Final prerequisite check
  for (const skill of topologicalOrder(skills)) {
    if (skill.state >= AVAILABLE) {
      for (const prereq of skill.prerequisites) {
        if (prereq.state < MASTERED) {
          skill.state = LOCKED;
          break;
        }
      }
    }
  }
}
```

### 4.3 Diagnostic Results to Leitner Box Positions

| Diagnostic Mastery for Skill | Initial Leitner Box | Review Interval |
|------------------------------|---------------------|-----------------|
| >= 0.90 (confident mastery) | Box 4 | 8 days |
| 0.70-0.89 (probable mastery) | Box 3 | 4 days |
| 0.40-0.69 (partial knowledge) | Box 2 | 2 days |
| 0.20-0.39 (weak) | Box 1 | 1 day |
| < 0.20 (not known) | Not placed | Skill must be taught first |

### 4.4 First Session Composition

The first session after diagnostic is critical for engagement. Research on children's math anxiety shows that early negative experiences create lasting avoidance behavior (Ramirez et al., 2013).

**First session rules:**

1. **Start with a guaranteed success.** The first problem should be from a skill marked as `MASTERED` at the concrete (C) representation level. (>95% probability of success.)

2. **Sandwich pattern:** Easy-Medium-Easy-Medium-Easy. Never present two challenging problems in a row during the first session.

3. **Composition:**
   - 40% problems from `MASTERED` skills (reinforcement, confidence)
   - 40% problems from `IN_PROGRESS` skills (productive struggle)
   - 20% problems from `AVAILABLE` skills (gentle introduction)
   - 0% problems from `LOCKED` skills

4. **CPA distribution for first session:**
   - 50% Concrete (manipulatives, visual counting)
   - 30% Pictorial (diagrams, number lines)
   - 20% Abstract (number sentences)

5. **Session length:** 12-15 problems (shorter than normal). End on a success.

---

## 5. Re-assessment

### 5.1 Triggers for Re-assessment

| Trigger | Type | Scope | Test Length |
|---------|------|-------|-------------|
| Long absence (>30 days) | Automatic | Full diagnostic | 10-15 items |
| Long absence (14-30 days) | Automatic | Abbreviated, focused on `IN_PROGRESS` skills | 6-10 items |
| Parent request | Manual | Full diagnostic | 12-18 items |
| Persistent underperformance | Automatic | Targeted skills showing decline | 4-8 items |
| Persistent overperformance | Automatic | Exploratory, probing advanced skills | 4-8 items |

### 5.2 Absence-Based Re-assessment

Children forget mathematical procedures during breaks, but conceptual understanding is more durable (Bahrick et al., 1993).

**Decay model:**

```
retentionProbability(skill) = P(Ln) * exp(-absenceDays / halfLife(skill))

Where halfLife depends on Leitner box:
  Box 1: 7 days
  Box 2: 14 days
  Box 3: 30 days
  Box 4: 60 days
  Box 5: 120 days
```

**Post-absence adjustments:**
- Elo: Decrease by `absenceDays * 0.5` (capped at -100), then restore via normal gameplay.
- BKT: Apply retention decay to all `P(Ln)` values.
- Leitner: Move all cards down by 1 box for 14-30 day absence, 2 boxes for >30 days (floor at box 1).

### 5.3 Performance-Based Re-assessment

**Underperformance detection:**
- Rolling window of last 20 problems shows accuracy below 70% (well below the 85% target).
- Elo has dropped by more than 100 points from peak.

**Overperformance detection:**
- Rolling window of last 20 problems shows accuracy above 95%.
- Triggered re-assessment probes skills one tier above the current frontier.

### 5.4 Re-assessment UX

Frame positively, never punitively:

- **After absence:** "Welcome back, [Name]! [Character] wants to see what you remember!"
- **Parent request:** "Let's go on a special mission to see how much you've grown!"
- **Performance-based:** Transparent to the child — just a shift in problem selection for one session.

---

## 6. UX Considerations

### 6.1 Making Diagnostic Fun

**Research-backed strategies:**

1. **Adventure framing (Habgood & Ainsworth, 2011):** Frame as exploration. "Help [Character] explore the Math Mountain!" Each item is a "puzzle" in a "cave." Correct answers open the path. Incorrect: "Hmm, tricky one! Let's try another path!"

2. **No visible scoring during diagnostic.** No running score, stars, or checkmarks. Show exploration progress: "3 of 10 caves explored!" (Segool et al., 2013)

3. **Effort praise, not correctness praise (Dweck, 2006).** "Great thinking!" (correct) or "Good try! That was a tough one!" (incorrect). Never "Wrong!"

4. **Varied item formats:** Tap the correct answer, drag objects to count, draw a line to match, tap to pop bubbles, arrange objects in order.

5. **Character reactions:** Thinking pose while child works, celebratory animation on correct, encouraging animation on incorrect. Warm regardless of correctness.

### 6.2 Progress Indicators

**During diagnostic:**
- A path or map that fills as items are completed (not as items are answered correctly).
- "5 more puzzles to go!" countdown.
- No percentage indicators.

**After diagnostic:**
- A "badge" celebrating completion, not score.
- A world map that unlocks based on placement.
- Character announces the starting area with excitement, regardless of level.

### 6.3 Encouraging Feedback

| Event | Character Says | Character Does |
|-------|---------------|----------------|
| Correct (easy) | "You got it!" | Quick smile animation |
| Correct (hard) | "Wow, that was a tricky one!" | Celebratory jump |
| Incorrect | "Hmm, let's keep exploring!" | Thoughtful nod, moves to next |
| Timeout (10s) | "Need a hint? Let's try something else!" | Gentle wave |
| Streak of 3 correct | "You're on a roll!" | Special animation |
| After incorrect, then correct | "See? You figured it out!" | Thumbs up |

### 6.4 Parental Reporting

After the diagnostic, provide a parent-facing summary (behind parental PIN):

```
┌────────────────────────────────────────────────┐
│           Diagnostic Results for Emma           │
│                                                 │
│  Overall Level: Early Grade 2                   │
│                                                 │
│  Strengths:                                     │
│  ● Number sense (counting, comparing)           │
│  ● Addition within 20                           │
│                                                 │
│  Areas to Develop:                              │
│  ● Subtraction with regrouping                  │
│  ● Place value (tens and ones)                  │
│                                                 │
│  Recommended Focus:                             │
│  Tiny Tallies will start with subtraction       │
│  practice and place value concepts to build     │
│  on Emma's strong number sense.                 │
│                                                 │
│  [Re-assess Now]  [Adjust Level Manually]       │
└────────────────────────────────────────────────┘
```

---

## 7. Data Models

```typescript
/** A single item in the diagnostic item bank */
interface DiagnosticItem {
  id: string;
  /** IRT difficulty parameter (theta scale, typically -3 to +3) */
  difficulty: number;
  /** IRT discrimination parameter (typically 0.5 to 2.5) */
  discrimination: number;
  /** Primary skill area this item assesses */
  skillId: string;
  prerequisiteSkillIds: string[];
  representationLevel: 'concrete' | 'pictorial' | 'abstract';
  gradeLevel: number;
  format: 'multiple_choice' | 'drag_drop' | 'tap_count' | 'match' | 'arrange';
  optionCount?: number;
  content: DiagnosticItemContent;
  calibration: {
    sampleSize: number;
    difficultySE: number;
    calibratedAt: string;
  };
}

interface DiagnosticItemContent {
  prompt: string;
  visualAssetKey?: string;
  options?: Array<{
    id: string;
    label: string;
    visualAssetKey?: string;
  }>;
  correctAnswerIds: string[];
  interactionZones?: Array<{
    id: string;
    position: { x: number; y: number };
    acceptsIds: string[];
  }>;
}

/** State maintained during a diagnostic session */
interface DiagnosticSession {
  sessionId: string;
  childProfile: {
    name: string;
    age: number;
    grade: number;
    priorExperience: 'none' | 'some' | 'significant';
  };
  thetaEstimate: number;
  thetaSE: number;
  prior: { mean: number; variance: number };
  responses: DiagnosticResponse[];
  skillEstimates: Map<string, SkillDiagnosticEstimate>;
  stage: 'routing' | 'skill_probing' | 'complete';
  skillItemCounts: Map<string, number>;
  stopping: {
    precisionReached: boolean;
    minimumItemsMet: boolean;
    maximumItemsReached: boolean;
  };
  startedAt: number;
  completedAt?: number;
}

interface DiagnosticResponse {
  itemId: string;
  skillId: string;
  correct: boolean;
  responseTimeMs: number;
  thetaAfterResponse: number;
  seAfterResponse: number;
  respondedAt: number;
}

interface SkillDiagnosticEstimate {
  skillId: string;
  itemCount: number;
  correctCount: number;
  masteryProbability: number;
  confidence: 'low' | 'medium' | 'high';
}

/** Final output of the diagnostic */
interface PlacementResult {
  diagnosticSessionId: string;
  globalAbility: {
    theta: number;
    se: number;
    eloRating: number;
    eloKFactor: number;
    gradeLevelEquivalent: number;
  };
  skillStates: Array<{
    skillId: string;
    state: 'locked' | 'available' | 'in_progress' | 'mastered';
    initialPL0: number;
    initialLeitnerBox: number | null;
    estimateSource: 'direct_test' | 'inferred_from_theta' | 'prerequisite_propagation';
  }>;
  bktParameters: {
    pTransit: number;
    pGuess: number;
    pSlip: number;
  };
  firstSessionPlan: {
    skillSequence: string[];
    difficultyRange: { min: number; max: number };
    cpaDistribution: { concrete: number; pictorial: number; abstract: number };
    problemCount: number;
  };
  calibration: {
    confidence: number;
    totalResponses: number;
    calibrationThreshold: number;
  };
  parentSummary: {
    levelDescription: string;
    strengths: string[];
    areasToGrow: string[];
    recommendation: string;
  };
  createdAt: number;
}

/** Re-assessment configuration */
interface ReassessmentConfig {
  absence: {
    fullReassessmentDays: number; // default: 30
    abbreviatedReassessmentDays: number; // default: 14
    noReassessmentDays: number; // default: 7
  };
  performance: {
    underperformanceThreshold: number; // default: 0.70
    overperformanceThreshold: number; // default: 0.95
    rollingWindowSize: number; // default: 20
    eloDropThreshold: number; // default: 100
  };
  decay: {
    halfLifeByBox: Record<number, number>;
    eloDecayPerDay: number; // default: 0.5
    maxEloDecay: number; // default: 100
    leitnerDemotionShort: number; // default: 1
    leitnerDemotionFull: number; // default: 2
  };
}
```

### Core CAT Algorithm

```typescript
/** 2PL IRT probability of correct response */
function irtProbability(theta: number, difficulty: number, discrimination: number): number {
  return 1 / (1 + Math.exp(-discrimination * (theta - difficulty)));
}

/** Fisher information for a 2PL item at a given theta */
function fisherInformation(theta: number, difficulty: number, discrimination: number): number {
  const p = irtProbability(theta, difficulty, discrimination);
  return discrimination * discrimination * p * (1 - p);
}

/** EAP theta estimate using numerical integration */
function estimateTheta(
  responses: Array<{ difficulty: number; discrimination: number; correct: boolean }>,
  prior: { mean: number; variance: number },
  numPoints: number = 40
): { theta: number; se: number } {
  const { mean: mu, variance: sigma2 } = prior;
  const sigma = Math.sqrt(sigma2);
  const thetaMin = mu - 4 * sigma;
  const thetaMax = mu + 4 * sigma;
  const step = (thetaMax - thetaMin) / (numPoints - 1);

  let numerator = 0;
  let denominator = 0;
  let secondMoment = 0;

  for (let i = 0; i < numPoints; i++) {
    const theta = thetaMin + i * step;
    const priorDensity = Math.exp(-((theta - mu) ** 2) / (2 * sigma2)) / (sigma * Math.sqrt(2 * Math.PI));

    let logLikelihood = 0;
    for (const r of responses) {
      const p = irtProbability(theta, r.difficulty, r.discrimination);
      logLikelihood += r.correct ? Math.log(p) : Math.log(1 - p);
    }

    const posterior = Math.exp(logLikelihood) * priorDensity;
    numerator += theta * posterior * step;
    secondMoment += theta * theta * posterior * step;
    denominator += posterior * step;
  }

  const thetaHat = numerator / denominator;
  const variance = secondMoment / denominator - thetaHat * thetaHat;
  return { theta: thetaHat, se: Math.sqrt(variance) };
}

/** Map IRT theta to initial Elo rating */
function thetaToElo(theta: number, center = 1000, scale = 200): number {
  return Math.round(center + theta * scale);
}

/** Map diagnostic mastery to initial Leitner box */
function masteryToLeitnerBox(masteryProbability: number): number | null {
  if (masteryProbability >= 0.90) return 4;
  if (masteryProbability >= 0.70) return 3;
  if (masteryProbability >= 0.40) return 2;
  if (masteryProbability >= 0.20) return 1;
  return null;
}

/** Calibration confidence for blending priors with adaptive estimates */
function calibrationConfidence(totalResponses: number, threshold = 40): number {
  return Math.min(1.0, totalResponses / threshold);
}

/** Retention probability after absence */
function retentionAfterAbsence(
  currentPLn: number,
  absenceDays: number,
  leitnerBox: number,
  halfLifeByBox: Record<number, number>
): number {
  const halfLife = halfLifeByBox[leitnerBox] ?? 14;
  return currentPLn * Math.exp(-absenceDays * Math.LN2 / halfLife);
}
```

---

## 8. References

### Adaptive Testing & IRT
- Wainer, H. et al. (2000). *Computerized Adaptive Testing: A Primer* (2nd ed.). Lawrence Erlbaum Associates.
- de Ayala, R.J. (2009). *The Theory and Practice of Item Response Theory.* Guilford Press.
- Bock, R.D. & Mislevy, R.J. (1982). "Adaptive EAP estimation of ability in a microcomputer environment." *Applied Psychological Measurement, 6*(4), 431-444.
- Kingsbury, G.G. & Zara, A.R. (1989). "Procedures for selecting items for computerized adaptive tests." *Applied Measurement in Education, 2*(4), 359-375.
- Wang, T. & Kolen, M.J. (2001). "Evaluating comparability in computerized adaptive testing." *Journal of Educational Measurement, 38*(1), 19-49.
- Luecht, R.M. & Nungester, R.J. (1998). "Some practical examples of computer-adaptive sequential testing." *Journal of Educational Measurement, 35*(3), 229-249.

### Bayesian Knowledge Tracing
- Baker, R.S.J.d. et al. (2008). "More accurate student modeling through contextual estimation." *Proceedings of ITS 2008*, 406-415.
- Pardos, Z.A. & Heffernan, N.T. (2010). "Modeling individualization in a Bayesian networks implementation of Knowledge Tracing." *UMAP 2010*, 255-266.

### Elo Rating in Education
- Glickman, M.E. (1999). "Parameter estimation in large dynamic paired comparison experiments." *JRSS-C, 48*(3), 377-394.
- Pelanek, R. (2016). "Applications of the Elo rating system in adaptive educational systems." *Computers & Education, 98*, 169-179.

### Children's Math Education
- Ramirez, G. et al. (2013). "Math anxiety, working memory, and math achievement in early elementary school." *Journal of Cognition and Development, 14*(2), 187-202.
- Dweck, C.S. (2006). *Mindset: The New Psychology of Success.* Random House.
- Shapiro, E.S. & Gebhardt, S.N. (2012). "Comparing computer-adaptive and curriculum-based measurement methods." *School Psychology Review, 41*(3), 295-305.

### Children's HCI & UX
- Fails, J.A. et al. (2012). "Methods and techniques for involving children in the design of new technology." *FnT HCI, 6*(2), 85-166.
- Hourcade, J.P. (2015). *Child-Computer Interaction.*
- Anthony, L. et al. (2012). "Interaction and recognition challenges in children's touch and gesture input." *ACM ITS 2012*, 225-234.
- Habgood, M.P.J. & Ainsworth, S.E. (2011). "Motivating children to learn effectively." *Journal of the Learning Sciences, 20*(2), 169-206.
- Segool, N.K. et al. (2013). "Heightened test anxiety among young children." *Psychology in the Schools, 50*(5), 489-499.

### Spaced Repetition
- Leitner, S. (1972). *So lernt man lernen.* Herder.
- Bahrick, H.P. et al. (1993). "Maintenance of foreign language vocabulary and the spacing effect." *Psychological Science, 4*(5), 316-321.
