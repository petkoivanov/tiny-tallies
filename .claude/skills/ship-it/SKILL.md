---
name: ship-it
description: Git commit all changes and push to remote. Analyzes staged/unstaged changes, generates a commit message, commits, and pushes.
user_invocable: true
---

# Ship It — Commit & Push

Commit all current changes and push to the remote in one step.

## Steps

### 1. Gather context

Run these in parallel:
- `git status --porcelain` — list all changed/untracked files
- `git diff` and `git diff --cached` — see what changed
- `git log --oneline -5` — recent commit style reference
- `git branch --show-current` — current branch name

If there are NO changes (clean working tree), tell the user and stop.

### 2. Review changes and draft commit message

- Look at all staged + unstaged changes
- Draft a concise commit message (1-2 sentences) summarizing the **why**, not the what
- Follow the existing commit message style from recent commits
- Do NOT commit files that likely contain secrets (.env, credentials.json, API keys, etc.) — warn the user if found

### 3. Stage, commit, and push

- Stage all relevant files with `git add` (prefer specific file names over `git add -A` to avoid accidentally staging secrets or large binaries)
- Commit with the drafted message, ending with:
  ```
  Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
  ```
- Use a HEREDOC for the commit message to ensure correct formatting
- After commit succeeds, push to remote: `git push`
  - If no upstream is set, use `git push -u origin <branch>`
- Run `git status` after push to verify clean state

### 4. Report

Tell the user:
- Commit hash and message
- Files included
- Push result (success / remote URL)

## Important Notes

- If the user provides an argument, use it as the commit message instead of generating one: `/ship-it "fix: resolve login bug"`
- If a pre-commit hook fails, fix the issue and create a NEW commit (never amend)
- Never use `--no-verify` or `--force`
- If push fails due to remote changes, tell the user and suggest `git pull --rebase` — do NOT force push
- Pushing to main/master is fine — do NOT ask for confirmation
