---
phase: 081-youtube-video-tutor
plan: 01
subsystem: video
tags: [react-native-webview, react-native-youtube-iframe, zustand, store-migration, video, tutor]

# Dependency graph
requires:
  - phase: 080-foundation
    provides: K-12 type system, v22 store migration, MathDomain type with 18 values

provides:
  - react-native-webview and react-native-youtube-iframe installed (Expo SDK 54 compatible)
  - src/services/video/videoMap.ts: MathDomain->YouTube video ID lookup (all 18 domains)
  - tutorSlice extended with videoVotes state and setVideoVote action
  - childProfileSlice extended with youtubeConsentGranted (default false) and setYoutubeConsentGranted
  - ChildData interface, CHILD_DATA_KEYS, DEFAULT_CHILD_DATA updated with both new fields
  - v22->v23 store migration (youtubeConsentGranted, videoVotes)
  - Wave 0 test stubs (videoMap.test.ts, tutorSlice.video.test.ts) — all GREEN

affects:
  - 081-02 (VideoPlayerModal component depends on videoMap and consent field)
  - 081-03 (VideoButton in SessionScreen depends on videoMap and vote action)
  - 081-04 (ParentalControls toggle for youtubeConsentGranted)
  - 082-090 (HS domain phases will add video IDs to videoMap)

# Tech tracking
tech-stack:
  added:
    - react-native-webview@13.15.0 (via expo install — SDK 54 verified)
    - react-native-youtube-iframe@^2.4.1 (npm direct — not in Expo packages list)
  patterns:
    - videoMap is a module constant (not a store slice) — video IDs updated via OTA release, not Zustand migration
    - youtubeConsentGranted defaults false (explicit parent opt-in required, unlike tutorConsentGranted which defaults true)
    - videoVotes NOT included in resetProblemTutor or resetSessionTutor — votes persist across all sessions

key-files:
  created:
    - src/services/video/videoMap.ts
    - src/__tests__/services/video/videoMap.test.ts
    - src/__tests__/store/tutorSlice.video.test.ts
  modified:
    - src/store/slices/tutorSlice.ts
    - src/store/slices/childProfileSlice.ts
    - src/store/helpers/childDataHelpers.ts
    - src/store/appStore.ts
    - src/store/migrations.ts
    - src/__tests__/store/childDataHelpers.test.ts
    - src/__tests__/appStore.test.ts
    - package.json

key-decisions:
  - "videoMap.ts is a module constant (not a store slice) — video IDs updated via OTA release, not Zustand migration (pre-existing decision from Phase 80, confirmed here)"
  - "youtubeConsentGranted defaults false — explicit parent opt-in required for child safety/COPPA compliance; contrasts with tutorConsentGranted which defaults true"
  - "videoVotes persists across problems and sessions — excluded from both resetProblemTutor and resetSessionTutor"
  - "react-native-youtube-iframe installed via npm (not expo install) because it is not in Expo's verified packages list"

patterns-established:
  - "Video ID map pattern: Partial<Record<MathDomain, string>> allows HS domains to be undefined until phases 82-90 land"
  - "Wave 0 test stubs committed RED (failing) in Task 1, turned GREEN in Task 2 — provides immediate automated feedback for dependent work"

requirements-completed: [VIDEO-01, VIDEO-04, VIDEO-05, VIDEO-06]

# Metrics
duration: 7min
completed: 2026-03-13
---

# Phase 081 Plan 01: YouTube Video Tutor Foundation Summary

