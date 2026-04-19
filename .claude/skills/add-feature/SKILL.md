---
name: add-feature
description: Add a new feature to the project. Use when user asks to add, create, or implement new functionality. Triggers on "add feature", "new feature", "implement", "create new".
argument-hint: "[feature description]"
---

# Add Feature: $ARGUMENTS

## Step 1: Understand & Plan

1. Read `CLAUDE.md` for architecture and conventions
2. Analyze the feature request thoroughly — ask clarifying questions if ambiguous
3. Identify all files that need creation or modification
4. Check `.docs/plans/` for related existing plans

## Step 2: Write Plan

Create or update a plan file in `.docs/plans/` following this format:
- Filename: `MMDDYYYY_NN_Feature_Name.md` (date + sequence number)
- Include: Goal, affected files, tasks checklist, architecture decisions, risks
- If a related plan exists, update it instead of creating a duplicate
- Mark plan status as `IN PROGRESS`

Example:
```markdown
# Feature: [Name]

**Status:** IN PROGRESS
**Date:** [today]

## Goal
[What and why]

## Affected Files
- [list files to create/modify]

## Tasks
- [ ] task 1
- [ ] task 2

## Architecture Decisions
[Any non-obvious choices and reasoning]
```

## Step 3: Implement

1. Follow Clean Architecture layers (domain → application → infrastructure → presentation)
2. Backend changes: entities/interfaces first, then use cases, then routes/controllers
3. Frontend changes: types first, then services, then components/pages
4. i18n: update ALL four locale files (en, vi, zh, ja) for any new UI text
5. Check each task off in the plan as completed

## Step 4: Verify

1. Ensure backend compiles: `cd backend && npx tsc --noEmit`
2. Ensure frontend compiles: `cd frontend && npx tsc --noEmit`
3. Test the feature manually if dev server is running
4. Update plan status to `COMPLETED`

## Step 5: Log Memory

Save a memory entry capturing:
- What feature was added and why
- Any non-obvious architectural decisions made
- Key files created/modified (only if surprising or hard to find)
- Type: `project` memory

Memory should capture what future conversations need to know — skip anything derivable from code or git history.
