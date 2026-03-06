# Feature Landscape

**Domain:** Multi-child profiles, parent dashboard, time controls, and freemium IAP subscription for children's math learning app (ages 6-9)
**Researched:** 2026-03-05
**Confidence:** HIGH

## Table Stakes

Features parents expect from any children's education app that supports multiple children and charges a subscription. Missing these makes the product feel incomplete compared to SplashLearn, Prodigy, and Khan Academy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multi-child profile switcher | SplashLearn family plan supports up to 3 kids. Prodigy has per-child accounts. Parents with 2-3 children in the target age range need independent progress tracking per child. Without this, families must use separate devices or lose progress switching. | HIGH | Current architecture is single-child: one flat `childProfileSlice` with `childName/childAge/childGrade`, one `skillStatesSlice`, one `gamificationSlice`, one `misconceptionSlice`. Moving to multi-child requires either (a) namespacing all per-child state under a `children: Record<childId, ChildState>` with an `activeChildId` selector, or (b) separate persisted stores per child. Option (a) is cleaner with Zustand. Needs STORE_VERSION migration to restructure entire store. This is the highest-risk feature -- a migration of all existing single-child data into the multi-child structure. |
| Add/edit/delete child profiles | Parents need to manage children: add a new child, update age/grade as child grows, remove a profile if no longer needed. Standard in every multi-child app. | MEDIUM | Profile CRUD operations. Add creates new child entry with defaults. Edit updates name/age/grade/avatar. Delete requires parental PIN confirmation (safety net against child accidentally deleting sibling's progress). Max 5 children per family is reasonable limit (SplashLearn uses 3). |
| Profile switcher on home screen | Quick switching without navigating deep menus. Khan Academy shows child avatars at top of parent dashboard. SplashLearn Parent Connect shows all children in a list. | LOW | Avatar row or dropdown on home screen. Each avatar shows child's name and current level. Tap to switch `activeChildId`. Must be gated behind parental PIN if the child could switch to a sibling's profile and mess with their progress. |
| Parent dashboard: progress overview | SplashLearn shows "last week's progress" and "overall Math Score." Prodigy shows "recent activity" with topics and correctness. Khan Academy shows "Activity Overview Report." Parents need at-a-glance understanding of how each child is doing. | MEDIUM | Summary cards per child: sessions completed this week, problems attempted/correct, current level/XP, weekly streak status, active skills. Data already exists in `skillStatesSlice` (BKT mastery per skill), `gamificationSlice` (XP, level, streak), and `sessionStateSlice`. This is primarily a read-only view composing existing data. |
| Parent dashboard: skill analytics | Prodigy shows "grade level your child is performing at" and "Report Card with breakdown by skill." SplashLearn shows "mastery of skills" and "trouble spots." Parents want to know WHAT their child is learning, not just how much. | MEDIUM | Per-skill mastery display using existing BKT P(L) values. Group by category (addition/subtraction). Show mastered vs in-progress vs struggling skills. Leverage existing prerequisite DAG for visual context. Color-coded mastery levels. |
| Daily session time limit | Every major parental control app (Boomerang, Apple Screen Time, Google Family Link) offers daily time limits. Parents expect educational apps to support self-limiting. American Academy of Pediatrics recommends managing screen time even for educational content. | MEDIUM | Timer service tracking cumulative session time per day. When limit reached, show friendly "Time's up for today!" screen. Must persist across app restarts (store daily elapsed time). Default off -- parent opts in via dashboard. Suggested presets: 15/30/45/60 minutes. |
| Subscription paywall for premium features | SplashLearn ($7.99-$11.99/mo), Prodigy (~$60/yr), Education.com (tiered). Freemium with clear free tier is standard monetization for children's education apps. Parents expect to try before buying. | HIGH | RevenueCat integration (Expo-compatible, handles receipt validation, cross-platform). Subscription state persisted and synced. Paywall screen showing free vs premium comparison. Must comply with COPPA: all purchase flows require parental interaction, no upselling to children. |
| Restore purchases | Apple and Google both require restore functionality. Users switch devices, reinstall, etc. Without restore, subscriptions appear lost. App store review rejection risk. | LOW | RevenueCat handles this automatically via `restorePurchases()`. Need a "Restore Purchases" button in parent settings. |
| Free tier with meaningful functionality | Khan Academy Kids is 100% free. SplashLearn and Prodigy offer substantial free tiers. If the free tier feels crippled, parents uninstall rather than subscribe. The free tier IS the conversion funnel. | LOW (design) | Design decision, not implementation complexity. Free tier must provide real daily practice value: 3 sessions/day, all 14 skills, full adaptive engine, all manipulatives. Premium adds: unlimited sessions, AI tutor, all themes, parent analytics. The math learning must not be paywalled. |

## Differentiators

Features that set Tiny Tallies apart from competitors. Not universally expected, but high-value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Misconception analytics for parents | No major competitor shows parents WHAT misconceptions their child has (e.g., "forgets to carry in addition"). Prodigy shows grade level, SplashLearn shows skill mastery, but neither surfaces the specific reasoning errors. Tiny Tallies already tracks misconceptions with the Bug Library + 2-then-3 confirmation system. Exposing this to parents is a genuine differentiator. | MEDIUM | Read from existing `misconceptionSlice`. Display confirmed misconceptions with human-readable descriptions from Bug Library. Show status (suspected/confirmed/resolved) and remediation progress. This is the "aha moment" for parents -- "Oh, THAT's what my child struggles with." |
| Trend graphs over time | SplashLearn shows "improvement in grade" but most competitors show point-in-time snapshots, not trajectories. Parents want to see "is my child getting better?" over weeks/months. | HIGH | Requires historical data that is NOT currently stored. Need to add session history records (date, problems attempted, correct count, time spent, skills practiced, misconceptions encountered). Lightweight session log appended after each session. Chart rendering with react-native-svg or victory-native. Weekly/monthly aggregation. |
| Bedtime lockout schedule | Apple Screen Time has "Downtime" scheduling. Google Family Link has bedtime mode. Building this into the app directly means parents don't need a separate parental control app. Convenient for parents who want education-specific limits without system-wide restrictions. | MEDIUM | Schedule definition: start time, end time, days of week. When active, app shows a calming "sleeping" screen. No app-level enforcement can prevent OS-level bypass, but the gentle friction is usually sufficient for ages 6-9. Store schedule in parent settings, check on app foreground. |
| Break reminders during sessions | Research shows children ages 6-9 lose focus after 15-20 minutes of concentrated activity. No major competitor actively reminds children to take breaks. This is a health-conscious differentiator that parents appreciate. | LOW | Simple timer during active sessions. At configurable interval (default 20 min), show a brief "Take a stretch break!" interstitial with a 30-second timer. Child can dismiss or wait. Not blocking -- just a nudge. |
| Per-child subscription (family plan pricing) | SplashLearn charges ~$135/year for a 3-child family plan vs ~$90/year for single child. A single subscription covering all children in the app is simpler and more parent-friendly than per-child pricing. | LOW (design) | One subscription = all children. No per-child pricing tiers. This simplifies IAP logic and is more generous than competitors. Marketing angle: "One subscription, whole family." |

## Anti-Features

Features to explicitly NOT build, even if competitors have them.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Ads in free tier | COPPA prohibits behavioral advertising to children under 13. Even "kid-safe" ad networks (e.g., SuperAwesome) disrupt learning flow and erode parent trust. Khan Academy Kids proves ads-free is viable. | Session limit (3/day free) is the conversion lever, not ads. The free experience must be clean and focused. |
| Upselling UI shown to children | Prodigy received FTC complaint for showing premium-locked items to children in-game, creating "nag factor." Children cannot consent to purchases and should not be pressured. | Paywall screen is only accessible from parent dashboard (behind parental PIN). Children never see "upgrade" prompts. Premium features silently unavailable in free tier -- not locked with a visible padlock. |
| Child-visible subscription status | Showing "FREE" vs "PREMIUM" badges or locked icons in the child experience creates a have/have-not dynamic. | Free tier simply does not show AI tutor button or locked themes. The child experience is complete within its tier. No indicators that "more" exists. |
| Detailed usage analytics sent to server | COPPA restricts collection of persistent identifiers and behavioral data from children. Server-side analytics create compliance risk and require privacy infrastructure. | All analytics computed on-device from local session history. No telemetry, no server-side user profiles. Parent dashboard reads local store data only. |
| Social/comparative features between children | Showing one child's progress vs another sibling creates competition and resentment. "Your sister is ahead of you" is toxic for learning motivation. | Each child's dashboard is independent. No cross-child comparisons. Parent sees each child's progress separately, never side-by-side rankings. |
| Free trial that auto-converts | Many apps use 7-day free trial that silently charges. This is widely disliked by parents and potentially a COPPA issue if a child initiated the trial. | If offering a trial, require explicit parental confirmation at trial start AND at conversion. RevenueCat supports trial management. Prefer a generous free tier over trial. |
| Push notifications to children | Notifications bypass parental mediation. Children ages 6-9 should not receive app notifications. | Notifications only go to parent (if parent opts in). Child-facing app never sends push. Session reminders are parent-only features. |
| Locking existing free features behind paywall | If math practice, manipulatives, or badges were free in v0.7, they must remain free. "Rug-pulling" free features into premium destroys trust. | All existing v0.7 features stay free. Premium adds NEW capabilities (AI tutor, unlimited sessions, analytics, themes) that were never available in free tier before. |

## Feature Dependencies

```
Multi-Child Profile Architecture (store restructure)
    |
    |----> Profile CRUD (add/edit/delete children)
    |           |
    |           +----> Profile Switcher UI (home screen)
    |
    |----> Per-Child State Isolation
    |           |
    |           +----> Parent Dashboard (reads per-child data)
    |           |           |
    |           |           +----> Progress Overview Cards
    |           |           |
    |           |           +----> Skill Analytics View
    |           |           |
    |           |           +----> Misconception Breakdown
    |           |           |
    |           |           +----> Trend Graphs (requires session history)
    |           |
    |           +----> Parental Time Controls (per-child settings)
    |                       |
    |                       +----> Daily Session Time Limit
    |                       |
    |                       +----> Bedtime Lockout Schedule
    |                       |
    |                       +----> Break Reminders

Subscription System (RevenueCat integration)
    |
    |----> Subscription State Slice (active/expired/free)
    |           |
    |           +----> Feature Gating Service (checks entitlements)
    |           |           |
    |           |           +----> Session Limit Enforcement (3/day free)
    |           |           |
    |           |           +----> AI Tutor Gating (premium only)
    |           |           |
    |           |           +----> Theme Gating (premium unlocks all)
    |           |
    |           +----> Paywall Screen (parent-only, behind PIN)
    |           |
    |           +----> Restore Purchases

Session History Log (NEW data layer)
    |
    +----> Trend Graphs (requires historical records)
    |
    +----> Parent Dashboard Enhanced Analytics
```

### Critical Dependency Notes

- **Multi-child profile restructure is the prerequisite for everything.** The entire store must be reorganized before parent dashboard or per-child time controls can exist. This is the riskiest and most complex change.
- **Subscription system is independent of multi-child profiles.** It can be built in parallel -- subscription state is family-level, not per-child.
- **Parent dashboard requires both multi-child profiles AND session history logging** for full functionality. Basic dashboard (current state snapshot) can ship without history; trend graphs need accumulated data.
- **Time controls require multi-child profiles** because limits are per-child (a 6-year-old gets different limits than an 8-year-old).
- **Feature gating (free vs premium) can start simple** and does not block multi-child work. A boolean `isPremium` checked at key points.

## MVP Recommendation

### Prioritize (Build First)

1. **Multi-child store restructure + migration** -- Everything depends on this. Wrap all per-child state under `children: Record<childId, ChildState>` with `activeChildId`. Migrate existing single-child data to first child entry. STORE_VERSION 13.
2. **Profile CRUD + switcher UI** -- Add/edit/delete children. Profile picker on home screen. PIN-gated delete.
3. **Subscription integration (RevenueCat)** -- Subscription state slice, paywall screen, restore purchases, basic feature gating (session count, AI tutor access).
4. **Basic parent dashboard** -- Progress overview cards per child using existing BKT/XP/streak data. Skill mastery grid. Misconception breakdown. No trend graphs yet (needs history).

### Prioritize (Build Second)

5. **Session history logging** -- Append lightweight session record after each session. Enables trend graphs.
6. **Daily time limit + bedtime lockout** -- Per-child time controls with schedule.
7. **Trend graphs** -- Weekly/monthly progress charts from session history.
8. **Break reminders** -- Simple in-session timer nudge.

### Defer

- **Push notifications to parents** -- Requires server infrastructure (no backend currently). Defer to post-v0.8.
- **Cross-device sync** -- Would require cloud backend. All data is device-local. Defer.
- **Detailed session replays** -- Showing parents exactly which problems the child got wrong. High storage cost, moderate value. Defer.

## Competitive Pricing Analysis

| App | Free Tier | Premium Price | What Premium Adds |
|-----|-----------|---------------|-------------------|
| Khan Academy Kids | 100% free | N/A | N/A (nonprofit) |
| SplashLearn | Limited daily access | $7.99-11.99/mo ($89-135/yr family) | Full curriculum, detailed reports, up to 3 kids |
| Prodigy Math | Core game free | ~$60/yr per child | Parent tools, video lessons, premium rewards |
| Education.com | 3 downloads/mo | ~$9.99/mo | Unlimited access, all grades |
| Duolingo | Full course free | $7-14/mo | No ads, unlimited hearts, offline |
| **Tiny Tallies (proposed)** | 3 sessions/day, all skills, all manipulatives, basic badges | $5.99/mo or $49.99/yr | Unlimited sessions, AI tutor, all themes, parent analytics, time controls |

### Pricing Rationale

- **$5.99/mo / $49.99/yr** undercuts SplashLearn ($7.99+) and Prodigy (~$60/yr) while offering comparable features.
- Median education app annual price is $44.99 (industry benchmark). $49.99/yr is competitive.
- Annual discount (30% off monthly rate) incentivizes commitment and reduces churn.
- Single subscription covers all children -- no per-child pricing complexity.

### Free vs Premium Feature Split

| Feature | Free | Premium |
|---------|------|---------|
| Daily practice sessions | 3 per day | Unlimited |
| All 14 math skills | Yes | Yes |
| Adaptive difficulty (Elo + BKT) | Yes | Yes |
| Virtual manipulatives (all 6) | Yes | Yes |
| Achievement badges | Yes | Yes |
| Daily challenges | Yes | Yes |
| Visual skill map | Yes | Yes |
| Avatar customization | Basic (8 avatars) | All avatars + frames |
| AI Tutor (Gemini) | No | Yes |
| Color themes (beyond default) | No | Yes |
| Parent dashboard | Basic (current snapshot) | Full (analytics + trends + misconceptions) |
| Time controls | No | Yes |
| Multi-child profiles | Up to 2 | Up to 5 |
| Session history/trends | No | Yes |

**Key design principle:** The free tier must provide a genuinely good daily math practice experience. A child using only the free tier should still learn effectively. Premium adds convenience (unlimited sessions), intelligence (AI tutor), insight (parent analytics), and polish (themes/cosmetics).

## Sources

- [Khan Academy Parent Dashboard](https://support.khanacademy.org/hc/en-us/articles/360039664491-Guide-to-the-Parent-Dashboard) -- dashboard features, multi-child management
- [Khan Academy creating child accounts](https://support.khanacademy.org/hc/en-us/articles/202262994-How-do-I-create-child-accounts) -- add-child flow
- [Prodigy Parent Dashboard](https://prodigygame.zendesk.com/hc/en-us/articles/115001744726-Parent-Dashboard) -- goal overview, recent activity, grade level display
- [SplashLearn Parent Features](https://www.splashlearn.com/features/parents) -- real-time progress, mastery notifications, trouble spots
- [SplashLearn Pricing](https://www.myengineeringbuddy.com/blog/splashlearn-reviews-alternatives-pricing-offerings/) -- $7.99-$11.99/mo, family plans
- [RevenueCat Expo Integration](https://www.revenuecat.com/docs/getting-started/installation/expo) -- Expo managed workflow support
- [Expo IAP Guide](https://docs.expo.dev/guides/in-app-purchases/) -- official Expo in-app purchase documentation
- [RevenueCat Expo Tutorial](https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial) -- official Expo blog on RevenueCat integration
- [COPPA Compliance Guide 2025](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/) -- SDK audit, parental consent, persistent identifiers
- [Education App Revenue Benchmarks](https://www.mirava.io/blog/subscription-benchmarks-education-apps) -- median annual price $44.99
- [Education App Monetization Strategies](https://www.ptolemay.com/post/how-to-monetize-your-educational-app-strategies-for-success) -- freemium best practices
- Existing project context: `.planning/PROJECT.md`, `src/store/appStore.ts`, `src/store/slices/childProfileSlice.ts`

---
*Feature research for: v0.8 Multi-child profiles, parent dashboard, time controls, freemium IAP subscription*
*Researched: 2026-03-05*
