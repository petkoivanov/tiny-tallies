# Sound & Audio Design

**Research Date:** 2026-03-01
**Focus:** Audio design for a children's math learning app (ages 6-9)

---

## 1. Audio Categories & Sound Inventory

### 1.1 UI Sounds

| Sound ID | Trigger | Description | Duration |
|----------|---------|-------------|----------|
| `ui.button_tap` | Any button press | Soft click/pop | 50-80ms |
| `ui.nav_forward` | Navigate to next screen | Gentle ascending whoosh | 150-200ms |
| `ui.nav_back` | Navigate back | Soft descending whoosh | 150-200ms |
| `ui.tab_switch` | Switch between tabs | Subtle tick/tap | 60-100ms |
| `ui.modal_open` | Dialog appears | Soft chime, rising | 200-300ms |
| `ui.modal_close` | Dialog dismissed | Soft fade-out tone | 150-200ms |
| `ui.toggle_on` | Toggle activated | Bright pip | 80-120ms |
| `ui.toggle_off` | Toggle deactivated | Softer pip (lower pitch) | 80-120ms |
| `ui.item_select` | Select answer option | Light pluck/tap | 60-100ms |

### 1.2 Feedback Sounds

| Sound ID | Trigger | Description | Duration |
|----------|---------|-------------|----------|
| `feedback.correct` | Correct answer | Bright ascending chime (C-E-G arpeggio) | 300-500ms |
| `feedback.correct_streak` | 3+ correct in row | Richer chime with sparkle | 400-600ms |
| `feedback.incorrect` | Wrong answer | Gentle low-mid "boop" (single soft tone) | 200-300ms |
| `feedback.try_again` | Second attempt prompt | Soft encouraging ascending phrase | 250-350ms |
| `feedback.hint_available` | Hint becomes available | Soft bell with shimmer | 300-400ms |
| `feedback.hint_used` | Child taps hint | Gentle harp glissando | 400-500ms |
| `feedback.problem_skip` | Skip a problem | Neutral swipe/whoosh | 150-200ms |

### 1.3 Celebration Sounds

| Sound ID | Trigger | Description | Duration |
|----------|---------|-------------|----------|
| `celebrate.level_up` | Complete a level | Rising melodic phrase + sparkle | 800ms-1.2s |
| `celebrate.badge_earned` | Earn a new badge | Short fanfare + twinkle | 1.0-1.5s |
| `celebrate.streak_5` | 5 correct in a row | Quick ascending scale + chime | 600-800ms |
| `celebrate.streak_10` | 10 correct in a row | Fuller version of streak_5 | 800ms-1.0s |
| `celebrate.session_complete` | Finish session | Warm resolving chord + gentle applause | 1.5-2.0s |
| `celebrate.perfect_score` | All correct in a set | Rich fanfare + sparkle cascade | 1.5-2.0s |
| `celebrate.daily_goal` | Meet daily goal | Cheerful jingle | 1.0-1.5s |
| `celebrate.star_earned` | Earn a star | Single bright star chime | 300-500ms |

### 1.4 Background Music

| Sound ID | Context | BPM | Loop |
|----------|---------|-----|------|
| `ambient.thinking` | Active problem-solving | 60-72 | Yes |
| `ambient.practice` | General practice | 72-84 | Yes |
| `ambient.celebration` | Post-level celebration | 100-110 | Yes |
| `ambient.menu` | Main menu / home | 80-90 | Yes |

### 1.5 Manipulative Sounds

| Sound ID | Trigger | Description | Duration |
|----------|---------|-------------|----------|
| `manip.block_pickup` | Start dragging block | Soft pop/lift | 60-100ms |
| `manip.block_drop` | Release block (no snap) | Soft thud | 80-120ms |
| `manip.block_snap` | Block snaps to position | Satisfying click/snap | 100-150ms |
| `manip.block_stack` | Stack blocks together | Slightly heavier snap | 100-150ms |
| `manip.block_unstack` | Separate blocks | Reverse pop | 80-120ms |
| `manip.counter_drop` | Drop counter on surface | Plastic tap | 60-100ms |
| `manip.counter_slide` | Slide counter | Short friction sound | 100-150ms |
| `manip.number_line_hop` | Move along number line | Light bounce/boing | 80-120ms |
| `manip.number_line_jump` | Skip-count jump | Slightly larger bounce | 100-150ms |
| `manip.group_complete` | Finish grouping (make 10) | Satisfying chime + snap | 200-300ms |
| `manip.scale_tip` | Balance scale tips | Gentle creak/tilt | 200-300ms |
| `manip.scale_balance` | Scale reaches balance | Resonant settling tone | 300-400ms |

