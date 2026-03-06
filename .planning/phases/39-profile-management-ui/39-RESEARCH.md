# Phase 39: Profile Management UI - Research

**Researched:** 2026-03-06
**Domain:** React Native UI screens, multi-step wizards, PIN-gated modals, profile switching
**Confidence:** HIGH

## Summary

This phase builds the UI layer for multi-child profile management on top of the store foundation completed in Phase 38. The store already has `profilesSlice` with `addChild`, `switchChild`, `removeChild`, and `saveActiveChild` actions, plus `childDataHelpers` for hydrate/dehydrate, conditional navigation routing to `ProfileSetup` when no profiles exist, and an `useAutoSave` hook wired at the app root.

The work is purely UI: (1) a profile switcher sheet triggered by tapping the avatar on the home screen, (2) a profile creation wizard (name -> age/grade -> avatar -> done), (3) edit and delete profile functionality behind the parental PIN gate, and (4) replacing the `ProfileSetupPlaceholder` in AppNavigator with the real creation flow. All store actions, data types, and persistence patterns are already implemented.

**Primary recommendation:** Build four UI components -- ProfileSwitcherSheet (modal overlay on HomeScreen), ProfileCreationWizard (multi-step form), ProfileManagementScreen (PIN-gated list with edit/delete), and a PinGate component (reusable PIN verification wrapper). Reuse the existing ConsentScreen's number pad pattern for PIN entry and the AvatarPickerScreen's grid pattern for avatar selection in the wizard.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROF-01 | User can switch between child profiles from the home screen | ProfileSwitcherSheet modal triggered by avatar tap on HomeScreen; calls `switchChild(id)` from profilesSlice |
| PROF-02 | Parent can add a new child profile with name, age, and grade level (PIN-gated) | ProfileCreationWizard behind PinGate; calls `addChild(profile)` from profilesSlice; max 5 enforced in store |
| PROF-03 | Parent can edit an existing child profile's name, age, and grade level | Edit mode in ProfileManagementScreen; calls `setChildProfile()` from childProfileSlice (active) or updates `children` map directly (non-active) |
| PROF-04 | Parent can delete a child profile with confirmation | Delete with name-typing confirmation in ProfileManagementScreen; calls `removeChild(id)` from profilesSlice |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native (Modal) | 0.81.5 | Profile switcher sheet overlay | Built-in, no new dependency needed |
| zustand | ^5.0.8 | State management (profilesSlice, childProfileSlice) | Already in use; all actions exist from Phase 38 |
| expo-secure-store | (existing) | PIN verification for profile management | Already used via parentalPin.ts service |
| @react-navigation/native-stack | (existing) | Screen navigation for profile management | Already in use |
| react-native-safe-area-context | (existing) | Safe area insets for modals and screens | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react-native | (existing) | Icons (Plus, Edit, Trash, X, ChevronRight, Shield, UserPlus) | UI elements in profile management |
| react-native-reanimated | (existing) | Slide-up animation for switcher sheet | Optional polish for the modal |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| RN Modal for switcher | @gorhom/bottom-sheet | Adds dependency; RN Modal is sufficient for a simple profile list |
| Multi-step local state wizard | React Navigation nested stack | Nested stacks add complexity; local `useState` step tracking is simpler for 3 steps |
| Inline PIN entry per screen | Reusable PinGate component | PinGate is reusable for Phase 41 (parent dashboard) and Phase 43 (subscription) |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── profile/
│       ├── ProfileSwitcherSheet.tsx   # NEW: Modal overlay with avatar list
│       ├── PinGate.tsx                # NEW: Reusable PIN verification wrapper
│       ├── ProfileCreationWizard.tsx  # NEW: Multi-step name->age/grade->avatar
│       └── index.ts                   # NEW: Barrel export
├── screens/
│   ├── ProfileSetupScreen.tsx         # NEW: Replaces ProfileSetupPlaceholder
│   └── ProfileManagementScreen.tsx    # NEW: PIN-gated edit/delete list
├── navigation/
│   ├── AppNavigator.tsx               # MODIFY: Replace placeholder, add ProfileManagement route
│   └── types.ts                       # MODIFY: Add ProfileManagement params
└── screens/
    └── HomeScreen.tsx                 # MODIFY: Avatar tap opens ProfileSwitcherSheet
