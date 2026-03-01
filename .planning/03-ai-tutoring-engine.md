# AI Tutoring & Explanation Engine

**Research Date:** 2026-02-28
**Focus:** LLM-powered math explanations for ages 6-9

## Critical Research Finding

**PNAS Study (2024):** GPT-4 tutoring experiment with real students:
- **Without guardrails:** -17% learning decline (LLM just gives answers)
- **With guardrails:** +127% improvement (Socratic method, scaffolded hints)

**Implication:** The AI MUST be heavily constrained. Never give answers directly. Always guide through questioning.

## Hybrid Architecture

```
┌─────────────────────────────────────────────┐
│            Problem Generation               │
│  (Programmatic — NO LLM involved)           │
│                                             │
│  • Math engine computes correct answers     │
│  • Generates distractors from bug library   │
│  • Selects difficulty via Elo rating        │
│  • Tags with curriculum standard + topic    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│            LLM Layer (Gemini)               │
│  (Context wrapping + explanations ONLY)     │
│                                             │
│  • Wraps problem in fun story context       │
│  • Generates hints (never answers)          │
│  • Explains concepts from first principles  │
│  • Adapts language to child's age           │
│  • NEVER computes math — uses precomputed   │
└─────────────────────────────────────────────┘
```

**Why this architecture:**
- LLMs are unreliable at arithmetic (especially carry/borrow operations)
- Programmatic engine guarantees correct answers
- LLM excels at natural language, engagement, explanations
- Separation of concerns enables testing each layer independently

## Three-Mode Tutor Engine

### Mode 1: TEACH (New Concepts)

**Triggered when:** Introducing a new skill from the prerequisite graph

**Approach — CPA Progression:**
1. **Concrete:** Show virtual manipulatives (blocks, rods, counters)
2. **Pictorial:** Show diagrams, bar models, number lines
3. **Abstract:** Show equation form

**Auto-advance:** After 3 consecutive correct at each level

**LLM prompt template:**
```
You are a friendly math tutor for a {age}-year-old child.
Explain {concept} using simple words and everyday examples.

Rules:
- Use sentences of 8 words or fewer
- Use only words a {age}-year-old knows
- Reference objects they see daily (toys, snacks, fingers)
- Show ONE step at a time
- Ask "Does that make sense?" after each step
- Never use the word "easy" or "simple"
- Maximum 3 sentences per explanation step

Concept: {concept_description}
Correct answer: {precomputed_answer}
The child's current understanding level: {cpa_level}
```

### Mode 2: HINT (Wrong Answer)

**Triggered when:** Child answers incorrectly

**Approach — Socratic Questioning:**
1. First wrong answer → Gentle redirect: "Hmm, let's think about this together..."
2. LLM asks a simpler sub-question that leads toward the answer
3. Never reveals the answer in hints

**Hint escalation (3 levels):**
1. **Nudge:** "What happens when you count 3 more after 4?"
2. **Scaffold:** "Let's use our blocks! Put 4 blocks here, now add 3 more..."
3. **Guided:** "Count with me: 4... 5... 6... what comes next?"

**LLM prompt template:**
```
The child answered {child_answer} for the problem {problem}.
The correct answer is {correct_answer}.
This is hint level {hint_level} of 3.

Generate a Socratic hint that guides them WITHOUT revealing the answer.
{if hint_level >= 2: "Suggest using manipulatives (blocks, fingers, number line)"}
{if hint_level == 3: "Break the problem into tiny steps, guiding each one"}

Keep language appropriate for age {age}. Max 2 sentences.
```

### Mode 3: BOOST (Deep Scaffolding)

**Triggered when:** Still stuck after 2 hints (3rd wrong answer on same problem)

**Approach — First Principles Walkthrough:**
1. Show the concept from scratch with manipulatives
2. Walk through a simpler version of the same problem type
3. Then return to the original problem
4. If still stuck → show the answer WITH full explanation, then give a similar practice problem

**Example — "What is 7 + 8?":**
```
Step 1: "Let's make 7 + 8 easier! We know 7 + 3 = 10, right?"
Step 2: "So we take 3 from the 8. That leaves 5."
Step 3: "Now we have 10 + 5. That's 15!"
Step 4: [Show with virtual blocks splitting 8 into 3 and 5]
Step 5: "Try this one: What is 6 + 7?" (similar problem for practice)
```

## First-Principles Explanation Library

### Topic: Addition (Bridging Through 10)

