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
    const API_RESOLVE = '/api/dsh-docdesk/resolve'
    const STORAGE_KEY = 'dsh-docdesk.library.v2'
    const ICON_W = 88
    const ICON_H = 104
    const ICON_CENTER_Y = 44
    const CELL_W = 96
    const CELL_H = 104
    const PAD = 10

    /* ------------------------------------------------------------- locale */

    const ZH = {
      'panel.title': '资料区',
      'tab.home': '资料区',
      'action.add': '添加文件',
      'action.addShort': '添加',
      'action.newFolder': '新建文件夹',
      'action.open': '打开',
      'action.rename': '重命名',
      'action.copyPath': '复制路径',
      'action.remove': '从资料区移除',
      'action.deleteFolder': '删除文件夹',
      'action.moveTo': '移动到文件夹',
      'action.back': '返回上一级',
      'action.close': '关闭',
      'action.cancel': '取消',
      'action.retry': '重试',
      'action.selectAll': '全选',
      'action.clearSelection': '清空',
      'action.addSelected': '加入所选',
      'action.refresh': '刷新',
      'action.refreshContent': '重新读取',
      'empty.title': '资料区还是空的',
      'empty.hint': '点右上角「添加文件」从工作区选择 Markdown 文档；以后生成的文件也可以在文件卡片上右键，选择「放入资料区」。',
      'empty.folderTitle': '这个文件夹还是空的',
      'empty.folderHint': '把文档拖到文件夹图标上，或右键文件选择「移动到文件夹」。',
      'folder.defaultName': '新建文件夹',
      'folder.root': '资料区',
      'folder.count': '{count} 项',
      'picker.title': '添加文件',
      'picker.subtitle': '从工作区选择要放进资料区的 Markdown',
      'picker.search': '搜索文件',
      'picker.empty': '没有可添加的 Markdown 文件',
      'picker.loading': '正在扫描工作区…',
      'picker.failed': '扫描失败：{reason}',
      'picker.added': '已加入',
      'picker.selected': '已选 {count} 个',
      'picker.roots': '{count} 个目录',
      'picker.partial': '部分目录未扫描完',
      'tab.close': '关闭标签页',
      'doc.loading': '正在读取…',
      'doc.failed': '读取失败：{reason}',
      'doc.empty': '这个文件是空的',
      'doc.truncated': '文件较大，仅显示前 2 MB',
      'status.count': '{count} 个文档',
      'toast.added': '已加入 {count} 个文档',
      'toast.already': '这些文档已经在资料区了',
      'toast.removed': '已从资料区移除',
      'toast.copied': '路径已复制',
      'toast.copyFailed': '复制失败，请手动选择路径',
      'toast.folderCreated': '已新建文件夹',
      'toast.folderDeleted': '已删除文件夹',
      'toast.moved': '已移动',
      'context.addToLibrary': '放入资料区',
      'context.resolving': '正在加入…',
      'context.added': '已在资料区',
      'context.failed': '加入失败',
      'context.notMarkdown': '仅支持 Markdown 文件',
      'menu.moveHint': '当前没有其他文件夹',
      'menu.root': '资料区（根目录）',
      'menu.separator': '移动到',
      'confirm.deleteTitle': '删除文件夹？',
      'confirm.deleteWithFiles': '文件夹里的 {count} 个文档会移回上一级，磁盘上的文件不会被删除。',
      'confirm.deleteEmpty': '这个文件夹是空的，删除后无法恢复。',
      'confirm.delete': '删除',
      'error.load': '扫描失败：{reason}',
      'error.read': '读取失败：{reason}',
      'error.forbidden': '无法访问（仅本机可用）',
      'error.outside': '文件不在可访问的目录内',
      'error.notFound': '文件不存在',
      'error.notMarkdown': '不是 Markdown 文件',
      'sidebar.toggle': '隐藏 / 显示侧边栏',
    }

    const EN = {
      'panel.title': 'Materials',
      'tab.home': 'Materials',
      'action.add': 'Add files',
      'action.addShort': 'Add',
      'action.newFolder': 'New folder',
      'action.open': 'Open',
      'action.rename': 'Rename',
      'action.copyPath': 'Copy path',
      'action.remove': 'Remove from library',
      'action.deleteFolder': 'Delete folder',
      'action.moveTo': 'Move to folder',
      'action.back': 'Back',
      'action.close': 'Close',
      'action.cancel': 'Cancel',
      'action.retry': 'Retry',
      'action.selectAll': 'Select all',
      'action.clearSelection': 'Clear',
      'action.addSelected': 'Add selected',
      'action.refresh': 'Refresh',
      'action.refreshContent': 'Reload',
      'empty.title': 'Your library is empty',
      'empty.hint': 'Use “Add files” in the top-right to pick Markdown documents from your workspaces. Generated files can also be right-clicked on their file card and added with “Add to library”.',
      'empty.folderTitle': 'This folder is empty',
      'empty.folderHint': 'Drag a document onto a folder icon, or right-click it and choose “Move to folder”.',
      'folder.defaultName': 'New folder',
      'folder.root': 'Materials',
      'folder.count': '{count} items',
      'picker.title': 'Add files',
      'picker.subtitle': 'Pick Markdown documents from your workspaces',
      'picker.search': 'Search files',
      'picker.empty': 'No Markdown files to add',
      'picker.loading': 'Scanning workspaces…',
      'picker.failed': 'Scan failed: {reason}',
      'picker.added': 'Added',
      'picker.selected': '{count} selected',
      'picker.roots': '{count} directories',
      'picker.partial': 'Some directories were not scanned',
      'tab.close': 'Close tab',
      'doc.loading': 'Reading…',
      'doc.failed': 'Read failed: {reason}',
      'doc.empty': 'This file is empty',
      'doc.truncated': 'Large file: showing the first 2 MB',
      'status.count': '{count} documents',
      'toast.added': '{count} documents added',
      'toast.already': 'Those documents are already in the library',
      'toast.removed': 'Removed from the library',
      'toast.copied': 'Path copied',
      'toast.copyFailed': 'Copy failed; select the path manually',
      'toast.folderCreated': 'Folder created',
      'toast.folderDeleted': 'Folder deleted',
      'toast.moved': 'Moved',
      'context.addToLibrary': 'Add to library',
      'context.resolving': 'Adding…',
      'context.added': 'In the library',
      'context.failed': 'Could not add',
      'context.notMarkdown': 'Only Markdown files are supported',
      'menu.moveHint': 'No other folders yet',
      'menu.root': 'Materials (root)',
      'menu.separator': 'Move to',
      'confirm.deleteTitle': 'Delete folder?',
      'confirm.deleteWithFiles': '{count} document(s) move back to the parent folder. Files on disk are not deleted.',
      'confirm.deleteEmpty': 'This folder is empty. Deleting it cannot be undone.',
      'confirm.delete': 'Delete',
      'error.load': 'Scan failed: {reason}',
      'error.read': 'Read failed: {reason}',
      'error.forbidden': 'Access denied (loopback only)',
      'error.outside': 'The file is outside the readable folders',
      'error.notFound': 'File not found',
      'error.notMarkdown': 'Not a Markdown file',
      'sidebar.toggle': 'Hide / show sidebar',
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
          /* fall back to the built-in dictionary */
        }
      }
      let text = (detectZh() ? ZH : EN)[key] ?? EN[key] ?? key
      if (values) for (const [name, value] of Object.entries(values)) text = text.split(`{${name}}`).join(String(value))
      return text
    }

    /* -------------------------------------------------------------- store */

    function basename(value) {
      if (typeof value !== 'string') return ''
      const parts = value.split(/[\\/]/u)
      return parts[parts.length - 1] || value
    }

    function emptyLibrary() {
      return { version: 2, folders: {}, items: {}, openTabs: [], activeTab: 'home' }
    }

    function loadLibrary() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return emptyLibrary()
        const parsed = JSON.parse(raw)
        if (!parsed || parsed.version !== 2) return emptyLibrary()
        const folders = {}
        for (const [id, value] of Object.entries(parsed.folders || {})) {
          if (typeof id !== 'string' || !value || typeof value.name !== 'string') continue
          folders[id] = {
            id,
            name: value.name.trim().slice(0, 80) || t('folder.defaultName'),
            parentId: null,
            x: Number.isFinite(value.x) ? value.x : null,
            y: Number.isFinite(value.y) ? value.y : null,
          }
        }
        for (const [id, value] of Object.entries(parsed.folders || {})) {
          const parent = value && typeof value.parentId === 'string' ? value.parentId : null
          if (parent && parent !== id && folders[parent]) folders[id].parentId = parent
        }
        const items = {}
        for (const [path, value] of Object.entries(parsed.items || {})) {
          if (typeof path !== 'string' || !value || typeof value.path !== 'string') continue
          if (path !== value.path) continue
          items[path] = {
            path,
            name: typeof value.name === 'string' && value.name.trim() !== '' ? value.name.trim().slice(0, 80) : basename(path),
            folderId: typeof value.folderId === 'string' && folders[value.folderId] ? value.folderId : null,
            x: Number.isFinite(value.x) ? value.x : null,
            y: Number.isFinite(value.y) ? value.y : null,
            addedAt: Number.isFinite(value.addedAt) ? value.addedAt : Date.now(),
          }
        }
        const seen = new Set()
        const openTabs = []
        for (const path of Array.isArray(parsed.openTabs) ? parsed.openTabs : []) {
          if (typeof path !== 'string' || !items[path] || seen.has(path)) continue
          seen.add(path)
          openTabs.push(path)
        }
        let activeTab = parsed.activeTab
        if (activeTab !== 'home' && (!items[activeTab] || !seen.has(activeTab))) activeTab = openTabs[0] || 'home'
        return { version: 2, folders, items, openTabs, activeTab }
      } catch {
        return emptyLibrary()
      }
    }

    function createLibraryStore() {
      let state = loadLibrary()
      const listeners = new Set()
      const save = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
          /* storage may be unavailable */
        }
      }
      const emit = () => {
        for (const listener of [...listeners]) {
          try {
            listener()
          } catch {
            /* a bad subscriber must not break the store */
          }
        }
      }
      const set = (next) => {
        state = next
        save()
        emit()
        return state
      }
      const update = (mutator) => {
        const next = mutator(state)
        return next && next !== state ? set(next) : state
      }
      return {
        getState: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        addFiles(files, folderId = null) {
          const candidates = (Array.isArray(files) ? files : []).filter((file) => file && typeof file.path === 'string' && !state.items[file.path])
          if (candidates.length === 0) return 0
          update((previous) => {
            const items = { ...previous.items }
            for (const file of candidates) {
              items[file.path] = {
                path: file.path,
                name: String(file.name || basename(file.path)).trim().slice(0, 80) || basename(file.path),
                folderId: folderId ?? null,
                x: null,
                y: null,
                addedAt: Date.now(),
              }
            }
            return { ...previous, items }
          })
          return candidates.length
        },
        removeItem(path) {
          update((previous) => {
            if (!previous.items[path]) return previous
            const items = { ...previous.items }
            delete items[path]
            const openTabs = previous.openTabs.filter((entry) => entry !== path)
            const activeTab = previous.activeTab === path ? openTabs[openTabs.length - 1] || 'home' : previous.activeTab
            return { ...previous, items, openTabs, activeTab }
          })
        },
        addFolder(name, parentId = null) {
          const id = `f_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
          update((previous) => ({
            ...previous,
            folders: {
              ...previous.folders,
              [id]: { id, name: String(name || t('folder.defaultName')).trim().slice(0, 80), parentId: parentId ?? null, x: null, y: null },
            },
          }))
          return id
        },
        removeFolder(id) {
          let parentId = null
          update((previous) => {
            const folder = previous.folders[id]
            if (!folder) return previous
            parentId = folder.parentId ?? null
            const scope = descendantFolders(previous.folders, id)
            const folders = { ...previous.folders }
            for (const folderId of scope) delete folders[folderId]
            const items = { ...previous.items }
            for (const [path, item] of Object.entries(items)) {
              if (item.folderId && scope.has(item.folderId)) items[path] = { ...item, folderId: parentId, x: null, y: null }
            }
            return { ...previous, folders, items }
          })
          return parentId
        },
        rename(kind, id, name) {
          const text = String(name || '').trim().slice(0, 80)
          if (!text) return
          update((previous) => {
            if (kind === 'folder') {
              const folder = previous.folders[id]
              if (!folder) return previous
              return { ...previous, folders: { ...previous.folders, [id]: { ...folder, name: text } } }
            }
            const item = previous.items[id]
            if (!item) return previous
            return { ...previous, items: { ...previous.items, [id]: { ...item, name: text } } }
          })
        },
        move(kind, id, targetFolderId) {
          update((previous) => {
            if (kind === 'folder') {
              const folder = previous.folders[id]
              if (!folder) return previous
              if (targetFolderId === id) return previous
              if (descendantFolders(previous.folders, id).has(targetFolderId)) return previous
              return { ...previous, folders: { ...previous.folders, [id]: { ...folder, parentId: targetFolderId ?? null, x: null, y: null } } }
            }
            const item = previous.items[id]
            if (!item) return previous
            return { ...previous, items: { ...previous.items, [id]: { ...item, folderId: targetFolderId ?? null, x: null, y: null } } }
          })
        },
        setPositions(updates) {
          if (!Array.isArray(updates) || updates.length === 0) return
          update((previous) => {
            const items = { ...previous.items }
            const folders = { ...previous.folders }
            for (const updateItem of updates) {
              if (!updateItem) continue
              if (updateItem.kind === 'folder' && folders[updateItem.id]) folders[updateItem.id] = { ...folders[updateItem.id], x: updateItem.x, y: updateItem.y }
              if (updateItem.kind === 'file' && items[updateItem.id]) items[updateItem.id] = { ...items[updateItem.id], x: updateItem.x, y: updateItem.y }
            }
            return { ...previous, items, folders }
          })
        },
        openDoc(path) {
          update((previous) => {
            if (!previous.items[path]) return previous
            const openTabs = previous.openTabs.includes(path) ? previous.openTabs : [...previous.openTabs, path]
            return { ...previous, openTabs, activeTab: path }
          })
        },
        setActive(tab) {
          update((previous) => {
            if (tab === 'home') return previous.activeTab === 'home' ? previous : { ...previous, activeTab: 'home' }
            if (!previous.items[tab] || !previous.openTabs.includes(tab)) return previous
            return previous.activeTab === tab ? previous : { ...previous, activeTab: tab }
          })
        },
        closeTab(path) {
          update((previous) => {
            const index = previous.openTabs.indexOf(path)
            if (index < 0) return previous
            const openTabs = previous.openTabs.filter((entry) => entry !== path)
            let activeTab = previous.activeTab
            if (previous.activeTab === path) activeTab = openTabs[Math.max(0, index - 1)] || openTabs[0] || 'home'
            return { ...previous, openTabs, activeTab }
          })
        },
      }
    }

    const store = createLibraryStore()

    function useLibrary() {
      const [snapshot, setSnapshot] = useState(store.getState())
      useEffect(() => store.subscribe(() => setSnapshot(store.getState())), [])
      return snapshot
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

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), Math.max(min, max))
    }

    function descendantFolders(folders, id) {
      const result = new Set([id])
      let changed = true
      while (changed) {
        changed = false
        for (const [folderId, folder] of Object.entries(folders)) {
          if (!result.has(folderId) && folder.parentId && result.has(folder.parentId)) {
            result.add(folderId)
            changed = true
          }
        }
      }
      return result
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

    function countChildren(library, folderId) {
      let count = 0
      for (const folder of Object.values(library.folders)) if ((folder.parentId ?? null) === folderId) count += 1
      for (const item of Object.values(library.items)) if ((item.folderId ?? null) === folderId) count += 1
      return count
    }

    function countFilesIn(folders, items, folderId) {
      const scope = descendantFolders(folders, folderId)
      let count = 0
      for (const item of Object.values(items)) if (item.folderId && scope.has(item.folderId)) count += 1
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

    function gridColumns(width) {
      return Math.max(1, Math.floor((width - PAD * 2) / CELL_W))
    }

    function slotPosition(index, columns) {
      const col = index % columns
      const row = Math.floor(index / columns)
      return { index, col, row, x: PAD + col * CELL_W, y: PAD + row * CELL_H }
    }

    function positionSlot(x, y, columns) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null
      const col = Math.round((x - PAD) / CELL_W)
      const row = Math.round((y - PAD) / CELL_H)
      if (col < 0 || col >= columns || row < 0) return null
      const snappedX = PAD + col * CELL_W
      const snappedY = PAD + row * CELL_H
      if (Math.abs(x - snappedX) > 0.6 || Math.abs(y - snappedY) > 0.6) return null
      return { index: row * columns + col, col, row, x: snappedX, y: snappedY }
    }

    function nearestSlot(x, y, columns, rows) {
      const col = clamp(Math.round((x - PAD) / CELL_W), 0, columns - 1)
      const row = clamp(Math.round((y - PAD) / CELL_H), 0, Math.max(0, rows - 1))
      return slotPosition(row * columns + col, columns)
    }

    function clampToCanvas(x, y, width, height) {
      return {
        x: clamp(Number.isFinite(x) ? x : PAD, PAD, Math.max(PAD, width - ICON_W - PAD)),
        y: clamp(Number.isFinite(y) ? y : PAD, PAD, Math.max(PAD, height - ICON_H - PAD)),
      }
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
      const paths = (list) => h('svg', base, list.map((d, index) => h('path', { key: index, d })))
      switch (name) {
        case 'plus':
          return paths(['M12 5v14', 'M5 12h14'])
        case 'refresh':
          return paths(['M20 11a8 8 0 1 0-2.34 6.34', 'M20 4.8v6.2h-6.2'])
        case 'search':
          return h('svg', base, [h('circle', { key: 'c', cx: 11, cy: 11, r: 6.4 }), h('path', { key: 'l', d: 'M16 16l4.2 4.2' })])
        case 'back':
          return paths(['M14.5 5.5L8 12l6.5 6.5'])
        case 'forward':
          return paths(['M9.5 5.5L16 12l-6.5 6.5'])
        case 'close':
          return paths(['M6 6l12 12', 'M18 6L6 18'])
        case 'copy':
          return h('svg', base, [
            h('rect', { key: 'r1', x: 8.6, y: 8.6, width: 11, height: 11, rx: 2 }),
            h('path', { key: 'p1', d: 'M15.4 8.6V6.4a1.8 1.8 0 0 0-1.8-1.8H6.4a1.8 1.8 0 0 0-1.8 1.8v7.2a1.8 1.8 0 0 0 1.8 1.8h2.2' }),
          ])
        case 'trash':
          return paths(['M4 7h16', 'M9.5 7V4.6h5V7', 'M6.5 7l1 13h9l1-13', 'M10 11v5.5', 'M14 11v5.5'])
        case 'folder-plus':
          return paths(['M3.2 6.6a1.6 1.6 0 0 1 1.6-1.6h4.1l1.8 2.1H19.2a1.6 1.6 0 0 1 1.6 1.6v9.1a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6z', 'M12 11v5', 'M9.5 13.5h5'])
        case 'doc':
          return paths(['M6.2 3.2h7.2l4.4 4.4v13.2H6.2z', 'M13.2 3.4v4.4h4.4', 'M9 12.4h6', 'M9 15.4h6', 'M9 9.4h2.4'])
        case 'folder':
          return paths(['M3.2 6.4a1.6 1.6 0 0 1 1.6-1.6h4.1l1.8 2.2H19.2a1.6 1.6 0 0 1 1.6 1.6v9.2a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6z'])
        case 'home':
          return paths(['M3.6 11.2L12 4l8.4 7.2', 'M6.2 9.6V20h11.6V9.6', 'M10 20v-5.4h4V20'])
        case 'panel':
          return h('svg', base, [
            h('rect', { key: 'r', x: 3.2, y: 4.2, width: 17.6, height: 15.6, rx: 2 }),
            h('path', { key: 'l', d: 'M9.2 4.4v15.2' }),
            h('path', { key: 'c', d: 'M6.2 9.6l1.4 2.4-1.4 2.4' }),
          ])
        case 'check':
          return paths(['M5 12.5l4.3 4.3L19 7.2'])
        case 'file-plus':
          return h('svg', base, [
            h('path', { key: 'a', d: 'M6.2 3.2h7.2l4.4 4.4v13.2H6.2z' }),
            h('path', { key: 'b', d: 'M13.2 3.4v4.4h4.4' }),
            h('path', { key: 'c', d: 'M9.4 14.2h5.2' }),
            h('path', { key: 'd', d: 'M12 11.6v5.2' }),
          ])
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
        if (token.startsWith('`')) nodes.push(h('code', { key, className: 'dsd-md-inline-code' }, token.slice(1, -1)))
        else if (token.startsWith('**')) nodes.push(h('strong', { key }, token.slice(2, -2)))
        else if (token.startsWith('*')) nodes.push(h('em', { key }, token.slice(1, -1)))
        else {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
          const href = link ? link[2] : ''
          if (link && /^(https?:\/\/|mailto:|#)/i.test(href)) nodes.push(h('a', { key, href, target: '_blank', rel: 'noreferrer noopener' }, link[1]))
          else nodes.push(link ? link[1] : token)
        }
        cursor = match.index + token.length
      }
      if (cursor < text.length) nodes.push(text.slice(cursor))
      return nodes
    }

    function renderMarkdown(source, baseKey) {
      const lines = String(source ?? '').replace(/^\uFEFF/u, '').replace(/\r\n?/g, '\n').split('\n')
      const blocks = []
      let index = 0
      let key = 0
      let paragraph = []
      const prefix = baseKey || 'md'
      const flush = () => {
        if (paragraph.length === 0) return
        const text = paragraph.join(' ')
        blocks.push(h('p', { key: `${prefix}-p${key++}`, className: 'dsd-md-p' }, renderInline(text, `${prefix}-p${key}`)))
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
          blocks.push(h('pre', { key: `${prefix}-pre${key++}`, className: 'dsd-md-pre' }, h('code', null, code.join('\n'))))
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
          blocks.push(h(`h${level}`, { key: `${prefix}-h${key++}`, className: 'dsd-md-heading' }, renderInline(heading[2], `${prefix}-h${key}`)))
          index += 1
          continue
        }
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
          flush()
          blocks.push(h('hr', { key: `${prefix}-hr${key++}`, className: 'dsd-md-hr' }))
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
          blocks.push(h('blockquote', { key: `${prefix}-q${key++}`, className: 'dsd-md-quote' }, renderInline(quote.join(' '), `${prefix}-q${key}`)))
          continue
        }
        if (/^[-*+]\s+/.test(line)) {
          flush()
          const items = []
          while (index < lines.length && /^[-*+]\s+/.test(lines[index])) {
            items.push(h('li', { key: `${prefix}-li${key++}` }, renderInline(lines[index].replace(/^[-*+]\s+/, ''), `${prefix}-li${key}`)))
            index += 1
          }
          blocks.push(h('ul', { key: `${prefix}-ul${key++}`, className: 'dsd-md-list' }, items))
          continue
        }
        if (/^\d+[.)]\s+/.test(line)) {
          flush()
          const items = []
          while (index < lines.length && /^\d+[.)]\s+/.test(lines[index])) {
            items.push(h('li', { key: `${prefix}-li${key++}` }, renderInline(lines[index].replace(/^\d+[.)]\s+/, ''), `${prefix}-li${key}`)))
            index += 1
          }
          blocks.push(h('ol', { key: `${prefix}-ol${key++}`, className: 'dsd-md-list' }, items))
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
.dsd-panel { position:relative; display:flex; flex-direction:column; height:100%; min-height:0; background:var(--dsw-alias-bg-base,#fff); color:var(--dsw-alias-label-primary,#1b1b1f); font-family:inherit; }
.dsd-tabbar { flex:none; display:flex; align-items:flex-end; gap:4px; height:38px; padding:4px 8px 0; background:var(--dsw-alias-bg-layer-1,#f6f6f8); border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-tabs { display:flex; align-items:flex-end; gap:2px; flex:1; min-width:0; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; }
.dsd-tab { display:inline-flex; align-items:center; gap:6px; height:30px; max-width:210px; padding:0 6px 0 9px; border:1px solid transparent; border-bottom:none; border-radius:8px 8px 0 0; background:transparent; color:var(--dsw-alias-label-secondary,#6b6b76); font:inherit; font-size:12px; cursor:pointer; white-space:nowrap; flex:none; }
.dsd-tab:hover { color:var(--dsw-alias-label-primary,#1b1b1f); background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsd-tab[data-active=true] { color:var(--dsw-alias-label-primary,#1b1b1f); background:var(--dsw-alias-bg-base,#fff); border-color:var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-tab-label { overflow:hidden; text-overflow:ellipsis; }
.dsd-tab-close { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border:none; border-radius:4px; background:transparent; color:inherit; cursor:pointer; padding:0; }
.dsd-tab-close:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 10%, transparent); }
.dsd-tabbar-actions { flex:none; display:flex; align-items:center; gap:6px; padding-bottom:4px; }
.dsd-btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; height:28px; min-width:28px; padding:0 9px; border-radius:8px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12px; cursor:pointer; white-space:nowrap; }
.dsd-btn:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsd-btn:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsd-btn:disabled { opacity:.5; cursor:default; }
.dsd-btn[data-primary] { background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#f9fafb)); border-color:transparent; color:var(--dsw-alias-label-primary-foreground,#0f1115); font-weight:600; }
.dsd-btn[data-primary]:hover:not(:disabled) { filter:brightness(1.04); background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#f9fafb)); }
.dsd-btn[data-quiet] { border-color:transparent; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-btn[data-quiet]:hover:not(:disabled) { color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-btn[data-danger] { background:var(--dsw-alias-state-error-primary,#c62f45); border-color:transparent; color:#fff; font-weight:600; }
.dsd-btn[data-danger]:hover:not(:disabled) { background:var(--dsw-alias-state-error-primary,#c62f45); filter:brightness(1.06); }
.dsd-home { flex:1; min-height:0; display:flex; flex-direction:column; }
.dsd-toolbar { flex:none; display:flex; align-items:center; gap:7px; padding:7px 12px 6px; flex-wrap:wrap; }
.dsd-crumb { display:flex; align-items:center; gap:3px; min-width:0; font-size:12px; color:var(--dsw-alias-label-secondary,#6b6b76); flex-wrap:wrap; }
.dsd-crumb-btn { border:none; background:transparent; color:inherit; font:inherit; font-size:12px; padding:2px 5px; border-radius:5px; cursor:pointer; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-crumb-btn:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-crumb-current { padding:2px 5px; color:var(--dsw-alias-label-primary,#1b1b1f); font-weight:600; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-crumb-sep { opacity:.55; }
.dsd-crumb-back { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; margin-right:1px; border:none; border-radius:6px; background:transparent; color:inherit; cursor:pointer; padding:0; }
.dsd-crumb-back:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsd-toolbar-spacer { flex:1; min-width:4px; }
.dsd-count { font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); white-space:nowrap; }
.dsd-search { position:relative; display:flex; align-items:center; }
.dsd-search svg { position:absolute; left:8px; color:var(--dsw-alias-label-secondary,#6b6b76); pointer-events:none; }
.dsd-search input { width:156px; height:28px; padding:0 8px 0 27px; border-radius:8px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:var(--dsw-specific-input-major,var(--dsw-alias-bg-base,#fff)); color:inherit; font:inherit; font-size:12px; outline:none; }
.dsd-search input:focus { border-color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsd-search input::placeholder { color:var(--dsw-alias-label-secondary,#6b6b76); opacity:.8; }
.dsd-desktop-wrap { flex:1; min-height:0; display:flex; padding:0 10px 10px; }
.dsd-desktop { position:relative; flex:1; min-height:0; overflow:auto; border-radius:12px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); scrollbar-width:thin; scrollbar-gutter:stable; }
.dsd-desktop-canvas { position:relative; width:100%; min-height:100%; background-color:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#f6f6f8) 62%, transparent); background-image:radial-gradient(circle, color-mix(in srgb, var(--dsw-alias-border-l2,#d0d0d8) 72%, transparent) 1px, transparent 1px); background-size:22px 22px; background-position:7px 7px; }
.dsd-slot-ghost { position:absolute; width:88px; height:104px; border-radius:10px; border:1px dashed var(--dsw-alias-state-business-primary,#2f6fed); background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 9%, transparent); pointer-events:none; z-index:1; }
.dsd-item { position:absolute; width:88px; box-sizing:border-box; padding:5px 3px 6px; border-radius:10px; border:1px solid transparent; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:default; user-select:none; touch-action:none; }
.dsd-item[data-pending=true] { opacity:0; }
.dsd-item:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 6%, transparent); }
.dsd-item:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsd-item[data-selected=true] { background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 13%, transparent); border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 42%, transparent); }
.dsd-item[data-dragging=true] { z-index:9; cursor:grabbing; opacity:.94; background:var(--dsw-alias-bg-layer-1,#fff); box-shadow:0 12px 26px rgba(0,0,0,.18); }
.dsd-item[data-drop=true] .dsd-glyph { outline:3px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:2px; }
.dsd-glyph { position:relative; display:flex; align-items:center; justify-content:center; width:54px; height:54px; border-radius:14px; flex:none; }
.dsd-glyph[data-kind=file] { background:var(--dsw-alias-bg-layer-1,#f6f6f8); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-glyph[data-kind=folder] { background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 15%, var(--dsw-alias-bg-layer-1,#f6f6f8)); border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f6fed) 30%, transparent); color:var(--dsw-alias-state-business-primary,#2f6fed); }
.dsd-badge { position:absolute; right:-5px; bottom:-5px; min-width:17px; height:17px; padding:0 4px; border-radius:9px; background:var(--dsw-alias-state-business-primary,#2f6fed); color:var(--dsw-alias-label-primary-foreground,#0f1115); font-size:10px; line-height:17px; font-weight:700; text-align:center; }
.dsd-label { font-size:11.5px; line-height:1.3; text-align:center; max-width:84px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; word-break:break-word; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-rename-input { width:82px; height:23px; padding:1px 3px; border-radius:6px; border:1px solid var(--dsw-alias-state-business-primary,#2f6fed); background:var(--dsw-alias-bg-base,#fff); color:inherit; font:inherit; font-size:11.5px; text-align:center; outline:none; }
.dsd-empty { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:28px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-empty-icon { display:flex; align-items:center; justify-content:center; width:64px; height:64px; margin-bottom:2px; border-radius:18px; background:var(--dsw-alias-bg-layer-2,#f0f0f4); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-empty-title { margin:0; font-size:14px; font-weight:600; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-empty-hint { margin:0; max-width:420px; font-size:12px; line-height:1.65; }
.dsd-no-match { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-doc { flex:1; min-height:0; display:flex; flex-direction:column; }
.dsd-doc-scroll { flex:1; min-height:0; overflow:auto; scrollbar-width:thin; }
.dsd-doc-inner { max-width:880px; margin:0 auto; padding:18px 30px 64px; }
.dsd-doc-pathbar { display:flex; align-items:center; gap:8px; margin-bottom:16px; padding-bottom:10px; border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-doc-pathbar > svg { flex:none; }
.dsd-doc-path { flex:1; min-width:0; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:10.5px; line-height:1.5; word-break:break-all; }
.dsd-doc-body { font-size:13.5px; line-height:1.75; }
.dsd-doc-note { margin-bottom:14px; padding:7px 10px; border-radius:8px; border:1px dashed var(--dsw-alias-border-l2,#d0d0d8); font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-doc-loading { padding:36px 8px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-doc-error { margin:18px 0; padding:16px; border-radius:10px; border:1px solid var(--dsw-alias-state-error-primary,#c62f45); color:var(--dsw-alias-state-error-primary,#c62f45); font-size:12.5px; line-height:1.6; display:flex; flex-direction:column; align-items:flex-start; gap:10px; }
.dsd-doc-empty { padding:36px 8px; text-align:center; color:var(--dsw-alias-label-secondary,#6b6b76); font-size:12.5px; }
.dsd-md-heading { margin:1.5em 0 .6em; line-height:1.3; font-weight:700; }
.dsd-md-heading:first-child { margin-top:0; }
.dsd-md-p { margin:.72em 0; }
.dsd-md-list { margin:.6em 0; padding-left:1.5em; }
.dsd-md-list li { margin:.22em 0; }
.dsd-md-pre { margin:.9em 0; padding:11px 13px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1,#e4e4ea); background:var(--dsw-alias-bg-layer-2,#f0f0f4); overflow:auto; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12px; line-height:1.58; tab-size:2; }
.dsd-md-inline-code { padding:1px 5px; border-radius:5px; background:var(--dsw-alias-bg-layer-2,#f0f0f4); font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:.9em; }
.dsd-md-quote { margin:.8em 0; padding:2px 0 2px 12px; border-left:3px solid var(--dsw-alias-border-l2,#d0d0d8); color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-md-hr { height:1px; margin:1.3em 0; border:none; background:var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-doc-body a { color:var(--dsw-alias-state-business-primary,#2f6fed); text-decoration:none; }
.dsd-doc-body a:hover { text-decoration:underline; }
.dsd-menu { position:fixed; z-index:2000; min-width:196px; max-width:264px; max-height:min(72vh,420px); overflow:auto; padding:5px; border-radius:10px; background:var(--dsw-alias-bg-layer-2,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 14px 36px rgba(0,0,0,.2); animation:dsd-pop .12s ease-out; }
.dsd-menu-title { padding:6px 9px 4px; font-size:11px; font-weight:700; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-menu-item { display:flex; align-items:center; gap:8px; width:100%; padding:7px 9px; border:none; border-radius:7px; background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12.5px; text-align:left; cursor:pointer; }
.dsd-menu-item:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsd-menu-item svg { flex:none; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-menu-item[data-danger] { color:var(--dsw-alias-state-error-primary,#c62f45); }
.dsd-menu-item[data-danger] svg { color:currentColor; }
.dsd-menu-sep { height:1px; margin:5px 4px; background:var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-menu-heading { padding:7px 9px 3px; font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-menu-hint { padding:5px 9px 7px; font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); line-height:1.5; }
.dsd-picker { position:absolute; inset:0; z-index:80; display:flex; align-items:center; justify-content:center; padding:22px; background:rgba(9,13,22,.42); animation:dsd-fade .12s ease-out; }
.dsd-picker-card { display:flex; flex-direction:column; width:min(760px,100%); height:min(650px,100%); overflow:hidden; border-radius:14px; background:var(--dsw-alias-bg-layer-1,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 20px 54px rgba(0,0,0,.28); }
.dsd-picker-head { flex:none; display:flex; align-items:flex-start; gap:10px; padding:14px 16px 10px; border-bottom:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-picker-heading { flex:1; min-width:0; }
.dsd-picker-title { margin:0; font-size:15px; font-weight:700; }
.dsd-picker-sub { margin-top:2px; font-size:11.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-picker-tools { flex:none; display:flex; align-items:center; gap:8px; padding:10px 16px 6px; }
.dsd-picker-list { flex:1; min-height:0; overflow:auto; padding:0 10px 10px; scrollbar-width:thin; }
.dsd-picker-row { display:flex; align-items:center; gap:10px; width:100%; padding:8px 10px; border:none; border-radius:8px; background:transparent; color:inherit; font:inherit; text-align:left; cursor:pointer; }
.dsd-picker-row:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 7%, transparent); }
.dsd-picker-row:disabled { opacity:.55; cursor:default; }
.dsd-picker-check { display:flex; align-items:center; justify-content:center; width:17px; height:17px; flex:none; border-radius:5px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); color:transparent; }
.dsd-picker-row[aria-checked=true] .dsd-picker-check { background:var(--dsw-alias-state-business-primary,#2f6fed); border-color:transparent; color:var(--dsw-alias-label-primary-foreground,#0f1115); }
.dsd-picker-text { min-width:0; display:flex; flex-direction:column; gap:1px; flex:1; }
.dsd-picker-name { font-size:12.5px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-picker-path { font-size:10.5px; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-picker-meta { flex:none; margin-left:8px; font-size:10.5px; color:var(--dsw-alias-label-secondary,#6b6b76); white-space:nowrap; }
.dsd-picker-added { flex:none; margin-left:8px; font-size:10.5px; color:var(--dsw-alias-state-success-primary,#2e9e6b); }
.dsd-picker-status { padding:26px 12px; text-align:center; font-size:12.5px; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-picker-foot { flex:none; display:flex; align-items:center; gap:10px; padding:10px 16px; border-top:1px solid var(--dsw-alias-border-l1,#e4e4ea); }
.dsd-picker-foot-meta { flex:1; min-width:0; font-size:11px; color:var(--dsw-alias-label-secondary,#6b6b76); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dsd-modal { position:absolute; inset:0; z-index:90; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(9,13,22,.36); animation:dsd-fade .12s ease-out; }
.dsd-modal-card { width:min(390px,100%); padding:18px; border-radius:14px; background:var(--dsw-alias-bg-layer-1,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 20px 50px rgba(0,0,0,.24); }
.dsd-modal-title { margin:0 0 8px; font-size:14.5px; font-weight:700; }
.dsd-modal-text { margin:0; font-size:12.5px; line-height:1.65; color:var(--dsw-alias-label-secondary,#6b6b76); }
.dsd-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
.dsd-toast { position:absolute; left:50%; bottom:18px; z-index:100; transform:translateX(-50%); max-width:calc(100% - 40px); padding:7px 14px; border-radius:999px; background:rgba(18,23,33,.9); color:#fff; font-size:12px; line-height:1.4; text-align:center; pointer-events:none; animation:dsd-fade .15s ease-out; }
.dsd-sidebar-toggle { position:fixed; left:0; top:50%; transform:translateY(-50%); z-index:1200; display:flex; align-items:center; justify-content:center; width:15px; height:62px; padding:0; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); border-left:none; border-radius:0 9px 9px 0; background:var(--dsw-alias-bg-layer-2,#fff); color:var(--dsw-alias-label-secondary,#6b6b76); cursor:pointer; pointer-events:auto; opacity:.72; transition:width .15s ease, opacity .15s ease; }
.dsd-sidebar-toggle:hover { width:22px; opacity:1; color:var(--dsw-alias-label-primary,#1b1b1f); }
.dsd-sidebar-toggle:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary,#2f6fed); outline-offset:1px; }
.dsd-file-action { display:inline-flex; align-items:center; gap:4px; height:24px; padding:0 8px; border-radius:6px; border:1px solid var(--dsw-alias-border-l2,#d0d0d8); background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:11.5px; cursor:pointer; white-space:nowrap; }
.dsd-file-action:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
.dsd-file-action:disabled { opacity:.55; cursor:default; }
.dsd-file-menu { position:fixed; z-index:2200; min-width:168px; padding:5px; border-radius:9px; background:var(--dsw-alias-bg-layer-2,#fff); border:1px solid var(--dsw-alias-border-l1,#e4e4ea); box-shadow:0 14px 34px rgba(0,0,0,.24); animation:dsd-pop .12s ease-out; }
.dsd-file-menu button { display:flex; align-items:center; gap:8px; width:100%; padding:7px 9px; border:none; border-radius:6px; background:transparent; color:var(--dsw-alias-label-primary,#1b1b1f); font:inherit; font-size:12.5px; text-align:left; cursor:pointer; }
.dsd-file-menu button:hover { background:color-mix(in srgb, var(--dsw-alias-label-primary,#1b1b1f) 8%, transparent); }
@keyframes dsd-fade { from { opacity:0; } to { opacity:1; } }
@keyframes dsd-pop { from { opacity:0; transform:translateY(-4px) scale(.985); } to { opacity:1; transform:none; } }
@media (max-width: 720px) {
  .dsd-count { display:none; }
  .dsd-search input { width:112px; }
  .dsd-toolbar { padding:6px 10px 5px; }
  .dsd-doc-inner { padding:14px 16px 48px; }
  .dsd-picker { padding:8px; }
}
`

    /* ------------------------------------------------------------ components */

    function SidebarToggle({ toggleSidebar }) {
      return h(
        'button',
        {
          className: 'dsd-sidebar-toggle',
          type: 'button',
          title: t('sidebar.toggle'),
          'aria-label': t('sidebar.toggle'),
          onClick: () => toggleSidebar?.(),
        },
        icon('panel', 13),
      )
    }

    function FileAction({ actionUrl }) {
      const [status, setStatus] = useState('idle')
      const [menu, setMenu] = useState(null)
      const ref = useRef(null)
      const coords = useMemo(() => {
        try {
          const url = new URL(String(actionUrl || ''), window.location.href)
          const sessionId = url.searchParams.get('sessionId')
          const seq = url.searchParams.get('seq')
          const index = url.searchParams.get('index')
          if (!sessionId || !seq || !index) return null
          return { sessionId, seq, index }
        } catch {
          return null
        }
      }, [actionUrl])

      const add = useCallback(async () => {
        setMenu(null)
        if (!coords) {
          setStatus('failed')
          return
        }
        setStatus('resolving')
        try {
          const query = new URLSearchParams(coords).toString()
          const response = await fetch(`${API_RESOLVE}?${query}`, { credentials: 'same-origin' })
          const body = await response.json().catch(() => null)
          if (!response.ok || !body || typeof body.path !== 'string') throw new Error('resolve')
          if (!/\.(md|markdown|mdx)$/iu.test(body.path)) {
            setStatus('not-markdown')
            return
          }
          const added = store.addFiles([{ path: body.path, name: body.name || basename(body.path) }], null)
          setStatus(added > 0 ? 'added' : 'already')
        } catch {
          setStatus('failed')
        }
      }, [coords])

      useEffect(() => {
        const card = ref.current && ref.current.closest ? ref.current.closest('[data-presented-file]') : null
        if (!card) return undefined
        const onContext = (event) => {
          event.preventDefault()
          const width = 188
          const height = 54
          setMenu({
            x: Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8)),
            y: Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8)),
          })
        }
        card.addEventListener('contextmenu', onContext)
        return () => card.removeEventListener('contextmenu', onContext)
      }, [])

      useEffect(() => {
        if (!menu) return undefined
        const onDown = (event) => {
          const target = event.target
          if (target && target.closest && target.closest('.dsd-file-menu')) return
          setMenu(null)
        }
        const onKey = (event) => {
          if (event.key === 'Escape') setMenu(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('pointerdown', onDown, true)
          document.removeEventListener('keydown', onKey)
        }
      }, [menu])

      const label =
        status === 'resolving'
          ? t('context.resolving')
          : status === 'added' || status === 'already'
            ? t('context.added')
            : status === 'failed'
              ? t('context.failed')
              : status === 'not-markdown'
                ? t('context.notMarkdown')
                : t('context.addToLibrary')

      return h(
        React.Fragment,
        null,
        h(
          'button',
          {
            ref,
            className: 'dsd-file-action',
            type: 'button',
            onClick: add,
            disabled: status === 'resolving' || status === 'added' || status === 'already',
            title: label,
          },
          icon('file-plus', 12),
          h('span', null, label),
        ),
        menu
          ? h(
              'div',
              { className: 'dsd-file-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, role: 'menu' },
              h('button', { type: 'button', role: 'menuitem', onClick: add }, icon('file-plus', 13), h('span', null, t('context.addToLibrary'))),
            )
          : null,
      )
    }

    function PanelPage() {
      const library = useLibrary()
      const [currentFolder, setCurrentFolder] = useState(null)
      const [viewport, setViewport] = useState({ width: 0, height: 0 })
      const [selected, setSelected] = useState(null)
      const [menu, setMenu] = useState(null)
      const [renaming, setRenaming] = useState(null)
      const [drag, setDrag] = useState(null)
      const [dropFolder, setDropFolder] = useState(null)
      const [dropSlot, setDropSlot] = useState(null)
      const [picker, setPicker] = useState({ open: false, status: 'idle', files: [], roots: [], truncated: false, partial: false, error: null, query: '', selected: new Set() })
      const [doc, setDoc] = useState({ status: 'idle' })
      const [docReload, setDocReload] = useState(0)
      const [search, setSearch] = useState('')
      const [toast, setToast] = useState(null)
      const [confirmState, setConfirmState] = useState(null)

      const panelRef = useRef(null)
      const desktopRef = useRef(null)
      const dragRef = useRef(null)
      const renameRef = useRef(null)
      const toastTimer = useRef(0)
      const pickerToken = useRef(0)
      const docCache = useRef(new Map())
      const docAbort = useRef(null)
      const prevColumns = useRef(0)

      const showToast = useCallback((text) => {
        window.clearTimeout(toastTimer.current)
        setToast(text)
        toastTimer.current = window.setTimeout(() => setToast(null), 2300)
      }, [])

      useEffect(() => () => {
        window.clearTimeout(toastTimer.current)
        try {
          docAbort.current?.abort()
        } catch {
          /* ignore */
        }
      }, [])

      useEffect(() => {
        if (currentFolder && !library.folders[currentFolder]) setCurrentFolder(null)
      }, [library.folders, currentFolder])

      useEffect(() => {
        const element = desktopRef.current
        if (!element) return undefined
        const measure = () => {
          const width = element.clientWidth
          const height = element.clientHeight
          if (width > 0 && height > 0) setViewport((previous) => (previous.width === width && previous.height === height ? previous : { width, height }))
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(element)
        return () => observer.disconnect()
      }, [library.activeTab])

      useEffect(() => {
        if (desktopRef.current) desktopRef.current.scrollTop = 0
      }, [currentFolder])

      const allEntries = useMemo(() => {
        const folders = Object.values(library.folders)
          .filter((folder) => (folder.parentId ?? null) === currentFolder)
          .map((folder) => ({ kind: 'folder', key: folder.id, id: folder.id, name: folder.name, x: folder.x, y: folder.y, count: countChildren(library, folder.id), addedAt: 0 }))
        const files = Object.values(library.items)
          .filter((item) => (item.folderId ?? null) === currentFolder)
          .map((item) => ({ kind: 'file', key: item.path, id: item.path, name: item.name || basename(item.path), path: item.path, x: item.x, y: item.y, addedAt: item.addedAt || 0 }))
        return [...folders, ...files]
      }, [library, currentFolder])

      const columns = Math.max(1, gridColumns(viewport.width))
      const maxRow = allEntries.reduce((max, entry) => {
        const slot = positionSlot(entry.x, entry.y, columns)
        return slot ? Math.max(max, slot.row) : max
      }, 0)
      const rowCount = Math.max(1, Math.ceil(allEntries.length / columns), maxRow + 1)
      const canvasHeight = Math.max(viewport.height, PAD * 2 + rowCount * CELL_H)

      const entries = useMemo(() => {
        const query = search.trim().toLowerCase()
        const filtered = query
          ? allEntries.filter((entry) => entry.name.toLowerCase().includes(query) || (entry.kind === 'file' && entry.path.toLowerCase().includes(query)))
          : allEntries
        return filtered.slice().sort((left, right) => (left.y ?? 0) - (right.y ?? 0) || (left.x ?? 0) - (right.x ?? 0))
      }, [allEntries, search])

      useEffect(() => {
        if (viewport.width < ICON_W + PAD * 2) return
        const gridColumnsNow = Math.max(1, gridColumns(viewport.width))
        const reflowAll = prevColumns.current !== gridColumnsNow
        prevColumns.current = gridColumnsNow
        const ordered = allEntries.slice().sort((left, right) => {
          const leftSlot = positionSlot(left.x, left.y, gridColumnsNow)
          const rightSlot = positionSlot(right.x, right.y, gridColumnsNow)
          const leftIndex = leftSlot ? leftSlot.index : Number.MAX_SAFE_INTEGER
          const rightIndex = rightSlot ? rightSlot.index : Number.MAX_SAFE_INTEGER
          return leftIndex - rightIndex || (left.addedAt ?? 0) - (right.addedAt ?? 0) || left.name.localeCompare(right.name)
        })
        const used = new Set()
        const targets = new Map()
        if (!reflowAll) {
          for (const entry of ordered) {
            const slot = positionSlot(entry.x, entry.y, gridColumnsNow)
            if (!slot || used.has(slot.index)) continue
            used.add(slot.index)
            targets.set(entry.key, slot)
          }
        }
        let cursor = 0
        for (const entry of ordered) {
          if (targets.has(entry.key)) continue
          while (used.has(cursor)) cursor += 1
          const slot = slotPosition(cursor, gridColumnsNow)
          used.add(cursor)
          targets.set(entry.key, slot)
          cursor += 1
        }
        const updates = []
        for (const entry of allEntries) {
          const target = targets.get(entry.key)
          if (!target) continue
          if (entry.x !== target.x || entry.y !== target.y) updates.push({ kind: entry.kind, id: entry.id, x: target.x, y: target.y })
        }
        if (updates.length > 0) store.setPositions(updates)
      }, [viewport, allEntries, currentFolder])

      const activePath = library.activeTab === 'home' ? null : library.activeTab
      const activeItem = activePath ? library.items[activePath] : null

      useEffect(() => {
        if (!activePath) {
          setDoc({ status: 'idle' })
          return undefined
        }
        const cached = docCache.current.get(activePath)
        if (cached) {
          setDoc(cached)
          return undefined
        }
        const controller = new AbortController()
        docAbort.current = controller
        setDoc({ status: 'loading', path: activePath })
        fetch(`${API_READ}?path=${encodeURIComponent(activePath)}`, { signal: controller.signal, credentials: 'same-origin' })
          .then(async (response) => {
            const body = await response.json().catch(() => null)
            if (!response.ok) throw new Error(body && body.error ? body.error : `HTTP ${response.status}`)
            const next = {
              status: 'ready',
              path: body.path || activePath,
              name: body.name || basename(activePath),
              content: body.content || '',
              truncated: Boolean(body.truncated),
              size: body.size,
              mtime: body.mtime,
            }
            docCache.current.set(activePath, next)
            setDoc(next)
          })
          .catch((error) => {
            if (error && error.name === 'AbortError') return
            setDoc({ status: 'error', path: activePath, error: error && error.message ? error.message : String(error) })
          })
        return () => controller.abort()
      }, [activePath, docReload])

      const reloadDoc = useCallback(() => {
        if (!activePath) return
        docCache.current.delete(activePath)
        setDocReload((value) => value + 1)
      }, [activePath])

      const copyText = useCallback(
        (text) => {
          const done = () => showToast(t('toast.copied'))
          const failed = () => showToast(t('toast.copyFailed'))
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(done).catch(failed)
              return
            }
          } catch {
            /* fall through */
          }
          failed()
        },
        [showToast],
      )

      const openPicker = useCallback(async () => {
        const token = (pickerToken.current += 1)
        setPicker({ open: true, status: 'loading', files: [], roots: [], truncated: false, partial: false, error: null, query: '', selected: new Set() })
        try {
          const response = await fetch(`${API_LIST}?refresh=1`, { credentials: 'same-origin' })
          const body = await response.json().catch(() => null)
          if (!response.ok) throw new Error(body && body.error ? body.error : `HTTP ${response.status}`)
          if (token !== pickerToken.current) return
          setPicker((previous) => ({
            ...previous,
            status: 'ready',
            files: Array.isArray(body.files) ? body.files : [],
            roots: Array.isArray(body.roots) ? body.roots : [],
            truncated: Boolean(body.truncated),
            partial: Boolean(body.partial),
            error: null,
          }))
        } catch (error) {
          if (token !== pickerToken.current) return
          setPicker((previous) => ({ ...previous, status: 'error', error: error && error.message ? error.message : String(error) }))
        }
      }, [])

      const closePicker = useCallback(() => {
        pickerToken.current += 1
        setPicker((previous) => ({ ...previous, open: false }))
      }, [])

      const addSelected = useCallback(() => {
        const chosen = picker.files.filter((file) => picker.selected.has(file.path))
        if (chosen.length === 0) return
        const added = store.addFiles(chosen.map((file) => ({ path: file.path, name: file.name })), currentFolder)
        closePicker()
        showToast(added > 0 ? t('toast.added', { count: added }) : t('toast.already'))
      }, [picker.files, picker.selected, currentFolder, closePicker, showToast])

      const createFolder = useCallback(() => {
        const name = uniqueFolderName(library.folders, currentFolder, t('folder.defaultName'))
        const id = store.addFolder(name, currentFolder)
        renameRef.current = { kind: 'folder', key: id }
        setRenaming({ kind: 'folder', key: id })
        showToast(t('toast.folderCreated'))
      }, [library.folders, currentFolder, showToast])

      const commitRename = useCallback((raw) => {
        const pending = renameRef.current
        renameRef.current = null
        setRenaming(null)
        if (!pending) return
        const text = String(raw ?? '').trim().slice(0, 80)
        if (!text) return
        store.rename(pending.kind, pending.key, text)
      }, [])

      const startRename = useCallback((entry) => {
        const pending = { kind: entry.kind, key: entry.id }
        renameRef.current = pending
        setRenaming(pending)
        setMenu(null)
      }, [])

      const openEntry = useCallback((entry) => {
        if (entry.kind === 'folder') {
          setCurrentFolder(entry.id)
          setSelected(null)
          setMenu(null)
          return
        }
        store.openDoc(entry.path)
        setMenu(null)
      }, [])

      const removeItem = useCallback(
        (path) => {
          store.removeItem(path)
          setMenu(null)
          if (selected && selected.key === path) setSelected(null)
          showToast(t('toast.removed'))
        },
        [selected, showToast],
      )

      const moveEntry = useCallback(
        (entry, targetFolderId) => {
          store.move(entry.kind, entry.id, targetFolderId)
          setMenu(null)
          showToast(t('toast.moved'))
        },
        [showToast],
      )

      const requestDeleteFolder = useCallback(
        (folder) => {
          const count = countFilesIn(library.folders, library.items, folder.id)
          setMenu(null)
          setConfirmState({
            title: t('confirm.deleteTitle'),
            message: count > 0 ? t('confirm.deleteWithFiles', { count }) : t('confirm.deleteEmpty'),
            onConfirm: () => {
              const parent = store.removeFolder(folder.id)
              if (currentFolder && descendantFolders(library.folders, folder.id).has(currentFolder)) setCurrentFolder(parent)
              setConfirmState(null)
              showToast(t('toast.folderDeleted'))
            },
          })
        },
        [library.folders, library.items, currentFolder, showToast],
      )

      const onPointerDown = useCallback((event, entry) => {
        if (event.button !== 0 && event.pointerType === 'mouse') return
        if (renameRef.current) return
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          /* ignore */
        }
        const frame = desktopRef.current
        let startCanvasX = event.clientX
        let startCanvasY = event.clientY
        if (frame) {
          const rect = frame.getBoundingClientRect()
          startCanvasX = event.clientX - rect.left + frame.scrollLeft
          startCanvasY = event.clientY - rect.top + frame.scrollTop
        }
        dragRef.current = {
          kind: entry.kind,
          id: entry.id,
          path: entry.path,
          startCanvasX,
          startCanvasY,
          originX: Number.isFinite(entry.x) ? entry.x : PAD,
          originY: Number.isFinite(entry.y) ? entry.y : PAD,
          moved: false,
        }
        setSelected({ kind: entry.kind, key: entry.id })
        setDropSlot(null)
        setMenu(null)
      }, [])

      const onPointerMove = useCallback(
        (event) => {
          const current = dragRef.current
          const frame = desktopRef.current
          if (!current || !frame) return
          const rect = frame.getBoundingClientRect()
          const canvasX = event.clientX - rect.left + frame.scrollLeft
          const canvasY = event.clientY - rect.top + frame.scrollTop
          const dx = canvasX - current.startCanvasX
          const dy = canvasY - current.startCanvasY
          if (!current.moved && Math.hypot(dx, dy) < 4) return
          current.moved = true
          const position = clampToCanvas(current.originX + dx, current.originY + dy, frame.clientWidth, canvasHeight)
          setDrag({ kind: current.kind, id: current.id, x: position.x, y: position.y })
          setDropSlot(nearestSlot(position.x + ICON_W / 2, position.y + ICON_CENTER_Y, columns, rowCount))
          let folderId = null
          try {
            for (const holder of document.querySelectorAll('[data-dsd-folder-id]')) {
              if (holder.getAttribute('data-dsd-folder-id') === current.id) continue
              const rectOfFolder = holder.getBoundingClientRect()
              if (event.clientX >= rectOfFolder.left && event.clientX <= rectOfFolder.right && event.clientY >= rectOfFolder.top && event.clientY <= rectOfFolder.bottom) {
                folderId = holder.getAttribute('data-dsd-folder-id')
                break
              }
            }
          } catch {
            folderId = null
          }
          if (folderId !== dropFolder) setDropFolder(folderId)
        },
        [canvasHeight, columns, rowCount, dropFolder],
      )

      const onPointerUp = useCallback(
        (event) => {
          const current = dragRef.current
          const frame = desktopRef.current
          dragRef.current = null
          setDropSlot(null)
          if (!current || !frame) {
            setDrag(null)
            setDropFolder(null)
            return
          }
          if (current.moved) {
            const rect = frame.getBoundingClientRect()
            const canvasX = event.clientX - rect.left + frame.scrollLeft
            const canvasY = event.clientY - rect.top + frame.scrollTop
            const dx = canvasX - current.startCanvasX
            const dy = canvasY - current.startCanvasY
            const position = clampToCanvas(current.originX + dx, current.originY + dy, frame.clientWidth, canvasHeight)
            const target = nearestSlot(position.x + ICON_W / 2, position.y + ICON_CENTER_Y, columns, rowCount)
            const forbiddenFolder = current.kind === 'folder' && dropFolder && descendantFolders(library.folders, current.id).has(dropFolder)
            if (dropFolder && !forbiddenFolder) {
              store.move(current.kind, current.id, dropFolder)
              showToast(t('toast.moved'))
            } else if (!forbiddenFolder && target) {
              const occupant = allEntries.find((entry) => {
                if (entry.kind === current.kind && entry.id === current.id) return false
                const slot = positionSlot(entry.x, entry.y, columns)
                return Boolean(slot && slot.index === target.index)
              })
              if (occupant) {
                store.setPositions([
                  { kind: current.kind, id: current.id, x: target.x, y: target.y },
                  { kind: occupant.kind, id: occupant.id, x: current.originX, y: current.originY },
                ])
                showToast(t('toast.moved'))
              } else if (current.originX !== target.x || current.originY !== target.y) {
                store.setPositions([{ kind: current.kind, id: current.id, x: target.x, y: target.y }])
                showToast(t('toast.moved'))
              }
            }
          }
          setDrag(null)
          setDropFolder(null)
        },
        [allEntries, columns, dropFolder, library.folders, rowCount, showToast],
      )

      useEffect(() => {
        if (!menu) return undefined
        const onDown = (event) => {
          const target = event.target
          if (target && target.closest && target.closest('.dsd-menu')) return
          setMenu(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        return () => document.removeEventListener('pointerdown', onDown, true)
      }, [menu])

      useEffect(() => {
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          if (menu) return setMenu(null)
          if (renaming) {
            renameRef.current = null
            return setRenaming(null)
          }
          if (confirmState) return setConfirmState(null)
          if (picker.open) return closePicker()
          if (selected) return setSelected(null)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
      }, [menu, renaming, confirmState, picker.open, selected, closePicker])

      const chain = useMemo(() => folderChain(library.folders, currentFolder), [library.folders, currentFolder])
      const contextEntry = useMemo(() => {
        if (!menu) return null
        return allEntries.find((entry) => entry.kind === menu.kind && entry.id === menu.key) || null
      }, [menu, allEntries])

      const menuFolders = useMemo(() => {
        if (!contextEntry) return []
        const blocked = contextEntry.kind === 'folder' ? descendantFolders(library.folders, contextEntry.id) : new Set()
        const result = []
        if (currentFolder) result.push({ id: null, name: t('menu.root') })
        for (const folder of Object.values(library.folders).sort((left, right) => left.name.localeCompare(right.name))) {
          if (folder.id === currentFolder) continue
          if (blocked.has(folder.id)) continue
          result.push({ id: folder.id, name: folder.name })
        }
        return result
      }, [contextEntry, library.folders, currentFolder])

      const pickerRows = useMemo(() => {
        const query = picker.query.trim().toLowerCase()
        return picker.files.filter((file) => {
          if (!query) return true
          return file.name.toLowerCase().includes(query) || file.rel.toLowerCase().includes(query) || file.rootTitle.toLowerCase().includes(query)
        })
      }, [picker.files, picker.query])

      const togglePicked = useCallback(
        (path) => {
          setPicker((previous) => {
            if (library.items[path]) return previous
            const selectedSet = new Set(previous.selected)
            if (selectedSet.has(path)) selectedSet.delete(path)
            else selectedSet.add(path)
            return { ...previous, selected: selectedSet }
          })
        },
        [library.items],
      )

      const selectAllVisible = useCallback(() => {
        setPicker((previous) => {
          const selectedSet = new Set(previous.selected)
          const query = previous.query.trim().toLowerCase()
          for (const file of previous.files) {
            if (library.items[file.path]) continue
            if (query && !(file.name.toLowerCase().includes(query) || file.rel.toLowerCase().includes(query) || file.rootTitle.toLowerCase().includes(query))) continue
            selectedSet.add(file.path)
          }
          return { ...previous, selected: selectedSet }
        })
      }, [library.items])

      const renderTab = (tab) => {
        if (tab === 'home') {
          return h(
            'button',
            { key: 'home', className: 'dsd-tab', type: 'button', 'data-active': library.activeTab === 'home' ? 'true' : 'false', onClick: () => store.setActive('home') },
            icon('home', 13),
            h('span', { className: 'dsd-tab-label' }, t('tab.home')),
          )
        }
        const item = library.items[tab]
        if (!item) return null
        return h(
          'button',
          { key: tab, className: 'dsd-tab', type: 'button', 'data-active': library.activeTab === tab ? 'true' : 'false', title: tab, onClick: () => store.setActive(tab) },
          icon('doc', 13),
          h('span', { className: 'dsd-tab-label' }, item.name || basename(tab)),
          h(
            'span',
            {
              className: 'dsd-tab-close',
              role: 'button',
              tabIndex: -1,
              title: t('tab.close'),
              'aria-label': t('tab.close'),
              onClick: (event) => {
                event.stopPropagation()
                store.closeTab(tab)
              },
            },
            icon('close', 11),
          ),
        )
      }

      const renderEntry = (entry) => {
        const isDragging = drag && drag.kind === entry.kind && drag.id === entry.id
        const x = isDragging ? drag.x : entry.x
        const y = isDragging ? drag.y : entry.y
        const isSelected = selected && selected.kind === entry.kind && selected.key === entry.id
        const isDropTarget = entry.kind === 'folder' && dropFolder === entry.id
        const isRenaming = renaming && renaming.kind === entry.kind && renaming.key === entry.id
        const folderAttrs = entry.kind === 'folder' ? { 'data-dsd-folder-id': entry.id } : {}
        return h(
          'div',
          {
            key: `${entry.kind}:${entry.id}`,
            className: 'dsd-item',
            role: 'button',
            tabIndex: 0,
            style: { left: `${Number.isFinite(x) ? x : -999}px`, top: `${Number.isFinite(y) ? y : -999}px` },
            title: entry.kind === 'file' ? entry.path : entry.name,
            'data-selected': isSelected ? 'true' : 'false',
            'data-dragging': isDragging ? 'true' : 'false',
            'data-drop': isDropTarget ? 'true' : 'false',
            'data-pending': !Number.isFinite(x) || !Number.isFinite(y) ? 'true' : 'false',
            ...folderAttrs,
            onPointerDown: (event) => onPointerDown(event, entry),
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
            onDoubleClick: () => openEntry(entry),
            onContextMenu: (event) => {
              event.preventDefault()
              setSelected({ kind: entry.kind, key: entry.id })
              setMenu({
                kind: entry.kind,
                key: entry.id,
                x: Math.max(8, Math.min(event.clientX, window.innerWidth - 258)),
                y: Math.max(8, Math.min(event.clientY, window.innerHeight - 340)),
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
                removeItem(entry.path)
              }
            },
          },
          h(
            'div',
            { className: 'dsd-glyph', 'data-kind': entry.kind },
            icon(entry.kind === 'folder' ? 'folder' : 'doc', 30),
            entry.kind === 'folder' && entry.count > 0 ? h('span', { className: 'dsd-badge' }, entry.count > 99 ? '99+' : String(entry.count)) : null,
          ),
          isRenaming
            ? h('input', {
                className: 'dsd-rename-input',
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
            : h('div', { className: 'dsd-label' }, entry.name),
        )
      }

      const renderHome = () =>
        h(
          'div',
          { className: 'dsd-home' },
          h(
            'div',
            { className: 'dsd-toolbar' },
            currentFolder
              ? h(
                  'button',
                  {
                    className: 'dsd-crumb-back',
                    type: 'button',
                    title: t('action.back'),
                    'aria-label': t('action.back'),
                    onClick: () => {
                      const folder = library.folders[currentFolder]
                      setCurrentFolder(folder ? folder.parentId ?? null : null)
                      setSelected(null)
                    },
                  },
                  icon('back', 14),
                )
              : null,
            h(
              'div',
              { className: 'dsd-crumb' },
              h(
                'button',
                {
                  className: 'dsd-crumb-btn',
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
                  h('span', { className: 'dsd-crumb-sep' }, '/'),
                  index === chain.length - 1
                    ? h('span', { className: 'dsd-crumb-current' }, folder.name)
                    : h(
                        'button',
                        {
                          className: 'dsd-crumb-btn',
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
            h('span', { className: 'dsd-count' }, t('status.count', { count: Object.keys(library.items).length })),
            h('div', { className: 'dsd-toolbar-spacer' }),
            h(
              'div',
              { className: 'dsd-search' },
              icon('search', 13),
              h('input', {
                value: search,
                placeholder: t('picker.search'),
                'aria-label': t('picker.search'),
                spellCheck: false,
                onChange: (event) => setSearch(event.currentTarget.value),
              }),
            ),
            h(
              'button',
              { className: 'dsd-btn', type: 'button', onClick: createFolder, title: t('action.newFolder') },
              icon('folder-plus', 14),
              h('span', null, t('action.newFolder')),
            ),
          ),
          h(
            'div',
            { className: 'dsd-desktop-wrap' },
            h(
              'div',
              {
                className: 'dsd-desktop',
                ref: desktopRef,
                onPointerMove,
                onPointerUp,
                onPointerCancel: onPointerUp,
                onClick: (event) => {
                  const target = event.target
                  if (target === event.currentTarget || (target && target.classList && target.classList.contains('dsd-desktop-canvas'))) {
                    setSelected(null)
                    setMenu(null)
                  }
                },
              },
              h(
                'div',
                { className: 'dsd-desktop-canvas', style: { height: `${canvasHeight}px` } },
                drag && dropSlot ? h('div', { className: 'dsd-slot-ghost', style: { left: `${dropSlot.x}px`, top: `${dropSlot.y}px` } }) : null,
                entries.map(renderEntry),
                allEntries.length === 0
                  ? h(
                      'div',
                      { className: 'dsd-empty' },
                      h('div', { className: 'dsd-empty-icon' }, icon('folder', 30)),
                      h('p', { className: 'dsd-empty-title' }, currentFolder ? t('empty.folderTitle') : t('empty.title')),
                      h('p', { className: 'dsd-empty-hint' }, currentFolder ? t('empty.folderHint') : t('empty.hint')),
                      !currentFolder
                        ? h(
                            'button',
                            { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: openPicker },
                            icon('plus', 14),
                            h('span', null, t('action.add')),
                          )
                        : null,
                    )
                  : null,
                allEntries.length > 0 && entries.length === 0 ? h('div', { className: 'dsd-no-match' }, t('picker.empty')) : null,
              ),
            ),
          ),
        )

      const renderDoc = () => {
        if (!activeItem) return null
        return h(
          'div',
          { className: 'dsd-doc' },
          h(
            'div',
            { className: 'dsd-doc-scroll' },
            h(
              'div',
              { className: 'dsd-doc-inner' },
              h(
                'div',
                { className: 'dsd-doc-pathbar' },
                icon('doc', 14),
                h('span', { className: 'dsd-doc-path', title: activePath }, activePath),
                h(
                  'button',
                  { className: 'dsd-btn', type: 'button', 'data-quiet': true, title: t('action.copyPath'), 'aria-label': t('action.copyPath'), onClick: () => copyText(activePath) },
                  icon('copy', 14),
                ),
                h(
                  'button',
                  { className: 'dsd-btn', type: 'button', 'data-quiet': true, title: t('action.refreshContent'), 'aria-label': t('action.refreshContent'), onClick: reloadDoc },
                  icon('refresh', 14),
                ),
              ),
              doc.status === 'loading' ? h('div', { className: 'dsd-doc-loading' }, t('doc.loading')) : null,
              doc.status === 'error'
                ? h(
                    'div',
                    { className: 'dsd-doc-error' },
                    h('span', null, t('doc.failed', { reason: doc.error || 'unknown' })),
                    h(
                      'button',
                      { className: 'dsd-btn', type: 'button', onClick: () => removeItem(activePath) },
                      icon('trash', 13),
                      h('span', null, t('action.remove')),
                    ),
                  )
                : null,
              doc.status === 'ready'
                ? h(
                    'div',
                    { className: 'dsd-doc-body' },
                    doc.truncated ? h('div', { className: 'dsd-doc-note' }, t('doc.truncated')) : null,
                    doc.content.trim() === '' ? h('div', { className: 'dsd-doc-empty' }, t('doc.empty')) : renderMarkdown(doc.content, 'doc'),
                  )
                : null,
            ),
          ),
        )
      }

      const renderPicker = () => {
        const selectedCount = picker.selected.size
        const visibleAddable = pickerRows.filter((file) => !library.items[file.path])
        const allVisibleSelected = visibleAddable.length > 0 && visibleAddable.every((file) => picker.selected.has(file.path))
        return h(
          'div',
          { className: 'dsd-picker', onPointerDown: (event) => { if (event.target === event.currentTarget) closePicker() } },
          h(
            'div',
            { className: 'dsd-picker-card', role: 'dialog', 'aria-modal': true, 'aria-label': t('picker.title') },
            h(
              'div',
              { className: 'dsd-picker-head' },
              h('div', { className: 'dsd-picker-heading' }, h('h2', { className: 'dsd-picker-title' }, t('picker.title')), h('div', { className: 'dsd-picker-sub' }, t('picker.subtitle'))),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', 'data-quiet': true, onClick: openPicker, title: t('action.refresh'), 'aria-label': t('action.refresh') },
                icon('refresh', 14),
              ),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', 'data-quiet': true, onClick: closePicker, title: t('action.close'), 'aria-label': t('action.close') },
                icon('close', 14),
              ),
            ),
            h(
              'div',
              { className: 'dsd-picker-tools' },
              h(
                'div',
                { className: 'dsd-search', style: { flex: '1 1 200px' } },
                icon('search', 13),
                h('input', {
                  value: picker.query,
                  placeholder: t('picker.search'),
                  'aria-label': t('picker.search'),
                  spellCheck: false,
                  onChange: (event) => {
                    const value = event.currentTarget.value
                    setPicker((previous) => ({ ...previous, query: value }))
                  },
                }),
              ),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', onClick: allVisibleSelected ? () => setPicker((previous) => ({ ...previous, selected: new Set() })) : selectAllVisible },
                h('span', null, allVisibleSelected ? t('action.clearSelection') : t('action.selectAll')),
              ),
            ),
            h(
              'div',
              { className: 'dsd-picker-list' },
              picker.status === 'loading' ? h('div', { className: 'dsd-picker-status' }, t('picker.loading')) : null,
              picker.status === 'error'
                ? h(
                    'div',
                    { className: 'dsd-picker-status' },
                    h('div', null, t('picker.failed', { reason: picker.error || 'unknown' })),
                    h('button', { className: 'dsd-btn', type: 'button', onClick: openPicker, style: { marginTop: '10px' } }, h('span', null, t('action.retry'))),
                  )
                : null,
              picker.status === 'ready' && pickerRows.length === 0 ? h('div', { className: 'dsd-picker-status' }, t('picker.empty')) : null,
              picker.status === 'ready'
                ? pickerRows.map((file) => {
                    const inLibrary = Boolean(library.items[file.path])
                    const checked = picker.selected.has(file.path)
                    return h(
                      'button',
                      {
                        key: file.path,
                        className: 'dsd-picker-row',
                        type: 'button',
                        role: 'checkbox',
                        'aria-checked': checked ? 'true' : 'false',
                        disabled: inLibrary,
                        onClick: () => togglePicked(file.path),
                      },
                      h('span', { className: 'dsd-picker-check' }, checked ? icon('check', 12) : null),
                      h(
                        'span',
                        { className: 'dsd-picker-text' },
                        h('span', { className: 'dsd-picker-name' }, file.name),
                        h('span', { className: 'dsd-picker-path', title: file.path }, `${file.rootTitle} / ${file.rel}`),
                      ),
                      inLibrary ? h('span', { className: 'dsd-picker-added' }, t('picker.added')) : null,
                      h('span', { className: 'dsd-picker-meta' }, `${formatTime(file.mtime)} · ${formatSize(file.size)}`),
                    )
                  })
                : null,
            ),
            h(
              'div',
              { className: 'dsd-picker-foot' },
              h(
                'span',
                { className: 'dsd-picker-foot-meta' },
                t('picker.selected', { count: selectedCount }),
                picker.status === 'ready' ? ` · ${t('picker.roots', { count: picker.roots.length })}` : '',
                picker.partial ? ` · ${t('picker.partial')}` : '',
              ),
              h('button', { className: 'dsd-btn', type: 'button', onClick: closePicker }, h('span', null, t('action.cancel'))),
              h(
                'button',
                { className: 'dsd-btn', type: 'button', 'data-primary': true, disabled: selectedCount === 0, onClick: addSelected },
                icon('plus', 14),
                h('span', null, `${t('action.addSelected')}${selectedCount > 0 ? ` (${selectedCount})` : ''}`),
              ),
            ),
          ),
        )
      }

      return h(
        'div',
        { className: 'dsd-panel', ref: panelRef },
        h(
          'div',
          { className: 'dsd-tabbar' },
          h('div', { className: 'dsd-tabs' }, [renderTab('home'), ...library.openTabs.map((path) => renderTab(path))]),
          h(
            'div',
            { className: 'dsd-tabbar-actions' },
            h(
              'button',
              { className: 'dsd-btn', type: 'button', 'data-primary': true, onClick: openPicker, title: t('action.add') },
              icon('plus', 14),
              h('span', null, t('action.add')),
            ),
          ),
        ),
        activePath && activeItem ? renderDoc() : renderHome(),
        picker.open ? renderPicker() : null,
        menu && contextEntry
          ? h(
              'div',
              { className: 'dsd-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, role: 'menu' },
              h('div', { className: 'dsd-menu-title', title: contextEntry.name }, contextEntry.name),
              h(
                'button',
                { className: 'dsd-menu-item', type: 'button', role: 'menuitem', onClick: () => openEntry(contextEntry) },
                icon(contextEntry.kind === 'folder' ? 'folder' : 'doc', 14),
                h('span', null, t('action.open')),
              ),
              h(
                'button',
                { className: 'dsd-menu-item', type: 'button', role: 'menuitem', onClick: () => startRename(contextEntry) },
                icon('file-plus', 14),
                h('span', null, t('action.rename')),
              ),
              contextEntry.kind === 'file'
                ? h(
                    'button',
                    { className: 'dsd-menu-item', type: 'button', role: 'menuitem', onClick: () => copyText(contextEntry.path) },
                    icon('copy', 14),
                    h('span', null, t('action.copyPath')),
                  )
                : null,
              h('div', { className: 'dsd-menu-sep' }),
              h('div', { className: 'dsd-menu-heading' }, t('menu.separator')),
              menuFolders.length === 0
                ? h('div', { className: 'dsd-menu-hint' }, t('menu.moveHint'))
                : menuFolders.map((folder) =>
                    h(
                      'button',
                      {
                        key: folder.id || 'root',
                        className: 'dsd-menu-item',
                        type: 'button',
                        role: 'menuitem',
                        onClick: () => moveEntry(contextEntry, folder.id),
                      },
                      icon('folder', 14),
                      h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, folder.name),
                    ),
                  ),
              h('div', { className: 'dsd-menu-sep' }),
              contextEntry.kind === 'file'
                ? h(
                    'button',
                    { className: 'dsd-menu-item', type: 'button', role: 'menuitem', 'data-danger': true, onClick: () => removeItem(contextEntry.path) },
                    icon('trash', 14),
                    h('span', null, t('action.remove')),
                  )
                : h(
                    'button',
                    { className: 'dsd-menu-item', type: 'button', role: 'menuitem', 'data-danger': true, onClick: () => requestDeleteFolder(contextEntry) },
                    icon('trash', 14),
                    h('span', null, t('action.deleteFolder')),
                  ),
            )
          : null,
        confirmState
          ? h(
              'div',
              { className: 'dsd-modal' },
              h(
                'div',
                { className: 'dsd-modal-card' },
                h('h3', { className: 'dsd-modal-title' }, confirmState.title),
                h('p', { className: 'dsd-modal-text' }, confirmState.message),
                h(
                  'div',
                  { className: 'dsd-modal-actions' },
                  h('button', { className: 'dsd-btn', type: 'button', onClick: () => setConfirmState(null) }, h('span', null, t('confirm.cancel'))),
                  h('button', { className: 'dsd-btn', type: 'button', 'data-danger': true, onClick: () => confirmState.onConfirm() }, h('span', null, t('confirm.delete'))),
                ),
              ),
            )
          : null,
        toast ? h('div', { className: 'dsd-toast' }, toast) : null,
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

        let layout
        try {
          layout = ctx.get('layout', false)
        } catch {
          layout = undefined
        }
        const toggleSidebar = () => {
          try {
            ;(layout || ctx.get('layout', false))?.toggleSidebar?.()
          } catch {
            /* layout may not be mounted in this composition */
          }
        }
        const SidebarToggleEntry = () => h(SidebarToggle, { toggleSidebar })

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
        disposers.push(
          ctx.slots.inject('shell.overlay', () =>
            ctx.slots.register(
              {
                name: 'shell.overlay',
                id: 'docdesk-sidebar-toggle',
                order: 50,
              },
              SidebarToggleEntry,
            ),
          ),
        )
        disposers.push(
          ctx.slots.inject('deliverables.file.actions', () =>
            ctx.slots.register(
              {
                name: 'deliverables.file.actions',
                id: 'docdesk-add-to-library',
                order: 20,
              },
              FileAction,
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
