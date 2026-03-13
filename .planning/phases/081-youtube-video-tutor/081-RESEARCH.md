# Phase 81: YouTube Video Tutor - Research

**Researched:** 2026-03-13
**Domain:** React Native YouTube embedding, COPPA compliance, Zustand state extension, WebView integration
**Confidence:** MEDIUM-HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIDEO-01 | `react-native-youtube-iframe` + `react-native-webview` installed and working in Expo managed workflow build | Library installation via `npx expo install`, webview compatibility confirmed for Expo SDK 54 |
| VIDEO-02 | "Watch a video" button appears in ChatPanel after hint ladder is exhausted (BOOST mode complete) — triggered by `ladderExhausted` signal from useTutor | `ladderExhausted` already exposed from `useTutor` return value; ChatPanel props need extension |
| VIDEO-03 | Tapping "Watch a video" opens an inline YouTube player using youtube-nocookie.com for COPPA compliance | Custom HTML template via `useLocalHTML` prop is the correct approach since the library has no built-in nocookie option |
| VIDEO-04 | Static `videoMap.ts` curated lookup: `MathDomain → YouTube video ID` for all 27 domains (18 existing + 9 new), sourced from Khan Academy YouTube channel | `MathDomain` type has 18 existing values; 9 HS domains added by later phases; map initialized with all 27 keys |
| VIDEO-05 | Post-video vote: "Was this helpful?" with thumbs up/down buttons; vote stored per domain in tutorSlice | tutorSlice extension with `videoVotes: Record<MathDomain, 'helpful' | 'not_helpful'>` + store migration v22→v23 |
| VIDEO-06 | COPPA parental consent gate for YouTube — separate from AI tutor consent; stored in parental controls | `childProfileSlice` already holds `tutorConsentGranted`; new `youtubeConsentGranted: boolean` field follows same pattern |
</phase_requirements>

---

## Summary

Phase 81 adds an inline YouTube video player that appears in ChatPanel as a last resort after the AI hint ladder is fully exhausted (BOOST mode complete, `ladderExhausted === true`). The feature has three gating layers: network connectivity check, a separate YouTube parental consent gate (distinct from the AI tutor consent already in the app), and a `videoMap.ts` lookup that maps each `MathDomain` to a curated Khan Academy video ID.

The core library is `react-native-youtube-iframe` v2.4.1, which wraps a WebView with the YouTube IFrame API. It does not have a built-in `nocookie` option, so COPPA compliance requires serving a custom HTML template via `useLocalHTML={true}` where the embed URL uses `youtube-nocookie.com` as the domain. The `react-native-webview` package is already Expo-compatible and supports the New Architecture (Fabric) in SDK 54, making VIDEO-01 straightforward with `npx expo install`.

The most critical architectural risk flagged in STATE.md is New Architecture compatibility of `react-native-youtube-iframe` itself — the library was last published July 2023 (v2.4.1) and has no documented New Architecture verification. Expo SDK 54 still supports the Old Architecture (it is the last SDK that does), so the library can operate in Old Architecture mode if needed. A proof-of-concept test on a real device early in Wave 0 is mandatory before committing to this library.

**Primary recommendation:** Use `react-native-youtube-iframe` with `useLocalHTML={true}` and a bundled custom HTML template that replaces `www.youtube.com` with `www.youtube-nocookie.com` and sets `rel=0`. Fallback gracefully when the library fails to load using the standard offline/error pattern already established in ChatPanel.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native-youtube-iframe` | ^2.4.1 | YouTube IFrame API wrapper | Only maintained RN YouTube embed library; Expo-compatible; uses WebView internally |
| `react-native-webview` | `npx expo install` resolves | WebView host for the YouTube iframe | Included in Expo Go; supports New Architecture (Fabric); already required by youtube-iframe |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@react-native-community/netinfo` | ^11.4.1 (already installed) | Offline detection before rendering player | Show offline message instead of blank/failed player |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-native-youtube-iframe` | Raw WebView + custom HTML | More control over nocookie, but must reimplement entire IFrame API messaging layer |
| `react-native-youtube-iframe` | `react-native-youtube-bridge` | Newer alternative, less battle-tested, smaller community |

**Installation:**
```bash
npx expo install react-native-webview
npm install react-native-youtube-iframe
```

Note: `react-native-webview` must be installed via `npx expo install` (not `npm install`) to get the Expo-verified version. `react-native-youtube-iframe` is not in the Expo packages list, so use `npm install` directly.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── chat/
│       ├── ChatPanel.tsx              # Add ladderExhausted + video consent props
│       ├── VideoPlayer.tsx            # NEW: inline YouTube player component
│       └── VideoVoteButtons.tsx       # NEW: post-video thumbs up/down
├── services/
│   └── video/
│       └── videoMap.ts                # NEW: MathDomain → YouTube video ID lookup
├── store/
│   └── slices/
│       └── tutorSlice.ts              # EXTEND: videoVotes: Record<MathDomain, vote>
└── screens/
    └── ParentalControlsScreen.tsx     # EXTEND: YouTube consent section
```

