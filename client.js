window.__ModuleLoader__.load({
  id: 'dsh-docdesk',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const PANEL_ID = 'materials'
    const NS = 'dsh-docdesk'
    const API_LIST = '/api/dsh-docdesk/list'
    const API_READ = '/api/dsh-docdesk/read'
    const STORAGE_KEY = 'dsh-docdesk.layout.v1'
    const CELL_W = 104
    const CELL_H = 116
    const PAD = 16

    /* ------------------------------------------------------------- locale */

    const ZH = {
      'panel.title': '资料区',
      'panel.subtitle': '{count} 个 Markdown 文档',
      'panel.subtitleEmpty': '等待 DSH 生成文档',
      'action.refresh': '刷新',
      'action.newFolder': '新建文件夹',
      'action.tidy': '整理当前页',
      'action.hidden': '已移除 {count}',
      'action.close': '关闭',
      'action.restore': '恢复',
      'action.remove': '移出资料区',
      'action.open': '打开',
      'action.rename': '重命名',
      'action.copyPath': '复制路径',
      'action.deleteFolder': '删除文件夹',
      'action.moveTo': '移动到文件夹',
      'action.back': '返回上一级',
      'action.retry': '重试',
      'folder.defaultName': '新建文件夹',
      'folder.root': '资料区',
      'folder.count': '{count} 项',
      'empty.title': '这里还没有文档',
      'empty.hint': 'DSH 写出的 Markdown 文件会自动收进资料区；也可以点右上角刷新。',
      'empty.folderTitle': '这个文件夹还是空的',
      'empty.folderHint': '把文件拖到文件夹图标上，或右键文件选择「移动到文件夹」。',
      'search.placeholder': '搜索资料区',
      'search.noResults': '没有匹配的文档',
      'search.resultCount': '找到 {count} 个文档',
      'search.clear': '清空搜索',
      'status.files': '{count} 个文档',
      'status.roots': '{count} 个目录',
      'status.truncated': '已达文档上限，仅显示部分文档',
      'status.partial': '部分目录未扫描完',
      'status.saved': '布局自动保存在本机',
      'status.scanned': '更新于 {time}',
      'error.load': '扫描失败：{reason}',
      'error.read': '读取失败：{reason}',
      'error.forbidden': '无法访问（仅本机可用）',
      'error.outside': '文件不在可访问的目录内',
      'error.notFound': '文件不存在',
      'error.notMarkdown': '不是 Markdown 文件',
      'preview.loading': '正在读取…',
      'preview.truncated': '文件较大，仅显示前 2 MB',
      'preview.empty': '这个文件是空的',
      'preview.hint': '双击文档图标即可预览',
      'menu.moveHint': '当前没有其他文件夹',
      'menu.root': '资料区（根目录）',
      'menu.separator': '移动到',
      'confirm.deleteTitle': '删除文件夹？',
      'confirm.deleteWithFiles': '文件夹里的 {count} 个文档会移回上一级，磁盘上的文件不会被删除。',
      'confirm.deleteEmpty': '这个文件夹是空的，删除后无法恢复。',
      'confirm.delete': '删除',
      'confirm.cancel': '取消',
      'toast.copied': '路径已复制',
      'toast.copyFailed': '复制失败，请手动选择路径',
      'toast.folderCreated': '已新建文件夹',
      'toast.folderDeleted': '已删除文件夹',
      'toast.moved': '已移动',
      'toast.removed': '已移出资料区，可在「已移除」里恢复',
      'toast.restored': '已恢复到资料区',
      'toast.tidied': '已整理当前页',
    }

    const EN = {
      'panel.title': 'Materials',
      'panel.subtitle': '{count} Markdown documents',
      'panel.subtitleEmpty': 'Waiting for DSH documents',
      'action.refresh': 'Refresh',
      'action.newFolder': 'New folder',
      'action.tidy': 'Tidy this page',
      'action.hidden': 'Removed {count}',
      'action.close': 'Close',
      'action.restore': 'Restore',
      'action.remove': 'Remove from library',
      'action.open': 'Open',
      'action.rename': 'Rename',
      'action.copyPath': 'Copy path',
      'action.deleteFolder': 'Delete folder',
      'action.moveTo': 'Move to folder',
      'action.back': 'Back',
      'action.retry': 'Retry',
      'folder.defaultName': 'New folder',
      'folder.root': 'Materials',
      'folder.count': '{count} items',
      'empty.title': 'No documents yet',
      'empty.hint': 'Markdown files written by DSH appear here automatically. You can also refresh from the toolbar.',
      'empty.folderTitle': 'This folder is empty',
      'empty.folderHint': 'Drag a document onto a folder icon, or right-click it and choose "Move to folder".',
      'search.placeholder': 'Search materials',
      'search.noResults': 'No matching documents',
      'search.resultCount': '{count} documents found',
      'search.clear': 'Clear search',
      'status.files': '{count} documents',
      'status.roots': '{count} directories',
      'status.truncated': 'Document limit reached; showing a subset',
      'status.partial': 'Some directories were not scanned',
      'status.saved': 'Layout saved on this device',
      'status.scanned': 'Updated {time}',
      'error.load': 'Scan failed: {reason}',
      'error.read': 'Read failed: {reason}',
      'error.forbidden': 'Access denied (loopback only)',
      'error.outside': 'The file is outside the readable folders',
      'error.notFound': 'File not found',
      'error.notMarkdown': 'Not a Markdown file',
      'preview.loading': 'Reading…',
      'preview.truncated': 'Large file: showing the first 2 MB',
      'preview.empty': 'This file is empty',
      'preview.hint': 'Double-click a document icon to preview it',
      'menu.moveHint': 'No other folders yet',
      'menu.root': 'Materials (root)',
      'menu.separator': 'Move to',
      'confirm.deleteTitle': 'Delete folder?',
      'confirm.deleteWithFiles': '{count} document(s) move back to the parent folder. Files on disk are not deleted.',
      'confirm.deleteEmpty': 'This folder is empty. Deleting it cannot be undone.',
      'confirm.delete': 'Delete',
      'confirm.cancel': 'Cancel',
      'toast.copied': 'Path copied',
      'toast.copyFailed': 'Copy failed; select the path manually',
      'toast.folderCreated': 'Folder created',
      'toast.folderDeleted': 'Folder deleted',
      'toast.moved': 'Moved',
      'toast.removed': 'Removed from library; restore it from "Removed"',
      'toast.restored': 'Restored to the library',
      'toast.tidied': 'Page tidied',
    }

    let translate
    function detectZh() {
      try {
        return (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('zh')
      } catch {
        return false
      }
    }
    function t(key, values) {
      if (typeof translate === 'function') {
        try {
          const text = translate(key, values)
          if (typeof text === 'string') return text
        } catch {
          /* fall through to the built-in dictionary */
        }
      }
      let text = (detectZh() ? ZH : EN)[key] ?? EN[key] ?? key
      if (values) {
        for (const [name, value] of Object.entries(values)) text = text.split(`{${name}}`).join(String(value))
      }
      return text
    }

    /* -------------------------------------------------------------- store */

    function emptyLayout() {
      return { version: 1, folders: {}, items: {}, hidden: {}, nextId: 1 }
    }

    function loadLayout() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return emptyLayout()
        const parsed = JSON.parse(raw)
        if (!parsed || parsed.version !== 1) return emptyLayout()
        return {
          version: 1,
          folders: parsed.folders && typeof parsed.folders === 'object' ? parsed.folders : {},
          items: parsed.items && typeof parsed.items === 'object' ? parsed.items : {},
          hidden: parsed.hidden && typeof parsed.hidden === 'object' ? parsed.hidden : {},
          nextId: Number.isFinite(parsed.nextId) ? parsed.nextId : 1,
        }
      } catch {
        return emptyLayout()
      }
    }

    /* ------------------------------------------------------------ helpers */

    function formatTime(value) {
      if (!value) return ''
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
      } catch {
        return new Date(value).toLocaleString()
      }
    }

    function formatSize(bytes) {
      if (!Number.isFinite(bytes)) return ''
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    function basename(value) {
      if (typeof value !== 'string') return ''
      const parts = value.split(/[\\/]/)
      return parts[parts.length - 1] || value
    }

    function gridSlot(layout, folderId, columns) {
      const used = new Set()
      const mark = (x, y) => used.add(`${Math.round((x - PAD) / CELL_W)},${Math.round((y - PAD) / CELL_H)}`)
      for (const item of Object.values(layout.items)) {
        if ((item.folderId ?? null) === folderId) mark(item.x, item.y)
      }
      for (const folder of Object.values(layout.folders)) {
        if ((folder.parentId ?? null) === folderId) mark(folder.x, folder.y)
      }
      for (let index = 0; index < 20000; index += 1) {
        const column = index % columns
        const row = Math.floor(index / columns)
        if (!used.has(`${column},${row}`)) return { x: PAD + column * CELL_W, y: PAD + row * CELL_H }
      }
      return { x: PAD, y: PAD }
    }

    function columnsFor(width) {
      const usable = Math.max(CELL_W, (width || 960) - PAD * 2)
      return Math.max(2, Math.floor(usable / CELL_W))
    }

    function folderChain(folders, id) {
      const chain = []
      let cursor = id
      const seen = new Set()
      while (cursor && folders[cursor] && !seen.has(cursor)) {
        seen.add(cursor)
        chain.unshift(folders[cursor])
        cursor = folders[cursor].parentId ?? null
      }
      return chain
    }

    function descendantFolders(folders, id) {
      const result = new Set([id])
      let changed = true
      while (changed) {
        changed = false
        for (const [fid, folder] of Object.entries(folders)) {
          if (!result.has(fid) && folder.parentId && result.has(folder.parentId)) {
            result.add(fid)
            changed = true
          }
        }
      }
      return result
    }

    function countFilesIn(folders, items, id) {
      const scope = descendantFolders(folders, id)
      let count = 0
      for (const item of Object.values(items)) {
        if (item.folderId && scope.has(item.folderId)) count += 1
      }
      return count
    }

    function countChildren(layout, folderId) {
      let count = 0
      for (const folder of Object.values(layout.folders)) if ((folder.parentId ?? null) === folderId) count += 1
      for (const item of Object.values(layout.items)) if ((item.folderId ?? null) === folderId) count += 1
      return count
    }

    function uniqueFolderName(folders, parentId, base) {
      const siblings = new Set(
        Object.values(folders)
          .filter((folder) => (folder.parentId ?? null) === parentId)
          .map((folder) => folder.name),
      )
      if (!siblings.has(base)) return base
      for (let index = 2; index < 200; index += 1) {
        const candidate = `${base} ${index}`
        if (!siblings.has(candidate)) return candidate
      }
      return `${base} ${Date.now().toString(36)}`
    }

    /* --------------------------------------------------------------- icons */

    function icon(name, size) {
      const s = size || 16
      const base = {
        width: s,
        height: s,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
      }
      const paths = (list, extra) => h('svg', { ...base, ...(extra || {}) }, list.map((d, index) => h('path', { key: index, d })))
      switch (name) {
        case 'plus':
          return paths(['M12 5v14', 'M5 12h14'])
        case 'refresh':
          return paths(['M20 11a8 8 0 1 0-2.34 6.34', 'M20 4.8v6.2h-6.2'])
        case 'search':
          return h('svg', base, [
            h('circle', { key: 'c', cx: 11, cy: 11, r: 6.4 }),
            h('path', { key: 'l', d: 'M16 16l4.2 4.2' }),
          ])
        case 'back':
          return paths(['M14.5 5.5L8 12l6.5 6.5'])
        case 'close':
          return paths(['M6 6l12 12', 'M18 6L6 18'])
        case 'copy':
          return h('svg', base, [
            h('rect', { key: 'r1', x: 8.6, y: 8.6, width: 11, height: 11, rx: 2 }),
            h('path', { key: 'p1', d: 'M15.4 8.6V6.4a1.8 1.8 0 0 0-1.8-1.8H6.4a1.8 1.8 0 0 0-1.8 1.8v7.2a1.8 1.8 0 0 0 1.8 1.8h2.2' }),
          ])
        case 'trash':
          return paths(['M4 7h16', 'M9.5 7V4.6h5V7', 'M6.5 7l1 13h9l1-13', 'M10 11v5.5', 'M14 11v5.5'])
        case 'restore':
          return paths(['M4.5 12a7.5 7.5 0 1 0 2.2-5.3', 'M4.5 4.5v4.2h4.2'])
        case 'folder-plus':
          return paths(['M3.2 6.6a1.6 1.6 0 0 1 1.6-1.6h4.1l1.8 2.1H19.2a1.6 1.6 0 0 1 1.6 1.6v9.1a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6z', 'M12 11v5', 'M9.5 13.5h5'])
        case 'tidy':
          return h('svg', base, [
            h('rect', { key: 'a', x: 4, y: 4, width: 6.4, height: 6.4, rx: 1.4 }),
            h('rect', { key: 'b', x: 13.6, y: 4, width: 6.4, height: 6.4, rx: 1.4 }),
            h('rect', { key: 'c', x: 4, y: 13.6, width: 6.4, height: 6.4, rx: 1.4 }),
            h('rect', { key: 'd', x: 13.6, y: 13.6, width: 6.4, height: 6.4, rx: 1.4 }),
          ])
        case 'eye-off':
          return paths(['M3 3l18 18', 'M10.6 6.2A9.9 9.9 0 0 1 12 6c5 0 8.5 4.1 9.5 6a12.4 12.4 0 0 1-3.1 3.7', 'M6.7 6.9A13.4 13.4 0 0 0 2.5 12c1 1.9 4.5 6 9.5 6a10 10 0 0 0 4.1-.9', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'])
        case 'doc':
          return paths(['M6.2 3.2h7.2l4.4 4.4v13.2H6.2z', 'M13.2 3.4v4.4h4.4', 'M9 12.4h6', 'M9 15.4h6', 'M9 9.4h2.4'])
        case 'folder':
          return paths(['M3.2 6.4a1.6 1.6 0 0 1 1.6-1.6h4.1l1.8 2.2H19.2a1.6 1.6 0 0 1 1.6 1.6v9.2a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6z'])
        default:
          return paths(['M12 5v14', 'M5 12h14'])
      }
    }

    function PanelIcon({ size }) {
      const s = typeof size === 'number' && size > 0 ? size : 16
      return h(
        'svg',
        {
          width: s,
          height: s,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          'data-dsh-panel-entry': PANEL_ID,
        },
        h('path', { d: 'M1.9 3.6h4.2l1.2 1.5h6.8v8.2a1 1 0 0 1-1 1H2.9a1 1 0 0 1-1-1z' }),
        h('path', { d: 'M5 7.3h6M5 9.5h4.2' }),
      )
    }

    /* ----------------------------------------------------------- markdown */

    function renderInline(text, keyPrefix) {
      const nodes = []
      const pattern = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/g
      let cursor = 0
      let counter = 0
      let match
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > cursor) nodes.push(text.slice(cursor, match.index))
        const token = match[0]
        const key = `${keyPrefix}-${counter++}`
        if (token.startsWith('`')) {
          nodes.push(h('code', { key, className: 'dsm-md-inline-code' }, token.slice(1, -1)))
        } else if (token.startsWith('**')) {
          nodes.push(h('strong', { key }, token.slice(2, -2)))
        } else if (token.startsWith('*')) {
          nodes.push(h('em', { key }, token.slice(1, -1)))
        } else {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
          const href = link ? link[2] : ''
          if (link && /^(https?:\/\/|mailto:|#)/i.test(href)) {
            nodes.push(h('a', { key, href, target: '_blank', rel: 'noreferrer noopener' }, link[1]))
          } else {
            nodes.push(link ? link[1] : token)
          }
        }
        cursor = match.index + token.length
      }
      if (cursor < text.length) nodes.push(text.slice(cursor))
      return nodes
    }

    function renderMarkdown(source, baseKey) {
      const lines = String(source ?? '').replace(/\r\n?/g, '\n').split('\n')
      const blocks = []
      let index = 0
      let key = 0
      let paragraph = []
      const prefix = baseKey || 'md'
      const flush = () => {
        if (paragraph.length === 0) return
        const text = paragraph.join(' ')
        blocks.push(h('p', { key: `${prefix}-p${key++}`, className: 'dsm-md-p' }, renderInline(text, `${prefix}-p${key}`)))
        paragraph = []
      }
      while (index < lines.length) {
        const line = lines[index]
        const fence = /^```([\w+#.-]*)\s*$/.exec(line)
        if (fence) {
          flush()
          const code = []
          index += 1
          while (index < lines.length && !/^```\s*$/.test(lines[index])) {
            code.push(lines[index])
            index += 1
          }
          if (index < lines.length) index += 1
          blocks.push(
            h(
              'pre',
              { key: `${prefix}-pre${key++}`, className: 'dsm-md-pre' },
              h('code', null, code.join('\n')),
            ),
          )
          continue
        }
        if (/^\s*$/.test(line)) {
          flush()
          index += 1
          continue
        }
        const heading = /^(#{1,6})\s+(.*)$/.exec(line)
        if (heading) {
          flush()
          const level = Math.min(6, heading[1].length)
          blocks.push(
            h(
              `h${level}`,
              { key: `${prefix}-h${key++}`, className: 'dsm-md-heading' },
              renderInline(heading[2], `${prefix}-h${key}`),
            ),
          )
          index += 1
          continue
        }
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
          flush()
          blocks.push(h('hr', { key: `${prefix}-hr${key++}`, className: 'dsm-md-hr' }))
          index += 1
          continue
        }
        if (/^>\s?/.test(line)) {
          flush()
          const quote = []
          while (index < lines.length && /^>\s?/.test(lines[index])) {
            quote.push(lines[index].replace(/^>\s?/, ''))
            index += 1
          }
          blocks.push(
            h(
              'blockquote',
              { key: `${prefix}-q${key++}`, className: 'dsm-md-quote' },
              renderInline(quote.join(' '), `${prefix}-q${key}`),
            ),
          )
          continue
        }
        if (/^[-*+]\s+/.test(line)) {
          flush()
          const items = []
          while (index < lines.length && /^[-*+]\s+/.test(lines[index])) {
            items.push(
              h(
                'li',
                { key: `${prefix}-li${key++}` },
                renderInline(lines[index].replace(/^[-*+]\s+/, ''), `${prefix}-li${key}`),
              ),
            )
            index += 1
          }
          blocks.push(h('ul', { key: `${prefix}-ul${key++}`, className: 'dsm-md-list' }, items))
          continue
        }
        if (/^\d+[.)]\s+/.test(line)) {
          flush()
          const items = []
          while (index < lines.length && /^\d+[.)]\s+/.test(lines[index])) {
            items.push(
              h(
                'li',
                { key: `${prefix}-li${key++}` },
                renderInline(lines[index].replace(/^\d+[.)]\s+/, ''), `${prefix}-li${key}`),
              ),
            )
            index += 1
          }
          blocks.push(h('ol', { key: `${prefix}-ol${key++}`, className: 'dsm-md-list' }, items))
          continue
        }
        paragraph.push(line.trim())
        index += 1
      }
      flush()
      return blocks
    }

    /* ---------------------------------------------------------------- css */

    const CSS = `
.dsm-panel { position:relative; display:flex; flex-direction:column; height:100%; min-height:0; background:var(--dsw-alias-bg-base,#fff); color:var(--dsw-alias-label-primary,#1b1b1f); font-family:inherit; }
.dsm-header { flex:none; display:flex; align-items:flex-start; gap:10px; padding:16px 18px 8px; }
.dsm-heading { display:flex; flex-direction:column; gap:2px; min-width:0; padding-top:1px; }
.dsm-title { margin:0; font-size:17px; font-weight:700; letter-spacing:.2px; line-height:1.2; }
.dsm-sub { color:var(--dsw-alias-label-secondary,#6b6b76); font-size:11.5px; line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:340px; }
.dsm-actions { margin-left:auto; display:flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
.dsm-btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; height:28px; min-width:28px; padding:0 9px; border-radius:8px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12px; cursor:pointer; white-space:nowrap; }
.dsm-btn:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsm-btn:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsm-btn:disabled { opacity:.5; cursor:default; }
.dsm-btn[data-primary] { background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#f9fafb)); border-color:transparent; color:var(--dsw-alias-label-primary-foreground,#0f1115); font-weight:600; }
.dsm-btn[data-primary]:hover:not(:disabled) { filter:brightness(1.04); background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#f9fafb)); }
.dsm-btn[data-quiet] { border-color:transparent; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-btn[data-quiet]:hover:not(:disabled) { color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsm-btn[data-spin] svg { animation:dsm-spin .9s linear infinite; }
.dsm-search { position:relative; display:flex; align-items:center; }
.dsm-search svg { position:absolute; left:8px; color:var(--dsw-alias-label-secondary,#6b6b76); pointer-events:none; }
.dsm-search input { width:168px; height:28px; padding:0 8px 0 28px; border-radius:8px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:var(--dsw-specific-input-major,var(--dsw-alias-bg-base,#fff)); color:inherit; font:inherit; font-size:12px; outline:none; }
.dsm-search input:focus { border-color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsm-search input::placeholder { color:var(--dsw-alias-label-secondary,#6b6b76); opacity:.8; }
.dsm-crumb { flex:none; display:flex; align-items:center; gap:3px; padding:0 18px 9px; min-height:24px; font-size:12px; color:var(--dsw-alias-label-secondary,#6b6b76); flex-wrap:wrap; }
.dsm-crumb-btn { border:none; background:transparent; color:inherit; font:inherit; font-size:12px; padding:2px 5px; border-radius:5px; cursor:pointer; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsm-crumb-btn:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsm-crumb-current { padding:2px 5px; color:var(--dsw-alias-label-primary,#1b1b1f); font-weight:600; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsm-crumb-sep { opacity:.55; }
.dsm-crumb-back { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; margin-right:2px; border:none; border-radius:6px; background:transparent; color:inherit; cursor:pointer; }
.dsm-crumb-back:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsm-main { position:relative; flex:1; min-height:0; display:flex; overflow:hidden; }
.dsm-scroll { flex:1; min-height:0; overflow:auto; padding:0 10px 10px; scrollbar-width:thin; }
.dsm-canvas { position:relative; border-radius:14px; min-width:100%; min-height:420px; background-color:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#f6f6f8) 60%, transparent); background-image:radial-gradient(circle, color-mix(in srgb, var(--dsw-alias-border-l2,#d0d0d8) 70%, transparent) 1px, transparent 1px); background-size:22px 22px; background-position:7px 7px; }
.dsm-item { position:absolute; width:88px; box-sizing:border-box; padding:5px 3px 6px; border-radius:10px; border:1px solid transparent; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:default; user-select:none; touch-action:none; }
.dsm-item:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 6%, transparent); }
.dsm-item:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsm-item[data-selected=true] { background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 13%, transparent); border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 42%, transparent); }
.dsm-item[data-dragging=true] { z-index:9; cursor:grabbing; opacity:.94; background:var(--dsw-alias-bg-layer-1,#fff); box-shadow:0 12px 26px rgba(0,0,0,.18); }
.dsm-item[data-drop=true] .dsm-glyph { outline:3px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:2px; }
.dsm-glyph { position:relative; display:flex; align-items:center; justify-content:center; width:54px; height:54px; border-radius:14px; }
.dsm-glyph[data-kind=file] { background:var(--dsw-alias-bg-layer-1,#f6f6f8); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsm-glyph[data-kind=folder] { background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 15%, var(--dsw-alias-bg-layer-1,#f6f6f8)); border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 30%, transparent); color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsm-badge { position:absolute; right:-5px; bottom:-5px; min-width:17px; height:17px; padding:0 4px; border-radius:9px; background:var(--dsw-alias-state-business-primary,#2f6fed); color:var(--dsw-alias-label-primary-foreground,#0f1115); font-size:10px; line-height:17px; font-weight:700; text-align:center; }
.dsm-label { font-size:11.5px; line-height:1.3; text-align:center; max-width:84px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; word-break:break-word; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsm-rename-input { width:82px; height:23px; padding:1px 3px; border-radius:6px; border:1px solid var(--dsw-alias-state-business-primary,#2f6fed); background:var(--dsw-alias-bg-base,#fff); color:inherit; font:inherit; font-size:11.5px; text-align:center; outline:none; }
.dsm-empty { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; padding:28px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-empty-icon { display:flex; align-items:center; justify-content:center; width:64px; height:64px; margin-bottom:2px; border-radius:18px; background:var(--dsw-alias-bg-layer-2,#f0f0f4); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-empty-title { margin:0; font-size:14px; font-weight:600; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsm-empty-hint { margin:0; max-width:380px; font-size:12px; line-height:1.6; }
.dsm-search-results { flex:1; min-height:0; overflow:auto; padding:0 18px 14px; }
.dsm-search-meta { padding:2px 2px 8px; font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-result { display:flex; align-items:center; gap:9px; width:100%; padding:8px 9px; border:none; border-radius:8px; background:transparent; color:inherit; font:inherit; text-align:left; cursor:pointer; }
.dsm-result:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsm-result-icon { flex:none; display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; background:var(--dsw-alias-bg-layer-1,#f6f6f8); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsm-result-text { min-width:0; display:flex; flex-direction:column; gap:1px; }
.dsm-result-name { font-size:12.5px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsm-result-path { font-size:10.5px; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsm-status { flex:none; display:flex; align-items:center; gap:8px; padding:5px 18px 9px; font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); flex-wrap:wrap; }
.dsm-status-dot { width:5px; height:5px; border-radius:50%; background:var(--dsw-alias-state-success-primary,#2e9e6b); flex:none; }
.dsm-status-warn { color:var(--dsw-alias-state-warn-primary,#b06a00); }
.dsm-menu { position:fixed; z-index:40; min-width:196px; max-width:264px; max-height:min(72vh,420px); overflow:auto; padding:5px; border-radius:10px; background:var(--dsw-alias-bg-layer-2,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 14px 36px rgba(0,0,0,.2); animation:dsm-pop .12s ease-out; }
.dsm-menu-title { padding:6px 9px 4px; font-size:11px; font-weight:700; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsm-menu-item { display:flex; align-items:center; gap:8px; width:100%; padding:7px 9px; border:none; border-radius:7px; background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12.5px; text-align:left; cursor:pointer; }
.dsm-menu-item:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsm-menu-item svg { flex:none; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-menu-item[data-danger] { color:var(--dsw-alias-state-error-primary,#c62f45); }
.dsm-menu-item[data-danger] svg { color:currentColor; }
.dsm-menu-item[data-current] { font-weight:600; }
.dsm-menu-sep { height:1px; margin:5px 4px; background:var(--dsw-alias-border-l1,#e4e4ea); }
.dsm-menu-heading { padding:7px 9px 3px; font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-menu-hint { padding:5px 9px 7px; font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); line-height:1.5; }
.dsm-preview { position:absolute; inset:0; z-index:30; display:flex; justify-content:flex-end; background:rgba(9,13,22,.26); animation:dsm-fade .14s ease-out; }
.dsm-preview-card { display:flex; flex-direction:column; width:min(660px,100%); height:100%; background:var(--dsw-alias-bg-layer-1,#fff); border-left:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:-18px 0 44px rgba(0,0,0,.18); animation:dsm-slide .18s ease-out; }
.dsm-preview-head { flex:none; display:flex; align-items:flex-start; gap:10px; padding:13px 14px 12px 18px; border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsm-preview-meta { min-width:0; flex:1; }
.dsm-preview-title { margin:0; font-size:15px; font-weight:650; line-height:1.35; word-break:break-word; }
.dsm-preview-path { margin-top:3px; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:10.5px; line-height:1.5; color:var(--dsw-alias-label-secondary,#6b6b76); word-break:break-all; }
.dsm-preview-tools { display:flex; align-items:center; gap:4px; flex:none; }
.dsm-preview-body { flex:1; min-height:0; overflow:auto; padding:18px 24px 48px; font-size:13.5px; line-height:1.72; }
.dsm-preview-note { margin-bottom:12px; padding:7px 10px; border-radius:8px; border:1px dashed var(--dsw-alias-border-l2,#d0d0d8); font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-preview-empty { padding:36px 8px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsm-preview-loading { padding:36px 8px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsm-preview-error { padding:20px; border-radius:10px; border:1px solid var(--dsw-alias-state-error-primary,#c62f45); color:var(--dsw-alias-state-error-primary,#c62f45); font-size:12.5px; line-height:1.6; }
.dsm-md-heading { margin:1.5em 0 .6em; line-height:1.3; font-weight:700; }
.dsm-md-heading:first-child { margin-top:0; }
.dsm-md-p { margin:.72em 0; }
.dsm-md-list { margin:.6em 0; padding-left:1.5em; }
.dsm-md-list li { margin:.22em 0; }
.dsm-md-pre { margin:.9em 0; padding:11px 13px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); background:var(--dsw-alias-bg-layer-2,#f0f0f4); overflow:auto; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12px; line-height:1.58; tab-size:2; }
.dsm-md-inline-code { padding:1px 5px; border-radius:5px; background:var(--dsw-alias-bg-layer-2,#f0f0f4); font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:.9em; }
.dsm-md-quote { margin:.8em 0; padding:2px 0 2px 12px; border-left:3px solid var(--dsw-alias-border-l2,#d0d0d8); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-md-hr { height:1px; margin:1.3em 0; border:none; background:var(--dsw-alias-border-l1,#e4e4ea); }
.dsm-md-link, .dsm-preview-body a { color:var(--dsw-alias-state-business-primary,#2f6fed); text-decoration:none; }
.dsm-preview-body a:hover { text-decoration:underline; }
.dsm-hidden-pop { position:absolute; z-index:35; top:54px; right:18px; width:min(340px,calc(100% - 36px)); max-height:60%; overflow:auto; padding:8px; border-radius:12px; background:var(--dsw-alias-bg-layer-2,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 16px 40px rgba(0,0,0,.2); animation:dsm-pop .12s ease-out; }
.dsm-hidden-head { display:flex; align-items:center; gap:8px; padding:4px 5px 8px; font-size:12px; font-weight:700; }
.dsm-hidden-head span { flex:1; }
.dsm-hidden-row { display:flex; align-items:center; gap:8px; padding:6px 6px; border-radius:7px; }
.dsm-hidden-row:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsm-hidden-name { flex:1; min-width:0; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsm-hidden-empty { padding:10px; text-align:center; font-size:12px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-modal { position:absolute; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(9,13,22,.36); animation:dsm-fade .12s ease-out; }
.dsm-modal-card { width:min(390px,100%); padding:18px; border-radius:14px; background:var(--dsw-alias-bg-layer-1,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 20px 50px rgba(0,0,0,.24); }
.dsm-modal-title { margin:0 0 8px; font-size:14.5px; font-weight:700; }
.dsm-modal-text { margin:0; font-size:12.5px; line-height:1.65; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsm-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
.dsm-btn[data-danger] { background:var(--dsw-alias-state-error-primary,#c62f45); border-color:transparent; color:#fff; font-weight:600; }
.dsm-btn[data-danger]:hover:not(:disabled) { background:var(--dsw-alias-state-error-primary,#c62f45); filter:brightness(1.06); }
.dsm-toast { position:absolute; left:50%; bottom:20px; z-index:60; transform:translateX(-50%); max-width:calc(100% - 40px); padding:7px 14px; border-radius:999px; background:rgba(18,23,33,.9); color:#fff; font-size:12px; line-height:1.4; text-align:center; pointer-events:none; animation:dsm-fade .15s ease-out; }
@keyframes dsm-spin { to { transform:rotate(360deg); } }
@keyframes dsm-fade { from { opacity:0; } to { opacity:1; } }
@keyframes dsm-pop { from { opacity:0; transform:translateY(-4px) scale(.985); } to { opacity:1; transform:none; } }
@keyframes dsm-slide { from { opacity:.6; transform:translateX(14px); } to { opacity:1; transform:none; } }
@media (max-width: 720px) {
  .dsm-sub { display:none; }
  .dsm-search input { width:120px; }
  .dsm-header { padding:12px 12px 6px; }
  .dsm-crumb { padding:0 12px 8px; }
  .dsm-scroll { padding:0 6px 8px; }
}
`

    /* ------------------------------------------------------------ component */

    function PanelPage() {
      const [scan, setScan] = useState({ status: 'loading', files: [], roots: [], truncated: false, partial: false, scannedAt: 0, error: null })
      const [layout, setLayout] = useState(loadLayout)
      const [currentFolder, setCurrentFolder] = useState(null)
      const [selected, setSelected] = useState(null)
      const [menu, setMenu] = useState(null)
      const [preview, setPreview] = useState(null)
      const [renaming, setRenaming] = useState(null)
      const [drag, setDrag] = useState(null)
      const [dropFolder, setDropFolder] = useState(null)
      const [hiddenOpen, setHiddenOpen] = useState(false)
      const [confirmState, setConfirmState] = useState(null)
      const [search, setSearch] = useState('')
      const [toast, setToast] = useState(null)

      const panelRef = useRef(null)
      const canvasRef = useRef(null)
      const dragRef = useRef(null)
      const requestRef = useRef(0)
      const renameRef = useRef(null)
      const toastTimer = useRef(0)
      const saveTimer = useRef(0)
      const previewAbort = useRef(null)
      const layoutRef = useRef(layout)
      layoutRef.current = layout

      const showToast = useCallback((text) => {
        window.clearTimeout(toastTimer.current)
        setToast(text)
        toastTimer.current = window.setTimeout(() => setToast(null), 2300)
      }, [])

      const loadFiles = useCallback(async (force) => {
        const token = (requestRef.current += 1)
        setScan((previous) => ({ ...previous, status: previous.status === 'ready' ? 'refreshing' : 'loading', error: null }))
        try {
          const response = await fetch(`${API_LIST}${force ? '?refresh=1' : ''}`, {
            headers: { accept: 'application/json' },
            credentials: 'same-origin',
          })
          const body = await response.json().catch(() => null)
          if (!response.ok) throw new Error(body && body.error ? body.error : `HTTP ${response.status}`)
          if (token !== requestRef.current) return
          setScan({
            status: 'ready',
            files: Array.isArray(body.files) ? body.files : [],
            roots: Array.isArray(body.roots) ? body.roots : [],
            truncated: Boolean(body.truncated),
            partial: Boolean(body.partial),
            scannedAt: body.scannedAt || Date.now(),
            error: null,
          })
        } catch (error) {
          if (token !== requestRef.current) return
          setScan((previous) => ({ ...previous, status: 'error', error: error && error.message ? error.message : String(error) }))
        }
      }, [])

      useEffect(() => {
        void loadFiles(false)
      }, [loadFiles])

      useEffect(() => {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = window.setTimeout(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
          } catch {
            /* storage may be unavailable in private contexts */
          }
        }, 220)
        return () => window.clearTimeout(saveTimer.current)
      }, [layout])

      useEffect(() => () => {
        window.clearTimeout(toastTimer.current)
        window.clearTimeout(saveTimer.current)
        try {
          previewAbort.current?.abort()
        } catch {
          /* ignore */
        }
      }, [])

      const fileByPath = useMemo(() => {
        const map = new Map()
        for (const file of scan.files) map.set(file.path, file)
        return map
      }, [scan.files])

      /* Assigns a free desktop slot to every newly discovered document. */
      useEffect(() => {
        if (scan.status !== 'ready' || scan.files.length === 0) return
        setLayout((previous) => {
          if (!scan.files.some((file) => !previous.items[file.path])) return previous
          const next = { ...previous, items: { ...previous.items } }
          const columns = columnsFor(canvasRef.current ? canvasRef.current.clientWidth : 960)
          for (const file of scan.files) {
            if (next.items[file.path]) continue
            const slot = gridSlot(next, null, columns)
            next.items[file.path] = { folderId: null, x: slot.x, y: slot.y, name: null }
          }
          return next
        })
      }, [scan.status, scan.files])

      /* -------------------------------------------------- derived entries */

      const entries = useMemo(() => {
        const result = []
        for (const folder of Object.values(layout.folders)) {
          if ((folder.parentId ?? null) !== currentFolder) continue
          result.push({
            kind: 'folder',
            key: folder.id,
            folder,
            x: folder.x,
            y: folder.y,
            name: folder.name,
            count: countChildren(layout, folder.id),
          })
        }
        for (const [path, item] of Object.entries(layout.items)) {
          if ((item.folderId ?? null) !== currentFolder) continue
          if (layout.hidden[path]) continue
          const meta = fileByPath.get(path)
          if (!meta) continue
          result.push({
            kind: 'file',
            key: path,
            item,
            meta,
            x: item.x,
            y: item.y,
            name: item.name || meta.name,
          })
        }
        return result
      }, [layout, currentFolder, fileByPath])

      const hiddenEntries = useMemo(() => {
        const result = []
        for (const path of Object.keys(layout.hidden)) {
          if (!layout.hidden[path]) continue
          const meta = fileByPath.get(path)
          result.push({ path, meta, name: meta ? meta.name : basename(path) })
        }
        return result
      }, [layout.hidden, fileByPath])

      const searchResults = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return []
        const result = []
        for (const [path, item] of Object.entries(layout.items)) {
          if (layout.hidden[path]) continue
          const meta = fileByPath.get(path)
          if (!meta) continue
          const label = item.name || meta.name
          if (label.toLowerCase().includes(query) || path.toLowerCase().includes(query)) result.push({ path, meta, label })
        }
        result.sort((a, b) => (b.meta.mtime || 0) - (a.meta.mtime || 0))
        return result.slice(0, 80)
      }, [search, layout.items, layout.hidden, fileByPath])

      const bounds = useMemo(() => {
        let maxX = 0
        let maxY = 0
        for (const entry of entries) {
          maxX = Math.max(maxX, entry.x + 96)
          maxY = Math.max(maxY, entry.y + 118)
        }
        if (drag) {
          maxX = Math.max(maxX, drag.x + 96)
          maxY = Math.max(maxY, drag.y + 118)
        }
        return { width: Math.max(320, maxX + PAD), height: Math.max(420, maxY + PAD) }
      }, [entries, drag])

      const chain = useMemo(() => folderChain(layout.folders, currentFolder), [layout.folders, currentFolder])

      /* ---------------------------------------------------------- actions */

      const commitRename = useCallback((raw) => {
        const pending = renameRef.current
        renameRef.current = null
        setRenaming(null)
        if (!pending) return
        const text = String(raw ?? '').trim().slice(0, 80)
        if (!text) return
        setLayout((previous) => {
          if (pending.kind === 'folder') {
            const folder = previous.folders[pending.key]
            if (!folder) return previous
            return { ...previous, folders: { ...previous.folders, [pending.key]: { ...folder, name: text } } }
          }
          const item = previous.items[pending.key]
          if (!item) return previous
          return { ...previous, items: { ...previous.items, [pending.key]: { ...item, name: text } } }
        })
      }, [])

      const startRename = useCallback((entry) => {
        const pending = { kind: entry.kind, key: entry.key }
        renameRef.current = pending
        setRenaming(pending)
        setMenu(null)
      }, [])

      const openEntry = useCallback((entry) => {
        if (entry.kind === 'folder') {
          setCurrentFolder(entry.key)
          setSelected(null)
          setMenu(null)
          return
        }
        setMenu(null)
        setPreview({ status: 'loading', path: entry.key, name: entry.name || (entry.meta && entry.meta.name) || basename(entry.key) })
        try {
          previewAbort.current?.abort()
        } catch {
          /* ignore */
        }
        const controller = new AbortController()
        previewAbort.current = controller
        fetch(`${API_READ}?path=${encodeURIComponent(entry.key)}`, { signal: controller.signal, credentials: 'same-origin' })
          .then(async (response) => {
            const body = await response.json().catch(() => null)
            if (!response.ok) throw new Error(body && body.error ? body.error : `HTTP ${response.status}`)
            setPreview({
              status: 'ready',
              path: body.path || entry.key,
              name: entry.name || body.name,
              content: body.content || '',
              size: body.size,
              mtime: body.mtime,
              truncated: Boolean(body.truncated),
            })
          })
          .catch((error) => {
            if (error && error.name === 'AbortError') return
            setPreview((previous) => (previous ? { ...previous, status: 'error', error: error && error.message ? error.message : String(error) } : previous))
          })
      }, [])

      const openFileByPath = useCallback((path) => {
        const meta = fileByPath.get(path)
        if (!meta) return
        const item = layout.items[path]
        openEntry({ kind: 'file', key: path, meta, name: (item && item.name) || meta.name })
      }, [fileByPath, layout.items, openEntry])

      const createFolder = useCallback(() => {
        const columns = columnsFor(canvasRef.current ? canvasRef.current.clientWidth : 960)
        const id = `f_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
        setLayout((previous) => {
          const slot = gridSlot(previous, currentFolder, columns)
          const name = uniqueFolderName(previous.folders, currentFolder, t('folder.defaultName'))
          return {
            ...previous,
            nextId: (previous.nextId || 1) + 1,
            folders: {
              ...previous.folders,
              [id]: { id, name, parentId: currentFolder, x: slot.x, y: slot.y },
            },
          }
        })
        const pending = { kind: 'folder', key: id }
        renameRef.current = pending
        setRenaming(pending)
        showToast(t('toast.folderCreated'))
      }, [currentFolder, showToast])

      const hideFile = useCallback((path) => {
        setLayout((previous) => ({ ...previous, hidden: { ...previous.hidden, [path]: true } }))
        setMenu(null)
        if (selected && selected.key === path) setSelected(null)
        showToast(t('toast.removed'))
      }, [selected, showToast])

      const restoreFile = useCallback((path) => {
        setLayout((previous) => {
          const hidden = { ...previous.hidden }
          delete hidden[path]
          return { ...previous, hidden }
        })
        showToast(t('toast.restored'))
      }, [showToast])

      const moveEntry = useCallback((entry, targetFolderId) => {
        const columns = columnsFor(canvasRef.current ? canvasRef.current.clientWidth : 960)
        setLayout((previous) => {
          if (entry.kind === 'folder') {
            if (!previous.folders[entry.key] || targetFolderId === entry.key) return previous
            if (descendantFolders(previous.folders, entry.key).has(targetFolderId)) return previous
            const slot = gridSlot(previous, targetFolderId, columns)
            return {
              ...previous,
              folders: {
                ...previous.folders,
                [entry.key]: { ...previous.folders[entry.key], parentId: targetFolderId, x: slot.x, y: slot.y },
              },
            }
          }
          if (!previous.items[entry.key]) return previous
          const slot = gridSlot(previous, targetFolderId, columns)
          return {
            ...previous,
            items: { ...previous.items, [entry.key]: { ...previous.items[entry.key], folderId: targetFolderId, x: slot.x, y: slot.y } },
          }
        })
        setMenu(null)
        showToast(t('toast.moved'))
      }, [showToast])

      const deleteFolder = useCallback((folderId) => {
        const columns = columnsFor(canvasRef.current ? canvasRef.current.clientWidth : 960)
        const folderBefore = layout.folders[folderId]
        const parentBefore = folderBefore ? folderBefore.parentId ?? null : null
        setLayout((previous) => {
          const folder = previous.folders[folderId]
          if (!folder) return previous
          const parentId = folder.parentId ?? null
          const scope = descendantFolders(previous.folders, folderId)
          const folders = { ...previous.folders }
          const items = { ...previous.items }
          for (const id of scope) delete folders[id]
          for (const [path, item] of Object.entries(items)) {
            if (!item.folderId || !scope.has(item.folderId)) continue
            const slot = gridSlot({ folders, items }, parentId, columns)
            items[path] = { ...item, folderId: parentId, x: slot.x, y: slot.y }
          }
          return { ...previous, folders, items }
        })
        if (currentFolder && descendantFolders(layout.folders, folderId).has(currentFolder)) setCurrentFolder(parentBefore)
        setConfirmState(null)
        setMenu(null)
        showToast(t('toast.folderDeleted'))
      }, [currentFolder, layout.folders, showToast])

      const requestDeleteFolder = useCallback((folder) => {
        const count = countFilesIn(layout.folders, layout.items, folder.id)
        setMenu(null)
        setConfirmState({
          title: t('confirm.deleteTitle'),
          message: count > 0 ? t('confirm.deleteWithFiles', { count }) : t('confirm.deleteEmpty'),
          confirmLabel: t('confirm.delete'),
          onConfirm: () => deleteFolder(folder.id),
        })
      }, [layout.folders, layout.items, deleteFolder])

      const tidyView = useCallback(() => {
        const columns = columnsFor(canvasRef.current ? canvasRef.current.clientWidth : 960)
        setLayout((previous) => {
          const folders = { ...previous.folders }
          const items = { ...previous.items }
          const orderedFolders = Object.values(previous.folders)
            .filter((folder) => (folder.parentId ?? null) === currentFolder)
            .sort((a, b) => a.name.localeCompare(b.name))
          const orderedFiles = Object.entries(previous.items)
            .filter(([path, item]) => (item.folderId ?? null) === currentFolder && !previous.hidden[path])
            .sort((a, b) => (a[1].name || a[0]).localeCompare(b[1].name || b[0]))
          let index = 0
          for (const folder of orderedFolders) {
            const column = index % columns
            const row = Math.floor(index / columns)
            folders[folder.id] = { ...folder, x: PAD + column * CELL_W, y: PAD + row * CELL_H }
            index += 1
          }
          for (const [path, item] of orderedFiles) {
            const column = index % columns
            const row = Math.floor(index / columns)
            items[path] = { ...item, x: PAD + column * CELL_W, y: PAD + row * CELL_H }
            index += 1
          }
          return { ...previous, folders, items }
        })
        showToast(t('toast.tidied'))
      }, [currentFolder, showToast])

      const copyPath = useCallback((path) => {
        const done = () => showToast(t('toast.copied'))
        const failed = () => showToast(t('toast.copyFailed'))
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(path).then(done).catch(failed)
            return
          }
        } catch {
          /* fall through */
        }
        failed()
      }, [showToast])

      /* ------------------------------------------------------------- drag */

      const onPointerDown = useCallback((event, entry) => {
        if (event.button !== 0 && event.pointerType === 'mouse') return
        if (renameRef.current) return
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          /* ignore */
        }
        dragRef.current = {
          kind: entry.kind,
          key: entry.key,
          startX: event.clientX,
          startY: event.clientY,
          originX: entry.x,
          originY: entry.y,
          moved: false,
        }
        setSelected({ kind: entry.kind, key: entry.key })
        setMenu(null)
      }, [])

      const onPointerMove = useCallback((event) => {
        const current = dragRef.current
        if (!current) return
        const dx = event.clientX - current.startX
        const dy = event.clientY - current.startY
        if (!current.moved && Math.hypot(dx, dy) < 4) return
        current.moved = true
        const x = Math.max(6, current.originX + dx)
        const y = Math.max(6, current.originY + dy)
        setDrag({ kind: current.kind, key: current.key, x, y })
        if (current.kind === 'file') {
          // Hit-test folder icons by their rectangles: elementFromPoint would
          // return the dragged icon itself, because it follows the pointer.
          let folderId = null
          try {
            for (const holder of document.querySelectorAll('[data-dsm-folder-id]')) {
              const rect = holder.getBoundingClientRect()
              if (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
              ) {
                folderId = holder.getAttribute('data-dsm-folder-id')
                break
              }
            }
          } catch {
            folderId = null
          }
          if (folderId !== dropFolder) setDropFolder(folderId)
        }
      }, [dropFolder])

      const onPointerUp = useCallback((event) => {
        const current = dragRef.current
        dragRef.current = null
        if (!current) return
        if (current.moved) {
          const dx = event.clientX - current.startX
          const dy = event.clientY - current.startY
          const x = Math.max(6, current.originX + dx)
          const y = Math.max(6, current.originY + dy)
          if (current.kind === 'file' && dropFolder && dropFolder !== currentFolder) {
            const columns = columnsFor(canvasRef.current ? canvasRef.current.clientWidth : 960)
            setLayout((previous) => {
              const item = previous.items[current.key]
              if (!item || !previous.folders[dropFolder]) return previous
              const slot = gridSlot(previous, dropFolder, columns)
              return { ...previous, items: { ...previous.items, [current.key]: { ...item, folderId: dropFolder, x: slot.x, y: slot.y } } }
            })
            showToast(t('toast.moved'))
          } else {
            setLayout((previous) => {
              if (current.kind === 'folder') {
                const folder = previous.folders[current.key]
                if (!folder) return previous
                return { ...previous, folders: { ...previous.folders, [current.key]: { ...folder, x, y } } }
              }
              const item = previous.items[current.key]
              if (!item) return previous
              return { ...previous, items: { ...previous.items, [current.key]: { ...item, x, y } } }
            })
          }
        }
        setDrag(null)
        setDropFolder(null)
      }, [dropFolder, currentFolder, showToast])

      /* ---------------------------------------------------------- effects */

      useEffect(() => {
        if (!menu) return undefined
        const onDown = (event) => {
          const target = event.target
          if (target && target.closest && target.closest('.dsm-menu')) return
          setMenu(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        return () => document.removeEventListener('pointerdown', onDown, true)
      }, [menu])

      useEffect(() => {
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          if (menu) {
            setMenu(null)
            return
          }
          if (renaming) {
            renameRef.current = null
            setRenaming(null)
            return
          }
          if (confirmState) {
            setConfirmState(null)
            return
          }
          if (hiddenOpen) {
            setHiddenOpen(false)
            return
          }
          if (preview) setPreview(null)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [menu, renaming, confirmState, hiddenOpen, preview])

      useEffect(() => {
        return () => {
          try {
            previewAbort.current?.abort()
          } catch {
            /* ignore */
          }
        }
      }, [])

      /* ------------------------------------------------------------ render */

      const showSearch = search.trim() !== ''
      const visibleCount = scan.files.length
      const subtitle = visibleCount > 0 ? t('panel.subtitle', { count: visibleCount }) : t('panel.subtitleEmpty')

      const contextEntry = useMemo(() => {
        if (!menu) return null
        return entries.find((entry) => entry.kind === menu.kind && entry.key === menu.key) || null
      }, [menu, entries])

      const menuFolders = useMemo(() => {
        if (!contextEntry) return []
        const blocked = contextEntry.kind === 'folder' ? descendantFolders(layout.folders, contextEntry.key) : new Set()
        const items = []
        if (currentFolder) items.push({ id: null, name: t('menu.root') })
        for (const folder of Object.values(layout.folders).sort((a, b) => a.name.localeCompare(b.name))) {
          if (folder.id === currentFolder) continue
          if (blocked.has(folder.id)) continue
          items.push({ id: folder.id, name: folder.name })
        }
        return items
      }, [contextEntry, layout.folders, currentFolder])

      const renderEntry = (entry) => {
        const isDragging = drag && drag.kind === entry.kind && drag.key === entry.key
        const x = isDragging ? drag.x : entry.x
        const y = isDragging ? drag.y : entry.y
        const isSelected = selected && selected.kind === entry.kind && selected.key === entry.key
        const isDropTarget = entry.kind === 'folder' && dropFolder === entry.key
        const isRenaming = renaming && renaming.kind === entry.kind && renaming.key === entry.key
        const folderAttrs = entry.kind === 'folder' ? { 'data-dsm-folder-id': entry.key } : {}
        return h(
          'div',
          {
            key: `${entry.kind}:${entry.key}`,
            className: 'dsm-item',
            role: 'button',
            tabIndex: 0,
            style: { left: `${x}px`, top: `${y}px` },
            title: entry.kind === 'file' ? entry.key : entry.name,
            'data-selected': isSelected ? 'true' : 'false',
            'data-dragging': isDragging ? 'true' : 'false',
            'data-drop': isDropTarget ? 'true' : 'false',
            ...folderAttrs,
            onPointerDown: (event) => onPointerDown(event, entry),
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
            onDoubleClick: () => openEntry(entry),
            onContextMenu: (event) => {
              event.preventDefault()
              const width = 250
              const height = 340
              const left = Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8))
              const top = Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8))
              setSelected({ kind: entry.kind, key: entry.key })
              setMenu({
                kind: entry.kind,
                key: entry.key,
                x: left,
                y: top,
              })
            },
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                openEntry(entry)
              } else if (event.key === 'F2') {
                event.preventDefault()
                startRename(entry)
              } else if (event.key === 'Delete' && entry.kind === 'file') {
                event.preventDefault()
                hideFile(entry.key)
              }
            },
          },
          h(
            'div',
            { className: 'dsm-glyph', 'data-kind': entry.kind },
            icon(entry.kind === 'folder' ? 'folder' : 'doc', entry.kind === 'folder' ? 30 : 30),
            entry.kind === 'folder' && entry.count > 0 ? h('span', { className: 'dsm-badge' }, entry.count > 99 ? '99+' : String(entry.count)) : null,
          ),
          isRenaming
            ? h('input', {
                className: 'dsm-rename-input',
                defaultValue: entry.name,
                autoFocus: true,
                spellCheck: false,
                onFocus: (event) => event.currentTarget.select(),
                onPointerDown: (event) => event.stopPropagation(),
                onClick: (event) => event.stopPropagation(),
                onDoubleClick: (event) => event.stopPropagation(),
                onBlur: (event) => commitRename(event.currentTarget.value),
                onKeyDown: (event) => {
                  event.stopPropagation()
                  if (event.key === 'Enter') commitRename(event.currentTarget.value)
                  else if (event.key === 'Escape') {
                    renameRef.current = null
                    setRenaming(null)
                  }
                },
              })
            : h('div', { className: 'dsm-label' }, entry.name),
        )
      }

      return h(
        'div',
        { className: 'dsm-panel', ref: panelRef },
        h(
          'div',
          { className: 'dsm-header' },
          h('div', { className: 'dsm-heading' }, h('h2', { className: 'dsm-title' }, t('panel.title')), h('div', { className: 'dsm-sub' }, subtitle)),
          h(
            'div',
            { className: 'dsm-actions' },
            h(
              'div',
              { className: 'dsm-search' },
              icon('search', 13),
              h('input', {
                value: search,
                placeholder: t('search.placeholder'),
                'aria-label': t('search.placeholder'),
                spellCheck: false,
                onChange: (event) => setSearch(event.currentTarget.value),
              }),
            ),
            h(
              'button',
              { className: 'dsm-btn', type: 'button', 'data-primary': true, onClick: createFolder, title: t('action.newFolder') },
              icon('folder-plus', 14),
              h('span', null, t('action.newFolder')),
            ),
            h(
              'button',
              { className: 'dsm-btn', type: 'button', 'data-quiet': true, onClick: tidyView, title: t('action.tidy'), 'aria-label': t('action.tidy') },
              icon('tidy', 15),
            ),
            h(
              'button',
              {
                className: 'dsm-btn',
                type: 'button',
                'data-quiet': true,
                onClick: () => void loadFiles(true),
                title: t('action.refresh'),
                'aria-label': t('action.refresh'),
                disabled: scan.status === 'loading' || scan.status === 'refreshing',
                'data-spin': scan.status === 'loading' || scan.status === 'refreshing' ? 'true' : 'false',
              },
              icon('refresh', 15),
            ),
            hiddenEntries.length > 0
              ? h(
                  'button',
                  {
                    className: 'dsm-btn',
                    type: 'button',
                    'data-quiet': true,
                    'aria-pressed': hiddenOpen ? 'true' : 'false',
                    onClick: () => setHiddenOpen((open) => !open),
                    title: t('action.hidden', { count: hiddenEntries.length }),
                  },
                  icon('eye-off', 15),
                  h('span', null, t('action.hidden', { count: hiddenEntries.length })),
                )
              : null,
          ),
        ),
        h(
          'div',
          { className: 'dsm-crumb' },
          currentFolder
            ? h(
                'button',
                {
                  className: 'dsm-crumb-back',
                  type: 'button',
                  title: t('action.back'),
                  'aria-label': t('action.back'),
                  onClick: () => {
                    const folder = layout.folders[currentFolder]
                    setCurrentFolder(folder ? folder.parentId ?? null : null)
                    setSelected(null)
                  },
                },
                icon('back', 14),
              )
            : null,
          h(
            'button',
            {
              className: 'dsm-crumb-btn',
              type: 'button',
              onClick: () => {
                setCurrentFolder(null)
                setSelected(null)
              },
            },
            t('folder.root'),
          ),
          chain.map((folder, index) =>
            h(
              React.Fragment,
              { key: folder.id },
              h('span', { className: 'dsm-crumb-sep' }, '/'),
              index === chain.length - 1
                ? h('span', { className: 'dsm-crumb-current' }, folder.name)
                : h(
                    'button',
                    {
                      className: 'dsm-crumb-btn',
                      type: 'button',
                      onClick: () => {
                        setCurrentFolder(folder.id)
                        setSelected(null)
                      },
                    },
                    folder.name,
                  ),
            ),
          ),
        ),
        showSearch
          ? h(
              'div',
              { className: 'dsm-search-results' },
              h('div', { className: 'dsm-search-meta' }, searchResults.length > 0 ? t('search.resultCount', { count: searchResults.length }) : t('search.noResults')),
              searchResults.map((result) =>
                h(
                  'button',
                  { key: result.path, className: 'dsm-result', type: 'button', onClick: () => openFileByPath(result.path) },
                  h('span', { className: 'dsm-result-icon' }, icon('doc', 17)),
                  h(
                    'span',
                    { className: 'dsm-result-text' },
                    h('span', { className: 'dsm-result-name' }, result.label),
                    h('span', { className: 'dsm-result-path' }, result.meta.rel || result.path),
                  ),
                ),
              ),
            )
          : h(
              'div',
              { className: 'dsm-main' },
              h(
                'div',
                { className: 'dsm-scroll' },
                h(
                  'div',
                  {
                    className: 'dsm-canvas',
                    ref: canvasRef,
                    style: { width: `${bounds.width}px`, height: `${bounds.height}px` },
                    onPointerMove,
                    onPointerUp: onPointerUp,
                    onPointerCancel: onPointerUp,
                    onClick: (event) => {
                      if (event.target === event.currentTarget) {
                        setSelected(null)
                        setMenu(null)
                      }
                    },
                  },
                  entries.map(renderEntry),
                  entries.length === 0
                    ? h(
                        'div',
                        { className: 'dsm-empty' },
                        h('div', { className: 'dsm-empty-icon' }, icon('folder', 30)),
                        h('p', { className: 'dsm-empty-title' }, currentFolder ? t('empty.folderTitle') : t('empty.title')),
                        h('p', { className: 'dsm-empty-hint' }, currentFolder ? t('empty.folderHint') : t('empty.hint')),
                        !currentFolder
                          ? h(
                              'button',
                              { className: 'dsm-btn', type: 'button', onClick: () => void loadFiles(true) },
                              icon('refresh', 14),
                              h('span', null, t('action.retry')),
                            )
                          : null,
                      )
                    : null,
                ),
              ),
            ),
        scan.status === 'error'
          ? h(
              'div',
              { className: 'dsm-status' },
              h('span', { className: 'dsm-status-dot', style: { background: 'var(--dsw-alias-state-error-primary,#c62f45)' } }),
              h('span', null, t('error.load', { reason: scan.error || 'unknown' })),
              h(
                'button',
                { className: 'dsm-btn', type: 'button', onClick: () => void loadFiles(true) },
                h('span', null, t('action.retry')),
              ),
            )
          : h(
              'div',
              { className: 'dsm-status' },
              h('span', { className: 'dsm-status-dot' }),
              h('span', null, t('status.files', { count: scan.files.length })),
              h('span', null, '·'),
              h('span', null, t('status.roots', { count: scan.roots.length })),
              scan.scannedAt ? h('span', null, '·') : null,
              scan.scannedAt ? h('span', null, t('status.scanned', { time: formatTime(scan.scannedAt) })) : null,
              scan.truncated || scan.partial
                ? h('span', { className: 'dsm-status-warn' }, '· ' + t(scan.truncated ? 'status.truncated' : 'status.partial'))
                : null,
            ),
        hiddenOpen && hiddenEntries.length > 0
          ? h(
              'div',
              { className: 'dsm-hidden-pop' },
              h(
                'div',
                { className: 'dsm-hidden-head' },
                h('span', null, t('action.hidden', { count: hiddenEntries.length })),
                h(
                  'button',
                  { className: 'dsm-btn', type: 'button', 'data-quiet': true, onClick: () => setHiddenOpen(false), title: t('action.close'), 'aria-label': t('action.close') },
                  icon('close', 13),
                ),
              ),
              hiddenEntries.map((entry) =>
                h(
                  'div',
                  { key: entry.path, className: 'dsm-hidden-row' },
                  h('span', { className: 'dsm-hidden-name', title: entry.path }, entry.name),
                  h(
                    'button',
                    { className: 'dsm-btn', type: 'button', onClick: () => restoreFile(entry.path), title: t('action.restore') },
                    icon('restore', 13),
                    h('span', null, t('action.restore')),
                  ),
                ),
              ),
            )
          : null,
        menu && contextEntry
          ? h(
              'div',
              { className: 'dsm-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, role: 'menu' },
              h('div', { className: 'dsm-menu-title', title: contextEntry.name }, contextEntry.name),
              h(
                'button',
                { className: 'dsm-menu-item', type: 'button', role: 'menuitem', onClick: () => openEntry(contextEntry) },
                icon(contextEntry.kind === 'folder' ? 'folder' : 'doc', 14),
                h('span', null, t('action.open')),
              ),
              h(
                'button',
                { className: 'dsm-menu-item', type: 'button', role: 'menuitem', onClick: () => startRename(contextEntry) },
                icon('tidy', 14),
                h('span', null, t('action.rename')),
              ),
              contextEntry.kind === 'file'
                ? h(
                    'button',
                    { className: 'dsm-menu-item', type: 'button', role: 'menuitem', onClick: () => copyPath(contextEntry.key) },
                    icon('copy', 14),
                    h('span', null, t('action.copyPath')),
                  )
                : null,
              h('div', { className: 'dsm-menu-sep' }),
              h('div', { className: 'dsm-menu-heading' }, t('menu.separator')),
              menuFolders.length === 0
                ? h('div', { className: 'dsm-menu-hint' }, t('menu.moveHint'))
                : menuFolders.map((folder) =>
                    h(
                      'button',
                      {
                        key: folder.id || 'root',
                        className: 'dsm-menu-item',
                        type: 'button',
                        role: 'menuitem',
                        'data-current': folder.id === currentFolder ? 'true' : 'false',
                        onClick: () => moveEntry(contextEntry, folder.id),
                      },
                      icon('folder', 14),
                      h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, folder.name),
                    ),
                  ),
              h('div', { className: 'dsm-menu-sep' }),
              contextEntry.kind === 'file'
                ? h(
                    'button',
                    { className: 'dsm-menu-item', type: 'button', role: 'menuitem', 'data-danger': true, onClick: () => hideFile(contextEntry.key) },
                    icon('eye-off', 14),
                    h('span', null, t('action.remove')),
                  )
                : h(
                    'button',
                    { className: 'dsm-menu-item', type: 'button', role: 'menuitem', 'data-danger': true, onClick: () => requestDeleteFolder(contextEntry.folder) },
                    icon('trash', 14),
                    h('span', null, t('action.deleteFolder')),
                  ),
            )
          : null,
        preview
          ? h(
              'div',
              { className: 'dsm-preview', role: 'dialog', 'aria-modal': false, 'aria-label': preview.name || t('panel.title'), onPointerDown: (event) => { if (event.target === event.currentTarget) setPreview(null) } },
              h(
                'div',
                { className: 'dsm-preview-card' },
                h(
                  'div',
                  { className: 'dsm-preview-head' },
                  h(
                    'div',
                    { className: 'dsm-preview-meta' },
                    h('h3', { className: 'dsm-preview-title' }, preview.name || basename(preview.path)),
                    h('div', { className: 'dsm-preview-path' }, preview.path),
                  ),
                  h(
                    'div',
                    { className: 'dsm-preview-tools' },
                    h(
                      'button',
                      { className: 'dsm-btn', type: 'button', 'data-quiet': true, onClick: () => copyPath(preview.path), title: t('action.copyPath'), 'aria-label': t('action.copyPath') },
                      icon('copy', 15),
                    ),
                    h(
                      'button',
                      { className: 'dsm-btn', type: 'button', 'data-quiet': true, onClick: () => setPreview(null), title: t('action.close'), 'aria-label': t('action.close') },
                      icon('close', 15),
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'dsm-preview-body' },
                  preview.status === 'loading' ? h('div', { className: 'dsm-preview-loading' }, t('preview.loading')) : null,
                  preview.status === 'error'
                    ? h('div', { className: 'dsm-preview-error' }, t('error.read', { reason: preview.error || 'unknown' }))
                    : null,
                  preview.status === 'ready'
                    ? [
                        preview.truncated ? h('div', { key: 'note', className: 'dsm-preview-note' }, t('preview.truncated')) : null,
                        preview.content.trim() === ''
                          ? h('div', { key: 'empty', className: 'dsm-preview-empty' }, t('preview.empty'))
                          : h('div', { key: 'md' }, renderMarkdown(preview.content, 'preview')),
                      ]
                    : null,
                ),
              ),
            )
          : null,
        confirmState
          ? h(
              'div',
              { className: 'dsm-modal' },
              h(
                'div',
                { className: 'dsm-modal-card' },
                h('h3', { className: 'dsm-modal-title' }, confirmState.title),
                h('p', { className: 'dsm-modal-text' }, confirmState.message),
                h(
                  'div',
                  { className: 'dsm-modal-actions' },
                  h(
                    'button',
                    { className: 'dsm-btn', type: 'button', onClick: () => setConfirmState(null) },
                    h('span', null, t('confirm.cancel')),
                  ),
                  h(
                    'button',
                    { className: 'dsm-btn', type: 'button', 'data-danger': true, onClick: () => confirmState.onConfirm() },
                    h('span', null, t('confirm.delete')),
                  ),
                ),
              ),
            )
          : null,
        toast ? h('div', { className: 'dsm-toast' }, toast) : null,
      )
    }

    /* ---------------------------------------------------------------- apply */

    return {
      inject: ['slots'],
      apply(ctx) {
        const disposers = []
        const locale = (() => {
          try {
            return ctx.get('locale', false)
          } catch {
            return undefined
          }
        })()
        if (locale && typeof locale.register === 'function') {
          ctx.effect(() => {
            try {
              return locale.register(NS, { zh: ZH, en: EN })
            } catch {
              return () => {}
            }
          })
          try {
            const bound = locale.bind ? locale.bind(NS) : undefined
            if (typeof bound === 'function') translate = bound
          } catch {
            translate = undefined
          }
        }

        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-docdesk'
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        })

        disposers.push(
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: PANEL_ID,
                order: 5,
                label: () => t('panel.title'),
              },
              PanelIcon,
            ),
          ),
        )
        disposers.push(
          ctx.slots.inject('main', () =>
            ctx.slots.register(
              {
                name: 'main',
                key: PANEL_ID,
              },
              PanelPage,
            ),
          ),
        )

        ctx.effect(() => () => {
          for (const dispose of disposers.splice(0)) {
            try {
              dispose()
            } catch {
              /* ignore */
            }
          }
        })
      },
    }
  },
})
