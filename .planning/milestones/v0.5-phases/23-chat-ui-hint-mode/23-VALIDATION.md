---
phase: 23
slug: chat-ui-hint-mode
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + jest-expo + @testing-library/react-native v13.3.3 |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern=chat` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=chat`
- **After every plan wave:** Run `npm test && npm run typecheck`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | CHAT-02 | unit | `npm test -- --testPathPattern=ChatBubble\|TypingIndicator` | ❌ W0 | ⬜ pending |
| 23-01-02 | 01 | 1 | CHAT-03 | unit | `npm test -- --testPathPattern=ResponseButtons` | ❌ W0 | ⬜ pending |
| 23-02-01 | 02 | 2 | CHAT-02, CHAT-05 | unit | `npm test -- --testPathPattern=ChatPanel` | ❌ W0 | ⬜ pending |
| 23-02-02 | 02 | 2 | CHAT-01 | unit | `npm test -- --testPathPattern=HelpButton` | ❌ W0 | ⬜ pending |
| 23-03-01 | 03 | 3 | CHAT-04, MODE-01 | unit | `npm test -- --testPathPattern=SessionScreen\|useTutor` | Partially | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/chat/__tests__/ChatBubble.test.tsx` — stubs for CHAT-02
- [ ] `src/components/chat/__tests__/TypingIndicator.test.tsx` — stubs for CHAT-02 loading
- [ ] `src/components/chat/__tests__/ResponseButtons.test.tsx` — stubs for CHAT-03
- [ ] `src/components/chat/__tests__/ChatPanel.test.tsx` — stubs for CHAT-02, CHAT-05
- [ ] `src/components/chat/__tests__/HelpButton.test.tsx` — stubs for CHAT-01

*Existing infrastructure covers framework and config; NetInfo mock already in jest.setup.js.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bottom sheet animation smoothness | CHAT-02 | Reanimated animations mocked in tests | Open chat on device, verify 60fps slide-up/down |
| Help button pulse after wrong answer | CHAT-01 | Reanimated animations mocked | Get wrong answer, verify subtle pulse on help button |
| Chat auto-scroll to latest message | CHAT-02 | ScrollView behavior hard to test in JSDOM | Chat with 5+ messages, verify auto-scroll |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
