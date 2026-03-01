# Gamification & Social Features

**Research Date:** 2026-02-28
**Focus:** Engagement mechanics for ages 6-9, COPPA-compliant

## Design Principles

1. **Intrinsic over extrinsic** — Rewards enhance, not replace, learning motivation
2. **Effort over ability** — Praise persistence, not "being smart"
3. **Cooperative over competitive** — Social features emphasize helping, not ranking
4. **No punitive mechanics** — No hearts, no lives, no "game over"
5. **COPPA compliant** — No chat, no personal info sharing, parental consent required

## Core Gamification Systems

### 1. XP & Leveling

**XP Sources:**
| Action | XP | Notes |
|--------|----|----|
| Correct answer (1st try) | 10 | Base reward |
| Correct answer (2nd try) | 7 | Reduced but still positive |
| Correct answer (after hint) | 5 | Still rewarded for learning |
| Complete daily session | 50 | Bonus for finishing |
| Learn new skill | 25 | Unlocking new topics |
| Weekly streak (5 days) | 100 | Major milestone |
| Help a friend (social) | 15 | Cooperative bonus |

**Level System:**
- Levels 1-100 (soft cap)
- XP per level: `100 + (level × 20)` (gradually harder)
- Level-up celebration: Lottie confetti + new title unlocked
- Titles: "Number Explorer" (1-10), "Math Adventurer" (11-25), "Calculation Hero" (26-50), "Math Wizard" (51+)

### 2. Coins & Shop

**Earned-Only Currency** (no IAP for coins):
| Action | Coins |
|--------|-------|
| Daily session complete | 5 |
| Perfect session (no wrong) | 10 bonus |
| Weekly streak | 20 |
| Mastering a skill | 15 |
| Challenge problem correct | 5 |

**Shop Items** (cosmetic only, never pay-to-win):
- Avatar accessories: hats, glasses, pets (10-50 coins)
- Theme colors for the app (25 coins)
- Celebration animations (30 coins)
- Number line skins (20 coins)
- Calculator buddy voices (40 coins)

### 3. Streaks

**Weekly Streak Design** (not daily — reduces anxiety):
- Target: Complete sessions on 5 of 7 days
- Visual: 7-day bar, colored segments for completed days
- Streak freeze: 1 per week (auto-used or manual)
- Milestones: 1 week, 1 month, 3 months, 6 months, 1 year
- No penalty: Missing a week resets to 0, but doesn't lose earned rewards

**Why weekly, not daily:**
- Research: Daily streaks cause anxiety and guilt in children
- Parents report "meltdowns" when kids miss Duolingo streaks
- Weekly targets maintain habit without pressure
- Weekend flexibility is family-friendly

### 4. Achievement Badges

**Categories:**

**Skill Badges** (earned by mastery):
- "Addition Ace" — Master all addition skills
- "Subtraction Star" — Master all subtraction skills
- "Times Table Champion" — Know all tables to 10
- "Fraction Friend" — Master basic fractions

**Effort Badges** (earned by persistence):
- "Try, Try Again" — Get a problem right after 3 attempts
- "Never Give Up" — Complete 10 sessions in a row
- "Practice Makes Perfect" — Answer 500 problems total
- "Early Bird" — Complete 5 morning sessions

**Exploration Badges** (earned by variety):
- "World Traveler" — Try problems from 3 different curricula
- "Tool Master" — Use all 6 manipulative types
- "Speed Demon" — Complete a speed drill under 60 seconds

### 5. Progress Visualization

**Skill Tree / Map:**
- Visual map showing topic progression
- Completed topics = glowing/colored nodes
- Current topics = pulsing/animated nodes
- Locked topics = grayed out with prerequisite arrows
- Tap to see mastery % per topic

**Daily Summary:**
```
┌─────────────────────────────────┐
│  Today's Practice               │
│  ★★★★☆  (4/5 stars)            │
│                                 │
│  ✓ 12/15 correct (80%)         │
│  ✓ 2 new skills learned         │
│  ✓ Streak: Day 3 of 5          │
│  ⚡ +85 XP  💰 +5 coins        │
│                                 │
│  Keep it up! You're doing great!│
└─────────────────────────────────┘
```

## Social Features (COPPA-Compliant)

