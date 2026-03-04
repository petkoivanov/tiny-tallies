---
name: bump-and-commit
description: Increment version and build numbers, then commit all changes. Detects project type (Expo, browser extension, Node) and bumps the appropriate files. Warns if the working tree has uncommitted changes before bumping.
user_invocable: true
---

# Bump and Commit

Increment version/build numbers and commit all files in one step.

## Steps

### 1. Check git status first

Run `git status --porcelain`. If there are uncommitted changes:
- **WARN the user** by listing the dirty files
- Ask whether they want to: (a) commit those changes first, (b) include them in the bump commit, or (c) abort
- Do NOT proceed silently with a dirty working tree

### 2. Detect project type and locate version files

Check which files exist in the project root:

| File | Project Type | Version Fields |
|------|-------------|---------------|
| `app.json` with `expo` key | Expo / React Native | `expo.version` (semver), `expo.android.versionCode` (integer), `expo.ios.buildNumber` (string integer) |
| `manifest.json` with `version` key | Browser Extension | `version` (semver) |
| `package.json` with `version` key | Node.js | `version` (semver) |

- For Expo projects, also check `package.json` — if it has a `version` field different from `app.json`, sync it too.
- If no version file is found, inform the user and abort.

### 3. Determine bump type

Default: **patch** bump (e.g., 1.3.5 → 1.3.6).

If the user provided an argument, use it:
- `/bump-and-commit major` → 1.3.5 → 2.0.0
- `/bump-and-commit minor` → 1.3.5 → 1.4.0
- `/bump-and-commit patch` → 1.3.5 → 1.3.6 (default)
- `/bump-and-commit 2.0.0` → set exact version

### 4. Bump version numbers

**Expo projects:**
- Increment `expo.version` (semver string)
- Increment `expo.android.versionCode` by 1 (integer)
- Increment `expo.ios.buildNumber` by 1 (string integer) if it exists
- Sync `package.json` version to match if present

**Browser extensions:**
- Increment `manifest.json` → `version`
- Sync `package.json` version to match if present

**Node.js projects:**
- Increment `package.json` → `version`

### 5. Commit

- Stage the changed version files: `git add app.json package.json manifest.json` (only files that exist and were changed)
- Commit with message: `chore: bump version to X.Y.Z`
  - For Expo projects, append build number: `chore: bump version to X.Y.Z (build N)`

### 6. Report

Tell the user:
- Previous version → new version
- Build number change (if applicable)
- Which files were modified
- The commit hash

## Important Notes

- Do NOT run `git push` — only commit locally
- Do NOT modify any files beyond the version files
- If `package.json` version is "1.0.0" while `app.json` is ahead (e.g., "1.3.5"), treat `app.json` as the source of truth and sync `package.json` to match
- Preserve all JSON formatting (indentation, trailing newlines) when editing version files
