/**
 * Host half of dsh-docdesk.
 *
 * Serves two read-only JSON endpoints used by the client panel:
 *   GET /api/dsh-docdesk/list?refresh=1
 *   GET /api/dsh-docdesk/read?path=<absolute markdown path>
 *
 * The scan covers every registered workspace, the profile's default working
 * directory, and the working directories of live agents, so Markdown files an
 * agent writes anywhere the user works show up in the 资料区 panel.
 *
 * Both endpoints sit behind the same loopback / paired-device trust fence used
 * by the bundled management pages: a request must arrive on a loopback socket
 * with a loopback Host header and same-origin browser markers (or carry a live
 * paired-device cookie). Reads are additionally confined to the scanned roots.
 */

import { promises as fs, readFileSync } from 'node:fs'
import path from 'node:path'

const LIST_ROUTE = '/api/dsh-docdesk/list'
const READ_ROUTE = '/api/dsh-docdesk/read'
const RESOLVE_ROUTE = '/api/dsh-docdesk/resolve'
const MERMAID_ROUTE = '/api/dsh-docdesk/mermaid.js'

const MAX_FILES = 3000
const MAX_DIRS_PER_ROOT = 4000
const MAX_DIRS_TOTAL = 16000
const MAX_DEPTH = 6
const MAX_READ_BYTES = 2 * 1024 * 1024
const CACHE_MS = 4000

/** Directories that never contain materials worth listing. */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.hg',
  '.svn',
  '.pnpm',
  '.cache',
  '.next',
  '.nuxt',
  '.output',
  '.turbo',
  '.parcel-cache',
  '.venv',
  'venv',
  '__pycache__',
  'dist',
  'build',
  'out',
  'target',
  'vendor',
  'coverage',
  'release',
  'releases',
])

const MARKDOWN_RE = /\.(md|markdown|mdx)$/i

/* ------------------------------------------------------------------ trust */

