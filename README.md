# dsh-docdesk · 资料区

A desktop-style library for the Markdown documents that DeepSeek Harness creates. Instead of hunting through old sessions for the report an agent just wrote, open **资料区** in the sidebar: every Markdown file from your workspaces is already there, laid out like a desktop.

![Materials panel](docs/screenshots/panel.png)

## Why

DSH agents write notes, plans, research and reports as `.md` files. The files stay in the workspace, but the conversation that produced them scrolls away. 资料区 collects those documents in one place and lets you arrange them the way you work: drag an icon anywhere, group related documents into folders, rename them, and read them without leaving the current session.

The plugin is deliberately read-only. It never moves, renames or deletes anything on disk.

## Features

- **Free icon placement.** Drag any icon to any position on the canvas. Positions survive page reloads and browser restarts.
- **Virtual folders.** Create as many folders as you like and drag documents onto a folder icon to file them. Folder badges show how many items are inside.
- **Rename files and folders.** Use the context menu or press <kbd>F2</kbd>. Renaming changes the label in the library, not the file on disk.
- **Scrollable canvas.** The desktop grows with your library; long lists scroll vertically.
- **Read-only Markdown preview.** Double-click a document to render it in a side panel: headings, lists, quotes, links and fenced code blocks.
- **Search.** Find a document across the whole library by label or path.
- **Hide and restore.** Remove noisy files from the view without touching the disk, then restore them from the “Removed” popover.
- **Tidy.** Re-arrange the current page into a clean grid with one click.
- **Bilingual UI.** Chinese and English follow the Harness locale.
- **Theme-aware.** Colors come from the host theme tokens, so the panel follows light/dark mode.

![Sidebar entry](docs/screenshots/sidebar.png)

## Install

### From the plugin market

Once the entry is merged into [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), open **Plugins → Discover** in the Harness and search for **资料区** or **Materials**, then install it. The market installs straight from this repository, so no npm publication is required.

### From GitHub

```sh
dsh plugin --profile <your-profile> add https://github.com/wei238982377/dsh-docdesk
```

In the DSH Desktop app you can also open **Plugins → Add** and paste the repository URL. The bundle is a source package: the root `package.json` declares `dsh.bundle` and `cordis.patch.yml`, which is all the host needs.

After installation, refresh the browser tab once. New client plugins are loaded on page load; a full host restart is not normally required.

## Use

- Click **资料区** in the left sidebar to open the panel.
- Drag a document icon to move it. Positions are saved automatically.
- **新建文件夹** creates a folder in the current view. Type a name and press Enter.
- Drag a document onto a folder icon to move it inside. Double-click the folder to open it; use the breadcrumb or the back arrow to return.
- Right-click an icon for **Open, Rename, Copy path, Move to folder** and **Remove from library**. Folders additionally offer **Delete folder**; deleting a folder moves its documents back to the parent, it never deletes files.
- Press <kbd>F2</kbd> to rename the selected item and <kbd>Delete</kbd> to remove a selected document from the library.
- Double-click a document to open its preview. The preview is read-only.
- The toolbar’s **Tidy** button re-arranges the current page. **Refresh** rescans the workspaces.

![Folder view](docs/screenshots/folder.png)

## How it works

The bundle has two halves:

- **Host half** (`index.js`) scans every registered workspace, the profile’s default working directory, and the working directories of live agents for `.md`, `.markdown` and `.mdx` files. It exposes two read-only JSON endpoints:
  - `GET /api/dsh-docdesk/list` — the scanned document list
  - `GET /api/dsh-docdesk/read?path=<absolute path>` — one document’s content
- **Client half** (`client.js`) registers the **资料区** sidebar entry and the `main` panel page. It renders the canvas, handles drag-and-drop, folders, renaming, search and the Markdown preview.

Security and limits:

- Both endpoints sit behind the same loopback / paired-device fence used by the bundled management pages, and reject requests carrying forwarding headers.
- Reads are confined to the scanned roots and to Markdown extensions; a preview is capped at 2 MB.
- The scan skips `node_modules`, `.git`, build output, virtual environments and other heavy directories. Current caps are 3,000 documents, 4,000 directories per workspace, 16,000 directories in total and 6 levels of depth.
- The layout (positions, folders, labels and hidden items) is stored in the browser under `dsh-docdesk.layout.v1`. It is per browser profile; the Markdown files themselves are the shared source of truth.
- If a document is moved or deleted outside the plugin, the icon disappears on the next scan. The stored layout entry is kept in case the file comes back.

## Screenshots

| Panel | Folder | Preview |
| --- | --- | --- |
| ![Panel](docs/screenshots/panel.png) | ![Folder](docs/screenshots/folder.png) | ![Preview](docs/screenshots/preview.png) |

## Project layout

```text
dsh-docdesk/
├── index.js              # Host half: workspace scan + read-only endpoints
├── client.js             # Browser module: sidebar entry and desktop panel
├── cordis.patch.yml      # Bundle patch that mounts the plugin row
├── package.json          # Manifest: dsh.bundle, dsh.client, exports, files
├── locale/
│   ├── en.json           # Plugin manager metadata (English)
│   └── zh.json           # Plugin manager metadata (Chinese)
├── icon.svg              # Bundle icon (used by the plugin manager)
├── docs/
│   ├── icon.png          # Raster icon used by the market listing
│   ├── market-entry.yml  # Registry entry submitted to awesome-dsh-plugin
│   └── screenshots/      # README screenshots
├── CHANGELOG.md
├── LICENSE
├── README.md
└── README.zh.md
```

## Development

There is no build step. `index.js` is a plain ESM Cordis plugin; `client.js` is a browser module registered through `window.__ModuleLoader__.load` with the package name as its id. Edit either file, then refresh the browser tab. For a host-half change, reinstall the bundle (or restart the host) so the new module generation is loaded.

To test a local checkout:

```sh
dsh plugin --profile <your-profile> add /absolute/path/to/dsh-docdesk
```

The only runtime imports are Node built-ins (`node:fs`, `node:path`) on the host and `react` from the host module table on the client. There are no npm dependencies to install.

## License

MIT. See [LICENSE](LICENSE).

---

[中文说明](README.zh.md)
