# Phase 25: Consent Gate & Minor Fixes - Research

**Researched:** 2026-03-04
**Domain:** Parental consent UI, expo-secure-store PIN management, React Navigation routing
**Confidence:** HIGH

## Summary

Phase 25 closes the last v0.5 gap (SAFE-06) by building a parental consent screen that gates AI tutor access behind a 4-digit PIN. The implementation surface is well-defined: a new `ConsentScreen` wired into the existing native-stack navigator, using `expo-secure-store` (already in dependencies, v15.0.7) for secure PIN storage, and the existing `tutorConsentGranted` boolean in `childProfileSlice` (already persisted via Zustand partialize). Two minor fixes address an already-passing STORE_VERSION test assertion and a missing `isOnline` guard on the retry button.

The architecture is straightforward -- no new dependencies, no store migration, no new slices. All building blocks exist: `expo-secure-store` async API for PIN storage, `setTutorConsentGranted` action in the store, theme tokens for styling, and the consent check in `useTutor` that already returns `consent_required` error when consent is false. The primary engineering work is the ConsentScreen UI (PIN pad + info content) and the SessionScreen integration (intercepting the Help tap when consent is missing, navigating to ConsentScreen, and auto-firing the tutor request on return).

**Primary recommendation:** Build ConsentScreen as a single screen with two modes (PIN creation / PIN verification), intercept the Help button in SessionScreen to navigate there when consent is not granted, and use route params to signal auto-fire on return.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- When child taps Help with no consent, show a friendly child-facing message: "Ask a grown-up to turn on your helper!"
- Message includes a button that navigates to the full ConsentScreen
- ConsentScreen is a full navigation screen (new 'Consent' route in AppNavigator), not a modal
- After consent is granted, navigate back to SessionScreen and auto-fire the first tutor request (seamless -- child originally tapped Help, so they expect a response)
- Consent screen is only accessible from the session Help button flow (no HomeScreen settings access in this phase)
- Parent sets a 4-digit PIN on first consent grant, stored in expo-secure-store
- Combined ConsentScreen handles both modes: PIN creation (first visit, enter + confirm) and PIN verification (returning visits)
- Custom styled number pad with circular buttons matching app theme (dark background, bright accents)
- 4 dot indicators show entered digits (filled/unfilled)
- No PIN recovery mechanism in this phase -- if forgotten, only option is clearing app data
- Warm and reassuring tone explaining what the AI tutor does
- 3-4 bullet points highlighting key safeguards
- Everything on one scrollable screen: title, info bullets, then PIN entry section below
- No external links or "Learn more" -- self-contained
- Grant-only in this phase -- no revoke flow
- STORE_VERSION test: verify it passes as-is (test already says toBe(6), version is 6)
- Retry button: add isOnline guard to handleResponse('retry') in SessionScreen, matching the existing handleHelpTap pattern

### Claude's Discretion
- Exact consent screen layout and spacing
- PIN pad button sizing and animation
- Transition animation between SessionScreen and ConsentScreen
- Exact wording of the child-facing "ask a grown-up" message
- Whether to show a subtle success animation after consent is granted

### Deferred Ideas (OUT OF SCOPE)
- HomeScreen parental settings area with consent management -- future parental-controls phase
- PIN recovery mechanism -- future parental-controls phase
- Consent revocation flow -- future parental-controls phase
- Parental dashboard showing AI tutor usage -- future analytics phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SAFE-06 | VPC parental consent gate before first AI tutor use | ConsentScreen with PIN creation/verification, `expo-secure-store` for PIN, `setTutorConsentGranted` store action, SessionScreen Help button interception, auto-fire tutor on consent grant |
</phase_requirements>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-secure-store | 15.0.7 | Secure PIN storage | Already used for API key; CLAUDE.md mandates it for sensitive data |
| zustand | 5.0.8 | State management (tutorConsentGranted) | Project standard; slice already exists |
| @react-navigation/native-stack | 7.8.2 | Navigation (Consent route) | Project standard; AppNavigator already uses it |
| react-native-safe-area-context | 5.6.0 | Safe area insets for screen | Used by all existing screens |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react-native | 0.554.0 | Icons (Shield, Check, Lock) | Consent screen visual elements |
| react-native-reanimated | 4.1.1 | Animations (optional success animation) | PIN dot fill animation, optional success feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-secure-store | AsyncStorage | AsyncStorage is NOT encrypted -- CLAUDE.md guardrail explicitly forbids this for sensitive data |
| Custom PIN pad | TextInput with secureTextEntry | TextInput shows keyboard; custom pad gives full control over visual style and matches the child-friendly dark theme |

