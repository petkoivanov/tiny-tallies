# Project Research Summary

**Project:** Tiny Tallies v0.5 — AI Tutor Milestone
**Domain:** LLM-powered conversational tutoring in a children's math learning app (React Native / Expo)
**Researched:** 2026-03-03
**Confidence:** HIGH

## Executive Summary

The v0.5 AI Tutor milestone adds an on-demand Gemini-powered tutoring layer to the existing session infrastructure. Research confirms this is an **additive integration** — the existing session, adaptive engine (Elo/BKT/Leitner), and virtual manipulatives remain entirely unchanged. The tutor grafts a parallel conversation layer that reads from session state but never writes to it. The recommended approach is to build the service layer first (types, prompts, orchestrator, Gemini client), then the store slice, then the composing hook, then the UI — a strict bottom-up dependency order that keeps each layer independently testable. Zero new npm dependencies are required; every capability needed (Gemini SDK, Zod, NetInfo, Reanimated, Secure Store) is already installed.

The most important design decisions are non-negotiable guardrails: the LLM must never compute math (always receive the correct answer from the programmatic engine), HINT mode must never reveal the answer (enforced by a deterministic post-generation output filter, not just a system prompt instruction), and COPPA 2025 amendments require a Verifiable Parental Consent gate before any LLM call transmits data to Google. The PNAS 2024 study is the anchor finding here — guardrailed AI produced +127% learning improvement while unguardrailed AI caused -17% decline. Every safety check exists to stay on the right side of that gap.

The feature scope is intentionally narrow for v0.5: child-initiated help only (never auto-trigger), text-only interface with pre-defined response buttons (no free-text input for ages 6-9), HINT/TEACH/BOOST three-mode escalation, and manipulative panel integration via a signal-not-direct-control pattern. Voice I/O, tutor analytics, and sandbox-mode tutoring are explicitly deferred. The architecture mirrors the existing ManipulativePanel pattern — an `Animated.View` overlay inside the component tree (not a Modal) with `CpaSessionContent` as the integration point.

---

## Key Findings

### Recommended Stack

The v0.5 milestone requires **no new npm dependencies**. The Gemini SDK (`@google/genai` v1.30.0, upgrade to v1.43.0 recommended) is already in `package.json`. All supporting libraries — Zod for output validation, NetInfo for offline detection, Secure Store for API key, Reanimated for panel animation, Lucide for icons — are already installed and Expo SDK 54 compatible.

**Core technologies:**
- `@google/genai` + Gemini 2.5 Flash: LLM engine — 232 tok/s output, 0.51s TTFT, $0.30/M input; fastest/cheapest model adequate for children's 2-3 sentence hints; upgrade `@google/genai` to v1.43.0 for latest fixes
- Zustand ephemeral slice (`tutorSlice`): chat state — excluded from `partialize` so it resets on app restart without requiring a store migration; no STORE_VERSION bump needed
- `ai.models.generateContentStream` (manual history): LLM call pattern — chosen over `ai.chats` convenience API to retain explicit control over context window, prompt injection guards, and per-problem reset; non-streaming (`generateContent`) is recommended as the stable primary path for v0.5 with streaming as a Phase 4 polish enhancement
- FlatList (not FlashList): chat message list — chat has fewer than 10 messages per problem; FlashList v1.x adds complexity with no virtualization benefit at this scale

### Expected Features

**Must have (table stakes):**
- Child-initiated help button — always visible, never pulsing or auto-triggering; autonomy is critical for math anxiety prevention
- Socratic hints that never reveal the answer — enforced by deterministic output filter post-generation (not just system prompt instructions alone)
- Age-appropriate language — prompt templates parameterized by child age bracket (6-7, 8-9) with sentence length and vocabulary constraints baked in
- Chat bubble UI with pre-defined response buttons — no free-text input; ages 6-7 cannot type reliably and pre-defined buttons eliminate the prompt injection attack surface entirely
- Per-problem chat reset — tutor state clears on every `currentIndex` change, preventing stale context contamination
- Offline graceful degradation — NetInfo check before every LLM call; canned fallback response shown; core practice continues uninterrupted
- Safety guardrails — all 4 Gemini configurable safety filter categories set to `BLOCK_LOW_AND_ABOVE` (default is OFF for Gemini 2.5+ models — an active misconfiguration risk)
- Error handling — API failures show child-friendly message, never crash the session

