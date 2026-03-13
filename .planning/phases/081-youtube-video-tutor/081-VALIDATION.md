---
phase: 81
slug: youtube-video-tutor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 81 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + jest-expo |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npm test -- --testPathPattern=videoMap` |
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
| 81-01-01 | 01 | 0 | VIDEO-01 | manual PoC | `npx expo start` + device check | N/A | ⬜ pending |
| 81-01-02 | 01 | 0 | VIDEO-04 | unit | `npm test -- --testPathPattern=videoMap` | ❌ W0 | ⬜ pending |
| 81-01-03 | 01 | 0 | VIDEO-05 | unit | `npm test -- --testPathPattern=tutorSlice` | ✅ exists | ⬜ pending |
| 81-01-04 | 01 | 0 | VIDEO-06 | unit | `npm test -- --testPathPattern=childProfileSlice` | ✅ exists | ⬜ pending |
| 81-02-01 | 02 | 2 | VIDEO-04 | unit | `npm test -- --testPathPattern=videoMap` | ❌ W0 | ⬜ pending |
| 81-02-02 | 02 | 2 | VIDEO-05 | unit | `npm test -- --testPathPattern=tutorSlice` | ✅ exists | ⬜ pending |
| 81-02-03 | 02 | 2 | VIDEO-06 | unit | `npm test -- --testPathPattern=childProfileSlice` | ✅ exists | ⬜ pending |
| 81-03-01 | 03 | 3 | VIDEO-02 | unit | `npm test -- --testPathPattern=ChatPanel` | ✅ exists | ⬜ pending |
| 81-03-02 | 03 | 3 | VIDEO-03 | unit | `npm test -- --testPathPattern=YoutubePlayer` | ❌ W0 | ⬜ pending |
| 81-04-01 | 04 | 4 | VIDEO-06 | unit | `npm test -- --testPathPattern=ParentalControls` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/services/tutor/videoMap.test.ts` — stubs for VIDEO-04 (domain→videoId map coverage)
- [ ] `src/__tests__/components/session/YoutubePlayer.test.tsx` — stubs for VIDEO-03 (nocookie URL, offline message)
- [ ] Manual PoC task — VIDEO-01: install library, verify on real device before proceeding

*Existing infrastructure covers: tutorSlice tests, childProfileSlice tests, ChatPanel tests, ParentalControls tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| YouTube player renders inline on real device | VIDEO-01, VIDEO-03 | New Architecture compatibility unverified; requires device | Install on device, exhaust hint ladder, tap "Watch a video", verify player loads |
| youtube-nocookie.com domain used | VIDEO-03 | Network inspection required | Use Charles Proxy or Expo dev network tab to confirm domain |
| No related videos after playback | VIDEO-03 | Visual inspection required | Watch a video to completion, verify no related videos grid appears |
| Offline graceful message | VIDEO-03 | Requires network toggle | Disable WiFi, tap "Watch a video", verify graceful message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
