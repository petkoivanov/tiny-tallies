---
status: testing
phase: 28-session-mix-adaptation
source: 28-01-SUMMARY.md
started: 2026-03-04T21:00:00Z
updated: 2026-03-04T21:00:00Z
---

## Current Test

number: 2
name: Remediation replaces review slots, not new or challenge
expected: |
  Start a practice session with confirmed misconceptions present. The session should still contain new-skill problems and challenge problems alongside remediation ones. The total practice count remains 9 — remediation takes from the review allocation, not from new or challenge.
awaiting: user response

## Tests

### 1. Remediation problems appear for confirmed misconceptions
expected: Start a practice session when the child has at least one confirmed misconception. The practice segment should include a remediation problem targeting the misconception's skill. Verify by checking session queue composition or observing that the misconception skill appears in practice.
result: pass

### 2. Remediation replaces review slots, not new or challenge
expected: Start a practice session with confirmed misconceptions present. The session should still contain new-skill problems and challenge problems alongside remediation ones. The total practice count remains 9 — remediation takes from the review allocation, not from new or challenge.
result: [pending]

### 3. No misconceptions produces standard session
expected: Start a practice session with zero confirmed misconceptions in the store. The session should be the standard 60/30/10 mix (review/new/challenge) with no 'remediation' category problems. Behavior is identical to before Phase 28.
result: [pending]

### 4. Remediation capped at 3 per session
expected: If the child has more than 3 confirmed misconception skills, only 3 remediation problems appear in the practice segment. The remaining misconception skills are not given remediation slots in this session.
result: [pending]

### 5. Backward compatibility — existing tests pass
expected: Run `npm test` — all 1,103 tests pass with zero regressions. No existing behavior is broken by the remediation injection changes.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps

[none yet]