---

## 2. Sound Design Principles for Children

### 2.1 Positive Emotional Association

All sounds must support a **growth mindset** environment (Dweck, 2006).

**Correct answer sound profile:**
- Bright but not shrill; ascending pitch (universally positive)
- Harmonic/consonant intervals (major thirds, perfect fifths)
- 300-500ms duration

**Incorrect answer sound profile:**
- Gentle, low-to-mid frequency single tone
- NOT a buzzer or failure sound
- Softer volume than correct (-3dB)
- 200-300ms duration (shorter than correct)
- Think: soft wooden "bonk" or muffled "boop"

### 2.2 Repetition Tolerance

A child doing 20 problems/session, 5 sessions/week will hear feedback sounds **thousands of times per year**.

**Guidelines:**
- Keep feedback sounds short (under 500ms for most, under 2s for celebrations).
- Avoid strong melodic hooks. Simple intervals work better than catchy tunes.
- Use 2-3 subtle variations that rotate randomly:

```
correct_v1: C5-E5 (major third)
correct_v2: D5-F#5 (major third, different root)
correct_v3: E5-G#5 (major third, different root)
```

- Test sounds by listening 50+ times in sequence. If irritating, they fail.
- Frequency range: favor mid-range (300Hz-2kHz). High frequencies (>4kHz) cause fatigue fastest.

### 2.3 Volume and Shared Spaces

- Mix all sounds to -12 to -6 dBFS peak.
- UI sounds: -18 to -12 dBFS.
- Feedback sounds: -12 to -6 dBFS.
- Celebrations: -9 to -3 dBFS.
- Background music: -18 to -12 dBFS when other audio plays.
- All sounds intelligible at 30% device volume.
- Test on device speakers, not studio monitors.

### 2.4 Age-Appropriate Timbres

Research (Flowers & Costa-Giomi, 1991; Sims, 1986):
- **Good for ages 6-9:** xylophone, marimba, glockenspiel, music box, harp, light bells, wood blocks
- **Bad for ages 6-9:** harsh synths, heavy bass, distorted sounds
- Pitched percussion works exceptionally well — melodic, warm, non-threatening

---

## 3. Background Music

### 3.1 Research: Music and Learning

**When music helps:**
- Repetitive/routine tasks at 60-70 BPM (Hallam et al., 2002)
- Positive mood induction (Schellenberg et al., 2007)
- Transition periods

**When music hurts:**
- Novel/complex tasks (competes for working memory — Furnham & Strbac, 2002)
- Music with lyrics (interferes with reading — Perham & Currie, 2014)
- Tempo >120 BPM (induces rushing)

**Synthesis:** Music should be **optional and off by default**. When enabled: instrumental only, lo-fi/ambient, 60-80 BPM during problem-solving.

### 3.2 Tempo Recommendations

| Context | BPM | Rationale |
|---------|-----|-----------|
| Problem-solving | 60-72 | Matches resting heart rate; calm focus |
| General practice | 72-84 | Moderate energy |
| Review / easier problems | 84-96 | Slightly upbeat |
| Celebration screens | 100-110 | Joyful, not over-exciting |
| Menu / navigation | 80-90 | Warm, inviting |

### 3.3 Dynamic Music System

```
Problem Displayed → Duck music to -24dBFS for 3s → Return to -18dBFS
Correct Answer → Brief swell (+3dB for 500ms)
Level Complete → Crossfade to celebration track over 1s
Session End → Fade out over 3s
```

### 3.4 Loop Design

- Each track: **90-120 seconds** before looping.
- Seamless loop points (no audible gap).
- **3 tracks per context** that rotate between sessions.
- 2-4 bar intro that plays once + loop body.

---

## 4. Text-to-Speech

### 4.1 Rationale

Children ages 6-7 are emergent readers. TTS is core accessibility, not a luxury.

