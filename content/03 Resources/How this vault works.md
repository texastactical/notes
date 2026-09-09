---
title: How this vault works
tags: [resource, meta]
---

# How this vault works (PARA + publishing)

## PARA in one line
Sort every note by **how actionable it is**, not by topic:
**P**rojects (goal + deadline) → **A**reas (ongoing) → **R**esources (reference) → **A**rchive (inactive).

## Wikilinks
Link notes with `[[Note Name]]`. Type `[[` in Obsidian and pick from the list. Links become clickable on the published site too.

## Publishing
This vault **is** the source of a static website. Anything here (except the `private/` folder, `templates/`, and `.obsidian/`) gets published to the web when the site rebuilds.

> [!warning] Privacy
> Do **not** put passwords, financial account numbers, or anything sensitive in published notes. Put those in the **`private/`** folder — it is never published. For a note you want online but locked, add a `password:` field to its frontmatter (encrypted-pages).

## Daily notes
Press the calendar / daily-note hotkey to open today's log in `Daily/`.
