# Stack Research: v0.8 Multi-Child Profiles, Parent Dashboard, IAP Subscription

**Domain:** Children's math learning app -- multi-child profiles, parent analytics dashboard, parental time controls, freemium subscription with in-app purchases
**Researched:** 2026-03-05
**Confidence:** HIGH

## Executive Summary

v0.8 requires **three new npm dependencies**: `react-native-purchases` (RevenueCat for IAP/subscriptions), `react-native-purchases-ui` (pre-built paywall screens), and `react-native-gifted-charts` (analytics charts for parent dashboard). Everything else -- multi-child profile architecture, parental time controls, subscription state gating -- is pure Zustand/TypeScript architecture work on top of existing libraries. The current single-child store design needs a fundamental restructuring to support per-child isolated state, which is the most architecturally significant change in this milestone.

## Recommended Stack

### New Dependencies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-native-purchases | ^9.11 | IAP subscription management (Apple/Google) | RevenueCat is the industry standard for mobile subscriptions. Handles receipt validation, subscription status, cross-platform parity, renewal/cancellation, and App Store/Play Store compliance server-side. Expo-first integration with config plugin. Eliminates months of native IAP plumbing. Free tier covers up to $2.5K MTR. |
| react-native-purchases-ui | ^9.11 | Pre-built paywall and customer center UI | RevenueCat's paywall components handle subscription presentation, product display, pricing localization, and restore purchases flow. Dramatically reduces paywall UI development time. Customizable templates. |
| react-native-gifted-charts | ^1.4 | Line/bar/pie charts for parent analytics dashboard | Only peer deps are react-native-svg (already at 15.12.1) and expo-linear-gradient (already at ~15.0.7) -- zero new transitive dependencies. Pure JS (no native code), works in Expo managed workflow. Supports animated transitions, tooltips, gradient fills, and responsive sizing. Feature-rich enough for progress-over-time line charts, skill mastery bar charts, and session distribution pie charts. |

### Existing Dependencies (No Changes, New Usage)