function isIPv4Loopback(v4) {
  const parts = v4.split('.')
  return parts.length === 4 && parts[0] === '127' && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

function isLoopbackAddress(address) {
  if (address === undefined) return false
  const normalized = address.toLowerCase()
  if (normalized === '::1') return true
  if (normalized.startsWith('::ffff:')) return isIPv4Loopback(normalized.slice(7))
  return isIPv4Loopback(normalized)
}

function isLoopbackHostname(hostname) {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  return isIPv4Loopback(hostname)
}

function isProxiedRequest(request) {
  return request.headers['cf-connecting-ip'] !== undefined || request.headers['x-forwarded-for'] !== undefined
}

/** Loopback socket, no forwarding hop, loopback Host header, same-origin markers. */
function isLoopbackRequest(request) {
  if (!isLoopbackAddress(request.socket?.remoteAddress)) return false
  if (isProxiedRequest(request)) return false
  const host = request.headers.host
  if (typeof host !== 'string') return false
  let hostUrl
  try {
    hostUrl = new URL('http://' + host)
  } catch {
    return false
  }
  if (!isLoopbackHostname(hostUrl.hostname)) return false
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

function lookupPairing(ctx) {
  try {
    if (typeof ctx.get === 'function') {
      const viaGet = ctx.get('remoteWebUiPairing', false)
      if (viaGet !== undefined) return viaGet ?? undefined
    }
  } catch {
    /* service not loaded in this composition */
  }
  try {
    return ctx.remoteWebUiPairing ?? undefined
  } catch {
    return undefined
  }
}

function isAllowed(ctx, request) {
  if (isLoopbackRequest(request)) return true
  try {
    return lookupPairing(ctx)?.isPairedDevice?.(request) === true
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ roots */

function canonicalKey(value) {
  const resolved = path.resolve(value)
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}

/** Every directory whose Markdown files belong in the library. */
function collectRoots(ctx) {
  const roots = []
  const seen = new Set()

  const push = (value, title) => {
    if (typeof value !== 'string' || value.trim() === '') return
    let resolved
    try {
      resolved = path.resolve(value)
    } catch {
      return
    }
    const key = canonicalKey(resolved)
    if (seen.has(key)) return
    seen.add(key)
    roots.push({
      id: key,
      path: resolved,
      title: typeof title === 'string' && title.trim() !== '' ? title.trim() : path.basename(resolved) || resolved,
    })
  }

  let registry
  try {
    registry = ctx.get('workspaceRegistry', false)
  } catch {
    registry = undefined
  }
  if (registry && typeof registry.list === 'function') {
    try {
      for (const workspace of registry.list()) push(workspace.path, workspace.title)
    } catch {
      /* registry not ready yet */
    }
  }

  let workingDirectory
  try {
    workingDirectory = ctx.get('workingDirectory', false)
  } catch {
    workingDirectory = undefined
  }
  if (workingDirectory) {
    try {
      push(workingDirectory.defaultDirectory, '默认目录')
    } catch {
      /* absent in some compositions */
    }
    let agentService
    try {
      agentService = ctx.get('agents', false)
    } catch {
      agentService = undefined
    }
    if (workingDirectory.get && agentService && typeof agentService.list === 'function') {
      for (const agent of agentService.list()) {
        try {
          push(workingDirectory.get(agent.session), agent.session?.header?.title)
        } catch {
          /* a session may not have an effective directory yet */
        }
      }
    }
  }

  if (roots.length === 0) push(process.cwd(), '当前目录')
  return roots
}

/* ------------------------------------------------------------------- scan */

async function scanRoots(roots) {
  const files = []
  let visitedDirs = 0
  let truncated = false
  let partial = false

  for (const root of roots) {
    if (files.length >= MAX_FILES || visitedDirs >= MAX_DIRS_TOTAL) {
      if (files.length >= MAX_FILES) truncated = true
      if (visitedDirs >= MAX_DIRS_TOTAL) partial = true
      break
    }
    const queue = [{ dir: root.path, depth: 0 }]
    let cursor = 0
    let rootDirs = 0
    while (cursor < queue.length) {
      if (files.length >= MAX_FILES) {
        truncated = true
        break
      }
      if (rootDirs >= MAX_DIRS_PER_ROOT || visitedDirs >= MAX_DIRS_TOTAL) {
        partial = true
        break
      }
      const current = queue[cursor++]
      visitedDirs += 1
      rootDirs += 1
      let entries
      try {
        entries = await fs.readdir(current.dir, { withFileTypes: true })
      } catch {
        continue
      }
      for (const entry of entries) {
        if (entry.isSymbolicLink()) continue
        if (entry.isDirectory()) {
          if (current.depth >= MAX_DEPTH) continue
          const name = entry.name.toLowerCase()
          if (SKIP_DIRS.has(name)) continue
          if (name.startsWith('.')) continue
          queue.push({ dir: path.join(current.dir, entry.name), depth: current.depth + 1 })
          continue
        }
        if (!entry.isFile() || !MARKDOWN_RE.test(entry.name)) continue
        const absolute = path.join(current.dir, entry.name)
        let stat
        try {
          stat = await fs.stat(absolute)
        } catch {
          continue
        }
        if (!stat.isFile()) continue
        files.push({
          path: absolute,
          name: entry.name,
          rel: path.relative(root.path, absolute).split(path.sep).join('/'),
          rootId: root.id,
          rootTitle: root.title,
          rootPath: root.path,
          size: stat.size,
          mtime: stat.mtimeMs,
        })
        if (files.length >= MAX_FILES) {
          truncated = true
          break
        }
      }
    }
  }

  files.sort((a, b) => b.mtime - a.mtime || a.path.localeCompare(b.path))
  return { files, truncated, partial, visitedDirs }
}

/* ------------------------------------------------------------------ cache */

let cache = { at: 0, signature: '', files: [], truncated: false, partial: false, visitedDirs: 0 }

async function listFiles(ctx, force) {
  const roots = collectRoots(ctx)
  const signature = roots.map((root) => root.id).join('\u0000')
  const now = Date.now()
  let result
  if (!force && cache.signature === signature && now - cache.at < CACHE_MS) {
    result = { files: cache.files, truncated: cache.truncated, partial: cache.partial, visitedDirs: cache.visitedDirs }
  } else {
    result = await scanRoots(roots)
    cache = { at: now, signature, files: result.files, truncated: result.truncated, partial: result.partial, visitedDirs: result.visitedDirs }
  }
  return { roots, ...result, scannedAt: Date.now() }
}

/* --------------------------------------------------------------- helpers */

function sendJson(response, status, body) {
  const payload = JSON.stringify(body)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, max-age=0',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
  })
  response.end(payload)
}

let mermaidAsset = null

function handleMermaid(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method && request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { error: 'method-not-allowed' })
    return
  }
  try {
    if (!mermaidAsset) mermaidAsset = readFileSync(new URL('./vendor/mermaid.min.js', import.meta.url))
    response.writeHead(200, {
      'content-type': 'text/javascript; charset=utf-8',
      'content-length': mermaidAsset.length,
      'cache-control': 'public, max-age=31536000, immutable',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
    })
    if (request.method === 'HEAD') {
      response.end()
    } else {
      response.end(mermaidAsset)
    }
  } catch {
    sendJson(response, 500, { error: 'mermaid-asset-unavailable' })
  }
}

