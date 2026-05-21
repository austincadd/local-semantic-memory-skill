#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildBM25, hybridSearch } = require('./lib/hybrid-retrieval');

const WORKSPACE = path.resolve(process.env.MEMORY_LOCAL_WORKSPACE || process.cwd());
const INDEX_DIR = path.join(WORKSPACE, '.memory-local');
const INDEX_FILE = path.join(INDEX_DIR, 'index.json');
const MANIFEST_FILE = path.join(INDEX_DIR, 'manifest.json');
const PROFILES_FILE = process.env.MEMORY_LOCAL_PROFILES
  ? path.resolve(process.env.MEMORY_LOCAL_PROFILES)
  : path.join(INDEX_DIR, 'profiles.json');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_EMBED_MODEL = process.env.MEMORY_LOCAL_EMBED_MODEL || 'nomic-embed-text';
const PROFILE_NAME = process.env.MEMORY_LOCAL_PROFILE || (process.argv.includes('--smoke') ? 'smoke' : 'core');
const EMBED_TIMEOUT_MS = 120_000;
const MAX_SPLIT_DEPTH = 4;

const DEFAULT_PROFILES = {
  smoke: { description: 'Fast validation set: durable memory + lessons + recent daily logs', staticFiles: ['MEMORY.md', 'SESSION-STATE.md', 'memory/README.md', 'memory/lessons.md', 'memory/lessons/2026.md'], recentDailyDays: 3, includeDirs: [], maxChars: 320, maxLines: 10 },
  core: { description: 'Default high-signal local recall set: durable memory + lessons + recent daily logs', staticFiles: ['MEMORY.md', 'SESSION-STATE.md', 'memory/README.md', 'memory/lessons.md', 'memory/lessons/2026.md'], recentDailyDays: 14, includeDirs: [], maxChars: 520, maxLines: 14 },
  expanded: { description: 'Core plus project, decision, and people memory', staticFiles: ['MEMORY.md', 'SESSION-STATE.md', 'memory/README.md', 'memory/lessons.md', 'memory/lessons/2026.md'], recentDailyDays: 21, includeDirs: ['memory/projects', 'memory/decisions', 'memory/people'], maxChars: 520, maxLines: 14 },
  'full-history': { description: 'Expanded profile plus incidents and wider recent daily history', staticFiles: ['MEMORY.md', 'SESSION-STATE.md', 'memory/README.md', 'memory/lessons.md', 'memory/lessons/2026.md'], recentDailyDays: 45, includeDirs: ['memory/projects', 'memory/decisions', 'memory/people', 'memory/incidents'], maxChars: 420, maxLines: 12 },
};

