# Child UX/UI Design Patterns (Ages 6-9)

**Research Date:** 2026-03-01
**Focus:** Interactive design patterns for ages 6-9 on mobile (React Native/Expo)

---

## 1. Cognitive Development (Ages 6-9)

### Piaget's Concrete Operational Stage (Ages 7-11)

Children ages 6-9 are transitioning from the preoperational stage into the concrete operational stage:

- **Logical thinking emerges, but only with concrete objects.** All math problems should be grounded in visual, tangible representations.
- **Conservation is developing.** A child at age 6 may not yet understand that 3+4 and 4+3 yield the same result. Do not assume conceptual understanding; reinforce with visuals.
- **Reversibility is emerging.** By age 7-8, children begin to understand inverse operations. Supports "undo" as a concept.
- **Centration decreases.** Younger children (6-7) focus on a single perceptual feature. Screen layouts for younger children should emphasize ONE focal point per screen.

### Working Memory Limits

| Age | Working Memory Capacity | Design Implication |
|-----|------------------------|--------------------|
| 6 | 3-4 items (chunks) | Max 3 answer choices; max 3 steps in multi-step problem |
| 7 | 4 items | Can handle 4 answer choices; 3-step sequences |
| 8-9 | 4-5 items | Can handle 4-5 choices; simple multi-step with visual scaffolding |

**Sources:** Cowan (2016), Gathercole & Alloway (2008).

**Design rules:**
- Never present more than **4 answer options** at once (3 for ages 6-7).
- Multi-step problems must show the current step visually, not require holding intermediate results in memory.
- Use **external memory aids** — show the running total, highlight the current operand, display number lines.

### Attention Spans

| Age | Sustained Attention | Design Implication |
|-----|--------------------|--------------------|
| 6 | 12-18 minutes | Sessions should auto-pause at ~10 min with a break suggestion |
| 7 | 14-21 minutes | |
| 8-9 | 16-24 minutes | Sessions up to 15 min without breaks |

**Source:** Ruff & Lawson (1990).

**Design rules:**
- Default session length: **10 minutes** (adjustable by parents from 5-20 min).
- Visual timer showing progress through the session (filling star, growing plant — not a stressful countdown clock).
- After session completes, show a **celebration + summary**, then a clear stopping point.
- Never auto-start a new session.

### Reading Levels

| Age | Grade | Reading Ability | Design Implication |
|-----|-------|-----------------|---------------------|
| 6 | 1st | Emergent/early | All instructions must be icon-based or audio-narrated |
| 7 | 2nd | Developing | Short labels (2-3 words) supplementing icons |
| 8 | 3rd | Transitional | Simple sentences okay; still pair with icons |
| 9 | 4th | Fluent | Can handle short instructions, but icons still preferred |

**Design rules:**
- **Every text element must be paired with an icon or illustration.**
- Use **audio narration for all instructions.** Auto-play on first encounter; replay button always visible.
- Maximum **6 words per instruction line.**
- Vocabulary must be Flesch-Kincaid Grade 2 or lower.

### Fine Motor Skills

| Age | Capability | Design Implication |
|-----|-----------|---------------------|
| 6 | Imprecise tapping; struggles with small targets; drag is clumsy | 56pt minimum touch targets; forgiving drag zones |
| 7 | Improving precision; can drag short distances | 48pt targets; drag with snap-to zones |
| 8-9 | Near-adult precision for large targets | 44pt targets acceptable; drag with visual guides |

**Source:** Anthony et al. (2012).

---

## 2. Touch Interaction Patterns

### Minimum Touch Target Sizes

| Platform | Minimum (Guidelines) | Recommended for Children 6-9 | Padding Between Targets |
|----------|---------------------|------------------------------|------------------------|
| iOS (Apple HIG) | 44x44 pt | **56x56 pt** (ages 6-7), **48x48 pt** (ages 8-9) | 12 pt minimum |
| Android (Material 3) | 48x48 dp | **56x56 dp** (ages 6-7), **48x48 dp** (ages 8-9) | 12 dp minimum |

**Concrete specifications for Tiny Tallies:**

```
Answer buttons:    min 56x56 pt, recommended 64x64 pt
Number pad keys:   min 48x48 pt, recommended 56x56 pt
Navigation tabs:   min 48x48 pt (icon + label combined)
Action buttons:    min 56x44 pt (width x height)
Close/back:        min 44x44 pt, placed 16pt from edges
```

### Drag-and-Drop by Age