### Pattern 1: Custom HTML Template for youtube-nocookie.com

**What:** The library's `useLocalHTML={true}` prop makes it load the IFrame player from a locally bundled HTML string instead of fetching from `lonelycpp.github.io`. This HTML string can be customized to use `youtube-nocookie.com`.

**When to use:** Always — this is the only way to ensure COPPA compliance with youtube-nocookie.com using this library.

**Example:**
```typescript
// src/services/video/youtubeHtml.ts
// Source: react-native-youtube-iframe docs (baseUrlOverride/useLocalHTML pattern)
// The library's getYoutubeIframe export accepts a custom HTML template.
// We intercept the src URL to swap in youtube-nocookie.com.
export function buildNocookieHtml(videoId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1"
    allow="autoplay; encrypted-media"
    allowfullscreen>
  </iframe>
</body>
</html>
`;
}
```

**Note:** Because this is a pure WebView with inline HTML rather than the IFrame JS API, the `onChangeState`/`onReady` callbacks from the library will not fire. Video end detection for showing the vote UI requires polling the WebView navigation state or using a simpler approach: show the vote UI after a fixed duration or via a "Done watching" button.

### Pattern 2: Alternative — Library's useLocalHTML with src replacement

The library's own `useLocalHTML` prop serves the bundled `iframe.html` but still points to `youtube.com`. The cleanest approach that preserves library callbacks is to use `webViewProps` with `source={{ html: customHtml }}` directly on a plain `WebView` component, bypassing the library's callback plumbing (which isn't needed for this read-only video use case).

**When to use:** When the library's IFrame API messaging is not needed (this phase — we only need play/end detection, which can be done with a "Done watching" button).

```typescript
// VideoPlayer.tsx — plain WebView approach (simpler, more control)
import WebView from 'react-native-webview';

interface VideoPlayerProps {
  videoId: string;
  onDone: () => void;
}

export function VideoPlayer({ videoId, onDone }: VideoPlayerProps) {
  const html = buildNocookieHtml(videoId);
  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        style={styles.player}
      />
      <Pressable onPress={onDone} style={styles.doneButton}>
        <Text>Done watching</Text>
      </Pressable>
    </View>
  );
}
```

### Pattern 3: ladderExhausted Signal Integration

`useTutor` already computes and returns `ladderExhausted: boolean`. ChatPanel must receive this as a new prop and the parent (SessionScreen / useChatOrchestration) must pass it down.

```typescript
// ChatPanel.tsx — extend props interface
interface ChatPanelProps {
  // ... existing props
  ladderExhausted: boolean;
  youtubeConsentGranted: boolean;
  currentDomain: MathDomain | null;
  videoVotes: Record<string, 'helpful' | 'not_helpful'>;
  onVideoVote: (domain: MathDomain, vote: 'helpful' | 'not_helpful') => void;
}
```

The "Watch a video" button renders only when:
- `ladderExhausted === true`
- `youtubeConsentGranted === true`
- `isOnline === true` (already tracked in ChatPanel)
- `currentDomain !== null` and `videoMap[currentDomain]` is defined

### Pattern 4: Parental Consent Gate (YouTube, separate from AI tutor)

Follows the exact same pattern as `tutorConsentGranted` in `childProfileSlice.ts`:

```typescript
// childProfileSlice.ts extension
youtubeConsentGranted: boolean;          // new field, default: false
setYoutubeConsentGranted: (granted: boolean) => void;  // new action
```

**Default is `false`** — this is the critical difference from `tutorConsentGranted` (which defaults to `true`). YouTube consent must be explicitly granted by a parent before the video player ever renders.

ParentalControlsScreen gets a new "YouTube Videos" section with a `Switch`, matching the "AI Helper" section pattern exactly.

### Pattern 5: Video Vote State in tutorSlice

```typescript
// tutorSlice.ts extension
videoVotes: Record<string, 'helpful' | 'not_helpful'>;   // keyed by MathDomain string
setVideoVote: (domain: MathDomain, vote: 'helpful' | 'not_helpful') => void;
```

The key is `MathDomain` as string. This survives app restarts because it is part of the persisted child data (dehydrated/hydrated with the child profile).

**Store migration v22 → v23:** Add `videoVotes: {}` to the migration chain.

### Pattern 6: videoMap.ts Structure

```typescript
// src/services/video/videoMap.ts
import type { MathDomain } from '@/services/mathEngine/types';

