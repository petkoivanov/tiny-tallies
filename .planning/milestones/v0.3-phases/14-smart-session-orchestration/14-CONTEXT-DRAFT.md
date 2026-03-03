# Phase 14: Smart Session Orchestration - Context (DRAFT)

**Status:** Discussion in progress — all 3 areas selected, answers pending

## Areas to Discuss (user selected all 3)
1. Session structure — warmup/cooldown + 60/30/10 mix
2. Fallback redistribution — what happens when a category is empty
3. Review & challenge tuning — prioritization, Elo targeting, BKT influence

## Prior Decisions Carried Forward
- Leitner `getReviewStatus(nextReviewDue)` returns isDue/overdueByMs (Phase 12)
- `getOuterFringe(skillStates)` returns ready-to-learn skills, empty [] when all mastered (Phase 13)
- BKT masteryProbability per skill, masteryLocked flag (Phase 11)
- Current session: 3 warmup + 9 practice + 3 cooldown = 15 problems (sessionOrchestrator.ts)
- Warmup/cooldown use strongest skill + easiest template (confidence building)
- Practice uses weakness-weighted skill selection

## Codebase Context
- `sessionOrchestrator.ts`: generateSessionQueue uses getUnlockedSkills, selectSkill (weakness-weighted), selectStrongestSkill
- `sessionTypes.ts`: DEFAULT_SESSION_CONFIG has warmupCount/practiceCount/cooldownCount
- `getReviewStatus` exported from adaptive barrel but has no consumer yet
- `getOuterFringe` exported from adaptive barrel
- `skillSelector.ts`: selectSkill (weakness-weighted), weightSkillsByWeakness
- `problemSelector.ts`: selectTemplateForSkill (gaussian-targeted by Elo)

## Resume Instructions
Run `/gsd:discuss-phase 14` in fresh context. CONTEXT.md doesn't exist yet — discussion will restart from gray area presentation.
