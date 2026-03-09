# Tiny Tallies

AI-powered math learning app for children ages 6-9 — React Native 0.81 + Expo 54 (managed workflow), TypeScript strict mode, Zustand for state.

Sister product to [Tiny Tales](../tiny-tales/) (children's storytelling app). Shares the same tech stack and development patterns.

## Commands

- `npm test` — run full Jest test suite
- `npm test -- --testPathPattern=<pattern>` — run a single test file (prefer this over full suite)
- `npm run typecheck` — TypeScript type checking (`tsc --noEmit`)
- `npm run lint` — ESLint for `src/`
- `npm run lint:fix` — auto-fix lint issues
- `npm run format` — Prettier format all source files
- `npx expo start` — start Expo dev server

### Backend (Cloudflare Workers)

- `cd backend/tiny-tallies-api && npx wrangler dev` — start local dev server (port 8788)
- `cd backend/tiny-tallies-api && npx wrangler deploy` — deploy to production
- `cd backend/tiny-tallies-api && npx wrangler d1 execute tiny-tallies-db --remote --file=./src/db/schema.sql` — apply schema migrations
- Backend tests: `cd backend/tiny-tallies-api && npx vitest`

## Code Style

- Files must stay under 500 lines. Refactor into focused modules with barrel exports (`index.ts`).
- Use ES module imports; destructure where possible.
- Use `lucide-react-native` for icons — no other icon libraries.
- Use `StyleSheet.create` for styles, not inline style objects in render.
- Zod for runtime validation at system boundaries.
- **No native `Alert.alert`** — use `AppDialog` component (`src/components/AppDialog.tsx`) for all confirmations and error messages. It renders a themed in-app modal that matches the active theme. All dialogs must go through this centralized component.

## Architecture

- **State:** Zustand store composed from domain slices in `src/store/slices/`. Never add state directly to `appStore.ts` — create or extend a slice.
- **Store migrations:** Version tracked in `appStore.ts`. Bump version + add migration function when changing schema shape.
- **Services:** Domain logic lives in `src/services/`. Screens compose hooks + components, not raw service calls.
- **Math engine:** Programmatic problem generation — the engine computes correct answers, generates distractors. LLM (Gemini) is used ONLY for context wrapping and explanations, NEVER for computing math.
- **Adaptive difficulty:** Elo rating system targeting 85% success rate. Bayesian Knowledge Tracing (BKT) for mastery estimation per skill.
- **Spaced repetition:** Modified Leitner system with age-adjusted intervals (6 boxes). Drop 2 boxes on wrong answer, not to Box 1.
- **Misconception detection:** Bug Library pattern — pre-computed wrong answers for known misconception patterns. 2-then-3 confirmation rule before intervention.
- **AI Tutor:** Three modes — TEACH (CPA progression), HINT (Socratic questioning), BOOST (deep scaffolding). LLM never reveals answers in hints.
- **Virtual manipulatives:** Base-ten blocks, number lines, ten frames, counters, fraction strips, bar models. Built with react-native-gesture-handler + react-native-reanimated.
- **Async hooks:** Must use AbortController for cancellation. Follow the defense-in-depth cleanup pattern (explicit handlers + useEffect unmount).
- **Navigation:** React Navigation 7 native-stack. Screens defined in `src/navigation/`.
- **Backend:** Cloudflare Workers + D1 (SQLite). JWT auth verification via `jose` (Google/Apple JWKS). Deployed at `https://tiny-tallies-api.magic-mirror-works.workers.dev`.
- **Auth:** Google/Apple Sign-In via `@react-native-google-signin/google-signin` + `expo-apple-authentication`. Tokens in `expo-secure-store`.
- **Cloud sync:** Incremental delta-based sync. Offline queue in AsyncStorage, NetInfo connectivity trigger. Score deltas are append-only; badges merge additively; skill states take MAX values.
- **Error tracking:** Sentry (`@sentry/react-native`) with PII scrubbing (child names, ages, emails). Opt-out toggle in ParentalControlsScreen.

## Testing

- Jest + jest-expo with React Native Testing Library.
- Run `npm run typecheck` after making code changes.
- Existing tests must continue to pass — run affected tests before finishing.

## Guardrails

- IMPORTANT: Don't modify store migration version without adding a corresponding migration function.
- Don't bypass `expo-secure-store` for sensitive data (parental PIN, API keys).
- Don't add new dependencies without confirming Expo SDK 54 compatibility.
- Don't edit `.env`, `eas.json`, `.dev.vars`, or credential files.
- LLM must NEVER compute math answers — always use the programmatic engine.
- LLM hints must NEVER reveal the answer — Socratic questioning only.
- No punitive mechanics (hearts, lives, game over) — see gamification research.
- COPPA compliance required for all social features — no chat, no personal info.
- FlashList v1.x only — v2.x requires new architecture and will crash on RN 0.81.
- **Build changes via Expo config plugins**: Never edit generated files in `android/` or `ios/` directly — `npx expo prebuild --clean` regenerates them. Use Expo config plugins in `plugins/` so changes persist across clean rebuilds.

## Project Context

- Planning docs & research: `.planning/` (market research, curriculum, AI tutoring, manipulatives, misconception detection, spaced repetition, gamification)
- Project overview: `.planning/PROJECT.md`
- Backend: `backend/tiny-tallies-api/` (Cloudflare Workers + D1)
- Backend secrets: `backend/tiny-tallies-api/.dev.vars` (gitignored). Production secrets set via `wrangler secret put`.
- Windows development environment — use PowerShell-compatible commands.