/** Curated Khan Academy video IDs per math domain.
 *  IDs sourced from youtube.com/khanacademy — update via OTA, not store migration.
 *  undefined means no video available for that domain yet. */
export const videoMap: Partial<Record<MathDomain, string>> = {
  addition: 'AuX7nPBqDts',       // Khan Academy: Basic addition
  subtraction: 'Lxg0hUZrSP8',    // Placeholder — curate before ship
  multiplication: 'E9wIPIIFSGU',
  division: 'e_tY6X5PwWw',
  fractions: 'g6eSBX8OgvM',
  place_value: 'YlmwDkpEoB8',
  time: '5q0o2BKYVEY',
  money: 'W3Z4vNPiHmU',
  patterns: 'placeholder',
  measurement: 'placeholder',
  ratios: 'placeholder',
  exponents: 'placeholder',
  expressions: 'placeholder',
  geometry: 'placeholder',
  probability: 'placeholder',
  number_theory: 'placeholder',
  basic_graphs: 'placeholder',
  data_analysis: 'placeholder',
  // HS domains — to be populated when phases 82-90 land
  // linear_equations: undefined,
  // coordinate_geometry: undefined,
  // ...
};
```

**Note:** Video IDs must be manually curated by the developer before shipping. The research documents the pattern; actual IDs require a YouTube search session. The map uses `Partial<Record<MathDomain, string>>` so missing IDs cause the button to not render (no crash).

### Anti-Patterns to Avoid

- **Using `baseUrlOverride` with external hosting:** The library's default `baseUrlOverride` points to `lonelycpp.github.io` which times out in some environments (GitHub Issue #337). Never rely on external hosting for the iframe HTML.
- **Relying on `onChangeState` for video-end detection:** When using a plain WebView with inline HTML (the nocookie approach), the library's JS→RN messaging bridge is not active. Don't wait for a 'ended' state callback.
- **Rendering WebView while offline:** A blank/frozen WebView is a poor UX. Always gate on `isOnline` before rendering.
- **Persisting video IDs in Zustand:** Per STATE.md decision, `videoMap.ts` is a module constant, not a store slice. Video IDs are updated via OTA release, not store migration.
- **Bumping STORE_VERSION without migration:** Per CLAUDE.md guardrail, v22→v23 migration must add `videoVotes: {}`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube embedding | Custom JS↔RN messaging bridge | `react-native-youtube-iframe` or plain WebView with HTML | IFrame API postMessage protocol is complex |
| Offline detection | Custom network polling | `@react-native-community/netinfo` (already installed) | Platform-consistent, already wired in ChatPanel via `isOnline` prop |
| Consent UI pattern | New consent screen/flow | Extend `ParentalControlsScreen` with a Switch row | Exact same pattern as AI tutor consent |
| Video vote persistence | Local storage / AsyncStorage directly | Zustand tutorSlice extension | Follows established child-data persistence pattern |

**Key insight:** The offline detection and consent gating patterns are already proven in the codebase. Re-use them exactly.

---

## Common Pitfalls

### Pitfall 1: react-native-youtube-iframe New Architecture Compatibility (HIGH RISK)

**What goes wrong:** The library was last published July 2023. Expo SDK 54 with React Native 0.81 can run in either Old or New Architecture mode. The library may crash on New Architecture builds if its WebView bridge code uses deprecated bridge APIs.

**Why it happens:** Expo SDK 54 is the last version that allows disabling New Architecture. If the project's `app.json` has `"newArchEnabled": true` (common in SDK 53+), the library may fail.

**How to avoid:** Test on a real device (not Expo Go simulator) in Wave 0. If the library fails on New Architecture, add `"newArchEnabled": false` to `app.json` — this is explicitly supported in SDK 54. Document this decision.

**Warning signs:** Blank white screen where the player should be; `TypeError: Cannot read property 'injectJavaScript' of null` in logs.

### Pitfall 2: youtube-nocookie.com Domain Not Respected by iOS WebView

**What goes wrong:** iOS WebView's App Transport Security (ATS) may block `youtube-nocookie.com` if it is not in the allow list.

**Why it happens:** ATS requires HTTPS and may flag new domains not previously allowed.

**How to avoid:** Both `youtube.com` and `youtube-nocookie.com` are HTTPS, so ATS should allow them. However, add both to `NSAppTransportSecurity` exceptions in `app.json` if issues arise. In Expo managed workflow this is done via `expo.ios.infoPlist`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        }
      }
    }
  }
}
```