```

### Pattern 1: Profile Switcher Sheet (Modal Overlay)
**What:** A lightweight modal that appears when the child taps their avatar on the home screen. Shows avatar circles + names for all profiles, plus a "Manage Profiles" link that requires PIN.
**When to use:** For quick, frictionless profile switching without leaving the home screen.

```typescript
// src/components/profile/ProfileSwitcherSheet.tsx
interface ProfileSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
  onManageProfiles: () => void;
}

// Key behaviors:
// - Lists all children from store's `children` map
// - Highlights active child (activeChildId)
// - Tapping a different child calls switchChild(id) -- no PIN needed
// - "Manage Profiles" link triggers onManageProfiles (PIN verification happens upstream)
// - Disabled during active session (isSessionActive check)
```

### Pattern 2: Reusable PinGate Component
**What:** A wrapper component that shows a PIN entry screen, then renders children once verified. Reusable across profile management, parent dashboard, and subscription screens.
**When to use:** Any PIN-gated feature.

```typescript
// src/components/profile/PinGate.tsx
interface PinGateProps {
  children: React.ReactNode;
  onCancel: () => void;
  title?: string;        // "Parent Access" by default
  subtitle?: string;     // Context-specific instructions
}

// Internal state machine: 'verifying' | 'verified'
// On first PIN ever: delegates to create flow (enter + confirm)
// On existing PIN: single entry verification
// Reuses the number pad UI pattern from ConsentScreen
```

### Pattern 3: Multi-Step Profile Creation Wizard
**What:** A 3-step local-state wizard for creating a new child profile: (1) name entry, (2) age + grade selection, (3) avatar picker. Each step validates before advancing.
**When to use:** Both fresh install (ProfileSetupScreen) and "Add Child" from management.

```typescript
// src/components/profile/ProfileCreationWizard.tsx
type WizardStep = 'name' | 'age-grade' | 'avatar';

interface ProfileCreationWizardProps {
  onComplete: (profile: NewChildProfile) => void;
  onCancel?: () => void;                   // undefined for first-profile (no cancel)
  initialValues?: Partial<NewChildProfile>; // For edit mode reuse
}

// Step 1 (Name): TextInput with validation (non-empty, max 20 chars)
// Step 2 (Age/Grade): Age picker (5-12), Grade picker (K, 1-6)
// Step 3 (Avatar): Grid of 14 regular avatars (reuse AVATARS constant)
// Calls onComplete with { childName, childAge, childGrade, avatarId }
```

### Pattern 4: Profile Management Screen
**What:** A PIN-gated screen showing the list of all child profiles with edit and delete actions.
**When to use:** Accessed from "Manage Profiles" in the switcher sheet.

```typescript
// Key behaviors:
// - Entire screen wrapped in PinGate
// - Lists all children with avatar, name, age, grade
// - Edit button -> opens wizard in edit mode (pre-filled)
// - Delete button -> confirmation modal requiring name typing
// - "Add Child" button (hidden when at 5 profiles)
// - Delete last profile -> navigates to ProfileSetup
```

### Pattern 5: Edit Profile Flow
**What:** Editing an existing profile's name, age, and grade. For the active child, use `setChildProfile()`. For non-active children, update the `children` map directly.
**When to use:** PROF-03 requirement.

```typescript
// For active child (childId === activeChildId):
const { setChildProfile } = useAppStore.getState();
setChildProfile({ childName: newName, childAge: newAge, childGrade: newGrade });

