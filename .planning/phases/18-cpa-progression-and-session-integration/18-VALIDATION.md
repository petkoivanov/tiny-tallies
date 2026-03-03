---
phase: 18
slug: cpa-progression-and-session-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-03
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo + React Native Testing Library |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=<pattern>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=<changed-file-pattern>`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green + `npm run typecheck`
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | SESS-02 | unit | `npm test -- --testPathPattern=useCpaMode` | ❌ W0 | ⬜ pending |
| 18-01-02 | 01 | 1 | CPA-02, CPA-03, CPA-04 | unit | `npm test -- --testPathPattern=CpaSessionContent` | ❌ W0 | ⬜ pending |
| 18-01-03 | 01 | 1 | SESS-01, SESS-03 | unit | `npm test -- --testPathPattern=ManipulativePanel` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 1 | CPA-05 | unit | `npm test -- --testPathPattern=ResultsScreen` | ✅ partial | ⬜ pending |
| 18-02-02 | 02 | 1 | n/a | unit | `npm test -- --testPathPattern=CompactAnswerRow` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/session/useCpaMode.test.ts` — stubs for SESS-02
- [ ] `src/components/session/CpaSessionContent.test.tsx` — stubs for CPA-02, CPA-03, CPA-04
- [ ] `src/components/session/ManipulativePanel.test.tsx` — stubs for SESS-01, SESS-03
- [ ] `src/components/session/CompactAnswerRow.test.tsx` — stubs for answer layout
- [ ] Update `src/__tests__/screens/ResultsScreen.test.tsx` — add CPA-05 stubs

*Existing infrastructure covers framework installation. Only test file stubs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Panel slide animation feels smooth | SESS-03 | Visual timing/feel | Expand/collapse panel 5x, check for jank |
| Pictorial SVGs render correctly | CPA-03 | Visual correctness | View each manipulative type in pictorial mode |
| Correct manipulative shown per skill | SESS-02 | Integration verification | Complete problems across different skills, verify correct manipulative |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
