# Contributing to API Mocker AI

Thanks for wanting to help. This guide covers how to get set up, what we expect from a PR, and how we handle reviews.

## Before you start

- **Small change (typo, obvious bug, docs)** → open a PR directly.
- **Anything bigger (new feature, refactor, behavior change)** → open an issue first so we can agree on the approach before you spend time on code.
- Search existing issues and PRs before filing — duplicates get closed.

## Dev setup

Needs Node 18+ and MongoDB 7+ (or Docker).

```bash
# 1. clone + install
git clone https://github.com/huynxtb/api-mocker-ai.git
cd api-mocker-ai

# 2. start Mongo
docker-compose up mongodb -d

# 3. backend
cd backend && npm install && cp .env.example .env && npm run dev

# 4. frontend (new terminal)
cd frontend && npm install && npm run dev
```

Backend: `http://localhost:4000` · Frontend: `http://localhost:4002`.

On first visit you'll hit `/setup` to create the admin account.

## Project layout

See [CLAUDE.md](CLAUDE.md) for the architecture overview — it's the same map maintainers use.

## Before you push

Run both lint steps. PRs with lint errors will be asked to fix them before review.

```bash
# backend
cd backend && npm run lint && npm run build

# frontend
cd frontend && npm run lint && npm run build
```

For UI changes, actually click through the feature in the browser before opening the PR.

## Code style

- **Language**: English for code, comments, commit messages, PR titles. Descriptions / internal docs can be Vietnamese.
- **TypeScript**: no `any` unless you explain why in a comment. Prefer narrow types.
- **Comments**: only when the *why* is non-obvious. Don't describe what the code already says.
- **Architecture** (backend): respect the Clean Architecture layers. Use cases don't import Express. Controllers don't import Mongoose. Domain has no framework imports.
- **i18n** (frontend): every user-facing string goes through `t()`. Update all four locales (`en`, `vi`, `zh`, `ja`) in the same PR.
- **Secrets**: never commit `.env`, API keys, or tokens. CI will reject it.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(endpoints): add pagination auto-detect for nested items
fix(auth): refresh token rotation on login
docs(readme): add demo video
refactor(ai): extract prompt builder from OpenAI provider
```

Keep subjects ≤72 chars. Body only when the *why* isn't obvious from the diff.

## Pull requests

- One logical change per PR. Split unrelated changes.
- Fill out the PR template — don't skip it.
- Reference the issue: `Closes #123`.
- Keep diffs focused. Drive-by refactors make review harder — save them for a separate PR.
- CI must pass. Review happens after CI is green.

## Reporting bugs

Open an issue with:

- What you did (exact steps)
- What you expected
- What actually happened (logs / screenshots if UI)
- Versions: Node, Mongo, browser, OS

## Reporting security issues

**Do not open a public issue for security bugs.** Email the maintainer directly.

## License

By contributing you agree your code ships under the [MIT License](LICENSE).
