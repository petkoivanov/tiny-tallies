# Phase 36: Avatars & Frames - Research

**Researched:** 2026-03-05
**Domain:** Avatar customization, cosmetic unlocks, store migration, Reanimated sparkle animation
**Confidence:** HIGH

## Summary

This phase expands the existing avatar system (8 animal emoji presets) to 12-15, adds 5 special badge-unlocked avatars, 6 decorative frames (colored border rings), and builds an avatar picker screen with live preview. The implementation builds heavily on established patterns: the `AVATARS` array in `avatars.ts`, `BadgeGrid`/`BadgeDetailOverlay` sectioned grid with locked/unlocked states, Zustand slice architecture with versioned migrations, and Reanimated for the sparkle animation on special avatars.

The codebase is well-structured for this work. The `childProfileSlice` needs a `frameId` field, the `AVATARS` constant and `AvatarId` type need expansion with a parallel `SPECIAL_AVATARS` array and `FRAMES` constant, and a new `AvatarPickerScreen` needs to be added to the navigation stack. The badge popup (`BadgeUnlockPopup`) needs a small addition to show cosmetic unlock text. The HomeScreen avatar circle needs frame border styling and conditional sparkle animation.

**Primary recommendation:** Follow the BadgeGrid sectioned-grid pattern for the picker, keep avatar/frame constants co-located in `store/constants/`, add `frameId` and `specialAvatarId` to `childProfileSlice` with STORE_VERSION 11 migration, and build a dedicated cosmetic unlock registry mapping badge IDs to cosmetic IDs.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Expand from 8 to 12-15 animal emoji presets (more animals theme, no fantasy creatures)
- Keep the established animal emoji-in-circle pattern from existing AVATARS array
- New presets added to the same `avatars.ts` constants file, extending the `AVATARS` array and `AvatarId` union type
- 5 special avatars using rarer/cooler animal emoji (e.g., unicorn, dragon, eagle) -- same emoji-in-circle style as regular presets
- Locked until a specific badge is earned (1:1 mapping -- one badge unlocks one avatar)
- When a special avatar is equipped, a subtle sparkle animation plays on the avatar circle on the home screen
- Frames are colored border rings around the avatar circle -- implemented with borderWidth + borderColor styling
- 6 frames total, each a distinct color/style (e.g., gold, silver, rainbow, ice blue, fire orange, emerald green)
- Static borders -- no animation on frames themselves
- No frame equipped = no border decoration (current behavior preserved, frames are purely additive)
- Sectioned grid with three sections and headers: "Avatars" (12-15 presets), "Special Avatars" (5 locked/unlocked), "Frames" (6 locked/unlocked)
- ScrollView with section headers -- matches BadgeCollection's categorized grid pattern from Phase 33
- Large live preview at top of screen showing current avatar + equipped frame combo, updates as child taps different items, "Save" button to confirm
- Locked items shown dimmed (reduced opacity) with lock icon overlay -- consistent with locked badges in Phase 33
- Tapping a locked item shows a bottom sheet overlay with: avatar/frame preview, badge name + emoji needed, progress hint
- All cosmetic unlocks use existing badges from the 31-badge registry -- no new badges created
- 1:1 mapping: each special avatar and frame is unlocked by one specific badge
- When a badge popup shows (Phase 33 celebration), add a line mentioning the cosmetic unlock -- no separate popup

### Claude's Discretion
- Exact animal emoji choices for the 4-7 new presets and 5 special avatars
- Which specific badges unlock which avatars and frames (distribute across difficulty levels, ensure early unlocks are achievable)
- Frame color hex values that work with the dark theme
- Sparkle animation implementation details (Reanimated)
- Grid column count and item sizing
- Store migration shape for equipped frame ID
- Whether to create a new AvatarPickerScreen or update existing flow

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AVTR-01 | Avatar preset pool expanded from 8 to 12-15 options | Extend AVATARS array in avatars.ts, expand AvatarId union type |
| AVTR-02 | 4-7 special avatars unlockable through achievement badges | New SPECIAL_AVATARS constant with badge-to-avatar mapping, earnedBadges check for unlock |
| AVTR-03 | 5-7 frame decorations around avatar earned via badges | New FRAMES constant with badge-to-frame mapping, borderWidth+borderColor on avatar circle |
| AVTR-04 | Updated avatar picker shows all presets + locked unlockables with requirements | New AvatarPickerScreen with sectioned grid, live preview, lock overlay, detail bottom sheet |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | already installed | Sparkle animation on special avatars | Project standard for all animations (Phase 33/34 patterns) |
| zustand | already installed | Store frameId/specialAvatarId in childProfileSlice | Project state management |
| @react-navigation/native-stack | already installed | AvatarPicker screen route | Project navigation |
| lucide-react-native | already installed | Lock icon overlay on locked items | Project icon library |

