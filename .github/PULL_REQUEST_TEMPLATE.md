<!--
Thanks for the PR! Fill out each section. Delete sections that genuinely don't apply (and say why).
Keep it short — a tight PR description gets reviewed faster.
-->

## Summary

<!-- One or two sentences: what changes and why. Not a changelog of files. -->

## Related issue

<!-- e.g. Closes #123 / Refs #456. Use "Closes" so the issue auto-closes on merge. -->

Closes #

## Type of change

<!-- Tick one. Delete the rest. -->

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] Refactor (no behavior change)
- [ ] Docs / chore / CI

## What changed

<!-- Bullet the important diffs. Focus on behavior, not filenames. -->

-
-

## How to test

<!-- Exact steps a reviewer can follow. Include URLs, curl commands, UI clicks. -->

1.
2.
3.

## Screenshots / recordings

<!-- Required for any UI change. Before + after is ideal. Delete if backend-only. -->

## Checklist

- [ ] `npm run lint` passes in `backend/` and `frontend/` (whichever I touched)
- [ ] `npm run build` passes in `backend/` and `frontend/` (whichever I touched)
- [ ] Manually tested the change (UI clicked, API called)
- [ ] Added / updated i18n strings in all four locales (`en`, `vi`, `zh`, `ja`) — frontend only
- [ ] Updated docs (README / CLAUDE.md) if behavior or setup changed
- [ ] No secrets, `.env` files, or personal tokens in the diff
- [ ] Commits follow Conventional Commits

## Notes for reviewer

<!-- Anything you want reviewers to know: tradeoffs considered, things you tried and rejected, follow-ups planned for a later PR. Delete if nothing. -->