// For non-active child:
// Need a new updateChildInMap action, OR switch to child -> edit -> switch back
// Recommendation: Add a simple updateChild action to profilesSlice
```

### Anti-Patterns to Avoid
- **Putting profile UI logic in the store:** The store has the data actions. UI flow logic (wizard steps, modal visibility, PIN state) belongs in component state.
- **Using navigation for wizard steps:** A 3-step wizard is simpler with local `useState` than nested navigation stacks. Navigation adds back-button complexity and transition overhead.
- **Requiring PIN for profile switching:** The CONTEXT.md from Phase 38 explicitly locks this: "No PIN required to switch between profiles -- frictionless for children."
- **Forgetting to save before switch:** `switchChild()` already dehydrates the current child atomically. No extra save step needed in UI code.
- **Allowing profile switch during session:** `switchChild()` already blocks when `isSessionActive` is true. UI should also hide/disable the switcher to communicate this.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PIN verification | Custom secure storage logic | `parentalPin.ts` service (hasParentalPin, setParentalPin, verifyParentalPin) | Already implemented, uses expo-secure-store |
| Profile CRUD operations | Direct AsyncStorage calls | `profilesSlice` actions (addChild, removeChild, switchChild, saveActiveChild) | Already implemented with atomic set(), dehydration, max-5 guard |
| Grade-appropriate initialization | Manual skill seeding | `profileInitService.createGradeAppropriateSkillStates()` | Already implemented; pre-masters lower-grade skills |
| Number pad UI | New custom keypad | Extract/reuse ConsentScreen's number pad pattern | Same project, same design language |
| Avatar grid | New avatar picker | Reuse AVATARS constant + AvatarCircle component | Already exist with proper styling |

**Key insight:** Phase 38 built ALL the data layer. Phase 39 is purely UI -- screens, modals, and user flows. No store schema changes, no new persistence logic, no migrations.

## Common Pitfalls

### Pitfall 1: Edit Non-Active Child Without Store Action
**What goes wrong:** Editing a non-active child's name/age/grade has no store action. `setChildProfile()` only updates flat state (the active child).
**Why it happens:** Phase 38 built switching and adding but not direct map editing.
**How to avoid:** Add an `updateChild(childId, updates)` action to `profilesSlice` that directly modifies the `children` map entry. This is a small slice extension, not a schema change (no migration needed).
**Warning signs:** Edits to non-active children not persisting.

### Pitfall 2: ProfileSetup Navigation Loop
**What goes wrong:** After creating the first profile, the app stays on ProfileSetup or navigates back to it.
**Why it happens:** `initialRouteName` in AppNavigator is set once on mount. Creating a profile updates `children` count but doesn't re-evaluate the initial route.
**How to avoid:** After profile creation, explicitly `navigation.reset({ index: 0, routes: [{ name: 'Home' }] })` to replace the navigation stack. Don't rely on `initialRouteName` reactivity.
**Warning signs:** User sees ProfileSetup flash after creating their first profile.

### Pitfall 3: Delete Last Profile Navigation
**What goes wrong:** Deleting the last profile leaves the user on a dead ProfileManagement screen with no children.
**Why it happens:** `removeChild()` resets `activeChildId` to null and clears `children`, but the user is still on the management screen.
**How to avoid:** After `removeChild()` when no children remain, navigate to ProfileSetup via `navigation.reset()`. Check `Object.keys(children).length` after deletion.
**Warning signs:** Empty profile list with no way to create a new one.

### Pitfall 4: Stale Switcher Data After Profile Changes
**What goes wrong:** The profile switcher sheet shows outdated names or avatars after editing.
**Why it happens:** The sheet reads from `children` map, but if children were edited without calling `saveActiveChild()` first, the map is stale for the active child.
**How to avoid:** Read the active child's display info (name, avatar) from flat state, not from `children[activeChildId]`. For non-active children, read from the map. This matches the copy-on-switch pattern.
**Warning signs:** Active child's old name showing in the switcher after they edited it.

### Pitfall 5: Wizard State Not Resetting
**What goes wrong:** Opening the creation wizard a second time shows the previous entry's data.
**Why it happens:** Component local state persists if the component isn't unmounted between uses.
**How to avoid:** Reset wizard state in `useEffect` on mount, or key the component with a unique key that changes per creation attempt (e.g., `key={Date.now()}`).
**Warning signs:** Second profile showing first profile's name pre-filled.

### Pitfall 6: expo-crypto in Jest
**What goes wrong:** Tests calling `addChild()` fail because `Crypto.randomUUID()` is not available in Jest.
**Why it happens:** expo-crypto is a native module mocked out in Jest.
**How to avoid:** Phase 38 already solved this -- use `jest.mock('expo-crypto')` with a mock `randomUUID` that returns a deterministic ID. Or test UI components with the store mocked (Approach A from testing skill).
**Warning signs:** `TypeError: Cannot read properties of undefined (reading 'randomUUID')` in tests.

## Code Examples

### HomeScreen Avatar Tap -> Switcher Sheet
```typescript
// In HomeScreen.tsx, modify the AvatarCircle onPress:
const [switcherVisible, setSwitcherVisible] = useState(false);
const isSessionActive = useAppStore((s) => s.isSessionActive);