function requestUrl(request) {
  try {
    return new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
  } catch {
    return null
  }
}

function isInside(root, target) {
  const relative = path.relative(root, target)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

async function resolveInsideRoots(roots, target) {
  let realTarget
  try {
    realTarget = await fs.realpath(target)
  } catch {
    return undefined
  }
  for (const root of roots) {
    let realRoot
    try {
      realRoot = await fs.realpath(root.path)
    } catch {
      continue
    }
    if (isInside(realRoot, realTarget)) return realTarget
  }
  return undefined
}

/* --------------------------------------------------------------- handlers */

async function handleList(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' })
    response.end()
    return
  }
  const url = requestUrl(request)
  const force = url?.searchParams.get('refresh') === '1'
  const result = await listFiles(ctx, force)
  sendJson(response, 200, {
    roots: result.roots.map(({ id, title, path: rootPath }) => ({ id, title, path: rootPath })),
    files: result.files,
    truncated: result.truncated,
    partial: result.partial,
    scannedAt: result.scannedAt,
  })
}

async function handleRead(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' })
    response.end()
    return
  }
  const url = requestUrl(request)
  const raw = url?.searchParams.get('path')
  if (!raw) {
    sendJson(response, 400, { error: 'missing-path' })
    return
  }
  let target
  try {
    target = path.resolve(raw)
  } catch {
    sendJson(response, 400, { error: 'invalid-path' })
    return
  }
  if (!MARKDOWN_RE.test(target)) {
    sendJson(response, 400, { error: 'not-markdown' })
    return
  }
  const roots = collectRoots(ctx)
  const realTarget = await resolveInsideRoots(roots, target)
  if (!realTarget) {
    sendJson(response, 403, { error: 'outside-workspace' })
    return
  }
  let stat
  try {
    stat = await fs.stat(realTarget)
  } catch {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  if (!stat.isFile()) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  let content = ''
  let truncated = false
  try {
    if (stat.size > MAX_READ_BYTES) {
      const handle = await fs.open(realTarget, 'r')
      try {
        const buffer = Buffer.alloc(MAX_READ_BYTES)
        const { bytesRead } = await handle.read(buffer, 0, MAX_READ_BYTES, 0)
        content = buffer.subarray(0, bytesRead).toString('utf8')
      } finally {
        await handle.close()
      }
      truncated = true
    } else {
      content = await fs.readFile(realTarget, 'utf8')
    }
  } catch {
    sendJson(response, 500, { error: 'read-failed' })
    return
  }
  sendJson(response, 200, {
    path: target,
    name: path.basename(target),
    content,
    size: stat.size,
    mtime: stat.mtimeMs,
    truncated,
  })
}

/* --------------------------------------------------------------- presented */

function coordinate(value) {
  return value !== null && /^\d+$/u.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : undefined
}