**Must-read:** Math problems, answer choices, instructions, hints.
**Nice-to-have:** Encouragement, badge descriptions, menu labels.

### 4.2 Voice Characteristics

| Parameter | Recommendation |
|-----------|---------------|
| Gender | Offer both; default gender-neutral |
| Pace | 140-160 WPM (slower than adult conversational) |
| Pitch | Mid-to-high range |
| Tone | Warm, encouraging, slightly upbeat |
| Pauses | 300-500ms between clauses; 500-800ms between sentences |

### 4.3 Platform TTS: `expo-speech` (Recommended for v1)

```typescript
import * as Speech from 'expo-speech';

await Speech.speak('What is seven plus three?', {
  language: 'en-US',
  rate: 0.85,
  pitch: 1.1,
  onDone: () => { /* ready for next */ },
});
```

**Pros:** Built-in, free, uses native TTS.
**Cons:** Voice quality varies by device/OS.

### 4.4 Number Normalization

| Written | Spoken |
|---------|--------|
| `7 + 3 = ?` | "Seven plus three equals what?" |
| `12 - 5` | "Twelve minus five" |
| `4 x 6` | "Four times six" |
| `15 / 3` | "Fifteen divided by three" |
| `_ + 4 = 9` | "What number plus four equals nine?" |

### 4.5 Read-Aloud Toggle

- **Auto-read:** Default ON for ages 6-7, OFF for 8-9.
- **Tap-to-read:** Speaker icon on any text. Always available.
- **Repeat:** Tap again to re-read. No limit.
- **Interrupt:** New utterance cancels in-progress.

---

## 5. Haptic Feedback

### 5.1 Haptic Patterns

| Context | Haptic | expo-haptics Call |
|---------|--------|-------------------|
| Button tap | Light impact | `impactAsync(Light)` |
| Correct answer | Success notification | `notificationAsync(Success)` |
| Incorrect answer | Light impact (NOT error) | `impactAsync(Light)` |
| Block snap | Medium impact | `impactAsync(Medium)` |
| Block pickup | Selection | `selectionAsync()` |
| Counter drop | Light impact | `impactAsync(Light)` |
| Number line hop | Light impact | `impactAsync(Light)` |
| Level up | Success notification | `notificationAsync(Success)` |
| Badge earned | Heavy + success | Heavy then 100ms delay then Success |
| Drag over valid target | Selection | `selectionAsync()` |

**Key rule: Never use `NotificationFeedbackType.Error`** for wrong answers. Too punitive.

### 5.2 Multimodal Coordination

Sound and haptics fire simultaneously (within 10ms) for unified perception (Stein & Meredith, 1993).

```typescript
async function playFeedback(soundId: SoundId, hapticType?: HapticType): Promise<void> {
  const promises = [soundService.play(soundId)];
  if (hapticType && settings.hapticsEnabled) {
    promises.push(hapticService.trigger(hapticType));
  }
  await Promise.all(promises);
}
```

### 5.3 Rate-Limiting

Throttle haptic calls to max 10/second during rapid interactions (number line hopping, counter dropping).

---

## 6. Technical Implementation

### 6.1 Audio Engine: `expo-av`

```typescript
import { Audio } from 'expo-av';

await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: false,          // respect silent switch
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
  interruptionModeIOS: InterruptionModeIOS.DuckOthers,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
});
```

**Key: `playsInSilentModeIOS: false`** — respect the parent's silent switch decision.

### 6.2 Preloading Strategy

**Tier 1 — App start (critical):** All feedback + core UI sounds.
**Tier 2 — Session start:** Manipulative sounds, navigation sounds.
**Tier 3 — Lazy load:** Celebration sounds, background music.

### 6.3 Memory Management

```typescript
class SoundPool {
  private loaded: Map<string, Audio.Sound> = new Map();
  private lastUsed: Map<string, number> = new Map();

  async play(soundId: string): Promise<void> {
    if (!this.loaded.has(soundId)) await this.load(soundId);
    this.lastUsed.set(soundId, Date.now());
    await this.loaded.get(soundId)!.replayAsync();
  }

  async unloadUnused(maxAge = 5 * 60 * 1000): Promise<void> {
    const now = Date.now();
    for (const [id, time] of this.lastUsed) {
      if (now - time > maxAge && !TIER_1.includes(id)) {
        await this.loaded.get(id)?.unloadAsync();
        this.loaded.delete(id);
        this.lastUsed.delete(id);
      }
    }
  }
}
```

