---
phase: 21
slug: llm-service-store
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + jest-expo + React Native Testing Library |
| **Config file** | jest.config.js |
| **Quick run command** | `npm test -- --testPathPattern=tutor` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=tutor`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | LLM-01, STATE-01, STATE-02, STATE-03 | unit | `npm test -- --testPathPattern=tutorSlice` | ❌ W0 | ⬜ pending |
| 21-02-01 | 02 | 1 | LLM-02 | unit | `npm test -- --testPathPattern=promptTemplates` | ❌ W0 | ⬜ pending |
| 21-02-02 | 02 | 1 | LLM-01, LLM-04 | unit | `npm test -- --testPathPattern=geminiClient` | ❌ W0 | ⬜ pending |
| 21-02-03 | 02 | 1 | LLM-05 | unit | `npm test -- --testPathPattern=rateLimiter` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/tutor/__tests__/tutorSlice.test.ts` — stubs for STATE-01, STATE-02, STATE-03
- [ ] `src/services/tutor/__tests__/promptTemplates.test.ts` — stubs for LLM-02
- [ ] `src/services/tutor/__tests__/geminiClient.test.ts` — stubs for LLM-01, LLM-04
- [ ] `src/services/tutor/__tests__/rateLimiter.test.ts` — stubs for LLM-05

*Existing jest infrastructure covers all framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Gemini API returns valid response | LLM-01 | Requires live API key | Set key in secure store, call sendTutorMessage, verify response |
| AbortController cancels in-flight request | LLM-04 | Network timing dependent | Start request, immediately abort, verify no response received |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