### Pitfall 3: Store Migration Version Conflict

**What goes wrong:** STORE_VERSION is currently 22 (set in Phase 80). Phase 81 adds `videoVotes` and `youtubeConsentGranted` to persisted data, requiring a v22→v23 migration.

**Why it happens:** Adding new fields to persisted slices without a migration leaves existing users with `undefined` values at runtime.

**How to avoid:** Bump `STORE_VERSION` to 23 in `appStore.ts` and add `if (version < 23)` block in `migrations.ts` that sets `state.videoVotes ??= {}` and `state.youtubeConsentGranted ??= false`. Both `childProfileSlice` and `tutorSlice` fields must be covered.

**Warning signs:** `videoVotes` is `undefined` (not `{}`) for users upgrading from v22.

### Pitfall 4: ChatPanel Props Interface Breaking Change

**What goes wrong:** ChatPanel currently takes a fixed set of props. Adding `ladderExhausted`, `youtubeConsentGranted`, `currentDomain`, and `videoVotes`/`onVideoVote` is a breaking change for every render site.

**Why it happens:** ChatPanel is rendered by `useChatOrchestration` (the hook used in SessionScreen). That hook must be updated to supply the new props.

**How to avoid:** Check `useChatOrchestration.ts` and every file that renders `ChatPanel`. Mark new props as optional with defaults where possible to minimize render-site changes.

### Pitfall 5: BaseUrlOverride Timeout (Issue #337)

**What goes wrong:** The default `baseUrlOverride` of the library fetches from `lonelycpp.github.io` — this external fetch times out in many network conditions, causing the player to hang.

**Why it happens:** The library fetches its HTML template from a GitHub Pages URL.

**How to avoid:** Always use `useLocalHTML={true}` — OR use the plain WebView approach with `source={{ html: buildNocookieHtml(videoId) }}`. Either avoids external fetching.

### Pitfall 6: Video IDs in videoMap.ts Pointing to Deleted Videos

**What goes wrong:** Khan Academy occasionally removes or relists YouTube videos. A hard-coded ID becomes a dead link.

**Why it happens:** YouTube video deletion is out of our control.

**How to avoid:** Use Khan Academy's official playlist IDs where possible (playlists are more stable). Handle `onError` from the player gracefully with a fallback message. All video IDs must be manually verified before each release.

---

## Code Examples

Verified patterns from official sources and project conventions:

### Consent field addition to childProfileSlice (follows existing pattern)
```typescript
// Source: src/store/slices/childProfileSlice.ts — line 27-28 (tutorConsentGranted pattern)
// New field in ChildProfileSlice interface:
youtubeConsentGranted: boolean;
setYoutubeConsentGranted: (granted: boolean) => void;

// In createChildProfileSlice factory:
youtubeConsentGranted: false,   // DEFAULT FALSE — explicit parent opt-in required
setYoutubeConsentGranted: (granted) => set({ youtubeConsentGranted: granted }),
```

### Migration v22 → v23
```typescript
// Source: src/store/migrations.ts — established pattern (line 191-198 for v22 reference)
if (version < 23) {
  // v22 -> v23: Add YouTube consent and video vote tracking
  state.youtubeConsentGranted ??= false;  // explicit parent opt-in required
  state.videoVotes ??= {};
}
```

