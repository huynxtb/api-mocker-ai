---
name: update-feature
description: Update or enhance an existing feature. Use when user wants to modify, improve, change, or extend existing functionality. Triggers on "update", "change", "modify", "improve", "enhance", "refactor".
argument-hint: "[feature name and what to change]"
---

# Update Feature: $ARGUMENTS

## Step 1: Understand Current State

1. Read `CLAUDE.md` for architecture and conventions
2. Find and read all code related to the existing feature
3. Check `docs/plans/` for the original feature plan — understand original intent
4. Identify what needs to change vs what should stay

## Step 2: Write Plan

Create or update a plan file in `docs/plans/`:
- Filename: `MMDDYYYY_NN_Update_Feature_Name.md`
- If original feature plan exists, update it with a new section rather than creating a separate file
- Include: Current behavior, desired behavior, change strategy, affected files
- Mark status as `IN PROGRESS`

Example:
```markdown
# Update: [Feature Name]

**Status:** IN PROGRESS
**Date:** [today]

## Current Behavior
[What it does now]

## Desired Behavior
[What it should do after update]

## Change Strategy
[How to get from current to desired]

## Affected Files
- [list]

## Tasks
- [ ] task 1
- [ ] task 2

## Breaking Changes
[Any breaking changes or migration needed — "None" if safe]
```

## Step 3: Implement

1. Follow Clean Architecture layers — change propagates domain → application → infrastructure → presentation
2. Preserve backward compatibility unless explicitly told to break it
3. i18n: update ALL four locale files (en, vi, zh, ja) for any changed UI text
4. Check each task off in the plan as completed

## Step 4: Verify

1. Ensure backend compiles: `cd backend && npx tsc --noEmit`
2. Ensure frontend compiles: `cd frontend && npx tsc --noEmit`
3. Test updated behavior manually if dev server is running
4. Verify no regressions in related features
5. Update plan status to `COMPLETED`

## Step 5: Log Memory

Save a memory entry capturing:
- What was updated and why
- Any behavioral changes that could surprise future sessions
- Breaking changes or migrations performed
- Type: `project` memory

Focus on the "why" behind the change and anything non-obvious. Skip if change is straightforward.