### 6.4 Audio Focus

- Pause music + stop TTS when app backgrounds.
- Resume music when app returns to foreground.
- Audio ducking handled automatically by expo-av config.

### 6.5 Concurrency

- Background music and SFX on separate channels.
- SFX can overlap (up to 3 simultaneous).
- TTS has highest priority: duck all other audio by 50%.
- Music fades (not cuts) on stop/transition.

---

## 7. Settings & Parental Controls

### Child-Accessible

| Setting | Type | Default |
|---------|------|---------|
| Sound Effects | Toggle | ON |
| Music | Toggle | OFF |

### Parent Settings (PIN-Protected)

| Setting | Type | Default |
|---------|------|---------|
| Master Volume | Slider | 70% |
| Sound Effects Volume | Slider | 80% |
| Background Music | Toggle | OFF |
| Music Volume | Slider | 50% |
| Text-to-Speech | Toggle | ON |
| TTS Speed | Slider | 85% |
| TTS Voice | Picker | System default |
| Auto-Read Problems | Toggle | ON (6-7), OFF (8-9) |
| Haptic Feedback | Toggle | ON |
| Quiet Mode | Toggle | OFF |

### Quiet Mode

When active: All audio/haptics muted. Visual feedback enhanced (larger/longer animations). Previous settings preserved for when Quiet Mode is toggled off.

---

## 8. Sound Asset Specifications

### File Formats

| Type | Format | Rationale |
|------|--------|-----------|
| Short SFX (<2s) | `.wav` (PCM, 16-bit) | Zero decoding latency |
| Medium SFX (2-5s) | `.mp3` (192 kbps) | Good quality/size balance |
| Background Music | `.mp3` (192 kbps) | Compression essential |

### Quality

- Sample rate: 44,100 Hz
- SFX: Mono (device speakers are mono)
- Music: Stereo (for headphone users)
- Peak level: -6 dBFS max
- Leading silence: <5ms (trimmed)

### File Size Budget

| Category | Count | Total |
|----------|-------|-------|
| UI sounds | 10 | ~50 KB |
| Feedback sounds (+variants) | 14 | ~140 KB |
| Celebration sounds | 8 | ~240 KB |
| Manipulative sounds | 13 | ~104 KB |
| Background music | 15 tracks | ~4.5 MB |
| **Total** | ~60 files | **~5.0 MB** |

Budget limit: **8 MB** total.

### File Naming

```
assets/audio/
  sfx/
    ui/button-tap.wav
    feedback/correct-v1.wav, correct-v2.wav, correct-v3.wav
    celebrate/level-up.wav
    manipulative/block-snap.wav
  music/
    thinking-01.mp3, thinking-02.mp3
    practice-01.mp3
    celebration-01.mp3
```

Kebab-case, category prefix, variants with `-v1`/`-01` suffix.

---

## 9. TypeScript Interfaces

