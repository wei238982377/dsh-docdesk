# Changelog

## 0.2.0 — 2026-10-30

Reworked the library around explicit adds and browser-style reading.

- The library starts empty; documents are added from a workspace picker instead of being auto-listed.
- A file action and a right-click menu on delivered file cards add the file to the library.
- Icons are constrained to a fixed desktop frame; new icons are scattered on a sunflower spiral, not laid out in rows.
- Documents open full-screen with browser-style Home and document tabs; tabs can be switched and closed.
- A middle-edge sidebar handle collapses and restores the sidebar.
- Removed the auto-hide/restore and tidy controls; the library is now add-only and free-form.
- Robustness: strip a leading BOM before rendering Markdown; persist library changes synchronously.

## 0.1.0 — 2026-10-30

First public release.

- 资料区 sidebar entry and main panel.
- Workspace scan for `.md`, `.markdown` and `.mdx` files across registered workspaces, the default working directory and live agent working directories.
- Free icon placement with persisted positions.
- Virtual folders with drag-to-file and nested navigation.
- Rename files and folders; tidy the current page.
- Vertical scrolling for large libraries.
- Read-only Markdown preview with headings, lists, quotes, links and code blocks.
- Search, hide and restore.
- Bilingual UI and theme-token styling.
