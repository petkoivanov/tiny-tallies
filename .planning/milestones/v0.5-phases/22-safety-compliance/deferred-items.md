# Deferred Items - Phase 22

## Pre-existing Issues

1. **STORE_VERSION test mismatch** - `src/__tests__/appStore.test.ts` expects `STORE_VERSION = 5` but actual value is `6` (bumped in Plan 22-02 for `tutorConsentGranted`). Test assertion needs updating to `6`.