**Installation:**
```bash
# No new dependencies needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  screens/
    ConsentScreen.tsx          # New: consent info + PIN pad (single screen, two modes)
  navigation/
    AppNavigator.tsx           # Modified: add Consent route
    types.ts                   # Modified: add Consent to RootStackParamList
  screens/
    SessionScreen.tsx          # Modified: intercept Help tap for consent flow
```

### Pattern 1: ConsentScreen Two-Mode Pattern
**What:** Single screen component handles both PIN creation (first visit) and PIN verification (returning visits). Mode determined by checking whether a PIN already exists in expo-secure-store on mount.
**When to use:** When the same screen serves both setup and verification flows.
**Example:**
```typescript
// Pseudocode for ConsentScreen mode detection
const [mode, setMode] = useState<'loading' | 'create' | 'verify'>('loading');

useEffect(() => {
  SecureStore.getItemAsync('parental-pin').then((pin) => {
    setMode(pin ? 'verify' : 'create');
  });
}, []);
```

### Pattern 2: Navigation-Based Consent Gate
**What:** SessionScreen intercepts the Help tap, checks `tutorConsentGranted` from the store, and navigates to ConsentScreen if false. On consent grant, ConsentScreen navigates back and SessionScreen auto-fires the tutor request.
**When to use:** When a gate check needs to redirect to a different screen then resume the original action.
**Example:**
```typescript
// In SessionScreen: handleHelpTap modification
const handleHelpTap = useCallback(() => {
  if (!tutorConsentGranted) {
    // Show child message then navigate to consent
    navigation.navigate('Consent', { returnTo: 'Session' });
    return;
  }
  // Existing flow
  setHelpUsed(true);
  setShouldPulse(false);
  setChatOpen(true);
  setChatMinimized(false);
  if (isOnline) {
    tutor.requestHint();
  }
}, [tutorConsentGranted, isOnline, tutor, navigation]);
```

### Pattern 3: Route Params for Return Signal
**What:** Use navigation route params or a store flag to signal that consent was just granted, so SessionScreen can auto-fire the tutor request without the child tapping Help again.
**When to use:** When an action should resume after a screen round-trip.
**Example:**
```typescript
// RootStackParamList addition
Consent: { returnTo: 'Session' } | undefined;

// ConsentScreen: after successful PIN verification
setTutorConsentGranted(true);
navigation.goBack(); // Returns to SessionScreen

// SessionScreen: detect consent was just granted (via store subscription or focus listener)
```

### Pattern 4: expo-secure-store PIN Service
**What:** Thin service layer wrapping expo-secure-store for parental PIN operations (set, verify, check existence). Keeps crypto-adjacent logic out of the screen component.
**When to use:** Always -- screens should not call SecureStore directly per project architecture (services pattern).
**Example:**
```typescript
// src/services/consent/parentalPin.ts
import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'parental-pin';

export async function hasParentalPin(): Promise<boolean> {
  const pin = await SecureStore.getItemAsync(PIN_KEY);
  return pin !== null;
}

export async function setParentalPin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function verifyParentalPin(input: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored === input;
}
```

