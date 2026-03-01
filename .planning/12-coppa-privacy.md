# 12 — COPPA & Privacy Compliance

**Last Updated:** 2026-03-01
**Status:** Research Complete
**Applies to:** Tiny Tallies (ages 6-9, math learning) and Tiny Tales (ages 4-10, storytelling)

---

## Table of Contents

1. [COPPA Overview & 2025 Amendments](#1--coppa-overview--2025-amendments)
2. [What Constitutes Personal Information](#2--what-constitutes-personal-information)
3. [Verifiable Parental Consent (VPC)](#3--verifiable-parental-consent-vpc)
4. [Data Minimization & Retention](#4--data-minimization--retention)
5. [Third-Party Services Audit](#5--third-party-services-audit)
6. [Apple Kids Category & Google Families Policy](#6--apple-kids-category--google-families-policy)
7. [Privacy Policy Requirements](#7--privacy-policy-requirements)
8. [Technical Implementation](#8--technical-implementation)
9. [GDPR-K (Children's GDPR) Overlap](#9--gdpr-k-childrens-gdpr-overlap)
10. [Practical Compliance Checklist](#10--practical-compliance-checklist)

---

## 1 — COPPA Overview & 2025 Amendments

### What COPPA Is

The Children's Online Privacy Protection Act (COPPA) is a US federal law enacted in 1998 (effective April 2000) that governs the collection, use, and disclosure of personal information from children under 13 by operators of commercial websites, online services, and mobile apps. The FTC enforces COPPA through the COPPA Rule (16 CFR Part 312).

**Tiny Tallies is squarely within COPPA scope**: it is a commercial mobile app directed at children ages 6-9, and it collects data (math performance, device identifiers, AI tutoring interactions) from those children.

### Core COPPA Obligations

| Obligation | Description |
|---|---|
| **Notice** | Post a clear, comprehensive privacy policy; provide direct notice to parents before collecting data |
| **Consent** | Obtain verifiable parental consent (VPC) before collecting, using, or disclosing personal information from children |
| **Parental Access** | Allow parents to review, modify, and delete their child's data at any time |
| **Data Minimization** | Collect only what is reasonably necessary for the child's participation in the activity |
| **Security** | Maintain reasonable procedures to protect the confidentiality, security, and integrity of children's personal information |
| **Retention Limits** | Retain data only as long as reasonably necessary; delete when purpose is fulfilled |
| **Third-Party Restrictions** | Only disclose children's data to third parties who can maintain its confidentiality and security |

### 2025 FTC Amendments (Final Rule)

On January 16, 2025, the FTC unanimously voted to amend the COPPA Rule — the first major overhaul since 2013. The amendments were published in the Federal Register on April 22, 2025, took effect June 23, 2025, with a **compliance deadline of April 22, 2026**.

#### Key Changes

| Amendment | Impact on Tiny Tallies |
|---|---|
| **Expanded definition of "personal information"** | Biometric identifiers (voiceprints, facial templates, fingerprints) and government-issued identifiers now included. Any audio/voice features must be treated as personal information. |
| **Separate consent for third-party disclosures** | Must obtain *separate* verifiable parental consent to share children's data with third parties for advertising or non-essential purposes. One blanket consent is no longer sufficient. |
| **Mandatory written data retention policy** | Must establish, implement, and publish a written policy specifying: purposes for collection, business need for retention, and timeline for deletion. |
| **Persistent identifier disclosure** | Must disclose in the privacy notice exactly how persistent identifiers (device IDs, advertising IDs) are used for internal operations. |
| **No indefinite retention** | Personal information collected from children may not be retained indefinitely — must specify and enforce deletion timelines. |
| **Enhanced direct notice** | Direct notice to parents must now include: names or categories of third-party recipients, data retention practices, and how audio files containing a child's voice are used. |
| **Safe Harbor transparency** | FTC-approved Safe Harbor programs must publicly disclose membership lists and report additional information to the FTC. |
| **Three new VPC methods** | Knowledge-based authentication, text-plus method, and facial recognition matching added as approved consent mechanisms. |

#### Compliance Timeline

```
Jan 16, 2025  — FTC votes to amend COPPA Rule
Apr 22, 2025  — Published in Federal Register
Jun 23, 2025  — Amendments take effect (60 days after publication)
Apr 22, 2026  — COMPLIANCE DEADLINE for all operators
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                Tiny Tallies MUST be fully compliant by this date
```

### What "Directed to Children" Means

An app is "directed to children" if it is designed with children as the target audience, considering factors including:

- Subject matter (math learning for ages 6-9 — clearly child-directed)
- Visual content (cartoon characters, bright colors, child-friendly UI)
- Age of models or characters
- Music or audio content
- Presence in children's app store categories (Kids Category)
- Advertising directed to children

**Tiny Tallies unambiguously qualifies** as directed to children under all of these factors.

---

## 2 — What Constitutes Personal Information

### Original COPPA Definition

Under the original COPPA Rule, "personal information" includes:

1. Full name
2. Home or physical address (including street name and city/town)
3. Online contact information (email address)
4. Screen name or username (when it functions as online contact information)
5. Telephone number
6. Social Security number
7. A persistent identifier that can be used to recognize a user over time and across different sites/services (cookies, IP addresses, device serial numbers, unique device identifiers)
8. A photograph, video, or audio file containing a child's image or voice
9. Geolocation information sufficient to identify street name and city/town
10. Any combination of information that permits physical or online contacting of a specific individual

### 2025 Amendments — Expanded Definitions

The 2025 amendments explicitly add:

| New Category | Examples | Relevance to Tiny Tallies |
|---|---|---|
| **Biometric identifiers** | Voiceprints, facial templates, fingerprints, retina patterns, gait patterns, DNA sequences | If we ever add voice input for math problems or voice-based tutoring, voiceprint data is now personal information. |
| **Government-issued identifiers** | Social Security numbers, birth certificate numbers, passport numbers, state ID numbers | Not applicable — we should never collect these. |

### Persistent Identifiers — Critical for Our App

Persistent identifiers deserve special attention because they are the most likely type of personal information our app will encounter:

| Identifier | COPPA Status | Where It Appears |
|---|---|---|
| **Device ID** (Android ID, IDFV) | Personal information | Expo `Application.androidId`, iOS `identifierForVendor` |
| **Advertising ID** (IDFA, GAID) | Personal information | Must NOT be collected in children's apps |
| **IP address** | Personal information | Every API call to our backend or third-party services |
| **Cookies / AsyncStorage keys** | Persistent identifier if used for recognition | Any tracking-capable storage |
| **Analytics user IDs** | Personal information if linkable | Any analytics SDK |
| **Installation ID** | Personal information if persistent | Expo `Constants.installationId` (deprecated) |

#### The Internal Operations Exception

COPPA allows use of persistent identifiers for "internal operations" WITHOUT parental consent, but ONLY for:

- Maintaining or analyzing the functioning of the app
- Performing network communications
- Authenticating users or personalizing content
- Serving contextual advertising (NOT behavioral/targeted)
- Protecting security or integrity of the user/service
- Fulfilling a request from the child (e.g., loading their progress)

The 2025 amendments require operators to **disclose specifically which internal operations** they use persistent identifiers for and confirm they are not used for unauthorized purposes like behavioral advertising.

### Audio Files — Special Treatment

If Tiny Tallies ever collects audio (e.g., voice-based math answers, voice tutoring):

- Audio containing a child's voice is personal information
- Must be deleted **immediately** after responding to the request for which it was collected
- Must describe in the privacy notice how audio files are used
- Must confirm audio is deleted after use

**Recommendation**: Avoid audio/voice features unless absolutely necessary. If added later (e.g., voice input for math answers), implement immediate-deletion and document the flow.

---

## 3 — Verifiable Parental Consent (VPC)

### When VPC Is Required

VPC is required before:

1. Collecting personal information from a child under 13
2. Using personal information already collected
3. Disclosing personal information to third parties

**Exception**: VPC is NOT required for:
- "Internal operations" use of persistent identifiers (see Section 2)
- Responding to a one-time request from a child (then deleting the data)
- Protecting safety of the child
- Sending notice to a parent (using the parent's email)

### FTC-Approved VPC Methods

The FTC does not mandate a specific method — it requires that the method be "reasonably designed in light of available technology to ensure that the person giving consent is the child's parent." The following methods are approved:

| Method | Description | Complexity | Best For |
|---|---|---|---|
| **Email Plus** | Send consent email to parent; confirm via follow-up email, postal mail, or phone call | Low | Apps that only collect data for internal use and do NOT share with third parties |
| **Text-Plus** (new 2025) | Send consent SMS to parent; confirm via follow-up text, letter, or phone call | Low | Same constraints as Email Plus — internal use only |
| **Knowledge-Based Authentication** (new 2025) | Dynamic multiple-choice questions that a child would not know the answers to (credit history, property records, etc.) | Medium | General use; answers must be "difficult for a child to ascertain" |
| **Credit Card Transaction** | Charge a small amount to parent's credit card (or use existing payment relationship) | Medium | Apps with paid subscriptions (very natural fit) |
| **Government ID Scan** | Parent submits government-issued photo ID; verified and then deleted | High | Higher-trust applications |
| **Facial Recognition** (new 2025) | Match parent's selfie against government-issued photo ID; requires human review step | High | Higher-trust applications |
| **Video Conference** | Live video call with trained personnel | Very High | Enterprise/institutional settings only |

### Recommended Approach for Tiny Tallies

**Primary method: Credit Card Transaction (via subscription)**

Since Tiny Tallies will have a subscription model (Free/Standard/Premium, mirroring Tiny Tales), the payment transaction during subscription serves as VPC. This is the most natural and least disruptive method for a paid children's app.

**Secondary method: Email Plus (for free tier)**

For the free tier where no payment occurs, use the Email Plus method:
1. Child reaches a feature requiring data collection
2. App prompts for parent's email address (parental gate protects this screen)
3. Send email to parent with a link containing a unique token
4. Parent clicks link to confirm consent
5. Send a delayed confirmation email (the "plus" part)
6. Record consent timestamp and method

**Important limitations of Email Plus:**
- Can ONLY be used if data is collected for internal purposes
- If data is shared with ANY third party (analytics, AI services), Email Plus is NOT sufficient — must use a "higher-bar" method like credit card or knowledge-based

```typescript
// Consent record data model
interface ParentalConsent {
  /** When consent was granted */
  consentTimestamp: number;
  /** Method used for verification */
  method: 'credit_card' | 'email_plus' | 'text_plus' | 'knowledge_based';
  /** Whether consent covers third-party data sharing */
  coversThirdPartySharing: boolean;
  /** Parent's email for communication */
  parentEmail: string;
  /** Whether consent has been revoked */
  revoked: boolean;
  /** When consent was revoked (if applicable) */
  revokedTimestamp?: number;
  /** Version of privacy policy at time of consent */
  privacyPolicyVersion: string;
}

// Consent state in Zustand store
interface ConsentSlice {
  consent: ParentalConsent | null;
  /** Check if valid consent exists for a given scope */
  hasValidConsent: (scope: 'internal' | 'third_party') => boolean;
  /** Record new consent */
  recordConsent: (consent: ParentalConsent) => void;
  /** Revoke consent and trigger data deletion */
  revokeConsent: () => Promise<void>;
}
```

### Parental Gate for Consent Screens

The consent flow itself must be behind a parental gate (children should not be able to fill in their parent's email address or complete consent themselves). A parental gate can be:

- A math problem too hard for the target age (e.g., "What is 47 x 38?")
- A text-based question (e.g., "Enter your birth year")
- A PIN set during initial setup (existing pattern from Tiny Tales)

**Recommendation**: Reuse Tiny Tales' PIN-based parental gate for consistency.

---

## 4 — Data Minimization & Retention

### The Principle

Under COPPA (reinforced by 2025 amendments), operators must:

1. **Collect only what is necessary** for the child to participate in the activity
2. **Not condition participation** on collecting more data than necessary
3. **Retain data only as long as reasonably necessary**
4. **Delete data** when the purpose is fulfilled
5. **Publish a written retention policy** (new in 2025 amendments)

### What Data Tiny Tallies Actually Needs

| Data Category | What We Collect | Why We Need It | Retention Period | Storage Location |
|---|---|---|---|---|
| **Math performance** | Problem answers, time spent, accuracy, misconception tags | Adaptive difficulty, spaced repetition, mastery tracking | While profile exists | On-device (Zustand/AsyncStorage) |
| **Elo rating** | Numeric skill rating per topic | Adaptive difficulty targeting 85% success | While profile exists | On-device |
| **BKT state** | Per-skill mastery probability | Mastery estimation, skill graph | While profile exists | On-device |
| **Spaced repetition state** | Leitner box assignments, next review dates | Spacing algorithm | While profile exists | On-device |
| **Session history** | Session timestamps, problem count, score summary | Progress tracking, parent dashboard, streak calculation | 90 days rolling | On-device |
| **Child profile** | Display name, age/grade, avatar selection | Personalization, age-appropriate difficulty | While profile exists | On-device |
| **Gamification state** | XP, level, coins, badges, streak count | Motivation system | While profile exists | On-device |
| **Parent email** | Email address | Consent verification, account recovery | While consent is active | expo-secure-store |
| **Parental PIN** | Hashed PIN | Gate access to parent-only areas | While app is installed | expo-secure-store |
| **AI tutoring prompts** | Math context sent to Gemini (problem, child's answer, misconception type) | Generate explanations and hints | Deleted after response | Transient (network request) |
| **Subscription status** | Tier, expiration date | Feature access control | While subscribed | On-device + backend |
| **Device identifier** | Opaque device-generated ID (NOT advertising ID) | Device-based usage tracking, subscription binding | While app is installed | On-device |

### What We Must NOT Collect

| Data | Reason |
|---|---|
| Advertising ID (IDFA/GAID) | Prohibited in children's apps; no behavioral advertising |
| Precise geolocation | Not needed for math learning; prohibited by app store policies |
| Contact list / address book | Not needed; would violate COPPA |
| Camera/photos | Not needed for math; collecting photos of children is personal information |
| Full name (real) | Not needed; display name sufficient (can be "Star Math Kid") |
| Date of birth | Age range (6-9) sufficient; exact DOB is personal information |
| Social media identifiers | Not needed; children under 13 should not have social media |
| Audio/voice recordings | Not needed for v0.1-v0.7; if added later, must delete immediately |
| Biometric data | Not needed; avoid fingerprint/face auth for child profiles |

### Written Data Retention Policy

The 2025 amendments require a published written data retention policy. This must be included in the privacy notice:

```
DATA RETENTION POLICY — Tiny Tallies

Purpose of Collection:
- Math learning progress: To adapt difficulty and track mastery
- Parent email: To verify parental consent and send account notices
- Device identifier: To manage subscription and usage limits
- AI tutoring context: To generate personalized math explanations

Business Need for Retention:
- Learning data is needed for the entire duration of the child's use
  of the app to maintain adaptive difficulty and progress tracking
- Parent email is needed to communicate about the child's account
  and to verify ongoing consent
- Device identifier is needed for subscription management

Deletion Timeline:
- Learning data: Deleted when parent requests or profile is deleted
- Session history: Automatically pruned to 90-day rolling window
- Parent email: Deleted within 30 days of consent revocation
- AI tutoring context: Deleted immediately after Gemini response
  is received; never stored persistently
- All data: Deleted within 30 days of account/profile deletion
  request from parent
```

### Implementation: Data Lifecycle

```typescript
// Data retention configuration
const DATA_RETENTION = {
  /** Session history kept for 90 days rolling */
  SESSION_HISTORY_DAYS: 90,
  /** Delete all data within 30 days of deletion request */
  DELETION_DEADLINE_DAYS: 30,
  /** AI tutoring context: never persist */
  AI_CONTEXT_RETENTION: 'immediate_delete' as const,
  /** Consent records: keep for audit trail even after revocation */
  CONSENT_AUDIT_DAYS: 365,
} as const;

// Periodic cleanup function (run on app launch)
async function enforceRetentionPolicy(): Promise<void> {
  const now = Date.now();
  const ninetyDaysMs = DATA_RETENTION.SESSION_HISTORY_DAYS * 24 * 60 * 60 * 1000;

  // Prune session history older than 90 days
  const sessions = useAppStore.getState().sessions;
  const validSessions = sessions.filter(
    (s) => now - s.timestamp < ninetyDaysMs,
  );
  useAppStore.getState().setSessions(validSessions);
}

// Full data deletion (parent-initiated)
async function deleteChildProfile(profileId: string): Promise<void> {
  // 1. Delete all learning data (Elo, BKT, Leitner state)
  useAppStore.getState().deleteProfile(profileId);

  // 2. Delete session history
  useAppStore.getState().clearSessionHistory(profileId);

  // 3. Delete gamification state
  useAppStore.getState().clearGamificationState(profileId);

  // 4. Clear any cached AI responses
  // (Should already be transient, but defense-in-depth)
  clearAIResponseCache(profileId);

  // 5. Remove from subscription binding (if applicable)
  await unbindDeviceFromProfile(profileId);

  // 6. Log deletion for compliance audit (no personal info in log)
  logComplianceEvent('profile_deleted', { profileId, timestamp: Date.now() });
}
```

---

## 5 — Third-Party Services Audit

Every third-party service that receives data from children must be evaluated for COPPA compliance. Under the 2025 amendments, separate parental consent is required for third-party disclosures that go beyond internal operations.

### Service-by-Service Analysis

#### Google Gemini (AI/LLM Tutoring)

| Aspect | Assessment |
|---|---|
| **What data is sent** | Math problem context, child's answer, misconception type, grade level |
| **Personal information sent?** | Potentially — if prompts contain any identifying information |
| **Gemini's data policy** | Google may use prompts for model improvement; human reviewers may see data |
| **COPPA status** | Google Cloud advertises COPPA compliance for Workspace for Education; consumer Gemini API has weaker guarantees |
| **Risk level** | HIGH |

**Mitigations required:**
1. **Never send personal information to Gemini** — strip any names, device IDs, or identifying context before sending
2. **Use the Gemini API** (not the consumer Gemini app), and configure it for enterprise/paid tier with data processing agreement
3. **Enable data processing opt-out** if available through the API
4. **Send only mathematical context** — the prompt should contain only: problem text, child's answer, correct answer, misconception type, grade level
5. **Document in privacy policy** that AI tutoring data is sent to Google and describe what is sent

```typescript
// SAFE: Only mathematical context sent to Gemini
interface TutoringPromptContext {
  problemText: string;       // "What is 23 + 45?"
  childAnswer: number;       // 58
  correctAnswer: number;     // 68
  misconceptionType?: string; // "adds_without_regrouping"
  gradeLevel: number;        // 2
  tutorMode: 'TEACH' | 'HINT' | 'BOOST';
}

// NEVER include in prompts:
// - Child's name or display name
// - Device ID or any identifier
// - Session history or behavioral patterns
// - Parent's email or any contact info
// - Geographic information
```

#### RevenueCat (Subscriptions)

| Aspect | Assessment |
|---|---|
| **What data is sent** | Device identifier, purchase receipts, subscription status |
| **Personal information sent?** | Yes — device identifier is a persistent identifier |
| **RevenueCat's stance** | Several kids apps use RevenueCat successfully; no known COPPA issues |
| **Risk level** | MEDIUM |

**Mitigations required:**
1. **Disable `automaticSearchAdsCollection`** (already off by default)
2. **Do not pass any child identifiers** to RevenueCat — use device-level (parent-managed) subscription only
3. **Configure RevenueCat to not collect IDFA/GAID** (advertising identifiers)
4. **Treat RevenueCat as a "service provider"** — they process data on our behalf for subscription management, which is an internal operation
5. **Include in privacy policy** that subscription management data is processed by a third party

```typescript
// RevenueCat initialization — COPPA safe configuration
import Purchases from 'react-native-purchases';

async function initializeRevenueCat(): Promise<void> {
  Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
    // Do NOT pass a user ID derived from the child
    // Use anonymous ID or device-scoped ID
  });

  // Explicitly disable ad-related data collection
  // (default is false, but be explicit)
  Purchases.setAutomaticAppleSearchAdsAttributionCollection(false);
}
```

#### Expo Libraries

| Library | Data Collected | COPPA Risk | Mitigation |
|---|---|---|---|
| `expo-secure-store` | None (local encryption) | NONE | Safe to use for PIN, parent email |
| `expo-file-system` | None (local storage) | NONE | Safe for caching |
| `expo-constants` | Device info (model, OS) | LOW | Do not transmit to third parties |
| `expo-application` | App version, build | NONE | Safe metadata |
| `expo-crypto` | None (local hashing) | NONE | Safe for cache key generation |
| `expo-notifications` | Push token | MEDIUM | Push tokens are persistent identifiers — see below |
| `@react-native-async-storage/async-storage` | None (local storage) | NONE | Safe for on-device data |

#### Push Notifications (expo-notifications)

| Aspect | Assessment |
|---|---|
| **What data is sent** | Push notification token to Apple/Google servers |
| **Personal information sent?** | Yes — push token is a persistent identifier |
| **Risk level** | MEDIUM |

**Mitigations required:**
1. Push notifications should be opt-in and parent-controlled (behind parental gate)
2. Notifications should be directed at the parent (e.g., "Your child completed 5 sessions this week!"), not marketing to the child
3. Do not use push notifications for behavioral engagement nudges directed at children
4. Include in privacy policy

#### Analytics / Crash Reporting

| Service | Recommendation |
|---|---|
| **Firebase Analytics** | NOT recommended for Kids Category apps — Google's own documentation warns about compliance |
| **Firebase Crashlytics** | Acceptable with configuration — disable user ID collection, disable analytics data collection |
| **Sentry** | Acceptable — can be configured for COPPA compliance (disable PII collection, use on-device symbolication) |
| **Custom analytics** | RECOMMENDED — log events to on-device storage only, aggregate locally, no third-party transmission |
| **Expo Updates** | Acceptable — only transmits app version and platform metadata |

**Recommendation**: Use on-device-only analytics for child usage patterns. If crash reporting is needed, use Sentry or Crashlytics with PII-stripping configuration. Never send behavioral analytics about children to third-party services.

```typescript
// On-device analytics — COPPA compliant
interface AnalyticsEvent {
  type: 'session_completed' | 'problem_answered' | 'badge_earned' | 'streak_updated';
  timestamp: number;
  // Only aggregate, non-identifying data
  metadata: {
    sessionDuration?: number;
    problemCount?: number;
    accuracy?: number;
    gradeLevel?: number;
    topic?: string;
  };
  // NEVER include:
  // - Device ID
  // - IP address
  // - Geolocation
  // - Child's name or profile info
}

const MAX_LOCAL_EVENTS = 500;

async function logAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const events = await getStoredEvents();
  events.push(event);
  // Enforce retention limit
  const trimmed = events.slice(-MAX_LOCAL_EVENTS);
  await AsyncStorage.setItem('analytics_events', JSON.stringify(trimmed));
}
```

### Third-Party Services Summary

| Service | Status | Consent Required | Action Needed |
|---|---|---|---|
| Gemini API | Use with restrictions | Internal ops (Email Plus OK if no PII sent) | Strip all PII from prompts; get DPA from Google |
| RevenueCat | Use with restrictions | Internal ops (subscription management) | Disable ad tracking; parent-managed only |
| expo-secure-store | Safe | None | Use for sensitive local storage |
| expo-notifications | Use with restrictions | Parent opt-in | Parent-controlled; no child-directed marketing |
| Firebase Analytics | DO NOT USE | N/A | Use on-device analytics instead |
| Sentry / Crashlytics | Conditional | Internal ops | Disable PII, strip user IDs |
| Expo Updates | Safe | None | OTA updates are internal operations |

---

## 6 — Apple Kids Category & Google Families Policy

### Apple Kids Category Requirements

If Tiny Tallies is listed in the App Store Kids Category (which it should be, given our target age of 6-9), the following requirements apply **in addition to COPPA**:

#### Age Bands

Kids Category apps must select an age band in App Store Connect:
- **Ages 5 and Under**
- **Ages 6-8** (Tiny Tallies target)
- **Ages 9-11**

Since our target range (6-9) spans two bands, we should select **Ages 6-8** as the primary band. Children ages 9+ can still use the app but will not see features outside the 6-8 content scope.

#### Strict Data Requirements

| Requirement | Details |
|---|---|
| **No third-party analytics** | Kids apps must not transmit personally identifiable information or device information to third parties, even in parent-only sections |
| **No third-party advertising** | No behavioral ads; no ad SDKs that collect device info |
| **No links out of app** | Cannot link to websites, social networks, or other apps without a parental gate |
| **No in-app purchases without gate** | All purchases must be behind a parental gate (PIN, age verification) |
| **Human-reviewed ads only** | If contextual ads are shown (unlikely for our app), they must be human-reviewed for age appropriateness |
| **No AdSupport framework** | Apple will reject apps that link against the AdSupport framework (contains IDFA access) |
| **No IDFA collection** | Cannot request tracking permission (ATT framework) |

#### App Review Expectations

Apple App Review is known to ask detailed questions about Kids Category submissions:

- "Does your app share any data with third parties?"
- "What analytics SDKs does your app include?"
- "How does your app handle parental consent?"
- "Does your app contain any advertising?"

**Critical**: Apple examines your app's binary for the presence of tracking SDKs. Even if you don't call them, having them linked will trigger rejection. Ensure RevenueCat does not pull in AdSupport and that no analytics SDK collects IDFA.

#### Updated Age Rating System (2025-2026)

Apple expanded its age rating system in 2025:
- 4+ and 9+ categories expanded to include 13+, 16+, and 18+
- Developers must respond to updated age rating questions by January 31, 2026
- Tiny Tallies should target the **4+** rating (appropriate for ages 6-9, no objectionable content)

### Google Play Families Policy

Google Play has its own requirements for apps that target children, enforced through the Families Policy:

#### Mandatory Requirements

| Requirement | Details |
|---|---|
| **Families Self-Certified Ads SDK** | If ads are shown, must use a Google-approved families ad SDK (not applicable — we have no ads) |
| **No precise location** | Must not access precise location data from children |
| **No device identifiers** | Must not transmit GAID or other device identifiers from children to third parties |
| **Privacy policy** | Must link to a privacy policy from the Play Store listing AND within the app |
| **Teacher Approved badge** | Optional but valuable — requires additional review by Google's education partners |
| **Content rating** | Must complete IARC content rating questionnaire (target: PEGI 3 / ESRB Everyone) |
| **Data safety section** | Must accurately complete the Data Safety section declaring all data collection |
| **Comply with applicable laws** | Explicitly requires COPPA and GDPR compliance |

#### 2025-2026 State Law Requirements

New state laws affecting Google Play apps for children:

| State | Effective | Key Requirement |
|---|---|---|
| **Texas** | Jan 1, 2026 | Age verification, parental approval for minors |
| **Utah** | Jan 1, 2026 | Parental permission for accounts; most restrictive privacy settings by default for minors |
| **Louisiana** | Jan 1, 2026 | Age verification for minors |

**Impact**: These state laws may require additional age verification beyond COPPA. Our parental gate + consent flow should satisfy these requirements, but monitor for updates.

### Dual Platform Compliance Matrix

| Requirement | Apple Kids Category | Google Families Policy | COPPA | Our Implementation |
|---|---|---|---|---|
| Parental gate for purchases | Required | Required | Required (consent) | PIN-based gate |
| No advertising IDs | Required | Required | Allowed but risky | Never collect IDFA/GAID |
| No third-party analytics | Required (strict) | Recommended | Must disclose | On-device only |
| No links outside app | Required (gated) | Recommended (gated) | Not specified | All links behind parental gate |
| Privacy policy | Required (in-app + listing) | Required (in-app + listing) | Required (comprehensive) | Both locations |
| Age-appropriate content | Required | Required | Not specified | Math content inherently safe |
| Parental consent | Required | Required | Required (VPC) | Credit card + Email Plus |
| Data deletion | Not specified | Not specified | Required | In-app + parent request |

---

## 7 — Privacy Policy Requirements

### What Must Be in the Privacy Policy

Under COPPA (including 2025 amendments), the privacy policy for a children's app must include:

#### Required Sections

1. **Operator identification**: Name, physical address, email address, phone number of each operator that collects or maintains children's personal information through the app

2. **Information collected**: A description of all personal information collected from children, including:
   - Types of personal information collected (list specifically)
   - Whether information is collected actively (forms) or passively (device IDs)
   - How information is collected (directly from child, from device, from parent)

3. **How information is used**: Specific purposes for each type of information collected

4. **Third-party disclosures** (2025 amendment):
   - Names or specific categories of all third parties that receive children's personal information
   - How each third party uses the information
   - Whether third parties have agreed to maintain confidentiality and security

5. **Persistent identifier usage** (2025 amendment):
   - Which persistent identifiers are collected
   - Which internal operations they support
   - Confirmation they are not used for behavioral advertising

6. **Parental rights**:
   - How a parent can review their child's personal information
   - How a parent can request deletion of their child's information
   - How a parent can refuse further collection or use
   - That the operator will not condition the child's participation on disclosing more information than necessary

7. **Data retention policy** (2025 amendment):
   - Purposes for which data is collected
   - Business need for retention
   - Specific timelines for deletion

8. **Audio file handling** (if applicable, 2025 amendment):
   - How audio files containing a child's voice are used
   - Confirmation that audio files are deleted immediately after use

9. **Security measures**: Description of reasonable procedures used to protect children's information

### How to Present the Privacy Policy

| Location | Requirement |
|---|---|
| **App Store listing** | Link to full privacy policy (Apple and Google both require this) |
| **Within the app** | Accessible from settings screen (behind parental gate for full policy, but summary visible) |
| **Before data collection** | Direct notice to parent before collecting any data (email or in-app) |
| **Language** | Clear, understandable language — not legalistic jargon; a child should be able to understand the basics |

### Privacy Policy Template Structure

```
TINY TALLIES — PRIVACY POLICY FOR CHILDREN

Last Updated: [DATE]

WHO WE ARE
  - Company name, address, email, phone

WHAT INFORMATION WE COLLECT
  From Children:
    - Math learning progress (problems attempted, accuracy, time spent)
    - Display name and avatar choice
    - Device-generated identifier (for subscription management)
    - Grade level / age range selection
  From Parents:
    - Email address (for consent verification and account communication)
    - Payment information (processed by RevenueCat/Apple/Google —
      we do not store payment details)

HOW WE COLLECT INFORMATION
  - Directly from the child (math answers, display name)
  - Automatically from the device (device identifier, app version)
  - From the parent (email, consent confirmation)

HOW WE USE INFORMATION
  - Math progress: To adapt difficulty and track learning
  - Display name: To personalize the app experience
  - Device identifier: To manage subscription status
  - Parent email: To verify consent and send account notices
  - AI tutoring: Mathematical context (NOT personal info) is sent
    to Google's Gemini AI to generate explanations

THIRD-PARTY SERVICES
  - Google Gemini API: Receives mathematical problem context only
    (no personal information). Used to generate tutoring explanations.
  - RevenueCat: Processes subscription purchases. Receives device-level
    identifier only. Does not receive child's personal information.
  - Apple App Store / Google Play: Process payments.
  No children's personal information is shared for advertising purposes.

PERSISTENT IDENTIFIERS
  - We use a device-generated identifier for subscription management
    and usage tracking (internal operations only)
  - We do not collect advertising identifiers (IDFA/GAID)
  - We do not use persistent identifiers for behavioral advertising

DATA RETENTION
  - Learning data: Retained while the child's profile exists
  - Session history: Automatically deleted after 90 days
  - AI tutoring context: Deleted immediately after response
  - Parent email: Deleted within 30 days of consent revocation
  - All data: Deleted within 30 days of deletion request

PARENTAL RIGHTS
  You may at any time:
  - Review your child's personal information
  - Request deletion of your child's information
  - Revoke consent for further data collection
  - Request that we stop using your child's information
  Contact us at: [EMAIL]
  In-app: Settings → Parental Controls → Privacy & Data

SECURITY
  - Sensitive data (parent email, PIN) encrypted using device keychain
  - All network communications use HTTPS/TLS
  - Learning data stored locally on device
  - AI tutoring requests contain no personal information

CONTACT
  [Company Name]
  [Address]
  [Email]
  [Phone]
```

---

## 8 — Technical Implementation

### Architecture: Device-Based Identification

Tiny Tallies should follow Tiny Tales' device-based approach (no user accounts for children):

```
┌──────────────────────────────────────────────┐
│                   Device                      │
│                                               │
│  ┌─────────────────────┐  ┌───────────────┐  │
│  │   Child Profile(s)  │  │ Parent Zone   │  │
│  │                     │  │ (PIN-gated)   │  │
│  │  - Display name     │  │               │  │
│  │  - Avatar           │  │ - Consent     │  │
│  │  - Grade level      │  │ - Email       │  │
│  │  - Learning data    │  │ - Subscription│  │
│  │  - Session history  │  │ - Settings    │  │
│  │  - Gamification     │  │ - Data export │  │
│  │                     │  │ - Data delete │  │
│  └─────────────────────┘  └───────────────┘  │
│                                               │
│  ┌──────────────────────────────────────────┐ │
│  │         expo-secure-store                │ │
│  │  - Parental PIN (hashed)                 │ │
│  │  - Parent email (encrypted)              │ │
│  │  - Consent record                        │ │
│  │  - Auth tokens                           │ │
│  └──────────────────────────────────────────┘ │
│                                               │
│  ┌──────────────────────────────────────────┐ │
│  │         AsyncStorage / Zustand           │ │
│  │  - Learning state (Elo, BKT, Leitner)   │ │
│  │  - Session history                       │ │
│  │  - Gamification (XP, coins, badges)      │ │
│  │  - App settings                          │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
         │
         │ HTTPS (no PII in requests)
         ▼
┌──────────────────────────────────────────────┐
│              Backend (Cloudflare Workers)      │
│                                               │
│  - Subscription validation                    │
│  - Rate limiting (by device ID)               │
│  - AI proxy (strips any residual PII)         │
│  - No child data stored server-side           │
└──────────────────────────────────────────────┘
         │
         │ Mathematical context only
         ▼
┌──────────────────────────────────────────────┐
│              Google Gemini API                 │
│                                               │
│  - Receives: problem, answer, misconception   │
│  - Does NOT receive: names, IDs, device info  │
└──────────────────────────────────────────────┘
```

**Key principle**: Children's personal data stays on-device. The backend and third-party services never receive data that can identify a specific child.

### Encryption Requirements

| Data | Storage | Encryption | Library |
|---|---|---|---|
| Parental PIN | expo-secure-store | iOS Keychain / Android Keystore | `expo-secure-store` |
| Parent email | expo-secure-store | iOS Keychain / Android Keystore | `expo-secure-store` |
| Consent record | expo-secure-store | iOS Keychain / Android Keystore | `expo-secure-store` |
| Auth tokens | expo-secure-store | iOS Keychain / Android Keystore | `expo-secure-store` |
| Learning data | AsyncStorage | At-rest encryption (OS-level) | `@react-native-async-storage/async-storage` |
| Session history | AsyncStorage | At-rest encryption (OS-level) | `@react-native-async-storage/async-storage` |
| Network traffic | HTTPS | TLS 1.2+ | React Native `fetch` |

```typescript
import * as SecureStore from 'expo-secure-store';

// Secure storage keys
const SECURE_KEYS = {
  PARENTAL_PIN_HASH: 'tiny_tallies_parental_pin',
  PARENT_EMAIL: 'tiny_tallies_parent_email',
  CONSENT_RECORD: 'tiny_tallies_consent',
  AUTH_TOKEN: 'tiny_tallies_auth_token',
} as const;

// Store consent record securely
async function storeConsentRecord(consent: ParentalConsent): Promise<void> {
  await SecureStore.setItemAsync(
    SECURE_KEYS.CONSENT_RECORD,
    JSON.stringify(consent),
  );
}

// Retrieve consent record
async function getConsentRecord(): Promise<ParentalConsent | null> {
  const raw = await SecureStore.getItemAsync(SECURE_KEYS.CONSENT_RECORD);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParentalConsent;
  } catch {
    return null;
  }
}
```

### Data Deletion Flow

Parents must be able to delete all of their child's data from within the app:

```typescript
// Complete data deletion flow
async function handleDeleteAllData(): Promise<void> {
  // 1. Delete all child profiles and learning data
  useAppStore.getState().resetAllProfiles();

  // 2. Clear session history
  await AsyncStorage.removeItem('session_history');

  // 3. Clear gamification state
  await AsyncStorage.removeItem('gamification_state');

  // 4. Clear cached data
  await AsyncStorage.removeItem('analytics_events');

  // 5. Clear AI response cache (if any)
  await AsyncStorage.removeItem('ai_cache');

  // 6. Optionally clear consent record (parent may want to keep)
  // Only clear if parent explicitly requests full account deletion
  // await SecureStore.deleteItemAsync(SECURE_KEYS.CONSENT_RECORD);
  // await SecureStore.deleteItemAsync(SECURE_KEYS.PARENT_EMAIL);

  // 7. Notify backend to delete any server-side data
  try {
    await fetch(`${API_BASE}/api/user/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch {
    // Queue for retry — deletion must eventually succeed
    await queueOfflineRequest('delete_user_data');
  }

  // 8. Log compliance event (no PII in the log)
  logComplianceEvent('all_data_deleted', { timestamp: Date.now() });
}
```

### Consent Management in React Native

```typescript
// Zustand consent slice
import { StateCreator } from 'zustand';

interface ConsentState {
  consent: ParentalConsent | null;
  consentLoaded: boolean;
}

interface ConsentActions {
  loadConsent: () => Promise<void>;
  grantConsent: (consent: ParentalConsent) => Promise<void>;
  revokeConsent: () => Promise<void>;
  hasValidConsent: () => boolean;
}

type ConsentSlice = ConsentState & ConsentActions;

const createConsentSlice: StateCreator<ConsentSlice> = (set, get) => ({
  consent: null,
  consentLoaded: false,

  loadConsent: async () => {
    const record = await getConsentRecord();
    set({ consent: record, consentLoaded: true });
  },

  grantConsent: async (consent: ParentalConsent) => {
    await storeConsentRecord(consent);
    set({ consent });
  },

  revokeConsent: async () => {
    const current = get().consent;
    if (current) {
      const revoked: ParentalConsent = {
        ...current,
        revoked: true,
        revokedTimestamp: Date.now(),
      };
      await storeConsentRecord(revoked);
      set({ consent: revoked });

      // Trigger data deletion
      await handleDeleteAllData();
    }
  },

  hasValidConsent: () => {
    const { consent } = get();
    return consent !== null && !consent.revoked;
  },
});
```

### AI Tutoring — PII Stripping Proxy

The backend should act as a PII-stripping proxy for Gemini API calls:

```typescript
// Backend handler (Cloudflare Worker)
interface TutoringRequest {
  problemText: string;
  childAnswer: number;
  correctAnswer: number;
  misconceptionType?: string;
  gradeLevel: number;
  tutorMode: 'TEACH' | 'HINT' | 'BOOST';
}

// Zod schema for validation — only allows mathematical context
const TutoringRequestSchema = z.object({
  problemText: z.string().max(500),
  childAnswer: z.number(),
  correctAnswer: z.number(),
  misconceptionType: z.string().max(100).optional(),
  gradeLevel: z.number().int().min(1).max(3),
  tutorMode: z.enum(['TEACH', 'HINT', 'BOOST']),
});

async function handleTutoringRequest(req: Request): Promise<Response> {
  const body = await req.json();

  // Validate — reject anything outside the strict schema
  const parsed = TutoringRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response('Invalid request', { status: 400 });
  }

  // Build Gemini prompt — ONLY mathematical context
  const prompt = buildTutoringPrompt(parsed.data);

  // Call Gemini — no user identifiers in the request
  const response = await callGemini(prompt);

  // Return response — Gemini response is not stored
  return new Response(JSON.stringify({ explanation: response }));
}
```

### Parental Gate Implementation

```typescript
// Parental gate component pattern
interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function ParentalGate({ onSuccess, onCancel }: ParentalGateProps): JSX.Element {
  const [pin, setPin] = useState('');

  const handleSubmit = async () => {
    const storedHash = await SecureStore.getItemAsync(
      SECURE_KEYS.PARENTAL_PIN_HASH,
    );
    const inputHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin,
    );

    if (inputHash === storedHash) {
      onSuccess();
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPin('');
    }
  };

  // PIN input UI...
}

// Usage: gate all parent-only features
function SettingsScreen(): JSX.Element {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return (
      <ParentalGate
        onSuccess={() => setAuthenticated(true)}
        onCancel={() => navigation.goBack()}
      />
    );
  }

  return (
    // Parent settings: consent management, data deletion,
    // subscription, privacy policy, etc.
  );
}
```

### Network Request Safety

Ensure no PII leaks through network requests:

```typescript
// Request interceptor to strip/validate outgoing requests
function createSafeRequestInterceptor() {
  const originalFetch = global.fetch;

  global.fetch = async (input: RequestInfo, init?: RequestInit) => {
    // Log all outgoing requests in debug mode
    if (__DEV__) {
      const url = typeof input === 'string' ? input : input.url;
      const body = init?.body;

      // Warn if any known PII patterns are detected
      if (body && typeof body === 'string') {
        const piiPatterns = [
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,  // email
          /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,                      // phone
          /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,                        // SSN
        ];

        for (const pattern of piiPatterns) {
          if (pattern.test(body)) {
            console.warn(
              `[COPPA] Potential PII detected in request to ${url}`,
            );
          }
        }
      }
    }

    return originalFetch(input, init);
  };
}
```

---

## 9 — GDPR-K (Children's GDPR) Overlap

### Overview

If Tiny Tallies is available in the EU (and it will be — the App Store and Play Store are global), it must also comply with the GDPR's requirements for processing children's data, commonly called "GDPR-K."

### Key Differences: COPPA vs. GDPR-K

| Aspect | COPPA (US) | GDPR-K (EU) |
|---|---|---|
| **Age threshold** | Under 13 | Under 16 (default), member states can lower to 13 |
| **Actual threshold by country** | 13 everywhere | Varies: 13 (UK, Spain†), 14 (Spain, Italy, Austria), 15 (France, Czech Republic), 16 (Germany, Netherlands, Ireland) |
| **Consent from** | Parent/guardian | Parent/guardian (for children below threshold) |
| **Consent verification** | FTC-approved methods (VPC) | "Reasonable efforts" considering available technology |
| **Legal basis** | Consent (only option for children) | Consent OR legitimate interest (but consent preferred for children) |
| **Right to erasure** | Must delete on parent request | "Right to be forgotten" — stronger, broader |
| **Data portability** | Not required | Required — must provide data in machine-readable format |
| **DPO requirement** | Not required | Required if processing children's data at scale |
| **Breach notification** | No federal requirement (state laws vary) | 72-hour notification to supervisory authority |
| **Penalties** | Up to $50,120 per violation (FTC) | Up to 4% of global annual revenue or 20M EUR |
| **Scope** | US children | EU children (regardless of where company is based) |

† Spain lowered the threshold from 14 to 13 in 2024.

### GDPR-Specific Requirements Beyond COPPA

| Requirement | Details | Implementation |
|---|---|---|
| **Lawful basis** | Must have a legal basis for processing (consent for children) | Parental consent flow covers this |
| **Purpose limitation** | Data can only be used for stated purposes | Already aligned with COPPA data minimization |
| **Data portability** | Must export data in machine-readable format on request | Implement JSON export of child's learning data |
| **Right to erasure** | Must delete data "without undue delay" on request | Already implementing deletion flow |
| **Privacy by design** | Data protection must be built into the system, not added later | On-device-first architecture satisfies this |
| **Data Protection Impact Assessment (DPIA)** | Required for high-risk processing (processing children's data qualifies) | Must complete before launch |
| **Records of processing** | Must maintain records of all processing activities | Document in internal compliance file |
| **Breach notification** | Notify supervisory authority within 72 hours of a breach | Implement incident response plan |
| **Transparent information** | Privacy notice must be clear, concise, and use language a child can understand | Child-friendly privacy summary |

### Age Threshold Complexity

Since GDPR-K thresholds vary by country, and Tiny Tallies targets ages 6-9:

- **All our users are below every EU threshold** (minimum is 13)
- This simplifies our approach: we always need parental consent in the EU
- We do not need to implement per-country age gating

### Dual Compliance Strategy

Since COPPA is the more prescriptive framework (specific VPC methods, specific notice requirements), and our app targets children well below both COPPA and GDPR-K thresholds, the recommended strategy is:

1. **Lead with COPPA compliance** — it has the most specific technical requirements
2. **Layer GDPR additions on top** — data portability, DPIA, breach notification, DPO consideration
3. **Use the strictest standard** when requirements conflict

```typescript
// Data export for GDPR data portability
async function exportChildData(profileId: string): Promise<string> {
  const profile = useAppStore.getState().getProfile(profileId);
  if (!profile) throw new Error('Profile not found');

  const exportData = {
    exportDate: new Date().toISOString(),
    format: 'Tiny Tallies Child Data Export',
    version: '1.0',
    profile: {
      displayName: profile.displayName,
      gradeLevel: profile.gradeLevel,
      avatarId: profile.avatarId,
      createdAt: profile.createdAt,
    },
    learningData: {
      eloRatings: profile.eloRatings,
      bktState: profile.bktState,
      leitnerBoxes: profile.leitnerBoxes,
    },
    gamification: {
      xp: profile.xp,
      level: profile.level,
      coins: profile.coins,
      badges: profile.badges,
      streakDays: profile.streakDays,
    },
    sessionHistory: await getSessionHistory(profileId),
  };

  return JSON.stringify(exportData, null, 2);
}
```

### GDPR Compliance Additions Checklist

| Item | Status | Notes |
|---|---|---|
| Data portability (JSON export) | Planned | Implement in parent dashboard |
| DPIA (Data Protection Impact Assessment) | Not started | Required before EU launch |
| Processing records documentation | Not started | Internal document |
| 72-hour breach notification plan | Not started | Incident response procedure |
| DPO assessment | Not started | Assess if DPO needed based on scale |
| Cookie/storage consent (if web version) | N/A | Mobile app — no cookies |
| Child-friendly privacy summary | Planned | Simplified version of privacy policy |
| EU representative designation | Not started | Required if no EU establishment |

---

## 10 — Practical Compliance Checklist

### Pre-Development (Legal & Planning)

- [ ] **Engage COPPA-experienced legal counsel** — have them review architecture and privacy policy
- [ ] **Decide on COPPA Safe Harbor membership** — consider kidSAFE ($2,500-10,000/year) or PRIVO for third-party certification
- [ ] **Complete Data Protection Impact Assessment** (GDPR requirement)
- [ ] **Draft written data retention policy** (2025 amendment requirement)
- [ ] **Identify all third-party services** and obtain data processing agreements (DPAs) where applicable
- [ ] **Determine VPC methods** — credit card (paid users) + Email Plus (free users if no third-party sharing)

### Architecture & Design

- [ ] **On-device-first architecture** — children's learning data never leaves the device unless strictly necessary
- [ ] **No user accounts for children** — device-based profiles only (consistent with Tiny Tales)
- [ ] **Parental gate on all parent-only features** — PIN-based, consistent with Tiny Tales
- [ ] **No advertising IDs** — never import or reference IDFA/GAID
- [ ] **No third-party analytics SDKs** — use on-device analytics only
- [ ] **No social features for children** — no chat, messaging, or user-generated content sharing
- [ ] **No camera, microphone, or photo library access** — not needed for math learning
- [ ] **No precise geolocation** — not needed; do not request location permissions
- [ ] **All network requests over HTTPS** — enforce TLS 1.2+

### Implementation

- [ ] **expo-secure-store for sensitive data** — PIN hash, parent email, consent record, auth tokens
- [ ] **Consent flow** — implement VPC with credit card (subscription) and Email Plus (free tier)
- [ ] **Consent record storage** — timestamp, method, scope, privacy policy version
- [ ] **Consent revocation** — parent can revoke at any time; triggers data deletion
- [ ] **Data deletion flow** — complete deletion of all child data within 30 days of request
- [ ] **Data export** — JSON export of child's data for GDPR portability
- [ ] **Session history pruning** — 90-day rolling window, enforced on app launch
- [ ] **AI proxy on backend** — strip any residual PII before forwarding to Gemini
- [ ] **Zod validation on AI requests** — strict schema that only allows mathematical context
- [ ] **PII detection in dev mode** — warn if outgoing requests contain email/phone/SSN patterns
- [ ] **RevenueCat safe configuration** — disable ad attribution collection
- [ ] **Push notifications parent-controlled** — opt-in only, behind parental gate

### Privacy Policy & Notices

- [ ] **Comprehensive privacy policy** — covering all COPPA and GDPR requirements
- [ ] **Privacy policy accessible from App Store/Play Store listing** — link in store description
- [ ] **Privacy policy accessible in-app** — Settings > Privacy Policy
- [ ] **Direct notice to parents** — sent before any data collection begins
- [ ] **Child-friendly privacy summary** — simplified version a 6-9 year old could understand
- [ ] **Data retention policy published** — in privacy notice, specifying purposes and timelines
- [ ] **Third-party recipients listed** — Gemini API, RevenueCat (by name or category)
- [ ] **Persistent identifier usage disclosed** — what identifiers, what internal operations

### App Store Submission

- [ ] **Apple Kids Category age band** — select "Ages 6-8"
- [ ] **Apple age rating** — complete updated age rating questionnaire (4+ target)
- [ ] **Apple binary check** — verify no AdSupport framework linked; no IDFA access
- [ ] **Apple App Privacy labels** — accurately declare all data collection
- [ ] **Google Play Families Policy compliance** — complete self-certification
- [ ] **Google Play content rating** — complete IARC questionnaire (PEGI 3 / ESRB Everyone)
- [ ] **Google Play Data Safety** — accurately complete data safety section
- [ ] **Both stores: privacy policy link** — in store listing metadata

### Testing & Verification

- [ ] **Audit all network requests** — use network inspector to verify no PII leaves the device
- [ ] **Test data deletion** — verify all data is actually removed after deletion request
- [ ] **Test consent revocation** — verify data deletion is triggered
- [ ] **Test parental gate** — verify children cannot bypass PIN
- [ ] **Test with no internet** — verify core math practice works offline
- [ ] **Test AI requests** — verify no PII in Gemini prompts (log and inspect)
- [ ] **Verify RevenueCat configuration** — confirm no ad-related data collection
- [ ] **Verify no third-party analytics** — no Firebase Analytics, no Mixpanel, no Amplitude
- [ ] **Test data export** — verify JSON export contains all data and is accurate
- [ ] **Regression test consent flow** — after app update, consent state preserved

### Ongoing Compliance

- [ ] **Monitor FTC enforcement actions** — stay current on COPPA enforcement trends
- [ ] **Review third-party service updates** — watch for policy changes from Google, RevenueCat, etc.
- [ ] **Annual privacy policy review** — update policy when app features change
- [ ] **Monitor state laws** — Texas, Utah, Louisiana laws effective Jan 1, 2026; more states may follow
- [ ] **Respond to parent requests** — within 30 days for data access, deletion, or consent changes
- [ ] **Safe Harbor renewal** — if using kidSAFE or PRIVO, maintain certification annually
- [ ] **Incident response plan** — 72-hour notification for GDPR breaches; plan for COPPA breach
- [ ] **Record keeping** — maintain records of consent, data processing activities, deletion requests

---

## References

### FTC / COPPA

- [FTC COPPA Rule (16 CFR Part 312)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312)
- [FTC Press Release: 2025 COPPA Amendments](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data)
- [Federal Register: 2025 COPPA Rule Publication](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)
- [FTC: Verifiable Parental Consent Methods](https://www.ftc.gov/business-guidance/privacy-security/verifiable-parental-consent-childrens-online-privacy-rule)
- [FTC: Complying with COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [FTC: COPPA Safe Harbor Program](https://www.ftc.gov/enforcement/coppa-safe-harbor-program)

### Legal Analysis of 2025 Amendments

- [White & Case: Unpacking the FTC's COPPA Amendments](https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know)
- [Skadden: FTC Finalizes Child Online Privacy Rule Amendments](https://www.skadden.com/insights/publications/2025/01/ftc-finalizes-long-awaited-child-online-privacy)
- [Loeb & Loeb: Children's Online Privacy in 2025](https://www.loeb.com/en/insights/publications/2025/05/childrens-online-privacy-in-2025-the-amended-coppa-rule)
- [Securiti: FTC's 2025 COPPA Final Rule Amendments](https://securiti.ai/ftc-coppa-final-rule-amendments/)
- [Finnegan: The FTC's Updated COPPA Rule](https://www.finnegan.com/en/insights/articles/the-ftcs-updated-coppa-rule-redefining-childrens-digital-privacy-protection.html)
- [Latham & Watkins: FTC Publishes Updates to COPPA Rule](https://www.lw.com/en/insights/ftc-publishes-updates-to-coppa-rule)

### Apple & Google Platform Policies

- [Apple: Building Apps for Kids](https://developer.apple.com/app-store/kids-apps/)
- [Apple: Design Safe and Age-Appropriate Experiences](https://developer.apple.com/kids/)
- [Apple: Helping Protect Kids Online (Feb 2025)](https://developer.apple.com/support/downloads/Helping-Protect-Kids-Online-2025.pdf)
- [Google Play: Families Policies](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)
- [Google Play: Families Program](https://play.google.com/console/about/programs/families/)
- [Google Cloud: COPPA Compliance](https://cloud.google.com/security/compliance/coppa?hl=en)

### GDPR / International

- [IAPP: GDPR Matchup — COPPA](https://iapp.org/news/a/gdpr-matchup-the-childrens-online-privacy-protection-act)
- [Pandectes: COPPA, GDPR-K, and Age Verification](https://pandectes.io/blog/childrens-online-privacy-rules-around-coppa-gdpr-k-and-age-verification/)
- [Didomi: Safeguarding Children Online — Privacy Regulations 2025](https://www.didomi.io/blog/privacy-laws-underage-consumers)
- [TermsFeed: Consent for Minors — COPPA, GDPR, Emerging Laws](https://www.termsfeed.com/blog/consent-minors/)
- [PRIVO: EU GDPR Children's Privacy](https://www.privo.com/learn-more-gdpr)

### Safe Harbor Programs

- [PRIVO COPPA Safe Harbor Program](https://www.privo.com/coppa-safe-harbor-program)
- [kidSAFE Seal Program](https://www.kidsafeseal.com/)
- [iKeepSafe: COPPA 101](https://ikeepsafe.org/coppa-101/)

### Technical / Implementation

- [Expo: SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo: Store Data Guide](https://docs.expo.dev/develop/user-interface/store-data/)
- [React Native: Security Guide](https://reactnative.dev/docs/security)
- [RevenueCat Community: Kids Category Apps](https://community.revenuecat.com/sdks-51/how-should-i-answer-app-review-questions-about-the-kids-category-3041)
- [RevenueCat Blog: Monetizing Kids Apps](https://www.revenuecat.com/blog/growth/whats-the-best-way-to-monetize-kids-apps/)

---

*This document is for planning and development guidance. It does not constitute legal advice. Engage COPPA-experienced legal counsel before launching a children's app.*
