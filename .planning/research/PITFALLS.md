# Domain Pitfalls

**Domain:** Multi-child profiles, parent dashboard, parental controls, and freemium IAP subscription added to an existing children's math learning app
**Researched:** 2026-03-05
**Confidence:** HIGH (codebase analysis + platform documentation + COPPA regulations + IAP ecosystem research)

## Critical Pitfalls

Mistakes that cause rewrites, app store rejections, data loss, or legal exposure.

### Pitfall 1: Single-Child Assumption Baked into Store Architecture

**What goes wrong:**
The entire Zustand store (STORE_VERSION=12) treats child data as a singleton. Fields like `childName`, `childAge`, `childGrade`, `skillStates`, `xp`, `level`, `weeklyStreak`, `misconceptions`, `earnedBadges`, `challengeCompletions`, `avatarId`, `frameId`, `themeId`, and `tutorConsentGranted` all live at the top level of the store with no child ID scoping. The `partialize` function in `appStore.ts` explicitly lists every one of these as top-level keys. Every screen, hook, and service reads these flat -- `useAppStore(state => state.xp)` appears across 36+ files. Adding multi-child support requires either (a) nesting all child data under a `children: Record<childId, ChildData>` structure, which is a massive schema change breaking every selector in the app, or (b) swapping the entire persisted store when switching children, which creates complex data lifecycle issues.

**Why it happens:**
The app was designed for a single child from v0.1. Twelve store versions of migrations have cemented this assumption. The `partialize` function, migration chain, all slice interfaces, and every `useAppStore` selector assume flat top-level access. This is not a bug -- it was the correct architecture for a single-child app. But it means multi-child is a fundamental schema restructuring, not an additive feature.

**Consequences:**
- Attempting a flat migration (v12 -> v13) that restructures all child data into a nested map will be the most complex migration in the app's history
- If the migration has a bug, ALL existing user data (skill states, Elo ratings, BKT mastery, Leitner boxes, misconception records, badge progress, XP, streaks) is at risk of corruption or loss
- Every `useAppStore` selector across 36+ files must be updated to scope to the active child
- The `commitSessionResults` flow in `useSession.ts` (28 `useAppStore` references) must be rewired entirely

**Prevention:**
- Use the "active child pointer" pattern: keep `activeChildId` at the store root, nest all per-child data under `children: Record<string, ChildData>`, and create a `useActiveChild()` hook that resolves `children[activeChildId]` so selectors remain simple
- Create a `ChildData` type that is the union of all per-child state (profile + skills + gamification + misconceptions + achievements + challenges) -- extract this from existing slice types
- Write the v12 -> v13 migration as a "wrap existing data" operation: take all current top-level fields and nest them under `children: { [generatedId]: { ...existingFields } }` with `activeChildId: generatedId`
- Build a comprehensive migration test fixture that captures a real v12 store snapshot and verifies every field survives the restructuring
- Create the `useActiveChild()` hook FIRST, then migrate all 36+ files to use it, BEFORE enabling multi-child UI -- this way the refactor can be validated with a single child before the switching logic exists
- Keep `partialize` in sync: it must now include `children`, `activeChildId`, and the subscription/parental-control fields, but NOT the old flat fields

**Detection:**
- XP resets to 0 after switching children and switching back
- "Child A" sees "Child B"'s badges or skill progress
- App crashes on first launch after update (migration failure)
- Store migration test fails when starting from v12 fixture data

**Phase to address:**
Phase 1 (Multi-child profiles) -- this is THE foundational change. Everything else depends on it.

---

### Pitfall 2: Store Migration v12->v13 Is a Structural Reshape, Not an Additive Migration

**What goes wrong:**
All previous 12 migrations have been additive: "add field X with default Y." The multi-child migration is fundamentally different -- it must MOVE existing data from the root into a nested structure. The existing `migrateStore` function in `migrations.ts` treats `state` as a flat `Record<string, unknown>` and uses `state.fieldName ??= default`. A structural reshape requires creating a new `children` map, copying every child-related field into it, and DELETING the old top-level fields. If old fields are left at the root alongside the nested structure, `partialize` will persist duplicates, the store will grow, and stale root-level data will shadow the nested data.