**Should have (differentiators):**
- Three-mode auto-escalation (HINT -> TEACH -> BOOST) — pure function in `tutorOrchestrator`; most tutors are single-mode
- Bug Library-informed hints — child's wrong answer matched to `bugId`; tutor explains the specific misconception, not generic "try again"
- TEACH mode triggers manipulative panel — tutor signals `shouldExpandManipulative`; `CpaSessionContent` responds; tutor never directly controls UI
- CPA-aware language — prompt adapts to concrete/pictorial/abstract stage visible on screen
- Effort praise only — system prompt enforces growth mindset language (Dweck 2006); ability praise explicitly forbidden

**Defer (v0.8+ or later):**
- Tutor analytics/metrics — parent dashboard milestone (v0.8)
- Voice input/output — TTS/STT dependencies, COPPA audio implications
- Free-text chat input
- Tutor in sandbox/exploration mode

### Architecture Approach

The integration is strictly additive: approximately 10 new files, 2-3 modified files, no changes to existing session/adaptive/manipulative code. The architecture has four distinct layers built bottom-up: (1) Service layer — `tutorTypes.ts`, `promptTemplates.ts`, `tutorOrchestrator.ts`, `geminiClient.ts` — all pure functions, fully unit-testable with no UI dependency; (2) Store layer — `tutorSlice.ts` added to `appStore.ts` composition, not persisted; (3) Hook layer — `useTutor.ts` composing services and store with AbortController lifecycle management; (4) UI layer — `ChatBubble`, `StreamingText`, `TutorChatPanel`, `TutorHelpButton`, and minimal changes to `CpaSessionContent`.

**Major components:**
1. `geminiClient.ts` — GoogleGenAI singleton (lazy init, module-scoped), `sendTutorMessage()` with abort support; Zod validation at the system boundary; max 200 output tokens per response
2. `promptTemplates.ts` — pure functions `buildSystemInstruction()`, `buildHintPrompt()`, `buildTeachPrompt()`, `buildBoostPrompt()`; typed context objects; bug descriptions passed in as resolved strings (not direct bugLibrary imports, keeping dependency direction clean)
3. `tutorOrchestrator.ts` — pure function `determineMode()` implementing HINT/TEACH/BOOST escalation as a typed discriminated union state machine; reads but never writes session/adaptive state
4. `tutorSlice.ts` — ephemeral Zustand slice; `chatMessages` as array (not Map) for React re-render compatibility; `hintLevel` counter tracking escalation; not listed in `partialize`
5. `useTutor.ts` — two-layer AbortController cleanup (explicit on `currentIndex` change + defense-in-depth on unmount); exposes `shouldExpandManipulative` signal to `CpaSessionContent`
6. `TutorChatPanel.tsx` — `Animated.View` overlay (not Modal, to avoid gesture conflicts with react-native-gesture-handler); max 40% screen height; FlatList for messages
7. `CpaSessionContent.tsx` (modified) — adds `TutorHelpButton` + `TutorChatPanel` to render tree; reads `shouldExpandManipulative` to trigger existing `ManipulativePanel`; `ManipulativePanel` itself is unmodified

### Critical Pitfalls

1. **LLM answer leaking in HINT mode** — Post-generation deterministic output filter is required (regex scan for correct answer as a standalone number, spelled out, or in indirect phrasing like "one more than 14"). In HINT mode, do NOT pass the correct answer in the prompt — the LLM cannot leak what it does not know. For BOOST mode (where the answer is eventually revealed), generate the reveal text programmatically, not via LLM. This is a hard requirement — the PNAS study's -17% learning outcome from unguardrailed AI is the consequence of skipping it.

2. **COPPA 2025 violation via Gemini API data transmission** — COPPA 2025 amendments (compliance deadline April 22, 2026) require SEPARATE Verifiable Parental Consent for third-party data sharing. The Gemini API is third-party. Use the paid API tier (not Google AI Studio free tier, which may use data for training). Data minimization is mandatory: never send child's name, specific age, or profile data — only math problem, numeric answer, and misconception tag. PII scrubbing layer on all outbound prompts. Written data retention policy must exist before launch.

3. **Gemini 2.5+ safety filters disabled by default** — All four configurable safety categories (harassment, hate speech, sexually explicit, dangerous content) default to OFF for Gemini 2.5+ models. Must explicitly set all to `BLOCK_LOW_AND_ABOVE`. Post-generation content validator also required: sentence length check (max 8 words/sentence for ages 6-7; 12 for ages 8-9), vocabulary check, negative language scan. Fallback to curated canned response library if validation fails — child must never see a raw LLM failure.

