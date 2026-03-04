---
phase: 22
slug: safety-compliance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + jest-expo (React Native Testing Library) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=safety` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=safety`
- **After every plan wave:** Run `npm test && npm run typecheck`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 01 | 1 | LLM-03, SAFE-03 | unit | `npm test -- --testPathPattern=safetyConstants\|promptTemplates` | Partially | ⬜ pending |
| 22-01-02 | 01 | 1 | SAFE-01, SAFE-02, SAFE-04, SAFE-05 | unit | `npm test -- --testPathPattern=safetyFilter\|safetyConstants` | ❌ W0 | ⬜ pending |
| 22-02-01 | 02 | 1 | SAFE-06 | unit | `npm test -- --testPathPattern=useTutor\|childProfile` | Partially | ⬜ pending |
| 22-02-02 | 02 | 1 | LLM-03 | unit | `npm test -- --testPathPattern=geminiClient\|useTutor` | Partially | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/tutor/__tests__/safetyFilter.test.ts` — stubs for SAFE-01, SAFE-02, SAFE-04
- [ ] `src/services/tutor/__tests__/safetyConstants.test.ts` — stubs for LLM-03 (safety settings), SAFE-03, SAFE-05
- [ ] Update `src/hooks/__tests__/useTutor.test.ts` — covers SAFE-06 consent gate

*Existing infrastructure covers framework and config; new test files needed for safety modules.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live Gemini safety block response | SAFE-03 | Requires real API call with blocked content | Send a known-bad prompt via Expo dev build, verify safety block is caught and fallback shown |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