| Technology | Version | New Usage in v0.8 | Notes |
|------------|---------|-------------------|-------|
| zustand | ^5.0.8 | Multi-child profile architecture: per-child state isolation, profile switcher, new parentalSlice, subscriptionSlice | Major architectural rework of store partitioning -- not a library change but the biggest technical effort |
| expo-secure-store | ^15.0.7 | Store parental PIN (already used), RevenueCat API key | Sensitive data storage; already integrated for COPPA consent gate |
| expo-notifications | ~0.32.15 | Break reminders, session time warnings, bedtime lockout alerts | Already installed and configured in app.json plugins; used for daily challenge reminders in v0.7 |
| react-native-svg | 15.12.1 | Chart rendering (peer dep of gifted-charts), progress visualizations | Already installed; gifted-charts renders via SVG |
| expo-linear-gradient | ~15.0.7 | Chart gradient fills (peer dep of gifted-charts), dashboard backgrounds | Already installed |
| @react-navigation/native-stack | ^7.8.2 | Parent dashboard screens, profile management screens, subscription screens | Standard navigation; add new screens to navigation tree |
| zod | ^4.1.13 | Validation of profile data, subscription state, parental control config | Runtime validation at boundaries |
| expo-dev-client | ~6.0.18 | Required for testing IAP (purchases don't work in Expo Go) | Already installed; EAS Build needed for IAP testing |
| @react-native-async-storage/async-storage | ^2.2.0 | Per-child state persistence (keyed by child profile ID) | May need multiple storage keys or namespaced approach for multi-child |

### Development Tools (No Changes)

| Tool | Purpose | Notes |
|------|---------|-------|
| Jest + jest-expo | Test subscription state logic, profile switching, parental controls, chart data transforms | Pure function services are highly testable; mock RevenueCat SDK in tests |
| TypeScript strict mode | Type-safe profile/subscription/control types | Discriminated unions for subscription tiers, profile states |
| EAS Build | Required for IAP testing on physical devices | `eas build --profile development` for dev client with native IAP modules |

## Installation

```bash
# New dependencies
npx expo install react-native-purchases react-native-purchases-ui react-native-gifted-charts

# No new dev dependencies needed
```

### app.json Plugin Configuration

Add RevenueCat config plugin:

```json
{
  "plugins": [
    "react-native-purchases"
  ]
}
```

RevenueCat's config plugin auto-configures the native billing modules (StoreKit on iOS, Google Play Billing on Android) during `expo prebuild`.

## Feature-to-Stack Mapping

### 1. Multi-Child Profiles

**New libraries:** None. Pure Zustand architecture.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Profile data model | Zustand `profilesSlice` | `Record<string, ChildProfile>` with `activeProfileId`. Each child gets unique UUID. |
| Per-child state isolation | Zustand store keying or namespace pattern | All existing slices (skills, sessions, achievements, misconceptions, challenges) become per-child. Two approaches: (A) single store with `childId` keys on all data, or (B) store-per-child with dynamic persistence key. Approach A is simpler. |
| Profile switcher UI | React Navigation modal + existing avatar components | Profile list with avatar circles, add/edit/delete, PIN-protected |
| Profile CRUD | Zustand actions + AsyncStorage | Create profile with name/age/grade/avatar, generates fresh initial state for all slices |
| Store migration | STORE_VERSION 12 -> 13 | Wrap existing single-child state into first profile entry. Most complex migration to date. |

### 2. Parent Dashboard

**New libraries:** react-native-gifted-charts.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Progress overview | react-native-gifted-charts `LineChart` | Sessions completed over time, XP growth, streak history per child |
| Skill analytics | react-native-gifted-charts `BarChart` | Mastery levels across skill categories (addition, subtraction), reading from BKT state |
| Misconception breakdown | react-native-gifted-charts `PieChart` or `BarChart` | Confirmed vs resolved misconceptions by category |
| Session history | FlatList (standard RN) | Scrollable list of past sessions with date, score, duration |
| Data aggregation | Pure TypeScript service | `dashboardDataService.ts` transforms raw store state into chart-ready data structures |
| Child selector | Profile avatar tabs at top of dashboard | Quick switch between children's analytics |
| PIN-protected access | Existing parental PIN gate | Dashboard is parent-only; reuse COPPA consent gate pattern |

### 3. Parental Time Controls

**New libraries:** None. Zustand + expo-notifications.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Time control config | New `parentalSlice` in Zustand | `dailyTimeLimitMinutes`, `bedtimeHour`, `breakIntervalMinutes`, `breakDurationMinutes` |
| Session time tracking | `Date.now()` diffs in session orchestrator | Track cumulative daily session time; compare against limit |
| Time limit enforcement | Session start guard + mid-session check | Block session start if daily limit reached; show friendly "come back tomorrow" screen |
| Bedtime lockout | Time comparison on app foreground + session start | Check current hour against bedtime config; show sleep-themed lockout screen |
| Break reminders | expo-notifications local notifications | Schedule break notification after configured interval using `TimeIntervalTriggerInput` |
| Session timer display | Reanimated animated text (already available) | Optional countdown shown to child during sessions |
| Config persistence | Zustand persist (per-profile or global) | Controls are per-child (different bedtimes for different ages) |

### 4. Freemium Subscription

**New libraries:** react-native-purchases, react-native-purchases-ui.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Subscription SDK init | `Purchases.configure({ apiKey })` | Initialize on app launch with RevenueCat API key from expo-secure-store or env |
| Subscription tiers | RevenueCat Offerings + Products | Free tier: 3 sessions/day, no AI tutor, default theme only. Premium tier: unlimited sessions, AI tutor, all themes. |
| Paywall screen | `react-native-purchases-ui` `RevenueCatUI.Paywall` | Pre-built, App Store compliant paywall with product cards, pricing, terms. Customizable via RevenueCat dashboard. |
| Purchase flow | `Purchases.purchasePackage()` | Handles Apple/Google payment sheets natively |
| Restore purchases | `Purchases.restorePurchases()` | Required by App Store guidelines; RevenueCat handles receipt validation |
| Subscription state | New `subscriptionSlice` in Zustand + RevenueCat listener | `CustomerInfo` listener updates local state on subscription changes. Store caches subscription status for offline access. |
| Feature gating | Pure function: `canAccess(feature, subscriptionTier)` | Centralized access control. Check before AI tutor invocation, session start (count check), theme unlock. |
| Session counting | Extend session tracking in store | Count sessions per day for free tier limit. Reset daily. |
| Customer Center | `react-native-purchases-ui` `RevenueCatUI.CustomerCenter` | Pre-built subscription management (cancel, change plan, billing issues) |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| IAP/Subscriptions | RevenueCat (react-native-purchases) | expo-iap | expo-iap is newer and less battle-tested; RevenueCat has 10+ years of IAP infrastructure, handles receipt validation server-side, provides analytics dashboard, and has proven Expo integration. expo-iap still notes subscriptions need "careful testing." |
| IAP/Subscriptions | RevenueCat | Manual StoreKit/Play Billing | Months of native plumbing, receipt validation server, edge cases (family sharing, grace periods, refunds). RevenueCat solves all of this. |
| IAP/Subscriptions | RevenueCat | Adapty | Adapty is solid but RevenueCat has larger community, better Expo docs, and official Expo partnership (featured on expo.dev blog). |
| Charts | react-native-gifted-charts | victory-native | Victory-native v41 requires @shopify/react-native-skia as peer dependency. Skia adds ~2MB native binary, introduces a new rendering pipeline, and has known compatibility issues with Expo 53/54. Gifted-charts uses react-native-svg (already installed) with zero new native deps. |
| Charts | react-native-gifted-charts | react-native-chart-kit | Chart-kit is older (last meaningful update 2022), less actively maintained, limited animation support, and fewer chart types. Gifted-charts is actively maintained (v1.4.57 released recently), has better animation, and more chart variety. |
| Charts | react-native-gifted-charts | Custom SVG charts | Building chart components from scratch on react-native-svg is possible but slow. A parent dashboard needs line charts with multiple data series, tooltips, axis labels, animations -- gifted-charts provides all this out of the box. |
| Charts | react-native-gifted-charts | recharts / nivo | Web-only libraries. Do not work with React Native. |
| Multi-child state | Keyed state in single store | Separate store per child | Multiple stores complicate shared state (parental controls, subscription status), migration logic, and profile switching UX. A single store with per-child namespacing is simpler and aligns with existing Zustand patterns. |
| Multi-child state | Keyed state in single store | AsyncStorage key-per-child | Loses Zustand reactivity benefits. Profile switching would require full store rehydration, causing UI flicker and complexity. |
| Parental controls | expo-notifications (local) | expo-background-fetch | Background fetch is for periodic data sync, not time enforcement. Local notifications + foreground time checks are sufficient. Background enforcement would require native modules and battery impact. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| expo-iap | Newer, less mature, subscription edge cases still being worked out, smaller community | react-native-purchases (RevenueCat) |
| @shopify/react-native-skia | Heavy native dependency (~2MB), compatibility issues with Expo SDK 54, only needed if using victory-native | react-native-svg (already installed) via react-native-gifted-charts |
| victory-native | Requires Skia peer dependency; adds significant bundle size and native complexity for a parent dashboard that doesn't need GPU-accelerated rendering | react-native-gifted-charts (SVG-based, zero new native deps) |
| react-native-chart-kit | Stale maintenance, limited customization, weaker animation support | react-native-gifted-charts |
| Any backend/server for IAP | RevenueCat provides the backend (receipt validation, subscription status API, webhooks) | RevenueCat cloud service (free tier: up to $2.5K MTR) |
| react-native-background-timer | Not needed for time controls; foreground checks + notifications are sufficient; adds native dependency | Date.now() comparisons + expo-notifications |
| FlashList v2.x | Crashes on RN 0.81 (per CLAUDE.md guardrail) | FlatList or FlashList v1.x for any long lists in dashboard |
| expo-in-app-purchases | Deprecated Expo package, removed from SDK | react-native-purchases (RevenueCat) |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-native-purchases@^9.11 | React Native >= 0.73.0 | RN 0.81.5 is well above minimum. Config plugin works with Expo managed workflow via expo-dev-client. |
| react-native-purchases-ui@^9.11 | react-native-purchases@^9.11 | Must match major version with react-native-purchases. Same config plugin. |
| react-native-gifted-charts@^1.4 | react-native-svg@15.x, expo-linear-gradient@~15.x | Both already installed at compatible versions. Pure JS -- no native code, no Expo SDK version constraints. |
| react-native-gifted-charts@^1.4 | React Native 0.81.5 | Peer dep is react-native >=0.64. Well within range. |
| expo-notifications@~0.32.15 | Expo SDK 54 | Already installed and configured. DailyTriggerInput and TimeIntervalTriggerInput available. |
| zustand@^5.0.8 | AsyncStorage@^2.2.0 | Existing persist middleware pattern. Multi-child keying is a data structure change, not a library compatibility concern. |

## Integration Points

### RevenueCat Setup Requirements

1. **RevenueCat account** -- Create project at app.revenuecat.com
2. **App Store Connect** -- Create subscription product IDs, configure pricing
3. **Google Play Console** -- Create subscription product IDs, configure pricing
4. **API keys** -- Store per-platform API keys in expo-secure-store (not .env, per guardrails)
5. **Entitlements** -- Configure "premium" entitlement in RevenueCat dashboard mapping to subscription products
6. **EAS Build** -- Required for testing; IAP does not work in Expo Go

### Feature Gating Architecture

```
Free Tier:                          Premium Tier:
- 3 sessions/day                    - Unlimited sessions
- No AI tutor                       - Full AI tutor (HINT/TEACH/BOOST)
- Default theme only                - All 5 themes unlocked
- Core gamification (XP, streaks)   - All gamification features
- 1 child profile                   - Up to 5 child profiles
```

Gating implemented as pure function checking subscription status from store -- no network call at gate time.

### Multi-Child Store Migration Strategy

The v12 -> v13 migration is the most complex yet:
1. Current flat state (childName, childAge, skills, sessions, etc.) gets wrapped into `profiles[defaultId]`
2. New `activeProfileId` field points to the migrated profile
3. All slice data (skills, achievements, misconceptions, challenges) moves under profile namespace
4. Shared state (parental controls, subscription status, parental PIN) stays at root level

### With Existing Systems

| Existing System | Integration Point | How |
|----------------|-------------------|-----|
| Session orchestrator | Free tier session count check | Guard at session start: check daily count vs limit |
| AI tutor (Gemini) | Premium gate | Check subscription before enabling HelpButton; show upgrade prompt for free users |
| Theme system | Premium gate | Free users get default theme; premium unlocks all 5 |
| Achievement system | Per-child isolation | Badge evaluation reads from active child's state |
| BKT/Leitner | Per-child isolation | Skill mastery and spaced repetition are per-child |
| COPPA parental PIN | Reuse for dashboard access + profile management | Same PIN gate; already implemented |
| Misconception tracking | Per-child isolation + parent dashboard | Per-child data feeds into dashboard analytics |

## Sources

- [RevenueCat Expo Installation Docs](https://www.revenuecat.com/docs/getting-started/installation/expo) -- Expo managed workflow setup, config plugin
- [Expo IAP Guide](https://docs.expo.dev/guides/in-app-purchases/) -- Expo's official IAP guidance, recommends RevenueCat
- [Expo + RevenueCat Tutorial (Expo Blog)](https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial) -- Official Expo partnership, step-by-step integration
- [react-native-purchases npm](https://www.npmjs.com/package/react-native-purchases) -- v9.11.1, min RN 0.73.0
- [react-native-gifted-charts npm](https://www.npmjs.com/package/react-native-gifted-charts) -- v1.4.57, peer deps verified (react-native-svg, expo-linear-gradient)
- [react-native-gifted-charts GitHub](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) -- Expo compatibility confirmed, pure JS
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/) -- Local scheduled notifications API
- [Victory Native Skia Issue](https://github.com/FormidableLabs/victory-native-xl/issues/616) -- Skia v2 compatibility problems, confirms heavy dependency
- Existing codebase: `src/store/slices/childProfileSlice.ts` (current single-child model), `src/store/appStore.ts` (STORE_VERSION=12), `app.json` (existing plugins)

---
*Stack research for: Tiny Tallies v0.8 Multi-Child Profiles, Parent Dashboard, IAP Subscription*
*Researched: 2026-03-05*