### Supporting
No new dependencies needed. All functionality uses existing project libraries.

## Architecture Patterns

### Recommended Project Structure
```
src/
  store/
    constants/
      avatars.ts          # Expanded AVATARS + new SPECIAL_AVATARS + FRAMES + unlock mapping
    slices/
      childProfileSlice.ts  # Add frameId, extend avatarId to handle specials
    migrations.ts           # v10 -> v11 migration for frameId
    appStore.ts             # STORE_VERSION = 11, partialize frameId
  screens/
    AvatarPickerScreen.tsx  # New screen: sectioned grid + live preview
  components/
    avatars/
      AvatarCircle.tsx      # Shared component: emoji circle + frame border + sparkle
      AvatarGrid.tsx        # Sectioned grid for picker (avatars, specials, frames)
      CosmeticDetailOverlay.tsx  # Bottom sheet for locked item details
  navigation/
    types.ts                # Add AvatarPicker route
    AppNavigator.tsx        # Register AvatarPicker screen
```

### Pattern 1: Cosmetic Constants Registry
**What:** All cosmetic items (avatars, special avatars, frames) defined as `as const` arrays with typed IDs, similar to AVATARS and BADGES patterns.
**When to use:** Defining the data model for cosmetics.
**Example:**
```typescript
// store/constants/avatars.ts

export const AVATARS = [
  // existing 8 + 4-7 new
  { id: 'fox', label: 'Fox', emoji: '\uD83E\uDD8A' },
  // ... expanded to 12-15
] as const;

export const SPECIAL_AVATARS = [
  { id: 'unicorn', label: 'Unicorn', emoji: '\uD83E\uDD84', badgeId: 'behavior.sessions.bronze' },
  { id: 'dragon', label: 'Dragon', emoji: '\uD83D\uDC09', badgeId: 'mastery.category.addition' },
  // ... 5 total, each with a badgeId for unlock
] as const;

export type SpecialAvatarId = (typeof SPECIAL_AVATARS)[number]['id'];

export const FRAMES = [
  { id: 'gold', label: 'Gold Ring', color: '#ffd700', badgeId: 'behavior.streak.gold' },
  { id: 'silver', label: 'Silver Ring', color: '#c0c0c0', badgeId: 'behavior.streak.silver' },
  // ... 6 total
] as const;

export type FrameId = (typeof FRAMES)[number]['id'];
```

### Pattern 2: Unlock Check via earnedBadges
**What:** Check if a cosmetic is unlocked by looking up its badgeId in the store's earnedBadges record.
**When to use:** Rendering locked/unlocked state in picker and checking equip eligibility.
**Example:**
```typescript
function isCosmeticUnlocked(badgeId: string, earnedBadges: Record<string, EarnedBadge>): boolean {
  return badgeId in earnedBadges;
}
```

### Pattern 3: AvatarCircle Shared Component
**What:** Extract avatar rendering from HomeScreen into reusable component that handles regular avatars, special avatars, frame borders, and sparkle animation.
**When to use:** HomeScreen, AvatarPickerScreen preview, anywhere avatar is displayed.
**Example:**
```typescript
// components/avatars/AvatarCircle.tsx
interface AvatarCircleProps {
  emoji: string;
  size: number;
  frameColor?: string;      // border color from equipped frame
  isSpecial?: boolean;       // triggers sparkle animation
}
```

