# Project Research Summary

**Project:** Tiny Tallies v0.8 — Multi-Child Profiles, Parent Dashboard, IAP Subscription
**Domain:** Children's education app monetization and family profile management
**Researched:** 2026-03-05
**Confidence:** HIGH

## Executive Summary

Tiny Tallies v0.8 introduces four interconnected capabilities: multi-child profiles, a parent analytics dashboard, parental time controls, and a freemium subscription model via in-app purchases. The dominant technical challenge is restructuring the Zustand store from a flat single-child architecture (12 versions of additive migrations) to a multi-child keyed structure. This store migration is the riskiest change in the project's history -- every slice, selector, and persistence mechanism assumes a single child. The recommended approach is a "copy-on-switch" pattern: keep existing slice interfaces unchanged, wrap all per-child data under a `children: Record<childId, ChildData>` map, and hydrate/dehydrate flat state on profile switch. This preserves all existing tests and screen components without modification.

The monetization layer uses RevenueCat (react-native-purchases) for IAP/subscription management -- the industry standard for mobile subscriptions with proven Expo compatibility. The only other new dependency is react-native-gifted-charts for parent dashboard visualizations, which uses already-installed react-native-svg with zero new native code. All other features (time controls, session history, analytics, feature gating) are pure TypeScript/Zustand architecture work on existing libraries.

The three highest risks are: (1) the v12-to-v13 store migration corrupting existing user data during the structural reshape, (2) existing users losing previously-free features (AI tutor, themes) when freemium gating is introduced, and (3) Apple Kids Category rejection due to missing parental gates on subscription UI. Mitigation requires comprehensive migration fixture tests, grandfathering logic for existing users, and designing all payment-related UI behind the parental PIN gate from day one.

## Key Findings

### Recommended Stack

Only three new npm dependencies are needed. Everything else builds on the existing stack.

See full details: `.planning/research/STACK.md`

**New dependencies:**
- **react-native-purchases ^9.11**: RevenueCat IAP/subscription management -- handles receipt validation, cross-platform restore, subscription analytics server-side. Free under $2.5K MRR. Confirmed compatible with Expo SDK 54 / RN 0.81.
- **react-native-purchases-ui ^9.11**: Pre-built paywall and customer center UI -- reduces subscription screen development time significantly. Customizable via RevenueCat dashboard.
- **react-native-gifted-charts ^1.4**: Line/bar/pie charts for parent dashboard -- pure JS, uses already-installed react-native-svg and expo-linear-gradient as peer deps. Zero new native code.

**Key rejections:** victory-native (requires Skia, ~2MB native binary, Expo compatibility issues), expo-iap (less mature, no server-side receipt validation), chart-kit (stale, limited animation).

**Critical constraint:** IAP requires EAS Build development builds. Purchases do not work in Expo Go. This must be set up before IAP work begins.

### Expected Features

See full details: `.planning/research/FEATURES.md`

**Must have (table stakes):**
- Multi-child profile switcher with independent progress tracking per child
- Profile CRUD (add/edit/delete children, max 5)
- Parent dashboard with progress overview and skill analytics per child
- Daily session time limit (configurable by parent per child)
- Subscription paywall with clear free vs premium tiers
- Restore purchases (App Store requirement -- rejection risk if missing)
- Free tier with meaningful daily practice value (3 sessions, all skills, all manipulatives)

**Should have (differentiators):**
- Misconception analytics for parents -- no competitor surfaces specific reasoning errors
- Trend graphs over time -- most competitors show snapshots, not trajectories
- Bedtime lockout schedule -- built-in without requiring system-level parental controls
- Break reminders during sessions -- research-backed focus management for ages 6-9
- Single family subscription covering all children (simpler than per-child pricing)

**Defer (post-v0.8):**
- Push notifications to parents (requires server infrastructure)
- Cross-device data sync (requires cloud backend)
- Detailed session replays (high storage cost, moderate value)

**Anti-features (explicitly do NOT build):**
- Ads in free tier (COPPA violation risk)
- Upselling UI shown to children (FTC complaint risk, violates design principles)
- Child-visible subscription status or locked-feature indicators
- Cross-child comparisons in parent dashboard
- Push notifications to children

### Architecture Approach