```typescript
// Sound identifiers
type UISoundId = 'ui.button_tap' | 'ui.nav_forward' | 'ui.nav_back' | 'ui.tab_switch'
  | 'ui.modal_open' | 'ui.modal_close' | 'ui.toggle_on' | 'ui.toggle_off' | 'ui.item_select';

type FeedbackSoundId = 'feedback.correct' | 'feedback.correct_streak' | 'feedback.incorrect'
  | 'feedback.try_again' | 'feedback.hint_available' | 'feedback.hint_used' | 'feedback.problem_skip';

type CelebrationSoundId = 'celebrate.level_up' | 'celebrate.badge_earned' | 'celebrate.streak_5'
  | 'celebrate.streak_10' | 'celebrate.session_complete' | 'celebrate.perfect_score'
  | 'celebrate.daily_goal' | 'celebrate.star_earned';

type ManipulativeSoundId = 'manip.block_pickup' | 'manip.block_drop' | 'manip.block_snap'
  | 'manip.block_stack' | 'manip.block_unstack' | 'manip.counter_drop' | 'manip.counter_slide'
  | 'manip.number_line_hop' | 'manip.number_line_jump' | 'manip.group_complete'
  | 'manip.scale_tip' | 'manip.scale_balance';

type AmbientSoundId = 'ambient.thinking' | 'ambient.practice' | 'ambient.celebration' | 'ambient.menu';

type SoundId = UISoundId | FeedbackSoundId | CelebrationSoundId | ManipulativeSoundId | AmbientSoundId;

// Configuration
interface SoundConfig {
  id: SoundId;
  asset: number; // require() result
  variants?: number[];
  baseVolume: number;
  preloadTier: 1 | 2 | 3;
  loop: boolean;
  category: 'ui' | 'feedback' | 'celebration' | 'manipulative' | 'ambient';
}

// Services
interface ISoundService {
  initialize(): Promise<void>;
  preloadTier(tier: 1 | 2 | 3): Promise<void>;
  play(soundId: SoundId, options?: { volume?: number; rate?: number }): Promise<void>;
  stop(soundId: SoundId, fadeOutMs?: number): Promise<void>;
  stopAll(): Promise<void>;
  unloadUnused(maxAgeMs?: number): Promise<void>;
  setMasterVolume(volume: number): void;
  setCategoryVolume(category: string, volume: number): void;
  setMuted(muted: boolean): void;
}

interface IMusicService {
  play(trackId: AmbientSoundId): Promise<void>;
  crossfadeTo(trackId: AmbientSoundId, durationMs?: number): Promise<void>;
  pause(): Promise<void>;
  resumeIfWasPlaying(): Promise<void>;
  stop(fadeOutMs?: number): Promise<void>;
  duck(targetVolume?: number): Promise<void>;
  unduck(): Promise<void>;
  isPlaying: boolean;
  currentTrack: AmbientSoundId | null;
}

interface ITTSService {
  speak(text: string, options?: { language?: string; rate?: number; pitch?: number }): Promise<void>;
  stop(): Promise<void>;
  readProblem(problem: { text: string; spokenForm?: string }): Promise<void>;
  isSpeaking(): Promise<boolean>;
  getAvailableVoices(): Promise<Array<{ identifier: string; name: string; language: string }>>;
}

interface IHapticService {
  impact(style: 'light' | 'medium' | 'heavy'): Promise<void>;
  notification(type: 'success' | 'warning'): Promise<void>;
  selection(): Promise<void>;
  isSupported: boolean;
  isEnabled: boolean;
}

// Multimodal feedback events
interface FeedbackEvent {
  sound?: SoundId;
  haptic?: { type: 'impact' | 'notification' | 'selection'; style?: string };
  visual: 'correct' | 'incorrect' | 'hint' | 'levelUp' | 'badge' | 'streak' | 'snap' | 'drop';
}

// Audio settings (Zustand store)
interface AudioSettings {
  masterVolume: number;
  soundEffectsEnabled: boolean;
  soundEffectsVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  ttsEnabled: boolean;
  ttsSpeed: number;
  ttsVoice: string | null;
  autoReadProblems: boolean;
  hapticsEnabled: boolean;
  quietMode: boolean;
}
```

---

## 10. References

- Dweck, C.S. (2006). *Mindset: The New Psychology of Success.* Random House.
- Hallam, S. et al. (2002). Effects of background music on primary school pupils. *Educational Studies*.
- Furnham, A. & Strbac, L. (2002). Music is as distracting as noise. *Ergonomics*.
- Perham, N. & Currie, H. (2014). Does listening to preferred music improve reading comprehension? *Applied Cognitive Psychology*.
- Schellenberg, E.G. et al. (2007). Exposure to music and cognitive performance. *Psychology of Music*.
- Brewster, S.A. (1994). Integrating Non-Speech Audio into HCI. PhD thesis, University of York.
- Gaver, W.W. (1986). Auditory icons: Using sound in computer interfaces. *Human-Computer Interaction*.
- Stein, B.E. & Meredith, M.A. (1993). *The Merging of the Senses.* MIT Press.
- Sims, W.L. (1986). Effect of teacher affect on children's music listening. *JRME*.
- Expo AV: https://docs.expo.dev/versions/latest/sdk/av/
- Expo Speech: https://docs.expo.dev/versions/latest/sdk/speech/
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/
