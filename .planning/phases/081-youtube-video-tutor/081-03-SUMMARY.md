---
phase: 081-youtube-video-tutor
plan: "03"
subsystem: chat-ui
tags: [youtube, video, chat-panel, orchestration, session-screen]
dependency_graph:
  requires: [081-01, 081-02]
  provides: [VIDEO-02, VIDEO-03, VIDEO-05]
  affects: [ChatPanel, useChatOrchestration, SessionScreen]
tech_stack:
  added: []
  patterns: [conditional-rendering, prop-threading, tdd-red-green]
key_files:
  created:
    - src/__tests__/components/chat/ChatPanel.video.test.tsx
  modified:
    - src/hooks/useChatOrchestration.ts
    - src/__tests__/hooks/useChatOrchestration.test.ts
    - src/components/chat/ChatPanel.tsx
    - src/screens/SessionScreen.tsx
decisions:
  - showVideoSection requires all four conditions — ladderExhausted, youtubeConsentGranted, isOnline, and valid videoId — enforcing explicit parent opt-in and network gating
  - Video props are all optional on ChatPanelProps to avoid breaking existing render sites
  - videoOpen and voteDone are local ChatPanel state (not store) — transient UI state, not persisted
metrics:
  duration_seconds: 273
  completed_date: "2026-03-13"
  tasks_completed: 3
  files_modified: 5
---

# Phase 81 Plan 03: ChatPanel Video Section Wiring Summary

ChatPanel extended with conditional video section (Watch a video button, inline VideoPlayer, VideoVoteButtons) wired all the way from store selectors through useChatOrchestration and SessionScreen into the chat UI surface.

## Tasks Completed

### Task 1: Extend useChatOrchestration to supply video props
- Added `youtubeConsentGranted`, `videoVotes`, `setVideoVote` store reads after existing `tutorConsentGranted` line
- Derived `currentDomain` from `currentProblem?.problem.operation ?? null`
- Extended `ChatOrchestrationReturn` interface with four new typed fields
- Updated test mock store to include new fields (additive — no existing assertions changed)
- Commit: `3796090`

### Task 2: Extend ChatPanel with video section and write ChatPanel.video tests
- **TDD RED**: wrote 8 failing tests covering 4 visibility conditions + interactions
- **TDD GREEN**: added new optional props to ChatPanelProps, local state (videoOpen/voteDone), showVideoSection derivation, video section JSX, and styles
- ChatPanel imports VideoPlayer, VideoVoteButtons, videoMap, MathDomain
- File stays at 344 lines (under 500-line guardrail)
- Commit: `d52eb2f`

### Task 3: Wire video props through SessionScreen
- Destructured `youtubeConsentGranted`, `videoVotes`, `setVideoVote`, `currentDomain` from useChatOrchestration
- Passed `ladderExhausted={tutor.ladderExhausted}` and all four video props to ChatPanel
- Feature is now reachable in production
- Commit: `5de27a1`

## Verification Results

- All 34 tests pass (8 ChatPanel.video + 26 useChatOrchestration)
- `npm run typecheck` clean
- `chat-watch-video-button` testID present in ChatPanel.tsx
- `ladderExhausted` prop used in ChatPanel.tsx
- `VideoPlayer` imported and used in ChatPanel.tsx
- `ladderExhausted` wired in SessionScreen.tsx
- `youtubeConsentGranted` wired in SessionScreen.tsx
- ChatPanel.tsx: 344 lines (under 500)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files verified:
- `src/hooks/useChatOrchestration.ts` — FOUND
- `src/__tests__/hooks/useChatOrchestration.test.ts` — FOUND
- `src/components/chat/ChatPanel.tsx` — FOUND
- `src/__tests__/components/chat/ChatPanel.video.test.tsx` — FOUND
- `src/screens/SessionScreen.tsx` — FOUND

Commits verified:
- `3796090` — FOUND (feat(081-03): extend useChatOrchestration)
- `d52eb2f` — FOUND (feat(081-03): extend ChatPanel)
- `5de27a1` — FOUND (feat(081-03): wire video props in SessionScreen)
