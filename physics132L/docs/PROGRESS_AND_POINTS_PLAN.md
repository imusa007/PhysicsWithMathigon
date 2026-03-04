# Plan: Accurate progress, per-question tracking, struggle detection, and points

## 1. Why the dashboard shows 100% after only 2 problems (bug)

**Current logic (in `@mathigon/studio` Progress model):**
- **Section progress:** `sectionGoals / section.goals * 100` — correct.  
  (e.g. 2 goals achieved in a section with 2 goals → 100% for that section.)
- **Course progress:** `courseGoals / course.goals * 100` where  
  `courseGoals = sum(section.progress for each section)` (each section progress is 0–100).

So `courseGoals` is in the range 0–600 (6 sections × 100), while `course.goals` in your built JSON is **18** (total number of goals in the course). That gives:
- e.g. 2 sections at 100% → courseGoals = 200 → `200 / 18 * 100` → **1111%** → clamped to **100%**.

So the formula is wrong: it mixes “sum of section percentages” with “total goal count.”

**Fix (backend, one-time):** Applied in `node_modules/@mathigon/studio/server/models/progress.ts`. After `npm install` you must re-apply:
- **Course progress** = average of section progress:  
  `sectionProgressSum = total(course.sections.map(s => this.sections.get(s.id)?.progress || 0));`  
  `this.progress = clamp(round(sectionProgressSum / course.sections.length), 0, 100);`
- **Section progress** when `section.goals === 0`: set to `0` (avoid division by zero).
- See `docs/PATCHES.md` for exact diff to re-apply.

After this fix, a student who only completed 2 goals in one section will show that section at 100% but the course at ~17% (1 of 6 sections “complete”), not 100%.

---

## 2. What to store for “which question, how many trials, where they struggle”

**Current storage (Progress model):**
- Per step: `scores: string[]` (goal IDs achieved, e.g. `['var-0','var-1']`) and optional `data` (e.g. free text, kinematics table).
- No attempt count, no timestamps per goal, no “wrong” attempts.

To support “how many trials” and “where they struggle” you need **richer per-step (or per-goal) data**.

**Option A – Minimal (per goal):**
- For each goal: `{ goalId, achieved: boolean, attempts?: number, firstAchievedAt?: date }`.
- **attempts:** increment each time the student submits or checks an answer for that goal (before it’s achieved).
- Store in Progress, e.g. extend `steps[stepId]` to something like:
  - `scores: string[]` (unchanged, for backward compatibility),
  - `goalAttempts: { [goalId]: number }` (optional),
  - `goalFirstAchieved: { [goalId]: string }` (optional ISO date).
- **Struggle:** e.g. `attempts > 3` or `attempts > 5` before `achieved`.

**Option B – Richer (per interaction):**
- Log each “check” or “submit” per step/goal: `{ goalId, correct: boolean, timestamp }`.
- Lets you compute attempts-to-success, time to success, and wrong-answer patterns.
- Requires more storage and either a new collection (e.g. `attempts` or `events`) or a bounded list inside Progress (e.g. last 50 events per step).

**Recommendation:** Start with **Option A** (per-goal attempts + optional firstAchievedAt). Add Option B later if you need full interaction logs.

**Where to implement:**
- **Frontend:** When a goal is checked (e.g. variable correct, blank correct), send not only `scores: [goalId]` but also an “attempts” count for that step. That implies the frontend (or backend) keeps a running count of “checks” per goal before success.
- **Backend:** Progress model accepts new fields (e.g. `goalAttempts`, `goalFirstAchieved`) and merges them in `updateData`; course/section progress stays goal-based; instructor export can include attempts and “struggle” flags.

---

## 3. “Struggle” detection

- **Definition options:**  
  - High attempts before success (e.g. > 3 or > 5).  
  - Long time on a step before success (if you store timestamps).  
  - Many wrong answers (if you log correct/incorrect).
- **Storage:** Derive from Option A (and optionally B) above.
- **Use:**  
  - **Instructor dashboard:** e.g. “Struggle” column or filter: “Students with > 5 attempts on step X.”  
  - **Export:** Add columns “attempts per step” and “struggle (Y/N)” per goal or per step.

No new “struggle” storage is strictly required if you have per-goal attempts; you can compute “struggle” on the fly (e.g. `attempts > 5`).

---

## 4. Points / rewards to incentivize

**Goals:**
- One number (or a small set) the student sees (e.g. “You have 12 points”).
- Optional: leaderboard or “badges” (e.g. “Completed Module 1 with &lt; 3 attempts per step”).

**Options:**

**A. Points = goals achieved**
- 1 point per goal (or 1 per step if you prefer).  
- Stored: already have “scores” (goals achieved). Points = total length of `scores` across all steps (or weighted by section).  
- No new schema; just compute and show on dashboard / in-app.

**B. Points with “efficiency” bonus**
- Base: 1 point per goal.  
- Bonus: e.g. +0.5 if solved in ≤ 2 attempts (requires storing attempts).  
- Store: same as Option A in 2 + one formula; optional “points” field cached per course (e.g. `progress.points` or computed on read).

**C. Points + struggle penalty**
- Base points per goal, minus a small penalty for “struggle” (e.g. if attempts > 5, only 0.5 points for that goal).  
- Encourages getting it right without too many tries.  
- Same storage as B; formula differs.

**Recommendation:** Start with **A** (points = goals achieved, or = steps with all goals achieved). Add **B** or **C** once you have per-goal attempts (Option A in section 2).

**Where to show:**
- Student dashboard: e.g. “Points: 12” or “Module 1: 6/18 goals (6 points).”
- Instructor export: add a “points” column (and later “bonus points” or “efficiency”).

---

## 5. Implementation order (suggested)

| Step | What | Purpose |
|------|------|--------|
| 1 | Fix course progress formula | Instructor (and student) see real %, not 100% after 2 problems. |
| 2 | Add “points” (e.g. = goals achieved) and show on dashboard / export | Simple incentive and visibility. |
| 3 | Add per-goal attempts (Option A) in Progress + frontend | Enables “how many trials” and struggle. |
| 4 | Instructor view: show attempts per step/student, “struggle” flag or filter | See where students struggle. |
| 5 | (Optional) Efficiency bonus or penalty in points | Finer incentive. |
| 6 | (Optional) Interaction log (Option B) | Deeper analytics later. |

---

## 6. Files / layers to touch

- **Progress model** (studio or override): fix course progress formula; optionally add `goalAttempts` / `goalFirstAchieved` (and later `points` cache if desired).
- **Frontend (course/step/variable/blank):** when a goal is scored, send attempt count (and optionally timestamp); may need to count “checks” before success.
- **Instructor dashboard / export:** use new progress %; add columns for attempts, struggle, points.
- **Student dashboard:** show points (and optionally “goals: X / Y” or “Module progress: Z%”).

This plan keeps storage minimal at first (fix + points + optional attempts), then adds struggle and richer incentives as needed.