| Age | Drag Capability | Max Drag Distance | Design Approach |
|-----|----------------|-------------------|-----------------|
| 6 | Unreliable; finger lifts mid-drag | ~100 pt | **Snap-to targets** with large (80pt+) drop zones; show ghost at destination; accept drops within 24pt of target center |
| 7 | Can sustain short drags; still imprecise | ~150 pt | Snap-to targets; animated guide on first use |
| 8-9 | Reliable for short-medium drags | ~200 pt | Standard drag with visual feedback; snap optional |

**Design rules:**
- Always provide a **non-drag alternative** (tap source, then tap destination).
- Show a **highlighted drop zone** when dragged item is within 40pt of target.
- On finger lift outside valid zone, **animate item back** to origin.
- Minimum drag handle size: **64x64 pt**.
- Provide **haptic feedback** (light impact) on successful drop.

### Gesture Complexity

| Gesture | Ages 6-7 | Ages 8-9 | Use In Tiny Tallies |
|---------|----------|----------|---------------------|
| Single tap | Reliable | Reliable | Primary interaction for all actions |
| Double tap | Unreliable | Somewhat reliable | AVOID — never require double tap |
| Long press | Unreliable | Moderate | Parental gate only (1500ms) |
| Swipe (horizontal) | Moderate | Reliable | Page navigation with generous tolerance |
| Drag | See above | See above | Math manipulatives only; always with tap alternative |
| Pinch/zoom | Unreliable | Unreliable | NEVER use |
| 3+ finger gestures | Cannot perform | Cannot perform | NEVER use |

### Accidental Touch Prevention

- **Edge margins:** 16pt inset from all screen edges. No interactive elements in the outer 16pt border.
- **Destructive action confirmation:** Two-step confirmation with 500ms delay before confirm button becomes active.
- **Bottom-of-screen safe zone:** Keep interactive elements at least **50pt from the bottom edge**.
- **Debounce rapid taps:** Ignore taps on the same target within 300ms.
- **Palm rejection:** Consider ignoring touches larger than ~15mm contact area on tablets.

---

## 3. Visual Design

### Color Palette for Children

**Research:** Children aged 6-9 prefer saturated, warm colors (Boyatzis & Varghese, 1994).

| Role | Color | Hex | Notes |
|------|-------|-----|-------|
| Primary | Bright Blue | `#4A90D9` | Trust, calm, focus |
| Secondary | Warm Orange | `#F5A623` | Energy, encouragement. CTAs and rewards |
| Accent 1 | Soft Purple | `#9B59B6` | Creativity, special features |
| Accent 2 | Teal Green | `#26B99A` | Growth, progress indicators |
| Background | Warm White | `#FFF8F0` | Softer than pure white |
| Surface | Light Cream | `#FEF3E2` | Card backgrounds |
| Text Primary | Dark Charcoal | `#2C3E50` | Never pure black |
| Text Secondary | Medium Gray | `#7F8C8D` | Hints, secondary labels |

**Critical rule: Never use red for errors or green for success.**
- 8% of boys have red-green color blindness.
- Red = "bad" creates anxiety. Use **shape + color + animation** for feedback states:
  - Correct: Orange burst + star shape + chime sound
  - Try again: Blue wobble + circle shape + gentle "boop" sound
  - Progress: Teal fill bar + number overlay

### Typography

| Element | Font Size | Weight | Line Height |
|---------|-----------|--------|-------------|
| Math problem (main) | 32-40pt | Bold (700) | 1.4x |
| Answer options | 24-28pt | SemiBold (600) | 1.3x |
| Instructions | 18-20pt | Regular (400) | 1.5x |
| Labels/buttons | 16-18pt | SemiBold (600) | 1.3x |
| Score/stats | 14-16pt | Medium (500) | 1.3x |
| Parent interface | 14-16pt | Regular (400) | 1.5x |

**Font selection:**
- Primary: **System font** (San Francisco on iOS, Roboto on Android).
- Alternative: **OpenDyslexic** as user-selectable option (toggle in parent settings).
- **Never use serif fonts, decorative fonts, or all-caps** for instructional text.
- Letter spacing: +0.5pt for body text, +1pt for dyslexia-friendly option.

### Icons vs Text

- Every button and navigation element must have an **icon as the primary signifier**.
- Text labels are **supplementary** — placed below icons, never as the sole identifier.
- Icon style: **Filled, not outlined.** Filled icons have higher recognition rates for children.
- Icon size: Minimum **24x24pt**, recommended **28-32pt** within touch target.
- Use **consistent metaphors**: house for home, star for favorites, backpack for collection, trophy for achievements, gear for settings (parent only).