### What COPPA Requires (for under 13):
- **Verifiable parental consent** before any social features
- **No personal information** visible to other children
- **No direct messaging / chat**
- **No location data**
- **No behavioral advertising**
- **2025 amendments** (effective April 22, 2026): Enhanced protections for EdTech

### Safe Social Features

#### 1. Family Groups
- Parent creates family group with code
- Siblings/friends join with code (parent-approved)
- See each other's progress (opt-in)
- "High five" button — send an emoji reaction (pre-set, no text)

#### 2. Classroom Mode (Teacher-Managed)
- Teacher creates class with code
- Anonymized leaderboard (by avatar name, not real name)
- Weekly class challenges (cooperative goal)
- Example: "Can our class solve 1000 problems this week?"

#### 3. Challenge a Friend
- Send a math challenge (same problem set) to a friend in family/class group
- Both solve independently, compare scores after
- Emphasize: "You both did great!" not "You won/lost"
- No real-time competitive racing

#### 4. Cooperative Goals
- Monthly "community challenge" — all users contribute toward a goal
- Example: "Together we've solved 1 million addition problems! 🎉"
- Progress bar visible to all users
- Milestone rewards for everyone when reached

## Anti-Patterns (What NOT to Do)

| Anti-Pattern | Why It's Bad | Our Approach |
|-------------|-------------|--------------|
| **Hearts / Lives** | Punishes mistakes, causes anxiety | No penalty for wrong answers |
| **Timers on learning** | Rushes understanding, rewards speed over comprehension | Optional speed drills only, never on learning |
| **Rankings / Leaderboards** | Discourages bottom-half children | Cooperative goals instead |
| **Pay-to-win / Energy** | Exploitative for children | Cosmetic-only purchases |
| **Dark patterns** | "Your streak will die!" guilt messaging | Positive framing: "Welcome back!" |
| **Loss aversion** | Taking away earned rewards | Rewards never expire or decrease |
| **Social comparison** | "Sarah scored higher" notifications | Self-progress only |

## Reward Schedule

Based on variable-ratio reinforcement (most engaging):

- **Every correct answer:** Small XP + brief animation (0.5s)
- **Every 5 correct:** Slightly bigger celebration (coin drop)
- **Session complete:** Summary screen with stars + XP total
- **Random bonus:** "Lucky star!" — 2x XP for a random problem (1 in 10 chance)
- **Skill mastery:** Badge unlock animation (Lottie, 2-3s)
- **Level up:** Full-screen celebration with new title

## Parent Dashboard

Parents can view (behind parental PIN):
- **Daily/weekly summary:** Problems attempted, accuracy, time spent
- **Skill progress:** Which topics mastered, struggling, in progress
- **Misconception alerts:** "Alex is having trouble with carrying in addition"
- **Streak history:** Calendar view of practice days
- **Settings:** Session length, difficulty, social feature toggles
- **Curriculum selection:** Switch between Common Core, Singapore, Russian, etc.

## Technical Implementation

```typescript
interface GamificationState {
  xp: number;
  level: number;
  coins: number;
  streakDays: number;
  streakWeeks: number;
  streakFreezeAvailable: boolean;
  badges: Badge[];
  unlockedCosmetics: string[];
  equippedCosmetics: EquippedCosmetics;
  dailyStats: DailyStats;
  weeklyProgress: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

interface Badge {
  id: string;
  name: string;
  category: 'skill' | 'effort' | 'exploration';
  earnedAt: number;
  icon: string; // Lottie animation key
}

interface DailyStats {
  date: string;
  problemsAttempted: number;
  problemsCorrect: number;
  xpEarned: number;
  coinsEarned: number;
  newSkillsLearned: string[];
  timeSpentMinutes: number;
  stars: 1 | 2 | 3 | 4 | 5; // based on accuracy + completion
}
```

## Research References

- Deci, E.L. & Ryan, R.M. (2000). "Self-Determination Theory" — intrinsic vs extrinsic motivation
- Dweck, C. (2006). "Mindset: The New Psychology of Success" — growth mindset, effort praise
- Hamari, J. et al. (2014). "Does gamification work? A literature review" — meta-analysis
- FTC COPPA Rule (2013, amended 2024). "Children's Online Privacy Protection Act"
- Landers, R.N. (2014). "Developing a theory of gamified learning"
- Deterding, S. (2012). "Gamification: designing for motivation"