// In render:
<AvatarCircle
  emoji={avatar.emoji}
  size={AVATAR_SIZE}
  frameColor={frameColor}
  isSpecial={isSpecial}
  onPress={() => {
    if (!isSessionActive) {
      setSwitcherVisible(true);
    }
  }}
/>
<ProfileSwitcherSheet
  visible={switcherVisible}
  onClose={() => setSwitcherVisible(false)}
  onManageProfiles={() => {
    setSwitcherVisible(false);
    navigation.navigate('ProfileManagement');
  }}
/>
```

### Profile Switcher Sheet Content
```typescript
// Reading profile data for display in switcher
const children = useAppStore((s) => s.children);
const activeChildId = useAppStore((s) => s.activeChildId);
const switchChild = useAppStore((s) => s.switchChild);

// For active child, read from flat state (most current)
const activeChildName = useAppStore((s) => s.childName);
const activeAvatarId = useAppStore((s) => s.avatarId);

// For non-active children, read from children map
const profileList = Object.entries(children).map(([id, data]) => ({
  id,
  name: id === activeChildId ? activeChildName : data.childName,
  avatarId: id === activeChildId ? activeAvatarId : data.avatarId,
  isActive: id === activeChildId,
}));
```

### Delete Confirmation with Name Typing
```typescript
// Delete confirmation pattern (PROF-04)
const [confirmText, setConfirmText] = useState('');
const childToDelete = children[deleteTargetId];
const nameMatches = confirmText.toLowerCase() === childToDelete.childName.toLowerCase();

// In render:
<Text>Type "{childToDelete.childName}" to confirm deletion</Text>
<TextInput
  value={confirmText}
  onChangeText={setConfirmText}
  placeholder={childToDelete.childName}
  autoCapitalize="none"
/>
<Pressable
  onPress={() => {
    removeChild(deleteTargetId);
    if (Object.keys(children).length <= 1) {
      // Last child -- navigate to setup
      navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
    }
  }}
  disabled={!nameMatches}
  style={[styles.deleteButton, !nameMatches && styles.deleteButtonDisabled]}
>
  <Text>Delete Profile</Text>
</Pressable>
```

### ProfileSetupScreen (Replaces Placeholder)
```typescript
// src/screens/ProfileSetupScreen.tsx
// This is the first screen for fresh installs and post-last-delete
// PIN-gated even for first profile (parent sets up device)

export default function ProfileSetupScreen() {
  const [pinVerified, setPinVerified] = useState(false);
  const addChild = useAppStore((s) => s.addChild);
  const navigation = useNavigation();

  if (!pinVerified) {
    return (
      <PinGate
        onCancel={() => {}} // No cancel for first-time setup
        title="Parent Setup"
        subtitle="Set up a PIN to manage profiles"
      >
        {/* PinGate children render after verification */}
        <ProfileCreationWizard
          onComplete={(profile) => {
            addChild(profile);
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }}
        />
      </PinGate>
    );
  }

  return (
    <ProfileCreationWizard
      onComplete={(profile) => {
        addChild(profile);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }}
    />
  );
}
```

### updateChild Action (New Addition to profilesSlice)
```typescript
// Small addition to profilesSlice for PROF-03
updateChild: (childId: string, updates: Partial<Pick<ChildData, 'childName' | 'childAge' | 'childGrade' | 'avatarId'>>) => {
  const state = get();

  if (childId === state.activeChildId) {
    // Active child: update flat state directly
    set(updates as Partial<AppState>);
  } else if (state.children[childId]) {
    // Non-active child: update in map
    set({
      children: {
        ...state.children,
        [childId]: { ...state.children[childId], ...updates },
      },
    });
  }
},
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ProfileSetupPlaceholder | Full ProfileSetupScreen with wizard | This phase | First-run and post-delete flows work |
| Avatar tap -> AvatarPicker navigation | Avatar tap -> ProfileSwitcherSheet modal | This phase | Home screen gains profile switching |
| No profile management UI | ProfileManagementScreen with PIN gate | This phase | Parents can add/edit/delete profiles |
| setChildProfile only for active child | updateChild for any child in map | This phase | PROF-03 edit works for non-active profiles |

## Open Questions

