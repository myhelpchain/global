---
name: Git sandbox restriction
description: All git write operations are blocked in the main Replit agent; only read-only git commands work.
---

# Git Sandbox Restriction

## What is blocked
`git add`, `git commit`, `git push`, `git fetch`, `git rebase`, `git reset` — all blocked with exit code 254 and message "Destructive git operations are not allowed in the main agent."

## What works
`git --no-optional-locks status`, `git --no-optional-locks log`, `git --no-optional-locks diff`, `git --no-optional-locks show` — all read-only commands work.

## Workaround
- Replit auto-checkpoint commits changes automatically at session end.
- For controlled commits (specific message, squash), user must run git from their local machine.
- For squashing Replit's auto-commits into a clean commit, user should: clone → apply changes → `git commit -m "..."` → `git push --force-with-lease origin main`.

**Why:** Replit sandboxes git writes to prevent accidental history corruption in shared environments. The project_tasks skill creates isolated environments but those clone from GitHub and cannot see local-only commits.