4. **Streaming failures on React Native mobile** — `generateContentStream` has known issues on React Native (GitHub #50015): streams hang on background/foreground transitions, network switches, and low-power mode. Use `generateContent` (non-streaming) as the stable primary path for v0.5. Add 8-second hard timeout. Buffer and validate the complete response before any UI display — never stream chunks to the UI before safety validation has run.

5. **Auto-escalation state not resetting between problems** — Tutor state must be scoped to `problemId` via TypeScript discriminated unions (`{ mode: 'idle' } | { mode: 'hint'; level: 1|2|3; problemId: string } | ...`). When `currentProblemIndex` advances, any tutor state with a non-matching `problemId` is automatically invalidated. The tutor escalation system and the existing session frustration guard must coordinate — two independent "child is struggling" detectors giving contradictory responses undermines both systems.

---

## Implications for Roadmap

Based on combined research, a four-phase structure is strongly recommended. The dependency order is dictated by the bottom-up architecture: services must exist before the store, store before the hook, hook before the UI. All critical safety requirements live in Phase 1 — this is a deliberate design choice, not an arbitrary ordering.

### Phase 1: Core LLM Service Layer

**Rationale:** All safety requirements (answer leak prevention, COPPA data minimization, safety filters, output validation) live in the service layer. Building this first means every subsequent phase inherits safe behavior automatically. This is also the most testable layer — pure functions with no UI dependencies. PITFALLS research is unambiguous: safety is a Phase 1 responsibility, not a "we'll add it later" concern.

**Delivers:** `tutorTypes.ts`, `promptTemplates.ts`, `tutorOrchestrator.ts`, `geminiClient.ts`, `tutorSlice.ts`, `appStore.ts` update (add tutorSlice composition), `useTutor.ts` (core lifecycle without UI integration), rate limiting (max 3 calls/problem, 20/session), output validation middleware (answer leak + content safety + sentence length), COPPA data minimization layer, AbortController pattern, offline detection via NetInfo

**Features addressed:** Socratic hints, per-problem reset, offline degradation, safety guardrails, error handling

**Pitfalls addressed:** Answer leaking (Pitfall 1), prompt injection (Pitfall 2), COPPA (Pitfall 3), inappropriate content (Pitfall 4), streaming failures (Pitfall 6 — non-streaming path with timeout), API key security, auto-escalation state machine definition (Pitfall 7)

**Research flag:** Standard patterns — Zustand slice and AbortController patterns are well-established in this codebase. Gemini `generateContent` (non-streaming) is the simpler and more stable path. No additional research needed.

### Phase 2: Chat UI and HINT Mode Integration

**Rationale:** With the service layer and safety guarantees in place, build the minimum viable tutor UI delivering HINT mode only. End-to-end user value (child taps Help and gets a hint) is achieved while keeping escalation scope controlled. Allows UX validation before committing to the full escalation design. The COPPA VPC gate and interstitial disclosure also ship here — required before any public testing.

**Delivers:** `ChatBubble.tsx`, `TutorChatPanel.tsx`, `TutorHelpButton.tsx`, `CpaSessionContent.tsx` integration, VPC parental consent gate and interstitial disclosure, pre-defined response buttons (no free-text input), character limit enforcement on bubble display

**Features addressed:** Help button (child-initiated), chat bubble UI, age-appropriate language display, pre-defined response buttons

**Pitfalls addressed:** Chat UI overwhelming young readers (Pitfall 5 — character limits, no free-text, pre-built response buttons), prompt injection (Pitfall 2 — pre-defined buttons eliminate the injection surface entirely), COPPA VPC gate (Pitfall 3)

**Research flag:** TTS for emergent readers is flagged as a "looks done but isn't" risk in PITFALLS. If text-to-speech is targeted for this phase, `expo-speech` needs an Expo SDK 54 compatibility check before committing — not currently in dependencies. Deferring TTS to Phase 4 is the lower-risk option.

### Phase 3: TEACH/BOOST Modes and Manipulative Integration

**Rationale:** Auto-escalation and manipulative integration are the primary differentiators of this tutor. They depend on Phase 1 (orchestrator state machine) and Phase 2 (UI components) being stable. The TEACH mode trigger for the ManipulativePanel — LLM says "try the blocks" and the blocks actually appear — is the feature that makes this tutor unique and distinct from generic chatbots.

**Delivers:** Full `tutorOrchestrator.ts` HINT->TEACH->BOOST escalation, Bug Library `bugId`-to-prompt mapping (`misconceptionPromptMap`), `shouldExpandManipulative` signal integration with `ManipulativePanel`, TEACH mode CPA-stage-aware prompts, BOOST mode programmatic answer reveal, frustration guard coordination, canned response fallback library (minimum 5 variants per hint level per age bracket)

**Features addressed:** Three-mode auto-escalation, Bug Library-informed hints, TEACH mode with manipulative trigger, CPA-aware tutoring, effort praise enforcement

**Pitfalls addressed:** Auto-escalation state bugs (Pitfall 7 — typed state machine with problemId scoping, frustration guard coordination), manipulative integration ("tutor SAYS try the blocks but panel doesn't open" — the most common integration failure mode)

**Research flag:** The orchestrator is a pure function state machine and the manipulative signal pattern mirrors existing code. No additional research needed. Integration testing is essential — explicitly verify that TEACH mode suggestions actually expand the ManipulativePanel with the correct type pre-selected.

### Phase 4: Polish and Streaming Enhancement

**Rationale:** After Phase 3 the tutor is feature-complete and safe. Phase 4 improves perceived quality. Streaming is deliberately deferred here because PITFALLS research explicitly recommends proving the non-streaming path stable first on both iOS and Android. Response caching reduces API costs at scale. TTS narration (if deferred from Phase 2) ships here.

**Delivers:** Streaming response display (conditional on non-streaming stability on both platforms), response caching layer (keyed by templateId + hintLevel + ageGroup + misconceptionTag), canned response library expansion, TTS audio playback for tutor messages, animated loading state (mascot thinking animation vs. static text)

**Features addressed:** Streaming text display, TTS narration, visual mode differentiation (HINT vs TEACH vs BOOST look distinct)

**Pitfalls addressed:** Streaming failures (Pitfall 6 — only enabled after non-streaming validated), Chat UI overwhelming (Pitfall 5 — TTS ensures 6-year-olds can access content)

**Research flag:** Streaming on React Native with `@google/genai` v1.43.0 on RN 0.81 may benefit from a targeted spike before implementation. GitHub issue #50015 indicates this area has been unstable — behavior may have changed in newer SDK versions. Investigate before committing to streaming in this phase.

### Phase Ordering Rationale

- **Safety first:** Every pitfall rated Critical belongs to Phase 1 or has Phase 1 prerequisites. The PNAS study's -17% learning outcome makes safety a launch blocker, not a post-launch concern.
- **Services before UI:** Prompt templates and output validation must exist before any response reaches a chat bubble. Testing the service layer in isolation validates the most complex logic before UI complexity is introduced.
- **HINT before full escalation:** Delivering HINT-only first reduces v0.5 launch scope. TEACH and BOOST are differentiators, not table stakes — the tutor is useful at HINT-only.
- **Non-streaming before streaming:** React Native streaming is a known failure mode. The 1-3 second latency for non-streaming `generateContent` is acceptable for children's hints, especially with a well-designed animated loading state.
- **COPPA compliance is a hard external deadline:** The VPC gate and data minimization layer must ship with Phase 1-2. The April 22, 2026 COPPA 2025 compliance deadline is the highest-risk external constraint on the milestone.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (TTS integration):** If text-to-speech is targeted for this phase rather than deferred, `expo-speech` compatibility with Expo SDK 54 on both iOS and Android needs verification. Not in current dependencies.
- **Phase 4 (Streaming on React Native):** React Native streaming behavior with `@google/genai` v1.43.0 on RN 0.81 needs targeted investigation before committing to implementation. GitHub issue #50015 is open and the streaming path has known failure modes on mobile.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Service layer):** Zustand slices, Zod validation, AbortController, Gemini `generateContent` non-streaming — all established in this codebase or official SDK docs.
- **Phase 3 (State machine + manipulative signal):** Orchestrator is a pure function; signal pattern mirrors existing ManipulativePanel logic in CpaSessionContent.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All dependencies verified in `package.json`. Gemini 2.5 Flash specs from official benchmarks. Zero new dependencies means zero compatibility risk. Upgrade to `@google/genai` v1.43.0 is optional but low-risk. |
| Features | HIGH | Grounded in PNAS 2024 study, existing project research docs (03-ai-tutoring-engine.md, 09-child-ux-design.md), and codebase analysis of existing integration points. Anti-features clearly defined from child UX research. |
| Architecture | HIGH | Verified against actual codebase structure. Component boundaries mirror established patterns (ManipulativePanel, existing hooks, Zustand slice composition). Build order is dependency-graph-derived. 10 new files, 2-3 modified — scope is well-bounded. |
| Pitfalls | HIGH (safety/COPPA/child UX) / MEDIUM (streaming) | Safety, COPPA, and child UX pitfalls sourced from OWASP, FTC rules, PNAS study, and existing research docs. Streaming pitfalls from community-reported GitHub issues — behavior may differ by SDK version and RN release. |

**Overall confidence:** HIGH

### Gaps to Address

- **TTS for emergent readers (ages 6-7):** PITFALLS research flags TTS as essential ("looks done but isn't") for the 6-7 age bracket, but no TTS library is in current dependencies. Decision needed in Phase 2 planning: include TTS in Phase 2 (adds `expo-speech` dependency, needs compatibility check) or defer to Phase 4. Deferring is lower-risk; including it is higher pedagogical value.

- **Gemini API tier for production:** Development must use the paid API tier from day one to match production data policies. COPPA 2025 compliance requires paid tier data protection controls — Google AI Studio free tier may use data for model training, which constitutes a COPPA violation. Coordinate with budget/monetization planning before Phase 1 begins.

- **COPPA VPC gate UX design:** Research establishes that VPC is required before first AI tutor use but does not specify the exact UX flow. Options: (a) integrate into existing parental PIN setup screen, (b) a separate first-use consent interstitial. This design decision affects Phase 2 scope and must be resolved during Phase 2 planning.

- **Canned response fallback library scope:** Research specifies minimum 5 variants per hint level per age bracket as content work, not just engineering. The library must be authored before Phase 3 can ship a reliable fallback path. Schedule this as a parallel content task during Phase 2, not a Phase 3 code task.

- **Rate limiting thresholds:** Research recommends max 3 LLM calls per problem, 20 per session, 50 per day per device. These are conservative estimates for legitimate use. Implement the rate limiter with configurable thresholds (not hardcoded constants) so they can be adjusted based on early usage data without requiring a code deploy.

---

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — dependency verification, Gemini 2.5 Flash specs, rationale for no-new-dependencies conclusion
- `.planning/research/FEATURES.md` — feature prioritization, dependency graph, MVP definition, anti-features
- `.planning/research/ARCHITECTURE.md` — component boundaries, data flows, code patterns, build order
- `.planning/research/PITFALLS.md` — safety, COPPA, content safety, streaming, escalation pitfalls with phase mapping
- [PNAS GPT-4 Tutoring Study 2024](https://doi.org/10.1073/pnas.2405945121) — guardrailed AI +127% vs. unguardrailed -17%
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — injection prevention
- [FTC COPPA Rule 2025 Amendments](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa) — compliance requirements including VPC for third-party data sharing
- [Gemini API Safety Settings](https://ai.google.dev/gemini-api/docs/safety-settings) — filter configuration; default OFF confirmed for 2.5+ models
- [@google/genai npm](https://www.npmjs.com/package/@google/genai) — v1.43.0 latest, already installed at v1.30.0
- Existing project research: `.planning/03-ai-tutoring-engine.md`, `.planning/09-child-ux-design.md`, `.planning/12-coppa-privacy.md`

### Secondary (MEDIUM confidence)
- [LLMs and Childhood Safety arxiv 2502.11242](https://arxiv.org/abs/2502.11242) — developmental sensitivity gaps in current LLM safety frameworks
- [SocraticLM NeurIPS 2024](https://openreview.net/forum?id=qkoZgJhxsA) — Socratic tutoring with LLMs
- [React Native AbortController issues GitHub #50015](https://github.com/facebook/react-native/issues/50015) — streaming stability on React Native
- [Gemini 2.5 Flash benchmarks](https://artificialanalysis.ai/models/gemini-2-5-flash) — 232 tok/s, 0.51s TTFT independently benchmarked
- [EPIC/Fairplay letter to FTC re: Google Gemini and children](https://fairplayforkids.org/wp-content/uploads/2025/05/Letter-to-FTC-re-Google-Gemini_EPIC-and-Fairplay_5.21.25.pdf) — regulatory advocacy context for COPPA exposure

---
*Research completed: 2026-03-03*
*Ready for roadmap: yes*