### Pattern 4: Sectioned Grid (follows BadgeGrid)
**What:** Three-section grid layout identical to BadgeGrid pattern -- section title + flexWrap row.
**When to use:** AvatarPickerScreen layout.
**Example:**
```typescript
// Same pattern as BadgeGrid.tsx
<View>
  {sections.map(section => (
    <View key={section.title}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.grid}>
        {section.items.map(item => (
          <Pressable key={item.id} style={styles.item}>
            {/* item content */}
          </Pressable>
        ))}
      </View>
    </View>
  ))}
</View>
```

### Pattern 5: Live Preview with Temp State
**What:** Picker screen maintains local `selectedAvatarId`, `selectedFrameId` state. Tapping items updates preview immediately. "Save" commits to store.
**When to use:** AvatarPickerScreen UX.
**Example:**
```typescript
const [previewAvatarId, setPreviewAvatarId] = useState(currentAvatarId);
const [previewFrameId, setPreviewFrameId] = useState(currentFrameId);
// On Save:
setChildProfile({ avatarId: previewAvatarId });
// + set frameId via new action
```

### Anti-Patterns to Avoid
- **Storing full cosmetic data in store:** Only store IDs (avatarId, frameId). Resolve emoji/color/label from constants at read time, same as badge pattern where EarnedBadge stores only earnedAt.
- **Separate unlock tracking:** Do NOT create a separate "unlockedCosmetics" store field. Use earnedBadges + the badgeId on each cosmetic constant to determine unlock status. Single source of truth.
- **Inline styles for frame borders:** Use StyleSheet.create with dynamic style arrays, not inline objects.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lock icon overlay | Custom lock image/SVG | `Lock` from lucide-react-native | Consistent with project icon library |
| Bottom sheet overlay | Custom gesture-based sheet | Modal with centered card (BadgeDetailOverlay pattern) | Matches established Phase 33 pattern exactly |
| Sparkle animation | Custom particle system | Reanimated rotating scale/opacity on small star views | Simple, performant, no extra deps |
| Badge lookup | Manual filtering | `getBadgeById(badgeId)` from badgeRegistry | Already exists and tested |

**Key insight:** The entire cosmetic unlock system piggybacks on the existing badge infrastructure -- no new unlock tracking, no new evaluation engine, just a mapping table from badge IDs to cosmetic items.

## Common Pitfalls

### Pitfall 1: AvatarId Type Union Explosion
**What goes wrong:** Adding special avatars to the AvatarId union type makes all existing `avatarId` checks need updating.
**Why it happens:** If special avatar IDs are added to the same AVATARS array and AvatarId type.
**How to avoid:** Keep `SPECIAL_AVATARS` as a separate constant with its own `SpecialAvatarId` type. Add a separate `specialAvatarId` field to childProfileSlice (or allow avatarId to be `AvatarId | SpecialAvatarId` with a discriminator). The simplest approach: add all avatar IDs (regular + special) to a single `AllAvatarId` type, but keep the constants arrays separate for UI sectioning.
**Warning signs:** TypeScript errors on exhaustive checks, AVATARS.find() returning undefined for special IDs.

### Pitfall 2: Migration Missing frameId Default
**What goes wrong:** Existing users get undefined frameId, causing render errors on HomeScreen.
**Why it happens:** Forgetting to add frameId to migration or partialize.
**How to avoid:** Migration v10->v11: `state.frameId ??= null`. Add frameId to partialize in appStore.ts. Ensure HomeScreen handles frameId=null (no border, current behavior).

### Pitfall 3: Stale Preview After Save
**What goes wrong:** Preview shows old avatar after saving and navigating back.
**Why it happens:** Local state not synced with store after save.
**How to avoid:** Initialize preview state from store on mount, navigate back after save (goBack).

### Pitfall 4: Sparkle Animation Memory Leak
**What goes wrong:** Sparkle animation continues running when HomeScreen is not focused.
**Why it happens:** Reanimated withRepeat animations persist.
**How to avoid:** Use `useIsFocused()` from React Navigation or `cancelAnimation()` on unmount.