**Why it happens:**
The migration pattern established in v1-v12 is "null-coalesce defaults." Developers follow the pattern and write `state.children ??= {}` without moving the existing data into it. The result: existing users get an empty `children` map alongside their existing flat data, and the app shows "no children" despite having a full history.

**Consequences:**
- Existing user's learning history appears lost (it is still there, just not in the expected location)
- If both flat and nested data exist, which does the app read? Race condition between old and new code paths
- Rollback is extremely difficult once the migration ships

**Prevention:**
- Write the migration as a two-step operation: (1) construct the `ChildData` object from existing flat fields, (2) delete the flat fields from root state
- The migration MUST be idempotent: if run twice (which Zustand can do in edge cases), it should not create duplicate children
- Add a guard: `if (state.children && Object.keys(state.children).length > 0) return` at the top of the v13 migration to prevent re-migration
- Test with three fixture scenarios: fresh install (no state), v12 state with full history, v12 state with minimal data (no badges, no misconceptions)
- Consider a "migration validation" step that runs after migration and logs warnings if unexpected root-level child fields still exist

**Detection:**
- After update, app shows onboarding screen instead of home screen (no active child found)
- Store size doubles (duplicate data at root and nested levels)
- `partialize` includes both old flat fields AND new nested structure

**Phase to address:**
Phase 1 (Multi-child profiles) -- the migration IS the phase. Get it wrong and nothing else works.

---

### Pitfall 3: IAP Requires Development Build -- Expo Go Cannot Test Purchases

**What goes wrong:**
The team has been developing with Expo Go (implied by managed workflow + no mention of dev builds). IAP libraries (RevenueCat `react-native-purchases` or `expo-iap`) require native modules not included in Expo Go. Attempting to test IAP in Expo Go either crashes or silently uses mock/preview mode that does not exercise real purchase flows. The first time the team discovers this, they must set up EAS Build and a development build, which introduces a new build pipeline, provisioning profiles, and significantly longer iteration cycles.

**Why it happens:**
IAP is one of the few features in Expo managed workflow that CANNOT work in Expo Go at all. Unlike most Expo modules that have JS fallbacks, IAP requires StoreKit 2 (iOS) and Google Play Billing (Android) native bindings. RevenueCat's docs explicitly state: "purchases won't work [in Expo Go] because Expo Go doesn't include all the native APIs required."

**Consequences:**
- Development velocity drops significantly during IAP phase (minutes per build instead of seconds per reload)
- IAP bugs cannot be caught until deployed to TestFlight/internal testing tracks
- Sandbox purchase accounts (Apple) and test accounts (Google) must be configured separately
- Android: if Activity `launchMode` is not `standard` or `singleTop`, purchases cancel when user backgrounds to verify in banking app

**Prevention:**
- Set up EAS Build and development builds BEFORE starting IAP work -- treat this as Phase 0 infrastructure
- Use RevenueCat over raw `expo-iap` or `react-native-iap` because RevenueCat handles receipt validation server-side, subscription status tracking, cross-platform entitlement management, and provides a dashboard -- this eliminates an entire class of receipt-validation bugs
- RevenueCat is confirmed compatible with Expo SDK 54 / React Native 0.81
- Add `react-native-purchases` to app.json plugins array for config plugin support
- Create Apple sandbox test accounts and Google Play internal test tracks early
- Gate IAP testing behind a feature flag so the rest of the app remains testable in Expo Go during development

**Detection:**
- `E_IAP_NOT_AVAILABLE` error in development
- Purchases "succeed" in development but never grant entitlements
- App crashes on import of IAP module in Expo Go

**Phase to address:**
IAP/Subscription phase -- but development build setup should happen as pre-work before the phase begins.

---

