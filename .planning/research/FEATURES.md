# Feature Landscape

**Domain:** AI Tutor integration for children's math learning app (v0.5 milestone)
**Researched:** 2026-03-03

## Table Stakes

Features the AI tutor must have at launch. Missing = tutor feels broken or unsafe.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Help button (child-initiated) | Never auto-interrupt; child controls when to ask | Low | Simple Pressable, always visible during session |
| Socratic hints (never reveals answer) | PNAS 2024: unguardrailed AI causes -17% learning decline | Med | Prompt engineering + output validation |
| Age-appropriate language | Ages 6-9 have vastly different vocabulary | Med | Prompt templates with age-parameterized constraints |
| Chat bubble UI | Children expect conversational interface | Med | Bubbles with tutor/child styling |
| Per-problem chat reset | Stale context from old problems confuses | Low | Reset on currentIndex change |
| Streaming text display | 0.51s TTFT is noticeable for impatient children | Med | Streaming chunks into animated text |
| Abort on problem advance | Prevent stale responses appearing after moving on | Low | AbortController cleanup pattern |
| Offline graceful degradation | Core practice must work without internet | Low | NetInfo check, friendly message |
| Safety guardrails in system prompt | No negative language, no scary examples, no allergens | Low | Constant system instruction string |
| Error handling | API failures must not crash session | Low | Try/catch with child-friendly error message |

## Differentiators

Features that make this tutor stand out from competitors. Not expected, but high value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Three-mode auto-escalation (HINT/TEACH/BOOST) | Most tutors are one-mode. Escalation adapts to struggle level automatically | Med | Pure function in tutorOrchestrator |
| Bug Library-informed explanations | Tutor explains the SPECIFIC misconception, not generic "try again" | Med | Pass bugId + description to prompt |
| TEACH mode triggers manipulatives | LLM says "use blocks" and blocks actually appear | Med | shouldExpandManipulative signal from useTutor |
| CPA-aware tutoring | Tutor adjusts language based on concrete/pictorial/abstract stage | Low | CPA stage is a prompt parameter |
| Effort praise (not ability praise) | Research: growth mindset language improves learning outcomes | Low | System prompt constraint |
| Manipulative-specific suggestions | "Try using the number line" (names the actual tool on screen) | Low | ManipulativeType passed to prompt template |

## Anti-Features

Features to explicitly NOT build in v0.5.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Free text input | Ages 6-7 cannot type; adds keyboard complexity | Use pre-built response buttons ("More help", "Got it!") |
| Tutor auto-starts on wrong answer | Interrupts flow; children should feel in control (CLAUDE.md: child-initiated) | Show help button; child taps when ready |
| Voice input/output | Adds speech-to-text/TTS dependencies, COPPA implications for audio | Text-only for v0.5; defer voice to later milestone |
| Persistent chat history across sessions | No pedagogical value; stale context is harmful | Reset per-problem |
| Tutor computes math answers | CLAUDE.md guardrail: LLM must NEVER compute math | Pass precomputed correct answer from math engine |
| Analytics/tracking of tutor usage | Adds store complexity; defer to parent dashboard milestone (v0.8) | Log nothing in v0.5; add metrics in v0.8 |
| Custom avatars/personality for tutor | Scope creep; focus on pedagogical quality first | Use consistent friendly persona via system prompt |
| Tutor for sandbox/exploration mode | Sandbox is free-play; tutor guidance contradicts exploration | Tutor only in session context |

## Feature Dependencies

```
geminiClient.ts (Gemini SDK wrapper)
    |
    v
promptTemplates.ts (prompt builders) ------> Bug Library types (existing)
    |                                          CPA types (existing)
    v
tutorOrchestrator.ts (mode selection)
    |
    v
tutorSlice.ts (chat state)
    |
    v
useTutor.ts (hook composing all above)
    |
    v
TutorChatPanel.tsx (UI) -------> ChatBubble.tsx + StreamingText.tsx
    |
    v
TutorHelpButton.tsx (entry point)
    |
    v
CpaSessionContent.tsx (integration point, MODIFIED)
    |--- reads shouldExpandManipulative from useTutor
    |--- passes context to useTutor
    v
ManipulativePanel.tsx (existing, UNMODIFIED -- tutor triggers expansion via CpaSessionContent)
```

## MVP Recommendation

**Must build (Phase 1-2):**
1. Gemini client with streaming + abort (foundational service)
2. Prompt templates with safety guardrails (Socratic hints, age-appropriate)
3. Tutor orchestrator with HINT mode only (simplest escalation)
4. Tutor Zustand slice (ephemeral chat state)
5. useTutor hook with AbortController cleanup
6. ChatBubble + StreamingText UI components
7. TutorChatPanel + TutorHelpButton
8. CpaSessionContent integration

**Build next (Phase 3):**
9. TEACH mode with manipulative trigger
10. BOOST mode with full walkthrough
11. Bug Library-informed explanations (bugId -> description in prompt)
12. Auto-escalation logic (HINT -> TEACH -> BOOST)

**Defer:**
- Tutor analytics/metrics (v0.8 parent dashboard)
- Voice I/O
- Free text input
- Tutor in sandbox mode

## Sources

- [03-ai-tutoring-engine.md] -- three-mode design, prompt templates, safety rules
- [05-misconception-detection.md] -- Bug Library integration with tutor
- [09-child-ux-design.md] -- age-appropriate interaction patterns
- PNAS 2024 study referenced in research doc: guardrailed AI +127%, unguardrailed -17%
- Existing codebase analysis of CpaSessionContent and ManipulativePanel integration points