The recommended architecture uses a "copy-on-switch" pattern for multi-child support: a single Zustand store with a `children: Record<childId, ChildData>` map and an `activeChildId` pointer. The active child's data lives in the existing flat store shape during use (preserving all existing slice interfaces and selectors unchanged), and gets serialized back to the children map on profile switch or app background. Three new slices are needed: `profilesSlice` (children map management), `parentControlsSlice` (per-child time/bedtime config), and `subscriptionSlice` (ephemeral IAP state, NOT persisted). Subscription state is intentionally ephemeral -- RevenueCat is the source of truth, queried on every app foreground, with a 24-hour offline grace period.

See full details: `.planning/research/ARCHITECTURE.md`

**Major components:**
1. **profilesSlice** — Children map, activeChildId, switchChild (hydrate/dehydrate), auto-save on background
2. **parentControlsSlice** — Per-child daily time cap, bedtime window, break interval configuration
3. **subscriptionSlice** — Ephemeral subscription tier and entitlements (NOT persisted in AsyncStorage)
4. **subscriptionService** — RevenueCat lifecycle: init, purchase, restore, entitlement listener
5. **paywallGuard** — Pure function `canAccess(feature, tier)` for defense-in-depth feature gating
6. **dashboardAnalytics** — Pure computation from session history; on-demand, not pre-computed
7. **timeControlService** — Enforcement logic: daily cap check, bedtime comparison, break scheduling
8. **ParentNavigator** — Nested navigation stack accessed after PIN verification

**Store migrations:** v12->v13 (multi-child restructure), v13->v14 (parent controls), v14->v15 (session history bootstrap). Three migration hops matching three natural phase boundaries.

### Critical Pitfalls

See full details: `.planning/research/PITFALLS.md`

1. **Store migration v12->v13 is a structural reshape, not additive** — All 12 prior migrations were "add field with default." This one MOVES existing data into a nested structure. Must delete old flat fields after copying, ensure idempotency, and test with three fixture scenarios (fresh install, full v12 state, minimal v12 state). Migration bugs risk total data loss with no recovery path.

2. **Existing users lose previously-free features** — AI tutor has been free since v0.5, themes since v0.7. Gating these behind premium violates user trust and the "no paywall" design principle. Must grandfather existing users or restructure the free/premium split so premium adds NEW capabilities only, not restrictions on existing ones.

3. **Apple Kids Category + subscription = heightened review scrutiny** — Kids Category apps require parental gate before ANY purchase UI, visible subscription terms before the buy button, and a working restore purchases button. Missing any causes rejection. Budget 2-3 rejection cycles into the timeline.

4. **Profile switching during active session corrupts data** — Session flow accumulates Elo/XP changes in refs and commits atomically at session end. Switching profiles mid-session commits one child's results to another child's data. Must guard `switchChild` with `isSessionActive` check and hide the switcher during sessions.

5. **COPPA 2025 amendments expand scope** — Compliance deadline April 22, 2026. Subscription data linked to child profiles may trigger expanded "personal information" requirements. Keep subscription state entirely separate from child learning data. Disclose RevenueCat in privacy policy.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Multi-Child Store Foundation
**Rationale:** Everything depends on this. The store restructure is a prerequisite for per-child dashboard, per-child time controls, and per-child session counting for free tier limits. This is also the highest-risk change -- isolating it allows focused testing before building features on top.
**Delivers:** `profilesSlice` with children map, `switchChild` action, v12->v13 migration, `useActiveChild` hook, `useSaveActiveChild` auto-save hook, `ChildData` type definition, session history schema (begin collecting before dashboard exists).
**Addresses:** Multi-child profile architecture, per-child state isolation.
**Avoids:** Pitfall 1 (flat store assumption), Pitfall 2 (structural migration), Pitfall 11 (no historical data -- start collecting early).