**Installed react-native-webview + react-native-youtube-iframe, created videoMap covering all 18 MathDomain values, extended Zustand store with videoVotes and youtubeConsentGranted, and bumped store to v23 with migration**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T13:11:38Z
- **Completed:** 2026-03-13T13:18:39Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Installed both video libraries (react-native-webview via expo install for SDK 54 verification, react-native-youtube-iframe via npm)
- Created videoMap.ts covering all 18 existing MathDomain values with curated Khan Academy video IDs; HS domain comments stub out phases 82-90
- Extended tutorSlice with videoVotes (persists forever, not reset per problem/session) and childProfileSlice with youtubeConsentGranted (default false for COPPA safety)
- Bumped STORE_VERSION 22 -> 23 with migration block that safely initializes both new fields on existing user data
- Wave 0 test stubs created RED in Task 1, turned GREEN in Task 2 — 5/5 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Install libraries and create Wave 0 test stubs** - `3d1c5f2` (chore)
2. **Task 2: videoMap.ts + store extensions** - `90da20c` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/services/video/videoMap.ts` - MathDomain to YouTube video ID map (18 domains, HS stubs commented)
- `src/store/slices/tutorSlice.ts` - Added videoVotes: {} and setVideoVote action
- `src/store/slices/childProfileSlice.ts` - Added youtubeConsentGranted: false and setYoutubeConsentGranted
- `src/store/helpers/childDataHelpers.ts` - Added both new fields to ChildData, CHILD_DATA_KEYS, DEFAULT_CHILD_DATA
- `src/store/appStore.ts` - STORE_VERSION bumped 22 -> 23
- `src/store/migrations.ts` - Added `if (version < 23)` migration block; fast-path guard updated to >= 23
- `src/__tests__/services/video/videoMap.test.ts` - Wave 0 stub covering all 18 domains (GREEN)
- `src/__tests__/store/tutorSlice.video.test.ts` - Wave 0 stub for videoVotes state/action (GREEN)
- `src/__tests__/store/childDataHelpers.test.ts` - Updated key count 32->34, added new fields to mock
- `src/__tests__/appStore.test.ts` - Updated STORE_VERSION assertion 22->23
- `package.json` - Added react-native-webview and react-native-youtube-iframe

## Decisions Made

- videoMap.ts is a module constant, not a Zustand store slice — video IDs are stable content, updated via OTA release, no migration needed per prior STATE.md decision
- youtubeConsentGranted defaults `false` (not `true` like tutorConsentGranted) — YouTube playback requires explicit parent opt-in for COPPA compliance
- videoVotes excluded from resetProblemTutor and resetSessionTutor — child's feedback on video quality should persist for analytics
- react-native-youtube-iframe installed via `npm install` (not `expo install`) because it is not in Expo's SDK 54 verified packages list

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated childDataHelpers.test.ts key count and mock state**
- **Found during:** Task 2 (store extensions)
- **Issue:** Test asserted `CHILD_DATA_KEYS.toHaveLength(32)` and `EXPECTED_PARTIALIZE_KEYS` did not include the two new fields — test failure after adding keys to CHILD_DATA_KEYS
- **Fix:** Updated count 32->34, added `youtubeConsentGranted` and `videoVotes` to EXPECTED_PARTIALIZE_KEYS and mock AppState, added `setYoutubeConsentGranted` mock function
- **Files modified:** `src/__tests__/store/childDataHelpers.test.ts`
- **Verification:** 14/14 childDataHelpers tests pass
- **Committed in:** `90da20c` (Task 2 commit)

**2. [Rule 1 - Bug] Updated appStore.test.ts STORE_VERSION assertion**
- **Found during:** Task 2 (STORE_VERSION bump)
- **Issue:** Test asserted `STORE_VERSION === 22`; bumping to 23 broke the assertion
- **Fix:** Updated assertion to `toBe(23)`
- **Files modified:** `src/__tests__/appStore.test.ts`
- **Verification:** Full appStore test suite passes
- **Committed in:** `90da20c` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — test assertions tracking schema version)
**Impact on plan:** Both fixes necessary to keep test suite honest about schema state. No scope creep.

## Issues Encountered

None — plan executed cleanly. The `npx expo install` eslint peer dependency warnings are pre-existing project-level noise and do not affect builds or tests.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- videoMap lookup ready for VideoPlayerModal (081-02) and VideoButton (081-03)
- Store fields (videoVotes, youtubeConsentGranted) ready for UI components and ParentalControls toggle (081-04)
- Both new fields will be correctly initialized on first run for existing users via v23 migration
- Concern: react-native-youtube-iframe New Architecture compatibility not yet verified on real device — proof-of-concept test recommended early in Phase 81 (noted in STATE.md blockers)

---
*Phase: 081-youtube-video-tutor*
*Completed: 2026-03-13*
