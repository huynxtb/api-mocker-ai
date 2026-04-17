---
description: Open a pull request using .github/PULL_REQUEST_TEMPLATE.md and Git Flow conventions
allowed-tools: Bash, Read, Grep, Glob, AskUserQuestion
model: claude-haiku-4-5-20251001
---

Create a pull request for the current branch. Work through these steps in order.

## 1. Preflight (run in parallel)

- `git status`
- `git branch --show-current`
- `git remote -v`
- `gh auth status` — if not authenticated, stop and tell the user to run `gh auth login`.
- `git fetch origin --prune`
- Detect base branch: prefer `develop` if it exists on the remote (Git Flow), otherwise `main`.
- `git log --oneline <base>..HEAD` — full commit history since divergence
- `git diff <base>...HEAD` — full cumulative diff (three dots, not two)
- Read `.github/PULL_REQUEST_TEMPLATE.md`

Block if:
- Current branch is `main` / `master` / `develop` → ask the user to create a feature branch first.
- There are no commits ahead of base → nothing to PR.
- Working tree is dirty → ask whether to commit (suggest `/commit`), stash, or abort.

## 2. Branch-name sanity check (Git Flow)

Warn (don't block) if the branch doesn't match one of:
- `feature/<slug>`, `fix/<slug>`, `bugfix/<slug>`, `hotfix/<slug>`, `chore/<slug>`, `docs/<slug>`, `refactor/<slug>`, `release/<version>`

## 3. Secret & diff scan

Re-run the same secret scan from `/commit` across the full PR diff. If anything looks sensitive, stop and surface findings before opening the PR.

## 4. Push the branch

- If upstream is unset: `git push -u origin <branch>`
- If ahead of upstream: `git push`
- If diverged: ask the user — never force-push without explicit confirmation, and never to shared branches.

## 5. Build the PR title and body

**Title** (≤ 70 chars, Conventional Commits style):
`<type>(<scope>): <subject>` — derive from the commits on the branch, not just the latest one.

**Body**: fill in `.github/PULL_REQUEST_TEMPLATE.md` exactly. For each section:

- **Summary** — 1–2 sentences on *what changes and why*. Not a file list.
- **Related issue** — `Closes #N` if referenced in a commit/branch name; otherwise delete the section with a brief note.
- **Type of change** — tick exactly one box, delete the others.
- **What changed** — 3–6 bullets on behavior (not filenames).
- **How to test** — concrete numbered steps: URLs, `curl`, UI clicks. If backend-only, say so.
- **Screenshots / recordings** — if the diff touches `frontend/`, leave the section with a `_TODO: attach before/after_` placeholder; otherwise delete it with a note (`_backend-only_`).
- **Checklist** — tick only items you can verify from the diff / commands run. Leave the rest unchecked — don't tick to be polite.
  - Auto-verify when possible: `npm run lint` and `npm run build` in whichever of `backend/` / `frontend/` was touched. If a check fails, fix or surface before opening the PR.
  - i18n checkbox: if `frontend/` changed, grep for new `t('...')` keys and confirm all four locale files (`en`, `vi`, `zh`, `ja`) were updated.
  - Secrets checkbox: only tick after step 3 passes clean.
- **Notes for reviewer** — tradeoffs, things tried and rejected, follow-ups. Delete if genuinely nothing.

Delete sections that don't apply with a one-line `<!-- n/a: … -->` so reviewers see the intent.

## 6. Create the PR

Pass the body via a HEREDOC to preserve formatting:

```bash
gh pr create \
  --base <base-branch> \
  --head <current-branch> \
  --title "<title>" \
  --body "$(cat <<'EOF'
<filled template>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Add `--draft` if the user passed `draft` / `wip` in `$ARGUMENTS`, or if the PR checklist has unchecked critical items (lint/build failing, missing tests for a feature, TODOs in the diff).

## 7. Report back

- Print the PR URL.
- Summarize: base ← head, type of change, checklist items still unticked, anything the reviewer needs to know.
- Do **not** merge. Do **not** mark ready-for-review if opened as draft. Do **not** request reviewers unless the user asked.

## Arguments

`$ARGUMENTS` may contain hints: `draft`, `wip`, a target base (`base:main`), or freeform context for the summary. Apply them but still run every step.
