# Phase 38: Multi-Child Store Foundation - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure the flat single-child Zustand store (STORE_VERSION 12) into a multi-child keyed architecture using the copy-on-switch pattern. Each child profile has independent progress (Elo, BKT, skills, XP, achievements, cosmetics, misconceptions). Includes v12->v13 store migration, profile creation flow, profile switcher on home screen, and auto-save on background/switch. Profile management CRUD UI is Phase 39.

</domain>

<decisions>
## Implementation Decisions

### Profile Identity
- Name is **required** when creating a profile
- Both **age and grade** are required (age drives BKT parameters, grade drives curriculum)
- New profiles include **avatar selection** as part of creation flow (show grid of 14 regular avatars)
- Theme is **per-profile** (themeId stays in per-child data, switches when profile switches)

### Switch Experience
- Profile switcher triggered by **tapping the child's avatar** on the home screen
- Opens a **sheet/menu** showing avatar circles + names for all profiles, plus a "Manage Profiles" link (PIN-gated)
- **No PIN required** to switch between profiles — frictionless for children
- Profile switching is **blocked during active sessions** (hide/disable switcher) to prevent data corruption
- PIN is required for profile management (add/edit/delete) but NOT for switching

### First-Run Migration (v12->v13)
- **Existing users (upgrade from v0.7):** On first launch, show a prompt screen: "Welcome! Name your learner" — ask for name, and also age/grade if those fields are null. Migrate existing data into the first profile.
- **Brand-new installs:** Start with a "Create your first profile" screen (name, age, grade, avatar) before showing the home screen. No data to migrate.
- The migration prompt is a one-time screen, not a recurring nag.

### Profile Limits & Deletion
- Maximum **5 profiles** per device
- **Deleting the last profile resets the app** to the fresh-install "Create profile" screen
- Delete confirmation requires **typing the child's name** to prevent accidental deletion
- **All profile creation is PIN-gated** (including the very first profile on fresh install — parent sets up the device)

### Claude's Discretion
- Exact copy-on-switch implementation details (hydrate/dehydrate mechanics)
- UUID generation approach for child IDs
- Auto-save timing (debounce, app state listener approach)
- Store migration field-by-field mapping
- Profile switcher sheet animation/styling
- How to handle edge cases (corrupted profiles, migration failures)

</decisions>

<specifics>
## Specific Ideas

- Profile creation flow: name -> age/grade -> avatar picker -> done (short wizard, not a single form)
- The migration prompt for existing users should feel welcoming, not like an error or interruption
- Avatar picker in creation reuses the existing AvatarPickerScreen grid (14 regular avatars, special ones locked until earned)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `childProfileSlice.ts`: Current flat profile with name/age/grade/avatarId/frameId/themeId — becomes the template for per-child data
- `AvatarPickerScreen.tsx`: Existing avatar selection UI — can be adapted for profile creation flow
- `AvatarCircle` component: Renders avatar with frame and sparkle animation
- `parentalPin.ts` (expo-secure-store): Existing PIN verification — reuse for profile management gates
- `usePreventRemove`: Existing nav guard pattern — reuse for blocking switches during sessions

### Established Patterns
- Zustand domain slices with `StateCreator<AppState>` type — new profilesSlice follows same pattern
- `partialize` in appStore.ts selects 17 fields for persistence — must restructure to per-child map
- Migration chain in `migrations.ts`: 12 sequential `if (version < N)` blocks — v13 is the structural reshape
- `STORE_VERSION` constant in appStore.ts — bump to 13

### Integration Points
- `appStore.ts`: Add profilesSlice, restructure partialize, update AppState type
- `migrations.ts`: Add v12->v13 migration (structural reshape — moves flat fields into children map)
- `HomeScreen.tsx`: Add avatar tap -> profile switcher sheet
- `useSession.ts`: Check `isSessionActive` to block profile switching
- `ThemeProvider`: Must react to theme changes when switching profiles
- All 36 files using `useAppStore` selectors: Should NOT need changes (copy-on-switch preserves flat interface)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 38-multi-child-store-foundation*
*Context gathered: 2026-03-06*