function isPresentedData(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const { turn, callId, files } = value
  return Number.isSafeInteger(turn) && turn >= 1 && typeof callId === 'string' && Array.isArray(files)
}

function isPresentedFile(value) {
  return typeof value === 'object' && value !== null && typeof value.path === 'string' && value.path.trim() !== ''
}

/**
 * Resolve a presented file's coordinate (sessionId, seq, index) to an absolute
 * path. The file action card receives only this coordinate, never the path, so
 * the browser asks the Host to read the durable event and map the path through
 * the same workspace filesystem used by the rest of the Host.
 */
async function handleResolve(ctx, request, response) {
  if (!isAllowed(ctx, request)) {
    sendJson(response, 403, { error: 'forbidden' })
    return
  }
  const url = requestUrl(request)
  const sessionId = url?.searchParams.get('sessionId')
  const seq = coordinate(url?.searchParams.get('seq') ?? null)
  const index = coordinate(url?.searchParams.get('index') ?? null)
  if (!sessionId || seq === undefined || index === undefined) {
    sendJson(response, 400, { error: 'invalid-coordinates' })
    return
  }
  let sessionQuery
  try {
    sessionQuery = ctx.get('sessionQuery', false)
  } catch {
    sessionQuery = undefined
  }
  if (!sessionQuery || typeof sessionQuery.readEvent !== 'function') {
    sendJson(response, 503, { error: 'session-query-unavailable' })
    return
  }
  const signal = AbortSignal.timeout(8000)
  let window
  try {
    window = await sessionQuery.readEvent({ sessionId, seq, before: 0, after: 0 }, signal)
  } catch {
    sendJson(response, 404, { error: 'event-not-found' })
    return
  }
  const target = window?.target
  const file = target?.type === 'deliverables/presented' && isPresentedData(target.data) ? target.data.files[index] : undefined
  if (!isPresentedFile(file)) {
    sendJson(response, 404, { error: 'presented-file-not-found' })
    return
  }
  let workingDirectory
  try {
    workingDirectory = ctx.get('workingDirectory', false)
  } catch {
    workingDirectory = undefined
  }
  const root = window?.session?.cwd || workingDirectory?.defaultDirectory
  if (!root) {
    sendJson(response, 503, { error: 'workspace-unavailable' })
    return
  }
  let absolutePath
  try {
    let workspaceFiles
    try {
      workspaceFiles = ctx.get('workspaceFiles', false)
    } catch {
      workspaceFiles = undefined
    }
    if (workspaceFiles && typeof workspaceFiles.stat === 'function') {
      const stat = await workspaceFiles.stat({ sessionId, workspaceRoot: root }, file.path, signal)
      absolutePath = stat.absolutePath
    } else {
      absolutePath = path.isAbsolute(file.path) ? file.path : path.resolve(root, file.path)
    }
  } catch {
    sendJson(response, 404, { error: 'file-not-found' })
    return
  }
  sendJson(response, 200, { path: absolutePath, name: path.basename(absolutePath) })
}

/* ------------------------------------------------------------------ apply */

export function apply(ctx) {
  let webServer
  try {
    webServer = ctx.get('webServer', false)
  } catch {
    webServer = undefined
  }
  if (!webServer || typeof webServer.register !== 'function') {
    ctx.logger?.warn?.('dsh-docdesk: webServer is unavailable; the 资料区 panel will not load')
    return
  }

  ctx.effect(() => {
    const disposers = [
      webServer.register({
        kind: 'exact',
        path: LIST_ROUTE,
        handler: (request, response) => handleList(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: READ_ROUTE,
        handler: (request, response) => handleRead(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: RESOLVE_ROUTE,
        handler: (request, response) => handleResolve(ctx, request, response),
      }),
      webServer.register({
        kind: 'exact',
        path: MERMAID_ROUTE,
        handler: (request, response) => handleMermaid(ctx, request, response),
      }),
    ]
    return () => {
      for (const dispose of disposers.splice(0)) dispose()
    }
  })
}