### Pitfall 5: Rainbow Frame Implementation
**What goes wrong:** Multi-color borders not possible with single borderColor.
**Why it happens:** React Native borderColor only accepts one color.
**How to avoid:** For rainbow, use a gradient-like approach with nested Views or just use a bright multi-hue color like `#ff6b9d` (hot pink) as a stand-in. Alternatively, use a LinearGradient wrapper -- but this adds a dependency. Simplest: just pick 6 distinct solid colors. The user said "rainbow" as an example, not a requirement.

### Pitfall 6: Emoji Rendering Differences
**What goes wrong:** Some emoji (unicorn, dragon) render differently across Android/iOS.
**Why it happens:** Platform-specific emoji fonts.
**How to avoid:** Test on both platforms. Stick to emoji that have been stable since Unicode 9.0+ (2016). All suggested animals are fine.

## Code Examples

### Store Migration (v10 -> v11)
```typescript
// store/migrations.ts
if (version < 11) {
  // v10 -> v11: Add cosmetic frame selection
  state.frameId ??= null;
}
```

### childProfileSlice Extension
```typescript
// Add to ChildProfileSlice interface:
frameId: FrameId | null;

// Add to setChildProfile partial pick:
Pick<ChildProfileSlice, 'childName' | 'childAge' | 'childGrade' | 'avatarId' | 'frameId'>

// Add to initial state:
frameId: null,
```

### partialize Addition
```typescript
// appStore.ts partialize:
frameId: state.frameId,
```

### Sparkle Animation (Reanimated)
```typescript
// Subtle rotating sparkle dots around avatar circle
const rotation = useSharedValue(0);
const sparkleOpacity = useSharedValue(0.6);

useEffect(() => {
  if (isSpecial) {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1, // infinite
    );
    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }
}, [isSpecial]);

const sparkleStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${rotation.value}deg` }],
  opacity: sparkleOpacity.value,
}));
```

### Frame Border on Avatar
```typescript
// HomeScreen avatarCircle with optional frame
const frameStyle = frameColor ? {
  borderWidth: 3,
  borderColor: frameColor,
} : {};

<View style={[styles.avatarCircle, frameStyle]}>
  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
</View>
```

### Badge-to-Cosmetic Lookup for Popup
```typescript
// In BadgeUnlockPopup, after showing badge info:
import { SPECIAL_AVATARS, FRAMES } from '@/store/constants/avatars';

