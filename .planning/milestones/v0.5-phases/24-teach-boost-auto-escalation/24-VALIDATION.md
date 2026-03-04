---
phase: 24
slug: teach-boost-auto-escalation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo + @testing-library/react-native |
| **Config file** | `jest.config.js` (existing) |
| **Quick run command** | `npm test -- --testPathPattern=<pattern>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<changed_module>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 1 | MODE-05 | unit | `npm test -- --testPathPattern=escalationEngine` | ❌ W0 | ⬜ pending |
| 24-01-02 | 01 | 1 | MODE-06 | unit | `npm test -- --testPathPattern=bugLookup` | ❌ W0 | ⬜ pending |
| 24-01-03 | 01 | 1 | MODE-02 | unit | `npm test -- --testPathPattern=promptTemplates` | ✅ (extend) | ⬜ pending |
| 24-01-04 | 01 | 1 | MODE-04 | unit | `npm test -- --testPathPattern=promptTemplates` | ✅ (extend) | ⬜ pending |
| 24-02-01 | 02 | 2 | MODE-02, MODE-03 | unit | `npm test -- --testPathPattern=useTutor` | ✅ (extend) | ⬜ pending |
| 24-02-02 | 02 | 2 | MODE-04 | unit | `npm test -- --testPathPattern=CpaSessionContent` | ✅ (extend) | ⬜ pending |
| 24-02-03 | 02 | 2 | MODE-05 | unit | `npm test -- --testPathPattern=tutorSlice` | ✅ (extend) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/tutor/__tests__/escalationEngine.test.ts` — stubs for MODE-05 (escalation state machine)
- [ ] `src/services/tutor/__tests__/bugLookup.test.ts` — stubs for MODE-06 (bug description lookup)
- [ ] Extend `src/services/tutor/__tests__/promptTemplates.test.ts` — covers MODE-02 (TEACH prompt), MODE-04 (BOOST prompt)
- [ ] Extend `src/__tests__/store/tutorSlice.test.ts` — covers wrongAnswerCount field + incrementWrongAnswerCount

*Existing infrastructure covers framework setup. Only new test files and test case extensions needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ManipulativePanel auto-expands in TEACH mode | MODE-03 | Requires visual Reanimated animation on device | 1. Start session 2. Get 2 hints + wrong answer 3. Verify panel slides open with correct manipulative |
| Chat minimizes to floating banner | MODE-03 | Visual layout coordination | 1. Trigger TEACH mode 2. Verify chat shrinks to banner 3. Tap banner to re-expand |
| Answer highlight in BOOST mode | MODE-04 | Visual styling verification | 1. Trigger BOOST mode 2. Verify correct answer glows/highlights in grid |
| Gentle mode transition message | MODE-05 | LLM response quality | 1. Trigger HINT→TEACH 2. Verify tutor says transition message before teaching |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