### Anti-Patterns to Avoid
- **Storing PIN in Zustand/AsyncStorage:** The parental PIN is sensitive data. CLAUDE.md guardrail mandates `expo-secure-store` for all sensitive data. The PIN must never appear in the persisted Zustand state.
- **Hashing the PIN client-side:** This is a 4-digit local PIN (10,000 combinations), not a password. Client-side hashing adds complexity without security benefit since an attacker with device access could brute-force it regardless. expo-secure-store provides platform-level encryption (iOS Keychain, Android Keystore).
- **Making ConsentScreen a modal:** Decision explicitly says "full navigation screen, not a modal." Modals have gesture-dismiss behavior that could bypass the consent flow.
- **Bumping STORE_VERSION:** `tutorConsentGranted` was already added in v6 migration. No schema change in this phase means no version bump needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secure storage | Custom encryption | expo-secure-store | Platform-native encryption (Keychain/Keystore), already in deps |
| Navigation routing | Custom screen stack | @react-navigation/native-stack | Project standard, type-safe param lists |
| Consent persistence | Custom flag management | Zustand `tutorConsentGranted` | Already exists in childProfileSlice, already persisted |
| Online detection | Custom fetch probe | useNetworkStatus hook | Already exists, wraps NetInfo |

**Key insight:** Every building block for this phase already exists in the codebase. The work is connecting them with a new screen and minor wiring changes.

## Common Pitfalls

### Pitfall 1: PIN Stored in Plaintext in AsyncStorage
**What goes wrong:** Using AsyncStorage instead of expo-secure-store for the parental PIN.
**Why it happens:** AsyncStorage is the default persistence layer for the app; easy to reach for by habit.
**How to avoid:** The PIN service module should be the ONLY place that touches the PIN, and it must use `expo-secure-store` exclusively. CLAUDE.md guardrail: "Don't bypass expo-secure-store for sensitive data (parental PIN, API keys)."
**Warning signs:** Any import of AsyncStorage in the consent/PIN code.

### Pitfall 2: Race Condition on Consent Grant + Auto-Fire
**What goes wrong:** After granting consent and navigating back, the tutor request fires before the Zustand store has updated `tutorConsentGranted` to true, so `useTutor.requestTutor()` still sees false and returns `consent_required` error.
**Why it happens:** Navigation goBack and store update are async; the consent guard in useTutor reads from the store.
**How to avoid:** Set `tutorConsentGranted(true)` BEFORE calling `navigation.goBack()`. Zustand synchronous updates guarantee the store is updated before the next render cycle. Alternatively, use `useAppStore.getState().tutorConsentGranted` for a synchronous check.
**Warning signs:** First tutor request after consent grant shows an error or fails silently.

### Pitfall 3: Forgetting to Reset PIN State on Wrong Entry
**What goes wrong:** After entering a wrong PIN in verify mode, the dot indicators still show 4 filled dots, confusing the user.
**Why it happens:** PIN state not cleared on verification failure.
**How to avoid:** On failed verification, clear the entered digits array, show a brief error message ("Wrong PIN, try again"), and reset the dot indicators.
**Warning signs:** Visual state mismatch between entered digits and displayed dots.

### Pitfall 4: Missing Navigation Type Safety
**What goes wrong:** Adding the Consent route to AppNavigator but forgetting to add it to `RootStackParamList` in `types.ts`, causing TypeScript errors or runtime params issues.
**Why it happens:** Two files need updating (types.ts + AppNavigator.tsx) and they're in different directories.
**How to avoid:** Always update both files together: types.ts first (type definition), then AppNavigator.tsx (route registration).
**Warning signs:** TypeScript errors on `navigation.navigate('Consent', ...)`.

### Pitfall 5: Retry Button Missing isOnline Guard
**What goes wrong:** The retry button fires a Gemini API call even when offline, leading to a timeout error instead of the friendly offline message.
**Why it happens:** The `handleResponse('retry')` case directly calls `tutor.requestTutor()` without the `isOnline` check that `handleHelpTap` has.
**How to avoid:** Add `if (isOnline)` guard in the retry case, matching the `handleHelpTap` pattern at line 253 of SessionScreen.tsx.
**Warning signs:** Retry while offline shows a timeout error after 8 seconds instead of the offline message.

## Code Examples

Verified patterns from the existing codebase:

### expo-secure-store Usage (from geminiClient.ts)
```typescript
// Source: src/services/tutor/geminiClient.ts lines 1-29
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORE_KEY = 'gemini-api-key';

const apiKey = await SecureStore.getItemAsync(API_KEY_STORE_KEY);
if (!apiKey) {
  throw new Error('Key not found');
}
```