function getCosmeticUnlockText(badgeId: string): string | null {
  const avatar = SPECIAL_AVATARS.find(a => a.badgeId === badgeId);
  if (avatar) return `You unlocked the ${avatar.label} avatar!`;
  const frame = FRAMES.find(f => f.badgeId === badgeId);
  if (frame) return `You unlocked the ${frame.label} frame!`;
  return null;
}
```

## Recommended Emoji Choices

### New Regular Avatars (expand from 8 to 14)
| ID | Label | Emoji | Notes |
|----|-------|-------|-------|
| penguin | Penguin | :penguin: | Popular with kids |
| lion | Lion | :lion: | Strong/brave theme |
| monkey | Monkey | :monkey_face: | Fun/playful |
| dolphin | Dolphin | :dolphin: | Smart theme |
| tiger | Tiger | :tiger: | Powerful |
| hamster | Hamster | :hamster: | Cute/small |

### Special Avatars (5, badge-unlocked)
| ID | Label | Emoji | Unlocking Badge | Rationale |
|----|-------|-------|-----------------|-----------|
| unicorn | Unicorn | :unicorn: | behavior.sessions.bronze (10 sessions) | Early achievable, motivating |
| dragon | Dragon | :dragon: | mastery.category.addition | Mid-difficulty, rewards mastery |
| eagle | Eagle | :eagle: | behavior.streak.silver (4-wk streak) | Rewards consistency |
| phoenix | Phoenix | :bird: | mastery.grade.2 | Rewards grade completion |
| octopus | Octopus | :octopus: | behavior.challenge.master (20 challenges) | Late-game reward |

### Frames (6, badge-unlocked)
| ID | Label | Color | Unlocking Badge | Rationale |
|----|-------|-------|-----------------|-----------|
| gold | Gold Ring | #ffd700 | mastery.grade.3 | Prestige, hard to earn |
| silver | Silver Ring | #c0c0c0 | behavior.sessions.silver (50 sessions) | Mid-game |
| emerald | Emerald Ring | #50c878 | mastery.category.subtraction | Rewards subtraction mastery |
| ice | Ice Ring | #87ceeb | behavior.streak.bronze (2-wk streak) | Early achievable |
| fire | Fire Ring | #ff6347 | behavior.remediation.silver (3 fixed) | Rewards persistence |
| royal | Royal Purple | #9b59b6 | behavior.challenge.streak (5 challenges) | Mid-game challenge reward |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| avatarId only in profile | avatarId + frameId in profile | This phase | Migration v10->v11 |
| 8 hardcoded avatars | 14 regular + 5 special + 6 frames | This phase | Expanded constants |
| No cosmetic unlocks | Badge-gated cosmetics | This phase | Bridges badges to visible rewards |

## Open Questions

1. **AvatarId type handling for special avatars**
   - What we know: Current `AvatarId` is derived from `AVATARS[number]['id']`. Special avatars need IDs too.
   - What's unclear: Should we extend AvatarId to include specials, or use a separate field?
   - Recommendation: Extend AvatarId to be `AvatarId | SpecialAvatarId` (union) for the stored `avatarId` field. Keep `AVATARS` and `SPECIAL_AVATARS` as separate arrays for UI sectioning. The store field type becomes `AvatarId | SpecialAvatarId | null`. A helper `resolveAvatar(id)` searches both arrays.

2. **Avatar picker navigation entry point**
   - What we know: HomeScreen shows avatar but has no tap-to-change interaction currently.
   - What's unclear: How to navigate to picker.
   - Recommendation: Make the avatar circle on HomeScreen a Pressable that navigates to AvatarPicker. Simple, discoverable.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | jest.config.js (existing) |
| Quick run command | `npm test -- --testPathPattern=avatar` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AVTR-01 | AVATARS array has 12-15 entries | unit | `npm test -- --testPathPattern=avatars` | No - Wave 0 |
| AVTR-02 | Special avatars locked/unlocked based on earnedBadges | unit | `npm test -- --testPathPattern=avatars` | No - Wave 0 |
| AVTR-03 | Frames locked/unlocked based on earnedBadges, render border | unit | `npm test -- --testPathPattern=avatars` | No - Wave 0 |
| AVTR-04 | Picker shows sections, preview updates, save persists | unit | `npm test -- --testPathPattern=AvatarPicker` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=avatar`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] `src/__tests__/store/constants/avatars.test.ts` -- covers AVTR-01, AVTR-02, AVTR-03 (constants + unlock logic)
- [ ] `src/__tests__/screens/AvatarPickerScreen.test.tsx` -- covers AVTR-04
- [ ] `src/__tests__/store/migrations.test.ts` -- migration v10->v11 test case (file exists, add case)

## Sources

### Primary (HIGH confidence)
- Project codebase: `store/constants/avatars.ts`, `store/slices/childProfileSlice.ts`, `store/appStore.ts`, `store/migrations.ts` -- current avatar/store architecture
- Project codebase: `components/badges/BadgeGrid.tsx`, `components/badges/BadgeDetailOverlay.tsx` -- established UI patterns for sectioned grids and detail overlays
- Project codebase: `components/animations/BadgeUnlockPopup.tsx` -- Reanimated animation patterns
- Project codebase: `services/achievement/badgeRegistry.ts` -- all 31 badge definitions for unlock mapping
- Project codebase: `theme/index.ts` -- color palette for dark theme frame colors

### Secondary (MEDIUM confidence)
- Emoji availability: Unicode 9.0+ standard emoji (unicorn, eagle, octopus, etc.) well-supported on Android 7+ and iOS 10+

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- follows established BadgeGrid/BadgeDetailOverlay/Zustand patterns exactly
- Pitfalls: HIGH -- based on direct code analysis of existing patterns
- Emoji choices: MEDIUM -- cross-platform rendering may vary slightly

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable codebase, no external dependency changes)
