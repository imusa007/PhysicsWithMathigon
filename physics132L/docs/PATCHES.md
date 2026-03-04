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