### Animation Principles

| Animation Type | Duration | Easing | Use Case |
|---------------|----------|--------|----------|
| Button press feedback | 50-100ms | ease-out | Scale down to 0.95, back to 1.0 |
| Correct answer celebration | 800ms-1.5s | spring (damping: 0.6) | Stars burst, character jumps, confetti |
| Incorrect answer redirect | 300-500ms | ease-in-out | Gentle wobble (3-degree rotation) |
| Screen transition | 250-350ms | ease-in-out | Slide left/right for progression |
| Progress bar fill | 400-600ms | ease-out | Smooth fill with slight overshoot |
| Reward unlock | 1.5-2.5s | spring + ease | Badge drops in, sparkle effect |

**Critical rules:**
- **Celebration animations must not exceed 2.5 seconds.**
- **Never block interaction during animation.**
- Provide a **Reduced Motion** setting that replaces animations with simple opacity fades (200ms).
- No **flashing or strobing** (WCAG 2.1 requires no more than 3 flashes per second).
- **Looping animations** must be gentle and slow (>2s cycle).

### Character/Mascot Design

- **Round shapes, large eyes, small body** (neotenous features — Lorenz, 1943).
- **4-5 emotional states** maximum: happy, thinking, excited, encouraging, sleeping.
- **No negative expressions.** After incorrect answer, mascot looks thoughtful, not upset.
- **Consistent placement:** Fixed position (bottom-left or top-left, 80x80pt).
- **Customizable:** Let children choose color or accessory (4-6 choices).

---

## 4. Information Architecture

### Maximum Menu Depth

**Rule: 2 levels maximum.** Children ages 6-9 cannot maintain a mental model of deep hierarchy.

**Recommended structure:**

```
Level 0 (Home)
├── Play (immediate entry to math activity)
├── My Progress (stars, streaks, badges)
├── My Tally (mascot customization)
└── [Parent icon — gated]
    ├── Settings
    ├── Progress Reports
    └── Subscription
```

### Navigation Patterns

| Pattern | Children 6-9 Performance | Recommendation |
|---------|-------------------------|----------------|
| Bottom tab bar (3-4 tabs) | High discoverability; intuitive | PRIMARY navigation |
| Hamburger menu | Very poor; children don't discover it | NEVER use for child-facing features |
| Floating action button | Moderate | Use sparingly; only for primary "Play" action |
| Swipe navigation | Moderate; needs visual affordance | Secondary; for paging through content |

**Tab bar specification:**
- 3 tabs for child: **Play**, **Stars** (progress), **Tally** (mascot)
- 1 tab for parent: **Settings** (gear icon, gated)
- Tab bar height: **56pt**
- Icons: **28pt filled**, with 12pt text label below
- Active tab: Primary Blue fill with slight scale-up (1.1x)
- No badge numbers. Use **star sparkle** animation for new rewards.

### Screen Density Limits

| Screen Element | Maximum Count | Rationale |
|---------------|--------------|-----------|
| Interactive elements | 6 per screen | Working memory + navigation |
| Text blocks | 2 per screen | Reading is effortful |
| Visual groups | 3 per screen | Problem area, answer area, feedback area |
| Answer choices | 4 maximum | Miller's Law adapted for children |
| Colors simultaneously | 4-5 | More causes visual confusion |
| Animated elements simultaneously | 1-2 | More causes attention fragmentation |

### Progressive Disclosure

1. **First launch:** Only "Play" is active. Stars and Tally show "coming soon" lock.
2. **After 3 problems:** Stars tab unlocks (first badge awarded).
3. **After 10 problems:** Tally tab unlocks (mascot customization).
4. **After first streak (3 days):** Streak counter appears.
5. **New problem types:** Unlock sequentially.

---

## 5. Feedback & Rewards

### Immediate Feedback

| Action | Response Time | Feedback Type |
|--------|-------------- |---------------|
| Tap interactive element | <50ms | Visual: scale to 0.95 + darken. Haptic: light impact. |
| Submit answer (correct) | <100ms acknowledge, 200-800ms celebration | Visual: orange/gold burst. Audio: ascending chime. Haptic: success. |
| Submit answer (incorrect) | <100ms acknowledge, 300ms redirect | Visual: gentle wobble. Audio: soft low tone. Haptic: light tap. |
| Navigate between screens | <100ms to start | Slide animation begins immediately. |
| Load new problem | <200ms | Problem elements animate in (stagger 50ms per element). |