### expo-secure-store Mock Pattern (from geminiClient.test.ts)
```typescript
// Source: src/services/tutor/__tests__/geminiClient.test.ts lines 18-27
const mockGetItemAsync = jest.fn();
jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
}));

// For PIN service testing, also mock setItemAsync:
const mockSetItemAsync = jest.fn();
jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
}));
```

### Adding a Navigation Route (from AppNavigator.tsx)
```typescript
// Source: src/navigation/AppNavigator.tsx
import ConsentScreen from '@/screens/ConsentScreen';

// Inside Stack.Navigator:
<Stack.Screen name="Consent" component={ConsentScreen} />
```

### Updating RootStackParamList (from types.ts)
```typescript
// Source: src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Session: { sessionId: string };
  Results: { /* ... */ };
  Sandbox: { manipulativeType: ManipulativeType };
  Consent: { returnTo?: 'Session' } | undefined;  // NEW
};
```

### Store Action Already Available
```typescript
// Source: src/store/slices/childProfileSlice.ts line 35
setTutorConsentGranted: (granted) => set({ tutorConsentGranted: granted }),

// Usage in ConsentScreen after PIN verification:
const setTutorConsentGranted = useAppStore((s) => s.setTutorConsentGranted);
setTutorConsentGranted(true);
```

### Consent Check Already in useTutor
```typescript
// Source: src/hooks/useTutor.ts lines 101-105
if (!tutorConsentGranted) {
  setTutorError('consent_required');
  return;
}
```

### Retry Button Fix Pattern
```typescript
// Current (buggy) - src/screens/SessionScreen.tsx line 306-308
case 'retry': {
  tutor.requestTutor();
  break;
}

// Fixed - add isOnline guard matching handleHelpTap pattern (line 253)
case 'retry': {
  if (isOnline) {
    tutor.requestTutor();
  }
  break;
}
```