### Pitfall 4: Apple Kids Category + Subscription Creates Heightened Review Scrutiny

**What goes wrong:**
Apps in Apple's Kids Category face stricter review guidelines (Guideline 1.3). Kids Category apps with subscriptions must: (a) have a parental gate before ANY purchase UI, (b) not use manipulative subscription patterns (free trial that auto-converts without clear disclosure), (c) not show ads (the app doesn't, but analytics SDKs could trigger this), (d) clearly communicate subscription terms before the purchase button, and (e) provide a restore purchases button. Missing ANY of these causes rejection. Multiple rejections delay launch by weeks.

**Why it happens:**
Developers implement IAP following standard RevenueCat/Apple patterns without accounting for Kids Category-specific requirements. Standard paywall templates show pricing and a "Subscribe" button -- in a Kids Category app, this button must be behind a parental gate. The existing parental PIN gate (expo-secure-store) handles tutor consent but was not designed to gate purchases.

**Consequences:**
- App store rejection with vague "Guideline 1.3" message
- Multiple resubmission cycles (each takes 1-3 days for review)
- Potential removal from Kids Category if violations are found post-launch
- Google Play has similar "Designed for Families" program requirements

**Prevention:**
- Require parental PIN verification before showing ANY subscription UI (paywall screen, manage subscription, cancel subscription)
- Subscription terms must be visible BEFORE the purchase button (price, billing period, auto-renewal terms, cancellation instructions)
- Include a prominent "Restore Purchases" button accessible without purchase -- Apple rejects if this is missing
- Never use "free trial" language without clearly stating what happens after the trial ends and how much it costs
- Do not include any third-party analytics SDK that could be classified as advertising (RevenueCat analytics are fine as they are first-party purchase tracking)
- Test the full purchase flow on a real device via TestFlight before submission
- Review Apple's "Helping Protect Kids Online" (February 2025) document for current guidelines
- On Google Play: ensure the app is enrolled in the "Designed for Families" program and meets its requirements

**Detection:**
- App Review rejection citing Guideline 1.3
- Subscription UI is accessible without parental authentication
- "Restore Purchases" button missing or non-functional
- Free trial terms not clearly displayed before purchase button

**Phase to address:**
IAP/Subscription phase -- design the parental-gated paywall flow before implementing any RevenueCat integration.

---

### Pitfall 5: Freemium Gating Turns Existing Free Features Into Lost Functionality

**What goes wrong:**
The v0.8 spec says "free: 3 sessions/day, no AI tutor; premium: unlimited + AI tutor + all themes." But the AI tutor has been free and available since v0.5. Themes have been free since v0.7 (earned through achievements, "all cosmetics earned through badges, zero paywall" is an explicit design decision). Existing users who update to v0.8 will LOSE access to the AI tutor and theme unlocks they previously had. This violates user trust, creates negative reviews, and contradicts the "no paywall" philosophy that was a core design principle.

**Why it happens:**
Feature gating is designed from the new-user perspective ("free users get X, premium users get X+Y"). But existing users have been using Y for free. The migration from "everything free" to "freemium" must handle grandfathering or users perceive it as taking away features they already had.

**Consequences:**
- 1-star reviews: "App used to have a tutor, now it wants me to pay"
- Children who relied on AI tutor hints for challenging problems suddenly lose their support system
- Parents who valued the "no paywall" positioning lose trust in the app
- Violates the "all cosmetics earned through badges, zero paywall" design decision documented in PROJECT.md

**Prevention:**
- Grandfather existing users: anyone who has used the app before the freemium update gets a permanent "legacy" entitlement for AI tutor access
- OR: make the AI tutor always available but limit it (e.g., 3 tutor interactions/day free, unlimited premium) rather than fully gating it
- Themes earned through achievements MUST remain free -- paywall only applies to additional premium-exclusive themes, not the 5 existing ones
- Premium features should be NEW features, not restrictions on existing ones: premium could mean "unlimited sessions" + "parent dashboard analytics" + "premium-exclusive themes" + "priority AI tutor" (no daily limit)
- Communicate the change clearly in update notes: "New premium features added! Everything you had before is still free."
- Add a `legacyUser` flag in the v12->v13 migration that detects existing data and grants appropriate entitlements