1. **Migration prompt for existing v0.7 users**
   - What we know: Phase 38 CONTEXT.md specifies a "Welcome! Name your learner" prompt for existing users with `_needsMigrationPrompt` flag
   - What's unclear: Whether this belongs in Phase 39 or was deferred. The flag exists in the store but no screen handles it.
   - Recommendation: Include migration prompt handling in ProfileSetupScreen. If `_needsMigrationPrompt` is true, show a welcoming "Name your learner" variant instead of the full creation wizard (since existing users already have data -- just need name/age/grade if missing).

2. **PinGate for first-ever profile**
   - What we know: Phase 38 CONTEXT.md says "All profile creation is PIN-gated (including the very first profile on fresh install -- parent sets up the device)"
   - What's unclear: On a fresh install, there is no PIN yet. The PinGate needs to handle both create and verify flows.
   - Recommendation: PinGate checks `hasParentalPin()` -- if no PIN exists, it shows the create flow (enter + confirm). If PIN exists, it shows verify flow. The ConsentScreen already implements both flows; extract the pattern.

3. **Avatar selection in edit mode**
   - What we know: Creation wizard includes avatar picker. Edit functionality covers name/age/grade.
   - What's unclear: Should edit also allow avatar changes, or is that handled by the existing AvatarPicker screen?
   - Recommendation: Edit in ProfileManagementScreen covers name/age/grade only. Avatar changes for the active child use the existing AvatarPickerScreen. For non-active children, avatar change is not critical and can be deferred (switch to child first, then use AvatarPicker).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | jest.config.js (existing) |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-01 | Switcher shows all profiles, tapping switches child | unit | `npm test -- --testPathPattern=ProfileSwitcherSheet` | No - Wave 0 |
| PROF-01 | Switcher disabled during active session | unit | `npm test -- --testPathPattern=ProfileSwitcherSheet` | No - Wave 0 |
| PROF-02 | Creation wizard validates name, age, grade, avatar | unit | `npm test -- --testPathPattern=ProfileCreationWizard` | No - Wave 0 |
| PROF-02 | Add child PIN-gated | unit | `npm test -- --testPathPattern=ProfileManagement` | No - Wave 0 |
| PROF-02 | Max 5 profiles enforced in UI | unit | `npm test -- --testPathPattern=ProfileManagement` | No - Wave 0 |
| PROF-03 | Edit profile updates name/age/grade | unit | `npm test -- --testPathPattern=ProfileManagement` | No - Wave 0 |
| PROF-04 | Delete requires name typing confirmation | unit | `npm test -- --testPathPattern=ProfileManagement` | No - Wave 0 |
| PROF-04 | Delete last profile navigates to ProfileSetup | unit | `npm test -- --testPathPattern=ProfileManagement` | No - Wave 0 |
| STORE | updateChild action works for active and non-active children | unit | `npm test -- --testPathPattern=profilesSlice` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<changed_file_pattern>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/components/profile/ProfileSwitcherSheet.test.tsx` -- covers PROF-01
- [ ] `src/__tests__/components/profile/ProfileCreationWizard.test.tsx` -- covers PROF-02
- [ ] `src/__tests__/components/profile/PinGate.test.tsx` -- covers PIN verification
- [ ] `src/__tests__/screens/ProfileManagementScreen.test.tsx` -- covers PROF-02, PROF-03, PROF-04
- [ ] `src/__tests__/screens/ProfileSetupScreen.test.tsx` -- covers first-run flow
- [ ] `src/__tests__/store/profilesSlice.test.ts` -- extend with updateChild tests

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: profilesSlice.ts, childProfileSlice.ts, childDataHelpers.ts, appStore.ts, AppNavigator.tsx, HomeScreen.tsx, ConsentScreen.tsx, AvatarPickerScreen.tsx, AvatarCircle.tsx, parentalPin.ts, useAutoSave.ts, navigation/types.ts
- Phase 38 research and summaries: 38-RESEARCH.md, 38-03-SUMMARY.md (documents all store foundation decisions)
- Phase 38 CONTEXT.md: Locked decisions about profile switching, PIN gating, creation flow, migration prompt

### Secondary (MEDIUM confidence)
- React Navigation 7 docs for navigation.reset() behavior
- React Native Modal component behavior on iOS/Android

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies; all libraries already in use
- Architecture: HIGH - all store actions exist; this is purely UI composition
- Pitfalls: HIGH - based on direct codebase inspection and Phase 38 implementation details
- Navigation flows: MEDIUM - reset() behavior after profile creation/deletion needs testing

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable -- no external dependencies changing)