### ladderExhausted signal (already in useTutor)
```typescript
// Source: src/hooks/useTutor.ts line 121-123 — already computed, just read it
const ladderExhausted =
  hintLadder !== null &&
  hintLadder.nextIndex >= hintLadder.hints.length;
// Exposed in UseTutorReturn interface (line 49)
```

### ChatPanel "Watch a video" button placement
```typescript
// Renders AFTER showResponseButtons section, before closing </Animated.View>
// Condition: ladderExhausted && youtubeConsentGranted && isOnline && videoId != null
{ladderExhausted && youtubeConsentGranted && isOnline && videoId && (
  <View style={styles.footer}>
    <Pressable
      onPress={onWatchVideo}
      style={styles.watchVideoButton}
      accessibilityRole="button"
      testID="chat-watch-video-button"
    >
      <Text style={styles.watchVideoText}>Watch a video</Text>
    </Pressable>
  </View>
)}
```

### Post-video vote UI
```typescript
// VideoVoteButtons.tsx
interface VideoVoteButtonsProps {
  domain: MathDomain;
  existingVote: 'helpful' | 'not_helpful' | undefined;
  onVote: (vote: 'helpful' | 'not_helpful') => void;
}
// testIDs: video-vote-helpful, video-vote-not-helpful
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Native YouTube app deep-link | WebView-based IFrame embed | ~2019 | No app-switching, inline playback |
| `youtube.com` embed | `youtube-nocookie.com` embed | COPPA/GDPR requirements | No tracking cookies set on page load |
| Full library IFrame API (`onChangeState`) | Plain WebView with inline HTML | This phase (nocookie requirement) | Simpler, no library API callbacks needed |

**Deprecated/outdated:**
- `baseUrlOverride` pointing to external host: Replaced by `useLocalHTML={true}` or plain WebView to avoid timeout (Issue #337).
- `modestbranding=1` YouTube parameter: YouTube deprecated the modestbranding parameter in 2023; it no longer hides the YouTube logo. Include it anyway as it is harmless.

---

## Open Questions

1. **react-native-youtube-iframe New Architecture status**
   - What we know: Library last published July 2023; no explicit New Architecture support documentation; Expo SDK 54 allows disabling New Architecture
   - What's unclear: Whether the library's postMessage bridge works under Fabric/JSI
   - Recommendation: Wave 0 must include a real-device proof-of-concept. If it fails on New Architecture, add `"newArchEnabled": false` to `app.json` as a documented tradeoff.

2. **YouTube IDs for all 27 domains**
   - What we know: Khan Academy YouTube channel has videos for all K-12 math domains
   - What's unclear: Specific video IDs — these require manual curation before shipping
   - Recommendation: Plan must include a task for manually identifying and verifying Khan Academy video IDs for all 18 existing + 9 HS domains (HS domain IDs can be placeholder until phases 82-90 land).

3. **Post-video "Done watching" trigger vs. video-end detection**
   - What we know: When using plain WebView with inline HTML, the library's IFrame API callbacks are unavailable; YouTube's IFrame API `onStateChange` events don't bridge back to React Native via the inline HTML approach
   - What's unclear: Whether the YouTube IFrame API can postMessage to the WebView's `onMessage` handler when using `source={{ html }}` — this would enable proper video-end detection
   - Recommendation: Use a "Done watching" button as the primary UX. It is simpler, more reliable, and appropriate for a child audience (no waiting for automatic callback).

4. **`youtubeConsentGranted` location — childProfileSlice vs. profilesSlice**
   - What we know: `tutorConsentGranted` lives in `childProfileSlice` and is dehydrated with child data (each child can have independent AI tutor consent)
   - What's unclear: Whether YouTube consent should be per-child or device-level (like a single household setting)
   - Recommendation: Follow `tutorConsentGranted` pattern — per-child in `childProfileSlice`. This is consistent, and different children in a household may have different YouTube permissions.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (Expo-managed) |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIDEO-01 | Library installs without type errors; components importable | smoke | `npm run typecheck` | ❌ Wave 0: typecheck passes after install |
| VIDEO-02 | "Watch a video" button is absent when ladderExhausted=false; present when true + consent granted + online | unit | `npm test -- --testPathPattern=ChatPanel` | ❌ Wave 0 |
| VIDEO-03 | VideoPlayer renders WebView with youtube-nocookie.com URL in HTML source; rel=0 present | unit | `npm test -- --testPathPattern=VideoPlayer` | ❌ Wave 0 |
| VIDEO-04 | videoMap covers all 18 MathDomain values with defined string IDs; no undefined gaps | unit | `npm test -- --testPathPattern=videoMap` | ❌ Wave 0 |
| VIDEO-05 | setVideoVote stores vote by domain; vote survives store reset cycle | unit | `npm test -- --testPathPattern=tutorSlice` | ✅ extend existing |
| VIDEO-06 | youtubeConsentGranted defaults to false; toggle in ParentalControlsScreen updates store | unit | `npm test -- --testPathPattern=ParentalControlsScreen` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<changed file pattern>`
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + `npm run typecheck` clean before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/components/chat/ChatPanel.video.test.tsx` — covers VIDEO-02 (ladderExhausted button visibility)
- [ ] `src/__tests__/components/chat/VideoPlayer.test.tsx` — covers VIDEO-03 (nocookie URL in HTML)
- [ ] `src/__tests__/services/video/videoMap.test.ts` — covers VIDEO-04 (all 18 domains mapped)
- [ ] `src/__tests__/store/tutorSlice.video.test.ts` — covers VIDEO-05 (vote persistence)
- [ ] `src/__tests__/screens/ParentalControlsScreen.youtube.test.tsx` — covers VIDEO-06 (YouTube consent toggle)
- [ ] Real-device proof-of-concept for `react-native-youtube-iframe` New Architecture compatibility (manual, not automated)

---

## Sources

### Primary (HIGH confidence)
- `src/hooks/useTutor.ts` — `ladderExhausted` signal definition and return shape (lines 121-123, 49)
- `src/store/slices/tutorSlice.ts` — current TutorSlice interface and action patterns
- `src/store/slices/childProfileSlice.ts` — `tutorConsentGranted` consent field pattern
- `src/store/appStore.ts` — STORE_VERSION = 22, partialize/migrate wiring
- `src/store/migrations.ts` — v22 migration pattern
- `src/screens/ParentalControlsScreen.tsx` — AI Helper section pattern for new YouTube section
- `src/components/chat/ChatPanel.tsx` — component props interface and render structure
- `.planning/STATE.md` — "Phase 81 (YouTube): New Architecture compatibility not explicitly documented — run proof-of-concept on real device early in Phase 81" (Blockers/Concerns section)
- `.planning/STATE.md` — "videoMap.ts is a module constant (not a store slice)" (v1.2 key architectural decisions)
- `src/services/mathEngine/types.ts` — `MathDomain` type with 18 existing values

### Secondary (MEDIUM confidence)
- [react-native-youtube-iframe Props docs](https://lonelycpp.github.io/react-native-youtube-iframe/component-props/) — confirmed `useLocalHTML`, `webViewProps`, `baseUrlOverride`, `initialPlayerParams.rel` props
- [react-native-youtube-iframe Releases](https://github.com/LonelyCpp/react-native-youtube-iframe/releases) — latest version is v2.4.1, released July 2023
- [Expo WebView docs](https://docs.expo.dev/versions/latest/sdk/webview/) — `npx expo install react-native-webview` confirmed; "Included in Expo Go"; New Architecture (Fabric) supported
- [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54) — SDK 54 is last release supporting Old Architecture; New Architecture (RN 0.81) is default but can be disabled

### Tertiary (LOW confidence)
- GitHub Issues search — no open issues specifically about New Architecture failures in react-native-youtube-iframe (absence of reported failures is weak positive signal, not proof of compatibility)
- Issue #337 — `baseUrlOverride` default URL (lonelycpp.github.io) times out; motivates `useLocalHTML` approach

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — library confirmed available, peer dependency (`react-native-webview`) Expo-verified, versions confirmed
- Architecture: HIGH — all integration points (useTutor, tutorSlice, childProfileSlice, ChatPanel, migrations) fully inspected from source
- New Architecture compatibility: LOW — library has no explicit NA documentation; must be validated in Wave 0
- Pitfalls: MEDIUM — store migration pattern and consent pattern are known quantities; NA risk is assessed but unverified

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (30 days; react-native-youtube-iframe is slow-moving but Expo SDK 54 architecture decisions are stable within this window)
