# Arthur's Notes

Personal Obsidian vault **and** the source for the published notes site at
**https://notes.texasrisingsun.com** (offline-capable PWA).

## How it fits together
- The Obsidian vault lives in [`content/`](content/) — edit notes there (or in the Obsidian app).
- [Quartz 5](https://github.com/jackyzha0/quartz) turns the vault into a static site.
- `scripts/inject-pwa.mjs` adds a service worker + web manifest so the site works fully offline.
- Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and deploys to GitHub Pages.

## Edit & publish
1. Edit notes in Obsidian (vault = the `content/` folder).
2. Commit and push:
   ```bash
   git add -A && git commit -m "notes update" && git push
   ```
3. GitHub Actions rebuilds and deploys automatically (~1–2 min).

## Build locally
```bash
npm ci
npm run build:site          # quartz build + PWA injection -> public/
npx quartz build --serve    # live preview at http://localhost:8080
```

## Privacy
- `content/private/` is **never** published and **never** committed (git-ignored + build-ignored).
- Keep passwords / account numbers out of published notes.
- For a note you want online but locked, add a `password:` field to its frontmatter.

## Structure (PARA)
`Inbox/` · `01 Projects/` · `02 Areas/` · `03 Resources/` · `04 Archive/` · `Daily/`
