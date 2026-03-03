# Phase 12: Leitner Spaced Repetition - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a modified 6-box Leitner spaced repetition system that schedules skill reviews at optimal intervals. Skills move between boxes based on correct/wrong answers, with age-adjusted intervals. Service/data layer — no UI changes. Downstream Phase 14 consumes the Leitner queue for session orchestration.

</domain>

<decisions>
## Implementation Decisions

### Leitner + BKT relationship
- BKT is the sole authority for mastery declarations — Leitner boxes control review TIMING only
- Box 6 graduation (3 consecutive correct in Box 6) is a scheduling milestone, not a mastery declaration
- Box sync when BKT declares mastery: Claude's discretion (auto-advance to Box 6, or let box catch up naturally)

### Review due timing
- Wall-clock timestamps: store nextReviewDue as ISO date, compare against current date
- If child skips days, overdue skills pile up and get prioritized when they return
- Age-adjusted intervals from research: Box 2 = same day/next day, Box 3 = 1-3 days, etc.

### Initial box placement
- BKT-informed placement: use existing P(L) from Phase 11 to place skills in appropriate boxes
- Skills with no BKT data start in Box 1 (standard default)
- This handles the v3→v4 migration gracefully (existing skills with BKT data get meaningful initial boxes)

### Box transition rules (from research, locked)
- Correct → move up 1 box (max Box 6)
- Wrong → drop 2 boxes (min Box 1), NOT all the way to Box 1
- Mastered (Box 6 graduated) → monthly review schedule
- Age-adjusted intervals: shorter gaps for younger children (discrete brackets: 6-7, 7-8, 8-9)

### Claude's Discretion
- Whether to auto-advance box on BKT mastery declaration
- Store migration strategy for adding Leitner fields to SkillState
- Exact interval values per box per age bracket (use research defaults from .planning/06-spaced-repetition.md)
- How to compute the "due for review" queue (sorted by overdue priority)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — follow the research doc (.planning/06-spaced-repetition.md) for interval tables and box transition rules.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bktCalculator.ts`: BKT service pattern — Leitner service follows same pure-function structure
- `skillStatesSlice.ts`: SkillState type with BKT fields — extend with Leitner fields (leitnerBox, nextReviewDue, consecutiveCorrectInBox6)
- `childProfileSlice.ts`: childAge for age-adjusted intervals

### Established Patterns
- Pure function services in src/services/adaptive/ — Leitner service fits here
- Store migration versioning — bump to v4 for Leitner fields
- Discrete age brackets (6-7, 7-8, 8-9) established in Phase 11

### Integration Points
- `commitSessionResults` — needs to update Leitner box position and nextReviewDue
- `handleAnswer` in useSession.ts — box transition computed alongside BKT and Elo
- Phase 14 will query "skills due for review" to build the review portion of session mix

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-leitner-spaced-repetition*
*Context gathered: 2026-03-03*