**Detection:**
- Existing user updates and immediately hits paywall for AI tutor
- Badge-unlocked themes show lock icons after update
- User reviews mention "they took away features"

**Phase to address:**
Freemium/Subscription design phase -- must be resolved BEFORE implementing any feature gating. This is a product decision, not a technical one.

---

### Pitfall 6: COPPA 2025 Amendments Expand Scope for Subscription Data

**What goes wrong:**
The 2025 COPPA amendments (effective June 23, 2025, compliance deadline April 22, 2026) expand the definition of "personal information" and add stricter data retention requirements. Subscription management inherently involves collecting parent email (for receipt), payment processing (Apple/Google handle this, but the app may store subscription status), and linking a child's usage data to a paying account. If subscription status is stored alongside child learning data, the combined dataset may constitute "personal information" under the expanded COPPA definition, triggering additional consent and data retention obligations.

**Why it happens:**
Developers treat subscription as a parent-only concern ("it's the parent's payment, not the child's data"). But in a children's app, the subscription unlocks child-facing features, and the subscription status is inherently linked to the child's profile. Under 2025 COPPA, "separate verifiable parental consent" may be required when personal information is disclosed to third parties -- and RevenueCat is a third party.

**Consequences:**
- FTC enforcement action if COPPA requirements are not met (fines up to $50,000+ per violation)
- Need to disclose RevenueCat as a data processor in privacy policy
- Must limit data retention: cannot store subscription history indefinitely
- May need enhanced parental consent mechanism beyond the current PIN gate

**Prevention:**
- Keep subscription state entirely separate from child learning data: `subscriptionSlice` should store only `{ isActive: boolean, expiresAt: string | null, tier: 'free' | 'premium' }` -- no child identifiers, no usage correlation
- RevenueCat handles all payment data server-side; the app should only store the resulting entitlement status, not payment details
- Update the privacy policy to disclose RevenueCat as a service provider and what data it processes
- The existing parental PIN gate satisfies "verifiable parental consent" for basic COPPA, but subscription adds a new consent surface -- parents must explicitly consent to the purchase (Apple/Google handle this via their payment flows, which counts as VPC)
- Set data retention policy: subscription state expires and is cleared when subscription lapses + grace period
- Never send child learning data (skill states, misconceptions, BKT probabilities) to RevenueCat or any external service -- this is already the pattern but must be explicitly enforced in code review
- Ensure the app complies by April 22, 2026 (the COPPA amendment compliance deadline)

**Detection:**
- Privacy policy does not mention RevenueCat or subscription data processing
- Child identifiers (name, age, grade) are included in RevenueCat user attributes
- Subscription history is stored alongside child profile data with no expiration

**Phase to address:**
IAP/Subscription phase -- privacy policy update and data architecture must precede implementation.

---

## Moderate Pitfalls

### Pitfall 7: Parental Controls Time Limits Are Trivially Bypassable

**What goes wrong:**
App-level time controls ("30 minutes per day," "no sessions after 8pm") are enforced in JavaScript. A child can bypass them by: (a) changing the device clock, (b) force-quitting and reopening the app, (c) clearing app data, or (d) having a second device. Parents set controls expecting enforcement, then discover their child played for 2 hours because they changed the clock forward.

**Prevention:**
- Accept that app-level time controls are ADVISORY, not enforcement. Frame them as "reminders" not "limits" in the UI
- Use `Date.now()` for elapsed-time tracking (harder to fake than wall-clock comparisons), but still validate against last known server time if available
- Store cumulative session time per day with a monotonic counter (increments during sessions, never decrements), not wall-clock comparisons
- Bedtime lockout: compare against device time but also check if time jumped (current time < last recorded time = clock manipulation)
- Accept gracefully when bypassed: the app should never crash or corrupt data if the clock is wrong
- Do NOT use iOS Screen Time API or Android Digital Wellbeing API -- these are OS-level and create platform dependency nightmares; keep controls app-internal

