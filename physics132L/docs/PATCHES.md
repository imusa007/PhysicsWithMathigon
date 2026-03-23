# Patches to re-apply after `npm install`

`node_modules` is not committed. After running `npm install`, re-apply these edits.

## 1. Course progress formula (Progress model)

**File:** `node_modules/@mathigon/studio/server/models/progress.ts`

**Find (around line 157–162):**
```ts
  const section = course.sections.find(s => s.id === sectionId)!;
  const sectionGoals = total(section.steps.map(s => this.steps.get(s)?.scores.length || 0));
  sectionData.progress = clamp(Math.round(sectionGoals / section.goals * 100) || 0, 0, 100);

  const courseGoals = total(course.sections.map(s => this.sections.get(s.id)?.progress || 0));
  this.progress = clamp(Math.round(courseGoals / course.goals * 100) || 0, 0, 100);
```

**Replace with:**
```ts
  const section = course.sections.find(s => s.id === sectionId)!;
  const sectionGoals = total(section.steps.map(s => this.steps.get(s)?.scores.length || 0));
  sectionData.progress = section.goals > 0
    ? clamp(Math.round(sectionGoals / section.goals * 100) || 0, 0, 100)
    : 0;

  // Course progress = average of section progress (not sum/course.goals, which inflated to 100%)
  const sectionProgressSum = total(course.sections.map(s => this.sections.get(s.id)?.progress || 0));
  const sectionCount = course.sections.length || 1;
  this.progress = clamp(Math.round(sectionProgressSum / sectionCount) || 0, 0, 100);
```

## 2. oAuthTokens unique index (User model) – signup E11000 fix

**File:** `node_modules/@mathigon/studio/server/models/user.ts`

**Find (around line 89):**
```ts
  oAuthTokens: {type: [String], default: [], ...INDEX},
```

**Replace with:**
```ts
  // No unique index: multiple users can have oAuthTokens: [] (E11000 on signup)
  oAuthTokens: {type: [String], default: []},
```

Then in MongoDB run once: `db.users.dropIndex('oAuthTokens_1')` (in database `phys131`).

---

## 3. Per-goal attempts and struggle (Progress model + frontend)

**Purpose:** Store attempt count per goal (e.g. blank wrong tries before success); instructor export shows Attempts and Struggle (Y if any goal had > 3 attempts; threshold in app.ts `STRUGGLE_THRESHOLD`).

### 3a. Progress model — schema and merge

**File:** `node_modules/@mathigon/studio/server/models/progress.ts`

- **StepData type (line ~15):** Add `goalAttempts?: Record<string, number>` to the step type.
- **ChangeData interface:** Add `goalAttempts?: Record<string, number>` to the step type in `steps`.
- **ProgressBase steps:** Add `goalAttempts?: Record<string, number>` to the step map type.
- **Schema `steps.of`:** Add `goalAttempts: Schema.Types.Mixed` next to `scores` and `data`.
- **updateData:** In the loop over `changes.steps`, destructure `goalAttempts`; if present, merge into `stepData.goalAttempts` (e.g. `Object.assign({}, existing, goalAttempts)`).
- **getSectionData** and **getJSON:** Include `goalAttempts` in each step object returned.

### 3b. Frontend — send attempts when scoring

**File:** `node_modules/@mathigon/studio/frontend/components/step/step.ts`

- In `score(goal, goNext = true)`, add optional third parameter `attempts?: number`.
- When calling `saveProgress`, if `attempts !== undefined`, include `goalAttempts: { [goal]: attempts }` in the step payload.

**File:** `node_modules/@mathigon/studio/frontend/components/blank/blank.ts`

- Where it calls `$step.score(goal)` (or `$step.score(this.solvedBlank ? this.solvedBlank.goal : goal)`), pass the blank’s attempt count as the third argument: `$step.score(..., true, this.attempts)`.
