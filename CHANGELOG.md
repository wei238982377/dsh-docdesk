# Changelog

## 0.2.2 — 2026-10-30

Marquee selection, a first-screen-aware desktop, and rendered charts.

- Right-drag on empty desktop space to draw a selection box. Selected icons can be dragged as a group and removed with `Delete` / `Backspace`, the toolbar selection pill, or the right-click menu.
- Icons can be placed anywhere in the visible first screen. The desktop grows and scrolls only after the visible slots are full; this repeats for every subsequent row.
- Fenced `chart` blocks (`chart`, `chart:bar`, `chart:line`, `chart:area`, `chart:pie`, `chart:donut`) render to SVG from JSON or simple `label,value` lines. Rendering is local; no external scripts or arbitrary code execution.
- Added a chart screenshot and chart documentation.
- Fixed the confirm dialog's Cancel label using an untranslated key.

## 0.2.1 — 2026-10-30

A fixed-grid desktop instead of free-floating icons.

- Icons snap to fixed desktop slots; every position is aligned to a 96 × 104 grid.
- Two icons can never share a slot: dropping onto an occupied slot swaps the two icons, and new icons fill the first free slot.
- When there are more icons than fit in the visible frame, the desktop scrolls vertically instead of overlapping.
- Resizing the panel reflows the grid to the new column count without overlaps.
- Removed the sunflower-spiral placement and free-form drag clamp.

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