**Concept:** When adding numbers that cross 10, decompose one number to make 10 first.

**Age 6-7 explanation:**
> "When numbers are too big to count on fingers, we use a trick!
> We fill up to 10 first, then add what's left.
> 8 + 5: We need 2 more to make 10 (show blocks filling to 10).
> Take 2 from the 5. Now we have 3 left.
> 10 + 3 = 13! Easy peasy!"

**Manipulative:** Ten-frame filling animation

### Topic: Subtraction (Regrouping)

**Concept:** When the ones digit being subtracted is larger, borrow from tens.

**Age 7-8 explanation:**
> "42 - 17: Can we take 7 from 2? Nope!
> Let's open one of our tens (show base-ten rod breaking into 10 cubes).
> Now we have 3 tens and 12 ones.
> 12 - 7 = 5 (count the blocks).
> 3 tens - 1 ten = 2 tens.
> That's 25!"

**Manipulative:** Base-ten block exchange animation

### Topic: Multiplication (Arrays)

**Concept:** Multiplication as rows × columns, connecting to repeated addition.

**Age 8-9 explanation:**
> "3 × 4 means 3 rows of 4.
> Let's build it! [show array of dots]
> Row 1: ● ● ● ● (that's 4)
> Row 2: ● ● ● ● (4 more, that's 8)
> Row 3: ● ● ● ● (4 more, that's 12!)
> 3 × 4 = 12. Same as 4 + 4 + 4!"

**Manipulative:** Interactive array builder

### Topic: Fractions (Equal Parts)

**Concept:** A fraction represents equal parts of a whole.

**Age 8-9 explanation:**
> "Imagine a pizza with 4 equal slices.
> Each slice is 1 out of 4 — that's 1/4!
> If you eat 1 slice, you ate 1/4 of the pizza.
> If you eat 3 slices, you ate 3/4.
> The bottom number tells how many slices total.
> The top number tells how many you have."

**Manipulative:** Pizza/pie cutter with draggable slices

## Language Guidelines by Age

| Aspect | Age 6-7 | Age 7-8 | Age 8-9 |
|--------|---------|---------|---------|
| **Sentence length** | ≤8 words | ≤10 words | ≤12 words |
| **Working memory** | 2-3 chunks | 3-4 chunks | 4-5 chunks |
| **Steps per explanation** | 2-3 | 3-4 | 4-5 |
| **Vocabulary** | Basic (add, take away) | Standard (plus, minus, times) | Math terms (multiply, divide, fraction) |
| **Examples** | Physical (fingers, toys) | Everyday (snacks, coins) | Abstract okay (numbers, equations) |

## Prompt Engineering for Safety

**System prompt guardrails:**
```
CRITICAL RULES:
1. NEVER compute math yourself. Use the provided correct_answer.
2. NEVER reveal the answer in a hint. Guide only.
3. NEVER say "that's wrong" or "incorrect." Say "let's try again" or "hmm, not quite."
4. NEVER use negative language about the child's ability.
5. ALWAYS praise effort, not intelligence ("Great thinking!" not "You're so smart!")
6. If the child seems frustrated (3+ wrong), switch to encouragement + simpler problem.
7. Keep explanations age-appropriate per the language guidelines.
8. Use gender-neutral examples.
9. No food examples involving common allergens.
10. No scary or violent contexts (no "if 3 monsters chase you...").
```

## Technical Implementation

```typescript
interface TutorMode {
  mode: 'teach' | 'hint' | 'boost';
  hintLevel?: 1 | 2 | 3;
  cpaLevel?: 'concrete' | 'pictorial' | 'abstract';
}

interface TutorRequest {
  problem: MathProblem;
  childAge: number;
  childAnswer?: number;  // undefined for TEACH mode
  mode: TutorMode;
  previousHints?: string[];  // context for escalation
  curriculum: CurriculumType;
}

interface TutorResponse {
  explanation: string;
  manipulative?: ManipulativeType;
  followUpQuestion?: string;
  suggestSimpler?: boolean;
}
```

## Metrics to Track

- **Hint-to-correct ratio:** How often hints lead to correct answers (target: >70%)
- **Boost frequency:** How often kids need BOOST mode (target: <15%)
- **Time in explanation:** How long kids spend reading explanations
- **Skip rate:** How often explanations are skipped (indicates poor quality)
- **Post-explanation success:** Does the child get the NEXT similar problem right?
