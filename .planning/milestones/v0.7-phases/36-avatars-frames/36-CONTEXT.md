# Phase 36: Avatars & Frames - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can personalize their avatar from an expanded pool of animal presets (12-15), equip achievement-unlocked special avatars (5 rarer animals), and earn decorative frames (6 colored border rings) tied to existing badges. An updated avatar picker screen shows all presets alongside locked unlockables with their badge requirements. Equipped avatar and frame render correctly on the home screen and throughout the app.

</domain>

<decisions>
## Implementation Decisions

### Avatar expansion
- Expand from 8 to 12-15 animal emoji presets (more animals theme, no fantasy creatures)
- Keep the established animal emoji-in-circle pattern from existing AVATARS array
- New presets added to the same `avatars.ts` constants file, extending the `AVATARS` array and `AvatarId` union type

### Special avatars
- 5 special avatars using rarer/cooler animal emoji (e.g., unicorn, dragon, eagle) — same emoji-in-circle style as regular presets
- Locked until a specific badge is earned (1:1 mapping — one badge unlocks one avatar)
- When a special avatar is equipped, a subtle sparkle animation plays on the avatar circle on the home screen — distinguishes achievement unlocks visually

### Frame visual design
- Frames are colored border rings around the avatar circle — implemented with borderWidth + borderColor styling
- 6 frames total, each a distinct color/style (e.g., gold, silver, rainbow, ice blue, fire orange, emerald green)
- Static borders — no animation on frames themselves
- No frame equipped = no border decoration (current behavior preserved, frames are purely additive)

### Picker screen layout
- Sectioned grid with three sections and headers: "Avatars" (12-15 presets), "Special Avatars" (5 locked/unlocked), "Frames" (6 locked/unlocked)
- ScrollView with section headers — matches BadgeCollection's categorized grid pattern from Phase 33
- Large live preview at top of screen showing current avatar + equipped frame combo, updates as child taps different items, "Save" button to confirm
- Locked items shown dimmed (reduced opacity) with lock icon overlay — consistent with locked badges in Phase 33 badge collection

### Locked item interaction
- Tapping a locked item shows a bottom sheet overlay with: avatar/frame preview, badge name + emoji needed, progress hint (e.g., "Earn the Streak Master badge!")
- Matches the badge detail overlay pattern established in Phase 33

### Badge-to-unlock mapping
- All cosmetic unlocks use existing badges from the 31-badge registry — no new badges created
- 1:1 mapping: each special avatar and frame is unlocked by one specific badge
- When a badge popup shows (Phase 33 celebration), add a line mentioning the cosmetic unlock (e.g., "You unlocked the Unicorn avatar!") — no separate popup

### Claude's Discretion
- Exact animal emoji choices for the 4-7 new presets and 5 special avatars
- Which specific badges unlock which avatars and frames (distribute across difficulty levels, ensure early unlocks are achievable)
- Frame color hex values that work with the dark theme
- Sparkle animation implementation details (Reanimated)
- Grid column count and item sizing
- Store migration shape for equipped frame ID
- Whether to create a new AvatarPickerScreen or update existing flow

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AVATARS` array + `AvatarId` type (`store/constants/avatars.ts`): 8 animal emoji presets — extend with more animals
- `childProfileSlice` (`store/slices/childProfileSlice.ts`): stores `avatarId: AvatarId | null` — needs `frameId` field added
- `BadgeCollection` screen + badge detail overlay (Phase 33): categorized grid with locked/unlocked states — picker can follow same pattern
- `BadgeIcon` component (`components/badges/BadgeIcon.tsx`): emoji-in-circle rendering — reusable for avatar display
- `BADGES` registry + `getBadgeById` (`services/achievement/badgeRegistry.ts`): 31 badges to map cosmetic unlocks against
- `achievementSlice` (`store/slices/achievementSlice.ts`): `earnedBadges` array — used to check unlock eligibility
- `HomeScreen`: currently renders avatar emoji — needs frame border + sparkle animation for specials

### Established Patterns
- Emoji-in-circle for visual identity (avatars, badges) — no image assets needed
- Zustand domain slices with versioned migrations (currently STORE_VERSION=10)
- Dark theme: navy (#1a1a2e), purple accents (#6366f1/#818cf8), green (#84cc16)
- Reanimated for animations (useSharedValue, useAnimatedStyle, withSpring)
- 48dp minimum touch targets for ages 6-9
- Bottom sheet overlays for detail views (badge detail pattern)

### Integration Points
- `avatars.ts`: expand AVATARS array + AvatarId type with new presets
- `childProfileSlice`: add `frameId` field + `equippedSpecialAvatarId` or extend `avatarId` to include specials
- `appStore.ts`: STORE_VERSION 10 -> 11 with migration for new fields
- `HomeScreen`: render frame border around avatar + sparkle for specials
- `RootStackParamList`: add/update AvatarPicker route
- Badge popup component (Phase 33): add cosmetic unlock mention text

</code_context>

<specifics>
## Specific Ideas

- Sectioned grid layout follows the same pattern as BadgeCollection — consistent UX across the app
- Live preview at top gives "dress-up" feeling appropriate for ages 6-9
- Sparkle animation on equipped special avatars creates a visible status symbol without being obnoxious
- Badge popup mentioning cosmetic unlocks ("You unlocked the Unicorn avatar!") creates an immediate connection between earning badges and cosmetic rewards
- 1:1 badge mapping keeps the system simple and predictable for young children

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 36-avatars-frames*
*Context gathered: 2026-03-05*
