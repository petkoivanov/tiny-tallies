---
name: sync-website
description: Sync current project info to its product page on the Magic Mirror Works website at C:\Projects\magic-mirror-works-website. Reads project CLAUDE.md, .planning/ docs, and package.json, then updates the website's product page and index.html product card to reflect the current state.
user_invocable: true
---

# Sync Website

Update the Magic Mirror Works website with the current project's latest info.

## Website Location

`C:\Projects\magic-mirror-works-website\`

## Project-to-Page Mapping

| Project Directory | Website Page | Product Card in index.html |
|-------------------|-------------|---------------------------|
| `belote` | `belotrix.html` | Search for `<!-- Product: Belotrix -->` |
| `tiny-tales` | `tinytales.html` | Search for `<!-- Featured Product: TinyTales -->` |
| `tiny-tallies` | `tinytallies.html` | Search for `<!-- Product: TinyTallies -->` |
| `scene-scout` | `scenescout.html` | Search for `<!-- Scene Scout Product Card -->` |
| `still-here` | `stillhere.html` | Search for `<!-- Product: StillHere -->` |

If the current project is not in this mapping, inform the user that this project doesn't have a website page.

If the current project IS `magic-mirror-works-website`, inform the user to run this from the app project instead.

## Steps

1. **Read project state** from the current project:
   - `CLAUDE.md` (project overview, tech stack, features, milestones)
   - `.planning/PROJECT.md` if it exists (current state, requirements)
   - `.planning/MILESTONES.md` if it exists (shipped milestones)
   - `.planning/STATE.md` if it exists (current version, build info)
   - `package.json` if it exists (version number)

2. **Read current website content**:
   - The product's dedicated page (e.g., `belotrix.html`)
   - The product card section in `index.html`

3. **Compare and identify what's outdated** on the website:
   - Hero description and tagline
   - Feature cards (new features added? old features changed?)
   - Badges/tags
   - "How It Works" section
   - Meta description and keywords
   - Copyright year (should be current year)
   - App store links (if app is now published)

4. **Update the website files**:
   - Edit the product page HTML with current info
   - Edit the index.html product card with current info
   - Do NOT touch CSS, JS, or other product pages

5. **Report what changed** to the user

## Important Notes

- The website is pure HTML (no build step, no templating)
- Header/nav/footer are duplicated across all HTML files -- only update the product-specific content, not shared elements
- Keep the existing HTML structure and CSS classes intact
- Only update text content, meta tags, and badges -- don't restructure the page
- Preserve all SVG icons and carousel markup as-is
- If screenshots need updating, note it to the user but don't change image references without new screenshots being available