### handleHelpTap Consent Interception Pattern
```typescript
// Current: src/screens/SessionScreen.tsx lines 248-256
const handleHelpTap = useCallback(() => {
  setHelpUsed(true);
  setShouldPulse(false);
  setChatOpen(true);
  setChatMinimized(false);
  if (isOnline) {
    tutor.requestHint();
  }
}, [isOnline, tutor]);

// Modified: check consent first, show child message or navigate
const handleHelpTap = useCallback(() => {
  if (!tutorConsentGranted) {
    // Show child-facing "ask a grown-up" message or navigate to ConsentScreen
    navigation.navigate('Consent');
    return;
  }
  setHelpUsed(true);
  setShouldPulse(false);
  setChatOpen(true);
  setChatMinimized(false);
  if (isOnline) {
    tutor.requestHint();
  }
}, [tutorConsentGranted, isOnline, tutor, navigation]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-secure-store async-only API | Sync + async API available (v15) | Expo SDK 54 | `getItem`/`setItem` sync methods available, but async (`getItemAsync`/`setItemAsync`) is safer for UI responsiveness |
| Manual screen gating logic | Still manual in RN; no built-in consent framework | N/A | Custom consent screens remain the standard approach in children's apps |

**Current in codebase:**
- STORE_VERSION = 6 (includes tutorConsentGranted migration from v5->v6)
- 1030 tests passing, TypeScript clean
- tutorConsentGranted defaults to false, already persisted via Zustand partialize
- useTutor already gates on consent with `consent_required` error

## Open Questions

1. **Auto-fire timing after consent grant**
   - What we know: ConsentScreen sets `tutorConsentGranted(true)` then calls `navigation.goBack()`. SessionScreen needs to detect this and fire `tutor.requestHint()`.
   - What's unclear: Best mechanism to detect "consent was just granted" -- options are: (a) route params on goBack (not standard in React Navigation), (b) a transient store flag, (c) a `useFocusEffect` that checks consent changed from false->true, (d) check tutor.error === 'consent_required' clears when consent becomes true.
   - Recommendation: Use a simple approach -- before navigating to Consent, set chat state (chatOpen=true, helpUsed=true). When returning, a `useFocusEffect` detects `tutorConsentGranted` is now true and chat is open but has no messages, triggering the auto-fire. Alternatively, a simple boolean ref `consentJustGranted` set by navigation listener.

2. **Child-facing message UI before consent navigation**
   - What we know: Decision says show "Ask a grown-up to turn on your helper!" with a button to navigate.
   - What's unclear: Should this message appear in the chat panel, as a modal overlay, or as a standalone UI element?
   - Recommendation: Show it in the chat panel as a special tutor message with an action button. This reuses the existing ChatPanel infrastructure and feels natural in the help flow.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7 + jest-expo 54.0.13 + @testing-library/react-native 13.3.3 |
| Config file | `jest.config.js` |
| Quick run command | `npx jest --testPathPattern=<pattern> --no-coverage` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SAFE-06-a | PIN service: set, verify, check existence via expo-secure-store | unit | `npx jest --testPathPattern="parentalPin" --no-coverage` | No -- Wave 0 |
| SAFE-06-b | ConsentScreen: renders info content + PIN pad, handles create/verify modes | unit | `npx jest --testPathPattern="ConsentScreen" --no-coverage` | No -- Wave 0 |
| SAFE-06-c | SessionScreen: Help tap intercepts when consent not granted | unit | `npx jest --testPathPattern="SessionScreen" --no-coverage` | Yes (exists, needs new cases) |
| SAFE-06-d | SessionScreen: auto-fires tutor after consent grant | unit | `npx jest --testPathPattern="SessionScreen" --no-coverage` | Yes (exists, needs new cases) |
| SAFE-06-e | Store: tutorConsentGranted persists across restarts | unit | `npx jest --testPathPattern="appStore" --no-coverage` | Yes (already passing) |
| FIX-01 | STORE_VERSION test assertion matches actual version | unit | `npx jest --testPathPattern="appStore" --no-coverage` | Yes (already passing: toBe(6)) |
| FIX-02 | Retry button respects isOnline guard | unit | `npx jest --testPathPattern="SessionScreen" --no-coverage` | Yes (exists, needs new case) |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=<relevant-pattern> --no-coverage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + `npm run typecheck` before verify

### Wave 0 Gaps
- [ ] `src/services/consent/__tests__/parentalPin.test.ts` -- covers SAFE-06-a (PIN service)
- [ ] `src/__tests__/screens/ConsentScreen.test.tsx` -- covers SAFE-06-b (consent screen)
- [ ] New test cases in `src/__tests__/screens/SessionScreen.test.tsx` -- covers SAFE-06-c, SAFE-06-d, FIX-02

*(No new framework config or fixtures needed -- existing jest.config.js, jest.setup.js, and mock patterns are sufficient)*

## Sources

### Primary (HIGH confidence)
- `src/store/slices/childProfileSlice.ts` -- `tutorConsentGranted` boolean + `setTutorConsentGranted` action verified
- `src/hooks/useTutor.ts:101-105` -- consent guard returning `consent_required` error verified
- `src/store/appStore.ts` -- STORE_VERSION = 6, tutorConsentGranted in partialize verified
- `src/store/migrations.ts` -- v5->v6 migration adds tutorConsentGranted default false verified
- `src/navigation/AppNavigator.tsx` -- native-stack navigator pattern verified
- `src/navigation/types.ts` -- RootStackParamList type definition verified
- `src/services/tutor/geminiClient.ts` -- expo-secure-store usage pattern verified
- `src/screens/SessionScreen.tsx` -- handleHelpTap (line 248), handleResponse retry (line 306) verified
- `node_modules/expo-secure-store/build/SecureStore.d.ts` -- API: getItemAsync, setItemAsync, getItem, setItem verified
- `src/__tests__/appStore.test.ts:85-87` -- STORE_VERSION toBe(6) already passes verified

### Secondary (MEDIUM confidence)
- expo-secure-store v15 documentation -- sync and async API both available; 2048 byte value limit

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, no new dependencies
- Architecture: HIGH - all integration points verified in source code, patterns established
- Pitfalls: HIGH - all identified from direct code analysis (e.g., retry button bug visible at line 306-308)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable -- no external API changes expected)