**Critical rule: If any response takes >200ms, show a loading indicator.**

### Positive-Only Error Handling

**Never use:** "Wrong!" / Red X marks / Sad faces / Buzzer sounds / Point deductions

| Scenario | Response |
|----------|----------|
| First incorrect | "Almost! Try again." + mascot tilts head |
| Second incorrect | "Hint: count the apples!" + visual highlight |
| Third incorrect | "The answer is 7! Let's try a new one." + mascot demonstrates |
| Repeated struggle (3+) | Silently reduce difficulty. No messaging about it. |

### Celebration Calibration

| Event | Level | Duration |
|-------|-------|----------|
| Correct (routine) | Low | 300-500ms |
| Correct (first try on hard) | Medium | 800ms |
| Streak (5 in a row) | Medium-high | 1.2s |
| Session complete | High | 2s |
| New badge | High | 2.5s |
| Level up | Very high | 3s (max) |

**Rules:**
- **Escalating celebrations** prevent habituation.
- **Vary celebrations** (3-4 variants per level).
- **Tap to skip** after initial play.
- **Max 1 "high" celebration per 2-minute window.**

### Multimodal Feedback

Every significant interaction should engage **at least 2 of 3 modalities**:

| Modality | When | Implementation |
|----------|------|----------------|
| Visual | Always | Color change, animation, icon transformation |
| Audio | Correct answers, celebrations, instructions | Short SFX (<500ms); narrated instructions |
| Haptic | Taps, correct answers, errors | expo-haptics: Light for taps, Success for correct, Light for try-again |

---

## 6. Accessibility

### VoiceOver / TalkBack

- Every interactive element: `accessibilityLabel` describing **purpose**, not appearance.
- Math problems read aloud: `3 + 4 = ?` → "What is three plus four?"
- Focus order follows visual layout (top-to-bottom, left-to-right).
- Custom gestures must have VoiceOver-accessible alternatives.

### Color-Blind Safe Design

- **Never use color as the sole indicator of state.** Always pair with shape, icon, or text.
- Minimum contrast: **4.5:1** for text (WCAG AA), **3:1** for UI elements.
- Avoid: Red+Green, Red+Brown, Green+Brown, Blue+Purple pairs.

### Motor Impairment Accommodations (Parent-Controlled)

| Setting | Default | Accommodation Option |
|---------|---------|---------------------|
| Touch target size | Standard (56pt) | Large (72pt) |
| Tap debounce | 300ms | Extended (500ms) |
| Drag required | Optional (with tap alt) | Disabled (tap-only mode) |
| Auto-advance delay | 1.5s | Extended (3s) |

### Dyslexia-Friendly Mode (Parent Toggle)

| Feature | Standard | Dyslexia-Friendly |
|---------|----------|--------------------|
| Font | System font | OpenDyslexic or increased spacing |
| Letter spacing | Default | +1.5pt |
| Line height | 1.4x | 1.8x |
| Background | Warm white #FFF8F0 | Cream/buff #FAF0DC |

### Reduced Motion

- Check `AccessibilityInfo.isReduceMotionEnabled` on launch.
- Replace all animations with **opacity fades** (200ms).
- Mascot becomes **static poses**.
- Looping animations stop entirely.

---

## 7. Parent vs Child UX

### Interface Separation

| Aspect | Child Interface | Parent Interface |
|--------|----------------|------------------|
| Visual style | Colorful, illustrated, 16pt radius corners | Clean, minimal, standard iOS/Android |
| Typography | Large (18-40pt), bold, with icons | Standard (14-16pt), regular weight |
| Navigation | Bottom tab bar (3 tabs) | Stack navigation with back arrows |
| Language | Simple ("Great job!") | Informational ("15 problems completed today") |
| Interaction | Large targets, single taps, drag | Standard form inputs, toggles, lists |
| Color palette | Full | Muted (primary blue + neutrals) |

### Parental Gate Patterns

| Context | Gate Pattern | Implementation |
|---------|-------------|----------------|
| Enter settings | **Math problem** (e.g., "24 x 3?") | Problem + number pad; 3 attempts then 30s lockout |
| Purchase | **Hold + math problem** | Hold 1.5s then solve; prevents accidental taps |
| External link | **Interstitial warning** | COPPA requirement |
| Delete progress | **PIN entry** (4-digit) | expo-secure-store |

### Settings Children Should NOT Access

