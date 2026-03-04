# Phase 25: Consent Gate & Minor Fixes - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

A parent can grant AI tutor consent through a PIN-verified screen, unblocking the entire tutor flow for real users. Includes two minor tech debt fixes from the v0.5 milestone audit. No new AI tutor capabilities — only the missing consent UI activation path.

</domain>

<decisions>
## Implementation Decisions

### Consent Flow Trigger
- When child taps Help with no consent, show a friendly child-facing message: "Ask a grown-up to turn on your helper!"
- Message includes a button that navigates to the full ConsentScreen
- ConsentScreen is a full navigation screen (new 'Consent' route in AppNavigator), not a modal
- After consent is granted, navigate back to SessionScreen and auto-fire the first tutor request (seamless — child originally tapped Help, so they expect a response)
- Consent screen is only accessible from the session Help button flow (no HomeScreen settings access in this phase)

### Parental PIN System
- Parent sets a 4-digit PIN on first consent grant, stored in expo-secure-store
- Combined ConsentScreen handles both modes: PIN creation (first visit, enter + confirm) and PIN verification (returning visits)
- Custom styled number pad with circular buttons matching app theme (dark background, bright accents)
- 4 dot indicators show entered digits (filled/unfilled)
- No PIN recovery mechanism in this phase — if forgotten, only option is clearing app data

### Consent Screen Content
- Warm and reassuring tone explaining what the AI tutor does
- 3-4 bullet points highlighting key safeguards:
  - No personal information is shared with the AI
  - All responses are age-appropriate and reviewed
  - Child can't type freely — only pre-set response buttons
  - Parent can revoke consent anytime (future feature)
- Everything on one scrollable screen: title, info bullets, then PIN entry section below
- No external links or "Learn more" — self-contained
- Grant-only in this phase — no revoke flow

### Minor Fixes
- STORE_VERSION test: verify it passes as-is (test already says toBe(6), version is 6)
- Retry button: add isOnline guard to handleResponse('retry') in SessionScreen, matching the existing handleHelpTap pattern

### Claude's Discretion
- Exact consent screen layout and spacing
- PIN pad button sizing and animation
- Transition animation between SessionScreen and ConsentScreen
- Exact wording of the child-facing "ask a grown-up" message
- Whether to show a subtle success animation after consent is granted

</decisions>

<specifics>
## Specific Ideas

- The consent flow should feel safe and trustworthy — parents are granting AI access to their child
- PIN pad should feel native to the app (dark theme, rounded elements) not like a generic form
- The child message when consent isn't granted should be encouraging, not blocking — "your helper is waiting!"
- Auto-requesting the tutor after consent grant is critical for seamless UX — the child shouldn't have to figure out they need to tap Help again

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `childProfileSlice.ts`: `tutorConsentGranted` boolean + `setTutorConsentGranted()` action already exist
- `useTutor.ts:102-104`: Already blocks with `consent_required` error when consent is false
- `expo-secure-store`: Already imported and used in `geminiClient.ts` for API key storage
- `AppNavigator.tsx`: Standard native-stack navigator pattern to add Consent route
- `colors`, `spacing`, `typography` from `@/theme`: Consistent styling tokens

### Established Patterns
- Navigation: `createNativeStackNavigator` with `RootStackParamList` type definitions
- Store: Zustand slices in `src/store/slices/`, persisted via AsyncStorage + partialize
- Screens: Single file per screen in `src/screens/`, using safe area insets
- Testing: Jest + RNTL, mock patterns for hooks and stores established

### Integration Points
- `SessionScreen.tsx:handleHelpTap` — where consent check should intercept
- `AppNavigator.tsx` — add Consent route
- `navigation/types.ts` — add Consent to RootStackParamList
- `childProfileSlice.ts` — setTutorConsentGranted(true) called after PIN verification
- `expo-secure-store` — store/retrieve parental PIN

</code_context>

<deferred>
## Deferred Ideas

- HomeScreen parental settings area with consent management — future parental-controls phase
- PIN recovery mechanism — future parental-controls phase
- Consent revocation flow — future parental-controls phase
- Parental dashboard showing AI tutor usage — future analytics phase

</deferred>

---

*Phase: 25-consent-gate-minor-fixes*
*Context gathered: 2026-03-04*
