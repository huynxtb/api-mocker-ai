---
name: fix-bug
description: Fix a bug in the project. Use when user reports a bug, error, broken behavior, or something not working correctly. Triggers on "fix", "bug", "broken", "not working", "error", "issue".
argument-hint: "[bug description or issue number]"
---

# Fix Bug: $ARGUMENTS

## Step 1: Investigate

1. Read `CLAUDE.md` for architecture context
2. Reproduce or understand the bug — get exact error messages, affected endpoints/pages
3. Search codebase for relevant code using Grep/Glob
4. Check `docs/plans/` and `FIX.md` for related known issues
5. Identify root cause before writing any code

## Step 2: Write Plan

Create or update a plan file in `docs/plans/`:
- Filename: `MMDDYYYY_NN_Fix_Bug_Name.md`
- Include: Bug description, root cause analysis, fix strategy, affected files
- If simple single-file fix, still document in plan (can be brief)
- Mark status as `IN PROGRESS`

Example:
```markdown
# Fix: [Bug Name]

**Status:** IN PROGRESS
**Date:** [today]

## Bug Description
[What's broken, how to reproduce]

## Root Cause
[Why it's broken]

## Fix Strategy
[How to fix it]

## Affected Files
- [list]

## Tasks
- [ ] fix task 1
- [ ] verify fix
```

## Step 3: Fix

1. Make minimal, targeted changes — don't refactor surrounding code
2. Fix the root cause, not symptoms
3. Check each task off in the plan as completed

## Step 4: Verify

1. Ensure backend compiles: `cd backend && npx tsc --noEmit`
2. Ensure frontend compiles: `cd frontend && npx tsc --noEmit`
3. Test the fix manually if dev server is running
4. Confirm the bug is resolved and no regressions introduced
5. Update plan status to `COMPLETED`

## Step 5: Log Memory

Save a memory entry capturing:
- What bug was fixed and the root cause
- Any gotchas or traps that could cause similar bugs
- Type: `project` memory

Skip if the fix is trivial (typo, missing import). Focus on bugs where the root cause was non-obvious or could recur.