**Detection:**
- Time controls work in testing but parents report they are ineffective
- `sessionStartTime > currentTime` (clock was set backward)

**Phase to address:**
Parental controls phase -- set correct user expectations in UI copy.

---

### Pitfall 8: Parent Dashboard Reads Same Store as Child, Causing Re-renders

**What goes wrong:**
The parent dashboard needs to read ALL children's data (skill states, misconception records, session history, XP progression) to render analytics. If the dashboard subscribes to the entire `children` map via `useAppStore`, any child state change (mid-session Elo update, BKT transition) triggers a re-render of the dashboard. Worse: if the parent is viewing the dashboard while a child session is in progress on the same device, every answer submission triggers a dashboard re-render.

**Prevention:**
- Parent dashboard should read from persisted store data, not live reactive state. Use `useAppStore.getState()` for initial data load, not reactive selectors
- OR use Zustand's `shallow` comparator with narrow selectors that only pick the specific analytics-relevant fields
- Dashboard analytics (trend graphs, mastery breakdowns) should be computed once on screen mount and NOT reactively updated
- Consider computing analytics in a service function (`computeChildAnalytics(childData)`) that returns a snapshot, not a live subscription
- Parent dashboard and child session should never run simultaneously in practice (child uses the app, parent reviews later), but the architecture should not break if they do

**Detection:**
- Dashboard scrolling stutters or lags
- Dashboard shows mid-session partial data (e.g., Elo rating that has not been committed yet)
- React profiler shows excessive re-renders on dashboard components

**Phase to address:**
Parent dashboard phase -- use snapshot pattern from the start.

---

### Pitfall 9: Profile Switcher Without Authentication Lets Children Access Each Other's Profiles

**What goes wrong:**
A profile switcher that shows all children's names/avatars with a tap-to-switch pattern means any child can switch to a sibling's profile and mess up their progress. Six-year-olds will absolutely do this, either intentionally ("I want to see what my sister unlocked") or accidentally.

**Prevention:**
- Put the profile switcher behind the parental PIN gate -- only parents can switch active child profiles
- The child-facing app shows only the active child's avatar and name with no visible "switch" option
- Profile management (add/edit/delete children) also requires PIN
- Deleting a child profile should require PIN + confirmation ("Type DELETE to confirm") to prevent accidental data loss
- Profile data isolation: switching profiles must be a clean boundary -- no leaked state from previous child's session

**Detection:**
- Child's misconception records show patterns inconsistent with their age/grade (sibling was using their profile)
- Elo rating oscillates wildly (two children of different skill levels sharing a profile)
- Children report seeing unfamiliar avatars or badges

**Phase to address:**
Phase 1 (Multi-child profiles) -- PIN-gating must be designed into the profile switcher from day one.

---

### Pitfall 10: Subscription State Desynchronizes Between RevenueCat and Local Store

**What goes wrong:**
RevenueCat manages subscription state server-side. The app queries entitlements and stores `isPremium: boolean` locally. If the user's subscription expires, the RevenueCat server knows but the local store still says `isPremium: true` until the next entitlement check. The app must check entitlements on every app foreground, but if the check fails (no network), the app must decide: assume still premium (risk of unpaid access) or assume expired (punishes users with connectivity issues).

**Prevention:**
- Check RevenueCat entitlements on every app foreground (`AppState` listener) and on subscription-gated actions
- Cache the last successful entitlement check with a timestamp; treat cached status as valid for 24 hours (grace period)
- If entitlement check fails (network error), use cached status -- do not punish the user
- Never store subscription status in the main Zustand store alongside child data -- use a separate, non-persisted or separately-persisted slice with short TTL
- RevenueCat's `CustomerInfo` listener handles real-time subscription changes; wire it up in the app root
- Handle edge cases: subscription purchased on another device, family sharing, promotional offers, refunds
- The "restore purchases" flow must be accessible and functional for users who reinstall or switch devices

