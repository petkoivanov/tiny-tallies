---
phase: 83
slug: coordinate-geometry-domain
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 83 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo preset) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=coordinateGeometry` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds (quick) / ~90 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=coordinateGeometry`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 83-01-01 | 01 | 0 | COORD-01 | unit | `npm test -- --testPathPattern="coordinateGeometry\|domainHandlerRegistry\|prerequisiteGating"` | ❌ W0 | ⬜ pending |
| 83-02-01 | 02 | 1 | COORD-01 | unit | `npm run typecheck 2>&1 \| grep -c "error" \|\| echo "0 errors"` | ✅ | ⬜ pending |
| 83-02-02 | 02 | 1 | COORD-01,02 | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ W0 | ⬜ pending |
| 83-02-03 | 02 | 1 | COORD-01,02 | unit | `npm test -- --testPathPattern="coordinateGeometry\|domainHandlerRegistry" 2>&1 \| tail -20` | ✅ | ⬜ pending |
| 83-03-01 | 03 | 2 | COORD-03 | unit | `npm test -- --testPathPattern=wordProblems` | ✅ | ⬜ pending |
| 83-03-02 | 03 | 2 | COORD-04 | manual | `npm test -- --testPathPattern="coordinateGeometry\|domainHandlerRegistry\|wordProblems"` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/mathEngine/coordinateGeometry.test.ts` — RED test stubs for COORD-01 through COORD-04
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — update skill count (159→165)
- [ ] Update `src/__tests__/mathEngine/prerequisiteGating.test.ts` — fix pre-existing count discrepancy (151→165)

*Existing jest infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AI tutor hints guide toward formula without revealing substitution | COORD-04 | LLM output quality — automated test verifies prompt template only | Trigger a slope problem, request hints, verify none say "substitute x1=2, y1=5" directly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
