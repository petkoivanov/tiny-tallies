---
phase: 22-safety-compliance
plan: 01
subsystem: safety
tags: [gemini, safety-filter, answer-leak, pii-scrubbing, coppa, content-validation, canned-fallbacks]

# Dependency graph
requires:
  - phase: 21-llm-service-store
    provides: TutorMode, AgeBracket, PromptParams types in src/services/tutor/types.ts
provides:
  - SafetyCheckResult, ContentValidationResult, FallbackCategory, SafetyPipelineResult types
  - GEMINI_SAFETY_SETTINGS constant (4 harm categories at BLOCK_LOW_AND_ABOVE)
  - numberToWord function covering 0-200 range
  - checkAnswerLeak for digit, word, and indirect answer leak detection
  - validateContent for sentence count, word count, vocabulary complexity per age bracket
  - scrubOutboundPii for COPPA-compliant PII removal from outbound prompts
  - runSafetyPipeline orchestrating all safety checks
  - getCannedFallback with 6 failure categories
  - CONTENT_WORD_LIMITS, MAX_SENTENCES, MAX_WORD_LENGTH constants
affects: [22-02, 22-03, geminiClient, useTutor, promptTemplates]

# Tech tracking
tech-stack:
  added: []
  patterns: [deterministic-safety-pipeline, pure-function-filters, type-assertion-for-esm-enums]

key-files:
  created:
    - src/services/tutor/safetyTypes.ts
    - src/services/tutor/safetyConstants.ts
    - src/services/tutor/safetyFilter.ts
    - src/services/tutor/__tests__/safetyConstants.test.ts
    - src/services/tutor/__tests__/safetyFilter.test.ts
  modified: []

key-decisions:
  - "Used type assertions (as HarmCategory) for Gemini SDK enums since @google/genai ESM module is not Jest-transformable"
  - "Answer leak detection runs in priority order: digit > word > indirect, earlier matches take precedence"
  - "Word boundary regex prevents false positives (17 does not match 7, seventy does not match seven)"
  - "numberToWord supports 0-200 with compound generation for 21-99 and 101-199"

patterns-established:
  - "Pure function safety pipeline: each filter is a standalone testable function with no side effects"
  - "Type assertion pattern for ESM enum imports: use 'VALUE' as EnumType for Jest compatibility"

requirements-completed: [SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05]

# Metrics
duration: 6min
completed: 2026-03-04
---

# Phase 22 Plan 01: Safety Filter Summary

**Deterministic safety filter with answer-leak detection (digit/word/indirect), age-bracketed content validation, PII scrubbing, and canned fallbacks for 6 failure categories**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-04T12:41:22Z
- **Completed:** 2026-03-04T12:47:42Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments
- Complete safety types system with discriminated union pipeline result
- GEMINI_SAFETY_SETTINGS with all 4 harm categories at BLOCK_LOW_AND_ABOVE (Gemini 2.5 defaults OFF)
- numberToWord covering 0-200 with static lookup + dynamic compound generation
- Answer-leak detection using word-boundary regex for digits, spelled-out words, and indirect phrases
- Content validation with per-age-bracket limits (sentences, words per sentence, vocabulary complexity)
- PII scrubber for COPPA-compliant outbound prompt cleaning (name + age patterns)
- Canned fallback messages for 6 failure categories with no template syntax or context leakage
- 75 tests passing, TypeScript clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Safety types and constants** - `233262b` (feat)
2. **Task 2: Safety filter pure functions** - `e2adad3` (feat)

## Files Created/Modified
- `src/services/tutor/safetyTypes.ts` - SafetyCheckResult, ContentValidationResult, FallbackCategory, SafetyPipelineResult types
- `src/services/tutor/safetyConstants.ts` - GEMINI_SAFETY_SETTINGS, NUMBER_WORDS, numberToWord, CONTENT_WORD_LIMITS, MAX_SENTENCES, MAX_WORD_LENGTH, CANNED_FALLBACKS, getCannedFallback
- `src/services/tutor/safetyFilter.ts` - checkAnswerLeak, validateContent, scrubOutboundPii, runSafetyPipeline
- `src/services/tutor/__tests__/safetyConstants.test.ts` - 27 tests covering safety settings shape, numberToWord edge cases, fallback completeness
- `src/services/tutor/__tests__/safetyFilter.test.ts` - 48 tests covering answer-leak detection, content validation, PII scrubbing, pipeline orchestration

## Decisions Made
- **Type assertions for Gemini SDK enums:** The `@google/genai` module uses TypeScript enums (`HarmCategory`, `HarmBlockThreshold`) but is ESM-only and not Jest-transformable. Used `'VALUE' as EnumType` pattern for type safety without runtime import issues.
- **Detection priority order:** Digit leak > word leak > indirect leak. Earlier, more specific patterns take precedence. Tests adjusted to match this behavior (e.g., "it equals 7" triggers digit leak, not indirect).
- **Vocabulary complexity proxy:** Word character length (letters only, stripped of punctuation) rather than syllable counting. Simpler, deterministic, sufficient for ages 6-9.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed GEMINI_SAFETY_SETTINGS enum typing for Jest/ESM compatibility**
- **Found during:** Task 2 verification (typecheck passed but Jest failed)
- **Issue:** Direct enum imports from `@google/genai` failed at runtime in Jest because the module is ESM-only and not in `transformIgnorePatterns`
- **Fix:** Changed from runtime enum imports to type-only imports with string literal type assertions (`'HARM_CATEGORY_HARASSMENT' as HarmCategory`)
- **Files modified:** `src/services/tutor/safetyConstants.ts`
- **Verification:** `npm run typecheck` clean + all 75 tests passing
- **Committed in:** `e2adad3` (Task 2 commit)

**2. [Rule 1 - Bug] Corrected test expectations for answer-leak detection priority**
- **Found during:** Task 2 RED phase
- **Issue:** Tests expected `answer_indirect_leak` for "it equals 7" but digit check (Pattern 1) fires first, returning `answer_digit_leak`; similarly "it equals seven" returns `answer_word_leak` from Pattern 2
- **Fix:** Updated test expectations to match the correct detection priority order
- **Files modified:** `src/services/tutor/__tests__/safetyFilter.test.ts`
- **Verification:** All 48 filter tests passing
- **Committed in:** `e2adad3` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes were necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Safety types and pure functions ready for wiring into `geminiClient.ts` (GEMINI_SAFETY_SETTINGS) and `useTutor.ts` (safety pipeline)
- `index.ts` barrel exports need updating in Plan 02/03 to expose new modules
- VPC consent gate (SAFE-06) and system instruction enhancement (LLM-03) are separate plans

## Self-Check: PASSED

- All 5 created files verified on disk
- Both task commits (233262b, e2adad3) verified in git log
- 75 tests passing, TypeScript clean

---
*Phase: 22-safety-compliance*
*Completed: 2026-03-04*