**Detection:**
- User paid but app shows free tier (entitlement check not running)
- User's subscription expired but app still shows premium features (cached status not refreshed)
- "Restore Purchases" button does nothing or throws an error

**Phase to address:**
IAP/Subscription phase -- entitlement synchronization is the core technical challenge.

---

### Pitfall 11: Parent Dashboard Analytics Require Session History That Does Not Exist

**What goes wrong:**
The parent dashboard needs trend graphs (progress over time), skill breakdowns, and misconception timelines. But the current store only tracks CURRENT state: current Elo rating, current BKT mastery, current streak count. There is no session history -- no record of "on March 1, child scored 80% on addition problems." The `sessionsCompleted` counter is just a number; `lastSessionDate` is a single date. To show trends, the app needs historical data that was never collected.

**Prevention:**
- Add a `sessionHistory` array to the per-child data structure: `{ date: string, problemCount: number, correctCount: number, skillsWorked: string[], duration: number }`
- Keep entries lightweight (no full problem replay, just summary stats) to avoid store bloat
- Cap history at 90 days (rolling window) to bound storage growth
- Start collecting session history in the multi-child migration (v13) even before the dashboard is built -- you cannot show historical trends without historical data
- For existing users upgrading: accept that pre-v13 history is not available. Show "tracking started [date]" in the dashboard rather than empty charts
- Consider computing derived analytics (weekly averages, skill trends) as materialized views updated at session commit, not computed on-the-fly from raw history

**Detection:**
- Dashboard shows "no data" for users who have been using the app for months (history not retroactively available)
- Store size grows unboundedly (session history not capped)
- Dashboard load time increases as history grows (computing trends from raw records on every render)

**Phase to address:**
Phase 1 (Multi-child profiles) -- begin collecting session summaries in the schema restructure, even if dashboard phase comes later.

---

## Minor Pitfalls

### Pitfall 12: expo-secure-store Key Format Restrictions

**What goes wrong:**
expo-secure-store only supports keys matching `[A-Za-z0-9.-_]`. If child IDs use UUIDs with other characters, or if per-child secure store keys include special characters, the key gets silently mangled (characters replaced with `_`). Two different child IDs could map to the same secure store key.

**Prevention:**
- Use alphanumeric child IDs (nanoid with custom alphabet `[A-Za-z0-9]`) or UUID v4 (which only uses hex + hyphens, both valid characters)
- The parental PIN should remain a single key (`parental-pin`), not per-child -- there is one parent, one PIN
- Test secure store operations with the actual child ID format before committing to an ID scheme

**Phase to address:** Phase 1 (Multi-child profiles).

---

### Pitfall 13: Adding Child Profiles Without Onboarding Creates Empty Shells

**What goes wrong:**
When a parent adds a second child, the new profile has no skill states, no Elo baseline, no BKT data. The first session defaults to the lowest difficulty with all skills locked. For a child who is already in grade 3, this means they get grade 1 addition problems. The experience feels broken compared to the first child's calibrated experience.

**Prevention:**
- When adding a new child, collect age and grade (as the original onboarding does)
- Use age/grade to set initial BKT parameters (the existing age-adjusted BKT parameters system handles this)
- Unlock prerequisite-appropriate skills based on grade level
- Consider a brief "placement session" (5-10 problems) for new profiles to calibrate Elo faster
- The existing Elo K-factor system (K=40 decaying to K=16) will handle rapid initial calibration if the starting point is grade-appropriate

**Phase to address:** Phase 1 (Multi-child profiles).

---

### Pitfall 14: Subscription Paywall Screen Violates "No Punitive Mechanics" Principle

**What goes wrong:**
Standard paywall design uses scarcity/loss framing: "You've used your 3 free sessions today! Upgrade to continue." For children ages 6-9, this is functionally identical to a "game over" screen -- the app is telling them they cannot do math anymore today. This directly violates the core design principle and creates negative associations with learning.