### Phase 2: Profile Management UI
**Rationale:** With the store foundation in place, build the user-facing profile management. This validates the copy-on-switch pattern with real UI interaction before layering analytics on top.
**Delivers:** ProfileSwitcherScreen, AddChildScreen, ChildSwitcher component on HomeScreen, PIN-gated profile management, grade-aware initial state for new children.
**Addresses:** Profile switcher on home screen, add/edit/delete children.
**Avoids:** Pitfall 9 (children accessing siblings' profiles -- PIN-gate from day one), Pitfall 13 (empty new-child profiles -- grade-aware initialization).

### Phase 3: Session History and Analytics Engine
**Rationale:** The parent dashboard needs historical data to display anything beyond current-state snapshots. Session history must accumulate before the dashboard can show trends. Building the data layer and computation engine before the UI ensures the dashboard has real data to render.
**Delivers:** SessionHistoryEntry type, append-on-session-complete logic (capped at 200 entries), dashboardAnalytics service (pure computation), trendCalculator service.
**Addresses:** Trend graphs requirement, session history logging.
**Avoids:** Pitfall 11 (no historical data for dashboard).

### Phase 4: Parent Dashboard
**Rationale:** With multi-child data and session history in place, the dashboard can now display meaningful analytics. Builds on Phase 1 (children map for all-children view) and Phase 3 (historical data for trends).
**Delivers:** ParentNavigator (nested stack), ParentDashboardScreen, ChildProgressScreen, ProgressChart, MisconceptionBreakdown, TrendLine, SessionHistoryList components.
**Uses:** react-native-gifted-charts for chart rendering.
**Avoids:** Pitfall 8 (re-renders -- use snapshot pattern with `getState()`), Pitfall 15 (navigation confusion -- separate parent stack with PIN gate).

### Phase 5: Parental Time Controls
**Rationale:** Time controls are configured within the parent dashboard flow and require per-child data isolation (different limits per child). Placing this after the dashboard means the configuration UI naturally lives inside the parent navigator.
**Delivers:** parentControlsSlice, v13->v14 migration, timeControlService, useTimeControls hook, TimeControlsScreen, daily cap enforcement, bedtime lockout, break reminders via expo-notifications.
**Addresses:** Daily session time limit, bedtime lockout, break reminders.
**Avoids:** Pitfall 7 (bypassable controls -- frame as advisory, use monotonic elapsed-time tracking).

### Phase 6: Freemium Subscription and IAP
**Rationale:** Subscription gating is purely additive -- it layers access controls on top of working features. Building it last means all features can be tested ungated first, and IAP integration issues do not block other work. Also requires resolving the grandfathering product decision before implementation.
**Delivers:** RevenueCat integration, subscriptionSlice (ephemeral), subscriptionService, paywallGuard, SubscriptionScreen (paywall), useSubscription hook, useSessionCounter hook, feature gating on AI tutor/themes/sessions/analytics, v14->v15 migration.
**Uses:** react-native-purchases, react-native-purchases-ui.
**Avoids:** Pitfall 3 (Expo Go limitation -- EAS Build pre-work), Pitfall 4 (Kids Category rejection -- parental gate on all purchase UI), Pitfall 5 (losing free features -- grandfather existing users), Pitfall 6 (COPPA -- separate subscription from child data), Pitfall 10 (state desync -- ephemeral state + RevenueCat listener), Pitfall 14 (punitive paywall -- child-friendly messaging).

### Phase Ordering Rationale

- **Phase 1 before everything:** The children map is the data foundation. No per-child feature works without it.
- **Phase 2 immediately after Phase 1:** Validates the store restructure with real user interaction before building analytics.
- **Phase 3 before Phase 4:** Dashboard needs data to display. Starting history collection early maximizes available data by the time the dashboard ships.
- **Phase 4 before Phase 5:** Time control configuration UI lives inside the parent dashboard navigator.
- **Phase 6 last:** Feature gating is additive. Testing ungated features first is faster and cleaner. IAP has external dependencies (RevenueCat account, App Store Connect, Play Console setup, EAS Build) that benefit from parallel preparation while other phases execute.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** The v12->v13 migration needs careful field-by-field mapping from the actual codebase. Research the exact fields in `partialize` and all slice interfaces to build the `PER_CHILD_FIELDS` constant. The copy-on-switch pattern must be validated against the full list of per-child state.
- **Phase 6:** RevenueCat SDK integration patterns, Apple sandbox testing setup, Google Play internal test tracks, Kids Category review requirements, and the grandfathering product decision all need phase-level research. EAS Build pipeline setup is a prerequisite.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Standard CRUD UI + React Navigation screens. Well-documented patterns.
- **Phase 3:** Pure TypeScript data transformation services. No external dependencies or complex patterns.
- **Phase 4:** Standard chart rendering with react-native-gifted-charts. Well-documented API. Parent navigation is a standard nested stack.
- **Phase 5:** Straightforward time comparison logic + expo-notifications local scheduling (already used in v0.7 for daily challenge reminders).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only 3 new dependencies, all verified compatible with Expo SDK 54 / RN 0.81. RevenueCat has official Expo partnership and documentation. react-native-gifted-charts uses already-installed peer deps. |
| Features | HIGH | Competitive analysis covers SplashLearn, Prodigy, Khan Academy with current pricing. Feature split (free vs premium) is benchmarked against industry medians. Anti-features clearly identified with COPPA/FTC rationale. |
| Architecture | HIGH | Copy-on-switch pattern well-reasoned against alternatives (separate stores, dynamic persist keys). Existing codebase analyzed in detail (36+ files with useAppStore selectors, 12 migration versions, all 9 slices). Migration strategy includes concrete code examples. |
| Pitfalls | HIGH | 15 pitfalls identified across critical/moderate/minor severity with prevention strategies and phase assignments. COPPA 2025 amendments researched with compliance deadline (April 22, 2026). Recovery strategies documented for each critical pitfall. |

**Overall confidence:** HIGH

### Gaps to Address

- **Grandfathering product decision:** Research identifies the risk of losing free features but the exact free/premium split for existing users needs a product decision before Phase 6 implementation. Options: (a) full grandfather for pre-v0.8 users, (b) limited free AI tutor (3 uses/day) instead of full gating, (c) premium-only themes are NEW themes, existing earned themes stay free. This decision affects feature gating implementation and must be resolved during Phase 6 planning.
- **Pricing validation:** Proposed $5.99/mo / $49.99/yr is research-informed but untested. Consider A/B testing via RevenueCat's experiment features post-launch.
- **EAS Build pipeline:** The team needs development builds for IAP testing. This is infrastructure work that should be prepared during Phases 4-5 so it is ready for Phase 6.
- **RevenueCat account and store setup:** Creating the RevenueCat project, configuring products in App Store Connect and Play Console, and setting up entitlements requires lead time. Start this during Phase 4-5 so it is ready for Phase 6.
- **Privacy policy update:** COPPA compliance requires disclosing RevenueCat as a data processor before the subscription feature ships. Legal review may be needed. Must be completed before Phase 6 ships.
- **Free tier profile limit:** Research suggests 2 profiles free, 5 premium. This limit needs product validation -- too restrictive risks conversion friction; too generous removes upgrade incentive.

## Sources

### Primary (HIGH confidence)
- [RevenueCat Expo Installation Docs](https://www.revenuecat.com/docs/getting-started/installation/expo) -- Expo managed workflow setup
- [Expo IAP Guide](https://docs.expo.dev/guides/in-app-purchases/) -- official Expo IAP guidance
- [Expo + RevenueCat Tutorial](https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial) -- official Expo partnership
- [Apple Kids Category Guidelines](https://developer.apple.com/kids/) -- parental gate requirements
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) -- Guideline 1.3
- [COPPA 2025 Compliance Guide](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/)
- [FTC COPPA Rule Amendments 2025](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)

### Secondary (MEDIUM confidence)
- [react-native-gifted-charts GitHub](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) -- Expo compatibility, peer deps
- [react-native-purchases npm](https://www.npmjs.com/package/react-native-purchases) -- version compatibility
- [Khan Academy Parent Dashboard](https://support.khanacademy.org/hc/en-us/articles/360039664491) -- competitor feature analysis
- [SplashLearn Parent Features](https://www.splashlearn.com/features/parents) -- competitor feature analysis
- [Prodigy Parent Dashboard](https://prodigygame.zendesk.com/hc/en-us/articles/115001744726) -- competitor feature analysis
- [Education App Revenue Benchmarks](https://www.mirava.io/blog/subscription-benchmarks-education-apps) -- median annual price $44.99

### Codebase Analysis
- `src/store/appStore.ts` (STORE_VERSION=12, flat partialize with all child fields at root)
- `src/store/migrations.ts` (12 additive migrations, all null-coalesce pattern)
- `src/store/slices/` (9 slices, all assuming single-child flat state)
- `src/services/consent/parentalPin.ts` (existing PIN gate, reusable for parent dashboard)
- `app.json` (existing plugins configuration)

---
*Research completed: 2026-03-05*
*Ready for roadmap: yes*
