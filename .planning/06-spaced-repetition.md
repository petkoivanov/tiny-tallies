# Spaced Repetition & Adaptive Difficulty Engine

**Research Date:** 2026-02-28
**Focus:** Optimal review scheduling and difficulty adaptation for ages 6-9

## Overview

Two interconnected systems:
1. **Spaced Repetition** — WHEN to review (Modified Leitner + Bayesian Knowledge Tracing)
2. **Adaptive Difficulty** — WHAT difficulty to present (Elo Rating System)

## 1. Modified Leitner Spaced Repetition

### Standard Leitner System
Skills move between boxes based on correct/incorrect answers:
- **Correct** → move to next box (longer review interval)
- **Incorrect** → move back to Box 1 (immediate re-review)

### Age-Adjusted Intervals

Research shows younger children forget faster. Intervals are compressed for ages 6-7:

| Box | Standard | Age 6-7 | Age 7-8 | Age 8-9 |
|-----|----------|---------|---------|---------|
| 1 | Same session | Same session | Same session | Same session |
| 2 | Next day | Same day (2hr) | Next day | Next day |
| 3 | 3 days | 1 day | 2 days | 3 days |
| 4 | 7 days | 3 days | 5 days | 7 days |
| 5 | 14 days | 7 days | 10 days | 14 days |
| 6 | 30 days | 14 days | 21 days | 30 days |

**Mastered:** After 3 consecutive correct in Box 6, skill is "mastered" — reviewed monthly.

### Box Transition Rules

```
Correct answer → box = min(box + 1, 6)
Wrong answer   → box = max(box - 2, 1)  // Drop 2 boxes, not to Box 1
                                          // (less punishing for children)
```

**Why drop 2 instead of to Box 1:**
- Dropping to Box 1 is discouraging for young children
- Most "wrong" answers in Box 4+ are careless mistakes, not forgotten skills
- Research: Smaller drops maintain engagement without sacrificing retention

## 2. Bayesian Knowledge Tracing (BKT)

Tracks mastery probability per skill using 4 parameters:

| Parameter | Symbol | Description | Default |
|-----------|--------|-------------|---------|
| Prior knowledge | P(L₀) | Probability child knew this before instruction | 0.1 |
| Learn rate | P(T) | Probability of learning per opportunity | 0.3 |
| Slip rate | P(S) | Probability of wrong answer despite knowing | 0.1 |
| Guess rate | P(G) | Probability of right answer without knowing | 0.25 |

### Update Equations

After a correct answer:
```
P(L|correct) = P(L) * (1 - P(S)) / (P(L) * (1 - P(S)) + (1 - P(L)) * P(G))
```

After an incorrect answer:
```
P(L|incorrect) = P(L) * P(S) / (P(L) * P(S) + (1 - P(L)) * (1 - P(G)))
```

After each observation, update learned probability:
```
P(L_new) = P(L|obs) + (1 - P(L|obs)) * P(T)
```

### Mastery Threshold

- **P(L) ≥ 0.95** → Skill mastered (move to review-only)
- **P(L) < 0.40** → Skill needs re-teaching (trigger TEACH mode)
- **0.40 ≤ P(L) < 0.95** → Continue practice

### Age-Specific BKT Adjustments

| Parameter | Age 6-7 | Age 7-8 | Age 8-9 |
|-----------|---------|---------|---------|
| P(G) | 0.30 | 0.25 | 0.20 |
| P(S) | 0.15 | 0.10 | 0.08 |
| P(T) | 0.25 | 0.30 | 0.35 |

**Rationale:**
- Younger children guess more (higher P(G))
- Younger children make more careless errors (higher P(S))
- Younger children learn slightly slower per exposure (lower P(T))

## 3. Elo Rating System for Adaptive Difficulty

### Concept

Borrowed from chess: both the child and each problem have a rating. After each interaction, both ratings update.

- **Child starts at 1000** (adjusted by age: +50 per year above 6)
- **Problems rated 800-1600** based on difficulty
- **Target:** 85% success rate (research-backed optimal learning zone)

### Rating Update

```
Expected score: E = 1 / (1 + 10^((problem_rating - child_rating) / 400))

If correct:  child_rating += K * (1 - E)
             problem_rating -= K * (1 - E)

If incorrect: child_rating += K * (0 - E)
              problem_rating -= K * (0 - E)
```

**K-factor:** 32 for children (higher than chess — faster adaptation)

### Problem Selection Algorithm

```typescript
function selectNextProblem(
  childRating: number,
  availableProblems: Problem[],
  sessionMix: SessionMix
): Problem {
  // Target: child has ~85% chance of correct answer
  const targetDifficulty = childRating - 60; // offset for 85% expected score

  // Filter by session mix requirements
  const pool = filterBySessionMix(availableProblems, sessionMix);

  // Score each problem by how close it is to target difficulty
  const scored = pool.map(p => ({
    problem: p,
    score: -Math.abs(p.rating - targetDifficulty) + randomJitter(20),
  }));

  // Add variety: slight randomness prevents always picking the same type
  return scored.sort((a, b) => b.score - a.score)[0].problem;
}
```

### Session Mix

Each daily session follows this composition:

| Category | % of Session | Source | Purpose |
|----------|-------------|--------|---------|
| **Review** | 60% | Spaced repetition queue | Retention |
| **New** | 30% | Next skills in prerequisite graph | Progression |
| **Challenge** | 10% | Slightly above Elo rating | Growth mindset |

## 4. Knowledge Space Theory — "What to Teach Next"

### Prerequisite Graph

Skills form a directed acyclic graph (DAG) where each skill has prerequisites:

```
count_to_10 ──→ add_within_5 ──→ add_within_10 ──→ add_within_20 ──→ add_within_100
                                       │
                                       ▼
                               subtract_within_10 ──→ subtract_within_20

place_value_tens ──→ add_within_100 + subtract_within_100

count_by_2s ──→ equal_groups ──→ multiplication ──→ times_tables
                     │
                     ▼
              sharing_equally ──→ division

equal_parts ──→ halves_quarters ──→ unit_fractions ──→ comparing_fractions
```

### Outer Fringe Algorithm

The "outer fringe" is the set of skills whose prerequisites are ALL mastered:

```typescript
function getOuterFringe(
  masteredSkills: Set<string>,
  prerequisiteGraph: Graph
): string[] {
  const fringe: string[] = [];

  for (const skill of allSkills) {
    if (masteredSkills.has(skill)) continue;

    const prereqs = prerequisiteGraph.getPrerequisites(skill);
    if (prereqs.every(p => masteredSkills.has(p))) {
      fringe.push(skill);
    }
  }

  return fringe;
}
```

**The "New" 30% of each session comes from the outer fringe.**

## 5. Session Design

### Session Length

| Age | Duration | Problems | Break Point |
|-----|----------|----------|-------------|
| 6-7 | 15 min | 10-15 | After problem 7 |
| 7-8 | 18 min | 12-18 | After problem 9 |
| 8-9 | 20 min | 15-20 | After problem 10 |

### Session Flow

```
1. Warm-up (2 min)
   - 2-3 easy review problems (confidence builder)
   - Always from Box 5-6 (well-known skills)

2. Core Practice (10-14 min)
   - Mix of review (60%) + new (30%) + challenge (10%)
   - Misconception-targeted problems if any confirmed bugs
   - Manipulative-supported problems for new concepts

3. Break / Mini-game (1-2 min)
   - Quick pattern puzzle or speed drill
   - Earns bonus coins for the session

4. Wrap-up (2 min)
   - 2-3 problems at or below current level
   - Always end on success (confidence)
   - Session summary: "You practiced 15 problems today!"

5. Post-session (background)
   - Update Elo ratings
   - Update BKT probabilities
   - Update Leitner box positions
   - Update misconception records
   - Compute next session's queue
```

### Frustration Detection

If the child gets 3 wrong in a row:
1. Reduce difficulty by 100 Elo points
2. Insert an "easy win" problem (from mastered skills)
3. Show encouraging message
4. If 5 wrong in a row → suggest taking a break

### Streak Protection

If the child has a daily streak going:
- Allow 1 "freeze" day per week (streak doesn't break)
- Weekend sessions are optional (streak only counts weekdays)
- Streak milestones at 5, 10, 25, 50, 100 days

## Data Model

```typescript
interface ChildProfile {
  id: string;
  age: number;
  grade: number;
  curriculum: CurriculumType;
  eloRating: number;
  streakDays: number;
  lastSessionDate: string;
  totalProblems: number;
  totalCorrect: number;
}

interface SkillState {
  skillId: string;
  leitnerBox: 1 | 2 | 3 | 4 | 5 | 6;
  bktProbability: number;  // P(L) — mastery probability
  lastReviewed: number;
  nextReviewDue: number;
  totalAttempts: number;
  correctAttempts: number;
  eloRating: number;  // per-skill difficulty tracking
}

interface SessionPlan {
  problems: PlannedProblem[];
  targetDuration: number;
  reviewCount: number;
  newCount: number;
  challengeCount: number;
}

interface PlannedProblem {
  problem: MathProblem;
  category: 'review' | 'new' | 'challenge' | 'warmup' | 'cooldown';
  targetSkill: string;
  expectedDifficulty: number;
}
```

## Configurable Settings

Users (parents) can adjust:
- **Session length:** 10 / 15 / 20 / 25 minutes
- **Difficulty:** "Take it easy" (-100 Elo) / "Just right" / "Push harder" (+100 Elo)
- **Review ratio:** More review (70/20/10) / Balanced (60/30/10) / More new (50/40/10)
- **Streak rules:** Strict (daily) / Relaxed (weekdays) / Off
- **Challenge problems:** On / Off

## Research References

- Leitner, S. (1972). "So lernt man lernen" (original Leitner system)
- Corbett, A.T. & Anderson, J.R. (1995). "Knowledge tracing: Modeling the acquisition of procedural knowledge"
- Elo, A.E. (1978). "The Rating of Chessplayers, Past and Present"
- Pashler, H. et al. (2007). "Organizing instruction and study to improve student learning"
- Vygotsky, L.S. (1978). "Zone of proximal development" — basis for 85% success target
- Roediger, H.L. & Karpicke, J.D. (2006). "The power of testing memory"