Difficulty level, session time, sound toggles, account/subscription, content scope, data export, accessibility settings — all behind parental gate.

### Data Displays: Parent vs Child

| Data | Child Sees | Parent Sees |
|------|-----------|-------------|
| Problems completed | Star count, progress bar | Exact number, graph |
| Accuracy | Not shown; difficulty auto-adjusts | Percentage by type, trend |
| Time spent | Visual session timer | Minutes/day, average |
| Weak areas | Harder problems appear more (invisible) | "Needs practice: subtraction" |
| Speed | Never shown | Average time/problem, trend |
| Comparison | Never | Optional anonymized benchmarks |

---

## 8. Platform-Specific Considerations

### React Native / Expo Modules

| Need | Module |
|------|--------|
| Haptics | `expo-haptics` |
| Audio | `expo-av` |
| Secure storage | `expo-secure-store` |
| File system | `expo-file-system` |
| Accessibility | React Native `AccessibilityInfo` |
| Font loading | `expo-font` |
| Screen orientation | `expo-screen-orientation` |
| Safe area | `react-native-safe-area-context` |

- **Animation:** `react-native-reanimated` v3 for native-thread animations.
- **Gestures:** `react-native-gesture-handler` with generous `hitSlop` (12-16pt).

### Safe Area Handling

- Wrap every screen in `SafeAreaView` or use `useSafeAreaInsets()`.
- Interactive elements at least **16pt inside safe area**.
- Bottom tab bar above home indicator area.

### Keyboard / Number Input

- Use a **custom number pad** (not system keyboard) for answer input.
- Keys: 0-9, backspace (icon), submit (checkmark icon).
- Key size: **56-64pt**.
- Standard 3x4 grid layout.

### Orientation

| Device | Orientation |
|--------|-------------|
| Phone (width < 600pt) | **Portrait locked** |
| Tablet (width >= 600pt) | **Both allowed, landscape default** |
| During math problem | Locked to current |

---

## Quick Reference Card

| Specification | Value |
|--------------|-------|
| Touch target (ages 6-7) | 56x56pt minimum |
| Touch target (ages 8-9) | 48x48pt minimum |
| Target padding | 12pt between targets |
| Edge margin | 16pt from screen edges |
| Max answer choices | 4 |
| Max interactive elements per screen | 6 |
| Max menu depth (child) | 1 level |
| Tap response time | <50ms visual feedback |
| Answer feedback time | <100ms acknowledgment |
| Loading indicator threshold | >200ms |
| Celebration max duration | 2.5s (skippable) |
| Session default length | 10 minutes |
| Font size (math problems) | 32-40pt |
| Tab bar height | 56pt |
| Number pad key size | 56-64pt |
| Contrast ratio (text) | 4.5:1 minimum |
| Parental gate timeout | 5 minutes |
| Tap debounce | 300ms |
| Drag snap zone | 40pt radius |
| Drop zone size | 80pt minimum |

---

## References

### Academic
- Anthony, L. et al. (2012). Interaction and Recognition Challenges in Children's Touch Input. *ACM IDC*.
- Boyatzis, C.J. & Varghese, R. (1994). Children's Emotional Associations with Colors. *J. Genetic Psychology*.
- Cowan, N. (2016). Working Memory Capacity: Limits and Consequences. *Psychology Press*.
- Druin, A. (2002). The Role of Children in the Design of New Technology. *Behaviour and IT*.
- Dweck, C.S. (2006). *Mindset: The New Psychology of Success*. Random House.
- Fails, J.A. et al. (2012). Methods and Tools for Children's Interaction Design. *Morgan & Claypool*.
- Gathercole, S.E. & Alloway, T.P. (2008). *Working Memory and Learning*. Sage.
- Hourcade, J.P. (2007). Interaction Design and Children. *FnT HCI*.
- Lorenz, K. (1943). Die angeborenen Formen moglicher Erfahrung. *Z. Tierpsychologie*.
- Rello, L. & Baeza-Yates, R. (2013). Good Fonts for Dyslexia. *ACM ASSETS*.
- Ruff, H.A. & Lawson, K.R. (1990). Development of Sustained Attention. *Dev. Psychology*.

### Industry
- Apple Human Interface Guidelines — Accessibility (2025).
- Material Design 3 — Accessibility Guidelines (2025).
- British Dyslexia Association — Style Guide (2024).
- WCAG 2.1 — W3C (2018).
- Nielsen Norman Group — Hamburger Menus and Hidden Navigation (2017).