**Prevention:**
- The session limit message should be shown to the PARENT (behind PIN gate), not the child
- The child-facing message should be positive: "Great job today! Come back tomorrow for more practice!" -- no mention of payment or limits
- The paywall/subscription screen is ONLY accessible to parents (behind PIN) and uses adult-appropriate language
- Never show pricing, subscription terms, or "upgrade" messaging to children
- If a child hits the session limit mid-discovery (exploring manipulative sandboxes, viewing skill map), those non-session features should remain accessible -- only sessions are limited

**Phase to address:** IAP/Subscription phase -- paywall UX must be designed with the child/parent separation in mind.

---

### Pitfall 15: Parent Dashboard Navigation Conflicts with Child Navigation

**What goes wrong:**
The app currently uses a single native-stack navigator. Adding parent dashboard screens (overview, per-child detail, settings, subscription management) to the same stack means the parent can navigate to the dashboard, hand the device to the child, and the child is now in the parent section. Or worse: the child navigates back from a session and lands on a parent dashboard screen.

**Prevention:**
- Use separate navigation stacks: child stack (existing) and parent stack (new), switched via profile/role context
- Parent dashboard entry requires PIN verification, and exiting the parent section returns to the child's last screen
- Consider a bottom tab or drawer that is only visible in parent mode
- Use `usePreventRemove` in parent screens to prevent children from swiping back into dashboard content
- Parent stack should not share navigation history with child stack

**Phase to address:** Parent dashboard phase -- navigation architecture must be designed before building screens.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Multi-child profiles | Migration corrupts existing data | Comprehensive v12 fixture tests; idempotent migration; `useActiveChild()` hook before UI |
| Multi-child profiles | Profile switcher accessible to children | PIN-gate all profile management; child sees only active profile |
| Multi-child profiles | New child gets grade-1 problems regardless of age | Grade-aware initial state; age-adjusted BKT parameters |
| Parent dashboard | No historical data to display | Begin collecting session summaries in v13 migration |
| Parent dashboard | Re-renders from live session data | Snapshot pattern with `getState()`; compute analytics once |
| Parent dashboard | Navigation bleeds into child experience | Separate navigation stacks; PIN-gated entry/exit |
| Parental controls | Time limits trivially bypassed by clock change | Frame as advisory reminders; monotonic elapsed-time tracking |
| Parental controls | Bedtime lockout uses wrong timezone | Use device local time (this IS the correct behavior for bedtime); but validate against monotonic time |
| Freemium subscription | Existing users lose AI tutor access | Grandfather existing users or limit (not gate) free AI tutor |
| Freemium subscription | Paywall shown to children | All subscription UI behind parental PIN; child sees positive "come back tomorrow" message |
| IAP implementation | Cannot test in Expo Go | Set up EAS Build + development builds as pre-work |
| IAP implementation | App Store rejection for Kids Category violations | Parental gate before purchase UI; restore button; clear terms |
| IAP implementation | Subscription state desyncs | RevenueCat listener + 24h cache grace period |
| COPPA compliance | Subscription data treated as non-personal | Keep subscription state separate from child data; disclose RevenueCat in privacy policy |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Multi-child migration:** Often missing deletion of old flat fields from root state -- verify v12 fields are moved, not copied, to nested structure
- [ ] **Multi-child migration:** Often missing `partialize` update -- verify it now includes `children` and `activeChildId`, and REMOVES old flat fields
- [ ] **Profile switcher:** Often missing session state cleanup on switch -- verify mid-session data (queue, tutor state, manipulative state) is cleared when changing active child
- [ ] **Profile switcher:** Often missing PIN protection -- verify profile management requires parental PIN
- [ ] **Parent dashboard:** Often missing empty-state handling -- verify dashboard shows meaningful content for a child who has completed 0 sessions
- [ ] **Parent dashboard:** Often missing multi-child comparison -- verify dashboard can show data for all children, not just active child
- [ ] **Time controls:** Often missing persistence -- verify time-used-today counter persists across app restart (child force-quits to reset timer)
- [ ] **Subscription:** Often missing restore purchases -- Apple WILL reject without a working restore button
- [ ] **Subscription:** Often missing subscription state on cold start -- verify app checks entitlements before showing gated features, not just on subscription change
- [ ] **Subscription:** Often missing parental gate before paywall -- verify subscription UI is only accessible after PIN entry
- [ ] **Freemium gating:** Often missing grandfathering logic -- verify existing users retain previously free features after update
- [ ] **COPPA:** Often missing privacy policy update -- verify RevenueCat and subscription data processing are disclosed
- [ ] **All features:** Often missing per-child data isolation -- verify one child's actions never affect another child's state
- [ ] **All features:** Often missing store migration test with v12 fixture -- verify migration from actual v12 data to v13+ works end-to-end

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Store migration corrupts child data | CRITICAL | Cannot recover lost data. Must ship hotfix with corrected migration + "reset profile" option. Add migration roundtrip tests to prevent recurrence. Previous v12 data may still be recoverable from AsyncStorage if not overwritten. |
| Existing users lose free features | HIGH | Ship immediate update removing the gate or adding grandfathering. Issue app store update notes apologizing. Reputation damage is hard to undo. |
| App Store rejection (Kids Category) | MEDIUM | Fix cited issues (usually parental gate + restore purchases). Resubmit. Each cycle takes 1-3 days. Budget 2-3 rejection cycles into timeline. |
| Subscription state desync | LOW | Force entitlement refresh on next app open. RevenueCat's `syncPurchases()` resolves most cases. Add retry logic. |
| Time controls bypassed | LOW | Accept as inherent limitation. Update UI to frame as "reminders." No technical fix for clock manipulation. |
| Dashboard re-renders cause jank | LOW | Switch from reactive selectors to snapshot pattern. Pure refactor, no data change. |
| Profile data leaks between children | MEDIUM | Audit all `useAppStore` selectors for `activeChildId` scoping. Add integration test that switches profiles and verifies isolation. |
| Navigation confusion (parent/child) | LOW | Add PIN check on parent screen mount. If PIN not verified, redirect to child home. |

