---
phase: 80
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 80 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npm test -- --testPathPattern=safetyFilter` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<relevant pattern>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite + `npm run typecheck` must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 80-01-01 | 01 | 0 | FOUND-04 | unit | `npm test -- --testPathPattern=migrations` | ❌ W0 | ⬜ pending |
| 80-01-02 | 01 | 0 | FOUND-05 | unit | `npm test -- --testPathPattern=NumberPad` | ❌ W0 | ⬜ pending |
| 80-01-03 | 01 | 0 | FOUND-06 | unit | `npm test -- --testPathPattern=answerTypes` | ❌ W0 | ⬜ pending |
| 80-01-04 | 01 | 0 | FOUND-07 | unit | `npm test -- --testPathPattern=MultiSelectMC` | ❌ W0 | ⬜ pending |
| 80-02-01 | 02 | 1 | FOUND-01 | unit+typecheck | `npm run typecheck && npm test -- --testPathPattern=mathEngine/types` | ✅ exists | ⬜ pending |
| 80-02-02 | 02 | 1 | FOUND-03 | unit | `npm test -- --testPathPattern=safetyFilter` | ✅ exists | ⬜ pending |
| 80-02-03 | 02 | 1 | FOUND-06 | unit | `npm test -- --testPathPattern=answerTypes` | ❌ W0 | ⬜ pending |
| 80-02-04 | 02 | 1 | FOUND-08 | unit | `npm test -- --testPathPattern=distractorGenerator` | ✅ exists | ⬜ pending |
| 80-03-01 | 03 | 2 | FOUND-02 | unit | `npm test -- --testPathPattern=safetyFilter` | ✅ exists | ⬜ pending |
| 80-03-02 | 03 | 2 | FOUND-01 | unit | `npm test -- --testPathPattern=bktCalculator` | ✅ exists | ⬜ pending |
| 80-03-03 | 03 | 2 | FOUND-04 | unit | `npm test -- --testPathPattern=migrations` | ❌ W0 | ⬜ pending |
| 80-03-04 | 03 | 2 | FOUND-08 | unit | `npm test -- --testPathPattern=distractorGenerator` | ✅ exists | ⬜ pending |
| 80-04-01 | 04 | 3 | FOUND-05 | unit | `npm test -- --testPathPattern=NumberPad` | ❌ W0 | ⬜ pending |
| 80-04-02 | 04 | 3 | FOUND-07 | unit | `npm test -- --testPathPattern=MultiSelectMC` | ❌ W0 | ⬜ pending |
| 80-05-01 | 05 | 4 | FOUND-09 | unit | `npm test -- --testPathPattern=ProfileCreationWizard` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/store/migrations.test.ts` — stubs for FOUND-04 (v21→v22 migration)
- [ ] `src/__tests__/components/session/NumberPad.test.tsx` — stubs for FOUND-05 (± key, maxDigits behavior)
- [ ] `src/__tests__/mathEngine/answerTypes.test.ts` — stubs for FOUND-06 (MultiSelectAnswer, setsEqual)
- [ ] `src/__tests__/components/session/MultiSelectMC.test.tsx` — stubs for FOUND-07 (checkbox, Check button, binary grading)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ± key displays correctly on device | FOUND-05 | Layout verification requires visual inspection | Open NumberPad on device/simulator, verify ± key appears in row 3 when `allowNegative=true` |
| MultiSelectMC checkbox feel | FOUND-07 | Touch target size and visual feedback require device | Tap options, verify check state toggles, verify Check button activates |
| ProfileCreationWizard grade 12 scroll | FOUND-09 | Scroll list rendering requires visual check | Create profile, scroll grade picker to grade 12, verify it renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
