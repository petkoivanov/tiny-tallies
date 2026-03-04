# Technology Stack

**Project:** Tiny Tallies v0.5 AI Tutor
**Researched:** 2026-03-03

## Recommended Stack

### Core Framework (Existing -- No Changes)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Native | 0.81.5 | Mobile framework | Already in place |
| Expo | 54 | Managed workflow | Already in place |
| TypeScript | 5.9 | Strict mode | Already in place |
| Zustand | 5 | State management | Already in place, domain slices pattern |

### LLM Integration (New)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @google/genai | ^1.30.0 (installed) | Gemini API client | Already in package.json. Supports streaming, AbortSignal, system instructions. Upgrade to ^1.43.0 recommended for latest fixes |
| Gemini 2.5 Flash | latest | LLM model | 232 tok/s, 0.51s TTFT, $0.30/M input -- fastest and cheapest Flash model. Thinking can be disabled for max speed |

### Supporting Libraries (Existing -- Already Installed)

| Library | Version | Purpose | Used By Tutor |
|---------|---------|---------|---------------|
| Zod | (installed) | Runtime validation at system boundaries | Validates LLM responses |
| @react-native-community/netinfo | ^11.4.1 | Network connectivity check | Offline detection before LLM calls |
| expo-secure-store | (installed) | Secure API key storage | Gemini API key retrieval |
| react-native-reanimated | (installed) | Animations | Chat panel slide-in animation |
| lucide-react-native | (installed) | Icons | Help button, chat UI icons |

### No New Dependencies Required

The AI tutor integration requires **zero new npm dependencies**. Everything needed is already in the project:
- `@google/genai` for LLM calls
- `@react-native-community/netinfo` for connectivity
- `expo-secure-store` for API key
- `zod` for response validation
- `react-native-reanimated` for panel animations

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| LLM Model | Gemini 2.5 Flash | Gemini 2.5 Pro | 10x more expensive, higher latency. Children's hints are simple text -- Pro quality unnecessary |
| LLM Model | Gemini 2.5 Flash | Gemini 2.5 Flash-Lite | Cheaper ($0.10/M vs $0.30/M) but lower quality for educational text. Flash-Lite is better for classification tasks, not conversation |
| Chat API | Manual history + generateContentStream | ai.chats.create() | Chats API manages history automatically but gives less control over prompt injection, context reset, and per-problem cleanup |
| Chat UI | FlatList | FlashList v1.x | Chat has <10 messages. FlashList adds complexity for no benefit at this scale |
| State | Zustand ephemeral slice | React Context | Context would work but breaks the established Zustand pattern. All other state lives in slices |
| State | Zustand ephemeral slice | Local useState in useTutor | Multiple components need to read chat state (ChatPanel, CpaSessionContent, SessionScreen). Local state would require prop drilling |
| Streaming | Native async iteration | WebSocket | @google/genai already provides streaming via async iterators. No WebSocket needed |

## Installation

```bash
# No new installs needed! All dependencies are already in package.json.

# Optional: upgrade @google/genai to latest
npm install @google/genai@latest
```

## Sources

- [@google/genai npm](https://www.npmjs.com/package/@google/genai) -- v1.43.0 latest
- [Gemini 2.5 Flash pricing](https://llm-stats.com/models/compare/gemini-2.0-flash-vs-gemini-2.5-flash) -- pricing comparison
- Existing package.json analysis -- all dependencies verified present