## Sources

- [Expo Documentation: In-App Purchases](https://docs.expo.dev/guides/in-app-purchases/) -- confirms development build requirement
- [RevenueCat Expo Installation Guide](https://www.revenuecat.com/docs/getting-started/installation/expo) -- Expo managed workflow compatibility
- [Expo + RevenueCat Tutorial](https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial) -- official Expo blog, confirmed pattern
- [COPPA 2025 Compliance Guide](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/) -- expanded personal information definition
- [FTC COPPA Rule Amendments 2025](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule) -- Federal Register, compliance deadline April 22, 2026
- [Apple Kids Category Guidelines](https://developer.apple.com/kids/) -- parental gate requirements for purchases
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) -- Guideline 1.3 Kids Category
- [Helping Protect Kids Online February 2025](https://developer.apple.com/support/downloads/Helping-Protect-Kids-Online-2025.pdf) -- Apple developer document
- [App Store IAP Review Checklist](https://capgo.app/blog/how-to-pass-app-store-review-iap/) -- common rejection reasons
- [expo-secure-store Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/) -- key format restrictions
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) -- confirms React Native 0.81 compatibility
- Codebase analysis: `appStore.ts` (STORE_VERSION=12, flat partialize), `migrations.ts` (12 additive migrations), `childProfileSlice.ts` (singleton pattern), `skillStatesSlice.ts` (unscoped skillStates), `gamificationSlice.ts` (flat XP/level/streak), all at `C:/projects/tiny-tallies/src/store/`

---
*Pitfalls research for: Multi-child profiles, parent dashboard, parental controls, and freemium IAP subscription in Tiny Tallies (children's math learning app, ages 6-9)*
*Researched: 2026-03-05*
