---
phase: 34
slug: visual-skill-map
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 34 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo + React Native Testing Library |
| **Config file** | `jest.config.js` (exists) |
| **Quick run command** | `npm test -- --testPathPattern=skillMap` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=skillMap`
- **After every plan wave:** Run `npm test && npm run typecheck`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 34-01-01 | 01 | 1 | SMAP-01 | unit | `npm test -- --testPathPattern=SkillMapScreen` | ❌ W0 | ⬜ pending |
| 34-01-02 | 01 | 1 | SMAP-01 | unit | `npm test -- --testPathPattern=HomeScreen` | ✅ (update) | ⬜ pending |
| 34-02-01 | 02 | 1 | SMAP-02 | unit | `npm test -- --testPathPattern=SkillMapGraph` | ❌ W0 | ⬜ pending |
| 34-02-02 | 02 | 1 | SMAP-02 | unit | `npm test -- --testPathPattern=skillMapLayout` | ❌ W0 | ⬜ pending |
| 34-03-01 | 03 | 1 | SMAP-03 | unit | `npm test -- --testPathPattern=SkillDetailOverlay` | ❌ W0 | ⬜ pending |
| 34-03-02 | 03 | 1 | SMAP-03 | unit | `npm test -- --testPathPattern=SkillMapScreen` | ❌ W0 | ⬜ pending |
| 34-04-01 | 04 | 2 | SMAP-04 | manual-only | Visual verification | N/A | ⬜ pending |
| 34-04-02 | 04 | 2 | SMAP-04 | manual-only | Visual verification | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/screens/SkillMapScreen.test.tsx` — stubs for SMAP-01, SMAP-03
- [ ] `src/__tests__/components/SkillMapGraph.test.tsx` — stubs for SMAP-02 (node state rendering)
- [ ] `src/__tests__/components/SkillDetailOverlay.test.tsx` — stubs for SMAP-03 (overlay content)
- [ ] `src/__tests__/components/skillMapLayout.test.ts` — stubs for SMAP-02 (getNodeState pure function)
- [ ] Update `src/__tests__/screens/HomeScreen.test.tsx` — covers SMAP-01 (navigation entry point)

*Existing infrastructure covers test framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Staggered entrance animation | SMAP-04 | Visual timing/easing requires human eye | Open SkillMap, verify nodes appear sequentially top-to-bottom |
| Outer fringe node pulse | SMAP-04 | Breathing animation is visual/perceptual | Observe outer fringe nodes gently pulsing |
| Edge glow on active path | SMAP-04 | Glow effect is visual | Verify edges to outer fringe nodes have glow/pulse |
| Mastery fill progress ring | SMAP-04 | Animated ring fill is visual | Verify in-progress nodes show partial fill ring |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
