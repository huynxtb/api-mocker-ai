---
description: Create a git commit with secret scanning and Conventional Commits, then ask before pushing
allowed-tools: Bash, Read, Grep, Glob, AskUserQuestion
model: claude-haiku-4-5-20251001
---

Create a git commit following best practices. Work through these steps in order.

## 1. Gather state (run in parallel)

- `git status` (no `-uall`)
- `git diff` (staged + unstaged that will be committed)
- `git diff --cached` if anything is already staged
- `git log -n 10 --oneline` — match the repo's existing commit style
- `git branch --show-current` — warn if the user is about to commit directly to `main`/`master`

## 2. Secret & risk scan (MANDATORY — do not skip)

Before staging anything, scan the diff and untracked files for:

- `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa`, `credentials.json`, `secrets.*`, `*.keystore`
- High-entropy strings matching: `sk-[A-Za-z0-9]{20,}`, `AIza[0-9A-Za-z\-_]{35}`, `ghp_[A-Za-z0-9]{36}`, `xox[baprs]-[A-Za-z0-9-]+`, `-----BEGIN [A-Z ]*PRIVATE KEY-----`
- Hardcoded assignments: `password\s*=\s*["'][^"']+["']`, `api[_-]?key\s*=\s*["'][^"']+["']`, `secret\s*=\s*["'][^"']+["']`, `token\s*=\s*["'][^"']+["']`, `Bearer\s+[A-Za-z0-9\-._~+/]+`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `MONGODB_URI` with real values (not placeholders)
- Large binaries (>1MB), build artifacts (`dist/`, `build/`, `node_modules/`), `.DS_Store`

If anything suspicious is found: **STOP**, list each finding with file + line, and ask the user whether to proceed, unstage those files, or abort. Do not auto-redact — let the user decide.

## 3. Stage deliberately

- Add files **by name** — never `git add -A` or `git add .`.
- Group only logically related changes into one commit. If the diff spans unrelated concerns, suggest splitting into multiple commits.

## 4. Draft the message (Conventional Commits)

Format: `<type>(<scope>)!: <subject>` + blank line + body + blank line + footer.

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **scope** (optional): `backend`, `frontend`, `auth`, `mock`, `i18n`, etc. — infer from changed paths
- **subject**: imperative mood, lower-case, no trailing period, ≤ 72 chars
- **body** (wrap at 72): explain the *why*, not the *what*. Skip if truly trivial.
- **footer**: `BREAKING CHANGE: …`, `Closes #123`, `Refs #456` when relevant
- Use `!` after type/scope for breaking changes (in addition to the footer)
- i18n rule from `CLAUDE.md`: commit messages in English

Pass the message via a HEREDOC. Do **not** append any `Co-Authored-By` trailer or other attribution footer.

## 5. Commit & verify

- Run the commit. **Never** use `--no-verify`, `--no-gpg-sign`, or `--amend` unless the user explicitly asks.
- If a hook fails: do not `--amend`. Fix the issue, re-stage, create a **new** commit.
- After success, run `git status` and `git log -1 --stat` to confirm.

## 6. Ask before pushing

Ask the user whether to push. Use `AskUserQuestion` with options:

- **Push** — `git push` (or `git push -u origin <branch>` if upstream is unset)
- **Don't push** — stop here
- **Push with lease** — `git push --force-with-lease` (only offer if the branch has diverged; refuse for `main`/`master` unless explicitly confirmed again)

Never push `--force` to `main`/`master`. Never push without asking.

## Arguments

If the user passes `$ARGUMENTS`, treat it as hints for the commit subject/scope — still run every step above.