function usage() {
  console.log(`Usage:\n  local-semantic-memory index [--full]\n  local-semantic-memory search "query" [--k 8] [--json]\n  local-semantic-memory stats\n\nEnvironment:\n  MEMORY_LOCAL_WORKSPACE=/path/to/workspace\n  MEMORY_LOCAL_PROFILE=smoke|core|expanded|full-history\n  MEMORY_LOCAL_EMBED_MODEL=all-minilm|nomic-embed-text|...\n  MEMORY_LOCAL_PROFILES=/path/to/profiles.json`);
}
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function sha(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function rel(p) { return path.relative(WORKSPACE, p); }
function loadJsonSafe(file, fallback) { try { if (!fs.existsSync(file)) return fallback; return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function saveJson(file, obj) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(obj, null, 2)); }
function getProfiles() { const disk = loadJsonSafe(PROFILES_FILE, {}); return { ...DEFAULT_PROFILES, ...(disk.profiles || {}) }; }
function getProfile() { const profiles = getProfiles(); const profile = profiles[PROFILE_NAME]; if (!profile) throw new Error(`Unknown MEMORY_LOCAL_PROFILE: ${PROFILE_NAME}`); return { name: PROFILE_NAME, ...profile }; }
function isRecentDailyRel(filePath, recentDailyDays) { const m = filePath.match(/^memory\/daily\/(\d{4}-\d{2}-\d{2})\.md$/); if (!m) return false; const stamp = new Date(`${m[1]}T00:00:00Z`); if (Number.isNaN(stamp.getTime())) return false; return ((Date.now() - stamp.getTime()) / 86400000) <= recentDailyDays; }
function collectFiles(profile) {
  const files = new Set(profile.staticFiles || []);
  const dailyDir = path.join(WORKSPACE, 'memory', 'daily');
  if (fs.existsSync(dailyDir)) for (const name of fs.readdirSync(dailyDir)) { const relPath = `memory/daily/${name}`; if (isRecentDailyRel(relPath, profile.recentDailyDays || 0)) files.add(relPath); }
  for (const relDir of profile.includeDirs || []) {
    const absDir = path.join(WORKSPACE, relDir);
    if (!fs.existsSync(absDir)) continue;
    for (const name of fs.readdirSync(absDir)) if (name.endsWith('.md')) files.add(`${relDir}/${name}`);
  }
  return [...files].map((p) => path.join(WORKSPACE, p)).filter((p) => fs.existsSync(p) && fs.statSync(p).isFile()).sort();
}
function pushChunk(chunks, heading, bodyLines, startLine, endLine) { if (!bodyLines.length) return; const body = bodyLines.join('\n').trim(); if (!body) return; const text = heading ? `${heading}\n${body}` : body; chunks.push({ text, startLine, endLine }); }
function chunkMarkdown(content, filePath, profile) {
  const maxChars = profile.maxChars || 520; const maxLines = profile.maxLines || 14; const lines = content.split('\n'); const chunks = []; let heading = ''; let bodyLines = []; let bodyStartLine = 1; let bodyChars = 0;
  const flush = (endLine) => { pushChunk(chunks, heading, bodyLines, bodyStartLine, endLine); bodyLines = []; bodyChars = 0; };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; const ln = i + 1; const isHeading = /^#{1,6}\s+/.test(line);
    if (isHeading) { flush(ln - 1); heading = line.trim(); continue; }
    if (!bodyLines.length) bodyStartLine = ln;
    const projectedChars = bodyChars + line.length + 1 + (heading ? heading.length + 1 : 0); const projectedLines = bodyLines.length + 1;
    if (bodyLines.length && (projectedChars > maxChars || projectedLines > maxLines)) { flush(ln - 1); bodyStartLine = ln; }
    bodyLines.push(line); bodyChars += line.length + 1;
  }
  flush(lines.length);
  if (!chunks.length && content.trim()) chunks.push({ text: content.trim(), startLine: 1, endLine: lines.length });
  return chunks.map((c, i) => ({ ...c, chunkIndex: i, filePath, id: sha(`${filePath}:${i}:${sha(c.text)}`), contentHash: sha(c.text) }));
}
function splitLongText(text) { const half = Math.floor(text.length / 2); const window = 120; const start = Math.max(1, half - window); const end = Math.min(text.length - 1, half + window); for (let i = half; i <= end; i++) if (/\s/.test(text[i] || '')) return [text.slice(0, i).trim(), text.slice(i).trim()]; for (let i = half; i >= start; i--) if (/\s/.test(text[i] || '')) return [text.slice(0, i).trim(), text.slice(i).trim()]; return [text.slice(0, half).trim(), text.slice(half).trim()]; }
function splitChunkForRetry(chunk) {
  const lines = chunk.text.split('\n'); let heading = ''; let bodyLines = lines;
  if (/^#{1,6}\s+/.test(lines[0])) { heading = lines[0]; bodyLines = lines.slice(1); }
  if (bodyLines.length >= 2) {
    const mid = Math.ceil(bodyLines.length / 2); const firstLines = bodyLines.slice(0, mid); const secondLines = bodyLines.slice(mid);
    if (firstLines.length && secondLines.length) {
      const firstEnd = chunk.startLine + firstLines.length - 1; const secondStart = firstEnd + 1;
      const mk = (body, startLine, endLine, suffix) => { const text = heading ? `${heading}\n${body.join('\n').trim()}` : body.join('\n').trim(); return { ...chunk, startLine, endLine, text, id: sha(`${chunk.filePath}:${startLine}:${endLine}:${sha(text)}`), contentHash: sha(text), splitRetry: true, splitSuffix: suffix }; };
      return [mk(firstLines, chunk.startLine, firstEnd, 'a'), mk(secondLines, secondStart, chunk.endLine, 'b')];
    }
  }
  const bodyText = bodyLines.join('\n').trim(); if (!bodyText || bodyText.length < 80) return null;
  const [leftText, rightText] = splitLongText(bodyText); if (!leftText || !rightText) return null;
  const approxMid = Math.max(chunk.startLine, chunk.startLine + Math.floor((chunk.endLine - chunk.startLine) / 2));
  const mkText = (text, startLine, endLine, suffix) => ({ ...chunk, startLine, endLine, text: heading ? `${heading}\n${text}` : text, id: sha(`${chunk.filePath}:${startLine}:${endLine}:${sha(text)}`), contentHash: sha(text), splitRetry: true, splitSuffix: suffix });
  return [mkText(leftText, chunk.startLine, approxMid, 'ta'), mkText(rightText, approxMid, chunk.endLine, 'tb')];
}
async function embed(text) {
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: text }), signal: AbortSignal.timeout(EMBED_TIMEOUT_MS) });
      if (!res.ok) throw new Error(`Embedding failed (${res.status}): ${await res.text()}`);
      const data = await res.json();
      if (!Array.isArray(data.embedding) || !data.embedding.length) throw new Error('Embedding response missing vector');
      return data.embedding;
    } catch (err) { lastErr = err; if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * attempt)); }
  }
  throw lastErr;
}
async function embedChunkWithRetry(chunk, depth = 0) {
  try { return { embeddedChunks: [{ ...chunk, embedding: await embed(chunk.text) }], skipped: 0 }; }
  catch (err) {
    const msg = err.message || String(err); const contextOverflow = /context length|input length exceeds/i.test(msg);
    if (!contextOverflow || depth >= MAX_SPLIT_DEPTH) return { embeddedChunks: [], skipped: 1, warning: `Skipped chunk ${chunk.filePath}#${chunk.chunkIndex}: ${msg}` };
    const split = splitChunkForRetry(chunk); if (!split) return { embeddedChunks: [], skipped: 1, warning: `Skipped chunk ${chunk.filePath}#${chunk.chunkIndex}: ${msg}` };
    const left = await embedChunkWithRetry(split[0], depth + 1); const right = await embedChunkWithRetry(split[1], depth + 1);
    return { embeddedChunks: [...left.embeddedChunks, ...right.embeddedChunks], skipped: left.skipped + right.skipped, warnings: [...(left.warning ? [left.warning] : left.warnings || []), ...(right.warning ? [right.warning] : right.warnings || [])] };
  }
}
async function runIndex({ full = false } = {}) {
  ensureDir(INDEX_DIR);
  const profile = getProfile();
  const prevManifest = loadJsonSafe(MANIFEST_FILE, { files: {} });
  const prevIndex = loadJsonSafe(INDEX_FILE, { chunks: [], model: OLLAMA_EMBED_MODEL, workspace: WORKSPACE, profile: profile.name });
  const files = collectFiles(profile);
  const nextManifest = { files: {}, updatedAt: new Date().toISOString(), profile: profile.name, model: OLLAMA_EMBED_MODEL, maxChars: profile.maxChars, maxLines: profile.maxLines };
  const oldByFile = new Map();
  for (const c of prevIndex.chunks || []) { if (!oldByFile.has(c.filePath)) oldByFile.set(c.filePath, []); oldByFile.get(c.filePath).push(c); }
  const nextChunks = []; let embedded = 0; let reused = 0; let skipped = 0;
  for (const absPath of files) {
    const content = fs.readFileSync(absPath, 'utf8'); const filePath = rel(absPath); console.log(`Indexing ${filePath}...`); const st = fs.statSync(absPath); const fileHash = sha(content);
    const prev = prevManifest.files[filePath]; const unchanged = !full && prev && prev.fileHash === fileHash && prevManifest.model === OLLAMA_EMBED_MODEL && prevManifest.profile === profile.name;
    if (unchanged && oldByFile.has(filePath)) { const old = oldByFile.get(filePath); for (const c of old) nextChunks.push(c); reused += old.length; nextManifest.files[filePath] = { mtimeMs: st.mtimeMs, size: st.size, fileHash, chunkCount: old.length }; continue; }
    const chunks = chunkMarkdown(content, filePath, profile); const oldChunks = oldByFile.get(filePath) || []; const oldByChunkKey = new Map(oldChunks.map((c) => [`${c.contentHash}:${c.startLine}:${c.endLine}`, c]));
    for (const c of chunks) {
      const prevChunk = oldByChunkKey.get(`${c.contentHash}:${c.startLine}:${c.endLine}`);
      if (prevChunk && Array.isArray(prevChunk.embedding) && prevChunk.embedding.length) { nextChunks.push(prevChunk); reused++; continue; }
      const result = await embedChunkWithRetry({ ...c, fileHash, mtimeMs: st.mtimeMs });
      for (const ec of result.embeddedChunks) { nextChunks.push(ec); embedded++; }
      skipped += result.skipped || 0; for (const warning of result.warnings || []) console.warn(warning); if (result.warning) console.warn(result.warning);
    }
    nextManifest.files[filePath] = { mtimeMs: st.mtimeMs, size: st.size, fileHash, chunkCount: chunks.length };
  }
  saveJson(INDEX_FILE, { workspace: WORKSPACE, model: OLLAMA_EMBED_MODEL, indexedAt: new Date().toISOString(), profile: profile.name, chunks: nextChunks });
  saveJson(MANIFEST_FILE, nextManifest);
  console.log(`Profile: ${profile.name}`); console.log(`Indexed ${Object.keys(nextManifest.files).length} files, ${nextChunks.length} chunks (${embedded} embedded, ${reused} reused, ${skipped} skipped).`);
}
async function runSearch(query, { k = 8, json = false } = {}) {
  const idx = loadJsonSafe(INDEX_FILE, null); if (!idx || !Array.isArray(idx.chunks) || !idx.chunks.length) throw new Error('No local index found. Run: local-semantic-memory index');
  const bm25 = buildBM25(idx.chunks);
  const results = await hybridSearch({ query, chunks: idx.chunks, embedFn: embed, bm25, topK: k, candidateK: Math.max(30, k * 3) });
  if (json) { console.log(JSON.stringify({ query, model: idx.model, profile: idx.profile, route: results[0]?.route || null, results: results.map(({ chunk, score, debug, weights }) => ({ score, filePath: chunk.filePath, startLine: chunk.startLine, endLine: chunk.endLine, preview: chunk.text.replace(/\s+/g, ' ').trim().slice(0, 240), text: chunk.text, debug, weights })) }, null, 2)); return; }
  console.log(`Query: ${query}`); console.log(`Model: ${idx.model}`); console.log(`Profile: ${idx.profile}`); if (results[0]?.route) console.log(`Route: ${results[0].route.shape} weights=${results[0].weights.join(',')}`); console.log('---');
  for (const { chunk, score } of results) { console.log(`[${score.toFixed(4)}] ${chunk.filePath}#L${chunk.startLine}-L${chunk.endLine}`); const preview = chunk.text.replace(/\s+/g, ' ').trim().slice(0, 240); console.log(`  ${preview}${chunk.text.length > 240 ? '…' : ''}`); console.log(''); }
}
function runStats() { const idx = loadJsonSafe(INDEX_FILE, null); const manifest = loadJsonSafe(MANIFEST_FILE, null); if (!idx || !manifest) { console.log('No index yet. Run: local-semantic-memory index'); return; } console.log(`Workspace: ${idx.workspace}`); console.log(`Model: ${idx.model}`); console.log(`Profile: ${idx.profile}`); console.log(`Indexed at: ${idx.indexedAt}`); console.log(`Files: ${Object.keys(manifest.files || {}).length}`); console.log(`Chunks: ${(idx.chunks || []).length}`); }
async function main() {
  const [cmd, ...rest] = process.argv.slice(2); if (!cmd) { usage(); process.exit(1); }
  if (cmd === 'index') return runIndex({ full: rest.includes('--full') });
  if (cmd === 'search') { const q = rest.find((x) => !x.startsWith('--')); if (!q) throw new Error('Missing query. Usage: local-semantic-memory search "query"'); const kIdx = rest.findIndex((x) => x === '--k'); const k = kIdx >= 0 ? Number(rest[kIdx + 1]) || 8 : 8; return runSearch(q, { k, json: rest.includes('--json') }); }
  if (cmd === 'stats') return runStats();
  usage(); process.exit(1);
}
main().catch((err) => { console.error(err.message || String(err)); process.exit(1); });
